export async function renderGlobalPricing(root,api) {
 const data=await api('/api/admin/global-pricing');let config=data.config;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 root.replaceChildren();const panel=el('section');panel.className='panel';root.append(panel);
 panel.append(el('h2','Global Pricing'),el('p','Save a draft, preview each region, then publish approved rates. Blank prices require a quotation. Historical agreements remain unchanged.'));
 const notice=el('p');notice.setAttribute('role','status');
 const region=el('select');region.setAttribute('aria-label','Pricing region');
 Object.entries(config.regions).forEach(([id,r])=>{const o=el('option',r.name+' — '+r.currency);o.value=id;region.append(o);});panel.append(region);
 const fields=el('div');fields.className='pricing-form';panel.append(fields);
 const readRates=()=>fields.querySelectorAll('[data-rate]').forEach(input=>{
  const rates=config.prices[region.value]??={},id=input.dataset.rate;
  if(input.value==='')delete rates[id];else {const factor=config.regions[region.value].currency==='TND'?1000:100;rates[id]={...rates[id],minor:Math.round(Number(input.value)*factor)};}
  config.prices[region.value]=rates;
 });
 let previous=region.value;
 const draw=()=>{
  fields.replaceChildren();const factor=config.regions[region.value].currency==='TND'?1000:100;
  for(const service of data.services){const label=el('label',service.name+' · '+service.billing+' · '+config.regions[region.value].currency),input=el('input');input.type='number';input.min='0';input.step=String(1/factor);input.dataset.rate=service.id;input.value=config.prices[region.value]?.[service.id]?.minor===undefined?'':config.prices[region.value][service.id].minor/factor;input.placeholder='Request Quote';label.append(input);fields.append(label);}
 };
 region.onchange=()=>{const next=region.value;region.value=previous;readRates();region.value=next;previous=next;draw();};draw();
 const advanced=el('details');advanced.append(el('summary','Regions, countries, promotions, availability and research'));
 advanced.append(el('p','Amounts below use integer minor units: TRY/USD/EUR/GBP ×100, TND ×1000. Set region enabled, currency, fallback and country mappings here. Promotions use promoMinor, promoFrom and promoUntil (ISO dates); validity uses validFrom/validUntil. Research recommendations stay private and do not change public prices.'));
 const editor=el('textarea');editor.rows=18;editor.style.width='100%';editor.setAttribute('aria-label','Advanced regional configuration JSON');editor.value=JSON.stringify(config,null,2);advanced.append(editor);panel.append(advanced);
 let advancedDirty=false;editor.oninput=()=>advancedDirty=true;
 const collect=()=>{if(advancedDirty){config=JSON.parse(editor.value);}else{readRates();editor.value=JSON.stringify(config,null,2);}return config;};
 const actions=el('div');actions.className='wide-actions';panel.append(actions,notice);
 const button=(text,fn)=>{const b=el('button',text);b.className='btn btn-dark';b.type='button';b.onclick=async()=>{b.disabled=true;notice.textContent='Working…';try{await fn();}catch(e){notice.textContent=e.message;}finally{b.disabled=false;}};actions.append(b);};
 const post=(action,body)=>api('/api/admin/global-pricing/'+action,{method:'POST',body:JSON.stringify({revision:data.revision,...body})});
 button('Save draft',async()=>{await post('draft',{config:collect()});await renderGlobalPricing(root,api);});
 button('Preview selected region',async()=>{const preview=await post('preview',{config:collect(),region:region.value});const lines=Object.values(preview.catalogue).filter(Array.isArray).flat().map(p=>p.name+': '+(p.price===null?'Request Quote':p.price+' '+preview.catalogue.currency)+' / '+(p.billing||'once'));notice.textContent='UNPUBLISHED PREVIEW\n'+lines.join('\n');notice.style.whiteSpace='pre-wrap';});
 button('Publish saved draft',async()=>{await post('publish',{});await renderGlobalPricing(root,api);});
 const research=el('details');research.append(el('summary','Regional pricing research and recommendations'));
 research.append(el('p','Record comparable scope, freelancer/agency segment, purchasing power, delivery/support costs, hosting/payment/tax costs, margin and currency risk. Verify each source and date. Recommendations are private until an owner explicitly enters and publishes an approved price.'));
 const notes=el('textarea');notes.rows=12;notes.style.width='100%';notes.setAttribute('aria-label','Private research and recommendation JSON');notes.value=JSON.stringify(config.research||{TR:{sources:[],scope:'',segment:'agency',purchasingPower:'',deliveryCosts:'',thirdPartyCosts:'',taxTreatment:'',targetMargin:'',currencyRisk:'',classification:'competitive',recommendedMinor:null,status:'unreviewed'}},null,2);research.append(notes);panel.append(research);notes.oninput=()=>{try{config.research=JSON.parse(notes.value);editor.value=JSON.stringify(config,null,2);notice.textContent='Research changed; save draft to retain it.';}catch{notice.textContent='Research JSON is incomplete.';}};
 const history=el('details');history.append(el('summary','Version history and audit trail'));panel.append(history);
 for(const version of data.history){const row=el('div');row.append(el('p',version.created_at+' · '+version.actor+' · '+version.action+' · '+version.id));const changes=el('pre',JSON.stringify(JSON.parse(version.changes),null,2));changes.style.whiteSpace='pre-wrap';row.append(changes);const restore=el('button','Restore as unpublished draft');restore.className='btn btn-light';restore.onclick=async()=>{try{await post('restore',{version:version.id});await renderGlobalPricing(root,api);}catch(e){notice.textContent=e.message;}};row.append(restore);history.append(row);}
}
