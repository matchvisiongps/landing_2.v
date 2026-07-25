/* ==========================================================================
   MATCHVISION — thankyou.js
   Personalises the post-payment page. The buyer name/email come from the
   URL query (?name=&email=, if your checkout appends them) or, as a
   fallback, from the details saved to localStorage when the form was sent.
   ========================================================================== */

(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var buyer = {};
  try { buyer = JSON.parse(localStorage.getItem('mv-buyer') || '{}') || {}; } catch (e) { buyer = {}; }

  var name = (params.get('name') || buyer.name || '').trim();
  var email = (params.get('email') || buyer.email || '').trim();

  var nameEl = document.getElementById('ty-name');
  if (nameEl && name) nameEl.textContent = name;

  var emailEl = document.getElementById('ty-email');
  if (emailEl && email) emailEl.textContent = email;

  var yearEl = document.getElementById('ty-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var card = document.querySelector('.thanks__card');
  if (card) { try { card.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
})();
