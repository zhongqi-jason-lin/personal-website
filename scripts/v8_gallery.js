// F · Gallery — museum wall. Bigger left plate, bio above provenance.
(function(){
  const root=document.getElementById('v8');const J=window.JASON;
  const css=`
  .vF{font-family:var(--sf);color:var(--ink);background:var(--paper)}

  /* First-paint stagger — small rise + fade, guided by --d on each anchor.
     Disabled under prefers-reduced-motion. */
  @keyframes vFRise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .vF [data-rise]{opacity:0;animation:vFRise .55s cubic-bezier(.2,.7,.2,1) forwards;animation-delay:var(--d,0ms)}
  @media (prefers-reduced-motion:reduce){.vF [data-rise]{animation:none;opacity:1}}

  /* Shared focus ring */
  .vF a:focus-visible,.vF button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:3px;opacity:1}
  .vF .stage{display:grid;grid-template-columns:minmax(360px,40%) 1fr;min-height:100vh;min-height:100dvh}
  /* Mobile: switch stage to flex column so the .collection footer can be pushed to
     the viewport bottom via margin-top:auto when content is shorter than 100dvh. */
  @media(max-width:900px){
    .vF .stage{display:flex;flex-direction:column;min-height:100vh;min-height:100dvh}
    .vF .collection{margin-top:auto}
  }

  /* Left plate — scaled up */
  .vF .plate{background:var(--paper-2);border-right:1px solid var(--rule);padding:2.5rem 2.25rem 3rem;display:flex;flex-direction:column;gap:2rem}
  /* No stage border-bottom — the .collection footer row below draws the page-bottom rule. */
  .vF .plate .id{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint)}
  .vF .plate .who{display:grid;grid-template-columns:auto 1fr;gap:1.15rem;align-items:center}
  .vF .plate .who-text{display:flex;flex-direction:column;justify-content:center;gap:.45rem}
  /* Pic: fluid square that scales with viewport width via clamp — no dynamic
     height coupling, no axis-asymmetric clamps, so it can never go oval and
     it transitions smoothly as you resize. Max trimmed from 168→152 and the
     vw slope from 11→10 to hand ~15–25px back to the h1 column, which was
     causing the name to wrap at common MacBook widths. */
  .vF .plate .pic{width:clamp(104px,10vw,152px);aspect-ratio:1/1;height:auto;border-radius:50%;background:url('${(J&&J.headshot)||"assets/headshot.jpg"}') center/cover,var(--paper);box-shadow:0 14px 30px -16px rgba(0,0,0,.3),0 0 0 5px var(--paper),0 0 0 6px var(--ink);align-self:center}
  .vF .plate h1{font-family:var(--serif);font-weight:600;font-size:clamp(29px,2.7vw,41px);line-height:1.04;letter-spacing:-.03em;margin:0 0 .4rem;text-wrap:balance}
  .vF .plate h1 em{font-style:normal;color:var(--accent);font-weight:400}
  .vF .plate .role{font-family:var(--mono);font-size:14.5px;letter-spacing:.06em;color:var(--ink-soft);line-height:1.5}
  .vF .plate .role b{color:var(--ink);font-weight:500}

  .vF .plate .subject{margin:0 -2.25rem -1rem;padding:2.25rem 2.25rem .75rem;border-top:1px solid var(--ink);display:flex;align-items:center;justify-content:center}
  .vF .plate .subject .triad{font-family:var(--serif);display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.4rem .7rem;line-height:1.15}
  .vF .plate .subject .triad .r{font-size:clamp(17px,1.9vw,22px);font-weight:500;letter-spacing:-.015em;color:var(--ink);white-space:nowrap}
  .vF .plate .subject .triad .r em{font-style:normal;color:var(--accent);font-weight:600}
  .vF .plate .subject .triad .op{font-family:var(--serif);font-style:normal;font-weight:300;font-size:clamp(16px,1.7vw,20px);color:var(--accent);opacity:.85;line-height:1}

  /* Social links row — now a sibling of .who (not inside .who-text), so it
     lives in its own row below the headshot + name block. Left-aligned on
     desktop to hug the left rail, centered on mobile (see @media rule). */
  .vF .plate .social{display:flex;gap:.3rem;align-items:center;justify-content:flex-start;padding-top:.75rem}
  .vF .plate .social a{width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--rule);border-radius:50%;color:var(--ink-soft);background:var(--paper);transition:all .15s}
  .vF .plate .social a:hover{color:var(--paper);background:var(--ink);border-color:var(--ink);opacity:1}
  .vF .plate .social a svg{width:14px;height:14px;fill:currentColor}

  /* Bio block (new, above provenance) */
  .vF .plate .bio{font-family:var(--serif);font-size:19px;line-height:1.6;color:var(--ink);border-left:3px solid var(--accent);padding:.3rem 0 .3rem 1.1rem;font-weight:400;letter-spacing:-.005em;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  .vF .plate .bio b{color:var(--accent);font-weight:600;font-style:normal}

  /* Plate block heading — mirrors Selected Works spacing: 1.9rem below label
     (15% tighter than the old 2.25rem), then a 1px rule line, then 2.25rem of
     padding before content. */
  .vF .plate .block h3{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 1.6rem;font-weight:500;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
  .vF .plate .block h3 .cv-link{color:var(--ink-soft);font:inherit;letter-spacing:inherit;text-transform:inherit;border-bottom:1px solid transparent;padding-bottom:2px;transition:color .15s,border-color .15s}
  .vF .plate .block h3 .cv-link:hover{color:var(--accent);border-bottom-color:var(--accent);opacity:1}
  /* Section-rule line above .rows, with 2.25rem of padding before the first row —
     matches the Selected Works → exhibit line spacing. Negative horizontal margin
     makes the rule span the full plate width (to the plate's padding edge). */
  .vF .plate .rows{display:grid;gap:.15rem;border-top:1px solid var(--rule);margin:0 -2.25rem;padding:2.25rem 2.25rem 0}
  .vF .plate .row{display:grid;grid-template-columns:120px 1fr;gap:.9rem;padding:.65rem 0;border-top:1px dashed var(--rule);align-items:baseline}
  .vF .plate .row:first-child{border-top:0}
  .vF .plate .row .y{font-family:var(--mono);font-size:11.5px;color:var(--ink-soft);letter-spacing:.04em;padding-top:.15rem}
  .vF .plate .row .w b{font-family:var(--serif);font-weight:500;font-size:16.5px;line-height:1.25;color:var(--ink);letter-spacing:-.01em}
  .vF .plate .row .w em{font-style:normal;color:var(--ink-faint);font-size:13.5px;display:block;margin-top:.2rem;font-family:var(--serif);letter-spacing:-.005em;line-height:1.35}

  /* Full-width page-footer row: spans both stage columns, top border forms
     the page-end horizontal line, text left-aligned to the stage's left edge. */
  .vF .collection{grid-column:1 / -1;border-top:1px solid var(--rule);padding:1.5rem 2.25rem;font-family:var(--mono);font-size:12px;color:var(--ink-soft);letter-spacing:.06em;text-align:left;background:var(--paper)}

  /* Visitors section: wrap the map in a .vsection that carries the section-rule
     above it, with 2.25rem padding above the map — mirrors the label→line→content
     rhythm used by Selected Works. */
  .vF .vsection{border-top:1px solid var(--rule);padding-top:2.25rem}

  /* Map frame wraps the VMAP output so we can overlay a "tap for stats"
     hint in the corner. Relative positioning is inherited from .vmap
     already; the hint is absolutely positioned against this wrapper. */
  .vF .vmap-frame{position:relative;cursor:pointer}
  .vF .vmap-hint{position:absolute;right:.75rem;bottom:.75rem;z-index:5;
    font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;
    color:var(--ink-soft);text-transform:lowercase;
    background:color-mix(in srgb,var(--paper) 88%,transparent);
    padding:.3rem .55rem;border:1px solid var(--rule);border-radius:2px;
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
  .vF .vstats .lbl{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
  /* Big number + inline unit, smaller than before (24–32px) to match the
     caption-card density. Baseline alignment keeps "8 days" as one beat. */
  .vF .vstats .big{font-family:var(--serif);font-weight:600;font-size:clamp(24px,2.4vw,32px);line-height:1;letter-spacing:-.028em;color:var(--ink);font-variant-numeric:tabular-nums lining-nums;display:flex;align-items:baseline;flex-wrap:wrap;gap:.35rem .5rem}
  .vF .vstats .big .unit{font-family:var(--mono);font-weight:400;font-size:.38em;letter-spacing:.02em;color:var(--ink-soft);text-transform:lowercase}
  .vF .vstats .since{font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;color:var(--ink-faint);margin-top:auto}
  /* Ranking — tighter, roman numerals slightly smaller, country names in
     small caps at a refined size. Opacity ladder still reinforces rank. */
  .vF .vstats .rank{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.3rem}
  .vF .vstats .rank li{display:grid;grid-template-columns:28px 1fr;align-items:baseline;gap:.55rem}
  .vF .vstats .rank .roman{font-family:var(--serif);font-weight:400;font-size:15px;letter-spacing:.04em;color:var(--accent)}
  .vF .vstats .rank .country{font-family:var(--serif);font-weight:500;font-size:clamp(13px,1.25vw,16px);line-height:1.15;letter-spacing:.02em;color:var(--ink);text-transform:uppercase;font-variant:small-caps}
  .vF .vstats .rank li:nth-child(2) .country{opacity:.82}
  .vF .vstats .rank li:nth-child(3) .country{opacity:.65}
  @media(max-width:900px){
    .vF .vstats{grid-template-columns:1fr;gap:1.25rem;padding-top:1.25rem}
    .vF .vstats .block{padding:0;border-right:0;border-bottom:1px solid var(--rule);padding-bottom:1rem;min-height:0}
    .vF .vstats .block:last-child{border-bottom:0;padding-bottom:0}
    .vF .vstats .block + .block{padding-left:0}
    .vF .vstats .big{font-size:28px}
    .vF .vmap-hint{font-size:10px;right:.5rem;bottom:.5rem;padding:.25rem .45rem}
  }

  /* Toolkit in left plate */
  .vF .plate .skills{margin:0 -2.25rem;padding:2.25rem 2.25rem 0;display:grid;grid-template-columns:repeat(2,1fr);gap:0;border-top:1px solid var(--rule)}
  .vF .plate .skill{padding:.95rem .75rem;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;flex-direction:column;gap:.4rem;min-height:68px}
  .vF .plate .skill:nth-child(2n){border-right:0}
  .vF .plate .skill .n{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--ink-faint)}
  .vF .plate .skill .t{font-family:var(--serif);font-size:15.5px;line-height:1.3;letter-spacing:-.01em;color:var(--ink);font-weight:500}

  /* Right hall */
  .vF .hall{padding:3rem 2.75rem 3.5rem;display:flex;flex-direction:column}
  .vF .hall .intro{max-width:58ch;margin:0 0 2.5rem;font-family:var(--serif);font-size:21px;line-height:1.55;color:var(--ink);font-weight:400;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  .vF .hall .intro b{color:var(--accent);font-weight:600;font-style:normal}

  .vF .section-head{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin:0 0 1.6rem;font-weight:500}
  .vF .section-head span{color:var(--accent)}

  .vF .exhibit{margin:0 -2.75rem;padding:2.25rem 2.75rem;border-top:1px solid var(--rule);display:grid;grid-template-columns:72px 1fr;gap:1.5rem;transition:background-color .2s ease}
  /* All section lines uniform: no heavier rule on the first exhibit, no terminal
     border on the last. The Visitors section-head then sits ABOVE the map's own
     top border — same pattern as Selected Works → first-exhibit-line. */
  /* Precomputed accent-soft (already blue at 15% alpha) — no runtime mix, no
     transition-path color interpolation. */
  .vF .exhibit:hover{background:var(--accent-soft)}
  .vF .exhibit .no{font-family:var(--mono);font-size:11.5px;letter-spacing:.1em;color:var(--ink-faint);padding-top:.1rem}
  .vF .exhibit .no b{display:block;font-size:36px;letter-spacing:-.035em;color:var(--ink);margin-top:.25rem;font-family:var(--serif);font-weight:600;font-variant-numeric:lining-nums}
  /* Give the teaser more breathing room in 2-col so it never feels stamp-sized at the low end. */
  .vF .spec{display:grid;grid-template-columns:minmax(300px,1.25fr) 1fr;gap:1.75rem;align-items:start}
  .vF .spec .tsr{aspect-ratio:4/3;background:var(--paper-2);color:var(--accent);border:1px solid var(--rule);position:relative;overflow:hidden}
  /* Suppress the body-wide color/fill/stroke transitions inside the teaser —
     they were letting SVG currentColor animate through unintended hues on
     initial paint and render artifacts. Theme toggle still crossfades via the
     View Transitions API (modern browsers) or a hard swap (older ones). */
  .vF .spec .tsr,.vF .spec .tsr *{transition:none}
  .vF .spec .tsr svg{position:absolute;inset:0;width:100%;height:100%}
  /* text-wrap:pretty fills line 1 as long as possible (just avoids orphans),
     whereas :balance equalized line lengths and left right-margin whitespace
     — titles here read better when they use the full column width. */
  .vF .spec h3{font-family:var(--serif);font-weight:500;font-size:25.5px;line-height:1.2;letter-spacing:-.025em;margin:0 0 .6rem;text-wrap:pretty}
  .vF .spec h3 a{color:var(--ink);text-decoration:none;background-image:linear-gradient(var(--accent),var(--accent));background-repeat:no-repeat;background-size:0 1px;background-position:0 100%;transition:background-size .25s ease,color .15s}
  .vF .spec h3 a:hover{color:var(--accent);background-size:100% 1px;opacity:1}
  .vF .spec h3 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
  .vF .spec .m{font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:.5rem}
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
  .vF .spec p{font-family:var(--serif);font-size:16.5px;line-height:1.6;color:var(--ink-soft);margin:0 0 .85rem;max-width:66ch;font-style:normal;font-weight:400;text-align:justify;hyphens:auto;-webkit-hyphens:auto;text-wrap:pretty}
  /* Touch devices and narrow viewports have no reliable hover gesture to
     reveal the blurb — keep it expanded there so the abstract stays visible.
     Viewport-width check is belt-and-suspenders alongside hover:none because
     some emulators (and mis-configured user agents) don't honor hover queries. */
  @media (hover:none), (max-width:900px){
    .vF .spec .blurb-wrap{grid-template-rows:1fr}
    .vF .spec .blurb-wrap > p{opacity:1}
  }
  /* Reduced-motion: skip the transition, keep the blurb expanded so content
     isn't stuck behind a motion gate. */
  @media (prefers-reduced-motion:reduce){
    .vF .spec .blurb-wrap{grid-template-rows:1fr;transition:none}
    .vF .spec .blurb-wrap > p{opacity:1;transition:none}
  }
  .vF .spec p::before{content:"“";color:var(--accent)}
  .vF .spec p::after{content:"”";color:var(--accent)}
  .vF .spec .au{font-size:13.5px;color:var(--ink-faint);line-height:1.5}
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
  .vF .vcity .cn{font-family:var(--mono);font-size:10px;letter-spacing:.08em;color:var(--ink-faint)}
  .vF .vcity .c{font-family:var(--serif);font-size:14.5px;color:var(--ink);line-height:1.2;letter-spacing:-.01em;font-weight:500}
  .vF .vcity .p{font-family:var(--mono);font-size:10.5px;color:var(--accent);letter-spacing:.04em}
  @media(max-width:720px){.vF .vtable{grid-template-columns:repeat(2,1fr)}.vF .vcity:nth-child(4n){border-right:1px solid var(--rule)}.vF .vcity:nth-child(2n){border-right:0}}

  .vF .room{margin-top:2.5rem}
  .vF .skills{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:2px solid var(--ink)}
  @media(max-width:720px){.vF .skills{grid-template-columns:repeat(2,1fr)}}
  .vF .skill{padding:1rem .8rem;border-right:1px solid var(--rule);border-bottom:1px solid var(--rule);display:flex;flex-direction:column;justify-content:space-between;min-height:80px}
  .vF .skill:nth-child(3n),.vF .skill:last-child{border-right:0}
  @media(max-width:720px){.vF .skill{border-right:1px solid var(--rule)!important}.vF .skill:nth-child(2n){border-right:0!important}}
  .vF .skill .n{font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;color:var(--ink-faint)}
  .vF .skill .t{font-family:var(--serif);font-size:16px;line-height:1.2;letter-spacing:-.005em;margin-top:.5rem;color:var(--ink)}

  .vF .hall .foot{margin:auto -2.75rem 0;padding:1.5rem 2.75rem 0;border-top:1px solid var(--ink);font-family:var(--mono);font-size:11px;letter-spacing:.06em;color:var(--ink-soft);display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start;min-height:4.5rem}
  .vF .hall .foot a{color:var(--ink)}

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
     reads cleaner here. Desktop wide (>1000px) keeps justify where the line
     has enough words to balance naturally. */
  @media(max-width:1000px){
    .vF .spec p{text-align:left}
  }

  /* ── Mobile (≤640px) ── tighter padding, smaller portrait, smaller display type,
     and shrunk edge-to-edge negative margins so content doesn't overhang the viewport. */
  @media(max-width:640px){
    .vF .plate{padding:1.75rem 1.25rem 2rem;gap:1.5rem;border-right:none;border-bottom:1px solid var(--rule)}
    .vF .hall{padding:1.75rem 1.25rem 2.5rem}

    /* Swap the .who grid for a centered flex row on mobile so the
       headshot + name block sits in the middle of the plate, not pinned
       to the left edge. align-items:center keeps the circular portrait
       vertically balanced against the name+role column, justify-content:
       center centers the whole group, grid-template-columns:unset clears
       the desktop grid declaration. */
    .vF .plate .who{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:1rem;grid-template-columns:unset}
    /* Center the text column's own children (name, role, social) so the
       horizontal centering of the outer group cascades all the way down. */
    .vF .plate .who-text{min-height:0;align-items:center;text-align:center}
    /* Headshot trimmed to 72px on mobile. At 88 the headshot + name column
       filled the plate edge-to-edge, leaving no breathing room for the
       centering to read visually. 72px hands back ~15px per side, enough
       for the group to feel set in the middle of the card. */
    .vF .plate .pic{width:72px;height:72px;min-width:0;max-width:none;aspect-ratio:auto;flex-shrink:0;box-shadow:0 10px 20px -14px rgba(0,0,0,.3),0 0 0 3px var(--paper),0 0 0 4px var(--ink)}
    .vF .plate h1{font-size:clamp(26px,7vw,32px);line-height:1.1;letter-spacing:-.02em;margin:0 0 .25rem}
    .vF .plate .role{font-size:13px;line-height:1.45}

    /* Social icons: centered horizontally, full-width row below role so
       the five circles sit on the plate's centerline rather than hanging
       off the left edge of the text column. */
    .vF .plate .social{gap:.35rem;padding-top:.75rem;justify-content:center}
    .vF .plate .social a{width:40px;height:40px}
    .vF .plate .social a svg{width:15px;height:15px}

    .vF .plate .subject{margin:0 -1.25rem -1rem;padding:1.5rem 1.25rem .5rem}
    .vF .plate .subject .triad{gap:.3rem .55rem}
    .vF .plate .subject .triad .r{font-size:17px}
    .vF .plate .subject .triad .op{font-size:15px}

    /* On narrow screens, justified text creates rivers — fall back to left alignment. */
    .vF .plate .bio{font-size:16.5px;line-height:1.55;padding:.2rem 0 .2rem .9rem;border-left-width:2px;text-align:left}

    .vF .plate .row{grid-template-columns:90px 1fr;gap:.65rem;padding:.55rem 0}
    .vF .plate .row .y{font-size:11px}
    .vF .plate .row .w b{font-size:15.5px}
    .vF .plate .row .w em{font-size:13px}

    .vF .plate .skills{margin:0 -1.25rem;padding:0 1.25rem}
    .vF .plate .skill{padding:.75rem .65rem;min-height:58px}
    .vF .plate .skill .t{font-size:14.5px}


    /* Keep section-head visually aligned with the plate block h3 on mobile.
       The two labels (PROVENANCE / SELECTED WORKS) sit in adjacent sections
       of the stacked layout; matching font-size + letter-spacing makes them
       read as one typographic register rather than two competing scales. */
    .vF .section-head{margin:0 0 1.25rem;font-size:11px;letter-spacing:.14em}
    /* Reduce the whitespace between a plate section's top rule and its first
       row. 2.25rem was tuned for the desktop plate padding (2.25rem horizontal)
       — on mobile the plate is only 1.25rem horizontally, so matching rhythm
       means pulling the vertical padding in too. */
    .vF .plate .block .rows,
    .vF .plate .block .skills{padding-top:1.25rem}
    .vF .plate .block[data-collapsible][data-open="true"] > h3{margin-bottom:1rem}
    .vF .exhibit{margin:0 -1.25rem;padding:1.75rem 1.25rem;grid-template-columns:44px 1fr;gap:.9rem}
    .vF .exhibit .no{font-size:10.5px}
    .vF .exhibit .no b{font-size:22px;margin-top:.15rem}
    .vF .spec{gap:1rem}
    .vF .spec .tsr{aspect-ratio:3/2}
    .vF .spec h3{font-size:20px;line-height:1.25}
    .vF .spec .m{font-size:11px}
    .vF .spec p{font-size:15px;line-height:1.55;text-align:left;max-width:none}
    .vF .spec .au{font-size:12.5px}

    .vF .visitors{margin:1rem -1.25rem 0;padding:.5rem 1.25rem 2rem}
    .vF .vtable{grid-template-columns:repeat(2,1fr)}
    .vF .vcity{padding:.6rem .6rem}
    .vF .vcity:nth-child(4n){border-right:1px solid var(--rule)}
    .vF .vcity:nth-child(2n){border-right:0}

    .vF .hall .foot{margin:auto -1.25rem 0;padding:1.1rem 1.25rem 0;gap:1.25rem;font-size:10.5px;min-height:auto}
  }

  /* ── Mobile plate-block collapse ──
     On touch/narrow devices the left plate is ~2 screenfuls of context before
     the first publication. Provenance / Talks / Toolkit become tap-to-expand
     sections; headings stay as affordances. Uses the same grid-template-rows
     0fr↔1fr pattern as .vstats-wrap so the reveal animates cleanly without a
     magic max-height. Desktop ignores all of this — the @media gate below
     never applies there. */
  @media (hover:none), (max-width:900px){
    .vF .plate .block[data-collapsible]{display:grid;grid-template-rows:auto 0fr;transition:grid-template-rows .4s cubic-bezier(.2,.7,.2,1)}
    .vF .plate .block[data-collapsible][data-open="true"]{grid-template-rows:auto 1fr}
    .vF .plate .block[data-collapsible] > .block-body{overflow:hidden;min-height:0}
    /* Heading is the tap target. Reset h3 margin to 0 while collapsed so the
       closed state reads as a tidy row; expanded state restores rhythm below. */
    .vF .plate .block[data-collapsible] > h3{cursor:pointer;user-select:none;margin-bottom:0;transition:margin-bottom .3s}
    .vF .plate .block[data-collapsible][data-open="true"] > h3{margin-bottom:1.6rem}
    /* Chevron sits at the right edge of the h3. Rotates through a "+" ↔ "−"
       content swap rather than a transform, so the glyph itself changes
       character — more legible than a rotated plus at small sizes. */
    /* Chevron: plain mono glyph, same family/weight as the heading so it
       reads as typography rather than a button badge. Keeping baseline
       alignment on the h3 (desktop behavior) — centering flex items shifted
       the "Provenance"/CV-link baseline relative to the rest of the plate
       and read as a font-rendering glitch. */
    .vF .plate .block[data-collapsible] .h-actions{display:inline-flex;align-items:baseline;gap:.75rem}
    .vF .plate .block[data-collapsible] .chevron{display:inline-block;font-family:var(--mono);font-size:13px;line-height:1;color:var(--ink-soft);font-weight:500;margin-left:.4rem;letter-spacing:0}
    .vF .plate .block[data-collapsible] .chevron::before{content:"+"}
    .vF .plate .block[data-collapsible][data-open="true"] .chevron::before{content:"−"}
    /* Collapsible rows/skills currently carry a top-border + 2.25rem of padding
       that made sense as a section-rule in the open state; when the body is
       collapsed we don't want a floating rule line under the heading. Scope
       the border + padding to the open state only. */
    .vF .plate .block[data-collapsible] .rows,
    .vF .plate .block[data-collapsible] .skills{border-top:0;padding-top:0}
    .vF .plate .block[data-collapsible][data-open="true"] .rows,
    .vF .plate .block[data-collapsible][data-open="true"] .skills{border-top:1px solid var(--rule);padding-top:1.25rem}
  }
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
  `;
  const specs = J.pubs.map((p,i)=>{
    const title = p.link
      ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`
      : p.title;
    // Stagger exhibits after the intro (560ms baseline + 80ms per index).
    const delay = 560 + i*80;
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

  const prov = J.education.map(e=>`<div class="row"><span class="y">${e.year}</span><span class="w"><b>${e.what}</b><em>${e.where}${e.detail?' · '+e.detail:''}</em></span></div>`).join('');
  const shown = J.talks.map(t=>`<div class="row"><span class="y">${t.year}</span><span class="w"><b>${t.what}</b><em>${t.note}</em></span></div>`).join('');
  const skills = J.skills.map((s,i)=>`<div class="skill"><span class="n">S.${String(i+1).padStart(2,'0')}</span><span class="t">${s}</span></div>`).join('');

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

      <div class="block" data-collapsible>
        <h3>Where I've shown my work<span class="chevron" aria-hidden="true"></span></h3>
        <div class="block-body"><div class="rows">${shown}</div></div>
      </div>

      <div class="block" data-collapsible>
        <h3>Toolkit<span class="chevron" aria-hidden="true"></span></h3>
        <div class="block-body"><div class="skills">${skills}</div></div>
      </div>

    </div>

    <div class="hall">
      <div class="section-head" data-rise style="--d:420ms"><span>Selected works</span></div>
      ${specs}

      <div class="visitors">
        <div class="section-head" data-rise style="--d:900ms"><span>Site stats</span></div>
        <div class="vsection">
          <div class="vmap-frame">
            ${VMAP()}
            <div class="vmap-hint" data-hint>tap the map for stats</div>
          </div>
          <div class="vstats-wrap" data-stats-open="false" aria-hidden="true">
            <div class="vstats" data-rise style="--d:980ms">
              <div class="block">
                <div class="lbl">On view</div>
                <div class="big"><span data-stat="day-n">—</span><span class="unit">days</span></div>
                <div class="since" data-stat="since-date">—</div>
              </div>
              <div class="block">
                <div class="lbl">30-day reach</div>
                <div class="big"><span data-stat="countries">—</span><span class="unit">countries</span></div>
              </div>
              <div class="block">
                <div class="lbl">Mostly seen in</div>
                <ol class="rank">
                  <li><span class="roman">I</span><span class="country" data-stat="rank1">—</span></li>
                  <li><span class="roman">II</span><span class="country" data-stat="rank2">—</span></li>
                  <li><span class="roman">III</span><span class="country" data-stat="rank3">—</span></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="collection">Collection · ${new Date().getFullYear()}</div>
  </div></div>`;

  // Swap seeded mock visitors for live /api/visits data once the DOM is attached.
  // No-ops cleanly if the API isn't available (local file:// preview, or before KV is wired up).
  if (typeof window.VMAP_REFRESH === 'function') {
    requestAnimationFrame(() => window.VMAP_REFRESH());
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
      if (!r.ok) return null;
      return await r.json();
    } catch (_) { return null; }
  };
  const renderStats = (s) => {
    if (!s) return;
    set('day-n', String(s.daysLive ?? 0));
    set('since-date', s.liveSince ? `live since ${prettyDate(s.liveSince)}` : '—');
    set('countries', String(s.countryCount ?? 0));
    const top = s.topCountries || [];
    set('rank1', countryName(top[0]) || '—');
    set('rank2', countryName(top[1]) || '—');
    set('rank3', countryName(top[2]) || '—');
  };
  const mockStats = () => {
    const liveSince = (window.JASON && window.JASON.liveSince) || '2026-04-12';
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const d0 = new Date(liveSince + 'T00:00:00Z');
    const daysLive = Math.max(0, Math.floor((today - d0) / 86400000));
    return {
      liveSince,
      daysLive,
      countryCount: 27,
      topCountries: ['US', 'GB', 'SG'],
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

  // ── Hover-triggered teaser draw-in ─────────────────────────────────────────
  // Teasers render fully visible on load. Hovering any exhibit replays a
  // "curator painting" animation on the diagram itself. The caption strip
  // (bottom line + text labels) stays visible throughout — labels appear
  // "first", the diagram draws in above them. Diagram strokes animate via
  // stroke-dashoffset; filled dots/centers fade in once most strokes have
  // started drawing. Each exhibit debounces during its own animation so
  // quick re-hovers don't stutter. Respects prefers-reduced-motion.
  const prefersReduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // Scope selectors to the diagram wrapper (<g fill="none" ...>), so the
  // caption-strip <line> and <text> labels — which are top-level children of
  // the <svg> — are never touched. They stay fully visible the whole time.
  const strokeSelector = [
    'g[fill="none"] path',
    'g[fill="none"] line',
    'g[fill="none"] polyline',
    'g[fill="none"] polygon',
    'g[fill="none"] ellipse',
    'g[fill="none"] circle:not([fill="currentColor"])',
  ].join(',');
  const fillSelector = 'g[fill="none"] circle[fill="currentColor"]';
  const DUR = 1180;        // ms per element — painterly pace, ~1.75s total
  const STAGGER = 30;      // ms between element starts — heavy overlap = cohesion
  const EASE = 'cubic-bezier(.65,0,.35,1)';  // smooth S-curve, reads as a single drawn gesture

  // True when the element carries its own dash pattern (e.g. IL-7 wave's "2 2.5").
  // The stroke-dashoffset reveal overwrites dasharray with a single pathLength-long
  // dash, which renders as SOLID — then the restore at animation end visibly
  // "snaps" to dashed. For those elements we fade opacity instead, so the dashes
  // are native the whole way through.
  const isNativelyDashed = (el) => {
    const d = el.getAttribute('stroke-dasharray');
    return d !== null && d.trim() !== '' && d !== 'none' && d !== '0';
  };

  const replayDraw = (host) => {
    const svg = host.querySelector('svg');
    if (!svg) return;
    const strokables = svg.querySelectorAll(strokeSelector);
    const fillables = svg.querySelectorAll(fillSelector);

    // Phase A (synchronous, same frame): snap every animated element to its
    // hidden state with transitions suppressed.
    //  • Plain strokes  → stroke-dashoffset = pathLength (fully offset, invisible)
    //  • Dashed strokes → opacity 0 (dasharray stays untouched, no snap later)
    //  • Filled dots    → opacity 0
    strokables.forEach((el) => {
      el.style.transition = 'none';
      if (isNativelyDashed(el)) {
        // Cache the element's natural opacity once (IL-7 arcs use 0.8/0.6/0.4
        // to fake depth). All later hovers fade BACK to this cached value so
        // the depth cue survives repeated replays.
        if (!('origOpacity' in el.dataset)) {
          el.dataset.origOpacity = getComputedStyle(el).opacity;
        }
        el.style.opacity = '0';
        return;
      }
      try {
        const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
        if (!(len > 0)) return;
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
      } catch (_) { /* detached / zero-length */ }
    });
    fillables.forEach((el) => {
      el.style.transition = 'none';
      el.style.opacity = '0';
    });

    // Force a reflow so the hidden snapshot lands in a committed frame before
    // the animation starts. Without this, browsers coalesce both style writes
    // and the draw-from-hidden effect is lost.
    // eslint-disable-next-line no-unused-expressions
    svg.getBoundingClientRect();

    // Phase B (next frame): animate to drawn state. Dashed elements share the
    // same stagger slot as their plain neighbors, so they emerge in rhythm
    // rather than popping.
    requestAnimationFrame(() => {
      strokables.forEach((el, i) => {
        const delay = i * STAGGER;
        if (isNativelyDashed(el)) {
          const target = el.dataset.origOpacity ?? '1';
          el.style.transition = `opacity ${DUR}ms ${EASE} ${delay}ms`;
          el.style.opacity = target;
          setTimeout(() => {
            // Revert to the element's authored opacity by dropping the inline
            // override, so future style reads see the SVG attribute again.
            el.style.removeProperty('opacity');
            el.style.transition = '';
          }, DUR + delay + 40);
          return;
        }
        if (!el.style.strokeDashoffset) return;
        el.style.transition = `stroke-dashoffset ${DUR}ms ${EASE} ${delay}ms`;
        el.style.strokeDashoffset = '0';
        setTimeout(() => {
          // Clear the overrides so the element reverts to its authored state.
          // Plain strokes had no dasharray to begin with, so removing the
          // inline override is sufficient — nothing to "restore", no snap.
          el.style.removeProperty('stroke-dasharray');
          el.style.removeProperty('stroke-dashoffset');
          el.style.transition = '';
        }, DUR + delay + 40);
      });
      // Fills begin at ~70% of a single DUR — the first strokes are already
      // visible by then, so dots appear to "settle into" the traced shape
      // rather than leading it.
      const FILL_START = 820;
      const FILL_STAGGER = 30;
      fillables.forEach((el, i) => {
        el.style.transition = `opacity .5s ${EASE} ${FILL_START + i * FILL_STAGGER}ms`;
        el.style.opacity = '1';
      });
    });
  };

  // Rough total animation length = DUR + (elementCount-1)*STAGGER + slack.
  // With DUR=1180 and STAGGER=30, 20 elements finish at ~1750ms; fills at
  // ~1740ms. 1900ms debounces re-triggers with a small safety margin.
  const animationLen = 1900;

  // Touch / narrow-viewport detection. Dual-check mirrors the defensive gate
  // used for the always-expanded blurb: Chrome DevTools device emulation has a
  // long-standing bug where (hover:none) isn't reliably honored, so pairing
  // with (max-width:900px) catches emulated mobile too.
  const isTouchLike = matchMedia('(hover:none)').matches || matchMedia('(max-width:900px)').matches;

  if (!prefersReduced) {
    root.querySelectorAll('.exhibit').forEach((exhibit) => {
      const tsr = exhibit.querySelector('.tsr');
      if (!tsr) return;
      let playing = false;
      const play = () => {
        if (playing) return;
        playing = true;
        replayDraw(tsr);
        setTimeout(() => { playing = false; }, animationLen);
      };
      // Desktop: hover replays the draw (unchanged behavior).
      exhibit.addEventListener('mouseenter', play);
      // Touch devices: tapping the teaser itself re-plays. Scoped to the .tsr
      // (not the whole exhibit) so title / abstract taps that users might make
      // while reading don't spuriously replay — the teaser is the affordance.
      if (isTouchLike) {
        tsr.addEventListener('click', play);
      }
    });

    // Mobile scroll-trigger: fire the draw the first time each exhibit scrolls
    // into view, so the "curator painting" effect — invisible on desktop
    // without hover — actually appears on phones and tablets. `rootMargin`
    // pulls the trigger line up 15% from the viewport bottom so the ~1.75s
    // animation completes while the teaser is comfortably in-frame, not
    // partially offscreen. `unobserve` after first fire keeps it a one-per-
    // visit reveal rather than a repeating party trick on scroll-up/down.
    if (isTouchLike && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const tsr = entry.target.querySelector('.tsr');
          if (tsr) {
            // Small delay so the draw starts after the scroll momentum has
            // settled visually, rather than during the gesture itself.
            setTimeout(() => replayDraw(tsr), 80);
          }
          io.unobserve(entry.target);
        });
      }, { threshold: 0.35, rootMargin: '0px 0px -15% 0px' });
      root.querySelectorAll('.exhibit').forEach((ex) => io.observe(ex));
    }
  }

  // ── Collapsible plate blocks (mobile only) ─────────────────────────────────
  // The @media (hover:none), (max-width:900px) CSS applies the collapse
  // styling; here we wire the tap-to-toggle behavior. The click handler lives
  // regardless of viewport, but on desktop the CSS gates out the
  // grid-template-rows collapse, so toggling data-open has no visual effect.
  // That keeps behavior simple and avoids media-query JS branching.
  root.querySelectorAll('.plate .block[data-collapsible]').forEach((block) => {
    const head = block.querySelector('h3');
    if (!head) return;
    head.addEventListener('click', (e) => {
      // Clicks on the CV link inside Provenance must NOT toggle the section —
      // the user wanted the download, not the panel. Any anchor descendant
      // short-circuits the toggle.
      if (e.target.closest('a')) return;
      const open = block.dataset.open === 'true';
      block.dataset.open = open ? 'false' : 'true';
    });
    // Keyboard affordance: treat the heading as a disclosure button.
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const open = block.dataset.open === 'true';
        block.dataset.open = open ? 'false' : 'true';
      }
    });
  });
})();
