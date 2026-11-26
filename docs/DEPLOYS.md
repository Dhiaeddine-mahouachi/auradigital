# Deploys, staging and backups

## How it works after setup

| You do | What happens |
| --- | --- |
| Push to `staging` | Tests run. If green: staging database migrations, then deploy to `auradigital-staging` (workers.dev URL, staging database, no real emails, no scheduled jobs) |
| Merge to `main` | Tests run. If green: deploy to production, then `/api/health` is checked. A red test means nothing is deployed |
| Monday 04:17 (Istanbul) | Production database exported, encrypted, kept 35 days under Actions -> Weekly database backup |

## One-time setup (about 10 minutes)

1. **Create a Cloudflare API token**: Cloudflare dashboard -> My Profile -> API Tokens -> Create Token -> template "Edit Cloudflare Workers", then add the permission Account -> D1 -> Edit. Copy the token.
2. **Find your Account ID**: Cloudflare dashboard -> Workers & Pages -> right-hand column.
3. **Make a backup passphrase**: 30+ random characters from your password manager. Save it there: without it the backups cannot be opened.
4. **Add GitHub secrets**: github.com/Dhiaeddine-mahouachi/auradigital -> Settings -> Secrets and variables -> Actions -> New repository secret:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `BACKUP_PASSPHRASE`
5. **Stop untested deploys**: Cloudflare dashboard -> Workers & Pages -> auradigital -> Settings -> Builds -> disconnect the Git repository. From now on only the Deploy workflow deploys, and only after tests pass.
6. **Create the staging branch**: `git push origin origin/main:refs/heads/staging`. The first run creates the staging Worker; its URL appears in the workflow log.
7. **Test the backup**: Actions -> Weekly database backup -> Run workflow, then download the artifact and decrypt it once:
   `openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -in auradigital-db-YYYY-MM-DD.sql.enc -out backup.sql`

Until step 4 is done, the Deploy workflow runs the tests and skips deploying, so merging this change is safe on its own.

## Why the backups are encrypted

This repository is public. Workflow artifacts of a public repository can be downloaded by other GitHub users, so the database export is encrypted on the runner before upload and the plain file is shredded.

## Staging notes

- Staging uses its own database `auradigital-staging-db`. It starts empty, so create a test menu there; never copy customer data into it.
- Google sign-in is off on staging. Secrets (Resend, Turnstile, Google) are not set there, so no real emails go out.
- Staging shares the account's 100,000 requests/day (Workers Free), so keep load tests short.
