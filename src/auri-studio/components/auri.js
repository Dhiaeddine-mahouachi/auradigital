import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import logoAsset from "../../../auri-preview/assets/gd-mark.png";
import { makeFace } from "./face.js";

const PI = Math.PI;
const signedPower = (x, e) => Math.sign(x) * Math.pow(Math.abs(x), e);
const material = options => new THREE.MeshPhysicalMaterial(options);

function shellGeometry(x, y, z, exponent = 3) {
  const geometry = new THREE.SphereGeometry(1, 52, 36);
  const positions = geometry.attributes.position;
  const power = 2 / exponent;
  for (let i = 0; i < positions.count; i++) {
    positions.setXYZ(i, x * signedPower(positions.getX(i), power), y * signedPower(positions.getY(i), power), z * signedPower(positions.getZ(i), power));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function visorGeometry(layer = 0) {
  // Match the contour of the head shell while keeping planar UVs for the face.
  const width = .664, height = .46, power = 3.4, segments = 80, rings = 18;
  const positions = [], uvs = [], index = [];
  function add(x,y) {
    const z = .61 * Math.pow(1 - Math.pow(Math.abs(x)/.79,3.15) - Math.pow(Math.abs(y)/.58,3.15), 1/3.15);
    positions.push(x,y,z + layer);
    uvs.push(.5 + x/(2 * width),.5 + y/(2 * height));
  }
  add(0,0);
  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < segments; i++) {
      const angle = i * 2 * PI / segments;
      const radial = ring / rings;
      add(width * radial * signedPower(Math.cos(angle), 2 / power), height * radial * signedPower(Math.sin(angle), 2 / power));
    }
  }
  for (let i = 0; i < segments; i++) {
    const following = (i + 1) % segments;
    index.push(0, 1 + i, 1 + following);
    for (let r = 1; r < rings; r++) {
      const low = 1 + (r - 1) * segments;
      const high = low + segments;
      index.push(low + i, high + i, high + following, low + i, high + following, low + following);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

function mesh(parent, geometry, mat, position = [0,0,0], shadow = true) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = shadow;
  object.receiveShadow = false;
  parent.add(object);
  return object;
}

function group(parent, position = [0,0,0]) {
  const object = new THREE.Group();
  object.position.set(...position);
  parent.add(object);
  return object;
}

function box(parent, size, radius, mat, position, shadow) {
  return mesh(parent,new RoundedBoxGeometry(...size,4,radius),mat,position,shadow);
}

function egg(parent, size, mat, position, exponent = 2.3, shadow) {
  return mesh(parent,shellGeometry(...size,exponent),mat,position,shadow);
}

function tube(parent, points, radius, mat) {
  const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
  return mesh(parent,new THREE.TubeGeometry(curve,32,radius,10,false),mat,[0,0,0],false);
}

function emblem(parent, texture, width, position, rotationY = 0, color = 0xfff8e8) {
  const badge = mesh(parent,new THREE.PlaneGeometry(width,width * .54),new THREE.MeshBasicMaterial({
    map:texture,color,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false
  }),position,false);
  badge.rotation.y = rotationY;
  return badge;
}

function buildHand(parent, side, mats) {
  const hand = group(parent,[0,-.306,0]);
  egg(hand,[.108,.105,.095],mats.green,[0,0,0],2.6);
  egg(hand,[.096,.103,.067],mats.cream,[0,-.044,.038],2.4);
  const fingers = [];
  for (let i = 0; i < 3; i++) {
    const finger = group(hand,[(i - 1) * .054,-.103,.046]);
    egg(finger,[.026,i === 1 ? .057 : .049,.027],mats.cream,[0,-.027,0]);
    fingers.push(finger);
  }
  const thumb = egg(hand,[.04,.066,.04],mats.cream,[-side * .091,-.053,.043]);
  thumb.rotation.z = -side * .55;
  return {hand,fingers};
}

function makeArm(torso, s, mats) {
  const arm = group(torso,[s * .48,.315,0]);
  egg(arm,[.145,.15,.146],mats.green,[0,-.01,0],2.4);
  egg(arm,[.128,.177,.132],mats.cream,[0,-.119,0],2.65);
  const elbow = group(arm,[0,-.255,0]);
  egg(elbow,[.105,.064,.109],mats.dark,[0,.006,0],2.5);
  egg(elbow,[.118,.153,.119],mats.cream,[0,-.109,0],2.58);
  egg(elbow,[.104,.052,.105],mats.green,[0,-.225,0],2.3);
  const {hand,fingers} = buildHand(elbow,s,mats);
  return {arm,elbow,hand,fingers};
}

function makeLeg(root,side,mats) {
  const leg = group(root,[side * .245,.695,-.015]);
  egg(leg,[.159,.156,.148],mats.green,[0,.008,0]);
  egg(leg,[.166,.182,.160],mats.cream,[0,-.097,0],2.7);
  const shin = group(leg,[0,-.245,0]);
  egg(shin,[.15,.050,.15],mats.dark,[0,0,0],2.6);
  egg(shin,[.166,.181,.162],mats.cream,[0,-.131,.001],2.8);
  box(shin,[.346,.11,.441],.053,mats.green,[0,-.369,.075]);
  egg(shin,[.173,.103,.217],mats.cream,[0,-.289,.071],3.1);
  return {leg,shin};
}

function makeProps(root, head, logo, mats) {
  const card = group(root,[.73,1.53,.45]);
  box(card,[.43,.39,.048],.055,mats.yellow,[0,0,0],false);
  for (let i = 0; i < 3; i++) {
    const h = .085 + i * .051;
    box(card,[.055,h,.025],.012,mats.green,[(i - 1) * .082,-.12 + h / 2,.029],false);
  }

  const laptop = group(root,[0,.94,.68]);
  box(laptop,[.67,.039,.43],.017,mats.dark,[0,0,0]);
  const screen = group(laptop,[0,.023,-.199]);
  screen.rotation.x = .19;
  box(screen,[.65,.40,.043],.026,mats.green,[0,.19,0]);
  box(screen,[.59,.345,.014],.012,mats.dark,[0,.193,-.024],false);
  emblem(screen,logo,.18,[0,.19,.024],0,0xe1e100);
  for (let i = 0; i < 3; i++) {
    box(laptop,[.47,.01,.016],.003,mats.trim,[0,.023,-.07 + i * .036],false);
  }

  const headset = group(head,[0,.006,0]);
  tube(headset,[[-.83,.02,0],[-.72,.34,-.01],[-.46,.60,-.04],[0,.672,-.055],[.49,.59,-.03],[.74,.34,-.005],[.84,.02,0]],.042,mats.dark);
  for (const side of [-1,1]) {
    const ear = mesh(headset,new THREE.CylinderGeometry(.133,.133,.065,28),mats.yellow,[side * .928,0,0],false);
    ear.rotation.z = PI/2;
  }
  tube(headset,[[.91,-.05,.06],[.92,-.21,.23],[.76,-.30,.45],[.58,-.30,.59]],.023,mats.dark);
  egg(headset,[.076,.047,.045],mats.green,[.59,-.30,.59],2.4,false);

  const bulb = group(root,[1.14,2.51,.28]);
  egg(bulb,[.14,.17,.14],mats.yellow,[0,.04,0],2.1,false);
  for (let i = 0; i < 3; i++) mesh(bulb,new THREE.CylinderGeometry(.058,.063,.025,20),mats.dark,[0,-.096 - i * .025,0],false);
  const rays = group(bulb,[0,.045,0]);
  for (let i = 0; i < 5; i++) {
    const t = .07 + i * (PI - .14)/4;
    const ray = box(rays,[.105,.023,.027],.01,mats.yellow,[.244 * Math.cos(t),.24 * Math.sin(t),0],false);
    ray.rotation.z = t;
  }
  return {card,laptop,headset,bulb,rays};
}

export async function createAuri() {
  const logo = await new THREE.TextureLoader().loadAsync(logoAsset);
  logo.colorSpace = THREE.SRGBColorSpace;
  const face = makeFace();
  const mats = {
    cream:material({color:0xf7f5ee,roughness:.3,metalness:.025,clearcoat:.58,clearcoatRoughness:.21}),
    green:material({color:0x003d2b,roughness:.285,metalness:.22,clearcoat:.63,clearcoatRoughness:.19}),
    trim:material({color:0x263a31,roughness:.32,metalness:.44,clearcoat:.35}),
    dark:material({color:0x0b0b0b,roughness:.32,metalness:.24,clearcoat:.28}),
    glass:material({color:0x040707,roughness:.18,metalness:.18,clearcoat:.64,clearcoatRoughness:.21,envMapIntensity:.40}),
    yellow:material({color:0xe1e100,roughness:.27,metalness:.06,clearcoat:.32,emissive:0xd1d700,emissiveIntensity:.33}),
  };
  const root = new THREE.Group();
  root.name = "Auri";
  const torso = group(root,[0,1.095,0]);
  box(torso,[.95,.81,.76],.28,mats.green,[0,.09,0]);
  egg(torso,[.421,.205,.309],mats.cream,[0,-.292,-.005],3.0);
  box(torso,[.645,.51,.087],.118,mats.dark,[0,.10,.383],false);
  const chest = box(torso,[.596,.459,.088],.103,mats.green,[0,.10,.413],false);
  const bars = group(chest,[0,-.003,.048]);
  for (let i = 0; i < 3; i++) {
    const h = .082 + i * .065;
    box(bars,[.073,h,.021],.014,mats.yellow,[(i - 1) * .099,-.117 + h/2,.006],false);
  }
  box(torso,[.60,.42,.082],.11,mats.dark,[0,.095,-.38],false);
  emblem(torso,logo,.28,[0,.105,-.429],PI,0xe1e100);
  egg(torso,[.257,.101,.225],mats.trim,[0,.505,0],2.25);
  const headPivot = group(torso,[0,.532,.033]);
  const head = group(headPivot,[0,.503,.028]);
  egg(head,[.79,.58,.61],mats.cream,[0,0,0],3.15);
  const headRim = mesh(head,visorGeometry(.011),mats.trim,[0,0,0],false);
  headRim.scale.set(1.024,1.031,.975);
  mesh(head,visorGeometry(.032),mats.glass,[0,0,0],false);
  mesh(head,visorGeometry(.036),new THREE.MeshBasicMaterial({map:face.texture,transparent:true,depthWrite:false,toneMapped:false}),[0,0,0],false).renderOrder = 3;
  for (const side of [-1,1]) {
    const module = group(head,[side * .759,-.035,-.017]);
    const ring = mesh(module,new THREE.CylinderGeometry(.222,.237,.093,44),mats.dark);
    ring.rotation.z = -side * PI/2;
    const housing = mesh(module,new THREE.CylinderGeometry(.202,.22,.112,44),mats.green,[side * .060,0,0]);
    housing.rotation.z = -side * PI/2;
    egg(module,[.042,.183,.183],mats.green,[side * .115,0,0],2.35,false);
    emblem(module,logo,.221,[side * .158,0,0],side * PI/2);
  }
  const arms = [-1,1].map(side => makeArm(torso,side,mats));
  const legs = [-1,1].map(side => makeLeg(root,side,mats));
  const props = makeProps(root,head,logo,mats);
  return {root,torso,head:headPivot,arms,legs,props,face,mats};
}
