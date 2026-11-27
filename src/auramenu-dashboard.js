import { assertMenuTemplate, isCollectionDesign, premiumIds, menuDesignAccess, standardDesignsEnabled, normalizeItemMetadata, normalizeCategoryMetadata, menuItems, normalizeMenuPresentation, getMenuPresentation, saveMenuPresentation } from "./auramenu-designs.js";
import { menuBilling } from './menu-billing.js';
import { ApiError, json, readJson } from './http.js';
import { getAuthenticatedAdmin, sameOrigin } from './security.js';
import { ensureMenuAccess as ensure, tokenHash as sha256, menuTokenAccess as requireToken, menuOwnerAccess, newMenuToken } from './menu-ownership.js';
import { acceptsAuraMenuOrigin, auraMenuCustomer, linkMenuOwner } from './auramenu-connect.js';
import { purgeCachedMenu } from './menu-cache.js';

const ORIGINS = new Set([
  'https://auramenu.space',
  'https://www.auramenu.space',
  'https://auradigital.ink',
  'https://www.auradigital.ink',
  'https://auradigitalworks.com',
  'https://www.auradigitalworks.com',
  'https://app.auradigital.ink',
]);
const BODY_BYTES = 5 * 1024 * 1024;
const IMAGE_BYTES = 280 * 1024;
const IMAGE_CHARS = Math.ceil((IMAGE_BYTES * 4) / 3) + 64;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ACCESS_PRICE = 100;
const MAX_ACCESS_DAYS = 30;

function cors(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};
  if (!acceptsAuraMenuOrigin(request, env, ORIGINS)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Aura-Menu-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function url(value) {
  const text = clean(value, 800);
  if (!text) return '';
  try {
    const parsed = new URL(text);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
  } catch {
    return '';
  }
}

function parse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeDays(value) {
  const days = Number(value);
  return Number.isInteger(days) && days >= 1 && days <= MAX_ACCESS_DAYS ? days : 0;
}

function active(row) {
  return Boolean(row?.access_until && Date.parse(row.access_until) > Date.now());
}

function publicMenu(row, access, billing = null) {
  return {
    id: row.id,
    slug: row.slug,
    templateId: row.template_id,
    interfaceLanguage: row.interface_language,
    menuLanguage: row.menu_language,
    businessName: row.business_name,
    tagline: row.tagline,
    description: row.description,
    address: row.address,
    businessPhone: row.business_phone,
    whatsapp: row.whatsapp,
    openingHours: row.opening_hours,
    currency: row.currency,
    categories: parse(row.categories_json, []),
    status: row.status,
    paymentStatus: row.payment_status,
    revision: row.revision,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    billing,
    editAccess: {
      pricePerDay: ACCESS_PRICE,
      maxDays: MAX_ACCESS_DAYS,
      requestStatus: access?.request_status || 'none',
      requestedAt: access?.requested_at || null,
      requestedDays: Number(access?.requested_days || 0),
      requestedAmount: Number(access?.requested_amount || 0),
      accessUntil: access?.access_until || null,
      paidAmount: Number(access?.paid_amount || 0),
      active: billing ? ((billing.active && row.payment_status === "paid") || (row.status === "pending" && !billing.paidUntil)) : active(access),
    },
  };
}

async function rowFor(db, id) {
  return db.prepare('SELECT * FROM auramenu_requests WHERE id = ? LIMIT 1').bind(id).first();
}

async function accessFor(db, id) {
  return db.prepare('SELECT * FROM auramenu_edit_access WHERE menu_id = ? LIMIT 1').bind(id).first();
}

function hasBytes(bytes, expected, offset = 0) {
  return expected.every((v, i) => bytes[offset + i] === v);
}

function decodeImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(String(dataUrl || '').trim());
  if (!match) throw new ApiError(400, 'Yalnızca JPG, PNG veya WebP fotoğraf yükleyebilirsiniz.');
  const contentType = match[1].toLowerCase();
  const encoded = match[2];
  if (!IMAGE_TYPES.has(contentType) || !encoded || encoded.length % 4 !== 0 || encoded.length > IMAGE_CHARS) {
    throw new ApiError(400, 'Fotoğraf geçersiz veya çok büyük.');
  }
  let binary;
  try {
    binary = atob(encoded);
  } catch {
    throw new ApiError(400, 'Fotoğraf geçersiz.');
  }
  if (!binary.length || binary.length > IMAGE_BYTES) throw new ApiError(400, 'Fotoğraf çok büyük.');
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const valid =
    (contentType === 'image/jpeg' && hasBytes(bytes, [0xff, 0xd8, 0xff])) ||
    (contentType === 'image/png' && hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (contentType === 'image/webp' &&
      hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8));
  if (!valid) throw new ApiError(400, 'Fotoğraf içeriği geçersiz.');
  return { contentType, bytes: bytes.buffer };
}

function normalizeCategories(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new ApiError(400, '1 ile 12 kategori olmalıdır.');
  }
  let count = 0;
  let categoryCount = 0;
  const normalizeSections = (sections, depth) => sections.map((category, index) => {
    if (++categoryCount > 36) throw new ApiError(400,"Too many menu categories.");
    const name = clean(category?.name, 80);
    if (!name) throw new ApiError(400, `Kategori ${index + 1} için isim girin.`);
    const items = Array.isArray(category?.items) ? category.items : [];
    if (items.length > 20) throw new ApiError(400, 'Bir kategoride en fazla 20 ürün olabilir.');
    return {
      name,
      emoji: clean(category?.emoji, 12),
      ...normalizeCategoryMetadata(category, normalizeSections, depth),
      items: items.map((item, itemIndex) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw new ApiError(400, 'Invalid menu item.');
        const itemName = clean(item?.name, 100);
        if (!itemName) throw new ApiError(400, `${name} kategorisindeki ${itemIndex + 1}. ürün adını girin.`);
        count += 1;
        return {
          name: itemName,
          description: clean(item.description, 300),
          price: clean(item.price, 40),
          imageUrl: url(item.imageUrl),
          imageData: typeof item.imageData === 'string' ? item.imageData.trim() : '',
          featured: Boolean(item.featured),
          ...normalizeItemMetadata(item),
        };
      }),
    };
  });
  const categories = normalizeSections(value,0);
  if (count < 1 || count > 100) throw new ApiError(400, 'Menüde 1 ile 100 ürün olmalıdır.');
  return categories;
}

async function replaceImages(db, id, categories, origin) {
  const inserts = [];
  for (const item of menuItems(categories)) {
    if (!item.imageData) {
      delete item.imageData;
      continue;
    }
    const image = decodeImage(item.imageData);
    delete item.imageData;
    const imageId = crypto.randomUUID();
    item.imageUrl = `${origin}/api/auramenu/images/${imageId}`;
    inserts.push(
      db.prepare('INSERT INTO auramenu_images (id, request_id, content_type, image_bytes) VALUES (?, ?, ?, ?)')
        .bind(imageId, id, image.contentType, image.bytes)
    );
  }
  if (inserts.length > 12) throw new ApiError(400, "At most 12 images per update.");
  return inserts;
}

export async function handleAuraMenuDashboard(request, env) {
  const u = new URL(request.url);
  if (!u.pathname.startsWith('/api/auramenu/dashboard') && !u.pathname.startsWith('/api/admin/auramenu-access')) {
    return null;
  }

  await ensure(env.DB);

  const headers = cors(request, env);
  const presentationFor = row => isCollectionDesign(row.template_id) || standardDesignsEnabled(env) ? getMenuPresentation(env.DB,row.id) : {};
  const designsFor = (row,billing) => menuDesignAccess(env,{
    id:row.id,billing,pending:row.status === 'pending' && !billing?.paidUntil,paid:row.payment_status === 'paid',
  });
  const dashboardMenu = async (row,access,billing) => {
    const designAccess = designsFor(row,billing);
    return {...publicMenu(row,access,billing),...await presentationFor(row),
      designAccess:{standard:designAccess.standard,premium:designAccess.premium ? premiumIds : []}};
  };
  if (u.pathname.startsWith('/api/auramenu/dashboard')) {
    if (headers === null) return json({ error: 'Bu kaynaktan talep kabul edilmiyor.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const claim = u.pathname.match(/^\/api\/auramenu\/dashboard\/([a-f0-9-]+)\/claim$/i);
    if (claim && request.method === 'POST') {
      const body = await readJson(request, 8192);
      const token = typeof body.existingToken === 'string' ? body.existingToken : '';
      const tokenRequest = new Request(request.url, { headers: { 'X-Aura-Menu-Token': token } });
      const byToken = await requireToken(tokenRequest, env.DB, claim[1]);
      const access = byToken || await menuOwnerAccess(request, env.DB, claim[1]);
      if (!access) return json({ error: 'Dashboard access denied.' }, 401, headers);
      const row = await rowFor(env.DB, claim[1]);
      if (!row) return json({ error: 'Dashboard access denied.' }, 401, headers);
      // A valid menu token + a signed-in AuraDigital account links an unowned menu to that account.
      const customer = byToken ? await auraMenuCustomer(request, env) : null;
      const owned = customer ? await linkMenuOwner(env.DB, claim[1], customer.id) : false;
      return json({ token: byToken ? token : '', owned, menu: await dashboardMenu(row,access,await menuBilling(env.DB,row.id)) }, 200, headers);
    }

    const match = u.pathname.match(/^\/api\/auramenu\/dashboard\/([a-f0-9-]+)(?:\/(access-request))?$/i);
    if (!match) return json({ error: 'Not found.' }, 404, headers);

    const id = match[1];
    const action = match[2];
    const row = await rowFor(env.DB, id);
    if (!row) return json({ error: 'Menü bulunamadı.' }, 404, headers);

    const tokenAccess = await requireToken(request, env.DB, id);
    const billing = await menuBilling(env.DB, id);
    if (!tokenAccess) {
      return json({ error: 'Dashboard access denied.' }, 401, { 'Cache-Control': 'no-store', ...headers });
    }

    if (action === 'access-request' && request.method === 'POST') {
      if (billing) return json({ error: 'Editing is included in your plan. Renew from the payment page.' },409,headers);
      if (active(tokenAccess)) {
        return json({ error: 'Düzenleme erişimi zaten aktif.' }, 409, { 'Cache-Control': 'no-store', ...headers });
      }
      const body = await readJson(request, 8192);
      const requestedDays = normalizeDays(body.days);
      if (!requestedDays) {
        return json({ error: `Erişim süresi 1 ile ${MAX_ACCESS_DAYS} gün arasında olmalıdır.` }, 400, {
          'Cache-Control': 'no-store',
          ...headers,
        });
      }
      const amount = requestedDays * ACCESS_PRICE;
      await env.DB.prepare(
        "UPDATE auramenu_edit_access SET " +
        "request_status='requested', requested_at=datetime('now'), requested_days=?, requested_amount=?, " +
        "paid_amount=0, access_until=NULL, updated_at=datetime('now') WHERE menu_id=?"
      ).bind(requestedDays, amount, id).run();

      return json(
        { menu: publicMenu(row, await accessFor(env.DB, id), billing), amount },
        200,
        { 'Cache-Control': 'no-store', ...headers }
      );
    }

    if (!action && request.method === 'GET') {
      return json({ menu: await dashboardMenu(row,tokenAccess,billing) }, 200, { 'Cache-Control': 'no-store', ...headers });
    }

    if (!action && request.method === 'PATCH') {
      if (!(billing ? ((billing.active && row.payment_status === "paid") || (row.status === "pending" && !billing.paidUntil)) : active(tokenAccess))) {
        return json(
          { error: `Düzenleme erişimi kilitli. Erişim ücreti günlük ${ACCESS_PRICE} TL'dir.` },
          403,
          { 'Cache-Control': 'no-store', ...headers }
        );
      }
      const body = await readJson(request, BODY_BYTES);
      const template = assertMenuTemplate(body.templateId ?? row.template_id,{
        ...designsFor(row,billing),currentId:row.template_id,
      });
      const categories = normalizeCategories(body.categories);
      const imageInserts = await replaceImages(env.DB, id, categories, new URL(request.url).origin);
      const presentation = isCollectionDesign(template) ? normalizeMenuPresentation(body) : null;
      const lang = ['tr', 'en', 'ar'].includes(String(body.menuLanguage))
        ? String(body.menuLanguage)
        : row.menu_language;
      const currency = ['TRY', 'EUR', 'USD', 'TND'].includes(String(body.currency))
        ? String(body.currency)
        : row.currency;

      const update = env.DB.prepare(
        "UPDATE auramenu_requests SET template_id=?, menu_language=?, business_name=?, tagline=?, description=?, " +
        "address=?, business_phone=?, whatsapp=?, opening_hours=?, currency=?, categories_json=?, " +
        "updated_at=datetime('now'), revision=revision+1 WHERE id=?"
      ).bind(
        template,
        lang,
        clean(body.businessName, 100) || row.business_name,
        clean(body.tagline, 140),
        clean(body.description, 600),
        clean(body.address, 220),
        clean(body.businessPhone, 40),
        clean(body.whatsapp, 40),
        clean(body.openingHours, 100),
        currency,
        JSON.stringify(categories),
        id
      );
      // All validation finishes before writes; D1 batch is transactional.
      const retained = Array.from(menuItems(categories),item => item.imageUrl);
      const imageRows = await env.DB.prepare('SELECT id FROM auramenu_images WHERE request_id=?').bind(id).all();
      const deletions = (imageRows.results || []).filter(image => !retained.some(value => value.endsWith(`/api/auramenu/images/${image.id}`)))
        .map(image => env.DB.prepare('DELETE FROM auramenu_images WHERE id=? AND request_id=?').bind(image.id, id));
      await env.DB.batch([...imageInserts, update, ...deletions,
        ...(presentation && Object.keys(presentation).length ? [saveMenuPresentation(env.DB,id,presentation)] : []),
      ]);
      const updated = await rowFor(env.DB,id);
      await purgeCachedMenu(updated?.slug || row.slug, new URL(request.url).origin);

      return json(
        { menu: await dashboardMenu(updated,await accessFor(env.DB,id),billing) },
        200,
        { 'Cache-Control': 'no-store', ...headers }
      );
    }

    return json({ error: 'Method not allowed.' }, 405, headers);
  }

  const admin = await getAuthenticatedAdmin(request, env.DB);
  if (!admin) return json({ error: 'Unauthorized.' }, 401, { 'Cache-Control': 'no-store' });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && admin.role === 'viewer') return json({ error: 'This account has read-only access.' }, 403);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !sameOrigin(request)) {
    return json({ error: 'Invalid request origin.' }, 403);
  }

  const adminMatch = u.pathname.match(/^\/api\/admin\/auramenu-access(?:\/([a-f0-9-]+))?$/i);
  if (!adminMatch) return json({ error: 'Not found.' }, 404);
  const id = adminMatch[1];

  if (request.method === 'GET' && !id) {
    const rows = await env.DB.prepare(
      "SELECT r.id,r.slug,r.business_name,r.status,r.updated_at," +
      "a.request_status,a.requested_at,a.requested_days,a.requested_amount,a.access_until,a.paid_amount " +
      "FROM auramenu_requests r LEFT JOIN auramenu_edit_access a ON a.menu_id=r.id " +
      "ORDER BY CASE WHEN a.request_status='requested' THEN 0 ELSE 1 END, r.created_at DESC LIMIT 100"
    ).all();

    return json({
      items: (rows.results || []).map(row => ({
        ...row,
        accessActive: Boolean(row.access_until && Date.parse(row.access_until) > Date.now()),
        pricePerDay: ACCESS_PRICE,
      })),
    }, 200, { 'Cache-Control': 'no-store' });
  }

  if (request.method === 'PATCH' && id) {
    const row = await rowFor(env.DB, id);
    if (!row) return json({ error: 'Menü bulunamadı.' }, 404);

    const body = await readJson(request, 8192);
    const currentAccess = await accessFor(env.DB, id);

    if (body.action === 'rotate-token') {
      if (admin.role !== 'owner') return json({ error: 'Owner access is required.' }, 403);
      const token = newMenuToken();
      await env.DB.prepare("INSERT INTO auramenu_edit_access (menu_id, token_hash) VALUES (?, ?) ON CONFLICT(menu_id) DO UPDATE SET token_hash=excluded.token_hash, updated_at=datetime('now')")
        .bind(id, await sha256(token)).run();
      return json({ ok: true, token });
    }

    if (body.action === 'activate') {
      const days = body.days === undefined ? (normalizeDays(currentAccess?.requested_days) || 1) : normalizeDays(body.days);
      if (!days) return json({ error: 'Invalid access duration.' }, 400);
      const amount = ACCESS_PRICE * days;
      await env.DB.prepare(
        "INSERT INTO auramenu_edit_access " +
        "(menu_id, request_status, requested_at, requested_days, requested_amount, access_until, paid_amount) " +
        "VALUES (?, 'approved', datetime('now'), ?, ?, datetime('now', ?), ?) " +
        "ON CONFLICT(menu_id) DO UPDATE SET " +
        "request_status='approved', requested_days=?, requested_amount=?, access_until=datetime('now', ?), " +
        "paid_amount=?, updated_at=datetime('now')"
      ).bind(
        id,
        days,
        amount,
        `+${days} day`,
        amount,
        days,
        amount,
        `+${days} day`,
        amount
      ).run();

      return json({ ok: true, editAccess: publicMenu(row, await accessFor(env.DB, id), await menuBilling(env.DB, id)).editAccess, amount, days }, 200, {
        'Cache-Control': 'no-store',
      });
    }

    if (body.action === 'lock') {
      await env.DB.prepare(
        "INSERT INTO auramenu_edit_access " +
        "(menu_id, request_status, requested_at, requested_days, requested_amount, access_until, paid_amount) " +
        "VALUES (?, 'none', NULL, 0, 0, NULL, 0) " +
        "ON CONFLICT(menu_id) DO UPDATE SET request_status='none', requested_at=NULL, requested_days=0, " +
        "requested_amount=0, access_until=NULL, paid_amount=0, updated_at=datetime('now')"
      ).bind(id).run();
      return json({ ok: true }, 200, { 'Cache-Control': 'no-store' });
    }

    return json({ error: 'Unknown action.' }, 400);
  }

  return json({ error: 'Method not allowed.' }, 405);
}
