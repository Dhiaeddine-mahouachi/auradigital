import { ApiError, json, readJson } from './http.js';
import { getAuthenticatedAdmin, sameOrigin } from './security.js';
import { categories, purposes, styles, quoteCart, type Theme } from './shop/model.ts';
import type { D1Database } from '@cloudflare/workers-types';
import seedThemes from '../shop/catalog.seed.json' with { type: 'json' };

type Env = { DB: D1Database; ASSETS: { fetch(request: Request): Promise<Response> } };
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetPattern = /^\/shop\/artwork\/[a-z0-9-]+\.(?:svg|webp|png|jpg)$/;
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function validateTheme(input: unknown): Theme {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'A theme object is required.');
  const t = input as Theme;
  for (const [key, max] of [['id', 60], ['slug', 80], ['name', 100], ['description', 1500]] as const) {
    if (typeof t[key] !== 'string' || !t[key].trim() || t[key].length > max) throw new ApiError(400, `Invalid ${key}.`);
  }
  if (!slugPattern.test(t.id) || !slugPattern.test(t.slug)) throw new ApiError(400, 'Use lowercase, hyphenated identifiers.');
  if (!(categories as readonly string[]).includes(t.category) || !(purposes as readonly string[]).includes(t.purpose) || !(styles as readonly string[]).includes(t.style)) throw new ApiError(400, 'Invalid category, purpose or style.');
  if (!['Horizontal', 'Vertical'].includes(t.orientation) || !['demo', 'published', 'archived'].includes(t.status) || t.currency !== 'TRY') throw new ApiError(400, 'Invalid orientation, status or currency.');
  if (!assetPattern.test(t.front) || !assetPattern.test(t.back)) throw new ApiError(400, 'Use local /shop/artwork/ image paths.');
  for (const key of ['materials', 'finishes', 'colors', 'palette'] as const) {
    if (!Array.isArray(t[key]) || !t[key].length || t[key].length > 10 || t[key].some(v => typeof v !== 'string' || !v.trim() || v.length > 60)) throw new ApiError(400, `Invalid ${key}.`);
  }
  if (t.palette.some(c => !/^#[a-fA-F0-9]{6}$/.test(c))) throw new ApiError(400, 'Use six-digit palette colors.');
  if (t.priceMinor !== null && (!Number.isSafeInteger(t.priceMinor) || t.priceMinor < 1 || t.priceMinor > 100000000)) throw new ApiError(400, 'Invalid price in minor currency units.');
  if (typeof t.approved !== 'boolean' || typeof t.available !== 'boolean' || !Number.isInteger(t.popularity) || t.popularity < 0 || !['', 'New'].includes(t.badge) || !/^\d{4}-\d{2}-\d{2}$/.test(t.createdAt)) throw new ApiError(400, 'Invalid theme metadata.');
  if (t.status === 'published' && (!t.approved || t.priceMinor === null || [t.front, t.back].some(path => path.includes('demo-')))) throw new ApiError(409, 'Approve production artwork and a price before publishing. Demo artwork cannot be published.');
  // Explicit allowlist: ignore unknown properties such as client-supplied permissions.
  return Object.fromEntries(['id', 'slug', 'name', 'category', 'description', 'front', 'back', 'orientation', 'colors', 'palette', 'purpose', 'style', 'materials', 'finishes', 'priceMinor', 'currency', 'status', 'approved', 'available', 'popularity', 'createdAt', 'badge'].map(key => [key, t[key as keyof Theme]])) as Theme;
}
async function catalog(env: Env, includeArchived = false): Promise<Theme[]> {
  if (!env.DB) throw new ApiError(503, 'Shop catalog is not configured.');
  const read = () => env.DB.prepare('SELECT data_json FROM shop_card_themes ORDER BY id').all<{ data_json: string }>();
  let rows;
  try { rows = await read(); }
  catch (error) {
    const messages = error instanceof Error ? `${error.message} ${error.cause instanceof Error ? error.cause.message : ''}` : '';
    // Deploying Worker code does not apply D1 migrations. Bootstrap only this
    // additive schema when it is absent; never conceal other database failures.
    if (!/no such table:\s*(?:main\.)?shop_card_themes\b/i.test(messages)) throw error;
    const seeds = seedThemes.map(validateTheme);
    if (seeds.some(t => t.status !== 'demo' || t.approved || t.available || t.priceMinor !== null)) throw new ApiError(503, 'Invalid demo catalog seed.');
    await env.DB.batch([
      env.DB.prepare("CREATE TABLE IF NOT EXISTS shop_card_themes (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, data_json TEXT NOT NULL CHECK(json_valid(data_json)), created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_shop_themes_updated ON shop_card_themes(updated_at)'),
      ...seeds.map(theme => env.DB.prepare('INSERT OR IGNORE INTO shop_card_themes (id, slug, data_json) VALUES (?, ?, ?)').bind(theme.id, theme.slug, JSON.stringify(theme))),
    ]);
    rows = await read();
  }
  const { results } = rows;
  return results.map(row => validateTheme(JSON.parse(row.data_json))).filter(t => includeArchived || t.status !== 'archived');
}
export async function handleShop(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url), path = url.pathname, method = request.method;
  const isPublic = path === '/api/shop/catalog' || path === '/api/shop/quote' || path === '/api/shop/checkout';
  const isAdmin = path === '/api/admin/shop/themes' || /^\/api\/admin\/shop\/themes\/[a-z0-9-]+$/.test(path);
  if (isPublic || isAdmin) {
    if (!['GET', 'HEAD'].includes(method) && !sameOrigin(request)) return json({ error: 'Forbidden origin.' }, 403);
    if (isAdmin) {
      const admin = await getAuthenticatedAdmin(request, env.DB);
      if (!admin) return json({ error: 'Sign in to the existing administrator account.' }, 401);
      if (method === 'GET' && path === '/api/admin/shop/themes') return json({ themes: await catalog(env, true), role: admin.role });
      if (!['POST', 'PUT'].includes(method)) return json({ error: 'Method not allowed.' }, 405);
      if (!['owner', 'manager'].includes(admin.role)) return json({ error: 'Read-only access.' }, 403);
      const body = await readJson(request, 20000), theme = validateTheme(body.theme);
      await catalog(env, true);
      const current = await env.DB.prepare('SELECT id FROM shop_card_themes WHERE id = ?').bind(theme.id).first();
      if ((method === 'POST' && path !== '/api/admin/shop/themes') || (method === 'PUT' && path !== `/api/admin/shop/themes/${theme.id}`)) return json({ error: 'Theme ID does not match route.' }, 400);
      if (method === 'POST' && current) return json({ error: 'Theme ID already exists.' }, 409);
      if (method === 'PUT' && !current) return json({ error: 'Theme not found.' }, 404);
      const duplicate = await env.DB.prepare('SELECT id FROM shop_card_themes WHERE slug = ? AND id != ?').bind(theme.slug, theme.id).first();
      if (duplicate) return json({ error: 'Theme slug already exists.' }, 409);
      if (theme.status === 'published') {
        for (const path of [theme.front, theme.back]) {
          const asset = await env.ASSETS.fetch(new Request(new URL(path, url)));
          if (!asset.ok || !(asset.headers.get('content-type') || '').startsWith('image/')) return json({ error: 'Both production artwork assets must exist before publishing.' }, 409);
          await asset.body?.cancel();
        }
      }
      await env.DB.batch([
        method === 'POST'
          ? env.DB.prepare('INSERT INTO shop_card_themes (id, slug, data_json) VALUES (?, ?, ?)').bind(theme.id, theme.slug, JSON.stringify(theme))
          : env.DB.prepare("UPDATE shop_card_themes SET slug = ?, data_json = ?, updated_at = datetime('now') WHERE id = ?").bind(theme.slug, JSON.stringify(theme), theme.id),
        env.DB.prepare("INSERT INTO admin_audit_log (id, admin_user_id, username_snapshot, action, resource, target_id, request_id) VALUES (?, ?, ?, ?, 'shop_themes', ?, ?)").bind(crypto.randomUUID(), admin.id, admin.username, method === 'POST' ? 'create' : 'update', theme.id, (request.headers.get('CF-Ray') || '').slice(0, 80)),
      ]);
      return json({ theme }, method === 'POST' ? 201 : 200);
    }
    if (path === '/api/shop/catalog' && method === 'GET') return json({ themes: await catalog(env), checkout: { enabled: false, reason: 'Customer accounts, shipping, tax and a verified payment provider are not connected.' } });
    if (path === '/api/shop/quote' && method === 'POST') {
      const body = await readJson(request, 200000);
      try { return json(quoteCart(body.items, await catalog(env))); } catch (error) { if (error instanceof ApiError) throw error; return json({ error: error instanceof Error ? error.message : 'Invalid cart.' }, 400); }
    }
    if (path === '/api/shop/checkout' && method === 'POST') return json({ error: 'Checkout is not enabled. Customer accounts, approved products, shipping, tax and a verified payment provider must be connected first.', code: 'CHECKOUT_NOT_CONFIGURED' }, 503);
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (path === '/shop/' && ['GET', 'HEAD'].includes(method)) { url.pathname = '/shop'; return Response.redirect(url.toString(), 301); }
  const detail = /^\/shop\/cards\/([a-z0-9-]+)$/.exec(path);
  if (path !== '/shop' && path !== '/shop/cart' && !detail) return null;
  if (!['GET', 'HEAD'].includes(method)) return json({ error: 'Method not allowed.' }, 405);
  let theme: Theme | undefined;
  if (detail) {
    theme = (await catalog(env)).find(t => t.slug === detail[1]);
    if (!theme) return new Response('Card theme not found.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const asset = await env.ASSETS.fetch(new Request(new URL('/shop/index.html', url)));
  if (!asset.ok) return asset;
  const title = theme ? `${theme.name} NFC & QR Card — AuraDigital` : path === '/shop/cart' ? 'Your Card Collection — AuraDigital' : 'NFC & QR Smart Card Shop — AuraDigital';
  const description = theme?.description || 'Explore NFC and QR card designs for your business. Preview both sides, personalize your theme and save your collection.';
  const meta = `<meta name="description" content="${escape(description)}"><link rel="canonical" href="https://auradigitalworks.com${path}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}">${theme ? `<meta property="og:image" content="https://auradigitalworks.com${theme.front}">` : ''}`;
  const html = (await asset.text()).replace('<title>Shop — AuraDigital</title>', `<title>${escape(title)}</title>`).replace('<!--SHOP_META-->', meta);
  const headers = new Headers(asset.headers);
  headers.delete('content-length'); headers.delete('etag');
  headers.set('Content-Type', 'text/html; charset=utf-8'); headers.set('Cache-Control', 'no-store');
  if (path === '/shop/cart') headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(method === 'HEAD' ? null : html, { headers });
}
