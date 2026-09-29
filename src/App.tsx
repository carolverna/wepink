import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import KitBuilder from "./components/KitBuilder";
import LipstickTryOn from "./components/LipstickTryOn";
import Nav from "./components/Nav";
import PerfumeQuiz from "./components/PerfumeQuiz";
import ProductShowcase from "./components/ProductShowcase";
import Promo from "./components/Promo";

export default function App() {
  return (
    <>
      <Promo />
      <Header />
      <Nav />

      <main>
        <Hero />
        <LipstickTryOn />
        <ProductShowcase />

        <section>
          <h2>Monte seu kit e descubra seu perfume</h2>
          <div className="lab">
            <KitBuilder />
            <PerfumeQuiz />
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </>
  );
}
