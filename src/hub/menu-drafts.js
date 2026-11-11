// Private draft editor. Uses the existing shared customer session and organization API.
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function renderMenuDrafts({ host, api, endpoint, profile, canWrite }) {
  let selected = null, working = null;
  const base = endpoint('menu-drafts');
  function message(text) { host.querySelector('#menu-save-status').textContent = text; }
  function newDraft() {
    return { fields: { businessName: profile.name || '', currency: ['TRY','EUR','USD','TND'].includes(profile.currency) ? profile.currency : 'TRY', menuLanguage: 'en', templateId: 'modern' }, categories: [] };
  }
  function download() {
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, draft: read() },null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='auramenu-draft.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function read() {
    const next = structuredClone(working);
    next.fields.businessName = host.querySelector('#private-menu-name').value;
    next.fields.currency = host.querySelector('#private-menu-currency').value;
    next.fields.menuLanguage = host.querySelector('#private-menu-language').value;
    next.categories = [...host.querySelectorAll('[data-draft-category]')].map((element,i)=>({ ...next.categories[i], name: element.querySelector('[data-category-name]').value, items: [...element.querySelectorAll('[data-draft-item]')].map((row,j)=>({ ...next.categories[i].items[j], name: row.querySelector('[data-product-name]').value, price: row.querySelector('[data-product-price]').value, description: row.querySelector('[data-product-description]').value })) }));
    return next;
  }
  function preview() {
    const value=read(),container=host.querySelector('#private-menu-preview');
    container.replaceChildren();const heading=document.createElement('h3');heading.textContent=value.fields.businessName||'Your restaurant';container.append(heading);
    for(const category of value.categories){const h=document.createElement('h4');h.textContent=category.name||'Unnamed category';container.append(h);for(const item of category.items){const p=document.createElement('p');p.textContent=[item.name||'Unnamed product',item.price||'Price missing',value.fields.currency].join(' · ');container.append(p);}}
  }
  async function refresh() {
    const response=await api(base),select=host.querySelector('#private-menu-list');
    select.innerHTML='<option value="">Choose a saved draft</option>'+response.drafts.map(menu=>`<option value="${esc(menu.id)}" ${menu.id===selected?.id?'selected':''}>${esc(menu.draft.fields.businessName||'Untitled menu')} · ${esc(menu.state)} · v${menu.version}</option>`).join('');
  }
  function editor() {
    const value=working;
    host.querySelector('#private-menu-editor').innerHTML=`<p>Private ${esc(selected?.state||'draft')} · ${selected?'Version '+selected.version:'Not saved'}. Saving never purchases or publishes a menu.</p><fieldset ${canWrite?'':'disabled'}><div class="form-grid"><label class="field">Restaurant name<input id="private-menu-name" maxlength="100" value="${esc(value.fields.businessName)}"></label><label class="field">Currency<select id="private-menu-currency">${['TRY','EUR','USD','TND'].map(c=>`<option ${c===value.fields.currency?'selected':''}>${c}</option>`).join('')}</select></label><label class="field">Menu language<select id="private-menu-language">${[['en','English'],['tr','Turkish'],['ar','Arabic']].map(([code,label])=>`<option value="${code}" ${code===value.fields.menuLanguage?'selected':''}>${label}</option>`).join('')}</select></label></div><div id="private-menu-categories">${value.categories.map((category,i)=>`<section class="panel" data-draft-category="${i}"><label class="field">Category name<input data-category-name maxlength="80" value="${esc(category.name)}"></label>${category.items.map((item,j)=>`<div data-draft-item="${j}" class="form-grid"><label class="field">Product<input data-product-name maxlength="100" value="${esc(item.name)}"></label><label class="field">Price<input data-product-price maxlength="40" value="${esc(item.price)}" inputmode="decimal"></label><label class="field">Description<input data-product-description maxlength="300" value="${esc(item.description)}"></label><button class="secondary" type="button" data-remove-product="${i}:${j}">Remove product</button></div>`).join('')}<button class="secondary" type="button" data-add-draft-product="${i}" ${category.items.length>=20?'disabled':''}>Add product</button></section>`).join('')}</div><div class="actions"><button id="private-menu-category" type="button" class="secondary" ${value.categories.length>=12?'disabled':''}>Add category</button><button id="private-menu-save" type="button" class="primary">Save private draft</button>${selected?'<button id="private-menu-archive" type="button" class="secondary">Archive draft</button>':''}</div></fieldset><p id="menu-save-status" role="status" aria-live="polite"></p><button id="private-menu-export" type="button" class="secondary">Download draft JSON</button><aside class="panel" id="private-menu-preview" aria-label="Private content preview"></aside>`;
    host.querySelector('#private-menu-editor').oninput=preview;
    host.querySelector('#private-menu-export').onclick=download;
    host.querySelector('#private-menu-category').onclick=()=>{working=read();working.categories.push({name:'',emoji:'',items:[]});editor();};
    host.querySelectorAll('[data-add-draft-product]').forEach(button=>button.onclick=()=>{working=read();working.categories[Number(button.dataset.addDraftProduct)].items.push({name:'',price:'',description:'',imageUrl:'',featured:false});editor();});
    host.querySelectorAll('[data-remove-product]').forEach(button=>button.onclick=()=>{const [i,j]=button.dataset.removeProduct.split(':').map(Number);working=read();working.categories[i].items.splice(j,1);editor();});
    async function save(state='draft') {
      const controls=[...host.querySelectorAll('#private-menu-editor button')];controls.forEach(b=>b.disabled=true);message('Saving…');
      try {
        const value=read(),body={draft:value,state,...(selected?{version:selected.version}:{})};
        const response=await api(base+(selected?'/'+selected.id:''),selected?'PUT':'POST',body);
        selected=response.menu;working=structuredClone(selected.draft);editor();message('Saved privately. No payment or publication occurred.');await refresh();
      } catch(error) {message(error.status===409?'Draft changed in another session. Download your current draft before reloading the saved copy.':error.message);}
      finally {controls.forEach(b=>b.disabled=false);}
    }
    host.querySelector('#private-menu-save').onclick=()=>save('draft');
    host.querySelector('#private-menu-archive')?.addEventListener('click',()=>save('archived'));
    preview();
  }
  host.innerHTML=`<section class="panel"><h2>AuraMenu private drafts</h2><p>Create or continue a menu using your saved business profile. Drafts are visible only to authorized members of this business. Prices and descriptions must come from your business; no payment or publishing happens here.</p><label class="field">Saved menus<select id="private-menu-list"><option>Loading…</option></select></label>${canWrite?'<button id="private-menu-new" class="secondary" type="button">New private draft</button>':''}<div id="private-menu-editor"></div></section>`;
  working=newDraft();editor();await refresh();
  host.querySelector('#private-menu-new')?.addEventListener('click',()=>{selected=null;working=newDraft();editor();});
  host.querySelector('#private-menu-list').onchange=async event=>{
    if(!event.target.value)return;
    try{const response=await api(base+'/'+encodeURIComponent(event.target.value));selected=response.menu;working=structuredClone(selected.draft);editor();}catch(error){message(error.message);}
  };
}
