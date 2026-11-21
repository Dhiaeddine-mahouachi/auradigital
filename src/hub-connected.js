// What the signed-in customer has with AuraDigital across services, for the
// AuraHub dashboard: NFC, AuraMenu and website requests, shop orders, and the
// orders, invoices and subscriptions the team tracks in the CRM.
// Ownership: records the team linked to this account in the CRM, shop orders
// placed from this account, and (only once the email is verified) requests
// sent with the same email address.
import { CRM_SOURCES } from './crm.js';
import { isEmailVerified } from './customer-identity.js';

async function tableSet(db) {
  const rows = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  return new Set((rows.results || []).map(r => r.name));
}
async function columnsOf(db, table) {
  return new Set(((await db.prepare(`PRAGMA table_info(${table})`).all()).results || []).map(r => r.name));
}
const marks = list => list.map(() => '?').join(',');

export async function connectedServices(env, user) {
  const db = env.DB, tables = await tableSet(db);
  const verified = await isEmailVerified(db, user);
  const email = String(user.email || '').toLowerCase();
  const clientIds = new Set();
  if (tables.has('crm_links')) {
    const linked = await db.prepare("SELECT client_id FROM crm_links WHERE source='account' AND source_id=?").bind(user.id).all();
    for (const row of linked.results || []) clientIds.add(Number(row.client_id));
  }
  if (verified && email && tables.has('clients')) {
    const byEmail = await db.prepare('SELECT id FROM clients WHERE lower(email)=?').bind(email).all();
    for (const row of byEmail.results || []) clientIds.add(Number(row.id));
  }
  const ids = [...clientIds];

  const requests = [];
  for (const [source, meta] of Object.entries(CRM_SOURCES)) {
    if (!tables.has(meta.table)) continue;
    const cols = await columnsOf(db, meta.table);
    const where = [], binds = [];
    if (verified && email && cols.has('email')) { where.push('lower(email)=?'); binds.push(email); }
    if (ids.length && tables.has('crm_links')) { where.push(`id IN (SELECT source_id FROM crm_links WHERE source=? AND client_id IN (${marks(ids)}))`); binds.push(source, ...ids); }
    if (!where.length) continue;
    const rows = await db.prepare(`SELECT id, ${meta.name} AS name, status, ${cols.has('payment_status') ? 'payment_status' : "''"} AS payment, created_at AS createdAt, ${cols.has('updated_at') ? 'updated_at' : 'created_at'} AS updatedAt${cols.has('slug') ? ', slug' : ''} FROM ${meta.table} WHERE ${where.join(' OR ')} ORDER BY created_at DESC LIMIT 30`).bind(...binds).all();
    for (const r of rows.results || []) requests.push({ kind: source, id: String(r.id), name: r.name, status: r.status, payment: r.payment || '', slug: r.slug || '', createdAt: r.createdAt, updatedAt: r.updatedAt });
  }

  // Select each wanted column only if this database has it (older schemas differ).
  const byClient = async (table, wanted) => {
    if (!ids.length || !tables.has(table)) return [];
    const cols = await columnsOf(db, table);
    if (!cols.has('client_id')) return [];
    const select = wanted.map(([col, alias, fallback = 'NULL']) => `${cols.has(col) ? col : fallback} AS ${alias}`).join(', ');
    const order = cols.has('created_at') ? 'created_at DESC' : 'id DESC';
    return (await db.prepare(`SELECT ${select} FROM ${table} WHERE client_id IN (${marks(ids)}) ORDER BY ${order} LIMIT 50`).bind(...ids).all()).results || [];
  };
  const [orders, invoices, subscriptions] = await Promise.all([
    byClient('orders', [['id', 'id'], ['type', 'type', "''"], ['quantity', 'quantity', '1'], ['amount', 'amount', '0'], ['status', 'status', "''"], ['due_date', 'dueDate'], ['created_at', 'createdAt']]),
    byClient('invoices', [['id', 'id'], ['invoice_number', 'number', "''"], ['amount', 'amount', '0'], ['status', 'status', "''"], ['due_date', 'dueDate'], ['created_at', 'createdAt']]),
    byClient('subscriptions', [['id', 'id'], ['plan', 'plan', "''"], ['amount', 'amount', '0'], ['interval', 'interval', "'monthly'"], ['status', 'status', "''"], ['next_billing_date', 'nextBillingDate'], ['created_at', 'createdAt']]),
  ]);
  const shopOrders = !tables.has('shop_bank_orders') ? []
    : ((await db.prepare('SELECT id, reference, payment_status AS payment, total_minor AS totalMinor, created_at AS createdAt FROM shop_bank_orders WHERE customer_id=? ORDER BY created_at DESC LIMIT 20').bind(user.id).all()).results || []);

  const due = invoices.filter(i => ['sent', 'overdue'].includes(i.status));
  return {
    verified,
    requests,
    orders: orders.map(o => ({ ...o, amount: Number(o.amount || 0) })),
    invoices: invoices.filter(i => i.status !== 'draft').map(i => ({ ...i, amount: Number(i.amount || 0) })),
    subscriptions: subscriptions.map(s => ({ ...s, amount: Number(s.amount || 0) })),
    shopOrders,
    totals: {
      openRequests: requests.filter(r => r.status === 'pending').length + orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
      live: requests.filter(r => r.status === 'approved').length + subscriptions.filter(s => s.status === 'active').length,
      amountDue: due.reduce((t, i) => t + Number(i.amount || 0), 0),
      invoicesDue: due.length,
    },
  };
}
