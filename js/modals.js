/* ==========================================================================
   MATCHVISION — modals.js
   Reusable modal engine + checkout confirmation (every buy / checkout button)
   + Hormozi-style limited-offer promo with a live countdown.

   Reads window.MV_CONFIG (defined in js/main.js) for checkout URLs and the
   sale deadline. Exposes window.MVModals for js/forms.js.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = window.MV_CONFIG || { checkout: {}, saleEnd: '2026-08-15T23:59:59' };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var openCount = 0;
  var lastFocus = null;

  /* ---------- Generic open / close ---------- */
  function openModal(overlay) {
    if (!overlay || overlay.classList.contains('is-open')) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    // Force layout so the transition runs from the hidden state.
    void overlay.offsetWidth;
    overlay.classList.add('is-open');
    openCount++;
    document.body.style.overflow = 'hidden';

    var focusable = overlay.querySelector('.btn, [data-modal-close], a[href], button');
    if (focusable) {
      try { focusable.focus({ preventScroll: true }); } catch (e) { focusable.focus(); }
    }
  }

  function closeModal(overlay) {
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) document.body.style.overflow = '';

    var done = function () {
      if (!overlay.classList.contains('is-open')) overlay.hidden = true;
      overlay.removeEventListener('transitionend', done);
    };
    if (reduceMotion) { done(); } else { overlay.addEventListener('transitionend', done); }

    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
  }

  function closeTopModal() {
    var open = document.querySelectorAll('.modal-overlay.is-open');
    if (open.length) closeModal(open[open.length - 1]);
  }

  /* ---------- Checkout confirmation modal ---------- */
  var checkoutOverlay = document.getElementById('checkout-modal');
  var checkoutTitle = document.getElementById('checkout-modal-title');
  var checkoutText = document.getElementById('checkout-modal-text');
  var checkoutSteps = document.getElementById('checkout-modal-steps');
  var checkoutNote = document.getElementById('checkout-modal-note');
  var checkoutContinue = document.getElementById('checkout-continue');
  var currentProduct = 'blueprint';

  var COPY = {
    review: {
      title: function (name) { return name ? 'You’re one step away, ' + name + '.' : 'You’re one step away.'; },
      text: 'Next you’ll go to our secure checkout to complete your €129 Pro Match Report.',
      steps: [
        { icon: 'i-lock', text: 'Pay securely — card details handled by Stripe.' },
        { icon: 'i-check', text: 'We start your analysis as soon as payment clears.' },
        { icon: 'i-check', text: 'Your report + free 1:1 call arrive within 5 working days.' }
      ],
      cta: 'Continue to secure checkout',
      pending: 'Your details are saved — we’ll email you the secure payment link shortly.'
    },
    blueprint: {
      title: function () { return 'Get the GPS Blueprint — €19.'; },
      text: 'Next you’ll go to our secure checkout to complete your purchase.',
      steps: [
        { icon: 'i-lock', text: 'Pay securely — €19 launch price (normally €49).' },
        { icon: 'i-download', text: 'After payment you’re redirected straight to your PDF.' },
        { icon: 'i-shield', text: '14-day money-back guarantee — keep the PDF either way.' }
      ],
      cta: 'Continue to secure checkout — €19',
      pending: 'Secure checkout is being finalised — the €19 payment link is coming shortly.'
    }
  };

  function iconSvg(id) {
    return '<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function openCheckout(opts) {
    if (!checkoutOverlay) return;
    opts = opts || {};
    currentProduct = COPY[opts.product] ? opts.product : 'blueprint';
    var copy = COPY[currentProduct];

    checkoutTitle.textContent = copy.title(opts.name || '');
    checkoutText.textContent = copy.text;
    checkoutSteps.innerHTML = copy.steps.map(function (s) {
      return '<li>' + iconSvg(s.icon) + '<span>' + s.text + '</span></li>';
    }).join('');

    // Reset the action state each time.
    checkoutNote.hidden = true;
    checkoutNote.textContent = '';
    checkoutContinue.disabled = false;
    checkoutContinue.innerHTML = copy.cta + ' ' + iconSvg('i-arrow-up-right');

    openModal(checkoutOverlay);
  }

  if (checkoutContinue) {
    checkoutContinue.addEventListener('click', function () {
      var url = (CONFIG.checkout || {})[currentProduct];
      if (url) {
        window.location.href = url;
        return;
      }
      // No live checkout yet — confirm the hand-off without a dead end.
      checkoutNote.hidden = false;
      checkoutNote.textContent = COPY[currentProduct].pending;
      checkoutContinue.disabled = true;
      checkoutContinue.innerHTML = 'Saved ' + iconSvg('i-check');
    });
  }

  /* ---------- Click delegation (buy buttons + close controls) ---------- */
  document.addEventListener('click', function (event) {
    var buy = event.target.closest('[data-checkout]');
    if (buy) {
      event.preventDefault();
      openCheckout({ product: buy.getAttribute('data-checkout') });
      return;
    }
    var closer = event.target.closest('[data-modal-close]');
    if (closer) {
      var overlay = closer.closest('.modal-overlay');
      if (overlay) closeModal(overlay);
      return;
    }
    // Click on the backdrop (outside .modal) closes the modal.
    if (event.target.classList && event.target.classList.contains('modal-overlay')) {
      closeModal(event.target);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeTopModal();
  });

  /* ---------- Promo countdown ---------- */
  var promoOverlay = document.getElementById('promo-modal');
  var countdownEl = document.getElementById('promo-countdown');
  var endedEl = document.getElementById('promo-ended');
  var promoCta = promoOverlay ? promoOverlay.querySelector('.promo__cta') : null;
  var target = new Date(CONFIG.saleEnd).getTime();

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function setExpired() {
    if (countdownEl) countdownEl.hidden = true;
    if (endedEl) endedEl.hidden = false;
    if (promoCta) {
      promoCta.setAttribute('href', '#blueprint');
      promoCta.innerHTML = '<svg class="icon" width="17" height="17" aria-hidden="true"><use href="#i-download"/></svg> View the Blueprint';
    }
  }

  function tick() {
    if (!countdownEl) return;
    var diff = target - Date.now();
    if (isNaN(target) || diff <= 0) { setExpired(); return true; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff / 3600000) % 24;
    var m = Math.floor(diff / 60000) % 60;
    var s = Math.floor(diff / 1000) % 60;
    var map = { days: d, hours: h, minutes: m, seconds: s };
    Object.keys(map).forEach(function (key) {
      var el = countdownEl.querySelector('[data-cd="' + key + '"]');
      if (el) el.textContent = pad(map[key]);
    });
    return false;
  }

  function startCountdown() {
    if (!countdownEl) return;
    if (tick()) return; // already expired
    var timer = setInterval(function () {
      if (tick()) clearInterval(timer);
    }, 1000);
  }

  function initPromo() {
    if (!promoOverlay) return;
    startCountdown();

    var blueprint = document.getElementById('page-blueprint');
    if (!blueprint) return;

    var scheduled = false;

    // Surface the limited-offer promo when the visitor opens the Blueprint
    // page (once per session, only while the sale is still live).
    function triggerOnBlueprint() {
      if (scheduled) return;
      var expired = isNaN(target) || (target - Date.now() <= 0);
      var seen;
      try { seen = sessionStorage.getItem('mv-promo-seen'); } catch (e) { seen = null; }
      if (blueprint.hidden || seen || expired) return;

      scheduled = true;
      setTimeout(function () {
        // Don't stack on top of another open modal.
        if (document.querySelector('.modal-overlay.is-open')) { scheduled = false; return; }
        // Only surface it if the visitor is still on the Blueprint page.
        if (blueprint.hidden) { scheduled = false; return; }
        openModal(promoOverlay);
        try { sessionStorage.setItem('mv-promo-seen', '1'); } catch (e) { /* noop */ }
      }, 1600);
    }

    // Deep-linked straight onto the Blueprint page.
    triggerOnBlueprint();

    // The SPA router toggles [hidden] on the page — react whenever the
    // Blueprint page becomes visible via in-app navigation.
    if (typeof MutationObserver === 'function') {
      var observer = new MutationObserver(function () {
        if (!blueprint.hidden) triggerOnBlueprint();
      });
      observer.observe(blueprint, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  initPromo();

  /* ---------- Public API ---------- */
  window.MVModals = {
    openCheckout: openCheckout,
    openPromo: function () { openModal(promoOverlay); },
    close: closeTopModal
  };
})();
