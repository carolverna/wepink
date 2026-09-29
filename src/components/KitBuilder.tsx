import { useState } from "react";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../data/catalog";
import type { ProductId } from "../types";
import Meter from "./Meter";
import OptionGroup from "./OptionGroup";

interface KitChoice {
  label: string;
  price: number;
  id?: ProductId;
}

const lipstickChoices: KitChoice[] = [
  { label: "Sem batom", price: 0 },
  { label: "Welips · R$ 28,90", price: 28.9, id: "welips" },
];

const glossChoices: KitChoice[] = [
  { label: "Sem gloss", price: 0 },
  { label: "Cookies · R$ 25,90", price: 25.9, id: "glossCookies" },
  { label: "Cherry · R$ 25,90", price: 25.9, id: "glossCherry" },
];

export default function KitBuilder() {
  const { addItem, tone } = useCart();
  const [lipstick, setLipstick] = useState(1);
  const [gloss, setGloss] = useState(1);

  const selectedLipstick = lipstickChoices[lipstick];
  const selectedGloss = glossChoices[gloss];
  const chosen = (selectedLipstick.price > 0 ? 1 : 0) + (selectedGloss.price > 0 ? 1 : 0);
  const total = selectedLipstick.price + selectedGloss.price;

  const addKit = () => {
    if (selectedLipstick.id) addItem("welips", tone.name, tone.color);
    if (selectedGloss.id) addItem(selectedGloss.id);
  };

  return (
    <div className="panel">
      <h3>Kit de lábios</h3>
      <small style={{ color: "var(--muted)" }}>Batom e gloss juntos liberam um brinde.</small>

      <OptionGroup
        label="Batom do kit"
        options={lipstickChoices.map((choice) => choice.label)}
        selected={lipstick}
        onSelect={setLipstick}
      />
      <OptionGroup
        label="Gloss do kit"
        options={glossChoices.map((choice) => choice.label)}
        selected={gloss}
        onSelect={setGloss}
      />

      <Meter percent={(chosen / 2) * 100} />
      <small style={{ color: "var(--muted)" }}>
        {chosen < 2 ? "Adicione batom e gloss para ganhar o brinde." : "Brinde liberado no seu kit."}
      </small>

      <div className="total">
        <span className="disp">{formatBRL(total)}</span>
        <button className="go" onClick={addKit}>
          Adicionar kit
        </button>
      </div>
    </div>
  );
}
