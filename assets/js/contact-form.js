/* MatchVision — kontaktní formulář (Web3Forms, bez klíče náhradně otevře e-mail) */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var EMAIL = 'team@matchvision.cz';
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

      var key = val('access_key');
      if (!key) {
        // Klíč z Web3Forms zatím není vložený → otevřeme předvyplněný e-mail
        var body = 'Jméno: ' + val('name') + '\nKlub / tým: ' + val('klub') + '\nE-mail: ' + val('email') +
          (val('telefon') ? '\nTelefon: ' + val('telefon') : '') + '\n\n' + val('message');
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Poptávka z webu – ' + val('klub')) +
          '&body=' + encodeURIComponent(body);
        setStatus('Otevřeli jsme vám e-mail s vyplněnou poptávkou, stačí ho odeslat. Pokud se nic neotevřelo, napište nám na <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
        return;
      }

      form.classList.add('is-busy');
      setStatus('');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.subject = 'Nová poptávka z matchvision.cz – ' + val('klub');

      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          form.classList.remove('is-busy');
          if (res.ok && res.j && res.j.success !== false) done();
          else fail();
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
