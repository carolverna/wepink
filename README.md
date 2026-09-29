# Wepink — Conceito de e-commerce de beleza

Conceito de loja de beleza construído com **HTML, CSS e JavaScript puro** — sem framework, sem build, sem dependências. O destaque é um **provador de batom que roda no navegador**, usando a câmera para aplicar a cor sobre os lábios, com tudo processado localmente (nenhuma imagem sai do aparelho).

🔗 **Demo ao vivo:** https://SEU-USUARIO.github.io/wepink/
_(troque `SEU-USUARIO` pelo seu usuário do GitHub depois de publicar)_

> ⚠️ O provador de batom precisa de câmera, que os navegadores só liberam em endereços `https://`. Por isso a demo funciona no link do GitHub Pages, mas não abrindo o arquivo direto do computador.

## O que tem no projeto

- 💄 **Provador de batom** — câmera em tempo real com a `FaceDetector API`. Sem suporte no navegador, há dois fallbacks: tocar nos cantos da boca ou arrastar o batom. Controles de tom, tamanho e intensidade.
- 🛒 **Sacola lateral** — barra de brinde progressivo, sugestão de "leve também", contador e parcelamento calculados na hora.
- 🎁 **Montador de kit** — combina batom e gloss e libera um brinde.
- 🌸 **Quiz de perfume** — três perguntas e uma sugestão de fragrância.
- 🌗 **Tema claro/escuro automático**, tipografia fluida e acessibilidade (navegação por teclado, ARIA, foco visível, `prefers-reduced-motion`).

## Como rodar localmente

Abrir o `index.html` no navegador já mostra o site. Para testar a **câmera** localmente, use um servidor local (a câmera exige `https` ou `localhost`):

```bash
# Python 3
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## Como isso viraria produção (VTEX)

Este é um conceito visual com dados de exemplo. Numa loja real na VTEX:

- O provador entraria como app no PDP (página de produto), lendo SKUs e tons do **catálogo via Intelligent Search**, em vez de dados fixos.
- A sacola usaria a **API de Checkout**.
- Regras de brinde e parcelamento viriam do **motor de promoções**, não do JavaScript.

## Tecnologias

HTML5 · CSS3 (Grid, custom properties, `clamp()`) · JavaScript (Canvas API, FaceDetector API, getUserMedia)

## Aviso

Projeto independente e sem fins comerciais, criado para estudo. Sem vínculo com a Wepink. Marca, nomes e produtos pertencem à Wepink. Preços e informações são exemplos.

---

Criado por **Ana Carolina Verna** · [LinkedIn](https://linkedin.com/in/anacarolinaverna)
