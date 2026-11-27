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
