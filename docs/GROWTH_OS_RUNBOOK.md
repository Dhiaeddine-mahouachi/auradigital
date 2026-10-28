# AuraDigital Growth OS — configuration, staging and recovery

This runbook accompanies a local review branch, not a deployment authorization. Do not merge or push to `main` or `contact-autoreply`: the repository synchronizes those branches to production. Inspect Cloudflare branch-trigger settings before pushing any review branch; they were not accessible in this task.

## Environment prerequisites

| Setting | Purpose | Initial state |
|---|---|---|
| `GROWTH_OS_ENABLED` | Enable `/hub` and `/api/hub` | `false` in production configuration |
| `CUSTOMER_IDENTITY_ENABLED` | Enable identity independently of the Hub | `false` in production configuration |
| `CUSTOMER_AUTH_ORIGIN` | Exact HTTPS identity origin, no path | Not configured |
| `GOOGLE_LOGIN_ENABLED` | Operator gate after Google verification | Absent/disabled |
| `GOOGLE_CLIENT_ID` | Google web OAuth client for this environment | Not provided |
| `GOOGLE_CLIENT_SECRET` | Server secret, configured using the provider's secret facility | Not provided |
| `CUSTOMER_EMAIL_ENABLED` | Operator gate after sender/delivery verification | Absent/disabled |
| `RESEND_API_KEY` | Existing provider credential; never commit or put in a client bundle | Runtime presence not inspected |
| `HUB_WRITE_RATE_LIMITER` | Authenticated autosave/write limit, 60/minute per user | Declared, not deployed |
| `CONTACT_RATE_LIMITER` | Additional invitation limit, 5/minute per owner | Existing binding retained |
| Recurring billing provider | Invited member pays $5 USD/month, taxes disclosed | Unsupported/unconfigured; live checkout **BLOCKED** |
| Administrator MFA | Mandatory privileged-account release gate | **Not implemented** |

The code does not accept a `billingEnabled` browser flag or use bank transfer for recurring subscriptions. No key, environment variable or fake payment redirect enables paid seats in this increment. A provider adapter, signed webhook verification, idempotent state transitions, cancellation, tax handling, retries, policy and full provider tests still need implementation.

Google redirect URI: exact configured origin plus `/api/customer/google/callback`. Register separate staging and production OAuth clients and authorized redirect URIs. Claims are verified on the server against Google's fixed JWKS endpoint. Google `sub` is the identity key. Existing email accounts are not implicitly linked. Users must authenticate and verify their existing account before linking Google in Settings. Gmail or matching verified Google Workspace domains may satisfy email verification; other third-party Google email addresses require independent mailbox verification. OIDC completion redirects only to `/hub`, `/account` or `/shop/checkout` selected in the server-bound flow.

Email verification lasts 24 hours; password-reset links last 30 minutes. Tokens are single-use and stored as hashes. Links carry tokens in a fragment, removed from browser history on load. Verify actual delivery, sender authentication, expiry, spam behavior and provider failure in staging. The account remains usable for draft onboarding without verification. Sensitive billing/team boundaries are server-enforced when identity or growth is enabled. No existing account is silently grandfathered as email-verified.

## Local development and checks

Use Node 24 (Node 22 with supported TypeScript stripping may also be usable; the executed runtime was Node 24.22.1).

```sh
npm ci --ignore-scripts
npm run check
npm test
npm audit --audit-level=high
npm run deploy:check
```

`deploy:check` is Wrangler `--dry-run`; it does not publish. Existing Wrangler wrapper disables automatic provisioning. Do not substitute a live deploy command without approval.

`npm run dev -- --port 4173` runs **synthetic in-memory QA only**, without Cloudflare credentials or real data. `/__qa/start` starts a synthetic owner session. `/__qa/mobile` and `/__qa/tablet` contain 390px/768px same-origin responsive QA frames. This test server maps the Secure production cookie to a local-only unprefixed HTTP cookie and relaxes framing **only in that test server**. It is excluded from production assets, not imported by the Worker and must never be deployed as a production server. Restarting it discards all QA records.

## Staging preparation — no infrastructure writes

Provision or identify an authorized staging D1 database separately. Do not reuse production. With its real UUID and an authorized staging hostname:

```sh
node scripts/prepare-growth-staging.mjs --database-id <real-staging-database-uuid> --hostname <authorized-staging-hostname>
```

The helper only writes `.wrangler/growth-staging.json`. It rejects the production D1 UUID and accepts only explicitly designated staging subdomains of `auradigitalworks.com`. It separates rate-limit namespaces, removes cron triggers and disables outbound AI/Google/email. It does **not** verify that a supplied database belongs to the intended Cloudflare account; an operator must verify that before using the config.

No staging database/domain/configuration has been provisioned or deployed by this task. The placeholder arguments above are instructions, not working infrastructure.

## Before any migration

1. Verify Cloudflare account, Worker environment, custom domain and actual D1 database UUID through authenticated tooling.
2. Record applied migrations, schema, row counts and relationships for customer users/sessions, orders, clients, products and admin records. Do not log private row contents or secrets.
3. Export a backup to a restricted location outside the assets directory, encrypt it and record checksum/time/database identity. Confirm the D1 recovery/bookmark policy.
4. Restore into a separate database and prove representative legacy authentication/orders still work. A local SQLite transaction test is not proof of cloud backup recovery.
5. Apply `0028_growth_os.sql` to staging through the approved migration process. Run `PRAGMA foreign_key_check`, compare baseline counts, and run integration tests. There are 14 additive tables and no legacy destructive migrations.
6. Configure provider secrets separately. Do not copy customer data or production credentials into the local QA fixture.
7. Complete browser, security, provider and accessibility acceptance gates. Obtain explicit approval before any production rollout.

## Release sequence after all gates and owner approval

Keep old customer tables, IDs, purchase records and sessions. Apply the tested additive migration before enabling code that queries it. Publish the reviewed Worker state only through an approved workflow. Enable customer identity after provider checks; enable the Hub separately. Team recurring checkout remains unavailable until its independent provider release gate is satisfied. Preserve old product access workflows until explicit ownership grants and integration tests are complete.

## Rollback and recovery

* **Hub rollback:** set `GROWTH_OS_ENABLED=false` and retain the new identity handler with `CUSTOMER_IDENTITY_ENABLED=true` if new Google accounts or reset/verification links exist. This keeps identity/recovery available while business workspaces are unavailable. It does not delete organizations, missions or scenarios. Confirm Google callbacks target `/account` while the Hub is disabled.
* **Do not blindly deploy the pre-identity baseline** after Google-only accounts exist. Those accounts have no password in the legacy system. Retain the identity-compatible rollback build, or complete a separately approved mailbox-verified password recovery plan first. Do not fabricate password hashes.
* **Data rollback:** keep supplemental tables by default. Restore the verified backup only if necessary, with an approved cutover plan that preserves transactions created since the backup. Never run blanket `DROP TABLE` statements on production or delete customer accounts to undo this feature.
* **Failed staging migration:** use the staging database's transaction/recovery procedure and re-verify legacy counts. Local tests prove SQL rollback for these additive changes, not D1 production restore.
* **Member removal:** authorization checks current membership, exact accepted invitation, current verified email and entitlement on every request. Existing personal sessions do not restore removed organization access. Shared files/data must remain preserved. A real provider subscription still requires provider cancellation/reconciliation; the removal response explicitly reports a provider reconciliation blocker rather than falsely claiming cancellation.
* **Old invitations:** cancel pending invitations on removal. Re-invitation resets a removed membership to pending; an old paid record does not automatically reactivate it.

## Required remaining owner/operator inputs

Verified staging account/database and backup procedure; authorized staging hostname; Google client setup; verified Resend sender/delivery; a supported recurring provider actually approved for AuraDigital's business; tax and refund/cancellation/grace policies; an MFA enforcement implementation; explicit audited ownership mappings for legacy customer assets. Send secrets through secure configuration facilities, never chat or source control.
