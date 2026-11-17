import { clean, redact } from './ai-core.js';
import { ApiError, json, readJson } from './http.js';

export const auriId = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
const recentTurns = 8;
const live = "updated_at > datetime('now','-90 days')";
const pending = "(status='approved' OR updated_at > datetime('now','-30 days'))";
const kinds = ['goal','preference','business_fact'];
const sensitive = /(?:password|passcode|mot de passe|şifre|كلمة المرور|secret|api[ _-]?key|private[ _-]?key|access[ _-]?token)\s*(?:[:=]|(?:is|est|هو)\s+\S)|\b(?:my|our)\s+(?:password|passcode|api[ _-]?key|access[ _-]?token|secret)\b|bearer\s|\b(?:pin|cvv|iban|otp)\b|\b(?:sk|ghp|gho|xoxb)[_-][\w-]+|\beyJ[\w-]+\.[\w-]+|\b[A-Za-z0-9_+/-]{32,}\b|https?:\/\/[^\s/]+:[^\s/]+@/iu;
const urls = /https?:\/\/[^\s<>"']+/gi;
export function auriText(value, max) {
 const text = clean(value, 6000);
 if (sensitive.test(text)) return '';
 const publicLinks=text.replace(urls, link => {
  try { return new URL(link).origin; } catch { return '[link]'; }
 });
 // Keep unambiguous dates while masking contact details and long numbers.
 return publicLinks.split(/(\b20\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b)/)
  .map((part,index)=>index%2?part:redact(part)).join('').slice(0,max);
}

function suggestion(question) {
 const prefixes = [
  ['goal', /^(?:my (?:business )?goal is|our (?:business )?goal is|mon objectif est|notre objectif est|hedefim|hedefimiz|هدفي|هدفنا)\s*[:：]?\s+(.+)/iu],
  ['preference', /^(?:i prefer|we prefer|je préfère|nous préférons|tercihim|tercihimiz|أفضل|نفضل)\s*[:：]?\s+(.+)/iu],
  ['business_fact', /^(?:my business (?:offers|sells|is)|our business (?:offers|sells|is)|mon entreprise (?:propose|vend|est)|işletmem(?:iz)?|نشاطي|نشاطنا)\s*[:：]?\s+(.+)/iu],
 ];
 for (const [kind, pattern] of prefixes) {
  const match = pattern.exec(question);
  if (match && !/[?؟]|\[(?:email|phone|link)\]/.test(question)) {
   return {kind,value:(kind==='business_fact'?match[0]:match[1]).slice(0,240)};
  }
 }
 return null;
}

const topics = {
 'website and hosting': /website|\bsite\b|hosting|web sitesi|موقع|استضافة/iu,
 'menus and products': /menu|menü|product|produit|ürün|قائمة|منتج/iu,
 'visibility and marketing': /seo|marketing|google maps|görünürlük|تسويق/iu,
 'automation and messaging': /auto(?:mat|matis)|whatsapp|messag|otomasyon|واتساب|أتمتة/iu,
 'goals and roadmap': /goal|roadmap|objectif|hedef|خطة|هدف/iu,
};

export async function cleanupAuriMemory(env) {
 const db=env.DB;
 await db.batch([
  db.prepare(`DELETE FROM auri_conversations WHERE id IN
   (SELECT id FROM auri_conversations WHERE NOT (${live}) ORDER BY updated_at LIMIT 250)`),
  db.prepare(`DELETE FROM auri_memories WHERE id IN
   (SELECT id FROM auri_memories WHERE NOT (${pending}) ORDER BY updated_at LIMIT 250)`),
 ]);
}

export function linkOnboardingChat(db,user,org,id) {
 return db.prepare(`UPDATE auri_conversations SET organization_id=?,revision=revision+1,write_token=NULL
  WHERE changes()=1 AND id=? AND customer_id=? AND organization_id IS NULL AND ${live}
  AND EXISTS(SELECT 1 FROM organizations WHERE id=? AND owner_id=?)`).bind(org,id,user.id,org,user.id);
}

export function auriMemoryStore(db,user,org,guard,owner=false) {
 const privateScope = `customer_id=? AND organization_id IS ? AND (${guard.sql})`;
 const visibleMemories = `organization_id IS ? AND (customer_id=? OR scope='shared') AND (${guard.sql}) AND ${pending}`;
 const privateArgs = [user.id,org,...guard.args];
 const memoryArgs = [org,user.id,...guard.args];
 const checkAccess=()=>db.prepare(`SELECT 1 WHERE ${guard.sql}`).bind(...guard.args).first();
 const invalidConversation = () => new ApiError(404,'Auri conversation not found.');
 const conversation = id => db.prepare(`SELECT id,revision FROM auri_conversations
  WHERE id=? AND ${privateScope} AND ${live}`).bind(id,...privateArgs).first();
 const listMemories = async () => (await db.prepare(`SELECT id,scope,kind,value,status FROM auri_memories
  WHERE ${visibleMemories} ORDER BY status DESC,updated_at DESC,id LIMIT 80`).bind(...memoryArgs).all()).results;
 const approved = async id => (await db.prepare(`SELECT kind,value FROM auri_memories
  WHERE ${visibleMemories} AND status='approved' AND (organization_id IS NOT NULL OR source_conversation_id=?)
  ORDER BY updated_at DESC,rowid DESC LIMIT 12`).bind(...memoryArgs,id??null).all()).results;
 const list = async () => (await db.prepare(`SELECT id,title,updated_at AS updatedAt FROM auri_conversations
  WHERE ${privateScope} AND ${live} ORDER BY updated_at DESC,rowid DESC LIMIT 30`).bind(...privateArgs).all()).results;

 async function start() {
  const id=crypto.randomUUID();
  const result = await db.prepare(`INSERT INTO auri_conversations(id,customer_id,organization_id)
   SELECT ?,?,? WHERE (${guard.sql}) AND (SELECT count(*) FROM auri_conversations
    WHERE customer_id=? AND organization_id IS ? AND ${live}) < 30`).bind(id,user.id,org,...guard.args,user.id,org).run();
  if (!result.meta.changes) throw new ApiError(409,'Unable to start a conversation. Check your access or delete an older conversation.');
  return {id,revision:0};
 }

 async function read(id) {
  const [active,messages,summary] = await db.batch([
   db.prepare(`SELECT id,revision FROM auri_conversations WHERE id=? AND ${privateScope} AND ${live}`).bind(id,...privateArgs),
   db.prepare(`SELECT m.turn,m.role,m.body,m.package_ids FROM auri_messages m JOIN auri_conversations c ON c.id=m.conversation_id
    WHERE c.id=? AND ${privateScope} AND ${live} ORDER BY m.turn,m.role DESC`).bind(id,...privateArgs),
   db.prepare(`SELECT s.topics,s.turns FROM auri_memory_summaries s JOIN auri_conversations c ON c.id=s.conversation_id
    WHERE c.id=? AND ${privateScope} AND ${live}`).bind(id,...privateArgs),
  ]);
  const revision=active.results[0]?.revision;
  if (revision===undefined) throw invalidConversation();
  const turns=[];
  for (const message of messages.results) {
   if (message.role==='user') turns.push({question:message.body,reply:'',packageIds:[]});
   else Object.assign(turns.at(-1),{reply:message.body,packageIds:JSON.parse(message.package_ids)});
  }
  const row=summary.results[0];
  return {id,revision,turns,summary:row?{topics:JSON.parse(row.topics),earlierTurns:row.turns}:null};
 }

 async function append(chat,question,reply,packageIds) {
  const token=crypto.randomUUID();
  const turn=chat.revision+1;
  const safeReply=auriText(reply,800)||'[…]';
  const fact=suggestion(question);
  const written='EXISTS(SELECT 1 FROM auri_conversations WHERE id=? AND write_token=?)';
  const writtenArgs=[chat.id,token];
  const oldest=chat.turns.length===recentTurns?chat.turns[0]:null;
  const fallbackTitle='Auri';
  const title=question.slice(0,65)||fallbackTitle;
  const statements=[
   db.prepare(`UPDATE auri_conversations SET revision=?,write_token=?,title=CASE WHEN title='' THEN ? ELSE title END,
    updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE id=? AND revision=? AND ${privateScope} AND ${live}`)
    .bind(turn,token,title,chat.id,chat.revision,...privateArgs),
   db.prepare(`INSERT INTO auri_messages(conversation_id,turn,role,body,package_ids)
    SELECT ?,?,'user',?,'[]' WHERE ${written} UNION ALL SELECT ?,?,'assistant',?,? WHERE ${written}`)
    .bind(chat.id,turn,question,...writtenArgs,chat.id,turn,safeReply,JSON.stringify(packageIds),...writtenArgs),
  ];
  if (oldest) {
   const newTopics = Object.keys(topics).filter(key=>topics[key].test(oldest.question));
   const merged = [...new Set([...(chat.summary?.topics||[]),...newTopics])];
   statements.push(
    db.prepare(`INSERT INTO auri_memory_summaries(conversation_id,topics,turns)
     SELECT ?,?,? WHERE ${written} ON CONFLICT(conversation_id) DO UPDATE SET topics=excluded.topics,turns=excluded.turns`)
     .bind(chat.id,JSON.stringify(merged),(chat.summary?.earlierTurns||0)+1,...writtenArgs),
    db.prepare(`DELETE FROM auri_messages WHERE conversation_id=? AND turn<=(
     SELECT turn FROM auri_messages WHERE conversation_id=? AND role='user' ORDER BY turn DESC LIMIT 1 OFFSET ?
    ) AND ${written}`).bind(chat.id,chat.id,recentTurns,...writtenArgs),
   );
  }
  if (fact) statements.push(db.prepare(`INSERT INTO auri_memories(id,customer_id,organization_id,source_conversation_id,scope,kind,value,status)
   SELECT ?,?,?,?,'private',?,?,'suggested' WHERE ${written}
   AND NOT EXISTS(SELECT 1 FROM auri_memories WHERE ${visibleMemories} AND kind=? AND value=? COLLATE NOCASE)
   AND (SELECT count(*) FROM auri_memories WHERE customer_id=? AND organization_id IS ? AND status='suggested' AND ${pending})<10`)
   .bind(crypto.randomUUID(),user.id,org,chat.id,fact.kind,fact.value,...writtenArgs,...memoryArgs,fact.kind,fact.value,user.id,org));
  const [saved]=await db.batch(statements);
  if (!saved.meta.changes) throw new ApiError(409,'This conversation changed. Reopen it and retry.');
  return {question,reply:safeReply,packageIds,conversationId:chat.id};
 }

 async function remove(id) {
  const result=await db.prepare(`DELETE FROM auri_conversations WHERE id=? AND ${privateScope}`).bind(id,...privateArgs).run();
  if (!result.meta.changes) throw invalidConversation();
 }

 async function changeMemory(id,body) {
  const ownsOrganization='EXISTS(SELECT 1 FROM organizations WHERE id=? AND owner_id=?)';
  const ownership=[org,user.id];
  const editable = `id=? AND ${privateScope} AND (scope='private' OR ${ownsOrganization})`;
  const editableArgs = [id,...privateArgs,...ownership];
  if (body===null) {
   const result=await db.prepare(`DELETE FROM auri_memories WHERE ${editable}`).bind(...editableArgs).run();
   if (!result.meta.changes) throw new ApiError(404,'Auri memory not found.');
   return;
  }
  const {kind,scope='private'}=body;
  const value=auriText(body.value,240);
  if (!kinds.includes(kind)||!['private','shared'].includes(scope)||!value||/\[(?:email|phone|link)\]/.test(value)||body.value.length>240) {
   throw new ApiError(400,'Enter a short business fact, goal or preference without sensitive information.');
  }
  if (scope==='shared'&&(!org||!owner)) throw new ApiError(403,'Only the workspace owner can share a memory.');
  const room=`(SELECT count(*) FROM auri_memories WHERE organization_id IS ? AND status='approved'
   AND scope=? AND customer_id=? AND id<>?)<30`;
  const capacity=[org,scope,user.id,id];
  const result=await db.prepare(`UPDATE auri_memories SET kind=?,value=?,scope=?,status='approved',
   source_conversation_id=CASE WHEN organization_id IS NULL THEN source_conversation_id ELSE NULL END,updated_at=strftime('%Y-%m-%d %H:%M:%f','now') WHERE ${editable} AND ${pending} AND ${room}
   AND (?='private' OR ${ownsOrganization})`)
   .bind(kind,value,scope,...editableArgs,...capacity,scope,...ownership).run();
  if (!result.meta.changes) throw new ApiError(409,'Memory unavailable. Refresh the list or remove an older memory.');
 }

 return {checkAccess,conversation,list,listMemories,approved,start,read,append,remove,changeMemory};
}

export async function handleAuriMemory(request,store,item,kind) {
 const method=request.method;
 if (item&&!auriId(item)) throw new ApiError(404,'Auri record not found.');
 if (kind==='conversations') {
  if (method==='GET') return json(item?await store.read(item):{conversations:await store.list()});
  if (method==='POST'&&!item) return json(await store.start(),201);
  if (method==='DELETE'&&item) {
   await store.remove(item);
   return json({deleted:true});
  }
 }
 if (kind==='memories') {
  if (method==='GET'&&!item) return json({memories:await store.listMemories()});
  if (method==='PATCH'&&item) {
   await store.changeMemory(item,await readJson(request,2000));
   return json({saved:true});
  }
  if (method==='DELETE'&&item) {
   await store.changeMemory(item,null);
   return json({deleted:true});
  }
 }
 throw new ApiError(405,'Method not allowed.');
}
