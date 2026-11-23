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
npm test                                   # 352/352 (348 existing + 4 new lead API tests)
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
- no horizontal overflow on nine pages at 375, 768, 1280 and 1440 px, mobile bottom-nav targets of at least 44 px, and Arabic right-to-left.

Two existing browser assertions changed because labels changed on purpose: the sidebar label list, and the Auri page heading ("Ask Auri" → "Auri Assistant").

## Release notes for later (not done here)

1. Review a staging deployment against a copy of D1. The lead tables are created on first use (`CREATE TABLE IF NOT EXISTS`); `0037_hub_leads.sql` can also be applied with Wrangler. Neither step alters existing tables.
2. Visitor analytics, bookings and messaging channels need real integrations before their cards can show numbers.
