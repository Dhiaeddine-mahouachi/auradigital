# Auri live character

A layered, animated Auri that matches the emerald Auri reference sheet (cream
helmet, glossy black visor, mint eyes, “A” side lights, belly screen, short
arms and legs). It is **not wired into any production page yet**. Review it on
the preview page first.

* Preview: `/auri-preview/index.html` (noindex, not linked from the site)
* Component: `media/auri/live/auri-live.js` (ES module, no dependencies)
* State rules: `media/auri/live/auri-state.js` (pure, unit-tested)
* Website dock: `media/auri/live/auri-site.js` (opt-in)
* Hub bridge: `src/hub/auri-live-bridge.js` (mirrors `auri-controller.js` phases)

## Why a layered SVG rig

* The reference is a flattened image. It has no separate parts, so it can't be articulated as it is.
* The existing `media/auri/auri.glb` is a different design (yellow eyes, round
  dark torso, no belly screen). Its WebGL viewer is already switched off because it
  froze tabs on some drivers (`media/auri/character.js`).
* Auri was therefore redrawn as vector parts with their own pivots: head, face/eyes, left
  arm, right arm, body, belly screen, legs and side lights. Motion uses transforms and
  opacity, the component is about 38 KB minified (13 KB gzipped) with no images, and it stays sharp at 64–440 px.

## API

```js
import { createAuri } from '/media/auri/live/auri-live.js';
const auri = createAuri(host, { size: 160, interactive: true, greet: true });

auri.setState('thinking');                 // idle welcome thinking speaking working
                                           // celebrate help sleep error
auri.setState('working', { operation: 'Publishing website', progress: .4 });
auri.setState('help', { target: buttonEl, message: 'Pricing compares every package.' });
auri.setState('error', { message: 'Nothing was changed.', action: { label: 'Retry', onClick } });
auri.setScreen('crm', { data: { stats: [{ label: 'Leads', value: 12 }] }, demo: false });
auri.setExpression('wink');                // or null to follow the state
await auri.run(() => api(), { busy: 'thinking', success: 'celebrate' });
await auri.speak(reply);                   // restrained speaking, duration from text length
await auri.speak(reply, { voice: true });  // device voice; face pulses on real word boundaries
auri.setVoiceLevel(0.7);                   // drive from a real audio analyser instead
auri.on('activate', openChat);             // click / Enter / Space
auri.destroy();
```

Also available as `<auri-live state="idle" screen="crm" size="160" interactive>` after
`defineAuriElement()`.

### State rules

* `welcome` and `celebrate` return to idle on their own after 2.6 s.
* Inactivity sleep and the greeting are *automatic* requests. They never interrupt
  thinking, working, speaking or an error the customer still has to read.
* Every `setState` cancels the previous state's timers. In `run()`, only the latest call
  can settle the state, so out-of-order responses can't overwrite it.
* The greeting plays once per browser session (`sessionStorage`), not on every navigation.

### Belly screen

The modes are logo, CRM, analytics, website, marketing, automation, support, roadmap
and security. States override the mode while they last: processing (thinking), message
(speaking), success (celebrate), help, a calm amber warning (error) and a dimmed moon
(sleep). Working keeps the mode and adds the operation label and a progress bar.

**Data:** the screen shows neutral illustrations with a `DEMO` tag. Figures only appear
when the caller passes `data.stats`, which must come from an endpoint the viewer is
already authorized for. Public pages must never pass customer data.

## Integration (after approval)

**Hub.** Mount next to the existing chat and mirror the controller:

```js
import { createAuri } from '../../media/auri/live/auri-live.js';
import { bindAuriLive } from './auri-live-bridge.js';
const auri = createAuri(dockEl, { size: 96, interactive: true, align: 'end' });
const unbind = bindAuriLive(auri, scope, { screen: currentModule });   // 'crm', 'roadmap', ...
auri.on('activate', () => openAuriChat());
```

`runAuri` already wraps the real requests, so thinking/working/success/error follow
actual server responses. Growth Vision milestones should call
`auri.setState('celebrate')` only after the verified milestone response.

**Website.** Add one tag to a page to try the dock:

```html
<script type="module" src="/media/auri/live/auri-site.js" data-auto></script>
```

The dock hides the current launcher (`.auri-fab` or `#chatLauncher`) and clicks it on
activation, so the existing chat, session, memory and consent flow are unchanged. It
observes `/api/ai/message` responses through a pass-through `fetch` wrapper (clone only),
which gives thinking → speaking → idle, or error. CSP is unaffected: the script is
same-origin and styles are injected (`style-src 'unsafe-inline'` is already allowed).

## Performance & accessibility (measured in headless Chrome)

| Check | Result |
| --- | --- |
| Frame rate, busy scene (speaking + automation screen) | 60 fps, 0 long tasks |
| Script time per frame | ≈0.4 ms average |
| Off-screen / hidden tab | 0 frames (IntersectionObserver + visibilitychange) |
| Sleep state | throttled to 24 fps |
| Reduced motion | loop stops, static poses, 0 frames while idle |
| 1,500 create/destroy cycles | heap flat (±6 KB after warm-up), no DOM left |
| Keyboard | `role=button`, `tabindex=0`, Enter/Space activate, visible focus ring |
| Messages | bubble is `role=status`, `aria-live=polite` |
| Touch | no cursor following, tap opens chat, compact 74 px dock |

Each animation frame writes SVG attributes, which triggers a small style and layout pass
that stays inside the character (`contain: layout style`). No page reflow was measured.

## Limitations / assets that would improve fidelity

* This is a 2.5D front view. Turning the head is simulated with offsets and tilt, and there
  are no true 3/4 or side views. A rigged model of the **new** design (separate
  head/arms/legs, belly screen as its own material) would be needed for real turns.
* Lip-sync is intentionally absent, as the brief asks. With voice, motion follows word
  boundaries or `setVoiceLevel`.
* The landing page bundle (`redesign/app.js`) is compiled, so the dock sits beside the
  existing FAB (hidden) rather than replacing its internals.
* The pixel versions (16/32 px) from the sheet are not included. The vector rig is used at all sizes.
