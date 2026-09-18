(()=>{
  // Spy guessing flow: click "Spy đoán địa điểm" first, then choose a location directly on the board.
  const originalRenderGame=window.renderGame;
  if(typeof originalRenderGame!=='function')return;
  window.renderGame=function(){
    originalRenderGame();
    if(state?.guessMode&&state?.role?.spy){
      const modal=document.getElementById('locationModal');
      if(modal){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
    }
  };
})();
