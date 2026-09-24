# Greenance website

Marketing site for Greenance (greenance.fr), built from Claude Design
components (`.dc.html`) and deployed on Vercel from `main`.

## Structure

- `index.html`, `methodologie.html`, `faq.html`, `ressources.html` and the
  article pages: bilingual FR/EN pages rendered by the dc-runtime
- `mentions-legales.html`, `politique-confidentialite.html`: legal notice and
  privacy/cookie policy
- `support.js`: dc-runtime
- `consent.js`: cookie consent banner. Google Analytics and the Calendly
  widget only load after consent; "Gérer les cookies" in the footer reopens it
- `assets/vendor/`: self-hosted React 18.3.1 (same files and SRI hashes the
  runtime would otherwise fetch from unpkg)
- `assets/fonts/`: self-hosted Fraunces, Inter, JetBrains Mono (no request to
  Google Fonts)

## Run locally

```bash
python3 -m http.server 8099 --directory .
# then open http://localhost:8099
```

## Notes

- Language choice (FR by default) is stored in `localStorage`
  (`greenance_lang`) and shared across pages.
- Everything a page needs is served from greenance.fr. The only third-party
  requests are Google Analytics and Calendly, and both wait for consent.
- When adding a new page: include `assets/fonts/fonts.css`, the two React
  vendor scripts and `consent.js` before `support.js` in `<head>` (copy the
  head of an existing page), and keep the footer's privacy / legal notice /
  "Gérer les cookies" links.
