# Auri live character

Auri uses the cream, emerald, black, mint and yellow character from
Auri 3D Studio. Transparent WebP layers rendered from the Studio model give
Auri the same helmet, visor, limbs and chest bars across the website and Hub.

* Full model and motion lab: `/auri-preview/index.html`
* Lightweight live component: `media/auri/live/auri-live.js`
* Shared art: `media/auri/studio-v1/`
* State rules: `media/auri/live/auri-state.js`
* Website dock: `media/auri/live/auri-site.js`
* Hub state bridge: `src/hub/auri-live-bridge.js`

An SVG wrapper animates the rendered pieces, so the dock and Hub do not need a
WebGL context. A new-design still remains visible during startup and if a layer
fails to load. Render the layers from the Studio rig with
`node scripts/render-auri-parts.mjs`.

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
await auri.speak(reply);                   // silent, restrained speaking (duration from text length)
await auri.speak(reply, { voice: true });  // human voice (see Voice below)
await auri.speak(reply, { audio: blobOrUrl }); // play a recorded / generated voice file
auri.stopVoice();
auri.setVoiceLevel(0.7);                   // drive from your own audio analyser instead
auri.on('activate', openChat);             // click / Enter / Space
auri.destroy();
```

Also available as `<auri-live state="idle" screen="crm" size="160" interactive>` after
`defineAuriElement()`.

### Voice

`speak(text, { voice: true })` picks, in order:

1. **`ttsUrl`** (option). If it's set, Auri POSTs `{ text, lang, voice }` there and plays
   the returned audio. The face follows the real loudness of the audio through a Web Audio
   analyser. This is the way to get a truly human, consistent voice on every device. It
   needs a same-origin Worker endpoint that calls a neural text-to-speech service. That
   endpoint is **not built yet**, because it adds per-request cost and needs rate limits.
2. **The most natural voice on the device.** `rankVoices()` puts neural voices first:
   Edge “Online (Natural)”, Google, and Apple Premium/Enhanced/Siri. Robotic voices
   (eSpeak, Zarvox, …) go last, and the language is matched to the page.
   `voiceName`, `voiceRate` (0.96) and `voicePitch` (1.02) can be set with `setOptions`.
3. Nothing to play: the silent speaking animation.

Auri only cancels speech it started itself, so the Hub's existing "read aloud" is not affected.

### State rules

* `welcome` and `celebrate` return to idle on their own after 2.6 s.
* Inactivity sleep and the greeting are *automatic* requests. They never interrupt
  thinking, working, speaking or an error the customer still has to read.
* Every `setState` cancels the previous state's timers. In `run()`, only the latest call
  can settle the state, so out-of-order responses can't overwrite it.
* The greeting plays once per browser session (`sessionStorage`), not on every navigation.

### Belly screen

The modes are growth bars (logo), CRM, analytics, website, marketing, automation, support, roadmap
and security. States override the mode while they last: processing (thinking), message
(speaking), success (celebrate), help, a calm amber warning (error) and a dimmed moon
(sleep). Working keeps the mode and adds the operation label and a progress bar.

**Data:** the screen shows neutral illustrations with a `DEMO` tag. Figures only appear
when the caller passes `data.stats`, which must come from an endpoint the viewer is
already authorized for. Public pages must never pass customer data.

## Where Auri appears

| Place | How | Belly screen |
| --- | --- | --- |
| Home, About | corner dock | yellow growth bars |
| Solutions | corner dock | automation |
| Packages | corner dock + one hint per visit after 25 s (desktop only) | roadmap |
| Service shop, Shop | corner dock | marketing |
| AuraMenu, AuraWeddings, Portfolio | corner dock | website |
| Help, Contact | corner dock | support |
| 404 | corner dock, concerned, "Go to the home page" button | warning |
| AuraHub login / sign-up | side panel (desktop), above the form (mobile) | yellow growth bars |
| AuraHub (every page) | the existing `<auri-character>` element, now live | follows the Hub page |

Not included: wedding invitation pages (guests' pages), NFC builder/status (order flows),
admin and employee portals. `test/auri-live.test.mjs` fails if this list drifts.

### Website dock

The dock takes the old yellow button's exact place: 84×97 px on desktop and 64×74 px on
phones, at the same corner offsets. The old button stays in the page, invisible and the
same size, so the existing chat panel still opens right above Auri. On phones the existing
chat is full screen and covers Auri while open. Auri reacts to both kinds of answer:
replies from `/api/ai/message` (observed through a pass-through `fetch` wrapper) and the
chat's built-in replies (observed in the panel; the visitor's own message is ignored).

### AuraHub

`media/auri/character.js` upgrades every `<auri-character>` to the live character, so the
login, onboarding, the corner companion, the AI Workspace, service buttons, the home hero
and the chat avatars all use it. It mirrors `data-phase` from `connectAuri()`, so states
follow `runAuri()`/`pulseAuri()` around real requests.

Growth levels from verified milestones still show:

* Level 1: head only
* Level 2: head and body
* Level 3: arms and legs added
* Level 4: business belly screens turn on
* Levels 5–6: brighter background glow
* Level 7: the full character with its highest verified growth level

Small places use `variant="face"` (a live head) or `variant="avatar"` (a still head, used
in chat bubbles).

On login, Auri waves once per visit, looks at the field being typed in, closes its eyes
while a password is typed (and winks if “Show” is pressed), thinks while the form is
sent, and looks concerned when the form shows an error. The form's own error text is not
duplicated.

**Caching:** `/media/*` is cached for 7 days, so `_headers` removes that rule for
`/media/auri/live/*`. Those files use Cloudflare's default revalidation instead, which
means updates reach visitors immediately.

## Using it elsewhere

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

* The embedded character animates from the front. The Studio supports true 3D camera turns and prop poses.
* The embedded mouth and sound waves react to speech rhythm and measured audio level.
* Device voices depend on the browser and OS. The most human-sounding ones are in Edge and
  Chrome (desktop and Android) and on Apple devices with enhanced voices installed. For the
  same human voice everywhere, use `ttsUrl`.
* The landing page bundle (`redesign/app.js`) is compiled, so the dock sits beside the
  existing FAB (hidden) rather than replacing its internals.
* The pixel versions (16/32 px) from the sheet are not included. The vector rig is used at all sizes.
