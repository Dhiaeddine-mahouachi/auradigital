import {
 ACESFilmicToneMapping, AmbientLight, BoxGeometry, DirectionalLight, Group, Mesh, MeshStandardMaterial,
 OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let asset;
const model=()=>asset??=new GLTFLoader().loadAsync('/media/auri/auri.glb').catch(error=>{
 asset=undefined;
 throw error;
});

export async function mountAuri(host, signal) {
 const glb=await model();
 if(signal?.aborted||!host.isConnected)return;
 const login=host.dataset.variant==='login';
 const enhanced=login||host.dataset.variant==='guide';
 // failIfMajorPerformanceCaveat: on software-only graphics the 3D model would
 // freeze the page, so the still image of Auri stays instead.
 const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.toneMapping=ACESFilmicToneMapping;
 renderer.toneMappingExposure=enhanced?1.22:1.4;
 const scene=new Scene();
 const camera=new OrthographicCamera(-1.34,1.34,1.34,-1.34,.1,40);
 const modelRoot=new Group();
 const character=glb.scene.clone();
 modelRoot.add(character);
 scene.add(modelRoot,new AmbientLight(0xf1f2ec,enhanced?.62:1.35));
 for(const [color,intensity,position] of [
  [0xffeed8,3,[-3,5,4]],[0xcfe3ff,1.25,[4,1,3]],[0xe1e100,enhanced?2.1:1.2,[1,4,-3]],
 ]){
  const lamp=new DirectionalLight(color,intensity);
  lamp.position.set(...position);
  scene.add(lamp);
 }
 const get=name=>character.getObjectByName(name);
 const head=get('Head'),eyes=get('Eyes'),left=get('LeftArm'),right=get('RightArm');
 const keys=new Group();
 const keyShape=new PlaneGeometry(.104,.062);
 const keySurface=new MeshStandardMaterial({color:0x545f16,emissive:0xebef13,emissiveIntensity:.6});
 for(let row=0;row<3;row++){
  for(let col=0;col<7;col++){
   const key=new Mesh(keyShape,keySurface);
   key.rotation.x=-Math.PI/2;
   key.position.set((col-3)*.117,.65+row*.025,.75-row*.08);
   keys.add(key);
  }
 }
 const deskSurface=new BoxGeometry(.99,.036,.38);
 const deskMaterial=new MeshStandardMaterial({color:0x274039,roughness:.72});
 const desk=new Mesh(deskSurface,deskMaterial);
 desk.position.set(0,.62,.67);
 keys.add(desk);
 character.add(keys);
 const canvas=renderer.domElement;
 canvas.setAttribute('aria-hidden','true');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let raf=0,visible=true,disposed=false;
 let lastPhase='',started=performance.now();

 let targetX=0,targetY=0,gazeX=0,gazeY=0;
 const clamp=value=>Math.max(-1,Math.min(1,value));
 function followPointer(event){
  if(event.pointerType!=='mouse'||preference.matches||!visible||document.hidden)return;
  const bounds=host.getBoundingClientRect();
  targetX=clamp((event.clientX-bounds.left-bounds.width/2)/Math.max(220,bounds.width));
  targetY=clamp((event.clientY-bounds.top-bounds.height/2)/Math.max(220,bounds.height));
  schedule();
 }
 function resetGaze(){targetX=targetY=0;schedule();}
 function render(now=performance.now()) {
  raf=0;
  if(!visible||document.hidden||disposed)return;
  const level=Number(host.getAttribute('level'));
  const phase=host.dataset.phase||'idle';
  if(phase!==lastPhase){lastPhase=phase;started=now;}
  const t=(now-started)/1000;
  const time=preference.matches?0:now/1000;
  const active=['typing','working','drafting'].includes(phase);
  const happy=['happy','success','evolving','draft_ready'].includes(phase);
  for(const [name,show] of Object.entries({
   Torso:level>=2,Feet:level>=2&&level<7,Legs:level>=3,Arms:level>=3,
   BuilderKit:level>=4,OperatorKit:level>=5,StrategistKit:level===6,MasterKit:level===7,
  }))get(name).visible=show;
  keys.visible=active;
  keys.position.y=level===1?.55:0;
  const focus=level===1?1.56:1.17;
  camera.zoom=level===1?1.23:1;
  camera.position.set(2,focus+1.16,6.8);
  camera.lookAt(0,focus,0);
  camera.updateProjectionMatrix();
  gazeX=preference.matches?0:gazeX+(targetX-gazeX)*.14;
  gazeY=preference.matches?0:gazeY+(targetY-gazeY)*.14;
  const pulse=preference.matches?0:Math.sin(time*2);
  const wave=login&&!preference.matches?Math.max(0,1-Math.abs(t-1.7)/1.45):0;
  modelRoot.position.y=.028*pulse+(happy&&!preference.matches?.15*Math.abs(Math.sin(t*6))*Math.max(0,1-t/2):0);
  modelRoot.rotation.y=phase==='evolving'&&!preference.matches?.32*Math.sin(Math.min(1,t/1.4)*Math.PI):.035*pulse;
  head.rotation.z=phase==='thinking'?-.14:phase==='error'?.1:.026*pulse;
  head.rotation.y=(phase==='listening'?-.17:.04*pulse)+.27*gazeX;
  head.rotation.x=-.17*gazeY;
  const blink=time>0&&time%4.2>4.04;
  eyes.scale.y=phase==='sleeping'?.23:blink?.14:happy?.73:1+.08*pulse;
  const tap=preference.matches?0:.19*Math.sin(time*13);
  left.rotation.x=active?-.95+tap:phase==='speaking'?-.38+.16*pulse:happy?-.55:0;
  right.rotation.x=active?-.95-tap:happy?-1.5:-1.65*wave;
  left.rotation.z=happy?-.22:0;
  right.rotation.z=happy?.28:wave*(.25+.2*Math.sin(time*12));
  if(phase==='error')eyes.scale.y=.64;
  renderer.render(scene,camera);
  if(!preference.matches)raf=requestAnimationFrame(render);
 }
 function schedule(){if(!raf&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(render);}
 const resize=new ResizeObserver(()=>{
  const side=Math.max(1,Math.round(host.clientWidth));
  renderer.setSize(side,side,false);
  schedule();
 });
 const visibility=new IntersectionObserver(([entry])=>{
  visible=entry.isIntersecting;
  if(!visible){
   targetX=targetY=0;
   cancelAnimationFrame(raf);
   raf=0;
  }
  schedule();
 });
 const updates=new MutationObserver(schedule);
 function dispose(){
  if(disposed)return;
  disposed=true;
  cancelAnimationFrame(raf);
  resize.disconnect();
  visibility.disconnect();
  updates.disconnect();
  preference.removeEventListener('change',schedule);
  document.removeEventListener('visibilitychange',schedule);
  window.removeEventListener('pointermove',followPointer);
  window.removeEventListener('blur',resetGaze);
  canvas.removeEventListener('webglcontextlost',dispose);
  document.documentElement.removeEventListener('pointerleave',resetGaze);
  deskSurface.dispose();
  deskMaterial.dispose();
  keyShape.dispose();
  keySurface.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  canvas.remove();
  host.removeAttribute('data-rendered');
 }
 canvas.addEventListener('webglcontextlost',dispose,{once:true});
 host.append(canvas);
 host.setAttribute('data-rendered','');
 resize.observe(host);
 visibility.observe(host);
 updates.observe(host,{attributes:true,attributeFilter:['data-phase','level']});
 preference.addEventListener('change',schedule);
 document.addEventListener('visibilitychange',schedule);
 window.addEventListener('pointermove',followPointer,{passive:true});
 window.addEventListener('blur',resetGaze);
 document.documentElement.addEventListener('pointerleave',resetGaze);
 return dispose;
}
