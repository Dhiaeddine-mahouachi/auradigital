import { ApiError, json, readJson } from './http.js';
import { requireVerified } from './customer-identity.js';

// Schema is deliberately a data contract. There are no publish/payment/SQL tools.
const fieldLimits = { businessName: 100, tagline: 140, description: 600, address: 220, businessPhone: 40, openingHours: 100 };
const enumFields = { currency: ['TRY','EUR','USD','TND'], menuLanguage: ['en','tr','ar'], templateId: ['modern','orbit','maison','taste3d'] };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function keys(value, allowed) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new ApiError(400, 'Unknown or invalid draft fields.');
}
function text(value, max, label, required = false) {
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (required && !value.trim())) throw new ApiError(400, 'Invalid ' + label + '.');
  return value.trim();
}
export function validateMenuDraft(value) {
  keys(value, ['fields','categories']);
  keys(value.fields, [...Object.keys(fieldLimits),...Object.keys(enumFields)]);
  const fields = {};
  for (const [key,max] of Object.entries(fieldLimits)) if (value.fields[key] !== undefined) fields[key] = text(value.fields[key],max,key);
  for (const [key,allowed] of Object.entries(enumFields)) if (value.fields[key] !== undefined) {
    if (!allowed.includes(value.fields[key])) throw new ApiError(400, 'Invalid ' + key + '.');
    fields[key] = value.fields[key];
  }
  if (!Array.isArray(value.categories) || value.categories.length > 12) throw new ApiError(400,'Maximum 12 categories.');
  let count = 0;
  const categories = value.categories.map(category => {
    keys(category, ['name','emoji','items']);
    const name = text(category.name,80,'category name');
    if (!Array.isArray(category.items) || category.items.length > 20) throw new ApiError(400,'Maximum 20 products per category.');
    return { name, emoji: text(category.emoji ?? '',12,'category emoji'), items: category.items.map(item => {
      keys(item, ['name','description','price','imageUrl','featured']);
      count += 1;
      const price = text(item.price,40,'product price');
      if (price && !/^(?:[₺€$]\s*)?\d{1,7}(?:[.,]\d{1,3})?(?:\s*(?:₺|€|\$|TL|TRY|EUR|USD|TND))?$/i.test(price)) throw new ApiError(400,'Provide an explicit numeric price or leave it empty in a private draft.');
      const imageUrl = text(item.imageUrl ?? '',800,'image URL');
      if (imageUrl) {
        let url; try { url = new URL(imageUrl); } catch { throw new ApiError(400,'Image must be an HTTPS URL.'); }
        if (url.protocol !== 'https:' || url.username || url.password) throw new ApiError(400,'Image must be an HTTPS URL without credentials.');
      }
      if (item.featured !== undefined && typeof item.featured !== 'boolean') throw new ApiError(400,'Invalid featured state.');
      return { name: text(item.name,100,'product name'), description: text(item.description ?? '',300,'product description'), price, imageUrl, featured: item.featured ?? false };
    }) };
  });
  if (count > 100) throw new ApiError(400,'Maximum 100 products per menu.');
  return { fields, categories };
}
function result(row) {
  return { id: row.id, organizationId: row.organization_id, state: row.state, draft: JSON.parse(row.data_json), version: row.version, createdAt: row.created_at, updatedAt: row.updated_at };
}
function audit(db,org,user,action,id) {
  // changes() is the preceding draft mutation in the same atomic D1 batch.
  return db.prepare('INSERT INTO member_access_audit_logs(id,organization_id,actor_id,action,target_id) SELECT ?,?,?,?,? WHERE changes()=1').bind(crypto.randomUUID(),org,user.id,action,id);
}
export async function handleMenuDrafts(request,env,user,authorize) {
  const path = new URL(request.url).pathname;
  const match = /^\/api\/hub\/workspaces\/([a-f0-9-]{36})\/menu-drafts(?:\/([a-f0-9-]{36}))?$/.exec(path);
  if (!match) return null;
  if (env.MENU_DRAFTS_ENABLED !== 'true') throw new ApiError(503,'Private menu drafts are not enabled in this environment.');
  const [,org,id] = match;
  const write = !['GET','HEAD'].includes(request.method);
  const guard = await authorize(env.DB,org,user,write ? 'roadmap:write' : 'workspace:read');
  if (request.method === 'GET') {
    if (!id) {
      const rows = await env.DB.prepare(`SELECT id,organization_id,state,data_json,version,created_at,updated_at FROM menu_drafts WHERE organization_id=? AND ${guard.sql} ORDER BY updated_at DESC,id LIMIT 10`).bind(org,...guard.args).all();
      return json({ drafts: rows.results.map(result) });
    }
    const row = await env.DB.prepare(`SELECT * FROM menu_drafts WHERE id=? AND organization_id=? AND ${guard.sql}`).bind(id,org,...guard.args).first();
    if (!row) throw new ApiError(404,'Draft not found.');
    return json({ menu: result(row) });
  }
  if (!['POST','PUT'].includes(request.method) || (id ? request.method !== 'PUT' : request.method !== 'POST')) throw new ApiError(405,'Method not allowed.',{Allow:id?'GET, PUT':'GET, POST'});
  await requireVerified(env.DB,user);
  const body = await readJson(request,256*1024);
  keys(body,id ? ['draft','state','version'] : ['draft','state']);
  const draft = validateMenuDraft(body.draft), state = body.state ?? 'draft';
  if (!['draft','preview','archived'].includes(state)) throw new ApiError(400,'Only private draft, preview or archived states are allowed.');
  if (id && (!Number.isSafeInteger(body.version) || body.version < 1)) throw new ApiError(400,'Provide the draft version you reviewed.');
  const draftId = id || crypto.randomUUID();
  const mutation = id
    ? env.DB.prepare(`UPDATE menu_drafts SET data_json=?,state=?,version=version+1,updated_at=datetime('now') WHERE id=? AND organization_id=? AND version=? AND ${guard.sql}`).bind(JSON.stringify(draft),state,id,org,body.version,...guard.args)
    : env.DB.prepare(`INSERT INTO menu_drafts(id,organization_id,created_by,data_json,state) SELECT ?,?,?,?,? WHERE ${guard.sql} AND (SELECT count(*) FROM menu_drafts WHERE organization_id=?)<10`).bind(draftId,org,user.id,JSON.stringify(draft),state,...guard.args,org);
  const mutations = await env.DB.batch([mutation,audit(env.DB,org,user,id?'menu_draft_updated':'menu_draft_created',draftId)]);
  if (!mutations[0].meta.changes) throw new ApiError(409,id?'Draft changed, is unavailable or access was revoked. Reload before saving.':'Draft limit reached or access revoked. Archive/export old work; ask support before adding more.');
  // Refetch with current authorization so revoked access cannot disclose saved data.
  const row = await env.DB.prepare(`SELECT * FROM menu_drafts WHERE id=? AND organization_id=? AND ${guard.sql}`).bind(draftId,org,...guard.args).first();
  if (!row) throw new ApiError(404,'Workspace access changed.');
  return json({menu:result(row)},id?200:201);
}
