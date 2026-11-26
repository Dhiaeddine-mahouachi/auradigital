// Auri live — opt-in website dock for the Studio character.
//
// Adds a small floating Auri in the bottom-right corner that opens the
// EXISTING chat (it clicks the current launcher, it does not create a new
// chatbot) and reacts to the existing AI endpoints:
//   request starts → thinking · reply arrives → speaking · request fails → error
//
//   <script type="module" src="/media/auri/live/auri-site.js"></script>
//   (or import { mountAuriDock } and call it yourself)

import { createAuri } from './auri-live.js?v=compact-v2';
import { speakingDuration } from './auri-state.js';

// Existing launchers, in order of preference: the redesign landing FAB and the
// classic assistant/ui.js launcher.
const LAUNCHERS = ['.auri-fab', '#chatLauncher'];
const AI_REQUEST = /\/api\/ai\/message(?:$|\?)/;

export function mountAuriDock({
  doc = document, size, launcher, onActivate, observeRequests = true, greetMessage, screen, page,
} = {}) {
  const win = doc.defaultView;
  let stylesheet = doc.querySelector('link[href*="/media/auri/live/compact.css"]');
  const styled = stylesheet?.sheet ? Promise.resolve(true) : new Promise(resolve => {
    const existing = Boolean(stylesheet);
    if (!stylesheet) {
      stylesheet = doc.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/media/auri/live/compact.css?v=compact-v3';
    }
    stylesheet.addEventListener('load', () => resolve(true), { once: true });
    stylesheet.addEventListener('error', () => resolve(false), { once: true });
    if (!existing) doc.head.append(stylesheet);
  });
  const compact = win.matchMedia('(max-width: 640px)');
  const dock = doc.createElement('div');
  dock.className = 'auri-dock auri-site-dock';
  dock.hidden = true;
  if (typeof size === 'number') dock.style.setProperty('--auri-launcher-size', `${size}px`);
  doc.body.append(dock);
  const auri = createAuri(dock, {
    size: size ?? (compact.matches ? 44 : 48),
    externalStill: true,
    interactive: true,
    align: 'end',
    greet: true,
    greetKey: 'auri-site-greeted',
    sleepAfter: 120000,
    label: 'Open the AuraDigital assistant',
  });
  const resize = () => { if (size == null) auri.setSize(compact.matches ? 44 : 48); };
  compact.addEventListener?.('change', resize);

  const findLauncher = () => launcher || LAUNCHERS.map(sel => doc.querySelector(sel)).find(Boolean);
  // Keep the identical still interactive until the animated art can paint.
  Promise.all([auri.ready, styled]).then(([loaded, applied]) => {
    if (!loaded || !applied || !dock.isConnected) return;
    const target = findLauncher();
    const transferFocus = target === doc.activeElement;
    dock.hidden = false;
    if (target) doc.documentElement.classList.add('auri-live-docked');
    if (transferFocus) auri.element.focus({ preventScroll: true });
  });
  const offActivate = auri.on('activate', () => {
    if (onActivate) return onActivate(auri);
    const target = findLauncher();
    if (target) target.click();
    else auri.say(copyFor(doc).busy, { duration: 3000 });
  });
  const offGreeting = greetMessage ? auri.on('statechange', ({ to }) => {
    if (to === 'welcome') auri.say(greetMessage, { duration: 4200 });
  }) : () => {};

  const stopObserving = observeRequests ? observeAuriRequests(auri, { win }) : () => {};
  const stopPanel = watchChatPanel(auri, { doc, win, busy: () => stopObserving.pending?.() > 0 });
  if (screen) auri.setScreen(screen);
  const stopPage = pageBehaviour(auri, page, { win, doc, compact });

  return {
    auri,
    destroy() {
      offActivate(); offGreeting(); stopObserving(); stopPanel(); stopPage();
      compact.removeEventListener?.('change', resize);
      auri.destroy();
      dock.remove();
      doc.documentElement.classList.remove('auri-live-docked');
    },
  };
}

const COPY = {
  en: { lost: 'This page has moved or no longer exists.', home: 'Go to the home page', pick: 'Not sure which package fits? Tap me and ask.', busy: 'The assistant is loading — try again in a moment.', fail: 'I couldn’t answer that just now. Please try again in a moment.', drop: 'The connection dropped. Please try again.' },
  tr: { lost: 'Bu sayfa taşındı veya artık yok.', home: 'Ana sayfaya git', pick: 'Hangi paketin uygun olduğundan emin değil misiniz? Bana dokunun ve sorun.', busy: 'Asistan yükleniyor — birazdan tekrar deneyin.', fail: 'Şu an yanıt veremedim. Lütfen birazdan tekrar deneyin.', drop: 'Bağlantı kesildi. Lütfen tekrar deneyin.' },
  ar: { lost: 'تم نقل هذه الصفحة أو لم تعد موجودة.', home: 'الذهاب إلى الصفحة الرئيسية', pick: 'لست متأكدًا من الباقة المناسبة؟ اضغط عليّ واسأل.', busy: 'المساعد قيد التحميل — حاول بعد لحظة.', fail: 'تعذّر الرد الآن. حاول مرة أخرى بعد قليل.', drop: 'انقطع الاتصال. حاول مرة أخرى.' },
  fr: { lost: 'Cette page a été déplacée ou n’existe plus.', home: 'Aller à l’accueil', pick: 'Vous hésitez entre les offres ? Touchez-moi et demandez.', busy: 'L’assistant se charge — réessayez dans un instant.', fail: 'Je n’ai pas pu répondre. Réessayez dans un instant.', drop: 'La connexion a été coupée. Réessayez.' },
};
export const copyFor = (doc = document) => COPY[String(doc.documentElement.lang || 'en').slice(0, 2)] || COPY.en;

// Small, once-only page behaviours. Never on phones for hints.
function pageBehaviour(auri, page, { win, doc, compact }) {
  const timers = [];
  if (page === '404') {
    timers.push(win.setTimeout(() => {
      const c = copyFor(doc);
      auri.setState('error', { message: c.lost, action: { label: c.home, onClick: () => win.location.assign('/') } });
    }, 700));
  }
  if (page === 'packages' && !compact.matches) {
    let seen = false;
    try { seen = !!win.sessionStorage.getItem('auri-hint-packages'); } catch { /* blocked */ }
    if (!seen) timers.push(win.setTimeout(() => {
      if (auri.state !== 'idle') return;
      try { win.sessionStorage.setItem('auri-hint-packages', '1'); } catch { /* blocked */ }
      auri.setState('help', { direction: 'left', message: copyFor(doc).pick, duration: 7000 });
    }, 25000));
  }
  return () => timers.forEach(id => win.clearTimeout(id));
}

// Some answers come from the chat's built-in replies, without a request.
// Auri thinks when the visitor sends a message and speaks when a reply
// appears in the existing panel (the visitor's own message is ignored).
const PANELS = '.auri-panel, #chatPanel';
export function watchChatPanel(auri, { doc = document, win = window, busy = () => false } = {}) {
  let sent = '', waiting = false, settle = 0, gathered = '';
  const ac = new AbortController();
  const fromPanel = el => el instanceof win.Element && el.closest(PANELS);
  const start = text => {
    if (!text.trim()) return;
    sent = text.trim(); waiting = true; gathered = '';
    if (!busy()) auri.setState('thinking');
  };
  doc.addEventListener('keydown', e => {
    const el = e.target;
    if (e.key === 'Enter' && !e.shiftKey && fromPanel(el) && 'value' in el) start(el.value);
  }, { capture: true, signal: ac.signal });
  doc.addEventListener('click', e => {
    const btn = e.target instanceof win.Element && e.target.closest('button');
    if (!btn || !fromPanel(btn)) return;
    const field = btn.closest('form, ' + PANELS)?.querySelector('input:not([type=checkbox]), textarea');
    if (field && field.value.trim() && (btn.type === 'submit' || /↗|→|send|gönder|envoyer|إرسال/i.test(btn.textContent + (btn.getAttribute('aria-label') || '')))) start(field.value);
  }, { capture: true, signal: ac.signal });
  const observer = new win.MutationObserver(records => {
    if (!waiting) return;
    for (const r of records) for (const node of r.addedNodes) {
      if (!fromPanel(node.nodeType === 1 ? node : node.parentElement)) continue;
      const text = (node.textContent || '').trim();
      if (text && text !== sent && !text.endsWith(sent)) gathered += ' ' + text;
    }
    if (!gathered) return;
    win.clearTimeout(settle);
    settle = win.setTimeout(() => {
      waiting = false;
      if (!busy()) auri.setState('speaking', { duration: speakingDuration(gathered) });
    }, 300);
  });
  observer.observe(doc.body, { childList: true, subtree: true });
  return () => { ac.abort(); observer.disconnect(); win.clearTimeout(settle); };
}

// Observes (never changes) same-origin AI requests so Auri reacts to real
// events. The response is cloned; the page still receives the original.
export function observeAuriRequests(auri, { win = window, match = AI_REQUEST } = {}) {
  const doc = win.document;
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
        if (!pending) auri.setState('error', { message: copyFor(doc).fail, duration: 6000 });
        return;
      }
      let reply = '';
      try { reply = (await res.clone().json())?.reply || ''; } catch { /* non-JSON reply */ }
      if (!pending) auri.setState('speaking', { duration: speakingDuration(reply) });
    }, error => {
      pending--;
      if (!pending && error?.name !== 'AbortError') auri.setState('error', { message: copyFor(doc).drop, duration: 6000 });
      else if (!pending) auri.setState('idle');
    });
    return promise;
  };
  win.fetch = wrapped;
  const restore = () => { if (win.fetch === wrapped) win.fetch = original; };
  restore.pending = () => pending;
  return restore;
}

// Auto-mount only when the script tag opts in with data-auto.
if (typeof document !== 'undefined') {
  const tag = [...document.querySelectorAll('script[type=module][src*="auri-site.js"]')].find(s => s.hasAttribute('data-auto'));
  if (tag) {
    const start = () => mountAuriDock({ greetMessage: tag.dataset.greeting || undefined, screen: tag.dataset.screen, page: tag.dataset.page });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
}
