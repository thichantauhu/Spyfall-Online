(()=>{
const locations=['Đại học','Sở thú','Rạp hát','Đồn cảnh sát','Câu lạc bộ đêm','Tàu biển','Tàu cướp biển','Tàu chở khách','Trạm Bắc Cực','Căn cứ quân sự','Hãng phim','Bệnh viện','Đại sứ quán','Khách sạn','Spa','Lều gánh xiếc','Quân Thập Tự','Sòng bạc','Tiệc công ty','Bãi biển','Công viên giải trí','Hội chợ','Ngân hàng','Máy bay','Siêu thị','Tàu ngầm','Trạm vũ trụ','Trạm dịch vụ','Trường học','Nhà hàng'];
const esc=s=>String(s??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
const srcFor=name=>`/assets/${encodeURIComponent(name)}.webp`;
function renderBoard(){
 const grid=document.getElementById('locationGrid');
 if(!grid)return;
 if(grid.dataset.rendered==='1'&&grid.children.length===locations.length)return;
 grid.dataset.rendered='1';
 grid.innerHTML=locations.map((name,i)=>`<button type="button" class="location-card" data-location="${esc(name)}" data-number="${i+1}" title="${esc(name)}" aria-label="${i+1}. ${esc(name)}" style="background-image:url('${srcFor(name)}')"></button>`).join('');
 grid.querySelectorAll('.location-card').forEach(card=>card.addEventListener('click',()=>openModal(card.dataset.location)));
}
function openModal(name){
 const modal=document.getElementById('locationModal'),img=document.getElementById('locationModalImage'),label=document.getElementById('locationModalName');
 if(!modal||!img||!label)return;
 label.textContent=name;img.style.backgroundImage=`url("${srcFor(name)}")`;img.alt=name;modal.classList.add('show');modal.setAttribute('aria-hidden','false');
}
function closeModal(){const modal=document.getElementById('locationModal');if(!modal)return;modal.classList.remove('show');modal.setAttribute('aria-hidden','true')}
function hook(){
 if(typeof renderGame!=='function')return setTimeout(hook,50);
 const original=renderGame;
 renderGame=function(){original();renderBoard()};
 document.getElementById('locationModal')?.addEventListener('click',e=>{if(e.target.id==='locationModal'||e.target.id==='locationModalImage'||e.target.closest('#locationModalImage'))closeModal()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
 renderBoard();
}
hook();
})();