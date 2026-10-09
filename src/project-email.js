import { tokenHash, newMenuToken } from './menu-ownership.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const EMAIL_EVENTS={request:'Request received',quote:'Quote ready',updated:'Quote updated',deposit:'Deposit received',started:'Project started',design:'Design ready',review:'Client review',final:'Final payment required',delivered:'Project delivered',payment:'Your payment link is ready',information:'More information requested',access:'Your secure project access'};
export async function deliverProjectEmail(env,id) {
  const db=env.DB;
  // Claim queued/failed jobs atomically; an accepted provider call cannot be retried accidentally.
  const job=await db.prepare("UPDATE project_emails SET state='sending',attempts=attempts+1,updated_at=datetime('now') WHERE id=? AND state IN ('queued','failed','not_configured') RETURNING *").bind(id).first();
  if(!job)return;
  if(!env.RESEND_API_KEY){await db.prepare("UPDATE project_emails SET state='not_configured',updated_at=datetime('now') WHERE id=?").bind(id).run();return;}
  try {
    let payload=job.payload_json?JSON.parse(job.payload_json):null;
    if(!payload){
    const project=await db.prepare('SELECT * FROM studio_projects WHERE id=?').bind(job.project_id).first();
    const client=JSON.parse(project.client_json),quote=JSON.parse(project.quote_json);
    const token=newMenuToken();
    await db.batch([
      db.prepare("DELETE FROM project_access WHERE project_id=? AND kind='invite' AND expires_at<=datetime('now')").bind(project.id),
      db.prepare("INSERT INTO project_access (id,project_id,token_hash,kind,expires_at) VALUES (?,?,?,'invite',datetime('now','+2 days'))").bind(crypto.randomUUID(),project.id,await tokenHash(token)),
    ]);
    // Fragment is never sent in HTTP requests, analytics or referrers. Exchange removes it from history.
    const link=`https://auradigitalworks.com/project/${project.id}#access=${token}`;
    const title=EMAIL_EVENTS[job.event]||'Project update';
    const amount=quote.amount===null?'Custom quotation pending':new Intl.NumberFormat('en',{style:'currency',currency:quote.currency}).format(quote.amount);
    const html=`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><body style="margin:0;background:#07180F;color:#F2F5EF;font-family:Arial,sans-serif;padding:24px 12px"><main style="max-width:600px;margin:auto;background:#10281B;border-radius:18px;padding:32px"><div style="font-weight:bold;font-size:24px">AuraDigital<span style="color:#E1E100">.</span></div><p style="color:#9EACA2">${escape(project.id)} · ${escape(project.status)}</p><h1 style="font-size:30px">${escape(title)}</h1><p style="line-height:1.7">Hello ${escape(client.name)},<br>Your project information is available in your private portal.</p><p>${escape(amount)}<br>Paid: ${escape(project.paid)} ${escape(quote.currency)}</p><p style="margin:30px 0"><a href="${escape(link)}" style="display:inline-block;background:#E1E100;color:#07180F;text-decoration:none;font-weight:bold;padding:15px 22px;border-radius:10px">Open your project →</a></p><p style="color:#9EACA2;font-size:12px;line-height:1.6">This single-use link expires in 48 hours. Keep it private. Reply to hello@auradigitalworks.com if you need help.</p></main></body></html>`;
    payload={from:'AuraDigital <noreply@auradigitalworks.com>',reply_to:'hello@auradigitalworks.com',to:[client.email],subject:`${title} — ${project.id}`,html,text:`${title}\n${project.id}\n${project.status}\n${amount}\nOpen your private project: ${link}\nThis single-use link expires in 48 hours.`};
    await db.prepare('UPDATE project_emails SET payload_json=? WHERE id=?').bind(JSON.stringify(payload),id).run();
    }
    const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`studio-project/${job.id}`},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.id)throw new Error('provider_failed');
    await db.prepare("UPDATE project_emails SET state='accepted',message_id=?,updated_at=datetime('now') WHERE id=?").bind(String(result.id).slice(0,120),id).run();
  }catch {await db.prepare("UPDATE project_emails SET state='failed',updated_at=datetime('now') WHERE id=?").bind(id).run();}
}
export async function queueProjectEmail(env,ctx,projectId,event) {
  const id=crypto.randomUUID();
  await env.DB.prepare('INSERT INTO project_emails(id,project_id,event) VALUES(?,?,?)').bind(id,projectId,event).run();
  if(ctx?.waitUntil)ctx.waitUntil(deliverProjectEmail(env,id));
  return id;
}
