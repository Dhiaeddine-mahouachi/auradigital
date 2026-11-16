# AuraDigital — Hub-Matched Landing Experience (2026-11-16)

## Product intent

The public landing page is the introduction to the **same product** that customers enter after signup: AuraHub / Aura Command. It is not a separate agency brochure. Visitors should understand, visually and within seconds, what Auri does, what their roadmap will look like, what can be built, and how work gets delivered.

**One-sentence positioning:** Tell Auri about your business. Get a practical roadmap, launch what matters, and track everything in one workspace.

## Design source of truth

- Read the live Hub at `/hub/login` and the Hub styles in `hub/hub.css`, particularly `.aurahub-shell`, `.hub-welcome`, `.service-grid`, `.vision-stage`, `.growth-primary`, `.auri`.
- Share Hub tokens visually: graphite/canvas `#0b1010`–`#151a17`, raised panels `#171c19`–`#202720`, borders `#353f35`, lime CTA and active status `#eaff33`, off-white `#eff4e9`, muted green-gray `#afbeb0`.
- Use the same AuraDigital official icon and Auri level-1 mascot assets already in the repository.
- Typography: Inter / Segoe UI fallback. Oversized but clean hero; readable UI labels; cards have consistent radius, outline and typography.
- The landing must preview the product, not pretend to use private customer data. Mocked content requires visible `INTERACTIVE EXAMPLE` or `ILLUSTRATIVE PREVIEW` labeling.
- Preserve accessible keyboard navigation, language switching provided by the shared site, reduced-motion accessibility, and mobile layouts. Avoid heavy libraries and unnecessary video loads.

## Exact page structure and section-by-section copy

### 00. Hero / software introduction
- Kicker: `AURADIGITAL / THE BUSINESS GROWTH OS`
- Headline: **Meet Auri. Build what's next.**
- Body: `Meet Auri, build a plan for your business, launch the right digital tools, and track everything in your own AuraHub.`
- Primary CTA: **Build my roadmap** → `/hub/signup`.
- Secondary: **Explore the system** → `#see-it`.
- Visual: Hub-like application frame with Growth Vision path, next mission and Auri beside it. Use working `/hub` links, not fake internal actions.
- Trust: `AI-guided from day one`, `Real people when you need them`. Do not claim delivery within 24 hours without an enforceable SLA.

### 01. Persona-led experience (interactive)
- Kicker: `01 / THE EXPERIENCE`
- Heading: **Made for your kind of business.**
- Lead: `Every business starts somewhere different. Try a scenario to see how Auri might organize your next steps.`
- Four accessible choices: Restaurant & café, Local services, Retail & shops, Creator & freelancer.
- Right-hand panel is an **illustrative AuraHub workspace** with Auri's tailored suggestion and three suggested steps.
- Explicitly state all paths are adjustable and optional steps can be skipped.
- CTA: **Build my actual roadmap** → `/hub/signup`.

### 02. The journey (process)
- Kicker: `02 / THE JOURNEY`
- Heading: **From idea to action. All in one flow.**
- Three steps: **Talk to Auri** / **Get your roadmap** / **Build and track**.
- Show AI guidance plus human delivery support, without promising fully automatic fulfillment when unavailable.

### 03. Product showcase (real imagery / labeled examples)
- Kicker: `03 / WHAT WE BUILD`
- Heading: **See the work. Imagine yours.**
- Website: existing real `/project-mutlu.png`, links to `/portfolio#mutlu`.
- AuraMenu: existing `/qr-menu-phone.svg` plus screenshot captured from the public `https://auramenu.space/` site, saved at `/media/landing/auramenu-live-20261116.png`. Link to `/aura-menu`.
- WhatsApp automation: accessible chat and lead-routing demonstration, **ILLUSTRATIVE EXAMPLE**, links to `/services#automation`.
- Creative web project: existing `/project-gateaux.png`, links to `/portfolio#gateaux`.
- Keep prices out of the public homepage; real delivery scope, dates and pricing are confirmed for each request.
- Avoid fabricated revenue, testimonials, performance numbers, customer quotes or unimplemented integrations.

### 04. Meet Auri
- Kicker: `04 / MEET AURI`
- Heading: **You ask. We make it happen.**
- Auri example interaction should be visually connected to AuraHub; examples are explicit, and real AI is used only in the actual Hub.
- Buttons lead to the true assistant `/hub`.

### 05. Inside AuraHub (interactive product demonstration)
- Kicker: `05 / INSIDE AURAHUB`
- Heading: **Not another tab. Your command center.**
- Four accessible tabs: **Growth Vision**, **My Services**, **Requests**, **Auri Assistant**.
- Contents preview mission stages, service deliverables, quote/production/handoff flow and Auri support using example data.
- The panel uses the *same visual design* as Hub's navigation and cards.
- Tabs work by mouse, touch and keyboard arrows; do not navigate or access customer APIs.
- CTA: **Create your free workspace** → `/hub/signup`.

### 06. Proof / portfolio
- Kicker: `06 / REAL WORK`
- Heading: **Not just a plan. Something real.**
- Portfolio and team links remain; use actual project assets instead of generic claims.

### 07. Final conversion
- Heading: **Make your next move count.**
- CTA: **Build my roadmap** → `/hub/signup`.
- Existing global footer and navbar remain; do not add public price cards or duplicate service menus.

## CODEX IMPLEMENTATION PROMPT — exact execution specification

**Role:** Act as AuraDigital's senior product designer, frontend engineer, accessibility QA, and Cloudflare deployment owner.

**Repository:** `Dhiaeddine-mahouachi/auradigital`

**Task:** Upgrade the *existing* public landing page (not a new app) into a public preview of the current AuraHub experience. The detailed page structure and section copy above are authoritative. Do not replace or revert existing Hub onboarding, AI integrations, customer data, authentication, or brand assets.

**Workflow:**
1. Pull current `main`; inspect `index.html`, `home-command.css`, `home-command.js`, `hub/hub.css`, `src/hub/service-view.js`, `src/hub/auri-companion.js`, and relevant portfolio/media assets. Verify that links and asset paths are real.
2. Reuse the existing layout, header, footer, brand and Auri. Add isolated landing styles and small, unobtrusive JavaScript behavior. Do not create a competing design system.
3. Match the Hub's actual surfaces, colors, spacing, borders, font weights, active states, service cards and motion patterns. Do not invent a mock Hub unrelated to the production visual language.
4. Implement persona selector (restaurant/local services/retail/creator), product showcase (real website screenshots and AuraMenu image), illustrative chatbot flow, and keyboard-operable Hub preview tabs. The actual assistant remains in AuraHub.
5. All example metrics, workflows and states must be explicitly identified as examples. Do not imply real current customer data, production automation, or automatic delivery where not implemented.
6. Ensure desktop 1440px, tablet 820px and phones 390px/320px are responsive without horizontal scrolling. Respect `prefers-reduced-motion` and visible keyboard focus.
7. Run `node --check home-command.js`, `node --check home-experience.js`, `npm run check`, and browser smoke tests for links, tab switching, persona switching, images, a11y landmarks, and viewport overflow. Record failures; do not conceal unrelated existing tests.
8. Open a focused PR with evidence, review the preview, merge only if verification passes, then check live production content. Provide the PR URL, live URL and precise status.

**Acceptance criteria:**
- Landing and Hub feel like the same brand/product across first visit → signup → Hub.
- An ordinary business owner understands onboarding, roadmap, service selection and delivery without long text.
- Genuine AuraMenu and business-website images are visible.
- Automation and AI examples are visually clear and not misleading.
- Every CTA goes to an existing route.
- No dead buttons, no broken images, no horizontal overflow at mobile widths.
- No regression of Hub auth/production data.
