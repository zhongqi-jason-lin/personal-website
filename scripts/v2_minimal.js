// A · Minimal — Apple-quiet, compact memo feel
(function(){
  const root=document.getElementById('v2');const J=window.JASON;
  const css=`
  .vA{--maxw:960px;font-family:var(--sf)}
  .vA .wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad)}

  .vA .hero{padding:5.5rem 0 2.5rem;display:grid;grid-template-columns:auto 1fr;gap:2rem;align-items:center}
  .vA .portrait{width:120px;height:120px;border-radius:50%;background:url('${window.__resources?window.__resources.headshot:"assets/headshot.jpg"}') center/cover,var(--paper-2);box-shadow:0 1px 0 var(--rule)}
  .vA h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,5.5vw,76px);line-height:.95;letter-spacing:-.03em;margin:0}
  .vA h1 em{font-style:italic;color:var(--accent)}
  .vA .sub{margin:.8rem 0 0;color:var(--ink-soft);font-size:17px;max-width:560px;line-height:1.5;letter-spacing:-.005em}
  .vA .where{margin-top:.9rem;font-family:var(--mono);font-size:11px;color:var(--ink-faint);letter-spacing:.02em}
  .vA .where b{color:var(--ink);font-weight:500}
  @media(max-width:680px){.vA .hero{grid-template-columns:1fr;gap:1.25rem}}

  .vA .now{margin:2rem 0 3.5rem;padding:1.5rem 1.75rem;background:var(--paper-2);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;font-family:var(--serif);font-size:clamp(19px,2.2vw,26px);line-height:1.3;letter-spacing:-.01em}
  .vA .now .l{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:.5rem;font-weight:500}
  .vA .now b{color:var(--ink);font-weight:400;font-style:italic}
  .vA .now span{color:var(--ink-faint)}

  .vA section{padding:2rem 0;border-top:1px solid var(--rule)}
  .vA section:first-of-type{border-top:0}
  .vA .h{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:1.25rem;display:flex;justify-content:space-between;align-items:baseline}
  .vA .h .cnt{color:var(--ink-faint);font-weight:400}

  .vA .papers{display:grid;gap:1.5rem}
  .vA .paper{display:grid;grid-template-columns:1fr 220px;gap:1.5rem;align-items:start;padding:1rem 0;border-bottom:1px solid var(--rule)}
  .vA .paper:last-child{border-bottom:0}
  .vA .paper .meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;color:var(--ink-faint);margin-bottom:.5rem;display:flex;gap:.8rem}
  .vA .paper .meta b{color:var(--accent);font-weight:500}
  .vA .paper h3{font-family:var(--serif);font-weight:400;font-size:20px;line-height:1.25;letter-spacing:-.01em;margin:0 0 .5rem}
  .vA .paper h3 a{color:var(--ink);text-decoration:none;background-image:linear-gradient(var(--accent),var(--accent));background-repeat:no-repeat;background-size:0 1px;background-position:0 100%;transition:background-size .25s ease,color .15s}
  .vA .paper h3 a:hover{color:var(--accent);background-size:100% 1px;opacity:1}
  .vA .paper h3 a:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:2px}
  .vA .paper p{color:var(--ink-soft);margin:0;max-width:58ch;font-size:15px;line-height:1.5}
  .vA .paper .authors{margin-top:.55rem;font-size:12.5px;color:var(--ink-faint);line-height:1.4}
  .vA .paper .authors b{color:var(--ink);font-weight:500}
  .vA .paper .tsr{aspect-ratio:16/9;color:var(--accent);background:var(--paper-2);border-radius:4px;overflow:hidden;position:relative}
  @media(max-width:680px){.vA .paper{grid-template-columns:1fr}.vA .paper .tsr{order:-1;max-height:140px}}

  .vA .trio{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
  @media(max-width:680px){.vA .trio{grid-template-columns:1fr}}
  .vA .trio > div{padding:.9rem 0;border-top:1px solid var(--ink)}
  .vA .trio h4{font-family:var(--serif);font-weight:400;font-size:19px;margin:0 0 .2rem;letter-spacing:-.005em}
  .vA .trio p{margin:0;color:var(--ink-soft);font-size:13px;font-family:var(--mono);letter-spacing:.02em}

  .vA .foot{padding:1.5rem 0 3rem;border-top:1px solid var(--rule);display:flex;justify-content:space-between;flex-wrap:wrap;gap:.8rem;font-family:var(--mono);font-size:11px;color:var(--ink-faint)}
  .vA .foot a{color:var(--ink)}
  `;
  const pubs=J.pubs.map(p=>{
    const title = p.link
      ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>`
      : p.title;
    return `
    <article class="paper">
      <div>
        <div class="meta"><b>${p.year}</b><span>${p.venue}</span></div>
        <h3>${title}</h3>
        <p>${p.blurb}</p>
        <div class="authors">${p.authors}</div>
      </div>
      <div class="tsr">${TEASER(p.teaser)}</div>
    </article>`;
  }).join('');
  root.innerHTML=`<style>${css}</style><div class="vA"><div class="wrap">
    <div class="hero">
      <div class="portrait" aria-hidden="true"></div>
      <div>
        <h1>Zhongqi <em>"Jason"</em> Lin.</h1>
        <p class="sub">${J.bio}</p>
        <div class="where"><b>${J.role}</b> · ${J.lab} · ${J.institution}</div>
      </div>
    </div>

    <div class="now"><span class="l">Currently</span>Watching <b>transcription unfold</b> across skin stem cells in living mice <span>— one pulse, one neighborhood, one day at a time.</span></div>

    <section>
      <div class="h"><span>Selected Papers</span><span class="cnt">${J.pubs.length} of ${J.pubs.length}</span></div>
      <div class="papers">${pubs}</div>
    </section>

    <section>
      <div class="h"><span>Three things I think about</span></div>
      <div class="trio">
        ${J.interests.map(i=>`<div><h4>${i.title}</h4><p>${i.sub}</p></div>`).join('')}
      </div>
    </section>

    <div class="foot">
      <span>${J.location}</span>
      <span><a href="mailto:${J.email}">${J.email}</a></span>
      <span>© ${new Date().getFullYear()}</span>
    </div>
  </div></div>`;
})();
