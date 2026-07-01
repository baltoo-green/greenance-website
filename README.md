# Greenance website

Marketing/landing site for Greenance, implemented from the Claude Design
component `Greenance.dc.html`.

## Structure

- `index.html` — the page (unpacked from the design bundle)
- `assets/` — JS runtime (`dc-runtime`), Fraunces/Inter fonts (woff2), images
- `Greenance.source-bundle.html` — original single-file Claude Design export, kept for reference

## Run locally

```bash
python3 -m http.server 8099 --directory .
# then open http://localhost:8099
```

## Notes

- The `dc-runtime` loads React (UMD) from the unpkg CDN at runtime, and the
  page embeds a Calendly widget — so an internet connection is required to
  render. This is inherent to how the design was built.
- The page is bilingual (FR/EN) with a language toggle in the nav.
