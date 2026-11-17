# Auri business memory V1

Auri’s onboarding guide and workspace assistant use the same D1-backed chat. The customer can open a recent conversation, start another, or delete it. First-time workspace creation can atomically link the selected onboarding conversation and its memories. Other onboarding chats stay outside the workspace. Signed-in members need current workspace read and Auri permissions. Conversation and private memory access always requires the authenticated customer who created the record. The workspace owner can explicitly share an approved memory with other members who have Auri access.

## Context and approval

Auri reads the workspace’s saved profile and reported goals, roadmap milestones, recorded service statuses, approved memories, and recent turns for the open chat. The profile is the customer’s saved record. Auri distinguishes reported milestones from delivery records and answers direct status questions from saved data. Ollama and Workers AI retain the existing provider fallback and budget accounting. Model output cannot create or modify progress, memories or prices. The server resolves package IDs against the current regional catalogue, including on restored messages.

Short statements of a goal, preference or business fact can create private suggestions. The member can approve, edit, or delete them. Editing an approved memory replaces it. Each prompt includes up to 12 approved memories. Chat and memory fields are filtered for recognizable credentials, contacts, and URL parameters. Free text can still contain sensitive information. Models receive only the scoped context needed for the turn, and the feature uses no training or fine-tuning.

## Retention and concurrency

- Up to 30 active conversations per member per workspace or onboarding scope. A conversation retains eight question/answer pairs. Older pairs are replaced with a coarse topic summary and turn count. The conversation title retains a short excerpt of the opening question.
- Conversations expire after 90 days of inactivity. Unapproved suggestions expire after 30 days. The existing daily maintenance schedule purges expired records in bounded batches.
- Approved workspace memories stay until deleted and survive deletion of their source chat. An approved memory on an unlinked onboarding chat belongs to that chat until it is linked to a workspace. Deleting a memory removes it from the approved context. Its original wording may still appear in a recent transcript until the conversation is deleted or compacted.
- Conversation deletion cascades to messages, summaries, and chat-bound memories. Parallel conversations can continue independently. A conflicting send on the same conversation is rejected and can be retried after reopening it.
- Chat sends are subject to the existing Hub write and AI rate limit bindings.

## Verification and rollout

Run `npm run check`, `npm test`, and `npm run deploy:check`. Workspace startup requires no new secret or model configuration. Apply additive migration `0036_auri_business_memory.sql` to the staging D1 database before testing the Worker there. Verify a staged logout/login and workspace switch before applying the migration ahead of a production Worker release.
