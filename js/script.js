/* =====================================================================
   KENAN SPENCE — Dossiê Condensado
   script.js — tema, accordion, scroll-spy, voltar ao topo, menu mobile
   ===================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "kenan-dossie-theme";

  /* ---------- Tema ---------- */
  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.setAttribute("aria-label", theme === "light" ? "Ativar tema escuro" : "Ativar tema claro");
      var sun = btn.querySelector(".icon-sun");
      var moon = btn.querySelector(".icon-moon");
      if (sun && moon) {
        sun.style.display = theme === "light" ? "none" : "block";
        moon.style.display = theme === "light" ? "block" : "none";
      }
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    var next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  /* ---------- Accordion ---------- */
  function toggleSection(header) {
    var panelId = header.getAttribute("aria-controls");
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var isOpen = header.getAttribute("aria-expanded") === "true";
    header.setAttribute("aria-expanded", String(!isOpen));
    if (isOpen) {
      panel.classList.remove("open");
    } else {
      panel.classList.add("open");
    }
  }

  /* ---------- Scroll spy ---------- */
  function setupScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".sidenav__link"));
    var sections = links
      .map(function (l) { return document.getElementById(l.getAttribute("data-target")); })
      .filter(Boolean);
    if (!sections.length) return;

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            links.forEach(function (l) {
              l.classList.toggle("active", l.getAttribute("data-target") === id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- Voltar ao topo ---------- */
  function setupBackToTop() {
    var btn = document.getElementById("toTop");
    if (!btn) return;
    function onScroll() {
      if (window.scrollY > 480) btn.classList.add("show");
      else btn.classList.remove("show");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    onScroll();
  }

  /* ---------- Abas de categorias ---------- */
  function setupTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
    var sections = Array.prototype.slice.call(document.querySelectorAll(".section"));
    if (!tabs.length || !sections.length) return;

    function activate(tab) {
      var filter = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
      });
      sections.forEach(function (s) {
        var show = filter === "all" || s.id === filter;
        s.style.display = show ? "" : "none";
        if (show && filter !== "all") {
          var header = s.querySelector(".section__header");
          var panel = header ? document.getElementById(header.getAttribute("aria-controls")) : null;
          if (header && panel) { header.setAttribute("aria-expanded", "true"); panel.classList.add("open"); }
        }
      });
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () { activate(t); });
    });
  }

  /* ---------- Menu mobile ---------- */
  function setupMobileMenu() {
    var btn = document.getElementById("menuBtn");
    var nav = document.getElementById("sidenav");
    var scrim = document.getElementById("scrim");
    if (!btn || !nav) return;

    function open() { nav.classList.add("open"); if (scrim) scrim.classList.add("show"); btn.setAttribute("aria-expanded", "true"); }
    function close() { nav.classList.remove("open"); if (scrim) scrim.classList.remove("show"); btn.setAttribute("aria-expanded", "false"); }
    function toggle() { nav.classList.contains("open") ? close() : open(); }

    btn.addEventListener("click", toggle);
    if (scrim) scrim.addEventListener("click", close);
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".sidenav__link")) close();
    });
  }

  /* ---------- Rolagem suave nos links ---------- */
  function setupSmoothNav() {
    var links = document.querySelectorAll(".sidenav__link");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    links.forEach(function (l) {
      l.addEventListener("click", function (e) {
        var id = l.getAttribute("data-target");
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var tab = document.querySelector('.tab[data-tab="' + id + '"]');
        if (tab && !tab.classList.contains("active")) tab.click();
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
      });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    applyTheme(getPreferredTheme());

    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    document.querySelectorAll(".section__header").forEach(function (h) {
      h.addEventListener("click", function () { toggleSection(h); });
    });

    setupSmoothNav();
    setupScrollSpy();
    setupBackToTop();
    setupTabs();
    setupMobileMenu();

    // Abre a seção referenciada pelo hash da URL
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) {
        var header = t.querySelector(".section__header");
        var panel = header ? document.getElementById(header.getAttribute("aria-controls")) : null;
        if (header && panel) { header.setAttribute("aria-expanded", "true"); panel.classList.add("open"); }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
