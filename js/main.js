/* ==========================================================================
   MATCHVISION — main.js
   Client-side page router (Home / Pro Match Report / Blueprint),
   mobile navigation, FAQ accordion, in-page smooth scroll, checkout hooks,
   footer year.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Configuration ----------
     Shared with js/forms.js and js/modals.js via window.MV_CONFIG.

     checkout.review   — Stripe checkout URL for The Pro Match Report (€129).
                         Set its Stripe success_url to  thank-you.html
     checkout.blueprint— Stripe checkout URL for the GPS Blueprint (€19).
                         Set its Stripe success_url to your PDF download link.
     While a checkout URL is empty the confirmation modal captures the buyer
     and tells them the secure link is on its way (no dead ends).

     spotsLeft — monthly Pro Match Report capacity, injected into [data-spots].
     saleEnd   — Blueprint launch-offer deadline for the promo countdown. */
  window.MV_CONFIG = window.MV_CONFIG || {
    checkout: {
      review: 'https://buy.stripe.com/8x26oHfSogJofbd6x873G04',
      blueprint: 'https://buy.stripe.com/cNieVd49GeBggfhf3E73G03'
    },
    // Make.com webhooks (used by js/forms.js)
    //  order → the Pro Match Report submission (feeds your Excel sheet)
    //  ask   → the "Ask a question" mini-form
    webhooks: {
      order: 'https://hook.eu1.make.com/0lr1kqqdlaep4naelq96nl9abkstuo1h',
      ask: 'https://hook.eu1.make.com/sa4u6kb58s8f0x4azh76d3el6a6a5vlj'
    },
    spotsLeft: 9,
    saleEnd: '2026-08-10T23:59:59'
  };

  var SPOTS_LEFT = window.MV_CONFIG.spotsLeft;

  /* ---------- Page router ---------- */
  var PAGE_IDS = {
    home: 'page-home',
    review: 'page-review',
    blueprint: 'page-blueprint'
  };

  var PAGE_TITLES = {
    home: 'MATCHVISION — Professional Football Performance Analysis for Players & Coaches',
    review: 'The Pro Match Report — MATCHVISION',
    blueprint: 'GPS Football Data Blueprint — MATCHVISION'
  };

  var HASH_FOR_PAGE = { home: '', review: '#pro-report', blueprint: '#blueprint' };

  var pages = {};
  Object.keys(PAGE_IDS).forEach(function (name) {
    pages[name] = document.getElementById(PAGE_IDS[name]);
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav__link[data-goto]'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToEl(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 20;
    window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function setActiveNav(page) {
    navLinks.forEach(function (link) {
      var match = link.getAttribute('data-goto') === page && !link.hasAttribute('data-anchor');
      if (match) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function showPage(name, opts) {
    opts = opts || {};
    if (!pages[name]) name = 'home';

    Object.keys(pages).forEach(function (key) {
      if (pages[key]) pages[key].hidden = key !== name;
    });

    setActiveNav(name);
    document.title = PAGE_TITLES[name] || PAGE_TITLES.home;

    if (!opts.replaceOnly && HASH_FOR_PAGE[name] !== undefined) {
      var hash = opts.anchor ? '#' + opts.anchor : HASH_FOR_PAGE[name];
      var url = hash || (location.pathname + location.search);
      if (('#' + (location.hash || '').replace(/^#/, '')) !== ('#' + (hash || '').replace(/^#/, ''))) {
        history.pushState({ page: name, anchor: opts.anchor || null }, '', url || location.pathname);
      }
    }

    // Position after the page becomes visible.
    requestAnimationFrame(function () {
      if (opts.anchor) {
        scrollToEl(document.getElementById(opts.anchor));
      } else if (!opts.keepScroll) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      // Move focus to the page heading for screen-reader users on genuine
      // navigations (not the initial load / back-forward), without scrolling.
      var heading = pages[name] && pages[name].querySelector('h1, h2');
      if (heading && !opts.anchor && !opts.replaceOnly) {
        heading.setAttribute('tabindex', '-1');
        try { heading.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
      }
    });
  }

  /* Resolve a hash to a {page, anchor} route */
  function routeFromHash(hash) {
    hash = (hash || '').replace(/^#/, '');
    switch (hash) {
      case 'pro-report':
      case 'review':
        return { page: 'review' };
      case 'submit':
        return { page: 'review', anchor: 'submit' };
      case 'blueprint':
        return { page: 'blueprint' };
      case 'whatis':
        return { page: 'home', anchor: 'whatis' };
      case 'faq':
        return { page: 'home', anchor: 'faq' };
      case 'home':
      case '':
        return { page: 'home' };
      default:
        return { page: 'home' };
    }
  }

  /* ---------- Click delegation ---------- */
  document.addEventListener('click', function (event) {
    var goto = event.target.closest('[data-goto]');
    if (goto) {
      event.preventDefault();
      var page = goto.getAttribute('data-goto');
      var anchor = goto.getAttribute('data-anchor') || null;
      showPage(page, { anchor: anchor });
      return;
    }

    var scroll = event.target.closest('[data-scroll]');
    if (scroll) {
      event.preventDefault();
      scrollToEl(document.getElementById(scroll.getAttribute('data-scroll')));
      return;
    }
    // [data-checkout] buttons are handled by js/modals.js (confirmation modal).
  });

  /* Back / forward navigation */
  window.addEventListener('popstate', function () {
    var route = routeFromHash(location.hash);
    showPage(route.page, { anchor: route.anchor, replaceOnly: true, keepScroll: !!route.anchor });
  });

  /* ---------- Initial route ---------- */
  (function initRoute() {
    var route = routeFromHash(location.hash);
    showPage(route.page, { anchor: route.anchor, replaceOnly: true });
  })();

  /* ---------- Inject dynamic values (spots left) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-spots]'), function (el) {
    el.textContent = String(SPOTS_LEFT);
  });

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
