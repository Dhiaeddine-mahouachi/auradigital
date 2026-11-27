# AuraDigital deployment

`main` syncs to `contact-autoreply` through the production sync workflow. This checkpoint lives on an independent review branch. The deploy dry run creates local build artifacts only.

The Cloudflare `auradigital-staging-db` now has all 26 checked-in migrations through `0041`. The staging schema contains the identity, workspace and menu draft tables. The foreign-key check returned no issues and the customer table was empty when verified on 27 November 2026.

`scripts/prepare-growth-staging.mjs` configures `auradigital-growth-staging` using the staging D1 binding. `scripts/prepare-auramenu-staging.mjs` prepares a pinned checkout of the AuraMenu frontend and configures `auramenu-growth-staging` with a service binding to the AuraDigital staging Worker. The staging-only frontend settings point sign-in and menu QR destinations to the two staging hostnames. Cloudflare Access is restricted to the account owner. Both Workers disable public preview URLs.

The AuraDigital staging Worker enables private menu drafts and workspace menu links. Google sign-in, outbound email and AI are disabled until dedicated staging integrations are configured. Configure test callback credentials and mail recipients separately. Use the sandbox payment provider for payment checks.

The first integration release requires a successful isolated migration, a recovered backup, a signed-off API contract, and the staged restaurant journey in [TEST_REPORT.md](TEST_REPORT.md). See [recovery](RECOVERY.md) and the [existing Growth OS runbook](GROWTH_OS_RUNBOOK.md).
