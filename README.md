# Greenance website

Marketing site for Greenance (greenance.fr), built from Claude Design
components (`.dc.html`) and deployed on Vercel from `main`.

## Structure

- `index.html`, `solution.html`, `a-propos.html`, `methodologie.html`,
  `faq.html`, `ressources.html`, `glossaire.html` and the article pages
  (`reglementation-bce-2026.html`, `tnfd-leap.html`, `encore.html`):
  bilingual FR/EN pages rendered by the dc-runtime
- `mentions-legales.html`, `politique-confidentialite.html`: legal notice and
  privacy/cookie policy (generated from the glossary page layout)
- `support.js`: dc-runtime
- `lang.js`: language persistence shared by every page (`?lang=` > saved
  choice > French)
- `consent.js`: cookie consent banner. Google Analytics and Calendly only
  load after consent; "Gérer les cookies" in the footer reopens it; without
  consent, "Réserver une démo" buttons open a dialog instead of Calendly
- `assets/vendor/`: self-hosted React 18.3.1 (same files and SRI hashes the
  runtime would otherwise fetch from unpkg)
- `assets/fonts/`: self-hosted Plus Jakarta Sans, Inter and Merriweather 900
  (no request to Google Fonts)
- `assets/greenance-platform-shot.webp`: platform screenshot on the homepage

## Run locally

```bash
python3 -m http.server 8099 --directory .
# then open http://localhost:8099
```

## Importing a new design export

The design export is the source for visuals and texts; everything below
belongs to the site and must be re-applied on top of it:

- `<head>`: SEO title (45-60 chars), meta description (150-160 chars),
  canonical, JSON-LD, then `assets/fonts/fonts.css`, the two React vendor
  scripts, `lang.js`, `consent.js`, `support.js` and Vercel Analytics
- remove from `<helmet>`: title/description/canonical (they live in
  `<head>`), Google Fonts links, Calendly widget script/CSS
- `__gnBrand` must not load Merriweather from Google (it is in fonts.css)
- `.dc.html` links rewritten to `.html`
- footer: privacy policy link, "Mentions légales", "Gérer les cookies"
- each page's initial language via `window.__gnLang(this.props.defaultLang)`;
  JS `pageTitle` (FR) identical to the `<head>` title
- homepage Calendly placeholder with the consent button
- articles: LinkedIn bylines, clickable sources (`sources` uses innerHTML),
  "Voir aussi" links
- FAQ: static Q&A cards in `#accordion` (crawlable without JS), FAQPage
  JSON-LD matching the visible answers
- empty `data-i18n` elements filled with the French text (crawlable content)
