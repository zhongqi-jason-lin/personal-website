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
const CV_PATH = '/assets/Zhongqi-Jason-Lin-CV.pdf';
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
  // Cloudflare's own edge POPs occasionally warm/probe new Workers from inside
  // their own ASN, and `asOrganization` comes back as "Cloudflare, Inc." on those.
  if (cf?.asOrganization && /cloudflare/i.test(cf.asOrganization)) return true;
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

  if (!existing) {
    const index = (await env.VISITS.get(INDEX_KEY, { type: 'json' })) || [];
    if (!index.includes(key)) {
      index.push(key);
      if (index.length > MAX_CITIES) index.shift();
      await env.VISITS.put(INDEX_KEY, JSON.stringify(index));
    }
  }
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

    // Temporary diagnostic — returns what the Worker sees for this request.
    // Visit this URL in the browser where your visits aren't registering to see why.
    if (url.pathname === '/api/debug' && request.method === 'GET') {
      const cf = request.cf || {};
      return new Response(JSON.stringify({
        ua: request.headers.get('user-agent') || null,
        accept: request.headers.get('accept') || null,
        botFiltered: isProbablyBot(request),
        cf: {
          country: cf.country,
          city: cf.city,
          region: cf.region,
          latitude: cf.latitude,
          longitude: cf.longitude,
          asOrganization: cf.asOrganization,
          colo: cf.colo,
          verifiedBot: cf.botManagement?.verifiedBot ?? null,
        },
      }, null, 2), { headers: { 'content-type': 'application/json' } });
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

    // Log the visit in the background — only for HTML page loads so we don't
    // count every favicon/script/asset request.
    const accepts = request.headers.get('accept') || '';
    if (request.method === 'GET' && accepts.includes('text/html')) {
      ctx.waitUntil(logVisit(env, request).catch(() => {}));
    }

    // Log CV downloads separately — the browser requests the PDF with
    // Accept: application/pdf, not text/html, so it's a distinct code path.
    if (request.method === 'GET' && url.pathname === CV_PATH) {
      ctx.waitUntil(logCvDownload(env, request).catch(() => {}));
    }

    return env.ASSETS.fetch(request);
  },
};
