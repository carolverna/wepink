import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Contorno externo e interno dos lábios no Face Mesh (468 pontos).
// A área pintada é o anel entre o contorno externo e o interno.
export const OUTER_LIP = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185,
];

export const INNER_LIP = [
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191,
];

const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";

const cache: Partial<Record<"VIDEO" | "IMAGE", Promise<FaceLandmarker>>> = {};

export function loadLipLandmarker(mode: "VIDEO" | "IMAGE"): Promise<FaceLandmarker> {
  if (!cache[mode]) {
    cache[mode] = FilesetResolver.forVisionTasks(WASM_PATH).then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: "GPU" },
        runningMode: mode,
        numFaces: 1,
      }),
    );
  }
  return cache[mode]!;
}
