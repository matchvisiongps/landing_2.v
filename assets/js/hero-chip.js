/* MatchVision — vizuál s čipem v úvodu: přizpůsobení velikosti + líné načtení 3D modelu
   Těžký soubor vendor/mvchip.js (three.js, ~500 kB) se stahuje až po načtení stránky,
   takže neblokuje první zobrazení. Do té doby je vidět obrázek čipu. */
(function () {
  'use strict';

  var visual = document.getElementById('visual');
  var canvas = document.getElementById('chip');
  var stage = document.querySelector('.stage');
  var phone = window.matchMedia('(max-width: 767px)');

  /* Zmenšení celé kompozice podle dostupného místa (--s čte CSS) */
  function fit() {
    if (!visual) return;
    var base = phone.matches ? 470 : 580;
    var s = Math.min(1, visual.clientWidth / base);
    if (s > 0) visual.style.setProperty('--s', s.toFixed(3));
  }
  fit();
  if (visual && 'ResizeObserver' in window) new ResizeObserver(fit).observe(visual);
  else window.addEventListener('resize', fit);

  /* 3D čip */
  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  var conn = navigator.connection || {};
  if (!canvas || !webglOK() || conn.saveData) return; // zůstane obrázek čipu

  function mount() {
    window.MVChip.mount(canvas, {
      speed: 40,
      urls: {
        tread: 'assets/textures/tread.png',
        treadBump: 'assets/textures/tread-bump.png',
        panel: 'assets/textures/panel.png',
        hex: 'assets/textures/hex.jpg'
      }
    }).then(function () {
      if (stage) stage.classList.add('chip-live');
    }).catch(function () { /* zůstane obrázek čipu */ });
  }

  function load() {
    var s = document.createElement('script');
    s.src = 'assets/js/vendor/mvchip.js';
    s.onload = mount;
    document.head.appendChild(s);
  }

  function schedule() {
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2500 });
    else setTimeout(load, 800);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule);
})();
