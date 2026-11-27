# Aura Core test report

## 2026-11-27 · Foundation branch

| Check | Result |
|---|---|
| Baseline `npm test` on `fb2f127` | 388 passed. |
| Foundation `npm test` | 392 passed on the rebased branch. Includes hostname-bound Turnstile, partial configuration, provider outage, concurrent workspace setup and existing tenant/membership coverage. |
| `npm run check` | Passed. Syntax checks, shop type check, and repository builds completed. |
| Worker dry run and runtime dependency audit | Passed. The dependency audit reported zero vulnerabilities for runtime packages. |
| Isolated Wrangler migrations | All checked-in migrations applied to a fresh local D1 database through `0041`. |
| Local Worker API smoke | Two fixture accounts exercised registration, workspace creation/retry, tenant isolation, email-verification enforcement, private AuraMenu draft save/read, and logout. The verified email was seeded locally. |
| Isolated fixture restore | Restored a local D1 SQLite snapshot into a separate file. Counts matched across six tables, the private menu draft survived, and integrity and foreign-key checks passed. |
| Live read-only checks | Main and AuraMenu sign-in pages rendered. AuraDigital reported Google, email and Turnstile enabled. An unauthenticated workspace list request returned 401. |
| Full staged customer journey | Pending isolated staging Worker and configured provider callbacks. |
| Production release and cloud data recovery | Pending cloud backup/restore evidence and staged acceptance. |

Staging must also cover existing customer and menu continuity, cross-product SSO, cross-workspace access, billing lifecycle, entitlement changes, mobile rendering, and a restore using fixture data.

## 2026-11-27 · Cloud staging readiness

Applied all 26 checked-in migrations to the existing isolated Cloudflare D1 database, `auradigital-staging-db`. Verified the ledger through `0041_auramenu_design_settings.sql`, the presence of customer, session, organization, membership and menu draft tables, zero foreign-key violations, and zero customer records. The staging Worker and sign-in callbacks have yet to be deployed and tested.

The complete Node suite passed 402 tests, including staging-only sign-in redirects and exchanges with an isolated fixture account. `npm run check` and the Wrangler staging dry run passed. The dry run used a fixture database ID and verified the staging binding name and route. Both proposed staging hostnames were available as unused DNS names when checked.

## 2026-11-27 · Private staging rollout

Added owner-only Cloudflare Access for both staging hosts and applied `0042_workspace_auramenu_links.sql` to staging D1. The Node suite passed 403 tests. The new Worker integration test exercised a claimed menu, editing, workspace assignment, duplicate requests, cross-account denial and the same QR slug after publication. Publication and entitlements in that test used local fixtures. The staging AuraMenu asset build passed its Wrangler dry run.
