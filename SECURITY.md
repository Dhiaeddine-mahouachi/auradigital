# AuraDigital security operations

## Admin access

- Every person must use an individual account from **Admin → Team & Access**.
- `owner` can manage accounts and read the security log.
- `manager` can read and update customer and business data.
- `viewer` is read-only.
- Use a unique password with at least 8 characters. A password reset revokes all sessions for that account.
- Keep `ADMIN_PASSWORD` only until the first `owner` account has been created. Then remove that Worker secret.

## Cloudflare production settings

- SSL/TLS mode: **Full (strict)**.
- Always Use HTTPS: enabled.
- Minimum TLS version: TLS 1.2 or newer.
- Keep the DNS record proxied through Cloudflare.
- Enable Cloudflare managed WAF rules and bot protection where the account plan allows it.
- Keep the login and public-submission rate-limit bindings in `wrangler.jsonc`.

## Secrets

Set secrets with `npx wrangler secret put NAME`. Never put secret values in source files, GitHub Actions files, `wrangler.jsonc`, `.env`, or `.dev.vars` committed to Git.

Required during first-owner bootstrap:

```text
ADMIN_PASSWORD
```

Required for request notifications:

```text
NOTIFICATION_EMAIL
```

## D1 backups

Run at least weekly and before schema or deployment changes:

```bash
bash scripts/backup-d1.sh
```

The `backups/` directory is ignored by Git and static deployment. Move exports to encrypted storage and test a restore periodically. Customer exports must not be committed or attached to public GitHub issues.

## Incident response

1. Disable the affected account in **Team & Access**; its sessions are revoked automatically.
2. Rotate any exposed Worker secret with `wrangler secret put`.
3. Review **Security Log** and Cloudflare Worker logs using the request ID.
4. Export D1 before making recovery changes.
5. Redeploy a known-good Git commit if application code was affected.

Report security concerns privately to the repository owner rather than opening a public issue containing customer data or credentials.
