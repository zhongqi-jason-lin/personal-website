(function(){
  const panel=document.getElementById('tweaks-panel');
  const toggle=document.getElementById('tweak-toggle');
  if(!panel) return;

  const KEY='zl:tweaks';
  const defaults=Object.assign(
    {theme:'auto',density:'normal',accent:'oklch(0.72 0.12 205)'},
    typeof TWEAK_DEFAULTS!=='undefined'?TWEAK_DEFAULTS:{}
  );
  let s;
  try{ s=Object.assign({},defaults,JSON.parse(localStorage.getItem(KEY)||'{}')); }
  catch(e){ s=Object.assign({},defaults); }

  const darkMQ=matchMedia('(prefers-color-scheme: dark)');
  function resolvedTheme(){
    return s.theme==='auto' ? (darkMQ.matches?'dark':'light') : s.theme;
  }

  function apply(){
    document.documentElement.setAttribute('data-theme',resolvedTheme());
    document.documentElement.setAttribute('data-density',s.density);
    document.documentElement.style.setProperty('--accent',s.accent);
    document.documentElement.style.setProperty('--accent-soft',s.accent.replace(/\)\s*$/,' / 0.15)'));
  }

  // When theme is 'auto', react to OS-level changes live.
  const onMQ=()=>{ if(s.theme==='auto') apply(); };
  if(darkMQ.addEventListener) darkMQ.addEventListener('change',onMQ);
  else if(darkMQ.addListener) darkMQ.addListener(onMQ);

  function syncUI(){
    panel.querySelectorAll('[data-key]').forEach(g=>{
      const k=g.dataset.key;
      g.querySelectorAll('button').forEach(b=>{
        b.setAttribute('aria-pressed',b.dataset.val===s[k]?'true':'false');
      });
    });
  }

  function persist(){
    try{ localStorage.setItem(KEY,JSON.stringify(s)); }catch(e){}
  }

  function setPanelOpen(open){
    panel.classList.toggle('open',open);
    panel.setAttribute('aria-hidden',open?'false':'true');
    if(toggle) toggle.setAttribute('aria-expanded',open?'true':'false');
  }

  apply(); syncUI();

  panel.addEventListener('click',e=>{
    const b=e.target.closest('button[data-val]');
    if(!b) return;
    const g=b.closest('[data-key]');
    if(!g) return;
    s[g.dataset.key]=b.dataset.val;
    apply(); syncUI(); persist();
  });

  if(toggle){
    toggle.addEventListener('click',()=>{
      setPanelOpen(!panel.classList.contains('open'));
    });
  }

  document.addEventListener('click',e=>{
    if(!panel.classList.contains('open')) return;
    if(panel.contains(e.target)||(toggle&&toggle.contains(e.target))) return;
    setPanelOpen(false);
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&panel.classList.contains('open')) setPanelOpen(false);
  });
})();
