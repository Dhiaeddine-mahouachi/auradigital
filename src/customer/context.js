import { ApiError } from "../http.js";
import { getCustomerSession } from "./session.js";

export async function requireCustomer(request, db) {
  const session = await getCustomerSession(request, db);
  if (!session) throw new ApiError(401, "Sign in to continue.");
  return session;
}

export async function requireProject(db, session, projectType) {
  if (!session.tenant_id) throw new ApiError(403, "This account has no customer tenant.");
  const project = await db.prepare(
    "SELECT p.id AS project_id, p.project_type, p.status AS project_status, b.* " +
    "FROM customer_projects p JOIN businesses b ON b.id = p.business_id " +
    "WHERE p.tenant_id = ? AND b.tenant_id = ? AND p.project_type = ? AND p.status = 'active' LIMIT 1",
  ).bind(session.tenant_id, session.tenant_id, projectType).first();
  if (!project) throw new ApiError(403, projectType === "auramenu" ? "AuraMenu is not enabled for this account." : "QuickSite is not enabled for this account.");
  return project;
}

export async function audit(db, session, action, resourceType, resourceId = "", metadata = {}) {
  await db.prepare("INSERT INTO audit_logs (id, tenant_id, user_id, action, resource_type, resource_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), session.tenant_id, session.user_id, action, resourceType, resourceId, JSON.stringify(metadata).slice(0, 2000)).run();
}

export async function bumpMenu(db, tenantId, businessId) {
  await db.prepare("UPDATE menu_settings SET revision = revision + 1, updated_at = datetime('now') WHERE tenant_id = ? AND business_id = ?")
    .bind(tenantId, businessId).run();
}

export async function bumpWebsite(db, tenantId, websiteId) {
  await db.prepare("UPDATE websites SET revision = revision + 1, updated_at = datetime('now') WHERE tenant_id = ? AND id = ?")
    .bind(tenantId, websiteId).run();
}
