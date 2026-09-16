(()=>{
  const waitForSocket=(action)=>{
    if(socket.connected){action();return}
    const note=document.getElementById('lobbyMessage');
    if(note)note.textContent='Đang kết nối máy chủ...';
    const once=()=>{socket.off('connect',once);action()};
    socket.once('connect',once);
  };
  const bind=()=>{
    const create=document.getElementById('createRoomBtn');
    const join=document.getElementById('joinRoomBtn');
    if(create)create.onclick=()=>{
      const name=document.getElementById('playerName')?.value.trim();
      if(!name){if(typeof msg==='function')msg('Nhập tên trước.');return}
      waitForSocket(()=>socket.emit('create_room',{name}));
    };
    if(join)join.onclick=()=>{
      const name=document.getElementById('playerName')?.value.trim();
      const code=document.getElementById('roomCode')?.value.trim();
      if(!name){if(typeof msg==='function')msg('Nhập tên trước.');return}
      if(!code){if(typeof msg==='function')msg('Nhập mã phòng.');return}
      waitForSocket(()=>socket.emit('join_room',{name,code}));
    };
  };
  socket.on('connect',()=>{if(typeof renderAll==='function')renderAll()});
  socket.on('connect_error',()=>{const note=document.getElementById('lobbyMessage');if(note&&!state.room)note.textContent='Không kết nối được máy chủ. Đang tự kết nối lại...'});
  socket.on('disconnect',()=>{if(!state.room){const note=document.getElementById('lobbyMessage');if(note)note.textContent='Mất kết nối máy chủ. Đang tự kết nối lại...'}});
  bind();
})();
