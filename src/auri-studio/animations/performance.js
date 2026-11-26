import * as THREE from "three";

const { damp } = THREE.MathUtils;
const TAU = Math.PI * 2;
const sin = Math.sin;

const poses = {
  neutral: {},
  welcome: { right:[.98,-.18,1.58,-.16], face:"gentle" },
  explaining: { left:[.68,-.62,.32,-.54], right:[.49,-.44,.24,-.66], face:"gentle" },
  growth: { left:[.36,-.50,.14,-.55], right:[.71,-.52,.92,-.36], face:"happy", prop:"card" },
  working: { left:[.11,-1.03,.03,-.35], right:[.11,-1.03,.03,-.35], nod:.15, face:"confident", prop:"laptop" },
  support: { left:[.9,-.21,1.77,-.30], right:[.43,-.60,.15,-.54], tilt:.09, face:"gentle", prop:"headset" },
  idea: { right:[.9,-.24,1.58,-.23], left:[.22,-.32,.31,-.47], tilt:-.12, face:"winking", prop:"bulb", point:true },
};

const expressionReactions = {
  happy: [.05,.02], thinking:[-.15,.09], excited:[.05,-.10],
  surprised:[0,-.12], confident:[-.09,-.03], winking:[.11,.02]
};

function state({mode, value}, t) {
  let pose = "neutral";
  let face = "gentle";
  let prop;
  let tilt = 0, nod = 0, yaw = 0, rise = 0, talk = 0, pulse = 0, wave = 0, action = 0;
  let point = false;
  if (mode === "expressions") {
    face = value;
    [tilt,nod] = expressionReactions[value];
  } else if (mode === "poses") {
    pose = value;
    if (value === "welcome") wave = .18 * sin(t * TAU * .79);
    if (value === "working") action = .055 * sin(t * TAU * 1.43);
  } else if (mode === "motion") {
    switch(value) {
      case "greeting":
        pose="welcome"; wave=.27 * sin(t * TAU * .85); tilt=-.11; face="happy"; break;
      case "thinking":
        face="thinking"; tilt=-.18+.027*sin(t*2.1); nod=.10; yaw=.1*sin(t*1.3); break;
      case "talking":
        pose="explaining"; nod=.065*sin(t*4); talk=3.5+5*Math.pow(sin(t*5.1),2); action=.16*sin(t*3.4); break;
      case "listening":
        nod=.075*Math.pow(sin(t*1.27),7); tilt=.075; yaw=.05*sin(t*1.1); break;
      case "working":
        pose="working"; action=.073*sin(t*TAU*1.8); yaw=.065*sin(t*1.3); break;
      case "processing":
        pose="working"; face="thinking"; pulse=.47*(1+sin(t*TAU*.83)); action=.045*sin(t*TAU*1.4); break;
      case "celebrating":
        pose="welcome"; face="excited"; rise=.12*Math.pow((1+sin(t*TAU*.9))/2,3); wave=.25*sin(t*TAU*.9); action=.20*sin(t*TAU*.9); break;
      case "pointing":
        pose="idea"; prop="none"; face="confident"; wave=.06*sin(t*TAU*.55); point=true; break;
      case "floating":
        rise=.25+.075*sin(t*TAU*.45); yaw=.17*sin(t*TAU*.32); tilt=.055*sin(t*TAU*.39); pose="explaining"; break;
      default:
        break;
    }
  }
  const p = poses[pose];
  return {
    left:p.left ?? [.23,-.05,.09,-.14],
    right:p.right ?? [.23,-.05,.09,-.14],
    face:face === "gentle" ? (p.face ?? face) : face,
    prop:prop ?? p.prop, tilt:tilt+(p.tilt ?? 0), nod:nod+(p.nod ?? 0),
    point:point || p.point, yaw,rise,talk,pulse,wave,action,
    celebrate:mode === "motion" && value === "celebrating"
  };
}

export function createAnimator(rig) {
  let time = 0;
  const propNames = ["card","laptop","headset","bulb"];
  propNames.forEach(name => rig.props[name].scale.setScalar(0));
  const rightHand = new THREE.Vector3();
  const targetCardPosition = new THREE.Vector3();
  return function animate(delta, performance, paused) {
    if (!paused) time += delta;
    const p = state(performance,time);
    const cycle = (coefficient, speed) => paused ? 0 : coefficient * sin(time * speed);
    const approach = (from,to,speed=8) => damp(from,to,speed,delta);

    rig.root.position.y = approach(rig.root.position.y,.028 + p.rise + cycle(.012,2.05));
    rig.root.rotation.y = approach(rig.root.rotation.y,p.yaw);
    rig.torso.rotation.x = approach(rig.torso.rotation.x,p.nod*.18 + cycle(.014,2.05));
    rig.torso.rotation.z = approach(rig.torso.rotation.z,p.tilt*.32 + cycle(.011,1.28));
    rig.head.rotation.x = approach(rig.head.rotation.x,p.nod + cycle(.024,1.49));
    rig.head.rotation.y = approach(rig.head.rotation.y,-p.yaw*.41 + cycle(.035,1.17));
    rig.head.rotation.z = approach(rig.head.rotation.z,p.tilt + cycle(.020,1.27));

    rig.arms.forEach(({arm,elbow,hand,fingers},i) => {
      const side = i ? 1 : -1;
      const [z,x,elbowZ,elbowX] = i ? p.right : p.left;
      const bothRaised = p.celebrate && !i;
      arm.rotation.z = approach(arm.rotation.z,side * (bothRaised ? 1.12 : z) + cycle(.018,2));
      arm.rotation.x = approach(arm.rotation.x,x + p.action * side);
      elbow.rotation.z = approach(elbow.rotation.z,side * (bothRaised ? 1.57 : elbowZ) + (i ? p.wave : 0));
      elbow.rotation.x = approach(elbow.rotation.x,elbowX + p.action * .63 * side);
      hand.rotation.z = approach(hand.rotation.z,i ? p.wave * .8 : -.05);
      hand.rotation.x = approach(hand.rotation.x,i && p.point ? -.19 : -.07);
      for (let finger = 0; finger < fingers.length; finger++) {
        fingers[finger].rotation.x = approach(fingers[finger].rotation.x,i && p.point && finger !== 1 ? -1.55 : -.18);
      }
    });

    rig.legs.forEach(({leg,shin},i) => {
      const side = i ? 1 : -1;
      leg.rotation.z = approach(leg.rotation.z,side * (p.rise * .29 + .035));
      leg.rotation.x = approach(leg.rotation.x,p.rise * .48 * side);
      shin.rotation.x = approach(shin.rotation.x,p.rise * .32);
    });

    rig.root.updateMatrixWorld(true);
    rig.arms[1].hand.getWorldPosition(rightHand);
    targetCardPosition.copy(rightHand);
    rig.root.worldToLocal(targetCardPosition);
    targetCardPosition.x += .085;
    targetCardPosition.y += .18;
    targetCardPosition.z += .13;
    rig.props.card.position.lerp(targetCardPosition,1-Math.exp(-delta*9));
    rig.props.card.rotation.z = cycle(.07,2.4) - .08;
    rig.props.bulb.position.y = 2.53 + cycle(.045,3.2);
    rig.props.rays.rotation.z = cycle(.075,2.2);
    for (const name of propNames) {
      const object = rig.props[name];
      const scale = approach(object.scale.x,p.prop === name ? 1 : 0,13);
      object.scale.setScalar(scale);
      object.visible = scale > .015;
    }
    rig.mats.yellow.emissiveIntensity = .34 + p.pulse * .47;
    rig.face.draw(p.face,delta,time,{blink:!paused,talk:p.talk,pulse:p.pulse});
  };
}
