# Backup and recovery

The foundation patch has no schema changes. Preserve the current Worker version and production branch during staging tests.

For later data migrations, reconcile the applied migration ledger with the actual schema and record non-identifying counts for customer accounts, sessions, organizations, service links, menus and subscriptions. Take an access-controlled D1 backup first. Restore in isolated D1, check foreign keys and representative counts, then verify a pre-existing customer login and menu QR destination with explicit staging fixtures. Record the backup ID, age of recoverable data, elapsed restore time and any uncovered media storage.

The existing [Growth OS runbook](GROWTH_OS_RUNBOOK.md) and [D1 backup script](../scripts/backup-d1.sh) describe available operations. The ops branch `ops/tested-deploys-staging-backups-20261126` has a backup workflow proposal. A local SQLite fixture snapshot restored successfully as recorded in the [test report](TEST_REPORT.md). Cloud backup and restore evidence remains pending.
