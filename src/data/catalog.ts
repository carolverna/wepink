import type { CatalogItem, ProductId, Shade } from "../types";

export const catalog: Record<ProductId, CatalogItem> = {
  welips: { name: "Welips Batom Líquido Matte 5ml", short: "Welips", price: 28.9 },
  glossCookies: { name: "Gloss My Lips Cookies 4ml", short: "Gloss Cookies", price: 25.9, color: "#c98a5a" },
  glossCherry: { name: "Gloss My Lips Cherry 4ml", short: "Gloss Cherry", price: 25.9, color: "#c2185b" },
};

export const lipShades: Shade[] = [
  { name: "Marrom médio", color: "#b5563b" },
  { name: "Marrom escuro", color: "#8a4b3a" },
  { name: "Framboesa", color: "#c2185b" },
  { name: "Coral", color: "#d9534f" },
  { name: "Pink", color: "#f5178a" },
];

export const GIFT_GOAL = 50;
export const INSTALLMENTS = 6;

export const formatBRL = (value: number) => "R$ " + value.toFixed(2).replace(".", ",");
