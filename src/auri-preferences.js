import { ApiError } from './http.js';

export async function auriPreferences(db,org,user) {
 const saved=await db.prepare('SELECT display_name,hidden FROM auri_preferences WHERE organization_id=? AND customer_id=?')
  .bind(org,user.id).first();
 return {name:saved?.display_name||'Auri',hidden:Boolean(saved?.hidden)};
}

export async function saveAuriPreferences(db,org,user,guard,{name,hidden}) {
 name=typeof name==='string'?name.normalize('NFC').trim():'';
 if(!name||[...name].length>24||!/^[\p{L}\p{M}\p{N} .’'-]+$/u.test(name)||typeof hidden!=='boolean'){
  throw new ApiError(400,'Choose a name of 1–24 characters and a visibility preference.');
 }
 const result=await db.prepare(`INSERT INTO auri_preferences(organization_id,customer_id,display_name,hidden)
  SELECT ?,?,?,? WHERE ${guard.sql}
  ON CONFLICT(organization_id,customer_id) DO UPDATE SET display_name=excluded.display_name,hidden=excluded.hidden`)
  .bind(org,user.id,name,Number(hidden),...guard.args).run();
 if(!result.meta.changes)throw new ApiError(404,'Workspace unavailable.');
 return {name,hidden};
}
