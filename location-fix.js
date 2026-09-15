(() => {
  // Correct 10 supplied location images.
  // The repository's JPEG is the valid uploaded sprite; the old WEBP placeholder was only 11 bytes.
  const SPRITE = '/assets/custom-locations-10.jpg?v=20260916b';
  const POS = {
    'Câu lạc bộ đêm':[0,0],
    'Tàu biển':[1,0],
    'Tàu cướp biển':[2,0],
    'Tàu chở khách':[3,0],
    'Trạm Bắc Cực':[4,0],
    'Căn cứ quân sự':[0,1],
    'Đại học':[1,1],
    'Sở thú':[2,1],
    'Rạp hát':[3,1],
    'Đồn cảnh sát':[4,1]
  };
  function apply(card){
    const p=POS[card.dataset.location]; if(!p)return;
    card.style.backgroundImage=`url("${SPRITE}")`;
    card.style.backgroundSize='500% 200%';
    card.style.backgroundPosition=`${p[0]*25}% ${p[1]*100}%`;
    card.style.backgroundRepeat='no-repeat';
  }
  function patchModal(){
    const name=document.getElementById('locationModalName');
    const img=document.getElementById('locationModalImage');
    if(!name||!img)return;
    const p=POS[name.textContent.trim()]; if(!p)return;
    img.style.backgroundImage=`url("${SPRITE}")`;
    img.style.backgroundSize='500% 200%';
    img.style.backgroundPosition=`${p[0]*25}% ${p[1]*100}%`;
    img.style.backgroundRepeat='no-repeat';
  }
  function patch(){document.querySelectorAll('.location-card').forEach(apply);patchModal()}
  new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});
  patch(); document.addEventListener('click',()=>setTimeout(patch,0));
})();
