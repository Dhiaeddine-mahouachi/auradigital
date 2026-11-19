import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,timingSafeEqual,scryptSync} from 'node:crypto';
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
const db=new DatabaseSync(process.env.PREVIEW_DB||'.preview.sqlite');
db.exec(readFileSync('schema.sql','utf8'));
const q=s=>db.prepare(s), token=()=>randomBytes(32).toString('hex'), hash=s=>createHash('sha256').update(s).digest('hex');
const keyfile='.preview-admin';
if(!process.env.PREVIEW_ADMIN&&!existsSync(keyfile))writeFileSync(keyfile,token(),{mode:0o600});
const admin=process.env.PREVIEW_ADMIN||readFileSync(keyfile,'utf8').trim();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const template=(s,b)=>'<main style="max-width:540px;margin:auto;font:16px/1.6 Arial;color:#17241d"><header style="padding:24px;background:#003d2b;color:white">AuraDigital</header><h1>'+esc(s)+'</h1><p>'+esc(b).replace(/(\/\?(?:confirm|unsubscribe)=[0-9a-f]{64})/g,'<a href="$1">$1</a>').replaceAll('\n','<br>')+'</p><a href="https://auradigitalworks.com">AuraDigital</a></main>';
const mail=(email,s,b)=>q('insert into inbox(email,subject,body,html) values(?,?,?,?)').run(email,s,b,template(s,b));
const consent='I agree to receive AuraDigital updates and occasional offers by email.';
function limit(key,max){const now=Date.now();q('delete from limits where expires<=?').run(now);q('insert into limits values(?,1,?) on conflict(bucket) do update set n=n+1').run(hash(key),now+3600000);return q('select n from limits where bucket=?').get(hash(key)).n<=max}
function batch(){db.exec('BEGIN');try{for(const d of q("select * from deliveries where status='queued' limit 40").all()){const u=q('select * from newsletter_subscriptions where id=?').get(d.subscriber),i=q('select * from issues where id=?').get(d.issue);if(u.status==='active')mail(u.email,i.subject,i.body+'\n\nSubscription preferences: /?unsubscribe='+unsubscribe(u.id,u.confirmed_at));q('update deliveries set status=? where issue=? and subscriber=?').run(u.status==='active'?'mock delivered':'suppressed',d.issue,d.subscriber)}db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
import {createHmac} from 'node:crypto';
const unsubscribe=(id,confirmedAt)=>createHmac('sha256',admin).update('unsubscribe/'+id+'/'+confirmedAt).digest('hex');
setInterval(batch,3000).unref();
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,'http://preview.local'),p=url.pathname;
const answer=(v,status=200)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(v))};
try{
if(!p.startsWith('/api/')){const files={'/tr.json':'tr.json','/ar.json':'ar.json','/':'index.html','/admin':'admin.html','/app.js':'app.js','/style.css':'style.css','/catalogue.js':'catalogue.js','/mutlu.webp':'mutlu.webp','/yurt.webp':'yurt.webp'};for(const name of ['hub-requests','hub-growth-vision','hub-my-services','auramenu-live-20261116'])files['/'+name+'.webp']=name+'.webp';if(!files[p])return answer({},404);const f=files[p];res.setHeader('Content-Type',({'json':'application/json','html':'text/html; charset=utf-8','js':'text/javascript','css':'text/css','webp':'image/webp'})[f.split('.').pop()]);return res.end(readFileSync(path.join('public',f)))}
if(req.method!=='POST'||!req.headers['content-type']?.startsWith('application/json'))return answer({},405);
if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return answer({},403);
let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>30000)return answer({},413)}const b=JSON.parse(raw),now=Date.now();
if(p==='/api/subscribe'){const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||b.consent!==true||!['footer','landing'].includes(b.source))return answer({error:'Check the email and consent box.'},400);
if(!limit('ip'+req.socket.remoteAddress,80))return answer({error:'Please try again later.'},429);
const u=q('select * from newsletter_subscriptions where email=?').get(email);
if(limit('address'+email,3)&&u?.status!=='active'){const t=token();db.exec('BEGIN');try{q("insert into newsletter_subscriptions(id,email,status,consent,consent_at,source,token_hash,expires,created_at,updated_at) values(?,?,'pending',?,?,?,?,?,?,?) on conflict(email) do update set status='pending',consent=excluded.consent,consent_at=excluded.consent_at,source=excluded.source,token_hash=excluded.token_hash,expires=excluded.expires,updated_at=excluded.updated_at,unsubscribe_hash=NULL,confirmed_at=NULL,unsubscribed_at=NULL").run(randomUUID(),email,consent,now,b.source,hash(t),now+86400000,now,now);mail(email,'Confirm your AuraDigital subscription','Confirm in the preview: /?confirm='+t);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}
return answer({message:'If confirmation is needed, a link is waiting in the private preview inbox. Already subscribed? You’re all set.'})}
if(p==='/api/confirm'||p==='/api/unsubscribe'){if(typeof b.token!=='string'||b.token.length!==64)return answer({error:'Invalid link.'},400);db.exec('BEGIN');try{if(p.endsWith('confirm')){const u=q("select * from newsletter_subscriptions where status='pending' and token_hash=? and expires>?").get(hash(b.token),now);if(!u){db.exec('ROLLBACK');return answer({error:'Link expired or used. Subscribe again for a fresh link.'},410)}const t=unsubscribe(u.id,now);q("update newsletter_subscriptions set status='active',token_hash=NULL,expires=NULL,confirmed_at=?,updated_at=?,unsubscribe_hash=? where id=?").run(now,now,hash(t),u.id);mail(u.email,'Welcome to AuraDigital Updates 🌱','You’re now part of the AuraDigital community.\n\nWe’ll share useful business growth ideas, new features, product updates, and occasional offers to help you build and grow your business.\n\nThank you for joining us.\n\nSubscription preferences: /?unsubscribe='+t)}else q("update newsletter_subscriptions set status='unsubscribed',unsubscribed_at=?,updated_at=?,unsubscribe_hash=NULL where unsubscribe_hash=?").run(now,now,hash(b.token));db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return answer({message:p.endsWith('confirm')?'Subscription confirmed.':'Unsubscribed.'})}
if(p.startsWith('/api/workspace/')){
const act=p.split('/').pop();let id;
if(['register','login'].includes(act)){
const email=String(b.email||'').trim().toLowerCase(),pass=String(b.password||'');
if(!limit('login'+req.socket.remoteAddress,40)||!/^\S+@\S+\.\S+$/.test(email)||pass.length<10||pass.length>180)return answer({error:'Use a test email and a password of 10–180 characters.'},400);
const row=q('select * from guests where email=?').get(email),salt=row?.salt||token(),digest=scryptSync(pass,salt,32).toString('hex');
if(act==='register'&&!row){id=randomUUID();q('insert into guests values(?,?,?,?,NULL)').run(id,email,salt,digest)}
else if(act==='login'&&row&&timingSafeEqual(Buffer.from(digest),Buffer.from(row.password)))id=row.id;
else return answer({error:'Unable to open this preview account.'},403);
const t=token();q('insert into sessions values(?,?,?)').run(hash(t),id,now+86400000);res.setHeader('Set-Cookie','preview_session='+t+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400'+(req.headers['x-forwarded-proto']==='https'?'; Secure':''));
}else{const t=(req.headers.cookie||'').match(/(?:^|; )preview_session=([a-f0-9]{64})/);id=t&&q('select guest from sessions where hash=? and expires>?').get(hash(t[1]),now)?.guest;if(!id)return answer({error:'Sign in to a preview account.'},401)}
if(act==='save'){const v=b.plan;if(!v||!Array.isArray(v.ids)||v.ids.length>10||!v.ids.every(x=>['web','menu','maps','ads','ai','brand','content','email','hosting','security'].includes(x))||!Number.isInteger(v.business)||v.business<0||v.business>5||!Number.isInteger(v.goal)||v.goal<0||v.goal>2||!v.packages||typeof v.packages!=='object'||Object.entries(v.packages).some(([k,n])=>!Object.hasOwn({web:5,menu:2,ads:3,email:1,hosting:2,security:1},k)||!Number.isInteger(n)||n<0||n>=({web:5,menu:2,ads:3,email:1,hosting:2,security:1})[k]))return answer({error:'Invalid roadmap.'},400)}
if(act==='save')q('update guests set plan=? where id=?').run(JSON.stringify(b.plan),id);
if(act==='request'){if(!['web','menu','maps','ads','ai','brand','content','email','hosting','security'].includes(b.service))return answer({},400);q('insert into requests(guest,service,package,created_at) values(?,?,?,?)').run(id,b.service,String(b.package||'Custom quote'),now)}
if(act==='logout'){q('delete from sessions where guest=?').run(id);res.setHeader('Set-Cookie','preview_session=; Path=/; Max-Age=0');return answer({})}
return answer({plan:JSON.parse(q('select plan from guests where id=?').get(id).plan||'null'),requests:q('select service,package from requests where guest=? order by id desc').all(id)})}
if(!p.startsWith('/api/admin/'))return answer({},404);
if(!timingSafeEqual(Buffer.from(hash(req.headers.authorization||'')),Buffer.from(hash('Bearer '+admin))))return answer({error:'Owner key required.'},403);
const action=p.split('/').pop();
if(action==='save'){if(!b.subject?.trim()||!b.body?.trim())return answer({error:'Enter a subject and content.'},400);if(b.id)q("update issues set subject=?,body=? where id=? and status='draft'").run(b.subject,b.body,b.id);else q('insert into issues(subject,body) values(?,?)').run(b.subject,b.body)}
if(action==='publish'){db.exec('BEGIN');try{if(q("update issues set status='published' where id=? and status='draft'").run(b.id).changes)q("insert or ignore into deliveries(issue,subscriber) select ?,id from newsletter_subscriptions where status='active'").run(b.id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}batch()}
if(action==='test')mail('owner@example.test',b.subject,b.body);
if(action==='remove')q("update newsletter_subscriptions set status='unsubscribed',token_hash=NULL,unsubscribe_hash=NULL,updated_at=?,unsubscribed_at=? where email=?").run(now,now,String(b.email).trim().toLowerCase());
return answer({issues:q('select * from issues order by id desc').all(),counts:q('select status,count(*) n from newsletter_subscriptions group by status').all(),inbox:q('select * from inbox order by id desc limit 40').all(),deliveries:q('select issue,status,count(*) n from deliveries group by issue,status').all(),html:template(b.subject||'',b.body||'')})
}catch(e){answer({error:'Unable to complete this request.'},400)}});
server.listen(Number(process.env.PORT||4173),process.env.HOST||'127.0.0.1',()=>console.log('AuraDigital preview on port '+server.address().port));
