(()=>{
 const main=[120,150,180], extra=[60,90,120];
 const labels={120:'2 phút/người',150:'2 phút 30 giây/người',180:'3 phút/người',60:'1 phút/người',90:'1 phút 30 giây/người'};
 function sync(){
  const box=document.querySelector('.room-settings'); if(!box)return;
  let wrap=document.getElementById('timeSettings');
  if(!wrap){
   wrap=document.createElement('div');wrap.id='timeSettings';wrap.style.marginTop='14px';
   wrap.innerHTML='<label for="mainTimeSelect">Vòng game chính</label><select id="mainTimeSelect"></select><p class="muted small">Tổng thời gian = phút/người × số người chơi.</p><label for="extraTimeSelect">Vòng game thêm</label><select id="extraTimeSelect"></select><p class="muted small">Tổng thời gian = phút/người × số người chơi.</p>';
   box.appendChild(wrap);
   const a=document.getElementById('mainTimeSelect'),b=document.getElementById('extraTimeSelect');
   a.innerHTML=main.map(v=>`<option value="${v}">${labels[v]}</option>`).join('');
   b.innerHTML=extra.map(v=>`<option value="${v}">${labels[v]}</option>`).join('');
   a.onchange=()=>socket.emit('set_time_settings',{mainTimeSec:Number(a.value),extraTimeSec:Number(b.value)});
   b.onchange=()=>socket.emit('set_time_settings',{mainTimeSec:Number(a.value),extraTimeSec:Number(b.value)});
  }
  const a=document.getElementById('mainTimeSelect'),b=document.getElementById('extraTimeSelect');
  const host=state.selfId===state.hostId;
  if(a){a.value=String(main.includes(Number(state.mainTimeSec))?state.mainTimeSec:120);a.disabled=!host}
  if(b){b.value=String(extra.includes(Number(state.extraTimeSec))?state.extraTimeSec:60);b.disabled=!host}
 }
 socket.on('room_state',()=>setTimeout(sync,0));socket.on('joined',()=>setTimeout(sync,0));setInterval(sync,500);
})();
