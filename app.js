const socket=io();
const state={screen:'lobby',room:null,selfId:null,players:[],hostId:null,phase:'lobby',round:0,turnIndex:0,timer:0,timerId:null,roleVisible:true,role:null,location:null,qa:[],scores:{},pendingAnswer:false,locations:[],askedIds:[],lastQuestionerId:null};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SPRITE_URL='https://benjaminsboardgameblog.files.wordpress.com/2018/12/img_1151-1.jpg';
const LOCATION_META={
  'Corporate Party':{vi:'Tiệc công ty',x:'3.2%',y:'9.2%'},
  'Crusader Army':{vi:'Quân Thập tự',x:'28%',y:'9.6%'},
  'Day Spa':{vi:'Spa',x:'53.2%',y:'8.8%'},
  'Embassy':{vi:'Đại sứ quán',x:'78.2%',y:'7.7%'},
  'Hospital':{vi:'Bệnh viện',x:'100%',y:'8.1%'},
  'Military Base':{vi:'Căn cứ quân sự',x:'3%',y:'43.1%'},
  'Movie Studio':{vi:'Hãng phim',x:'27.6%',y:'41.2%'},
  'Nightclub':{vi:'Hộp đêm',x:'53%',y:'40.4%'},
  'Ocean Liner':{vi:'Tàu du lịch',x:'78.6%',y:'40.4%'},
  'Passenger Train':{vi:'Tàu hỏa',x:'100%',y:'40%'},
  'Polar Station':{vi:'Trạm Bắc Cực',x:'1.2%',y:'73.5%'},
  'Police Station':{vi:'Đồn cảnh sát',x:'27.2%',y:'70.8%'},
  'Restaurant':{vi:'Nhà hàng',x:'52.2%',y:'70%'},
  'School':{vi:'Trường học',x:'79%',y:'70%'},
  'Service Station':{vi:'Trạm xăng',x:'100%',y:'69.6%'},
  'Submarine':{vi:'Tàu ngầm',x:'0%',y:'100%'},
  'Supermarket':{vi:'Siêu thị',x:'26%',y:'100%'},
  'Theater':{vi:'Nhà hát',x:'52.4%',y:'99.2%'},
  'University':{vi:'Đại học',x:'78.8%',y:'98.8%'},
  'Zoo':{vi:'Sở thú',x:'100%',y:'97.7%'}
};
const viLocation=loc=>LOCATION_META[loc]?.vi||loc;
function showScreen(n){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(n+'Screen').classList.add('active');state.screen=n;}
function setMsg(m){$('lobbyMessage').textContent=m||'';}
function renderLobby(){
  $('roomCodeLabel').textContent=state.room||'------';
  $('playerCount').textContent=state.players.length;
  $('hostLabel').textContent=state.selfId===state.hostId?'HOST':'NGƯỜI CHƠI';
  $('startBtn').disabled=state.selfId!==state.hostId||state.players.length<3||state.phase!=='lobby';
  $('roomMessage').textContent=state.players.length<3?'Tối thiểu 3 người để bắt đầu.':state.selfId===state.hostId?'Đã đủ người. Có thể bắt đầu.':'Chờ Host bắt đầu.';
  $('playerList').innerHTML=state.players.map(p=>`<div class="player"><div class="player-name"><span class="dot"></span>${esc(p.name)}</div>${p.id===state.hostId?'<span class="pill">HOST</span>':''}</div>`).join('');
}
function renderTimer(){const m=Math.floor(state.timer/60).toString().padStart(2,'0'),s=(state.timer%60).toString().padStart(2,'0');$('timer').textContent=`${m}:${s}`;}
function renderLocations(){
  $('locationGrid').innerHTML=state.locations.map(loc=>{
    const meta=LOCATION_META[loc]||{vi:loc,x:'50%',y:'50%'};
    return `<div class="location-card"><div class="location-art" style="background-image:url('${SPRITE_URL}');background-position:${meta.x} ${meta.y};"></div><div class="location-name">${esc(meta.vi)}</div></div>`;
  }).join('');
}
function renderGame(){
  showScreen('game');
  $('roundLabel').textContent=state.round;
  $('gameRoomCode').textContent=state.room;
  renderTimer();
  renderLocations();
  const myTurn=state.players[state.turnIndex]?.id===state.selfId;
  const current=state.players[state.turnIndex];
  $('roleTitle').textContent=state.role?.spy?'🕵️ BẠN LÀ GIÁN ĐIỆP':'👥 BẠN KHÔNG PHẢI GIÁN ĐIỆP';
  $('roleInfo').textContent=state.role?.spy?'Bạn không biết địa điểm. Hãy suy luận!':`Địa điểm: ${viLocation(state.role?.location)}`;
  $('hideRoleBtn').textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';
  $('turnLabel').textContent=myTurn?'LƯỢT CỦA BẠN':`LƯỢT: ${current?.name||''}`;
  $('turnInstruction').textContent=myTurn?'Chọn một người và đặt câu hỏi. Mỗi người chỉ được hỏi 1 lần trong vòng.':state.pendingAnswer?'Trả lời câu hỏi bên dưới.':'Chờ người đang có lượt.';
  const sel=$('targetSelect');
  const candidates=state.players.filter(p=>p.id!==state.selfId&&!state.askedIds.includes(p.id)&&p.id!==state.lastQuestionerId);
  sel.innerHTML=candidates.length?candidates.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join(''):'<option value="">Không còn người phù hợp</option>';
  sel.disabled=!myTurn||!candidates.length;
  $('questionInput').disabled=!myTurn||!candidates.length;
  $('sendQuestionBtn').disabled=!myTurn||!candidates.length;
  $('guessBtn').disabled=!state.role?.spy;
  renderQA();renderScores();
}
function renderQA(){$('qaLog').innerHTML=state.qa.length?state.qa.map((x,i)=>`<div class="qa-item"><div class="qa-meta">Lượt ${i+1} · <strong>${esc(x.from)}</strong> hỏi <strong>${esc(x.to)}</strong></div><div><strong>Hỏi:</strong> ${esc(x.q)}</div><div class="answer-line"><strong>Trả lời:</strong> ${esc(x.a)}</div></div>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';}
function renderScores(){$('scoreList').innerHTML=state.players.map(p=>`<div class="score-row"><span>${esc(p.name)}</span><strong>${state.scores[p.id]||0}</strong></div>`).join('');}
function sync(s){Object.assign(state,s);if(state.phase==='lobby'){showScreen('room');renderLobby();}else if(state.phase==='game')renderGame();}
$('createRoomBtn').onclick=()=>{const name=$('playerName').value.trim();if(!name)return setMsg('Nhập tên trước.');socket.emit('create_room',{name});};
$('joinRoomBtn').onclick=()=>{const name=$('playerName').value.trim(),code=$('roomCode').value.trim().toUpperCase();if(!name||!code)return setMsg('Nhập tên và mã phòng.');socket.emit('join_room',{name,code});};
$('startBtn').onclick=()=>socket.emit('start_game');
$('leaveBtn').onclick=()=>location.reload();
$('sendQuestionBtn').onclick=()=>{const targetId=$('targetSelect').value,q=$('questionInput').value.trim();if(!targetId||!q)return;socket.emit('send_question',{targetId,question:q});$('questionInput').value='';};
$('sendAnswerBtn').onclick=()=>{const a=$('answerInput').value.trim();if(!a)return;socket.emit('answer_question',{answer:a});$('answerInput').value='';$('answerBox').hidden=true;state.pendingAnswer=false;};
$('accuseBtn').onclick=()=>{if(state.phase!=='game')return;const others=state.players.filter(p=>p.id!==state.selfId);const n=prompt('Chọn số người để tố cáo:\n'+others.map((p,i)=>`${i+1}. ${p.name}`).join('\n'));const p=others[Number(n)-1];if(p)socket.emit('accuse',{targetId:p.id});};
$('guessBtn').onclick=()=>{if(!state.role?.spy)return;const g=prompt('Spy đoán địa điểm:');if(g)socket.emit('spy_guess',{guess:g});};
$('hideRoleBtn').onclick=()=>{state.roleVisible=!state.roleVisible;$('roleCard').classList.toggle('role-hidden',!state.roleVisible);$('hideRoleBtn').textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';};
$('nextRoundBtn').onclick=()=>socket.emit('next_round');
$('backLobbyBtn').onclick=()=>showScreen('room');
socket.on('connect',()=>setMsg('Đã kết nối máy chủ realtime.'));
socket.on('joined',x=>{state.room=x.room;state.selfId=x.selfId;showScreen('room');});
socket.on('error_msg',setMsg);
socket.on('room_state',s=>{Object.assign(state,{room:s.room,players:s.players,hostId:s.hostId,phase:s.phase,round:s.round,turnIndex:s.turnIndex,timer:s.timer,qa:s.qa,scores:s.scores,locations:s.locations||[],askedIds:s.askedIds||[],lastQuestionerId:s.lastQuestionerId||null});if(state.phase==='lobby'){renderLobby();showScreen('room');}else if(state.phase==='game'){renderGame();}else if(state.phase==='result'){showScreen('result');}});
socket.on('role',r=>{state.role=r;state.roleVisible=true;renderGame();});
socket.on('question_received',x=>{state.pendingAnswer=true;$('incomingQuestion').textContent=`${x.fromName} hỏi: ${x.q}`;$('answerBox').hidden=false;renderGame();});
socket.on('round_result',r=>{clearInterval(state.timerId);state.phase='result';$('resultTitle').textContent=r.title;$('resultDetail').textContent=r.detail;$('resultLocation').textContent=`📍 Địa điểm: ${viLocation(r.location)}`;$('resultScores').innerHTML='<div class="muted small">BẢNG ĐIỂM</div>'+state.players.map(p=>`<div class="score-row"><span>${esc(p.name)}</span><strong>${r.scores[p.id]||0}</strong></div>`).join('');$('nextRoundBtn').style.display=state.selfId===state.hostId?'block':'none';showScreen('result');});
setInterval(()=>{if(state.phase==='game'&&state.timer>0){state.timer--;renderTimer();}},1000);
showScreen('lobby');