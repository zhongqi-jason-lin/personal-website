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
  // Stylized silhouettes, not geographically precise. Audited for (1)
  // correct lat/lon placement of each labeled region, (2) no overlapping
  // polygon interiors (shared edges only), (3) every CITIES seed + every
  // /api/visits-observed country has land underneath its dot.
  const LAND = [
    // North America — Alaska + Canada (Arctic, Labrador) + USA + Mexico + Central America
    // Traced clockwise from Alaska NW: Arctic coast → Labrador → US East →
    // Florida → Gulf → Mexico → Central America → Mexico Pacific → US West →
    // BC → Alaska S → close back to NW.
    "M42,68 L60,55 L100,52 L150,48 L200,45 L250,48 L285,58 L308,75 L330,98 L345,120 L335,130 L318,134 L305,135 L298,158 L285,180 L270,185 L248,182 L235,195 L258,212 L282,228 L268,220 L248,215 L222,198 L198,170 L175,145 L155,125 L135,108 L110,95 L82,88 L58,82 Z",
    // Caribbean — stylized Greater Antilles arc (Cuba → Hispaniola → Puerto
    // Rico). Sits just south of Florida.
    "M266,191 L290,188 L312,192 L328,199 L322,205 L300,204 L278,200 L268,196 Z",
    // Central America — Guatemala/Honduras/Nicaragua/Costa Rica/Panama land
    // bridge between NA (ends at Yucatan ~y=228) and SA. Without this, the
    // NA polygon's southern tip and SA's northern tip are separated by a
    // ~77px strip of ocean where Mexico's southern border and the isthmus
    // should be.
    "M243,210 L258,215 L272,222 L286,232 L279,237 L264,232 L250,224 L241,217 Z",
    // South America — covers lat 12°N (Guajira) to lat -55°S (Tierra del
    // Fuego). Previous polygon was off by ~85px south (covered lat -20°S
    // to -77°S — mostly Antarctic Ocean), so the ENTIRE northern half of
    // SA (Amazon, Venezuela, Colombia, Guianas, northern Brazil) had no
    // land under its dots. São Paulo and Rio landed in open ocean.
    "M297,220 L325,214 L360,222 L388,238 L402,260 L408,285 L398,320 L385,350 L368,378 L345,398 L325,400 L312,388 L298,358 L288,320 L283,278 L286,245 Z",
    // Greenland — x<=415 keeps the whole polygon west of the Pacific-centered date line
    "M360,80 L400,75 L414,95 L412,120 L395,135 L370,128 L355,105 Z",
    // Europe — Iberia to the Balkans, north to the Baltic. South edge
    // clipped at the Mediterranean; previous version dipped to lat 25°N
    // (central Sahara) and overlapped North Africa across a 10° band.
    "M473,131 L490,115 L520,100 L572,102 L590,115 L585,140 L550,148 L500,150 L475,148 Z",
    // North Africa — Morocco / Algeria / Tunisia / Libya / Egypt. South
    // edge clipped at the Sahel (~lat 14°N). Previous version dipped to
    // lat -12°S (Congo basin) and overlapped sub-Saharan Africa from
    // Sahel all the way through equatorial Africa.
    "M472,153 L528,148 L585,160 L605,185 L600,205 L540,214 L455,211 L453,188 L462,178 Z",
    // Africa (sub-Saharan) — now includes Horn of Africa (Somalia +
    // eastern Ethiopia, which the old polygon cut off at lon 45°E —
    // Mogadishu and Addis Ababa dots landed on ocean).
    "M455,211 L540,216 L583,215 L615,218 L642,220 L620,255 L612,290 L598,330 L568,346 L540,346 L512,320 L495,280 L488,245 Z",
    // Middle East / Arabia
    "M605,220 L640,215 L655,240 L650,265 L625,275 L605,260 L600,235 Z",
    // Russia — Baltic to Chukotka. South edge pulled up from lat 43°N
    // (Vladivostok) to ~lat 48°N so it abuts Asia main cleanly instead
    // of overlapping Mongolia + southern Siberia across a 10° band.
    "M555,95 L588,80 L610,58 L680,50 L800,35 L870,42 L955,55 L995,72 L944,83 L938,106 L867,120 L828,113 L722,108 L639,118 L555,106 Z",
    // Asia main — southern half of Eurasia (Turkey/Iran/China/Korea/SE
    // Asia). North edge lowered from lat ~54°N to lat ~46°N so it no
    // longer overlaps Russia. East bulge covers the Korean peninsula and
    // the China east coast — the redundant "China east coast extension"
    // polygon that used to sit entirely inside this one is gone.
    "M593,125 L680,118 L760,120 L820,128 L862,144 L878,170 L862,195 L830,210 L790,213 L745,216 L705,213 L668,200 L632,185 L605,165 L595,140 Z",
    // India
    "M705,215 L740,215 L750,240 L745,265 L725,280 L710,265 L702,240 Z",
    // Southeast Asia + Insular SEA — Thailand + Malaysia + Sumatra + Java +
    // Borneo + Sulawesi as one stylized blob. West edge extended to cover
    // western Sumatra (Medan, Padang) + KL, which the old Thailand-only
    // polygon was missing. Replaces a separate Indonesia polygon that used
    // to sit INSIDE this one's bounds (double-filled overlap from ~x=791
    // to x=841 at Sumatra/Borneo latitudes).
    "M762,225 L790,220 L825,225 L845,245 L835,268 L810,273 L780,270 L762,252 L760,238 Z",
    // Japan
    "M890,160 L905,155 L915,175 L910,195 L895,195 L888,178 Z",
    // Australia
    "M820,345 L880,340 L910,355 L920,380 L905,405 L870,415 L835,410 L815,390 L810,368 Z",
    // New Zealand
    "M935,415 L945,410 L955,425 L950,440 L938,438 L930,425 Z",
    // UK / Ireland — corrected latitudes. The old polygon had y=122-152,
    // which put it at lat 35-46°N — 2000km south of the British Isles,
    // floating in the North Atlantic offshore Portugal. London, Cambridge,
    // Dublin, Edinburgh dots all landed on open ocean.
    "M475,107 L480,97 L490,87 L502,90 L507,103 L498,111 L478,111 Z",
    // Scandinavia + Finland + Baltic states. Old polygon stopped at the
    // southern Gulf of Bothnia — Helsinki, Tallinn, Riga, Vilnius, and
    // all of Finnish interior had no land underneath.
    "M515,95 L528,82 L540,60 L572,53 L585,64 L583,85 L578,96 L572,102 L525,100 Z",
    // Iceland
    "M445,95 L462,92 L468,105 L458,115 L444,110 Z",
    // (Indonesia merged into SE Asia polygon above — separate polygons
    // double-filled through Sumatra/Borneo.)
    // Philippines — lat 5–19, lon 117–126
    "M835,200 L842,200 L848,215 L845,230 L838,232 L833,218 Z",
    // Papua New Guinea — lat −2 to −11, lon 140–151
    "M892,258 L905,256 L918,262 L915,275 L905,280 L890,272 Z",
    // Madagascar — lat −12 to −25, lon 43–51
    "M630,288 L636,292 L638,306 L634,318 L628,317 L624,305 L626,295 Z",
    // Kamchatka — lat 52–60, lon 155–165
    "M935,85 L950,90 L958,102 L948,115 L935,108 L930,95 Z",
  ];

  // Cities with approximate lat/long and visitor weight (0–1). `r` is the
  // state / province / administrative region — hover aggregation rolls up
  // counts to this level; '' means "roll up to country only" (city-states,
  // special admin regions). Weight drives dot radius and opacity.
  const CITIES = [
    { c:'New Haven',     co:'USA',    r:'Connecticut',      lat:41.31,  lon:-72.92, w:1.00, n:284 },
    { c:'New York',      co:'USA',    r:'New York',         lat:40.71,  lon:-74.00, w:0.92, n:196 },
    { c:'San Francisco', co:'USA',    r:'California',       lat:37.77,  lon:-122.42,w:0.78, n:112 },
    { c:'Boston',        co:'USA',    r:'Massachusetts',    lat:42.36,  lon:-71.06, w:0.70, n:88  },
    { c:'Cambridge',     co:'UK',     r:'England',          lat:52.20,  lon:0.12,   w:0.55, n:54  },
    { c:'London',        co:'UK',     r:'England',          lat:51.51,  lon:-0.13,  w:0.68, n:71  },
    { c:'Paris',         co:'France', r:'Île-de-France',    lat:48.86,  lon:2.35,   w:0.42, n:38  },
    { c:'Berlin',        co:'Germany',r:'Berlin',           lat:52.52,  lon:13.40,  w:0.40, n:34  },
    { c:'Zurich',        co:'Swiss',  r:'Zürich',           lat:47.37,  lon:8.54,   w:0.35, n:28  },
    { c:'Stockholm',     co:'Sweden', r:'Stockholm',        lat:59.33,  lon:18.07,  w:0.28, n:19  },
    { c:'Tel Aviv',      co:'Israel', r:'Tel Aviv',         lat:32.08,  lon:34.78,  w:0.30, n:22  },
    { c:'Beijing',       co:'China',  r:'Beijing',          lat:39.90,  lon:116.41, w:0.50, n:44  },
    { c:'Shanghai',      co:'China',  r:'Shanghai',         lat:31.23,  lon:121.47, w:0.58, n:56  },
    { c:'Shenzhen',      co:'China',  r:'Guangdong',        lat:22.54,  lon:114.06, w:0.38, n:30  },
    { c:'Hong Kong',     co:'HK',     r:'',                 lat:22.32,  lon:114.17, w:0.42, n:35  },
    { c:'Tokyo',         co:'Japan',  r:'Tokyo',            lat:35.68,  lon:139.69, w:0.45, n:40  },
    { c:'Seoul',         co:'Korea',  r:'Seoul',            lat:37.57,  lon:126.98, w:0.32, n:24  },
    { c:'Singapore',     co:'SG',     r:'',                 lat:1.35,   lon:103.82, w:0.34, n:27  },
    { c:'Bangalore',     co:'India',  r:'Karnataka',        lat:12.97,  lon:77.59,  w:0.30, n:23  },
    { c:'Sydney',        co:'Aus',    r:'New South Wales',  lat:-33.87, lon:151.21, w:0.36, n:28  },
    { c:'Melbourne',     co:'Aus',    r:'Victoria',         lat:-37.81, lon:144.96, w:0.26, n:18  },
    { c:'Toronto',       co:'Canada', r:'Ontario',          lat:43.65,  lon:-79.38, w:0.44, n:37  },
    { c:'Vancouver',     co:'Canada', r:'British Columbia', lat:49.28,  lon:-123.12,w:0.32, n:24  },
    { c:'Mexico City',   co:'Mexico', r:'CDMX',             lat:19.43,  lon:-99.13, w:0.22, n:15  },
    { c:'São Paulo',     co:'Brazil', r:'São Paulo',        lat:-23.55, lon:-46.63, w:0.25, n:17  },
    { c:'Buenos Aires',  co:'Arg',    r:'Buenos Aires',     lat:-34.60, lon:-58.38, w:0.18, n:11  },
    { c:'Cape Town',     co:'S.Africa',r:'Western Cape',    lat:-33.92, lon:18.42,  w:0.16, n:9   },
    { c:'Nairobi',       co:'Kenya',  r:'Nairobi',          lat:-1.29,  lon:36.82,  w:0.14, n:8   },
  ];

  // Normalize a city record into the shape used for rendering. `country`
  // and `region` are kept around so hover can aggregate at the state /
  // province level. `w` is a 0–1 weight derived from count, relative to
  // the max in the set.
  const normalize = (cities) => {
    if (!cities || !cities.length) return [];
    const max = Math.max(...cities.map((c) => c.count || 0), 1);
    return cities.map((c) => ({
      lat: c.lat,
      lon: c.lon,
      n: c.count,
      country: c.country,
      region: c.region || '',
      label: `${c.city}, ${c.country}`,
      w: Math.max(0.12, Math.min(1, (c.count || 1) / max)),
    }));
  };

  // Hover title rolls the count up to the state / province level — a dot on
  // San Francisco reads "California, USA — N visits" where N sums across
  // every city in California we've seen. Composite key scopes region by
  // country so "Victoria, Australia" and "Victoria, Canada" don't collide.
  // City-states (Singapore, HK) have empty regions → fall back to country.
  const renderPools = (cities) => {
    const keyOf = (ct) => (ct.region ? (ct.country || '—') + '\x00' + ct.region : (ct.country || '—'));
    const totals = cities.reduce((acc, ct) => {
      const k = keyOf(ct);
      acc[k] = (acc[k] || 0) + (ct.n || 0);
      return acc;
    }, {});
    return cities.map((ct) => {
      const [x, y] = proj(ct.lon, ct.lat);
      const r  = (6 + ct.w * 11).toFixed(1);
      const op = (0.28 + ct.w * 0.38).toFixed(2);
      const label = ct.region ? `${ct.region}, ${ct.country}` : (ct.country || '—');
      const total = totals[keyOf(ct)] ?? ct.n;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" opacity="${op}"><title>${label} — ${total} visit${total === 1 ? '' : 's'}</title></circle>`;
    }).join('');
  };

  const renderBloom = (cities) => [...cities].sort((a, b) => b.w - a.w).slice(0, 5).map((ct) => {
    const [x, y] = proj(ct.lon, ct.lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(12 + ct.w * 14).toFixed(1)}" opacity=".28"/>`;
  }).join('');

  // Initial seed — used until /api/visits returns. Same shape as normalize() output.
  const SEED = CITIES.map((c) => ({ lat: c.lat, lon: c.lon, n: c.n, country: c.co, region: c.r || '', label: `${c.c}, ${c.co}`, w: c.w }));

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
