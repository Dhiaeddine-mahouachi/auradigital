import {watchAuri} from './auri-controller.js';
import { auriStill, displayLevel } from '../../media/auri/live/auri-still.js';

export const auriCharacter=(level=1,{variant}={})=>{
 const value=Number.isInteger(level)&&level>=1&&level<=7?level:1;
 return `<auri-character class="auri" aria-hidden="true" ${['login','guide','avatar','face'].includes(variant)?`data-variant="${variant}"`:''} level="${value}">${auriStill(displayLevel(value,variant))}</auri-character>`;
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
