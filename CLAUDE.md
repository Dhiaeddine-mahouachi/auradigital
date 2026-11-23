# AuraDigital — instructions for Claude Code

This repository is **public** and `main` deploys straight to production (auradigitalworks.com). Follow `docs/SECURITY_RULES.md` for every change; `npm test` enforces the rules marked [CI].

- Never commit secrets. Use `npx wrangler secret put NAME`. Never put keys in `wrangler.jsonc` vars.
- SQL: bind every value with `?`. HTML: escape every user value with `esc()` (or use `textContent`).
- Every Hub route checks `authorize(...)` on the server. Cookie-authenticated writes check `sameOrigin`. Missing access returns 404.
- Never trust prices, statuses, roles or ownership sent by the browser.
- Migrations are additive only. Never delete or rewrite customer data. Never run anything against the production D1 database.
- Work on a branch and open a pull request. Merge only with green "Security checks" and the owner's go-ahead. Do not push to `main` directly.
- Before a pull request, run `npm run check`, `npm test` and `npm run deploy:check`. Add a regression test for every security fix.
- Local QA uses `PORT=4173 node scripts/dev-hub.mjs` (synthetic in-memory data). Do not create test accounts on the live site.
