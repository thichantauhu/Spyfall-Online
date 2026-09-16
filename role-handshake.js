(()=>{
  function syncRole(){
    if((state.phase==='game'||state.phase==='discussion'||state.phase==='round_decision')&&!state.role)socket.emit('request_role');
  }
  socket.on('room_state',()=>setTimeout(syncRole,50));
  socket.on('connect',()=>setTimeout(syncRole,100));
  setInterval(syncRole,1000);
})();
