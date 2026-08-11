import { ApiError, json } from "../http.js";
import { sameOrigin } from "../security.js";
import { audit, requireCustomer } from "./context.js";
import { getCustomerSession } from "./session.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = new Map([
  ["image/jpeg", { extension: "jpg", signatures: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] }],
  ["image/png", { extension: "png", signatures: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }] }],
  ["image/webp", { extension: "webp", signatures: [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }] }],
]);

export async function handleUploads(request, env, url) {
  const match = url.pathname.match(/^\/api\/uploads(?:\/([a-f0-9-]+\.(?:jpg|png|webp)))?$/i);
  if (!match) return null;
  if (!env.CUSTOMER_UPLOADS) throw new ApiError(503, "Image storage is not configured.");
  const session = await requireCustomer(request, env.DB);
  if (!sameOrigin(request)) throw new ApiError(403, "Invalid request origin.");

  if (request.method === "POST" && !match[1]) {
    const contentType = (request.headers.get("Content-Type") || "").split(";", 1)[0].trim().toLowerCase();
    const config = TYPES.get(contentType);
    if (!config) throw new ApiError(415, "Only JPG, PNG and WebP images are allowed.");
    const bytes = await readBoundedBytes(request, MAX_IMAGE_BYTES);
    if (!validSignature(bytes, config.signatures)) throw new ApiError(400, "The uploaded file does not match its image type.");
    const key = `${crypto.randomUUID()}.${config.extension}`;
    const result = await env.CUSTOMER_UPLOADS.put(key, bytes, {
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: { tenantId: session.tenant_id, uploadedBy: session.user_id },
    });
    if (!result) throw new ApiError(500, "Image upload failed.");
    await audit(env.DB, session, "upload.created", "upload", key, { contentType, size: bytes.byteLength });
    return json({ key, url: `/media/${key}`, size: bytes.byteLength, contentType }, 201);
  }

  if (request.method === "DELETE" && match[1]) {
    const key = match[1].toLowerCase();
    const object = await env.CUSTOMER_UPLOADS.head(key);
    if (!object || object.customMetadata?.tenantId !== session.tenant_id) throw new ApiError(404, "Image not found.");
    const inUse = await isUploadInUse(env.DB, session.tenant_id, `/media/${key}`);
    if (inUse) throw new ApiError(409, "This image is still used by menu or website content.");
    await env.CUSTOMER_UPLOADS.delete(key);
    await audit(env.DB, session, "upload.deleted", "upload", key);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
}

export async function serveUpload(request, env, url) {
  const match = url.pathname.match(/^\/media\/([a-f0-9-]+\.(?:jpg|png|webp))$/i);
  if (!match || !["GET", "HEAD"].includes(request.method)) return null;
  if (!env.CUSTOMER_UPLOADS) return new Response("Not found", { status: 404 });
  const key = match[1].toLowerCase();
  const metadata = await env.CUSTOMER_UPLOADS.head(key);
  if (!metadata) return new Response("Not found", { status: 404 });
  const mediaUrl = `/media/${key}`;
  const isPublic = await isUploadPublic(env.DB, mediaUrl);
  if (!isPublic) {
    const session = await getCustomerSession(request, env.DB);
    if (!session || metadata.customMetadata?.tenantId !== session.tenant_id) return new Response("Not found", { status: 404 });
  }
  const object = await env.CUSTOMER_UPLOADS.get(key, {
    onlyIf: request.headers,
  });
  if (!object) return new Response("Not found", { status: 404 });
  if (!object.body) return new Response(null, { status: 304, headers: { ETag: object.httpEtag } });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

async function readBoundedBytes(request, maxBytes) {
  const declared = Number(request.headers.get("Content-Length") || 0);
  if (declared > maxBytes) throw new ApiError(413, "Image must be 5 MB or smaller.");
  if (!request.body) throw new ApiError(400, "Image body is required.");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("Image size limit exceeded");
        throw new ApiError(413, "Image must be 5 MB or smaller.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!total) throw new ApiError(400, "Image body is empty.");
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

function validSignature(bytes, signatures) {
  return signatures.every((signature) => signature.bytes.every((value, index) => bytes[signature.offset + index] === value));
}

async function isUploadInUse(db, tenantId, url) {
  const result = await db.batch([
    db.prepare("SELECT id FROM menu_products WHERE tenant_id=? AND image=? LIMIT 1").bind(tenantId, url),
    db.prepare("SELECT website_id FROM website_content WHERE tenant_id=? AND (hero_image=? OR logo_image=?) LIMIT 1").bind(tenantId, url, url),
    db.prepare("SELECT id FROM website_services WHERE tenant_id=? AND image=? LIMIT 1").bind(tenantId, url),
    db.prepare("SELECT id FROM website_gallery WHERE tenant_id=? AND image=? LIMIT 1").bind(tenantId, url),
  ]);
  return result.some((entry) => (entry.results || []).length > 0);
}

async function isUploadPublic(db, url) {
  const result = await db.batch([
    db.prepare("SELECT mp.id FROM menu_products mp JOIN menu_settings ms ON ms.business_id=mp.business_id AND ms.tenant_id=mp.tenant_id JOIN customer_projects p ON p.business_id=mp.business_id AND p.tenant_id=mp.tenant_id WHERE mp.image=? AND ms.published=1 AND p.project_type='auramenu' AND p.status='active' LIMIT 1").bind(url),
    db.prepare("SELECT wc.website_id FROM website_content wc JOIN websites w ON w.id=wc.website_id AND w.tenant_id=wc.tenant_id JOIN customer_projects p ON p.business_id=w.business_id AND p.tenant_id=w.tenant_id WHERE (wc.hero_image=? OR wc.logo_image=?) AND w.status='published' AND p.project_type='quicksite' AND p.status='active' LIMIT 1").bind(url, url),
    db.prepare("SELECT ws.id FROM website_services ws JOIN websites w ON w.id=ws.website_id AND w.tenant_id=ws.tenant_id JOIN customer_projects p ON p.business_id=w.business_id AND p.tenant_id=w.tenant_id WHERE ws.image=? AND ws.active=1 AND w.status='published' AND p.project_type='quicksite' AND p.status='active' LIMIT 1").bind(url),
    db.prepare("SELECT wg.id FROM website_gallery wg JOIN websites w ON w.id=wg.website_id AND w.tenant_id=wg.tenant_id JOIN customer_projects p ON p.business_id=w.business_id AND p.tenant_id=w.tenant_id WHERE wg.image=? AND w.status='published' AND p.project_type='quicksite' AND p.status='active' LIMIT 1").bind(url),
  ]);
  return result.some((entry) => (entry.results || []).length > 0);
}
