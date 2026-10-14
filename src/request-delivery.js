import { sendCustomerConfirmation, renderCustomerConfirmation } from './customer-confirmation.js';
import { sendRequestNotification } from './notifications.js';

// Supplemental tables preserve every existing request/status schema.
export const DELIVERY_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS request_receipts (
    key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, request_id TEXT NOT NULL UNIQUE,
    client_id INTEGER, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS request_email_outbox (
    id TEXT PRIMARY KEY, request_id TEXT NOT NULL, kind TEXT NOT NULL,
    payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0, first_attempt INTEGER,
    next_at INTEGER NOT NULL DEFAULT 0, lease_until INTEGER NOT NULL DEFAULT 0,
    lease_token TEXT, message_id TEXT, last_error TEXT,
    UNIQUE(request_id, kind)
  )`,
  `CREATE INDEX IF NOT EXISTS request_email_due ON request_email_outbox(state,next_at)`,
];
export async function ensureRequestDelivery(db) {
  await db.batch(DELIVERY_SCHEMA.map(sql => db.prepare(sql)));
}
export function outboxStatements(db, notification) {
  const customer = {
    requestId: notification.requestId, name: notification.contactName || notification.businessName,
    email: notification.customerEmail, service: notification.service || notification.requestType,
    submittedAt: notification.submittedAt,
  };
  customer.message = renderCustomerConfirmation(customer);
  return [['customer', customer], ['team', notification]].map(([kind,payload]) =>
    db.prepare('INSERT OR IGNORE INTO request_email_outbox(id,request_id,kind,payload) VALUES(?,?,?,?)')
      .bind(`${notification.requestId}/${kind}`, notification.requestId, kind, JSON.stringify(payload)));
}
export async function enqueueRequestEmails(env, notification) {
  await ensureRequestDelivery(env.DB);
  await env.DB.batch(outboxStatements(env.DB, {
    ...notification, submittedAt: notification.submittedAt || new Date().toISOString(),
  }));
  return deliverRequestEmails(env, notification.requestId);
}
export async function deliverRequestEmails(env, requestId = null) {
  const db = env.DB;
  await ensureRequestDelivery(db);
  const due = Date.now();
  const rows = await db.prepare(`SELECT * FROM request_email_outbox
    WHERE state IN ('pending','sending') AND next_at<=? AND lease_until<=?
    ${requestId ? 'AND request_id=?' : ''} ORDER BY next_at LIMIT 40`)
    .bind(due,due,...(requestId ? [requestId] : [])).all();
  for (const row of rows.results || []) {
    const now = Date.now();
    const token = crypto.randomUUID();
    const claim = await db.prepare(`UPDATE request_email_outbox SET state='sending',lease_until=?,lease_token=?
      WHERE id=? AND state IN ('pending','sending') AND lease_until<=?`)
      .bind(now+60000,token,row.id,now).run();
    if (!claim.meta?.changes) continue;
    const data = JSON.parse(row.payload);
    let result;
    const configured = row.kind === 'customer' ? Boolean(env.RESEND_API_KEY) : Boolean(env.NOTIFICATION_EMAIL && env.REQUEST_NOTIFICATIONS);
    // Resend retains keys for 24h. Stop uncertain retries before expiry;
    // never silently create a second email after that window.
    if (row.first_attempt && now-row.first_attempt >= 23*60*60*1000) {
      result = { sent:false, manual:true, reason:'retry_window_expired' };
    } else if (!configured) {
      result = { sent:false, reason:'not_configured' };
    } else {
      // Persist attempt before external side effect, so a crashed worker is safe.
      await db.prepare(`UPDATE request_email_outbox SET attempts=attempts+1,first_attempt=COALESCE(first_attempt,?) WHERE id=? AND lease_token=?`)
        .bind(now,row.id,token).run();
      if (row.kind === 'customer') {
        result = await sendCustomerConfirmation(env,data);
      } else if (row.attempts > 0) {
        // The existing Cloudflare email binding has no idempotency key.
        result = { sent:false, manual:true, reason:'team_delivery_requires_reconciliation' };
      } else {
        try {
          const sent = await sendRequestNotification(env.REQUEST_NOTIFICATIONS, env.NOTIFICATION_EMAIL, data);
          result = { sent:true, messageId:sent?.messageId || null };
        } catch {
          result = { sent:false, manual:true, reason:'team_delivery_requires_reconciliation' };
        }
      }
    }
    const state = result.sent ? 'sent' : result.manual ? 'manual' : 'pending';
    const delay = Math.min(3600000,60000*2**Math.min(row.attempts,6));
    await db.prepare(`UPDATE request_email_outbox SET state=?,lease_until=0,lease_token=NULL,
      next_at=?,message_id=?,last_error=?
      WHERE id=? AND lease_token=?`)
      .bind(state,now+delay,result.messageId || null,result.sent ? null : result.reason || 'delivery_failed',
        row.id,token).run();
    console.log(JSON.stringify({event:'request_email_delivery',requestId:row.request_id,kind:row.kind,state}));
  }
  if (!requestId) return;
  const customer = await db.prepare("SELECT state FROM request_email_outbox WHERE request_id=? AND kind='customer'").bind(requestId).first();
  return { sent:customer?.state === 'sent' };
}
export async function requestFingerprint(value) {
  const bytes = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));
  return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
