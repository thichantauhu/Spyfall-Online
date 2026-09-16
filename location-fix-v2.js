(()=>{
const srcFor=name=>`/assets/${encodeURIComponent(name)}.webp`;
function apply(el,name){if(!el||!name)return;const src=srcFor(name);el.style.setProperty('background-image',`url("${src}")`,'important');el.style.setProperty('background-size','cover','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important')}
function patch(){document.querySelectorAll('.location-card').forEach(c=>apply(c,c.dataset.location));const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim())}
const css=document.createElement('link');css.rel='stylesheet';css.href='/game-ui-v3.css?v=20260916a';document.head.appendChild(css);const js=document.createElement('script');js.src='/game-ui-v3.js?v=20260916a';document.body.appendChild(js);
new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();document.addEventListener('click',()=>setTimeout(patch,30));
})();