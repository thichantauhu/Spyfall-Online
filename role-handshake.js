(()=>{
  function syncRole(){
    if((state.phase==='game'||state.phase==='discussion'||state.phase==='round_decision')&&!state.role)socket.emit('request_role');
  }
  function syncRoomScreen(){
    if(state.room&&state.phase==='lobby'){
      document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
      document.getElementById('roomScreen')?.classList.add('active');
    }
  }
  socket.on('room_state',()=>{
    setTimeout(syncRole,50);
    setTimeout(syncRoomScreen,0);
  });
  socket.on('joined',()=>setTimeout(syncRoomScreen,0));
  socket.on('connect',()=>setTimeout(syncRole,100));
  setInterval(syncRole,1000);
})();
