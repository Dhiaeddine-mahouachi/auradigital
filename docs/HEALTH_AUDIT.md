# AuraDigital engineering health audit

Observed on 27 November 2026. AuraDigital `main` and `contact-autoreply` both started at `fb2f12782f800a01622454b350071841327f6551` and advanced to `8707f94511a05c1eabaf651ad04d657008b2a0fd` during the audit. AuraMenu `main` was reviewed read-only at `6d47d94c8d6301a28e08d023580da691de308aaa`.

| Area | Evidence | Remaining verification |
|---|---|---|
| Hosting | The Cloudflare account lists a deployed `auradigital` Worker with static assets and a D1 binding. AuraDigital has a GitHub Pages backup workflow. AuraMenu documents GitHub Pages delivery via its own workflow and Cloudflare handling for its service APIs. | Verify production Worker source revision from the deployment pipeline and establish a staging Worker and origin. |
| Login | The live capabilities API returned Google, email and Turnstile enabled. The unauthenticated workspace API returned 401. Cloudflare lists the expected Google, Resend and Turnstile bindings by name. | Complete staging sign-in, account linking, verification and recovery with dedicated test identities. |
| Identity across products | AuraMenu sign-in calls its same-origin `/api/aurapops/account` adapter. AuraHub uses `/api/customer`. Existing account storage gives a starting point for a universal account. | One browser session across independent origins is an outstanding integration. |
| Workspaces | Existing creation, profile, memberships, roles, scoped roadmap and Auri history. Tests cover tenant boundaries and expired membership. | Add explicit workspace-to-service relationships for existing menus and commerce. The account-connected summary follows customer/CRM links and cannot authorize a workspace service. |
| AuraMenu | Existing public URLs, production request tables, legacy editor access, and admin approval. Private AuraHub drafts have their own code and a separate flag. | Inventory actual menu ownership, retention and plan mapping. Stage management under the existing AuraHub layout. |
| Catalog and billing | Multiple live surfaces include pricing, manual transfer, CRM invoices, subscriptions and menu edit access. Team recurring checkout is gated in code. | Confirm approved plan mappings, currency, recurring payment provider and signed entitlement events. |
| Auri and Growth Vision | Existing UI, roadmap evidence, preferences, per-workspace history and a Worker AI binding. | Test authorized cross-service actions, private/shared fact rules, and mobile performance. |
| Admin and employees | Admin console, operations, CRM, and employee portal code are present with separate login surfaces. | Verify live authorized role journeys using test accounts. |
| Database and media | Cloudflare lists production and staging D1. The staging DB had zero application tables. The production schema includes customer sessions, organizations, menus, billing and history. The recorded D1 migration ledger is sparse compared with the schema present. The Cloudflare account reported R2 disabled. | Reconcile applied migrations against the actual schema before a production migration. Run an isolated restore and confirm media backup coverage. |
| Performance and mobile | No measured live Core Web Vitals or authenticated mobile traces in this audit. | Run mobile and representative-load checks using the acceptance targets in the backlog. |

Production checks used public GET requests and infrastructure metadata reads. Customer records, scenes and styling assets were left untouched.
