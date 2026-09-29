import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useCart } from "../context/CartContext";
import { lipShades } from "../data/catalog";
import type { Shade } from "../types";

const CANVAS_W = 480;
const CANVAS_H = 640;
const BASE_SCALE = 1.6;
const LIP_WIDTH = 56;
const LIP_CORNER_Y = 178;
const DETECT_EVERY_N_FRAMES = 6;
const BACKGROUND = "#e9c3ad";
const LIP_SHAPE = new Path2D("M72 178c10-12 20-10 28-4 8-6 18-8 28 4-8 14-18 20-28 20s-20-6-28-20z");

interface LipstickState {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotation: number;
}

interface Point {
  x: number;
  y: number;
}

export default function LipstickTryOn() {
  const { tone, setTone, addItem } = useCart();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toneRef = useRef<Shade>(tone);
  const sourceRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef(0);
  const detectorRef = useRef<any>(null);
  const autoTrackRef = useRef(true);
  const frameCountRef = useRef(0);
  const cornersRef = useRef<Point[]>([]);
  const pickingRef = useRef(false);
  const draggingRef = useRef(false);
  const lipstick = useRef<LipstickState>({ x: CANVAS_W / 2, y: CANVAS_H * 0.68, scale: BASE_SCALE, opacity: 0.85, rotation: 0 });

  const [hint, setHint] = useState("Abra a câmera ou envie uma selfie. Arraste para posicionar o batom nos lábios.");
  const [cameraOn, setCameraOn] = useState(false);
  const [size, setSize] = useState(100);
  const [opacity, setOpacity] = useState(85);

  useEffect(() => {
    toneRef.current = tone;
    renderIfIdle();
  }, [tone]);

  function drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const source = sourceRef.current;
    if (!source) return;
    const width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
    const height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
    if (!width) return;

    const scale = Math.max(CANVAS_W / width, CANVAS_H / height);
    const drawW = width * scale;
    const drawH = height * scale;

    ctx.save();
    if (source === videoRef.current) {
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, (CANVAS_W - drawW) / 2, (CANVAS_H - drawH) / 2, drawW, drawH);
    ctx.restore();
  }

  function drawLipstick(ctx: CanvasRenderingContext2D) {
    const state = lipstick.current;
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate(state.rotation);
    ctx.scale(state.scale, state.scale);
    ctx.translate(-100, -LIP_CORNER_Y);

    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = state.opacity;
    try {
      ctx.filter = "blur(1px)";
    } catch {
      // filter no canvas não existe em todos os navegadores
    }
    ctx.fillStyle = toneRef.current.color;
    ctx.fill(LIP_SHAPE);
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
  }

  function render() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx);
    drawLipstick(ctx);
  }

  function renderIfIdle() {
    if (!frameRef.current) render();
  }

  function loop() {
    render();
    frameCountRef.current += 1;
    const onVideo = sourceRef.current === videoRef.current;
    if (detectorRef.current && autoTrackRef.current && onVideo && frameCountRef.current % DETECT_EVERY_N_FRAMES === 0) {
      detectMouth();
    }
    frameRef.current = requestAnimationFrame(loop);
  }

  function detectMouth() {
    const video = videoRef.current;
    if (!video) return;
    detectorRef.current
      .detect(video)
      .then((faces: any[]) => {
        const mouth = (faces[0]?.landmarks || []).find((landmark: any) => landmark.type === "mouth");
        if (!mouth) return;

        const scale = Math.max(CANVAS_W / video.videoWidth, CANVAS_H / video.videoHeight);
        const offsetX = (CANVAS_W - video.videoWidth * scale) / 2;
        const offsetY = (CANVAS_H - video.videoHeight * scale) / 2;

        const xs = mouth.locations.map((point: Point) => point.x);
        const ys = mouth.locations.map((point: Point) => point.y);
        const centerX = xs.reduce((a: number, b: number) => a + b, 0) / xs.length;
        const centerY = ys.reduce((a: number, b: number) => a + b, 0) / ys.length;
        const mouthWidth = (Math.max(...xs) - Math.min(...xs)) * scale;

        const state = lipstick.current;
        state.x = CANVAS_W - (centerX * scale + offsetX);
        state.y = centerY * scale + offsetY;
        state.rotation = 0;
        if (mouthWidth > 20) state.scale = (mouthWidth / LIP_WIDTH) * 1.05;
        setSize(Math.round((state.scale / BASE_SCALE) * 100));
      })
      .catch(() => {
        detectorRef.current = null;
      });
  }

  function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHint("Câmera indisponível neste navegador. Envie uma selfie.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.play();
        sourceRef.current = video;
        autoTrackRef.current = true;
        setCameraOn(true);

        try {
          const FaceDetector = (window as any).FaceDetector;
          detectorRef.current = FaceDetector ? new FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
        } catch {
          detectorRef.current = null;
        }

        setHint(
          detectorRef.current
            ? "Câmera aberta. O batom acompanha seus lábios; se sair do lugar, arraste."
            : "Câmera aberta. Toque nos cantos da boca ou arraste o batom até os lábios.",
        );
        cancelAnimationFrame(frameRef.current);
        loop();
      })
      .catch(() => {
        setHint("A câmera não abriu neste ambiente. Permita o acesso ou envie uma selfie e toque nos cantos da boca.");
      });
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
    sourceRef.current = null;
    setCameraOn(false);
    render();
    setHint("Câmera fechada.");
  }

  function loadSelfie(file: File) {
    closeCamera();
    const image = new Image();
    image.onload = () => {
      sourceRef.current = image;
      autoTrackRef.current = false;
      render();
      startPickingCorners();
    };
    image.src = URL.createObjectURL(file);
  }

  function startPickingCorners() {
    cornersRef.current = [];
    pickingRef.current = true;
    autoTrackRef.current = false;
    setHint("Toque no canto ESQUERDO da sua boca.");
  }

  function pointerToCanvas(event: PointerEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function fitToCorners([left, right]: Point[]) {
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 10) {
      setHint("Toque mais afastado, nos dois cantos da boca.");
      cornersRef.current = [];
      return;
    }

    const state = lipstick.current;
    state.x = (left.x + right.x) / 2;
    state.y = (left.y + right.y) / 2;
    state.rotation = Math.atan2(dy, dx);
    state.scale = distance / LIP_WIDTH;
    setSize(Math.round((state.scale / BASE_SCALE) * 100));

    pickingRef.current = false;
    setHint("Pronto! O batom se ajustou à sua boca. Arraste para refinar.");
    renderIfIdle();
  }

  function moveLipstickTo(event: PointerEvent<HTMLCanvasElement>) {
    const { x, y } = pointerToCanvas(event);
    lipstick.current.x = x;
    lipstick.current.y = y;
    autoTrackRef.current = false;
    renderIfIdle();
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (pickingRef.current) {
      cornersRef.current.push(pointerToCanvas(event));
      if (cornersRef.current.length === 1) {
        setHint("Agora toque no canto DIREITO da boca.");
      } else {
        fitToCorners(cornersRef.current);
      }
      return;
    }
    draggingRef.current = true;
    canvasRef.current!.setPointerCapture(event.pointerId);
    moveLipstickTo(event);
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (draggingRef.current) moveLipstickTo(event);
  }

  function onPointerUp() {
    draggingRef.current = false;
  }

  function changeSize(value: number) {
    setSize(value);
    lipstick.current.scale = (value / 100) * BASE_SCALE;
    autoTrackRef.current = false;
    renderIfIdle();
  }

  function changeOpacity(value: number) {
    setOpacity(value);
    lipstick.current.opacity = value / 100;
    renderIfIdle();
  }

  useEffect(() => {
    render();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="prove">
      <h2>Prove o batom na câmera</h2>
      <div className="try">
        <div className="cv">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            aria-label="Provador de batom"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
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
              <button className="ghost" onClick={openCamera}>
                Abrir câmera
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
            <button className="ghost" onClick={startPickingCorners}>
              Ajustar à minha boca
            </button>
          </div>

          <label htmlFor="sz">Tamanho do batom</label>
          <input
            id="sz"
            type="range"
            min="50"
            max="200"
            value={size}
            onChange={(event) => changeSize(Number(event.target.value))}
          />

          <label htmlFor="op">Intensidade</label>
          <input
            id="op"
            type="range"
            min="30"
            max="100"
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
            A imagem fica no seu aparelho e não é enviada a ninguém.
          </small>
        </div>
      </div>
    </section>
  );
}
