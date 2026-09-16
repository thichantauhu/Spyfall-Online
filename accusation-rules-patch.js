const fs=require('fs');
const path=require('path');
const {Server}=require('socket.io');

// Capture the server's room Map without changing server-v2.js.
const OriginalMap=Map;
const capturedMaps=[];
global.Map=class extends OriginalMap{constructor(...args){super(...args);capturedMaps.push(this)}};

const originalServerOn=Server.prototype.on;
Server.prototype.on=function(event,listener){
  if(event==='connection'){
    return originalServerOn.call(this,event,(socket)=>{
      listener(socket);
      patchSocket(socket);
    });
  }
  return originalServerOn.call(this,event,listener);
};

const normalize=s=>String(s||'').trim().toLowerCase();
const assetDir=path.join(__dirname,'assets');
const assetFiles=fs.existsSync(assetDir)?fs.readdirSync(assetDir).filter(x=>/\.webp$/i.test(x)):[];
const displayFromFile=file=>file.replace(/\.webp$/i,'').replace(/_/g,' ');
const locationFiles=Object.fromEntries(assetFiles.map(f=>[displayFromFile(f),f]));

function getRoom(socket){
  for(const m of capturedMaps){
    const r=m.get(socket.roomCode);
    if(r&&Array.isArray(r.players)&&r.code===socket.roomCode)return r;
  }
  return null;
}
function spies(r){return r.players.filter(p=>r.spyIds.includes(p.id))}
function normals(r){return r.players.filter(p=>!r.spyIds.includes(p.id))}
function addChat(r,message){
  r.chat=r.chat||[];
  r.chat.push({from:'',message,time:Date.now(),system:true});
  if(r.chat.length>100)r.chat.shift();
}
function publicState(r){
  const timer=r.paused?Math.max(0,Math.ceil((r.remainingMs||0)/1000)):Math.max(0,Math.ceil(((r.endsAt||Date.now())-Date.now())/1000));
  return {room:r.code,players:r.players.map(p=>({id:p.id,name:p.name,score:p.score})),hostId:r.hostId,phase:r.phase,round:r.round,turnIndex:r.turnIndex,timer,paused:!!r.paused,qa:r.qa||[],scores:Object.fromEntries(r.players.map(p=>[p.id,p.score])),locations:r.locations||[],locationFiles:(r.locations||[]).map(x=>locationFiles[x]||`${x.replace(/ /g,'_')}.webp`),askedIds:[...(r.askedIds||[])],lastQuestionerId:r.lastQuestionerId,chat:r.chat||[],votes:r.phase==='discussion'?Object.fromEntries(r.votes||[]):{},pending:r.pending?{fromId:r.pending.fromId,toId:r.pending.toId,q:r.pending.q}:null,spyCount:r.spyCount,matchOver:!!r.matchOver,matchWinners:r.matchWinners||[],extraRound:!!r.extraRound,turnPreview:r.turnPreview?{fromId:r.turnPreview.fromId,toId:r.turnPreview.toId}:null,accusationGroupActive:!!r.groupAccusation?.active,accusationGroupVotes:Object.fromEntries(r.groupAccusation?.votes||[])};
}
function emitState(r){
  const ioRoom=r.code;
  const sockets=[];
  for(const s of require('socket.io').Server?.prototype?.sockets?.sockets?.values?.()||[])sockets.push(s);
  // Prefer the room's own socket broadcast path; every connected player receives state below.
  for(const p of r.players){
    for(const m of capturedMaps){
      if(m.get(r.code)===r)break;
    }
  }
  return ioRoom;
}
function broadcast(socket,r,event,payload){
  socket.emit(event,payload);
  socket.to(r.code).emit(event,payload);
}
function finishPatched(socket,r,{title,detail,winnerType,winnerNames=[],deltas={}}){
  if(r.phase==='result')return;
  r.phase='result';r.paused=false;r.remainingMs=0;
  if(r.timerId)clearTimeout(r.timerId);
  if(r.noticeTimer)clearTimeout(r.noticeTimer);
  const winners=r.players.filter(p=>p.score>=5);
  if(winners.length&&!r.matchOver){r.matchOver=true;r.matchWinners=winners.map(p=>p.id);detail+=` ${winners.map(p=>p.name).join(', ')} đã đạt 5 điểm và thắng toàn bộ game!`}
  r.groupAccusation={active:false,votes:new OriginalMap()};
  const scores=Object.fromEntries(r.players.map(p=>[p.id,p.score]));
  const roundDeltas=Object.fromEntries(r.players.map(p=>[p.id,deltas[p.id]||0]));
  const result={title,detail,location:r.location,spyIds:r.spyIds,scores,winnerType,winnerNames,roundDeltas,matchOver:!!r.matchOver,matchWinners:r.matchWinners||[],extraRound:!!r.extraRound};
  broadcast(socket,r,'round_result',result);
  broadcast(socket,r,'room_state',publicState(r));
}
function directAdd(r,id,points,deltas){
  const p=r.players.find(x=>x.id===id);if(!p)return;
  p.score+=points;deltas[id]=(deltas[id]||0)+points;
}
function soloAccuse(socket,r,targetId){
  if(!r||!['game','discussion'].includes(r.phase)||r.paused)return;
  const voter=r.players.find(p=>p.id===(socket.playerId||socket.id));
  const target=r.players.find(p=>p.id===targetId);
  if(!voter||!target||target.id===voter.id)return;
  const d={};
  addChat(r,`🚨 ${voter.name} tố cáo cá nhân ${target.name} là Gián điệp!`);
  if(r.spyIds.includes(target.id)){
    directAdd(r,voter.id,2,d);
    finishPatched(socket,r,{title:'👥 Người thường thắng!',detail:`${voter.name} tố cáo chính xác Gián điệp ${target.name}.`,winnerType:'nonspy',winnerNames:[voter.name],deltas:d});
  }else{
    directAdd(r,voter.id,-1,d);
    spies(r).forEach(p=>directAdd(r,p.id,4,d));
    finishPatched(socket,r,{title:'🕵️ Spy thắng!',detail:`${voter.name} tố cáo nhầm ${target.name}. ${spies(r).map(p=>p.name).join(', ')} được 4 điểm.`,winnerType:'spy',winnerNames:spies(r).map(p=>p.name),deltas:d});
  }
}
function startGroup(socket,r){
  if(!r||!['game','discussion'].includes(r.phase)||r.paused||r.phase==='result')return;
  if(!r.groupAccusation||!r.groupAccusation.active)r.groupAccusation={active:true,votes:new OriginalMap(),startedBy:socket.playerId||socket.id};
  addChat(r,`🗳️ ${r.players.find(p=>p.id===(socket.playerId||socket.id))?.name||'Người chơi'} bắt đầu TỐ CÁO CHUNG. Tất cả người chơi phải bỏ 1 phiếu.`);
  broadcast(socket,r,'accusation_group_start',{startedBy:socket.playerId||socket.id});
  broadcast(socket,r,'room_state',publicState(r));
}
function groupVote(socket,r,targetId){
  if(!r||!['game','discussion'].includes(r.phase)||r.paused)return;
  if(!r.groupAccusation?.active)startGroup(socket,r);
  const voterId=socket.playerId||socket.id;
  const voter=r.players.find(p=>p.id===voterId),target=r.players.find(p=>p.id===targetId);
  if(!voter||!target||target.id===voter.id)return;
  r.groupAccusation.votes.set(voterId,targetId);
  const votes=Object.fromEntries(r.groupAccusation.votes);
  broadcast(socket,r,'accusation_group_state',{active:true,votes});
  broadcast(socket,r,'room_state',publicState(r));
  if(r.groupAccusation.votes.size===r.players.length)resolveGroup(socket,r);
}
function resolveGroup(socket,r){
  const counts={};
  for(const targetId of r.groupAccusation.votes.values())counts[targetId]=(counts[targetId]||0)+1;
  let max=0,chosen=null;
  for(const p of r.players){const n=counts[p.id]||0;if(n>max){max=n;chosen=p.id}}
  const target=r.players.find(p=>p.id===chosen);if(!target)return;
  const d={};
  if(r.spyIds.includes(target.id)){
    normals(r).forEach(p=>directAdd(r,p.id,1,d));
    finishPatched(socket,r,{title:'👥 Người thường thắng!',detail:`Tố cáo chung: ${target.name} nhận nhiều phiếu nhất và đúng là Gián điệp. Mỗi người thường nhận 1 điểm.`,winnerType:'nonspy',winnerNames:normals(r).map(p=>p.name),deltas:d});
  }else{
    spies(r).forEach(p=>directAdd(r,p.id,4,d));
    finishPatched(socket,r,{title:'🕵️ Spy thắng!',detail:`Tố cáo chung: ${target.name} nhận nhiều phiếu nhất nhưng không phải Gián điệp.`,winnerType:'spy',winnerNames:spies(r).map(p=>p.name),deltas:d});
  }
}
function spyGuessPatched(socket,r,guess){
  if(!r||!['game','discussion'].includes(r.phase)||r.paused||!r.spyIds.includes(socket.playerId||socket.id))return;
  const spy=r.players.find(p=>p.id===(socket.playerId||socket.id));
  const actual=(r.locations||[]).find(x=>normalize(x)===normalize(guess));
  if(!spy||!actual)return;
  addChat(r,`🎯 ${spy.name} đã đoán địa điểm: ${actual}`);
  if(normalize(actual)===normalize(r.location)){
    const d={};directAdd(r,spy.id,4,d);
    finishPatched(socket,r,{title:'🕵️ Spy thắng!',detail:`${spy.name} đoán đúng địa điểm: ${r.location}.`,winnerType:'spy',winnerNames:[spy.name],deltas:d});
  }else{
    const d={};normals(r).forEach(p=>directAdd(r,p.id,1,d));
    finishPatched(socket,r,{title:'👥 Người thường thắng!',detail:`${spy.name} đoán sai. Địa điểm là ${r.location}.`,winnerType:'nonspy',winnerNames:normals(r).map(p=>p.name),deltas:d});
  }
}
function patchSocket(socket){
  socket.removeAllListeners('accuse');
  socket.removeAllListeners('accuse_vote');
  socket.removeAllListeners('spy_guess_location');
  socket.on('accuse',({targetId})=>soloAccuse(socket,getRoom(socket),targetId));
  socket.on('start_group_accusation',()=>startGroup(socket,getRoom(socket)));
  socket.on('group_accuse_vote',({targetId})=>groupVote(socket,getRoom(socket),targetId));
  socket.on('spy_guess_location',({location})=>spyGuessPatched(socket,getRoom(socket),location));
}
