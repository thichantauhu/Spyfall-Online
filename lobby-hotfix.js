(()=>{
  function setMsg(t){const a=document.getElementById('lobbyMessage');const b=document.getElementById('roomMessage');if(a)a.textContent=t||'';if(b)b.textContent=t||''}
  function emitWhenConnected(event,payload){
    if(socket.connected){socket.emit(event,payload);return}
    setMsg('Đang kết nối máy chủ...');
    const send=()=>socket.emit(event,payload);
    socket.once('connect',send);
    socket.connect();
  }
  document.addEventListener('click',e=>{
    const create=e.target.closest?.('#createRoomBtn');
    const join=e.target.closest?.('#joinRoomBtn');
    if(!create&&!join)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(create){
      const name=(document.getElementById('playerName')?.value||'').trim();
      if(!name){setMsg('Nhập tên trước.');return}
      emitWhenConnected('create_room',{name});
    }else{
      const name=(document.getElementById('playerName')?.value||'').trim();
      const code=(document.getElementById('roomCode')?.value||'').trim().toUpperCase();
      if(!name){setMsg('Nhập tên trước.');return}
      if(!code){setMsg('Nhập mã phòng.');return}
      emitWhenConnected('join_room',{name,code});
    }
  },true);
  socket.on('connect_error',()=>setMsg('Không kết nối được máy chủ. Hãy tải lại trang rồi thử lại.'));
  socket.on('error_msg',m=>setMsg(m));
  socket.on('joined',d=>{
    if(window.state){state.room=d.room;state.selfId=d.selfId;state.phase='lobby'}
    if(window.showScreen)showScreen('room');
    const code=document.getElementById('roomCodeLabel');if(code)code.textContent=d.room||'------';
    const gameCode=document.getElementById('gameRoomCode');if(gameCode)gameCode.textContent=d.room||'------';
  });
})();
