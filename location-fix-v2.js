(()=>{
const srcFor=name=>`/assets/${encodeURIComponent(name)}.webp`;
const DISPLAY_NAMES={'Bai bien':'Bãi biển','Bai dap truc thang':'Bãi đáp trực thăng','Bao tang':'Bảo tàng','Ben du thuyen':'Bến du thuyền','Ben xe':'Bến xe','Benh vien':'Bệnh viện','Can cu quan su':'Căn cứ quân sự','Can phong bi mat':'Căn phòng bí mật','Cang bien':'Cảng biển','Cong truong xay dung':'Công trường xây dựng','Cong vien giai tri':'Công viên giải trí','Cong vien nuoc':'Công viên nước','Cua hang trang suc':'Cửa hàng trang sức','Dai hoc':'Đại học','Dai su quan':'Đại sứ quán','Dai truyen hinh':'Đài truyền hình','Dao hoang':'Đảo hoang','Den co':'Đền cổ','Don canh sat':'Đồn cảnh sát','Ga tau dien':'Ga tàu điện','Ga tau dien ngam':'Ga tàu điện ngầm','Hang phim':'Hãng phim','Ho boi':'Hồ bơi','Khach san':'Khách sạn','Kho hang':'Kho hàng','Khu cam trai':'Khu cắm trại','Khu khao co':'Khu khảo cổ','Khu nghi duong':'Khu nghỉ dưỡng','Khu rung':'Khu rừng','Khu truot tuyet':'Khu trượt tuyết','Lau dai':'Lâu đài','Leu ganh xiec':'Lều gánh xiếc','May bay':'Máy bay','Ngan hang':'Ngân hàng','Nha bep nha hang':'Nhà bếp nhà hàng','Nha hang':'Nhà hàng','Nha may':'Nhà máy','Nha tho':'Nhà thờ','Nui lua':'Núi lửa','Phong gym':'Phòng gym','Phong thi nghiem':'Phòng thí nghiệm','Phong thu am':'Phòng thu âm','Phong trien lam nghe thuat':'Phòng triển lãm nghệ thuật','Quan Thap Tu':'Quân Thập Tự','Rap chieu phim':'Rạp chiếu phim','Rap hat':'Rạp hát','Rap xiec':'Rạp xiếc','Sa mac':'Sa mạc','San bay':'Sân bay','San van dong':'Sân vận động','Sieu thi':'Siêu thị','So thu':'Sở thú','Song bac':'Sòng bạc','Spa':'Spa','Tau cuop bien':'Tàu cướp biển','Tau du lich':'Tàu du lịch','Tau hoa':'Tàu hỏa','Tau ngam':'Tàu ngầm','Thap quan sat':'Tháp quan sát','Thu vien':'Thư viện','Tiec cong ty':'Tiệc công ty','Toa an':'Tòa án','Toa soan bao':'Tòa soạn báo','Tram Bac Cuc':'Trạm Bắc Cực','Tram cuu hoa':'Trạm cứu hỏa','Tram dich vu':'Trạm dịch vụ','Tram vu tru':'Trạm vũ trụ','Tram xang':'Trạm xăng','Trung tam nghien cuu':'Trung tâm nghiên cứu','Truong dua xe':'Trường đua xe','Truong hoc':'Trường học'};
const displayName=name=>DISPLAY_NAMES[name]||name;
function apply(el,name){if(!el||!name)return;const src=srcFor(name);el.style.setProperty('background-image',`url("${src}")`,'important');el.style.setProperty('background-size','cover','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important')}
function patch(){document.querySelectorAll('.location-card').forEach(c=>{const name=c.dataset.location||c.getAttribute('title');if(name)apply(c,name)});const n=document.getElementById('locationModalName'),i=document.getElementById('locationModalImage');if(n&&i)apply(i,n.textContent.trim())}
new MutationObserver(patch).observe(document.documentElement,{childList:true,subtree:true});patch();
function renderRoleVariant(){
 const role=state.role,title=document.getElementById('roleTitle'),info=document.getElementById('roleInfo'),hide=document.getElementById('hideRoleBtn'),card=document.getElementById('roleCard');
 if(!title||!info||!hide||!card)return;
 const spy=!!role?.spy;
 title.textContent=spy?(role?.spyCount>1?'🕵️ BẠN LÀ MỘT TRONG CÁC GIÁN ĐIỆP':'🕵️ BẠN LÀ GIÁN ĐIỆP'):`👤 ${role?.role||'Đang chia vai...'}`;
 if(spy){
   info.textContent='Bạn không biết địa điểm và không có vai trò. Hãy suy luận!';
 }else{
   const location=role?.location||'';
   const locations=Array.isArray(state.locations)?state.locations:[];
   const number=locations.indexOf(location)+1;
   const numbered=number>0?`${number}. ${displayName(location)}`:displayName(location);
   info.textContent=`📍 Địa điểm: ${numbered}`;
 }
 hide.textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';card.classList.toggle('role-hidden',!state.roleVisible);
}
function hook(){
 if(typeof renderGame!=='function')return setTimeout(hook,50);
 const original=renderGame;
 renderGame=function(){original();renderRoleVariant()};
 const btn=document.getElementById('hideRoleBtn');
 if(btn)btn.onclick=()=>{state.roleVisible=!state.roleVisible;renderRoleVariant()};
 renderRoleVariant();
}
hook();
window.renderRoleVariant=renderRoleVariant;
})();