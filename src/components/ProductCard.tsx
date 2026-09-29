import { useCart } from "../context/CartContext";
import type { ShowcaseProduct } from "../types";
import ProductArt from "./ProductArt";

const sizeClass = { big: "p big", wide: "p wide" } as const;

export default function ProductCard({ product }: { product: ShowcaseProduct }) {
  const { addItem, tone } = useCart();
  const className = product.size ? sizeClass[product.size] : "p";

  const buy = () => {
    if (!product.addId) return;
    if (product.addId === "welips") {
      addItem("welips", tone.name, tone.color);
    } else {
      addItem(product.addId);
    }
  };

  return (
    <article className={className}>
      <div className="art">
        {product.tag && <span className="tag">{product.tag}</span>}
        <ProductArt {...product.art} />
      </div>
      <h3>{product.title}</h3>
      <small>{product.description}</small>
      <div className="foot">
        {product.price ? (
          <div>
            {product.price}
            {product.installment && <s>{product.installment}</s>}
          </div>
        ) : (
          <span />
        )}
        {product.addId ? (
          <button className="go" onClick={buy}>
            Comprar
          </button>
        ) : (
          <a href="#">Ver produto</a>
        )}
      </div>
    </article>
  );
}
