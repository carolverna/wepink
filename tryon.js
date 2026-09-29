/**
 * Provador de batom.
 *
 * - Abre a câmera (ou usa uma selfie) e desenha o batom sobre a imagem.
 * - Posição: automática (se o navegador tiver FaceDetector), por dois toques
 *   nos cantos da boca, ou arrastando.
 * - A imagem é processada só no navegador e nunca é enviada a ninguém.
 */
(function (WP) {
  const { $, $$, pressedButton, selectOne } = WP;

  /* ---------- Constantes ---------- */

  const CANVAS_W = 480;
  const CANVAS_H = 640;
  const BASE_SCALE = 1.6; // escala do batom com o controle de tamanho em 100%
  const LIP_WIDTH = 56; // largura do desenho do batom (em unidades do Path2D)
  const LIP_CORNER_Y = 178; // altura dos cantos da boca dentro do desenho
  const DETECT_EVERY_N_FRAMES = 6;
  const BACKGROUND = "#e9c3ad";

  // Formato dos lábios (viewBox de 200x240, cantos da boca em y = 178)
  const LIP_SHAPE = new Path2D("M72 178c10-12 20-10 28-4 8-6 18-8 28 4-8 14-18 20-28 20s-20-6-28-20z");

  /* ---------- Elementos ---------- */

  const canvas = $("#cv");
  const ctx = canvas.getContext("2d");
  const video = $("#vd");
  const hintBox = $("#hint");
  const sizeSlider = $("#sz");
  const opacitySlider = $("#op");
  const openCameraButton = $("#cam");
  const closeCameraButton = $("#stop");

  /* ---------- Estado ---------- */

  /** Posição, tamanho, rotação e intensidade do batom. */
  const lipstick = { x: CANVAS_W / 2, y: CANVAS_H * 0.68, scale: BASE_SCALE, opacity: 0.85, rotation: 0 };

  let source = null; // <video> ou <img> usado como fundo
  let stream = null;
  let frameId = 0; // 0 = sem animação rodando
  let faceDetector = null;
  let autoTrack = true;
  let frameCount = 0;
  let pickedCorners = [];
  let isPickingCorners = false;
  let isDragging = false;

  /* ---------- Desenho ---------- */

  function drawBackground() {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (!source) return;
    const width = source.videoWidth || source.naturalWidth;
    const height = source.videoHeight || source.naturalHeight;
    if (!width) return;

    // Preenche o quadro (efeito "cover"); a câmera é espelhada
    const scale = Math.max(CANVAS_W / width, CANVAS_H / height);
    const drawW = width * scale;
    const drawH = height * scale;

    ctx.save();
    if (source === video) {
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(source, (CANVAS_W - drawW) / 2, (CANVAS_H - drawH) / 2, drawW, drawH);
    ctx.restore();
  }

  function drawLipstick() {
    ctx.save();
    ctx.translate(lipstick.x, lipstick.y);
    ctx.rotate(lipstick.rotation);
    ctx.scale(lipstick.scale, lipstick.scale);
    ctx.translate(-100, -LIP_CORNER_Y);

    ctx.globalCompositeOperation = "multiply"; // mistura com a cor da pele
    ctx.globalAlpha = lipstick.opacity;
    try {
      ctx.filter = "blur(1px)"; // suaviza a borda (não existe em todos os navegadores)
    } catch (error) {
      /* ignora */
    }
    ctx.fillStyle = WP.state.tone.color;
    ctx.fill(LIP_SHAPE);
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.filter = "none";
  }

  function render() {
    drawBackground();
    drawLipstick();
  }

  /** Redesenha só quando a animação da câmera não está rodando. */
  function renderIfIdle() {
    if (!frameId) render();
  }

  function loop() {
    render();
    frameCount += 1;
    if (faceDetector && autoTrack && source === video && frameCount % DETECT_EVERY_N_FRAMES === 0) {
      detectMouth();
    }
    frameId = requestAnimationFrame(loop);
  }

  function setHint(text) {
    hintBox.textContent = text;
  }

  /* ---------- Posição automática (FaceDetector) ---------- */

  function detectMouth() {
    faceDetector
      .detect(video)
      .then((faces) => {
        const mouth = (faces[0]?.landmarks || []).find((landmark) => landmark.type === "mouth");
        if (!mouth) return;

        // Converte da imagem do vídeo para o canvas (cover + espelhado)
        const scale = Math.max(CANVAS_W / video.videoWidth, CANVAS_H / video.videoHeight);
        const offsetX = (CANVAS_W - video.videoWidth * scale) / 2;
        const offsetY = (CANVAS_H - video.videoHeight * scale) / 2;

        const xs = mouth.locations.map((point) => point.x);
        const ys = mouth.locations.map((point) => point.y);
        const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
        const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
        const mouthWidth = (Math.max(...xs) - Math.min(...xs)) * scale;

        lipstick.x = CANVAS_W - (centerX * scale + offsetX);
        lipstick.y = centerY * scale + offsetY;
        lipstick.rotation = 0;
        if (mouthWidth > 20) lipstick.scale = (mouthWidth / LIP_WIDTH) * 1.05;
        sizeSlider.value = Math.round((lipstick.scale / BASE_SCALE) * 100);
      })
      .catch(() => {
        faceDetector = null; // desiste da detecção automática
      });
  }

  /* ---------- Câmera e selfie ---------- */

  function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHint("Câmera indisponível neste navegador. Envie uma selfie.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = mediaStream;
        video.play();
        source = video;
        autoTrack = true;
        closeCameraButton.hidden = false;
        openCameraButton.hidden = true;

        try {
          faceDetector = "FaceDetector" in window ? new FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;
        } catch (error) {
          faceDetector = null;
        }

        setHint(
          faceDetector
            ? "Câmera aberta. O batom acompanha seus lábios; se sair do lugar, arraste."
            : "Câmera aberta. Toque nos cantos da boca ou arraste o batom até os lábios.",
        );
        cancelAnimationFrame(frameId);
        loop();
      })
      .catch(() => {
        setHint("A câmera não abriu neste ambiente. Permita o acesso ou envie uma selfie e toque nos cantos da boca.");
      });
  }

  function closeCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    cancelAnimationFrame(frameId);
    frameId = 0;
    source = null;
    closeCameraButton.hidden = true;
    openCameraButton.hidden = false;
    render();
    setHint("Câmera fechada.");
  }

  function loadSelfie(file) {
    closeCamera();
    const image = new Image();
    image.onload = () => {
      source = image;
      autoTrack = false;
      render();
      startPickingCorners();
    };
    image.src = URL.createObjectURL(file);
  }

  /* ---------- Ajuste pelos cantos da boca ---------- */

  function startPickingCorners() {
    pickedCorners = [];
    isPickingCorners = true;
    autoTrack = false;
    setHint("Toque no canto ESQUERDO da sua boca.");
  }

  /** Posição do ponteiro convertida para as coordenadas do canvas. */
  function pointerToCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  /** Encaixa o batom entre os dois cantos (posição, largura e inclinação). */
  function fitLipstickToCorners([left, right]) {
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 10) {
      setHint("Toque mais afastado, nos dois cantos da boca.");
      pickedCorners = [];
      return;
    }

    lipstick.x = (left.x + right.x) / 2;
    lipstick.y = (left.y + right.y) / 2;
    lipstick.rotation = Math.atan2(dy, dx);
    lipstick.scale = distance / LIP_WIDTH;
    sizeSlider.value = Math.round((lipstick.scale / BASE_SCALE) * 100);

    isPickingCorners = false;
    setHint("Pronto! O batom se ajustou à sua boca. Arraste para refinar.");
    renderIfIdle();
  }

  /* ---------- Arrastar ---------- */

  function moveLipstickTo(event) {
    const { x, y } = pointerToCanvas(event);
    lipstick.x = x;
    lipstick.y = y;
    autoTrack = false;
    renderIfIdle();
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (isPickingCorners) {
      pickedCorners.push(pointerToCanvas(event));
      if (pickedCorners.length === 1) {
        setHint("Agora toque no canto DIREITO da boca.");
      } else {
        fitLipstickToCorners(pickedCorners);
      }
      return;
    }

    isDragging = true;
    canvas.setPointerCapture(event.pointerId);
    moveLipstickTo(event);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (isDragging) moveLipstickTo(event);
  });
  canvas.addEventListener("pointerup", () => {
    isDragging = false;
  });

  /* ---------- Controles ---------- */

  openCameraButton.addEventListener("click", openCamera);
  closeCameraButton.addEventListener("click", closeCamera);
  $("#fit").addEventListener("click", startPickingCorners);
  $("#file").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) loadSelfie(file);
  });

  sizeSlider.addEventListener("input", (event) => {
    lipstick.scale = (event.target.value / 100) * BASE_SCALE;
    autoTrack = false;
    renderIfIdle();
  });
  opacitySlider.addEventListener("input", (event) => {
    lipstick.opacity = event.target.value / 100;
    renderIfIdle();
  });

  // Escolha do tom
  selectOne($("#lips"), (button) => {
    WP.state.tone = { name: button.dataset.n, color: button.style.getPropertyValue("--c") };
    $("#tn").textContent = WP.state.tone.name;
    renderIfIdle();
  });

  // Adicionar o batom (no tom escolhido) à sacola
  $("#addw").addEventListener("click", () => {
    const { name, color } = WP.state.tone;
    WP.cart.add("welips", name, color);
  });

  render();
})(window.WP);
