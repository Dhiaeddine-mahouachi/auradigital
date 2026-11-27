# Aura Core data ownership

| Record | Existing source | Integration rule |
|---|---|---|
| Account, identities and sessions | `customer_users`, `customer_external_identities`, `customer_verified_emails`, `customer_sessions` | Reuse customer IDs and preserve account ownership through provider linkage. |
| Workspace, profile and access | `organizations`, `organization_members`, `organization_roles`, `organization_permissions`, `organization_invitations` | Reuse organization UUIDs and evaluate membership permissions for each protected operation. |
| Membership payment | `member_subscriptions`, `subscription_payment_events` | Seat entitlements remain independent of product plans. |
| AuraHub and Auri | `business_missions`, `growth_scenarios`, `menu_drafts`, `hub_contact_requests`, `hub_auri_messages` | Private workspace drafts and message history keep their existing scope and identifiers. |
| AuraMenu | Existing `auramenu_requests` and `auramenu_edit_access` data | Preserve public slugs and menu IDs. AuraMenu owns editor and publication semantics. |
| Commerce and CRM | `shop_bank_orders`, `orders`, `invoices`, `subscriptions`, `crm_links` | Use authoritative records after verified workspace assignment. Email alone grants no workspace entitlement. |

Proposed additive storage is limited to explicit workspace/service ownership links, workspace-bound plan state and the event receipt records required by the agreed contract. Reconcile overlaps with the existing sources before writing a migration. Core identity, workspace and product-data tables already exist.
