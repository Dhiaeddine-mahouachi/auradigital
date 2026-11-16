import { ApiError } from './http.js';

export async function getHubWork(env,org,guard,id) {
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
 let services=[];
 if(['request_receipts','hub_contact_requests','subscriptions'].every(has)){
  services=(await db.prepare(`SELECT DISTINCT s.id,s.plan AS name,s.status,s.next_billing_date AS renewalDate FROM hub_contact_requests h
   JOIN request_receipts r ON r.request_id=h.request_id JOIN subscriptions s ON s.client_id=r.client_id
   WHERE h.organization_id=? AND s.status='active' AND ${guard.sql} ORDER BY s.id DESC LIMIT 100`).bind(org,...guard.args).all()).results;
 }
 return {requests,services};
}
