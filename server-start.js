const fs=require('fs');
const path=require('path');

const locations=['Rạp hát','Bãi biển','Siêu thị','Trạm xăng','Rạp xiếc','Bệnh viện','Quân Thập Tự','Tàu hỏa','Ngân hàng','Đồn cảnh sát','Tàu cướp biển','Hãng phim','Căn cứ quân sự','Tàu ngầm','Trạm Bắc Cực','Khách sạn','Đại sứ quán','Trạm vũ trụ','Sòng bạc','Sở thú'];
const locationCode=`const locations=${JSON.stringify(locations)};`;

function patch(file,pattern,replacement){
  const p=path.join(__dirname,file);
  let s=fs.readFileSync(p,'utf8');
  if(!pattern.test(s)) throw new Error(`Không tìm thấy nội dung cần sửa trong ${file}`);
  s=s.replace(pattern,replacement);
  fs.writeFileSync(p,s,'utf8');
}

// Đồng bộ 20 địa điểm cho cả server và giao diện.
patch('server-v2.js',/const locations=\[[^\n]*\];/,locationCode);
patch('app.js',/const locations=\[[^\n]*\];/,locationCode);

// Ảnh Tàu hỏa dùng asset Tàu chở khách hiện có.
const appPath=path.join(__dirname,'app.js');
let app=fs.readFileSync(appPath,'utf8');
app=app.replaceAll('/assets/${encodeURIComponent(name)}.webp','/assets/${encodeURIComponent(name==="Tàu hỏa"?"Tàu chở khách":name)}.webp');

// Khi người hỏi chọn mục tiêu, gửi lựa chọn realtime cho toàn bộ phòng.
app=app.replace("const state={room:null,selfId:null,players:[],hostId:null,phase:'lobby',round:0,turnIndex:0,timer:0,role:null,roleVisible:true,qa:[],scores:{},pending:null,askedIds:[],lastQuestionerId:null,chat:[],votes:{},guessMode:false,selectedTarget:'',spyCount:1,matchOver:false,matchWinners:[]};","const state={room:null,selfId:null,players:[],hostId:null,phase:'lobby',round:0,turnIndex:0,timer:0,role:null,roleVisible:true,qa:[],scores:{},pending:null,askedIds:[],lastQuestionerId:null,chat:[],votes:{},guessMode:false,selectedTarget:'',selectedTargetInfo:null,spyCount:1,matchOver:false,matchWinners:[]};");
app=app.replace("wrap.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{state.selectedTarget=b.dataset.target;renderGame()})","wrap.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{state.selectedTarget=b.dataset.target;socket.emit('select_target',{targetId:state.selectedTarget});renderGame()})");
app=app.replace("$('turnLabel').textContent=pending?`${state.players.find(p=>p.id===pending.fromId)?.name||''} → ${state.players.find(p=>p.id===pending.toId)?.name||''}`:state.phase==='discussion'?'THẢO LUẬN':myTurn?'LƯỢT CỦA BẠN':`LƯỢT: ${current?.name||''}`","$('turnLabel').textContent=pending?`${state.players.find(p=>p.id===pending.fromId)?.name||''} → ${state.players.find(p=>p.id===pending.toId)?.name||''}`:state.selectedTargetInfo?`${state.players.find(p=>p.id===state.selectedTargetInfo.fromId)?.name||''} → ${state.players.find(p=>p.id===state.selectedTargetInfo.toId)?.name||''}`:state.phase==='discussion'?'THẢO LUẬN':myTurn?'LƯỢT CỦA BẠN':`LƯỢT: ${current?.name||''}`");
app=app.replace("state.matchOver=!!r.matchOver;state.matchWinners=r.matchWinners||[];if(r.pending)","state.matchOver=!!r.matchOver;state.matchWinners=r.matchWinners||[];state.selectedTargetInfo=r.selectedTarget||null;if(r.pending)");
app=app.replace("socket.on('question_received',x=>{state.pending={fromId:x.fromId,toId:x.toId||state.selfId,q:x.q};if(state.phase==='game')renderGame()});","socket.on('question_received',x=>{state.pending={fromId:x.fromId,toId:x.toId||state.selfId,q:x.q};if(state.phase==='game')renderGame()});socket.on('target_selected',x=>{state.selectedTargetInfo=x;if(state.phase==='game')renderGame()});");
fs.writeFileSync(appPath,app,'utf8');

const indexPath=path.join(__dirname,'index.html');
let html=fs.readFileSync(indexPath,'utf8');
html=html.replaceAll('📍 BẢNG ĐỊA ĐIỂM (30)','📍 BẢNG ĐỊA ĐIỂM (20)');
fs.writeFileSync(indexPath,html,'utf8');

// Hiển thị đầy đủ câu hỏi trong chat chung.
patch('server-v2.js',/addChat\(r,''\,`❓ \$\{r\.players\.find\(p=>p\.id===socket\.id\)\.name\} → \$\{t\.name\}`\);/,"addChat(r,'',`❓ ${r.players.find(p=>p.id===socket.id).name} → ${t.name}: ${q}`);");

// Đồng bộ trạng thái mục tiêu đang được chọn cho tất cả người chơi.
patch('server-v2.js',/votes:Object\.fromEntries\(r\.votes\|\|\[\]\),pending:r\.pending\?\{fromId:r\.pending\.fromId,toId:r\.pending\.toId,q:r\.pending\.q\}:null,spyCount:/,"votes:Object.fromEntries(r.votes||[]),pending:r.pending?{fromId:r.pending.fromId,toId:r.pending.toId,q:r.pending.q}:null,selectedTarget:r.selectedTarget?{fromId:r.selectedTarget.fromId,toId:r.selectedTarget.toId}:null,spyCount:");
patch('server-v2.js',/r\.noticeTimer=setTimeout\(\(\)=>\{if\(\['game','discussion'\]\.includes\(r\.phase\)\)/,"r.selectedTarget=null;r.noticeTimer=setTimeout(()=>{if(['game','discussion'].includes(r.phase))");
patch('server-v2.js',/r\.pending=null;r\.turnIndex=r\.players\.findIndex\(p=>p\.id===to\.id\);/,"r.pending=null;r.selectedTarget=null;r.turnIndex=r.players.findIndex(p=>p.id===to.id);");
patch('server-v2.js',/r\.pending=null;r\.askedIds=new Set\(\);r\.lastQuestionerId=null;/,"r.pending=null;r.selectedTarget=null;r.askedIds=new Set();r.lastQuestionerId=null;");
patch('server-v2.js',/socket\.on\('send_question',\(\{targetId,question\}\)=>\{/,"socket.on('select_target',({targetId})=>{const r=rooms.get(socket.roomCode);if(!r||r.phase!=='game'||r.pending||r.players[r.turnIndex]?.id!==socket.id)return;const t=r.players.find(p=>p.id===targetId);if(!t||t.id===socket.id)return;if(r.askedIds.has(t.id))return;if(r.lastQuestionerId===t.id)return;r.selectedTarget={fromId:socket.id,toId:t.id};io.to(r.code).emit('target_selected',r.selectedTarget);emitRoom(r)});socket.on('send_question',({targetId,question})=>{");
patch('server-v2.js',/r\.pending=\{fromId:socket\.id,toId:t\.id,q\};addChat\(r,''\,`❓/,"r.selectedTarget={fromId:socket.id,toId:t.id};r.pending={fromId:socket.id,toId:t.id,q};addChat(r,'',`❓");

require('./server-v2.js');
