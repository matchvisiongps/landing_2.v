/* ==========================================================================
   MATCHVISION — legal.js
   Tabbed Privacy / Terms / Disclaimer switcher with hash + history support.
   ========================================================================== */

(function () {
  'use strict';

  var TABS = ['privacy', 'terms', 'disclaimer'];
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.legal-tab'));
  var docs = Array.prototype.slice.call(document.querySelectorAll('.legal-doc'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function show(tab, opts) {
    opts = opts || {};
    if (TABS.indexOf(tab) === -1) tab = 'privacy';

    tabButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    docs.forEach(function (doc) {
      doc.hidden = doc.getAttribute('data-doc') !== tab;
    });

    if (!opts.replaceOnly) {
      if (('#' + tab) !== location.hash) {
        history.pushState({ tab: tab }, '', '#' + tab);
      }
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      show(btn.getAttribute('data-tab'));
    });
  });

  // In-content links that jump to another tab (e.g. Terms → Disclaimer)
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-tab-link]');
    if (!link) return;
    event.preventDefault();
    show(link.getAttribute('data-tab-link'));
  });

  window.addEventListener('popstate', function () {
    show((location.hash || '').replace(/^#/, ''), { replaceOnly: true });
  });

  // Initial tab from the URL hash (footer links from the main site land here)
  show((location.hash || '').replace(/^#/, ''), { replaceOnly: true });

  var yearEl = document.getElementById('legal-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
