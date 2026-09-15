(() => {
  // 10 custom images are stored as one 5x2 sprite.
  // Row 1: Night Club, Cruise Ship, Pirate Ship, Passenger Boat, Arctic Station.
  // Row 2: Military Base, University, Zoo, Theater, Police Station.
  const SPRITE = '/assets/custom-locations-10.webp?v=20260916';
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

  function apply(card) {
    const name = card.dataset.location;
    const p = POS[name];
    if (!p) return;
    card.style.backgroundImage = `url("${SPRITE}")`;
    card.style.backgroundSize = '500% 200%';
    card.style.backgroundPosition = `${p[0] * 25}% ${p[1] * 100}%`;
    card.style.backgroundRepeat = 'no-repeat';
  }

  function patchModal() {
    const nameEl = document.getElementById('locationModalName');
    const img = document.getElementById('locationModalImage');
    if (!nameEl || !img) return;
    const p = POS[nameEl.textContent.trim()];
    if (!p) return;
    img.style.backgroundImage = `url("${SPRITE}")`;
    img.style.backgroundSize = '500% 200%';
    img.style.backgroundPosition = `${p[0] * 25}% ${p[1] * 100}%`;
    img.style.backgroundRepeat = 'no-repeat';
  }

  function patch() {
    document.querySelectorAll('.location-card').forEach(apply);
    patchModal();
  }

  const observer = new MutationObserver(patch);
  observer.observe(document.documentElement, {childList:true, subtree:true});
  patch();
  document.addEventListener('click', () => setTimeout(patch, 0));
})();
