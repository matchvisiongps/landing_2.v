/* MATCHVISION — menu na mobilu + zvýraznění aktuální sekce */
(function () {
  'use strict';

  var root = window.MV.root;
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    }
  }

  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (root.classList.contains('menu-open') && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* Zvýraznění aktuální sekce v menu */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  if ('IntersectionObserver' in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-current'); });
          a.classList.add('is-current');
        } else {
          a.classList.remove('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }
})();
