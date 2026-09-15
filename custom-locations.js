(function(){
  const sprite='/assets/custom-locations-10.webp';
  const pos={'Câu lạc bộ đêm':[0,0],'Tàu biển':[1,0],'Tàu cướp biển':[2,0],'Tàu chở khách':[3,0],'Trạm Bắc Cực':[4,0],'Căn cứ quân sự':[0,1],'Đại học':[1,1],'Sở thú':[2,1],'Rạp hát':[3,1],'Đồn cảnh sát':[4,1]};
  function css(name){const p=pos[name];return p?`background-image:url("${sprite}");background-size:500% 200%;background-position:${p[0]*25}% ${p[1]*100}%`:''}
  function patchCard(card){const name=card.dataset.location;if(!pos[name]||card.dataset.customPatched)return;card.dataset.customPatched='1';card.style.cssText+=';'+css(name);card.addEventListener('click',()=>setTimeout(()=>{const img=document.getElementById('locationModalImage');if(img){img.style.cssText+=';'+css(name);img.style.backgroundImage=`url("${sprite}")`}},0))}
  function patch(){document.querySelectorAll('.location-card').forEach(patchCard)}
  function watch(g){new MutationObserver(patch).observe(g,{childList:true,subtree:true});patch()}
  const g=document.getElementById('locationGrid');if(g)watch(g);else{const w=new MutationObserver(()=>{const x=document.getElementById('locationGrid');if(x){w.disconnect();watch(x)}});w.observe(document.documentElement,{childList:true,subtree:true})}
})();