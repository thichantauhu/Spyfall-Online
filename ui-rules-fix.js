(()=>{
function updateVoteBox(){
 const side=document.querySelector('.side-actions');
 if(!side)return;
 const box=side.querySelector('.vote-card');
 if(!box)return;
 if(state.phase==='vote1'){
  const list=state.players.filter(function(p){return p.id!==state.selfId;});
  const counts={};Object.values(state.votes||{}).forEach(function(id){counts[id]=(counts[id]||0)+1;});
  box.innerHTML='<div class="eyebrow">TỐ CÁO CHUNG · LƯỢT 1</div><h3>Mọi người cùng bỏ phiếu</h3><p class="muted small">Tất cả người chơi đều được vote, kể cả Spy. Người hoặc nhiều người cùng có số phiếu cao nhất sẽ có 2 phút biện minh.</p><div class="vote-list">'+list.map(function(p){return '<button type="button" class="vote-btn '+(state.votes?.[state.selfId]===p.id?'voted':'')+'" data-v1="'+p.id+'">'+esc(p.name)+'<span>'+(counts[p.id]||'')+'</span></button>';}).join('')+'</div>';
  box.querySelectorAll('[data-v1]').forEach(function(b){b.onclick=function(){socket.emit('accuse_vote',{targetId:b.dataset.v1});};b.ondblclick=function(e){e.preventDefault();if(state.votes?.[state.selfId]===b.dataset.v1)socket.emit('accuse_vote',{targetId:null});};});
 }
 if(state.phase==='vote2'){
  const can=(state.voteEligible||[]).includes(state.selfId);
  const list=state.players.filter(function(p){return p.id!==state.selfId;});
  const counts={};Object.values(state.vote2||{}).forEach(function(id){counts[id]=(counts[id]||0)+1;});
  box.innerHTML='<div class="eyebrow">TỐ CÁO CHUNG · VOTE PHỤ</div><h3>'+(can?'Bỏ phiếu lần 2':'Bạn không được vote')+'</h3><p class="muted small">'+(can?'Người tình nghi ở lượt 1 không được vote phụ. Nếu bạn không thuộc nhóm tình nghi — kể cả Spy — bạn vẫn được tham gia Vote phụ. Ai có nhiều phiếu nhất sẽ bị tố cáo.':'Bạn thuộc nhóm có số phiếu cao nhất ở lượt 1 nên không được vote phụ.')+'</p>'+(can?'<div class="vote-list">'+list.map(function(p){return '<button type="button" class="vote-btn '+(state.vote2?.[state.selfId]===p.id?'voted':'')+'" data-v2="'+p.id+'">'+esc(p.name)+'<span>'+(counts[p.id]||'')+'</span></button>';}).join('')+'</div>':'');
  if(can)box.querySelectorAll('[data-v2]').forEach(function(b){b.onclick=function(){socket.emit('accuse_vote2',{targetId:b.dataset.v2});};b.ondblclick=function(e){e.preventDefault();if(state.vote2?.[state.selfId]===b.dataset.v2)socket.emit('accuse_vote2',{targetId:null});};});
 }
 if(state.phase==='defense'){var t=Math.max(0,Math.ceil((state.defenseEndsAt-Date.now())/1000));var n=(state.voteCandidates||[]).map(function(id){var p=state.players.find(function(x){return x.id===id;});return p?p.name:'';}).filter(Boolean).join(', ');box.innerHTML='<div class="eyebrow">BIỆN MINH</div><h3>'+esc(n)+'</h3><div class="defense-time">Còn '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0')+'</div><p class="muted small">Các người chơi có cùng số phiếu cao nhất đang biện minh. Hết 2 phút sẽ chuyển sang Vote phụ.</p>';}
}
function showSpies(r){
 var result=document.getElementById('resultScores');if(!result)return;
 var old=document.getElementById('revealedSpies');if(old)old.remove();
 var box=document.createElement('div');box.id='revealedSpies';box.className='round-winner-box';
 var names=(r.spyIds||[]).map(function(id){var p=state.players.find(function(x){return x.id===id;});return p?p.name:'';}).filter(Boolean).join(', ');
 box.innerHTML='<div class="winner-title">🕵️ SPY</div><div class="winner-names">'+esc(names||'Không xác định')+'</div>';
 result.after(box);
}
function refresh(){updateVoteBox();if(state.phase==='defense')setTimeout(refresh,1000)}
socket.on('room_state',function(){setTimeout(refresh,20);});socket.on('round_result',function(r){setTimeout(function(){showSpies(r);refresh();},30);});setTimeout(refresh,100);
})();