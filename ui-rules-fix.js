(()=>{
const originalEmit=socket.emit.bind(socket);socket.emit=(event,data={})=>{if(event==='create_room')data={...data,winScore:Number(document.getElementById('winScoreSelect')?.value||5)};return originalEmit(event,data)};
function patch(){
 const host=state.selfId===state.hostId&&state.phase==='lobby';
 const sc=document.getElementById('spyCountSelect');if(sc){sc.value=String(state.spyCount||1);sc.disabled=!host;const note=document.getElementById('spySettingNote');if(note)note.textContent=host?'Host chọn 1 hoặc 2 Gián điệp. Hệ thống sẽ chọn ngẫu nhiên mỗi vòng.':`Mốc hiện tại: ${state.spyCount||1} Gián điệp. Chỉ Host được thay đổi.`;sc.onchange=()=>{if(host)socket.emit('set_spy_count',{spyCount:Number(sc.value)})}}
 const ws=document.getElementById('winScoreSelect');if(ws){ws.value=String(state.winScore||ws.value||5);ws.disabled=!host;const note=document.getElementById('winScoreNote');if(note)note.textContent=host?'Chỉ Host được thay đổi. Chọn mốc thắng: 5, 7 hoặc 10 điểm.':`Mục tiêu thắng: ${state.winScore||5} điểm. Chỉ Host được thay đổi.`;ws.onchange=()=>{if(host)socket.emit('set_win_score',{winScore:Number(ws.value)})}}
 const log=document.getElementById('qaLog');
 if(log&&state.qa){log.innerHTML=state.qa.length?state.qa.map((x,i)=>`<details class="qa-item"><summary>Lượt ${i+1} · <strong>${esc(x.from)}</strong> → <strong>${esc(x.to)}</strong></summary><div class="qa-detail"><div><strong>Hỏi:</strong> ${esc(x.q)}</div><div class="answer-line"><strong>Trả lời:</strong> ${esc(x.a)}</div></div></details>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';}
 const btn=document.getElementById('accuseBtn'),chooser=document.getElementById('accuseChooser');if(state.role?.spy){if(btn)btn.remove();if(chooser)chooser.remove();}
 const role=document.getElementById('roleCard');if(role){role.classList.toggle('hard-hidden',state.roleVisible===false);role.onclick=e=>{if(e.target.closest('button'))return;state.roleVisible=!state.roleVisible;role.classList.toggle('role-hidden',!state.roleVisible);role.classList.toggle('hard-hidden',!state.roleVisible)}}
 const side=document.querySelector('.side-actions');
 if(side&&['game','discussion'].includes(state.phase)){
  let card=document.getElementById('commonVoteCard');if(!card){card=document.createElement('div');card.id='commonVoteCard';card.className='vote-card common-vote-card';side.appendChild(card)}
  const others=state.players.filter(p=>p.id!==state.selfId);const counts={};Object.values(state.votes||{}).forEach(id=>counts[id]=(counts[id]||0)+1);
  card.innerHTML=`<div class="eyebrow">TỐ CÁO CHUNG</div><h3>Bấm tên để bỏ phiếu</h3><p class="muted small">Đạt ít nhất 1/2 số người chơi sẽ tố cáo ngay. Nhấn đúp tên đã chọn để huỷ phiếu.</p><div class="vote-list">${others.map(p=>`<button type="button" class="vote-btn ${state.votes?.[state.selfId]===p.id?'voted':''}" data-common-vote="${p.id}">${esc(p.name)}<span>${counts[p.id]||''}</span></button>`).join('')}</div>`;
  card.querySelectorAll('[data-common-vote]').forEach(b=>{b.onclick=()=>socket.emit('accuse_vote',{targetId:b.dataset.commonVote});b.ondblclick=e=>{e.preventDefault();if(state.votes?.[state.selfId]===b.dataset.commonVote)socket.emit('accuse_vote',{targetId:null});};});
 }
}
socket.on('room_state',r=>{if(r.winScore)state.winScore=r.winScore;if(r.spyCount)state.spyCount=r.spyCount;setTimeout(patch,0)});socket.on('role',()=>setTimeout(patch,0));socket.on('round_result',()=>setTimeout(patch,0));setTimeout(patch,0);
})();