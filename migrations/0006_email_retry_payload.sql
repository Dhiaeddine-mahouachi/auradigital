-- Preserve exact Resend payload across retries for provider idempotency.
ALTER TABLE project_emails ADD COLUMN payload_json TEXT NOT NULL DEFAULT '';
