(()=>{
const srcFor=name=>`/assets/${encodeURIComponent(name)}.webp`;
function apply(el,name){if(!el||!name)return;const src=srcFor(name);el.style.setProperty('background-image',`url("${src}")`,'important');el.style.setProperty('background-size','cover','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important')}
function patch(){document.querySelectorAll('.location-card').forEach(c=>{const name=c.dataset.location||c.getAttribute('title');if(name)apply(c,name)});const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim())}
new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();
function renderRoleVariant(){
 const role=state.role,title=document.getElementById('roleTitle'),info=document.getElementById('roleInfo'),hide=document.getElementById('hideRoleBtn'),card=document.getElementById('roleCard');
 if(!title||!info||!hide||!card)return;
 const spy=!!role?.spy;
 title.textContent=spy?(role?.spyCount>1?'🕵️ BẠN LÀ MỘT TRONG CÁC GIÁN ĐIỆP':'🕵️ BẠN LÀ GIÁN ĐIỆP'):`👤 ${role?.role||'Đang chia vai...'}`;
 info.textContent=spy?'Bạn không biết địa điểm và không có vai trò. Hãy suy luận!':`📍 Địa điểm: ${role?.location||''}`;
 hide.textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';card.classList.toggle('role-hidden',!state.roleVisible);
}
window.renderRoleVariant=renderRoleVariant;
const originalRenderGame=window.renderGame;
})();