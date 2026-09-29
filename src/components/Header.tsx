import { useCart } from "../context/CartContext";

export default function Header() {
  const { count, openCart } = useCart();

  return (
    <header>
      <a className="logo" href="#">
        wepink
      </a>
      <div className="search" role="search">
        Busque batom, gloss, body splash…
      </div>
      <button className="cartbtn" onClick={openCart} aria-label={`Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`}>
        <span className="cartbtn-label">Sacola (<b>{count}</b>)</span>
        <svg className="cartbtn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3h2l2.4 12h11.2L21 7H6" />
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      </button>
    </header>
  );
}
