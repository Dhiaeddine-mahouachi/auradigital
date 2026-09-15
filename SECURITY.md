# Security Requirements

- Treat every API as hostile input. Validate body, query, path, headers, and files on the server.
- Authorize every resource action using the authenticated principal and the resource owner. Never trust IDs, slugs, roles, prices, payment status, or ownership from the browser.
- Use the existing security helpers and parameterized D1 queries. Do not concatenate user input into SQL, shell commands, HTML, or filesystem paths.
- Use bcrypt cost 12 (or a reviewed modern replacement) for new passwords. Never log passwords, tokens, cookies, private keys, or payment data.
- Keep cookies `HttpOnly; Secure; SameSite=Strict`; require same-origin checks for cookie-authenticated mutations.
- Preserve body limits, upload signature checks, URL allowlists, rate limits, generic errors, CSP, HSTS, and audit events.
- Add a regression test for every security fix. Run `npm run check`, `npm test`, `npm audit --audit-level=high`, and `npm run deploy:check` before release.
- Configure secrets in Cloudflare, keep D1 private, use HTTPS, encrypt backups, and review dependency updates.
