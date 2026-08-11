import { ApiError, json, readJson } from "../http.js";
import { sameOrigin } from "../security.js";
import { hashPassword, verifyPassword } from "./crypto.js";
import { audit, bumpMenu, bumpWebsite, requireCustomer, requireProject } from "./context.js";
import { createCustomerSession, customerCookie, revokeAllUserSessions, revokeCustomerSession } from "./session.js";
import { bool, color, email, id, number, password, safeUrl, text } from "./validation.js";

const BODY_BYTES = 48 * 1024;
const LANGUAGES = new Set(["tr", "en", "ar"]);
const CURRENCIES = new Set(["TRY", "EUR", "USD", "TND"]);

export async function handleCustomerApi(request, env, url) {
  if (url.pathname === "/api/customer/login" && request.method === "POST") return login(request, env);
  if (url.pathname === "/api/customer/logout" && request.method === "POST") return logout(request, env);

  const isCustomerPath = url.pathname === "/api/me" || url.pathname === "/api/account/password" ||
    /^\/api\/(menu|categories|products|website|services|gallery)(?:\/|$)/.test(url.pathname);
  if (!isCustomerPath) return null;

  const session = await requireCustomer(request, env.DB);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !sameOrigin(request)) {
    throw new ApiError(403, "Invalid request origin.");
  }
  if (url.pathname === "/api/me" && request.method === "GET") return me(env.DB, session);
  if (url.pathname === "/api/account/password" && request.method === "PUT") return changePassword(request, env.DB, session);
  if (url.pathname === "/api/menu" && request.method === "GET") return getMenu(env.DB, session);
  if (url.pathname === "/api/menu/settings" && request.method === "PUT") return updateMenuSettings(request, env.DB, session);

  const categoryMatch = url.pathname.match(/^\/api\/categories(?:\/([a-f0-9-]+))?$/i);
  if (categoryMatch) return categories(request, env.DB, session, categoryMatch[1] || null);
  const productMatch = url.pathname.match(/^\/api\/products(?:\/([a-f0-9-]+))?$/i);
  if (productMatch) return products(request, env.DB, session, productMatch[1] || null);

  if (url.pathname === "/api/website" && request.method === "GET") return getWebsite(env.DB, session);
  if (url.pathname === "/api/website" && request.method === "PUT") return updateWebsite(request, env.DB, session);
  const serviceMatch = url.pathname.match(/^\/api\/services(?:\/([a-f0-9-]+))?$/i);
  if (serviceMatch) return websiteServices(request, env.DB, session, serviceMatch[1] || null);
  const galleryMatch = url.pathname.match(/^\/api\/gallery(?:\/([a-f0-9-]+))?$/i);
  if (galleryMatch) return gallery(request, env.DB, session, galleryMatch[1] || null);
  return json({ error: "Not found." }, 404);
}

async function login(request, env) {
  if (!sameOrigin(request)) throw new ApiError(403, "Invalid request origin.");
  const body = await readJson(request, 4096);
  const accountEmail = email(body.email, true);
  const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
  const [ipLimit, accountLimit] = await Promise.all([
    env.LOGIN_RATE_LIMITER.limit({ key: `customer-login-ip:${clientKey}` }),
    env.LOGIN_RATE_LIMITER.limit({ key: `customer-login-account:${accountEmail.slice(0, 80)}` }),
  ]);
  if (!ipLimit.success || !accountLimit.success) return json({ error: "Too many sign-in attempts. Try again in one minute." }, 429, { "Retry-After": "60" });
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE LIMIT 1").bind(accountEmail).first();
  const valid = user && user.status === "active" && await verifyPassword(String(body.password || ""), user.password_hash, user.password_salt, user.password_iterations);
  if (!valid) return json({ error: "Incorrect email or password." }, 401);
  if (user.tenant_id) {
    const tenant = await env.DB.prepare("SELECT status FROM tenants WHERE id = ? LIMIT 1").bind(user.tenant_id).first();
    if (!tenant || tenant.status !== "active") return json({ error: "This account is suspended." }, 403);
  }
  const created = await createCustomerSession(request, env.DB, user);
  await env.DB.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();
  return json({ ok: true }, 200, { "Set-Cookie": created.cookie });
}

async function logout(request, env) {
  if (!sameOrigin(request)) throw new ApiError(403, "Invalid request origin.");
  await revokeCustomerSession(request, env.DB);
  return json({ ok: true }, 200, { "Set-Cookie": customerCookie("", 0) });
}

async function me(db, session) {
  const rows = session.tenant_id
    ? await db.prepare("SELECT project_type FROM customer_projects WHERE tenant_id = ? AND status = 'active' ORDER BY project_type").bind(session.tenant_id).all()
    : { results: [] };
  const business = session.tenant_id
    ? await db.prepare("SELECT id, name, slug, logo FROM businesses WHERE tenant_id = ? ORDER BY created_at LIMIT 1").bind(session.tenant_id).first()
    : null;
  return json({ user: { id: session.user_id, email: session.email, role: session.role }, business, products: (rows.results || []).map((row) => row.project_type) });
}

async function changePassword(request, db, session) {
  const body = await readJson(request, 4096);
  const current = await db.prepare("SELECT * FROM users WHERE id = ? AND tenant_id = ? LIMIT 1").bind(session.user_id, session.tenant_id).first();
  if (!current || !(await verifyPassword(String(body.currentPassword || ""), current.password_hash, current.password_salt, current.password_iterations))) {
    throw new ApiError(401, "Current password is incorrect.");
  }
  const nextPassword = password(body.newPassword);
  const hashed = await hashPassword(nextPassword);
  await db.prepare("UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?")
    .bind(hashed.hash, hashed.salt, hashed.iterations, session.user_id, session.tenant_id).run();
  await audit(db, session, "password.changed", "user", session.user_id);
  await revokeAllUserSessions(db, session.user_id);
  return json({ ok: true, signedOut: true }, 200, { "Set-Cookie": customerCookie("", 0) });
}

async function getMenu(db, session) {
  const project = await requireProject(db, session, "auramenu");
  const [settings, categoriesResult, productsResult] = await Promise.all([
    db.prepare("SELECT * FROM menu_settings WHERE tenant_id = ? AND business_id = ? LIMIT 1").bind(session.tenant_id, project.id).first(),
    db.prepare("SELECT * FROM menu_categories WHERE tenant_id = ? AND business_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, project.id).all(),
    db.prepare("SELECT * FROM menu_products WHERE tenant_id = ? AND business_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, project.id).all(),
  ]);
  return json({ business: publicBusiness(project), settings, categories: categoriesResult.results || [], products: productsResult.results || [] });
}

async function updateMenuSettings(request, db, session) {
  const project = await requireProject(db, session, "auramenu");
  const body = await readJson(request, BODY_BYTES);
  const current = await db.prepare("SELECT * FROM menu_settings WHERE tenant_id = ? AND business_id = ? LIMIT 1").bind(session.tenant_id, project.id).first();
  if (!current) throw new ApiError(404, "Menu settings were not found.");
  const language = LANGUAGES.has(String(body.language)) ? String(body.language) : current.language;
  const currency = CURRENCIES.has(String(body.currency)) ? String(body.currency) : current.currency;
  await db.batch([
    db.prepare("UPDATE businesses SET name = ?, phone = ?, whatsapp = ?, email = ?, address = ?, instagram = ?, facebook = ?, currency = ?, language = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ?")
      .bind(text(body.name ?? project.name, "Business name", 120, true), text(body.phone ?? project.phone, "Phone", 40), text(body.whatsapp ?? project.whatsapp, "WhatsApp", 40), email(body.email ?? project.email), text(body.address ?? project.address, "Address", 240), text(body.instagram ?? project.instagram, "Instagram", 160), text(body.facebook ?? project.facebook, "Facebook", 160), currency, language, project.id, session.tenant_id),
    db.prepare("UPDATE menu_settings SET primary_color = ?, secondary_color = ?, language = ?, currency = ?, show_prices = ?, published = ?, revision = revision + 1, updated_at = datetime('now') WHERE business_id = ? AND tenant_id = ?")
      .bind(color(body.primaryColor, current.primary_color), color(body.secondaryColor, current.secondary_color), language, currency, body.showPrices === undefined ? current.show_prices : bool(body.showPrices), body.published === undefined ? current.published : bool(body.published), project.id, session.tenant_id),
  ]);
  await audit(db, session, "menu.settings.updated", "business", project.id);
  return json({ ok: true });
}

async function categories(request, db, session, recordId) {
  const project = await requireProject(db, session, "auramenu");
  if (request.method === "GET" && !recordId) {
    const rows = await db.prepare("SELECT * FROM menu_categories WHERE tenant_id = ? AND business_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, project.id).all();
    return json({ categories: rows.results || [] });
  }
  if (request.method === "POST" && !recordId) {
    const count = await db.prepare("SELECT COUNT(*) AS count FROM menu_categories WHERE tenant_id = ? AND business_id = ?").bind(session.tenant_id, project.id).first();
    if (Number(count?.count || 0) >= 50) throw new ApiError(409, "Category limit reached.");
    const body = await readJson(request, BODY_BYTES);
    const newId = crypto.randomUUID();
    await db.prepare("INSERT INTO menu_categories (id, tenant_id, business_id, name, description, emoji, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(newId, session.tenant_id, project.id, text(body.name, "Category name", 80, true), text(body.description, "Description", 300), text(body.emoji, "Emoji", 16), number(body.sortOrder ?? 0, "sort order", { max: 10000, integer: true }), body.active === undefined ? 1 : bool(body.active)).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "category.created", "menu_category", newId);
    return json({ id: newId }, 201);
  }
  if (request.method === "PUT" && recordId) {
    const body = await readJson(request, BODY_BYTES);
    const current = await ownedCategory(db, session, project.id, recordId);
    await db.prepare("UPDATE menu_categories SET name = ?, description = ?, emoji = ?, sort_order = ?, active = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ? AND business_id = ?")
      .bind(text(body.name ?? current.name, "Category name", 80, true), text(body.description ?? current.description, "Description", 300), text(body.emoji ?? current.emoji, "Emoji", 16), number(body.sortOrder ?? current.sort_order, "sort order", { max: 10000, integer: true }), body.active === undefined ? current.active : bool(body.active), recordId, session.tenant_id, project.id).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "category.updated", "menu_category", recordId);
    return json({ ok: true });
  }
  if (request.method === "DELETE" && recordId) {
    await ownedCategory(db, session, project.id, recordId);
    await db.prepare("DELETE FROM menu_categories WHERE id = ? AND tenant_id = ? AND business_id = ?").bind(recordId, session.tenant_id, project.id).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "category.deleted", "menu_category", recordId);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
}

async function products(request, db, session, recordId) {
  const project = await requireProject(db, session, "auramenu");
  if (request.method === "GET" && !recordId) {
    const rows = await db.prepare("SELECT * FROM menu_products WHERE tenant_id = ? AND business_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, project.id).all();
    return json({ products: rows.results || [] });
  }
  if (request.method === "POST" && !recordId) {
    const body = await readJson(request, BODY_BYTES);
    const categoryId = id(body.categoryId);
    await ownedCategory(db, session, project.id, categoryId);
    const count = await db.prepare("SELECT COUNT(*) AS count FROM menu_products WHERE tenant_id = ? AND business_id = ?").bind(session.tenant_id, project.id).first();
    if (Number(count?.count || 0) >= 500) throw new ApiError(409, "Product limit reached.");
    const newId = crypto.randomUUID();
    await db.prepare("INSERT INTO menu_products (id, tenant_id, business_id, category_id, name, description, price, image, available, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(newId, session.tenant_id, project.id, categoryId, text(body.name, "Product name", 100, true), text(body.description, "Description", 500), number(body.price ?? 0, "price"), safeUrl(body.image, "image URL"), body.available === undefined ? 1 : bool(body.available), bool(body.featured), number(body.sortOrder ?? 0, "sort order", { max: 10000, integer: true })).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "product.created", "menu_product", newId);
    return json({ id: newId }, 201);
  }
  const current = recordId ? await ownedProduct(db, session, project.id, recordId) : null;
  if (request.method === "PUT" && current) {
    const body = await readJson(request, BODY_BYTES);
    const categoryId = id(body.categoryId ?? current.category_id);
    await ownedCategory(db, session, project.id, categoryId);
    await db.prepare("UPDATE menu_products SET category_id = ?, name = ?, description = ?, price = ?, image = ?, available = ?, featured = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ? AND tenant_id = ? AND business_id = ?")
      .bind(categoryId, text(body.name ?? current.name, "Product name", 100, true), text(body.description ?? current.description, "Description", 500), number(body.price ?? current.price, "price"), safeUrl(body.image ?? current.image, "image URL"), body.available === undefined ? current.available : bool(body.available), body.featured === undefined ? current.featured : bool(body.featured), number(body.sortOrder ?? current.sort_order, "sort order", { max: 10000, integer: true }), recordId, session.tenant_id, project.id).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "product.updated", "menu_product", recordId);
    return json({ ok: true });
  }
  if (request.method === "DELETE" && current) {
    await db.prepare("DELETE FROM menu_products WHERE id = ? AND tenant_id = ? AND business_id = ?").bind(recordId, session.tenant_id, project.id).run();
    await bumpMenu(db, session.tenant_id, project.id);
    await audit(db, session, "product.deleted", "menu_product", recordId);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
}

async function getWebsite(db, session) {
  const project = await requireProject(db, session, "quicksite");
  const website = await db.prepare("SELECT * FROM websites WHERE tenant_id = ? AND business_id = ? LIMIT 1").bind(session.tenant_id, project.id).first();
  if (!website) throw new ApiError(404, "Website was not found.");
  const [content, services, galleryRows] = await Promise.all([
    db.prepare("SELECT * FROM website_content WHERE tenant_id = ? AND website_id = ? LIMIT 1").bind(session.tenant_id, website.id).first(),
    db.prepare("SELECT * FROM website_services WHERE tenant_id = ? AND website_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, website.id).all(),
    db.prepare("SELECT * FROM website_gallery WHERE tenant_id = ? AND website_id = ? ORDER BY sort_order, created_at").bind(session.tenant_id, website.id).all(),
  ]);
  return json({ business: publicBusiness(project), website, content, services: services.results || [], gallery: galleryRows.results || [] });
}

async function updateWebsite(request, db, session) {
  const { project, website } = await websiteContext(db, session);
  const body = await readJson(request, BODY_BYTES);
  const content = await db.prepare("SELECT * FROM website_content WHERE tenant_id = ? AND website_id = ? LIMIT 1").bind(session.tenant_id, website.id).first();
  if (!content) throw new ApiError(404, "Website content was not found.");
  const fields = {
    hero_title: text(body.heroTitle ?? content.hero_title, "Hero title", 160), hero_subtitle: text(body.heroSubtitle ?? content.hero_subtitle, "Hero subtitle", 300),
    about_title: text(body.aboutTitle ?? content.about_title, "About title", 160), about_text: text(body.aboutText ?? content.about_text, "About text", 4000),
    phone: text(body.phone ?? content.phone, "Phone", 40), whatsapp: text(body.whatsapp ?? content.whatsapp, "WhatsApp", 40), email: email(body.email ?? content.email),
    address: text(body.address ?? content.address, "Address", 240), opening_hours: text(body.openingHours ?? content.opening_hours, "Opening hours", 300),
    instagram: text(body.instagram ?? content.instagram, "Instagram", 160), facebook: text(body.facebook ?? content.facebook, "Facebook", 160),
    primary_cta: text(body.primaryCta ?? content.primary_cta, "Primary CTA", 80), secondary_cta: text(body.secondaryCta ?? content.secondary_cta, "Secondary CTA", 80),
    primary_color: color(body.primaryColor, content.primary_color), hero_image: safeUrl(body.heroImage ?? content.hero_image, "hero image"), logo_image: safeUrl(body.logoImage ?? content.logo_image, "logo image"),
  };
  await db.batch([
    db.prepare("UPDATE website_content SET hero_title=?,hero_subtitle=?,about_title=?,about_text=?,phone=?,whatsapp=?,email=?,address=?,opening_hours=?,instagram=?,facebook=?,primary_cta=?,secondary_cta=?,primary_color=?,hero_image=?,logo_image=?,updated_at=datetime('now') WHERE website_id=? AND tenant_id=?")
      .bind(...Object.values(fields), website.id, session.tenant_id),
    db.prepare("UPDATE businesses SET name=?,phone=?,whatsapp=?,email=?,address=?,instagram=?,facebook=?,logo=?,updated_at=datetime('now') WHERE id=? AND tenant_id=?")
      .bind(text(body.businessName ?? project.name, "Business name", 120, true), fields.phone, fields.whatsapp, fields.email, fields.address, fields.instagram, fields.facebook, fields.logo_image, project.id, session.tenant_id),
    db.prepare("UPDATE websites SET status=?,revision=revision+1,updated_at=datetime('now') WHERE id=? AND tenant_id=?")
      .bind(body.published === false ? "draft" : website.status === "suspended" ? "suspended" : "published", website.id, session.tenant_id),
  ]);
  await audit(db, session, "website.updated", "website", website.id);
  return json({ ok: true });
}

async function websiteServices(request, db, session, recordId) {
  const { website } = await websiteContext(db, session);
  if (request.method === "GET" && !recordId) {
    const rows = await db.prepare("SELECT * FROM website_services WHERE tenant_id=? AND website_id=? ORDER BY sort_order,created_at").bind(session.tenant_id, website.id).all();
    return json({ services: rows.results || [] });
  }
  if (request.method === "POST" && !recordId) {
    const body = await readJson(request, BODY_BYTES); const newId = crypto.randomUUID();
    await db.prepare("INSERT INTO website_services (id,tenant_id,website_id,title,description,image,price,sort_order,active) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(newId, session.tenant_id, website.id, text(body.title, "Service title", 120, true), text(body.description, "Description", 1000), safeUrl(body.image, "image URL"), text(body.price, "Price", 60), number(body.sortOrder ?? 0, "sort order", { max: 10000, integer: true }), body.active === undefined ? 1 : bool(body.active)).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "service.created", "website_service", newId); return json({ id: newId }, 201);
  }
  const current = recordId ? await ownedWebsiteItem(db, session, website.id, "website_services", recordId) : null;
  if (request.method === "PUT" && current) {
    const body = await readJson(request, BODY_BYTES);
    await db.prepare("UPDATE website_services SET title=?,description=?,image=?,price=?,sort_order=?,active=?,updated_at=datetime('now') WHERE id=? AND tenant_id=? AND website_id=?")
      .bind(text(body.title ?? current.title, "Service title", 120, true), text(body.description ?? current.description, "Description", 1000), safeUrl(body.image ?? current.image, "image URL"), text(body.price ?? current.price, "Price", 60), number(body.sortOrder ?? current.sort_order, "sort order", { max: 10000, integer: true }), body.active === undefined ? current.active : bool(body.active), recordId, session.tenant_id, website.id).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "service.updated", "website_service", recordId); return json({ ok: true });
  }
  if (request.method === "DELETE" && current) {
    await db.prepare("DELETE FROM website_services WHERE id=? AND tenant_id=? AND website_id=?").bind(recordId, session.tenant_id, website.id).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "service.deleted", "website_service", recordId); return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
}

async function gallery(request, db, session, recordId) {
  const { website } = await websiteContext(db, session);
  if (request.method === "GET" && !recordId) {
    const rows = await db.prepare("SELECT * FROM website_gallery WHERE tenant_id=? AND website_id=? ORDER BY sort_order,created_at").bind(session.tenant_id, website.id).all();
    return json({ gallery: rows.results || [] });
  }
  if (request.method === "POST" && !recordId) {
    const body = await readJson(request, BODY_BYTES); const newId = crypto.randomUUID();
    await db.prepare("INSERT INTO website_gallery (id,tenant_id,website_id,image,caption,sort_order) VALUES (?,?,?,?,?,?)")
      .bind(newId, session.tenant_id, website.id, safeUrl(body.image, "image URL"), text(body.caption, "Caption", 240), number(body.sortOrder ?? 0, "sort order", { max: 10000, integer: true })).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "gallery.created", "website_gallery", newId); return json({ id: newId }, 201);
  }
  const current = recordId ? await ownedWebsiteItem(db, session, website.id, "website_gallery", recordId) : null;
  if (request.method === "PUT" && current) {
    const body = await readJson(request, BODY_BYTES);
    await db.prepare("UPDATE website_gallery SET image=?,caption=?,sort_order=?,updated_at=datetime('now') WHERE id=? AND tenant_id=? AND website_id=?")
      .bind(safeUrl(body.image ?? current.image, "image URL"), text(body.caption ?? current.caption, "Caption", 240), number(body.sortOrder ?? current.sort_order, "sort order", { max: 10000, integer: true }), recordId, session.tenant_id, website.id).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "gallery.updated", "website_gallery", recordId); return json({ ok: true });
  }
  if (request.method === "DELETE" && current) {
    await db.prepare("DELETE FROM website_gallery WHERE id=? AND tenant_id=? AND website_id=?").bind(recordId, session.tenant_id, website.id).run();
    await bumpWebsite(db, session.tenant_id, website.id); await audit(db, session, "gallery.deleted", "website_gallery", recordId); return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
}

async function ownedCategory(db, session, businessId, recordId) {
  const row = await db.prepare("SELECT * FROM menu_categories WHERE id=? AND tenant_id=? AND business_id=? LIMIT 1").bind(id(recordId), session.tenant_id, businessId).first();
  if (!row) throw new ApiError(404, "Category not found."); return row;
}
async function ownedProduct(db, session, businessId, recordId) {
  const row = await db.prepare("SELECT * FROM menu_products WHERE id=? AND tenant_id=? AND business_id=? LIMIT 1").bind(id(recordId), session.tenant_id, businessId).first();
  if (!row) throw new ApiError(404, "Product not found."); return row;
}
async function websiteContext(db, session) {
  const project = await requireProject(db, session, "quicksite");
  const website = await db.prepare("SELECT * FROM websites WHERE tenant_id=? AND business_id=? LIMIT 1").bind(session.tenant_id, project.id).first();
  if (!website) throw new ApiError(404, "Website not found."); return { project, website };
}
async function ownedWebsiteItem(db, session, websiteId, table, recordId) {
  const allowed = new Set(["website_services", "website_gallery"]); if (!allowed.has(table)) throw new ApiError(500, "Invalid resource.");
  const row = await db.prepare(`SELECT * FROM ${table} WHERE id=? AND tenant_id=? AND website_id=? LIMIT 1`).bind(id(recordId), session.tenant_id, websiteId).first();
  if (!row) throw new ApiError(404, "Record not found."); return row;
}
function publicBusiness(row) {
  return { id: row.id, name: row.name, slug: row.slug, logo: row.logo, phone: row.phone, whatsapp: row.whatsapp, email: row.email, address: row.address, instagram: row.instagram, facebook: row.facebook, currency: row.currency, language: row.language };
}
