(()=>{
function apply(){const el=document.getElementById('roleInfo');if(!el)return;const text=el.textContent||'';if(!text.startsWith('Địa điểm: '))return;const name=text.slice(10).trim();const card=[...document.querySelectorAll('.location-card')].find(c=>c.title===name);const n=card?.dataset.number;if(n)el.textContent=`${n}. ${name}`}
apply();new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
