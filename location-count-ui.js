(()=>{
  const options=[20,25,30];
  function sync(){
    const box=document.querySelector('.room-settings');
    if(!box)return;
    let wrap=document.getElementById('locationCountSetting');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='locationCountSetting';
      wrap.style.marginTop='14px';
      wrap.innerHTML='<label for="locationCountSelect">Số lượng địa điểm</label><select id="locationCountSelect"><option value="20">20 địa điểm</option><option value="25">25 địa điểm</option><option value="30">30 địa điểm</option></select><p class="muted small">Mỗi vòng sẽ chọn ngẫu nhiên số địa điểm này.</p>';
      box.appendChild(wrap);
      const select=document.getElementById('locationCountSelect');
      select.onchange=()=>socket.emit('set_location_count',{locationCount:Number(select.value)});
    }
    const select=document.getElementById('locationCountSelect');
    const isHost=state.selfId===state.hostId;
    const value=options.includes(Number(state.locationCount))?Number(state.locationCount):20;
    if(select){select.value=String(value);select.disabled=!isHost}
  }
  function boardTitle(){
    const title=document.querySelector('.board-title span');
    if(title&&Array.isArray(state.locations)&&state.locations.length)title.textContent=`📍 BẢNG ĐỊA ĐIỂM (${state.locations.length})`;
  }
  socket.on('room_state',()=>setTimeout(()=>{sync();boardTitle()},0));
  socket.on('joined',()=>setTimeout(sync,0));
  const timer=setInterval(()=>{sync();boardTitle()},500);
})();
