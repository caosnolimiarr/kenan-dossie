(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'kenan-dossie-tema';

  /* ---------- Tema ---------- */
  function lerTema() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function salvarTema(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* sem storage */ }
  }
  var salvo = lerTema();
  root.setAttribute('data-theme', salvo === 'light' || salvo === 'dark' ? salvo : 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    var themeBtn = document.getElementById('themeBtn');
    var menuBtn = document.getElementById('menuBtn');
    var sidenav = document.getElementById('sidenav');
    var toTop = document.getElementById('toTop');
    var links = Array.prototype.slice.call(sidenav.querySelectorAll('a'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
    var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

    themeBtn.addEventListener('click', function () {
      var novo = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', novo);
      salvarTema(novo);
    });

    /* ---------- Accordion ---------- */
    function definir(card, abrir) {
      var btn = card.querySelector('.acc-btn');
      var painel = card.querySelector('.panel');
      btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      painel.classList.toggle('open', abrir);
      if (abrir) { painel.removeAttribute('inert'); } else { painel.setAttribute('inert', ''); }
    }
    cards.forEach(function (card) {
      definir(card, card.getAttribute('data-open') !== 'false');
      card.querySelector('.acc-btn').addEventListener('click', function () {
        var aberto = this.getAttribute('aria-expanded') === 'true';
        definir(card, !aberto);
      });
    });

    /* ---------- Menu mobile ---------- */
    function menu(abrir) {
      sidenav.classList.toggle('open', abrir);
      menuBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu de seções' : 'Abrir menu de seções');
    }
    menuBtn.addEventListener('click', function () {
      menu(!sidenav.classList.contains('open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidenav.classList.contains('open')) { menu(false); menuBtn.focus(); }
    });

    /* ---------- Rolagem suave + abrir seção de destino ---------- */
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var alvo = document.querySelector(a.getAttribute('href'));
        if (!alvo) return;
        e.preventDefault();
        if (alvo.classList.contains('card')) definir(alvo, true);
        alvo.scrollIntoView({ behavior: reduzir.matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', a.getAttribute('href'));
        menu(false);
      });
    });

    /* ---------- Scroll spy ---------- */
    function marcar() {
      var linha = window.innerHeight * 0.3;
      var atual = null;
      cards.forEach(function (c) {
        if (c.getBoundingClientRect().top <= linha) atual = c.id;
      });
      var fim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (fim) atual = cards[cards.length - 1].id;
      links.forEach(function (a) {
        var ativo = a.getAttribute('href') === '#' + atual;
        a.classList.toggle('active', ativo);
        if (ativo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }

    /* ---------- Voltar ao topo ---------- */
    function aoRolar() {
      toTop.classList.toggle('show', window.scrollY > 500);
      marcar();
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { aoRolar(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', marcar);
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduzir.matches ? 'auto' : 'smooth' });
    });

    aoRolar();
  });
})();
