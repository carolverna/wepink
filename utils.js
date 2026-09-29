/**
 * Utilitários compartilhados.
 * Tudo fica dentro do objeto global `WP` para os outros arquivos usarem.
 */
window.WP = {
  /** Estado compartilhado: o tom de batom escolhido no provador. */
  state: {
    tone: { name: "Marrom escuro", color: "#8a4b3a" },
  },

  /** Atalhos de seleção do DOM. */
  $: (selector, root = document) => root.querySelector(selector),
  $$: (selector, root = document) => Array.from(root.querySelectorAll(selector)),

  /** Formata número como moeda brasileira: 28.9 -> "R$ 28,90". */
  formatBRL: (value) => "R$ " + value.toFixed(2).replace(".", ","),

  /** Botão marcado (aria-pressed="true") dentro de um grupo. */
  pressedButton: (group) => group.querySelector('[aria-pressed="true"]'),

  /**
   * Transforma um grupo de botões em uma escolha única.
   * Marca o botão clicado e chama `onSelect(botão)`.
   */
  selectOne(group, onSelect) {
    const buttons = group.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((other) => {
          other.setAttribute("aria-pressed", String(other === button));
        });
        onSelect(button);
      });
    });
  },
};
