import ProductArt from "./ProductArt";

export default function Hero() {
  return (
    <div className="hero">
      <div>
        <h1>Bem-vinda ao seu mundo rosa.</h1>
        <p>Prove o batom na câmera, monte seu kit e leve o que combina com você.</p>
        <a className="btn" href="#prove">
          Provar agora
        </a>
      </div>
      <div className="spot">
        <div className="art">
          <ProductArt shape="tube" color="#8a4b3a" />
        </div>
        <h3>Welips Batom Líquido Matte 5ml</h3>
        <small>Não transfere · à prova d'água · 10 cores</small>
        <div className="foot">
          <div>
            <span className="old">R$ 87,90</span>
            <br />
            <span className="now">R$ 28,90</span>
            <s>ou 6x R$ 4,81</s>
          </div>
          <a href="#prove">Provar</a>
        </div>
      </div>
    </div>
  );
}
