const categories = ["Make", "Lábios", "Perfumaria", "Cabelos", "Corpo", "Cuidado íntimo", "Ofertas"];

export default function Nav() {
  return (
    <nav aria-label="Categorias">
      {categories.map((category) => (
        <a key={category} href="#">
          {category}
        </a>
      ))}
    </nav>
  );
}
