import { createAuri, STATES, EXPRESSIONS, SCREEN_MODES, rankVoices } from '/media/auri/live/auri-live.js';

const $ = id => document.getElementById(id);
const log = msg => {
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString()}  ${msg}`;
  $('log').prepend(li);
  while ($('log').children.length > 40) $('log').lastChild.remove();
};

const auri = createAuri($('auriSlot'), { size: 280, interactive: true, sleepAfter: 60000, label: 'Auri — open chat' });
let mobile = null;
const all = () => [auri, mobile].filter(Boolean);

const SCREEN_LABELS = { logo: 'Home pulse', crm: 'CRM', analytics: 'Analytics', website: 'Website', marketing: 'Marketing', automation: 'Automation', support: 'Support', roadmap: 'Roadmap', security: 'Security' };
const SAMPLE = {
  crm: [{ label: 'Leads (sample)', value: '128' }, { label: 'Clients (sample)', value: '64' }],
  analytics: [{ label: 'Visits (sample)', value: '+12%' }],
  marketing: [{ label: 'Reach (sample)', value: '8.4k' }],
};

/* states */
$('states').append(...STATES.map(name => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = name; b.dataset.v = name; b.setAttribute('aria-pressed', String(name === 'idle'));
  b.addEventListener('click', () => {
    const extra = name === 'help' ? { direction: 'right', message: 'Services shows everything AuraDigital can build for you.' }
      : name === 'error' ? { message: 'I couldn’t load your roadmap. Nothing was changed.', action: { label: 'Try again', onClick: () => auri.setState('idle') } }
      : name === 'working' ? { operation: 'Publishing website' } : {};
    all().forEach(a => a.setState(name, extra));
  });
  return b;
}));
/* expressions */
$('expression').append(...EXPRESSIONS.map(n => new Option(n[0].toUpperCase() + n.slice(1), n)));
$('expression').addEventListener('change', e => all().forEach(a => a.setExpression(e.target.value || null)));
/* screens */
const applyScreen = mode => {
  const data = $('sampleData').checked && SAMPLE[mode] ? { stats: SAMPLE[mode] } : null;
  all().forEach(a => a.setScreen(mode, { data, demo: true }));
  [...$('screens').children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === mode)));
  $('roScreen').textContent = mode;
};
$('screens').append(...SCREEN_MODES.map(mode => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = SCREEN_LABELS[mode]; b.dataset.v = mode; b.setAttribute('aria-pressed', String(mode === 'logo'));
  b.addEventListener('click', () => applyScreen(mode));
  return b;
}));
$('sampleData').addEventListener('change', () => applyScreen(auri.screen));
/* size */
$('size').addEventListener('input', e => { auri.setSize(Number(e.target.value)); $('sizeOut').textContent = e.target.value + 'px'; });
/* segmented controls */
const seg = (id, fn) => $(id).addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  [...$(id).children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  fn(b.dataset.v);
});
seg('bg', v => { document.body.dataset.bg = v; });
seg('view', v => {
  $('stage').dataset.view = v;
  $('desktopView').hidden = v !== 'desktop';
  $('mobileView').hidden = v !== 'mobile';
  if (v === 'mobile' && !mobile) {
    // Touch devices: tap to open, compact size, no cursor following.
    mobile = createAuri($('phoneDock'), { size: 74, interactive: true, align: 'end', follow: false, sleepAfter: 0, label: 'Open Auri chat' });
    mobile.setScreen(auri.screen);
    mobile.on('activate', () => { $('mockChat').hidden = !$('mockChat').hidden; log('mobile: tap → chat ' + ($('mockChat').hidden ? 'closed' : 'opened')); });
  }
});
$('mockChatClose').addEventListener('click', () => { $('mockChat').hidden = true; });
seg('motion', v => { all().forEach(a => a.setOptions({ reducedMotion: v })); updateMotion(v); });
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion(v = 'auto') {
  $('roMotion').textContent = v === 'reduce' || (v === 'auto' && motionQuery.matches) ? 'reduced' : 'full';
}
updateMotion();

/* interaction */
$('follow').addEventListener('change', e => auri.setOptions({ follow: e.target.checked }));
$('clickable').addEventListener('change', e => auri.setOptions({ interactive: e.target.checked }));
$('sleepAfter').addEventListener('change', e => auri.setOptions({ sleepAfter: Number(e.target.value) }));
auri.on('activate', () => { log('activate → would open the existing chat'); auri.say('Hi! Ask me anything about your business.', { duration: 2600 }); });
auri.on('hover', () => log('hover'));
auri.on('statechange', ({ from, to }) => {
  log(`state ${from} → ${to}`);
  $('roState').textContent = to;
  [...$('states').children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === to)));
});

const wait = ms => new Promise(r => setTimeout(r, ms));
$('simOk').addEventListener('click', () => auri.run(() => wait(1800), { busy: 'thinking', successMessage: 'Done! Your roadmap is saved.' }).catch(() => {}));
$('simFail').addEventListener('click', () => auri.run(async () => { await wait(1600); throw new Error('Simulated failure'); }, {
  busy: 'thinking', errorMessage: 'I couldn’t reach the server. Nothing was changed.',
  action: { label: 'Retry', onClick: () => $('simOk').click() },
}).catch(() => log('request failed (simulated)')));
$('simReply').addEventListener('click', async () => {
  auri.setState('thinking');
  await wait(1200);
  await auri.speak('For a restaurant, start with AuraMenu. Then add a website and WhatsApp orders when you are ready.');
});
$('simWork').addEventListener('click', async () => {
  const token = auri.setState('working', { operation: 'Publishing website', progress: 0 });
  for (let p = 0; p <= 1.0001; p += .05) {
    if (auri.state !== 'working') return; // cancelled by another state
    auri.setState('working', { operation: 'Publishing website', progress: p });
    await wait(120);
  }
  if (token) auri.setState('celebrate', { message: 'Your website is live.' });
});
const LINE = 'Hi, I’m Auri. I’m here to help you run and grow your business — just ask me anything.';
const hear = () => {
  if (!('speechSynthesis' in window)) { auri.say('This browser has no speech voices.', { duration: 2500 }); return; }
  auri.speak(LINE, { voice: true });
};
$('voice').addEventListener('click', hear);
$('voiceTest').addEventListener('click', hear);
$('voiceStop').addEventListener('click', () => { auri.stopVoice(); auri.setState('idle'); });
$('voicePick').addEventListener('change', e => auri.setOptions({ voiceName: e.target.value || undefined }));
function fillVoices() {
  const ranked = rankVoices(window, document.documentElement.lang || 'en');
  const keep = $('voicePick').value;
  $('voicePick').replaceChildren(new Option('Best human voice on this device', ''),
    ...ranked.map(({ voice, score }) => new Option(`${score >= 30 ? '★ ' : ''}${voice.name} (${voice.lang})`, voice.name)));
  $('voicePick').value = keep;
}
if ('speechSynthesis' in window) { fillVoices(); speechSynthesis.addEventListener?.('voiceschanged', fillVoices); }
const help = (dir, el) => {
  el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600);
  auri.setState('help', { target: el, message: dir === 'left' ? 'Pricing compares every package side by side.' : 'Services lists what we can build for you.', duration: 6000 });
};
$('helpL').addEventListener('click', () => help('left', $('targetLeft')));
$('helpR').addEventListener('click', () => help('right', $('targetRight')));
$('targetLeft').addEventListener('click', () => help('left', $('targetLeft')));
$('targetRight').addEventListener('click', () => help('right', $('targetRight')));
$('greet').addEventListener('click', () => { try { sessionStorage.removeItem('auri-greeted'); } catch {} auri.setState('welcome', { message: 'Hi, I’m Auri — your business companion.' }); });

/* perf readout */
setInterval(() => {
  const s = auri.stats();
  $('roPerf').textContent = s.frames ? `${s.avgFrameMs.toFixed(2)} ms/frame` : 'idle';
}, 1000);

window.auri = auri; // handy in the console: auri.setState('celebrate')
