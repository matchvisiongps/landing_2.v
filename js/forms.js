/* ==========================================================================
   MATCHVISION — forms.js
   Three-step analysis order form (validation, autosave, webhook submit)
   + "Ask a question" mini form.

   API integration: point WEBHOOK_URL at your endpoint. The payload is a
   flat JSON object — see buildPayload().
   ========================================================================== */

(function () {
  'use strict';

  var WEBHOOK_URL = 'https://hook.eu1.make.com/sa4u6kb58s8f0x4azh76d3el6a6a5vlj';
  var STORAGE_KEY = 'mv-analysis-form-v1';
  var TOTAL_STEPS = 3;

  var form = document.getElementById('order-form');
  if (!form) return;

  /* ---------- Validation rules ---------- */
  var POSITIONS = ['Goalkeeper', 'Centre-Back', 'Full-Back / Wing-Back', 'Defensive Midfielder', 'Central Midfielder', 'Wide Midfielder / Winger', 'Attacking Midfielder', 'Striker / Forward'];
  var LEVELS = ['Professional (1st Division)', 'Professional (2nd Division)', 'Semi-Professional (3rd / 4th Division)', 'Amateur — Competitive', 'Amateur — Recreational', 'Youth / Academy', 'University / College'];
  var RESULTS = ['Win', 'Draw', 'Loss'];

  // Nationalities (name + flag emoji) — data only, kept out of the HTML.
  var COUNTRIES = [
    ['Afghanistan', '🇦🇫'], ['Albania', '🇦🇱'], ['Algeria', '🇩🇿'], ['Andorra', '🇦🇩'], ['Angola', '🇦🇴'], ['Antigua and Barbuda', '🇦🇬'], ['Argentina', '🇦🇷'], ['Armenia', '🇦🇲'], ['Australia', '🇦🇺'], ['Austria', '🇦🇹'], ['Azerbaijan', '🇦🇿'], ['Bahamas', '🇧🇸'], ['Bahrain', '🇧🇭'], ['Bangladesh', '🇧🇩'], ['Barbados', '🇧🇧'], ['Belarus', '🇧🇾'], ['Belgium', '🇧🇪'], ['Belize', '🇧🇿'], ['Benin', '🇧🇯'], ['Bhutan', '🇧🇹'], ['Bolivia', '🇧🇴'], ['Bosnia and Herzegovina', '🇧🇦'], ['Botswana', '🇧🇼'], ['Brazil', '🇧🇷'], ['Brunei', '🇧🇳'], ['Bulgaria', '🇧🇬'], ['Burkina Faso', '🇧🇫'], ['Burundi', '🇧🇮'], ['Cabo Verde', '🇨🇻'], ['Cambodia', '🇰🇭'], ['Cameroon', '🇨🇲'], ['Canada', '🇨🇦'], ['Central African Republic', '🇨🇫'], ['Chad', '🇹🇩'], ['Chile', '🇨🇱'], ['China', '🇨🇳'], ['Colombia', '🇨🇴'], ['Comoros', '🇰🇲'], ['Congo (Brazzaville)', '🇨🇬'], ['Congo (Kinshasa)', '🇨🇩'], ['Costa Rica', '🇨🇷'], ['Côte d’Ivoire', '🇨🇮'], ['Croatia', '🇭🇷'], ['Cuba', '🇨🇺'], ['Cyprus', '🇨🇾'], ['Czech Republic', '🇨🇿'], ['Denmark', '🇩🇰'], ['Djibouti', '🇩🇯'], ['Dominica', '🇩🇲'], ['Dominican Republic', '🇩🇴'], ['Ecuador', '🇪🇨'], ['Egypt', '🇪🇬'], ['El Salvador', '🇸🇻'], ['Equatorial Guinea', '🇬🇶'], ['Eritrea', '🇪🇷'], ['Estonia', '🇪🇪'], ['Eswatini', '🇸🇿'], ['Ethiopia', '🇪🇹'], ['Fiji', '🇫🇯'], ['Finland', '🇫🇮'], ['France', '🇫🇷'], ['Gabon', '🇬🇦'], ['Gambia', '🇬🇲'], ['Georgia', '🇬🇪'], ['Germany', '🇩🇪'], ['Ghana', '🇬🇭'], ['Greece', '🇬🇷'], ['Grenada', '🇬🇩'], ['Guatemala', '🇬🇹'], ['Guinea', '🇬🇳'], ['Guinea-Bissau', '🇬🇼'], ['Guyana', '🇬🇾'], ['Haiti', '🇭🇹'], ['Honduras', '🇭🇳'], ['Hungary', '🇭🇺'], ['Iceland', '🇮🇸'], ['India', '🇮🇳'], ['Indonesia', '🇮🇩'], ['Iran', '🇮🇷'], ['Iraq', '🇮🇶'], ['Ireland', '🇮🇪'], ['Israel', '🇮🇱'], ['Italy', '🇮🇹'], ['Jamaica', '🇯🇲'], ['Japan', '🇯🇵'], ['Jordan', '🇯🇴'], ['Kazakhstan', '🇰🇿'], ['Kenya', '🇰🇪'], ['Kiribati', '🇰🇮'], ['Kosovo', '🇽🇰'], ['Kuwait', '🇰🇼'], ['Kyrgyzstan', '🇰🇬'], ['Laos', '🇱🇦'], ['Latvia', '🇱🇻'], ['Lebanon', '🇱🇧'], ['Lesotho', '🇱🇸'], ['Liberia', '🇱🇷'], ['Libya', '🇱🇾'], ['Liechtenstein', '🇱🇮'], ['Lithuania', '🇱🇹'], ['Luxembourg', '🇱🇺'], ['Madagascar', '🇲🇬'], ['Malawi', '🇲🇼'], ['Malaysia', '🇲🇾'], ['Maldives', '🇲🇻'], ['Mali', '🇲🇱'], ['Malta', '🇲🇹'], ['Marshall Islands', '🇲🇭'], ['Mauritania', '🇲🇷'], ['Mauritius', '🇲🇺'], ['Mexico', '🇲🇽'], ['Micronesia', '🇫🇲'], ['Moldova', '🇲🇩'], ['Monaco', '🇲🇨'], ['Mongolia', '🇲🇳'], ['Montenegro', '🇲🇪'], ['Morocco', '🇲🇦'], ['Mozambique', '🇲🇿'], ['Myanmar', '🇲🇲'], ['Namibia', '🇳🇦'], ['Nauru', '🇳🇷'], ['Nepal', '🇳🇵'], ['Netherlands', '🇳🇱'], ['New Zealand', '🇳🇿'], ['Nicaragua', '🇳🇮'], ['Niger', '🇳🇪'], ['Nigeria', '🇳🇬'], ['North Korea', '🇰🇵'], ['North Macedonia', '🇲🇰'], ['Norway', '🇳🇴'], ['Oman', '🇴🇲'], ['Pakistan', '🇵🇰'], ['Palau', '🇵🇼'], ['Palestine', '🇵🇸'], ['Panama', '🇵🇦'], ['Papua New Guinea', '🇵🇬'], ['Paraguay', '🇵🇾'], ['Peru', '🇵🇪'], ['Philippines', '🇵🇭'], ['Poland', '🇵🇱'], ['Portugal', '🇵🇹'], ['Qatar', '🇶🇦'], ['Romania', '🇷🇴'], ['Russia', '🇷🇺'], ['Rwanda', '🇷🇼'], ['Saint Kitts and Nevis', '🇰🇳'], ['Saint Lucia', '🇱🇨'], ['Saint Vincent and the Grenadines', '🇻🇨'], ['Samoa', '🇼🇸'], ['San Marino', '🇸🇲'], ['São Tomé and Príncipe', '🇸🇹'], ['Saudi Arabia', '🇸🇦'], ['Senegal', '🇸🇳'], ['Serbia', '🇷🇸'], ['Seychelles', '🇸🇨'], ['Sierra Leone', '🇸🇱'], ['Singapore', '🇸🇬'], ['Slovakia', '🇸🇰'], ['Slovenia', '🇸🇮'], ['Solomon Islands', '🇸🇧'], ['Somalia', '🇸🇴'], ['South Africa', '🇿🇦'], ['South Korea', '🇰🇷'], ['South Sudan', '🇸🇸'], ['Spain', '🇪🇸'], ['Sri Lanka', '🇱🇰'], ['Sudan', '🇸🇩'], ['Suriname', '🇸🇷'], ['Sweden', '🇸🇪'], ['Switzerland', '🇨🇭'], ['Syria', '🇸🇾'], ['Taiwan', '🇹🇼'], ['Tajikistan', '🇹🇯'], ['Tanzania', '🇹🇿'], ['Thailand', '🇹🇭'], ['Timor-Leste', '🇹🇱'], ['Togo', '🇹🇬'], ['Tonga', '🇹🇴'], ['Trinidad and Tobago', '🇹🇹'], ['Tunisia', '🇹🇳'], ['Turkey', '🇹🇷'], ['Turkmenistan', '🇹🇲'], ['Tuvalu', '🇹🇻'], ['Uganda', '🇺🇬'], ['Ukraine', '🇺🇦'], ['United Arab Emirates', '🇦🇪'], ['United Kingdom', '🇬🇧'], ['United States', '🇺🇸'], ['Uruguay', '🇺🇾'], ['Uzbekistan', '🇺🇿'], ['Vanuatu', '🇻🇺'], ['Vatican City', '🇻🇦'], ['Venezuela', '🇻🇪'], ['Vietnam', '🇻🇳'], ['Yemen', '🇾🇪'], ['Zambia', '🇿🇲'], ['Zimbabwe', '🇿🇼']
  ];

  var rules = {
    required: function (label) {
      return function (value) {
        return value && String(value).trim().length ? null : label + ' is required';
      };
    },
    minLen: function (n, label) {
      return function (value) {
        return value && value.trim().length >= n ? null : label + ' must be at least ' + n + ' characters';
      };
    },
    email: function () {
      return function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()) ? null : 'Enter a valid email address';
      };
    },
    url: function () {
      return function (value) {
        return /^https?:\/\/.+\..+/.test(String(value).trim()) ? null : 'Enter a valid URL (http/https)';
      };
    },
    range: function (min, max, label) {
      return function (value) {
        var n = Number(String(value).trim());
        if (!isFinite(n) || String(value).trim() === '') return label + ' must be a number';
        if (n < min || n > max) return label + ' must be between ' + min + ' and ' + max;
        return null;
      };
    },
    oneOf: function (list, label) {
      return function (value) {
        return list.indexOf(value) !== -1 ? null : 'Select a ' + label;
      };
    }
  };

  var schema = {
    first_name: [rules.required('First name'), rules.minLen(2, 'First name')],
    last_name: [rules.required('Last name'), rules.minLen(2, 'Last name')],
    jersey_number: [rules.required('Jersey number'), rules.range(1, 99, 'Jersey number')],
    email: [rules.required('Email'), rules.email()],
    position: [rules.oneOf(POSITIONS, 'position')],
    level: [rules.oneOf(LEVELS, 'level')],
    nationality: [rules.required('Nationality')],
    age: [rules.required('Age'), rules.range(13, 60, 'Age')],
    minutes_played: [rules.required('Minutes played'), rules.range(1, 130, 'Minutes')],
    match_result: [rules.oneOf(RESULTS, 'match result')],
    performance_goals: [rules.required('Performance goals'), rules.minLen(10, 'Performance goals')],
    video_link: [rules.required('Match video link'), rules.url()]
  };

  var stepFields = {
    1: ['first_name', 'last_name', 'jersey_number', 'email', 'position', 'level', 'nationality', 'age'],
    2: ['minutes_played', 'match_result', 'performance_goals'],
    3: ['video_link']
  };

  /* ---------- Elements ---------- */
  var savedFlag = document.getElementById('order-saved');
  var backBtn = document.getElementById('order-back');
  var nextBtn = document.getElementById('order-next');
  var submitBtn = document.getElementById('order-submit');
  var noteEl = document.getElementById('order-note');
  var stepPanels = Array.prototype.slice.call(form.querySelectorAll('.form-step'));
  var indicators = Array.prototype.slice.call(document.querySelectorAll('[data-step-indicator]'));
  var bars = Array.prototype.slice.call(document.querySelectorAll('.stepper__bar'));

  /* ---------- State ---------- */
  var state = {
    step: 1,
    touched: {},
    videoFile: '',
    gpsFile: '',
    submitting: false
  };
  var savedTimer = null;

  function fieldEl(name) {
    return form.elements[name] || null;
  }

  function values() {
    var out = {};
    ['first_name', 'last_name', 'jersey_number', 'team_name', 'email', 'position', 'level',
      'nationality', 'age', 'minutes_played', 'match_result', 'gps_platform', 'performance_goals',
      'other_notes', 'video_link', 'gps_link'].forEach(function (key) {
      var el = fieldEl(key);
      out[key] = el ? el.value : '';
    });
    return out;
  }

  /* ---------- Persistence ---------- */
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values: values(), step: state.step }));
    } catch (e) { /* private mode — autosave off */ }
  }

  function restore() {
    var stored = null;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    if (!stored) return;

    if (stored.values) {
      Object.keys(stored.values).forEach(function (key) {
        var el = fieldEl(key);
        if (el && stored.values[key] != null) el.value = stored.values[key];
      });
    }
    if (stored.step >= 1 && stored.step <= TOTAL_STEPS) state.step = stored.step;
  }

  function clearStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function flashSaved() {
    if (!savedFlag) return;
    savedFlag.classList.add('is-visible');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () {
      savedFlag.classList.remove('is-visible');
    }, 1200);
  }

  /* ---------- Validation ---------- */
  function errorFor(name) {
    var el = fieldEl(name);
    var value = el ? el.value : '';
    var checks = schema[name] || [];
    for (var i = 0; i < checks.length; i++) {
      var error = checks[i](value);
      if (error) return error;
    }
    return null;
  }

  function stepValid(step) {
    if (step === 3) return state.videoFile ? true : !errorFor('video_link');
    return stepFields[step].every(function (name) { return !errorFor(name); });
  }

  function renderError(name) {
    var el = fieldEl(name);
    if (!el) return;
    var slot = el.closest('.field');
    var errEl = slot ? slot.querySelector('.field__error') : null;
    if (!errEl) return;

    var message = state.touched[name] ? errorFor(name) : null;
    if (name === 'video_link' && state.videoFile) message = null;

    errEl.textContent = message || '';
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function renderStepErrors(step) {
    stepFields[step].forEach(renderError);
  }

  /* ---------- Step rendering ---------- */
  function renderStep() {
    stepPanels.forEach(function (panel) {
      panel.hidden = Number(panel.dataset.step) !== state.step;
    });

    indicators.forEach(function (indicator) {
      var num = Number(indicator.dataset.stepIndicator);
      var numEl = indicator.querySelector('.stepper__num');
      indicator.classList.toggle('is-current', num === state.step);
      indicator.classList.toggle('is-done', num < state.step);
      numEl.textContent = num < state.step ? '✓' : '0' + num;
    });

    bars.forEach(function (bar, i) {
      bar.classList.toggle('is-done', i + 1 < state.step);
    });

    backBtn.disabled = state.step === 1;
    nextBtn.hidden = state.step === TOTAL_STEPS;
    submitBtn.hidden = state.step !== TOTAL_STEPS;
    renderNote();
  }

  function renderNote() {
    noteEl.textContent = stepValid(state.step)
      ? 'Step ' + state.step + ' of ' + TOTAL_STEPS + ' · ready to continue'
      : 'Step ' + state.step + ' of ' + TOTAL_STEPS + ' · complete required fields';
  }

  function focusFirstInvalid(step) {
    for (var i = 0; i < stepFields[step].length; i++) {
      var name = stepFields[step][i];
      if (errorFor(name)) {
        var el = fieldEl(name);
        if (el) el.focus();
        return;
      }
    }
  }

  function goTo(step) {
    state.step = Math.min(Math.max(step, 1), TOTAL_STEPS);
    persist();
    renderStep();
  }

  /* ---------- Field events ---------- */
  form.addEventListener('input', function (event) {
    var el = event.target;
    if (!el.name) return;
    persist();
    flashSaved();
    if (state.touched[el.name]) renderError(el.name);
    renderNote();

    if (el.name === 'gps_platform') syncChips(el.value);
    if (el.name === 'performance_goals' || el.name === 'other_notes') updateCount(el);
  });

  form.addEventListener('focusout', function (event) {
    var el = event.target;
    if (!el.name || !schema[el.name]) return;
    state.touched[el.name] = true;
    renderError(el.name);
    renderNote();
  });

  /* ---------- Character counters ---------- */
  function updateCount(el) {
    var counter = form.querySelector('[data-count-for="' + el.name + '"]');
    if (counter) counter.textContent = el.value.length + ' / 400';
  }

  /* ---------- Platform chips ---------- */
  var chipsWrap = document.getElementById('platform-chips');
  var platformInput = fieldEl('gps_platform');

  function syncChips(value) {
    if (!chipsWrap) return;
    Array.prototype.forEach.call(chipsWrap.children, function (chip) {
      var active = chip.dataset.platform === value;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  if (chipsWrap && platformInput) {
    chipsWrap.addEventListener('click', function (event) {
      var chip = event.target.closest('.chip');
      if (!chip) return;
      var next = platformInput.value === chip.dataset.platform ? '' : chip.dataset.platform;
      platformInput.value = next;
      syncChips(next);
      persist();
      flashSaved();
    });
  }

  /* ---------- Dropzones ---------- */
  function setupDropzone(zoneId, inputId, stateKey, emptyTitle) {
    var zone = document.getElementById(zoneId);
    var input = document.getElementById(inputId);
    if (!zone || !input) return;

    var title = zone.querySelector('.dropzone__title');
    var sub = zone.querySelector('.dropzone__sub');

    function render() {
      var fileName = state[stateKey];
      if (fileName) {
        title.textContent = fileName;
        title.classList.add('dropzone__title--file');
        sub.innerHTML = 'attached · <span class="dropzone__remove" role="button" tabindex="0" aria-label="Remove attached file">remove</span>';
      } else {
        title.textContent = emptyTitle;
        title.classList.remove('dropzone__title--file');
        sub.textContent = 'or paste a share link below';
      }
      if (stateKey === 'videoFile') {
        renderError('video_link');
        renderNote();
      }
    }

    function setFile(file) {
      if (file) {
        state[stateKey] = file.name;
        render();
      }
    }

    zone.addEventListener('click', function (event) {
      var remove = event.target.closest('.dropzone__remove');
      if (remove) {
        event.stopPropagation();
        state[stateKey] = '';
        input.value = '';
        render();
        return;
      }
      input.click();
    });

    zone.addEventListener('keydown', function (event) {
      var remove = event.target.closest('.dropzone__remove');
      if (remove && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        state[stateKey] = '';
        input.value = '';
        render();
      }
    });

    input.addEventListener('change', function () {
      setFile(input.files && input.files[0]);
    });

    ['dragenter', 'dragover'].forEach(function (type) {
      zone.addEventListener(type, function (event) {
        event.preventDefault();
        zone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach(function (type) {
      zone.addEventListener(type, function (event) {
        event.preventDefault();
        zone.classList.remove('is-dragover');
      });
    });

    zone.addEventListener('drop', function (event) {
      setFile(event.dataTransfer.files && event.dataTransfer.files[0]);
    });
  }

  setupDropzone('video-dropzone', 'video_file', 'videoFile', 'Drop a file here or click to browse');
  setupDropzone('gps-dropzone', 'gps_file', 'gpsFile', 'Drop a file here or click to browse');

  /* ---------- Navigation ---------- */
  backBtn.addEventListener('click', function () {
    goTo(state.step - 1);
  });

  nextBtn.addEventListener('click', function () {
    if (!stepValid(state.step)) {
      stepFields[state.step].forEach(function (name) { state.touched[name] = true; });
      renderStepErrors(state.step);
      renderNote();
      focusFirstInvalid(state.step);
      return;
    }
    goTo(state.step + 1);
  });

  /* ---------- Submit ---------- */
  function buildPayload() {
    var payload = { source: 'Analysis Form' };
    var current = values();
    Object.keys(current).forEach(function (key) { payload[key] = current[key]; });
    payload.video_file_name = state.videoFile;
    payload.gps_file_name = state.gpsFile;
    payload.submitted_at = new Date().toISOString();
    return payload;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (state.submitting) return;

    if (!stepValid(TOTAL_STEPS)) {
      stepFields[TOTAL_STEPS].forEach(function (name) { state.touched[name] = true; });
      renderStepErrors(TOTAL_STEPS);
      renderNote();
      focusFirstInvalid(TOTAL_STEPS);
      return;
    }

    state.submitting = true;
    submitBtn.textContent = 'Processing…';
    submitBtn.disabled = true;

    var current = values();

    // Remember the buyer so the post-payment thank-you page can greet them.
    try {
      localStorage.setItem('mv-buyer', JSON.stringify({
        name: (current.first_name || '').trim(),
        email: current.email || ''
      }));
    } catch (e) { /* private mode */ }

    function finish() {
      // The draft autosave has served its purpose once details are captured.
      clearStorage();
      state.submitting = false;
      submitBtn.textContent = 'Proceed to checkout →';
      submitBtn.disabled = false;

      // Hand off to the checkout confirmation modal (js/modals.js). It carries
      // the buyer to Stripe; after payment Stripe returns them to thank-you.html.
      if (window.MVModals && window.MVModals.openCheckout) {
        window.MVModals.openCheckout({ product: 'review', name: (current.first_name || '').trim() });
      }
    }

    try {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload())
      }).then(finish).catch(function (error) {
        console.warn('webhook failed', error);
        finish();
      });
    } catch (e) {
      finish();
    }
  });

  /* ---------- Populate nationality dropdown ---------- */
  function populateCountries() {
    var select = form.querySelector('[data-countries]');
    if (!select) return;
    var frag = document.createDocumentFragment();
    COUNTRIES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c[0];
      opt.textContent = c[1] + '  ' + c[0];
      frag.appendChild(opt);
    });
    select.appendChild(frag);
  }

  /* ---------- Init ---------- */
  populateCountries();
  restore();
  if (platformInput) syncChips(platformInput.value);
  ['performance_goals', 'other_notes'].forEach(function (name) {
    var el = fieldEl(name);
    if (el) updateCount(el);
  });
  renderStep();

  /* ==========================================================================
     Ask a question form
     ========================================================================== */
  var askForm = document.getElementById('ask-form');
  var askSuccess = document.getElementById('ask-success');

  if (askForm && askSuccess) {
    var askError = document.getElementById('ask-error');

    askForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = askForm.elements.ask_name.value.trim();
      var email = askForm.elements.ask_email.value.trim();
      var question = askForm.elements.ask_question.value.trim();

      if (!name || !email || !question) {
        askError.textContent = 'Please fill in all fields.';
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        askError.textContent = 'Please enter a valid email.';
        return;
      }

      askError.textContent = '';

      // Fire-and-forget: reuse the same webhook with a distinct source tag.
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'FAQ Question',
            name: name,
            email: email,
            question: question,
            submitted_at: new Date().toISOString()
          })
        }).catch(function () { /* non-blocking */ });
      } catch (e) { /* non-blocking */ }

      askForm.hidden = true;
      askSuccess.hidden = false;
      askSuccess.focus();
    });

    document.getElementById('ask-reset').addEventListener('click', function () {
      askForm.reset();
      askError.textContent = '';
      askSuccess.hidden = true;
      askForm.hidden = false;
      askForm.elements.ask_name.focus();
    });
  }
})();
