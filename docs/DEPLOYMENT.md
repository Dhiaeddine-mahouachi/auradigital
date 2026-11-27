# AuraDigital deployment

`main` syncs to `contact-autoreply` through the production sync workflow. This checkpoint lives on an independent review branch. The deploy dry run creates local build artifacts only.

The Cloudflare `auradigital-staging-db` now has all 26 checked-in migrations through `0041`. The staging schema contains the identity, workspace and menu draft tables. The foreign-key check returned no issues and the customer table was empty when verified on 27 November 2026.

`scripts/prepare-growth-staging.mjs` generates the settings for a separate `auradigital-growth-staging` Worker with the staging database binding and private menu drafts enabled. The configuration sets the AuraHub staging host and routes only `staging.auramenu.space/api/auramenu/*` to the same Worker. The AuraMenu staging frontend must serve that host and send users to the AuraHub staging account origin. The build disables Google sign-in, email delivery and AI until dedicated staging integrations are configured. It excludes the production-required secret declarations and outbound email binding. Verify both staging routes and the database binding in the dry run before deploying behind restricted access. Set up test Google callbacks and Turnstile on the staging account hostname. Use test recipients and a sandbox provider for mail and payments.

The first integration release requires a successful isolated migration, a recovered backup, a signed-off API contract, and the staged restaurant journey in [TEST_REPORT.md](TEST_REPORT.md). See [recovery](RECOVERY.md) and the [existing Growth OS runbook](GROWTH_OS_RUNBOOK.md).
