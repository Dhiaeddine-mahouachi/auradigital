import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createAuri } from "../components/auri.js";
import { createAnimator } from "../animations/performance.js";
import { createContextBoard } from "./context.js";

const { damp } = THREE.MathUtils;
const cameras = {front:0,quarter:.38,side:Math.PI/2,back:Math.PI};
const lighting = {
  studio: { exposure:1.13,key:15.6,fill:5.4,edge:10.8,ambient:1.30,background:"#091911",room:0x21392e,horizon:0x0c1a14,strip:0x84c2a1 },
  dark: { exposure:1.02,key:9.7,fill:2.2,edge:12.8,ambient:.82,background:"#07140e",room:0x142a20,horizon:0x08140f,strip:0x59a879 },
  bright: { exposure:1.2,key:18.0,fill:9.2,edge:9.2,ambient:1.76,background:"#3b5445",room:0x5d796b,horizon:0x304239,strip:0xd0f4da }
};

function addLight(scene,color,power,position,castShadow=false) {
  const light=new THREE.SpotLight(color,power,20,.72,.54,1.35);
  light.position.set(...position);
  light.target.position.set(0,.93,0);
  light.castShadow=castShadow;
  if(castShadow) {
    light.shadow.mapSize.set(1024,1024);
    light.shadow.camera.near=.5;
    light.shadow.camera.far=14;
    light.shadow.bias=-.0002;
    light.shadow.normalBias=.019;
    light.shadow.radius=3;
  }
  scene.add(light,light.target);
  return light;
}

function radialTexture(stops) {
  const canvas=document.createElement("canvas");
  canvas.width=256;
  canvas.height=256;
  const ctx=canvas.getContext("2d");
  const grad=ctx.createRadialGradient(128,128,0,128,128,128);
  stops.forEach(([offset,color])=>grad.addColorStop(offset,color));
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,256,256);
  const image=new THREE.CanvasTexture(canvas);
  image.colorSpace=THREE.SRGBColorSpace;
  return image;
}

function flatGlow(scene,texture,size,position,opacity) {
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(size[0],size[1]),new THREE.MeshBasicMaterial({
    map:texture,transparent:true,depthWrite:false,toneMapped:false,opacity
  }));
  plane.rotation.x=-Math.PI/2;
  plane.position.set(...position);
  scene.add(plane);
  return plane;
}

function ring(scene,radius,width,y,color,opacity,start=0,length=Math.PI*2) {
  const object=new THREE.Mesh(new THREE.RingGeometry(radius,radius+width,112,1,start,length),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false,fog:false}));
  object.rotation.x=-Math.PI/2;
  object.position.y=y;
  scene.add(object);
  return object;
}

function createRoom(scene) {
  scene.fog = new THREE.FogExp2(lighting.studio.horizon,.16);
  scene.background = new THREE.Color(lighting.studio.horizon);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(76,76),new THREE.MeshStandardMaterial({color:0x223b31,roughness:.48,metalness:.22,envMapIntensity:.21}));
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.198;
  floor.receiveShadow=true;
  scene.add(floor);

  const floorLight=radialTexture([[0,"#456e53"],[.29,"#355540a0"],[.6,"#23573d62"],[1,"#20382a00"]]);
  flatGlow(scene,floorLight,[11,11],[0,-.194,0],.53);
  const shadowTexture=radialTexture([[0,"#03100a"],[.35,"#030f0ac4"],[.65,"#03100a74"],[1,"#04100b00"]]);
  flatGlow(scene,shadowTexture,[5.1,4.45],[0,-.192,.12],.79);

  const baseMat = new THREE.MeshPhysicalMaterial({color:0x162921,roughness:.34,metalness:.55,envMapIntensity:.57,clearcoat:.29,fog:false});
  const topMat = new THREE.MeshPhysicalMaterial({color:0x273e32,roughness:.44,metalness:.35,envMapIntensity:.43,clearcoat:.19,fog:false});
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.54,1.56,.164,112),baseMat);
  platform.position.y=-.108;
  platform.receiveShadow=true;
  scene.add(platform);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.525,1.54,.040,112),topMat);
  top.position.y=-.008;
  top.receiveShadow=true;
  scene.add(top);
  const bevel = new THREE.Mesh(new THREE.TorusGeometry(1.526,.017,12,112),new THREE.MeshStandardMaterial({color:0x3f6952,metalness:.48,roughness:.38,fog:false}));
  bevel.position.y=.008;
  bevel.rotation.x=Math.PI/2;
  scene.add(bevel);

  ring(scene,1.44,.009,.014,0x83c099,.23);
  ring(scene,1.655,.012,-.178,0xa8ffb5,.27);
  ring(scene,1.80,.006,-.178,0x8fca9f,.15);
  ring(scene,1.655,.018,-.176,0xe1e100,.75,4.2,.43);
  ring(scene,1.655,.015,-.176,0xe1e100,.54,1.16,.27);
  const contact = flatGlow(scene,shadowTexture,[1.85,1.23],[0,.015,.07],.70);
  contact.renderOrder=2;

  const strips=new THREE.MeshBasicMaterial({color:0x84c2a1,transparent:true,opacity:.28,toneMapped:false,fog:true});
  const frame = new THREE.MeshBasicMaterial({color:0x24392e,transparent:true,opacity:.38,toneMapped:false,fog:true});
  for(const side of [-1,1]){
    const part=new THREE.Mesh(new THREE.BoxGeometry(.043,3.9,.043),strips);
    part.position.set(side*3.43,1.65,-3.95);
    part.rotation.z=side*.08;
    scene.add(part);
    const inner=new THREE.Mesh(new THREE.BoxGeometry(.020,3.65,.027),frame);
    inner.position.set(side*3.11,1.65,-4.02);
    inner.rotation.z=side*.08;
    scene.add(inner);
    const lowRail=new THREE.Mesh(new THREE.BoxGeometry(2.0,.007,.009),frame);
    lowRail.position.set(side*2.66,-.092,-3.94);
    scene.add(lowRail);
  }

  const env=new THREE.HemisphereLight(0xe0fff0,0x676355,1.65);
  scene.add(env);
  const key=addLight(scene,0xffe6c7,lighting.studio.key,[-3.4,5.0,4.0],true);
  const fill=addLight(scene,0xd8f6e8,lighting.studio.fill,[3.7,3.3,4.5]);
  const rim=addLight(scene,0x9fffd1,lighting.studio.edge,[2.6,4.1,-2.8]);
  return {floor,contact,strips,env,key,fill,rim};
}

export async function createShowroom(host,{reducedMotion=false,onLost,onRestored,onOrbit,onReset}={}) {
  const scene=new THREE.Scene();
  const canvas=document.createElement("canvas");
  const gl=canvas.getContext("webgl2",{alpha:true,antialias:true,powerPreference:"high-performance"});
  if (!gl) throw new Error("WebGL 2 is unavailable");
  const renderer=new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.55));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  canvas.tabIndex=0;
  canvas.setAttribute("aria-label","Interactive Auri model. Arrow keys orbit, plus and minus keys zoom, Home resets camera.");
  canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();onLost?.();});
  canvas.addEventListener("webglcontextrestored",()=>onRestored?.());

  const environment=new RoomEnvironment();
  const generator=new THREE.PMREMGenerator(renderer);
  const reflection=generator.fromScene(environment,.045);
  scene.environment=reflection.texture;
  scene.environmentIntensity=.72;
  environment.dispose();
  generator.dispose();

  const room=createRoom(scene);
  const rig=await createAuri();
  // Fog blends the distant room into the horizon without tinting the hero.
  rig.root.traverse(object=>{
    if(object.material) object.material.fog=false;
  });
  scene.add(rig.root);
  const animate=createAnimator(rig);
  const context=createContextBoard(scene);
  const camera=new THREE.PerspectiveCamera(33,1,.10,60);
  const controls=new OrbitControls(camera,canvas);
  controls.target.set(0,1.23,0);
  controls.enableDamping=true;
  controls.dampingFactor=.065;
  controls.enablePan=false;
  controls.minDistance=3.40;
  controls.maxDistance=9.7;
  controls.minPolarAngle=.80;
  controls.maxPolarAngle=1.56;
  controls.rotateSpeed=.64;
  controls.zoomSpeed=.68;
  controls.autoRotateSpeed=.82;
  controls.touches.ONE=THREE.TOUCH.ROTATE;
  controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;

  const spherical=new THREE.Spherical(6.1,1.385,cameras.quarter);
  const offset=new THREE.Vector3();
  let zoomDistance=6.1;
  let transition;
  let performance={mode:"motion",value:"idle"};
  let useCase;
  let light=lighting.studio;
  let last=0;
  let paused=reducedMotion;
  let spin=false;
  let currentPreset="quarter";
  let started=false;

  function putCamera() {
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    controls.update();
  }
  putCamera();
  host.append(canvas);

  function readCamera() {
    spherical.setFromVector3(offset.copy(camera.position).sub(controls.target));
  }

  function queue({angle, radius, phi, framing, duration=.68}) {
    readCamera();
    const targetAngle=angle ?? spherical.theta;
    const arc=Math.atan2(Math.sin(targetAngle-spherical.theta),Math.cos(targetAngle-spherical.theta));
    transition={
      t:0,duration:reducedMotion ? .001 : duration,
      from:spherical.clone(),to:new THREE.Spherical(radius ?? spherical.radius,phi ?? spherical.phi,spherical.theta+arc),
      x:controls.target.x,endX:framing ?? controls.target.x,
    };
  }

  function setCamera(value, reset=false) {
    currentPreset=value;
    queue({angle:cameras[value],radius:reset ? zoomDistance : undefined,phi:1.385,framing:reset ? 0 : undefined});
  }

  function resize() {
    const {width,height}=host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    const nextDistance=6.19*Math.max(1,.89/camera.aspect);
    if (Math.abs(zoomDistance-nextDistance)>.1 && started) {
      queue({radius:THREE.MathUtils.clamp(nextDistance+(camera.position.distanceTo(controls.target)-zoomDistance),3.4,9.7),framing:useCase && camera.aspect>1.2 ? -.15 : 0,duration:.32});
    }
    zoomDistance=nextDistance;
  }
  const observer=new ResizeObserver(resize);
  observer.observe(host);
  resize();
  if (!reducedMotion) {
    spherical.set(zoomDistance*1.12,1.34,.73);
    putCamera();
  } else {
    spherical.radius=zoomDistance;
    putCamera();
  }
  queue({angle:cameras.quarter,radius:zoomDistance,phi:1.385,duration:1.25});
  started=true;

  controls.addEventListener("start",()=>{
    transition=undefined;
    if(currentPreset){currentPreset=null;onOrbit?.();}
  });

  function zoom(multiplier) {
    const current=transition?.to.radius ?? camera.position.distanceTo(controls.target);
    queue({radius:THREE.MathUtils.clamp(current*multiplier,3.4,9.7),duration:.27});
  }

  canvas.addEventListener("keydown",event=>{
    const options = {ArrowLeft:[-.19,0],ArrowRight:[.19,0],ArrowUp:[0,-.10],ArrowDown:[0,.10]};
    if (options[event.key]) {
      event.preventDefault();
      readCamera();
      const [theta,phi]=options[event.key];
      currentPreset=null;
      onOrbit?.();
      queue({angle:spherical.theta+theta,phi:THREE.MathUtils.clamp(spherical.phi+phi,.80,1.56),duration:.28});
    } else if (event.key==="+" || event.key==="=" || event.key==="-") {
      event.preventDefault();
      zoom(event.key==="-" ? 1.19 : .84);
    } else if(event.key==="Home") {
      event.preventDefault();
      onReset?.();
    }
  });

  const roomColor=new THREE.Color(light.room);
  const horizonColor=new THREE.Color(light.horizon);
  renderer.toneMappingExposure=light.exposure;
  room.floor.material.color.copy(roomColor);
  room.env.intensity=light.ambient;
  const stripColor=new THREE.Color(light.strip);
  function frame(timestamp) {
    const delta=Math.min(.2,last ? (timestamp-last)/1000 : .018);
    last=timestamp;
    if(transition) {
      transition.t=Math.min(1,transition.t+delta/transition.duration);
      const ease=transition.t*transition.t*(3-2*transition.t);
      spherical.radius=THREE.MathUtils.lerp(transition.from.radius,transition.to.radius,ease);
      spherical.phi=THREE.MathUtils.lerp(transition.from.phi,transition.to.phi,ease);
      spherical.theta=THREE.MathUtils.lerp(transition.from.theta,transition.to.theta,ease);
      controls.target.x=THREE.MathUtils.lerp(transition.x,transition.endX,ease);
      controls.autoRotate=false;
      putCamera();
      if (transition.t===1) transition=undefined;
    } else {
      controls.autoRotate=spin;
      controls.update(delta);
    }
    animate(delta,performance,paused);
    room.contact.material.opacity=Math.max(.26,.73-rig.root.position.y*1.5);
    context.update(delta,camera.aspect);
    renderer.toneMappingExposure=damp(renderer.toneMappingExposure,light.exposure,5,delta);
    room.key.intensity=damp(room.key.intensity,light.key,5,delta);
    room.fill.intensity=damp(room.fill.intensity,light.fill,5,delta);
    room.rim.intensity=damp(room.rim.intensity,light.edge,5,delta);
    room.env.intensity=damp(room.env.intensity,light.ambient,5,delta);
    room.floor.material.color.lerp(roomColor,1-Math.exp(-delta*5));
    room.strips.color.lerp(stripColor,1-Math.exp(-delta*5));
    scene.background.lerp(horizonColor,1-Math.exp(-delta*5));
    scene.fog.color.copy(scene.background);
    renderer.render(scene,camera);
  }
  frame(performanceNow());
  renderer.setAnimationLoop(frame);

  return {
    setPerformance(value,sceneValue){
      performance=value;
      if(useCase!==sceneValue){
        useCase=sceneValue;
        context.set(sceneValue);
        queue({angle:sceneValue ? .24 : undefined,framing:sceneValue && camera.aspect>1.2 ? -.15 : 0,duration:.62});
      }
    },
    setCamera,
    setLighting(key){
      light=lighting[key];
      roomColor.set(light.room);
      horizonColor.set(light.horizon);
      stripColor.set(light.strip);
      host.parentElement.style.background=`radial-gradient(ellipse at 52% 53%,${light.background},#090f0d 84%)`;
    },
    setPaused(value){paused=value;},
    setSpin(value){
      spin=value;
      if(value && currentPreset){currentPreset=null;onOrbit?.();}
    },
    zoom,
    capture(){
      renderer.render(scene,camera);
      const output=document.createElement("canvas");
      output.width=canvas.width;
      output.height=canvas.height;
      const ctx=output.getContext("2d");
      const gradient=ctx.createRadialGradient(output.width*.52,output.height*.53,0,output.width*.52,output.height*.53,output.width*.62);
      gradient.addColorStop(0,light.background);
      gradient.addColorStop(1,"#090f0d");
      ctx.fillStyle=gradient;
      ctx.fillRect(0,0,output.width,output.height);
      ctx.drawImage(canvas,0,0);
      return new Promise(resolve=>output.toBlob(resolve,"image/png"));
    }
  };
}

function performanceNow(){return window.performance.now();}
