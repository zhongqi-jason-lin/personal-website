// Abstract cartoon schematics for publication "exhibits".
// Layout: 200 × 112 viewBox. Diagram top band (y 2–82). Caption strip (y 86–108).
// Strict rule: NO text inside the diagram region. Only in the caption strip.
//
// Three generic schemas that stand in for most paper types — swap or extend as
// you like. Each key here (diagram / network / curves) is what you reference
// in scripts/data.js under `pubs[].teaser`.
window.TEASER = function(kind){
  // fontSize in SVG user units. Default 7 is tuned for the larger Current-
  // research cards (~420px wide at desktop); the Selected-works teasers
  // live in a ~660px container, so callers can pass fontSize=5 to land the
  // rendered text at the same apparent pixel size across sections.
  const caption = (labels, fontSize = 7) => {
    const n = labels.length;
    // Anchor first label to the left edge, last to the right edge, middles centered.
    // Using text-anchor lets long labels use the full caption strip without overlapping.
    return `<line x1="12" y1="86" x2="188" y2="86" stroke="currentColor" stroke-width=".3" opacity=".35"/>
      <g font-family="ui-monospace,monospace" font-size="${fontSize}" fill="currentColor" letter-spacing=".3">
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
    // Process diagram — three stages connected by arrows.
    diagram: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Three rounded boxes -->
        <rect x="16" y="28" width="44" height="32" rx="4" stroke-width="1.4"/>
        <rect x="78" y="28" width="44" height="32" rx="4" stroke-width="1.4"/>
        <rect x="140" y="28" width="44" height="32" rx="4" stroke-width="1.4"/>
        <!-- Arrows -->
        <path d="M60 44 L76 44" stroke-width="1.2"/>
        <polygon points="78,44 73,42 73,46" fill="currentColor" stroke="none"/>
        <path d="M122 44 L138 44" stroke-width="1.2"/>
        <polygon points="140,44 135,42 135,46" fill="currentColor" stroke="none"/>
        <!-- Glyphs inside each box -->
        <g transform="translate(38,44)">
          <circle r="2.5" fill="currentColor" stroke="none" opacity=".7"/>
          <circle cx="-6" r="1.8" fill="currentColor" stroke="none" opacity=".5"/>
          <circle cx="6" r="1.8" fill="currentColor" stroke="none" opacity=".5"/>
        </g>
        <g transform="translate(100,44)">
          <circle r="5" stroke-width="1.1"/>
          <circle r="1.8" fill="currentColor" stroke="none"/>
        </g>
        <g transform="translate(162,44)">
          <rect x="-6" y="-4" width="12" height="8" stroke-width="1.1" rx="1"/>
          <line x1="-3" y1="0" x2="3" y2="0" stroke-width=".9"/>
        </g>
      </g>
      ${caption(['input','process','output'])}
    </svg>`,

    // Network — nodes of varying weight connected by edges, one visual hub.
    network: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Edges (drawn first so nodes overlap them) -->
        <g stroke-width=".9" opacity=".55">
          <line x1="40" y1="22" x2="100" y2="44"/>
          <line x1="40" y1="22" x2="60" y2="60"/>
          <line x1="100" y1="44" x2="60" y2="60"/>
          <line x1="100" y1="44" x2="150" y2="26"/>
          <line x1="100" y1="44" x2="158" y2="60"/>
          <line x1="150" y1="26" x2="158" y2="60"/>
          <line x1="60" y1="60" x2="88" y2="74"/>
          <line x1="158" y1="60" x2="136" y2="74"/>
          <line x1="88" y1="74" x2="136" y2="74"/>
        </g>
        <!-- Nodes -->
        <circle cx="40" cy="22" r="4" fill="currentColor" stroke="none"/>
        <circle cx="100" cy="44" r="6.5" fill="currentColor" stroke="none"/>
        <circle cx="60" cy="60" r="4" fill="currentColor" stroke="none"/>
        <circle cx="150" cy="26" r="4" fill="currentColor" stroke="none"/>
        <circle cx="158" cy="60" r="5" fill="currentColor" stroke="none"/>
        <circle cx="88" cy="74" r="3" fill="currentColor" stroke="none" opacity=".75"/>
        <circle cx="136" cy="74" r="3" fill="currentColor" stroke="none" opacity=".75"/>
        <!-- Ring around the hub -->
        <circle cx="100" cy="44" r="10" stroke-width=".7" stroke-dasharray="2 2.5" opacity=".55"/>
      </g>
      ${caption(['node','hub','edge'])}
    </svg>`,

    // Curves — axes, gridlines, two smooth curves with data points on the top one.
    curves: `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet">
      <g stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- Axes -->
        <line x1="22" y1="74" x2="184" y2="74" stroke-width="1"/>
        <line x1="22" y1="10" x2="22" y2="74" stroke-width="1"/>
        <!-- Gridlines -->
        <line x1="22" y1="58" x2="184" y2="58" stroke-width=".3" stroke-dasharray="2 3" opacity=".4"/>
        <line x1="22" y1="42" x2="184" y2="42" stroke-width=".3" stroke-dasharray="2 3" opacity=".4"/>
        <line x1="22" y1="26" x2="184" y2="26" stroke-width=".3" stroke-dasharray="2 3" opacity=".4"/>
        <!-- Primary curve -->
        <path d="M24 68 Q68 62 100 46 Q132 30 182 20" stroke-width="1.6"/>
        <!-- Secondary (dashed) curve -->
        <path d="M24 72 Q64 68 100 58 Q138 48 182 40" stroke-width="1.2" opacity=".65" stroke-dasharray="3 2"/>
        <!-- Data points on primary curve -->
        <circle cx="42" cy="64" r="2" fill="currentColor" stroke="none"/>
        <circle cx="80" cy="50" r="2" fill="currentColor" stroke="none"/>
        <circle cx="120" cy="38" r="2" fill="currentColor" stroke="none"/>
        <circle cx="160" cy="26" r="2" fill="currentColor" stroke="none"/>
        <!-- Tiny axis tick marks -->
        <line x1="22" y1="74" x2="22" y2="78" stroke-width=".7"/>
        <line x1="60" y1="74" x2="60" y2="76" stroke-width=".5"/>
        <line x1="100" y1="74" x2="100" y2="76" stroke-width=".5"/>
        <line x1="140" y1="74" x2="140" y2="76" stroke-width=".5"/>
        <line x1="184" y1="74" x2="184" y2="78" stroke-width=".7"/>
      </g>
      ${caption(['x','signal','y'])}
    </svg>`,
  };
  return svgs[kind] || svgs.diagram;
};
