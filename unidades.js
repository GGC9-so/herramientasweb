/* =========================================================
   unidades.js — Conversor de unidades
   Categorías: longitud · peso · temperatura · volumen
   Conversión en vivo, intercambio, copiar, limpiar.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Referencias ---------- */
  const tabs = document.querySelectorAll(".tab");
  const fromInput = document.getElementById("conv-from");
  const toInput = document.getElementById("conv-to");
  const fromSelect = document.getElementById("unit-from");
  const toSelect = document.getElementById("unit-to");
  const swapBtn = document.getElementById("swap-btn");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");
  const stepsEl = document.getElementById("conv-steps");
  const refTable = document.querySelector("#ref-table tbody");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let currentCat = "longitud";
  let currentResult = "";

  /* ---------- Definición de categorías ---------- */
  /* factor = cuántas unidades base hay en 1 de esta unidad.
     Para longitud la base es el metro, para peso el gramo,
     para volumen el litro. Temperatura se trata aparte. */
  const CATEGORIES = {
    longitud: {
      base: "metro",
      units: [
        { id: "mm", name: "Milímetros (mm)", short: "milímetros", factor: 0.001 },
        { id: "cm", name: "Centímetros (cm)", short: "centímetros", factor: 0.01 },
        { id: "m",  name: "Metros (m)",      short: "metros",      factor: 1 },
        { id: "km", name: "Kilómetros (km)", short: "kilómetros",  factor: 1000 },
        { id: "in", name: "Pulgadas (in)",   short: "pulgadas",    factor: 0.0254 },
        { id: "ft", name: "Pies (ft)",       short: "pies",        factor: 0.3048 },
        { id: "yd", name: "Yardas (yd)",     short: "yardas",      factor: 0.9144 },
        { id: "mi", name: "Millas (mi)",     short: "millas",      factor: 1609.344 }
      ],
      defaults: ["m", "ft"],
      refs: [
        ["1 metro", "3,28084 pies"],
        ["1 metro", "39,3701 pulgadas"],
        ["1 kilómetro", "0,621371 millas"],
        ["1 pie", "30,48 centímetros"],
        ["1 pulgada", "2,54 centímetros"],
        ["1 milla", "1,60934 kilómetros"]
      ]
    },
    peso: {
      base: "gramo",
      units: [
        { id: "mg", name: "Miligramos (mg)", short: "miligramos", factor: 0.001 },
        { id: "g",  name: "Gramos (g)",      short: "gramos",     factor: 1 },
        { id: "kg", name: "Kilogramos (kg)", short: "kilogramos", factor: 1000 },
        { id: "oz", name: "Onzas (oz)",      short: "onzas",      factor: 28.3495 },
        { id: "lb", name: "Libras (lb)",     short: "libras",     factor: 453.592 },
        { id: "st", name: "Stones (st)",     short: "stones",     factor: 6350.29 },
        { id: "t",  name: "Toneladas (t)",   short: "toneladas",  factor: 1000000 }
      ],
      defaults: ["kg", "lb"],
      refs: [
        ["1 kilogramo", "2,20462 libras"],
        ["1 libra", "453,592 gramos"],
        ["1 onza", "28,3495 gramos"],
        ["1 stone", "6,35029 kilogramos"],
        ["1 tonelada", "1.000 kilogramos"],
        ["1 kilogramo", "35,274 onzas"]
      ]
    },
    temperatura: {
      units: [
        { id: "c", name: "Celsius (°C)", short: "grados Celsius" },
        { id: "f", name: "Fahrenheit (°F)", short: "grados Fahrenheit" },
        { id: "k", name: "Kelvin (K)", short: "Kelvin" }
      ],
      defaults: ["c", "f"],
      refs: [
        ["0 °C", "32 °F"],
        ["100 °C", "212 °F"],
        ["37 °C", "98,6 °F"],
        ["-40 °C", "-40 °F"],
        ["0 K", "-273,15 °C"],
        ["0 °C", "273,15 K"]
      ]
    },
    volumen: {
      base: "litro",
      units: [
        { id: "ml",  name: "Mililitros (ml)",     short: "mililitros",     factor: 0.001 },
        { id: "l",   name: "Litros (l)",          short: "litros",         factor: 1 },
        { id: "m3",  name: "Metros cúbicos (m³)", short: "metros cúbicos", factor: 1000 },
        { id: "cup", name: "Tazas (cup)",         short: "tazas",          factor: 0.236588 },
        { id: "pt",  name: "Pintas (pt)",         short: "pintas",         factor: 0.473176 },
        { id: "qt",  name: "Cuartos (qt)",        short: "cuartos",        factor: 0.946353 },
        { id: "gal", name: "Galones (gal)",       short: "galones",        factor: 3.78541 }
      ],
      defaults: ["l", "gal"],
      refs: [
        ["1 litro", "0,264172 galones"],
        ["1 galón", "3,78541 litros"],
        ["1 taza", "236,588 mililitros"],
        ["1 pinta", "473,176 mililitros"],
        ["1 litro", "4,22675 tazas"],
        ["1 metro cúbico", "1.000 litros"]
      ]
    }
  };

  /* ---------- Utilidades ---------- */
  const fmt = (n) => {
    if (!isFinite(n)) return "";
    const rounded = Math.round(n * 1e6) / 1e6;
    return rounded.toLocaleString("es-ES", { maximumFractionDigits: 6 });
  };

  function getUnit(cat, id) {
    return CATEGORIES[cat].units.find((u) => u.id === id);
  }

  /* ---------- Conversión ---------- */
  function convert(cat, value, fromId, toId) {
    if (fromId === toId) return value;

    if (cat === "temperatura") {
      let celsius;
      if (fromId === "c") celsius = value;
      else if (fromId === "f") celsius = (value - 32) * 5 / 9;
      else celsius = value - 273.15;

      if (toId === "c") return celsius;
      if (toId === "f") return (celsius * 9 / 5) + 32;
      return celsius + 273.15;
    }

    const fromU = getUnit(cat, fromId);
    const toU = getUnit(cat, toId);
    const baseValue = value * fromU.factor;
    return baseValue / toU.factor;
  }

  /* ---------- Rellenar selects según categoría ---------- */
  function fillSelects() {
    const cat = CATEGORIES[currentCat];
    const prevFrom = fromSelect.value;
    const prevTo = toSelect.value;

    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";

    cat.units.forEach((u) => {
      const o1 = document.createElement("option");
      o1.value = u.id;
      o1.textContent = u.name;
      fromSelect.appendChild(o1);

      const o2 = document.createElement("option");
      o2.value = u.id;
      o2.textContent = u.name;
      toSelect.appendChild(o2);
    });

    const fromExists = cat.units.some((u) => u.id === prevFrom);
    const toExists = cat.units.some((u) => u.id === prevTo);

    fromSelect.value = fromExists ? prevFrom : cat.defaults[0];
    toSelect.value = toExists ? prevTo : cat.defaults[1];
  }

  /* ---------- Render conversión ---------- */
  function render() {
    const raw = fromInput.value;
    if (raw === "") {
      toInput.value = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }

    const value = parseFloat(raw);
    if (isNaN(value)) {
      toInput.value = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }

    const fromId = fromSelect.value;
    const toId = toSelect.value;
    const result = convert(currentCat, value, fromId, toId);
    const fromU = getUnit(currentCat, fromId);
    const toU = getUnit(currentCat, toId);

    toInput.value = fmt(result);
    currentResult = fmt(result);

    const fromShort = fromU.short || fromU.name.toLowerCase();
    const toShort = toU.short || toU.name.toLowerCase();

    stepsEl.innerHTML =
      "<p>" + fmt(value) + " " + fromShort + " = <strong>" + fmt(result) + " " + toShort + "</strong></p>";
  }

  /* ---------- Tabla de equivalencias ---------- */
  function renderRefTable() {
    if (!refTable) return;
    refTable.innerHTML = "";
    CATEGORIES[currentCat].refs.forEach(([a, b]) => {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      td1.textContent = a;
      const td2 = document.createElement("td");
      td2.textContent = b;
      tr.append(td1, td2);
      refTable.appendChild(tr);
    });
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

      currentCat = tab.dataset.cat;
      fillSelects();
      renderRefTable();
      render();
    });
  });

  /* ---------- Inputs y selects ---------- */
  fromInput.addEventListener("input", render);
  fromSelect.addEventListener("change", render);
  toSelect.addEventListener("change", render);

  /* ---------- Intercambiar ---------- */
  if (swapBtn) {
    swapBtn.addEventListener("click", () => {
      const a = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = a;

      if (toInput.value !== "") {
        const clean = toInput.value.replace(/\./g, "").replace(",", ".");
        fromInput.value = clean;
      }
      render();
    });
  }

  /* ---------- Copiar ---------- */
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

  /* ---------- Limpiar ---------- */
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      fromInput.value = "";
      toInput.value = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      fromInput.focus();
    });
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

  /* ---------- Init ---------- */
  fillSelects();
  renderRefTable();
  render();
})();