/* MatchVision — „Jak to funguje": postupné zvýraznění kroků */
(function () {
  'use strict';

  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  if (!steps.length) return;

  var current = 0, paused = false, inView = false;

  function show(i) {
    current = i;
    steps.forEach(function (el, k) {
      el.classList.toggle('is-active', k === i);
      el.classList.toggle('is-done', k < i);
    });
  }
  function next() { if (!paused && inView) show((current + 1) % steps.length); }

  steps.forEach(function (el, k) {
    el.addEventListener('mouseenter', function () { paused = true; show(k); });
    el.addEventListener('mouseleave', function () { paused = false; });
    el.addEventListener('click', function () { show(k); });
  });

  show(0);
  if (!window.MV.reduceMotion) setInterval(next, 2800);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.25 })
      .observe(document.getElementById('steps'));
  } else {
    inView = true;
  }
})();
