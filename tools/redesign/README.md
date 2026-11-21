# AuraDigital 2026 redesign

The public pages are designed as components in `design/*.dc.html` (shared `Header`, `Footer` and the `Auri` assistant + one file per page) and pre-rendered to static HTML.

Rebuild after editing a design file:

    cd tools/redesign && npm install && npm run build

This rewrites `index.html`, `solutions.html`, `service-shop.html`, `packages.html`, `aura-menu.html`, `portfolio.html`, `help.html`, `about.html`, `contact.html` and `redesign/app.js`. Then run `npm test` from the repository root.

- Contact form → `POST /api/contact` (CRM, idempotency key, honeypot).
- Auri → `POST /api/ai/session` + `/api/ai/message` on auradigitalworks.com, with a built-in multilingual fallback if the API fails.
- AI provider: `AI_PROVIDER=ollama` with `AI_FALLBACK_PROVIDER=cloudflare` (see wrangler.jsonc). Set the secret `AI_BASE_URL` to your Ollama `/api/chat` HTTPS URL.
