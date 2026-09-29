import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { catalog, formatBRL, GIFT_GOAL } from "../data/catalog";
import type { CartLine } from "../types";
import Meter from "./Meter";

function makeSummary(items: CartLine[]) {
  if (!items.length) return "Escolha um tom para começar";
  return items
    .map((item) => catalog[item.id].short + (item.variant ? ` ${item.variant.toLowerCase()}` : ""))
    .join(" + ");
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, addItem, changeQty, total, count, installment, giftUnlocked, giftRemaining } =
    useCart();
  const [checkoutLabel, setCheckoutLabel] = useState("Finalizar compra");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeCart]);

  const lipstick = items.find((item) => item.id === "welips");
  const orbColor = lipstick?.color ?? items[0]?.color ?? "#f5178a";
  const showCherryUpsell = items.length > 0 && !items.some((item) => item.id === "glossCherry");

  return (
    <>
      <div className={`ov${isOpen ? " on" : ""}`} onClick={closeCart} />
      <aside className={`dr${isOpen ? " on" : ""}`} role="dialog" aria-label="Sacola" aria-hidden={!isOpen}>
        <div className="dh">
          <h3>Sua sacola</h3>
          <button className="x" onClick={closeCart} aria-label="Fechar sacola">
            ×
          </button>
        </div>

        <div className={`gift${giftUnlocked ? " ok" : ""}`}>
          <b>
            {giftUnlocked ? "Brinde liberado na sua sacola" : `Faltam ${formatBRL(giftRemaining)} para ganhar um brinde`}
          </b>
          <Meter percent={(total / GIFT_GOAL) * 100} />
        </div>

        <div className="body">
          <div className="make">
            <div className="orb" style={{ "--c": orbColor }} />
            <div>
              <b className="disp" style={{ fontSize: "1.15rem" }}>
                Sua make de hoje
              </b>
              <small style={{ color: "var(--muted)", display: "block" }}>{makeSummary(items)}</small>
            </div>
          </div>

          {items.length ? (
            items.map((item) => (
              <div className="it" key={item.key}>
                <div className="dot" style={{ "--c": item.color }} />
                <div>
                  <b>{catalog[item.id].name}</b>
                  <small>{item.variant ? `Tom: ${item.variant}` : ""}</small>
                  <div className="qty">
                    <button onClick={() => changeQty(item.key, -1)} aria-label="Diminuir">
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => changeQty(item.key, 1)} aria-label="Aumentar">
                      +
                    </button>
                  </div>
                </div>
                <b>{formatBRL(catalog[item.id].price * item.qty)}</b>
              </div>
            ))
          ) : (
            <div className="empty">
              Sua sacola está vazia.
              <br />
              Que tal provar um batom?
            </div>
          )}

          {showCherryUpsell && (
            <div className="up">
              <div>
                <b>Leve também</b>
                <small style={{ color: "var(--muted)", display: "block" }}>
                  Gloss My Lips Cherry · {formatBRL(catalog.glossCherry.price)}
                </small>
              </div>
              <button className="go" onClick={() => addItem("glossCherry")}>
                Adicionar
              </button>
            </div>
          )}
        </div>

        <div className="df">
          <div className="tt">
            <span>Total</span>
            <span className="disp">{formatBRL(total)}</span>
          </div>
          <small style={{ color: "var(--muted)" }}>{count ? `ou 6x de ${formatBRL(installment)} sem juros` : ""}</small>
          <button className="go" onClick={() => setCheckoutLabel("Vamos finalizar…")}>
            {checkoutLabel}
          </button>
        </div>
      </aside>
    </>
  );
}
