import type { Perfume } from "../types";

export const perfumeQuestions = [
  { label: "Qual clima combina com você?", options: ["Floral", "Frutado", "Doce", "Marcante"] },
  { label: "Quando vai usar?", options: ["Dia a dia", "Noite ou festa"] },
  { label: "Quão presente você quer o perfume?", options: ["Suave", "Intenso"] },
];

export const perfumes: Perfume[] = [
  {
    name: "Liberté",
    family: "Floral Bouquet",
    notes: "Pimenta rosa, toranja e rosa francesa.",
    weights: { climate: [3, 1, 0, 0], occasion: [3, 1], intensity: [3, 1] },
  },
  {
    name: "Liberté Exclusif",
    family: "Floral Oriental",
    notes: "Pera, lichia e flores, com âmbar e baunilha no fundo.",
    weights: { climate: [3, 2, 2, 1], occasion: [1, 3], intensity: [1, 3] },
  },
  {
    name: "Liberté Platiné",
    family: "Floral Oriental",
    notes: "Floral delicado, para a luz do dia e para a noite.",
    weights: { climate: [3, 0, 1, 2], occasion: [2, 3], intensity: [1, 3] },
  },
  {
    name: "Liberté Doré",
    family: "Frutado Floral",
    notes: "Floral intenso com toque frutado.",
    weights: { climate: [3, 3, 1, 1], occasion: [3, 1], intensity: [1, 3] },
  },
  {
    name: "Infinity",
    family: "Floral Amadeirado Ambarado",
    notes: "Amora, laranja doce, jasmim, âmbar e baunilha.",
    weights: { climate: [2, 2, 3, 1], occasion: [3, 1], intensity: [3, 1] },
  },
  {
    name: "Obsessed",
    family: "Chypre Floral Amadeirado",
    notes: "Cereja, gardênia, mel e caramelo.",
    weights: { climate: [1, 2, 3, 3], occasion: [0, 3], intensity: [0, 3] },
  },
  {
    name: "VF",
    family: "Floral Âmbar",
    notes: "Frutas amarelas, jasmim, âmbar e patchouli.",
    weights: { climate: [2, 2, 3, 2], occasion: [2, 2], intensity: [2, 2] },
  },
  {
    name: "Heaven",
    family: "Floral Frutado Amadeirado",
    notes: "Mandarina, pêssego e flor de laranjeira.",
    weights: { climate: [2, 3, 1, 0], occasion: [3, 0], intensity: [3, 0] },
  },
  {
    name: "Celebrate Life",
    family: "Frutado Oriental",
    notes: "Pimenta rosa, lírio-do-vale, rosa e jasmim.",
    weights: { climate: [2, 3, 2, 1], occasion: [2, 2], intensity: [3, 1] },
  },
];

export function rankPerfumes([climate, occasion, intensity]: number[]): Perfume[] {
  return perfumes
    .map((perfume) => ({
      perfume,
      score:
        perfume.weights.climate[climate] + perfume.weights.occasion[occasion] + perfume.weights.intensity[intensity],
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.perfume);
}
