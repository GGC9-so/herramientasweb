/* =========================================================
   calc.js — Lógica de la calculadora de porcentajes
   Inputs vacíos al cargar. Historial con debounce.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Referencias ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const historyList = document.getElementById("history-list");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let currentMode = "modo1";
  let currentResult = "";

  /* ---------- Utilidades ---------- */
  const fmt = (n) => {
    if (!isFinite(n)) return "";
    const rounded = Math.round(n * 1e6) / 1e6;
    return rounded.toLocaleString("es-ES", { maximumFractionDigits: 6 });
  };

  const num = (id) => {
    const raw = document.getElementById(id).value;
    if (raw === "" || raw === null) return null;
    const v = parseFloat(raw);
    return isNaN(v) ? null : v;
  };

  /* ---------- Historial (persistente) ---------- */
  const STORAGE_KEY = "pf-history";

  let history = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) history = JSON.parse(saved);
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }

  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* localStorage lleno o bloqueado: se ignora */
    }
  }

  function addToHistory(text) {
    if (history[0] === text) return;
    history.unshift(text);
    if (history.length > 8) history.pop();
    saveHistory();
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = "";
    if (history.length === 0) {
      const li = document.createElement("li");
      li.className = "history-empty";
      li.textContent = "Aún no hay cálculos.";
      historyList.appendChild(li);
      return;
    }
    history.forEach((h) => {
      const li = document.createElement("li");
      li.innerHTML = h;
      historyList.appendChild(li);
    });
  }

  /* ---------- Modo 1: ¿Cuánto es X% de Y? ---------- */
  function calcModo1(skipHistory) {
    const x = num("m1-x");
    const y = num("m1-y");
    const resultEl = document.getElementById("m1-result");
    const stepsEl = document.getElementById("m1-steps");

    if (x === null || y === null) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }

    const res = (x / 100) * y;
    resultEl.textContent = fmt(res);
    currentResult = fmt(res);

    stepsEl.innerHTML =
      "<p>Fórmula: <code>(X / 100) × Y</code></p>" +
      "<p>Sustituyendo: <code>(" + fmt(x) + " / 100) × " + fmt(y) + "</code></p>" +
      "<p><strong>" + fmt(x) + "%</strong> de <strong>" + fmt(y) + "</strong> = <strong>" + fmt(res) + "</strong></p>";

    if (!skipHistory) {
      addToHistory(fmt(x) + "% de " + fmt(y) + " = <strong>" + fmt(res) + "</strong>");
    }
  }

  /* ---------- Modo 2: ¿Qué % es X de Y? ---------- */
  function calcModo2(skipHistory) {
    const x = num("m2-x");
    const y = num("m2-y");
    const resultEl = document.getElementById("m2-result");
    const stepsEl = document.getElementById("m2-steps");

    if (x === null || y === null) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }
    if (y === 0) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "<p>No se puede dividir entre cero.</p>";
      currentResult = "";
      return;
    }

    const res = (x / y) * 100;
    resultEl.textContent = fmt(res) + "%";
    currentResult = fmt(res) + "%";

    stepsEl.innerHTML =
      "<p>Fórmula: <code>(X / Y) × 100</code></p>" +
      "<p>Sustituyendo: <code>(" + fmt(x) + " / " + fmt(y) + ") × 100</code></p>" +
      "<p><strong>" + fmt(x) + "</strong> es el <strong>" + fmt(res) + "%</strong> de <strong>" + fmt(y) + "</strong></p>";

    if (!skipHistory) {
      addToHistory(fmt(x) + " es el <strong>" + fmt(res) + "%</strong> de " + fmt(y));
    }
  }

  /* ---------- Modo 3: Si X es el Y%, ¿cuál es el total? ---------- */
  function calcModo3(skipHistory) {
    const x = num("m3-x");
    const y = num("m3-y");
    const resultEl = document.getElementById("m3-result");
    const stepsEl = document.getElementById("m3-steps");

    if (x === null || y === null) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }
    if (y === 0) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "<p>El porcentaje no puede ser 0.</p>";
      currentResult = "";
      return;
    }

    const res = x / (y / 100);
    resultEl.textContent = fmt(res);
    currentResult = fmt(res);

    stepsEl.innerHTML =
      "<p>Fórmula: <code>X / (Y / 100)</code></p>" +
      "<p>Sustituyendo: <code>" + fmt(x) + " / (" + fmt(y) + " / 100)</code></p>" +
      "<p>Si <strong>" + fmt(x) + "</strong> es el <strong>" + fmt(y) + "%</strong>, el total es <strong>" + fmt(res) + "</strong></p>";

    if (!skipHistory) {
      addToHistory("Total: <strong>" + fmt(res) + "</strong> (si " + fmt(x) + " es el " + fmt(y) + "%)");
    }
  }

  /* ---------- Render según modo ---------- */
  function render(skipHistory) {
    const x1 = document.getElementById("m1-x").value;
    const y1 = document.getElementById("m1-y").value;
    const x2 = document.getElementById("m2-x").value;
    const y2 = document.getElementById("m2-y").value;
    const x3 = document.getElementById("m3-x").value;
    const y3 = document.getElementById("m3-y").value;

    if (currentMode === "modo1") {
      if (x1 === "" || y1 === "") {
        document.getElementById("m1-result").textContent = "";
        document.getElementById("m1-steps").innerHTML = "";
        currentResult = "";
        return;
      }
      calcModo1(skipHistory);
    } else if (currentMode === "modo2") {
      if (x2 === "" || y2 === "") {
        document.getElementById("m2-result").textContent = "";
        document.getElementById("m2-steps").innerHTML = "";
        currentResult = "";
        return;
      }
      calcModo2(skipHistory);
    } else {
      if (x3 === "" || y3 === "") {
        document.getElementById("m3-result").textContent = "";
        document.getElementById("m3-steps").innerHTML = "";
        currentResult = "";
        return;
      }
      calcModo3(skipHistory);
    }
  }

  /* ---------- Tabs ---------- */
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const id = tab.dataset.tab;
      panels.forEach((p) => p.classList.toggle("is-active", p.id === id));
      currentMode = id;

      const firstInput = document.querySelector("#" + id + " input");
      if (firstInput) firstInput.focus();

      render(true);
    });
  });

  /* ---------- Inputs con debounce ---------- */
  let debounceTimer = null;

  document.querySelectorAll(".tab-panel input").forEach((input) => {
    input.addEventListener("input", () => {
      render(true);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        render(false);
      }, 800);
    });
  });

  /* ---------- Botón copiar ---------- */
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!currentResult) return;
      try {
        await navigator.clipboard.writeText(currentResult);
        const original = copyBtn.textContent;
        copyBtn.textContent = "✓ Copiado";
        copyBtn.classList.add("is-copied");
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-copied");
        }, 1600);
      } catch {
        copyBtn.textContent = "No se pudo copiar";
        setTimeout(() => (copyBtn.textContent = "Copiar resultado"), 1600);
      }
    });
  }

  /* ---------- Botón limpiar historial ---------- */
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      history.length = 0;
      saveHistory();
      renderHistory();
    });
  }

  /* ---------- Tema claro/oscuro ---------- */
  const themeToggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  const savedTheme = localStorage.getItem("pf-theme");
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
      localStorage.setItem("pf-theme", next);
      updateThemeIcon();
    });
  }

  /* ---------- Init ---------- */
  render(true);
  renderHistory();
})();