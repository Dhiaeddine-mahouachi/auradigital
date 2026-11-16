import { ApiError } from './http.js';
import { missionAlternative,missionOutcome } from './mission-routes.js';

export async function changeMissionRoute(db,org,item,guard,{version,route}) {
 if(!Number.isSafeInteger(version)||!['original','alternative'].includes(route))throw new ApiError(400,'Select a mission route.');
 const current=await db.prepare('SELECT capability FROM business_missions WHERE id=? AND organization_id=?').bind(item,org).first();
 if(!current||!missionOutcome(current.capability))throw new ApiError(404,'Mission unavailable.');
 const result=await db.prepare(`UPDATE business_missions
  SET data_json=json_remove(json_set(data_json,'$.route',?),'$.completedAt'),status='planned',version=version+1
  WHERE id=? AND organization_id=? AND version=? AND status<>'done'
   AND NOT EXISTS(SELECT 1 FROM mission_evidence WHERE mission_id=? AND status='pending') AND ${guard.sql}`)
  .bind(route,item,org,version,item,...guard.args).run();
 if(!result.meta.changes)throw new ApiError(409,'The mission changed or has evidence under review.');
 return {saved:true};
}

export async function submitMissionEvidence(db,org,item,user,guard,{version,proof}) {
 proof=typeof proof==='string'?proof.trim():'';
 if(proof.length<10||proof.length>1000||!Number.isSafeInteger(version))throw new ApiError(400,'Enter an evidence reference or description of 10–1000 characters.');
 const current=await db.prepare('SELECT capability,data_json FROM business_missions WHERE id=? AND organization_id=? AND version=?').bind(item,org,version).first();
 const outcome=missionOutcome(current?.capability);
 if(!outcome)throw new ApiError(409,'The mission changed or cannot accept evidence.');
 const mission=JSON.parse(current.data_json);
 const title=mission.route==='alternative'?missionAlternative(current.capability).title:mission.objective;
 const id=crypto.randomUUID();
 const result=await db.prepare(`INSERT INTO mission_evidence(id,organization_id,mission_id,submitted_by,outcome,mission_title,proof)
  SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM business_missions WHERE id=? AND organization_id=? AND version=?)
   AND ${guard.sql} ON CONFLICT DO NOTHING`).bind(id,org,item,user.id,outcome,title,proof,item,org,version,...guard.args).run();
 if(!result.meta.changes)throw new ApiError(409,'The mission changed or already has evidence under review.');
 return {id,status:'pending'};
}

export async function workspaceEvidence(db,org,guard) {
 const {results}=await db.prepare(`SELECT e.mission_id,e.status FROM mission_evidence e
  WHERE e.organization_id=? AND ${guard.sql} AND e.rowid=(SELECT max(prior.rowid) FROM mission_evidence prior WHERE prior.mission_id=e.mission_id)`)
  .bind(org,...guard.args).all();
 return Object.fromEntries(results.map(row=>[row.mission_id,row.status]));
}

export async function reviewMissionEvidence(db,admin,{id,status}) {
 if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id)||!['approved','rejected'].includes(status))throw new ApiError(400,'Choose a valid review decision.');
 const operations=[];
 if(status==='approved')operations.push(db.prepare(`INSERT INTO auri_verified_milestones(organization_id,outcome,evidence_ref,verified_by)
  SELECT organization_id,outcome,id,? FROM mission_evidence WHERE id=? AND status='pending'
  ON CONFLICT DO NOTHING`).bind(admin.id,id));
 operations.push(db.prepare(`UPDATE mission_evidence SET status=?,reviewed_by=?,reviewed_at=datetime('now')
  WHERE id=? AND status='pending'`).bind(status,admin.id,id));
 const results=await db.batch(operations);
 if(!results.at(-1).meta.changes)throw new ApiError(409,'This evidence has already been reviewed or is unavailable.');
 return {saved:true};
}
