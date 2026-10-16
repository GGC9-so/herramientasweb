/* =========================================================
   edad.js — Calculadora de edad
   Modos: edad hoy · edad en otra fecha · diferencia entre dos
   + Datos curiosos + Limpiar + Copiar + Tema claro/oscuro.
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Referencias ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const yearEl = document.getElementById("year");
  const extrasGrid = document.getElementById("extras-grid");
  const copyBtn = document.getElementById("copy-btn");
  const clearBtn = document.getElementById("clear-btn");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  let currentMode = "modo1";
  let currentResult = "";

  /* ---------- Utilidades de fecha ---------- */
  const parseDate = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const today = () => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  };

  function diffYMD(from, to) {
    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  }

  function diffDays(from, to) {
    const MS = 86400000;
    const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.round((b - a) / MS);
  }

  function nextBirthday(birth, ref) {
    const y = ref.getFullYear();
    let next = new Date(y, birth.getMonth(), birth.getDate());
    if (next < ref) {
      next = new Date(y + 1, birth.getMonth(), birth.getDate());
    }
    return next;
  }

  const fmt = (n) => n.toLocaleString("es-ES");

  /* ---------- Render principal ---------- */
  function render() {
    if (currentMode === "modo1") renderModo1();
    else if (currentMode === "modo2") renderModo2();
    else renderModo3();
  }

  /* ---------- Modo 1: edad hoy ---------- */
  function renderModo1() {
    const birth = parseDate(document.getElementById("m1-fecha").value);
    const resultEl = document.getElementById("m1-result");
    const stepsEl = document.getElementById("m1-steps");

    if (!birth) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      clearExtras();
      return;
    }

    const now = today();
    if (birth > now) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "<p>La fecha de nacimiento no puede ser futura.</p>";
      currentResult = "";
      clearExtras();
      return;
    }

    const { years, months, days } = diffYMD(birth, now);
    resultEl.textContent = years + " años";
    currentResult = years + " años, " + months + " meses y " + days + " días";

    stepsEl.innerHTML =
      "<p>Edad exacta: <strong>" + years + " años, " + months + " meses y " + days + " días</strong></p>";

    renderExtras(birth, now);
  }

  /* ---------- Modo 2: edad en otra fecha ---------- */
  function renderModo2() {
    const birth = parseDate(document.getElementById("m2-nacimiento").value);
    const target = parseDate(document.getElementById("m2-fecha").value);
    const resultEl = document.getElementById("m2-result");
    const stepsEl = document.getElementById("m2-steps");

    if (!birth || !target) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }

    if (target < birth) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "<p>La fecha a calcular debe ser posterior al nacimiento.</p>";
      currentResult = "";
      return;
    }

    const { years, months, days } = diffYMD(birth, target);
    resultEl.textContent = years + " años";
    currentResult = years + " años, " + months + " meses y " + days + " días";

    stepsEl.innerHTML =
      "<p>Edad exacta: <strong>" + years + " años, " + months + " meses y " + days + " días</strong></p>" +
      "<p>Días totales: <strong>" + fmt(diffDays(birth, target)) + "</strong></p>";
  }

  /* ---------- Modo 3: diferencia entre dos ---------- */
  function renderModo3() {
    const a = parseDate(document.getElementById("m3-a").value);
    const b = parseDate(document.getElementById("m3-b").value);
    const resultEl = document.getElementById("m3-result");
    const stepsEl = document.getElementById("m3-steps");

    if (!a || !b) {
      resultEl.textContent = "";
      stepsEl.innerHTML = "";
      currentResult = "";
      return;
    }

    const from = a < b ? a : b;
    const to = a < b ? b : a;
    const { years, months, days } = diffYMD(from, to);

    resultEl.textContent = years + " años";
    currentResult = years + " años, " + months + " meses y " + days + " días";

    stepsEl.innerHTML =
      "<p>Diferencia: <strong>" + years + " años, " + months + " meses y " + days + " días</strong></p>" +
      "<p>Días de diferencia: <strong>" + fmt(diffDays(from, to)) + "</strong></p>";
  }

  /* ---------- Datos curiosos ---------- */
  function clearExtras() {
    if (!extrasGrid) return;
    extrasGrid.innerHTML =
      '<p class="note">Introduce tu fecha de nacimiento arriba para ver tus estadísticas.</p>';
  }

  function renderExtras(birth, now) {
    if (!extrasGrid) return;

    const totalDays = diffDays(birth, now);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const heartbeats = Math.round(totalMinutes * 70);
    const sleepDays = Math.round(totalDays / 3);
    const bday = nextBirthday(birth, now);
    const daysToBday = diffDays(now, bday);
    const turns = diffYMD(birth, bday).years;

    const items = [
      { label: "Días vividos", value: fmt(totalDays) },
      { label: "Horas vividas", value: fmt(totalHours) },
      { label: "Minutos vividos", value: fmt(totalMinutes) },
      { label: "Latidos estimados", value: fmt(heartbeats), note: "≈70 lpm" },
      { label: "Días durmiendo", value: fmt(sleepDays), note: "≈8h al día" },
      { label: "Próximo cumpleaños", value: fmt(daysToBday) + " días", note: "cumples " + turns }
    ];

    extrasGrid.innerHTML = "";
    items.forEach((it) => {
      const div = document.createElement("div");
      div.className = "extra-item";

      const l = document.createElement("span");
      l.className = "extra-label";
      l.textContent = it.label;

      const v = document.createElement("span");
      v.className = "extra-value";
      v.textContent = it.value;
      if (it.note) {
        const em = document.createElement("em");
        em.textContent = it.note;
        v.appendChild(em);
      }

      div.append(l, v);
      extrasGrid.appendChild(div);
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

      const id = tab.dataset.tab;
      panels.forEach((p) => p.classList.toggle("is-active", p.id === id));
      currentMode = id;

      const firstInput = document.querySelector("#" + id + " input");
      if (firstInput) firstInput.focus();

      render();
    });
  });

  /* ---------- Inputs en vivo ---------- */
  document.querySelectorAll(".tab-panel input").forEach((input) => {
    input.addEventListener("input", render);
    input.addEventListener("change", render);
  });

  /* ---------- Botón limpiar ---------- */
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      document.querySelectorAll(".tab-panel input").forEach((i) => (i.value = ""));
      document.querySelectorAll(".result-value").forEach((r) => (r.textContent = ""));
      document.querySelectorAll(".steps").forEach((s) => (s.innerHTML = ""));
      clearExtras();
      currentResult = "";
      const firstInput = document.querySelector(".tab-panel.is-active input");
      if (firstInput) firstInput.focus();
    });
  }

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
  clearExtras();
})();