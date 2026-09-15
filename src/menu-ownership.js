export async function tokenHash(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

export async function ensureMenuAccess(db) {
  await db.prepare(
    "CREATE TABLE IF NOT EXISTS auramenu_edit_access (" +
      "menu_id TEXT PRIMARY KEY NOT NULL, " +
      "token_hash TEXT NOT NULL DEFAULT '', " +
      "request_status TEXT NOT NULL DEFAULT 'none', " +
      "requested_at TEXT, " +
      "requested_days INTEGER NOT NULL DEFAULT 0, " +
      "requested_amount INTEGER NOT NULL DEFAULT 0, " +
      "access_until TEXT, " +
      "paid_amount INTEGER NOT NULL DEFAULT 0, " +
      "updated_at TEXT NOT NULL DEFAULT (datetime('now')), " +
      "FOREIGN KEY (menu_id) REFERENCES auramenu_requests(id) ON DELETE CASCADE" +
    ")"
  ).run();

  const columns = await db.prepare('PRAGMA table_info(auramenu_edit_access)').all();
  const names = new Set((columns.results || []).map(column => String(column.name || '')));
  const migrations = [];
  if (!names.has('requested_days')) {
    migrations.push(db.prepare('ALTER TABLE auramenu_edit_access ADD COLUMN requested_days INTEGER NOT NULL DEFAULT 0'));
  }
  if (!names.has('requested_amount')) {
    migrations.push(db.prepare('ALTER TABLE auramenu_edit_access ADD COLUMN requested_amount INTEGER NOT NULL DEFAULT 0'));
  }
  if (migrations.length) await db.batch(migrations);
}

export function newMenuToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
}

export async function menuTokenAccess(request, db, id) {
  const token = request.headers.get('X-Aura-Menu-Token') || '';
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  await ensureMenuAccess(db);
  const access = await db.prepare('SELECT * FROM auramenu_edit_access WHERE menu_id = ? LIMIT 1').bind(id).first();
  return access?.token_hash && await tokenHash(token) === access.token_hash ? access : null;
}
