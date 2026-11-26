import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const cases = {
  website:{name:"Website / app",icon:"window",title:"Website assistant",summary:"Guide a visitor to the right service.",detail:"Example · New visitor chat",performance:{mode:"poses",value:"explaining"},lines:["How can I help?","Explore our services","Build a roadmap"],color:"#A8FFB5"},
  social:{name:"Social media",icon:"heart",title:"Social mascot",summary:"Give recurring content a familiar face.",detail:"Example · Studio post",performance:{mode:"expressions",value:"winking"},lines:["Studio post","Meet Auri",""],color:"#F7F5EE"},
  marketing:{name:"Marketing / ads",icon:"target",title:"Campaign assistant",summary:"Introduce an offer and guide the next action.",detail:"Example · Campaign board",performance:{mode:"motion",value:"pointing"},lines:["Campaign board","Offer · Growth package","CTA · Build my roadmap"],color:"#E1E100"},
  support:{name:"Customer support",icon:"headset",title:"Support helper",summary:"Help a customer find the right answer.",detail:"Example · Help workspace",performance:{mode:"poses",value:"support"},lines:["Help workspace","Menu setup","Hosting and domains"],color:"#A8FFB5"},
  growth:{name:"Growth strategy",icon:"chart",title:"Growth guide",summary:"Present milestones and the next step.",detail:"Example · Growth roadmap",performance:{mode:"poses",value:"growth"},lines:["Growth roadmap","Visibility → Acquisition","Next · Publish your menu"],color:"#E1E100"}
};

function drawContext(texture, board) {
  const context = texture.image.getContext("2d");
  context.clearRect(0,0,640,400);
  context.fillStyle = "#10261f";
  context.fillRect(0,0,640,400);
  context.strokeStyle = "#416455";
  context.lineWidth = 2;
  context.strokeRect(1,1,638,398);
  context.fillStyle = "#2b4338";
  context.fillRect(0,0,640,56);
  for (let i=0;i<3;i++) {
    context.fillStyle = i === 0 ? board.color : "#709487";
    context.beginPath();
    context.arc(25+18*i,29,4.5,0,Math.PI*2);
    context.fill();
  }
  context.fillStyle = "#f7f5ee";
  context.font = "600 32px Inter, sans-serif";
  context.fillText(board.lines[0],27,111);
  context.fillStyle = board.color;
  context.font = "600 22px Inter, sans-serif";
  context.fillText(board.lines[1],29,166);
  context.fillStyle = "#adc2b7";
  context.font = "500 18px Inter, sans-serif";
  context.fillText(board.lines[2],29,207);
  if (board === cases.growth || board === cases.marketing) {
    const heights = [20,32,30,51,47,70,87,98,121,135,154];
    for (let i=0;i<heights.length;i++) {
      context.fillStyle = i > 7 ? board.color : "#365746";
      context.fillRect(29+i*53,361-heights[i],21,heights[i]);
    }
  } else if(board === cases.social) {
    context.strokeStyle = board.color;
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(320,343);
    context.bezierCurveTo(274,304,202,266,215,222);
    context.bezierCurveTo(224,187,275,179,320,224);
    context.bezierCurveTo(365,179,416,187,425,222);
    context.bezierCurveTo(438,266,366,304,320,343);
    context.stroke();
  } else {
    for (let i=0;i<3;i++) {
      context.fillStyle = i===0 ? "#345645" : "#233e33";
      context.beginPath();
      context.roundRect(30+i*31,234+i*43,390-i*10,24,9);
      context.fill();
    }
  }
  texture.needsUpdate = true;
}

export function createContextBoard(scene) {
  const canvas = document.createElement("canvas");
  canvas.width=640;
  canvas.height=400;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group();
  scene.add(group);
  const backing = new THREE.Mesh(new RoundedBoxGeometry(1.96,1.24,.09,4,.059),new THREE.MeshStandardMaterial({color:0x18352a,metalness:.4,roughness:.37}));
  group.add(backing);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.83,1.145),new THREE.MeshBasicMaterial({map:texture,toneMapped:false,transparent:true,fog:false}));
  plane.position.z=.048;
  group.add(plane);
  let current;
  let desired;
  return {
    set(value) {
      desired=value;
      if (value && value !== current) drawContext(texture,cases[value]);
      current=value;
    },
    update(delta, aspect) {
      const scale = THREE.MathUtils.damp(group.scale.x,desired ? (aspect < 1.05 ? .61 : 1) : 0,8,delta);
      group.scale.setScalar(scale);
      group.visible=scale>.025;
      group.position.set(aspect < 1.05 ? -.82 : -1.66,aspect < 1.05 ? 1.30 : 1.57,-.82);
      group.rotation.y=.23;
    }
  };
}
