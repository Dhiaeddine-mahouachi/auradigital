import {
 ACESFilmicToneMapping, AmbientLight, DirectionalLight, Group, Mesh, MeshStandardMaterial,
 OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let asset;
const model=()=>asset??=new GLTFLoader().loadAsync('/media/auri/auri.glb').catch(error=>{
 asset=undefined;
 throw error;
});

export async function mountAuri(host) {
 const glb=await model();
 if(!host.isConnected)return;
 const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.toneMapping=ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.4;
 const scene=new Scene();
 const camera=new OrthographicCamera(-1.34,1.34,1.34,-1.34,.1,40);
 const modelRoot=new Group();
 const character=glb.scene.clone();
 modelRoot.add(character);
 scene.add(modelRoot,new AmbientLight(0xf1f2ec,1.35));
 for(const [color,intensity,position] of [
  [0xffeed8,3,[-3,5,4]],[0xcfe3ff,1.25,[4,1,3]],[0xe1e100,1.2,[1,4,-3]],
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
 character.add(keys);
 const canvas=renderer.domElement;
 canvas.setAttribute('aria-hidden','true');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let raf=0,visible=true,disposed=false;
 let lastPhase='',started=performance.now();
 function render(now=performance.now()) {
  raf=0;
  if(!visible||document.hidden||disposed)return;
  const level=Number(host.getAttribute('level'));
  const phase=host.dataset.phase||'idle';
  if(phase!==lastPhase){lastPhase=phase;started=now;}
  const t=(now-started)/1000;
  const asleep=phase==='idle'&&t>=60;
  const time=preference.matches?0:now/1000;
  const active=['typing','working'].includes(phase);
  const happy=['happy','success','evolving'].includes(phase);
  for(const [name,show] of Object.entries({
   Torso:level>=2,Feet:level>=2&&level<7,Legs:level>=3,Arms:level>=3,
   Antenna:level===2,BuilderKit:level>=4,OperatorKit:level>=5,StrategistKit:level===6,MasterKit:level===7,
  }))get(name).visible=show;
  keys.visible=active&&level>=3;
  if(active&&level<3)keys.visible=true;
  keys.position.y=level===1?.55:0;
  const focus=level===1?1.56:1.17;
  camera.zoom=level===1?1.23:1;
  camera.position.set(2,focus+1.16,6.8);
  camera.lookAt(0,focus,0);
  camera.updateProjectionMatrix();
  const pulse=preference.matches?0:Math.sin(time*2);
  modelRoot.position.y=.028*pulse+(happy&&!preference.matches?.15*Math.abs(Math.sin(t*6))*Math.max(0,1-t/2):0);
  modelRoot.rotation.y=phase==='evolving'&&!preference.matches?.32*Math.sin(Math.min(1,t/1.4)*Math.PI):.035*pulse;
  head.rotation.z=phase==='thinking'?-.14:phase==='error'?.1:.026*pulse;
  head.rotation.y=phase==='listening'?-.17:.04*pulse;
  const blink=time>0&&time%4.2>4.04;
  eyes.scale.y=phase==='sleeping'||asleep?.23:blink?.14:happy?.73:1+.08*pulse;
  const tap=preference.matches?0:.19*Math.sin(time*13);
  left.rotation.x=active?-.95+tap:phase==='speaking'?-.38+.16*pulse:happy?-.55:0;
  right.rotation.x=active?-.95-tap:happy?-1.5:0;
  left.rotation.z=happy?-.22:0;
  right.rotation.z=happy?.28:0;
  if(phase==='error')eyes.scale.y=.64;
  renderer.render(scene,camera);
  if(!preference.matches&&!asleep)raf=requestAnimationFrame(render);
 }
 function schedule(){if(!raf&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(render);}
 const resize=new ResizeObserver(()=>{
  const side=Math.max(1,Math.round(host.clientWidth));
  renderer.setSize(side,side,false);
  schedule();
 });
 const visibility=new IntersectionObserver(([entry])=>{
  visible=entry.isIntersecting;
  if(!visible&&raf){cancelAnimationFrame(raf);raf=0;}
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
 return dispose;
}
