# AuraDigital repository

Keep the live AuraDigital and AuraHub design intact. Preserve the current markup, styles, brand assets and Auri presentation unless the user explicitly requests a visual change. Work on a separate branch. The production sync workflow follows `main`; use a reviewed release to change it.

Use the existing customer account, organization, and permission tables. AuraMenu owns its editor, templates, and publishing behavior in its own repository. Preserve existing menu IDs and public QR/NFC destinations. Spinflow has its own repository and roadmap.

Use the [master backlog](docs/AURADIGITAL_BACKLOG.md) and the [AuraMenu handoff](docs/agent-handoff/AURAMENU_INTEGRATION.md) to record decisions and verification. Run `npm test` and `npm run check` for backend changes. Use isolated fixtures and staging credentials before testing provider flows. Use the deployment and recovery runbooks for database changes.
