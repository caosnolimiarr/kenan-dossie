(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'kenan-dossie-theme';

  /* Avisa o CSS que o JavaScript está rodando (libera o recolher/expandir) */
  root.classList.add('js');
  if (window.console && console.info) console.info('Dossiê Kenan — build v4 carregado');

  /* ---------- Tema (aplicado antes da pintura, sem piscar) ---------- */
  function lerTema() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function gravarTema(t) {
    try { localStorage.setItem(KEY, t); } catch (e) { /* sem storage */ }
  }
  var salvo = lerTema();
  root.setAttribute('data-theme', salvo === 'light' || salvo === 'dark' ? salvo : 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    var themeBtn = document.getElementById('themeBtn');
    var menuBtn = document.getElementById('menuBtn');
    var sidenav = document.getElementById('sidenav');
    var scrim = document.getElementById('scrim');
    var toTop = document.getElementById('toTop');
    var hero = document.querySelector('.hero');
    var links = Array.prototype.slice.call(sidenav.querySelectorAll('a'));
    var secoes = Array.prototype.slice.call(document.querySelectorAll('.sec'));
    var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
    var desktop = window.matchMedia('(min-width: 960px)');

    /* ---------- Retrato: se a foto não carregou, mostra o monograma ---------- */
    var foto = document.querySelector('.frame img');
    if (foto && foto.complete && foto.naturalWidth === 0) {
      foto.closest('.portrait').classList.add('noimg');
      foto.remove();
    }

    /* ---------- Botão de tema ---------- */
    function atualizarBotaoTema() {
      var escuro = root.getAttribute('data-theme') === 'dark';
      themeBtn.setAttribute('aria-pressed', escuro ? 'false' : 'true');
      themeBtn.setAttribute('aria-label', escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro');
    }
    themeBtn.addEventListener('click', function () {
      var novo = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', novo);
      gravarTema(novo);
      atualizarBotaoTema();
    });
    atualizarBotaoTema();

    /* ---------- Accordion (altura medida em JS; painel fechado fica com [hidden]) ---------- */
    function definir(sec, abrir, animar) {
      var btn = sec.querySelector('.acc-btn');
      var painel = sec.querySelector('.panel');
      btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      sec.classList.toggle('is-open', abrir);
      clearTimeout(painel._t);

      if (!animar || reduzir.matches) {
        painel.hidden = !abrir;
        painel.style.height = '';
        return;
      }
      if (abrir) {
        painel.hidden = false;
        painel.style.height = '0px';
        void painel.offsetHeight;
        painel.style.height = painel.scrollHeight + 'px';
        painel._t = setTimeout(function () { painel.style.height = ''; }, 330);
      } else {
        painel.style.height = painel.getBoundingClientRect().height + 'px';
        void painel.offsetHeight;
        painel.style.height = '0px';
        painel._t = setTimeout(function () { painel.hidden = true; painel.style.height = ''; }, 330);
      }
    }
    secoes.forEach(function (sec) {
      definir(sec, sec.getAttribute('data-open') !== 'false', false);
    });
    /* delegação: um único ouvinte cobre todos os títulos */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.acc-btn') : null;
      if (!btn) return;
      var sec = btn.closest('.sec');
      if (sec) definir(sec, btn.getAttribute('aria-expanded') !== 'true', true);
    });

    /* ---------- Menu retrátil (celular e tablet) ---------- */
    function menu(abrir) {
      if (desktop.matches) abrir = false;
      sidenav.classList.toggle('open', abrir);
      scrim.hidden = !abrir;
      document.body.classList.toggle('no-scroll', abrir);
      menuBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', abrir ? 'Fechar menu de seções' : 'Abrir menu de seções');
    }
    menuBtn.addEventListener('click', function () { menu(!sidenav.classList.contains('open')); });
    scrim.addEventListener('click', function () { menu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidenav.classList.contains('open')) { menu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (desktop.matches) menu(false); });

    /* ---------- Rolagem suave + abre a seção de destino ---------- */
    function irPara(id, atualizarHash) {
      var alvo = document.getElementById(id);
      if (!alvo) return;
      if (alvo.classList.contains('sec')) definir(alvo, true, true);
      alvo.scrollIntoView({ behavior: reduzir.matches ? 'auto' : 'smooth', block: 'start' });
      if (atualizarHash) history.replaceState(null, '', '#' + id);
    }
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!document.getElementById(id)) return;
        e.preventDefault();
        menu(false);
        irPara(id, true);
      });
    });
    var marca = document.querySelector('.brand');
    marca.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduzir.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', location.pathname + location.search);
    });

    /* ---------- Scroll spy ---------- */
    function marcar() {
      var linha = window.innerHeight * 0.3;
      var atual = null;
      secoes.forEach(function (s) {
        if (s.getBoundingClientRect().top <= linha) atual = s.id;
      });
      var fim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (fim) atual = secoes[secoes.length - 1].id;
      links.forEach(function (a) {
        var ativo = a.getAttribute('href') === '#' + atual;
        a.classList.toggle('active', ativo);
        if (ativo) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
      });
    }

    /* ---------- Voltar ao topo ---------- */
    function aoRolar() {
      toTop.classList.toggle('show', window.scrollY > 500);
      marcar();
    }
    var ocupado = false;
    window.addEventListener('scroll', function () {
      if (ocupado) return;
      ocupado = true;
      window.requestAnimationFrame(function () { aoRolar(); ocupado = false; });
    }, { passive: true });
    window.addEventListener('resize', marcar);
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduzir.matches ? 'auto' : 'smooth' });
    });

    /* ---------- Luz de lampião que segue o cursor (só mouse) ---------- */
    if (hero && window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        if (reduzir.matches) return;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
        hero.classList.add('lit');
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('lit'); });
    }

    /* ---------- Abre a seção do endereço (#plot etc.) ---------- */
    if (location.hash.length > 1) {
      var id = decodeURIComponent(location.hash.slice(1));
      window.setTimeout(function () { irPara(id, false); }, 60);
    }

    aoRolar();
  });
})();
