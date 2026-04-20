// Serves static assets and tracks per-city visitor counts using Cloudflare's
// edge geolocation (`request.cf`) and Workers KV.
//
// Privacy:
//   - No raw IPs stored. Visitor dedup uses SHA-256(ip + daily-salt) truncated
//     to 64 bits, TTL'd to 24h. After 24h the hash is unrecoverable even with
//     access to KV — there's no plaintext to correlate.
//   - Only city / country / lat / lon / aggregate count is persisted per city.
//   - No cookies, no fingerprinting, no third-party calls.

const DEDUP_TTL_SECONDS = 24 * 60 * 60;       // count one visit per IP per 24h
const MAX_CITIES = 500;                        // safety cap on the index
const INDEX_KEY = '__index';
const CV_TOTAL_KEY = 'cv:total';
const CV_COUNTRIES_KEY = 'cv:countries';

async function ipHash(ip, salt) {
  const data = new TextEncoder().encode(ip + '|' + salt);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 8)                               // 64 bits is plenty for dedup
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function cityKeyFor(country, city) {
  return 'city:' + country + ':' + city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// Filter out non-human traffic so bot/edge-warmup pings don't inflate city counts.
// Keeping this conservative: if any signal screams "not a browser tab," skip the log.
function isProbablyBot(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua || !ua.includes('mozilla')) return true;
  if (/bot|crawl|spider|slurp|monitor|probe|health|uptime|pingdom|datadog|newrelic|uptimerobot|curl|wget|python-requests|go-http|axios|node-fetch|headlesschrome|phantomjs|puppeteer|playwright|preview|fetch-as/.test(ua)) return true;
  const cf = request.cf;
  if (cf?.botManagement?.verifiedBot) return true;
  // When the request egresses Cloudflare's own ASN, it could be either:
  //   (a) a CF internal edge-warmup probe — generic UA, no real device fingerprint
  //   (b) an iCloud Private Relay user — standard Safari/Chrome UA with iPhone/iPad/Macintosh
  // Admit (b), drop (a) by requiring a recognizable device-OS string in the UA.
  if (cf?.asOrganization && /cloudflare/i.test(cf.asOrganization)) {
    if (!/iphone|ipad|macintosh|android|windows|linux|cros/.test(ua)) return true;
  }
  return false;
}

async function logVisit(env, request) {
  if (isProbablyBot(request)) return;
  const cf = request.cf;
  if (!cf) return;
  const lat = cf.latitude != null ? parseFloat(cf.latitude) : null;
  const lon = cf.longitude != null ? parseFloat(cf.longitude) : null;
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) return;

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!ip) return;
  const salt = env.IP_SALT || 'default-salt-please-rotate';
  const seenKey = 'seen:' + (await ipHash(ip, salt));

  // Dedup: same IP within 24h → don't double-count.
  const seen = await env.VISITS.get(seenKey);
  if (seen) return;
  await env.VISITS.put(seenKey, '1', { expirationTtl: DEDUP_TTL_SECONDS });

  const city = (cf.city || 'Unknown').trim();
  const country = (cf.country || 'XX').trim();
  const region = (cf.region || '').trim();
  const key = cityKeyFor(country, city);

  const existing = await env.VISITS.get(key, { type: 'json' });
  const now = new Date().toISOString();
  const record = existing || { city, country, region, lat, lon, count: 0, first_seen: now };
  record.count += 1;
  record.last_seen = now;
  // Keep lat/lon fresh in case CF's geodata for a city drifts.
  record.lat = lat;
  record.lon = lon;
  await env.VISITS.put(key, JSON.stringify(record));

  // Per-day counter for the 30-day trend chart. Each counter key is a full UTC
  // date (stats:day:YYYY-MM-DD) and TTL's to 60 days so we never accumulate
  // unbounded history. The dedup above ensures each counter tracks unique
  // visitors per day, matching the semantics of the city counters.
  const today = now.slice(0, 10);                          // "YYYY-MM-DD"
  const dayKey = 'stats:day:' + today;
  const prior = parseInt((await env.VISITS.get(dayKey)) || '0', 10);
  await env.VISITS.put(dayKey, String(prior + 1), { expirationTtl: 60 * 24 * 60 * 60 });

  if (!existing) {
    const index = (await env.VISITS.get(INDEX_KEY, { type: 'json' })) || [];
    if (!index.includes(key)) {
      index.push(key);
      if (index.length > MAX_CITIES) index.shift();
      await env.VISITS.put(INDEX_KEY, JSON.stringify(index));
    }
  }
}

// ISO date the site went live — drives the "Day N" counter. Set once at
// launch; the client's /scripts/data.js carries the same value for the
// mock/preview path and as a display fallback.
const SITE_LIVE_DATE = '2025-01-01';

// Build the /api/stats payload. Intentionally minimal: days-on-view, 30-day
// country reach, and a top-3 country ranking — no raw visit counts are
// returned (the panel renders presence and order, not magnitude).
async function getStats(env) {
  const cities = await getVisits(env);

  // Aggregate visits by country across all stored cities. For a site that's
  // only days old, all-time ≈ past 30 days; if the site ages past 30 days we
  // can switch to a per-day per-country counter later without changing the
  // UI shape.
  const byCountry = new Map();
  for (const c of cities) {
    if (!c.country) continue;
    byCountry.set(c.country, (byCountry.get(c.country) || 0) + (c.count || 0));
  }
  const topCountries = [...byCountry.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cc]) => cc);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const live = new Date(SITE_LIVE_DATE + 'T00:00:00Z');
  const daysLive = Math.max(0, Math.floor((today - live) / 86400000));

  return {
    liveSince: SITE_LIVE_DATE,
    daysLive,
    countryCount: byCountry.size,
    topCountries,
  };
}

async function getVisits(env) {
  const index = (await env.VISITS.get(INDEX_KEY, { type: 'json' })) || [];
  const records = await Promise.all(
    index.map((k) => env.VISITS.get(k, { type: 'json' }))
  );
  return records.filter(Boolean);
}

// CV-download counter. Same IP-hash dedup as visits (one count per IP per 24h),
// plus a per-country tally so you can see rough geographic reach.
async function logCvDownload(env, request) {
  if (isProbablyBot(request)) return;
  const cf = request.cf;
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (!ip) return;
  const salt = env.IP_SALT || 'default-salt-please-rotate';
  const seenKey = 'cv-seen:' + (await ipHash(ip, salt));
  if (await env.VISITS.get(seenKey)) return;
  await env.VISITS.put(seenKey, '1', { expirationTtl: DEDUP_TTL_SECONDS });

  const total = parseInt((await env.VISITS.get(CV_TOTAL_KEY)) || '0', 10) + 1;
  await env.VISITS.put(CV_TOTAL_KEY, String(total));

  const country = (cf?.country || 'XX').trim();
  const byCountryKey = 'cv:country:' + country;
  const countryCount = parseInt((await env.VISITS.get(byCountryKey)) || '0', 10) + 1;
  await env.VISITS.put(byCountryKey, String(countryCount));

  const countries = (await env.VISITS.get(CV_COUNTRIES_KEY, { type: 'json' })) || [];
  if (!countries.includes(country)) {
    countries.push(country);
    await env.VISITS.put(CV_COUNTRIES_KEY, JSON.stringify(countries));
  }
}

async function getCvStats(env) {
  const total = parseInt((await env.VISITS.get(CV_TOTAL_KEY)) || '0', 10);
  const countries = (await env.VISITS.get(CV_COUNTRIES_KEY, { type: 'json' })) || [];
  const byCountryEntries = await Promise.all(
    countries.map(async (c) => [c, parseInt((await env.VISITS.get('cv:country:' + c)) || '0', 10)])
  );
  const byCountry = Object.fromEntries(byCountryEntries.sort((a, b) => b[1] - a[1]));
  return { total, countries: countries.length, byCountry };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/visits' && request.method === 'GET') {
      const cities = await getVisits(env);
      return new Response(
        JSON.stringify({ cities, updated: new Date().toISOString() }),
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=30, s-maxage=30',
            'access-control-allow-origin': '*',
          },
        }
      );
    }

    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const stats = await getStats(env);
      return new Response(
        JSON.stringify({ ...stats, updated: new Date().toISOString() }),
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=60, s-maxage=60',
            'access-control-allow-origin': '*',
          },
        }
      );
    }

    if (url.pathname === '/api/cv-stats' && request.method === 'GET') {
      const stats = await getCvStats(env);
      return new Response(
        JSON.stringify({ ...stats, updated: new Date().toISOString() }),
        {
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'public, max-age=30, s-maxage=30',
          },
        }
      );
    }

    // CV-download beacon. Fired by navigator.sendBeacon() from the CV link
    // click handler. This is the only reliable CV-tracking path — direct GETs
    // for /assets/<cv>.pdf are served by the Workers Static Assets handler
    // BEFORE the Worker runs, so we never see them.
    if (url.pathname === '/api/cv-download' && request.method === 'POST') {
      ctx.waitUntil(logCvDownload(env, request).catch(() => {}));
      return new Response(null, { status: 204 });
    }

    // Log the visit in the background — only for HTML page loads so we don't
    // count every favicon/script/asset request.
    const accepts = request.headers.get('accept') || '';
    if (request.method === 'GET' && accepts.includes('text/html')) {
      ctx.waitUntil(logVisit(env, request).catch(() => {}));
    }

    return env.ASSETS.fetch(request);
  },
};
