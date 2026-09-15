(() => {
  const SPRITE = '/assets/custom-locations-10.jpg?v=20260916';
  const POS = {'Câu lạc bộ đêm':[0,0],'Tàu biển':[1,0],'Tàu cướp biển':[2,0],'Tàu chở khách':[3,0],'Trạm Bắc Cực':[4,0],'Căn cứ quân sự':[0,1],'Đại học':[1,1],'Sở thú':[2,1],'Rạp hát':[3,1],'Đồn cảnh sát':[4,1]};
  function apply(el,name){const p=POS[name||el.dataset.location];if(!p)return;el.style.setProperty('background-image',`url("${SPRITE}")`,'important');el.style.setProperty('background-size','500% 200%','important');el.style.setProperty('background-position',`${p[0]*25}% ${p[1]*100}%`,'important');el.style.setProperty('background-repeat','no-repeat','important');}
  function patch(){document.querySelectorAll('.location-card').forEach(c=>apply(c));const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim());}
  new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();document.addEventListener('click',()=>setTimeout(patch,30));
})();