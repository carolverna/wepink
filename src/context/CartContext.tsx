import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { catalog, GIFT_GOAL, INSTALLMENTS } from "../data/catalog";
import type { CartLine, ProductId, Shade } from "../types";

interface CartValue {
  items: CartLine[];
  tone: Shade;
  setTone: (shade: Shade) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (id: ProductId, variant?: string, color?: string | null) => void;
  changeQty: (key: string, delta: number) => void;
  total: number;
  count: number;
  installment: number;
  giftUnlocked: boolean;
  giftRemaining: number;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [tone, setTone] = useState<Shade>({ name: "Marrom escuro", color: "#8a4b3a" });
  const [isOpen, setOpen] = useState(false);

  const addItem = useCallback((id: ProductId, variant = "", color: string | null = null) => {
    const key = `${id}|${variant}`;
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { key, id, variant, color: color ?? catalog[id].color ?? "#f5178a", qty: 1 }];
    });
    setOpen(true);
  }, []);

  const changeQty = useCallback((key: string, delta: number) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, qty: item.qty + delta } : item)).filter((item) => item.qty > 0),
    );
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + catalog[item.id].price * item.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      tone,
      setTone,
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      addItem,
      changeQty,
      total,
      count,
      installment: total / INSTALLMENTS,
      giftUnlocked: total >= GIFT_GOAL,
      giftRemaining: Math.max(GIFT_GOAL - total, 0),
    }),
    [items, tone, isOpen, addItem, changeQty, total, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart precisa estar dentro de CartProvider");
  return context;
}
