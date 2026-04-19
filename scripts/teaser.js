// Paper-specific cartoon schematics — redesigned as iconic, uncluttered figures.
// Layout: 200 × 112 viewBox. Diagram top band (y 2–82). Caption strip (y 86–108) only.
// Strict rule: NO text inside the diagram region. Only in the caption strip.
window.TEASER = function(kind){
  const caption = (labels) => {
    const n = labels.length;
    // Anchor first label to the left edge, last to the right edge, middles centered.
    // Using text-anchor lets long labels use the full caption strip without overlapping.
    return `<line x1="12" y1="86" x2="188" y2="86" stroke="currentColor" stroke-width=".3" opacity=".35"/>
      <g font-family="ui-monospace,monospace" font-size="7" fill="currentColor" letter-spacing=".3">
        ${labels.map((l,i)=>{
          let x, anchor;
          if (n === 1) { x = 100; anchor = 'middle'; }
          else if (i === 0) { x = 12; anchor = 'start'; }
          else if (i === n - 1) { x = 188; anchor = 'end'; }
          else { x = 12 + (i / (n - 1)) * 176; anchor = 'middle'; }
          return `<text x="${x.toFixed(1)}" y="100" text-anchor="${anchor}" opacity=".9">${l}</text>`;
        }).join('')}
      </g>`;
  };

  const svgs = {
    // Nature 2024 — organoid being interrogated by a T cell; IL-7 as a signal wave
    organoid: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Organoid: crypt-like lobed epithelium -->
        <g transform="translate(70,44)">
          <path d="M-32 0 Q-34 -18 -22 -26 Q-10 -32 2 -28 Q14 -32 26 -22 Q34 -12 32 4 Q34 18 20 24 Q10 28 -2 26 Q-16 28 -26 20 Q-34 12 -32 0 Z" stroke-width="1.4"/>
          <!-- crypt buds -->
          <path d="M-18 -24 Q-20 -32 -14 -34 Q-8 -32 -10 -24" stroke-width="1.1"/>
          <path d="M10 -28 Q12 -36 18 -34 Q22 -28 18 -24" stroke-width="1.1"/>
          <path d="M26 16 Q34 20 32 26 Q26 28 22 22" stroke-width="1.1"/>
          <path d="M-30 8 Q-36 14 -32 20 Q-26 22 -22 16" stroke-width="1.1"/>
          <!-- lumen lining dots on inner ellipse -->
          ${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${(Math.cos(a)*16).toFixed(1)}" cy="${(Math.sin(a)*9).toFixed(1)}" r="1.3" fill="currentColor" stroke="none" opacity=".7"/>`}).join('')}
        </g>
        <!-- IL-7 signal wave (three arcs) -->
        ${[0,1,2].map(i=>`<path d="M${110+i*3} ${28+i*4} Q${118+i*3} ${44+i*3} ${110+i*3} ${60+i*4}" stroke-width="${1-i*0.2}" opacity="${.8-i*.2}" stroke-dasharray="2 2.5"/>`).join('')}
        <!-- T cell (right) with surface receptors -->
        <g transform="translate(158,44)">
          <circle r="14" stroke-width="1.4"/>
          <circle r="4" fill="currentColor" stroke="none"/>
          ${[30,90,150,210,270,330].map(a=>{const r=a*Math.PI/180;const x1=Math.cos(r)*14;const y1=Math.sin(r)*14;const x2=Math.cos(r)*18;const y2=Math.sin(r)*18;return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="1"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.3" fill="currentColor" stroke="none"/>`}).join('')}
        </g>
      </g>
      ${caption(['organoid','IL-7','T cell'])}
    </svg>`,

    // Stem Cell Reports 2023 — bold hair follicle silhouette, a spark (damage), and a sprouting shoot (activation)
    follicle: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Follicle silhouette, centered, large -->
        <g transform="translate(76,42)">
          <!-- skin surface -->
          <line x1="-44" y1="-28" x2="44" y2="-28" stroke-dasharray="3 3" opacity=".5"/>
          <!-- hair shafts (3, slightly different lengths) -->
          <line x1="-10" y1="-28" x2="-10" y2="-42" stroke-width="1.6"/>
          <line x1="-2" y1="-28" x2="-2" y2="-44" stroke-width="1.6"/>
          <line x1="6" y1="-28" x2="6" y2="-40" stroke-width="1.6"/>
          <!-- follicle walls (open-bottomed flask) -->
          <path d="M-16 -28 Q-20 -12 -22 8 Q-22 28 -8 34 Q8 36 20 30 Q26 20 26 6 Q22 -10 18 -22 Q14 -28 12 -28" stroke-width="1.6"/>
          <!-- bulge (stem cell niche) -->
          <ellipse cx="-20" cy="-2" rx="8" ry="6" stroke-width="1.3"/>
          <!-- stem cells -->
          <circle cx="-22" cy="-4" r="2" fill="currentColor" stroke="none"/>
          <circle cx="-18" cy="-3" r="2" fill="currentColor" stroke="none"/>
          <circle cx="-20" cy="1" r="2" fill="currentColor" stroke="none"/>
          <!-- dermal papilla -->
          <ellipse cx="4" cy="30" rx="7" ry="4.5" stroke-width="1.3"/>
        </g>
        <!-- Spark (DNA damage) — 6-point star -->
        <g transform="translate(30,28)" stroke-width="1.2">
          ${[0,60,120,180,240,300].map(a=>{const r=a*Math.PI/180;const x=Math.cos(r)*7;const y=Math.sin(r)*7;return `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`}).join('')}
          <circle r="1.8" fill="currentColor" stroke="none"/>
        </g>
        <!-- Sprouting shoot (activation / regeneration) -->
        <g transform="translate(160,56)" stroke-width="1.3">
          <path d="M0 24 Q0 8 -6 0"/>
          <path d="M0 24 Q0 8 6 0"/>
          <path d="M0 12 Q-8 6 -12 -4"/>
          <path d="M0 8 Q8 2 12 -8"/>
          <!-- new leaf tips as small circles -->
          <circle cx="-12" cy="-4" r="2" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="-8" r="2" fill="currentColor" stroke="none"/>
          <circle cx="-6" cy="0" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="6" cy="0" r="1.5" fill="currentColor" stroke="none"/>
        </g>
      </g>
      ${caption(['DNA damage','follicle','activation'])}
    </svg>`,

    // Nat Comm 2020 — gradualistic differentiation as a curved funnel + GRHL3 "gate" as a doorway at the bottleneck
    trajectory: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Wide funnel, left to right, narrow at middle -->
        <path d="M14 14 Q70 14 92 36 Q100 42 92 48 Q70 70 14 70" stroke-width="1.3" opacity=".75"/>
        <path d="M14 70 Q60 70 88 48" stroke-width="0"/>
        <!-- basal stem cells (left, many, dense, filled) -->
        ${[[20,22],[28,18],[36,24],[22,32],[32,32],[42,18],[26,42],[38,42],[48,30],[20,50],[30,52],[44,50],[20,62],[32,62],[44,60]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4" fill="currentColor" stroke="none" opacity=".9"/>`).join('')}
        <!-- transition cells (middle, outlined) -->
        ${[[58,28],[66,22],[72,30],[60,42],[68,42],[74,40],[58,54],[66,48],[72,54]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" stroke-width=".9" opacity=".8"/>`).join('')}
        <!-- GRHL3 gate (bottleneck) -->
        <rect x="96" y="30" width="8" height="24" stroke-width="1.4" fill="var(--paper-2)"/>
        <line x1="100" y1="30" x2="100" y2="54" stroke-width="1.4"/>
        <!-- gate pillars -->
        <circle cx="100" cy="26" r="2" fill="currentColor" stroke="none"/>
        <circle cx="100" cy="58" r="2" fill="currentColor" stroke="none"/>
        <!-- Past the gate: differentiated cells (flat ellipses, then strips) -->
        ${[[118,28],[132,28],[146,28]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="2.4" stroke-width=".9" opacity=".7"/>`).join('')}
        ${[[120,44],[138,44],[156,44]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="2.2" stroke-width=".8" opacity=".6"/>`).join('')}
        ${[[122,60],[140,60],[158,60],[176,60]].map(([x,y])=>`<rect x="${x-6}" y="${y-1.5}" width="12" height="3" stroke-width=".6" opacity=".5"/>`).join('')}
        <!-- trajectory arrow, very clean, bottom -->
        <path d="M16 78 L184 78" stroke-width="1"/>
        <polygon points="184,78 179,75 179,81" fill="currentColor" stroke="none"/>
      </g>
      ${caption(['basal stem cells','differentiation'])}
    </svg>`,

    // Lung + SARS-CoV-2 — a stylized lung (two lobes as bubble clusters), a virus, and a T cell
    lung: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Trachea / airway tree -->
        <path d="M100 6 L100 28" stroke-width="1.6"/>
        <path d="M100 28 Q84 36 68 44 Q60 50 56 56" stroke-width="1.3"/>
        <path d="M100 28 Q116 36 132 44 Q140 50 144 56" stroke-width="1.3"/>
        <!-- Left lobe (bubble cluster) -->
        <g transform="translate(58,60)">
          ${[[0,0],[-10,4],[10,2],[-6,12],[8,14],[-14,18],[0,22],[14,22]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" stroke-width="1.2"/>`).join('')}
        </g>
        <!-- Right lobe -->
        <g transform="translate(142,60)">
          ${[[0,0],[10,4],[-10,2],[6,12],[-8,14],[14,18],[0,22],[-14,22]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" stroke-width="1.2"/>`).join('')}
        </g>
        <!-- SARS-CoV-2 virion in middle, large and iconic -->
        <g transform="translate(100,60)">
          <circle r="7" fill="currentColor" stroke="none" opacity=".9"/>
          ${Array.from({length:10},(_,i)=>{const a=i/10*Math.PI*2;const x1=Math.cos(a)*7;const y1=Math.sin(a)*7;const x2=Math.cos(a)*11;const y2=Math.sin(a)*11;return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="1"/><circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="1.6" fill="currentColor" stroke="none"/>`}).join('')}
        </g>
        <!-- T cell upper left, small & iconic -->
        <g transform="translate(24,24)">
          <circle r="9" stroke-width="1.3"/>
          <circle r="3" fill="currentColor" stroke="none"/>
          ${[0,72,144,216,288].map(a=>{const r=a*Math.PI/180;const x1=Math.cos(r)*9;const y1=Math.sin(r)*9;const x2=Math.cos(r)*12;const y2=Math.sin(r)*12;return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="1"/>`}).join('')}
        </g>
        <!-- arrow from T cell to virus -->
        <path d="M34 30 Q62 44 86 56" stroke-dasharray="2 2.5" stroke-width="1"/>
        <polygon points="86,56 80,54 82,60" fill="currentColor" stroke="none"/>
      </g>
      ${caption(['T cell','virion','alveoli'])}
    </svg>`,
  };
  return svgs[kind] || svgs.organoid;
};
