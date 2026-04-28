# Academic site — template

A zero-build static template for a personal academic website, wired for privacy-respecting visitor + CV-download tracking on Cloudflare Workers.

![Preview of the template deployed at zhongqilin.org](assets/preview.png?v=3)

One live example deployed from this template: **[zhongqilin.org](https://zhongqilin.org)**.

## What you get

- **Static HTML / CSS / JS** — no framework, no build step, no npm install to run the site.
- **Cloudflare Worker** (`worker/index.js`) — serves the repo as static assets, plus three endpoints:
  - `GET /api/visits` — per-city visit counts, used by the in-page world map
  - `GET /api/cv-stats` — total CV downloads and per-country breakdown
  - `POST /api/cv-download` — click-beacon fired from the CV link; the only reliable way to count CV downloads under Workers Static Assets (direct GETs for `/assets/<cv>.pdf` bypass the Worker).
- **Workers KV** storage for the counters, with 24h IP-hash dedup and bot filtering.
- **Watercolor-style visitor map** — Pacific-centered world map drawn as hand-plotted polygon outlines (including Canada, Alaska, Russia — the tricky dateline-crossing pieces), with visitor cities rendered as soft blue blooms via SVG + CSS `mix-blend-mode`. No tile-server dependency, no external map library.
- **SF-family typography** via the system font stack — no webfonts downloaded, fast first paint.
- **OKLCH per-theme accent colors** with WCAG-AA contrast verified on both paper and dark backgrounds.
- **Light/dark theme toggle** with View Transitions API crossfade, CSS-transition fallback, and **auto-follow-OS behavior** — toggling back to your OS preference *clears* the override so the site returns to auto-sync, and subsequent OS theme changes update the site live.
- **Scroll-edge bloom** — a soft accent-color oval pulses once at the top/bottom when the reader hits a scroll limit, then fades out. Re-fires on every new edge arrival.
- **Progressive-disclosure publications** — each card shows title + venue + authors by default; hover expands inline to reveal the abstract (desktop); mobile/touch shows the abstract statically so nothing's locked behind an unavailable hover gesture.
- **Hand-drawn teaser schematics** — each publication gets an iconic SVG illustration that "paints itself in" via a staggered `stroke-dashoffset` reveal. Replays on hover (desktop), fires once on scroll-into-view and replays on tap (mobile) so the animation isn't locked behind a gesture the device can't perform.
- **Current research section** — a three-card grid for the questions you're actively working on, sitting alongside Selected Works. Each card has its own SVG teaser (same `teaser.js` grammar as publications) and opens a focused modal popup on click — backdrop and Esc dismiss, body-scroll-lock with iOS-safe fixed-body workaround so the popup doesn't shift the page. Add, remove, or reorder `research[]` entries in `scripts/data.js`; the grid adapts.
- **SEO / crawler-ready** — full Open Graph + Twitter Card (with 1200×630 branded card image), `@graph` JSON-LD with a `Person` + `ScholarlyArticle` nodes (the pattern Google Scholar prefers for author↔paper linking), a `<noscript>` shadow-content block that mirrors key content for non-JS crawlers (AI indexers, link-preview bots, Bing), `robots.txt`, and `sitemap.xml`.
- **Mobile optimized** — dynamic viewport height, safe-area insets, dedicated breakpoints at ≤640 px and ≤380 px, stacked publication layout on narrow hall widths, blurb always expanded on touch. The long left-plate sections (Provenance, Talks, Toolkit) are click-to-expand disclosures at all viewports: Provenance opens by default everywhere, "Where I've shown my work" opens by default on desktop only (collapses on mobile/touch to keep the identity column tight), Toolkit defaults collapsed. Automatic hyphenation is disabled at mobile sizes so left-aligned body text wraps on whitespace rather than mid-word.

![Watercolor-style visitor map](assets/map.png?v=2)

## Quick start

```bash
# clone and serve the static layer
git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
python3 -m http.server 8000
# → http://localhost:8000
```

For the full Worker (API endpoints + local KV simulation):

```bash
npx wrangler dev
```

## Personalizing

Almost everything you'll edit lives in **`scripts/data.js`**:
- Name, role, email, social links
- `headshot: 'assets/headshot.jpg'` — drop your photo into `assets/`, update the path if the extension differs
- `cv: 'assets/your-cv.pdf'` — drop your CV at that path
- `bio`, `interests`, `research`, `pubs`, `education`, `experience`, `talks`, `skills`

Accented phrases in the bio are driven by `.replace()` calls in `scripts/v8_gallery.js` — match the strings to phrases in your `bio` text.

Then edit the identity fields in **`index.html`**:
- `<title>`, `<meta name="description">`, `<meta name="author">`, `<link rel="canonical">`
- The `og:*` and `twitter:*` meta block (title, description, image, URL, site name)
- The JSON-LD `@graph` (Person + ScholarlyArticle nodes) — keep the structure, swap names/URLs/DOIs
- The `<noscript>` shadow-content block — keep it roughly in sync with `data.js` so crawlers see the same content as rendered users

And replace the 1200×630 OG card at `assets/og-card.png` with one branded to your own name. The site works without a card — social link unfurls fall back to the favicon — but a proper card makes shared links look right.

The visitor world map (`scripts/vmap.js`) is Pacific-centered by default — change `CENTER` at the top of the file to re-project around any other meridian.

## Deploying to Cloudflare

1. Push your fork to GitHub.
2. **Create a KV namespace** in the Cloudflare dashboard (`Storage & Databases → KV → Create`). Paste the namespace id into `wrangler.jsonc` under `kv_namespaces[0].id`, replacing `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.
3. **Connect your GitHub repo to Workers Builds** (`Workers & Pages → Create → Connect to Git`). It'll run `npx wrangler deploy` on every push to `main`.
4. **Set the `IP_SALT` secret** — used to hash visitor IPs so dedup is unguessable:
   ```bash
   openssl rand -hex 32 | npx wrangler secret put IP_SALT
   ```
5. (Optional) **Add a custom domain** in `Workers & Pages → <project> → Settings → Domains & Routes`. Cloudflare auto-inserts DNS if the domain's zone is on Cloudflare DNS. If you'll serve from both apex and `www` (e.g. `example.com` and `www.example.com`), set `APEX_HOST` at the top of `worker/index.js` to your apex domain (no scheme, no `www`) — the Worker 301-redirects the `www` host to the apex so Search Console doesn't flag the duplicate as "Alternate page with proper canonical tag." Leave the constant empty/null to skip the redirect.
6. **Register the site in Google Search Console** at <https://search.google.com/search-console>. Uncomment the `<meta name="google-site-verification">` tag in `index.html` and paste in the token, then submit `sitemap.xml`.

## Privacy posture

The visit / CV tracking is designed to be data-minimal:
- **No raw IPs stored.** Dedup uses `SHA-256(ip + IP_SALT)` truncated to 64 bits, TTL'd to 24 h. After that window the hash is unrecoverable — there's no plaintext to correlate.
- **Only `{city, country, lat, lon, count}`** is persisted per city. No user agents, no cookies, no fingerprinting, no third-party calls.
- Edge geolocation (`request.cf`) is native to Cloudflare — visitor data never leaves their network.
- Bot / verified-bot / Cloudflare-internal warmup traffic is filtered pre-log — see `isProbablyBot()` in `worker/index.js`. iCloud Private Relay users are admitted past the Cloudflare-AS bot gate by checking for a recognizable device-OS string in the UA.

## File structure

```
.
├── index.html              # Entry point — loads scripts/*.js in order
├── robots.txt              # Crawler policy + sitemap reference
├── sitemap.xml             # Single-URL sitemap (update <loc> for your domain)
├── assets/
│   ├── headshot.svg        # Placeholder silhouette — replace
│   ├── og-card.png         # 1200×630 social-preview card — replace with your own
│   └── your-cv.pdf         # Not committed — drop yours here
├── scripts/
│   ├── data.js             # ALL your content lives here
│   ├── teaser.js           # SVG teasers for each publication and research card
│   ├── vmap.js             # World map + /api/visits client
│   └── v8_gallery.js       # Main renderer (CSS + DOM)
├── worker/
│   └── index.js            # Cloudflare Worker — static + /api/*
├── wrangler.jsonc          # Worker config (KV binding, assets dir)
├── .assetsignore           # Files excluded from the static-asset bundle
└── LICENSE                 # MIT
```

## License

[MIT](LICENSE) 
