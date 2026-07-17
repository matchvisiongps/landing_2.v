/* ==========================================================================
   MATCHVISION — main.js
   Mobile navigation, FAQ accordion, footer year
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close the menu after choosing a destination
    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ---------- FAQ accordion (one item open at a time) ---------- */
  var faqList = document.getElementById('faq-list');

  if (faqList) {
    var items = Array.prototype.slice.call(faqList.querySelectorAll('.faq-item'));

    function setOpen(item, open) {
      var button = item.querySelector('.faq-item__q');
      var icon = item.querySelector('.faq-item__icon');
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      icon.textContent = open ? '−' : '+';
    }

    items.forEach(function (item) {
      var button = item.querySelector('.faq-item__q');
      button.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        items.forEach(function (other) { setOpen(other, false); });
        if (willOpen) setOpen(item, true);
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
