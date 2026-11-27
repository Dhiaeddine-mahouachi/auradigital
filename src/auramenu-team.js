// AuraMenu staff roles and cloud drafts, on top of the AuraDigital customer identity.
// Roles are per menu: owner (one, from auramenu_menu_owners) > manager > editor.
//   editor  — change menu content (categories, items, prices, availability)
//   manager — editor + design, restaurant info, hours, video, template
//   owner   — manager + plan/payment requests + team management
// AuraHub workspace seats are paid and blocked until a payment provider exists, so menu staff
// are kept per menu here; every check is resolved server-side from current rows.
import { ApiError, json, readJson } from './http.js';
import { isEmailVerified } from './customer-identity.js';

export const MENU_ROLES = ['manager', 'editor'];
const RANK = { editor: 1, manager: 2, owner: 3 };
const MAX_MEMBERS = 10, MAX_DRAFTS = 5, DRAFT_BYTES = 256 * 1024;
const UUID = /^[a-f0-9-]{36}$/i, DRAFT_ID = /^[a-z0-9-]{1,40}$/;
const ready = new WeakSet();

export async function ensureTeam(db) {
  if (ready.has(db)) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS auramenu_menu_owners (menu_id TEXT PRIMARY KEY NOT NULL, customer_id TEXT NOT NULL, linked_at TEXT NOT NULL DEFAULT (datetime('now')))"),
    db.prepare('CREATE INDEX IF NOT EXISTS auramenu_menu_owners_customer ON auramenu_menu_owners(customer_id)'),
    db.prepare("CREATE TABLE IF NOT EXISTS auramenu_menu_members (menu_id TEXT NOT NULL, customer_id TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('manager','editor')), added_by TEXT NOT NULL, added_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (menu_id, customer_id))"),
    db.prepare('CREATE INDEX IF NOT EXISTS auramenu_menu_members_customer ON auramenu_menu_members(customer_id)'),
    db.prepare("CREATE TABLE IF NOT EXISTS auramenu_cloud_drafts (customer_id TEXT NOT NULL, id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', data_json TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (customer_id, id))"),
    db.prepare("CREATE TABLE IF NOT EXISTS auramenu_team_audit (id TEXT PRIMARY KEY NOT NULL, menu_id TEXT NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT, at TEXT NOT NULL DEFAULT (datetime('now')))"),
  ]);
  ready.add(db);
}

// 'owner' | 'manager' | 'editor' | null
export async function menuRole(db, menuId, customerId) {
  if (!customerId) return null;
  await ensureTeam(db);
  const owner = await db.prepare('SELECT customer_id FROM auramenu_menu_owners WHERE menu_id = ?').bind(menuId).first();
  if (owner?.customer_id === customerId) return 'owner';
  const member = await db.prepare('SELECT m.role FROM auramenu_menu_members m JOIN customer_users u ON u.id = m.customer_id WHERE m.menu_id = ? AND m.customer_id = ? AND u.active = 1').bind(menuId, customerId).first();
  return member?.role || null;
}
export const roleAtLeast = (role, needed) => (RANK[role] || 0) >= RANK[needed];

export async function menusFor(db, customerId) {
  await ensureTeam(db);
  const rows = await db.prepare(
    "SELECT r.id, r.slug, r.business_name, r.status, r.payment_status, r.template_id, r.updated_at, 'owner' AS role FROM auramenu_menu_owners o JOIN auramenu_requests r ON r.id = o.menu_id WHERE o.customer_id = ? " +
    "UNION ALL SELECT r.id, r.slug, r.business_name, r.status, r.payment_status, r.template_id, r.updated_at, m.role FROM auramenu_menu_members m JOIN auramenu_requests r ON r.id = m.menu_id WHERE m.customer_id = ? " +
    'ORDER BY updated_at DESC LIMIT 60'
  ).bind(customerId, customerId).all();
  return (rows.results || []).map(r => ({ id: r.id, slug: r.slug, businessName: r.business_name, status: r.status, paymentStatus: r.payment_status, templateId: r.template_id, updatedAt: r.updated_at, role: r.role }));
}

function audit(db, menuId, actorId, action, targetId = null) {
  return db.prepare('INSERT INTO auramenu_team_audit (id, menu_id, actor_id, action, target_id) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), menuId, actorId, action, targetId);
}

// Routes under /api/auramenu/account/menus/:id/members and /api/auramenu/account/drafts (AuraMenu session).
export async function handleTeamAndDrafts(request, env, user) {
  const url = new URL(request.url), path = url.pathname, db = env.DB;
  await ensureTeam(db);
  const write = !['GET', 'HEAD'].includes(request.method);

  const team = /^\/api\/auramenu\/account\/menus\/([a-f0-9-]{36})\/members(?:\/([a-f0-9-]{36}))?$/i.exec(path);
  if (team) {
    const [, menuId, targetId] = team;
    const role = await menuRole(db, menuId, user.id);
    if (!roleAtLeast(role, 'manager')) return json({ error: 'Menu not found.' }, 404);
    if (request.method === 'GET' && !targetId) {
      const rows = await db.prepare(
        "SELECT * FROM (SELECT u.id, u.email, u.full_name, 'owner' AS role, o.linked_at AS added_at FROM auramenu_menu_owners o JOIN customer_users u ON u.id = o.customer_id WHERE o.menu_id = ? " +
        "UNION ALL SELECT u.id, u.email, u.full_name, m.role, m.added_at FROM auramenu_menu_members m JOIN customer_users u ON u.id = m.customer_id WHERE m.menu_id = ?) ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'manager' THEN 1 ELSE 2 END, added_at"
      ).bind(menuId, menuId).all();
      return json({ role, members: (rows.results || []).map(r => ({ id: r.id, email: r.email, name: r.full_name, role: r.role, you: r.id === user.id })) }, 200, { 'Cache-Control': 'no-store' });
    }
    if (request.method === 'POST' && !targetId) {
      if (role !== 'owner') return json({ error: 'Only the owner can add team members.' }, 403);
      const body = await readJson(request, 2048);
      const email = String(body.email || '').trim().toLowerCase(), newRole = String(body.role || '');
      if (!MENU_ROLES.includes(newRole)) throw new ApiError(400, 'Role must be manager or editor.');
      if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) throw new ApiError(400, 'Enter a valid email address.');
      const target = await db.prepare('SELECT id, email FROM customer_users WHERE email = ? COLLATE NOCASE AND active = 1').bind(email).first();
      // Same answer whether or not the account exists, so the endpoint cannot be used to probe emails.
      const notReady = json({ error: 'No verified AuraDigital account with this email. Ask them to create one, verify the email, then add them again.' }, 404);
      if (!target || !(await isEmailVerified(db, target))) return notReady;
      if (target.id === user.id) throw new ApiError(400, 'You already own this menu.');
      const count = await db.prepare('SELECT COUNT(*) AS n FROM auramenu_menu_members WHERE menu_id = ?').bind(menuId).first();
      if ((count?.n || 0) >= MAX_MEMBERS) throw new ApiError(409, `A menu can have up to ${MAX_MEMBERS} team members.`);
      await db.batch([
        db.prepare('INSERT INTO auramenu_menu_members (menu_id, customer_id, role, added_by) VALUES (?, ?, ?, ?) ON CONFLICT(menu_id, customer_id) DO UPDATE SET role = excluded.role').bind(menuId, target.id, newRole, user.id),
        audit(db, menuId, user.id, 'member:' + newRole, target.id),
      ]);
      return json({ ok: true }, 201);
    }
    if (request.method === 'DELETE' && targetId) {
      if (role !== 'owner' && targetId !== user.id) return json({ error: 'Only the owner can remove team members.' }, 403);
      const removed = await db.prepare('DELETE FROM auramenu_menu_members WHERE menu_id = ? AND customer_id = ?').bind(menuId, targetId).run();
      if (!removed.meta?.changes) return json({ error: 'Team member not found.' }, 404);
      await audit(db, menuId, user.id, 'member:remove', targetId).run();
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed.' }, 405);
  }

  const draft = /^\/api\/auramenu\/account\/drafts(?:\/([a-z0-9-]{1,40}))?$/.exec(path);
  if (draft) {
    const id = draft[1];
    if (request.method === 'GET' && !id) {
      const rows = await db.prepare('SELECT id, name, version, updated_at FROM auramenu_cloud_drafts WHERE customer_id = ? ORDER BY updated_at DESC').bind(user.id).all();
      return json({ drafts: (rows.results || []).map(r => ({ id: r.id, name: r.name, version: r.version, updatedAt: r.updated_at })) }, 200, { 'Cache-Control': 'no-store' });
    }
    if (!id || !DRAFT_ID.test(id)) return json({ error: 'Not found.' }, 404);
    if (request.method === 'GET') {
      const row = await db.prepare('SELECT id, name, data_json, version, updated_at FROM auramenu_cloud_drafts WHERE customer_id = ? AND id = ?').bind(user.id, id).first();
      if (!row) return json({ error: 'Draft not found.' }, 404, { 'Cache-Control': 'no-store' });
      return json({ draft: { id: row.id, name: row.name, data: JSON.parse(row.data_json), version: row.version, updatedAt: row.updated_at } }, 200, { 'Cache-Control': 'no-store' });
    }
    if (request.method === 'PUT') {
      const body = await readJson(request, DRAFT_BYTES + 4096);
      if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) throw new ApiError(400, 'Draft data must be an object.');
      const data = JSON.stringify(body.data);
      if (new TextEncoder().encode(data).length > DRAFT_BYTES) throw new ApiError(413, 'Draft is too large to save to your account.');
      const name = String(body.name || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100);
      const base = body.baseVersion === undefined ? 0 : body.baseVersion;
      if (!Number.isSafeInteger(base) || base < 0) throw new ApiError(400, 'Invalid draft version.');
      if (base === 0) {
        const created = await db.prepare(
          'INSERT INTO auramenu_cloud_drafts (customer_id, id, name, data_json) ' +
          'SELECT ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM auramenu_cloud_drafts WHERE customer_id = ?) < ? ' +
          'ON CONFLICT(customer_id, id) DO NOTHING'
        ).bind(user.id, id, name, data, user.id, MAX_DRAFTS).run();
        if (created.meta?.changes) return json({ version: 1 }, 201, { 'Cache-Control': 'no-store' });
      } else {
        const updated = await db.prepare("UPDATE auramenu_cloud_drafts SET name = ?, data_json = ?, version = version + 1, updated_at = datetime('now') WHERE customer_id = ? AND id = ? AND version = ?")
          .bind(name, data, user.id, id, base).run();
        if (updated.meta?.changes) return json({ version: base + 1 }, 200, { 'Cache-Control': 'no-store' });
      }
      const current = await db.prepare('SELECT version FROM auramenu_cloud_drafts WHERE customer_id = ? AND id = ?').bind(user.id, id).first();
      if (!current && base === 0) throw new ApiError(409, `You can keep up to ${MAX_DRAFTS} drafts.`);
      return json({ error: 'This draft changed on another device.', version: current?.version ?? 0 }, 409, { 'Cache-Control': 'no-store' });
    }
    if (request.method === 'DELETE') {
      const version = url.searchParams.get('baseVersion');
      if (version !== null && (!/^[1-9]\d*$/.test(version) || !Number.isSafeInteger(Number(version)))) {
        throw new ApiError(400, 'Invalid draft version.');
      }
      const result = version === null
        ? await db.prepare('DELETE FROM auramenu_cloud_drafts WHERE customer_id = ? AND id = ?').bind(user.id, id).run()
        : await db.prepare('DELETE FROM auramenu_cloud_drafts WHERE customer_id = ? AND id = ? AND version = ?').bind(user.id, id, Number(version)).run();
      if (version !== null && !result.meta?.changes) return json({ error: 'This draft changed on another device.' }, 409);
      return json({ ok: true });
    }
    return json({ error: 'Method not allowed.' }, 405);
  }
  return write ? json({ error: 'Not found.' }, 404) : null;
}
