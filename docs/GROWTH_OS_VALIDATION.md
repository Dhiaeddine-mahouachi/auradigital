# Growth OS — executed validation evidence

Date: 2026-10-28. Local Node runtime: v24.22.1. Synthetic fixtures only; no production customer records, real email sends, real payments or infrastructure mutations.

| Check | Executed result |
|---|---|
| Baseline `npm test` | 231 passed, 0 failed, 0 skipped |
| Final `npm test` / `node --test test/*.test.mjs` | 271 passed, 0 failed, 0 skipped (40 additional tests) |
| `npm run check` | PASS: existing syntax, TypeScript and build checks plus growth syntax/Hub build |
| `npm run deploy:check` | PASS: Wrangler 4.154.0 `--dry-run`, no deployment |
| Full `npm audit --json` | 0 critical, high, moderate, low or informational vulnerabilities reported |
| `git diff --check` | PASS |
| Additive migration test | Legacy customer/hash/session/order preserved; local SQL transaction rollback and FK integrity checked |
| Staging config safety tests | Production DB/host rejected; isolated namespaces and disabled outbound providers/schedules checked |
| Browser desktop | Guided onboarding, industry question, mode preservation, profile save, journey generation/completion, progress update, simulation/calculation/save checked |
| Browser 390px frame | Arabic RTL overview and team page; menu operation; no document-wide horizontal overflow (375px client/scroll width after scrollbar) |
| Browser 768px frame | Arabic/French/Turkish interface; no document-wide horizontal overflow (753px client/scroll width after scrollbar) |
| Keyboard | Menu Enter activation, Escape close/focus return, collapsed sidebar excluded from AX navigation |

The browser width checks used responsive same-origin frames in the isolated QA server. They do not establish real-device usability, Safari support, full keyboard coverage, screen-reader compliance or WCAG certification. Google/email/provider tests use mocked responses or cryptographic test keys, not live credentials. Synthetic subscription-state tests do not establish billing activation/renewal/cancellation correctness against a provider.

## Payload observations

* Hub JavaScript: **103,886 bytes**, gzip **27,769 bytes**.
* Hub CSS: **16,606 bytes**, gzip **4,562 bytes**.
* Wrangler dry-run Worker: **546.72 KiB**, gzip **132.64 KiB**.

These are build sizes, not runtime Core Web Vitals, latency, load-test results or a performance SLA. Bundles include no new frontend framework. Live bundle/CDN behavior and D1 query latency remain unmeasured.

Wrangler retained warnings for existing AuraPops asset routes. These warnings were not newly introduced and were not resolved by this increment; the existing route regression tests pass. The dry-run read assets and printed configured bindings; that is not proof that live bindings or credentials exist.

## Bugs found and fixed during local verification

* The Hub handler initially served HTML for its JavaScript path. Explicit asset routing fixed it before browser workflow checks.
* Roadmap data initially overwrote database mission UUIDs with capability IDs. The response now keeps both distinct; persistence/reorder tests cover it.
* Mission movement now atomically swaps neighboring positions and checks revisions.
* Arabic simulator explanations initially fell back to English; all Hub dictionary keys are now populated in all four languages.
* Editing simulator inputs invalidates the previous calculation before saving.
* Mobile off-screen navigation was still keyboard reachable; it is now inert while collapsed and supports Escape/focus restoration.
* Autosave no longer shares the 5/minute contact-email limiter: authenticated writes have a separate 60/minute binding; invitations retain an additional 5/minute owner limit.
* Hub rollback now retains independent identity/recovery routes when configured, protecting Google-only customers from an accidental legacy-only login rollback.

## Explicitly unexecuted gates

Live Google consent/login/linking; real email receipt/sender health; approved recurring checkout; signed webhook replay/lifecycle integration; taxes/invoices/refunds; member subscription portal/cancellation; real administrator MFA; full product/shop/browser regressions; authenticated staging backup/migration/restore; independent ASVS L2 review; penetration/load testing; full WCAG 2.2 AA audit; production deployment/acceptance.
