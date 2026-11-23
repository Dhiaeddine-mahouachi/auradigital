# AuraDigital security rules

These rules apply to every change: by people, by Claude Code, or by any other tool. Rules marked **[CI]** are enforced automatically by `test/security-rules.test.mjs`, so a change that breaks them cannot pass CI. The repository is **public**: assume attackers can read every line of code.

## A01 — Access control

1. **[CI]** Every Hub API route checks access on the server with `authorize(db, org, user, permission)` (or `accessGuard` inside the SQL). Never trust an id, role, price, status or owner sent by the browser.
2. **[CI]** A signed-in customer can never read or change another workspace. Missing access returns **404**, not 403, so ids cannot be probed.
3. **[CI]** Every cookie-authenticated write (POST/PUT/PATCH/DELETE) checks `sameOrigin(request)`. This is the CSRF defence.
4. Writes need the right permission: `profile:write` for the business profile and logo, and `roadmap:write` for tasks, leads and requests. Viewers are read-only.
5. Admin endpoints live behind `getAuthenticatedAdmin`. Owner-only actions check `role === 'owner'`. Employee portals stay separated per portal.
6. Data that should be private (unpublished menus, invitations, uploads) needs a token or a sign-in. "Hard to guess" is not access control.

## A02 — Cryptography and secrets

7. **[CI]** Secrets (API keys, tokens, passwords) are set as Cloudflare secrets: run `npx wrangler secret put NAME`. They never go in code, `wrangler.jsonc` `vars`, commits, issues or chat.
8. **[CI]** Tokens and ids come from `crypto.randomUUID()` or `crypto.getRandomValues()`, never `Math.random()`.
9. Passwords use bcrypt cost 12 (`hashPassword`), are 12–72 bytes long, and are never logged. Session and reset tokens are stored only as SHA-256 hashes.
10. Everything runs over HTTPS only, with HSTS on.

## A03 — Injection and XSS

11. **[CI]** SQL values are always bound with `?` and `.bind(...)`. The only things interpolated into SQL are reviewed table and column names defined in code.
12. **[CI]** Do not use `eval`, `new Function`, `document.write` or string timers.
13. Every value that could come from a user is escaped with `esc()` before it goes into `innerHTML`. Prefer `textContent` when no markup is needed. Never insert user URLs into `href` or `src` without validating `https:`.
14. Keep the Content-Security-Policy strict: no `'unsafe-inline'` or `'unsafe-eval'` in `script-src`. New external scripts need review and an entry in `security-policy.js`.

## A04 — Secure design

15. The server owns prices, payment status, approval status, ownership and limits. Recompute them on the server; ignore any the client sends.
16. Every list and create endpoint has a size limit (body bytes, item counts, lengths). New tables get limits like those in `hub-leads.js`.
17. Deletion of customer data is a request handled by the team, never an instant self-service delete. Prefer archive over delete.
18. Auri (the AI) can only suggest or navigate. Any change it proposes is saved only after the customer confirms, through the normal permission-checked API.

## A05 — Configuration

19. **[CI]** Private files (`src`, `migrations`, `scripts`, `tests`, `docs`, `wrangler.jsonc`, `.env*`, `CLAUDE.md`) stay listed in `.assetsignore` so they are never served.
20. **[CI]** All responses carry the security headers from `security-policy.js`: CSP, HSTS, `nosniff`, frame blocking and referrer policy.
21. Feature flags in `wrangler.jsonc` default to off. Turn on a feature only after its migration runs and its tests pass.
22. Do not expose debug, health or configuration details publicly. Return them only to signed-in admins.

## A06 — Dependencies

23. `npm audit --omit=dev --audit-level=high` must be clean. CI runs it.
24. Add as few new runtime dependencies as possible. Pin exact versions and review the changelog before upgrading.

## A07 — Authentication

25. Sign-in is rate-limited **per IP and per account**, and protected by Turnstile when it is configured.
26. Login and recovery messages never reveal whether an email has an account.
27. **[CI]** Session cookies are `__Host-`, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`.
28. Changing a password or recovering an account signs out all other sessions.

## A08 — Integrity and the deploy pipeline

29. **[CI]** GitHub Actions are pinned to full commit SHAs.
30. `main` deploys to production. Changes reach `main` only through a pull request with green "Security checks". Do not push directly.
31. Migrations are additive (`CREATE … IF NOT EXISTS`, new columns with defaults). Never drop or rewrite customer data in a migration.

## A09 — Logging and monitoring

32. **[CI]** Unexpected errors return a generic `Server error.`; details go only to the Worker logs.
33. Security-relevant actions write an audit row (`member_access_audit_logs`, admin audit, employee audit). Never log passwords, tokens, cookies, full emails or message content.
34. Review the Worker logs for `aurahub_client_error`, `request_denied` and `request_error` every week.

## A10 — SSRF

35. The server fetches only URLs from configuration or fixed allowlists, uses `redirect: 'manual'` and a timeout, and never fetches a URL that a customer typed in.

## Before every release

```bash
npm run check
npm test                          # includes these rules
npm audit --omit=dev --audit-level=high
npm run deploy:check
```

Then open a pull request, wait for green CI, and merge.
