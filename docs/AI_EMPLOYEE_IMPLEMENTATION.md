# AuraDigital AI employee — implementation and release status

Repository: `Dhiaeddine-mahouachi/auradigital`. The original assistant in `script.js` was a browser-only keyword FAQ. The site is static HTML/JS with a Cloudflare Worker, D1, existing admin sessions and CRM leads. Aura Control is a separate, currently unconnected repository. No `AGENTS.md` exists in this website repository.

## Delivered in this change

- The existing chat location now mounts `assistant/ui.js` and `assistant/ui.css`, retaining the site's deep-green/yellow look and official mark. The lightweight CSS face tracks the pointer, blinks, reacts during generation, and respects reduced motion. The referenced concept art is not present in the repository, so this is an original code-native treatment rather than an exact raster mascot match.
- `src/ai-employee.js` exposes server-side chat, session/memory, retrieval, catalogue, quote, feedback and explicitly consented CRM actions. The prompt and provider adapter are in `src/ai-provider.js`. Cloudflare Workers AI is configured with `@cf/meta/llama-3.1-8b-instruct-fp8`; an HTTPS-compatible endpoint can be configured using server-only environment secrets and operator-specified tariffs. The provider is not live-tested in production.
- `migrations/0005_ai_employee.sql` adds D1 knowledge, FTS5, sessions, messages, usage reservations, approved requests and aggregate events. Eleven reviewed company/product/service facts plus 19 source-page chunks from eleven public pages are indexed. The build reindexes source-page chunks when the published page source changes. Admins can propose, approve, retire, archive, preview retrieval and reindex plain-text knowledge. PDF/DOCX upload parsing is not implemented.
- The quote engine calls the existing `pricing/catalogue.js`, keeping the website's TRY price list authoritative and preventing bundled double charges. A request is an indicative estimate, with tax, scoping, media budget and third-party costs requiring team review. International currency lists are not yet approved in the live catalogue, so these are referred to the team.
- Consent-based lead, quote and handoff requests create an entry in the existing website CRM. They do not send WhatsApp or email; the API reports `emailSent: false`. Aura Control synchronization and private customer/project-status lookup are not connected.
- Sessions expire after one day, or thirty days with explicit opt-in. Cookies are HttpOnly, Secure and SameSite Strict. Users can review/edit memory and delete their conversation. Scheduled cleanup at 03:00 UTC deletes expired sessions and older analytics; CRM submissions follow the separate CRM retention process. Visitor messages are redacted for obvious phone/email patterns before being stored, while users are told not to submit sensitive information.
- Admin AI management integrates into the existing dashboard for owner/manager accounts. Its retrieval preview, approval, request summary, conversation review, redacted logs, token accounting and events have access controls and audit events. Resolution and answer-quality metrics are deliberately shown as unknown until human review exists.

## Checks and release procedure

Run `npm ci`, `npm run check`, `npm test`, and `npm run deploy:check`. The current local run passed 178 tests, including 100 deterministic two-turn scenarios across English, Arabic, French and Turkish. Mock model responses also cover invalid pricing, memory, failed calls, authorization and adversarial requests. These do **not** prove live model language quality. Worker compilation succeeds. Browser/mobile accessibility and live Cloudflare AI/CRM smoke tests await a reachable deployment.

Do not merge into `main` until the D1 migration has been backed up and the account can deploy a preview Worker. `main` automatically synchronizes to the Cloudflare production branch through `.github/workflows/sync-cloudflare-production.yml`. For preview, use the same D1 binding or an isolated copy, verify `/api/ai/session`, `/api/ai/message`, `/api/ai/quote`, `/api/admin/ai`, and a consented CRM request without contacting anyone. Check all four languages, mobile widths, reduced motion, provider usage and rollback. A backup command is documented in the repository's `README.txt` and `SECURITY.md`.

Rollback: revert the AI commit on the deployment branch and redeploy the preceding Worker revision. The additive D1 tables can remain unused; this avoids deleting conversation or CRM data. Expire/revoke sessions if required. Do not reverse the migration destructively on the production database.

## Cost model and limits

Cloudflare lists Llama 3.1 8B FP8 at **$0.152/M input** and **$0.287/M output** tokens (see the official model page). Assumptions: six visitor turns per conversation; 80% require a model call; average 2,000 input and 250 output tokens for those calls; 30-day month. Quotation-only calls are deterministic. The table covers model tokens only; Workers/D1 and unrelated Cloudflare services are extra.

| Conversations/day | Estimated model tokens/day | Estimated model cost/month |
| ---: | ---: | ---: |
| 100 | 1.08 million | $5.41 |
| 500 | 5.4 million | $27.05 |
| 2,000 | 21.6 million | $108.22 |

These are estimates, not billing guarantees. The initial `AI_DAILY_TOKEN_LIMIT=500000` and `AI_DAILY_BUDGET_USD=1` cap model calls and intentionally send excess traffic through a verified-information fallback. They must be raised only with monitored real usage for 100+ conversations/day. The configured model tariff is used to reserve a conservative maximum before calls; usage reports are tracked if returned by the provider. A different model/provider requires explicit tariff configuration.

## Known gaps before production sign-off

- No Cloudflare credentials or active desktop session were available here. Production URL and actual inference, preview, and live CRM behavior are **unverified**; do not describe the existing live site's keyword FAQ as upgraded.
- No browser runtime was available in this managed workspace, so visual/mobile QA and screen-reader testing are pending.
- Aura Control has no confirmed deployed API or service credential. The website's own CRM is the working integration; cross-system sync is deferred.
- No verified regional currency catalogue, AuraPops/AuraWeddings fixed price, customer authentication, outbound messaging service or approved exact mascot art in the repository. The assistant indicates these limits rather than inventing them.
- The fallback answers use concise reviewed English facts with a localized preface; generated page extracts are never dumped into chat. Four-language **live model quality** and long-running conversation quality need human evaluation after deployment.

## Chatbot reliability correction — October 13

A live public API probe returned `mode=ai` for a service question, followed by `mode=verified-fallback` and full website extracts on a restaurant follow-up after 16.4 seconds. This is consistent with the old 15-second provider deadline; production failure logs were unavailable, so the exact provider error cannot be confirmed.

The provider now requests Cloudflare JSON mode (documented at https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/) and accepts either serialized or parsed JSON while keeping price/action validation. Its deadline is 25 seconds, the widget deadline is 35 seconds, and the conversation lease is 45 seconds. Reviewed category facts outrank page marketing extracts, and each model knowledge chunk is capped at 900 characters. Model replies and memory fields are instructed to stay brief. No automatic retries or model changes increase spending.

Fallback answers show at most two sentences of reviewed facts (600-character excerpt cap), with source pages accessible through the existing Sources disclosure. Provider failures now record only safe reason codes: timeout, invalid/unsafe response, missing binding, provider/tariff configuration, or generic provider failure. Administrators can inspect the latest 20 failures; public responses never include those diagnostics or provider error text. Budget failures remain visible as budget_limit events. No schema migration is added by this correction.

Validation: all 182 tests pass, including JSON-mode requests, structured output validation, a simulated provider timeout, bounded fallback text, curated retrieval priority, prompt limits and diagnostic privacy. Syntax/build-index checks and Worker dry-run are also checked. Live deployment of this correction requires the existing Cloudflare account; this session has no Cloudflare credentials and the connected Windows device is offline. The public API probes verify only the pre-fix production behavior, not this patch.
