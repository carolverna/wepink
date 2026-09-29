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
      <button className="cartbtn" onClick={openCart} aria-label="Abrir sacola">
        Sacola (<b>{count}</b>)
      </button>
    </header>
  );
}
