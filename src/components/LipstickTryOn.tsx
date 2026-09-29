import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { lipShades } from "../data/catalog";
import { INNER_LIP, loadLipLandmarker, OUTER_LIP } from "../lib/lipLandmarker";

const CANVAS_W = 480;
const CANVAS_H = 640;
const BACKGROUND = "#e9c3ad";

interface NormalizedPoint {
  x: number;
  y: number;
}

export default function LipstickTryOn() {
  const { tone, setTone, addItem } = useCart();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toneRef = useRef(tone);
  const opacityRef = useRef(0.55);
  const videoLandmarkerRef = useRef<Awaited<ReturnType<typeof loadLipLandmarker>> | null>(null);
  const imageLandmarkerRef = useRef<Awaited<ReturnType<typeof loadLipLandmarker>> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);
  const sourceRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const lastLipsRef = useRef<NormalizedPoint[][] | null>(null);

  const [hint, setHint] = useState("Abra a câmera ou envie uma selfie para provar o batom nos seus lábios.");
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [opacity, setOpacity] = useState(55);

  useEffect(() => {
    toneRef.current = tone;
    if (!frameRef.current) renderStill();
  }, [tone]);

  function drawFrame(ctx: CanvasRenderingContext2D, mirror: boolean) {
    const source = sourceRef.current;
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (!source) return { scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 };

    const width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
    const height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
    if (!width) return { scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0 };

    const scale = Math.max(CANVAS_W / width, CANVAS_H / height);
    const drawW = width * scale;
    const drawH = height * scale;
    const offsetX = (CANVAS_W - drawW) / 2;
    const offsetY = (CANVAS_H - drawH) / 2;

    ctx.save();
    if (mirror) {
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(source, CANVAS_W - drawW - offsetX, offsetY, drawW, drawH);
    } else {
      ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
    }
    ctx.restore();

    return { scale, offsetX, offsetY, width, height };
  }

  function toCanvas(point: NormalizedPoint, box: ReturnType<typeof drawFrame>, mirror: boolean) {
    const x = point.x * box.width * box.scale + box.offsetX;
    const y = point.y * box.height * box.scale + box.offsetY;
    return { x: mirror ? CANVAS_W - x : x, y };
  }

  function tracePath(ctx: CanvasRenderingContext2D, points: NormalizedPoint[], box: ReturnType<typeof drawFrame>, mirror: boolean) {
    points.forEach((point, index) => {
      const { x, y } = toCanvas(point, box, mirror);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  }

  function paintLips(ctx: CanvasRenderingContext2D, lips: NormalizedPoint[][], box: ReturnType<typeof drawFrame>, mirror: boolean) {
    const [outer, inner] = lips;

    ctx.save();
    ctx.filter = "blur(1.5px)";
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = opacityRef.current;
    ctx.fillStyle = toneRef.current.color;

    // Preenche o anel entre o contorno externo e o interno (a carne do lábio).
    ctx.beginPath();
    tracePath(ctx, outer, box, mirror);
    tracePath(ctx, inner, box, mirror);
    ctx.fill("evenodd");
    ctx.restore();

    // Brilho sutil no lábio inferior.
    ctx.save();
    ctx.filter = "blur(3px)";
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = opacityRef.current * 0.3;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    tracePath(ctx, inner, box, mirror);
    ctx.fill();
    ctx.restore();
  }

  function extractLips(result: { faceLandmarks: NormalizedPoint[][] }): NormalizedPoint[][] | null {
    const face = result.faceLandmarks?.[0];
    if (!face) return null;
    return [OUTER_LIP.map((index) => face[index]), INNER_LIP.map((index) => face[index])];
  }

  function renderStill() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const box = drawFrame(ctx, false);
    if (lastLipsRef.current) paintLips(ctx, lastLipsRef.current, box, false);
  }

  function loop() {
    const ctx = canvasRef.current?.getContext("2d");
    const video = videoRef.current;
    const landmarker = videoLandmarkerRef.current;
    if (!ctx || !video || !landmarker) return;

    const box = drawFrame(ctx, true);
    if (video.readyState >= 2) {
      const result = landmarker.detectForVideo(video, performance.now());
      const lips = extractLips(result);
      if (lips) {
        lastLipsRef.current = lips;
        paintLips(ctx, lips, box, true);
      }
    }
    frameRef.current = requestAnimationFrame(loop);
  }

  async function ensureVideoLandmarker() {
    if (videoLandmarkerRef.current) return videoLandmarkerRef.current;
    setLoading(true);
    setHint("Carregando o provador…");
    try {
      videoLandmarkerRef.current = await loadLipLandmarker("VIDEO");
      return videoLandmarkerRef.current;
    } finally {
      setLoading(false);
    }
  }

  async function ensureImageLandmarker() {
    if (imageLandmarkerRef.current) return imageLandmarkerRef.current;
    setLoading(true);
    setHint("Carregando o provador…");
    try {
      imageLandmarkerRef.current = await loadLipLandmarker("IMAGE");
      return imageLandmarkerRef.current;
    } finally {
      setLoading(false);
    }
  }

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHint("Câmera indisponível neste navegador. Envie uma selfie.");
      return;
    }

    try {
      await ensureVideoLandmarker();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      sourceRef.current = video;
      setCameraOn(true);
      setHint("O batom acompanha seus lábios em tempo real. Troque a cor à vontade.");
      cancelAnimationFrame(frameRef.current);
      loop();
    } catch {
      setHint("Não consegui abrir a câmera. Permita o acesso ou envie uma selfie.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    sourceRef.current = null;
    lastLipsRef.current = null;
    setCameraOn(false);
    renderStill();
    setHint("Câmera fechada.");
  }

  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(file);
    });
  }

  async function loadSelfie(file: File) {
    closeCamera();
    const landmarker = await ensureImageLandmarker();
    const image = await loadImage(file);

    sourceRef.current = image;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const box = drawFrame(ctx, false);
    const result = landmarker.detect(image);
    const lips = extractLips(result);

    if (lips) {
      lastLipsRef.current = lips;
      paintLips(ctx, lips, box, false);
      setHint("Batom aplicado nos seus lábios. Troque a cor para comparar.");
    } else {
      lastLipsRef.current = null;
      setHint("Não encontrei os lábios nessa foto. Tente uma selfie de frente e com boa luz.");
    }
  }

  function changeOpacity(value: number) {
    setOpacity(value);
    opacityRef.current = value / 100;
    if (!frameRef.current) renderStill();
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawFrame(ctx, false);
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section id="prove">
      <h2>Prove o batom na câmera</h2>
      <div className="try">
        <div className="cv">
          <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} aria-label="Provador de batom" />
          <div className="hint">{hint}</div>
          <video ref={videoRef} playsInline muted hidden />
        </div>

        <div className="tools">
          <h3>Welips Batom Líquido Matte 5ml</h3>
          <small style={{ color: "var(--muted)" }}>{tone.name}</small>

          <div className="sw" role="group" aria-label="Tons de batom">
            {lipShades.map((shade) => (
              <button
                key={shade.name}
                style={{ "--c": shade.color }}
                aria-pressed={tone.name === shade.name}
                aria-label={shade.name}
                onClick={() => setTone(shade)}
              />
            ))}
          </div>

          <div className="opt">
            {cameraOn ? (
              <button className="ghost" onClick={closeCamera}>
                Fechar câmera
              </button>
            ) : (
              <button className="ghost" onClick={openCamera} disabled={loading}>
                {loading ? "Carregando…" : "Abrir câmera"}
              </button>
            )}
            <label className="ghost" style={{ margin: 0, cursor: "pointer" }}>
              Enviar selfie
              <input
                type="file"
                accept="image/*"
                capture="user"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) loadSelfie(file);
                }}
              />
            </label>
          </div>

          <label htmlFor="op">Intensidade</label>
          <input
            id="op"
            type="range"
            min="20"
            max="90"
            value={opacity}
            onChange={(event) => changeOpacity(Number(event.target.value))}
          />

          <div className="foot" style={{ marginTop: "1.4rem" }}>
            <div>
              <span className="now">R$ 28,90</span>
              <s>ou 6x R$ 4,81</s>
            </div>
            <button className="go" onClick={() => addItem("welips", tone.name, tone.color)}>
              Adicionar à sacola
            </button>
          </div>

          <small style={{ display: "block", marginTop: ".8rem", color: "var(--muted)" }}>
            A imagem é processada no seu aparelho e não é enviada a ninguém.
          </small>
        </div>
      </div>
    </section>
  );
}
