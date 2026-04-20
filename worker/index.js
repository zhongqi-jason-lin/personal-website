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

async function logVisit(env, request) {
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

    // Log the visit in the background — only for HTML page loads so we don't
    // count every favicon/script/asset request.
    const accepts = request.headers.get('accept') || '';
    if (request.method === 'GET' && accepts.includes('text/html')) {
      ctx.waitUntil(logVisit(env, request).catch(() => {}));
    }

    return env.ASSETS.fetch(request);
  },
};
