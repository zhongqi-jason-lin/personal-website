# zhongqilin.org

Personal academic website for Zhongqi "Jason" Lin, PhD Candidate in Genetics, Greco Lab, Yale University.

Live at **[zhongqilin.org](https://zhongqilin.org)**.

## Stack

- **Static HTML / CSS / JS** — no build step, no framework. Single-page academic site rendered by `scripts/v8_gallery.js` against data in `scripts/data.js`.
- **Cloudflare Workers (with Static Assets)** — serves the repo contents and hosts a tiny fetch handler for visitor + CV-download tracking.
- **Cloudflare Workers KV** — per-city visit counters with 24h IP-hash dedup.
- **Cloudflare Registrar + Edge DNS** — `zhongqilin.org` is registered and DNS-managed by Cloudflare.

Typography is Apple's SF family via the system font stack (SF Pro Display, SF Pro Text, SF Mono) — no webfonts downloaded.

## Run locally

```bash
# Static preview (no Worker, no KV, no /api endpoints)
python3 -m http.server 8000
open http://localhost:8000
```

```bash
# Full-stack preview with Worker + simulated KV
npx wrangler dev
```

## Deploy

Pushing to `main` triggers a Cloudflare Workers Builds deploy automatically — no CI to configure. The git-connected Workers project is wired to this repo.

Manual deploy (useful when you want to bypass the git pipeline):

```bash
npx wrangler deploy
```

### One-time infrastructure setup (for forkers)

1. **Create a Workers KV namespace** (`Storage & Databases → KV` in the CF dashboard). Paste the returned id into `wrangler.jsonc` under `kv_namespaces`.
2. **Generate an IP-hashing salt** — required for the visitor dedup to be unguessable:
   ```bash
   openssl rand -hex 32 | npx wrangler secret put IP_SALT
   ```
3. **Connect the repo** to Workers Builds (`Workers & Pages → Create → Connect to Git`) so each push auto-deploys.
4. **Add a custom domain** under `Workers & Pages → <project> → Settings → Domains & Routes`.

## API endpoints

| Route | Purpose |
|---|---|
| `GET /api/visits` | Aggregated per-city visitor counts. Used by the map on the home page. 30 s edge cache. |
| `GET /api/cv-stats` | Total CV downloads + per-country breakdown. |

## Privacy

The visit / CV-download tracking is designed to be as data-minimal as possible:

- **No raw IP addresses are stored.** Visitor dedup uses `SHA-256(ip + IP_SALT)` truncated to 64 bits, TTL'd to 24h. After 24h the hash is unrecoverable — there's no plaintext to correlate.
- **Only city / country / lat / lon / aggregate count** is persisted per city.
- **No cookies, no fingerprinting, no third-party calls.**
- Edge geolocation (`request.cf`) is Cloudflare-native, so visitor data never leaves their network.
- Bot and Cloudflare-internal traffic is filtered before counting — see `isProbablyBot()` in `worker/index.js`.

## File structure

```
.
├── index.html              # Entry point — loads scripts in order
├── assets/
│   ├── headshot.jpg
│   └── Zhongqi-Jason-Lin-CV.pdf
├── scripts/
│   ├── data.js             # Bio, publications, education, skills
│   ├── teaser.js           # SVG teasers for each paper
│   ├── vmap.js             # World map + /api/visits client
│   └── v8_gallery.js       # Main renderer (CSS + DOM composition)
├── worker/
│   └── index.js            # Cloudflare Worker: static + /api/*
├── wrangler.jsonc          # Worker configuration
├── .assetsignore           # Files excluded from the static-asset bundle
└── LICENSE
```

## License

[MIT](LICENSE) — the site infrastructure (HTML, CSS, JS, Worker code) is free to adapt.

The personal content (bio, publications, headshot, CV) is **© Zhongqi Lin** and not covered by the MIT license; please fork the scaffolding and replace the data before reusing.
