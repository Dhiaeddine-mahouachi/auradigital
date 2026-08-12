import { json, readJson } from './http.js';
import { getAuthenticatedAdmin, sameOrigin } from './security.js';

const ORIGINS = new Set(['https://auramenu.space','https://www.auramenu.space','http://localhost:4173','http://127.0.0.1:4173']);
const BODY_BYTES = 5 * 1024 * 1024;
const IMAGE_BYTES = 280 * 1024;
const IMAGE_CHARS = Math.ceil((IMAGE_BYTES * 4) / 3) + 64;
const IMAGE_TYPES = new Set(['image/jpeg','image/png','image/webp']);
const ACCESS_PRICE = 100;

function cors(request){
  const origin=request.headers.get('Origin');
  if(!origin) return {};
  if(!ORIGINS.has(origin)) return null;
  return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'Content-Type, X-Aura-Menu-Token','Access-Control-Allow-Methods':'GET, POST, PATCH, OPTIONS','Access-Control-Max-Age':'86400',Vary:'Origin'};
}
function clean(value,max=500){return typeof value==='string'?value.trim().slice(0,max):'';}
function url(value){const text=clean(value,800);if(!text)return '';try{const parsed=new URL(text);return ['http:','https:'].includes(parsed.protocol)?parsed.toString():'';}catch{return '';}}
function parse(value,fallback){try{return JSON.parse(value);}catch{return fallback;}}
function phone(value){return String(value||'').replace(/\D/g,'');}
async function sha256(value){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
async function ensure(db){
  await db.prepare("CREATE TABLE IF NOT EXISTS auramenu_edit_access (menu_id TEXT PRIMARY KEY NOT NULL, token_hash TEXT NOT NULL DEFAULT '', request_status TEXT NOT NULL DEFAULT 'none', requested_at TEXT, access_until TEXT, paid_amount INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')), FOREIGN KEY (menu_id) REFERENCES auramenu_requests(id) ON DELETE CASCADE)").run();
}
function active(row){return Boolean(row?.access_until && Date.parse(row.access_until)>Date.now());}
function publicMenu(row,access){return {id:row.id,slug:row.slug,templateId:row.template_id,interfaceLanguage:row.interface_language,menuLanguage:row.menu_language,businessName:row.business_name,tagline:row.tagline,description:row.description,address:row.address,businessPhone:row.business_phone,whatsapp:row.whatsapp,openingHours:row.opening_hours,currency:row.currency,categories:parse(row.categories_json,[]),status:row.status,paymentStatus:row.payment_status,revision:row.revision,updatedAt:row.updated_at,approvedAt:row.approved_at,editAccess:{pricePerDay:ACCESS_PRICE,requestStatus:access?.request_status||'none',requestedAt:access?.requested_at||null,accessUntil:access?.access_until||null,active:active(access)}};}
async function rowFor(db,id){return db.prepare('SELECT * FROM auramenu_requests WHERE id = ? LIMIT 1').bind(id).first();}
async function accessFor(db,id){return db.prepare('SELECT * FROM auramenu_edit_access WHERE menu_id = ? LIMIT 1').bind(id).first();}
async function requireToken(request,db,id){const token=clean(request.headers.get('X-Aura-Menu-Token'),200);if(!token)return null;const access=await accessFor(db,id);if(!access?.token_hash)return null;return (await sha256(token))===access.token_hash?access:null;}
function hasBytes(bytes,expected,offset=0){return expected.every((v,i)=>bytes[offset+i]===v);}
function decodeImage(dataUrl){
  const match=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(String(dataUrl||'').trim());
  if(!match) throw new Error('Yalnızca JPG, PNG veya WebP fotoğraf yükleyebilirsiniz.');
  const contentType=match[1].toLowerCase(),encoded=match[2];
  if(!IMAGE_TYPES.has(contentType)||!encoded||encoded.length%4!==0||encoded.length>IMAGE_CHARS)throw new Error('Fotoğraf geçersiz veya çok büyük.');
  let binary;try{binary=atob(encoded);}catch{throw new Error('Fotoğraf geçersiz.');}
  if(!binary.length||binary.length>IMAGE_BYTES)throw new Error('Fotoğraf çok büyük.');
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const valid=(contentType==='image/jpeg'&&hasBytes(bytes,[0xff,0xd8,0xff]))||(contentType==='image/png'&&hasBytes(bytes,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))||(contentType==='image/webp'&&hasBytes(bytes,[0x52,0x49,0x46,0x46])&&hasBytes(bytes,[0x57,0x45,0x42,0x50],8));
  if(!valid)throw new Error('Fotoğraf içeriği geçersiz.');
  return {contentType,bytes:bytes.buffer};
}
function normalizeCategories(value){
  if(!Array.isArray(value)||value.length<1||value.length>12)throw new Error('1 ile 12 kategori olmalıdır.');
  let count=0;
  const categories=value.map((category,index)=>{
    const name=clean(category?.name,80);if(!name)throw new Error(`Kategori ${index+1} için isim girin.`);
    const items=Array.isArray(category?.items)?category.items:[];if(items.length>20)throw new Error('Bir kategoride en fazla 20 ürün olabilir.');
    return {name,emoji:clean(category?.emoji,12),items:items.map((item,itemIndex)=>{const itemName=clean(item?.name,100);if(!itemName)throw new Error(`${name} kategorisindeki ${itemIndex+1}. ürün adını girin.`);count++;return {name:itemName,description:clean(item.description,300),price:clean(item.price,40),imageUrl:url(item.imageUrl),imageData:typeof item.imageData==='string'?item.imageData.trim():'',featured:Boolean(item.featured)};})};
  });
  if(count<1||count>100)throw new Error('Menüde 1 ile 100 ürün olmalıdır.');
  return categories;
}
async function replaceImages(db,id,categories,origin){
  const inserts=[];
  for(const category of categories){for(const item of category.items){if(!item.imageData){delete item.imageData;continue;}const image=decodeImage(item.imageData);delete item.imageData;const imageId=crypto.randomUUID();item.imageUrl=`${origin}/api/auramenu/images/${imageId}`;inserts.push(db.prepare('INSERT INTO auramenu_images (id, request_id, content_type, image_bytes) VALUES (?, ?, ?, ?)').bind(imageId,id,image.contentType,image.bytes));}}
  if(inserts.length)await db.batch(inserts);
}

export async function handleAuraMenuDashboard(request,env){
  const u=new URL(request.url);if(!u.pathname.startsWith('/api/auramenu/dashboard')&&!u.pathname.startsWith('/api/admin/auramenu-access'))return null;
  await ensure(env.DB);
  const headers=cors(request);if(u.pathname.startsWith('/api/auramenu/dashboard')){
    if(headers===null)return json({error:'Bu kaynaktan talep kabul edilmiyor.'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    const claim=u.pathname.match(/^\/api\/auramenu\/dashboard\/([a-f0-9-]+)\/claim$/i);
    if(claim&&request.method==='POST'){
      const body=await readJson(request,8192);const row=await rowFor(env.DB,claim[1]);if(!row||phone(body.contactPhone)!==phone(row.contact_phone))return json({error:'Menü bilgileri doğrulanamadı.'},401,headers);
      let access=await accessFor(env.DB,row.id);let token=clean(body.existingToken,200);if(!token||!access?.token_hash||(await sha256(token))!==access.token_hash){token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');const hash=await sha256(token);await env.DB.prepare("INSERT INTO auramenu_edit_access (menu_id, token_hash) VALUES (?, ?) ON CONFLICT(menu_id) DO UPDATE SET token_hash=excluded.token_hash, updated_at=datetime('now')").bind(row.id,hash).run();access=await accessFor(env.DB,row.id);}
      return json({token,menu:publicMenu(row,access)},200,{'Cache-Control':'no-store',...headers});
    }
    const match=u.pathname.match(/^\/api\/auramenu\/dashboard\/([a-f0-9-]+)(?:\/(access-request))?$/i);if(!match)return json({error:'Not found.'},404,headers);
    const id=match[1],action=match[2];const row=await rowFor(env.DB,id);if(!row)return json({error:'Menü bulunamadı.'},404,headers);
    const tokenAccess=await requireToken(request,env.DB,id);if(!tokenAccess)return json({error:'Dashboard access denied.'},401,{'Cache-Control':'no-store',...headers});
    if(action==='access-request'&&request.method==='POST'){
      if(active(tokenAccess))return json({menu:publicMenu(row,tokenAccess)},200,headers);
      await env.DB.prepare("UPDATE auramenu_edit_access SET request_status='requested', requested_at=datetime('now'), updated_at=datetime('now') WHERE menu_id=?").bind(id).run();
      return json({menu:publicMenu(row,await accessFor(env.DB,id))},200,{'Cache-Control':'no-store',...headers});
    }
    if(!action&&request.method==='GET')return json({menu:publicMenu(row,tokenAccess)},200,{'Cache-Control':'no-store',...headers});
    if(!action&&request.method==='PATCH'){
      if(!active(tokenAccess))return json({error:'Düzenleme erişimi kilitli. 24 saatlik erişim için 100 TL ödeme onayı gerekir.'},403,{'Cache-Control':'no-store',...headers});
      const body=await readJson(request,BODY_BYTES);let categories=normalizeCategories(body.categories);await replaceImages(env.DB,id,categories,new URL(request.url).origin);
      const template=['modern','orbit','maison','taste3d'].includes(String(body.templateId))?String(body.templateId):row.template_id;
      const lang=['tr','en','ar'].includes(String(body.menuLanguage))?String(body.menuLanguage):row.menu_language;
      const currency=['TRY','EUR','USD','TND'].includes(String(body.currency))?String(body.currency):row.currency;
      await env.DB.prepare("UPDATE auramenu_requests SET template_id=?, menu_language=?, business_name=?, tagline=?, description=?, address=?, business_phone=?, whatsapp=?, opening_hours=?, currency=?, categories_json=?, updated_at=datetime('now'), revision=revision+1 WHERE id=?")
        .bind(template,lang,clean(body.businessName,100)||row.business_name,clean(body.tagline,140),clean(body.description,600),clean(body.address,220),clean(body.businessPhone,40),clean(body.whatsapp,40),clean(body.openingHours,100),currency,JSON.stringify(categories),id).run();
      return json({menu:publicMenu(await rowFor(env.DB,id),await accessFor(env.DB,id))},200,{'Cache-Control':'no-store',...headers});
    }
    return json({error:'Method not allowed.'},405,headers);
  }

  const admin=await getAuthenticatedAdmin(request,env.DB);if(!admin)return json({error:'Unauthorized.'},401,{'Cache-Control':'no-store'});
  if(['POST','PATCH','DELETE'].includes(request.method)&&!sameOrigin(request))return json({error:'Invalid request origin.'},403);
  const adminMatch=u.pathname.match(/^\/api\/admin\/auramenu-access(?:\/([a-f0-9-]+))?$/i);if(!adminMatch)return json({error:'Not found.'},404);
  const id=adminMatch[1];
  if(request.method==='GET'&&!id){const rows=await env.DB.prepare("SELECT r.id,r.slug,r.business_name,r.contact_name,r.contact_phone,r.email,r.status,r.updated_at,a.request_status,a.requested_at,a.access_until,a.paid_amount FROM auramenu_requests r LEFT JOIN auramenu_edit_access a ON a.menu_id=r.id ORDER BY CASE WHEN a.request_status='requested' THEN 0 ELSE 1 END, r.created_at DESC LIMIT 100").all();return json({items:(rows.results||[]).map(r=>({...r,accessActive:Boolean(r.access_until&&Date.parse(r.access_until)>Date.now()),pricePerDay:ACCESS_PRICE}))},200,{'Cache-Control':'no-store'});}
  if(request.method==='PATCH'&&id){const row=await rowFor(env.DB,id);if(!row)return json({error:'Menü bulunamadı.'},404);const body=await readJson(request,8192);if(body.action==='activate'){const days=Math.max(1,Math.min(30,Number(body.days)||1));const amount=ACCESS_PRICE*days;await env.DB.prepare("INSERT INTO auramenu_edit_access (menu_id, request_status, requested_at, access_until, paid_amount) VALUES (?, 'approved', datetime('now'), datetime('now', ?), ?) ON CONFLICT(menu_id) DO UPDATE SET request_status='approved', access_until=datetime('now', ?), paid_amount=?, updated_at=datetime('now')").bind(id,`+${days} day`,amount,`+${days} day`,amount).run();return json({ok:true,access:await accessFor(env.DB,id),amount},200);}if(body.action==='lock'){await env.DB.prepare("INSERT INTO auramenu_edit_access (menu_id, request_status, access_until) VALUES (?, 'none', NULL) ON CONFLICT(menu_id) DO UPDATE SET request_status='none', access_until=NULL, updated_at=datetime('now')").bind(id).run();return json({ok:true},200);}return json({error:'Unknown action.'},400);}
  return json({error:'Method not allowed.'},405);
}
