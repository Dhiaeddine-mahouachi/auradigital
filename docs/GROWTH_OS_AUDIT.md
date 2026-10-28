# Business Growth OS — implementation audit

Baseline: `d884a67947eea50eb87a4fdd5611728c8281f3d0`, reviewed 2026-10-28.

## Existing architecture and preservation

The application is a Cloudflare Worker (`src/worker-entry.js`), serving vanilla HTML/JS/CSS through an ASSETS binding. The shop uses TypeScript compiled with esbuild. D1 contains administrator, employee, customer, shop, product and AI records. There is no React application or existing organization-based Business Hub to replace.

Customer identity is `customer_users` / `customer_sessions`; passwords use bcrypt cost 12 and server-stored hashed session tokens with Secure HttpOnly cookies. Shop orders retain independent customer ownership, server-calculated TRY pricing, idempotency keys, and authorized administrator bank-transfer reconciliation. Bank transfers are not a recurring payment provider. Product/menu token authorization and administrative/employee sessions remain separate; merging identities by matching email would be unsafe.

Existing AI uses approved public knowledge, Cloudflare AI or an operator-configured compatible provider, rate limits and budget reservations. It is not an organization-authorized account assistant. Existing clients/requests do not establish ownership by a customer login. Do not expose those records by matching an email or business name.

## Findings / release gates

* Customer email verification, password recovery and Google OIDC are absent from the baseline.
* Customer authentication must be preserved while adding explicit verified identity records.
* Administrator MFA is absent (also recorded in SECURITY_AUDIT.md); privileged release remains blocked until enforced and tested.
* `main` automatically force-syncs `contact-autoreply`, and pushes to `main` publish a GitHub Pages mirror. Never push or merge implementation to those branches without owner release approval.
* Live Cloudflare configuration, D1 migration history/data counts, backup recoverability, Google credentials, Resend sender verification and recurring billing configuration have not been accessed or verified. A repository binding is not evidence of runtime configuration.
* No authenticated link between legacy client/project records and customer accounts exists. Integration needs an audited ownership grant, not email auto-linking.
* Runtime and development dependency vulnerability gates must be rerun; the historical security report is not current evidence.
* Existing tests: baseline `npm test` actually ran: 231 passed, 0 failed. No live-site security testing or customer-data access performed.

## Reviewable sequence

1. Add opt-in, additive identity security and growth schema; preserve all legacy tables, session cookies and orders. Test migrations using representative existing rows and transaction rollback.
2. Extend email verification/recovery and Google OIDC, with fail-closed provider configuration and no implicit Google/email linking. Verification is mandatory at sensitive boundaries.
3. Add persistent profile, editable rule-based roadmap, transparent growth scenarios, and a mobile four-language Hub using the existing customer identity.
4. Add organization authorization and invitations. Additional users remain pending until a genuine recurring provider is configured, implemented and verified. Never offer bank transfer as recurring seat billing.
5. Integrate remaining legacy projects/files/services only after explicit ownership mapping. Add scoped AURI tools and reporting against known data. Retain unavailable modules as unavailable, not fabricated dashboards.
6. Run regression, security, browser/RTL/accessibility and build checks; document gaps against ASVS 5.0 L2. Verify a staging-only backup/restore and migration before deployment. Obtain explicit production approval after release gates pass.

## Database policy

New migrations create supplemental tables only. No existing rows are deleted or rewritten. Applying or reversing a migration in production is not authorized. Before staging migration, verify account/database identity, record schema and row counts, export a recoverable encrypted backup outside ASSETS, test restoration, and apply to a separate D1 database. Code rollback disables the growth feature flag; retaining additive tables is the default data-preserving rollback.
