// Aggregate AuraHub usage for the AuraDigital admin panel. Counts only — no
// customer lead contact details, conversations or business data leave here.
export async function getHubStats(db) {
 const tables = new Set(((await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results || []).map(r => r.name));
 const one = async (sql, need) => need.every(t => tables.has(t)) ? Number((await db.prepare(sql).first())?.n || 0) : null;
 return {
  accounts: await one('SELECT count(*) AS n FROM customer_users', ['customer_users']),
  workspaces: await one('SELECT count(*) AS n FROM organizations', ['organizations']),
  onboarded: await one('SELECT count(DISTINCT organization_id) AS n FROM business_missions', ['business_missions']),
  tasksDone: await one("SELECT count(*) AS n FROM business_missions WHERE status='done'", ['business_missions']),
  tasksTotal: await one('SELECT count(*) AS n FROM business_missions', ['business_missions']),
  pipelineWorkspaces: await one('SELECT count(DISTINCT organization_id) AS n FROM hub_leads', ['hub_leads']),
  leads30: await one("SELECT count(*) AS n FROM hub_leads WHERE created_at>=datetime('now','-30 day')", ['hub_leads']),
  auriUsers30: await one("SELECT count(DISTINCT customer_id) AS n FROM hub_auri_messages WHERE created_at>=datetime('now','-30 day')", ['hub_auri_messages']),
  auriMessages30: await one("SELECT count(*) AS n FROM hub_auri_messages WHERE role='me' AND created_at>=datetime('now','-30 day')", ['hub_auri_messages']),
  pendingEvidence: await one("SELECT count(*) AS n FROM mission_evidence WHERE status='pending'", ['mission_evidence']),
 };
}
