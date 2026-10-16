/* =========================================================
   tools.js — Lista de herramientas de la portada
   Para añadir una nueva: copia un objeto y edítalo.
   ========================================================= */

const TOOLS = [
  {
    name: "Calculadora de porcentajes",
    desc: "Calcula el X% de un número, qué porcentaje es uno de otro y el total a partir de un porcentaje.",
    url: "porcentaje.html",
    icon: "%",
    soon: false
  },
  {
    name: "Calculadora de edad",
    desc: "Averigua tu edad exacta en años, meses y días. Y cuánto falta para tu próximo cumpleaños.",
    url: "edad.html",
    icon: "🎂",
    soon: false
  },
  {
    name: "Conversor de unidades",
    desc: "Convierte longitud, peso, temperatura y volumen al instante. Metros a pies, kilos a libras y más.",
    url: "unidades.html",
    icon: "⇄",
    soon: false
  },
  {
    name: "Contador de palabras",
    desc: "Cuenta palabras, caracteres y tiempo de lectura al instante.",
    url: null,
    icon: "Aa",
    soon: true
  }
];

(function () {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Render de tarjetas ---------- */
  const grid = document.getElementById("tools-grid");
  if (grid && typeof TOOLS !== "undefined") {
    const frag = document.createDocumentFragment();

    TOOLS.forEach((tool) => {
      const card = document.createElement("a");
      card.className = "tool-card" + (tool.soon ? " is-soon" : "");
      card.href = tool.url || "#";

      if (tool.soon) {
        card.setAttribute("aria-disabled", "true");
        card.addEventListener("click", (e) => e.preventDefault());
      }

      const icon = document.createElement("span");
      icon.className = "tool-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = tool.icon;

      const title = document.createElement("h3");
      title.textContent = tool.name;

      const desc = document.createElement("p");
      desc.textContent = tool.desc;

      const meta = document.createElement("span");
      meta.className = "tool-meta";
      meta.textContent = tool.soon ? "Próximamente" : "Abrir →";

      card.append(icon, title, desc, meta);
      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  /* ---------- Tema claro/oscuro ---------- */
  const themeToggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  const savedTheme = localStorage.getItem("hw-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initialTheme);

  function updateThemeIcon() {
    if (!themeToggle) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    );
  }
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("hw-theme", next);
      updateThemeIcon();
    });
  }
})();