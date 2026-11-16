export async function auriProgress(db,org,guard,hasRoadmap) {
 const {count}=await db.prepare(`SELECT COUNT(*) AS count FROM auri_verified_milestones
  WHERE organization_id=? AND ${guard.sql}`).bind(org,...guard.args).first();
 return {level:Math.min(7,(hasRoadmap||count?2:1)+count),verifiedMilestones:count};
}

const outcomes=new Set(['foundation','visibility','conversion','operations','measurement']);

export async function verifyAuriMilestone(db,admin,{organizationId,outcome,evidenceRef}={}) {
 if(typeof organizationId!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(organizationId)||
  !outcomes.has(outcome)||typeof evidenceRef!=='string'||!/^[a-zA-Z0-9_.:-]{3,120}$/.test(evidenceRef)){
  return {status:400,error:'Choose a workspace, outcome and internal evidence reference.'};
 }
 const result=await db.prepare(`INSERT INTO auri_verified_milestones(organization_id,outcome,evidence_ref,verified_by)
  SELECT id,?,?,? FROM organizations WHERE id=? ON CONFLICT DO NOTHING`)
  .bind(outcome,evidenceRef,admin.id,organizationId).run();
 if(result.meta.changes)return {status:201};
 const existing=await db.prepare(`SELECT outcome,evidence_ref FROM auri_verified_milestones
  WHERE organization_id=? AND (outcome=? OR evidence_ref=?)`).bind(organizationId,outcome,evidenceRef).all();
 if(existing.results.some(row=>row.outcome===outcome&&row.evidence_ref===evidenceRef))return {status:200};
 return existing.results.length?{status:409,error:'This outcome or evidence is already verified.'}:{status:404,error:'Workspace not found.'};
}
