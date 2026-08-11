AURADIGITAL — EASY ACCESS / CLOUDFLARE READY

1) Preview locally
   Double-click index.html or nfc-builder.html to inspect the static design.
   To test form submission and the dashboard API, run `npx wrangler dev`.

2) Deploy to Cloudflare Workers
   The site uses Workers Static Assets, src/worker.js and the D1 database configured
   in wrangler.jsonc. No frontend build command is required.

3) Contact destination
   Contact form and Aura Assistant handoff open WhatsApp to +90 538 550 76 74
   with the visitor's message pre-filled. No backend is required.

4) Background media
   The hero, studio and portfolio atmosphere sections use small, locally served MP4
   files in media/ so playback does not depend on a third-party connection.
   The landing-page image fallback was removed so it cannot overlap the hero video.
   script.js fades video in only after it can play, resumes it after tab visibility
   changes, and respects the visitor's reduced-motion preference.

5) Languages
   Turkish, English and Arabic are built in and work without a translation service.
   Turkish is the default. The visitor's selection stays active between pages,
   and Arabic automatically switches the layout to right-to-left (RTL).

6) Brand & motion
   The public brand uses the supplied AuraDigital A mark beside the lowercase
   "auradigital" wordmark. The reusable mark is logo.svg in the site root.
   The visual system uses deep green, acid lime, cream, mint and soft pastel accents,
   with full-bleed team media, rounded content cards and oversized typography.
   Scroll progress, staggered reveals, subtle pointer depth and responsive motion
   are handled locally by style.css and script.js with reduced-motion support.

7) Cookie consent & Aura Assistant
   A cookie-preference banner is included on every page and remembers the visitor's
   choice. Aura Assistant provides local FAQ answers for Web, AuraMenu, NFC, packages,
   portfolio and contact questions in Turkish, English and Arabic. It needs no backend.

8) NFC design request files
   nfc-builder.html = customer form and live front/back card preview
   nfc-builder.css  = isolated builder and physical card styling
   nfc-builder.js   = TR/EN/AR copy, live colors, QR mock and request submission
   nfc-status.html / css / js = private request-status page
   admin/index.html + admin/admin.js = red pending / paid / green approved controls
   src/worker.js = validation, D1 storage and public/admin NFC API routes
   src/http.js = bounded JSON parsing and consistent locked-down API responses
   src/security.js = origin checks, signed random admin sessions and secure cookies

   Supported card purposes now: Google reviews and website.
   Menu NFC is intentionally reserved for a later update.

Main pages: index.html, services.html, portfolio.html, aura-menu.html, nfc.html,
qr-menu.html, packages.html, about.html, contact.html, nfc-builder.html,
nfc-status.html.

9) AuraMenu pricing
   AuraMenu self-build publishing is 1,599 TL. The public
   /api/auramenu/pricing endpoint and admin Pricing view share the
   auramenu_self_price setting. AuraDigital-managed menu setup remains a separate
   price controlled by qr_menu_price.

10) Source and deployment security
   Browser-delivered HTML, CSS and JavaScript are necessarily public. Secrets and
   server-only code are not included in static assets: .assetsignore excludes src,
   migrations, Wrangler configuration, environment files and repository metadata.
   Production deployment is Cloudflare Workers only; the legacy workflow that
   uploaded the entire repository to GitHub Pages has been removed.

11) New-request email notifications
   Successful QuickSite, AuraMenu and NFC submissions queue a private email alert
   after the request is stored in D1. The recipient is read from the encrypted
   NOTIFICATION_EMAIL Worker secret; no personal inbox is committed to this public
   repository. REQUEST_NOTIFICATIONS is the Cloudflare Email Service binding.

   Before deployment, enable Email Routing for auradigital.ink, verify the receiving
   address in Cloudflare, then set the secret with:
   npx wrangler secret put NOTIFICATION_EMAIL

12) Admin security migration
   The first login uses username "owner" and the existing ADMIN_PASSWORD Worker
   secret. This creates an owner record with a unique PBKDF2-SHA256 password hash
   and a revocable, opaque session in D1. After that first successful login, remove
   ADMIN_PASSWORD from the Worker secrets. Team & Access supports owner, manager and
   read-only viewer accounts; password resets and account deactivation revoke active
   sessions. Security Log records administrator actions without storing visitor IPs.

   Run `npm run check`, `npm test`, and `npm run deploy:check` before deployment.
   Run `bash scripts/backup-d1.sh` at least weekly and before database changes.
   Full production security operations are documented in SECURITY.md.
