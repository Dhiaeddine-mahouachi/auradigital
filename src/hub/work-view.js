import { hubIcon, hubLabels } from './hub-navigation.js';

const statusKeys={lead:'Received',new:'Received',contacted:'Contacted',active:'Active',waiting:'Waiting for details',completed:'Completed',cancelled:'Cancelled',production:'In production',in_production:'In production',waiting_client:'Waiting for details',review:'Ready for review',quote_ready:'Quote ready'};
const attentionStatuses=new Set(['waiting','waiting_client','review','quote_ready']);
const terminal=new Set(['completed','cancelled']);
const state=r=>attentionStatuses.has(r.status)?r.status:r.productionStatus||r.status;
export const workStatus=r=>statusKeys[state(r)]||String(state(r)||'').replaceAll('_',' ');
export function workRows(drafts,work) {
 const attention=drafts.filter(d=>!d.reviewed&&d.state!=='archived').map(d=>({
  ...d,kind:'menu',name:d.draft.fields.businessName||'AuraMenu',blocking:d.state==='preview',
 }));
 attention.push(...work.requests.filter(r=>attentionStatuses.has(state(r))).map(r=>({...r,kind:'request',blocking:true})));
 const due=r=>Date.parse(r.dueDate)||Infinity;
 const overdue=r=>due(r)<Date.now();
 attention.sort((a,b)=>Number(overdue(b))-Number(overdue(a))||Number(b.blocking)-Number(a.blocking)||(due(a)===due(b)?0:due(a)-due(b))||a.id.localeCompare(b.id));
 const progress=work.requests.filter(r=>!attentionStatuses.has(state(r))&&!terminal.has(state(r))).map(r=>({...r,kind:'request'}));
 return {attention,progress,services:work.services};
}
export function renderWorkRow(record,{ui,esc,link}) {
 const menu=record.kind==='menu';
 const action=menu?ui.reviewMenu:ui.openRequest;
 return `<a class="hub-work-row" href="${esc(link(menu?'menuDrafts':'services',menu?{draft:record.id}:{request:record.id}))}">
  <span class="hub-row-icon">${hubIcon(menu?'journey':'services')}</span><span><strong>${esc(record.name)}</strong>
  <small>${esc(menu?ui.menuReady:workStatus(record))}</small></span><span class="hub-row-action">${esc(action)} <span aria-hidden="true">↗</span></span></a>`;
}

const serviceOptions=['Web Design','Website Care','Pricing / Quote','Hosting / Security','Business Email','Spinflow ERP','NFC Card','AuraMenu','AuraWeddings','Ad Management','SEO / Google Maps','AI & Automation','Other'];
export function renderRequestForm({host,lang,esc,me,workspace,service,task,draft,back,submitted}) {
 const ui=hubLabels(lang);
 const labels={
  en:['Request a service','Service','Phone number','What would you like us to do?','Send request','Cancel'],
  fr:['Demander un service','Service','Téléphone','Que souhaitez-vous réaliser ?','Envoyer la demande','Annuler'],
  tr:['Hizmet iste','Hizmet','Telefon','Ne yapmamızı istersiniz?','Talebi gönder','İptal'],
  ar:['اطلب خدمة','الخدمة','رقم الهاتف','ما الذي تود أن ننجزه؟','إرسال الطلب','إلغاء'],
 }[lang];
 host.innerHTML=`<section class="panel"><h2>${labels[0]}</h2><form data-hub-request>
  <label class="field">${labels[1]}<select name="service">${serviceOptions.map(value=>`<option ${service===value?'selected':''}>${esc(value)}</option>`).join('')}</select></label>
  <label class="field">${labels[2]}<input name="phone" type="tel" maxlength="50" autocomplete="tel" required></label>
  <label class="field">${labels[3]}<textarea name="message" rows="4" maxlength="1700" required>${esc(draft.slice(0,1700))}</textarea></label>
  <p role="alert"></p><button class="primary">${labels[4]}</button> <a class="secondary" href="${esc(back)}">${labels[5]}</a>
  </form></section>`;
 const form=host.querySelector('form');

 form.onsubmit=async event=>{
  event.preventDefault();
  const submit=form.querySelector('button');
  if(submit.disabled)return;
  const {phone,message,service}=Object.fromEntries(new FormData(form));
  const payload={name:me.name,email:me.email,phone,service,message:[task,message].filter(Boolean).join('\n'),language:lang==='fr'?'en':lang,workspaceId:workspace.organization.id};
  const body=JSON.stringify(payload);
  submit.disabled=true;
  try{
   const fingerprint=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body)));
   const storageKey='aura-hub-request:'+Array.from(fingerprint,byte=>byte.toString(16).padStart(2,'0')).join('');
   let key=crypto.randomUUID();
   try{key=sessionStorage.getItem(storageKey)||key;sessionStorage.setItem(storageKey,key);}catch{}
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body});
   const data=await response.json();
   if(!response.ok||!data.requestId)throw new Error(data.error||ui.unavailable);
   try{sessionStorage.removeItem(storageKey);}catch{}
   if(form.isConnected)submitted(data.requestId);
  }catch(error){form.querySelector('[role="alert"]').textContent=error.message;}
  finally{submit.disabled=false;}
 };
}
