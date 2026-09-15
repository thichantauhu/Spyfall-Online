const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname)));
app.get('/health', (_, res) => res.json({ ok: true }));

const locations = ['Bãi biển','Bệnh viện','Sân bay','Nhà hàng','Trường học','Rạp chiếu phim','Khách sạn','Ngân hàng','Siêu thị','Đồn cảnh sát','Sở thú','Công viên','Nhà ga','Tàu ngầm','Du thuyền','Nhà máy','Văn phòng','Sân vận động','Bảo tàng','Thư viện'];
const rooms = new Map();
const makeCode = () => { let c; do c = Math.random().toString(36).slice(2,8).toUpperCase(); while(rooms.has(c)); return c; };
const publicState = room => ({ room:room.code, players:room.players.map(p=>({id:p.id,name:p.name})), hostId:room.hostId, phase:room.phase, round:room.round, turnIndex:room.turnIndex, timer:Math.max(0, Math.ceil((room.endsAt-Date.now())/1000)), qa:room.qa, scores:Object.fromEntries(room.players.map(p=>[p.id,p.score])) });
const emitRoom = room => io.to(room.code).emit('room_state', publicState(room));
function endRound(room, title, detail, winner){
  if(room.phase !== 'game') return;
  room.phase='result'; if(room.timerId) clearTimeout(room.timerId);
  if(winner) room.players.find(p=>p.id===winner)?.score++;
  io.to(room.code).emit('round_result',{title,detail,location:room.location,spyId:room.spyId,scores:Object.fromEntries(room.players.map(p=>[p.id,p.score]))});
  emitRoom(room);
}
function startRound(room){
  room.phase='game'; room.round++; room.location=locations[Math.floor(Math.random()*locations.length)]; room.spyId=room.players[Math.floor(Math.random()*room.players.length)].id; room.turnIndex=0; room.qa=[]; room.pending=null; room.endsAt=Date.now()+600000;
  if(room.timerId) clearTimeout(room.timerId); room.timerId=setTimeout(()=>endRound(room,'⏰ Hết thời gian','Đã hết 10 phút. Spy được công bố.',room.spyId),600000);
  for(const p of room.players) io.to(p.id).emit('role',{spy:p.id===room.spyId,location:p.id===room.spyId?null:room.location});
  emitRoom(room);
}

io.on('connection', socket => {
  socket.on('create_room', ({name})=>{
    const code=makeCode(); const p={id:socket.id,name:String(name||'Người chơi').trim().slice(0,20)||'Người chơi',score:0};
    const room={code,hostId:p.id,players:[p],phase:'lobby',round:0,turnIndex:0,qa:[],pending:null}; rooms.set(code,room); socket.join(code); socket.roomCode=code; socket.emit('joined',{room:code,selfId:p.id}); emitRoom(room);
  });
  socket.on('join_room', ({code,name})=>{
    const room=rooms.get(String(code||'').toUpperCase()); if(!room) return socket.emit('error_msg','Không tìm thấy phòng.');
    if(room.phase!=='lobby') return socket.emit('error_msg','Ván đã bắt đầu.'); if(room.players.length>=12) return socket.emit('error_msg','Phòng đã đủ 12 người.');
    const p={id:socket.id,name:String(name||'Người chơi').trim().slice(0,20)||'Người chơi',score:0}; room.players.push(p); socket.join(room.code); socket.roomCode=room.code; socket.emit('joined',{room:room.code,selfId:p.id}); emitRoom(room);
  });
  socket.on('start_game',()=>{ const room=rooms.get(socket.roomCode); if(!room||room.hostId!==socket.id||room.players.length<3) return; startRound(room); });
  socket.on('send_question',({targetId,question})=>{
    const room=rooms.get(socket.roomCode); if(!room||room.phase!=='game'||room.players[room.turnIndex]?.id!==socket.id||room.pending) return;
    const target=room.players.find(p=>p.id===targetId); if(!target||target.id===socket.id) return;
    const q=String(question||'').trim().slice(0,180); if(!q) return;
    room.pending={fromId:socket.id,toId:target.id,q}; io.to(target.id).emit('question_received',{fromId:socket.id,fromName:room.players.find(p=>p.id===socket.id).name,q}); emitRoom(room);
  });
  socket.on('answer_question',({answer})=>{
    const room=rooms.get(socket.roomCode); if(!room||room.phase!=='game'||!room.pending||room.pending.toId!==socket.id) return;
    const from=room.players.find(p=>p.id===room.pending.fromId), to=room.players.find(p=>p.id===socket.id); const a=String(answer||'').trim().slice(0,180); if(!a) return;
    room.qa.push({from:from.name,to:to.name,q:room.pending.q,a}); room.pending=null; room.turnIndex=(room.turnIndex+1)%room.players.length; emitRoom(room);
  });
  socket.on('accuse',({targetId})=>{ const room=rooms.get(socket.roomCode); if(!room||room.phase!=='game') return; const target=room.players.find(p=>p.id===targetId); if(!target) return; if(target.id===room.spyId) endRound(room,'👥 Người thường thắng!',`${target.name} chính là Spy.`,socket.id); else endRound(room,'🕵️ Spy thắng!',`${target.name} không phải Spy.`,room.spyId); });
  socket.on('spy_guess',({guess})=>{ const room=rooms.get(socket.roomCode); if(!room||room.phase!=='game'||socket.id!==room.spyId) return; const g=String(guess||'').trim(); if(g.toLowerCase()===room.location.toLowerCase()) endRound(room,'🕵️ Spy thắng!',`Spy đoán đúng: ${room.location}.`,room.spyId); else endRound(room,'👥 Người thường thắng!',`Spy đoán sai. Địa điểm là ${room.location}.`,null); });
  socket.on('next_round',()=>{ const room=rooms.get(socket.roomCode); if(!room||room.hostId!==socket.id||room.phase!=='result') return; startRound(room); });
  socket.on('disconnect',()=>{ const code=socket.roomCode, room=rooms.get(code); if(!room) return; room.players=room.players.filter(p=>p.id!==socket.id); if(!room.players.length){rooms.delete(code);return;} if(room.hostId===socket.id) room.hostId=room.players[0].id; if(room.phase==='game'&&room.spyId===socket.id) endRound(room,'👥 Người thường thắng!','Spy đã rời phòng.',null); emitRoom(room); });
});

const PORT=process.env.PORT||10000; server.listen(PORT,'0.0.0.0',()=>console.log(`Spyfall listening on ${PORT}`));
