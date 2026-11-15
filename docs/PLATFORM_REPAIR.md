# AuraDigital platform repair

Baseline: GitHub main and the Cloudflare production sync branch pointed to `392dc37` on November 16, 2026 (Istanbul). Public HTTP checks confirmed a reachable Hub and a legacy account login page. The public capabilities response reported Growth OS enabled, Google sign-in unavailable and customer email unavailable. Git branch alignment does not establish the deployed Worker revision.

| Issue | Priority | Route and baseline evidence | Change or next step | Status |
| --- | --- | --- | --- | --- |
| AD-01 | High | Ordinary site sign-in opened the shop-rendered form and defaulted to shop order history. | Growth environments forward legacy login/signup URLs to the Hub. The existing session and Hub workspace lookup drive onboarding or the saved roadmap. | Implemented, pending release |
| AD-02 | High | Checkout and order links depended on a separate login implementation. Google return paths did not cover order detail. | Share the return-path allowlist across the Hub, shop and Google flow. Shop order lookups continue to enforce ownership. | Implemented, pending release |
| AD-03 | High | Checkout requires verified email, but the live identity endpoint reports email unavailable. | Show verification before the form and preserve the cart. Restore and test email delivery in the authorized environment before signing off on checkout for new customers. | UI implemented, provider blocked |
| AD-04 | Medium | The homepage lacked a Roadmap Builder action. Shop orders and shop access were hard to find from the Hub. | Add the homepage action and direct links in Hub Resources. | Implemented, pending release |
| AD-05 | Medium | The shop used different base branding and mixed French and English cart labels. | Match the Hub palette/font stack and use consistent English cart labels. Full translated shop and visual acceptance remain open. | Implemented, pending release |
| AD-06 | Medium | Shop UI repeated a fixed amount although orders use the catalog. The separate NFC service catalog lists a starting price of 700 TL, while the shop seed uses 600 TL. | Remove hardcoded shop banner amounts. Confirm which offers should share a SKU and price with the owner before commercial changes. | UI implemented, pricing decision open |
| AD-07 | High | Google and recovery controls appeared in the Hub regardless of provider availability. | Gate sign-in and settings controls on the identity capabilities. Confirm live provider configuration and delivery before enabling. | Implemented, provider verification open |
| AD-08 | High | Private AuraMenu drafts exist in the Hub. Production configuration keeps that feature disabled and cross-domain account handoff and publishing remain open. | Verify draft migration and tenant ownership in staging, then validate an authenticated handoff and publishing workflow. | Blocked on release prerequisites |
| AD-09 | Medium | AURI supports scoped roadmap help. Project, invoice, subscription and analytics views lack verified data or integrations. | Complete ownership-backed data models, provider integration and usage budgets before enabling those actions. | Not started in this change |
| AD-10 | High | Remote D1 backup/restore, staging acceptance, production identity delivery and admin MFA have no new verification in this change. | Verify each release gate and smoke-test the resulting build on the live domain. | Blocked on release evidence |

## Design and data

The Worker keeps the shop authentication fallback when Growth OS is disabled. With Growth OS enabled, Hub authentication is canonical and `/account` remains order history. An explicit checkout or order link can resume after sign-in. Ordinary site entry is roadmap-first. The Hub and shop continue to use the same customer records and session cookie. This change adds no D1 migration, provider, or recurring infrastructure.

## Verification

- `npm run check`, `npm test` (282 tests) and `npm run deploy:check` passed locally.
- Regression tests cover compatibility redirects, checkout and order return paths, and the shop-only fallback. The Chromium journeys are wired into PR CI. Local Chromium could not initialize because the process sandbox denied its socket operation.
- Production was checked with public, read-only requests. Production sign-in sessions, real emails, payments, staging migration and D1 restore were outside the verified evidence.
