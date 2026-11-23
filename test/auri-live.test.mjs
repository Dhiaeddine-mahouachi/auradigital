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
