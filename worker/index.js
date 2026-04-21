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

  // Per-day counters for the 30-day stats panel. Day boundary is midnight
  // ET (America/New_York), TTL 60 days. Three counter families share the
  // same ET date and rotate together:
  //   stats:day:<date>              — total visits that day (unused today
  //                                   but kept for a future trend chart)
  //   stats:cc:<date>:<country>     — visits per country (→ Top Countries)
  //   stats:usstate:<date>:<slug>   — visits per US state (→ Top US States)
  // statename sidecar stores the pretty name for each state slug so the
  // panel can render "New York" rather than the URL-safe "new-york".
  const dayStr = etDateStr();
  const stats60d = { expirationTtl: 60 * 24 * 60 * 60 };
  const dayKey = 'stats:day:' + dayStr;
  const priorDay = parseInt((await env.VISITS.get(dayKey)) || '0', 10);
  await env.VISITS.put(dayKey, String(priorDay + 1), stats60d);

  const ccKey = 'stats:cc:' + dayStr + ':' + country;
  const priorCc = parseInt((await env.VISITS.get(ccKey)) || '0', 10);
  await env.VISITS.put(ccKey, String(priorCc + 1), stats60d);

  if (country === 'US' && region) {
    const slug = region.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const usKey = 'stats:usstate:' + dayStr + ':' + slug;
    const priorUs = parseInt((await env.VISITS.get(usKey)) || '0', 10);
    await env.VISITS.put(usKey, String(priorUs + 1), stats60d);
    await env.VISITS.put('stats:statename:' + slug, region, { expirationTtl: 90 * 24 * 60 * 60 });
  }

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

// Calendar date in Eastern Time (America/New_York) as "YYYY-MM-DD". The day
// counter and per-day KV keys both tick over at midnight ET so the site's
// "Day N" aligns with Jason's local day instead of jumping forward at 20:00.
// en-CA's default format already yields YYYY-MM-DD with a zero-padded month.
function etDateStr(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

// YYYY-MM-DD string for today minus N ET days. Used as an inclusive lower
// bound when filtering daily-counter keys.
function etDateMinusDays(n) {
  const t = new Date(etDateStr() + 'T00:00:00Z');
  t.setUTCDate(t.getUTCDate() - n);
  return t.toISOString().slice(0, 10);
}

// Sum per-day counter values grouped by the 4th key segment (country code or
// city slug). KV has no aggregate queries, so we list all keys under the
// prefix, reject ones older than `cutoff`, then fan out gets in parallel.
// Both counter families use keys shaped "stats:<fam>:<date>:<field>", so the
// date lives at segment index 2 and the field at 3.
async function sumDailyByField(env, prefix, cutoff) {
  const sums = new Map();
  let cursor;
  do {
    const page = await env.VISITS.list({ prefix, cursor });
    const fresh = page.keys.filter((k) => {
      const segs = k.name.split(':');
      return segs[2] && segs[2] >= cutoff;
    });
    const rows = await Promise.all(fresh.map(async (k) => {
      const segs = k.name.split(':');
      const n = parseInt((await env.VISITS.get(k.name)) || '0', 10);
      return [segs[3] || '', n];
    }));
    for (const [field, n] of rows) {
      if (!field) continue;
      sums.set(field, (sums.get(field) || 0) + n);
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return sums;
}

// Build the /api/stats payload. Days-on-view + two 30-day rankings:
// Top Countries (by visit count) and Top cities in US. During the cold-start
// window right after this Worker rolls out, daily counters are sparse, so
// both rankings fall back to the cumulative per-city records.
async function getStats(env) {
  const cutoff = etDateMinusDays(29);   // 30 days inclusive of today
  const [ccSums, stateSums, cities] = await Promise.all([
    sumDailyByField(env, 'stats:cc:', cutoff),
    sumDailyByField(env, 'stats:usstate:', cutoff),
    getVisits(env),
  ]);

  let topCountries = [...ccSums.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cc]) => cc);
  if (topCountries.length === 0) {
    const byCountry = new Map();
    for (const c of cities) {
      if (!c.country) continue;
      byCountry.set(c.country, (byCountry.get(c.country) || 0) + (c.count || 0));
    }
    topCountries = [...byCountry.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cc]) => cc);
  }

  const topSlugs = [...stateSums.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([slug]) => slug);
  let topUsStates;
  if (topSlugs.length) {
    topUsStates = await Promise.all(topSlugs.map(async (slug) =>
      (await env.VISITS.get('stats:statename:' + slug)) || slug
    ));
  } else {
    // Cold-start fallback: roll up cumulative US records by region.
    const byState = new Map();
    for (const c of cities) {
      if (c.country !== 'US' || !c.region) continue;
      byState.set(c.region, (byState.get(c.region) || 0) + (c.count || 0));
    }
    topUsStates = [...byState.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  }

  // Diff calendar dates in ET. Parse both as UTC midnights so the subtraction
  // is a clean integer — the parse TZ cancels out; what matters is that both
  // endpoints are the same calendar date (ET) expressed the same way.
  const today = new Date(etDateStr() + 'T00:00:00Z');
  const live = new Date(SITE_LIVE_DATE + 'T00:00:00Z');
  const daysLive = Math.max(0, Math.floor((today - live) / 86400000));

  return {
    liveSince: SITE_LIVE_DATE,
    daysLive,
    topCountries,
    topUsStates,
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
