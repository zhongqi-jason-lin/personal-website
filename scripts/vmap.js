// Visitors heatmap — simplified world map with watercolor dot overlay.
// Pure SVG, no external deps. Viewbox 1000×500 (2:1 equirectangular).
// Projection is Pacific-centered so Europe sits on the left, Americas on the right.
// Land paths are hand-authored in a 0°-centered frame; we re-project each point
// through proj() so outlines and dots share the exact same coordinate system
// (avoids the translate+scale tiling trick that left continents misaligned with dots).
(function(){
  const CENTER = 150;      // meridian placed at the map's horizontal center
  const SCALE_X = 0.82;    // horizontal compression so continents huddle in the frame

  const proj = (lon, lat) => {
    const raw = (((lon - CENTER + 540) % 360) / 360) * 1000;
    const x = (raw - 500) * SCALE_X + 500;
    return [x, ((90 - lat) / 180) * 500];
  };

  // Re-project every M/L point in a LAND path string from original 0°-centered coords
  // into the new Pacific-centered, scaled visible coords. Any polygon edge that would
  // cross the new date line is detected by a large jump in VISIBLE x (not longitude —
  // two vertices can be only a degree apart but land on opposite edges of the map),
  // and broken with an extra M command so we don't draw a streak across the viewport.
  // Z (close-path) is dropped when its implicit closing line would cross the date line.
  const DATELINE_GAP = 500;  // visible-pixel threshold for "this segment wraps"
  const reprojectPath = (d) => {
    let firstX = null, prevX = null;
    return d.replace(/([MLZ])\s*(-?\d+(?:\.\d+)?)?\s*,?\s*(-?\d+(?:\.\d+)?)?/g,
      (_m, cmd, xs, ys) => {
        if (cmd === 'Z') {
          const closingWraps = firstX !== null && prevX !== null &&
                               Math.abs(prevX - firstX) > DATELINE_GAP;
          firstX = prevX = null;
          return closingWraps ? '' : 'Z';
        }
        const ox = parseFloat(xs), oy = parseFloat(ys);
        const lon = ox / 1000 * 360 - 180;
        const lat = 90 - oy / 500 * 180;
        const [nx, ny] = proj(lon, lat);
        let out = cmd;
        if (prevX !== null && Math.abs(nx - prevX) > DATELINE_GAP) out = 'M';
        if (out === 'M') firstX = nx;
        prevX = nx;
        return `${out}${nx.toFixed(1)},${ny.toFixed(1)}`;
      });
  };

  // Graticule — 12 meridians every 30°, parallels every 30°
  const gratLines = () => {
    const lines = [];
    for(let i = 0; i < 12; i++){
      const [x] = proj(-180 + i * 30, 0);
      lines.push(`M${x.toFixed(1)},0L${x.toFixed(1)},500`);
    }
    for(let lat = -60; lat <= 60; lat += 30){
      const y = ((90 - lat) / 180) * 500;
      lines.push(`M0,${y.toFixed(1)}L1000,${y.toFixed(1)}`);
    }
    return lines.join(' ');
  };

  // Simplified continent outlines (equirectangular coords, viewBox 1000×500).
  // Not geographically precise — stylized silhouettes suitable for a site visitor map.
  const LAND = [
    // North America
    "M140,110 L220,100 L270,115 L305,135 L330,170 L315,200 L285,225 L260,250 L235,265 L220,285 L200,290 L185,275 L175,255 L165,235 L155,215 L150,190 L145,165 L148,140 Z",
    // Central America
    "M260,275 L285,290 L305,310 L315,325 L300,330 L280,320 L265,305 L258,290 Z",
    // South America
    "M310,310 L345,305 L370,325 L385,355 L390,395 L375,430 L350,455 L325,465 L305,450 L295,420 L300,385 L305,350 Z",
    // Greenland — x<=415 keeps the whole polygon west of the Pacific-centered date line
    "M360,80 L400,75 L414,95 L412,120 L395,135 L370,128 L355,105 Z",
    // Europe
    "M485,120 L530,115 L570,125 L585,145 L575,165 L555,175 L525,180 L500,170 L485,155 L480,135 Z",
    // Africa
    "M500,210 L555,205 L595,220 L620,250 L625,295 L615,335 L595,370 L570,395 L540,400 L515,385 L500,355 L490,320 L488,280 L493,240 Z",
    // Middle East / Arabia
    "M605,220 L640,215 L655,240 L650,265 L625,275 L605,260 L600,235 Z",
    // Asia main
    "M590,110 L680,100 L760,105 L820,120 L860,140 L875,165 L860,185 L830,200 L790,210 L745,215 L700,210 L665,200 L630,185 L605,165 L593,140 Z",
    // India
    "M705,215 L740,215 L750,240 L745,265 L725,280 L710,265 L702,240 Z",
    // Southeast Asia
    "M790,220 L825,225 L840,245 L830,265 L805,270 L790,255 L785,235 Z",
    // China east coast extension
    "M830,160 L870,170 L880,195 L865,215 L840,215 L828,195 Z",
    // Japan
    "M890,160 L905,155 L915,175 L910,195 L895,195 L888,178 Z",
    // Australia
    "M820,345 L880,340 L910,355 L920,380 L905,405 L870,415 L835,410 L815,390 L810,368 Z",
    // New Zealand
    "M935,415 L945,410 L955,425 L950,440 L938,438 L930,425 Z",
    // UK / Ireland
    "M465,125 L480,122 L488,140 L478,152 L465,148 L460,135 Z",
    // Scandinavia
    "M510,85 L545,82 L560,105 L548,125 L525,125 L510,110 Z",
    // Iceland
    "M445,95 L462,92 L468,105 L458,115 L444,110 Z",
    // Indonesia / Borneo
    "M805,280 L835,278 L848,292 L838,305 L815,303 L802,290 Z",
    // Philippines — lat 5–19, lon 117–126
    "M835,200 L842,200 L848,215 L845,230 L838,232 L833,218 Z",
    // Papua New Guinea — lat −2 to −11, lon 140–151
    "M892,258 L905,256 L918,262 L915,275 L905,280 L890,272 Z",
    // Madagascar — lat −12 to −25, lon 43–51
    "M630,288 L636,292 L638,306 L634,318 L628,317 L624,305 L626,295 Z",
    // Kamchatka — lat 52–60, lon 155–165
    "M935,85 L950,90 L958,102 L948,115 L935,108 L930,95 Z",
  ];

  // Cities with approximate lat/long and visitor weight (0–1).
  // Weight drives dot radius and opacity.
  const CITIES = [
    { c:'New Haven',     co:'USA',    lat:41.31,  lon:-72.92, w:1.00, n:284 },
    { c:'New York',      co:'USA',    lat:40.71,  lon:-74.00, w:0.92, n:196 },
    { c:'San Francisco', co:'USA',    lat:37.77,  lon:-122.42,w:0.78, n:112 },
    { c:'Boston',        co:'USA',    lat:42.36,  lon:-71.06, w:0.70, n:88  },
    { c:'Cambridge',     co:'UK',     lat:52.20,  lon:0.12,   w:0.55, n:54  },
    { c:'London',        co:'UK',     lat:51.51,  lon:-0.13,  w:0.68, n:71  },
    { c:'Paris',         co:'France', lat:48.86,  lon:2.35,   w:0.42, n:38  },
    { c:'Berlin',        co:'Germany',lat:52.52,  lon:13.40,  w:0.40, n:34  },
    { c:'Zurich',        co:'Swiss',  lat:47.37,  lon:8.54,   w:0.35, n:28  },
    { c:'Stockholm',     co:'Sweden', lat:59.33,  lon:18.07,  w:0.28, n:19  },
    { c:'Tel Aviv',      co:'Israel', lat:32.08,  lon:34.78,  w:0.30, n:22  },
    { c:'Beijing',       co:'China',  lat:39.90,  lon:116.41, w:0.50, n:44  },
    { c:'Shanghai',      co:'China',  lat:31.23,  lon:121.47, w:0.58, n:56  },
    { c:'Shenzhen',      co:'China',  lat:22.54,  lon:114.06, w:0.38, n:30  },
    { c:'Hong Kong',     co:'HK',     lat:22.32,  lon:114.17, w:0.42, n:35  },
    { c:'Tokyo',         co:'Japan',  lat:35.68,  lon:139.69, w:0.45, n:40  },
    { c:'Seoul',         co:'Korea',  lat:37.57,  lon:126.98, w:0.32, n:24  },
    { c:'Singapore',     co:'SG',     lat:1.35,   lon:103.82, w:0.34, n:27  },
    { c:'Bangalore',     co:'India',  lat:12.97,  lon:77.59,  w:0.30, n:23  },
    { c:'Sydney',        co:'Aus',    lat:-33.87, lon:151.21, w:0.36, n:28  },
    { c:'Melbourne',     co:'Aus',    lat:-37.81, lon:144.96, w:0.26, n:18  },
    { c:'Toronto',       co:'Canada', lat:43.65,  lon:-79.38, w:0.44, n:37  },
    { c:'Vancouver',     co:'Canada', lat:49.28,  lon:-123.12,w:0.32, n:24  },
    { c:'Mexico City',   co:'Mexico', lat:19.43,  lon:-99.13, w:0.22, n:15  },
    { c:'São Paulo',     co:'Brazil', lat:-23.55, lon:-46.63, w:0.25, n:17  },
    { c:'Buenos Aires',  co:'Arg',    lat:-34.60, lon:-58.38, w:0.18, n:11  },
    { c:'Cape Town',     co:'S.Africa',lat:-33.92,lon:18.42,  w:0.16, n:9   },
    { c:'Nairobi',       co:'Kenya',  lat:-1.29,  lon:36.82,  w:0.14, n:8   },
  ];

  // Normalize a city record into the {lat, lon, w, n, label} shape used for rendering.
  // `w` is a 0–1 weight derived from count, relative to the max in the set.
  const normalize = (cities) => {
    if (!cities || !cities.length) return [];
    const max = Math.max(...cities.map((c) => c.count || 0), 1);
    return cities.map((c) => ({
      lat: c.lat,
      lon: c.lon,
      n: c.count,
      label: `${c.city}, ${c.country}`,
      w: Math.max(0.12, Math.min(1, (c.count || 1) / max)),
    }));
  };

  const renderPools = (cities) => cities.map((ct) => {
    const [x, y] = proj(ct.lon, ct.lat);
    const r  = (6 + ct.w * 11).toFixed(1);
    const op = (0.28 + ct.w * 0.38).toFixed(2);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" opacity="${op}"><title>${ct.label} — ${ct.n} visit${ct.n === 1 ? '' : 's'}</title></circle>`;
  }).join('');

  const renderBloom = (cities) => [...cities].sort((a, b) => b.w - a.w).slice(0, 5).map((ct) => {
    const [x, y] = proj(ct.lon, ct.lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(12 + ct.w * 14).toFixed(1)}" opacity=".28"/>`;
  }).join('');

  // Initial seed — used until /api/visits returns. Same shape as normalize() output.
  const SEED = CITIES.map((c) => ({ lat: c.lat, lon: c.lon, n: c.n, label: `${c.c}, ${c.co}`, w: c.w }));

  window.VMAP = function(){
    // Each LAND path is re-projected point-by-point through proj(), so continents
    // and city dots live in the exact same coordinate space. No tiling needed.
    const landWrapped = LAND.map(d=>`<path class="land" d="${reprojectPath(d)}"/>`).join('');
    return `<div class="vmap" data-seeded="true"><svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Visitors world map">
      <defs>
        <filter id="vmap-bleed" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4.5"/>
        </filter>
        <filter id="vmap-bloom" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="9"/>
        </filter>
      </defs>
      <path class="grat" d="${gratLines()}"/>
      ${landWrapped}
      <g class="bloom" filter="url(#vmap-bloom)">${renderBloom(SEED)}</g>
      <g class="pools" filter="url(#vmap-bleed)">${renderPools(SEED)}</g>
    </svg></div>`;
  };

  // Fetch live visit data from /api/visits and re-render just the dot layers.
  // Fails silently on network / parse errors — the seeded map stays visible.
  window.VMAP_REFRESH = async function(){
    try{
      const r = await fetch('/api/visits', { cache: 'no-store' });
      if(!r.ok) return;
      const { cities } = await r.json();
      if(!cities || !cities.length) return;  // empty KV → keep seeded dots
      const real = normalize(cities);
      const root = document.querySelector('.vmap[data-seeded]');
      if(!root) return;
      const poolsG = root.querySelector('.pools');
      const bloomG = root.querySelector('.bloom');
      if(poolsG) poolsG.innerHTML = renderPools(real);
      if(bloomG) bloomG.innerHTML = renderBloom(real);
      root.removeAttribute('data-seeded');
      root.setAttribute('data-live', 'true');
      // Also refresh the top-cities table if it's on the page.
      const tableHost = document.querySelector('[data-vcity-host]');
      if(tableHost){
        const sorted = [...cities].sort((a,b)=>(b.count||0)-(a.count||0)).slice(0,8);
        tableHost.innerHTML = sorted.map((c,i)=>`<div class="vcity">
          <span class="cn">${String(i+1).padStart(2,'0')}</span>
          <span class="c">${c.city}</span>
          <span class="p">${c.country} · ${c.count}</span>
        </div>`).join('');
      }
    }catch(e){ /* ignore — seeded view is fine */ }
  };

  window.VCITIES = function(){
    // Top 8 cities for the table — seeded; VMAP_REFRESH() swaps in live data when available.
    const top = [...CITIES].sort((a,b)=>b.n-a.n).slice(0,8);
    return top.map((ct,i)=>`<div class="vcity">
      <span class="cn">${String(i+1).padStart(2,'0')}</span>
      <span class="c">${ct.c}</span>
      <span class="p">${ct.co} · ${ct.n}</span>
    </div>`).join('');
  };
})();
