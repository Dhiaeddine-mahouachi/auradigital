# AuraHub redesign

Growth Vision retains five distinct levels (Foundation, Visibility, Conversion, Operations, Scale) while preserving verified XP and existing mission IDs. The signed-in Hub uses Home at `/hub`, Growth Vision at `/hub/roadmap`, Ask Auri at `/hub/auri`, and My Work at `/hub/work`. The Hub keeps workspace and record IDs in the URL. Menu drafts use `/hub/menu-drafts`; intake uses `/hub/onboarding`. Existing account, invitation, and settings entry points remain in place.

## Staging configuration

Apply additive migration `0034_aurahub_work.sql` after `0029_menu_drafts.sql`. It adds a workspace-to-contact-receipt mapping and records the version of each reviewed draft. Existing mission IDs, task evidence, XP, and draft states require no rewrite. A newer draft version needs its own review.

Configure `HUB_OLLAMA_URL` (the full server-accessible HTTPS Ollama `/api/chat` endpoint), `HUB_OLLAMA_MODEL`, and `HUB_OLLAMA_TOKEN` if the gateway uses bearer authentication. Keep endpoint and token in server-side configuration. The Hub reuses the shared model transport, budget ledger, and rate limiter. The current deployment config has menu drafts disabled. Enable `MENU_DRAFTS_ENABLED` in the staged environment after applying the migrations and testing the shared customer identity.

Contact requests from the Hub use the existing receipt, CRM, and email outbox workflow. My Work reads the linked CRM client, latest order, and active subscriptions where they exist. Older public requests without a verified workspace mapping remain in their existing systems. A matching contact email alone is insufficient to establish workspace ownership.

## Local verification

Run `npm run check`, `npm test`, and `npm run deploy:check`. For browser QA, run `node scripts/dev-hub.mjs --port 4173` and then `node scripts/test-hub-browser.mjs` with Chromium installed. This harness uses synthetic customers and in-memory SQLite. Without Ollama configuration it exercises the server model transport with a deterministic Ollama response, including a malformed plan and retry. There are no outbound contact emails from the local fixture.
