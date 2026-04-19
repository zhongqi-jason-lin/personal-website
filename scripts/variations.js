(function(){
  const tabs=document.querySelectorAll('.vbar [data-variation]');
  const panels=document.querySelectorAll('.variation');
  function show(id){
    tabs.forEach(t=>t.setAttribute('aria-current',t.dataset.variation===id?'true':'false'));
    panels.forEach(p=>p.setAttribute('data-active',p.id===id?'true':'false'));
    try{localStorage.setItem('zl:variation',id)}catch(e){}
    window.scrollTo({top:0,behavior:'instant'});
  }
  tabs.forEach(t=>t.addEventListener('click',()=>show(t.dataset.variation)));
  try{const s=localStorage.getItem('zl:variation');if(s&&document.getElementById(s))show(s)}catch(e){}
})();
