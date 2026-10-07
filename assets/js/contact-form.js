/* MATCHVISION — kontaktní formulář (odesílá data na Make.com webhook → Gmail) */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var EMAIL = 'team@matchvision.cz';
    var WEBHOOK = 'https://hook.eu1.make.com/fngk8x57dk1pa61b3adovp96by5ci0d2';
    var setStatus = function (html, isError) {
      status.innerHTML = html || '';
      status.classList.toggle('is-error', !!isError);
    };
    var field = function (n) { return form.elements[n]; };
    var val = function (n) { var f = field(n); return f ? String(f.value || '').trim() : ''; };

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) e.target.classList.remove('is-invalid');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('is-busy')) return;

      // kontrola povinných polí
      var invalid = [];
      ['name', 'klub', 'email', 'message'].forEach(function (n) {
        var f = field(n);
        var ok = f && val(n) !== '' && f.checkValidity();
        if (f) f.classList.toggle('is-invalid', !ok);
        if (!ok && f) invalid.push(f);
      });
      if (invalid.length) {
        var badEmail = invalid.indexOf(field('email')) !== -1 && val('email') !== '';
        setStatus(badEmail ? 'Zkontrolujte prosím e-mailovou adresu.' : 'Vyplňte prosím jméno, klub, e-mail a zprávu.', true);
        invalid[0].focus();
        return;
      }

      // robot vyplnil skryté pole → tváříme se, že je odesláno
      if (field('botcheck') && field('botcheck').checked) { done(); return; }

      form.classList.add('is-busy');
      setStatus('');
      var data = new URLSearchParams();
      data.append('jmeno', val('name'));
      data.append('klub', val('klub'));
      data.append('email', val('email'));
      data.append('telefon', val('telefon'));
      data.append('zprava', val('message'));
      data.append('predmet', 'Nová poptávka z matchvision.cz – ' + val('klub'));
      data.append('odeslano', new Date().toISOString());
      data.append('stranka', window.location.href);

      // form-urlencoded = „jednoduchý“ požadavek bez CORS preflightu
      fetch(WEBHOOK, { method: 'POST', body: data })
        .then(function (r) {
          form.classList.remove('is-busy');
          if (r.ok) done(); else fail();
        })
        .catch(function () { form.classList.remove('is-busy'); fail(); });
    });

    var done = function () {
      form.reset();
      form.classList.add('is-sent');
      setStatus('Poptávka dorazila. Ozveme se vám co nejdříve.');
      setTimeout(function () { form.classList.remove('is-sent'); }, 6000);
    };
    var fail = function () {
      setStatus('Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám napište na <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.', true);
    };
  }
})();
