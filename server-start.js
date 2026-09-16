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

patch('server-v2.js',/const locations=\[[^\n]*\];/,locationCode);
patch('app.js',/const locations=\[[^\n]*\];/,locationCode);

const appPath=path.join(__dirname,'app.js');
let app=fs.readFileSync(appPath,'utf8');
app=app.replaceAll('/assets/${encodeURIComponent(name)}.webp','/assets/${encodeURIComponent(name==="Tàu hỏa"?"Tàu chở khách":name)}.webp');
fs.writeFileSync(appPath,app,'utf8');

const indexPath=path.join(__dirname,'index.html');
let html=fs.readFileSync(indexPath,'utf8');
html=html.replaceAll('📍 BẢNG ĐỊA ĐIỂM (30)','📍 BẢNG ĐỊA ĐIỂM (20)');
fs.writeFileSync(indexPath,html,'utf8');

// Hiển thị đầy đủ câu hỏi trong khung chat chung để tất cả người chơi đều thấy.
patch('server-v2.js',/addChat\(r,''\,`❓ \$\{r\.players\.find\(p=>p\.id===socket\.id\)\.name\} → \$\{t\.name\}`\);/,"addChat(r,'',`❓ ${r.players.find(p=>p.id===socket.id).name} → ${t.name}: ${q}`);");

require('./server-v2.js');
