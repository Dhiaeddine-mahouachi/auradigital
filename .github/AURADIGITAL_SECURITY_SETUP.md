# AuraDigital security rollout

This branch adds a security wrapper around the existing Worker without moving secrets into the repository.

## What is protected

### Private previews

New QuickSite and AuraMenu requests receive a cryptographically random preview token. Only the SHA-256 hash is stored in D1.

- New QuickSite draft-by-ID requests require the preview token.
- New pending AuraMenu images require the matching preview token.
- Approved AuraMenu images remain public so published menus continue to work.
- Existing pre-upgrade projects with no token row remain available for migration compatibility. New projects are protected automatically.

The creation response includes `request.previewToken`. QuickSite also receives `request.previewUrl`.

Same-origin QuickSite creation also receives an HttpOnly, Secure, SameSite=Strict preview cookie for compatibility with the current builder.

## Team accounts

Owner login remains available at `/admin/` using the existing `ADMIN_PASSWORD` Cloudflare secret.

Team login is available at:

`/admin/team-login.html`

Owner team management is available at:

`/admin/team.html`

Roles:

- `owner`: unrestricted access.
- `admin`: broad operational access, but settings writes are reserved for owner.
- `sales`: clients/orders plus read-only design requests.
- `designer`: QuickSite/AuraMenu/NFC request endpoints only.
- `accountant`: orders, invoices, subscriptions and expenses.

Permissions are enforced in the Worker. They are not UI-only restrictions.

Team passwords use PBKDF2-HMAC-SHA256 with 210,000 iterations and a unique random salt. Plaintext team passwords are never stored.

## Activity log

Admin mutations and team logins are stored in `admin_activity`. Owner/admin can read recent events at `/api/security/activity`.

## Cloudflare Access (recommended)

Add Cloudflare Access in front of the admin surface after this branch is deployed.

Recommended protected application paths:

- `auradigital.ink/admin/*`
- `auradigital.ink/api/admin/*`
- `auradigital.ink/api/security/admin-users*`
- `auradigital.ink/api/security/activity`

Allow only the owner's identity initially. When team members are added, add their verified identities or the appropriate identity-provider group.

Do not protect public APIs such as `/api/public-content`, published AuraMenu sites, or customer request creation endpoints with the owner-only policy.

Cloudflare Access should be treated as an additional identity-aware perimeter. The Worker role and session checks remain required even after Access is enabled.

## Deployment checks

1. Confirm `ADMIN_PASSWORD` remains configured as a Cloudflare Worker secret.
2. Deploy the Worker.
3. Owner-sign in at `/admin/` and confirm the normal dashboard still loads.
4. Visit `/admin/team.html` and create a test Designer account.
5. Sign out, then sign in through `/admin/team-login.html` with that account.
6. Confirm Designer can load design-request APIs but receives HTTP 403 for finance/settings APIs.
7. Create a new QuickSite request and confirm the response contains `previewProtected: true` and `previewToken`.
8. Confirm the draft endpoint returns HTTP 403 without the token and succeeds with `?token=...`.
9. Create a new AuraMenu request with an image and confirm the pending image requires the preview token; after approval it should become public.
10. Configure Cloudflare Access for the admin paths above.
