(() => {
  // Custom location artwork supplied for this game.
  // The sprite is 5 columns x 2 rows, in this exact order:
  // Câu lạc bộ đêm, Tàu biển, Tàu cướp biển, Tàu chở khách, Trạm Bắc Cực,
  // Căn cứ quân sự, Đại học, Sở thú, Rạp hát, Đồn cảnh sát.
  const SPRITE = '/assets/custom-locations-10.jpg';
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

  const styleFor = (name) => {
    const p = POS[name];
    if (!p) return '';
    return `background-image:url("${SPRITE}");background-size:500% 200%;background-position:${p[0]*25}% ${p[1]*100}%;background-repeat:no-repeat;background-color:#eee;`;
  };

  const patchCard = (card) => {
    const name = card.dataset.location;
    if (!POS[name]) return;
    card.style.cssText += ';' + styleFor(name);
  };

  const patchModal = () => {
    const nameEl = document.getElementById('locationModalName');
    const img = document.getElementById('locationModalImage');
    if (!nameEl || !img) return;
    const name = nameEl.textContent.trim();
    if (!POS[name]) return;
    img.style.cssText += ';' + styleFor(name);
  };

  const patch = () => {
    document.querySelectorAll('.location-card').forEach(patchCard);
    patchModal();
  };

  const start = () => {
    const grid = document.getElementById('locationGrid');
    if (!grid) return false;
    new MutationObserver(patch).observe(grid, { childList:true, subtree:true });
    patch();
    return true;
  };

  if (!start()) {
    const observer = new MutationObserver(() => {
      if (start()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });
  }

  document.addEventListener('click', () => setTimeout(patchModal, 0));
})();
