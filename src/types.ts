export type ProductId = "welips" | "glossCookies" | "glossCherry";

export interface CatalogItem {
  name: string;
  short: string;
  price: number;
  color?: string;
}

export interface Shade {
  name: string;
  color: string;
}

export type ArtShape = "tube" | "bottle" | "drop";

export interface ShowcaseProduct {
  title: string;
  description: string;
  price?: string;
  installment?: string;
  tag?: string;
  addId?: ProductId;
  art: {
    shape: ArtShape;
    color?: string;
    scale?: number;
    width?: number;
    height?: number;
    onDark?: boolean;
  };
  size?: "big" | "wide";
}

export interface Perfume {
  name: string;
  family: string;
  notes: string;
  weights: {
    climate: number[];
    occasion: number[];
    intensity: number[];
  };
}

export interface CartLine {
  key: string;
  id: ProductId;
  variant: string;
  color: string;
  qty: number;
}
