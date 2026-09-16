(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  function renderRoleFix(){
    const title=$('roleTitle'),info=$('roleInfo'),hide=$('hideRoleBtn'),card=$('roleCard');
    if(!title||!info||!hide||!card)return;
    const r=state.role;
    if(!r){title.textContent='⏳ Đang chia vai...';info.textContent='Đang nhận vai trò từ máy chủ...';return}
    if(r.spy){title.textContent=(r.spyCount||state.spyCount)>1?'🕵️ BẠN LÀ MỘT TRONG CÁC GIÁN ĐIỆP':'🕵️ BẠN LÀ GIÁN ĐIỆP';info.textContent='Bạn không biết địa điểm và không có vai trò. Hãy suy luận!'}
    else{title.textContent=`👤 ${r.role||'Đang chia vai...'}`;info.textContent=`📍 Địa điểm: ${r.location||''}`}
    hide.textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';card.classList.toggle('role-hidden',!state.roleVisible);
  }
  function renderTurnFix(){
    const label=$('turnLabel'),instruction=$('turnInstruction');if(!label)return;
    if(state.phase==='discussion'){label.textContent='THẢO LUẬN';if(instruction)instruction.textContent='Tất cả đã được hỏi. Thảo luận và bỏ phiếu.';return}
    if(state.phase!=='game')return;
    const players=state.players||[],pending=state.pending;
    const num=id=>{const i=players.findIndex(p=>p.id===id);return i>=0?i+1:'?'};
    if(pending){label.textContent=`Lượt ${num(pending.fromId)} → ${num(pending.toId)}`;if(instruction)instruction.textContent=pending.toId===state.selfId?'Trả lời câu hỏi bên dưới.':'Đang chờ câu trả lời.';return}
    const current=players[state.turnIndex];if(current){label.textContent=current.id===state.selfId?'LƯỢT CỦA BẠN':`LƯỢT ${players.indexOf(current)+1}`;if(instruction)instruction.textContent=current.id===state.selfId?'Chọn một người và đặt câu hỏi.':'Chờ người đang có lượt.'}
  }
  function renderFix(){if(state.phase==='game'||state.phase==='discussion'){renderRoleFix();renderTurnFix()}}
  socket.on('role',()=>setTimeout(renderRoleFix,0));
  socket.on('room_state',()=>setTimeout(renderFix,0));
  setInterval(()=>{if(state.phase==='game'||state.phase==='discussion'){renderRoleFix();renderTurnFix()}},250);
  setTimeout(renderFix,0);
})();