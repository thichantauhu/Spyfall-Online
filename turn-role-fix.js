(()=>{
  const $=id=>document.getElementById(id);
  function findName(id){return (state.players||[]).find(p=>p.id===id)?.name||'Người chơi'}
  function render(){
    const label=$('turnLabel'),instruction=$('turnInstruction');
    if(!label)return;
    const players=state.players||[],pending=state.pending,preview=state.turnPreview;
    if(state.phase==='discussion'){label.textContent='THẢO LUẬN';if(instruction)instruction.textContent='Tất cả đã được hỏi. Thảo luận và bỏ phiếu.';return}
    if(state.phase==='round_decision'){label.textContent='BIỂU QUYẾT';if(instruction)instruction.textContent='Thảo luận xem có chơi thêm 1 vòng hay không.';return}
    if(state.phase!=='game')return;
    if(pending){const toName=findName(pending.toId);label.textContent=`Lượt ${toName} trả lời`;if(instruction)instruction.textContent=pending.toId===state.selfId?'Trả lời câu hỏi bên dưới.':`Đang chờ ${toName} trả lời.`;return}
    if(preview){const fromName=findName(preview.fromId),toName=findName(preview.toId);label.textContent=`Lượt ${fromName} → ${toName}`;if(instruction)instruction.textContent='Đặt câu hỏi cho người chơi đã chọn.';return}
    const current=players[state.turnIndex];
    if(!current)return;
    label.textContent=`Lượt của ${current.name}`;
    if(instruction)instruction.textContent=current.id===state.selfId?'Chọn một người và đặt câu hỏi.':`Đang chờ ${current.name} đặt câu hỏi.`;
  }
  socket.on('role',()=>setTimeout(render,0));
  socket.on('room_state',()=>setTimeout(render,0));
  setInterval(render,250);
  setTimeout(render,0);
})();
