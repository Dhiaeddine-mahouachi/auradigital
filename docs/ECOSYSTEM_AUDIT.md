# AuraDigital source audit — 7 October 2026

Baseline: main branch at the checkout commit, before redesign. 35 existing tests pass.

## Architecture and preservation boundaries
Static HTML with no frontend build; Cloudflare Workers Static Assets enters src/worker-entry.js. D1 DB stores content, clients, invoices, orders, subscriptions, admin users and sessions, employees, NFC designs and menu projects. Existing product builders are independent services: auramenu.space and aurapops.online. The QuickSite proxy, existing product APIs and admin CRUD are retained. Wedding collection contains 50 theme definitions, ten legacy invitations, and personalization via preview query parameters. RSVP previews use existing invitation behavior; no new claim of centrally persisted guest submissions.

## Existing behavior verified by source and baseline tests
Admin owner/manager/viewer roles, opaque revocable sessions, employee isolation, menu claim ownership and editing entitlements, bounded JSON, NFC status tokens, Resend confirmations, menu billing and SEO redirects. Source inspection alone does not prove production delivery or account configuration.

## Findings
- Public design layers: 6,390 lines style.css, 1,907 cinematic.css and 167 responsive.css, plus page inline rules. Shared shell gets overwritten by several layers. Do not delete legacy selectors used by hidden builders.
- Two animation scripts operate on headings/media; cinematic.js adds yellow wave separators and an endless pointer glow. Active public routes can stop loading that optional presentation layer without removing it from repository.
- script.js forces scroll position to zero on bfcache navigation and makes a mobile exception to reduced-motion autoplay.
- Local assistant embeds old web prices; must direct users to the central live quote rather than maintain a second price list.
- AuraWeddings landing contains mixed Turkish/English source copy. French collection labels are absent although invitation preview supports four-language configuration.
- AuraMenu href="#" triggers have JS behavior but no useful fallback destination.
- Legacy website settings are different packages from the new five-package catalog; retain for existing workflows and explicitly label them legacy in admin.
- GitHub Pages backup copies top-level server/config artifacts beyond .assetsignore exclusions and rewrites APIs to a different origin. Treat backup as a static presentation only; align excluded files and directories, never imply admin/API availability there.
- Resend Reply-To differs from the requested hello@ address.
- Production auto-sync on main pushes mirrors main to contact-autoreply. Redesign goes to a feature branch for review; do not trigger main or mutate live D1 during testing.

## Verification required after implementation
Every new route and existing product call; quote trust boundary; role authorization; customer project isolation; files signature/type/size; email failures; duplicate intake; quote revisions; responsive widths; local links; JS syntax; existing test regression; Worker dry-run. Provider payment creation, Resend delivery, live DNS and Cloudflare secrets require environment access and cannot be inferred from source.
