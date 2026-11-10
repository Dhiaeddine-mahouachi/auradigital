# 100-customer operating assumptions

These are workload calculations, not verified provider price quotes or a guarantee of a $10 baseline. No services were purchased and no provider prices were changed.

| Component | Assumption for 100 customers | Cost treatment |
| --- | --- | --- |
| Deterministic onboarding | Local parsing and browser speech adapter | Zero AuraDigital model calls; browser/vendor speech service behavior is outside our billing |
| Draft storage | 10 retained drafts/customer at 256 KiB maximum request size | Upper planning envelope 250 MiB of request data, plus DB/index/audit overhead; normal drafts should be much smaller |
| Existing photos | 12 photos/customer at 280 KiB/photo | About 328 MiB of image bytes; existing implementation uses D1. Plan R2 only when justified and independently verified |
| Future model assistance | 2 requests/customer/day × 30 days | 6,000 requests/month; at 2,000 input and 1,000 output tokens each: 12M input + 6M output tokens. Multiply by the chosen provider's actual configured rates |
| Email | Verification/recovery/transactional events | Meter deliveries and apply verified Resend account allowances/pricing; unknown here |
| WhatsApp | No new outbound messages in this increment | Zero new usage from these features; existing operations require separate provider/country/template pricing |
| Payments | Existing manual bank verification only | No card processor configured by this increment; future percentage/fixed fees, tax and refund costs remain separate |
| Edge compute/traffic | Static assistant + shared Worker draft calls | Subject to the account's actual plan, DB reads/writes and traffic; no live usage measured |

New draft writes use existing per-user rate limits and hard storage/count caps. AI is not connected to the assistant, so it cannot incur model costs. A future model endpoint needs atomic per-tenant daily/monthly reservations, server cost records, bounded output tokens, provider timeouts and a global circuit breaker before release. Existing general AI budget settings are not evidence of per-tenant menu metering. Do not offer unlimited AI or extrapolate a reliable margin from this scenario without current invoices and measured usage.
