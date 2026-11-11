# Private menu drafts

## Implementation and integration

The Business Hub's Menu drafts section reuses the current customer session, organization selector, saved business profile, verification flow and role/entitlement guards. It supports private create/reopen/edit/save, content preview, archive and JSON export. It does not create public menu requests, charge, or publish. The full standalone builder remains in the AuraMenu repository; connecting that domain to shared authentication and these drafts is pending.

Apply additive migration `0029_menu_drafts.sql` only to an isolated staging database first, together with existing migrations. Enable `GROWTH_OS_ENABLED=true` and `MENU_DRAFTS_ENABLED=true` in that isolated environment. Defaults remain false. Do not enable existing team billing or new paid entitlements to test this.

## API

All routes are under `/api/hub/workspaces/:organizationId/menu-drafts` and require the existing shared customer session. They return `Cache-Control: no-store`. There is no public draft URL.

| Method | Path suffix | Request | Response |
| --- | --- | --- | --- |
| GET | collection | — | `{drafts:[...]}` |
| POST | collection | `{draft:{fields,categories},state?}` | 201 `{menu:...}` |
| GET | `/:draftId` | — | `{menu:...}` |
| PUT | `/:draftId` | `{draft:{fields,categories},state?,version}` | `{menu:...}` or 409 on stale revision |

States: draft, preview, archived. `active`, `paid`, ownership and billing fields are rejected. Writes require same-origin requests, the existing per-customer 60/minute write limiter, current roadmap write permission and verified email. Reads use workspace read permission, including active subscription/revocation checks for members. Organization IDs are never trusted alone. Ownership and permission conditions are repeated inside mutations.

Up to 10 retained drafts per organization, 256 KiB JSON per request, 12 categories, 20 products per category, 100 products total. Archived drafts count toward the retained limit. Item prices may be empty in private drafts; an explicit numeric price is required when supplied. Images must be HTTPS URLs without credentials; binary/data uploads are not accepted. Draft saves and minimal audit records are one D1 batch. Notes/transcripts/contact details/tokens are not logged by this module.

## Staging validation and release requirements

1. Use a disposable local/staging DB; run all migrations and the Node tests. Keep production IDs and data out of test commands.
2. Verify shared sign-in, email delivery/recovery and organization creation with isolated test identities.
3. Save a draft, reload it in a second authenticated session, edit and observe 409 for a stale first session.
4. Confirm another tenant, a pending member, an expired member and a read-only member cannot mutate it.
5. Test the new hub UI and standalone builder on mobile/desktop in a browser-capable environment. Local browser launch is blocked in this execution environment. Both private-editor and standalone-builder Chromium CI scripts subsequently passed, and synthetic mobile/desktop screenshots were reviewed. Actual devices and live routing remain separate checks.
6. Review account/API routing before connecting auramenu.space. Standard centralized auth redirects are needed; do not share cookies across top-level domains.
7. Connect drafts to authenticated request ownership, the existing manual activation flow, and public QR verification in staging before claiming customer acceptance.

## Recovery

This change does not modify/delete existing requests, billing or publication tables. Rollback is disabling MENU_DRAFTS_ENABLED and deploying the prior source after normal review. Preserve the additive draft table; do not drop customer work during rollback. Use platform-managed database backup/recovery under the established operations policy before any production rollout. No backup has been verified or created in this session.
