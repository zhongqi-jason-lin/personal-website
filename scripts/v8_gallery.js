// F · Gallery — museum wall. Bigger left plate, bio above provenance.
(function(){
  const root=document.getElementById('v8');const J=window.JASON;
  const css=`
  .vF{font-family:var(--sf);color:var(--ink);background:var(--paper)}
  /* ── Type scale (6 levels) ──────────────────────────────────────────────
     Every literal font-size in this file picks from one of:
        11px  micro labels, mock badge, .id, section-head label
        13px  captions, metadata, authors, role
        16px  body text, blurbs, list items
        20px  card titles (h3), bio, hall intro, large body
        28px  big accent numbers, vstats counter
        36px  hero exhibit numbers
     Fluid clamp ranges still exist for content that scales with viewport
     (h3 cards: clamp(16, .., 20); name: clamp(22, .., 32); modal h3:
     clamp(20, .., 28)) but their bounds align with the static scale. */
  /* Apple-inspired radius scale: small UI 6 / cards 12 / surfaces 18.
     Mirrors iOS HIG's three-tier rounding language — a button reads as small,
     a card reads as a card, a panel reads as a panel, all from radius alone.
     Scoped on both top-level wrappers because .research-modal lives outside
     .vF in the DOM and would otherwise miss these tokens. */
  .vF, .research-modal{--radius-sm:6px;--radius-md:12px;--radius-lg:18px}

  /* First-paint stagger — small rise + fade, guided by --d on each anchor.
     Disabled under prefers-reduced-motion. */
  @keyframes vFRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .vF [data-rise]{opacity:0;animation:vFRise .55s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d,0ms)}
  @media (prefers-reduced-motion:reduce){.vF [data-rise]{animation:none;opacity:1}}

  /* Shared focus ring */
  .vF a:focus-visible,.vF button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:var(--radius-sm);opacity:1}
  .vF .stage{display:grid;grid-template-columns:minmax(360px,40%) 1fr;min-height:100vh;min-height:100dvh}
  /* Mobile: switch stage to flex column so the .collection footer can be pushed to
     the viewport bottom via margin-top:auto when content is shorter than 100dvh.
     Also tighten the plate→hall transition: stacked vertically, the desktop
     padding pair (plate-bottom 3rem + hall-top 3rem = 6rem) reads as dead air
     between the last plate block and the first section-head rule. Trim to a
     ~2rem combined gap so the section-head feels anchored to the panels above. */
  @media(max-width:900px){
    .vF .stage{display:flex;flex-direction:column;min-height:100vh;min-height:100dvh}
    .vF .collection{margin-top:auto}
    /* Tightened further on iteration — 1.25/.75 still read as "gap" rather than
       "panel transition". Now the bottom skill row's border sits ~4px above the
       plate's paper-2 edge, and the section-head sits ~12px below that edge,
       so the visual rhythm is "panel ends → small breath → next section". */
    .vF .plate{padding-bottom:.25rem}
    .vF .hall{padding-top:.75rem}
  }

  /* Left plate — scaled up */
  .vF .plate{background:var(--paper-2);border-right:1px solid var(--rule);padding:2.5rem 2.25rem 3rem;display:flex;flex-direction:column;gap:2rem}
  /* No stage border-bottom — the .collection footer row below draws the page-bottom rule. */
  .vF .plate .id{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)}
  /* who: flex row always (no wrap), shrink-wrapped around its content
     via width:max-content and centered in the plate via margin-inline:
     auto. This keeps the pic + text as ONE horizontal group at every
     viewport, vertically aligning with the centered .social icons row
     immediately below. max-width:100% prevents overflow on narrow
     plates — at which point the JS cap on --pic-size ensures the text
     column retains enough width for the name to read. */
  .vF .plate .who{display:flex;flex-direction:row;align-items:center;gap:1.15rem;width:max-content;max-width:100%;margin-inline:auto}
  .vF .plate .who-text{display:flex;flex-direction:column;justify-content:center;gap:.45rem}
  /* Pic: sized from the --pic-size CSS variable, which JS syncs to 0.9x
     the .who-text block's rendered height on load + resize + font-load —
     the 0.9 factor dials the portrait slightly smaller than text height
     so it doesn't dominate the group visually. The min/max clamp pair
     acts as a hard range: floor stops the pic from collapsing when the
     name fits on one line at wide viewports; ceiling stops a runaway
     feedback loop during resize (narrow text column → text wraps taller
     → JS makes pic bigger → text column narrower → loop). The floor
     also covers the pre-JS frame and the reduced-motion / no-JS case. */
  .vF .plate .pic{width:var(--pic-size,clamp(108px,9.9vw,158px));height:var(--pic-size,clamp(108px,9.9vw,158px));min-width:clamp(108px,9.9vw,158px);min-height:clamp(108px,9.9vw,158px);max-width:200px;max-height:200px;flex-shrink:0;border-radius:50%;background:url('${(J&&J.headshot)||"assets/headshot.svg"}') center/cover,var(--paper);box-shadow:0 14px 30px -16px rgba(0,0,0,.3),0 0 0 5px var(--paper),0 0 0 6px var(--ink)}
  /* white-space:nowrap keeps the full name on a single line at most desktop
     plate widths. At the narrowest desktop sizes (around 1100px viewport,
     plate ≈ 440px wide, leaving ~240px for the .who-text after portrait +
     gap) the clamp's lower bound (22px) ensures the rendered string still
     fits within the available width. text-wrap:balance is replaced by
     nowrap — balance is irrelevant when we're forcing a single line. */
  .vF .plate h1{font-family:var(--serif);font-weight:600;font-size:clamp(22px,2.0vw,32px);line-height:1.04;letter-spacing:-.03em;margin:0 0 .4rem;white-space:nowrap}
  .vF .plate h1 em{font-style:normal;color:var(--accent);font-weight:400}
  .vF .plate .role{font-family:var(--mono);font-size:13px;letter-spacing:.06em;color:var(--ink-soft);line-height:1.5}
  .vF .plate .role b{color:var(--ink);font-weight:500}

  .vF .plate .subject{margin:0 -2.25rem -1rem;padding:2.25rem 2.25rem .75rem;border-top:1px solid var(--ink);display:flex;align-items:center;justify-content:center}
  .vF .plate .subject .triad{font-family:var(--serif);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.4rem .7rem;line-height:1.15}
  .vF .plate .subject .triad .r{font-size:clamp(17px,1.9vw,22px);font-weight:500;letter-spacing:-.015em;color:var(--ink);white-space:nowrap}
  .vF .plate .subject .triad .r em{font-style:normal;color:var(--accent);font-weight:600}
  .vF .plate .subject .triad .op{font-family:var(--serif);font-style:normal;font-weight:300;font-size:clamp(16px,1.7vw,20px);color:var(--accent);opacity:.85;line-height:1}

  /* Social links row — sibling of .who. Centered horizontally on all
     breakpoints so the five icons sit on the plate's centerline and read
     as a deliberate row rather than a leftover left-rail detail. */
  .vF .plate .social{display:flex;gap:.3rem;align-items:center;justify-content:center;padding-top:.75rem}
  .vF .plate .social a{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--rule);border-radius:50%;color:var(--ink-soft);background:var(--paper);transition:all .15s}
  .vF .plate .social a:hover{color:var(--paper);background:var(--ink);border-color:var(--ink);opacity:1}
  .vF .plate .social a svg{width:14px;height:14px;fill:currentColor}

  /* Bio block (new, above provenance) */
  .vF .plate .bio{font-family:var(--serif);font-size:20px;line-height:1.6;color:var(--ink);border-left:3px solid var(--accent);padding:.3rem 0 .3rem 1.1rem;font-weight:400;letter-spacing:-.005em;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  .vF .plate .bio b{color:var(--accent);font-weight:600;font-style:normal}

  /* Plate block heading — attached rule below text, bleeds to plate edges.
     Plate blocks are denser than hall sections (smaller rows, more stacked);
     a tighter rule-to-content gap reads cleaner. Total gap = h3 margin-bottom
     0.8rem + content padding-top 0.4rem = 1.2rem (about half the hall's). */
  .vF .plate .block h3{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:500;display:flex;justify-content:space-between;align-items:baseline;gap:1rem;
    padding:0 2.25rem 1rem;
    margin:0 -2.25rem 0.8rem;
    border-bottom:1px solid var(--rule)}
  .vF .plate .block h3 .cv-link{color:var(--ink-soft);font:inherit;letter-spacing:inherit;text-transform:inherit;border-bottom:1px solid transparent;padding-bottom:2px;transition:color .15s,border-color .15s}
  .vF .plate .block h3 .cv-link:hover{color:var(--accent);border-bottom-color:var(--accent);opacity:1}
  /* Rows: rule moved up to h3 border-bottom. Small padding-top (0.4rem) +
     h3 margin-bottom (0.8rem) = 1.2rem total gap — tight for plate density. */
  .vF .plate .rows{display:grid;gap:.15rem;margin:0 -2.25rem;padding:0.4rem 2.25rem 0}
  .vF .plate .row{display:grid;grid-template-columns:120px 1fr;gap:.9rem;padding:.65rem 0;border-top:1px dashed var(--rule);align-items:baseline}
  .vF .plate .row:first-child{border-top:0}
  .vF .plate .row .y{font-family:var(--mono);font-size:11px;color:var(--ink-soft);letter-spacing:.04em;padding-top:.15rem}
  .vF .plate .row .w b{font-family:var(--serif);font-weight:500;font-size:16px;line-height:1.25;color:var(--ink);letter-spacing:-.01em}
  .vF .plate .row .w em{font-style:normal;color:var(--ink-faint);font-size:13px;display:block;margin-top:.2rem;font-family:var(--serif);letter-spacing:-.005em;line-height:1.35}

  /* Full-width page-footer row: spans both stage columns, top border forms
     the page-end horizontal line, text left-aligned to the stage's left edge. */
  .vF .collection{grid-column:1 / -1;border-top:1px solid var(--rule);padding:1.5rem 2.25rem;font-family:var(--mono);font-size:13px;color:var(--ink-soft);letter-spacing:.06em;text-align:left;background:var(--paper)}

  /* Visitors section: wrap the map in a .vsection that carries the section-rule
     above it, with 2.25rem padding above the map — mirrors the label→line→content
     rhythm used by Selected Works. */
  .vF .vsection{border-top:1px solid var(--rule);padding-top:2.25rem}

  /* Map frame wraps the VMAP output so we can overlay a "tap for stats"
     hint in the corner. Relative positioning is inherited from .vmap
     already; the hint is absolutely positioned against this wrapper. */
  .vF .vmap-frame{position:relative;cursor:pointer}
  .vF .vmap-hint{position:absolute;right:.75rem;bottom:.75rem;z-index:5;
    font-family:var(--mono);font-size:11px;letter-spacing:.08em;
    color:var(--ink-soft);text-transform:lowercase;
    background:color-mix(in srgb,var(--paper) 88%,transparent);
    padding:.3rem .55rem;border:1px solid var(--rule);border-radius:var(--radius-sm);
    pointer-events:none;opacity:.85;transition:opacity .4s}
  .vF .vmap-frame[data-has-opened="true"] .vmap-hint{opacity:0}

  /* Stats panel — click-to-reveal via grid-template-rows 0fr↔1fr so the
     section expands to its natural height without a magic max-height.
     Inner content has overflow:hidden so it clips cleanly during collapse. */
  .vF .vstats-wrap{display:grid;grid-template-rows:0fr;opacity:0;
    transition:grid-template-rows .55s cubic-bezier(.2,.7,.2,1),
               opacity .45s cubic-bezier(.2,.7,.2,1),
               margin-top .4s cubic-bezier(.2,.7,.2,1);
    margin-top:0}
  .vF .vstats-wrap > .vstats{overflow:hidden;min-height:0}
  .vF .vstats-wrap[data-stats-open="true"]{grid-template-rows:1fr;opacity:1;margin-top:1.75rem}

  /* Three-column museum-label layout. Tighter than before — numbers
     smaller, padding reduced, vertical rhythm compressed so the panel
     feels like a caption card rather than a dashboard. */
  .vF .vstats{padding-top:1.5rem;border-top:1px solid var(--rule);display:grid;grid-template-columns:repeat(3,1fr);gap:0}
  .vF .vstats .block{padding:.15rem 1.5rem .15rem 0;border-right:1px solid var(--rule);display:flex;flex-direction:column;gap:.4rem;min-height:96px}
  .vF .vstats .block + .block{padding-left:1.5rem}
  .vF .vstats .block:last-child{border-right:0;padding-right:0}
  .vF .vstats .lbl{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
  /* Big number + inline unit, smaller than before (24–32px) to match the
     caption-card density. Baseline alignment keeps "8 days" as one beat. */
  .vF .vstats .big{font-family:var(--serif);font-weight:600;font-size:clamp(24px,2.4vw,32px);line-height:1;letter-spacing:-.028em;color:var(--ink);font-variant-numeric:tabular-nums lining-nums;display:flex;align-items:baseline;flex-wrap:wrap;gap:.35rem .5rem}
  .vF .vstats .big .unit{font-family:var(--mono);font-weight:400;font-size:.38em;letter-spacing:.02em;color:var(--ink-soft);text-transform:lowercase}
  .vF .vstats .since{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--ink-faint);margin-top:auto}
  /* Ranking — tighter, roman numerals slightly smaller, country names in
     small caps at a refined size. Opacity ladder still reinforces rank. */
  .vF .vstats .rank{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.3rem}
  .vF .vstats .rank li{display:grid;grid-template-columns:28px 1fr;align-items:baseline;gap:.55rem}
  .vF .vstats .rank .roman{font-family:var(--serif);font-weight:400;font-size:16px;letter-spacing:.04em;color:var(--accent)}
  .vF .vstats .rank .country{font-family:var(--serif);font-weight:500;font-size:clamp(13px,1.25vw,16px);line-height:1.15;letter-spacing:.02em;color:var(--ink);text-transform:uppercase;font-variant:small-caps}
  .vF .vstats .rank li:nth-child(2) .country{opacity:.82}
  .vF .vstats .rank li:nth-child(3) .country{opacity:.65}
  @media(max-width:900px){
    .vF .vstats{grid-template-columns:1fr;gap:1.25rem;padding-top:1.25rem}
    .vF .vstats .block{padding:0;border-right:0;border-bottom:1px solid var(--rule);padding-bottom:1rem;min-height:0}
    .vF .vstats .block:last-child{border-bottom:0;padding-bottom:0}
    .vF .vstats .block + .block{padding-left:0}
    .vF .vstats .big{font-size:28px}
    .vF .vmap-hint{font-size:11px;right:.5rem;bottom:.5rem;padding:.25rem .45rem}
  }

  /* Toolkit in left plate — tightened padding-top to match .rows (0.4rem),
     keeping parity across plate blocks. border-top:0 REQUIRED to override
     the unscoped .vF .skills rule below (which sets border-top:2px ink). */
  .vF .plate .skills{margin:0 -2.25rem;padding:0.4rem 2.25rem 0;display:grid;grid-template-columns:repeat(2,1fr);gap:0;border-top:0}
  /* justify-content:flex-start is explicit here to shadow a legacy
     .vF .skill rule further down that still sets justify-content:
     space-between. Without this override, a shorter-content cell in a
     grid row with a 2-line-title sibling would push its title text to
     the bottom of the cell (aligning with the tall sibling's wrapped
     2nd line) — reading as "text not top-aligned" in the Toolkit grid. */
  .vF .plate .skill{padding:.95rem .75rem;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;flex-direction:column;justify-content:flex-start;gap:.4rem;min-height:68px}
  .vF .plate .skill:nth-child(2n){border-right:0}
  /* Match the typography of .vF .plate .row .y / .row .w b — same ink-soft
     vs ink contrast, same letter-spacings, same line-height. The three plate
     blocks (Provenance, Where I've shown my work, Toolkit) now share one
     small-label-over-larger-content register. */
  .vF .plate .skill .n{font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:var(--ink-soft)}
  .vF .plate .skill .t{font-family:var(--serif);font-size:16px;line-height:1.25;letter-spacing:-.01em;color:var(--ink);font-weight:500}

  /* Right hall */
  .vF .hall{padding:3rem 2.75rem 3.5rem;display:flex;flex-direction:column}
  .vF .hall .intro{max-width:58ch;margin:0 0 2.5rem;font-family:var(--serif);font-size:20px;line-height:1.55;color:var(--ink);font-weight:400;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  .vF .hall .intro b{color:var(--accent);font-weight:600;font-style:normal}

  /* MOCK — section-head label with an attached rule bleeding to hall edges.
     Scoped to direct children of .hall so the colophon's nested section-head
     isn't affected (it has its own centered, rule-less treatment).
     Text-to-rule gap = 1rem; rule-to-content gap = 1.6rem via margin-bottom.
     Matches the plate .block h3 treatment below so left and right panels
     have identical heading rhythm. */
  .vF .section-head{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;margin:0}
  .vF .section-head span{color:var(--accent)}
  .vF .hall > .section-head{
    padding:0 2.75rem 1rem;
    margin:0 -2.75rem .75rem;
    border-bottom:1px solid var(--rule);
  }
  /* Widen the gap between consecutive hall sections — Current research → Selected works */
  .vF .hall > .section-head:not(:first-child){margin-top:1.75rem}
  /* First content after a hall section-head: drop its own border-top so the
     rule only appears once (attached to the section-head). Keep the natural
     padding-top — on .exhibit that padding becomes the visible top inset
     INSIDE the hover-blue background; zeroing it made the hover tint butt
     flush against the section-head rule, which read as wrong. */
  .vF .hall > .section-head + .research-grid,
  .vF .hall > .section-head + .exhibit{border-top:0}
  /* Standardize the section-head → first-content gap across both hall
     sections. Reference is Current research → first question:
       desktop  : section-head mb (.75) + research-grid pt (.5) + card pt (1.25) = 2.5rem
       mobile   : section-head mb (.6)  + research-grid pt (0)   + card pt (1.25) = 1.85rem
     Selected works' first exhibit inherits .exhibit padding-top:2.25rem on
     desktop (= 3rem total), so trim its first instance to 1.75rem so the
     gap math lands at the same 2.5rem. Mobile's .exhibit padding-top is
     already 1.25rem from the (max-width:640px) override below, so we scope
     this to (min-width:641px) and don't disturb mobile. */
  @media(min-width:641px){
    .vF .hall > .section-head + .exhibit{padding-top:1.75rem}
  }
  /* On mobile, the first card after a section-head gets a tighter padding-top
     so the visible gap between the underline rule and the first content line
     lands at ~16px (matches the plate-panel rhythm). Subsequent cards keep
     their normal padding so the hover-tint breathing inside each card stays
     intact — only the FIRST card sacrifices a bit of inset to anchor itself
     to the section heading. .section-head + .exhibit covers Selected works'
     first row; .section-head + .research-grid > .exhibit:first-child covers
     Current research's first card (which sits inside the .research-grid
     wrapper, not as a direct sibling of section-head). */
  @media(max-width:640px){
    .vF .hall > .section-head + .exhibit{padding-top:.4rem}
    .vF .hall > .section-head + .research-grid > .exhibit.research:first-child{padding-top:.4rem}
  }
  @media(max-width:640px){
    /* Tighter rule-to-content gap on phones — the rule itself reads as the
       section divider, so a generous 1.4rem below it pushed the first card
       too far away. .6rem keeps a clear breath without feeling disconnected. */
    .vF .hall > .section-head{padding:0 1.25rem 1rem;margin:0 -1.25rem .6rem}
    .vF .hall > .section-head:not(:first-child){margin-top:2.5rem}
  }

  .vF .exhibit{margin:0 -2.75rem;padding:2.25rem 2.75rem;border-top:1px solid var(--rule);display:grid;grid-template-columns:72px 1fr;gap:1.5rem;transition:background-color .2s ease}
  /* All section lines uniform: no heavier rule on the first exhibit, no terminal
     border on the last. The Visitors section-head then sits ABOVE the map's own
     top border — same pattern as Selected Works → first-exhibit-line. */
  /* Precomputed accent-soft (already blue at 15% alpha) — no runtime mix, no
     transition-path color interpolation. */
  .vF .exhibit:hover{background:var(--accent-soft)}
  .vF .exhibit .no{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--ink-faint);padding-top:.1rem}
  .vF .exhibit .no b{display:block;font-size:36px;letter-spacing:-.035em;color:var(--ink);margin-top:.25rem;font-family:var(--serif);font-weight:600;font-variant-numeric:lining-nums}
  /* Give the teaser more breathing room in 2-col so it never feels stamp-sized at the low end. */
  .vF .spec{display:grid;grid-template-columns:minmax(300px,1.25fr) 1fr;gap:1.75rem;align-items:start}
  .vF .spec .tsr{aspect-ratio:4/3;background:var(--paper-2);color:var(--accent);border:1px solid var(--rule);position:relative;overflow:hidden;border-radius:var(--radius-md)}
  /* Suppress the body-wide color/fill/stroke transitions inside the teaser —
     they were letting SVG currentColor animate through unintended hues on
     initial paint and render artifacts. Theme toggle still crossfades via the
     View Transitions API (modern browsers) or a hard swap (older ones). */
  .vF .spec .tsr,.vF .spec .tsr *{transition:none}
  .vF .spec .tsr svg{position:absolute;inset:0;width:100%;height:100%}
  /* text-wrap:pretty fills line 1 as long as possible (just avoids orphans),
     whereas :balance equalized line lengths and left right-margin whitespace
     — titles here read better when they use the full column width. */
  /* Unified with .exhibit.research .spec h3 — paper titles and research
     question titles share the same fluid clamp at all viewports so per-
     character size matches between the two sections. Research-question text
     is naturally longer than paper titles so the *block* sizes still differ,
     but at the glyph level the two registers are now identical. */
  .vF .spec h3{font-family:var(--serif);font-weight:500;font-size:clamp(16px, calc(12px + 0.55vw), 20px);line-height:1.22;letter-spacing:-.02em;margin:0 0 .6rem;text-wrap:pretty}
  .vF .spec h3 a{color:var(--ink);text-decoration:none;background-image:linear-gradient(var(--accent),var(--accent));background-repeat:no-repeat;background-size:0 1px;background-position:0 100%;transition:background-size .25s ease,color .15s}
  .vF .spec h3 a:hover{color:var(--accent);background-size:100% 1px;opacity:1}
  .vF .spec h3 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:var(--radius-sm)}
  .vF .spec .m{font-family:var(--mono);font-size:13px;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:.5rem}
  .vF .spec .m b{color:var(--accent);font-weight:500}
  /* Blurb: hidden by default so the author line sits right under the title; on
     hover, the card expands to reveal the abstract, pushing authors down. Off-
     hover collapses back. Uses the grid-template-rows 0fr↔1fr trick so the
     animation targets the real content height (no max-height magic number).
     Child gets overflow:hidden so it clips cleanly during the collapse. */
  .vF .spec .blurb-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s cubic-bezier(.2,.7,.2,1)}
  .vF .spec .blurb-wrap > p{overflow:hidden;opacity:0;transition:opacity .4s cubic-bezier(.2,.7,.2,1)}
  .vF .exhibit:hover .spec .blurb-wrap{grid-template-rows:1fr}
  .vF .exhibit:hover .spec .blurb-wrap > p{opacity:1}
  .vF .spec p{font-family:var(--serif);font-size:16px;line-height:1.6;color:var(--ink-soft);margin:0 0 .85rem;max-width:66ch;font-style:normal;font-weight:400;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  /* Touch / narrow viewports: keep the blurb COLLAPSED and let a tap open the
     .research-modal popout instead (wired in JS for both research cards and
     Selected works). iOS still emits a sticky :hover after a tap, so we
     explicitly cancel the inline hover-reveal here — otherwise the blurb
     would briefly expand before the modal appears. Viewport-width check is
     belt-and-suspenders alongside hover:none because some emulators (and
     mis-configured user agents) don't honor the hover media query. */
  @media (hover:none), (max-width:900px){
    .vF .exhibit:hover .spec .blurb-wrap{grid-template-rows:0fr}
    .vF .exhibit:hover .spec .blurb-wrap > p{opacity:0}
  }
  /* Touch affordance: on devices without a hover gesture, :hover still fires
     stickily on tap in many browsers (including Android Chrome). Cancel the
     sticky hover and replace with :active so the feedback fires only while the
     finger is down, not stuck on after lift. Also kill the iOS blue tap flash
     on interactive exhibits since we render our own active state. */
  @media (hover:none){
    .vF .exhibit{-webkit-tap-highlight-color:transparent}
    .vF .exhibit:hover{background:transparent}
    .vF .exhibit:active{background:var(--accent-soft)}
    .vF .exhibit.research:hover .spec h3 .t{color:inherit;background-size:0 1px}
    .vF .exhibit.research:active .spec h3 .t{color:var(--accent);background-size:100% 1px}
  }
  /* Reduced-motion: skip the transition, keep the blurb expanded so content
     isn't stuck behind a motion gate. */
  @media (prefers-reduced-motion:reduce){
    .vF .spec .blurb-wrap{grid-template-rows:1fr;transition:none}
    .vF .spec .blurb-wrap > p{opacity:1;transition:none}
  }
  /* Mobile / touch override — even with Reduce Motion enabled, the blurb
     belongs in the .research-modal popout (not inline) on touch devices.
     Without this carve-out the unscoped reduced-motion rule above wins on
     iPhones that have the system-wide Reduce Motion toggle on, and the
     abstract leaks back into the card. */
  @media (prefers-reduced-motion:reduce) and (hover:none),
         (prefers-reduced-motion:reduce) and (max-width:900px){
    .vF .spec .blurb-wrap{grid-template-rows:0fr}
    .vF .spec .blurb-wrap > p{opacity:0}
  }
  .vF .spec p::before{content:"“";color:var(--accent)}
  .vF .spec p::after{content:"”";color:var(--accent)}
  .vF .spec .au{font-size:13px;color:var(--ink-faint);line-height:1.5}
  .vF .spec .au b{color:var(--ink);font-weight:500}

  /* Visitors heatmap */
  .vF .visitors{margin:1.25rem -2.75rem 0;padding:.5rem 2.75rem 3rem}
  .vF .vmap{--vmap-blend:multiply;position:relative;aspect-ratio:2/1;width:100%;background:var(--paper-2);border:1px solid var(--rule);overflow:hidden}
  @media (prefers-color-scheme: dark){.vF .vmap{--vmap-blend:screen}}
  .vF .vmap svg{position:absolute;inset:0;width:100%;height:100%;display:block}
  .vF .vmap .land{fill:none;stroke:var(--ink);stroke-width:.3;opacity:.35;vector-effect:non-scaling-stroke}
  .vF .vmap .grat{fill:none;stroke:var(--ink);stroke-width:.15;opacity:.12;stroke-dasharray:.8 1.4;vector-effect:non-scaling-stroke}
  .vF .vmap .bloom circle,
  .vF .vmap .pools circle{fill:var(--accent);mix-blend-mode:var(--vmap-blend)}
  .vF .vlegend{display:flex;justify-content:space-between;align-items:baseline;margin-top:.9rem;font-family:var(--mono);font-size:11px;color:var(--ink-faint);letter-spacing:.04em}
  .vF .vlegend .scale{display:flex;align-items:center;gap:.5rem}
  .vF .vlegend .chip{width:14px;height:14px;background:var(--accent);border-radius:50%;display:inline-block}
  .vF .vlegend .chip.s1{opacity:.22}
  .vF .vlegend .chip.s2{opacity:.48}
  .vF .vlegend .chip.s3{opacity:.85}
  .vF .vtable{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:1rem;border-top:1px solid var(--rule)}
  .vF .vcity{padding:.7rem .7rem;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;flex-direction:column;gap:.25rem}
  .vF .vcity:nth-child(4n){border-right:0}
  .vF .vcity .cn{font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--ink-faint)}
  .vF .vcity .c{font-family:var(--serif);font-size:13px;color:var(--ink);line-height:1.2;letter-spacing:-.01em;font-weight:500}
  .vF .vcity .p{font-family:var(--mono);font-size:11px;color:var(--accent);letter-spacing:.04em}
  @media(max-width:720px){.vF .vtable{grid-template-columns:repeat(2,1fr)}.vF .vcity:nth-child(4n){border-right:1px solid var(--rule)}.vF .vcity:nth-child(2n){border-right:0}}

  .vF .room{margin-top:2.5rem}
  .vF .skills{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:2px solid var(--ink)}
  @media(max-width:720px){.vF .skills{grid-template-columns:repeat(2,1fr)}}
  .vF .skill{padding:1rem .8rem;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;flex-direction:column;justify-content:space-between;min-height:80px}
  .vF .skill:nth-child(3n),.vF .skill:last-child{border-right:0}
  @media(max-width:720px){.vF .skill{border-right:1px solid var(--rule)!important}.vF .skill:nth-child(2n){border-right:0!important}}
  .vF .skill .n{font-family:var(--mono);font-size:11px;letter-spacing:.08em;color:var(--ink-faint)}
  .vF .skill .t{font-family:var(--serif);font-size:16px;line-height:1.2;letter-spacing:-.005em;margin-top:.5rem;color:var(--ink)}

  .vF .hall .foot{margin:auto -2.75rem 0;padding:1.5rem 2.75rem 0;border-top:1px solid var(--ink);font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--ink-soft);display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;min-height:4.5rem}
  .vF .hall .foot a{color:var(--ink)}

  /* ── MOCK: Current research — 3-column card grid ──────────────────────────
     Three questions sit side-by-side as equal-width cards, each stacking
     teaser over text. Reads as a parallel set rather than a sequential list,
     which is the whole point of "three open questions" framing. Drops to
     single-column under 900px where the cards would become unreadable. */
  /* MOCK — Current research 3-column card grid. Compact version:
     16:9 teaser (shorter than 4:3), tighter inner gaps, 20px titles.
     Reduces each card's vertical footprint ~30% vs the previous pass. */
  .vF .research-grid{
    display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;
    margin:0 -2.75rem;padding:.5rem 2.75rem 0;
  }
  .vF .exhibit.research{
    display:flex;flex-direction:column;gap:.65rem;
    margin:0;padding:1.25rem 1rem 1rem;
    border-top:0;
    transition:background-color .2s ease;
  }
  /* "Question" label + big serif number — matches Selected works's
     "Exhibit 01" treatment so both sections share the same numbering
     grammar. Label in muted mono, number in heavy serif ink. */
  .vF .exhibit.research .no{
    display:block;padding:0;
    font-family:var(--mono);font-size:11px;letter-spacing:.1em;
    color:var(--ink-faint);text-transform:none;
  }
  .vF .exhibit.research .no b{
    display:block;margin:.25rem 0 0;
    font-family:var(--serif);font-weight:600;font-size:28px;
    letter-spacing:-.03em;color:var(--ink);
    font-variant-numeric:lining-nums;
    text-transform:none;
  }
  .vF .exhibit.research .spec{
    display:flex;flex-direction:column;gap:.75rem;height:100%;
  }
  .vF .exhibit.research .spec > div:last-child{
    display:flex;flex-direction:column;flex:1;
  }
  /* 16:9 teaser — ~112px tall at 200px wide, vs 150px for 4:3. */
  .vF .exhibit.research .spec .tsr{aspect-ratio:16/9;width:100%}
  /* Fluid typography: h3 and p scale continuously with viewport so resize
     feels smooth — no discrete size jumps at 1400/640 breakpoints. */
  .vF .exhibit.research .spec h3{
    font-size:clamp(16px, calc(12px + 0.55vw), 20px);line-height:1.22;letter-spacing:-.02em;margin:0 0 .4rem;
  }
  /* Sliding-underline on card hover — mirrors Selected works' h3 anchor treatment. */
  .vF .exhibit.research .spec h3 .t{
    background-image:linear-gradient(var(--accent),var(--accent));
    background-repeat:no-repeat;
    background-size:0 1px;
    background-position:0 100%;
    transition:background-size .25s ease, color .15s;
  }
  .vF .exhibit.research:hover .spec h3 .t{
    color:var(--accent);
    background-size:100% 1px;
  }
  /* Keyboard-focus affordance for the card. Only shows under :focus-visible
     (keyboard/programmatic), not :focus (which also fires on mouse click) —
     so mouse users don't see an outline flash after clicking. */
  .vF .exhibit.research:focus-visible{
    outline:2px solid var(--accent);
    outline-offset:4px;
    border-radius:var(--radius-md);
  }
  .vF .exhibit.research:focus-visible .spec h3 .t{color:var(--accent);background-size:100% 1px}
  .vF .exhibit.research .spec .m{font-size:13px;margin-bottom:.4rem;letter-spacing:.06em}
  /* Mixed-case, accent-colored — matches how Selected works renders its
     venue (e.g. "Nature · 2024" with "Nature" in accent blue). Both label
     registers now share the same color and same visual height as the rest
     of the line; the bold weight alone carries the emphasis. */
  .vF .exhibit.research .spec .m b{color:var(--accent);letter-spacing:.04em;font-weight:500}
  /* Research cards NEVER reveal the blurb on hover at any viewport — clicking
     opens the popout modal instead, where the full blurb lives. The base
     .vF .exhibit:hover .spec .blurb-wrap rule (which expands the blurb for
     Selected works) is suppressed here for research cards by specificity:
     .exhibit.research beats .exhibit, applied at all viewports without a
     media-query gate. */
  .vF .exhibit.research{cursor:pointer}
  .vF .exhibit.research:hover .spec .blurb-wrap{grid-template-rows:0fr}
  .vF .exhibit.research:hover .spec .blurb-wrap > p{opacity:0}
  .vF .exhibit.research .spec p{
    font-size:clamp(15px, calc(12.5px + 0.28vw), 16.5px);line-height:1.55;margin:.3rem 0 .65rem;
    max-width:none;text-align:left;font-style:normal;color:var(--ink);
  }
  .vF .exhibit.research .spec p::before,
  .vF .exhibit.research .spec p::after{content:none}
  .vF .exhibit.research .spec .au{
    font-size:11px;color:var(--ink-faint);margin-top:auto;line-height:1.45;
  }
  @media(max-width:1300px){
    .vF .research-grid{grid-template-columns:1fr;gap:1.25rem;padding-top:.5rem}
    /* 3-column grid with .no in a narrow left column NEXT TO the teaser:
       [Question 03] [teaser] [title + blurb]. display:contents on .spec
       lets its two children (.tsr, text wrapper) participate as direct
       grid items of the .exhibit.research grid. Teaser column is capped
       narrower (160px max) than the previous 33.33% flex-basis. */
    .vF .exhibit.research{
      display:grid;
      grid-template-columns:64px minmax(180px,260px) 1fr;
      gap:1.25rem;
      align-items:start;
    }
    .vF .exhibit.research .no{align-self:start;padding:0}
    .vF .exhibit.research .spec{display:contents}
    .vF .exhibit.research .spec .tsr{aspect-ratio:16/9;width:100%;align-self:start}
    .vF .exhibit.research .spec > div:last-child{display:flex;flex-direction:column}
  }
  @media(max-width:640px){
    /* padding-top:0 — gap below the section-head rule comes ONLY from the
       section-head's margin-bottom + the card's own padding-top, matching
       Selected works' rhythm so both sections look identically anchored. */
    .vF .research-grid{margin:0 -1.25rem;padding:0 1.25rem;gap:1.25rem}
    /* On phones, drop back to vertical stack (.no on top of teaser/text) —
       the 3-col [no | teaser | text] layout doesn't fit in <640px width. */
    .vF .exhibit.research{
      display:flex;
      flex-direction:column;
      grid-template-columns:none;
    }
    .vF .exhibit.research .spec{display:flex;flex-direction:column;gap:.75rem}
    /* Cap teaser width on mobile so it doesn't dominate the viewport.
       At ~360px viewport: card content ≈ 320px; max-width:240px keeps the
       teaser under ~75% of card width. Aspect-ratio 16/9 still applies, so
       at 240px wide the teaser is ~135px tall — about 1/3 of viewport
       height instead of 1/2. */
    .vF .exhibit.research .spec .tsr{flex:0 0 auto;aspect-ratio:16/9;width:100%;max-width:240px}
    .vF .exhibit.research .spec > div:last-child{flex:1 1 auto;display:flex;flex-direction:column}
    /* Bump h3 to the clamp max (20px) so titles aren't shrunken to 16px on
       mobile. Override the global .spec h3 clamp's lower bound. */
    .vF .exhibit.research .spec h3{font-size:20px;line-height:1.22}
  }
  /* At ≤1300 (stacked row layout), bleed the hover tint to the full row width
     so it reads as a selectable list item matching Selected works. At >1300
     the 3-col grid cards don't bleed — each card's hover tint stays within
     its own tile. */
  @media (hover:hover) and (min-width:641px) and (max-width:1300px){
    .vF .exhibit.research{
      margin:0 -2.75rem;
      padding:1.25rem 2.75rem 1rem;
    }
  }

  /* ── MOCK: Selected works rows ────────────────────────────────────────────
     3-column grid [Exhibit 01 | teaser | title+blurb] — same pattern as
     Current research. .no sits next to the teaser instead of stacked
     above the spec; teaser column is 220–320px (larger than the prior
     ~256px from the .spec 1fr:2fr ratio); text column takes the rest with
     a 66ch readability cap on the blurb (.spec p already has max-width).
     display:contents on .spec lets its two children participate as direct
     grid items of .exhibit:not(.research). */
  .vF .exhibit:not(.research){
    grid-template-columns:64px minmax(180px, 260px) 1fr;
    gap:1.5rem;
    padding:1.75rem 2.75rem;
    align-items:start;
  }
  .vF .exhibit:not(.research) .no{padding-top:.15rem;align-self:start}
  .vF .exhibit:not(.research) .no span{font-size:11px}
  .vF .exhibit:not(.research) .no b{font-size:28px;margin-top:.25rem;letter-spacing:-.03em}
  .vF .exhibit:not(.research) .spec{display:contents}
  .vF .exhibit:not(.research) .spec .tsr{aspect-ratio:16/9;width:100%;align-self:start}
  .vF .exhibit:not(.research) .spec > div:last-child{display:flex;flex-direction:column}
  .vF .exhibit:not(.research) .spec .m{font-size:13px;margin-bottom:.4rem}
  /* Fluid typography: same clamp as research for consistent resize behavior. */
  .vF .exhibit:not(.research) .spec h3{
    font-size:clamp(16px, calc(12px + 0.55vw), 20px);line-height:1.22;margin:0 0 .5rem;letter-spacing:-.02em;font-weight:500;
  }
  .vF .exhibit:not(.research) .spec p{
    font-size:clamp(15px, calc(12.5px + 0.28vw), 16.5px);line-height:1.55;margin:.35rem 0 .65rem;
  }
  .vF .exhibit:not(.research) .spec .au{font-size:13px;line-height:1.5}
  /* Narrow desktop (641–1100): tighter teaser column since the plate is
     stacked above the hall (per @media(max-width:1230px) elsewhere) but
     the hall card width can vary widely. Keep the 3-col [no | teaser |
     text] pattern; just tighten gaps. */
  @media(max-width:1100px){
    .vF .exhibit:not(.research){
      grid-template-columns:56px minmax(160px, 220px) 1fr;
      gap:1.25rem;
    }
    .vF .exhibit:not(.research) .no{padding-top:0}
  }
  @media(max-width:640px){
    /* Mobile: vertical stack — 3-col doesn't fit in <640px width. */
    .vF .exhibit:not(.research){
      display:flex;
      flex-direction:column;
      grid-template-columns:none;
      padding:1.25rem 1.25rem;
      gap:.85rem;
    }
    .vF .exhibit:not(.research) .no b{font-size:20px}
    .vF .exhibit:not(.research) .spec{display:flex;flex-direction:column;gap:1.05rem}
    /* Same teaser cap as Current research on mobile — keeps the teaser at
       ~75% of card width instead of full bleed, freeing vertical space. */
    .vF .exhibit:not(.research) .spec .tsr{flex:0 0 auto;aspect-ratio:16/9;width:100%;max-width:240px}
    .vF .exhibit:not(.research) .spec > div:last-child{flex:1 1 auto;display:flex;flex-direction:column}
    /* Bump h3 to clamp max (20px) on mobile so paper titles aren't shrunken. */
    .vF .exhibit:not(.research) .spec h3{font-size:20px;line-height:1.22}
  }

  /* ── MOCK: Floating card plate — content-height, no internal scroll ─────
     Plate is a floating inset card, content-driven height (align-self:start
     defeats grid's align-items:stretch). No sticky positioning and no
     internal scroll — plate scrolls with the page naturally, so a single
     page scroll moves both panels together. */
  @media(min-width:901px){
    .vF .stage{
      padding:16px;
      gap:16px;
      /* Reduce plate width slightly — 40% → 34% — to give the hall more
         room while keeping the plate's inner text sizes untouched. Min
         320px so the plate doesn't crunch at ~1000px viewports. */
      grid-template-columns:minmax(320px, 34%) 1fr;
    }
    .vF .plate{
      align-self:start;
      border:1px solid var(--rule);
      border-radius:var(--radius-lg);
      box-shadow:
        0 28px 56px -28px rgba(0,0,0,.22),
        0 12px 24px -12px rgba(0,0,0,.10),
        0 2px 4px rgba(0,0,0,.04);
    }
    @media (prefers-color-scheme:dark){
      .vF .plate{
        box-shadow:
          0 28px 56px -28px rgba(0,0,0,.55),
          0 12px 24px -12px rgba(0,0,0,.35),
          0 0 0 1px rgba(255,255,255,.02) inset;
      }
    }
  }

  /* ── MOCK: Colophon (demoted Site stats) ───────────────────────────────────
     A collapsible near-footer section holding the visitor map + stats panel.
     Uses the same grid-template-rows 0fr↔1fr pattern as the mobile plate
     blocks, but applies at ALL viewports — the point is to demote this
     whole block across the board, not just on mobile.
     The existing .visitors child keeps its internal layout; we only add the
     outer toggle mechanism. */
  .vF .colophon{margin:3rem -2.75rem 0;padding:0 2.75rem;border-top:0}
  /* Centered section-head — colophon reads as a quiet centered epilogue,
     not a left-aligned labeled section. justify-content:center pulls label
     and chevron toward the middle; border-bottom is dropped so the only
     visual cue is the centered text + toggle glyph. */
  .vF .colophon > .section-head{cursor:pointer;user-select:none;margin:0;padding:1.4rem 0;
    display:flex;align-items:baseline;justify-content:center;gap:.75rem;
    border-bottom:0;
    transition:padding-bottom .35s cubic-bezier(.2,.7,.2,1)}
  .vF .colophon > .section-head .hint{font-family:var(--mono);font-size:11px;
    letter-spacing:.04em;color:var(--ink-faint);text-transform:none;font-weight:400}
  .vF .colophon > .section-head .chevron{display:inline-block;font-family:var(--mono);
    font-size:13px;line-height:1;color:var(--ink-soft);font-weight:500;margin-left:.4rem}
  .vF .colophon > .section-head .chevron::before{content:"+"}
  .vF .colophon[data-open="true"] > .section-head .chevron::before{content:"−"}
  .vF .colophon[data-open="true"] > .section-head{padding-bottom:.4rem}
  .vF .colophon-body{display:grid;grid-template-rows:0fr;
    transition:grid-template-rows .5s cubic-bezier(.2,.7,.2,1),
               opacity .4s cubic-bezier(.2,.7,.2,1),
               margin-top .35s cubic-bezier(.2,.7,.2,1);
    opacity:0;margin-top:0}
  .vF .colophon-body > .inner{overflow:hidden;min-height:0}
  .vF .colophon[data-open="true"] .colophon-body{grid-template-rows:1fr;opacity:1;margin-top:1.5rem}
  /* Neutralize the old .visitors top margin so it sits cleanly inside the inner wrapper. */
  .vF .colophon .visitors{margin-top:0;padding-top:0}
  .vF .colophon .visitors > .section-head{display:none}
  @media(max-width:640px){
    .vF .colophon{margin:2rem -1.25rem 0;padding:0 1.25rem}
    .vF .colophon > .section-head{padding-top:1.25rem}
  }

  /* Stack publications (teaser above text) while the hall is narrow.
     3:2 stacked aspect is closer to the 4:3 2-col aspect than 16:9 would be,
     so the shape hop across the breakpoint is less jarring.
     Breakpoint raised from 1100→1360 so side-by-side only kicks in when the
     right hall is genuinely wide enough for a readable teaser + text column;
     below that the stacked layout is the more comfortable read. */
  @media(max-width:1360px){
    .vF .spec{grid-template-columns:1fr;gap:1.25rem}
    .vF .spec .tsr{aspect-ratio:3/2}
  }
  /* Tablet/narrow-desktop range: drop blurb justification — with only ~10
     tokens per line the justify algorithm produces visible rivers. Left-align
     reads cleaner here. Desktop wide (>1230px) keeps justify where the line
     has enough words to balance naturally. */
  @media(max-width:1230px){
    .vF .spec p{text-align:left}
    /* Plate-narrow layout fix — between mobile (≤640px) and full desktop
       (>1230px), the plate column is at its 40% allotment but doesn't have
       enough width for portrait + nowrap h1 side-by-side. The threshold
       1230px is set so the plate-content width (40vw − 72px ≈ 420px) is
       always ≥ portrait + gap + name (~410px); below that, we stack the
       portrait above the name (same pattern as the mobile breakpoint) so
       the name takes the full plate-content width and never overflows
       into the hall. The bio drops justification for the same reason —
       narrow columns produce rivers under justify+hyphens. */
    .vF .plate .who{flex-direction:column;align-items:center;text-align:center;gap:.85rem}
    .vF .plate .who-text{align-items:center;text-align:center;min-width:0}
    .vF .plate .pic{width:108px;height:108px;min-width:108px;min-height:108px}
    .vF .plate .bio{text-align:left}
  }
  /* Belt-and-suspenders against any future overflow: prevent the plate from
     ever painting outside its grid column. If something inside still demands
     more width than the column provides (e.g. a long unbreakable token), it
     gets clipped at the column edge rather than bleeding into the hall. */
  .vF .plate{overflow:hidden}

  /* ── Mobile (≤640px) ── tighter padding, smaller portrait, smaller display type,
     and shrunk edge-to-edge negative margins so content doesn't overhang the viewport. */
  @media(max-width:640px){
    .vF .plate{padding:1.75rem 1.25rem 2rem;gap:1.5rem;border-right:none;border-bottom:1px solid var(--rule)}
    .vF .hall{padding:1.75rem 1.25rem 2.5rem}

    /* Mobile .who: center the group tight against its own content. We
       reset min-height (desktop uses a clamp floor so the pic can
       stretch to a reasonable size) because on mobile the pic is
       fixed at 72px and any extra row height would show as empty
       padding above/below the headshot. */
    .vF .plate .who{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:1rem;min-height:0}
    /* Center the text column's own children (name, role, social) so the
       horizontal centering of the outer group cascades all the way down.
       min-width:0 resets the desktop 280px wrap-trigger floor — on mobile
       the pic is already 72px and there's ample room to keep pic + text
       on one row against the full-width plate, so we want NO wrap. */
    .vF .plate .who-text{min-height:0;min-width:0;align-items:center;text-align:center}
    /* Headshot trimmed to 72px on mobile. At 88 the headshot + name column
       filled the plate edge-to-edge, leaving no breathing room for the
       centering to read visually. 72px hands back ~15px per side, enough
       for the group to feel set in the middle of the card. */
    .vF .plate .pic{width:72px;height:72px;min-width:0;min-height:0;max-width:none;aspect-ratio:auto;flex-shrink:0;box-shadow:0 10px 20px -14px rgba(0,0,0,.3),0 0 0 3px var(--paper),0 0 0 4px var(--ink)}
    .vF .plate h1{font-size:clamp(26px,7vw,32px);line-height:1.1;letter-spacing:-.02em;margin:0 0 .25rem}
    .vF .plate .role{font-size:13px;line-height:1.45}

    /* Mobile bumps icon spacing slightly. Centering is inherited from the
       base rule (justify-content:center applies everywhere). */
    .vF .plate .social{gap:.35rem;padding-top:.75rem}
    .vF .plate .social a{width:40px;height:40px}
    .vF .plate .social a svg{width:15px;height:15px}

    .vF .plate .subject{margin:0 -1.25rem -1rem;padding:1.5rem 1.25rem .5rem}
    .vF .plate .subject .triad{gap:.3rem .55rem}
    .vF .plate .subject .triad .r{font-size:16px}
    .vF .plate .subject .triad .op{font-size:16px}

    /* On narrow screens, justified text creates rivers — fall back to left alignment. */
    .vF .plate .bio{font-size:16px;line-height:1.55;padding:.2rem 0 .2rem .9rem;border-left-width:2px;text-align:left}

    .vF .plate .row{grid-template-columns:90px 1fr;gap:.65rem;padding:.55rem 0}
    .vF .plate .row .y{font-size:11px}
    .vF .plate .row .w b{font-size:16px}
    .vF .plate .row .w em{font-size:13px}

    .vF .plate .skills{margin:0 -1.25rem;padding:0 1.25rem}
    .vF .plate .skill{padding:.75rem .65rem;min-height:58px}
    .vF .plate .skill .t{font-size:16px}

    /* Mobile audit: reduce inter-block flex gap inside the plate. Desktop
       2rem read as deliberate "section breathers" alongside its column;
       stacked vertically each 2rem is just dead air between panels. 1.25rem
       keeps each panel feeling distinct without bloating scroll length. */
    .vF .plate{gap:1.25rem}
    /* Mobile audit: trim the .subject (Cells ∩ Pixels ∩ Code) padding so
       the triad sits closer to its top rule. Margin shorthand kept intact
       below to preserve the horizontal bleed and the negative-bottom that
       overlaps the social row that follows. */
    .vF .plate .subject{padding:1rem 1.25rem .35rem}


    /* Keep section-head visually aligned with the plate block h3 on mobile.
       The two labels (PROVENANCE / SELECTED WORKS) sit in adjacent sections
       of the stacked layout; matching font-size + letter-spacing makes them
       read as one typographic register rather than two competing scales. */
    .vF .section-head{margin:0 0 1.25rem;font-size:11px;letter-spacing:.14em}
    /* Reduce the whitespace between a plate section's top rule and its first
       row. 2.25rem was tuned for the desktop plate padding (2.25rem horizontal)
       — on mobile the plate is only 1.25rem horizontally, so matching rhythm
       means pulling the vertical padding in too. */
    /* Tightened plate-panel internal rhythm on mobile — old 1.25rem skill-pad
       + 1rem h3 mb gave a ~36px gap between the panel underline and S.01 that
       the user flagged as too tall. New rhythm targets ~1rem total. The
       collapsible-aware override below uses the same numbers so open/close
       state doesn't snap. */
    .vF .plate .block .rows,
    .vF .plate .block .skills{padding-top:.5rem}
    /* Mobile-tightened h3 margin-bottom — applied at ALL collapse states (not
       just open) so the section underline doesn't shift on click. */
    .vF .plate .block[data-collapsible] > h3{margin-bottom:.5rem}
    .vF .exhibit{margin:0 -1.25rem;padding:1.75rem 1.25rem;grid-template-columns:44px 1fr;gap:.9rem}
    .vF .exhibit .no{font-size:11px}
    .vF .exhibit .no b{font-size:20px;margin-top:.15rem}
    .vF .spec{gap:1rem}
    .vF .spec .tsr{aspect-ratio:3/2}
    .vF .spec h3{font-size:20px;line-height:1.25}
    .vF .spec .m{font-size:11px}
    .vF .spec p{font-size:16px;line-height:1.55;text-align:left;max-width:none}
    .vF .spec .au{font-size:13px}

    .vF .visitors{margin:1rem -1.25rem 0;padding:.5rem 1.25rem 2rem}
    .vF .vtable{grid-template-columns:repeat(2,1fr)}
    .vF .vcity{padding:.6rem .6rem}
    .vF .vcity:nth-child(4n){border-right:1px solid var(--rule)}
    .vF .vcity:nth-child(2n){border-right:0}

    .vF .hall .foot{margin:auto -1.25rem 0;padding:1.1rem 1.25rem 0;gap:1.25rem;font-size:11px;min-height:auto}
  }

  /* ── Plate-block collapse (all viewports) ──
     Provenance / Talks / Toolkit become click-to-expand sections at all
     viewports. The hide-by-default behavior on desktop lets the left plate
     read as a tight identity column (portrait, thesis, bio, Provenance) with
     supporting context behind affordances — Talks and Toolkit don't
     compete with the first paper teaser for vertical attention.

     IMPORTANT: the .block stays a plain flex-item (NOT a grid). The animation
     lives on .block-body via grid-template-rows: 0fr ↔ 1fr, which animates the
     actual rendered height (the grid track resolves to the item's natural
     content size), making open and close feel symmetric. An earlier max-height
     version felt "too sudden" on open: with max-height 0→1200px against a
     ~200px body, visible height saturates after ~17% of the duration while
     the limit value continues invisibly to the end. grid-template-rows has no
     such limit/visible split — every frame of the transition does visible
     work. Putting the grid on .block-body (not .block) keeps the h3 a sibling
     of the body, in plain flex flow, so its border-bottom (the section
     underline) is anchored to its own border edge and never participates in
     the animation. */
  .vF .plate .block[data-collapsible] > .block-body{
    display:grid;
    grid-template-rows:0fr;
    overflow:hidden;
    transition:grid-template-rows .4s cubic-bezier(.2,.7,.2,1);
  }
  .vF .plate .block[data-collapsible][data-open="true"] > .block-body{grid-template-rows:1fr}
  /* The single grid item inside .block-body (the .rows or .skills container)
     needs:
       • min-height:0 so it can collapse below its intrinsic content height
         when the track shrinks to 0fr.
       • align-self:start so the item keeps its NATURAL height regardless of
         the animated grid-track size. Without align-self:start, the item
         stretches to match the track (default stretch behavior); during the
         animation that means the item is shorter than its natural content,
         and any internal grid auto-rows compress to fit — visibly shifting
         the first row's border-bottom downward as the track grows. With
         align-self:start, the item stays at content height; the parent
         track grows around it and overflow:hidden on .block-body clips the
         overflow. Cell borders never move. */
  .vF .plate .block[data-collapsible] > .block-body > *{min-height:0;align-self:start}
  /* Heading is the click target. h3 stays in plain block flow with its
     default margin/padding/border-bottom — no animation touches it, so the
     section underline stays anchored. */
  .vF .plate .block[data-collapsible] > h3{cursor:pointer;user-select:none}
  /* Chevron sits at the right edge of the h3. Uses a "+" ↔ "−" content swap
     rather than a transform, so the glyph itself changes character — more
     legible than a rotated plus at small sizes. Plain mono glyph, same
     family/weight as the heading so it reads as typography rather than a
     button badge. */
  .vF .plate .block[data-collapsible] .h-actions{display:inline-flex;align-items:baseline;gap:.75rem}
  .vF .plate .block[data-collapsible] .chevron{display:inline-block;font-family:var(--mono);font-size:13px;line-height:1;color:var(--ink-soft);font-weight:500;margin-left:.4rem;letter-spacing:0}
  .vF .plate .block[data-collapsible] .chevron::before{content:"+"}
  .vF .plate .block[data-collapsible][data-open="true"] .chevron::before{content:"−"}
  /* Rows/skills sit flush against the top of .block-body — no padding-top.
     A previous version added padding-top:.5rem here, which created a brief
     visual stage during the open animation: first ~8px of empty padding
     appeared, then the first row of cells appeared. That two-stage reveal
     read as a "secondary expansion of the first row". With padding-top:0,
     the cell area starts exactly at the top of the body and the grid-track
     reveal looks like a single motion. */
  .vF .plate .block[data-collapsible] .rows,
  .vF .plate .block[data-collapsible] .skills{padding-top:0}
  /* Mobile teaser polish — bump stroke-width on the diagram strokes so the
     line-drawings don't feel spidery at small screen sizes. Native SVG stroke
     attributes on each shape still win over this, but for the strokes that
     inherit (circles, most paths), the inherited weight comes up. Also signal
     tap affordance: cursor:pointer + a subtle active-state dim so tapping the
     teaser to replay the draw feels intentional. */
  @media (hover:none), (max-width:900px){
    .vF .spec .tsr{cursor:pointer;-webkit-tap-highlight-color:transparent}
    .vF .spec .tsr:active{opacity:.92}
    .vF .spec .tsr svg g[fill="none"]{stroke-width:1.2}
  }

  /* Disable automatic hyphenation on mobile body text. The justified desktop
     layout uses hyphens:auto to avoid rivers, but mobile switches those same
     paragraphs to text-align:left (at the 1000px / 640px breakpoints), which
     doesn't need hyphens — and auto-hyphenation there produces awkward mid-
     word breaks like "tis-sue architecture", "di-verse immune", "gluten-de-
     pendent", "princi-ple". Left-aligned ragged-right is the right look. */
  @media (max-width:900px){
    .vF .plate .bio,
    .vF .hall .intro,
    .vF .spec p{hyphens:manual;-webkit-hyphens:manual}
  }

  /* Ultra-small screens (≤380px): shave horizontal padding so nothing feels cramped. */
  @media(max-width:380px){
    .vF .plate{padding:1.5rem 1rem 1.75rem;gap:1.25rem}
    .vF .hall{padding:1.5rem 1rem 2.25rem}
    .vF .plate .who{gap:.85rem}
    .vF .plate .subject{margin:0 -1rem -1rem;padding:1.25rem 1rem .5rem}
    .vF .plate .skills{margin-left:-1rem;margin-right:-1rem;padding-left:1rem;padding-right:1rem}
    .vF .exhibit{margin:0 -1rem;padding:1.5rem 1rem}
    .vF .visitors,.vF .hall .foot{margin-left:-1rem;margin-right:-1rem;padding-left:1rem;padding-right:1rem}
    .vF .plate h1{font-size:clamp(24px,7.2vw,28px)}
    .vF .plate .row{grid-template-columns:78px 1fr;gap:.55rem}
  }

  /* Keep the floating theme toggle out of iOS home-indicator zone */
  @supports(padding:max(0px)){
    #theme-toggle{right:max(.75rem,env(safe-area-inset-right));bottom:max(.75rem,env(safe-area-inset-bottom))}
  }

  /* ── Research modal: click a research card (at 3-col view) → glass pop-out.
     Dialog uses a semi-transparent paper background + backdrop-filter blur to
     produce a frosted-glass look. Teaser sits on the left, text body on the
     right. Below 700px the dialog collapses to a single column. */
  /* Suppress the page's edge-pulse glows (.scroll-glow.top/.bottom) while a
     modal is open. They live in the top-level HTML at z-index 140, below the
     modal's z-index 200, but the modal's backdrop-filter:blur(...) re-samples
     the layers behind it — so an accent-blue glow visible at z<200 still
     leaks into the blurred backdrop and reads as "blue hue at top". The
     marker class is added/removed by lockBodyScroll/unlockBodyScroll. */
  /* display:none (rather than visibility:hidden) takes the .scroll-glow
     elements out of layout entirely — the backdrop-filter blur cannot
     re-sample what isn't rendered, so even if a stale at-top class
     somehow survived our explicit clear in unlockBodyScroll, no animation
     can paint blue into the modal's blurred backdrop. The page's onScroll
     handler also bails early when modal-open is set (see index.html), so
     this is layered defense-in-depth: handler-level suppression of the
     trigger + render-level removal of the target. */
  body.modal-open .scroll-glow{display:none!important}
  .research-modal{
    position:fixed;inset:0;z-index:200;
    display:flex;align-items:flex-start;justify-content:center;
    padding:5vh 1rem;overflow-y:auto;
    pointer-events:none;
    /* Block both scroll chaining AND the overscroll rubber-band bounce on
       the modal itself. The previous "contain" only stopped the chain — on
       iOS Safari the modal's own bounce still revealed the page (and the
       page's blue-tinted top region) above the dialog when the user
       scrolled past the top of the modal content. "none" suppresses the
       bounce as well. */
    overscroll-behavior:none;
    /* iOS safe-area padding so close button isn't under the notch/bar. */
    padding-top:max(5vh, env(safe-area-inset-top));
  }
  .research-modal[data-open="true"]{pointer-events:auto}
  /* Fade the pre-blurred layer in via opacity. The blur amount itself stays
     constant (10px) — only the layer's visibility ramps. Opacity transitions
     are smooth in every browser, while interpolating backdrop-filter blur
     amount snaps in many engines. */
  .research-modal-backdrop{
    position:fixed;inset:0;
    /* Paper-tinted overlay on top of the blur — pure-blur backdrops let
       saturated colors (the page's --accent in section headings, labels,
       and the Cells ∩ Pixels ∩ Code triad) leak through as visible color
       smears, especially the blue tint that read at the top of the modal.
       A 35% paper layer mutes the underlying chroma without making the
       backdrop feel like a flat opaque sheet. */
    background:color-mix(in srgb, var(--paper) 35%, transparent);
    backdrop-filter:blur(14px) saturate(70%);
    -webkit-backdrop-filter:blur(14px) saturate(70%);
    opacity:0;
    transition:opacity .35s cubic-bezier(.2,.7,.2,1);
    will-change:opacity;
  }
  .research-modal[data-open="true"] .research-modal-backdrop{opacity:1}
  .research-modal-dialog{
    position:relative;max-width:880px;width:100%;
    display:grid;
    grid-template-columns:minmax(280px, 360px) 1fr;
    gap:2rem;
    align-items:center;
    color:var(--ink);
    /* Translucent paper sheet over a frosted-glass blur. The dialog samples
       through to the already-blurred backdrop; its own backdrop-filter
       compounds the blur so page color/texture reads as a soft frost rather
       than a recognizable layout. Paper-mix at 10% — near-glass, with a
       54px blur and 170% saturation to hold legibility. Border at 36% --ink
       so the edge keeps definition against the very translucent fill. */
    background:color-mix(in srgb, var(--paper) 10%, transparent);
    backdrop-filter:blur(54px) saturate(170%);
    -webkit-backdrop-filter:blur(54px) saturate(170%);
    border:1px solid color-mix(in srgb, var(--ink) 36%, transparent);
    border-radius:var(--radius-lg);
    padding:2.5rem 1.85rem 2.25rem;
    box-shadow:0 40px 80px -20px rgba(0,0,0,.4), 0 16px 40px -10px rgba(0,0,0,.22);
    opacity:0;
    /* iOS-app-open feel: starts at 85% (more visible "growth" than the
       prior 92%) and uses Apple's signature easeOutQuint-ish curve so the
       dialog accelerates into view, then decelerates into a soft landing.
       Duration .42s is long enough to read as "gradually enlarged" rather
       than "popped" — matches the perceived rhythm of an iOS app launch
       from icon to fullscreen. Opacity finishes ~.32s, slightly before the
       transform settles, so the dialog visually "lands" in opaque form
       rather than fading the last few percent of scale. */
    transform:scale(.85);
    transform-origin:center center;
    transition:opacity .32s cubic-bezier(.32,.72,0,1), transform .42s cubic-bezier(.32,.72,0,1);
    will-change:opacity, transform;
  }
  .research-modal[data-open="true"] .research-modal-dialog{opacity:1;transform:scale(1)}
  /* Closing phase: JS sets data-closing="true" just before flipping data-open
     to false. The faster, ease-in curve gives dismissal a "get out of the way"
     feel — exits should feel faster than entrances. */
  .research-modal[data-closing="true"] .research-modal-backdrop{
    transition:opacity .22s cubic-bezier(.4,0,1,1);
  }
  /* "Throw back" dismiss — the dialog accelerates AWAY (smaller scale than
     the base 0.85) so it feels like it's being flung back into the page,
     not just sliding back to its starting size. The curve cubic-bezier(.55,
     0, 1, .45) is Apple's "emphasizedAccelerate" — slow initial pull-back,
     then strong acceleration through the rest, which is the visual
     signature of a fling/toss motion. Opacity finishes ~.06s before the
     transform so the dialog has already faded to invisible by the time it
     reaches its smallest scale, hiding the discontinuity at animation end. */
  .research-modal[data-closing="true"] .research-modal-dialog{
    transition:opacity .2s cubic-bezier(.55,0,1,.45), transform .26s cubic-bezier(.55,0,1,.45);
    transform:scale(.55);
    opacity:0;
  }
  /* Reduced-motion: strip the scale+slide and cut transitions to a short
     opacity-only fade. Matches the pattern used elsewhere in this file — we
     still show the state change (needed for affordance) but skip the movement
     that causes vestibular trouble. */
  @media (prefers-reduced-motion:reduce){
    .research-modal-backdrop,
    .research-modal[data-closing="true"] .research-modal-backdrop{
      transition:opacity .15s linear;
    }
    .research-modal-dialog,
    .research-modal[data-closing="true"] .research-modal-dialog{
      transform:none;
      transition:opacity .15s linear;
    }
    .research-modal[data-open="true"] .research-modal-dialog{transform:none}
  }
  /* Glass close button — 36px circular disc with a frosted fill that
     auto-adapts between light and dark mode. Background uses --ink (the
     theme-flipping foreground color) at 18% opacity rather than --paper:
     in light mode this produces a soft dark disc on a light backdrop
     (visible); in dark mode it produces a soft light disc on a dark
     backdrop (also visible). Using --paper would have made the disc match
     the backdrop in both modes — the failure mode the user just observed.
     backdrop-filter blur+saturate gives the iOS frosted-glass look so the
     teaser content visible behind the disc is diffused, not obscured. The
     ::after pseudo extends the hit area to ~46px while keeping the visible
     disc small. */
  .research-modal-close{
    position:absolute;
    top:.6rem;
    right:.6rem;
    width:34px;
    height:34px;
    /* Quieter glass — toned down from the prior "Liquid Glass" treatment so
       the disc reads as part of the dialog surface rather than a separate
       floating control. The glass signature is preserved (gradient fill +
       inset highlight) but at lower intensity, and the drop shadow is
       removed so the disc sits on the panel instead of hovering above it. */
    background:linear-gradient(160deg,
      rgba(255,255,255,.10) 0%,
      rgba(255,255,255,.01) 55%,
      rgba(255,255,255,.04) 100%);
    backdrop-filter:blur(5px) saturate(140%);
    -webkit-backdrop-filter:blur(5px) saturate(140%);
    border:1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    border-radius:50%;
    font-size:20px;
    font-weight:300;
    line-height:1;
    color:color-mix(in srgb, var(--ink) 50%, transparent);
    cursor:pointer;
    padding:0;
    transition:background-color .15s ease, transform .12s ease, border-color .15s ease, color .15s ease;
    z-index:2;
    display:flex;align-items:center;justify-content:center;
    -webkit-tap-highlight-color:transparent;
    /* Subtle inset only — no drop shadow. The faint top highlight is enough
       to suggest "glass" without making the disc feel like a separate
       3D object floating above the dialog. */
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.22),
      inset 0 -1px 0 color-mix(in srgb, var(--ink) 5%, transparent);
  }
  .research-modal-close::after{
    content:'';
    position:absolute;
    inset:-6px;
  }
  .research-modal-close:hover{
    background:linear-gradient(160deg,
      rgba(255,255,255,.18) 0%,
      rgba(255,255,255,.03) 55%,
      rgba(255,255,255,.08) 100%);
    border-color:color-mix(in srgb, var(--ink) 22%, transparent);
    color:var(--ink);
  }
  .research-modal-close:active{transform:scale(.9)}
  /* Modal lives OUTSIDE the .vF wrapper, so the global .vF button:focus-visible
     outline at the top doesn't reach it — declare its own focus ring here. */
  .research-modal-close:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
  .research-modal-teaser{
    aspect-ratio:16/9;
    background:color-mix(in srgb, var(--paper-2) 55%, transparent);
    border:1px solid color-mix(in srgb, var(--ink) 10%, transparent);
    border-radius:var(--radius-md);
    position:relative;overflow:hidden;
    color:var(--accent);
    width:100%;
  }
  .research-modal-teaser svg{position:absolute;inset:0;width:100%;height:100%}
  .research-modal-body{min-width:0;display:flex;flex-direction:column}
  /* Modal kind label — same register as the card's .m b "Biology"/"Method"/
     "Analysis" tag: accent blue, mixed case, matched to body x-height (no
     text-transform). The reader sees the same label twice (card + modal)
     in the same color, same case — visual continuity from card to popout. */
  .research-modal-kind{font-family:var(--mono);font-size:13px;letter-spacing:.04em;color:var(--accent);font-weight:500;margin:0 0 .55rem}
  .research-modal-dialog h3{font-family:var(--serif);font-size:clamp(20px, calc(16px + 0.5vw), 26px);font-weight:500;line-height:1.25;letter-spacing:-.02em;color:var(--ink);margin:0 0 .9rem;padding-right:2rem}
  .research-modal-blurb{font-family:var(--serif);font-size:clamp(15px, calc(13px + 0.25vw), 16.5px);line-height:1.6;color:var(--ink-soft);margin:0;text-align:justify;hyphens:auto;-webkit-hyphens:auto}
  /* Optional CTA below the blurb. Used by Selected works modal entries to
     surface the paper link that would otherwise live on the card's title.
     Hidden via [hidden] for entries without a link (e.g. Current research). */
  .research-modal-link{margin-top:1.1rem;font-family:var(--mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--ink-faint);padding-bottom:2px;align-self:flex-start;transition:color .15s ease, border-color .15s ease}
  .research-modal-link:hover{color:var(--accent);border-bottom-color:var(--accent)}
  .research-modal-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
  @media(max-width:700px){
    /* Dialog padding-top bumped from 1.4rem → 2.75rem so the close X has a
       dedicated zone ABOVE the teaser instead of overlapping it. With the X
       at 32px = 2rem, sitting at top:.4rem, its bottom edge lands at 2.4rem
       — leaves a ~5.6px gap between the X and the teaser's top border. The
       horizontal padding stays 1.25rem; only the top is bumped. */
    .research-modal-dialog{grid-template-columns:1fr;gap:1.1rem;padding:2.75rem 1.25rem 1.1rem}
    /* X pushed harder into the corner (.4rem from top/right vs prior .55)
       and shrunk slightly (32px vs 34) so it sits cleanly in the new
       dedicated padding-top zone. Hit area still ~42px via the ::after
       pseudo defined in the base rule. */
    .research-modal-close{top:.4rem;right:.4rem;width:30px;height:30px;font-size:20px}
  }
  /* Mobile modal — vertically center the dialog when it fits, fall back to
     top-align with scroll when content is taller than the viewport. The
     "safe" keyword on align-items is the modern way to express that
     fallback in flexbox; without it, an over-tall dialog clips at the top
     instead of scrolling. Padding kept tight (1rem) but expanded to
     safe-area-inset on top/bottom so the close button isn't under the
     notch and the dialog isn't hidden by the iOS home indicator. */
  @media(max-width:640px){
    .research-modal{
      padding:1rem .75rem;
      padding-top:max(1rem, env(safe-area-inset-top));
      padding-bottom:max(1rem, env(safe-area-inset-bottom));
      align-items:safe center;
    }
  }

  `;
  const specs = J.pubs.map((p,i)=>{
    const title = p.link
      ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`
      : p.title;
    // Stagger publications AFTER the research cards finish rising.
    // Research cards use 40ms stagger ending at ~560ms; Selected-works head
    // at 620ms; first exhibit starts at 680ms.
    const delay = 680 + i*80;
    return `
    <article class="exhibit" data-rise style="--d:${delay}ms">
      <div class="no"><span>Exhibit</span><b>${String(i+1).padStart(2,'0')}</b></div>
      <div class="spec">
        <div class="tsr">${TEASER(p.teaser)}</div>
        <div>
          <div class="m"><b>${p.venue}</b> · ${p.year}</div>
          <h3>${title}</h3>
          <div class="blurb-wrap"><p>${p.blurb}</p></div>
          <div class="au">${p.authors}</div>
        </div>
      </div>
    </article>`;
  }).join('');

  // MOCK — Current research in a 3-column grid wrapper. Same .exhibit/.spec
  // markup so the draw-in animation still matches; the .research-grid CSS
  // overrides the 2-col row layout with a stacked card layout. Shorter
  // stagger (40ms) because 3 cards side-by-side read as a parallel set, not
  // a sequential list.
  const researchCards = (J.research || []).map((q, i) => {
    const delay = 480 + i * 40;
    return `
    <article class="exhibit research" data-rise style="--d:${delay}ms" role="button" tabindex="0" aria-haspopup="dialog" aria-label="Open details for research question ${String(i+1).padStart(2,'0')}">
      <div class="no"><span>Question</span><b>${String(i+1).padStart(2,'0')}</b></div>
      <div class="spec">
        <div class="tsr">${TEASER(q.teaser)}</div>
        <div>
          <div class="m"><b>${q.kind}</b> · ongoing</div>
          <h3><span class="t">${q.title}</span></h3>
          <div class="blurb-wrap"><p>${q.blurb}</p></div>
        </div>
      </div>
    </article>`;
  }).join('');
  const researchGrid = researchCards ? `<div class="research-grid">${researchCards}</div>` : '';

  const prov = J.education.map(e=>`<div class="row"><span class="y">${e.year}</span><span class="w"><b>${e.what}</b><em>${e.where}${e.detail?' · '+e.detail:''}</em></span></div>`).join('');
  const shown = J.talks.map(t=>`<div class="row"><span class="y">${t.year}</span><span class="w"><b>${t.what}</b><em>${t.note}</em></span></div>`).join('');
  const skills = J.skills.map((s,i)=>`<div class="skill"><span class="n">S.${String(i+1).padStart(2,'0')}</span><span class="t">${s}</span></div>`).join('');
  // Default-open the "Where I've shown my work" block on desktop only — on
  // mobile / touch the collapse keeps the identity column tight. Match the
  // same breakpoint the plate-block CSS uses for the desktop layout.
  const shownOpen = matchMedia('(hover:hover) and (min-width:901px)').matches ? ' data-open="true"' : '';

  // Bio highlight for the left block
  const bioHtml = J.bio
    .replace('stem cell','<b>stem cell</b>')
    .replace('transcription dynamics','<b>transcription dynamics</b>')
    .replace('cellular behaviors','<b>cellular behaviors</b>')
    .replace('tissue architecture','<b>tissue architecture</b>');

  root.innerHTML=`<style>${css}</style><div class="vF"><div class="stage">
    <div class="plate">
      <div data-rise style="--d:0ms">
        <span class="id"></span>
        <div class="who" style="margin-top:.9rem">
          <div class="pic" aria-hidden="true"></div>
          <div class="who-text">
            <h1>${J.name}</h1>
            <div class="role"><b>${J.role}</b><br>${J.lab} · ${J.institution}</div>
          </div>
        </div>
        <div class="social" aria-label="Contact links">
          <a href="${J.links.email}" aria-label="Email" title="Email"><svg viewBox="0 0 24 24"><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-13zm2 .3v.4l7 4.2 7-4.2v-.4H5zm14 2.56-6.47 3.88a1 1 0 0 1-1.06 0L5 8.36V18h14V8.36z"/></svg></a>
          <a href="${J.links.github}" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.38 9.38 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.23C22 6.58 17.52 2 12 2z"/></svg></a>
          <a href="${J.links.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm7 0h3.83v1.5h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.8 2.67 4.8 6.15V20.5h-4v-4.9c0-1.17-.02-2.67-1.63-2.67-1.64 0-1.89 1.28-1.89 2.59V20.5h-4v-11z"/></svg></a>
          <a href="${J.links.scholar}" target="_blank" rel="noopener" aria-label="Google Scholar" title="Google Scholar"><svg viewBox="0 0 24 24"><path d="M12 2 1 9l4 2.55V17l7 4 7-4v-5.45L19 10.1V16h2V9L12 2zm0 2.3L18.73 9 12 13.27 5.27 9 12 4.3zM7 12.84l5 3.2 5-3.2V16l-5 2.86L7 16v-3.16z"/></svg></a>
          <a href="${J.links.greco}" target="_blank" rel="noopener" aria-label="Greco Lab" title="Greco Lab"><svg viewBox="0 0 24 24"><circle cx="6.2" cy="8.5" r="3"/><circle cx="17.8" cy="8.5" r="3"/><circle cx="12" cy="13.8" r="6"/></svg></a>
        </div>
      </div>

      <div class="subject" data-rise style="--d:140ms">
        <div class="triad" role="figure" aria-label="Cells, Pixels, Code">
          <span class="r"><em>Cells</em></span>
          <span class="op">∩</span>
          <span class="r"><em>Pixels</em></span>
          <span class="op">∩</span>
          <span class="r"><em>Code</em></span>
        </div>
      </div>

      <div class="bio" data-rise style="--d:240ms">${bioHtml}</div>

      <div class="block" data-collapsible data-open="true">
        <h3>Provenance <span class="h-actions"><a class="cv-link" href="${J.links.cv}" download aria-label="Download CV">CV ↓</a><span class="chevron" aria-hidden="true"></span></span></h3>
        <div class="block-body"><div class="rows">${prov}</div></div>
      </div>

      <div class="block" data-collapsible${shownOpen}>
        <h3>Where I've shown my work<span class="chevron" aria-hidden="true"></span></h3>
        <div class="block-body"><div class="rows">${shown}</div></div>
      </div>

      <div class="block" data-collapsible>
        <h3>Toolkit<span class="chevron" aria-hidden="true"></span></h3>
        <div class="block-body"><div class="skills">${skills}</div></div>
      </div>

    </div>

    <div class="hall">
      <div class="section-head" data-rise style="--d:420ms"><span>Current research</span></div>
      ${researchGrid}

      <div class="section-head" data-rise style="--d:620ms"><span>Selected works</span></div>
      ${specs}

      <section class="colophon" data-collapsible data-open="false">
        <div class="section-head" role="button" tabindex="0" aria-expanded="false" aria-controls="colophon-body">
          <span>Colophon <span class="hint">· visit map &amp; site stats</span></span>
          <span class="chevron" aria-hidden="true"></span>
        </div>
        <div class="colophon-body" id="colophon-body">
          <div class="inner">
            <div class="visitors">
              <div class="section-head"><span>Site stats</span></div>
              <div class="vsection">
                <div class="vmap-frame">
                  ${VMAP()}
                  <div class="vmap-hint" data-hint>tap the map for stats</div>
                </div>
                <div class="vstats-wrap" data-stats-open="false" aria-hidden="true">
                  <div class="vstats">
                    <div class="block">
                      <div class="lbl">On view</div>
                      <div class="big"><span data-stat="day-n">—</span><span class="unit">days</span></div>
                      <div class="since" data-stat="since-date">—</div>
                    </div>
                    <div class="block">
                      <div class="lbl">Top Countries</div>
                      <ol class="rank">
                        <li><span class="roman">I</span><span class="country" data-stat="rank1">—</span></li>
                        <li><span class="roman">II</span><span class="country" data-stat="rank2">—</span></li>
                        <li><span class="roman">III</span><span class="country" data-stat="rank3">—</span></li>
                      </ol>
                    </div>
                    <div class="block">
                      <div class="lbl">Top US States</div>
                      <ol class="rank">
                        <li><span class="roman">I</span><span class="country" data-stat="us1">—</span></li>
                        <li><span class="roman">II</span><span class="country" data-stat="us2">—</span></li>
                        <li><span class="roman">III</span><span class="country" data-stat="us3">—</span></li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
    <div class="collection">Collection · ${new Date().getFullYear()}</div>
  </div>
  <div class="research-modal" data-open="false" aria-hidden="true">
    <div class="research-modal-backdrop" data-close></div>
    <div class="research-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="research-modal-title">
      <button class="research-modal-close" aria-label="Close" data-close>&times;</button>
      <div class="research-modal-teaser" data-slot="teaser"></div>
      <div class="research-modal-body">
        <div class="research-modal-kind" data-slot="kind"></div>
        <h3 id="research-modal-title" data-slot="title"></h3>
        <div class="research-modal-blurb" data-slot="blurb"></div>
        <a class="research-modal-link" data-slot="link" target="_blank" rel="noopener" hidden></a>
      </div>
    </div>
  </div>
</div>`;

  // Swap seeded mock visitors for live /api/visits data once the DOM is attached.
  // No-ops cleanly if the API isn't available (local file:// preview, or before KV is wired up).
  if (typeof window.VMAP_REFRESH === 'function') {
    requestAnimationFrame(() => window.VMAP_REFRESH());
  }

  // Sync the headshot diameter to the rendered height of the .who-text
  // column (name + role), so the portrait reads as a matched pair with
  // the text rather than an arbitrary sized circle. Pure CSS can't do
  // this in a flex row: with align-self:stretch the height derives from
  // the text column fine, but Chromium won't back-compute width from
  // aspect-ratio in that direction, so the pic renders 0px wide. A
  // single-variable JS sync is simpler and survives resize + font-load.
  // Mobile (≤640px) keeps the fixed 72px pic from the @media override.
  const picEl = root.querySelector('.vF .plate .pic');
  const whoTextEl = root.querySelector('.vF .plate .who-text');
  const plateEl = root.querySelector('.vF .plate');
  if (picEl && whoTextEl && plateEl) {
    const mobileMQ = matchMedia('(max-width:640px)');
    const TEXT_RESERVE = 240;  // px — min text column width we'll protect
    const GAP = 20;            // px — approx flex gap between pic and text
    const ABSOLUTE_CAP = 200;  // px — hard ceiling regardless of container
    const syncPic = () => {
      if (mobileMQ.matches) { picEl.style.removeProperty('--pic-size'); return; }
      const h = whoTextEl.getBoundingClientRect().height;
      // Plate-width-aware cap: the pic can never be so wide that the
      // text column is forced below TEXT_RESERVE. This is the correct
      // way to cap a "follow-the-text-height" sync — cap against
      // available space, not an absolute px value. Without this,
      // narrow plates (900-1100px viewports, plate ~360-440px) trigger
      // a runaway feedback loop: pic grows → text squeezes → text
      // height grows (more wrapping) → JS grows pic more → loop.
      const plateCS = getComputedStyle(plateEl);
      const plateContent = plateEl.getBoundingClientRect().width
        - parseFloat(plateCS.paddingLeft)
        - parseFloat(plateCS.paddingRight);
      const spaceCap = Math.max(108, plateContent - TEXT_RESERVE - GAP);
      const cap = Math.min(spaceCap, ABSOLUTE_CAP);
      // Scale to 0.9x so the portrait stays slightly smaller than the
      // text column height — matches the 10% shrink applied to the
      // CSS clamp floor so the JS sync and the default stay in step.
      if (h > 50) picEl.style.setProperty('--pic-size', Math.min(h * 0.9, cap) + 'px');
    };
    requestAnimationFrame(syncPic);
    window.addEventListener('resize', syncPic);
    if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', syncPic);
    // Fonts can shift the text-column height after first paint; re-sync
    // once the browser signals the font face has loaded.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncPic);
    }
  }

  // Fire a tracking beacon when the CV link is clicked. We instrument the click
  // rather than the PDF request itself because Cloudflare Workers Static Assets
  // serves /assets/*.pdf before the Worker runs — direct GETs are invisible.
  const cvLink = root.querySelector('.cv-link');
  if (cvLink && 'sendBeacon' in navigator) {
    cvLink.addEventListener('click', () => {
      try { navigator.sendBeacon('/api/cv-download'); } catch (_) {}
    });
  }

  // ── Stats panel renderer ────────────────────────────────────────────────────
  // Museum-label treatment: days on view, 30-day country reach, top-3 country
  // ranking in Roman numerals. No visit counts — the meaning is in presence
  // and rank, not magnitude. Data from GET /api/stats; for local preview,
  // ?mock=stats synthesizes a realistic response.
  const set = (key, val) => {
    const el = root.querySelector(`[data-stat="${key}"]`);
    if (el) el.textContent = val;
  };
  const pad3 = (n) => String(n).padStart(3, '0');
  const regionNames = (() => {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }); } catch (_) { return null; }
  })();
  const countryName = (cc) => {
    if (!cc) return '—';
    if (regionNames) {
      try { return regionNames.of(cc) || cc; } catch (_) {}
    }
    return cc;
  };
  const prettyDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00Z');
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  const pickStats = async () => {
    if (window.__STATS_MOCK) return window.__STATS_MOCK;
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mock') === 'stats') return mockStats();
      const r = await fetch('/api/stats', { headers: { accept: 'application/json' } });
      if (!r.ok) return mockStats();       // MOCK: fall back so the Colophon renders
      return await r.json();                // something instead of dashes on localhost
    } catch (_) { return mockStats(); }
  };
  const renderStats = (s) => {
    if (!s) return;
    set('day-n', String(s.daysLive ?? 0));
    set('since-date', s.liveSince ? `live since ${prettyDate(s.liveSince)}` : '—');
    const top = s.topCountries || [];
    set('rank1', countryName(top[0]) || '—');
    set('rank2', countryName(top[1]) || '—');
    set('rank3', countryName(top[2]) || '—');
    const us = s.topUsStates || [];
    set('us1', us[0] || '—');
    set('us2', us[1] || '—');
    set('us3', us[2] || '—');
  };
  const mockStats = () => {
    const liveSince = (window.JASON && window.JASON.liveSince) || '2026-04-19';
    // Match the Worker: day counter ticks at midnight ET, not UTC.
    const etToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    const today = new Date(etToday + 'T00:00:00Z');
    const d0 = new Date(liveSince + 'T00:00:00Z');
    const daysLive = Math.max(0, Math.floor((today - d0) / 86400000));
    return {
      liveSince,
      daysLive,
      topCountries: ['US', 'GB', 'SG'],
      topUsStates: ['Connecticut', 'New York', 'California'],
    };
  };
  requestAnimationFrame(async () => { renderStats(await pickStats()); });

  // ── Map click-to-reveal stats ───────────────────────────────────────────────
  // The map itself is the affordance. First click opens the stats panel and
  // dismisses the corner hint; subsequent clicks toggle the panel.
  const mapFrame = root.querySelector('.vmap-frame');
  const statsWrap = root.querySelector('.vstats-wrap');
  if (mapFrame && statsWrap) {
    mapFrame.addEventListener('click', () => {
      const open = statsWrap.dataset.statsOpen === 'true';
      statsWrap.dataset.statsOpen = open ? 'false' : 'true';
      statsWrap.setAttribute('aria-hidden', open ? 'true' : 'false');
      mapFrame.dataset.hasOpened = 'true';
    });
  }

  // ── Collapsible plate blocks (mobile only) ─────────────────────────────────
  // The @media (hover:none), (max-width:900px) CSS applies the collapse
  // styling; here we wire the tap-to-toggle behavior. The click handler lives
  // regardless of viewport, but on desktop the CSS gates out the
  // Plate-block collapse — wired at all viewports. The CSS collapse mechanic
  // applies everywhere now, so each h3 is a disclosure button universally
  // and the a11y attrs are unconditional.
  root.querySelectorAll('.plate .block[data-collapsible]').forEach((block) => {
    const head = block.querySelector('h3');
    if (!head) return;
    const syncAria = () => head.setAttribute('aria-expanded', block.dataset.open === 'true' ? 'true' : 'false');
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    syncAria();
    const flip = () => {
      const open = block.dataset.open === 'true';
      block.dataset.open = open ? 'false' : 'true';
      syncAria();
    };
    head.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;   // CV link inside Provenance h3 must still work
      flip();
    });
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  // ── MOCK: Colophon toggle ──────────────────────────────────────────────────
  // Separate from the plate-block toggle because:
  //  • the colophon collapses at ALL viewports (plate blocks are mobile-only),
  //  • its toggle target is a .section-head div, not an h3,
  //  • aria-expanded + aria-controls are set so keyboard users know it's a
  //    disclosure, and we mirror the existing keyboard affordance (Enter/Space).
  root.querySelectorAll('.colophon[data-collapsible]').forEach((sec) => {
    const head = sec.querySelector('.section-head[role="button"]');
    if (!head) return;
    const flip = () => {
      const open = sec.dataset.open === 'true';
      sec.dataset.open = open ? 'false' : 'true';
      head.setAttribute('aria-expanded', open ? 'false' : 'true');
    };
    head.addEventListener('click', flip);
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  // Research modal — click a research card to open a focused blurb popout.
  (() => {
    const rm = root.querySelector('.research-modal');
    if (!rm) return;
    const titleEl = rm.querySelector('[data-slot="title"]');
    const blurbEl = rm.querySelector('[data-slot="blurb"]');
    const kindEl = rm.querySelector('[data-slot="kind"]');
    const teaserEl = rm.querySelector('[data-slot="teaser"]');
    const linkEl = rm.querySelector('[data-slot="link"]');
    // Track what had focus before the modal opened so we can restore on close.
    let lastFocused = null;
    let savedScrollY = 0;
    const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const getFocusables = () => Array.from(rm.querySelectorAll(FOCUSABLE))
      .filter(el => el.offsetParent !== null);
    // iOS Safari ignores `overflow:hidden` on <body> for rubber-band scroll.
    // The widely-used workaround: pin body with position:fixed at a negative
    // top offset matching current scroll, then restore scroll on unlock.
    const lockBodyScroll = () => {
      savedScrollY = window.scrollY || window.pageYOffset || 0;
      // Set top BEFORE position so when fixed kicks in on iOS, it reads the
      // already-negative top and doesn't briefly snap to the top of the
      // page. Two assignments in this order = no flash to top.
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.position = 'fixed';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overscrollBehavior = 'none';
      document.body.style.overscrollBehavior = 'none';
      // Add a marker class so the scroll-glow elements (.scroll-glow.top /
      // .scroll-glow.bottom — accent-blue radial-gradient overlays in the
      // top-level HTML at z-index 140) stay invisible while the modal is
      // open. They were the actual source of the "blue hue at top" — when
      // body became position:fixed, iOS could trigger a synthetic scroll
      // event that re-evaluated wasTop/nowTop and fired the edgePulse
      // animation, which then bled through the modal's backdrop blur.
      document.body.classList.add('modal-open');
    };
    const unlockBodyScroll = () => {
      // Cancel any pending at-top / at-bottom edge-pulse class. During the
      // lock, body→position:fixed fires a synthetic scroll event with
      // scrollY=0, which makes the page's edge-pulse JS add body.at-top
      // (with a 1200ms hold timer). modal-open suppresses the glow via CSS
      // while it's set, but the moment we remove modal-open, the at-top
      // class — still active because its timer hasn't expired — un-masks
      // the edgePulse animation and fires it as a post-dismiss flash.
      // Clearing both classes here cancels the pending pulse outright.
      document.body.classList.remove('at-top', 'at-bottom');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      window.scrollTo(0, savedScrollY);
      // 1500ms hold — longer than the page's at-top HOLD timer (1200ms in
      // index.html). If a synthetic scroll event somehow added at-top
      // before our suppression engaged, its hold timer would expire within
      // 1200ms; we outlast it so by the time modal-open lifts, no class
      // is left to trigger the edgePulse. The page's onScroll handler also
      // bails early while modal-open is set, so no NEW at-top can be added
      // during this window either.
      setTimeout(() => document.body.classList.remove('modal-open'), 1500);
    };
    const open = (q, trigger) => {
      titleEl.textContent = q.title || '';
      blurbEl.textContent = q.blurb || '';
      kindEl.textContent = q.kind || '';
      teaserEl.innerHTML = (typeof window.TEASER === 'function' && q.teaser) ? window.TEASER(q.teaser) : '';
      // Optional CTA — Selected works passes a paper link; research entries
      // pass nothing and the anchor stays hidden so it doesn't take focus.
      if (q.link) {
        linkEl.href = q.link;
        linkEl.textContent = q.linkLabel || 'Read paper →';
        linkEl.hidden = false;
      } else {
        linkEl.hidden = true;
        linkEl.removeAttribute('href');
      }
      // Lock body and clear any stale closing flag synchronously, but defer
      // the entrance animation by one paint frame via requestAnimationFrame.
      // This guarantees the body's position:fixed reflow (and the iOS URL
      // bar repaint that comes with it) lands on a different frame from the
      // dialog's translate+opacity transition. Doing both on the same frame
      // was the residual cause of the "still a little jittery" — even with
      // the previous reorder, the reflow and the transition's first frame
      // shared a paint and competed for compositor priority.
      lockBodyScroll();
      rm.removeAttribute('data-closing');
      // Save trigger and move focus immediately so keyboard users don't
      // wait an extra frame; the focus shift doesn't cause visible jitter.
      lastFocused = trigger || document.activeElement;
      requestAnimationFrame(() => {
        rm.setAttribute('data-open', 'true');
        rm.setAttribute('aria-hidden', 'false');
        const closeBtn = rm.querySelector('.research-modal-close');
        if (closeBtn) closeBtn.focus();
      });
    };
    const close = () => {
      // Flip data-closing BEFORE data-open so the faster ease-in transition
      // is the one that applies when the property values change.
      rm.setAttribute('data-closing', 'true');
      rm.setAttribute('data-open', 'false');
      rm.setAttribute('aria-hidden', 'true');
      unlockBodyScroll();
      // Clean up after the close animation finishes. Guard against a rapid
      // re-open during the timeout — if the user opened it again, leave the
      // closing flag alone (open() already cleared it).
      setTimeout(() => {
        if (rm.getAttribute('data-open') === 'false') rm.removeAttribute('data-closing');
      }, 320);
      // Restore focus to whatever opened the modal so keyboard users don't
      // get dropped back at the top of the page. preventScroll:true suppresses
      // the browser's default "scroll focused element into view" behavior,
      // which would otherwise nudge the page by a few px to add scroll-margin
      // around the trigger card — the source of the post-close upward drift
      // even though scrollTo() had already restored the saved position.
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
      lastFocused = null;
    };
    root.querySelectorAll('.exhibit.research').forEach((el, i) => {
      const trigger = () => {
        const q = (J.research || [])[i];
        if (q) open(q, el);
      };
      el.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        trigger();
      });
      el.addEventListener('keydown', (e) => {
        if (e.target.closest('a, button')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();  // Space would otherwise scroll the page.
          trigger();
        }
      });
    });
    // Selected works → reuse the same modal, but only on devices without a
    // hover gesture (mobile / narrow). Desktop already reveals the blurb
    // inline on hover, so the modal there would just duplicate visible text.
    // The MQ check lives inside the click handler so a desktop↔mobile
    // window resize picks up the new gate without re-binding listeners.
    const popoutMQ = matchMedia('(hover:none), (max-width:900px)');
    const pubToModalPayload = (p) => ({
      kind: `${p.venue} · ${p.year}`,
      title: p.title,
      blurb: p.blurb,
      teaser: p.teaser,
      link: p.link,
    });
    root.querySelectorAll('.exhibit:not(.research)').forEach((el, i) => {
      const trigger = () => {
        const p = (J.pubs || [])[i];
        if (p) open(pubToModalPayload(p), el);
      };
      el.addEventListener('click', (e) => {
        if (!popoutMQ.matches) return;
        // Title is wrapped in <a> — let the link handle its own navigation
        // instead of swallowing the tap into the modal.
        if (e.target.closest('a, button')) return;
        trigger();
      });
    });

    rm.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
    // Focus trap: while the modal is open, Tab / Shift+Tab cycle inside the
    // dialog instead of escaping to the backgrounded page behind the blur.
    rm.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      if (rm.getAttribute('data-open') !== 'true') return;
      const focusables = getFocusables();
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && rm.getAttribute('data-open') === 'true') close();
    });
  })();

})();
