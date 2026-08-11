import { ApiError, json, readJson } from "./http.js";
import { queueRequestNotification } from "./notifications.js";
import {
  ADMIN_ROLES,
  SESSION_SECONDS,
  createSession,
  getAuthenticatedAdmin,
  hashPassword,
  normalizeUsername,
  revokeSession,
  safeEqual,
  sameOrigin,
  sessionCookie,
  validatePassword,
  verifyPassword,
} from "./security.js";

const LOGIN_BODY_BYTES = 1024;
const TRACK_BODY_BYTES = 1024;
const ADMIN_BODY_BYTES = 32 * 1024;
const MAX_TEXT_LENGTH = 4000;
const MAX_LIST_ITEMS = 50;
const MAX_LIST_ITEM_LENGTH = 240;
const PUBLIC_SETTING_KEYS = [
  "nfc_price",
  "auramenu_self_price",
  "qr_menu_price",
  "web_single_price",
  "web_multi_price",
  "web_dynamic_price",
];
const TRACKABLE_PATHS = new Set([
  "/",
  "/index.html",
  "/services.html",
  "/portfolio.html",
  "/aura-menu.html",
  "/nfc.html",
  "/nfc-builder.html",
  "/nfc-status.html",
  "/qr-menu.html",
  "/packages.html",
  "/about.html",
  "/contact.html",
  "/home",
  "/hizmetler",
  "/nfc",
  "/qr-menu",
  "/paketler",
  "/hakkimizda",
  "/iletisim",
]);


const QUICKSITE_ORIGIN = "https://auradigital-builder.dhiamahouachi115.chatgpt.site";
const QUICKSITE_BODY_BYTES = 96 * 1024;
const AURAMENU_BODY_BYTES = 5 * 1024 * 1024;
const AURAMENU_IMAGE_BYTES = 280 * 1024;
const AURAMENU_IMAGE_DATA_CHARS = Math.ceil((AURAMENU_IMAGE_BYTES * 4) / 3) + 64;
const AURAMENU_MAX_IMAGES = 12;
const AURAMENU_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AURAMENU_ORIGINS = new Set([
  "https://auramenu.space",
  "https://www.auramenu.space",
  "https://dhiaeddine-mahouachi.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);
const NFC_BODY_BYTES = 32 * 1024;
const NFC_CARD_TYPES = new Set(["reviews", "website", "menu"]);
const NFC_CARD_LANGUAGES = new Set(["tr", "en", "ar"]);
const NFC_CARD_FINISHES = new Set(["matte", "glossy"]);
const NFC_META_PREFIX = "__NFC_OPTIONS__";
function parseNfcOptions(value) {
  const text = String(value || "");
  if (!text.startsWith(NFC_META_PREFIX)) return { meta: {}, notes: text };
  const newline = text.indexOf("\n");
  const raw = newline === -1 ? text.slice(NFC_META_PREFIX.length) : text.slice(NFC_META_PREFIX.length, newline);
  return { meta: qsParse(raw, {}), notes: newline === -1 ? "" : text.slice(newline + 1) };
}
function nfcColor(value, fallback) {
  const color = qsClean(value, 7);
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : fallback;
}

function mapNfcRequest(row, publicStatus = false) {
  const parsedNotes = parseNfcOptions(row.notes);
  const meta = parsedNotes.meta;
  const base = {
    id: row.id,
    cardType: row.card_type,
    businessName: row.business_name,
    status: row.status,
    paymentStatus: row.payment_status,
    quantity: row.quantity,
    cardSize: meta.cardSize || "small",
    fontStyle: meta.fontStyle || "modern",
    layoutStyle: meta.layoutStyle || "centered",
    cornerStyle: meta.cornerStyle || "rounded",
    deliveryMethod: meta.deliveryMethod || "pickup",
    deliveryFee: Number(meta.deliveryFee || 0),
    unitPrice: Number(meta.unitPrice || 700),
    total: Number(meta.total || (Number(row.quantity || 1) * 700)),
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    revision: row.revision,
  };
  if (publicStatus) return base;
  return {
    ...base,
    cardLanguage: row.card_language,
    headline: row.headline,
    instructionText: row.instruction_text,
    destinationUrl: row.destination_url,
    backgroundColor: row.background_color,
    accentColor: row.accent_color,
    textColor: row.text_color,
    showQr: Boolean(row.show_qr),
    finish: row.finish,
    quantity: row.quantity,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    email: row.email,
    city: row.city,
    paymentReference: row.payment_reference,
    notes: parsedNotes.notes,
    ownerNote: row.owner_note,
    createdAt: row.created_at,
  };
}

async function createNfcRequest(request, db, env, ctx) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
  const body = await readJson(request, NFC_BODY_BYTES);
  const cardType = qsClean(body.cardType, 20);
  const cardLanguage = qsClean(body.cardLanguage, 5);
  const finish = qsClean(body.finish, 20);
  const businessName = qsClean(body.businessName, 100);
  const contactName = qsClean(body.contactName, 100);
  const contactPhone = qsClean(body.contactPhone, 40);
  const email = qsClean(body.email, 160).toLowerCase();
  const destinationUrl = qsUrl(body.destinationUrl);
  const quantity = Number(body.quantity);
  const cardSize = ["small", "large"].includes(String(body.cardSize)) ? String(body.cardSize) : "small";
  const fontStyle = ["modern", "elegant", "bold"].includes(String(body.fontStyle)) ? String(body.fontStyle) : "modern";
  const layoutStyle = ["centered", "minimal", "split"].includes(String(body.layoutStyle)) ? String(body.layoutStyle) : "centered";
  const cornerStyle = ["rounded", "square"].includes(String(body.cornerStyle)) ? String(body.cornerStyle) : "rounded";
  const deliveryMethod = ["pickup", "delivery", "onsite"].includes(String(body.deliveryMethod)) ? String(body.deliveryMethod) : "pickup";
  const deliveryFee = deliveryMethod === "delivery" ? 60 : deliveryMethod === "onsite" ? 100 : 0;
  const unitPrice = 700;
  const total = quantity * unitPrice + deliveryFee;

  if (!NFC_CARD_TYPES.has(cardType) || !businessName || !contactName || !contactPhone || !destinationUrl) {
    return json({ error: "Kart türü, işletme, hedef bağlantı ve iletişim alanlarını kontrol edin." }, 400, { "Cache-Control": "no-store" });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return json({ error: "Kart adedi 1 ile 100 arasında olmalıdır." }, 400, { "Cache-Control": "no-store" });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Geçerli bir e-posta adresi girin." }, 400, { "Cache-Control": "no-store" });
  }

  const recent = await db.prepare("SELECT id FROM nfc_requests WHERE (contact_phone = ? OR (? <> '' AND email = ?)) AND created_at >= datetime('now','-2 minutes') LIMIT 1")
    .bind(contactPhone, email, email).first();
  if (recent) {
    return json({ error: "Talebiniz alındı. Yeni bir talep göndermeden önce biraz bekleyin." }, 429, { "Cache-Control": "no-store" });
  }

  const id = crypto.randomUUID();
  const nfcMeta = { cardSize, fontStyle, layoutStyle, cornerStyle, deliveryMethod, deliveryFee, unitPrice, total };
  const storedNotes = (NFC_META_PREFIX + JSON.stringify(nfcMeta) + "\n" + qsClean(body.notes, 700)).slice(0, 1000);
  await db.prepare("INSERT INTO nfc_requests (id, card_type, card_language, business_name, headline, instruction_text, destination_url, background_color, accent_color, text_color, show_qr, finish, quantity, contact_name, contact_phone, email, city, payment_reference, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(
      id,
      cardType,
      NFC_CARD_LANGUAGES.has(cardLanguage) ? cardLanguage : "tr",
      businessName,
      qsClean(body.headline, 100),
      qsClean(body.instructionText, 240),
      destinationUrl,
      nfcColor(body.backgroundColor, "#102326"),
      nfcColor(body.accentColor, "#64d7df"),
      nfcColor(body.textColor, "#ffffff"),
      body.showQr === false ? 0 : 1,
      NFC_CARD_FINISHES.has(finish) ? finish : "matte",
      quantity,
      contactName,
      contactPhone,
      email,
      qsClean(body.city, 100),
      qsClean(body.paymentReference, 200),
      storedNotes,
    ).run();
  queueRequestNotification(ctx, env, {
    requestType: "NFC card",
    requestId: id,
    businessName,
    contactName,
    customerEmail: email,
    phone: contactPhone,
    dashboardUrl: new URL("/admin/", request.url).toString(),
    details: [
      ["Card type", cardType],
      ["Quantity", String(quantity)],
      ["Total", `${total} TL`],
    ],
  });
  return json({ request: { id, status: "pending", paymentStatus: "unpaid", total } }, 201, { "Cache-Control": "no-store" });
}

async function getNfcRequestStatus(db, id) {
  const row = await db.prepare("SELECT id, card_type, business_name, status, payment_status, quantity, notes, updated_at, approved_at, revision FROM nfc_requests WHERE id = ? LIMIT 1")
    .bind(id).first();
  if (!row) return json({ error: "NFC kart talebi bulunamadı." }, 404, { "Cache-Control": "no-store" });
  return json({ request: mapNfcRequest(row, true) }, 200, { "Cache-Control": "no-store" });
}

async function handleNfcAdmin(request, db, id) {
  if (request.method === "GET" && !id) {
    const rows = await db.prepare("SELECT * FROM nfc_requests ORDER BY created_at DESC LIMIT 100").all();
    return json({ requests: (rows.results || []).map((row) => mapNfcRequest(row)) }, 200, { "Cache-Control": "no-store" });
  }
  if (request.method !== "PATCH" || !id) return json({ error: "Not found." }, 404);
  const body = await readJson(request, ADMIN_BODY_BYTES);
  const current = await db.prepare("SELECT * FROM nfc_requests WHERE id = ? LIMIT 1").bind(id).first();
  if (!current) return json({ error: "NFC kart talebi bulunamadı." }, 404);
  const status = body.status === undefined ? current.status : String(body.status);
  const payment = body.paymentStatus === undefined ? current.payment_status : String(body.paymentStatus);
  if (!["pending", "approved", "rejected"].includes(status) || !["unpaid", "paid"].includes(payment)) {
    return json({ error: "Geçersiz durum." }, 400);
  }
  if (status === "approved" && payment !== "paid") {
    return json({ error: "Kart tasarımını onaylamadan önce ödemeyi onaylayın." }, 409);
  }
  const ownerNote = body.ownerNote === undefined ? current.owner_note : qsClean(body.ownerNote, 500);
  const now = new Date().toISOString();
  await db.prepare("UPDATE nfc_requests SET status = ?, payment_status = ?, owner_note = ?, updated_at = ?, approved_at = ?, revision = revision + 1 WHERE id = ?")
    .bind(status, payment, ownerNote, now, status === "approved" ? (current.approved_at || now) : null, id).run();
  const updated = await db.prepare("SELECT * FROM nfc_requests WHERE id = ? LIMIT 1").bind(id).first();
  return json({ request: mapNfcRequest(updated) }, 200, { "Cache-Control": "no-store" });
}
async function proxyQuickSite(request, url) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return json({ error: "Method not allowed." }, 405, { Allow: "GET, HEAD" });
  }
  const upstreamPath = url.pathname.startsWith("/quicksite") ? (url.pathname.slice("/quicksite".length) || "/") : url.pathname;
  const target = new URL(upstreamPath + url.search, QUICKSITE_ORIGIN);
  const requestHeaders = new Headers(request.headers);
  [
    "Authorization",
    "Cookie",
    "CF-Connecting-IP",
    "CF-IPCountry",
    "CF-Ray",
    "Origin",
    "Proxy-Authorization",
    "Referer",
    "X-Forwarded-For",
    "X-Real-IP",
  ].forEach((name) => requestHeaders.delete(name));
  let upstream;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: requestHeaders,
      redirect: "follow",
    });
  } catch {
    return json({ error: "QuickSite is temporarily unavailable." }, 502);
  }
  const headers = new Headers(upstream.headers);
  headers.delete("Set-Cookie");
  headers.delete("Set-Cookie2");
  headers.delete("Server");
  headers.delete("X-Powered-By");
  headers.delete("Report-To");
  headers.delete("NEL");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.set("X-Permitted-Cross-Domain-Policies", "none");
  if ((headers.get("Content-Type") || "").includes("text/html")) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self'; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
  }
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}
function qsClean(value, max = 500) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function qsUrl(value) {
  const text = qsClean(value, 800);
  if (!text) return "";
  try { const parsed = new URL(text); return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : ""; } catch { return ""; }
}
function qsSlug(value) {
  return String(value || "").toLocaleLowerCase("tr")
    .replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u")
    .replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function qsParse(value, fallback) { try { return JSON.parse(value); } catch { return fallback; } }
function mapQuickSite(row) {
  const details = qsParse(row.details_json, {});
  return {
    id: row.id, slug: row.slug, templateId: row.template_id, language: row.language,
    businessName: row.business_name, tagline: row.tagline, description: row.description,
    primaryColor: row.primary_color, phone: row.phone, whatsapp: row.whatsapp, email: row.email,
    address: row.address, contactName: row.contact_name, offers: qsParse(row.offers_json, []),
    industry: String(details.industry || ""), eyebrow: String(details.eyebrow || ""),
    aboutTitle: String(details.aboutTitle || ""), primaryCta: String(details.primaryCta || ""),
    workingHours: String(details.workingHours || ""), instagram: String(details.instagram || ""),
    mapUrl: String(details.mapUrl || ""), logoUrl: String(details.logoUrl || ""),
    heroImageUrl: String(details.heroImageUrl || ""),
    galleryUrls: Array.isArray(details.galleryUrls) ? details.galleryUrls : [],
    benefits: Array.isArray(details.benefits) ? details.benefits : [],
    requestMessage: String(details.requestMessage || ""), paymentStatus: row.payment_status,
    status: row.status, ownerNote: row.owner_note, createdAt: row.created_at,
    updatedAt: row.updated_at, approvedAt: row.approved_at, revision: row.revision,
  };
}
function mapQuickSitePublic(row, includeRequestState = false) {
  const project = mapQuickSite(row);
  const safeProject = {
    slug: project.slug,
    templateId: project.templateId,
    language: project.language,
    businessName: project.businessName,
    tagline: project.tagline,
    description: project.description,
    primaryColor: project.primaryColor,
    phone: project.phone,
    whatsapp: project.whatsapp,
    email: project.email,
    address: project.address,
    offers: project.offers,
    industry: project.industry,
    eyebrow: project.eyebrow,
    aboutTitle: project.aboutTitle,
    primaryCta: project.primaryCta,
    workingHours: project.workingHours,
    instagram: project.instagram,
    mapUrl: project.mapUrl,
    logoUrl: project.logoUrl,
    heroImageUrl: project.heroImageUrl,
    galleryUrls: project.galleryUrls,
    benefits: project.benefits,
  };
  if (includeRequestState) {
    safeProject.id = project.id;
    safeProject.status = project.status;
    safeProject.updatedAt = project.updatedAt;
  }
  return safeProject;
}
async function createQuickSiteRequest(request, db, env, ctx) {
  if (!sameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }
  const body = await readJson(request, QUICKSITE_BODY_BYTES);
  const businessName = qsClean(body.businessName, 100);
  const email = qsClean(body.email, 160);
  const contactName = qsClean(body.contactName, 100);
  const templateId = qsClean(body.templateId, 30);
  if (!businessName || !email || !contactName || !["nova-menu", "espresso", "local-pro", "mono-portfolio"].includes(templateId)) {
    return json({ error: "Gerekli alanları kontrol edin." }, 400);
  }
  let slug = qsSlug(qsClean(body.slug, 60) || businessName) || "site-" + crypto.randomUUID().slice(0, 6);
  const existing = await db.prepare("SELECT id FROM quicksite_projects WHERE slug = ? LIMIT 1").bind(slug).first();
  if (existing) slug += "-" + crypto.randomUUID().slice(0, 4);
  const offers = Array.isArray(body.offers) ? body.offers.slice(0, 12).map((item) => ({
    name: qsClean(item && item.name, 100), description: qsClean(item && item.description, 240), price: qsClean(item && item.price, 40),
  })) : [];
  const details = {
    industry: qsClean(body.industry, 80), eyebrow: qsClean(body.eyebrow, 100),
    aboutTitle: qsClean(body.aboutTitle, 160), primaryCta: qsClean(body.primaryCta, 60),
    workingHours: qsClean(body.workingHours, 100), instagram: qsClean(body.instagram, 100),
    mapUrl: qsUrl(body.mapUrl), logoUrl: qsUrl(body.logoUrl), heroImageUrl: qsUrl(body.heroImageUrl),
    galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls.slice(0, 6).map(qsUrl).filter(Boolean) : [],
    benefits: Array.isArray(body.benefits) ? body.benefits.slice(0, 6).map((item) => qsClean(item, 100)).filter(Boolean) : [],
    requestMessage: qsClean(body.requestMessage, 1000),
  };
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO quicksite_projects (id, slug, template_id, language, business_name, tagline, description, primary_color, phone, whatsapp, email, address, contact_name, offers_json, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, slug, templateId, ["tr", "en", "ar"].includes(String(body.language)) ? body.language : "tr", businessName, qsClean(body.tagline, 140), qsClean(body.description, 600), /^#[0-9a-fA-F]{6}$/.test(String(body.primaryColor)) ? String(body.primaryColor) : "#a3ff12", qsClean(body.phone, 40), qsClean(body.whatsapp, 40), email, qsClean(body.address, 200), contactName, JSON.stringify(offers), JSON.stringify(details)).run();
  queueRequestNotification(ctx, env, {
    requestType: "QuickSite",
    requestId: id,
    businessName,
    contactName,
    customerEmail: email,
    phone: qsClean(body.phone, 40),
    dashboardUrl: new URL("/admin/", request.url).toString(),
    details: [
      ["Template", templateId],
      ["Requested address", slug],
    ],
  });
  return json({ project: { id, slug, status: "pending" } }, 201, { "Cache-Control": "no-store" });
}
async function getQuickSiteProject(db, key, value, approvedOnly = false) {
  const row = await db.prepare("SELECT * FROM quicksite_projects WHERE " + key + " = ?" + (approvedOnly ? " AND status = 'approved'" : "") + " LIMIT 1").bind(value).first();
  return row
    ? json({ project: mapQuickSitePublic(row, !approvedOnly) }, 200, { "Cache-Control": approvedOnly ? "public, max-age=60" : "no-store" })
    : json({ error: "Not found." }, 404);
}
async function handleQuickSiteAdmin(request, db, id) {
  if (request.method === "GET" && !id) {
    const rows = await db.prepare("SELECT * FROM quicksite_projects ORDER BY created_at DESC LIMIT 100").all();
    return json({ projects: (rows.results || []).map(mapQuickSite) }, 200, { "Cache-Control": "no-store" });
  }
  if (request.method !== "PATCH" || !id) return json({ error: "Not found." }, 404);
  const body = await readJson(request, ADMIN_BODY_BYTES);
  const current = await db.prepare("SELECT * FROM quicksite_projects WHERE id = ? LIMIT 1").bind(id).first();
  if (!current) return json({ error: "Talep bulunamadı." }, 404);
  const status = body.status === undefined ? current.status : String(body.status);
  const payment = body.paymentStatus === undefined ? current.payment_status : String(body.paymentStatus);
  if (!["pending", "approved", "rejected"].includes(status) || !["unpaid", "paid"].includes(payment)) return json({ error: "Geçersiz durum." }, 400);
  if (status === "approved" && payment !== "paid") return json({ error: "Yayına almadan önce ödemeyi onaylayın." }, 409);
  const ownerNote = body.ownerNote === undefined ? current.owner_note : qsClean(body.ownerNote, 500);
  const now = new Date().toISOString();
  await db.prepare("UPDATE quicksite_projects SET status = ?, payment_status = ?, owner_note = ?, updated_at = ?, approved_at = ?, revision = revision + 1 WHERE id = ?")
    .bind(status, payment, ownerNote, now, status === "approved" ? (current.approved_at || now) : null, id).run();
  const updated = await db.prepare("SELECT * FROM quicksite_projects WHERE id = ? LIMIT 1").bind(id).first();
  return json({ project: mapQuickSite(updated) }, 200, { "Cache-Control": "no-store" });
}

function auraMenuCors(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return {};
  if (!AURAMENU_ORIGINS.has(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function normalizeAuraMenuCategories(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new ApiError(400, "Menüde 1 ile 12 arasında kategori olmalıdır.");
  }
  let itemCount = 0;
  const categories = value.map((category, categoryIndex) => {
    if (!category || typeof category !== "object" || Array.isArray(category)) {
      throw new ApiError(400, `Kategori ${categoryIndex + 1} geçersiz.`);
    }
    const name = qsClean(category.name, 80);
    if (!name) throw new ApiError(400, `Kategori ${categoryIndex + 1} için isim girin.`);
    const rawItems = Array.isArray(category.items) ? category.items : [];
    if (rawItems.length > 20) throw new ApiError(400, "Bir kategoride en fazla 20 ürün olabilir.");
    const items = rawItems.map((item, itemIndex) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new ApiError(400, `${name} kategorisindeki ${itemIndex + 1}. ürün geçersiz.`);
      }
      const itemName = qsClean(item.name, 100);
      if (!itemName) throw new ApiError(400, `${name} kategorisindeki ürün adını girin.`);
      const imageData = typeof item.imageData === "string" ? item.imageData.trim() : "";
      if (imageData.length > AURAMENU_IMAGE_DATA_CHARS) {
        throw new ApiError(413, "Ürün fotoğrafı çok büyük. Lütfen daha küçük bir fotoğraf seçin.");
      }
      itemCount += 1;
      return {
        name: itemName,
        description: qsClean(item.description, 300),
        price: qsClean(item.price, 40),
        imageUrl: qsUrl(item.imageUrl),
        imageData,
        featured: Boolean(item.featured),
      };
    });
    return { name, emoji: qsClean(category.emoji, 12), items };
  });
  if (itemCount < 1 || itemCount > 100) {
    throw new ApiError(400, "Menüde 1 ile 100 arasında ürün olmalıdır.");
  }
  return categories;
}

function hasBytes(bytes, expected, offset = 0) {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function decodeAuraMenuImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(dataUrl);
  if (!match) {
    throw new ApiError(400, "Yalnızca JPG, PNG veya WebP ürün fotoğrafı yükleyebilirsiniz.");
  }
  const contentType = match[1].toLowerCase();
  const encoded = match[2];
  if (!AURAMENU_IMAGE_TYPES.has(contentType) || !encoded || encoded.length % 4 !== 0) {
    throw new ApiError(400, "Ürün fotoğrafı geçersiz.");
  }
  let binary;
  try {
    binary = atob(encoded);
  } catch {
    throw new ApiError(400, "Ürün fotoğrafı geçersiz.");
  }
  if (!binary.length || binary.length > AURAMENU_IMAGE_BYTES) {
    throw new ApiError(413, "Ürün fotoğrafı çok büyük. Lütfen daha küçük bir fotoğraf seçin.");
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const valid =
    (contentType === "image/jpeg" && hasBytes(bytes, [0xff, 0xd8, 0xff])) ||
    (contentType === "image/png" && hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) ||
    (contentType === "image/webp" &&
      hasBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
      hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8));
  if (!valid) throw new ApiError(400, "Ürün fotoğrafı içeriği geçersiz.");
  return { contentType, bytes: bytes.buffer };
}

function prepareAuraMenuImages(categories, requestId, origin) {
  const images = [];
  for (const category of categories) {
    for (const item of category.items) {
      const dataUrl = item.imageData;
      delete item.imageData;
      if (!dataUrl) continue;
      if (images.length >= AURAMENU_MAX_IMAGES) {
        throw new ApiError(400, "Bir menü talebine en fazla 12 ürün fotoğrafı ekleyebilirsiniz.");
      }
      const image = decodeAuraMenuImage(dataUrl);
      const id = crypto.randomUUID();
      item.imageUrl = `${origin}/api/auramenu/images/${id}`;
      images.push({ id, requestId, ...image });
    }
  }
  return images;
}

function mapAuraMenuRequest(row, publicSite = false) {
  const base = {
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
    categories: qsParse(row.categories_json, []),
    status: row.status,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    revision: row.revision,
  };
  if (publicSite) return base;
  return {
    ...base,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    email: row.email,
    city: row.city,
    paymentReference: row.payment_reference,
    notes: row.notes,
    paymentStatus: row.payment_status,
    ownerNote: row.owner_note,
    createdAt: row.created_at,
  };
}

async function createAuraMenuRequest(request, db, corsHeaders, env, ctx) {
  const body = await readJson(request, AURAMENU_BODY_BYTES);
  const templateId = qsClean(body.templateId, 30);
  const businessName = qsClean(body.businessName, 100);
  const contactName = qsClean(body.contactName, 100);
  const contactPhone = qsClean(body.contactPhone, 40);
  const email = qsClean(body.email, 160).toLowerCase();
  const allowedTemplates = ["modern", "orbit", "maison", "taste3d"];
  if (!allowedTemplates.includes(templateId) || !businessName || !contactName || !contactPhone) {
    return json({ error: "İşletme, yetkili, telefon ve tasarım alanlarını kontrol edin." }, 400, corsHeaders);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Geçerli bir e-posta adresi girin." }, 400, corsHeaders);
  }
  const categories = normalizeAuraMenuCategories(body.categories);
  const serviceMode = body.serviceMode === "managed" ? "managed" : "self";
  const optionSummary = [
    "[AURAMENU OPTIONS]",
    "Build: " + (serviceMode === "managed" ? "AuraDigital managed" : "Customer self-service"),
    "",
    qsClean(body.notes, 750),
  ].join("\n").slice(0, 1000);
  const requestedSlug = qsSlug(qsClean(body.slug, 60) || businessName);
  if (requestedSlug.length < 3) return json({ error: "En az 3 karakterli bir menü adresi seçin." }, 400, corsHeaders);

  const duplicate = await db.prepare("SELECT id FROM auramenu_requests WHERE slug = ? LIMIT 1").bind(requestedSlug).first();
  if (duplicate) return json({ error: "Bu menü adresi kullanılıyor. Başka bir adres seçin." }, 409, corsHeaders);
  const recent = await db.prepare("SELECT id FROM auramenu_requests WHERE (contact_phone = ? OR (? <> '' AND email = ?)) AND created_at >= datetime('now','-2 minutes') LIMIT 1")
    .bind(contactPhone, email, email).first();
  if (recent) return json({ error: "Talebiniz alındı. Yeni bir talep göndermeden önce biraz bekleyin." }, 429, corsHeaders);

  const id = crypto.randomUUID();
  const images = prepareAuraMenuImages(categories, id, new URL(request.url).origin);
  const requestInsert = db.prepare("INSERT INTO auramenu_requests (id, slug, template_id, interface_language, menu_language, business_name, tagline, description, address, business_phone, whatsapp, opening_hours, currency, contact_name, contact_phone, email, city, payment_reference, categories_json, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(
      id,
      requestedSlug,
      templateId,
      ["tr", "en", "ar"].includes(String(body.interfaceLanguage)) ? body.interfaceLanguage : "tr",
      ["tr", "en", "ar"].includes(String(body.menuLanguage)) ? body.menuLanguage : "tr",
      businessName,
      qsClean(body.tagline, 140),
      qsClean(body.description, 600),
      qsClean(body.address, 220),
      qsClean(body.businessPhone, 40),
      qsClean(body.whatsapp, 40),
      qsClean(body.openingHours, 100),
      ["TRY", "EUR", "USD", "TND"].includes(String(body.currency)) ? body.currency : "TRY",
      contactName,
      contactPhone,
      email,
      qsClean(body.city, 100),
      qsClean(body.paymentReference, 200),
      JSON.stringify(categories),
      optionSummary,
    );
  const imageInserts = images.map((image) =>
    db.prepare("INSERT INTO auramenu_images (id, request_id, content_type, image_bytes) VALUES (?, ?, ?, ?)")
      .bind(image.id, image.requestId, image.contentType, image.bytes),
  );
  await db.batch([requestInsert, ...imageInserts]);
  queueRequestNotification(ctx, env, {
    requestType: "AuraMenu",
    requestId: id,
    businessName,
    contactName,
    customerEmail: email,
    phone: contactPhone,
    dashboardUrl: new URL("/admin/", request.url).toString(),
    details: [
      ["Build option", serviceMode === "managed" ? "AuraDigital builds it" : "Customer self-build"],
      ["Template", templateId],
      ["Requested address", requestedSlug],
    ],
  });
  return json({ request: { id, slug: requestedSlug, status: "pending", paymentStatus: "unpaid" } }, 201, {
    "Cache-Control": "no-store",
    ...corsHeaders,
  });
}

async function getAuraMenuImage(db, id, corsHeaders) {
  const row = await db.prepare("SELECT i.content_type, i.image_bytes FROM auramenu_images i INNER JOIN auramenu_requests r ON r.id = i.request_id WHERE i.id = ? LIMIT 1")
    .bind(id).first();
  if (!row) return json({ error: "Fotoğraf bulunamadı." }, 404, corsHeaders);
  let imageBytes = null;
  if (row.image_bytes instanceof ArrayBuffer) imageBytes = row.image_bytes;
  else if (ArrayBuffer.isView(row.image_bytes)) {
    imageBytes = row.image_bytes.buffer.slice(
      row.image_bytes.byteOffset,
      row.image_bytes.byteOffset + row.image_bytes.byteLength,
    );
  } else if (Array.isArray(row.image_bytes)) imageBytes = Uint8Array.from(row.image_bytes).buffer;
  if (!imageBytes || !AURAMENU_IMAGE_TYPES.has(row.content_type)) {
    return json({ error: "Fotoğraf okunamadı." }, 500, corsHeaders);
  }
  return new Response(imageBytes, {
    headers: {
      "Content-Type": row.content_type,
      "Content-Length": String(imageBytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders,
    },
  });
}

async function getAuraMenuRequestStatus(request, db, id, corsHeaders) {
  const row = await db.prepare("SELECT id, slug, template_id, business_name, status, payment_status, updated_at, approved_at FROM auramenu_requests WHERE id = ? LIMIT 1").bind(id).first();
  if (!row) return json({ error: "Talep bulunamadı." }, 404, corsHeaders);
  return json({
    request: {
      id: row.id,
      slug: row.slug,
      templateId: row.template_id,
      businessName: row.business_name,
      status: row.status,
      paymentStatus: row.payment_status,
      updatedAt: row.updated_at,
      approvedAt: row.approved_at,
    },
  }, 200, { "Cache-Control": "no-store", ...corsHeaders });
}

async function getPublishedAuraMenu(request, db, slug, corsHeaders) {
  const row = await db.prepare("SELECT * FROM auramenu_requests WHERE slug = ? AND status = 'approved' LIMIT 1").bind(slug).first();
  if (!row) return json({ error: "Menü henüz yayında değil." }, 404, corsHeaders);
  return json({ menu: mapAuraMenuRequest(row, true) }, 200, {
    "Cache-Control": "public, max-age=30",
    ...corsHeaders,
  });
}

async function handleAuraMenuAdmin(request, db, id) {
  if (request.method === "GET" && !id) {
    const rows = await db.prepare("SELECT * FROM auramenu_requests ORDER BY created_at DESC LIMIT 100").all();
    return json({ requests: (rows.results || []).map((row) => mapAuraMenuRequest(row)) }, 200, { "Cache-Control": "no-store" });
  }
  if (request.method !== "PATCH" || !id) return json({ error: "Not found." }, 404);
  const body = await readJson(request, ADMIN_BODY_BYTES);
  const current = await db.prepare("SELECT * FROM auramenu_requests WHERE id = ? LIMIT 1").bind(id).first();
  if (!current) return json({ error: "Menü talebi bulunamadı." }, 404);
  const status = body.status === undefined ? current.status : String(body.status);
  const payment = body.paymentStatus === undefined ? current.payment_status : String(body.paymentStatus);
  if (!["pending", "approved", "rejected"].includes(status) || !["unpaid", "paid"].includes(payment)) {
    return json({ error: "Geçersiz durum." }, 400);
  }
  if (status === "approved" && payment !== "paid") {
    return json({ error: "Menüyü yayınlamadan önce ödemeyi onaylayın." }, 409);
  }
  const ownerNote = body.ownerNote === undefined ? current.owner_note : qsClean(body.ownerNote, 500);
  const now = new Date().toISOString();
  await db.prepare("UPDATE auramenu_requests SET status = ?, payment_status = ?, owner_note = ?, updated_at = ?, approved_at = ?, revision = revision + 1 WHERE id = ?")
    .bind(status, payment, ownerNote, now, status === "approved" ? (current.approved_at || now) : null, id).run();
  const updated = await db.prepare("SELECT * FROM auramenu_requests WHERE id = ? LIMIT 1").bind(id).first();
  return json({ request: mapAuraMenuRequest(updated) }, 200, { "Cache-Control": "no-store" });
}

const RESOURCES = {
  packages: {
    table: "packages",
    fields: ["name", "description", "monthly_price", "weekly_price", "features", "featured", "active", "sort_order"],
    json: new Set(["features"]),
    numeric: new Set(["monthly_price", "weekly_price", "featured", "active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  services: {
    table: "services",
    fields: ["icon", "name", "description", "tags", "active", "sort_order"],
    json: new Set(["tags"]),
    numeric: new Set(["active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  portfolio: {
    table: "portfolio",
    fields: ["slug", "title", "type", "description", "image", "url", "tags", "active", "sort_order"],
    json: new Set(["tags"]),
    numeric: new Set(["active", "sort_order"]),
    order: "sort_order ASC, id ASC",
  },
  clients: {
    table: "clients",
    fields: ["name", "company", "email", "phone", "service", "status", "renewal_date", "notes"],
    json: new Set(),
    numeric: new Set(),
    order: "created_at DESC, id DESC",
  },
  orders: {
    table: "orders",
    fields: ["client_id", "type", "quantity", "amount", "status", "due_date", "notes"],
    json: new Set(),
    numeric: new Set(["client_id", "quantity", "amount"]),
    order: "created_at DESC, id DESC",
  },
  invoices: {
    table: "invoices",
    fields: ["client_id", "invoice_number", "amount", "status", "due_date", "notes"],
    json: new Set(),
    numeric: new Set(["client_id", "amount"]),
    order: "created_at DESC, id DESC",
  },
  subscriptions: {
    table: "subscriptions",
    fields: ["client_id", "plan", "amount", "interval", "status", "next_billing_date"],
    json: new Set(),
    numeric: new Set(["client_id", "amount"]),
    order: "created_at DESC, id DESC",
  },
  expenses: {
    table: "expenses",
    fields: ["category", "description", "amount", "date", "notes"],
    json: new Set(),
    numeric: new Set(["amount"]),
    order: "date DESC, id DESC",
  },
};

let schemaReady = false;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/quicksite" || url.pathname.startsWith("/quicksite/") || url.pathname.startsWith("/_next/") || url.pathname.startsWith("/assets/") || url.pathname === "/api/projects") return proxyQuickSite(request, url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    try {
      await ensureSchema(env.DB);

      if (url.pathname === "/api/quicksite/projects" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
        const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
        const limit = await env.TRACK_RATE_LIMITER.limit({ key: `quicksite-request:${clientKey}` });
        if (!limit.success) return json({ error: "Çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin." }, 429);
        return await createQuickSiteRequest(request, env.DB, env, ctx);
      }

      if (url.pathname === "/api/nfc/requests" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
        const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
        const limit = await env.TRACK_RATE_LIMITER.limit({ key: `nfc-request:${clientKey}` });
        if (!limit.success) return json({ error: "Çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin." }, 429, { "Cache-Control": "no-store" });
        return await createNfcRequest(request, env.DB, env, ctx);
      }

      const nfcStatus = url.pathname.match(/^\/api\/nfc\/requests\/([a-f0-9-]+)$/i);
      if (nfcStatus && request.method === "GET") {
        return await getNfcRequestStatus(env.DB, nfcStatus[1]);
      }

      if (url.pathname.startsWith("/api/auramenu/")) {
        const corsHeaders = auraMenuCors(request);
        if (corsHeaders === null) return json({ error: "Bu kaynaktan talep kabul edilmiyor." }, 403);
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

        if (url.pathname === "/api/auramenu/pricing" && request.method === "GET") {
          const settings = await getPublicSettings(env.DB);
          const selfBuildPrice = Number(settings.auramenu_self_price);
          const managedBuildPrice = Number(settings.qr_menu_price);
          return json({
            selfBuildPrice: Number.isFinite(selfBuildPrice) && selfBuildPrice > 0 ? selfBuildPrice : 1599,
            managedBuildPrice: Number.isFinite(managedBuildPrice) && managedBuildPrice > 0 ? managedBuildPrice : 2500,
            currency: "TRY",
          }, 200, {
            ...corsHeaders,
            "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
          });
        }

        if (url.pathname === "/api/auramenu/requests" && request.method === "POST") {
          const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
          const limit = await env.TRACK_RATE_LIMITER.limit({ key: `auramenu-request:${clientKey}` });
          if (!limit.success) return json({ error: "Çok fazla talep gönderildi. Lütfen biraz sonra tekrar deneyin." }, 429, corsHeaders);
          return await createAuraMenuRequest(request, env.DB, corsHeaders, env, ctx);
        }

        const auraMenuImage = url.pathname.match(/^\/api\/auramenu\/images\/([a-f0-9-]+)$/i);
        if (auraMenuImage && request.method === "GET") {
          return await getAuraMenuImage(env.DB, auraMenuImage[1], corsHeaders);
        }

        const auraMenuStatus = url.pathname.match(/^\/api\/auramenu\/requests\/([a-f0-9-]+)$/i);
        if (auraMenuStatus && request.method === "GET") {
          return await getAuraMenuRequestStatus(request, env.DB, auraMenuStatus[1], corsHeaders);
        }

        const publishedAuraMenu = url.pathname.match(/^\/api\/auramenu\/sites\/([a-z0-9-]+)$/);
        if (publishedAuraMenu && request.method === "GET") {
          return await getPublishedAuraMenu(request, env.DB, publishedAuraMenu[1], corsHeaders);
        }
      }

      const quickPreview = url.pathname.match(/^\/api\/quicksite\/projects\/([a-f0-9-]+)$/i);
      if (quickPreview && request.method === "GET") return await getQuickSiteProject(env.DB, "id", quickPreview[1]);

      const quickPublic = url.pathname.match(/^\/api\/quicksite\/sites\/([a-z0-9-]+)$/);
      if (quickPublic && request.method === "GET") return await getQuickSiteProject(env.DB, "slug", quickPublic[1], true);

      if (url.pathname === "/api/settings" && request.method === "GET") {
        return json(await getPublicSettings(env.DB), 200, { "Cache-Control": "public, max-age=30" });
      }

      if (url.pathname === "/api/public-content" && request.method === "GET") {
        const [settings, packages, services, portfolio] = await Promise.all([
          getPublicSettings(env.DB),
          listPublic(env.DB, "packages"),
          listPublic(env.DB, "services"),
          listPublic(env.DB, "portfolio"),
        ]);
        return json({ settings, packages, services, portfolio }, 200, {
          "Cache-Control": "public, max-age=30",
        });
      }

      if (url.pathname === "/api/track" && request.method === "POST") {
        if (!sameOrigin(request)) return new Response(null, { status: 204 });
        const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
        const limit = await env.TRACK_RATE_LIMITER.limit({ key: `site-track:${clientKey}` });
        if (!limit.success) return new Response(null, { status: 204 });
        const body = await readJson(request, TRACK_BODY_BYTES);
        const path = cleanPath(body.path);
        if (path) {
          await env.DB.prepare(
            "INSERT INTO analytics_daily (date, path, views) VALUES (date('now'), ?, 1) " +
            "ON CONFLICT(date, path) DO UPDATE SET views = views + 1"
          ).bind(path).run();
        }
        return new Response(null, { status: 204 });
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
        const body = await readJson(request, LOGIN_BODY_BYTES);
        const username = normalizeUsername(body.username || "owner");
        const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
        const limit = await env.LOGIN_RATE_LIMITER.limit({ key: `admin-login:${clientKey}:${username || "invalid"}` });
        if (!limit.success) {
          return json({ error: "Too many sign-in attempts. Try again in one minute." }, 429, {
            "Cache-Control": "no-store",
            "Retry-After": "60",
          });
        }
        if (!username) return json({ error: "Incorrect username or password." }, 401, { "Cache-Control": "no-store" });

        let admin = await findAdminByUsername(env.DB, username);
        if (!admin) {
          admin = await bootstrapOwner(env.DB, env, username, String(body.password || ""));
        }

        if (!admin || !admin.active || !(await verifyPassword(String(body.password || ""), admin.password_hash))) {
          await auditAction(env.DB, null, "login_failed", "authentication", username, request);
          return json({ error: "Incorrect username or password." }, 401, { "Cache-Control": "no-store" });
        }

        await env.DB.batch([
          env.DB.prepare("UPDATE admin_users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").bind(admin.id),
          env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= datetime('now')"),
        ]);
        const token = await createSession(env.DB, admin.id);
        const sessionAdmin = publicAdmin(admin);
        await auditAction(env.DB, sessionAdmin, "login_succeeded", "authentication", admin.id, request);
        return json({ ok: true, user: sessionAdmin }, 200, {
          "Cache-Control": "no-store",
          "Set-Cookie": sessionCookie(token, SESSION_SECONDS),
        });
      }

      if (url.pathname === "/api/admin/logout" && request.method === "POST") {
        if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403, { "Cache-Control": "no-store" });
        const admin = await getAuthenticatedAdmin(request, env.DB);
        await revokeSession(request, env.DB);
        if (admin) await auditAction(env.DB, admin, "logout", "authentication", admin.id, request);
        return json({ ok: true }, 200, {
          "Cache-Control": "no-store",
          "Set-Cookie": sessionCookie("", 0),
        });
      }

      if (url.pathname === "/api/admin/session" && request.method === "GET") {
        const admin = await getAuthenticatedAdmin(request, env.DB);
        return json({ authenticated: Boolean(admin), user: admin }, 200, { "Cache-Control": "no-store" });
      }

      const admin = await getAuthenticatedAdmin(request, env.DB);
      if (!admin) {
        return json({ error: "Unauthorized." }, 401, { "Cache-Control": "no-store" });
      }

      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !sameOrigin(request)) {
        return json({ error: "Invalid request origin." }, 403);
      }

      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && admin.role === "viewer") {
        return json({ error: "This account has read-only access." }, 403);
      }

      const adminUserMatch = url.pathname.match(/^\/api\/admin\/users(?:\/([a-f0-9-]+))?$/i);
      if (adminUserMatch) {
        if (admin.role !== "owner") return json({ error: "Owner access is required." }, 403);
        return await handleAdminUsers(request, env.DB, admin, adminUserMatch[1] || null);
      }

      if (url.pathname === "/api/admin/audit-logs" && request.method === "GET") {
        if (admin.role !== "owner") return json({ error: "Owner access is required." }, 403);
        const rows = await env.DB.prepare(
          "SELECT id, username_snapshot AS username, action, resource, target_id AS targetId, request_id AS requestId, created_at AS createdAt " +
          "FROM admin_audit_log ORDER BY created_at DESC LIMIT 150"
        ).all();
        return json({ items: rows.results || [] }, 200, { "Cache-Control": "no-store" });
      }

      const quickAdmin = url.pathname.match(/^\/api\/admin\/quicksite(?:\/([a-f0-9-]+))?$/i);
      if (quickAdmin) {
        const response = await handleQuickSiteAdmin(request, env.DB, quickAdmin[1] || null);
        await auditAdminResponse(response, request, env.DB, admin, "quicksite", quickAdmin[1] || "collection");
        return response;
      }

      const auraMenuAdmin = url.pathname.match(/^\/api\/admin\/auramenu(?:\/([a-f0-9-]+))?$/i);
      if (auraMenuAdmin) {
        const response = await handleAuraMenuAdmin(request, env.DB, auraMenuAdmin[1] || null);
        await auditAdminResponse(response, request, env.DB, admin, "auramenu", auraMenuAdmin[1] || "collection");
        return response;
      }

      const nfcAdmin = url.pathname.match(/^\/api\/admin\/nfc(?:\/([a-f0-9-]+))?$/i);
      if (nfcAdmin) {
        const response = await handleNfcAdmin(request, env.DB, nfcAdmin[1] || null);
        await auditAdminResponse(response, request, env.DB, admin, "nfc", nfcAdmin[1] || "collection");
        return response;
      }

      if (url.pathname === "/api/admin/overview" && request.method === "GET") {
        return json(await getOverview(env.DB), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/analytics" && request.method === "GET") {
        return json(await getAnalytics(env.DB), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/api/admin/settings" && request.method === "GET") {
        const rows = await env.DB.prepare("SELECT key, value, updated_at FROM settings ORDER BY key").all();
        return json({ settings: rows.results || [] }, 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname.startsWith("/api/admin/settings/") && request.method === "PUT") {
        const key = decodeURIComponent(url.pathname.slice("/api/admin/settings/".length));
        if (!PUBLIC_SETTING_KEYS.includes(key)) return json({ error: "Unknown setting." }, 404);
        const body = await readJson(request, ADMIN_BODY_BYTES);
        const value = String(body.value ?? "").trim();
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0 || amount > 10000000) {
          return json({ error: "Enter a valid price." }, 400);
        }
        await env.DB.prepare(
          "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
          "ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')"
        ).bind(key, String(Math.round(amount))).run();
        await auditAction(env.DB, admin, "update", "settings", key, request);
        return json({ ok: true, key, value: String(Math.round(amount)) }, 200, { "Cache-Control": "no-store" });
      }

      const match = url.pathname.match(/^\/api\/admin\/(packages|services|portfolio|clients|orders|invoices|subscriptions|expenses)(?:\/(\d+))?$/);
      if (match) {
        const [, resource, idText] = match;
        const response = await handleResource(request, env.DB, resource, idText ? Number(idText) : null);
        await auditAdminResponse(response, request, env.DB, admin, resource, idText || "collection");
        return response;
      }

      return json({ error: "Not found." }, 404);
    } catch (error) {
      const publicCors = url.pathname.startsWith("/api/auramenu/") ? auraMenuCors(request) : {};
      const corsHeaders = publicCors && publicCors !== null ? publicCors : {};
      if (error instanceof ApiError) {
        return json({ error: error.message }, error.status, {
          "Cache-Control": "no-store",
          ...corsHeaders,
          ...error.headers,
        });
      }
      console.error(JSON.stringify({
        message: "AuraDigital API error",
        path: url.pathname,
        error: error instanceof Error ? error.message : String(error),
      }));
      return json({ error: "Server error." }, 500, corsHeaders);
    }
  },
};

async function findAdminByUsername(db, username) {
  return db.prepare(
    "SELECT id, username, display_name, password_hash, role, active, created_at, updated_at, last_login_at " +
    "FROM admin_users WHERE username = ? COLLATE NOCASE LIMIT 1"
  ).bind(username).first();
}

async function bootstrapOwner(db, env, username, password) {
  const count = await db.prepare("SELECT COUNT(*) AS value FROM admin_users").first();
  if (Number(count?.value || 0) !== 0 || username !== "owner" || !env.ADMIN_PASSWORD) return null;
  if (!(await safeEqual(password, env.ADMIN_PASSWORD))) return null;

  let passwordHash;
  try {
    passwordHash = await hashPassword(password);
  } catch {
    throw new ApiError(503, "ADMIN_PASSWORD must contain at least 12 characters before the owner account can be created.");
  }

  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO admin_users (id, username, display_name, password_hash, role, active) VALUES (?, 'owner', 'AuraDigital Owner', ?, 'owner', 1)"
  ).bind(id, passwordHash).run();
  return findAdminByUsername(db, "owner");
}

function publicAdmin(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName || row.display_name,
    role: row.role,
    active: row.active === undefined ? true : Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

async function handleAdminUsers(request, db, actor, id) {
  if (request.method === "GET" && !id) {
    const rows = await db.prepare(
      "SELECT id, username, display_name, role, active, created_at, updated_at, last_login_at " +
      "FROM admin_users ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'manager' THEN 1 ELSE 2 END, username"
    ).all();
    return json({ items: (rows.results || []).map(publicAdmin) }, 200, { "Cache-Control": "no-store" });
  }

  if (request.method === "POST" && !id) {
    const body = await readJson(request, ADMIN_BODY_BYTES);
    const username = normalizeUsername(body.username);
    const displayName = cleanAdminDisplayName(body.displayName);
    const role = String(body.role || "viewer");
    if (!username || !displayName || !ADMIN_ROLES.has(role)) {
      return json({ error: "Enter a valid username, display name and role." }, 400);
    }
    if (await findAdminByUsername(db, username)) {
      return json({ error: "That username is already in use." }, 409);
    }
    const passwordHash = await securePasswordHash(body.password);
    const userId = crypto.randomUUID();
    await db.prepare(
      "INSERT INTO admin_users (id, username, display_name, password_hash, role, active) VALUES (?, ?, ?, ?, ?, 1)"
    ).bind(userId, username, displayName, passwordHash, role).run();
    await auditAction(db, actor, "create", "admin_user", userId, request);
    return json({ user: publicAdmin(await findAdminByUsername(db, username)) }, 201);
  }

  if (request.method === "PATCH" && id) {
    const current = await db.prepare(
      "SELECT id, username, display_name, password_hash, role, active, created_at, updated_at, last_login_at FROM admin_users WHERE id = ? LIMIT 1"
    ).bind(id).first();
    if (!current) return json({ error: "Admin account not found." }, 404);

    const body = await readJson(request, ADMIN_BODY_BYTES);
    const displayName = body.displayName === undefined ? current.display_name : cleanAdminDisplayName(body.displayName);
    const role = body.role === undefined ? current.role : String(body.role);
    if (body.active !== undefined && typeof body.active !== "boolean") {
      return json({ error: "Active must be true or false." }, 400);
    }
    const active = body.active === undefined ? Number(current.active) : (body.active ? 1 : 0);
    if (!displayName || !ADMIN_ROLES.has(role)) return json({ error: "Enter a valid display name and role." }, 400);
    if (id === actor.id && (role !== "owner" || active !== 1)) {
      return json({ error: "You cannot remove your own owner access or deactivate your own account." }, 409);
    }
    if (current.role === "owner" && (role !== "owner" || active !== 1)) {
      const owners = await db.prepare("SELECT COUNT(*) AS value FROM admin_users WHERE role = 'owner' AND active = 1").first();
      if (Number(owners?.value || 0) <= 1) return json({ error: "At least one active owner account is required." }, 409);
    }

    const passwordHash = body.password ? await securePasswordHash(body.password) : current.password_hash;
    await db.prepare(
      "UPDATE admin_users SET display_name = ?, password_hash = ?, role = ?, active = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(displayName, passwordHash, role, active, id).run();
    if (body.password || active !== 1) {
      await db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").bind(id).run();
    }
    await auditAction(db, actor, "update", "admin_user", id, request);
    const updated = await db.prepare(
      "SELECT id, username, display_name, role, active, created_at, updated_at, last_login_at FROM admin_users WHERE id = ? LIMIT 1"
    ).bind(id).first();
    return json({ user: publicAdmin(updated) }, 200);
  }

  return json({ error: "Method not allowed." }, 405, { Allow: "GET, POST, PATCH" });
}

async function securePasswordHash(value) {
  try {
    validatePassword(value);
    return await hashPassword(value);
  } catch (error) {
    throw new ApiError(400, error instanceof Error ? error.message : "Invalid password.");
  }
}

function cleanAdminDisplayName(value) {
  const displayName = String(value || "").replace(/\s+/g, " ").trim();
  return displayName.length >= 2 && displayName.length <= 100 ? displayName : "";
}

async function auditAdminResponse(response, request, db, admin, resource, targetId) {
  if (!response.ok || !["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return;
  const action = ({ POST: "create", PUT: "update", PATCH: "update", DELETE: "delete" })[request.method];
  await auditAction(db, admin, action, resource, targetId, request);
}

async function auditAction(db, admin, action, resource, targetId, request) {
  const requestId = String(request.headers.get("CF-Ray") || "").slice(0, 80);
  await db.prepare(
    "INSERT INTO admin_audit_log (id, admin_user_id, username_snapshot, action, resource, target_id, request_id) " +
    "VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    crypto.randomUUID(),
    admin?.id || null,
    String(admin?.username || "unknown").slice(0, 64),
    String(action || "unknown").slice(0, 64),
    String(resource || "unknown").slice(0, 64),
    String(targetId || "").slice(0, 128),
    requestId,
  ).run();
}

async function ensureSchema(db) {
  if (schemaReady) return;
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS packages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', monthly_price INTEGER NOT NULL DEFAULT 0, weekly_price INTEGER NOT NULL DEFAULT 0, features TEXT NOT NULL DEFAULT '[]', featured INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, icon TEXT NOT NULL DEFAULT '✦', name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS portfolio (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL DEFAULT '', title TEXT NOT NULL, type TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, type TEXT NOT NULL DEFAULT 'NFC', quantity INTEGER NOT NULL DEFAULT 1, amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', due_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, invoice_number TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', due_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, plan TEXT NOT NULL DEFAULT '', amount REAL NOT NULL DEFAULT 0, interval TEXT NOT NULL DEFAULT 'monthly', status TEXT NOT NULL DEFAULT 'active', next_billing_date TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL DEFAULT 'General', description TEXT NOT NULL DEFAULT '', amount REAL NOT NULL DEFAULT 0, date TEXT NOT NULL DEFAULT (date('now')), notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))"),
      db.prepare("CREATE TABLE IF NOT EXISTS quicksite_projects (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, template_id TEXT NOT NULL, language TEXT NOT NULL DEFAULT 'tr', business_name TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', primary_color TEXT NOT NULL DEFAULT '#a3ff12', phone TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', email TEXT NOT NULL, address TEXT NOT NULL DEFAULT '', contact_name TEXT NOT NULL, offers_json TEXT NOT NULL DEFAULT '[]', details_json TEXT NOT NULL DEFAULT '{}', payment_status TEXT NOT NULL DEFAULT 'unpaid', status TEXT NOT NULL DEFAULT 'pending', owner_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), approved_at TEXT, revision INTEGER NOT NULL DEFAULT 1)"),
      db.prepare("CREATE TABLE IF NOT EXISTS auramenu_requests (id TEXT PRIMARY KEY NOT NULL, slug TEXT NOT NULL UNIQUE, template_id TEXT NOT NULL, interface_language TEXT NOT NULL DEFAULT 'tr', menu_language TEXT NOT NULL DEFAULT 'tr', business_name TEXT NOT NULL, tagline TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', business_phone TEXT NOT NULL DEFAULT '', whatsapp TEXT NOT NULL DEFAULT '', opening_hours TEXT NOT NULL DEFAULT '', currency TEXT NOT NULL DEFAULT 'TRY', contact_name TEXT NOT NULL, contact_phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', payment_reference TEXT NOT NULL DEFAULT '', categories_json TEXT NOT NULL DEFAULT '[]', notes TEXT NOT NULL DEFAULT '', payment_status TEXT NOT NULL DEFAULT 'unpaid', status TEXT NOT NULL DEFAULT 'pending', owner_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), approved_at TEXT, revision INTEGER NOT NULL DEFAULT 1)"),
      db.prepare("CREATE TABLE IF NOT EXISTS auramenu_images (id TEXT PRIMARY KEY NOT NULL, request_id TEXT NOT NULL, content_type TEXT NOT NULL, image_bytes BLOB NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (request_id) REFERENCES auramenu_requests(id) ON DELETE CASCADE)"),
      db.prepare("CREATE TABLE IF NOT EXISTS nfc_requests (id TEXT PRIMARY KEY NOT NULL, card_type TEXT NOT NULL, card_language TEXT NOT NULL DEFAULT 'tr', business_name TEXT NOT NULL, headline TEXT NOT NULL DEFAULT '', instruction_text TEXT NOT NULL DEFAULT '', destination_url TEXT NOT NULL, background_color TEXT NOT NULL DEFAULT '#102326', accent_color TEXT NOT NULL DEFAULT '#64d7df', text_color TEXT NOT NULL DEFAULT '#ffffff', show_qr INTEGER NOT NULL DEFAULT 1, finish TEXT NOT NULL DEFAULT 'matte', quantity INTEGER NOT NULL DEFAULT 1, contact_name TEXT NOT NULL, contact_phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', payment_reference TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', payment_status TEXT NOT NULL DEFAULT 'unpaid', status TEXT NOT NULL DEFAULT 'pending', owner_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), approved_at TEXT, revision INTEGER NOT NULL DEFAULT 1)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_auramenu_requests_status_created ON auramenu_requests(status, created_at DESC)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_auramenu_images_request ON auramenu_images(request_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_nfc_requests_status_created ON nfc_requests(status, created_at DESC)"),
      db.prepare("CREATE TABLE IF NOT EXISTS analytics_daily (date TEXT NOT NULL, path TEXT NOT NULL, views INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (date, path))"),
      db.prepare("CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY NOT NULL, username TEXT NOT NULL UNIQUE COLLATE NOCASE, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('owner','manager','viewer')), active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), last_login_at TEXT)"),
      db.prepare("CREATE TABLE IF NOT EXISTS admin_sessions (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at)"),
      db.prepare("CREATE TABLE IF NOT EXISTS admin_audit_log (id TEXT PRIMARY KEY NOT NULL, admin_user_id TEXT, username_snapshot TEXT NOT NULL, action TEXT NOT NULL, resource TEXT NOT NULL, target_id TEXT NOT NULL DEFAULT '', request_id TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL)"),
      db.prepare("CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at DESC)"),
    ]);

    await db.batch([
      settingSeed(db, "nfc_price", "700"),
      settingSeed(db, "auramenu_self_price", "1599"),
      settingSeed(db, "qr_menu_price", "2500"),
      settingSeed(db, "web_single_price", "5000"),
      settingSeed(db, "web_multi_price", "8000"),
      settingSeed(db, "web_dynamic_price", "12000"),
    ]);

    const marker = await db.prepare("SELECT value FROM settings WHERE key = 'dashboard_seed_v2'").first();
    if (!marker) {
      await seedPublicContent(db);
      await db.prepare("INSERT INTO settings (key, value) VALUES ('dashboard_seed_v2', '1')").run();
    }
  schemaReady = true;
}

function settingSeed(db, key, value) {
  return db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").bind(key, value);
}

async function seedPublicContent(db) {
  const packages = [
    ["Start", "Dijital düzenini kurmak isteyen küçük işletmeler.", 3590, 959, ["Temel sosyal medya yönetimi", "İçerik planı ve düzenleme", "Web küçük güncellemeler", "Temel performans takibi"], 0, 1],
    ["Growth", "Düzenli müşteri kazanımı isteyen işletmeler.", 5590, 1459, ["Sosyal medya + reklam yönetimi", "Kreatif ve içerik desteği", "Aylık performans raporu", "Landing / web desteği", "Kampanya optimizasyonu"], 1, 2],
    ["Pro", "Birden fazla kanalda büyümek isteyen markalar.", 7590, 1959, ["Çok kanallı büyüme yönetimi", "Daha yoğun içerik planı", "SEO & Google Maps takibi", "Reklam optimizasyonu", "Öncelikli destek"], 0, 3],
    ["Scale", "Dijital tarafı dış ekip gibi yönetmek isteyenler.", 9590, 2459, ["Tam dijital yönetim", "İleri kampanya optimizasyonu", "AI / automation desteği", "Strateji görüşmeleri", "Öncelikli üretim sırası"], 0, 4],
  ];
  const services = [
    ["⌘", "Web Tasarım & Geliştirme", "Kurumsal web siteleri, landing page'ler, portfolyolar ve satış odaklı sayfalar. Mobil uyum, hız, SEO temeli ve net CTA yapısı standart.", ["1 Sayfa · {{web_single_price}} TL+", "Multi-page · {{web_multi_price}} TL+", "Dynamic · {{web_dynamic_price}} TL+"], 1],
    ["↗", "Google & Meta Ads", "Kampanya kurulumu, hedef kitle, kreatif, dönüşüm takibi, bütçe kontrolü ve sürekli optimizasyon.", ["Google Ads", "Meta Ads", "Landing Pages"], 2],
    ["◎", "Sosyal Medya & İçerik", "İçerik planı, tasarım dili, kısa video fikirleri, kampanya görselleri ve hesabınızın düzenli yönetimi.", ["Instagram", "Facebook", "Creative"], 3],
    ["⌖", "SEO & Google Maps", "Yerel işletmeler için görünürlük, Google Business optimizasyonu, web içi SEO ve içerik fırsatları.", ["Local SEO", "Google Maps", "On-page SEO"], 4],
    ["✦", "AI & Automation", "Lead toplama akışları, WhatsApp yönlendirmeleri, basit CRM yapıları ve tekrar eden süreçleri azaltan otomasyonlar.", ["Lead Flow", "WhatsApp", "Workflow"], 5],
    ["◈", "Brand & Creative Direction", "Renk, tipografi, sosyal görünüm ve kampanya kreatiflerini markanın tek bir profesyonel sistem gibi hissettirmesi için düzenliyoruz.", ["Visual System", "Campaign", "Content"], 6],
  ];
  const portfolio = [
    ["mutlu", "Mutlu Nakliyat", "Web · Local Business", "Hizmetleri net anlatan, mobilde hızlı aksiyon veren ve yerel güven hissini güçlendiren dijital görünüm.", "project-mutlu.png", "https://mutlunakliyat.site/", ["Responsive Web", "Service UX", "Local Presence"], 1],
    ["gateaux", "Decoration Gateaux", "Visual · Web Concept", "Ürünü öne çıkaran, daha yumuşak ve görsel ağırlıklı bir dijital vitrin yaklaşımı.", "project-gateaux.png", "https://decorationgateaux.shop/", ["Creative Web", "Visual Story", "Mobile"], 2],
    ["erhan", "Erhan Oto", "Web · Automotive", "Otomotiv sektörüne uygun daha teknik, net ve güven veren bir web sunumu.", "project-erhan.png", "https://xn--yurtotoelektrikerhankcr-8qdb.com/", ["Web Design", "Automotive", "Mobile UX"], 3],
    ["fifty", "Fifty", "Brand · Digital Experience", "Güçlü bir görsel karakter etrafında şekillenen marka ve dijital deneyim çalışması.", "project-fifty.png", "", ["Visual Direction", "Digital", "Experience"], 4],
  ];

  const statements = [];
  for (const [name, description, monthly, weekly, features, featured, sort] of packages) {
    statements.push(db.prepare("INSERT INTO packages (name, description, monthly_price, weekly_price, features, featured, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)").bind(name, description, monthly, weekly, JSON.stringify(features), featured, sort));
  }
  for (const [icon, name, description, tags, sort] of services) {
    statements.push(db.prepare("INSERT INTO services (icon, name, description, tags, active, sort_order) VALUES (?, ?, ?, ?, 1, ?)").bind(icon, name, description, JSON.stringify(tags), sort));
  }
  for (const [slug, title, type, description, image, url, tags, sort] of portfolio) {
    statements.push(db.prepare("INSERT INTO portfolio (slug, title, type, description, image, url, tags, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)").bind(slug, title, type, description, image, url, JSON.stringify(tags), sort));
  }
  await db.batch(statements);
}

async function getPublicSettings(db) {
  const placeholders = PUBLIC_SETTING_KEYS.map(() => "?").join(",");
  const rows = await db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`).bind(...PUBLIC_SETTING_KEYS).all();
  return Object.fromEntries((rows.results || []).map((row) => [row.key, row.value]));
}

async function listPublic(db, resource) {
  const config = RESOURCES[resource];
  const rows = await db.prepare(`SELECT * FROM ${config.table} WHERE active = 1 ORDER BY ${config.order}`).all();
  return (rows.results || []).map((row) => parseRow(row, config));
}

async function handleResource(request, db, resource, id) {
  const config = RESOURCES[resource];
  if (request.method === "GET" && id === null) {
    const rows = await db.prepare(`SELECT * FROM ${config.table} ORDER BY ${config.order}`).all();
    return json({ items: (rows.results || []).map((row) => parseRow(row, config)) }, 200, { "Cache-Control": "no-store" });
  }

  if (request.method === "POST" && id === null) {
    const body = await readJson(request, ADMIN_BODY_BYTES);
    const values = normalizeBody(body, config);
    const columns = config.fields;
    const placeholders = columns.map(() => "?").join(",");
    const result = await db.prepare(`INSERT INTO ${config.table} (${columns.join(",")}) VALUES (${placeholders})`).bind(...columns.map((field) => values[field])).run();
    return json({ ok: true, id: result.meta?.last_row_id }, 201);
  }

  if (request.method === "PUT" && id !== null) {
    const body = await readJson(request, ADMIN_BODY_BYTES);
    const fields = config.fields.filter((field) => Object.prototype.hasOwnProperty.call(body, field));
    if (!fields.length) return json({ error: "Nothing to update." }, 400);
    const values = normalizeBody(body, config);
    const assignments = fields.map((field) => `${field} = ?`).join(",");
    await db.prepare(`UPDATE ${config.table} SET ${assignments}, updated_at = datetime('now') WHERE id = ?`).bind(...fields.map((field) => values[field]), id).run();
    return json({ ok: true, id }, 200);
  }

  if (request.method === "DELETE" && id !== null) {
    await db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).bind(id).run();
    return json({ ok: true, id }, 200);
  }

  return json({ error: "Method not allowed." }, 405);
}

function normalizeBody(body, config) {
  const values = {};
  for (const field of config.fields) {
    let value = Object.prototype.hasOwnProperty.call(body, field) ? body[field] : null;
    if (config.json.has(field)) {
      const list = Array.isArray(value) ? value : [];
      if (list.length > MAX_LIST_ITEMS || list.some((item) => typeof item !== "string" || item.length > MAX_LIST_ITEM_LENGTH)) {
        throw new ApiError(400, `Invalid ${field}.`);
      }
      value = JSON.stringify(list.map((item) => item.trim()).filter(Boolean));
    }
    if (config.numeric.has(field)) {
      if (value === "" || value === null || value === undefined) value = null;
      else {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0 || number > 1000000000) {
          throw new ApiError(400, `Invalid ${field}.`);
        }
        value = number;
      }
    }
    if (typeof value === "string") {
      value = value.trim();
      if (value.length > MAX_TEXT_LENGTH) throw new ApiError(400, `${field} is too long.`);
      if (field === "url" && value && !/^https?:\/\//i.test(value)) {
        throw new ApiError(400, "Portfolio URL must start with https:// or http://.");
      }
    }
    values[field] = value;
  }
  return values;
}

function parseRow(row, config) {
  const copy = { ...row };
  for (const field of config.json) {
    try { copy[field] = JSON.parse(copy[field] || "[]"); }
    catch { copy[field] = []; }
  }
  return copy;
}

async function getOverview(db) {
  const results = await db.batch([
    db.prepare("SELECT COUNT(*) AS value FROM clients WHERE status = 'lead'"),
    db.prepare("SELECT COUNT(*) AS value FROM clients WHERE status = 'active'"),
    db.prepare("SELECT COUNT(*) AS value FROM orders WHERE status NOT IN ('completed','cancelled')"),
    db.prepare("SELECT COUNT(*) AS value FROM invoices WHERE status NOT IN ('paid','cancelled')"),
    db.prepare("SELECT COALESCE(SUM(amount),0) AS value FROM invoices WHERE status = 'paid'"),
    db.prepare("SELECT COALESCE(SUM(amount),0) AS value FROM expenses"),
    db.prepare("SELECT COALESCE(SUM(CASE WHEN interval = 'weekly' THEN amount * 4.33 ELSE amount END),0) AS value FROM subscriptions WHERE status = 'active'"),
    db.prepare("SELECT COALESCE(SUM(views),0) AS value FROM analytics_daily WHERE date >= date('now','-29 day')"),
    db.prepare("SELECT COUNT(*) AS value FROM quicksite_projects WHERE status = 'pending'"),
    db.prepare("SELECT COUNT(*) AS value FROM auramenu_requests WHERE status = 'pending'"),
    db.prepare("SELECT COUNT(*) AS value FROM nfc_requests WHERE status = 'pending'"),
  ]);
  const values = results.map((result) => Number(result.results?.[0]?.value || 0));
  return {
    leads: values[0], activeClients: values[1], openOrders: values[2], unpaidInvoices: values[3],
    revenue: values[4], expenses: values[5], profit: values[4] - values[5], recurringRevenue: values[6], views30d: values[7],
    pendingQuickSites: values[8], pendingAuraMenus: values[9], pendingNfcRequests: values[10],
  };
}

async function getAnalytics(db) {
  const [daily, pages] = await db.batch([
    db.prepare("SELECT date, SUM(views) AS views FROM analytics_daily WHERE date >= date('now','-29 day') GROUP BY date ORDER BY date ASC"),
    db.prepare("SELECT path, SUM(views) AS views FROM analytics_daily WHERE date >= date('now','-29 day') GROUP BY path ORDER BY views DESC LIMIT 10"),
  ]);
  return { daily: daily.results || [], pages: pages.results || [] };
}

function cleanPath(value) {
  if (typeof value !== "string") return "";
  const path = value.trim();
  return TRACKABLE_PATHS.has(path) ? path : "";
}
