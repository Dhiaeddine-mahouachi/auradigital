# AuraMenu integration handoff

Status as of 27 November 2026. Proposed for review by the AuraMenu and AuraDigital maintainers. The existing AuraMenu design and AuraHub design are the launch surfaces.

## Ownership

AuraDigital owns Aura account identity, workspace selection, membership permission checks, service activation, plan entitlements, billing and Auri. AuraMenu owns restaurant records, menus, template access, item/category edits, translations, service-specific analytics and publishing. Both teams preserve existing menu IDs, slugs, and printed QR/NFC destinations.

## Identity handoff

Use a maintained OIDC solution with authorization code flow and PKCE S256. The existing Google flow authenticates users into AuraDigital as a client. The universal SSO issuer and its account-migration strategy remain a joint decision. Preserve the existing customer ID through an explicit issuer/subject mapping. Treat email verification as a separate state. Register exact redirect URIs for AuraMenu and AuraHub, retain host-only cookies, and keep provider tokens server-side. Validate issuer, audience, signature, expiry, state and nonce through the selected library. Agree on session revocation and logout across both origins. Reference [OAuth 2.0 Security BCP](https://www.rfc-editor.org/rfc/rfc9700.html).

## Proposed v1 contract

Field names below describe requirements for the agreed schema. These endpoints and events remain proposals.

| Operation | Required fields | Behavior |
|---|---|---|
| Resolve workspace access | `user_id`, `workspace_id`, `service_id` | Resolve authenticated identity and current workspace membership server-side. Return explicit permissions and activation/entitlement state. |
| Link legacy menu | `workspace_id`, `menu_id`, `idempotency_key` | Require proof through a verified owner/approved record. A conflicting assignment returns 409 for review. Preserve URL and slug. |
| Read menu management data | `workspace_id`, `menu_id` | Resolve the workspace-to-menu link and permission before calling AuraMenu. Require verified service authentication for server-to-server calls. |
| Write or publish | `workspace_id`, `menu_id`, `revision`, `idempotency_key` | Require current edit/publish permission and feature entitlement. AuraMenu enforces revision checks. |
| Notify plan change | `event_id`, `occurred_at`, `workspace_id`, `service_id`, `plan_id`, `status`, `effective_at`, `version` | Authenticate messages and record event IDs before acknowledging. Ignore already processed events. Apply ordered updates using the per-subscription sequence. |

Suggested scopes are `auramenu:read`, `auramenu:write`, and `auramenu:publish`. Use 401 for missing identity, 404 for an inaccessible workspace/menu, 403 for an allowed resource whose requested operation lacks permission/entitlement, and 409 for conflicting revisions or ownership links. Keep errors free of tokens and private content. Finalize the plan IDs, feature matrix and event schema when both maintainers review the proposal.

## Staging acceptance

1. Sign in from AuraMenu with an existing Aura customer, then through the new-user flow. Validate the stable customer ID and round-trip session.
2. Select or create a restaurant workspace. A second workspace owned by the same account and another user's workspace must each be isolated.
3. Link a staged menu through an explicitly verified ownership record. Open and edit it in the existing AuraHub shell. Confirm the published URL and existing QR/NFC target resolve after an edit.
4. Verify account logout, revoked membership, read-only roles, expired plan, restricted premium template, payment event replay and legitimate renewal.
5. Verify billing visibility, NFC requests and authorized Auri actions without touching a production menu.

The staging D1 database exists without application tables. Initialize it with fixtures and provision the staging Worker, then register test callbacks and agree on provider, legacy ownership mapping and plan contracts before enabling the flow.
