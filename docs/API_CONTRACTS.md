# Platform API contracts

## Existing interfaces

| Interface | Authentication and scope |
|---|---|
| `GET /api/customer/session` | AuraDigital host-only customer cookie. Returns the current account or a null user. |
| `GET /api/hub/workspaces` | AuraDigital customer session. Lists owned organizations and currently entitled memberships. |
| `POST /api/hub/workspaces` | Same-origin session and workspace write limiter. Optional `requestId` binds the existing first-workspace onboarding flow. A retry returns the existing workspace. |
| `GET /api/hub/workspaces/{organizationId}` | Current server-side workspace authorization. |
| `/api/hub/workspaces/{organizationId}/menu-drafts` | Private workspace drafts behind a feature flag. See [draft contract](MENU_DRAFTS.md). |
| `/api/aurapops/account/session` on AuraMenu | Current same-origin account adapter for the standalone AuraMenu application. |

## Proposed AuraMenu v1

Review with both implementations before assigning routes and deploying clients. The [integration handoff](agent-handoff/AURAMENU_INTEGRATION.md) defines payloads, trust boundaries and staging acceptance. Keep public menu routes stable.
