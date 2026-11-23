// Auri live — website dock (opt-in). Not loaded by any page yet.
//
// Adds a small floating Auri in the bottom-right corner that opens the
// EXISTING chat (it clicks the current launcher, it does not create a new
// chatbot) and reacts to the existing AI endpoints:
//   request starts → thinking · reply arrives → speaking · request fails → error
//
//   <script type="module" src="/media/auri/live/auri-site.js"></script>
//   (or import { mountAuriDock } and call it yourself)

import { createAuri } from './auri-live.js';
import { speakingDuration } from './auri-state.js';

const DOCK_CSS = `
.auri-dock{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:60;
 pointer-events:none;display:flex;justify-content:flex-end}
.auri-dock .auri-live{pointer-events:auto}
html.auri-live-docked .auri-fab,html.auri-live-docked #chatLauncher{opacity:0!important;pointer-events:none!important}
@media print{.auri-dock{display:none}}
`;

// Existing launchers, in order of preference: the redesign landing FAB and the
// classic assistant/ui.js launcher.
const LAUNCHERS = ['.auri-fab', '#chatLauncher'];
const AI_REQUEST = /\/api\/ai\/message(?:$|\?)/;

export function mountAuriDock({
  doc = document, size, launcher, onActivate, observeRequests = true, greetMessage,
} = {}) {
  const win = doc.defaultView;
  if (!doc.getElementById('auri-dock-styles')) {
    const style = doc.createElement('style');
    style.id = 'auri-dock-styles';
    style.textContent = DOCK_CSS;
    doc.head.append(style);
  }
  const compact = win.matchMedia('(max-width: 640px), (pointer: coarse)');
  const dock = doc.createElement('div');
  dock.className = 'auri-dock';
  doc.body.append(dock);
  const auri = createAuri(dock, {
    size: size || (compact.matches ? 74 : 104),
    interactive: true,
    align: 'end',
    greet: true,
    greetKey: 'auri-site-greeted',
    sleepAfter: 120000,
    label: 'Open the AuraDigital assistant',
  });
  const resize = () => { if (!size) auri.setSize(compact.matches ? 74 : 104); };
  compact.addEventListener?.('change', resize);

  const findLauncher = () => launcher || LAUNCHERS.map(sel => doc.querySelector(sel)).find(Boolean);
  if (findLauncher()) doc.documentElement.classList.add('auri-live-docked');
  const offActivate = auri.on('activate', () => {
    if (onActivate) return onActivate(auri);
    const target = findLauncher();
    if (target) target.click();
    else auri.say('The assistant is loading — try again in a moment.', { duration: 3000 });
  });
  const offGreeting = greetMessage ? auri.on('statechange', ({ to }) => {
    if (to === 'welcome') auri.say(greetMessage, { duration: 4200 });
  }) : () => {};

  const stopObserving = observeRequests ? observeAuriRequests(auri, { win }) : () => {};

  return {
    auri,
    destroy() {
      offActivate(); offGreeting(); stopObserving();
      compact.removeEventListener?.('change', resize);
      auri.destroy();
      dock.remove();
      doc.documentElement.classList.remove('auri-live-docked');
    },
  };
}

// Observes (never changes) same-origin AI requests so Auri reacts to real
// events. The response is cloned; the page still receives the original.
export function observeAuriRequests(auri, { win = window, match = AI_REQUEST } = {}) {
  const original = win.fetch;
  if (typeof original !== 'function') return () => {};
  let pending = 0;
  const wrapped = function auriObservedFetch(input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!match.test(url)) return original.apply(this, arguments);
    pending++;
    auri.setState('thinking');
    const promise = original.apply(this, arguments);
    promise.then(async res => {
      pending--;
      if (!res.ok) {
        if (!pending) auri.setState('error', { message: 'I couldn’t answer that just now. Please try again in a moment.', duration: 6000 });
        return;
      }
      let reply = '';
      try { reply = (await res.clone().json())?.reply || ''; } catch { /* non-JSON reply */ }
      if (!pending) auri.setState('speaking', { duration: speakingDuration(reply) });
    }, error => {
      pending--;
      if (!pending && error?.name !== 'AbortError') auri.setState('error', { message: 'The connection dropped. Please try again.', duration: 6000 });
      else if (!pending) auri.setState('idle');
    });
    return promise;
  };
  win.fetch = wrapped;
  return () => { if (win.fetch === wrapped) win.fetch = original; };
}

// Auto-mount only when the script tag opts in with data-auto.
if (typeof document !== 'undefined') {
  const tag = [...document.querySelectorAll('script[type=module][src*="auri-site.js"]')].find(s => s.hasAttribute('data-auto'));
  if (tag) {
    const start = () => mountAuriDock({ greetMessage: tag.dataset.greeting || undefined });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
}
