# AuraHub 4.0 — Aura Command, Aura Journey, Aura Studio

Branch: `aurahub-4-redesign`. Nothing was deployed and no production database or secret was touched.

## Audit summary (before changes)

- **Stack.** Cloudflare Worker (`src/worker-entry.js`), D1 (`DB`), static assets. AuraHub is a vanilla-JS SPA in `src/hub/*` bundled by esbuild into `hub/app.js` (`npm run build:hub`), styled by `hub/hub.css`.
- **Deploys.** Pushes to `main` force-sync `contact-autoreply`, which Cloudflare deploys as production. Feature branches only run the `Security checks` workflow on pull requests.
- **Auth.** `/api/customer/*` (`src/customer-identity.js`, `src/customer-accounts.ts`). Session cookie `__Host-aura_customer`, Turnstile, Google sign-in, email verification and password reset.
- **Permissions.** Roles are owner, admin, member and viewer. Permissions are `profile:write`, `roadmap:write`, `simulation:write`, `team:manage`, `workspace:read` and `auri:use`. They are resolved server-side from D1 on every request (`accessGuard`).
- **Hub data.** Workspaces (organizations), missions (the roadmap), mission evidence and Auri milestones, menu drafts, CRM-linked requests, orders and subscriptions (`/work`, `/connected`), and Auri guidance and drafts (`/auri`).
- **Baseline.** `npm run check` passed, `npm test` passed 348/348, and `scripts/test-hub-browser.mjs` passed.
- **Loading issue.** A plain `401` already reached the sign-in screen, both locally and on the live site. The hang reproduces when an API call **stalls**: `api()` had no timeout, so a slow `/api/customer/capabilities` or `/api/hub/workspaces` left "Opening your workspace…" on screen until the 15 s boot safety net fired.
- **Accessibility issue found during QA.** On phones the sidebar was hidden off-canvas with a transform but stayed keyboard-focusable.

## What changed

| Area | Implementation |
| --- | --- |
| Design system | `hub/os.css` holds the tokens, shell, buttons, pills, cards, empty, loading and error states, charts, dialogs and responsive rules. `src/hub/os-ui.js` provides the icons, formatters, bar chart (with an accessible data table), bucketing and stage illustrations. |
| Aura Command (`/hub`) | `src/hub/aura-command.js` shows a personalized greeting and quick actions filtered by permission and by the products the business actually has. It has four KPI cards, a performance chart (30 d / 90 d / 12 m), recent activity, next actions, active services with delivery stages and a compact Auri card. |
| Aura Journey (`/hub/roadmap`) | `src/hub/aura-journey.js` draws five illustrated stages (Launch, Get Found, Convert, Grow, Scale) with an animated progress line. Each stage shows its objective, completed and remaining tasks, recommended services marked optional, real examples, an effort estimate and the next action, plus Auri's explanation. `?stage=` deep links work. Task details reuse the existing roadmap view (`renderRoadmap({compact:true})`), so status changes, evidence and alternative routes keep their original rules. |
| Aura Studio (`/hub/studio?view=…`) | `src/hub/aura-studio.js` has six views. **Pipeline** is a Kanban board with configurable stages, search, source and assignee filters, notes, assignment and archive; cards move by drag-and-drop or the accessible "Move to" select. **Delivery** lists approvals, active and completed services, deadlines, revisions and messages. **Website** and **AuraMenu** show only records linked to the business. **Inbox** shows channel status. **Analytics** shows sourced metrics with date ranges. |
| Lead backend | `src/hub-leads.js` and the additive migration `migrations/0037_hub_leads.sql` provide `GET/POST /api/hub/workspaces/:id/leads`, `GET/PATCH …/leads/:leadId` and `GET/PUT …/lead-stages`. Reads need workspace access; writes need `roadmap:write` (owner or admin). Writes check same-origin and the rate limit, use optimistic versions and write audit-log rows. Leads are never hard-deleted (archive only). |
| Navigation | Overview, My Business, Growth Roadmap, Aura Studio, My Services, Website & AuraMenu, Analytics and Auri Assistant come first. Requests, Menu drafts, Orders & billing, Team (owners only) and Settings follow. Phones use a bottom bar plus a "More" sheet. Back and forward work through `pushState`. |
| Auri | Questions asked from Journey or Command are sent `direct` to the real guidance endpoint instead of keyword shortcuts. New intents route to Studio modules; navigation only, so any change is confirmed on the target page. |
| Loading and errors | Every API call has a deadline: 15 s for reads, 45 s for AI-backed writes, 6 s for capabilities. Network, timeout and server errors show an actionable message with **Try again**, never an indefinite spinner. |
| Auri onboarding | `src/hub/onboarding.js` is now a chat conversation, like other AI assistants. Auri's questions are message bubbles and your answers become your own bubbles. Auri summarizes what it extracted from your description, a typing indicator shows while it works, and quick-reply chips cover industry and goal suggestions per industry. A composer is pinned at the bottom and a progress bar sits in the header. The same form fields, session restore, file attach and analysis are reused, so the data and save behavior are unchanged. |
| Profile photo | `src/hub-profile-photo.js` provides `GET/PUT/DELETE /api/hub/me/photo`, backed by the additive migration `0038_customer_profile_photos.sql`. The browser crops and resizes the image to a 256 px WebP or JPEG. The server accepts only `data:image/(webp|jpeg|png)` up to about 90 KB, with same-origin writes, and serves a photo only to its owner. The photo appears in the sidebar, the account button and the account menu, and Settings has upload, change and remove. |
| Legacy pages | A harmonization layer in `hub/os.css` restyles My Services, Requests, the request form, Settings, Team, the Business profile editor, Menu drafts and the Auri page. It maps their buttons, cards, fields, pills and warnings onto the new tokens; their markup and behavior are unchanged. |
| Languages | English, Turkish, French and Arabic for all new UI (`src/hub/os-copy.js`), with a per-key English fallback. Arabic renders right-to-left. |

### Design tokens (reconciled)

`#003D2B` emerald and `#002B20` forest keep the brand's existing `--green` and `--deep` values. The cream `#F8F7F2`, lime `#D8F56A`, mint `#E8F2E7` and ink `#14251D` match the brief. Secondary text is **`#5F6E65`**, not `#68776E`: `#68776E` measures 4.4:1 on cream, which fails WCAG AA for body text, while `#5F6E65` measures 5.0:1. `#68776E` is kept for icons and large text.

## Data honesty: incomplete integrations

| Item | State |
| --- | --- |
| Website visitors | **Not connected.** There is no per-customer analytics source; `analytics_daily` is AuraDigital's own site traffic. The card shows a setup state. |
| Bookings / reservations / appointments | **Not connected.** There is no booking system integration. |
| Customer inquiries | Real, but **manual**: counted from the Aura Studio pipeline (entries the team logs). There is no automatic capture from customer websites. |
| WhatsApp / Instagram / email inbox | **Not connected.** They are listed as such in Inbox. Real conversations shown there are the team requests and lead notes. |
| Website preview | The panel shows domain, HTTPS and publication status, plus a link to the live site. There is no embedded iframe, because many sites forbid framing. |
| Revisions / approvals | Approvals come from real menu drafts and requests awaiting review. Revisions appear only if a request status contains "revision"; otherwise the panel points to the request flow. |
| Effort estimate | Based on the number of remaining tasks. Delivery dates are not invented. |
| Journey examples | Only real published projects: Décoration Gâteaux, Bent Walad and AuraWeddings. Stages without a directly relevant public project show none. |
| Design references | The three referenced images were not present in this session. The UI follows the written brief. |

## Verification

```bash
npm run check
npm test                                   # 353/353 (348 existing + 4 lead API + 1 profile photo)
npm run deploy:check                       # Worker dry-run bundle only
PORT=4173 node scripts/dev-hub.mjs         # in-memory synthetic data, no remote D1
CHROMIUM_PATH=/path/to/chromium node scripts/test-hub-browser.mjs       # existing suite
CHROMIUM_PATH=/path/to/chromium node scripts/test-aurahub4-browser.mjs  # new suite
PORT=5173 node scripts/dev-hub.mjs & node scripts/test-menu-drafts-browser.mjs
npm run test:shop:browser
```

`scripts/test-aurahub4-browser.mjs` covers:

- the signed-out sign-in screen, a stalled API leading to a timeout message and retry, and a 500 response showing retry;
- Command KPIs and setup states, plus keyboard navigation of the chart tabs;
- lead create, move, reload persistence, filter, note, deep link and archive;
- Command updating after a lead is added;
- all six Studio views;
- Journey stages, `?stage=` deep links, task details and back/forward;
- Auri answering through the real endpoint and routing to Studio;
- cross-account lead access refused (404);
- profile photo upload, display in the shell and removal;
- the onboarding chat flow on a 390 px phone;
- no horizontal overflow on nine pages at 375, 768, 1280 and 1440 px, mobile bottom-nav targets of at least 44 px, and Arabic right-to-left.

Two existing browser assertions changed because labels changed on purpose: the sidebar label list, and the Auri page heading ("Ask Auri" → "Auri Assistant").

## Release notes for later (not done here)

1. Review a staging deployment against a copy of D1. The lead tables are created on first use (`CREATE TABLE IF NOT EXISTS`); `0037_hub_leads.sql` can also be applied with Wrangler. Neither step alters existing tables.
2. Visitor analytics, bookings and messaging channels need real integrations before their cards can show numbers.

## Audit follow-up (82 items)

The audit was fixed in five batches, each committed and covered by `scripts/test-aurahub4-browser.mjs` and unit tests. Unit tests: 359/359 passing.

1. **Urgent fixes.** Readable hero text, matching Auri/Overview counts, billing card, 404 page, Menu drafts hidden while disabled, localized server errors, sign-in redirect on session expiry, drawer focus trap, 12 px minimum text, consistent "Auri" and "AuraHub" names.
2. **Bigger pages.**
   - My Business page (logo, contact, hours, social links, brand colors, completeness); migration 0039.
   - Salon, retail and professional categories.
   - Full Auri page with server-saved history; migration 0040.
   - Journey "All tasks" list.
   - Phone layouts.
   - Translated task guidance; arrows mirrored in Arabic.
3. **Sign-in and requests.** Brand-styled sign-in with no unfinished Google notice, request detail timeline, service picker, redirects for old pages, Help & support page, Ask Auri bar, "Today" items, profile nudge.
4. **Features.**
   - Lead follow-ups, history and CSV import/export.
   - Billing page, global search (Ctrl/⌘+K), notifications.
   - Signed-in devices, data export, deletion request.
   - Analytics ranges.
   - Auri voice input and confirm-to-add leads.
   - Stage celebration.
5. **Launch readiness.** Minified bundle, removed dead code, one leads request, thumbnails, browser error reporting to Worker logs, admin AuraHub usage panel.

### Still open (needs a decision, content or an external system)

| Item | Why it is not done in code |
| --- | --- |
| Paid team seats (Team page) | Needs a payment provider (Stripe, iyzico or PayTR) and its webhooks. |
| Website visitors, bookings, WhatsApp/Instagram/email inbox, automatic lead capture | Each needs an integration or account on that service. |
| Notification emails/WhatsApp and their preferences | Needs a sending channel. In-app notifications exist. |
| Delivery approvals with files; messaging with the team; domain expiry dates | Need staff-side tools and data sources in the admin CRM. |
| Auri daily AI budget ($1/day total; 10 AI calls per person per day) | Spending decision: change `AI_DAILY_BUDGET_USD`. |
| Real case studies for stages 2, 4, 5; team-written task durations | Content from your team. |
| Site lime `#E1E100` vs hub lime `#D8F56A` | Brand decision; then update one of them. |
| Two-step verification; chat attachments; onboarding "pick services" step; onboarding resume across devices; bulk lead actions | Larger follow-up features. |
| Full CSS cleanup of legacy `hub.css`; per-language translation loading (bundle is ~165 KB gzipped, mostly copy) | Refactors best done with staging visual checks. |
| Staging deployment, member/viewer role testing, uptime monitoring | Need your Cloudflare and monitoring accounts. |
