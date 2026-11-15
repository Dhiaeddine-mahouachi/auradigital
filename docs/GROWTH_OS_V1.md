# Growth OS V1 delivery checkpoint

November 16, 2026 (Istanbul). This increment builds on the unified account, roadmap entry, recovery, and workspace-switching changes now in main through PR #61.

| Customer journey | Findings and implementation | Verification |
| --- | --- | --- |
| Identity and onboarding | The existing Worker uses a shared customer session. The Business Hub creates an organization and its initial roadmap together. Email verification and recovery remain dependent on live sender configuration. | Existing signup, login, logout, synthetic recovery, and Hub browser coverage. |
| Roadmap | The existing D1 roadmap persists milestones, task status, dependencies, profile revisions, and customized actions. This release connects the existing quote handoff to the originating workspace. | Existing persistence coverage and new authenticated quote handoff tests. |
| Marketplace | The Hub now links to existing AuraWeb, AuraMenu, NFC, advertising, and automation flows. Advertising and automation request a quote. | Hub browser coverage and existing service routes. |
| Workspace requests | When an owner submits the existing contact form from the Hub, the request receipt, CRM lead, workspace link, and notification outbox records commit together. The dashboard shows the receipt as received. Legacy public submissions keep their existing behavior. | Actual Worker handler integration tests cover retry deduplication, scope isolation, migrated schema integrity, and persisted CRM details. |
| Checkout and NFC fulfillment | Card orders use the existing server-priced bank transfer checkout. Administrators can record customer artwork approval and production, shipment, and delivery in order. Customers see the recorded status. | Existing checkout tests plus paid-only transitions, role restrictions, concurrent retries, audit event uniqueness, and cross-customer isolation. |
| AURI | Existing recommendation and roadmap tools remain available. A next step can link to the existing quote form for review. AURI can show recent account-level orders from an owned workspace. Order summaries exclude bank, address, and personalized item details and are not sent to a model. | Integration tests cover scoped order summaries and refusal in shared workspaces. |
| Projects and subscriptions | The Hub shows owned workspace request receipts and active paid NFC fulfillment. Full digital delivery projects, invoicing, subscriptions, recurring payments, and business analytics require additional integration. | Existing sources inspected. No legacy client records are linked by email or exposed through this increment. |

## Release sequence

1. Reconcile the GitHub source with the live unified-entry assets and confirm the Cloudflare branch trigger before merging the production branch.
2. Verify the production D1 backup and isolated restore. Apply migration `0030_hub_contact_requests.sql` to staging first, confirm existing records and run the browser and migration checks. Apply the additive migration to production before publishing this Worker so the quote and project routes can read the new table.
3. Verify delivery with the authorized Resend sender and a designated test mailbox. The current checkout requirement for verified customers is still enforced.
4. Verify live authentication, CRM quote persistence, and order read access using a designated test account. Payment/fulfillment validation in this checkpoint uses synthetic records.
5. The Worker can be rolled back independently of the additive table. Keep the table and its receipts so a rollback preserves submitted requests.

## External dependencies and decisions

- Cloudflare access to production and a separate staging D1 environment is needed to verify migration, backup restoration, and the deployment trigger.
- Customer email delivery and optional Google OAuth require verified live provider configuration.
- AuraMenu publication and cross-domain sign-in need a verified ownership handoff. Aura Control remains the operations app. Neither is given access to customer order summaries by this change.
- Confirm the supported recurring payments provider and invoicing requirements before enabling paid subscriptions or issuing invoices. The NFC price difference between the separate services catalogue and card shop needs a commercial decision.
