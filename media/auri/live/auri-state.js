// Auri live character — pure state rules (no DOM). Shared by the browser
// component, the Hub bridge and the Node tests.

export const STATES = ['idle', 'welcome', 'thinking', 'speaking', 'working', 'celebrate', 'help', 'sleep', 'error'];

export const EXPRESSIONS = ['neutral', 'happy', 'excited', 'thinking', 'surprised', 'wink', 'focused', 'typing', 'helpful', 'sleepy', 'concerned'];

export const SCREEN_MODES = ['logo', 'crm', 'analytics', 'website', 'marketing', 'automation', 'support', 'roadmap', 'security'];

// States that end by themselves and fall back to idle (milliseconds).
export const TRANSIENT = { welcome: 2600, celebrate: 2600 };

// Default face for every state. A manual expression override wins.
export const STATE_EXPRESSION = {
  idle: 'neutral', welcome: 'happy', thinking: 'thinking', speaking: 'neutral', working: 'focused',
  celebrate: 'excited', help: 'helpful', sleep: 'sleepy', error: 'concerned',
};

// Belly screen shown for a state. `null` = the current business mode.
export const STATE_SCREEN = {
  idle: null, welcome: null, thinking: 'processing', speaking: 'message', working: null,
  celebrate: 'success', help: 'help', sleep: 'rest', error: 'warning',
};

const BUSY = new Set(['thinking', 'working', 'speaking']);

export function normalizeState(name) {
  const value = String(name || '').toLowerCase();
  if (value === 'sleeping') return 'sleep';
  if (value === 'celebrating') return 'celebrate';
  if (value === 'helping') return 'help';
  return STATES.includes(value) ? value : null;
}

// Automatic (non-explicit) requests come from timers and interaction. They
// must never interrupt real work or an error the customer still has to read.
export function canAuto(current, target) {
  if (target === 'sleep') return current === 'idle';
  if (target === 'welcome') return current === 'idle' || current === 'sleep';
  if (target === 'wake') return current === 'sleep';
  if (target === 'hover') return current === 'idle';
  return !BUSY.has(current) && current !== 'error';
}

// Phases published by src/hub/auri-controller.js (runAuri / pulseAuri).
const PHASES = {
  idle: 'idle', listening: 'idle',
  thinking: 'thinking',
  working: 'working', typing: 'working', drafting: 'working',
  speaking: 'speaking',
  success: 'celebrate', happy: 'celebrate', draft_ready: 'celebrate', evolving: 'celebrate',
  error: 'error',
  sleeping: 'sleep',
};
export function phaseToState(phase) {
  return PHASES[phase] || 'idle';
}

// Restrained speaking time for a text reply when no audio is played.
export function speakingDuration(text) {
  const length = String(text || '').trim().length;
  return Math.round(Math.min(9000, Math.max(1500, 700 + length * 32)));
}

// The greeting plays once per browser session per scope.
export function shouldGreet(storage, key = 'auri-greeted') {
  try {
    if (storage?.getItem(key)) return false;
    storage?.setItem(key, '1');
  } catch { /* storage blocked: greet, but never throw */ }
  return true;
}
