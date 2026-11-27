# AuraDigital platform backlog

The current milestone is one restaurant owner journey from AuraMenu sign-in to an existing or newly created AuraHub workspace, then menu management, billing visibility, NFC requests and authorized Auri actions. The current product design is the baseline. The audit started on `fb2f127`. The branch follows `8707f94`, which added public AuraMenu caching while the audit was in progress.

| ID | Priority | Depends on | Status | Acceptance and evidence | Commit |
|---|---|---|---|---|---|
| AURA-000 | P0 | — | Initial audit complete | Source and read-only infrastructure inventory recorded in [health audit](HEALTH_AUDIT.md). Provider login, mobile performance and recovery require separate checks. | Audit checkpoint |
| AURA-010 | P0 | 000 | Existing, hardened locally | Existing customers retain one account. Turnstile validates the token on the serving host. Unit tests pass. Verify Google, email delivery and CAPTCHA in staging. | `b15b43d` |
| AURA-020 | P0 | 010, 160 | Scoped and pending provider setup | Reuse Aura customer IDs with an OIDC provider that supports migration/linking without account duplication. Stage both redirect directions, logout and existing identity linking. | — |
| AURA-030 | P0 | 010 | Existing, hardened locally | Existing organizations remain canonical. Retried setup preserves the winning roadmap. Access and paid-seat revocation covered by `growth-os.test.mjs`. | `b15b43d` |
| AURA-040 | P1 | 030, 050 | Existing shell | Use the current workspace shell. Verify service navigation and workspace switching using existing desktop/mobile layouts and test accounts. | Baseline `fb2f127` |
| AURA-050 | P0 | 030 | Contract proposed | Define workspace-bound service links, activation, permissions and plan entitlements. Independent workspaces with identical contact emails remain isolated. | Audit checkpoint |
| AURA-060 | P0 | 020, 040, 050, 080, 160 | Handoff ready for review | Test the restaurant owner journey in staging. Existing menu IDs and public QR/NFC destinations remain valid. | Audit checkpoint |
| AURA-070 | P1 | 050 | Partial | Reconcile the existing catalog and shop/AuraMenu charges against approved plans. Verify public pricing and purchase totals use the same authoritative values. | — |
| AURA-080 | P0 | 050, 160 | Manual flow exists, recurring setup pending | Confirm payment with idempotent event handling and workspace-bound entitlement updates. Verify failed renewal and cancellation behavior. | — |
| AURA-090 | P1 | 050, 060 | Partial | Connect AuraPops, websites, Maps and SEO, WhatsApp and AI, weddings, and hosting through scoped service adapters. | — |
| AURA-100 | P1 | 050, 060 | Partial | Reuse existing Auri history and preferences. Verify authorized service actions and isolation of personal and workspace data. | — |
| AURA-110 | P1 | 030 | Existing | Preserve the five-stage Growth Vision. Confirm completion is based on recorded evidence and workspace identity. | Baseline `fb2f127` |
| AURA-120 | P1 | 030, 080 | Partial | Existing employee/admin interfaces have distinct sessions. Verify least privilege and audited actions with scoped test users. | — |
| AURA-130 | P1 | 040 | Current design baseline | Preserve the live design and verify routing, language handling and mobile layout during integration. | Baseline `fb2f127` |
| AURA-140 | P0 | 010, 030, 050 | Partial | Verify workspace and service authorization server-side, including revoked memberships and unpaid plans. Review account-level commerce separately before using it as workspace data. | `b15b43d` covers Turnstile |
| AURA-150 | P2 | 060, 160 | Pending measurement | Report measured Core Web Vitals and capacity at 100, 500, 1,000 and 5,000 representative workspaces. | — |
| AURA-160 | P0 | 000 | Cloud staging database exists | Initialize isolated staging with fixtures and test-only integrations. Confirm backup, restore, and independent deployment before production changes. | — |
| AURA-170 | P0 | 020, 060, 080, 140, 160 | Local suite passes | Pass staging provider, customer journey, entitlement, mobile and recovery checks. See [test report](TEST_REPORT.md). | `b15b43d` |

“Audit checkpoint” refers to the commit that adds this file and the linked audit documents. Items without an implementation commit remain pending.
