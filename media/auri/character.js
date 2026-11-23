// Official Auri character image player. The previous GLB-based viewer could
// freeze browser tabs while acquiring WebGL contexts; never use WebGL here.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=v=>Math.max(-1,Math.min(1,v));
class AuriCharacter extends HTMLElement{
 connectedCallback(){
  this.connection?.abort();
  this.connection=new AbortController();
  const {signal}=this.connection;
  const poster=this.querySelector('img:not(.auri-motion)')||document.createElement('img');
  if(!poster.isConnected)this.append(poster);
  poster.src='/media/auri/official-auri.webp';
  poster.alt='';
  poster.decoding='async';
  this.setAttribute('data-brand','official');
  this.removeAttribute('data-motion-ready');
  this.querySelector('img.auri-motion')?.remove();
  const reset=()=>this.style.removeProperty('--auri-look');
  window.addEventListener('pointermove',event=>{
   if(event.pointerType!=='mouse'||document.hidden||reducedMotion.matches||this.dataset.visible==='false')return;
   const b=this.getBoundingClientRect();
   const x=clamp((event.clientX-b.left-b.width/2)/Math.max(160,b.width))*3;
   const y=clamp((event.clientY-b.top-b.height/2)/Math.max(160,b.height))*2;
   this.style.setProperty('--auri-look',x+'px, '+y+'px');
  },{signal,passive:true});
  window.addEventListener('blur',reset,{signal});
  document.addEventListener('visibilitychange',reset,{signal});
  if('IntersectionObserver' in window){
   this.observer=new IntersectionObserver(([entry])=>{
    this.dataset.visible=entry.isIntersecting?'true':'false';
    if(!entry.isIntersecting)reset();
   });
   this.observer.observe(this);
  }
 }
 disconnectedCallback(){
  this.connection?.abort();
  this.observer?.disconnect();
  this.style.removeProperty('--auri-look');
 }
}
if(!customElements.get('auri-character'))customElements.define('auri-character',AuriCharacter);
