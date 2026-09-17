(()=>{
  const main=[120,150,180], extra=[60,90,120], locs=[20,25,30];
  function boardTitle(){const title=document.querySelector('.board-title span');if(title&&Array.isArray(state.locations)&&state.locations.length)title.textContent=`📍 BẢNG ĐỊA ĐIỂM (${state.locations.length})`}
  function lobbySettings(){
    const box=document.querySelector('.room-settings'); if(!box)return;
    let wrap=document.getElementById('v2LobbySettings');
    if(!wrap){
      wrap=document.createElement('div');wrap.id='v2LobbySettings';wrap.style.marginTop='14px';
      wrap.innerHTML='<label for="v2LocationCount">Số lượng địa điểm</label><select id="v2LocationCount"><option value="20">20 địa điểm</option><option value="25">25 địa điểm</option><option value="30">30 địa điểm</option></select><p class="muted small">Mỗi vòng sẽ chọn ngẫu nhiên số địa điểm này.</p><label for="v2MainTime">Vòng game chính</label><select id="v2MainTime"><option value="120">2 phút/người</option><option value="150">2 phút 30 giây/người</option><option value="180">3 phút/người</option></select><p class="muted small">Tổng thời gian = phút/người × số người chơi.</p><label for="v2ExtraTime">Vòng game thêm</label><select id="v2ExtraTime"><option value="60">1 phút/người</option><option value="90">1 phút 30 giây/người</option><option value="120">2 phút/người</option></select><p class="muted small">Tổng thời gian = phút/người × số người chơi.</p>';
      box.appendChild(wrap);
      const emit=()=>socket.emit('set_time_settings',{mainTimeSec:Number(document.getElementById('v2MainTime').value),extraTimeSec:Number(document.getElementById('v2ExtraTime').value)});
      document.getElementById('v2LocationCount').onchange=e=>socket.emit('set_location_count',{locationCount:Number(e.target.value)});
      document.getElementById('v2MainTime').onchange=emit;
      document.getElementById('v2ExtraTime').onchange=emit;
    }
    const host=state.selfId===state.hostId;
    const l=document.getElementById('v2LocationCount'),m=document.getElementById('v2MainTime'),e=document.getElementById('v2ExtraTime');
    if(l){l.value=String(locs.includes(Number(state.locationCount))?state.locationCount:20);l.disabled=!host}
    if(m){m.value=String(main.includes(Number(state.mainTimeSec))?state.mainTimeSec:120);m.disabled=!host}
    if(e){e.value=String(extra.includes(Number(state.extraTimeSec))?state.extraTimeSec:60);e.disabled=!host}
  }
  const oldLobby=window.renderLobby;
  if(oldLobby)window.renderLobby=function(){oldLobby();lobbySettings()};
  function turnParity(){
    const current=state.players[state.turnIndex], pending=state.pending;
    if(pending){
      const from=state.players.find(p=>p.id===pending.fromId)?.name||'';
      const to=state.players.find(p=>p.id===pending.toId)?.name||'';
      $('turnLabel').textContent=`Lượt ${from} → ${to}`;
      $('turnInstruction').textContent=pending.toId===state.selfId?'Trả lời câu hỏi bên dưới.':'Đang chờ câu trả lời.';
      return;
    }
    if(state.phase==='discussion'){$('turnLabel').textContent='THẢO LUẬN';$('turnInstruction').textContent='Tất cả đã được hỏi. Thảo luận và bỏ phiếu.';return}
    if(state.phase==='round_decision'){$('turnLabel').textContent='BIỂU QUYẾT';$('turnInstruction').textContent='Thảo luận kín về việc có thêm 1 vòng hay không.';return}
    const myTurn=current?.id===state.selfId;
    $('turnLabel').textContent=myTurn?'LƯỢT CỦA BẠN':`LƯỢT: ${current?.name||''}`;
    $('turnInstruction').textContent=state.paused?'Game đang tạm dừng.':myTurn?'Chọn một người và đặt câu hỏi.':`Chờ ${current?.name||''} đặt câu hỏi.`;
  }
  window.renderTurn=turnParity;
  socket.on('room_state',()=>setTimeout(()=>{lobbySettings();boardTitle();if(['game','discussion','round_decision'].includes(state.phase))turnParity()},0));
  socket.on('joined',()=>setTimeout(lobbySettings,0));
  setInterval(()=>{lobbySettings();boardTitle()},500);
})();
