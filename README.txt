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
   Hero fallback image, project screenshots and NFC/QR restaurant image are included
   directly beside index.html. There is no required assets/ subfolder.
   The hero and portfolio atmosphere sections stream Pexels background video when online.
   If offline, the local hero image remains visible automatically.

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

   Supported card purposes now: Google reviews and website.
   Menu NFC is intentionally reserved for a later update.

Main pages: index.html, services.html, portfolio.html, aura-menu.html, nfc.html,
qr-menu.html, packages.html, about.html, contact.html, nfc-builder.html,
nfc-status.html.
