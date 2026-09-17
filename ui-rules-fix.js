(()=>{
function patch(){
 const log=document.getElementById('qaLog');
 if(log&&state.qa){log.innerHTML=state.qa.length?state.qa.map((x,i)=>`<details class="qa-item"><summary>Lượt ${i+1} · <strong>${esc(x.from)}</strong> → <strong>${esc(x.to)}</strong></summary><div class="qa-detail"><div><strong>Hỏi:</strong> ${esc(x.q)}</div><div class="answer-line"><strong>Trả lời:</strong> ${esc(x.a)}</div></div></details>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';}
 const btn=document.getElementById('accuseBtn'),chooser=document.getElementById('accuseChooser');
 if(state.role?.spy){if(btn)btn.remove();if(chooser)chooser.remove();}
 const role=document.getElementById('roleCard'); if(role&&state.roleVisible===false)role.classList.add('hard-hidden');
}
if(typeof socket!=='undefined'){socket.on('room_state',()=>setTimeout(patch,0));socket.on('role',()=>setTimeout(patch,0));socket.on('round_result',()=>setTimeout(patch,0));}
new MutationObserver(()=>{if(state?.phase)patch()}).observe(document.body,{childList:true,subtree:true});
})();