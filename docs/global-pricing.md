# Global Pricing

Initial website rates are owner approved, not market-researched estimates. They
are independent commercial rates; no currency conversion or FX feed is used.
TRY existing catalogue remains the fallback for unknown countries. Unsupported
services in other regions require quotations; unavailable required items block
numeric combined estimates. Website packages, features and billing are unchanged.

## Operations

Open Admin → Global Pricing as an owner or manager. Edit amounts in major units,
save draft, preview the selected region, then an owner publishes the saved draft.
Managers cannot publish; viewers cannot access private pricing configuration.
History contains actor, timestamp, action and changed paths with old/new values.
Restore stages an old configuration as an unpublished draft. Concurrent edits
are rejected and must be reloaded. No invoices or subscriptions are rewritten.

Advanced configuration supports new regions, names, five currencies, country
mappings, fallback and enable/disable. Changing a currency requires reviewing
all that region's rates: the system deliberately does not convert them.
Rate keys are catalogue service IDs and `hosting:<erp-package-id>`.
Stored `minor` amounts are integers: TND has 3 decimals, other supported
currencies 2. To withdraw a price delete its rate; zero is an explicit free price.
Optional validity fields: `validFrom`, `validUntil` (ISO date-time).
Promotion fields: `promoMinor`, `promoFrom`, `promoUntil`; expiry is required.
The regular amount resumes at promotion expiry. Region availability can be
withdrawn with enabled:false; manual unsupported selections are rejected.

Only public, currently effective prices are projected to `/api/pricing`.
Response and personalized HTML are private/no-store to avoid regional cache leaks.
`request.cf.country` supplies trusted geolocation, never language or a forwarded
country header. Manual selection uses the `aura-pricing-region` cookie for one
year. A region parameter in quotation links preserves the origin of an enquiry.
No visitor IP addresses are retained by this pricing system.

D1 tables are additive and initialized idempotently at first use. The matching
migration is `0021_global_pricing.sql`. Catalogue versions are immutable and
public publication is an optimistic atomic pointer change in a D1 batch.
Quote endpoints recalculate from selected IDs and reject stale supplied versions
or currency mismatches. Numeric amounts supplied by a browser are ignored.

## Research workflow

For each region, record dated verifiable URLs and comparable package scope;
separate freelancer and agency positioning. Include delivery/support costs,
purchasing power, hosting/payment/third-party costs, local tax assumptions,
target margin and currency risk. Classify a recommendation as budget,
competitive, professional or premium. Save evidence and a proposed minor-unit
rate under private `research`; it is never returned publicly and never applied
to prices. An owner explicitly transfers any approved recommendation into a
rate, previews the resulting package, and publishes it. No automatic AI
recommendation can publish itself. No competitor prices are fabricated here.

## Fulfilment boundaries

AuraMenu's external self-service checkout remains a TRY workflow. International
visitors are routed to a regional enquiry before a checkout or payment is offered.
NFC has local TRY fulfilment with existing delivery fees. International orders
require an enquiry and availability/delivery confirmation; they do not silently
enter the TRY payment workflow. Historical NFC status links keep agreed amounts.
Cross-border automated checkout and third-party builder currency changes are
outside this repository and have not been enabled.

## Sources for country detection and mapping

- Cloudflare: https://developers.cloudflare.com/workers/runtime-apis/request/
- ECB, Bulgaria joined the euro on 1 January 2026:
  https://www.ecb.europa.eu/euro/changeover/bulgaria/html/index.en.html

Country mapping includes 21 eurozone member states as of October 2026. Other
European countries use the explicit fallback until an owner approves a region.
