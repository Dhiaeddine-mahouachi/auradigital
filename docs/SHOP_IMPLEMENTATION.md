# NFC & QR shop

## Repository audit

Audited main at `420f81a2e0cd3fca306e3f31243c138aace09f8a`.
The frontend is static HTML/CSS/ES modules. `script.js` owns shared navigation
and footer. `src/worker-entry.js` composes Worker routers; `wrangler.jsonc`
serves assets with explicit Worker-first paths. D1 is the existing database.
Admin/employee authentication uses separate secure, HttpOnly sessions in
`src/security.js` and `src/employee-portal.js`. CRM clients are records, not
customer identities. No customer registration/session API was found. NFC
requests currently use manual payment approval, not a payment gateway.
No merchant credentials or production-ready front/back card artwork were
provided. There is no R2 binding; the deployment wrapper explicitly disables
automatic resource provisioning. Main automatically syncs to the production
branch, so this work must stay on its feature branch until staging approval.

## Implementation plan

1. Reuse shared navigation/footer, Worker routing/security and D1. Add `/shop`
   and `/shop/cards/:slug`, a JSON-backed seed catalog, responsive filtering,
   front/back controls, larger dialog preview and reduced-motion support.
2. Add guest personalization and versioned cart storage, editable items and
   `/shop/cart`. Resolve prices against catalog data server-side. Never allow
   demo artwork to enter a payable checkout.
3. Extend the existing admin interface/session with catalog management and an
   additive D1 migration. Allow catalog changes without frontend code changes.
4. Integrate customer identity once the authoritative customer account system
   is identified or a new shared customer identity is agreed. Add durable guest
   cart merge, private logo object storage, orders, shipping, tax rules and
   provider-specific verified payments. These dependencies block checkout.
5. Add fulfillment/customer order views, sandbox E2E validation and staging.

## Release gates

- Apply `0022_shop_catalog.sql` to staging D1 first. No runtime DDL.
- Approve artwork, materials, inventory, prices, shipping and tax rules before
  publishing sellable products. Seed designs are explicitly demos, with no price.
- Select a payment provider against AuraDigital's actual merchant registration,
  complete onboarding and supply sandbox credentials. No provider is assumed.
- Provision private object storage explicitly before enabling logo uploads.
- Identify/connect customer authentication. Never reuse employee/admin identities
  for shoppers or treat CRM records as login accounts.
- Implement hosted checkout, signed callbacks, event deduplication, transactional
  order snapshots and guarded fulfillment; pass success/failure/cancel/retry E2E.
- Verify existing pages on staging; do not merge into main to obtain a preview.
- Live payments and real orders require the user's explicit approval.

This branch does not certify production commerce readiness. The checkout endpoint
fails closed and never accepts a payment or creates a paid order.

## Delivered in this branch

- Phase 1: shared Shop navigation/footer link, eight explicitly labeled sample
  themes with paired vector assets, all fourteen category options, combined
  search/filter/sort controls, removable filter chips, real empty/error states,
  hover/button/keyboard/touch flips and native dialog enlargement. Card shape
  and orientation are preserved, including the vertical Luna concept. Sample
  QR codes resolve to the public NFC information page, not a customer destination.
- Personalization/cart: quantities, material/finish, business and optional
  contact fields, HTTPS destination validation, honest unchanged sample artwork,
  review summary, versioned browser cart, cross-tab updates, drawer and full cart,
  quantity editing, personalization editing, removal and clearing. No registration
  is requested while browsing or saving demos. Logo upload is visibly unavailable.
- Backend: additive catalog migration and seed; authenticated admin catalog CRUD
  via existing owner/manager/viewer roles; atomic audit logging; archive support;
  production asset/publishing guards; server-derived quote endpoint. Price totals
  remain estimates until shipping/tax rules exist. Checkout always returns 503.
- Production dependencies remain open: customer identity and durable cart merge,
  logo upload/storage, shipping/taxes/terms, orders, payment adapter and verified
  sandbox payments, customer dashboard, fulfillment and commerce analytics.

## Local verification

Run `npm ci --ignore-scripts`, `npm run check:shop`, `npm run build:shop`,
`npm run test:shop`, `npm test`, and `npm run deploy:check`.
The nine shop tests cover catalog/filtering, tampered cart prices/quantities,
corrupt storage, admin/CSRF permissions, transaction rollback, demo publishing,
real 404s, metadata and the checkout gate.

Run `npm run test:shop:browser` with a Playwright Chromium installation, or set
`SHOP_CHROMIUM_PATH` to an available Chromium binary. The browser suite starts
the real shop router against an in-memory SQLite/D1 adapter and local assets;
it never contacts Cloudflare D1 or creates external orders. It checks desktop,
390px mobile and 768px tablet, hover/keyboard/touch, dialogs, all cart operations,
reduced motion and catalog failure. Screenshots are written to ignored
`test-output/shop/`. This local fixture does not replace Worker staging checks.

The existing 213 tests passed before the shop tests were added. Strict shop
TypeScript checks, the nine additional tests, browser checks and a Cloudflare
deployment dry-run passed. No staging or production deployment was performed.
