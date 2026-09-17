(()=>{
  let groupActive=false;
  let groupVotes={};
  const $=id=>document.getElementById(id);
  const esc2=s=>String(s??'').replace(/[&<>\'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const orig=window.renderSide;
  window.renderSide=function(){
    orig();
    const card=document.querySelector('.action-card-v4');
    if(!card)return;
    const active=['game','discussion'].includes(state.phase)&&!state.paused;
    card.parentNode.querySelectorAll('.vote-card').forEach(x=>{if(x.id!=='groupAccusePanel')x.remove()});
    const old=$('groupAccuseBtn');if(old)old.remove();
    const oldPanel=$('groupAccusePanel');if(oldPanel)oldPanel.remove();
    const solo=$('accuseBtn');
    if(solo){solo.textContent='🚨 Tố cáo cá nhân';solo.disabled=!active||groupActive;}
    const btn=document.createElement('button');
    btn.id='groupAccuseBtn';btn.className='danger';btn.textContent=groupActive?'🗳️ Đang tố cáo chung':'🗳️ Tố cáo chung';btn.disabled=!active||groupActive;
    const guess=card.querySelector('#guessBtn');
    if(guess)guess.parentNode.insertBefore(btn,guess);else card.appendChild(btn);
    btn.onclick=()=>{groupActive=true;socket.emit('start_group_accusation');window.renderSide()};
    if(groupActive){
      const panel=document.createElement('div');panel.id='groupAccusePanel';panel.className='vote-card';
      const mine=groupVotes[state.selfId];
      panel.innerHTML=`<div class="eyebrow">TỐ CÁO CHUNG</div><h3>Tất cả người chơi phải bỏ 1 phiếu</h3><p class="muted small">Đã bỏ phiếu: ${Object.keys(groupVotes).length}/${state.players.length}</p><div class="vote-list">${state.players.map(p=>`<button type="button" class="vote-btn ${mine===p.id?'voted':''}" data-group-target="${p.id}" ${mine?'disabled':''}>${esc2(p.name)}${p.id===state.selfId?' (Bạn)':''}<span>${Object.values(groupVotes).filter(x=>x===p.id).length||''}</span></button>`).join('')}</div>`;
      card.parentNode.insertBefore(panel,card.nextSibling);
      panel.querySelectorAll('[data-group-target]').forEach(b=>b.onclick=()=>socket.emit('group_accuse_vote',{targetId:b.dataset.groupTarget}));
    }
  };
  socket.on('accusation_group_start',()=>{groupActive=true;groupVotes={};window.renderSide()});
  socket.on('accusation_group_state',x=>{groupActive=!!x.active;groupVotes=x.votes||{};window.renderSide()});
  socket.on('room_state',x=>{if(x.accusationGroupActive!==undefined){groupActive=!!x.accusationGroupActive;groupVotes=x.accusationGroupVotes||{};}});
  socket.on('round_result',()=>{groupActive=false;groupVotes={};});
})();
