/*
 * Greenance language persistence, shared by every page.
 *
 * - window.__gnLang(defaultLang) returns the language a page should start
 *   in: an explicit ?lang=fr|en in the URL wins (and is remembered), then
 *   the visitor's saved choice, then the page default (French).
 * - Clicking a language toggle (#lang-fr, #lang-en, [data-setlang]) saves
 *   the choice, so it survives reloads and navigation between pages.
 */
(function () {
  'use strict';
  var KEY = 'greenance_lang';

  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }

  window.__gnLang = function (defaultLang) {
    var p = null;
    try { p = new URLSearchParams(window.location.search).get('lang'); } catch (e) {}
    if (p === 'en' || p === 'fr') { save(p); return p; }
    var s = null;
    try { s = localStorage.getItem(KEY); } catch (e) {}
    if (s === 'en' || s === 'fr') return s;
    return defaultLang === 'en' ? 'en' : 'fr';
  };

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest && e.target.closest('#lang-fr, #lang-en, [data-setlang]');
    if (!el) return;
    var l = el.id === 'lang-en' ? 'en' : el.id === 'lang-fr' ? 'fr' : el.getAttribute('data-setlang');
    if (l === 'en' || l === 'fr') save(l);
  }, true);
})();
