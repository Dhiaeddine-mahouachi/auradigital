// Auri's production-safe character player.
// Animations are baked from the real 3D GLB. Do not initialize WebGL on page load:
// some graphics drivers hang the entire tab during WebGL context creation.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const dataSaver=()=>navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType);
const clamp=v=>Math.max(-1,Math.min(1,v));
const phaseToMotion={
 idle:'idle',welcome:'welcome',listening:'thinking',attentive:'thinking',
 thinking:'thinking',typing:'working',working:'working',drafting:'working',
 speaking:'speaking',happy:'success',success:'success',
 evolving:'success',draft_ready:'success',error:'thinking'
};
class AuriCharacter extends HTMLElement {
 connectedCallback(){
  this.connection?.abort();
  const controller=new AbortController();
  const {signal}=controller;
  this.connection=controller;
  let visible=!('IntersectionObserver' in window);
  let pending=0,playingKey='',motionImage=null;
  const poster=this.querySelector('img:not(.auri-motion)');
  const clear=()=>{
   pending++;
   motionImage?.remove();
   motionImage=null;
   this.removeAttribute('data-motion-ready');
  };
  const refresh=()=>{
   if(signal.aborted)return;
   const level=Math.min(7,Math.max(1,Number(this.getAttribute('level'))||1));
   const mode=phaseToMotion[this.dataset.phase||'idle'];
   if(poster){
    const path=`/media/auri/level-${level}.webp`;
    if(poster.getAttribute('src')!==path)poster.setAttribute('src',path);
   }
   if(!visible||document.hidden||reducedMotion.matches||dataSaver()||!mode){
    playingKey='';
    clear();
    return;
   }
   const key=`${level}/${mode}`;
   if(playingKey===key)return;
   playingKey=key;
   const token=++pending;
   const next=new Image();
   next.className='auri-motion';
   next.alt='';
   next.decoding='async';
   next.onload=()=>{
    if(signal.aborted||token!==pending||!visible||document.hidden||reducedMotion.matches)return;
    motionImage?.remove();
    motionImage=next;
    this.append(next);
    this.setAttribute('data-motion-ready','');
   };
   next.onerror=()=>{
    if(token===pending){playingKey='';clear();}
   };
   next.src=`/media/auri/anim/level-${level}-${mode}.webp`;
  };
  const reset=()=>this.style.removeProperty('--auri-look');
  const follow=event=>{
   if(signal.aborted||!visible||document.hidden||reducedMotion.matches||event.pointerType!=='mouse')return;
   const box=this.getBoundingClientRect();
   const offset=(p,origin,span)=>clamp((p-origin-span/2)/Math.max(span,180))*4;
   this.style.setProperty('--auri-look',`${offset(event.clientX,box.left,box.width)}px, ${offset(event.clientY,box.top,box.height)}px`);
  };
  window.addEventListener('pointermove',follow,{signal,passive:true});
  window.addEventListener('blur',reset,{signal});
  document.documentElement.addEventListener('pointerleave',reset,{signal});
  reducedMotion.addEventListener('change',refresh,{signal});
  document.addEventListener('visibilitychange',refresh,{signal});
  this.updates=new MutationObserver(refresh);
  this.updates.observe(this,{attributes:true,attributeFilter:['data-phase','level']});
  if('IntersectionObserver' in window){
   this.observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(!visible)reset();
    refresh();
   });
   this.observer.observe(this);
  }else refresh();
 }
 disconnectedCallback(){
  this.connection?.abort();
  this.observer?.disconnect();
  this.updates?.disconnect();
  this.querySelector('img.auri-motion')?.remove();
  this.removeAttribute('data-motion-ready');
  this.style.removeProperty('--auri-look');
 }
}
customElements.define('auri-character',AuriCharacter);
