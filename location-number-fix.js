(()=>{
function apply(){document.querySelectorAll('.location-card').forEach((card,i)=>card.setAttribute('data-number',String(i+1)))}
apply();new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
