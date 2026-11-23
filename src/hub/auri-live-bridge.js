// Connects the live Auri character to the Hub's existing Auri controller
// (src/hub/auri-controller.js). The controller already publishes real phases
// from runAuri/pulseAuri around actual requests, so the character only
// mirrors them — no timers, no separate chatbot.
//
//   import { createAuri } from '../../media/auri/live/auri-live.js';
//   import { bindAuriLive } from './auri-live-bridge.js';
//   const auri = createAuri(host, { size: 160, interactive: true });
//   const unbind = bindAuriLive(auri, 'workspace', { screen: 'crm' });

import { watchAuri } from './auri-controller.js';
import { phaseToState } from '../../media/auri/live/auri-state.js';

// Hub module → belly screen mode.
export const MODULE_SCREENS = {
 overview: 'logo', roadmap: 'roadmap', journey: 'roadmap', 'growth-vision': 'roadmap',
 crm: 'crm', customers: 'crm', insights: 'analytics', analytics: 'analytics',
 website: 'website', services: 'website', marketing: 'marketing', ads: 'marketing',
 automation: 'automation', workflows: 'automation', support: 'support', requests: 'support',
 security: 'security', settings: 'security',
};

export function bindAuriLive(auri, scope, { screen, messages = {} } = {}) {
 if (screen) auri.setScreen(MODULE_SCREENS[screen] || screen);
 let last = '';
 return watchAuri(scope, phase => {
  const state = phaseToState(phase);
  if (state === last && state !== 'celebrate') return;
  last = state;
  auri.setState(state, messages[phase] ? { message: messages[phase] } : {});
 });
}
