# AuraDigital Security Audit

## Executive Summary

AuraDigital is a Cloudflare Worker with D1-backed admin, employee, NFC, AuraMenu, and public-content APIs. The audit found and fixed an authorization flaw in AuraMenu ownership, weak password hashing, publicly enumerable unpublished request data, inconsistent security headers and error handling, unbounded trust in client-side workflow fields, an unsafe restaurant demo renderer, and insufficiently pinned CI/deployment tooling. The application now has backend role checks, per-resource secret tokens, secure cookies, rate limits, server-side validation, generic client errors, security event logging, and regression coverage.

## Critical Findings

### AuraMenu request-ID token takeover

- **Affected endpoint:** `POST /api/auramenu/dashboard/:id/claim`
- **Attack scenario:** A person who learned a request ID could claim or replace the dashboard token and edit another customer’s menu.
- **Severity:** Critical
- **Fix:** Claiming now requires the existing per-menu token. Tokens are created at request creation and can only be rotated by an owner.

## High Findings

### Unpublished request and image disclosure

- **Affected endpoints:** `GET /api/auramenu/requests/:id`, `GET /api/auramenu/images/:id`
- **Attack scenario:** Guessing an ID exposed customer and menu data before publication.
- **Severity:** High
- **Fix:** Unpublished data requires the matching menu token or authenticated admin; public sites require both approved status and paid status. Private images are `no-store`.

### Weak password KDF and long-password truncation risk

- **Affected file:** `src/security.js`
- **Attack scenario:** PBKDF2 at 25,000 iterations made offline guessing cheaper than current guidance; bcrypt-like systems can silently truncate passwords beyond 72 bytes.
- **Severity:** High
- **Fix:** New passwords use bcrypt cost 12, passwords require at least 12 characters and at most 72 UTF-8 bytes, and supported legacy hashes are upgraded after successful login.

### Authorization and payment workflow enforcement gaps

- **Affected endpoints:** admin AuraMenu access and admin resource APIs
- **Attack scenario:** Read-only or manager accounts could attempt privileged workflow actions, or clients could submit forged `status`, `paymentStatus`, ownership, or expiry fields.
- **Severity:** High
- **Fix:** Viewer mutations are denied centrally; account and token-management actions require owner; server-owned payment/status/ownership fields are ignored; access duration is validated server-side.

## Medium / Low Findings

### XSS in the restaurant dashboard demo

- **Affected file:** `restaurants/dashboard/app.js`
- **Severity:** Medium
- **Fix:** User-controlled values are encoded before HTML insertion and status CSS classes are allowlisted.

### Inconsistent production headers and error leakage

- **Affected files:** `src/worker-entry.js`, `src/security-policy.js`, `_headers`
- **Severity:** Medium
- **Fix:** Central response policy adds HSTS, CSP, frame protections, MIME sniffing protection, referrer policy, and generic 5xx responses. Diagnostic values are excluded from client responses and sensitive logs.

### SSRF and redirect hardening in retained QuickSite proxy

- **Affected file:** `src/worker.js`
- **Severity:** Medium
- **Fix:** HTTPS origin allowlist, manual redirect rejection, timeout, and restricted forwarded headers.

### Dependency and CI supply-chain drift

- **Affected files:** `package.json`, `.github/workflows/security.yml`, `tools/wrangler-safe/bin/wrangler.mjs`
- **Severity:** Medium
- **Fix:** Wrangler is invoked from a pinned package entrypoint, GitHub Actions tags are pinned to commit SHAs, scripts are installed with `--ignore-scripts`, and Dependabot remains enabled. `npm audit` still reports high findings inherited from the currently installed Wrangler 4.120.1 chain; upgrade Wrangler and matching Workers types before production deployment.

### Backup file permissions

- **Affected file:** `scripts/backup-d1.sh`
- **Severity:** Low
- **Fix:** Backups are created with umask 077 and must be encrypted before storage.

## OWASP Mapping

| Finding | OWASP category |
|---|---|
| AuraMenu token takeover and cross-tenant access | A01 Broken Access Control |
| Viewer/manager privilege boundaries | A01 Broken Access Control |
| Password hashing, sessions, rate limits | A07 Identification and Authentication Failures |
| Forged payment/status/ownership fields | A04 Insecure Design |
| SQL parameterization and mass-assignment allowlists | A03 Injection / A04 Insecure Design |
| Restaurant dashboard XSS and CSP | A05 Security Misconfiguration / A07 XSS in older taxonomy |
| Upload validation | A04 Insecure Design / A05 Security Misconfiguration |
| SSRF proxy restrictions | A10 SSRF |
| Generic errors and security logging | A09 Security Logging and Monitoring Failures |
| Dependency pinning and audit | A06 Vulnerable and Outdated Components |

## Changes Made

- Added `src/menu-ownership.js` for per-resource token creation and verification.
- Added `src/security-policy.js` for HTTPS/path/method policy, rate limits, headers, and security events.
- Added bcrypt password hashing with legacy PBKDF2 verification and upgrade.
- Protected unpublished AuraMenu/NFC data and images.
- Enforced owner, manager, viewer, employee, and per-resource authorization on the backend.
- Hardened image validation, body-size limits, URL validation, proxy behavior, logging, backups, and CI.
- Added `SECURITY.md` developer guidance.

## Tests Added

`test/audit-regression.test.mjs` covers cross-user menu and employee-client access, privilege escalation, CSRF, SQL payloads and mass assignment, forged workflow fields, malicious uploads, path traversal, SSRF proxy policy, rate limits, secure sessions, NFC status tokens, stale publication status, generic errors, and stored XSS. The full suite passes: **27 tests, 27 passed**.

## Remaining Risks

- MFA is not implemented in the current Cloudflare Worker. Protect owner accounts with Cloudflare Access or an external IdP until application MFA is added.
- NFC and AuraMenu status links contain bearer tokens in the URL fragment/local browser storage. Treat them as secrets and rotate them if shared.
- The separate `auramenu.space` repository must send the per-menu token and NFC status token; the AuraDigital API will reject ID-only access.
- The repository contains a static restaurant demo with localStorage data; it is not a production multi-tenant dashboard.

## Deployment Requirements

- Configure `ADMIN_PASSWORD` only as a Cloudflare secret during first owner bootstrap; remove or rotate it after bootstrap.
- Configure `NOTIFICATION_EMAIL` and the `REQUEST_NOTIFICATIONS` Send Email binding.
- Keep D1 private to the Worker; do not expose database credentials or direct database endpoints.
- Use HTTPS-only custom domains and keep HSTS enabled.
- Apply Cloudflare WAF/rate limits and restrict admin access with Cloudflare Access or an IdP.
- Run D1 migrations before deploying the Worker, including token tables created by the Worker schema bootstrap.
- Upgrade Wrangler to a release that resolves the reported `miniflare`/`sharp` advisories and update Workers types together; rerun `npm audit --audit-level=high`.
- Encrypt D1 backups and store them outside the public assets directory.
