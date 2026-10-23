/* MATCHVISION — přepínání jazyků (CS výchozí, PL, DE)
   Čeština zůstává přímo v HTML (SEO, funguje bez JS). Překlady jsou v i18n-dict.js,
   klíčem je původní český text. Volba jazyka se pamatuje v localStorage, jde i ?lang=pl. */
(function () {
  'use strict';

  var LANGS = ['cs', 'pl', 'de'];
  var D = window.MV_I18N || { pl: {}, de: {}, ui: {} };
  var current = 'cs';
  var store = [];          // { kind, el, node, attr, orig, key }
  var metaDone = false;

  var norm = function (s) {
    return String(s).replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ').trim();
  };
  var fixPl = function (s) {   // jednopísmenné předložky nechceme na konci řádku
    return s.replace(/(^|[\s>])([wzioaWZIOA]) (?=\S)/g, '$1$2 ');
  };

  /* ---- sběr překládaných míst (jednou, při startu) ---- */
  var HTML_UNITS = '[data-i18n], .prose-inner h2, .prose-inner p, .prose-inner li';
  var ATTRS = ['placeholder', 'alt', 'aria-label', 'title', 'content'];

  function collect() {
    var units = Array.prototype.slice.call(document.querySelectorAll(HTML_UNITS));
    // vnořené jednotky (li uvnitř ul apod.) nejsou problém, <p>/<li> se nevnořují
    units.forEach(function (el) {
      store.push({ kind: 'html', el: el, orig: el.innerHTML, key: norm(el.innerHTML) });
    });

    var skip = { SCRIPT: 1, STYLE: 1, SVG: 1, svg: 1, CANVAS: 1, NOSCRIPT: 1 };
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        for (var p = n.parentNode; p && p !== document.body; p = p.parentNode) {
          if (skip[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if (p.hasAttribute && (p.hasAttribute('data-i18n') || (p.matches && p.matches('.prose-inner h2, .prose-inner p, .prose-inner li')))) return NodeFilter.FILTER_REJECT;
          if (p.id === 'form-status') return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      store.push({ kind: 'text', node: n, orig: n.nodeValue, key: norm(n.nodeValue) });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[placeholder],[alt],[aria-label],[title]'), function (el) {
      ['placeholder', 'alt', 'aria-label', 'title'].forEach(function (a) {
        if (el.hasAttribute(a) && el.getAttribute(a)) store.push({ kind: 'attr', el: el, attr: a, orig: el.getAttribute(a), key: norm(el.getAttribute(a)) });
      });
    });

    // <title> a meta popisy (SEO / sdílení)
    var t = document.querySelector('title');
    if (t) store.push({ kind: 'title', el: t, orig: t.textContent, key: norm(t.textContent) });
    Array.prototype.forEach.call(document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[property="og:image:alt"],meta[name="twitter:title"],meta[name="twitter:description"]'), function (m) {
      store.push({ kind: 'attr', el: m, attr: 'content', orig: m.getAttribute('content'), key: norm(m.getAttribute('content')) });
    });
  }

  /* ---- použití jazyka ---- */
  function lookup(lang, key) {
    var v = D[lang] && D[lang][key];
    if (v == null) return null;
    return lang === 'pl' ? fixPl(v) : v;
  }

  function translate(item, lang) {
    var out = lang === 'cs' ? item.orig : lookup(lang, item.key);
    if (out == null) {
      if (lang !== 'cs' && /[a-zA-Zá-žÁ-Ž]{3}/.test(item.key) && window.MV_I18N_DEBUG) console.warn('[i18n] chybí překlad:', item.key);
      out = item.orig;
    } else if (lang !== 'cs' && item.kind === 'text') {
      // zachovat okolní mezery původního uzlu
      var lead = /^\s/.test(item.orig) ? ' ' : '';
      var trail = /\s$/.test(item.orig) ? ' ' : '';
      out = lead + out + trail;
    }
    if (item.kind === 'html') item.el.innerHTML = out;
    else if (item.kind === 'text') item.node.nodeValue = out;
    else if (item.kind === 'title') item.el.textContent = out.replace(/&nbsp;/g, ' ');
    else if (item.kind === 'attr') item.el.setAttribute(item.attr, out);
  }

  function setLang(lang, persist) {
    if (LANGS.indexOf(lang) === -1) lang = 'cs';
    current = lang;
    store.forEach(function (it) { translate(it, lang); });
    document.documentElement.lang = lang;
    var og = { cs: 'cs_CZ', pl: 'pl_PL', de: 'de_DE' }[lang];
    var ogl = document.querySelector('meta[property="og:locale"]');
    if (ogl) ogl.setAttribute('content', og);
    Array.prototype.forEach.call(document.querySelectorAll('.lang-btn'), function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (persist) { try { localStorage.setItem('mv-lang', lang); } catch (e) {} }
    // texty vložené skripty (menu, formulář) si berou MV.t() průběžně
    var burger = document.querySelector('.burger');
    if (burger) burger.setAttribute('aria-label', MV.t(document.documentElement.classList.contains('menu-open') ? 'Zavřít menu' : 'Otevřít menu'));
    var st = document.getElementById('form-status');
    if (st && st.getAttribute('data-ui')) st.innerHTML = MV.t(st.getAttribute('data-ui'));
    document.dispatchEvent(new CustomEvent('mv:lang', { detail: { lang: lang } }));
  }

  /* ---- veřejné API pro ostatní skripty ---- */
  window.MV = window.MV || {};
  MV.lang = function () { return current; };
  MV.t = function (key) {
    if (current === 'cs') return key;
    var v = (D.ui && D.ui[current] && D.ui[current][key]) || lookup(current, norm(key));
    return v == null ? key : v;
  };
  MV.setLang = setLang;

  /* ---- start ---- */
  function init() {
    collect();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.lang-btn');
      if (b) setLang(b.getAttribute('data-lang'), true);
    });
    var wanted = null;
    try { wanted = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (LANGS.indexOf(wanted) !== -1) { setLang(wanted, true); return; }
    try { wanted = localStorage.getItem('mv-lang'); } catch (e) { wanted = null; }
    if (LANGS.indexOf(wanted) > 0) setLang(wanted, false);
    else setLang('cs', false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
