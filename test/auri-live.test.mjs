import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATES, EXPRESSIONS, SCREEN_MODES, TRANSIENT, STATE_EXPRESSION, STATE_SCREEN,
  normalizeState, canAuto, phaseToState, speakingDuration, shouldGreet,
} from '../media/auri/live/auri-state.js';

test('every state has a face and a belly screen rule', () => {
  assert.equal(STATES.length, 9);
  for (const state of STATES) {
    assert.ok(EXPRESSIONS.includes(STATE_EXPRESSION[state]), state);
    assert.ok(state in STATE_SCREEN, state);
  }
  assert.deepEqual(SCREEN_MODES.slice(1), ['crm', 'analytics', 'website', 'marketing', 'automation', 'support', 'roadmap', 'security']);
});

test('state names are normalized and unknown names rejected', () => {
  assert.equal(normalizeState('Sleeping'), 'sleep');
  assert.equal(normalizeState('celebrating'), 'celebrate');
  assert.equal(normalizeState('help'), 'help');
  assert.equal(normalizeState('dance'), null);
  assert.equal(normalizeState(undefined), null);
});

test('only welcome and celebrate return to idle by themselves', () => {
  assert.deepEqual(Object.keys(TRANSIENT).sort(), ['celebrate', 'welcome']);
});

test('automatic changes never interrupt real work or an error', () => {
  for (const busy of ['thinking', 'working', 'speaking', 'error']) {
    assert.equal(canAuto(busy, 'sleep'), false, busy);
    assert.equal(canAuto(busy, 'welcome'), false, busy);
    assert.equal(canAuto(busy, 'hover'), false, busy);
  }
  assert.equal(canAuto('idle', 'sleep'), true);
  assert.equal(canAuto('sleep', 'wake'), true);
  assert.equal(canAuto('idle', 'wake'), false);
  assert.equal(canAuto('celebrate', 'sleep'), false);
});

test('hub controller phases map to character states', () => {
  assert.equal(phaseToState('thinking'), 'thinking');
  for (const p of ['working', 'typing', 'drafting']) assert.equal(phaseToState(p), 'working');
  for (const p of ['success', 'happy', 'draft_ready', 'evolving']) assert.equal(phaseToState(p), 'celebrate');
  assert.equal(phaseToState('error'), 'error');
  assert.equal(phaseToState('sleeping'), 'sleep');
  assert.equal(phaseToState('listening'), 'idle');
  assert.equal(phaseToState('something-new'), 'idle');
});

test('speaking time is bounded and grows with the reply', () => {
  assert.equal(speakingDuration(''), 1500);
  assert.ok(speakingDuration('x'.repeat(100)) > speakingDuration('x'.repeat(10)));
  assert.equal(speakingDuration('x'.repeat(10000)), 9000);
});

test('greeting plays once per session and tolerates blocked storage', () => {
  const map = new Map();
  const storage = { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
  assert.equal(shouldGreet(storage), true);
  assert.equal(shouldGreet(storage), false);
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  assert.equal(shouldGreet(blocked), true);
});

test('the most human-sounding voice in the right language is chosen', async () => {
  const { rankVoices, pickHumanVoice } = await import('../media/auri/live/auri-live.js');
  const v = (name, lang, localService = true) => ({ name, lang, localService });
  const voices = [
    v('eSpeak English', 'en-US'), v('Microsoft David - English (United States)', 'en-US'),
    v('Microsoft Aria Online (Natural) - English (United States)', 'en-US', false),
    v('Google US English', 'en-US', false), v('Zarvox', 'en-US'),
    v('Microsoft Emel Online (Natural) - Turkish (Turkey)', 'tr-TR', false), v('Yelda', 'tr-TR'),
  ];
  const win = { speechSynthesis: { getVoices: () => voices } };
  assert.match(pickHumanVoice(win, 'en').name, /Aria Online \(Natural\)/);
  assert.match(pickHumanVoice(win, 'tr').name, /Emel Online \(Natural\)/);
  assert.equal(pickHumanVoice(win, 'en', 'Google US English').name, 'Google US English');
  const ranked = rankVoices(win, 'en').map(r => r.voice.name);
  assert.ok(ranked.indexOf('Zarvox') > ranked.indexOf('Microsoft David - English (United States)'));
  assert.ok(ranked.indexOf('eSpeak English') > ranked.indexOf('Google US English'));
  assert.equal(pickHumanVoice({}, 'en'), null);
});

test('live Auri is on the public pages, and only there', async () => {
  const { readFile } = await import('node:fs/promises');
  const withAuri = {
    'index.html': 'logo', 'about.html': 'logo', 'solutions.html': 'automation', 'packages.html': 'roadmap',
    'service-shop.html': 'marketing', 'shop/index.html': 'marketing', 'aura-menu.html': 'website',
    'aura-weddings.html': 'website', 'portfolio.html': 'website', 'help.html': 'support', 'contact.html': 'support', '404.html': null,
  };
  for (const [file, screen] of Object.entries(withAuri)) {
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    const tags = html.match(/<script type="module" src="\/media\/auri\/live\/auri-site\.js[^"]*"[^>]*>/g) || [];
    assert.equal(tags.length, 1, file);
    assert.match(tags[0], /data-auto/, file);
    assert.match(html, /compact\.css\?v=compact-v3/, file);
    assert.match(html, /class="auri-launcher-portrait" src="\/media\/auri\/studio-v1\/full\.webp"/, file);
    assert.doesNotMatch(html, /class="auri-eye"/, file);
    if (screen) assert.match(tags[0], new RegExp(`data-screen="${screen}"`), file);
  }
  // Guests' wedding invitations, order flows and staff tools stay without the dock.
  for (const file of ['weddings/signature.html', 'weddings/royal-ivory.html', 'nfc-builder.html', 'nfc-status.html', 'hub/index.html']) {
    const html = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /auri-site\.js/, file);
  }
});

test('the page build keeps the Auri dock when pages are regenerated', async () => {
  const { readFile } = await import('node:fs/promises');
  const build = await readFile(new URL('../tools/redesign/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /const AURI_DOCK = \{/);
  assert.match(build, /AURI_DOCK\[name\] \? auriDock\(AURI_DOCK\[name\]\)/);
  assert.match(build, /swap\(src, 'js', `[^`]*auriDock\('data-screen="marketing"'\)/);
  for (const page of ['Main', 'About', 'Solutions', 'Packages', 'Shop', 'AuraMenu', 'Weddings', 'Work', 'Help', 'Contact', 'NotFound']) {
    assert.match(build, new RegExp(`\\b${page}: '`), page);
  }
});

test('the page build loads the shared motion script', async () => {
  const { readFile } = await import('node:fs/promises');
  const build = await readFile(new URL('../tools/redesign/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /\/redesign\/motion\.js\?v=\$\{VERSION\}/);
  const motion = await readFile(new URL('../redesign/motion.js', import.meta.url), 'utf8');
  assert.match(motion, /prefers-reduced-motion/);
});

test('the Hub loads the live character and maps pages to belly screens', async () => {
  const { readFile } = await import('node:fs/promises');
  const hub = await readFile(new URL('../hub/index.html', import.meta.url), 'utf8');
  assert.match(hub, /\/media\/auri\/character\.js\?v=live-/);
  const source = await readFile(new URL('../media/auri/character.js', import.meta.url), 'utf8');
  assert.match(source, /from '\.\/live\/auri-live\.js\?v=compact-v2'/);
  assert.match(source, /phaseToState/);
});

test('live Auri files are not held in the 7-day media cache', async () => {
  const { readFile } = await import('node:fs/promises');
  const headers = await readFile(new URL('../_headers', import.meta.url), 'utf8');
  assert.match(headers, /\/media\/auri\/live\/\*\n\s+! Cache-Control/);
});

test('AuraHub first paint uses the same Studio forms as the live rig', async () => {
  const { auriCharacter } = await import('../src/hub/auri-companion.js');
  assert.match(auriCharacter(1), /class="auri-still"[^>]*>[\s\S]*avatar\.webp/);
  const levelTwo = auriCharacter(2);
  assert.match(levelTwo, /body\.webp[\s\S]*avatar\.webp/);
  assert.doesNotMatch(levelTwo, /full\.webp/);
  assert.match(auriCharacter(1, { variant: 'login' }), /full\.webp/);
  assert.match(auriCharacter(7, { variant: 'avatar' }), /avatar\.webp/);
});
