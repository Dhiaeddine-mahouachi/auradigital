# AuraDigital deployment

`main` syncs to `contact-autoreply` through the production sync workflow. This checkpoint lives on an independent review branch. The deploy dry run creates local build artifacts only.

Start cloud verification with the existing staging D1 in an isolated Worker configuration. Inspect the generated bindings, origin and absence of production routes before provisioning. `scripts/prepare-growth-staging.mjs` can write a local staging config with a distinct D1 ID and staging hostname. Check the actual database name against Cloudflare and inspect the generated required secret list. Configure test Google callbacks and Turnstile keys on the same staging hostname. Use test recipients and a sandbox provider for mail and payments.

The first integration release requires a successful isolated migration, a recovered backup, a signed-off API contract, and the staged restaurant journey in [TEST_REPORT.md](TEST_REPORT.md). See [recovery](RECOVERY.md) and the [existing Growth OS runbook](GROWTH_OS_RUNBOOK.md).
