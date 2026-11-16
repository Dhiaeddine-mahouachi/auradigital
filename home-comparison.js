/* One connected Before / After board; progressive and reduced-motion safe. */
(() => {
  'use strict';
  const board=document.querySelector('.aura-home .bc-board');
  if(!board)return;
  const rows=Array.from(board.querySelectorAll('[data-compare-row]'));
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;

  function disableAnimation(){
    observer?.disconnect();
    observer=undefined;
    board.classList.remove('bc-motion-ready');
    rows.forEach(row=>row.classList.add('is-visible'));
  }
  function enableAnimation(){
    if(motion.matches||!('IntersectionObserver' in window)){disableAnimation();return;}
    rows.forEach(row=>row.classList.remove('is-visible'));
    observer?.disconnect();
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -7% 0px',threshold:.14});
    rows.forEach(row=>observer.observe(row));
    board.classList.add('bc-motion-ready');
  }
  enableAnimation();
  motion.addEventListener?.('change',enableAnimation);
})();
