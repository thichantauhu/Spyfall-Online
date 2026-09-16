(()=>{
const srcFor=name=>`/assets/${encodeURIComponent(name)}.webp`;
function apply(el,name){if(!el||!name)return;const src=srcFor(name);el.style.setProperty('background-image',`url("${src}")`,'important');el.style.setProperty('background-size','cover','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important')}
function patch(){document.querySelectorAll('.location-card').forEach(c=>{const name=c.dataset.location||c.getAttribute('title');if(name)apply(c,name)});const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim())}
new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();

// Role variant UI: normal players see both location and their assigned role; spies see neither.
const oldRenderRole=window.renderRole;
window.renderRole=function(){
  const role=window.state?.role;
  const title=document.getElementById('roleTitle');
  const info=document.getElementById('roleInfo');
  const hide=document.getElementById('hideRoleBtn');
  const card=document.getElementById('roleCard');
  if(!title||!info||!hide||!card)return;
  const spy=!!role?.spy;
  title.textContent=spy?(role?.spyCount>1?'🕵️ BẠN LÀ MỘT TRONG CÁC GIÁN ĐIỆP':'🕵️ BẠN LÀ GIÁN ĐIỆP'):`👤 ${role?.role||'Đang chia vai...'}`;
  info.textContent=spy?'Bạn không biết địa điểm và không có vai trò. Hãy suy luận!':`📍 Địa điểm: ${role?.location||''}`;
  hide.textContent=role?.roleVisible===false?'Hiện thông tin':'Ẩn thông tin';
  card.classList.toggle('role-hidden',role?.roleVisible===false);
};
})();