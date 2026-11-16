import {watchAuri} from './auri-controller.js';

export const auriCharacter=(level=1,{variant}={})=>{
 const value=Number.isInteger(level)&&level>=1&&level<=7?level:1;
 return `<auri-character class="auri" aria-hidden="true" ${['login','guide'].includes(variant)?`data-variant="${variant}"`:''} level="${value}"><img alt="" width="256" height="256" loading="lazy" decoding="async" src="/media/auri/level-${value}.webp"></auri-character>`;
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
