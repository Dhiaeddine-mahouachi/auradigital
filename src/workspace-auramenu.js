import { requireVerified } from './customer-identity.js';
import { ApiError, json, readJson } from './http.js';

const uuid = '[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}';
const route = new RegExp('^/api/hub/workspaces/(' + uuid + ')/auramenu/menus$');
const menuIdFormat = new RegExp('^' + uuid + '$');

export async function handleWorkspaceAuraMenu(request, env, user) {
  const match = route.exec(new URL(request.url).pathname);
  if (!match || env.WORKSPACE_AURAMENU_ENABLED !== 'true') return null;

  const [, workspaceId] = match;
  const db = env.DB;
  const workspace = await db.prepare('SELECT id FROM organizations WHERE id=? AND owner_id=?').bind(workspaceId, user.id).first();
  if (!workspace) throw new ApiError(404, 'Workspace not found.');
  await requireVerified(db, user);

  const menuTable = await db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='auramenu_requests'").first();
  if (request.method === 'GET') {
    if (!menuTable) return json({ menus: [], availableMenus: [] });
    const { results } = await db.prepare(`SELECT r.id,r.slug,r.business_name AS businessName,r.status,m.organization_id AS workspaceId
      FROM auramenu_menu_owners o
      JOIN auramenu_requests r ON r.id=o.menu_id
      JOIN organizations org ON org.id=? AND org.owner_id=o.customer_id
      LEFT JOIN workspace_auramenu_menus m ON m.menu_id=o.menu_id
      WHERE o.customer_id=? AND (m.organization_id IS NULL OR m.organization_id=org.id)
      ORDER BY m.organization_id IS NULL,r.updated_at DESC,r.id LIMIT 100`).bind(workspaceId, user.id).all();
    const menus = results.filter(menu => menu.workspaceId).map(({ workspaceId: _, ...menu }) => ({ ...menu,
      studioPath: '/studio.html?' + new URLSearchParams({ id: menu.id }),
      publicPath: menu.status === 'approved' ? '/' + encodeURIComponent(menu.slug) : null,
    }));
    const availableMenus = results.filter(menu => !menu.workspaceId).map(({ id, businessName }) => ({ id, businessName }));
    return json({ menus, availableMenus });
  }

  if (request.method !== 'POST') throw new ApiError(405, 'Method not allowed.', { Allow: 'GET, POST' });
  const { menuId } = await readJson(request, 1024);
  if (typeof menuId !== 'string' || !menuIdFormat.test(menuId)) throw new ApiError(400, 'Choose a valid AuraMenu.');
  if (!menuTable) throw new ApiError(404, 'Menu not found.');

  const [write] = await db.batch([
    db.prepare(`INSERT INTO workspace_auramenu_menus(menu_id,organization_id)
      SELECT r.id,org.id FROM auramenu_requests r
      JOIN auramenu_menu_owners o ON o.menu_id=r.id
      JOIN organizations org ON org.owner_id=o.customer_id
      WHERE org.id=? AND o.customer_id=? AND r.id=?
      ON CONFLICT(menu_id) DO NOTHING`).bind(workspaceId, user.id, menuId),
    db.prepare(`INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id)
      SELECT ?,?,?,'auramenu_linked',? WHERE changes()=1`).bind(crypto.randomUUID(), workspaceId, user.id, menuId),
  ]);
  if (write.meta.changes) return json({ menuId, workspaceId }, 201);

  const linked = await db.prepare(`SELECT m.organization_id FROM auramenu_menu_owners o
    JOIN auramenu_requests r ON r.id=o.menu_id
    LEFT JOIN workspace_auramenu_menus m ON m.menu_id=o.menu_id
    WHERE o.menu_id=? AND o.customer_id=?`).bind(menuId, user.id).first();
  if (!linked) throw new ApiError(404, 'Menu not found.');
  if (linked.organization_id !== workspaceId) throw new ApiError(409, 'That menu is assigned to another workspace.');
  return json({ menuId, workspaceId });
}
