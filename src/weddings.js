import {ApiError,json,readJson} from './http.js';
import {getAuthenticatedAdmin,sameOrigin} from './security.js';
import {signatureTheme,sampleInvitation} from '../weddings/signature-themes.js';

const schema=[
`CREATE TABLE IF NOT EXISTS wedding_invitations(id TEXT PRIMARY KEY,owner_hash TEXT NOT NULL,theme_id TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,data_json TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
`CREATE INDEX IF NOT EXISTS wedding_owner ON wedding_invitations(owner_hash)`,
`CREATE TABLE IF NOT EXISTS wedding_guests(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,token_hash TEXT UNIQUE NOT NULL,name TEXT NOT NULL,guest_limit INTEGER NOT NULL)`,
`CREATE INDEX IF NOT EXISTS wedding_guest_invitation ON wedding_guests(invitation_id)`,
`CREATE TABLE IF NOT EXISTS wedding_rsvps(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,identity_hash TEXT NOT NULL,name TEXT NOT NULL,response TEXT NOT NULL,attendees INTEGER NOT NULL,preferences TEXT NOT NULL,message TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(invitation_id,identity_hash))`,
`CREATE TABLE IF NOT EXISTS wedding_guestbook(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,name TEXT NOT NULL,message TEXT NOT NULL,reaction TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL)`,
`CREATE INDEX IF NOT EXISTS wedding_book_status ON wedding_guestbook(invitation_id,status)`,
`CREATE TABLE IF NOT EXISTS wedding_media(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,content_type TEXT NOT NULL,bytes BLOB NOT NULL,name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',created_at TEXT NOT NULL)`,
`CREATE INDEX IF NOT EXISTS wedding_media_status ON wedding_media(invitation_id,status)`,
`CREATE TABLE IF NOT EXISTS wedding_audit(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL,action TEXT NOT NULL,created_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS wedding_rate(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL)`
];
schema.push(
`CREATE TABLE IF NOT EXISTS wedding_audio(id TEXT PRIMARY KEY,invitation_id TEXT NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,content_type TEXT NOT NULL,size INTEGER NOT NULL,title TEXT NOT NULL,rights TEXT NOT NULL,created_at TEXT NOT NULL)`,
`CREATE TABLE IF NOT EXISTS wedding_audio_chunks(audio_id TEXT NOT NULL REFERENCES wedding_audio(id) ON DELETE CASCADE,part INTEGER NOT NULL,bytes BLOB NOT NULL,PRIMARY KEY(audio_id,part))`
);
const ready=new WeakSet();
async function ensure(db){if(!ready.has(db)){await db.batch(schema.map(s=>db.prepare(s)));ready.add(db)}}
const clean=(v,max=1000)=>typeof v==='string'?v.trim().slice(0,max):'';
const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),n=>n.toString(16).padStart(2,'0')).join('');
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const cookie=(r,name)=>r.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
const cookieHeader=(name,value)=>`${name}=${value}; Path=/api/weddings; Secure; HttpOnly; SameSite=Strict; Max-Age=31536000`;
export function safeMediaUrl(value){const v=clean(value,2048);if(!v)return '';if(/^\/api\/weddings\/(media|audio)\/[a-f0-9-]+$/.test(v))return v;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}}
function validInstant(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(value)||!Number.isFinite(Date.parse(value)))return false;const day=value.slice(0,10);return new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day}
export function validateWeddingData(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new ApiError(400,'Invalid invitation data.');
 const out={};
 for(const key of ['partnerOne','partnerTwo','arabicOne','arabicTwo','families','venue','address','dressCode','seal','thankYou','musicTitle'])out[key]=clean(input[key],key==='seal'?8:240);
 for(const key of ['message','messageAr','story'])out[key]=clean(input[key],4000);
 if(!out.partnerOne||!out.partnerTwo)throw new ApiError(400,'Both names are required.');
 out.timezone=clean(input.timezone,80);try{new Intl.DateTimeFormat('en',{timeZone:out.timezone}).format()}catch{throw new ApiError(400,'Choose a valid IANA timezone.')}
 if(!validInstant(input.eventAt))throw new ApiError(400,'Event time must include a timezone.');
 out.eventAt=new Date(input.eventAt).toISOString();
 out.lang=['ar','en'].includes(input.lang)?input.lang:'en';
 out.guestLimit=Number(input.guestLimit);if(!Number.isInteger(out.guestLimit)||out.guestLimit<1||out.guestLimit>30)throw new ApiError(400,'Guest limit must be 1–30.');
 for(const key of ['private','allowMaybe'])out[key]=input[key]===true;
 out.rsvpDeadline=clean(input.rsvpDeadline,40);if(out.rsvpDeadline&&!validInstant(out.rsvpDeadline))throw new ApiError(400,'RSVP deadline must include a timezone.');
 for(const [key,min,max]of [['lat',-90,90],['lng',-180,180]]){out[key]=input[key]==null||input[key]===''?null:Number(input[key]);if(out[key]!==null&&(!Number.isFinite(out[key])||out[key]<min||out[key]>max))throw new ApiError(400,'Invalid venue coordinates.')}
 if((out.lat===null)!==(out.lng===null))throw new ApiError(400,'Enter both venue coordinates.');
 out.hero=safeMediaUrl(input.hero);out.venuePhoto=safeMediaUrl(input.venuePhoto);out.musicUrl=safeMediaUrl(input.musicUrl);out.musicAuthorized=input.musicAuthorized===true;
 if(out.musicUrl&&!out.musicAuthorized)throw new ApiError(400,'Confirm your recording rights before adding music.');
 out.gallery=Array.isArray(input.gallery)?input.gallery.slice(0,30).map(x=>({url:safeMediaUrl(x.url),alt:clean(x.alt,240),focal:typeof x.focal==='string'&&/^\d{1,3}% \d{1,3}%$/.test(x.focal)?x.focal:'50% 50%'})).filter(x=>x.url):[];
 out.schedule=Array.isArray(input.schedule)?input.schedule.slice(0,12).map(x=>({title:clean(x.title,120),time:clean(x.time,20),description:clean(x.description,500),location:clean(x.location,240)})).filter(x=>x.title):[];
 const allowed=sampleInvitation.sections;out.sections=Array.isArray(input.sections)?[...new Set(input.sections.filter(x=>allowed.includes(x)))]:allowed;
 out.accent=/^#[a-f\d]{6}$/i.test(input.accent||'')?input.accent:'';out.animationSpeed=Math.min(1.5,Math.max(.5,Number(input.animationSpeed)||1));
 return out;
}
export function imageType(bytes){const b=new Uint8Array(bytes);if(b.length<12)return null;if(b[0]===255&&b[1]===216&&b[2]===255)return 'image/jpeg';if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return 'image/png';if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP')return 'image/webp';return null}
function mapRow(r){return {id:r.id,slug:r.slug,theme:r.theme_id,status:r.status,data:JSON.parse(r.data_json),updatedAt:r.updated_at}}
async function audit(db,id,action){await db.prepare('INSERT INTO wedding_audit VALUES(?,?,?,?)').bind(crypto.randomUUID(),id,action,new Date().toISOString()).run()}
async function rate(request,db,action,max){const minute=Math.floor(Date.now()/60000),key=await hash(`${request.headers.get('CF-Connecting-IP')||'local'}:${action}:${minute}`);const row=await db.prepare('INSERT INTO wedding_rate(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,minute+2).first();if(row.count>max)throw new ApiError(429,'Please try again in a minute.',{'Retry-After':'60'});await db.prepare('DELETE FROM wedding_rate WHERE expires<?').bind(minute).run()}
async function owner(request,db,row){const raw=cookie(request,'aw_owner');if(/^[a-f0-9]{64}$/.test(raw)&&await hash(raw)===row.owner_hash)return true;const admin=await getAuthenticatedAdmin(request,db);return Boolean(admin&&admin.role!=='viewer')}
async function guest(request,db,row){const data=JSON.parse(row.data_json),raw=new URL(request.url).searchParams.get('guest')||'';let record=null;if(raw){record=await db.prepare('SELECT id,name,guest_limit FROM wedding_guests WHERE invitation_id=? AND token_hash=?').bind(row.id,await hash(raw)).first();if(!record)throw new ApiError(403,'Invalid guest invitation.')}
 if(row.status!=='published')throw new ApiError(404,'Invitation is not published.');if(data.private&&!record)throw new ApiError(403,'A personal guest link is required.');
 let session=cookie(request,'aw_guest');const fresh=!/^[a-f0-9]{64}$/.test(session);if(fresh)session=token();return{identity:record?await hash('guest:'+record.id):await hash(session),limit:record?.guest_limit||data.guestLimit,name:record?.name||'',headers:fresh?{'Set-Cookie':cookieHeader('aw_guest',session)}:{}}}
async function boundedImage(request){if(Number(request.headers.get('Content-Length'))>786432)throw new ApiError(413,'Image limit is 768 KiB.');const reader=request.body?.getReader();if(!reader)throw new ApiError(400,'No image.');const chunks=[];let length=0;try{while(true){const{done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>786432){await reader.cancel();throw new ApiError(413,'Image limit is 768 KiB.')}chunks.push(value)}}finally{reader.releaseLock()}const b=new Uint8Array(length);let p=0;for(const c of chunks){b.set(c,p);p+=c.length}const type=imageType(b);if(!type||type!==request.headers.get('Content-Type')?.split(';')[0])throw new ApiError(415,'Use a valid JPEG, PNG or WebP image.');return{bytes:b,type}}
export function audioType(value){const b=new Uint8Array(value);if(b.length<12)return null;const text=String.fromCharCode(...b.slice(0,12));if(text.startsWith('ID3')||(b[0]===255&&(b[1]&224)===224))return 'audio/mpeg';if(text.startsWith('OggS'))return 'audio/ogg';if(text.startsWith('RIFF')&&text.slice(8)==='WAVE')return 'audio/wav';return null}
async function readBytes(request,max){if(Number(request.headers.get('Content-Length'))>max)throw new ApiError(413,'Recording limit is 10 MB.');const reader=request.body?.getReader();if(!reader)throw new ApiError(400,'Recording is empty.');let length=0;const parts=[];try{while(true){const{done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>max){await reader.cancel();throw new ApiError(413,'Recording limit is 10 MB.')}parts.push(value)}}finally{reader.releaseLock()}const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}return bytes}
export async function handleWeddings(request,env){
 const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/weddings'))return null;
 if(!env.DB)throw new ApiError(503,'Wedding storage is unavailable.');const db=env.DB;await ensure(db);
 if(!['GET','HEAD'].includes(request.method)&&!sameOrigin(request))throw new ApiError(403,'Invalid request origin.');
 if(path==='/api/weddings/admin/invitations'&&request.method==='GET'){
  const admin=await getAuthenticatedAdmin(request,db);if(!admin||!['owner','manager'].includes(admin.role))throw new ApiError(403,'Administrator access required.');
  const rows=await db.prepare('SELECT * FROM wedding_invitations ORDER BY updated_at DESC LIMIT 200').all();return json({items:rows.results.map(mapRow)});
 }
 if(path==='/api/weddings/invitations'&&request.method==='POST'){
  await rate(request,db,'create',5);const b=await readJson(request,48*1024);if(!signatureTheme(b.theme))throw new ApiError(400,'Unknown signature design.');const data=validateWeddingData(b.data);let raw=cookie(request,'aw_owner');if(!/^[a-f0-9]{64}$/.test(raw))raw=token();const id=crypto.randomUUID(),slug=crypto.randomUUID(),now=new Date().toISOString();await db.prepare('INSERT INTO wedding_invitations(id,owner_hash,theme_id,slug,data_json,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(id,await hash(raw),b.theme,slug,JSON.stringify(data),'draft',now,now).run();
  return json({id,slug,theme:b.theme,status:'draft',data},201,{'Set-Cookie':cookieHeader('aw_owner',raw)});
 }
 if(path==='/api/weddings/invitations'&&request.method==='GET'){
  const raw=cookie(request,'aw_owner');if(!raw)return json({items:[]});const rows=await db.prepare('SELECT * FROM wedding_invitations WHERE owner_hash=? ORDER BY updated_at DESC LIMIT 100').bind(await hash(raw)).all();return json({items:rows.results.map(mapRow)});
 }
 const pub=path.match(/^\/api\/weddings\/public\/([a-f0-9-]+)(?:\/(rsvp|guestbook|photos))?$/);
 if(pub){
  const row=await db.prepare('SELECT * FROM wedding_invitations WHERE slug=?').bind(pub[1]).first();if(!row)throw new ApiError(404,'Invitation not found.');const access=await guest(request,db,row),d=JSON.parse(row.data_json);
  if(request.method==='GET'&&!pub[2]){const wishes=await db.prepare("SELECT id,name,message,reaction FROM wedding_guestbook WHERE invitation_id=? AND status='approved' ORDER BY created_at DESC LIMIT 100").bind(row.id).all();const media=await db.prepare("SELECT id,name FROM wedding_media WHERE invitation_id=? AND status='approved' LIMIT 100").bind(row.id).all();return json({theme:row.theme_id,data:d,guestName:access.name,guestLimit:access.limit,wishes:wishes.results,photos:media.results.map(m=>({url:`/api/weddings/media/${m.id}`,alt:m.name}))},200,access.headers)}
  if(request.method==='POST'){
   if(!['rsvp','guestbook','photos'].includes(pub[2]))throw new ApiError(404,'Not found.');await rate(request,db,pub[2],pub[2]==='photos'?5:10);
   if(pub[2]==='photos'){if(url.searchParams.get('consent')!=='1')throw new ApiError(400,'Consent is required.');if(!d.sections.includes('photos'))throw new ApiError(403,'Photo wall is disabled.');if(!cookie(request,'aw_guest')&&!url.searchParams.get('guest'))throw new ApiError(403,'Open the invitation first.');const count=await db.prepare('SELECT count(*) AS count FROM wedding_media WHERE invitation_id=?').bind(row.id).first();if(count.count>=100)throw new ApiError(409,'Photo wall has reached its capacity.');const image=await boundedImage(request),id=crypto.randomUUID();await db.prepare('INSERT INTO wedding_media VALUES(?,?,?,?,?,?,?)').bind(id,row.id,image.type,image.bytes,clean(url.searchParams.get('name'),120)||'Guest photograph','pending',new Date().toISOString()).run();return json({id,status:'pending'},201,access.headers)}
   const b=await readJson(request,8192);if(b.website)throw new ApiError(400,'Unable to submit.');const name=clean(b.name,120);if(!name)throw new ApiError(400,'Your name is required.');if(b.consent!==true)throw new ApiError(400,'Consent is required.');
   if(pub[2]==='rsvp'){
    if(!d.sections.includes('rsvp'))throw new ApiError(403,'RSVP is disabled.');if(d.rsvpDeadline&&Date.now()>Date.parse(d.rsvpDeadline))throw new ApiError(409,'The RSVP deadline has passed.');if(!cookie(request,'aw_guest')&&!url.searchParams.get('guest'))throw new ApiError(403,'Open the invitation first.');const response=clean(b.response,10);if(!['yes','no',...(d.allowMaybe?['maybe']:[])].includes(response))throw new ApiError(400,'Invalid attendance choice.');const attendees=response==='no'?0:Number(b.attendees);if(!Number.isInteger(attendees)||attendees<0||attendees>access.limit||(response!=='no'&&attendees<1))throw new ApiError(400,'Attendee count exceeds your invitation.');
    await db.prepare('INSERT INTO wedding_rsvps VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(invitation_id,identity_hash) DO UPDATE SET name=excluded.name,response=excluded.response,attendees=excluded.attendees,preferences=excluded.preferences,message=excluded.message,updated_at=excluded.updated_at').bind(crypto.randomUUID(),row.id,access.identity,name,response,attendees,clean(b.preferences,1000),clean(b.message,2000),new Date().toISOString()).run();return json({saved:true,response},200,access.headers);
   }
   if(!d.sections.includes('guestbook'))throw new ApiError(403,'Guestbook is disabled.');const message=clean(b.message,2000);if(!message)throw new ApiError(400,'Enter your wishes.');await db.prepare('INSERT INTO wedding_guestbook VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),row.id,name,message,['♡','🌸','✨','🎉'].includes(b.reaction)?b.reaction:'♡','pending',new Date().toISOString()).run();return json({saved:true,status:'pending'},201,access.headers);
  }
 }
 const audio=path.match(/^\/api\/weddings\/audio\/([a-f0-9-]+)$/);
 if(audio&&['GET','HEAD'].includes(request.method)){
  const track=await db.prepare('SELECT * FROM wedding_audio WHERE id=?').bind(audio[1]).first();if(!track)throw new ApiError(404,'Recording not found.');
  const invitation=await db.prepare('SELECT * FROM wedding_invitations WHERE id=?').bind(track.invitation_id).first();if(!await owner(request,db,invitation))await guest(request,db,invitation);
  let start=0,end=track.size-1,status=200;const range=request.headers.get('Range');
  if(range){const match=range.match(/^bytes=(\d+)-(\d*)$/);if(!match)throw new ApiError(416,'Unsupported audio range.');start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end||start>=track.size)throw new ApiError(416,'Audio range is outside the recording.');status=206}
  const headers={'Content-Type':track.content_type,'Content-Length':String(end-start+1),'Accept-Ranges':'bytes','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};if(status===206)headers['Content-Range']=`bytes ${start}-${end}/${track.size}`;
  if(request.method==='HEAD')return new Response(null,{status,headers});
  const first=Math.floor(start/524288),last=Math.floor(end/524288);let part=first;
  const stream=new ReadableStream({async pull(controller){try{if(part>last){controller.close();return}const chunk=await db.prepare('SELECT bytes FROM wedding_audio_chunks WHERE audio_id=? AND part=?').bind(track.id,part).first();if(!chunk)throw new Error('Missing audio chunk');const bytes=new Uint8Array(chunk.bytes);const from=part===first?start%524288:0,to=part===last?end%524288+1:bytes.length;controller.enqueue(bytes.slice(from,to));part++}catch(error){controller.error(error)}}});return new Response(stream,{status,headers});
 }
 const media=path.match(/^\/api\/weddings\/media\/([a-f0-9-]+)$/);
 if(media&&request.method==='GET'){const m=await db.prepare('SELECT * FROM wedding_media WHERE id=?').bind(media[1]).first();if(!m)throw new ApiError(404,'Image not found.');const row=await db.prepare('SELECT * FROM wedding_invitations WHERE id=?').bind(m.invitation_id).first();if(!await owner(request,db,row)){await guest(request,db,row);if(m.status!=='approved')throw new ApiError(404,'Image not available.')}return new Response(m.bytes,{headers:{'Content-Type':m.content_type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
 const owned=path.match(/^\/api\/weddings\/invitations\/([a-f0-9-]+)(?:\/(publish|guests|responses|moderate|media|music|export))?$/);
 if(owned){const row=await db.prepare('SELECT * FROM wedding_invitations WHERE id=?').bind(owned[1]).first();if(!row)throw new ApiError(404,'Invitation not found.');if(!await owner(request,db,row))throw new ApiError(403,'Owner or editor access required.');
  if(request.method==='GET'&&!owned[2])return json(mapRow(row));
  if(request.method==='PATCH'&&!owned[2]){const b=await readJson(request,48*1024);if(!signatureTheme(b.theme))throw new ApiError(400,'Unknown theme.');const d=validateWeddingData(b.data);await db.prepare('UPDATE wedding_invitations SET theme_id=?,data_json=?,updated_at=? WHERE id=?').bind(b.theme,JSON.stringify(d),new Date().toISOString(),row.id).run();await audit(db,row.id,'edit');return json({saved:true})}
  if(request.method==='DELETE'&&!owned[2]){await db.batch([db.prepare('DELETE FROM wedding_audio_chunks WHERE audio_id IN (SELECT id FROM wedding_audio WHERE invitation_id=?)').bind(row.id),db.prepare('DELETE FROM wedding_audio WHERE invitation_id=?').bind(row.id)]);await db.batch(['wedding_guests','wedding_rsvps','wedding_guestbook','wedding_media','wedding_audit'].map(table=>db.prepare(`DELETE FROM ${table} WHERE invitation_id=?`).bind(row.id)).concat([db.prepare('DELETE FROM wedding_invitations WHERE id=?').bind(row.id)]));return json({deleted:true})}
  if(request.method==='POST'&&owned[2]==='publish'){const d=JSON.parse(row.data_json);if(!d.venue||!d.address||d.venue===sampleInvitation.venue||d.address===sampleInvitation.address)throw new ApiError(400,'Complete venue information before publishing.');await db.prepare("UPDATE wedding_invitations SET status='published',updated_at=? WHERE id=?").bind(new Date().toISOString(),row.id).run();await audit(db,row.id,'publish');return json({published:true,url:`${url.origin}/weddings/i/${row.slug}`})}
  if(request.method==='POST'&&owned[2]==='guests'){const b=await readJson(request,2048),name=clean(b.name,120),limit=Number(b.limit),d=JSON.parse(row.data_json);if(!name||!Number.isInteger(limit)||limit<1||limit>d.guestLimit)throw new ApiError(400,'Enter a name and a valid guest limit.');const raw=token(),id=crypto.randomUUID();await db.prepare('INSERT INTO wedding_guests VALUES(?,?,?,?,?)').bind(id,row.id,await hash(raw),name,limit).run();await audit(db,row.id,'guest-created');return json({id,url:`${url.origin}/weddings/i/${row.slug}?guest=${raw}`},201)}
  if(request.method==='GET'&&['responses','export'].includes(owned[2])){const responses=await db.prepare('SELECT name,response,attendees,preferences,message,updated_at FROM wedding_rsvps WHERE invitation_id=? ORDER BY updated_at DESC').bind(row.id).all();if(owned[2]==='export'){const fields=['name','response','attendees','preferences','message','updated_at'];const csv=[fields.join(','),...responses.results.map(r=>fields.map(k=>'"'+String(r[k]).replace(/^\s*[=+@-]/,m=>"'"+m).replaceAll('"','""')+'"').join(','))].join('\r\n');return new Response('\uFEFF'+csv,{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="wedding-attendance.csv"','Cache-Control':'no-store'}})}const wishes=await db.prepare('SELECT id,name,message,reaction,status FROM wedding_guestbook WHERE invitation_id=? ORDER BY created_at DESC LIMIT 200').bind(row.id).all(),photos=await db.prepare('SELECT id,name,status FROM wedding_media WHERE invitation_id=? LIMIT 100').bind(row.id).all();return json({responses:responses.results,wishes:wishes.results,photos:photos.results})}
  if(request.method==='POST'&&owned[2]==='moderate'){const b=await readJson(request,2048);if(!['guestbook','media'].includes(b.kind)||!['approved','rejected','delete'].includes(b.status))throw new ApiError(400,'Invalid moderation action.');const table=b.kind==='media'?'wedding_media':'wedding_guestbook';await db.prepare(b.status==='delete'?`DELETE FROM ${table} WHERE id=? AND invitation_id=?`:`UPDATE ${table} SET status=? WHERE id=? AND invitation_id=?`).bind(...(b.status==='delete'?[b.id,row.id]:[b.status,b.id,row.id])).run();await audit(db,row.id,`moderate-${b.kind}-${b.status}`);return json({saved:true})}
  if(request.method==='POST'&&owned[2]==='music'){
   if(url.searchParams.get('authorized')!=='1')throw new ApiError(400,'Confirm permission to use this recording.');await rate(request,db,'audio-upload',3);
   const count=await db.prepare('SELECT count(*) AS n FROM wedding_audio WHERE invitation_id=?').bind(row.id).first();if(count.n>=3)throw new ApiError(409,'Maximum three recordings per invitation.');
   const bytes=await readBytes(request,10*1024*1024),type=audioType(bytes);if(!type||type!==request.headers.get('Content-Type')?.split(';')[0])throw new ApiError(415,'Use a valid MP3, Ogg or WAV recording.');
   const id=crypto.randomUUID(),title=clean(url.searchParams.get('title'),240)||'Our wedding music',statements=[db.prepare('INSERT INTO wedding_audio VALUES(?,?,?,?,?,?,?)').bind(id,row.id,type,bytes.length,title,'Uploader confirms authorization; not independently verified',new Date().toISOString())];
   for(let part=0;part*524288<bytes.length;part++)statements.push(db.prepare('INSERT INTO wedding_audio_chunks VALUES(?,?,?)').bind(id,part,bytes.slice(part*524288,(part+1)*524288)));
   await db.batch(statements);await audit(db,row.id,'music-upload');return json({url:`/api/weddings/audio/${id}`,title},201);
  }
  if(request.method==='POST'&&owned[2]==='media'){await rate(request,db,'owner-media',15);const image=await boundedImage(request),id=crypto.randomUUID();await db.prepare('INSERT INTO wedding_media VALUES(?,?,?,?,?,?,?)').bind(id,row.id,image.type,image.bytes,'Couple photograph','approved',new Date().toISOString()).run();return json({url:`/api/weddings/media/${id}`},201)}
 }
 return json({error:'Not found.'},404);
}
