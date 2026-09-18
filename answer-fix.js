(()=>{
  const $=id=>document.getElementById(id);
  function renderAnswerBox(){
    const box=$('answerBox'), q=$('incomingQuestion'), input=$('answerInput'), btn=$('sendAnswerBtn');
    if(!box)return;
    const pending=state.pending;
    const mine=!!pending && pending.toId===state.selfId && state.phase==='game' && !state.paused;
    box.hidden=!mine;
    if(!mine)return;
    if(q)q.textContent=pending.q||'';
    if(input){
      input.disabled=false;
      input.placeholder='Nhập câu trả lời...';
    }
    if(btn){
      btn.disabled=false;
      btn.onclick=()=>{
        const answer=input?.value.trim();
        if(!answer)return;
        socket.emit('answer_question',{answer});
        if(input){input.value='';input.disabled=true}
        btn.disabled=true;
      };
    }
  }
  socket.on('question_received',()=>setTimeout(renderAnswerBox,0));
  socket.on('room_state',()=>setTimeout(renderAnswerBox,0));
  socket.on('round_result',()=>setTimeout(renderAnswerBox,0));
  setInterval(renderAnswerBox,250);
  setTimeout(renderAnswerBox,0);
})();
