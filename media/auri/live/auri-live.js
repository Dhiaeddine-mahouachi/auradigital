// Auri live character — layered SVG companion (no dependencies, no WebGL).
//
// Why SVG and not the GLB: the reference is a flattened render, and the
// existing WebGL viewer is switched off because it froze tabs on some
// graphics drivers (see media/auri/character.js). A layered vector rig gives
// real, separately animated parts (head, face, eyes, arms, body, belly
// screen, legs, side lights), stays sharp at every size and costs a few
// attribute writes per frame.
//
//   import { createAuri } from '/media/auri/live/auri-live.js';
//   const auri = createAuri(host, { size: 220 });
//   auri.setState('thinking');           // idle | welcome | thinking | speaking | working
//                                        // celebrate | help | sleep | error
//   auri.setScreen('crm');               // logo | crm | analytics | website | marketing
//                                        // automation | support | roadmap | security
//   await auri.run(() => fetch(...), { busy: 'thinking' });
//   auri.destroy();

import {
  STATES, EXPRESSIONS, SCREEN_MODES, TRANSIENT, STATE_EXPRESSION, STATE_SCREEN,
  normalizeState, canAuto, speakingDuration, shouldGreet,
} from './auri-state.js';

export { STATES, EXPRESSIONS, SCREEN_MODES };

const NS = 'http://www.w3.org/2000/svg';
const C = {
  ink: '#06140F', deep: '#0B3D2E', main: '#10B981', light: '#34D399', pale: '#A7F3D0',
  glow: '#ECFDF5', eye: '#8DF7C8', warm: '#FDE68A', cream: '#F6F2E7', creamShade: '#D9D3C2',
};
let uid = 0;

/* ------------------------------------------------------------------ styles */
const CSS = `
.auri-live{position:relative;display:inline-block;width:var(--auri-size,220px);aspect-ratio:400/460;
 -webkit-tap-highlight-color:transparent;user-select:none;vertical-align:bottom;contain:layout style}
.auri-live>svg{display:block;width:100%;height:100%;overflow:visible}
.auri-live[data-interactive]{cursor:pointer}
.auri-live:focus{outline:none}
.auri-live:focus-visible{outline:3px solid ${C.light};outline-offset:4px;border-radius:24px}
.auri-live .auri-part{transform-box:view-box}
.auri-bubble{position:absolute;bottom:96%;left:50%;transform:translate(-50%,6px);opacity:0;
 width:max-content;max-width:min(260px,80vw);background:#0B1F17;color:${C.glow};border:1.5px solid ${C.main};
 border-radius:14px;padding:10px 12px;font:500 13.5px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
 box-shadow:0 14px 30px -14px rgba(0,0,0,.6);transition:opacity .22s ease,transform .22s ease;pointer-events:none;
 text-align:start;white-space:normal;z-index:2}
.auri-bubble[data-open]{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.auri-live[data-align=end] .auri-bubble{left:auto;right:0;transform:translate(0,6px)}
.auri-live[data-align=end] .auri-bubble[data-open]{transform:none}
.auri-bubble[data-tone=warn]{border-color:${C.warm}}
.auri-bubble button{display:inline-block;margin-top:8px;font:600 12.5px Inter,system-ui,sans-serif;color:${C.ink};
 background:${C.light};border:0;border-radius:999px;padding:6px 12px;cursor:pointer}
.auri-bubble button:focus-visible{outline:2px solid ${C.glow};outline-offset:2px}
@media (prefers-reduced-motion:reduce){.auri-bubble{transition:none}}
`;
function injectStyles(doc) {
  if (doc.getElementById('auri-live-styles')) return;
  const style = doc.createElement('style');
  style.id = 'auri-live-styles';
  style.textContent = CSS;
  doc.head.append(style);
}

/* ---------------------------------------------------------------- svg rig */
const chevron = (cx, cy, s, stroke, w) =>
  `<path d="M${cx - s},${cy + s * .62} L${cx},${cy - s * .7} L${cx + s},${cy + s * .62} M${cx - s * .42},${cy + s * .12} L${cx + s * .42},${cy + s * .12}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function rigMarkup(id) {
  const g = n => `${n}-${id}`;
  return `
<defs>
 <radialGradient id="${g('cream')}" cx="38%" cy="28%" r="80%">
  <stop offset="0" stop-color="#FFFEF9"/><stop offset=".55" stop-color="${C.cream}"/><stop offset="1" stop-color="${C.creamShade}"/>
 </radialGradient>
 <linearGradient id="${g('visor')}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#16201C"/><stop offset=".45" stop-color="#050A08"/><stop offset="1" stop-color="#020403"/>
 </linearGradient>
 <linearGradient id="${g('screen')}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0A1C15"/><stop offset="1" stop-color="#030B08"/>
 </linearGradient>
 <radialGradient id="${g('ear')}" cx="40%" cy="35%" r="70%">
  <stop offset="0" stop-color="#145A44"/><stop offset="1" stop-color="${C.deep}"/>
 </radialGradient>
 <linearGradient id="${g('lower')}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0F4A38"/><stop offset="1" stop-color="#07271D"/>
 </linearGradient>
 <clipPath id="${g('helmet')}"><rect x="62" y="24" width="276" height="212" rx="104"/></clipPath>
 <clipPath id="${g('visorclip')}"><rect x="96" y="80" width="208" height="140" rx="56"/></clipPath>
 <clipPath id="${g('screenclip')}"><rect x="134" y="256" width="132" height="100" rx="14"/></clipPath>
 <clipPath id="${g('bodyclip')}"><path d="M136,232 Q200,220 264,232 Q300,242 302,300 Q302,372 268,392 Q200,410 132,392 Q98,372 98,300 Q100,242 136,232Z"/></clipPath>
</defs>
<ellipse data-p="shadow" cx="200" cy="446" rx="92" ry="11" fill="#000" opacity=".28"/>
<g data-p="root" class="auri-part">
 <g data-p="legL" class="auri-part">
  <rect x="148" y="366" width="46" height="62" rx="21" fill="url(#${g('cream')})"/>
  <rect x="146" y="410" width="50" height="22" rx="11" fill="${C.deep}"/>
 </g>
 <g data-p="legR" class="auri-part">
  <rect x="206" y="366" width="46" height="62" rx="21" fill="url(#${g('cream')})"/>
  <rect x="204" y="410" width="50" height="22" rx="11" fill="${C.deep}"/>
 </g>
 <g data-p="body" class="auri-part">
  <path d="M136,232 Q200,220 264,232 Q300,242 302,300 Q302,372 268,392 Q200,410 132,392 Q98,372 98,300 Q100,242 136,232Z" fill="url(#${g('cream')})"/>
  <g clip-path="url(#${g('bodyclip')})">
   <path d="M90,350 Q200,380 310,350 L310,420 L90,420Z" fill="url(#${g('lower')})"/>
   <path d="M90,350 Q200,380 310,350" fill="none" stroke="${C.light}" stroke-width="1.5" opacity=".35"/>
  </g>
  <rect x="126" y="248" width="148" height="116" rx="21" fill="${C.deep}"/>
  <rect data-p="screenGlow" x="128.5" y="250.5" width="143" height="111" rx="19" fill="none" stroke="${C.light}" stroke-width="2.5" opacity=".85"/>
  <rect x="134" y="256" width="132" height="100" rx="14" fill="url(#${g('screen')})"/>
  <g data-p="screen" clip-path="url(#${g('screenclip')})"><g transform="translate(134 256)" data-p="screenContent"></g></g>
  <path d="M140,262 Q200,252 260,262" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".06"/>
  <g data-p="badge" opacity=".9">${chevron(200, 378, 9, C.light, 3.2)}</g>
 </g>
 <g data-p="armL" class="auri-part">
  <g transform="rotate(10 112 262)">
   <rect x="88" y="250" width="40" height="86" rx="20" fill="url(#${g('cream')})"/>
   <rect x="86" y="314" width="44" height="34" rx="17" fill="${C.deep}"/>
   <rect data-p="cuffL" x="89" y="311" width="38" height="4" rx="2" fill="${C.light}" opacity=".85"/>
  </g>
 </g>
 <g data-p="armR" class="auri-part">
  <g transform="rotate(-10 288 262)">
   <rect x="272" y="250" width="40" height="86" rx="20" fill="url(#${g('cream')})"/>
   <rect x="270" y="314" width="44" height="34" rx="17" fill="${C.deep}"/>
   <rect data-p="cuffR" x="273" y="311" width="38" height="4" rx="2" fill="${C.light}" opacity=".85"/>
  </g>
 </g>
 <ellipse cx="200" cy="234" rx="64" ry="13" fill="${C.deep}"/>
 <g data-p="head" class="auri-part">
  <rect x="62" y="24" width="276" height="212" rx="104" fill="url(#${g('cream')})"/>
  <g clip-path="url(#${g('helmet')})">
   <rect x="183" y="14" width="34" height="74" rx="17" fill="${C.deep}"/>
   <path d="M62,200 Q200,250 338,200 L338,250 L62,250Z" fill="#000" opacity=".06"/>
  </g>
  <rect x="96" y="80" width="208" height="140" rx="56" fill="url(#${g('visor')})" stroke="${C.deep}" stroke-width="5"/>
  <g clip-path="url(#${g('visorclip')})">
   <path d="M118,104 Q150,86 196,88" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".10"/>
   <g data-p="eyes">
    <g data-p="eyeL"><rect data-p="haloL" fill="none" stroke="${C.light}" stroke-width="12" opacity=".22"/><rect data-p="pillL" fill="${C.eye}"/>
     <path data-p="lineL" fill="none" stroke="${C.eye}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></g>
    <g data-p="eyeR"><rect data-p="haloR" fill="none" stroke="${C.light}" stroke-width="12" opacity=".22"/><rect data-p="pillR" fill="${C.eye}"/>
     <path data-p="lineR" fill="none" stroke="${C.eye}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0"/></g>
   </g>
   <g data-p="dots" opacity="0"><circle cx="184" cy="198" r="4.5" fill="${C.eye}"/><circle cx="200" cy="198" r="4.5" fill="${C.eye}"/><circle cx="216" cy="198" r="4.5" fill="${C.eye}"/></g>
  </g>
  <g data-p="earL">
   <circle cx="64" cy="152" r="38" fill="url(#${g('ear')})" stroke="${C.cream}" stroke-width="5"/>
   <circle data-p="ringL" cx="64" cy="152" r="27" fill="none" stroke="${C.light}" stroke-width="4.5"/>
   ${chevron(64, 152, 11, C.light, 4)}
  </g>
  <g data-p="earR">
   <circle cx="336" cy="152" r="38" fill="url(#${g('ear')})" stroke="${C.cream}" stroke-width="5"/>
   <circle data-p="ringR" cx="336" cy="152" r="27" fill="none" stroke="${C.light}" stroke-width="4.5"/>
   ${chevron(336, 152, 11, C.light, 4)}
  </g>
 </g>
</g>
<g data-p="fx">
 <g data-p="sparkles" opacity="0"></g>
 <g data-p="zzz" opacity="0" font-family="Inter,system-ui,sans-serif" font-weight="800" fill="${C.pale}">
  <text data-z="0" x="318" y="70" font-size="22">z</text><text data-z="1" x="338" y="46" font-size="17">z</text><text data-z="2" x="354" y="26" font-size="13">z</text>
 </g>
 <g data-p="waves" opacity="0" fill="none" stroke="${C.light}" stroke-width="4" stroke-linecap="round">
  <path data-w="0" d="M382,132 Q392,152 382,172"/><path data-w="1" d="M394,120 Q410,152 394,184"/>
 </g>
</g>`;
}

/* --------------------------------------------------------- eye expressions */
// pill: rounded rectangle eye (w,h, dx/dy offset, rot). line: stroked path.
const P = (w, h, dx = 0, dy = 0, rot = 0) => ({ kind: 'pill', w, h, dx, dy, rot });
const L = d => ({ kind: 'line', d });
const ARC_UP = 'M-19,8 Q0,-18 19,8';
const ARC_SOFT = 'M-18,6 Q0,-12 18,6';
const ARC_DOWN = 'M-18,-4 Q0,12 18,-4';
const FACES = {
  neutral: [P(34, 60), P(34, 60)],
  happy: [L(ARC_UP), L(ARC_UP)],
  excited: [L('M-14,-16 L12,0 L-14,16'), L('M14,-16 L-12,0 L14,16')],
  thinking: [P(30, 46, 4, -14), P(30, 46, 4, -14)],
  surprised: [P(42, 70), P(42, 70)],
  wink: [P(34, 60), L(ARC_SOFT)],
  focused: [P(40, 20, 0, 4), P(40, 20, 0, 4)],
  typing: [P(38, 14, 0, -4), P(38, 14, 0, -4)],
  helpful: [L(ARC_SOFT), L(ARC_SOFT)],
  sleepy: [L(ARC_DOWN), L(ARC_DOWN)],
  concerned: [P(30, 46, 0, 6, 14), P(30, 46, 0, 6, -14)],
};
const DOT_FACES = new Set(['thinking', 'typing']);
const EYE_X = [160, 240];
const EYE_Y = 150;

/* ------------------------------------------------------------ belly screen */
// Every view is a static SVG fragment (132×100 local units) plus a small
// update(t) that only writes transforms / opacity of a few nodes.
const T = (x, y, s, text, fill = C.glow, weight = 700, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-size="${s}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" font-family="Inter,system-ui,sans-serif">${text}</text>`;
const head = (label, icon = '') =>
  `${icon}${T(icon ? 24 : 9, 15, 10.5, label)}<g fill="${C.light}"><circle cx="104" cy="11" r="2.2"/><circle cx="112" cy="11" r="2.2" opacity=".7"/><circle cx="120" cy="11" r="2.2" opacity=".45"/></g>`;
const person = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-3" r="3.2" fill="${C.light}"/><path d="M-5.5,5 Q0,-1 5.5,5Z" fill="${C.light}"/></g>`;

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

function buildViews() {
  const v = {};
  v.logo = {
    svg: `<g data-s="mark" transform="translate(66 50)"><circle r="30" fill="${C.deep}" opacity=".55"/>${chevron(0, 2, 17, C.light, 5)}</g>`,
    update(t, n) { n.mark.setAttribute('opacity', (.75 + .25 * Math.sin(t * 1.6)).toFixed(3)); },
  };
  v.crm = {
    svg: `${head('CRM', person(13, 11, .9))}
      ${[30, 46, 62].map((y, i) => `${person(14, y + 1)}<rect x="24" y="${y - 3}" width="${30 - i * 6}" height="4" rx="2" fill="${C.pale}" opacity=".55"/><circle data-s="lead${i}" cx="62" cy="${y - 1}" r="3" fill="${C.light}"/>`).join('')}
      <g transform="translate(74 24)">${[0, 1, 2, 3].map(i => `<rect x="${i * 13}" y="${18 - i * 5}" width="9" height="${22 + i * 5}" rx="2" fill="${C.main}" opacity="${.35 + i * .15}"/>`).join('')}
       <circle data-s="deal" cx="4" cy="12" r="3" fill="${C.warm}"/></g>
      <rect x="9" y="80" width="114" height="6" rx="3" fill="${C.deep}"/><rect data-s="bar" x="9" y="80" width="114" height="6" rx="3" fill="${C.light}"/>`,
    update(t, n) {
      for (let i = 0; i < 3; i++) n['lead' + i].setAttribute('opacity', ((Math.sin(t * 2.4 - i * 1.1) + 1) / 2 * .7 + .3).toFixed(2));
      const k = (t * .35) % 1;
      n.deal.setAttribute('transform', `translate(${(k * 39).toFixed(1)} ${(-k * 12).toFixed(1)})`);
      n.bar.setAttribute('width', (114 * (.25 + .55 * ((Math.sin(t * .8) + 1) / 2))).toFixed(1));
    },
  };
  v.analytics = {
    svg: `${head('Analytics', `<path d="M8,16 L8,8 M12,16 L12,5 M16,16 L16,10" stroke="${C.light}" stroke-width="2.4" stroke-linecap="round"/>`)}
      ${[0, 1, 2, 3, 4].map(i => `<rect data-s="b${i}" x="${12 + i * 21}" y="30" width="13" height="56" rx="3" fill="${C.main}" opacity="${.45 + i * .12}"/>`).join('')}
      <polyline data-s="trend" fill="none" stroke="${C.pale}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points=""/>
      <circle data-s="tip" r="3.4" fill="${C.warm}"/>`,
    update(t, n) {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const h = 16 + i * 9 + 5 * Math.sin(t * 1.3 + i);
        n['b' + i].setAttribute('y', (86 - h).toFixed(1));
        n['b' + i].setAttribute('height', h.toFixed(1));
        pts.push(`${18.5 + i * 21},${(80 - h).toFixed(1)}`);
      }
      n.trend.setAttribute('points', pts.join(' '));
      const last = pts[4].split(',');
      n.tip.setAttribute('cx', last[0]); n.tip.setAttribute('cy', last[1]);
    },
  };
  v.website = {
    svg: `${head('Website', `<rect x="6" y="6" width="13" height="10" rx="2" fill="none" stroke="${C.light}" stroke-width="2"/>`)}
      <rect x="9" y="24" width="114" height="64" rx="6" fill="${C.deep}" opacity=".7" stroke="${C.main}" stroke-width="1.2"/>
      <g fill="${C.pale}"><circle cx="16" cy="30" r="1.8"/><circle cx="22" cy="30" r="1.8" opacity=".7"/><circle cx="28" cy="30" r="1.8" opacity=".5"/></g>
      <rect x="15" y="37" width="102" height="18" rx="3" fill="${C.main}" opacity=".55"/>
      <path d="M22,52 L32,43 L39,49 L45,44 L54,52Z" fill="${C.pale}" opacity=".8"/>
      <rect x="15" y="59" width="48" height="12" rx="2" fill="${C.light}" opacity=".35"/><rect x="69" y="59" width="48" height="12" rx="2" fill="${C.light}" opacity=".35"/>
      <rect x="15" y="77" width="102" height="5" rx="2.5" fill="#06140F"/><rect data-s="load" x="15" y="77" width="10" height="5" rx="2.5" fill="${C.light}"/>
      <g data-s="done" opacity="0"><circle cx="112" cy="40" r="8" fill="${C.light}"/><path d="M108,40 L111,43 L116,37" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    update(t, n) {
      const k = (t * .32) % 1, p = Math.min(1, k / .75);
      n.load.setAttribute('width', (102 * p).toFixed(1));
      n.done.setAttribute('opacity', k > .75 ? '1' : '0');
    },
  };
  v.marketing = {
    svg: `${head('Marketing', `<path d="M6,10 L12,7 L16,5 L16,17 L12,15 L6,12Z" fill="${C.light}"/>`)}
      <g transform="translate(22 52)"><path d="M0,-8 L14,-14 L22,-18 L22,18 L14,14 L0,8Z" fill="${C.light}"/><rect x="-6" y="-8" width="7" height="16" rx="2" fill="${C.main}"/><path d="M2,8 L6,20" stroke="${C.light}" stroke-width="4" stroke-linecap="round"/></g>
      ${[0, 1, 2].map(i => `<path data-s="r${i}" d="M52,${34 - i * 4} Q${62 + i * 8},52 52,${70 + i * 4}" transform="translate(${i * 12} 0)" fill="none" stroke="${C.pale}" stroke-width="3" stroke-linecap="round"/>`).join('')}
      <rect x="9" y="82" width="114" height="6" rx="3" fill="${C.deep}"/><rect data-s="reach" x="9" y="82" width="40" height="6" rx="3" fill="${C.warm}"/>`,
    update(t, n) {
      for (let i = 0; i < 3; i++) n['r' + i].setAttribute('opacity', ((Math.sin(t * 3 - i * .9) + 1) / 2 * .85 + .1).toFixed(2));
      n.reach.setAttribute('width', (114 * (.3 + .5 * ((t * .2) % 1))).toFixed(1));
    },
  };
  const nodes = [[20, 36], [66, 30], [66, 70], [112, 50]];
  const links = [[0, 1], [0, 2], [1, 3], [2, 3]];
  v.automation = {
    svg: `${head('Automation', `<circle cx="9" cy="11" r="3" fill="${C.light}"/><circle cx="18" cy="11" r="3" fill="${C.light}"/><path d="M12,11 L15,11" stroke="${C.light}" stroke-width="2"/>`)}
      ${links.map(([a, b]) => `<path d="M${nodes[a][0]},${nodes[a][1]} L${nodes[b][0]},${nodes[b][1]}" stroke="${C.main}" stroke-width="2" opacity=".6"/>`).join('')}
      ${nodes.map(([x, y], i) => `<rect data-s="n${i}" x="${x - 9}" y="${y - 9}" width="18" height="18" rx="5" fill="${C.deep}" stroke="${C.light}" stroke-width="1.6"/>`).join('')}
      <circle data-s="pulse" r="3.4" fill="${C.warm}"/>`,
    update(t, n) {
      const k = (t * .45) % 1, route = k < .5 ? [0, 1, 3] : [0, 2, 3], s = (k % .5) * 2;
      const seg = s < .5 ? 0 : 1, f = (s % .5) * 2;
      const [ax, ay] = nodes[route[seg]], [bx, by] = nodes[route[seg + 1]];
      n.pulse.setAttribute('cx', (ax + (bx - ax) * f).toFixed(1));
      n.pulse.setAttribute('cy', (ay + (by - ay) * f).toFixed(1));
      nodes.forEach((_, i) => n['n' + i].setAttribute('fill', route.slice(0, seg + 1).includes(i) ? C.main : C.deep));
    },
  };
  v.support = {
    svg: `${head('Support', `<path d="M6,13 a6,6 0 1 1 12,0" fill="none" stroke="${C.light}" stroke-width="2.2"/><rect x="5" y="12" width="3.5" height="6" rx="1.5" fill="${C.light}"/><rect x="15.5" y="12" width="3.5" height="6" rx="1.5" fill="${C.light}"/>`)}
      <g data-s="m0"><rect x="9" y="26" width="64" height="16" rx="8" fill="${C.deep}" stroke="${C.main}" stroke-width="1"/><rect x="16" y="32" width="44" height="4" rx="2" fill="${C.pale}" opacity=".6"/></g>
      <g data-s="m1"><rect x="55" y="48" width="68" height="16" rx="8" fill="${C.main}"/><rect x="62" y="54" width="48" height="4" rx="2" fill="${C.ink}" opacity=".55"/></g>
      <g data-s="m2"><rect x="9" y="70" width="34" height="16" rx="8" fill="${C.deep}" stroke="${C.main}" stroke-width="1"/>
       ${[0, 1, 2].map(i => `<circle data-s="d${i}" cx="${19 + i * 7}" cy="78" r="2.4" fill="${C.pale}"/>`).join('')}</g>
      <circle cx="118" cy="80" r="3.5" fill="${C.light}"/>`,
    update(t, n) {
      const k = (t * .4) % 1;
      n.m0.setAttribute('opacity', k > .05 ? 1 : 0);
      n.m1.setAttribute('opacity', k > .3 ? 1 : 0);
      n.m2.setAttribute('opacity', k > .55 ? 1 : 0);
      for (let i = 0; i < 3; i++) n['d' + i].setAttribute('opacity', ((Math.sin(t * 7 - i) + 1) / 2 * .8 + .2).toFixed(2));
    },
  };
  v.roadmap = {
    svg: `${head('Roadmap', `<path d="M6,8 L9,11 L14,5 M6,16 L18,16" fill="none" stroke="${C.light}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)}
      ${[0, 1, 2].map(i => `<rect x="10" y="${26 + i * 15}" width="11" height="11" rx="3" fill="none" stroke="${C.light}" stroke-width="1.6"/>
        <path data-s="c${i}" d="M12.5,${31.5 + i * 15} L15,${34 + i * 15} L19,${28.5 + i * 15}" fill="none" stroke="${C.light}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="27" y="${29 + i * 15}" width="${82 - i * 14}" height="5" rx="2.5" fill="${C.pale}" opacity=".5"/>`).join('')}
      <path d="M12,86 L120,86" stroke="${C.deep}" stroke-width="4" stroke-linecap="round"/>
      <path data-s="track" d="M12,86 L12,86" stroke="${C.light}" stroke-width="4" stroke-linecap="round"/>
      ${[0, 1, 2, 3].map(i => `<rect data-s="ms${i}" x="${12 + i * 36 - 4}" y="82" width="8" height="8" transform="rotate(45 ${12 + i * 36} 86)" fill="${C.deep}" stroke="${C.light}" stroke-width="1.4"/>`).join('')}`,
    update(t, n) {
      const k = (t * .22) % 1;
      for (let i = 0; i < 3; i++) n['c' + i].setAttribute('opacity', k > (i + 1) * .2 ? 1 : 0);
      n.track.setAttribute('d', `M12,86 L${(12 + 108 * k).toFixed(1)},86`);
      for (let i = 0; i < 4; i++) n['ms' + i].setAttribute('fill', 12 + i * 36 <= 12 + 108 * k ? C.warm : C.deep);
    },
  };
  v.security = {
    svg: `${head('Security', `<path d="M12,4 L18,7 L18,12 Q18,17 12,19 Q6,17 6,12 L6,7Z" fill="${C.light}"/>`)}
      <g transform="translate(66 54)">
       <circle data-s="ring" r="27" fill="none" stroke="${C.main}" stroke-width="2" stroke-dasharray="10 7" opacity=".7"/>
       <path d="M0,-20 L16,-13 L16,0 Q16,13 0,20 Q-16,13 -16,0 L-16,-13Z" fill="${C.deep}" stroke="${C.light}" stroke-width="2.4"/>
       <path d="M-7,0 L-2,5 L8,-6" fill="none" stroke="${C.light}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <circle data-s="ok" cx="14" cy="89" r="3.4" fill="${C.light}"/>${T(22, 92, 8.5, 'Protected', C.pale, 600)}`,
    update(t, n) {
      n.ring.setAttribute('transform', `rotate(${((t * 40) % 360).toFixed(1)})`);
      n.ok.setAttribute('opacity', ((Math.sin(t * 3) + 1) / 2 * .6 + .4).toFixed(2));
    },
  };
  // State screens
  v.processing = {
    svg: `<circle cx="66" cy="44" r="20" fill="none" stroke="${C.deep}" stroke-width="5"/>
      <circle data-s="arc" cx="66" cy="44" r="20" fill="none" stroke="${C.light}" stroke-width="5" stroke-linecap="round" stroke-dasharray="34 92"/>
      ${[0, 1, 2].map(i => `<circle data-s="p${i}" cx="${54 + i * 12}" cy="82" r="4" fill="${C.pale}"/>`).join('')}`,
    update(t, n) {
      n.arc.setAttribute('transform', `rotate(${((t * 240) % 360).toFixed(1)} 66 44)`);
      for (let i = 0; i < 3; i++) n['p' + i].setAttribute('cy', (82 - Math.max(0, Math.sin(t * 6 - i * .8)) * 5).toFixed(1));
    },
  };
  v.message = {
    svg: `<path d="M30,22 L102,22 Q112,22 112,32 L112,60 Q112,70 102,70 L58,70 L44,82 L46,70 L30,70 Q20,70 20,60 L20,32 Q20,22 30,22Z" fill="${C.deep}" stroke="${C.light}" stroke-width="2"/>
      ${[0, 1, 2, 3, 4].map(i => `<rect data-s="v${i}" x="${43 + i * 10}" y="40" width="5" height="12" rx="2.5" fill="${C.light}"/>`).join('')}`,
    update(t, n, s) {
      for (let i = 0; i < 5; i++) {
        const h = 6 + (s.voice * 18 + 4) * ((Math.sin(t * 9 + i * 1.7) + 1) / 2);
        n['v' + i].setAttribute('y', (46 - h / 2).toFixed(1));
        n['v' + i].setAttribute('height', h.toFixed(1));
      }
    },
  };
  v.success = {
    svg: `<circle data-s="halo" cx="66" cy="50" r="30" fill="${C.main}" opacity=".25"/><circle cx="66" cy="50" r="22" fill="${C.light}"/>
      <path d="M55,50 L63,58 L78,42" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    update(t, n) { n.halo.setAttribute('r', (28 + 4 * Math.sin(t * 5)).toFixed(1)); },
  };
  v.help = {
    svg: `<g transform="translate(66 46)"><circle data-s="glow" r="26" fill="${C.main}" opacity=".22"/>
       <path d="M0,-20 Q15,-20 15,-5 Q15,4 7,10 L7,15 L-7,15 L-7,10 Q-15,4 -15,-5 Q-15,-20 0,-20Z" fill="${C.warm}"/>
       <rect x="-6" y="18" width="12" height="4" rx="2" fill="${C.pale}"/></g>`,
    update(t, n) { n.glow.setAttribute('opacity', (.15 + .15 * (Math.sin(t * 2.5) + 1) / 2).toFixed(2)); },
  };
  v.warning = {
    svg: `<path d="M66,22 L92,70 L40,70Z" fill="none" stroke="${C.warm}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="63.5" y="38" width="5" height="17" rx="2.5" fill="${C.warm}"/><circle cx="66" cy="62" r="3" fill="${C.warm}"/>
      ${T(66, 88, 9, 'Let’s try again', C.pale, 600, 'middle')}`,
    update() {},
  };
  v.rest = {
    svg: `<path d="M72,24 A24,24 0 1 0 92,58 A19,19 0 1 1 72,24Z" fill="${C.pale}" opacity=".7"/>`,
    update() {},
  };
  return v;
}

/* ---------------------------------------------------------------- helpers */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;

const POSE = {
  idle: { y: 0, rot: 0, headRot: 0, headY: 0, armL: 8, armR: -8, glow: .65, dim: 0, lean: 0 },
  welcome: { y: -4, rot: 0, headRot: 5, headY: 0, armL: 8, armR: -150, glow: .9, dim: 0, lean: 0 },
  thinking: { y: 0, rot: 0, headRot: -7, headY: 0, armL: 8, armR: -38, glow: .7, dim: 0, lean: 0 },
  speaking: { y: 0, rot: 0, headRot: 0, headY: 0, armL: 22, armR: -10, glow: .85, dim: 0, lean: 0 },
  working: { y: 2, rot: 0, headRot: 0, headY: 5, armL: 32, armR: -32, glow: .8, dim: 0, lean: 0 },
  celebrate: { y: 0, rot: 0, headRot: 0, headY: -2, armL: 150, armR: -150, glow: 1, dim: 0, lean: 0 },
  help: { y: 0, rot: 0, headRot: 0, headY: 0, armL: 8, armR: -8, glow: .9, dim: 0, lean: 0 },
  sleep: { y: 12, rot: 0, headRot: 8, headY: 8, armL: 3, armR: -3, glow: .18, dim: .65, lean: 0 },
  error: { y: 2, rot: 0, headRot: 6, headY: 2, armL: 4, armR: -4, glow: .55, dim: 0, lean: 0 },
};

/* ================================================================ factory */
export function createAuri(host, options = {}) {
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  injectStyles(doc);
  const id = ++uid;
  const opts = {
    size: 220, follow: true, followRadius: 520, interactive: false, label: 'Auri, your AuraDigital assistant',
    sleepAfter: 90000, greet: false, greetKey: 'auri-greeted', align: 'center', reducedMotion: 'auto',
    screen: 'logo', ...options,
  };

  const root = doc.createElement('div');
  root.className = 'auri-live';
  root.dataset.align = opts.align;
  const svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 460');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = rigMarkup(id);
  const bubble = doc.createElement('div');
  bubble.className = 'auri-bubble';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  root.append(svg, bubble);
  host.append(root);

  const part = {};
  svg.querySelectorAll('[data-p]').forEach(el => { part[el.dataset.p] = el; });

  // Sparkles (built once)
  const sparkSpots = [[70, 70, C.pale], [330, 62, C.warm], [40, 210, C.light], [362, 220, C.pale], [120, 20, C.warm], [282, 18, C.light]];
  part.sparkles.innerHTML = sparkSpots.map(([x, y, c], i) =>
    `<path data-k="${i}" d="M0,-9 Q1.5,-1.5 9,0 Q1.5,1.5 0,9 Q-1.5,1.5 -9,0 Q-1.5,-1.5 0,-9Z" fill="${c}" transform="translate(${x} ${y})"/>`).join('');
  const sparks = [...part.sparkles.children];
  const zs = [...part.zzz.children];
  const waves = [...part.waves.children];

  // Belly views
  const viewDefs = buildViews();
  const views = {};
  for (const [name, def] of Object.entries(viewDefs)) {
    const g = doc.createElementNS(NS, 'g');
    g.innerHTML = def.svg;
    g.style.display = 'none';
    const nodes = {};
    g.querySelectorAll('[data-s]').forEach(el => { nodes[el.dataset.s] = el; });
    part.screenContent.append(g);
    views[name] = { g, nodes, update: def.update };
  }
  // Working overlay + demo tag + optional data chip
  const overlay = doc.createElementNS(NS, 'g');
  overlay.innerHTML = `<rect x="0" y="0" width="132" height="100" fill="#030B08" opacity=".55"/>
    <text data-o="label" x="66" y="74" font-size="9.5" font-weight="700" fill="${C.glow}" text-anchor="middle" font-family="Inter,system-ui,sans-serif"></text>
    <rect x="12" y="82" width="108" height="6" rx="3" fill="${C.deep}"/><rect data-o="bar" x="12" y="82" width="20" height="6" rx="3" fill="${C.light}"/>`;
  overlay.style.display = 'none';
  const chip = doc.createElementNS(NS, 'g');
  chip.style.display = 'none';
  const demo = doc.createElementNS(NS, 'g');
  demo.innerHTML = `<rect x="96" y="90" width="32" height="9" rx="4.5" fill="${C.deep}"/>${T(112, 97, 6.5, 'DEMO', C.pale, 700, 'middle')}`;
  part.screenContent.append(chip, overlay, demo);
  const overlayLabel = overlay.querySelector('[data-o=label]');
  const overlayBar = overlay.querySelector('[data-o=bar]');

  const eyes = [0, 1].map(i => {
    const s = i ? 'R' : 'L';
    return { pill: part['pill' + s], halo: part['halo' + s], line: part['line' + s], cur: { ...FACES.neutral[i], open: 1 } };
  });

  /* -------------------------------------------------------------- state */
  const motionQuery = win.matchMedia('(prefers-reduced-motion: reduce)');
  const coarseQuery = win.matchMedia('(pointer: coarse)');
  const reduced = () => opts.reducedMotion === 'reduce' || (opts.reducedMotion === 'auto' && motionQuery.matches);
  const now = () => win.performance.now() / 1000;
  const s = {
    state: 'idle', since: now(), token: 0, transient: null, extraTimer: null,
    expression: null, screen: SCREEN_MODES.includes(opts.screen) ? opts.screen : 'logo', screenData: null,
    demo: true, operation: '', progress: null, direction: 1,
    gaze: [0, 0], gazeTarget: [0, 0], hover: 0, hoverAt: -9, voice: 0, voiceTarget: 0, voiceExternal: false,
    blinkAt: now() + 2 + Math.random() * 3, blinkUntil: 0,
    pose: { ...POSE.idle }, lastFrame: 0, raf: 0, visible: true, destroyed: false,
    viewName: '', viewSince: 0, lastActivity: now(), sleepTimer: 0, run: 0, frames: 0, workMs: 0,
  };
  const listeners = new Map();
  const emit = (type, detail) => {
    root.dispatchEvent(new CustomEvent('auri:' + type, { detail, bubbles: true }));
    (listeners.get(type) || []).forEach(fn => { try { fn(detail); } catch (e) { win.console?.error(e); } });
  };

  function setState(name, extra = {}) {
    const next = normalizeState(name);
    if (!next || s.destroyed) return s.token;
    const prev = s.state;
    win.clearTimeout(s.transient);
    win.clearTimeout(s.extraTimer);
    s.state = next;
    s.since = now();
    s.token++;
    s.operation = extra.operation ?? (next === 'working' ? 'Working…' : '');
    s.progress = typeof extra.progress === 'number' ? clamp(extra.progress, 0, 1) : null;
    if (next === 'help') s.direction = resolveDirection(extra);
    if (next !== 'speaking' && !s.voiceExternal) s.voiceTarget = 0;

    const message = extra.message ?? null;
    if (message) showBubble(message, { tone: next === 'error' ? 'warn' : 'info', action: extra.action });
    else hideBubble();

    const duration = extra.duration ?? TRANSIENT[next];
    if (duration) {
      const token = s.token;
      s.transient = win.setTimeout(() => { if (s.token === token) setState('idle'); }, duration);
    }
    if (prev !== next) emit('statechange', { from: prev, to: next });
    root.dataset.state = next;
    kick();
    return s.token;
  }

  function resolveDirection({ direction, target }) {
    if (direction === 'left') return -1;
    if (direction === 'right') return 1;
    if (target?.getBoundingClientRect) {
      const a = target.getBoundingClientRect(), b = root.getBoundingClientRect();
      return a.left + a.width / 2 < b.left + b.width / 2 ? -1 : 1;
    }
    return 1;
  }

  function autoState(target) {
    if (!canAuto(s.state, target)) return false;
    if (target === 'wake') { setState('idle'); s.hoverAt = now(); return true; }
    if (target === 'hover') { s.hoverAt = now(); kick(); emit('hover', {}); return true; }
    setState(target);
    return true;
  }

  /* ------------------------------------------------------------ bubble */
  let bubbleTimer = 0;
  function showBubble(text, { tone = 'info', action, duration } = {}) {
    win.clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.dataset.tone = tone;
    if (action?.label) {
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.textContent = action.label;
      btn.addEventListener('click', ev => { ev.stopPropagation(); action.onClick?.(); hideBubble(); });
      bubble.append(doc.createElement('br'), btn);
    }
    bubble.setAttribute('data-open', '');
    if (duration) bubbleTimer = win.setTimeout(hideBubble, duration);
  }
  function hideBubble() {
    win.clearTimeout(bubbleTimer);
    bubble.removeAttribute('data-open');
  }

  /* ------------------------------------------------------------ screen */
  function setScreen(mode, { data = null, demo = true } = {}) {
    if (!SCREEN_MODES.includes(mode)) return;
    s.screen = mode;
    s.screenData = data;
    s.demo = demo !== false;
    renderChip();
    kick();
  }
  // Real figures only appear when the caller passes them (from an API the
  // viewer is allowed to see). Nothing is ever invented.
  function renderChip() {
    const d = s.screenData;
    if (!d || !Array.isArray(d.stats) || !d.stats.length) { chip.style.display = 'none'; return; }
    chip.innerHTML = d.stats.slice(0, 2).map((st, i) =>
      `<g transform="translate(${8 + i * 60} 24)"><rect width="56" height="26" rx="6" fill="#06140F" stroke="${C.main}" stroke-width="1" opacity=".96"/>
      ${T(6, 10, 6.5, esc(st.label).slice(0, 14), C.pale, 600)}${T(6, 21, 10, esc(st.value).slice(0, 8), C.glow, 800)}</g>`).join('');
    chip.style.display = '';
  }

  function screenFor() {
    if (s.state === 'working') return s.screen;
    return STATE_SCREEN[s.state] || s.screen;
  }

  /* ------------------------------------------------------------- input */
  function setGazeFromPointer(x, y) {
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height * .33;
    const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy);
    if (dist > opts.followRadius) { s.gazeTarget = [0, 0]; return false; }
    const fall = 1 - clamp((dist - opts.followRadius * .6) / (opts.followRadius * .4), 0, 1);
    s.gazeTarget = [clamp(dx / 260, -1, 1) * fall, clamp(dy / 260, -1, 1) * fall];
    return true;
  }
  const following = () => opts.follow && !reduced() && !coarseQuery.matches;

  const ac = new AbortController();
  const sig = { signal: ac.signal };
  win.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !s.visible || !following()) return;
    const near = setGazeFromPointer(e.clientX, e.clientY);
    if (near) { activity(); if (s.state === 'sleep' && near) autoState('wake'); }
    kick();
  }, { passive: true, ...sig });
  const resetGaze = () => { s.gazeTarget = [0, 0]; kick(); };
  doc.documentElement.addEventListener('pointerleave', resetGaze, sig);
  win.addEventListener('blur', resetGaze, sig);
  ['pointerdown', 'keydown'].forEach(type => win.addEventListener(type, () => {
    activity();
    if (s.state === 'sleep') autoState('wake');
  }, { passive: true, ...sig }));
  win.addEventListener('scroll', activity, { passive: true, ...sig });
  root.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse') { autoState(s.state === 'sleep' ? 'wake' : 'hover'); s.hover = 1; }
  }, sig);
  root.addEventListener('pointerleave', () => { s.hover = 0; kick(); }, sig);
  root.addEventListener('click', () => { if (opts.interactive) activate(); }, sig);
  root.addEventListener('keydown', e => {
    if (!opts.interactive || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    activate();
  }, sig);
  function activate() {
    activity();
    if (s.state === 'sleep') setState('idle');
    s.hoverAt = now();
    emit('activate', { state: s.state });
    kick();
  }
  function applyInteractive() {
    if (opts.interactive) {
      root.dataset.interactive = '';
      root.setAttribute('role', 'button');
      root.tabIndex = 0;
      root.setAttribute('aria-label', opts.label);
    } else {
      delete root.dataset.interactive;
      root.removeAttribute('role');
      root.removeAttribute('tabindex');
      root.removeAttribute('aria-label');
    }
  }

  function activity() {
    s.lastActivity = now();
    scheduleSleep();
  }
  function scheduleSleep() {
    win.clearTimeout(s.sleepTimer);
    if (!opts.sleepAfter) return;
    s.sleepTimer = win.setTimeout(() => {
      if (now() - s.lastActivity >= opts.sleepAfter / 1000 - .05) autoState('sleep');
      else scheduleSleep();
    }, opts.sleepAfter);
  }

  // Visibility: pause when off-screen or the tab is hidden.
  let io = null;
  if ('IntersectionObserver' in win) {
    io = new win.IntersectionObserver(([entry]) => { s.visible = entry.isIntersecting; kick(); });
    io.observe(root);
  }
  doc.addEventListener('visibilitychange', () => kick(), sig);
  motionQuery.addEventListener?.('change', () => kick(), sig);

  /* ------------------------------------------------------------ render */
  function kick() {
    if (s.destroyed) return;
    if (reduced()) { win.cancelAnimationFrame(s.raf); s.raf = 0; draw(now(), true); return; }
    if (!s.raf && s.visible && !doc.hidden) s.raf = win.requestAnimationFrame(frame);
  }
  function frame(ms) {
    s.raf = 0;
    if (s.destroyed || !s.visible || doc.hidden) return;
    const t = ms / 1000;
    // Rest pose needs fewer frames.
    if (s.state === 'sleep' && t - s.lastFrame < 1 / 24) { s.raf = win.requestAnimationFrame(frame); return; }
    const start = win.performance.now();
    draw(t, false);
    s.workMs += win.performance.now() - start;
    s.frames++;
    if (!reduced()) s.raf = win.requestAnimationFrame(frame);
  }

  const tf = (el, value) => el.setAttribute('transform', value);
  const op = (el, value) => el.setAttribute('opacity', typeof value === 'number' ? value.toFixed(3) : value);

  function draw(t, still) {
    const dt = clamp(t - (s.lastFrame || t), 0, .1);
    s.lastFrame = t;
    const k = still ? 1 : 1 - Math.exp(-dt * 9);
    const age = t - s.since;
    const st = s.state;
    const target = { ...POSE[st] };
    const m = still ? 0 : 1; // motion multiplier

    // gaze
    if (!following()) s.gazeTarget = [0, 0];
    let gx = s.gazeTarget[0], gy = s.gazeTarget[1];
    if (st === 'thinking') { gx = .35; gy = -.75; }
    if (st === 'help') { gx = s.direction * .9; gy = .1; }
    if (st === 'sleep') { gx = 0; gy = 0; }
    s.gaze[0] = lerp(s.gaze[0], gx, still ? 1 : 1 - Math.exp(-dt * 7));
    s.gaze[1] = lerp(s.gaze[1], gy, still ? 1 : 1 - Math.exp(-dt * 7));

    // voice (speaking without real audio uses a restrained rhythm)
    if (st === 'speaking' && !s.voiceExternal) s.voiceTarget = .45 + .25 * Math.sin(t * 5.3) * Math.sin(t * 2.1);
    s.voice = lerp(s.voice, st === 'speaking' || s.voiceExternal ? s.voiceTarget : 0, still ? 1 : 1 - Math.exp(-dt * 14));

    // procedural layers
    const breatheSpeed = st === 'sleep' ? 1.15 : 1.75;
    const breathe = Math.sin(t * breatheSpeed) * m;
    let y = 0, rot = 0, headRot = 0, headX = s.gaze[0] * 5, headY = s.gaze[1] * 3, armL = 0, armR = 0, squash = .011 * breathe;
    y += (st === 'sleep' ? 1.5 : 3) * Math.sin(t * 1.05) * m;
    headRot += (1.4 * Math.sin(t * .63) + s.gaze[0] * 5) * m;
    armL += 2.2 * Math.sin(t * 1.3) * m; armR -= 2.2 * Math.sin(t * 1.3 + .6) * m;

    if (st === 'welcome') {
      const notice = ease(clamp(age / .4, 0, 1));
      y -= 6 * Math.sin(Math.min(1, age / .5) * Math.PI) * m;
      target.armR = lerp(-8, -150, notice);
      armR += 16 * Math.sin(age * 11) * clamp((age - .5) / .3, 0, 1) * clamp((2.2 - age) / .3, 0, 1) * m;
      if (age > 2.2) target.armR = -8;
    }
    if (st === 'speaking') {
      y -= 1.6 * s.voice * Math.abs(Math.sin(t * 6)) * m;
      headRot += 2.5 * Math.sin(t * 2.6) * m;
      armL += 9 * Math.sin(t * 2.2) * m;
    }
    if (st === 'working') {
      armL += 7 * Math.sin(t * 15) * m;
      armR -= 7 * Math.sin(t * 15 + Math.PI) * m;
    }
    if (st === 'celebrate') {
      const decay = clamp(1 - age / 1.8, 0, 1);
      y -= 16 * Math.abs(Math.sin(age * 6.5)) * decay * m;
      armL += 12 * Math.sin(age * 9) * m; armR -= 12 * Math.sin(age * 9) * m;
      if (age > 2) { target.armL = 8; target.armR = -8; }
    }
    if (st === 'help') {
      const d = s.direction;
      rot += 3.5 * d;
      headRot += 7 * d;
      if (d > 0) target.armR = -100; else target.armL = 100;
      const bob = 5 * Math.sin(t * 2.4) * m;
      if (d > 0) armR -= bob; else armL += bob;
    }
    if (st === 'error') headRot += 4 * Math.sin(age * 7) * clamp(1 - age / 1.2, 0, 1) * m;
    if (st === 'sleep') squash = .022 * breathe;

    // hover perk
    const hoverAge = t - s.hoverAt;
    const perk = hoverAge < .9 ? Math.sin(clamp(hoverAge / .9, 0, 1) * Math.PI) : 0;
    if (st === 'idle') { y -= 4 * perk * m; headRot += 4 * perk * Math.sign(s.gaze[0] || 1) * m; }

    // ease the base pose
    for (const key of Object.keys(target)) s.pose[key] = lerp(s.pose[key], target[key], k);
    const p = s.pose;
    y += p.y; rot += p.rot; headRot += p.headRot; headY += p.headY; armL += p.armL; armR += p.armR;

    tf(part.root, `translate(0 ${y.toFixed(2)}) rotate(${rot.toFixed(2)} 200 430)`);
    tf(part.body, `translate(200 395) scale(${(1 - squash * .4).toFixed(4)} ${(1 + squash).toFixed(4)}) translate(-200 -395)`);
    tf(part.head, `translate(${headX.toFixed(2)} ${(headY - squash * 120).toFixed(2)}) rotate(${headRot.toFixed(2)} 200 225)`);
    tf(part.armL, `translate(0 ${(-squash * 60).toFixed(2)}) rotate(${armL.toFixed(2)} 112 262)`);
    tf(part.armR, `translate(0 ${(-squash * 60).toFixed(2)}) rotate(${armR.toFixed(2)} 288 262)`);
    const lift = Math.min(0, y);
    tf(part.legL, `translate(0 ${(-lift * .15).toFixed(2)})`);
    tf(part.legR, `translate(0 ${(-lift * .15).toFixed(2)})`);
    tf(part.shadow, `translate(200 446) scale(${(1 + lift / 160).toFixed(3)} 1) translate(-200 -446)`);
    op(part.shadow, .28 * (1 + lift / 120));

    // side lights + screen glow
    const glow = clamp(p.glow + .12 * Math.sin(t * 1.9) * m + (st === 'speaking' ? .2 * s.voice : 0), .1, 1);
    op(part.ringL, glow); op(part.ringR, glow);
    op(part.cuffL, .35 + .55 * glow); op(part.cuffR, .35 + .55 * glow);
    op(part.screenGlow, .35 + .6 * glow);
    op(part.screen, 1 - p.dim);
    op(part.badge, .4 + .5 * glow);

    // eyes
    drawEyes(t, st, still);

    // belly screen
    drawScreen(t, still);

    // fx
    const showSparks = st === 'celebrate' && !still;
    op(part.sparkles, showSparks ? clamp(1 - (age - 1.6) / .8, 0, 1) : 0);
    if (showSparks) sparks.forEach((el, i) => {
      const [x, yy] = sparkSpots[i];
      const sc = .5 + .5 * Math.abs(Math.sin(age * 4 + i));
      tf(el, `translate(${x} ${(yy - age * 6).toFixed(1)}) scale(${sc.toFixed(2)}) rotate(${(age * 60 + i * 30).toFixed(0)})`);
    });
    op(part.zzz, st === 'sleep' ? clamp((age - .6) / .8, 0, 1) : 0);
    if (st === 'sleep') zs.forEach((el, i) => op(el, still ? .8 : ((Math.sin(t * 1.4 - i * .9) + 1) / 2) * .85 + .1));
    op(part.waves, st === 'speaking' ? .25 + .75 * s.voice : 0);
    if (st === 'speaking') waves.forEach((el, i) => op(el, still ? .7 : ((Math.sin(t * 6 - i * 1.2) + 1) / 2) * s.voice + .15));
  }

  function drawEyes(t, st, still) {
    const name = s.expression || (st === 'celebrate' && t - s.since > .9 ? 'happy' : STATE_EXPRESSION[st]);
    const face = FACES[name] || FACES.neutral;
    // blink
    if (!still && t > s.blinkAt && ['idle', 'speaking', 'help', 'working'].includes(st) && face[0].kind === 'pill') {
      s.blinkUntil = t + .13;
      s.blinkAt = t + 2.6 + Math.random() * 3.4;
    }
    const blinking = t < s.blinkUntil;
    const gx = s.gaze[0] * 13, gy = s.gaze[1] * 9;
    const k = still ? 1 : .3;
    const hoverAge = t - s.hoverAt;
    const perk = st === 'idle' && hoverAge < .9 && !s.expression ? Math.sin(clamp(hoverAge / .9, 0, 1) * Math.PI) : 0;
    eyes.forEach((eye, i) => {
      const f = face[i], cur = eye.cur;
      const pill = f.kind === 'pill';
      cur.open = lerp(cur.open, pill ? 1 : 0, still ? 1 : .28);
      if (pill) { cur.w = lerp(cur.w, f.w, k); cur.h = lerp(cur.h, f.h, k); cur.dx = lerp(cur.dx, f.dx, k); cur.dy = lerp(cur.dy, f.dy, k); cur.rot = lerp(cur.rot, f.rot, k); }
      let h = cur.h * cur.open * (blinking ? .1 : 1) * (1 + .1 * perk);
      if (st === 'speaking' && !s.expression) h *= 1 - .14 * s.voice * Math.abs(Math.sin(t * 7 + i));
      const w = cur.w * (1 + .06 * perk);
      const cx = EYE_X[i] + cur.dx + gx, cy = EYE_Y + cur.dy + gy;
      const x = cx - w / 2, y = cy - h / 2, rx = Math.max(0, Math.min(w, h) / 2);
      for (const el of [eye.pill, eye.halo]) {
        el.setAttribute('x', x.toFixed(2)); el.setAttribute('y', y.toFixed(2));
        el.setAttribute('width', w.toFixed(2)); el.setAttribute('height', Math.max(0, h).toFixed(2));
        el.setAttribute('rx', rx.toFixed(2));
        el.setAttribute('transform', `rotate(${cur.rot.toFixed(2)} ${cx.toFixed(2)} ${cy.toFixed(2)})`);
      }
      op(eye.pill, cur.open > .05 ? 1 : 0);
      op(eye.halo, .22 * cur.open);
      if (!pill) { eye.line.setAttribute('d', f.d); }
      op(eye.line, 1 - cur.open);
      tf(eye.line, `translate(${(EYE_X[i] + gx).toFixed(2)} ${(EYE_Y + gy).toFixed(2)})`);
    });
    const dots = DOT_FACES.has(name) || st === 'thinking';
    op(part.dots, dots ? 1 : 0);
    if (dots) [...part.dots.children].forEach((c, i) => op(c, still ? .8 : ((Math.sin(t * 6 - i * .9) + 1) / 2) * .8 + .2));
  }

  function drawScreen(t, still) {
    const name = screenFor();
    if (name !== s.viewName) {
      if (views[s.viewName]) views[s.viewName].g.style.display = 'none';
      views[name].g.style.display = '';
      s.viewName = name;
      s.viewSince = t;
    }
    const v = views[name];
    const vt = still ? 1.2 : t;
    v.update(vt, v.nodes, s);
    op(v.g, still ? 1 : clamp((t - s.viewSince) / .25, 0, 1));
    const modeView = !STATE_SCREEN[s.state] || s.state === 'working';
    chip.style.display = modeView && s.screenData?.stats?.length && s.screen !== 'logo' ? '' : 'none';
    demo.style.display = modeView && s.demo && s.screen !== 'logo' && !s.screenData?.stats?.length ? '' : 'none';
    const working = s.state === 'working';
    overlay.style.display = working ? '' : 'none';
    if (working) {
      overlayLabel.textContent = s.operation || 'Working…';
      if (s.progress != null) {
        overlayBar.setAttribute('x', '12');
        overlayBar.setAttribute('width', (108 * s.progress).toFixed(1));
      } else {
        const k = still ? .3 : (t * .7) % 1;
        overlayBar.setAttribute('width', '28');
        overlayBar.setAttribute('x', (12 + 80 * k).toFixed(1));
      }
    }
  }

  /* ---------------------------------------------------------------- api */
  async function run(operation, { busy = 'thinking', label, success = 'celebrate', successMessage, errorMessage, action } = {}) {
    const ticket = ++s.run;
    setState(busy, { operation: label });
    try {
      const result = await operation();
      if (ticket === s.run) setState(success, successMessage ? { message: successMessage, duration: TRANSIENT[success] || 4000 } : {});
      return result;
    } catch (error) {
      if (ticket === s.run && error?.name !== 'AbortError') {
        setState('error', { message: errorMessage || 'That didn’t work this time. Nothing was changed — you can try again.', action });
      } else if (ticket === s.run) setState('idle');
      throw error;
    }
  }

  function speak(text, { voice = false, lang } = {}) {
    const synth = win.speechSynthesis;
    if (voice && synth && win.SpeechSynthesisUtterance) {
      return new Promise(resolve => {
        synth.cancel();
        const u = new win.SpeechSynthesisUtterance(String(text));
        if (lang) u.lang = lang;
        const token = setState('speaking');
        s.voiceExternal = true;
        s.voiceTarget = .3;
        let decay = 0;
        // Animation follows the real audio: word boundaries pulse the face.
        u.onboundary = () => {
          s.voiceTarget = 1;
          win.clearTimeout(decay);
          decay = win.setTimeout(() => { s.voiceTarget = .25; }, 160);
        };
        const end = () => {
          win.clearTimeout(decay);
          s.voiceExternal = false;
          s.voiceTarget = 0;
          if (s.token === token) setState('idle');
          resolve();
        };
        u.onend = end;
        u.onerror = end;
        synth.speak(u);
      });
    }
    const duration = speakingDuration(text);
    setState('speaking', { duration });
    return new Promise(resolve => win.setTimeout(resolve, duration));
  }

  function setVoiceLevel(level) {
    if (level == null) { s.voiceExternal = false; s.voiceTarget = 0; return; }
    s.voiceExternal = true;
    s.voiceTarget = clamp(Number(level) || 0, 0, 1);
    kick();
  }

  function setExpression(name) {
    s.expression = EXPRESSIONS.includes(name) ? name : null;
    kick();
  }

  function setSize(px) {
    opts.size = px;
    root.style.setProperty('--auri-size', typeof px === 'number' ? px + 'px' : px);
  }

  function setOptions(next = {}) {
    Object.assign(opts, next);
    if ('size' in next) setSize(opts.size);
    if ('align' in next) root.dataset.align = opts.align;
    if ('interactive' in next || 'label' in next) applyInteractive();
    if ('sleepAfter' in next) scheduleSleep();
    if ('follow' in next && !next.follow) resetGaze();
    kick();
  }

  function destroy() {
    if (s.destroyed) return;
    s.destroyed = true;
    win.cancelAnimationFrame(s.raf);
    [s.transient, s.extraTimer, s.sleepTimer, bubbleTimer].forEach(id => win.clearTimeout(id));
    ac.abort();
    io?.disconnect();
    listeners.clear();
    root.remove();
  }

  // boot
  setSize(opts.size);
  applyInteractive();
  scheduleSleep();
  if (opts.greet && shouldGreet(win.sessionStorage, opts.greetKey)) win.setTimeout(() => autoState('welcome'), 450);
  kick();

  return {
    element: root,
    setState, setScreen, setExpression, setSize, setOptions, setVoiceLevel, speak, run, destroy,
    say: (text, o) => showBubble(text, o), hush: hideBubble,
    lookAt(x, y) { if (x == null) resetGaze(); else { setGazeFromPointer(x, y); kick(); } },
    on(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); return () => listeners.get(type)?.delete(fn); },
    get state() { return s.state; },
    get screen() { return s.screen; },
    get expression() { return s.expression; },
    stats() { return { frames: s.frames, avgFrameMs: s.frames ? s.workMs / s.frames : 0, running: !!s.raf, visible: s.visible }; },
  };
}

/* ------------------------------------------------------- custom element */
// <auri-live state="idle" screen="crm" size="200" interactive></auri-live>
export function defineAuriElement(win = globalThis.window) {
  if (!win?.customElements || win.customElements.get('auri-live')) return;
  class AuriLive extends win.HTMLElement {
    static get observedAttributes() { return ['state', 'screen', 'expression', 'size']; }
    connectedCallback() {
      if (this.auri) return;
      this.auri = createAuri(this, {
        size: Number(this.getAttribute('size')) || 200,
        interactive: this.hasAttribute('interactive'),
        greet: this.hasAttribute('greet'),
        screen: this.getAttribute('screen') || 'logo',
      });
      this.attributeChangedCallback();
    }
    disconnectedCallback() { this.auri?.destroy(); this.auri = null; }
    attributeChangedCallback() {
      if (!this.auri) return;
      const state = this.getAttribute('state');
      if (state && state !== this.auri.state) this.auri.setState(state);
      const screen = this.getAttribute('screen');
      if (screen) this.auri.setScreen(screen);
      this.auri.setExpression(this.getAttribute('expression'));
      const size = Number(this.getAttribute('size'));
      if (size) this.auri.setSize(size);
    }
  }
  win.customElements.define('auri-live', AuriLive);
}
