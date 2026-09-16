const fs=require('fs');
const path=require('path');

const locations=['Rạp hát','Bãi biển','Siêu thị','Trạm xăng','Rạp xiếc','Bệnh viện','Quân Thập Tự','Tàu hỏa','Ngân hàng','Đồn cảnh sát','Tàu cướp biển','Hãng phim','Căn cứ quân sự','Tàu ngầm','Trạm Bắc Cực','Khách sạn','Đại sứ quán','Trạm vũ trụ','Sòng bạc','Sở thú'];
const locationCode=`const locations=${JSON.stringify(locations)};`;

function patch(file,pattern,replacement){
  const p=path.join(__dirname,file);
  let s=fs.readFileSync(p,'utf8');
  if(!pattern.test(s)) throw new Error(`Không tìm thấy locations trong ${file}`);
  s=s.replace(pattern,replacement);
  fs.writeFileSync(p,s,'utf8');
}

patch('server-v2.js',/const locations=\[[^\n]*\];/,locationCode);
patch('app.js',/const locations=\[[^\n]*\];/,locationCode);

const appPath=path.join(__dirname,'index.html');
let html=fs.readFileSync(appPath,'utf8');
html=html.replace('📍 BẢNG ĐỊA ĐIỂM (30)','📍 BẢNG ĐỊA ĐIỂM (20)');
fs.writeFileSync(appPath,html,'utf8');

require('./server-v2.js');
