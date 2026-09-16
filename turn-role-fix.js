(()=>{
  const $=id=>document.getElementById(id);
  function findName(id){return (state.players||[]).find(p=>p.id===id)?.name||'Người chơi'}
  function render(){
    const label=$('turnLabel'),instruction=$('turnInstruction');
    if(!label)return;
    const players=state.players||[],pending=state.pending;
    if(state.phase==='discussion'){
      label.textContent='THẢO LUẬN';
      if(instruction)instruction.textContent='Tất cả đã được hỏi. Thảo luận và bỏ phiếu.';
      return;
    }
    if(state.phase==='round_decision'){
      label.textContent='BIỂU QUYẾT';
      if(instruction)instruction.textContent='Thảo luận xem có chơi thêm 1 vòng hay không.';
      return;
    }
    if(state.phase!=='game')return;
    if(pending){
      const toName=findName(pending.toId);
      label.textContent=`Lượt ${toName} trả lời`;
      if(instruction)instruction.textContent=pending.toId===state.selfId?'Trả lời câu hỏi bên dưới.':`Đang chờ ${toName} trả lời.`;
      return;
    }
    const current=players[state.turnIndex];
    if(!current)return;
    if(current.id===state.selfId && state.selectedTarget){
      const target=players.find(p=>p.id===state.selectedTarget);
      if(target){
        label.textContent=`Lượt ${current.name} → ${target.name}`;
        if(instruction)instruction.textContent='Đặt câu hỏi cho người chơi đã chọn.';
        return;
      }
    }
    label.textContent=`Lượt của ${current.name}`;
    if(instruction)instruction.textContent=current.id===state.selfId?'Chọn một người và đặt câu hỏi.':`Đang chờ ${current.name} đặt câu hỏi.`;
  }
  socket.on('role',()=>setTimeout(render,0));
  socket.on('room_state',()=>setTimeout(render,0));
  setInterval(render,250);
  setTimeout(render,0);
})();
