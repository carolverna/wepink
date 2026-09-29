import type { ShowcaseProduct } from "../types";

export const showcaseProducts: ShowcaseProduct[] = [
  {
    title: "Welips Batom Líquido Matte 5ml",
    description: "Longa duração, fórmula super suave e cor de alto impacto",
    price: "R$ 28,90",
    installment: "ou 6x R$ 4,81",
    tag: "Mais amado",
    addId: "welips",
    art: { shape: "tube", color: "#8a4b3a", scale: 1.5, onDark: true },
    size: "big",
  },
  {
    title: "Gloss My Lips Cookies 4ml",
    description: "Cor e gostinho de cookies",
    price: "R$ 25,90",
    installment: "ou 6x R$ 4,31",
    tag: "Promo",
    addId: "glossCookies",
    art: { shape: "tube", color: "#c98a5a", height: 90 },
  },
  {
    title: "Lip Oil Pirulipop 3,5g",
    description: "Brilho e hidratação",
    art: { shape: "tube", color: "#ff5fa2", height: 90 },
  },
  {
    title: "Body Splash Obsessed 200ml",
    description: "Desodorante colônia · também em Liberté e Heaven Blue",
    tag: "Perfumaria",
    art: { shape: "bottle" },
    size: "wide",
  },
  {
    title: "Booster Repair Óleo Capilar 30ml",
    description: "Reparador de pontas",
    art: { shape: "drop" },
  },
  {
    title: "The Oil Óleo Corporal 120ml",
    description: "Hidratação para o corpo",
    art: { shape: "bottle", color: "#c98a5a", width: 80, height: 100 },
  },
];
