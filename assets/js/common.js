/* MatchVision — společné pomůcky (načítá se jako první) */
window.MV = {
  root: document.documentElement,
  reduceMotion: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
};

/* Rok v patičce */
(function () {
  'use strict';
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
