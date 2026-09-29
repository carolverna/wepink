/**
 * Sacola: gaveta lateral com itens, brinde, sugestão e total.
 * Expõe `WP.cart.add(id, variante, cor)` para os outros módulos.
 */
(function (WP) {
  const { $, formatBRL } = WP;

  /** Valor mínimo (exemplo) para liberar o brinde. */
  const GIFT_GOAL = 50;
  const INSTALLMENTS = 6;
  const DEFAULT_COLOR = "#f5178a";

  /** Produtos que podem entrar na sacola (preços do site oficial). */
  const CATALOG = {
    welips: { name: "Welips Batom Líquido Matte 5ml", short: "Welips", price: 28.9 },
    glossCookies: { name: "Gloss My Lips Cookies 4ml", short: "Gloss Cookies", price: 25.9, color: "#c98a5a" },
    glossCherry: { name: "Gloss My Lips Cherry 4ml", short: "Gloss Cherry", price: 25.9, color: "#c2185b" },
  };

  /** Itens da sacola: { key, id, variant, color, qty }. */
  const items = [];

  const el = {
    drawer: $("#dr"),
    overlay: $("#ov"),
    counter: $("#cnt"),
    cartButton: $("#cb"),
    gift: $("#gift"),
    giftText: $("#gt"),
    giftBar: $("#gb"),
    orb: $("#orb"),
    makeSummary: $("#mk"),
    list: $("#items"),
    upsell: $("#upsell"),
    total: $("#ct"),
    installments: $("#ci"),
    checkout: $("#fin"),
  };

  /* ---------- Abrir e fechar ---------- */

  function openDrawer() {
    el.drawer.classList.add("on");
    el.overlay.classList.add("on");
    el.drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    el.drawer.classList.remove("on");
    el.overlay.classList.remove("on");
    el.drawer.setAttribute("aria-hidden", "true");
  }

  /* ---------- Dados ---------- */

  /** Adiciona um item (ou soma 1 à quantidade se ele já existe). */
  function add(id, variant = "", color = null) {
    const key = `${id}|${variant}`;
    const existing = items.find((item) => item.key === key);

    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ key, id, variant, color: color || CATALOG[id].color, qty: 1 });
    }

    render();
    openDrawer();
  }

  function totals() {
    return items.reduce(
      (sum, item) => ({
        price: sum.price + CATALOG[item.id].price * item.qty,
        count: sum.count + item.qty,
      }),
      { price: 0, count: 0 },
    );
  }

  /* ---------- Desenho da tela ---------- */

  function pulseCartButton() {
    el.cartButton.classList.remove("pulse");
    void el.cartButton.offsetWidth; // reinicia a animação
    el.cartButton.classList.add("pulse");
  }

  function renderGift(total) {
    const unlocked = total >= GIFT_GOAL;
    el.gift.classList.toggle("ok", unlocked);
    el.giftText.textContent = unlocked
      ? "Brinde liberado na sua sacola"
      : `Faltam ${formatBRL(GIFT_GOAL - total)} para ganhar um brinde`;
    el.giftBar.style.width = `${Math.min((total / GIFT_GOAL) * 100, 100)}%`;
  }

  /** Bolinha e resumo "Sua make de hoje". */
  function renderMakeSummary() {
    const lipstick = items.find((item) => item.id === "welips");
    const orbColor = lipstick?.color ?? items[0]?.color ?? DEFAULT_COLOR;
    el.orb.style.setProperty("--c", orbColor);

    el.makeSummary.textContent = items.length
      ? items
          .map((item) => CATALOG[item.id].short + (item.variant ? ` ${item.variant.toLowerCase()}` : ""))
          .join(" + ")
      : "Escolha um tom para começar";
  }

  function itemTemplate(item, index) {
    const product = CATALOG[item.id];
    return `
      <div class="it">
        <div class="dot" style="--c:${item.color}"></div>
        <div>
          <b>${product.name}</b>
          <small>${item.variant ? `Tom: ${item.variant}` : ""}</small>
          <div class="qty">
            <button data-action="decrease" data-index="${index}" aria-label="Diminuir">−</button>
            <span>${item.qty}</span>
            <button data-action="increase" data-index="${index}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <b>${formatBRL(product.price * item.qty)}</b>
      </div>`;
  }

  function renderList() {
    el.list.innerHTML = items.length
      ? items.map(itemTemplate).join("")
      : '<div class="empty">Sua sacola está vazia.<br>Que tal provar um batom?</div>';
  }

  /** Sugestão "Leve também" (some quando o gloss Cherry já está na sacola). */
  function renderUpsell() {
    const hasCherry = items.some((item) => item.id === "glossCherry");
    el.upsell.innerHTML =
      items.length && !hasCherry
        ? `<div class="up">
             <div>
               <b>Leve também</b>
               <small style="color:var(--muted);display:block">Gloss My Lips Cherry · ${formatBRL(CATALOG.glossCherry.price)}</small>
             </div>
             <button class="go" data-add="glossCherry">Adicionar</button>
           </div>`
        : "";
  }

  function render() {
    const { price, count } = totals();

    el.counter.textContent = count;
    el.total.textContent = formatBRL(price);
    el.installments.textContent = count ? `ou ${INSTALLMENTS}x de ${formatBRL(price / INSTALLMENTS)} sem juros` : "";

    pulseCartButton();
    renderGift(price);
    renderMakeSummary();
    renderList();
    renderUpsell();
  }

  /* ---------- Eventos ---------- */

  // Aumentar e diminuir a quantidade
  el.list.addEventListener("click", (event) => {
    const { action, index } = event.target.dataset;
    if (!action) return;

    const item = items[Number(index)];
    item.qty += action === "increase" ? 1 : -1;
    if (item.qty < 1) items.splice(Number(index), 1);
    render();
  });

  // Qualquer botão com data-add="id" adiciona o produto
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;

    event.preventDefault();
    const id = button.dataset.add;
    if (id === "welips") {
      const { name, color } = WP.state.tone;
      add(id, name, color);
    } else {
      add(id);
    }
  });

  el.cartButton.addEventListener("click", openDrawer);
  $("#cx").addEventListener("click", closeDrawer);
  el.overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
  el.checkout.addEventListener("click", () => {
    el.checkout.textContent = "Vamos finalizar…";
  });

  render();
  WP.cart = { add };
})(window.WP);
