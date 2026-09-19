(()=>{
const fileName=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Đ/g,'D').replace(/đ/g,'d').replace(/\s+/g,'_');
const srcFor=name=>`/assets/${fileName(name)}.webp`;
function apply(el,name){if(!el||!name)return;const src=srcFor(name);el.style.setProperty('background-image',`url("${src}")`,'important');el.style.setProperty('background-size','cover','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important')}
function patch(){document.querySelectorAll('.location-card').forEach(c=>{const name=c.dataset.location||c.getAttribute('title');if(name)apply(c,name)});const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim())}
new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();
})();
