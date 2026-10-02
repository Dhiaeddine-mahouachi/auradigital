import { ApiError } from './http.js';
export const MENU_PLANS = Object.freeze({
  starter: { id: 'starter', name: 'Starter', amount: 399, interval: 'monthly', months: 1, hostingAmount: 0 },
  pro: { id: 'pro', name: 'Pro', amount: 599, interval: 'monthly', months: 1, hostingAmount: 0 },
  onetime: { id: 'onetime', name: 'One-time', amount: 2500, interval: 'one-time', months: 6, hostingAmount: 200 },
});
export async function ensureMenuBilling(db) {
  await db.prepare("CREATE TABLE IF NOT EXISTS auramenu_billing (menu_id TEXT PRIMARY KEY NOT NULL, plan_id TEXT NOT NULL, amount INTEGER NOT NULL, interval TEXT NOT NULL, hosting_amount INTEGER NOT NULL DEFAULT 0, paid_until TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
}
export function addMonths(value, months) {
  const result = new Date(value), day = result.getUTCDate();
  result.setUTCDate(1); result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, last)); return result.toISOString();
}
export async function menuBilling(db, id) {
  await ensureMenuBilling(db);
  const row = await db.prepare('SELECT * FROM auramenu_billing WHERE menu_id=?').bind(id).first();
  if (!row) return null; // Existing purchases retain their original contract.
  const active = Boolean(row.paid_until && Date.parse(row.paid_until) > Date.now());
  return { planId: row.plan_id, planName: MENU_PLANS[row.plan_id]?.name || row.plan_id, amount: row.amount, currency: 'TRY', interval: row.interval, hostingAmount: row.hosting_amount, paidUntil: row.paid_until, active, dueAmount: row.paid_until && row.interval === 'one-time' ? row.hosting_amount : row.amount };
}
export function menuBillingInsert(db, id, plan) {
  return db.prepare('INSERT INTO auramenu_billing (menu_id,plan_id,amount,interval,hosting_amount) VALUES (?,?,?,?,?)').bind(id,plan.id,plan.amount,plan.interval,plan.hostingAmount);
}
export async function activateMenuBilling(db, id, renew = false, expectedPaidUntil) {
  const billing = await menuBilling(db,id); if (!billing) { if (renew) throw new ApiError(409,'This menu uses the original payment contract.'); return null; }
  if (renew && billing.paidUntil !== expectedPaidUntil) throw new ApiError(409,'Payment period changed. Refresh before confirming payment.');
  if (!renew && billing.paidUntil) return billing;
  if (renew && !billing.paidUntil) throw new ApiError(409,'Confirm the initial payment first.');
  const start = billing.active ? billing.paidUntil : new Date().toISOString();
  const until = addMonths(start, MENU_PLANS[billing.planId].months);
  const result = await db.prepare("UPDATE auramenu_billing SET paid_until=?,updated_at=datetime('now') WHERE menu_id=? AND paid_until IS ?").bind(until,id,billing.paidUntil).run();
  if (!result.meta?.changes) throw new ApiError(409,'Payment period changed. Refresh and try again.');
  return menuBilling(db,id);
}
export async function menuEntitlement(db, row) {
  const billing = await menuBilling(db,row.id);
  return { billing, live: row.status === 'approved' && row.payment_status === 'paid' && (!billing || billing.active) };
}
