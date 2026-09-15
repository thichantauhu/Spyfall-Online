const locations = [
  "Bãi biển","Bệnh viện","Sân bay","Nhà hàng","Trường học","Rạp chiếu phim","Khách sạn","Ngân hàng","Siêu thị","Đồn cảnh sát","Sở thú","Công viên","Nhà ga","Tàu ngầm","Du thuyền","Nhà máy","Văn phòng","Sân vận động","Bảo tàng","Thư viện"
];

const state = {
  screen: "lobby",
  room: null,
  players: [],
  hostId: null,
  me: null,
  location: null,
  spyId: null,
  round: 1,
  scores: {},
  turnIndex: 0,
  timer: 600,
  timerId: null,
  roleVisible: true,
  qa: [],
  accused: false,
  accusationTarget: null,
  gameOver: false
};

const $ = (id) => document.getElementById(id);

function uid(){ return Math.random().toString(36).slice(2,10); }
function roomCode(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }
function escapeHtml(s){ return String(s).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function showScreen(name){
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  $(name + 'Screen').classList.add('active');
  state.screen = name;
}

function renderLobby(){
  if(!state.room) return;
  $('roomCodeLabel').textContent = state.room;
  $('playerCount').textContent = state.players.length;
  $('hostLabel').textContent = state.me?.id === state.hostId ? 'HOST' : 'NGƯỜI CHƠI';
  $('startBtn').disabled = state.me?.id !== state.hostId || state.players.length < 3;
  $('roomMessage').textContent = state.players.length < 3 ? 'Tối thiểu 3 người để bắt đầu.' : (state.me?.id === state.hostId ? 'Đã đủ người. Có thể bắt đầu.' : 'Chờ Host bắt đầu.');
  $('playerList').innerHTML = state.players.map((p,i)=>`<div class="player"><div class="player-name"><span class="dot"></span>${escapeHtml(p.name)}</div>${p.id===state.hostId?'<span class="pill">HOST</span>':''}</div>`).join('');
}

function addSelf(name){
  const player = {id:uid(), name:name.trim() || 'Người chơi'};
  state.me = player;
  state.players = [player];
  state.scores[player.id]=0;
}

function createRoom(){
  const name = $('playerName').value.trim();
  addSelf(name);
  state.room = roomCode();
  state.hostId = state.me.id;
  showScreen('room');
  renderLobby();
}

function joinRoom(){
  const name = $('playerName').value.trim();
  const code = $('roomCode').value.trim().toUpperCase();
  if(!code){ alert('Nhập mã phòng.'); return; }
  // Demo client: creates a local room simulation. Real multiplayer transport can be plugged in later.
  addSelf(name);
  state.room = code;
  state.hostId = state.me.id;
  showScreen('room');
  renderLobby();
}

function seedDemoPlayers(){
  const names = ['An','Bình','Chi','Dũng','Hà'];
  names.forEach(name=>{
    const p={id:uid(),name}; state.players.push(p); state.scores[p.id]=0;
  });
}

function startRound(){
  if(state.players.length < 3) return;
  state.location = locations[Math.floor(Math.random()*locations.length)];
  state.spyId = state.players[Math.floor(Math.random()*state.players.length)].id;
  state.round = Math.max(1,state.round);
  state.turnIndex = 0;
  state.qa=[];
  state.accused=false;
  state.accusationTarget=null;
  state.gameOver=false;
  state.timer=600;
  state.roleVisible=true;
  renderGame();
  showScreen('game');
  startTimer();
}

function startTimer(){
  clearInterval(state.timerId);
  state.timerId=setInterval(()=>{
    if(state.gameOver) return;
    state.timer--;
    renderTimer();
    if(state.timer<=0){ clearInterval(state.timerId); endByTimeout(); }
  },1000);
}
function renderTimer(){
  const m=Math.floor(state.timer/60).toString().padStart(2,'0');
  const s=(state.timer%60).toString().padStart(2,'0');
  $('timer').textContent=`${m}:${s}`;
}
function myTurn(){ return state.players[state.turnIndex]?.id===state.me?.id; }
function renderGame(){
  $('roundLabel').textContent=state.round;
  $('gameRoomCode').textContent=state.room;
  renderTimer();
  const spy=state.me?.id===state.spyId;
  $('roleTitle').textContent=spy?'🕵️ BẠN LÀ GIÁN ĐIỆP':'👥 BẠN KHÔNG PHẢI GIÁN ĐIỆP';
  $('roleInfo').textContent=spy?'Bạn không biết địa điểm. Hãy quan sát câu hỏi và suy luận!':`Địa điểm: ${state.location}`;
  $('hideRoleBtn').textContent=state.roleVisible?'Ẩn thông tin':'Hiện thông tin';
  $('turnLabel').textContent=myTurn()?'LƯỢT CỦA BẠN':`LƯỢT: ${state.players[state.turnIndex]?.name || ''}`;
  $('turnInstruction').textContent=myTurn()?'Chọn một người khác và nhập câu hỏi.':'Chờ người đang có lượt đặt câu hỏi.';
  $('questionInput').disabled=!myTurn();
  $('sendQuestionBtn').disabled=!myTurn();
  renderQA(); renderScores();
}
function renderQA(){
  $('qaLog').innerHTML=state.qa.length?state.qa.map(x=>`<div class="qa-item"><div class="qa-meta">${escapeHtml(x.from)} → ${escapeHtml(x.to)}</div><div><strong>Hỏi:</strong> ${escapeHtml(x.q)}</div><div><strong>Trả lời:</strong> ${escapeHtml(x.a)}</div></div>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';
}
function renderScores(){
  $('scoreList').innerHTML=state.players.map(p=>`<div class="score-row"><span>${escapeHtml(p.name)}</span><strong>${state.scores[p.id]||0}</strong></div>`).join('');
}

function sendQuestion(){
  if(!myTurn()) return;
  const q=$('questionInput').value.trim();
  if(!q) return;
  const others=state.players.filter(p=>p.id!==state.me.id);
  const to=others[Math.floor(Math.random()*others.length)];
  const answer=answerForDemo(q,to.id===state.spyId);
  state.qa.push({from:state.me.name,to:to.name,q,a:answer});
  $('questionInput').value='';
  state.turnIndex=(state.turnIndex+1)%state.players.length;
  renderGame();
}
function answerForDemo(q,isSpy){
  if(isSpy) return ['Có thể.','Không hẳn.','Tùy trường hợp.','Khá đông.'][Math.floor(Math.random()*4)];
  return ['Đúng vậy.','Không thường xuyên.','Tùy thời điểm.','Có.','Không.'][Math.floor(Math.random()*5)];
}

function accuse(){
  if(state.gameOver) return;
  const available=state.players.filter(p=>p.id!==state.me.id);
  const names=available.map((p,i)=>`${i+1}. ${p.name}`).join('\n');
  const pick=prompt(`Chọn người để tố cáo:\n${names}`);
  if(pick===null) return;
  const idx=Number(pick)-1;
  if(!Number.isInteger(idx)||!available[idx]) return alert('Lựa chọn không hợp lệ.');
  state.accused=true; state.accusationTarget=available[idx].id;
  resolveAccusation(available[idx].id);
}
function resolveAccusation(targetId){
  const target=state.players.find(p=>p.id===targetId);
  if(targetId===state.spyId){
    state.scores[state.me.id]=(state.scores[state.me.id]||0)+2;
    state.players.filter(p=>p.id!==state.me.id && p.id!==state.spyId).forEach(p=>state.scores[p.id]=(state.scores[p.id]||0)+1);
    endRound('👥 Người thường thắng!',`${target.name} chính là Spy.`);
  }else{
    state.scores[state.spyId]=(state.scores[state.spyId]||0)+4;
    endRound('🕵️ Spy thắng!',`${target.name} không phải Spy. Spy là ${state.players.find(p=>p.id===state.spyId)?.name}.`);
  }
}
function guessLocation(){
  if(state.me?.id!==state.spyId){ alert('Chỉ Spy mới có thể đoán địa điểm.'); return; }
  const guess=prompt('Spy đoán địa điểm:');
  if(!guess) return;
  if(guess.trim().toLowerCase()===state.location.toLowerCase()){
    state.scores[state.spyId]=(state.scores[state.spyId]||0)+4;
    endRound('🕵️ Spy thắng!',`Đoán đúng: ${state.location}`);
  }else{
    state.players.filter(p=>p.id!==state.spyId).forEach(p=>state.scores[p.id]=(state.scores[p.id]||0)+1);
    endRound('👥 Người thường thắng!',`Spy đoán sai. Địa điểm là ${state.location}.`);
  }
}
function endByTimeout(){
  // Demo behavior: timeout starts accusation flow; select most suspicious as fallback.
  const target=state.players.find(p=>p.id!==state.spyId && p.id!==state.me.id) || state.players.find(p=>p.id!==state.spyId);
  if(state.me.id===state.spyId){
    state.scores[state.spyId]=(state.scores[state.spyId]||0)+2;
    endRound('🕵️ Spy thắng!', 'Hết thời gian mà Spy chưa bị bắt.');
  } else if(target){
    resolveAccusation(state.spyId);
  }
}
function endRound(title,detail){
  state.gameOver=true;
  clearInterval(state.timerId);
  $('resultTitle').textContent=title;
  $('resultDetail').textContent=detail;
  $('resultScores').innerHTML='<div class="muted small">BẢNG ĐIỂM</div>'+state.players.map(p=>`<div class="score-row"><span>${escapeHtml(p.name)}</span><strong>${state.scores[p.id]||0}</strong></div>`).join('');
  $('nextRoundBtn').style.display=state.me.id===state.hostId?'block':'none';
  showScreen('result');
}

$('createRoomBtn').addEventListener('click',createRoom);
$('joinRoomBtn').addEventListener('click',joinRoom);
$('startBtn').addEventListener('click',()=>{ if(state.players.length===1) seedDemoPlayers(); startRound(); });
$('leaveBtn').addEventListener('click',()=>{ clearInterval(state.timerId); state.room=null; showScreen('lobby'); });
$('sendQuestionBtn').addEventListener('click',sendQuestion);
$('accuseBtn').addEventListener('click',accuse);
$('guessBtn').addEventListener('click',guessLocation);
$('hideRoleBtn').addEventListener('click',()=>{state.roleVisible=!state.roleVisible; $('roleCard').classList.toggle('role-hidden',!state.roleVisible); renderGame();});
$('nextRoundBtn').addEventListener('click',()=>{state.round++; startRound();});
$('backLobbyBtn').addEventListener('click',()=>{clearInterval(state.timerId);showScreen('room');renderLobby();});
$('playerName').addEventListener('keydown',e=>{if(e.key==='Enter')createRoom()});

showScreen('lobby');