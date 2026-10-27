# AuraDigital shop, customer accounts and bank-transfer orders

The shop reuses the site's static HTML/ES modules, Cloudflare Worker routing,
D1 database, cinematic forest-green/lime design system, admin sessions,
password hashing and security controls. The customer identity module is shared
at `/account`; shoppers never use administrator or employee identities.

## Customer flow

1. Browse eight uploaded card themes, filter designs and preview both sides.
2. Use the `+` button below a card to add it immediately to the panier below
   the collection. Guest selection, quantities and personalization persist in
   versioned browser storage across signup and login.
3. Checkout requires an AuraDigital customer account. Register or sign in,
   then return to `/shop/checkout` with the same cart.
4. Enter full name, business name, phone, country, city, street address, postal
   code, optional billing details and each card's NFC/QR link.
5. Review the server-priced total and accept the order conditions. The server
   records an unpaid order owned by that customer and saves the delivery profile.
6. Transfer the exact card total using the displayed IBAN and unique order
   reference. Payment reporting does not mark the order paid.
7. The account lists orders and their statuses. An owner or manager checks the
   actual bank receipt and confirms payment in Admin → Shop Catalog → Bank-transfer
   orders. Confirmation is audited atomically and moves production to awaiting artwork.

## Offer and artwork

The eight shipped card templates cost **600 TL per card**, authorized on
2026-10-27. They are made-to-order offers; displayed artwork remains an example,
and personalized artwork must be approved before printing. Stock and finalized
print proofs are not implied. Delivery is arranged separately and any delivery
fee must be confirmed before shipping. No delivery charge or tax invoice is fabricated.

The user's supplied payment details are:

- IBAN: `TR940001009010394706205001`
- Account holder: `Dhiaeddine Mahouachi`
- Currency: TRY

The IBAN checksum was checked locally; no bank ownership or receipt verification
is claimed. There is no bank API or card gateway integration. Only an authorized
administrator can mark a bank transfer received.

`shop/artwork/uploaded-manifest.json` maps unchanged original PNGs to separate
front/back browser viewports. Theme IDs and slugs stay stable. The reader upgrades
original sample references and their previously unset prices while preserving
archived themes and administrator-selected assets or prices. `scripts/import-shop-artwork.mjs`
keeps the seed consistent when rebuilding legacy demo files.

## Routes and records

- `/shop`, `/shop/cards/:slug`, `/shop/cart`, `/shop/checkout`, `/shop/orders/:id`
- `/account`, `/account/login`, `/account/signup`
- `/api/customer/register`, `/api/customer/login`, `/api/customer/session`, `/api/customer/logout`
- `/api/shop/catalog`, `/api/shop/quote`, `/api/shop/checkout`, `/api/shop/orders`, `/api/shop/orders/:id`, `/api/shop/orders/:id/report-transfer`
- Existing admin catalog endpoints plus `/api/admin/shop/orders` and `/api/admin/shop/orders/:id`

`customer_users` and `customer_sessions` provide shared customer identities.
Passwords use the existing bcrypt cost-12 helper. Session tokens are random,
hashed in D1 and delivered only in Secure/HttpOnly/SameSite=Strict host cookies.
Account writes enforce same-origin checks, bounded bodies and login rate limits.
Registration does not verify email ownership, and self-service password recovery
is not part of this iteration.

`shop_bank_orders` stores the customer owner, immutable line/price/address/bank
snapshots, card total, payment/production states and report/verification timestamps.
Customer APIs enforce ownership; admin mutations require owner/manager roles.
Server-derived totals ignore client price, user-ID, email and paid-status fields.
Customer-scoped idempotency keys prevent replayed order creation; reuse with
changed details is rejected. No raw card information is collected.

## Deployment and validation

All new tables initialize additively on first use, matching the repository's
existing schema pattern. Explicit migrations are also supplied:

- `0022_shop_catalog.sql`: original catalog.
- `0023_shop_uploaded_artwork.sql`: guarded artwork updates.
- `0024_customer_accounts_bank_orders.sql`: customer accounts and bank orders.
- `0025_shop_made_to_order_pricing.sql`: guarded 600 TL offer updates.

Feature-branch pushes trigger the connected Cloudflare Workers build. Main also
syncs to the existing production branch; do not assume branch isolation.

Use `npm run check`, `npm test`, `npm run deploy:check` and
`npm run test:shop:browser`. The browser test uses the real shop router against
in-memory SQLite/D1 and local assets. Set `SHOP_CHROMIUM_PATH` when using an
existing Chromium installation. It does not create live customer accounts or
orders, send messages, transfer money, or confirm real bank receipts.

Checks cover cold database initialization, all uploaded front/back views,
search/filtering, desktop/mobile layouts, cart operations, signup/login and
return-to-checkout, address validation, price tampering, account isolation,
idempotent order creation and manually verified bank payments. Screenshots go
to ignored `test-output/shop/`.

Logos are collected by email with the order reference. Object uploads, automated
email notifications, delivery pricing/tracking, artwork approval tooling and tax
invoice generation remain separate work. The existing admin product editor and
all unrelated AuraDigital services are preserved.
