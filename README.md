# MATCHVISION  — Landing Page

Production-ready, fully responsive landing page for MATCHVISION football
performance analysis (Complete Performance Review · GPS Football Data
Blueprint). Built with plain HTML, CSS and JavaScript — no frameworks, no
build step, no external requests except the form webhook.

## Project structure

```text
├── index.html              Complete landing page (deploy this)
│
├── assets/
│   ├── images/             Optimized WebP images + OG image
│   ├── icons/              Favicons (SVG + PNG)
│   ├── fonts/              Self-hosted Sora variable font (woff2, 400–700)
│   └── videos/             (empty — reserved)
│
├── css/
│   ├── variables.css       Design tokens (colors, type, radii, shadows)
│   ├── style.css           Base styles + all section layouts
│   ├── animations.css      Scroll-reveal, fades, reduced-motion rules
│   └── responsive.css      Breakpoints: 1024 / 900 / 820 / 720 / 400 px
│
├── js/
│   ├── main.js             Mobile nav, FAQ accordion, footer year
│   ├── forms.js            3-step order form + "Ask a question" form
│   ├── animations.js       IntersectionObserver scroll-reveal
│   └── lazyload.js         Lazy-image fade-in + data-src upgrade path
│
├── components/             Reference partials of each section
│   ├── navbar.html
│   ├── hero.html           (includes the club/certification trust bar)
│   ├── pricing.html
│   ├── about.html          ("What is MATCHVISION" + "Who we are")
│   ├── review-band.html
│   ├── order-form.html
│   ├── faq.html            (includes the "Ask a question" card)
│   └── footer.html
│
├── robots.txt
├── sitemap.xml
└── README.md
```

`index.html` is fully self-contained (static HTML, no client-side includes),
so it works from any static host and stays SEO-friendly. The `components/`
folder mirrors each section for reuse in a future templating/SSG setup —
**index.html is the source of truth**; each section sits between
`<!-- component:name -->` markers so the partials are easy to re-sync.

> Note: the design has no testimonials section, so there is no
> `testimonials.html`. Add one later by following the same marker pattern.

## Deployment

Upload the repository contents (everything except `components/`, which is
optional) to any static host. Before going live:

1. **Domain** — search & replace `https://matchvision.cz/` in `index.html`,
   `robots.txt` and `sitemap.xml` if you deploy under a different domain.
2. **Form endpoint** — the order form and FAQ question form POST JSON to the
   `WEBHOOK_URL` constant at the top of `js/forms.js` (currently a
   Make.com hook). Payload fields are listed in `buildPayload()`.
3. **Missing images** — replace the striped placeholders when assets exist:
   - `assets/images/team-portrait.webp` — "Who we are" portrait (~1100×1300)
   - `assets/images/report-page-1.webp` — report page screenshot (~800×640)
   - `assets/images/report-heatmap.webp` — heatmap page (~800×640)
   - `assets/images/report-advice.webp` — advice section (~1640×360)

## Features

- **Design fidelity** — 1:1 implementation of the approved mockup (hero,
  trust bar with tooltips, pricing cards, about/team sections, navy report
  band, 3-step order form, FAQ, footer).
- **Performance** — self-hosted subset variable font with preload,
  WebP images with `srcset` + native lazy loading, deferred JS, zero
  render-blocking third-party requests, tiny inline SVG icon sprite.
- **Order form** — per-field validation (mirrors the schema in
  `js/forms.js`), autosave to `localStorage` with a "Saved" flash, platform
  quick-pick chips, drag-and-drop file zones, success timeline panel.
- **Accessibility** — semantic landmarks and heading order, skip link,
  labelled fields with `aria-live` error slots, keyboard-operable accordion,
  tooltips and dropzones, `aria-expanded` state, `prefers-reduced-motion`
  support, visible focus styles.
- **SEO** — meta description, canonical, Open Graph + Twitter cards,
  JSON-LD (`Organization`, two `Product` offers, `FAQPage`), `robots.txt`,
  `sitemap.xml`, semantic H1–H3 hierarchy.

## Browser support

Evergreen Chrome, Edge, Firefox and Safari (iOS included). No IE support.
