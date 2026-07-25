# MATCHVISION — Landing Page

Production-ready, fully responsive marketing site for MATCHVISION football
performance analysis. Built with plain HTML, CSS and JavaScript — no
frameworks, no build step, no external requests except the form webhook.

The site is a lightweight **single-page app with three in-place "pages"**
plus a separate legal page:

- **Home** — hero, trust bar, two product cards, "What is MATCHVISION?",
  "Who we are", FAQ + "Ask a question".
- **The Pro Match Report** (`#pro-report`) — €129 offer page: offer box,
  problem agitation, value stack (€545 → €129), reason-why, "inside the
  review", how-it-works, guarantee, and the 3-step submission form.
- **GPS Football Data Blueprint** (`#blueprint`) — €19 launch offer page:
  offer box, agitation, outcomes, value stack (€196 → €19), reason-why,
  guarantee, final CTA.
- **Legal** (`legal.html`) — Privacy Policy / Terms & Conditions / Disclaimer
  as tabbed documents.
- **Thank you** (`thank-you.html`) — post-payment confirmation page. Set this
  as Stripe's `success_url` for the Pro Match Report; it greets the buyer by
  name and lays out what happens next.

Every "buy / checkout" button opens a small confirmation modal ("you'll be
sent to secure checkout → after payment you're redirected…"), and the Home
page shows a Hormozi-style limited-offer promo with a live countdown to the
Blueprint launch deadline.

Pages are swapped client-side by `js/main.js` (no reload) and are also
deep-linkable via the URL hash (`#pro-report`, `#blueprint`, `#whatis`,
`#faq`). With JavaScript disabled the Home page renders as static content.

## Project structure

```text
├── index.html              Home + Pro Match Report + Blueprint (deploy this)
├── legal.html              Privacy / Terms / Disclaimer
├── thank-you.html          Post-payment confirmation (Stripe success URL)
│
├── assets/
│   ├── images/             Optimized WebP images + OG image
│   ├── icons/              Favicons (SVG + PNG)
│   ├── fonts/              Self-hosted Sora variable font (woff2, 400–700)
│   └── videos/             (empty — reserved)
│
├── css/
│   ├── variables.css       Design tokens (colors, type, radii, shadows)
│   ├── style.css           Base styles + all section/offer/legal layouts
│   ├── animations.css      Scroll-reveal, fades, reduced-motion rules
│   └── responsive.css      Breakpoints: 1024 / 960 / 900 / 820 / 720 / 520 / 400 px
│
├── js/
│   ├── main.js             Page router, mobile nav, FAQ accordion, CTAs, year
│   ├── forms.js            3-step order form + "Ask a question" form
│   ├── animations.js       IntersectionObserver scroll-reveal
│   ├── lazyload.js         Lazy-image fade-in + data-src upgrade path
│   ├── modals.js           Checkout confirmation modal + promo countdown
│   ├── thankyou.js         Personalises thank-you.html from URL / localStorage
│   └── legal.js            Legal page tab switcher
│
├── components/             Reference partials of each section
│
├── robots.txt
├── sitemap.xml
└── README.md
```

`index.html` and `legal.html` are fully self-contained (static HTML, no
client-side includes), so they work from any static host and stay
SEO-friendly. The `components/` folder mirrors each section for reuse in a
future templating/SSG setup — **index.html is the source of truth**; each
section sits between `<!-- component:name -->` markers.

## Configuration

All runtime config lives in `window.MV_CONFIG` at the top of `js/main.js`
(shared with `js/forms.js` and `js/modals.js`):

- `checkout.review` — Stripe checkout URL for The Pro Match Report (€129).
  Set that Stripe session's `success_url` to **`thank-you.html`**.
- `checkout.blueprint` — Stripe checkout URL for the GPS Blueprint (€19).
  Set that Stripe session's `success_url` to your **PDF download link**.
  While a checkout URL is empty, the confirmation modal captures the buyer
  and tells them the secure link is on its way (no dead ends).
- `spotsLeft` — monthly Pro Match Report capacity, injected into every
  `[data-spots]` element (ribbon, badges, reason-why note).
- `saleEnd` — Blueprint launch-offer deadline for the promo countdown
  (default `2026-08-10T23:59:59`, local time). Past it, the promo shows an
  "offer ended" state and stops the timer.

The promo appears once per browser session on the Home page
(`sessionStorage` key `mv-promo-seen`). The buyer's name/email are saved to
`localStorage` (`mv-buyer`) when the form is sent, so `thank-you.html` can
greet them after payment (it also accepts `?name=` / `?email=` query params).

## Deployment

Upload the repository contents (everything except `components/`, which is
optional) to any static host. Before going live:

1. **Domain** — search & replace `https://matchvision.cz/` in `index.html`,
   `legal.html`, `thank-you.html`, `robots.txt` and `sitemap.xml` if you
   deploy elsewhere.
2. **Form endpoint** — the order form and FAQ question form POST JSON to the
   `WEBHOOK_URL` constant at the top of `js/forms.js` (currently a Make.com
   hook). Payload fields are listed in `buildPayload()`.
3. **Checkout** — set `MV_CONFIG.checkout.review` / `.blueprint` in
   `js/main.js` to your Stripe URLs, and point their Stripe `success_url`s at
   `thank-you.html` (report) and your PDF link (Blueprint).
4. **Missing images** — replace the striped placeholders when assets exist:
   - `assets/images/team-portrait.webp` — "Who we are" portrait (~1100×1300)
   - `assets/images/report-page-1.webp` — report page screenshot (~800×640)
   - `assets/images/report-heatmap.webp` — heatmap page (~800×640)
   - `assets/images/report-advice.webp` — advice section (~1640×360)

## Features

- **Design fidelity** — recreation of the approved MATCHVISION design system:
  navy/cream palette, Sora typography, offer-page components, gradients,
  ribbons and custom 24px line-icon sprite.
- **Client-side router** — three pages swapped without reload, hash
  deep-links, back/forward support, focus moved to the new heading for screen
  readers, and a no-JS fallback that shows the Home page.
- **Performance** — self-hosted subset variable font with preload, WebP images
  with `srcset` + native lazy loading, deferred JS, zero render-blocking
  third-party requests, tiny inline SVG icon sprite.
- **Order form** — per-field validation (incl. nationality), autosave to
  `localStorage` with a "Saved" flash, platform quick-pick chips,
  drag-and-drop file zones, success timeline panel, "Proceed to checkout".
- **Accessibility** — semantic landmarks and heading order, skip link,
  labelled fields with `aria-live` error slots, keyboard-operable accordion
  and legal tabs, `aria-current` nav state, `prefers-reduced-motion` support,
  visible focus styles.
- **SEO** — meta description, canonical, Open Graph + Twitter cards, JSON-LD
  (`Organization`, two `Product` offers, `FAQPage`), per-page `document.title`,
  `robots.txt`, `sitemap.xml`, semantic H1–H3 hierarchy.

## Browser support

Evergreen Chrome, Edge, Firefox and Safari (iOS included). No IE support.
