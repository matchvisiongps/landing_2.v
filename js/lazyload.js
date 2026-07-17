/* ==========================================================================
   MATCHVISION — lazyload.js
   Images use native loading="lazy". This module adds:
   1. A fade-in once each lazy image has actually decoded (.lazy-img).
   2. A data-src upgrade path for any future below-the-fold media that
      should bypass even the native scanner (e.g. heavy report previews).
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- Fade-in for natively lazy images ---------- */
  function markLoaded(img) {
    img.classList.add('is-loaded');
  }

  Array.prototype.forEach.call(document.querySelectorAll('img.lazy-img'), function (img) {
    if (img.complete && img.naturalWidth > 0) {
      markLoaded(img);
    } else {
      img.addEventListener('load', function () { markLoaded(img); }, { once: true });
      img.addEventListener('error', function () { markLoaded(img); }, { once: true });
    }
  });

  /* ---------- data-src / data-srcset upgrade (IntersectionObserver) ---------- */
  var deferred = document.querySelectorAll('img[data-src], img[data-srcset]');
  if (!deferred.length) return;

  function hydrate(img) {
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    if (img.dataset.src) img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(deferred, hydrate);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          hydrate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '200px 0px' }
  );

  Array.prototype.forEach.call(deferred, function (img) {
    observer.observe(img);
  });
})();
