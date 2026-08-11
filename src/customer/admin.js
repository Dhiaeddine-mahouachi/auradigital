import { ApiError, json, readJson } from "../http.js";
import { hashPassword } from "./crypto.js";
import { revokeAllUserSessions } from "./session.js";
import { color, email, password, slug, text } from "./validation.js";

const BODY_BYTES = 96 * 1024;

export async function handleAdminCustomerAccounts(request, db, url) {
  if (url.pathname === "/api/admin/customer-accounts" && request.method === "GET") return listAccounts(db);
  if (url.pathname === "/api/admin/customer-accounts" && request.method === "POST") return createAccount(request, db);
  const reset = url.pathname.match(/^\/api\/admin\/customer-accounts\/([a-f0-9-]+)\/reset-password$/i);
  if (reset && request.method === "POST") return resetPassword(request, db, reset[1]);
  const update = url.pathname.match(/^\/api\/admin\/customer-accounts\/([a-f0-9-]+)$/i);
  if (update && request.method === "PATCH") return updateAccount(request, db, update[1]);
  return null;
}

async function listAccounts(db) {
  const rows = await db.prepare(
    "SELECT u.id AS user_id,u.email,u.role,u.status AS user_status,u.last_login_at,u.created_at,t.id AS tenant_id,t.name AS tenant_name,t.status AS tenant_status,b.id AS business_id,b.slug,b.name AS business_name," +
    "GROUP_CONCAT(DISTINCT p.project_type) AS products FROM users u JOIN tenants t ON t.id=u.tenant_id LEFT JOIN businesses b ON b.tenant_id=t.id LEFT JOIN customer_projects p ON p.tenant_id=t.id " +
    "WHERE u.role IN ('customer_admin','customer_editor') GROUP BY u.id ORDER BY u.created_at DESC",
  ).all();
  return json({ accounts: (rows.results || []).map((row) => ({ ...row, products: String(row.products || "").split(",").filter(Boolean) })) });
}

async function createAccount(request, db) {
  const body = await readJson(request, BODY_BYTES);
  const accountEmail = email(body.email, true);
  const accountPassword = password(body.password);
  const businessSlug = slug(body.slug || body.businessName);
  const requestedProducts = Array.isArray(body.products) ? body.products.filter((value) => ["auramenu", "quicksite"].includes(value)) : [];
  const products = [...new Set(requestedProducts)];
  if (!products.length) throw new ApiError(400, "Enable AuraMenu, QuickSite, or both.");
  const existing = await db.batch([
    db.prepare("SELECT id FROM users WHERE email=? COLLATE NOCASE LIMIT 1").bind(accountEmail),
    db.prepare("SELECT id FROM businesses WHERE slug=? LIMIT 1").bind(businessSlug),
  ]);
  if ((existing[0].results || []).length) throw new ApiError(409, "This email already has an account.");
  if ((existing[1].results || []).length) throw new ApiError(409, "This business address is already in use.");

  const menuRequest = body.auraMenuRequestId
    ? await db.prepare("SELECT * FROM auramenu_requests WHERE id=? LIMIT 1").bind(String(body.auraMenuRequestId)).first()
    : null;
  const siteRequest = body.quickSiteRequestId
    ? await db.prepare("SELECT * FROM quicksite_projects WHERE id=? LIMIT 1").bind(String(body.quickSiteRequestId)).first()
    : null;
  if (body.auraMenuRequestId && !menuRequest) throw new ApiError(404, "AuraMenu request not found.");
  if (body.quickSiteRequestId && !siteRequest) throw new ApiError(404, "QuickSite request not found.");

  const tenantId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const businessId = crypto.randomUUID();
  const hashed = await hashPassword(accountPassword);
  const businessName = text(body.businessName || menuRequest?.business_name || siteRequest?.business_name, "Business name", 120, true);
  const business = {
    logo: "",
    phone: menuRequest?.business_phone || siteRequest?.phone || "",
    whatsapp: menuRequest?.whatsapp || siteRequest?.whatsapp || "",
    email: menuRequest?.email || siteRequest?.email || accountEmail,
    address: menuRequest?.address || siteRequest?.address || "",
    instagram: siteRequest ? parseJson(siteRequest.details_json, {}).instagram || "" : "",
    facebook: "",
    currency: menuRequest?.currency || "TRY",
    language: menuRequest?.menu_language || siteRequest?.language || "tr",
  };
  const statements = [
    db.prepare("INSERT INTO tenants (id,name) VALUES (?,?)").bind(tenantId, businessName),
    db.prepare("INSERT INTO users (id,tenant_id,email,password_hash,password_salt,password_iterations,role) VALUES (?,?,?,?,?,?,?)")
      .bind(userId, tenantId, accountEmail, hashed.hash, hashed.salt, hashed.iterations, body.role === "customer_editor" ? "customer_editor" : "customer_admin"),
    db.prepare("INSERT INTO businesses (id,tenant_id,name,slug,logo,phone,whatsapp,email,address,instagram,facebook,currency,language) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(businessId, tenantId, businessName, businessSlug, business.logo, business.phone, business.whatsapp, business.email, business.address, business.instagram, business.facebook, business.currency, business.language),
  ];

  if (products.includes("auramenu")) seedMenu(statements, db, tenantId, businessId, menuRequest);
  if (products.includes("quicksite")) seedWebsite(statements, db, tenantId, businessId, siteRequest, businessName);
  statements.push(db.prepare("INSERT INTO audit_logs (id,tenant_id,user_id,action,resource_type,resource_id,metadata_json) VALUES (?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), tenantId, null, "account.created", "user", userId, JSON.stringify({ products })));
  await db.batch(statements);
  return json({ account: { userId, tenantId, businessId, email: accountEmail, slug: businessSlug, products } }, 201);
}

function seedMenu(statements, db, tenantId, businessId, request) {
  statements.push(
    db.prepare("INSERT INTO customer_projects (id,tenant_id,business_id,project_type,source_request_id,status) VALUES (?,?,?,?,?,'active')")
      .bind(crypto.randomUUID(), tenantId, businessId, "auramenu", request?.id || null),
    db.prepare("INSERT INTO menu_settings (business_id,tenant_id,template,primary_color,secondary_color,language,currency,show_prices,published) VALUES (?,?,?,?,?,?,?,?,1)")
      .bind(businessId, tenantId, request?.template_id || "modern", "#1b9aaa", "#10231b", request?.menu_language || "tr", request?.currency || "TRY", 1),
  );
  const categories = request ? parseJson(request.categories_json, []) : [];
  categories.slice(0, 50).forEach((category, categoryIndex) => {
    const categoryId = crypto.randomUUID();
    statements.push(db.prepare("INSERT INTO menu_categories (id,tenant_id,business_id,name,description,emoji,sort_order,active) VALUES (?,?,?,?,?,?,?,1)")
      .bind(categoryId, tenantId, businessId, text(category.name, "Category name", 80, true), "", text(category.emoji, "Emoji", 16), categoryIndex));
    (Array.isArray(category.items) ? category.items : []).slice(0, 100).forEach((product, productIndex) => {
      const parsedPrice = Number.parseFloat(String(product.price || "0").replace(",", "."));
      statements.push(db.prepare("INSERT INTO menu_products (id,tenant_id,business_id,category_id,name,description,price,image,available,featured,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), tenantId, businessId, categoryId, text(product.name, "Product name", 100, true), text(product.description, "Description", 500), Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0, String(product.imageUrl || ""), 1, product.featured ? 1 : 0, productIndex));
    });
  });
}

function seedWebsite(statements, db, tenantId, businessId, request, businessName) {
  const websiteId = crypto.randomUUID();
  const details = request ? parseJson(request.details_json, {}) : {};
  const offers = request ? parseJson(request.offers_json, []) : [];
  statements.push(
    db.prepare("INSERT INTO customer_projects (id,tenant_id,business_id,project_type,source_request_id,status) VALUES (?,?,?,?,?,'active')")
      .bind(crypto.randomUUID(), tenantId, businessId, "quicksite", request?.id || null),
    db.prepare("INSERT INTO websites (id,tenant_id,business_id,template_id,domain,status) VALUES (?,?,?,?,?,'published')")
      .bind(websiteId, tenantId, businessId, request?.template_id || "local-pro", ""),
    db.prepare("INSERT INTO website_content (website_id,tenant_id,hero_title,hero_subtitle,about_title,about_text,phone,whatsapp,email,address,opening_hours,instagram,facebook,primary_cta,secondary_cta,primary_color,hero_image,logo_image) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(websiteId, tenantId, businessName, request?.tagline || "", details.aboutTitle || "", request?.description || "", request?.phone || "", request?.whatsapp || "", request?.email || "", request?.address || "", details.workingHours || "", details.instagram || "", "", details.primaryCta || "", "", color(request?.primary_color, "#a3ff12"), details.heroImageUrl || "", details.logoUrl || ""),
  );
  offers.slice(0, 50).forEach((offer, index) => statements.push(
    db.prepare("INSERT INTO website_services (id,tenant_id,website_id,title,description,price,sort_order,active) VALUES (?,?,?,?,?,?,?,1)")
      .bind(crypto.randomUUID(), tenantId, websiteId, text(offer.name, "Service title", 120, true), text(offer.description, "Description", 1000), text(offer.price, "Price", 60), index),
  ));
  (Array.isArray(details.galleryUrls) ? details.galleryUrls : []).slice(0, 30).forEach((image, index) => statements.push(
    db.prepare("INSERT INTO website_gallery (id,tenant_id,website_id,image,caption,sort_order) VALUES (?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), tenantId, websiteId, String(image || ""), "", index),
  ));
}

async function resetPassword(request, db, userId) {
  const body = await readJson(request, 4096);
  const next = await hashPassword(password(body.password));
  const result = await db.prepare("UPDATE users SET password_hash=?,password_salt=?,password_iterations=?,updated_at=datetime('now') WHERE id=? AND role IN ('customer_admin','customer_editor')")
    .bind(next.hash, next.salt, next.iterations, userId).run();
  if (!result.meta?.changes) throw new ApiError(404, "Customer account not found.");
  await revokeAllUserSessions(db, userId);
  return json({ ok: true });
}

async function updateAccount(request, db, userId) {
  const body = await readJson(request, 4096);
  const status = body.status === "disabled" ? "disabled" : "active";
  const result = await db.prepare("UPDATE users SET status=?,updated_at=datetime('now') WHERE id=? AND role IN ('customer_admin','customer_editor')").bind(status, userId).run();
  if (!result.meta?.changes) throw new ApiError(404, "Customer account not found.");
  if (status === "disabled") await revokeAllUserSessions(db, userId);
  return json({ ok: true, status });
}

function parseJson(value, fallback) {
  try { const parsed = JSON.parse(value || ""); return parsed ?? fallback; } catch { return fallback; }
}
