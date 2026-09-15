(function(){
  const images={
    'Câu lạc bộ đêm':'/assets/locations/Câu%20l%E1%BA%A1c%20b%E1%BB%99%20%C4%91%C3%AAm(1).webp',
    'Tàu biển':'/assets/locations/T%C3%A0u%20bi%E1%BB%83n(1).webp',
    'Tàu cướp biển':'/assets/locations/T%C3%A0u%20c%C6%B0%E1%BB%9Bp%20bi%E1%BB%83n(1).webp',
    'Tàu chở khách':'/assets/locations/T%C3%A0u%20ch%E1%BB%9F%20kh%C3%A1ch(1).webp',
    'Trạm Bắc Cực':'/assets/locations/Tr%E1%BA%A1m%20B%E1%BA%AFc%20C%E1%BB%B1c(1).webp',
    'Căn cứ quân sự':'/assets/locations/C%C4%83n%20c%E1%BB%A9%20qu%C3%A2n%20s%E1%BB%B1(1).webp',
    'Đại học':'/assets/locations/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc(1).webp',
    'Sở thú':'/assets/locations/S%E1%BB%9F%20th%C3%BA(1).webp',
    'Rạp hát':'/assets/locations/R%E1%BA%A1p%20h%C3%A1t(1).webp',
    'Đồn cảnh sát':'/assets/locations/%C4%90%E1%BB%93n%20c%E1%BA%A3nh%20s%C3%A1t(1).webp'
  };
  function setImage(el,name){
    const src=images[name]; if(!src||!el)return;
    el.style.backgroundImage=`url("${src}")`;
    el.style.backgroundSize='cover';
    el.style.backgroundPosition='center';
    el.style.backgroundRepeat='no-repeat';
  }
  function patchCard(card){setImage(card,card.dataset.location)}
  function patch(){document.querySelectorAll('.location-card').forEach(patchCard)}
  function watch(g){new MutationObserver(patch).observe(g,{childList:true,subtree:true});patch()}
  const g=document.getElementById('locationGrid');
  if(g)watch(g);else{const w=new MutationObserver(()=>{const x=document.getElementById('locationGrid');if(x){w.disconnect();watch(x)}});w.observe(document.documentElement,{childList:true,subtree:true})}
  document.addEventListener('click',()=>setTimeout(()=>{
    const name=document.getElementById('locationModalName');
    const img=document.getElementById('locationModalImage');
    if(name&&img)setImage(img,name.textContent.trim());
  },0));
})();
