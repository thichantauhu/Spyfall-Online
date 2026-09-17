(()=>{
const oldRenderQA=window.renderQA;
window.renderQA=function(){
 const log=document.getElementById('qaLog'); if(!log)return;
 log.innerHTML=state.qa?.length?state.qa.map((x,i)=>`<details class="qa-item"><summary>Lượt ${i+1} · <strong>${esc(x.from)}</strong> → <strong>${esc(x.to)}</strong></summary><div class="qa-detail"><div><strong>Hỏi:</strong> ${esc(x.q)}</div><div class="answer-line"><strong>Trả lời:</strong> ${esc(x.a)}</div></div></details>`).join(''):'<div class="muted small">Chưa có câu hỏi nào.</div>';
};
const oldRenderSide=window.renderSide;
window.renderSide=function(){oldRenderSide();
 const isSpy=!!state.role?.spy;
 const btn=document.getElementById('accuseBtn');
 const chooser=document.getElementById('accuseChooser');
 if(isSpy){if(btn){btn.disabled=true;btn.style.display='none'}if(chooser)chooser.remove()}
};
})();