import { ApiError } from './http.js';

export async function getHubWork(env,org,guard,id,serviceKey) {
 const db=env.DB;
 const tables=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('request_receipts','clients','hub_contact_requests','subscriptions','orders')").all();
 const has=name=>tables.results.some(table=>table.name===name);
 let requests=[];
 if(['request_receipts','clients','hub_contact_requests'].every(has)){
  const production=has('orders')?', (SELECT o.status FROM orders o WHERE o.client_id=c.id ORDER BY o.id DESC LIMIT 1) AS productionStatus, (SELECT o.due_date FROM orders o WHERE o.client_id=c.id ORDER BY o.id DESC LIMIT 1) AS dueDate':'';
  const query=`SELECT r.request_id AS id,c.service AS name,c.status,r.created_at AS createdAt${production}
   FROM hub_contact_requests h JOIN request_receipts r ON r.request_id=h.request_id JOIN clients c ON c.id=r.client_id
   WHERE h.organization_id=? AND ${guard.sql}`;
  requests=(await db.prepare(query+(id?' AND r.request_id=?':'')+' ORDER BY r.created_at DESC LIMIT 100').bind(org,...guard.args,...(id?[id]:[])).all()).results;
 }
 if(id){
  if(!requests.length)throw new ApiError(404,'Request not found.');
  return requests[0];
 }
 const serviceSources=[
  {table:'orders',kind:'order',fields:"o.type AS name,o.due_date AS dueDate,o.created_at AS createdAt"},
  {table:'subscriptions',kind:'subscription',fields:"o.plan AS name,o.next_billing_date AS renewalDate,o.created_at AS createdAt"},
 ];
 const ownedServices=await Promise.all(serviceSources.map(async ({table,kind,fields})=>{
  if(!['request_receipts','hub_contact_requests',table].every(has)||serviceKey&&!serviceKey.startsWith(kind+'-'))return [];
  const select=`SELECT DISTINCT o.id,${fields},o.status,'${kind}' AS kind FROM ${table} o
   JOIN request_receipts r ON r.client_id=o.client_id
   JOIN hub_contact_requests h ON h.request_id=r.request_id
   WHERE h.organization_id=? AND ${guard.sql}`;
  const args=[org,...guard.args];
  if(serviceKey) {
   const row=await db.prepare(select+' AND o.id=?').bind(...args,serviceKey.slice(kind.length+1)).first();
   return row?[row]:[];
  }
  return (await db.prepare(select+' ORDER BY o.id DESC').bind(...args).all()).results;
 }));
 const records=ownedServices.flat().map(record=>({...record,key:record.kind+'-'+record.id}));
 if(serviceKey){
  if(!records.length)throw new ApiError(404,'Service not found.');
  return records[0];
 }
 let services=[];
 if(['request_receipts','hub_contact_requests','subscriptions'].every(has)){
  services=(await db.prepare(`SELECT s.id,s.plan AS name,s.status FROM hub_contact_requests h
   JOIN request_receipts r ON r.request_id=h.request_id JOIN subscriptions s ON s.client_id=r.client_id
   WHERE h.organization_id=? AND s.status='active' AND ${guard.sql} ORDER BY s.id DESC LIMIT 100`).bind(org,...guard.args).all()).results;
 }
 return {requests,services,records};
}
