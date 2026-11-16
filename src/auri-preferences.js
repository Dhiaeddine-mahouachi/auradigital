import { ApiError } from './http.js';
import { auriSkins } from './auri-skins.js';

export async function auriPreferences(db,org,user) {
 const saved=await db.prepare(`SELECT p.display_name,p.hidden,a.skin,a.still
  FROM (SELECT ? AS organization_id,? AS customer_id) AS member
  LEFT JOIN auri_preferences p USING (organization_id,customer_id)
  LEFT JOIN auri_appearance a USING (organization_id,customer_id)`)
  .bind(org,user.id).first();
 return {name:saved.display_name||'Auri',hidden:Boolean(saved.hidden),
  skin:saved.skin||'original',still:Boolean(saved.still)};
}

export async function saveAuriPreferences(db,org,user,guard,values) {
 const {name:rawName,hidden,skin,still}=values||{};
 const name=typeof rawName==='string'?rawName.normalize('NFC').trim():'';
 if(rawName!==undefined&&(!name||[...name].length>24||!/^[\p{L}\p{M}\p{N} .’'-]+$/u.test(name))){
  throw new ApiError(400,'Choose a name of 1–24 characters.');
 }
 if((hidden!==undefined&&typeof hidden!=='boolean')||
    (still!==undefined&&typeof still!=='boolean')||
    (skin!==undefined&&!auriSkins.includes(skin))){
  throw new ApiError(400,'Choose supported companion preferences.');
 }
 const statements=[];
 if(rawName!==undefined||hidden!==undefined){
  statements.push(db.prepare(`INSERT INTO auri_preferences(organization_id,customer_id,display_name,hidden)
   SELECT ?,?,COALESCE(?, 'Auri'),COALESCE(?,0) WHERE ${guard.sql}
   ON CONFLICT(organization_id,customer_id) DO UPDATE SET
    display_name=COALESCE(?,auri_preferences.display_name),hidden=COALESCE(?,auri_preferences.hidden)`)
   .bind(org,user.id,name||null,hidden===undefined?null:Number(hidden),...guard.args,
    name||null,hidden===undefined?null:Number(hidden)));
 }
 if(skin!==undefined||still!==undefined){
  const staticMode=still===undefined?null:Number(still);
  statements.push(db.prepare(`INSERT INTO auri_appearance(organization_id,customer_id,skin,still)
   SELECT ?,?,COALESCE(?,'original'),COALESCE(?,0) WHERE ${guard.sql}
   ON CONFLICT(organization_id,customer_id) DO UPDATE SET
    skin=COALESCE(?,auri_appearance.skin),still=COALESCE(?,auri_appearance.still)`)
   .bind(org,user.id,skin??null,staticMode,...guard.args,skin??null,staticMode));
 }
 if(!statements.length)throw new ApiError(400,'Choose a companion preference to update.');
 const results=await db.batch(statements);
 if(results.some(result=>!result.meta.changes))throw new ApiError(404,'Workspace unavailable.');
 return auriPreferences(db,org,user);
}
