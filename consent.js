/*
 * Greenance cookie consent (CNIL-compliant, no third-party CMP).
 *
 * - Nothing that needs consent loads before the visitor chooses:
 *   Google Analytics (audience measurement) and Calendly (booking widget).
 * - "Tout refuser" is exactly as prominent as "Tout accepter".
 * - The choice is kept 6 months, then asked again.
 * - Any element with [data-cookie-settings] reopens the panel, so consent
 *   can be withdrawn as easily as it was given.
 * - Vercel Web Analytics is cookieless and needs no consent; it stays as is.
 */
(function () {
  'use strict';

  var GA_ID = 'G-EJHH77CB2L';
  var STORE_KEY = 'greenance_consent';
  var VERSION = 1;
  var MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;        // ~6 months (CNIL recommendation)
  var GA_COOKIE_SECONDS = 395 * 24 * 60 * 60;         // 13 months max (CNIL)
  var CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
  var CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';

  var TEXT = {
    fr: {
      title: 'Vos préférences de cookies',
      body: 'Nous utilisons des cookies de mesure d’audience (Google Analytics) et un module de prise de rendez-vous (Calendly) uniquement avec votre accord. Vous pouvez changer d’avis à tout moment via « Gérer les cookies » en bas de page.',
      more: 'En savoir plus',
      reject: 'Tout refuser',
      accept: 'Tout accepter',
      customize: 'Personnaliser',
      save: 'Enregistrer mes choix',
      analyticsLabel: 'Mesure d’audience',
      analyticsDesc: 'Google Analytics : statistiques de visite (pages vues, source, appareil).',
      calendlyLabel: 'Prise de rendez-vous',
      calendlyDesc: 'Calendly : affiche le calendrier de réservation d’une démo.',
      necessaryLabel: 'Strictement nécessaires',
      necessaryDesc: 'Mémorisation de vos choix de cookies et de langue. Toujours actifs.',
      on: 'Activé', off: 'Désactivé',
      showCookies: 'Voir les cookies',
      vercelNote: 'Les statistiques de fréquentation Vercel n’utilisent aucun cookie.',
      cookies: {
        necessary: [
          ['greenance_consent', 'Mémorise vos choix de cookies', '6 mois'],
          ['greenance_lang', 'Mémorise la langue choisie', 'Jusqu’à suppression dans votre navigateur']
        ],
        analytics: [
          ['_ga', 'Distingue les visiteurs (Google Analytics)', '13 mois'],
          ['_ga_EJHH77CB2L', 'Conserve l’état de la visite (Google Analytics)', '13 mois']
        ],
        calendly: [
          ['Cookies Calendly', 'Fonctionnement du calendrier de réservation', 'Selon la politique de Calendly']
        ]
      }
    },
    en: {
      title: 'Your cookie preferences',
      body: 'We use audience measurement cookies (Google Analytics) and a booking widget (Calendly) only with your consent. You can change your mind at any time via “Manage cookies” at the bottom of the page.',
      more: 'Learn more',
      reject: 'Reject all',
      accept: 'Accept all',
      customize: 'Customize',
      save: 'Save my choices',
      analyticsLabel: 'Audience measurement',
      analyticsDesc: 'Google Analytics: visit statistics (pages viewed, source, device).',
      calendlyLabel: 'Meeting booking',
      calendlyDesc: 'Calendly: shows the demo booking calendar.',
      necessaryLabel: 'Strictly necessary',
      necessaryDesc: 'Remembers your cookie and language choices. Always on.',
      on: 'On', off: 'Off',
      showCookies: 'Show cookies',
      vercelNote: 'Vercel visit statistics do not use any cookie.',
      cookies: {
        necessary: [
          ['greenance_consent', 'Remembers your cookie choices', '6 months'],
          ['greenance_lang', 'Remembers the language you chose', 'Until you clear it in your browser']
        ],
        analytics: [
          ['_ga', 'Distinguishes visitors (Google Analytics)', '13 months'],
          ['_ga_EJHH77CB2L', 'Keeps the visit state (Google Analytics)', '13 months']
        ],
        calendly: [
          ['Calendly cookies', 'Booking calendar operation', 'Per Calendly’s policy']
        ]
      }
    }
  };

  // ---------- storage ----------
  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!c || c.v !== VERSION || typeof c.ts !== 'number') return null;
      if (Date.now() - c.ts > MAX_AGE_MS) return null;       // expired: ask again
      return c;
    } catch (e) { return null; }
  }
  function write(analytics, calendly) {
    var c = { v: VERSION, analytics: !!analytics, calendly: !!calendly, ts: Date.now() };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }
  function lang() {
    var l = null;
    try { l = localStorage.getItem('greenance_lang'); } catch (e) {}
    if (l !== 'en' && l !== 'fr') {
      var p = new URLSearchParams(window.location.search).get('lang');
      l = (p === 'en') ? 'en' : 'fr';
    }
    return l;
  }

  // ---------- loaders ----------
  var gaLoaded = false, calendlyLoaded = false;

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { cookie_expires: GA_COOKIE_SECONDS });
  }

  function clearGACookies() {
    window['ga-disable-' + GA_ID] = true;
    var names = ['_ga', '_ga_' + GA_ID.replace(/^G-/, ''), '_gid', '_gat'];
    var host = window.location.hostname;
    var domains = ['', host, '.' + host];
    var parts = host.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    names.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function loadCalendly() {
    if (calendlyLoaded) return;
    calendlyLoaded = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = CALENDLY_CSS;
    document.head.appendChild(l);
    var s = document.createElement('script');
    s.async = true;
    s.src = CALENDLY_JS;
    document.head.appendChild(s);
    // The homepage already polls for window.Calendly and mounts the inline
    // widget as soon as the script is available.
  }

  function apply(c) {
    if (c.analytics) loadGA(); else clearGACookies();
    if (c.calendly) loadCalendly();
  }

  // ---------- banner UI ----------
  var root = null, customizing = false;

  function css() {
    if (document.getElementById('gc-style')) return;
    var st = document.createElement('style');
    st.id = 'gc-style';
    st.textContent = [
      '#gc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;display:flex;justify-content:center;pointer-events:none;}',
      '#gc-banner .gc-card{pointer-events:auto;width:100%;max-width:720px;max-height:calc(100vh - 32px);overflow-y:auto;background:#fff;color:#1A1A1A;border:1px solid #E5E7EB;border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,0.16);padding:22px 24px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:14.5px;line-height:1.55;}',
      '#gc-banner .gc-opt-text{min-width:0;flex:1;}',
      '#gc-banner .gc-details{margin-top:6px;}',
      '#gc-banner .gc-details summary{cursor:pointer;font-size:13px;font-weight:600;color:#41805A;list-style-position:inside;}',
      '#gc-banner .gc-details ul{list-style:none;margin:8px 0 0;padding:0;border:1px solid #ECECEC;border-radius:10px;overflow:hidden;}',
      '#gc-banner .gc-details li{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1fr);gap:10px;padding:8px 10px;border-top:1px solid #F0F0F0;font-size:12.5px;color:#4B5563;align-items:start;}',
      '#gc-banner .gc-details li:first-child{border-top:0;}',
      '#gc-banner .gc-details code{font-family:"JetBrains Mono",monospace;font-size:12px;color:#1A1A1A;word-break:break-all;}',
      '#gc-banner .gc-details em{font-style:normal;}',
      '#gc-banner .gc-details small{font-size:12.5px;color:#6B7280;}',
      '#gc-banner .gc-note{margin:10px 0 0;font-size:12.5px;color:#6B7280;}',
      '@media(max-width:560px){#gc-banner .gc-details li{grid-template-columns:1fr;gap:2px;}}',
      '#gc-banner h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:19px;margin:0 0 8px;color:#1A1A1A;}',
      '#gc-banner p{margin:0 0 16px;color:#4B5563;}',
      '#gc-banner a{color:#41805A;font-weight:600;}',
      '#gc-banner .gc-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}',
      '#gc-banner .gc-btn{appearance:none;border:0;cursor:pointer;font:inherit;font-weight:600;font-size:14.5px;padding:11px 18px;border-radius:10px;min-width:150px;}',
      '#gc-banner .gc-main{background:#5A9E6F;color:#fff;}',
      '#gc-banner .gc-main:hover{background:#41805A;}',
      '#gc-banner .gc-link{background:transparent;color:#1A1A1A;text-decoration:underline;min-width:0;padding:11px 8px;}',
      '#gc-banner .gc-opt{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:12px 0;border-top:1px solid #F0F0F0;}',
      '#gc-banner .gc-opt:first-of-type{border-top:0;}',
      '#gc-banner .gc-opt strong{display:block;font-size:14.5px;}',
      '#gc-banner .gc-opt span{display:block;font-size:13px;color:#6B7280;}',
      '#gc-banner .gc-opts{margin:0 0 14px;}',
      '#gc-banner .gc-switch{flex:none;display:flex;align-items:center;gap:8px;font-size:13px;color:#4B5563;cursor:pointer;}',
      '#gc-banner .gc-switch input{width:18px;height:18px;accent-color:#5A9E6F;cursor:pointer;}',
      '#gc-banner .gc-btn:focus-visible,#gc-banner .gc-switch input:focus-visible{outline:2px solid #1A1A1A;outline-offset:2px;}',
      '@media(max-width:560px){#gc-banner{left:10px;right:10px;bottom:10px;}#gc-banner .gc-card{padding:18px;}#gc-banner .gc-btn{flex:1 1 100%;}#gc-banner .gc-link{flex:1 1 100%;}}'
    ].join('');
    document.head.appendChild(st);
  }

  // One category row: label, description, toggle, and a collapsible list of
  // the cookies it covers (name, purpose, duration).
  function option(t, key, label, desc, toggle) {
    var list = t.cookies[key] || [];
    var rows = list.map(function (c) {
      return '<li><code>' + c[0] + '</code><em>' + c[1] + '</em><small>' + c[2] + '</small></li>';
    }).join('');
    return '<div class="gc-opt"><div class="gc-opt-text"><strong>' + label + '</strong><span>' + desc + '</span>' +
      '<details class="gc-details"><summary>' + t.showCookies + ' (' + list.length + ')</summary><ul>' + rows + '</ul></details>' +
      '</div>' + toggle + '</div>';
  }

  function render() {
    if (!root) return;
    var l = lang();
    var t = TEXT[l];
    var cur = read() || { analytics: false, calendly: false };
    var html = '<div class="gc-card" role="dialog" aria-modal="false" aria-labelledby="gc-title">' +
      '<h2 id="gc-title">' + t.title + '</h2>' +
      '<p>' + t.body + ' <a href="politique-confidentialite.html#' + (l === 'en' ? 'cookies-en' : 'cookies') + '">' + t.more + '</a></p>';
    if (customizing) {
      html += '<div class="gc-opts">' +
        option(t, 'necessary', t.necessaryLabel, t.necessaryDesc,
          '<label class="gc-switch"><input type="checkbox" checked disabled> ' + t.on + '</label>') +
        option(t, 'analytics', t.analyticsLabel, t.analyticsDesc,
          '<label class="gc-switch"><input type="checkbox" id="gc-analytics"' + (cur.analytics ? ' checked' : '') + '> <span class="gc-state" data-for="gc-analytics">' + (cur.analytics ? t.on : t.off) + '</span></label>') +
        option(t, 'calendly', t.calendlyLabel, t.calendlyDesc,
          '<label class="gc-switch"><input type="checkbox" id="gc-calendly"' + (cur.calendly ? ' checked' : '') + '> <span class="gc-state" data-for="gc-calendly">' + (cur.calendly ? t.on : t.off) + '</span></label>') +
        '<p class="gc-note">' + t.vercelNote + '</p>' +
        '</div>' +
        '<div class="gc-row">' +
          '<button type="button" class="gc-btn gc-main" data-gc="reject">' + t.reject + '</button>' +
          '<button type="button" class="gc-btn gc-main" data-gc="save">' + t.save + '</button>' +
          '<button type="button" class="gc-btn gc-main" data-gc="accept">' + t.accept + '</button>' +
        '</div>';
    } else {
      html += '<div class="gc-row">' +
          '<button type="button" class="gc-btn gc-main" data-gc="reject">' + t.reject + '</button>' +
          '<button type="button" class="gc-btn gc-main" data-gc="accept">' + t.accept + '</button>' +
          '<button type="button" class="gc-btn gc-link" data-gc="customize">' + t.customize + '</button>' +
        '</div>';
    }
    html += '</div>';
    root.innerHTML = html;
  }

  function open(custom) {
    customizing = !!custom;
    if (!document.body) return;
    css();
    if (!root) {
      root = document.createElement('div');
      root.id = 'gc-banner';
      document.body.appendChild(root);
    }
    render();
  }

  function close() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  function decide(analytics, calendly) {
    var before = read();
    var c = write(analytics, calendly);
    close();
    // Withdrawing a consent that was active: reload so no consented script
    // keeps running in this page.
    if (before && ((before.analytics && !c.analytics) || (before.calendly && !c.calendly))) {
      clearGACookies();
      window.location.reload();
      return;
    }
    apply(c);
  }

  // ---------- events (delegated: the page is rendered by React after load) ----------
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || !el.closest) return;

    var settings = el.closest('[data-cookie-settings]');
    if (settings) { e.preventDefault(); open(true); return; }

    var cal = el.closest('[data-consent-calendly]');
    if (cal) {
      e.preventDefault();
      var cur = read() || { analytics: false };
      decide(!!cur.analytics, true);
      return;
    }

    var btn = el.closest('#gc-banner [data-gc]');
    if (btn) {
      var a = btn.getAttribute('data-gc');
      if (a === 'accept') decide(true, true);
      else if (a === 'reject') decide(false, false);
      else if (a === 'customize') { customizing = true; render(); }
      else if (a === 'save') {
        var ga = document.getElementById('gc-analytics');
        var ca = document.getElementById('gc-calendly');
        decide(!!(ga && ga.checked), !!(ca && ca.checked));
      }
      return;
    }

    // Site language toggles: re-render the banner in the new language.
    if (el.closest('#lang-fr, #lang-en, [data-setlang]')) setTimeout(render, 0);
  });

  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el || !el.id || (el.id !== 'gc-analytics' && el.id !== 'gc-calendly')) return;
    var t = TEXT[lang()];
    var s = root && root.querySelector('.gc-state[data-for="' + el.id + '"]');
    if (s) s.textContent = el.checked ? t.on : t.off;
  });

  // ---------- boot ----------
  var existing = read();
  if (existing) {
    apply(existing);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { open(false); });
  } else {
    open(false);
  }

  window.GreenanceConsent = { open: function () { open(true); }, get: read };
})();
