# AuraDigital 3 preview

Requires Node 24. From this folder run `npm run dev`. Open http://127.0.0.1:4173 on the same computer. There are no package dependencies.

## Test on iPhone

On a trusted private Wi-Fi network, run `HOST=0.0.0.0 npm run dev` (PowerShell: `$env:HOST="0.0.0.0"; npm run dev`). Open http://COMPUTER-LAN-IP:4173 in Safari. Use only fictional test details over local HTTP. Stop with Ctrl+C.

## Newsletter owner

Open /admin on the computer. The first start creates a random owner key in .preview-admin. Open that file locally and paste the key into the studio. Subscribe with a fictitious email, unlock the studio, and open the latest confirmation link in the private mock inbox. Confirm, refresh the studio with Unlock, and inspect the welcome message. Compose and save an issue before publishing it. The mobile/desktop control resizes the email preview. Publishing queues only active subscribers and writes only to the local inbox. Automatic scheduling and provider delivery are outside this preview.

## Storage and scope

The additive schema is applied to .preview.sqlite in this folder. Both that database and the key are git-ignored. No Cloudflare, Resend or production identity credentials are used. Preview accounts save roadmaps and service requests. Auri uses sample guidance. Projects, approvals, team communication, invoicing and service provisioning are illustrative or empty states. Translations include existing Turkish and Arabic dictionaries and preview navigation translations; uncovered text falls back to English.

Run `npm test` for isolated lifecycle tests. Repository checks passed separately. Screenshots are in screenshots/.
