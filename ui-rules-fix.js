(()=>{
function patch(){
 const log=document.getElementById('qaLog');
 if(log&&state.qa){log.innerHTML=state.qa.length?state.qa.map((x,i)=>`<details class="qa-item"><summary>Lượt ${i+1} · <strong>${esc(x.from)}</strong> → <strong>${esc(x.to)}</strong></summary><div class="qa-detail"><div><strong>Hỏi:</strong> ${esc(x.q)}</div><div class="answer-line"><strong>Trả lời:</strong> ${esc(x.a)}</div></div></details>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';}
 const btn=document.getElementById('accuseBtn'),chooser=document.getElementById('accuseChooser');
 if(state.role?.spy){if(btn)btn.remove();if(chooser)chooser.remove();}
 const role=document.getElementById('roleCard');if(role&&state.roleVisible===false)role.classList.add('hard-hidden');
 const side=document.querySelector('.side-actions');
 if(side&&['game','discussion'].includes(state.phase)){
   let card=document.getElementById('commonVoteCard');
   if(!card){card=document.createElement('div');card.id='commonVoteCard';card.className='vote-card common-vote-card';side.appendChild(card)}
   const others=state.players.filter(p=>p.id!==state.selfId);const counts={};Object.values(state.votes||{}).forEach(id=>counts[id]=(counts[id]||0)+1);
   card.innerHTML=`<div class="eyebrow">TỐ CÁO CHUNG</div><h3>Bấm tên để bỏ phiếu</h3><p class="muted small">Đạt ít nhất 1/2 số người chơi sẽ tố cáo ngay. Nhấn đúp tên đã chọn để huỷ phiếu.</p><div class="vote-list">${others.map(p=>`<button type="button" class="vote-btn ${state.votes?.[state.selfId]===p.id?'voted':''}" data-common-vote="${p.id}">${esc(p.name)}<span>${counts[p.id]||''}</span></button>`).join('')}</div>`;
   card.querySelectorAll('[data-common-vote]').forEach(b=>{b.onclick=()=>socket.emit('accuse_vote',{targetId:b.dataset.commonVote});b.ondblclick=e=>{e.preventDefault();if(state.votes?.[state.selfId]===b.dataset.commonVote)socket.emit('accuse_vote',{targetId:null});};});
 }
}
if(typeof socket!=='undefined'){socket.on('room_state',()=>setTimeout(patch,0));socket.on('role',()=>setTimeout(patch,0));socket.on('round_result',()=>setTimeout(patch,0));}
})();