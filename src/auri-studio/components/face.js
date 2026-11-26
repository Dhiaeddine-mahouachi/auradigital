import * as THREE from "three";

const { lerp } = THREE.MathUtils;
const PI = Math.PI;
const W = 512;
const H = 384;
const COUNT = 32;

function oval(w, h, angle = 0, y = 0) {
  return Array.from({ length: COUNT }, (_, i) => {
    const t = i * 2 * PI / COUNT;
    const x = Math.cos(t) * w;
    const v = Math.sin(t) * h;
    return [x * Math.cos(angle) - v * Math.sin(angle), x * Math.sin(angle) + v * Math.cos(angle) + y];
  });
}

function outline(points) {
  const segments = points.map((point, i) => {
    const next = points[(i + 1) % points.length];
    return Math.hypot(point[0] - next[0], point[1] - next[1]);
  });
  const perimeter = segments.reduce((a, b) => a + b, 0);
  return Array.from({ length: COUNT }, (_, i) => {
    let d = i * perimeter / COUNT;
    let j = 0;
    while (d > segments[j] && j < segments.length - 1) d -= segments[j++];
    const a = points[j];
    const b = points[(j + 1) % points.length];
    return [lerp(a[0], b[0], d / segments[j]), lerp(a[1], b[1], d / segments[j])];
  });
}

const crescent = outline([[32,11],[30,-2],[20,-15],[9,-22],[-9,-22],[-21,-16],[-30,-3],[-33,11],[-27,16],[-15,10],[0,6],[14,10],[26,16]]);
const chevron = outline([[30,1],[25,-6],[-20,-30],[-29,-28],[-32,-21],[-25,-13],[-1,1],[-25,16],[-30,23],[-27,30],[-21,31],[25,10]]);
const mirroredChevron = chevron.map(([x,y]) => [-x,y]).reverse();
const half = outline([[31,-10],[15,-9],[-15,-9],[-31,-10],[-28,0],[-23,10],[-13,17],[0,20],[13,17],[23,10],[28,0]]);
const looks = {
  gentle: [oval(24,37,0.03), oval(24,37,-0.02), 0, 0, 0.95],
  happy: [crescent, crescent, 0, 0, 1.12],
  thinking: [oval(25,6,0,5), oval(24,37,-0.08,-4), 1, 9, 0.85],
  excited: [chevron, mirroredChevron, 1, 0, 1.28],
  surprised: [oval(27,38), oval(27,38), 2, 0, 1.1],
  confident: [half, half, 0, 3, 0.9],
  winking: [oval(25,35,0.03), mirroredChevron, 0, 3, 1.05]
};

export function makeFace() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const eyes = looks.gentle.slice(0, 2).map(points => points.map(point => [...point]));
  let openness = 0;
  let offset = 0;
  let glow = 0.95;
  let signature = "";

  function drawEye(points, x, y, blink) {
    ctx.beginPath();
    points.forEach(([px,py], i) => {
      const method = i ? "lineTo" : "moveTo";
      ctx[method](x + px, y + py * blink);
    });
    ctx.closePath();
    ctx.fill();
  }

  function draw(expression, delta, time, { blink = true, talk = 0, pulse = 0 } = {}) {
    const target = looks[expression] ?? looks.gentle;
    const blend = 1 - Math.exp(-delta * 12);
    for (let eye = 0; eye < 2; eye++) {
      eyes[eye].forEach((point, i) => {
        point[0] = lerp(point[0], target[eye][i][0], blend);
        point[1] = lerp(point[1], target[eye][i][1], blend);
      });
    }
    openness = lerp(openness, target[2], blend);
    offset = lerp(offset, target[3], blend);
    glow = lerp(glow, target[4], blend);
    const phase = (time + 1.25) % 4.9;
    const blinkScale = blink ? 1 - 0.92 * Math.exp(-Math.pow((phase - 4.65) / 0.078, 2)) : 1;
    const gaze = blink ? 2.2 * Math.sin(time * 0.91) : 0;
    const mouthHeight = openness * 5 + talk;
    const nextSignature = [eyes.flat(2).map(v => v.toFixed(1)).join(","), offset, glow + pulse, gaze, blinkScale, mouthHeight].map(v => typeof v === "number" ? v.toFixed(2) : v).join("/");
    if (signature === nextSignature) return;
    signature = nextSignature;

    ctx.clearRect(0,0,W,H);
    const eyeY = 167;
    ctx.fillStyle = "#a8ffb5";
    ctx.shadowColor = "rgba(108, 255, 170, 0.84)";
    ctx.shadowBlur = 26 * (glow + pulse);
    drawEye(eyes[0], 165 + gaze, eyeY, blinkScale);
    drawEye(eyes[1], 347 + gaze, eyeY, blinkScale);
    ctx.shadowBlur = 13;
    ctx.strokeStyle = "#a8ffb5";
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    const y = 226;
    const x = 256 + offset;
    ctx.beginPath();
    if (mouthHeight < 2.3) {
      ctx.moveTo(x - 15, y);
      ctx.quadraticCurveTo(x, y + 17, x + 15, y);
      ctx.stroke();
    } else {
      ctx.ellipse(x,y + 3,Math.max(9,16 - openness * 3),mouthHeight,0,0,2 * PI);
      ctx.fill();
    }
    texture.needsUpdate = true;
  }

  draw("gentle",1,0,{blink:false});
  return { texture, draw };
}
