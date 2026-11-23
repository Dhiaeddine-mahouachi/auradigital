// <auri-character> — AuraHub's Auri. Renders the live layered character
// (media/auri/live) in place of the old still image, everywhere the Hub uses
// auriCharacter(): login, onboarding, the corner companion, the AI Workspace,
// service buttons and chat avatars.
//
// It only mirrors what the Hub already knows:
//   level="1..7"      growth level from verified milestones (D1)
//   data-phase="…"    set by connectAuri() from runAuri/pulseAuri around real requests
//   data-variant      login | guide | face (live head) | avatar (small, still head)
// The <img> inside stays as the fallback when JavaScript modules can't run.

import { createAuri } from './live/auri-live.js';
import { phaseToState } from './live/auri-state.js';

// Hub page → belly screen.
const PAGE_SCREENS = {
  home: 'logo', journey: 'roadmap', tasks: 'roadmap', rewards: 'roadmap', onboarding: 'roadmap',
  services: 'website', websites: 'website', hosting: 'website', projects: 'automation',
  requests: 'support', assistant: 'support', insights: 'analytics', reports: 'analytics',
  orders: 'marketing', invoices: 'crm', settings: 'security', files: 'automation',
};
export const screenForPath = (path = '') => PAGE_SCREENS[String(path).split('/')[2] || 'home'] || 'logo';

const LOGIN_GREETED = 'auri-hub-login-greeted';

class AuriCharacter extends HTMLElement {
  static get observedAttributes() { return ['level', 'data-phase']; }

  connectedCallback() {
    if (this.auri) return;
    const variant = this.dataset.variant || '';
    const avatar = variant === 'avatar' || this.hasAttribute('still');
    this.dataset.live = '';
    try {
      this.auri = createAuri(this, {
        size: 'fill',
        still: avatar,
        level: avatar || variant === 'face' ? 1 : this.level(),
        follow: !avatar,
        followRadius: variant === 'login' ? 900 : 420,
        sleepAfter: avatar ? 0 : 120000,
        greet: variant === 'login',
        greetKey: LOGIN_GREETED,
        screen: screenForPath(location.pathname),
        label: 'Auri',
      });
    } catch (error) {
      // Keep the still image if the live character can't start.
      delete this.dataset.live;
      console.error(error);
      return;
    }
    this.attributeChangedCallback();
    if (variant === 'login') this.stopLogin = watchLoginForm(this.auri);
  }

  disconnectedCallback() {
    this.stopLogin?.();
    this.stopLogin = null;
    this.auri?.destroy();
    this.auri = null;
    delete this.dataset.live;
  }

  level() {
    const value = Number(this.getAttribute('level'));
    // Outside a workspace (login, guide) Auri appears with its full body.
    if (['login', 'guide'].includes(this.dataset.variant)) return Math.max(value || 0, 6);
    return Number.isInteger(value) && value >= 1 && value <= 7 ? value : 1;
  }

  attributeChangedCallback(name) {
    if (!this.auri) return;
    if (!name || name === 'level') {
      if (!['avatar', 'face'].includes(this.dataset.variant) && !this.hasAttribute('still')) this.auri.setOptions({ level: this.level() });
    }
    if (!name || name === 'data-phase') {
      const phase = this.dataset.phase;
      if (phase) {
        const state = phaseToState(phase);
        if (state !== this.auri.state || state === 'celebrate') this.auri.setState(state);
      }
    }
  }
}

// Login / sign-up: Auri looks at the field you are typing in, politely closes
// its eyes while you type a password (and peeks if you press "Show"), thinks
// while the form is sent and looks concerned if the server returns an error.
function watchLoginForm(auri) {
  const ac = new AbortController();
  const on = (type, fn) => document.addEventListener(type, fn, { capture: true, signal: ac.signal });
  const lookAtField = el => {
    const r = el.getBoundingClientRect();
    auri.lookAt(r.left + Math.min(r.width, 120), r.top + r.height / 2);
  };
  const passwordState = el => auri.setExpression(el.type === 'text' ? 'wink' : 'helpful');
  on('focusin', e => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || !el.closest('#auth-form')) return;
    if (el.name === 'password') passwordState(el);
    else { auri.setExpression(null); lookAtField(el); }
  });
  on('focusout', e => {
    if (e.target instanceof HTMLInputElement && e.target.closest('#auth-form')) auri.setExpression(null);
  });
  on('click', e => {
    const eye = e.target instanceof Element && e.target.closest('[data-eye]');
    if (!eye) return;
    const input = eye.closest('.ad-input')?.querySelector('input[name=password]');
    if (input) queueMicrotask(() => passwordState(input));
  });
  on('submit', e => {
    if (!(e.target instanceof HTMLFormElement) || e.target.id !== 'auth-form') return;
    auri.setExpression(null);
    auri.setState('thinking');
    // The form shows its own error text; Auri only reacts to it.
    const error = e.target.querySelector('.form-error');
    if (!error) return;
    const watch = new MutationObserver(() => {
      if (error.textContent.trim()) { auri.setState('error', { duration: 5000 }); watch.disconnect(); }
    });
    watch.observe(error, { childList: true, characterData: true, subtree: true });
    setTimeout(() => { watch.disconnect(); if (auri.state === 'thinking') auri.setState('idle'); }, 20000);
  });
  return () => ac.abort();
}

if (!customElements.get('auri-character')) customElements.define('auri-character', AuriCharacter);
