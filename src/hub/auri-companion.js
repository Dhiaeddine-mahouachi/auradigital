import {watchAuri} from './auri-controller.js';

const lowBandwidth=()=>navigator.connection?.saveData||['slow-2g','2g'].includes(navigator.connection?.effectiveType);

class AuriCharacter extends HTMLElement {
 connectedCallback(){
  if(this.hasAttribute('poster-only')||lowBandwidth()||!('IntersectionObserver' in window)||!window.WebGL2RenderingContext)return;
  this.observer=new IntersectionObserver(async ([entry])=>{
   if(!entry.isIntersecting)return;
   this.observer.disconnect();
   try {
    const {mountAuri}=await import('/media/auri/viewer.js');
    if(this.isConnected)this.disposeModel=await mountAuri(this);
   } catch {
    // The level-specific poster remains visible if WebGL or loading fails.
   }
  },{rootMargin:'100px'});
  this.observer.observe(this);
 }
 disconnectedCallback(){
  this.observer?.disconnect();
  this.disposeModel?.();
 }
}
customElements.define('auri-character',AuriCharacter);

export const auriCharacter=(level=1,{posterOnly=false,variant}={})=>{
 const value=Number.isInteger(level)&&level>=1&&level<=7?level:1;
 return `<auri-character class="auri" aria-hidden="true" ${['login','guide'].includes(variant)?`data-variant="${variant}"`:''} level="${value}" ${posterOnly?'poster-only':''}><img alt="" width="256" height="256" decoding="async" src="/media/auri/level-${value}.webp"></auri-character>`;
};

export function connectAuri(host,scope,labels){
 const status=host.querySelector('[data-auri-status]');
 const character=host.querySelector('auri-character');
 if(!character)return ()=>{};
 return watchAuri(scope,phase=>{
  character.dataset.phase=phase;
  if(status)status.textContent=labels[phase]||'';
  host.querySelector('details')?.toggleAttribute('data-auri-pending',['thinking','working','typing','drafting'].includes(phase));
 });
}
