(()=>{
  const tips={
    accuseBtn:{title:'Tố cáo cá nhân',html:'<div>• Đúng Spy: người tố cáo <strong>+2 điểm</strong>, kết thúc vòng.</div><div>• Sai: người tố cáo <strong>-1 điểm</strong>, Spy <strong>+4 điểm</strong>, kết thúc vòng.</div>'},
    groupAccuseBtn:{title:'Tố cáo chung',html:'<div>• Tất cả người chơi phải bỏ phiếu.</div><div>• Đủ phiếu = số người chơi → người có nhiều phiếu nhất bị tố cáo.</div><div>• Đúng Spy: <strong>mỗi người thường +1 điểm</strong>.</div><div>• Sai Spy: <strong>mỗi Spy +4 điểm</strong>.</div>'},
    guessBtn:{title:'Spy đoán địa điểm',html:'<div>• Đúng địa điểm: <strong>Spy +4 điểm</strong>.</div><div>• Sai địa điểm: <strong>Spy -2 điểm</strong>, tất cả người chơi thường <strong>+1 điểm</strong>.</div>'}
  };
  const style=document.createElement('style');
  style.textContent='.action-rule-row{display:flex;align-items:center;gap:6px;margin-bottom:8px}.action-rule-row>button{flex:1;margin:0}.action-rule-info{width:24px;height:24px;min-width:24px;border-radius:50%;border:1px solid #cbd5e1;background:#fff;color:#111827;font-weight:800;cursor:pointer;padding:0;line-height:22px}.action-rule-pop{position:absolute;z-index:9999;width:min(320px,calc(100vw - 50px));background:#fff;border:1px solid #d7dee8;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.14);padding:12px 14px;color:#1f2937;font-size:13px;line-height:1.55;text-align:left}.action-rule-pop h4{margin:0 0 7px;font-size:14px}.action-rule-pop div{margin:4px 0}.action-rule-info-wrap{position:relative;display:flex;align-items:center}';
  document.head.appendChild(style);
  function closePop(){document.querySelectorAll('.action-rule-pop').forEach(x=>x.remove())}
  function addTip(id){
    const btn=document.getElementById(id); if(!btn||btn.dataset.ruleTip)return;
    btn.dataset.ruleTip='1';
    const row=document.createElement('div'); row.className='action-rule-row';
    btn.parentNode.insertBefore(row,btn); row.appendChild(btn);
    const wrap=document.createElement('div'); wrap.className='action-rule-info-wrap';
    const info=document.createElement('button'); info.type='button'; info.className='action-rule-info'; info.textContent='!'; info.setAttribute('aria-label','Xem chú thích');
    wrap.appendChild(info); row.appendChild(wrap);
    info.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      closePop();
      const pop=document.createElement('div');pop.className='action-rule-pop';pop.innerHTML=`<h4>${tips[id].title}</h4>${tips[id].html}`;
      wrap.appendChild(pop);
    };
  }
  function decorate(){
    const h=document.querySelector('.action-card-v4 h2');
    if(h)h.innerHTML='Hành động <span style="font-size:.8em;font-weight:800;">- BẤT CỨ LÚC NÀO</span>';
    addTip('accuseBtn'); addTip('groupAccuseBtn'); addTip('guessBtn');
  }
  const oldRender=window.renderSide;
  if(oldRender)window.renderSide=function(){oldRender();decorate()};
  document.addEventListener('click',()=>closePop());
  const timer=setInterval(decorate,300);
})();
