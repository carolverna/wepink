# Wepink — Conceito de e-commerce de beleza

Conceito de loja de beleza em **React + TypeScript**, com um **provador de batom que roda no navegador**: a câmera aplica a cor sobre os lábios e tudo é processado localmente, sem enviar nenhuma imagem para servidores.

**Demo:** https://carolverna.github.io/wepink/

## Vídeo de apresentação

Propaganda vertical com gravação real do site, envio de uma foto gerada por IA, troca de tons de batom e montagem de kit.

- [Assistir ao vídeo](https://carolverna.github.io/wepink/media/propaganda-wepink.mp4)
- [Capa](public/media/capa-propaganda.jpg)
- [Legenda para publicação](public/media/legenda-propaganda.txt)

> O provador usa a câmera, que os navegadores só liberam em `https://`. Por isso ele funciona na demo publicada, e localmente através de `localhost`.

## Funcionalidades

- **Provador de batom** — câmera em tempo real ou envio de selfie com o MediaPipe Face Landmarker, que detecta o contorno dos lábios. Controles de tom e intensidade.
- **Sacola** — barra de brinde progressivo, sugestão de "leve também", contagem e parcelamento calculados em tempo real, estado gerenciado por Context API.
- **Montador de kit** — combina batom e gloss e libera um brinde.
- **Quiz de perfume** — três perguntas que pontuam as fragrâncias e sugerem a mais compatível.
- Tema claro/escuro automático, tipografia fluida e acessibilidade (navegação por teclado, ARIA, foco visível, `prefers-reduced-motion`).

## Stack

- React 19 + TypeScript
- Vite
- Canvas API, MediaPipe Face Landmarker, `getUserMedia`
- CSS puro (Grid, custom properties, `clamp()`)

## Estrutura

```
src/
├── components/     Header, Hero, LipstickTryOn, ProductShowcase, KitBuilder, PerfumeQuiz, CartDrawer…
├── context/        CartContext (estado da sacola e do tom escolhido)
├── data/           catálogo, produtos da vitrine e perfumes
├── types.ts        tipos compartilhados
└── styles.css      estilos globais e temas
```

## Rodar localmente

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Da demo para produção (VTEX)

Este é um conceito com dados de exemplo. Numa loja VTEX, os mesmos componentes React seriam portados para o **VTEX IO / Store Framework**:

- o provador viraria um bloco na página de produto, lendo SKUs e tons do **catálogo** (Intelligent Search) em vez de dados fixos;
- a sacola usaria a **API de Checkout**;
- as regras de brinde e parcelamento viriam do **motor de promoções**.

## Aviso

Projeto independente e sem fins comerciais, feito para estudo. Sem vínculo com a Wepink. Marca, nomes e produtos pertencem à Wepink. Preços e informações são exemplos.

---

Criado por **Ana Carolina Verna** · [LinkedIn](https://linkedin.com/in/anacarolinaverna)
