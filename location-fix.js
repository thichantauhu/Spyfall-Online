// Fix location-row sprites: each row file is a 5-cell VERTICAL strip.
window.renderLocations=function(){
  ensureLocationModal();
  const names=state.locationOrder.length?state.locationOrder:LOCATION_NAMES;
  $('locationGrid').innerHTML=names.map((name,i)=>{
    const p=LOCATION_POS[name]||[0,0];
    return `<div class="location-card" title="${esc(name)}" data-location="${esc(name)}" style="background-image:url('${LOCATION_ROWS[p[1]]}');background-size:100% 500%;background-position:50% ${p[0]*25}%"><span class="sr-only">${i+1}. ${esc(name)}</span></div>`;
  }).join('');
  document.querySelectorAll('.location-card').forEach(card=>card.addEventListener('click',()=>window.openLocationModal(card.dataset.location)));
};
window.openLocationModal=function(name){
  ensureLocationModal();
  const m=$('locationModal'),img=$('locationModalImage'),p=LOCATION_POS[name]||[0,0];
  img.style.backgroundImage=`url("${LOCATION_ROWS[p[1]]}")`;
  img.style.backgroundSize='100% 500%';
  img.style.backgroundPosition=`50% ${p[0]*25}%`;
  $('locationModalName').textContent=name;
  m.classList.add('show');m.setAttribute('aria-hidden','false');
};
