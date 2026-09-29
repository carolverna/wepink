import { showcaseProducts } from "../data/products";
import ProductCard from "./ProductCard";

export default function ProductShowcase() {
  return (
    <section id="queridinhos">
      <h2>Queridinhos da Wepink</h2>
      <div className="bento">
        {showcaseProducts.map((product) => (
          <ProductCard key={product.title} product={product} />
        ))}
      </div>
    </section>
  );
}
