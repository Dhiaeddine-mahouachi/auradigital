    const NAV = [
      ["overview","Overview"],["auramenu","AuraMenu Requests"],["quicksite","QuickSite Requests"],["pricing","Pricing"],["packages","Packages"],["services","Services"],["portfolio","Portfolio"],
      ["clients","Clients"],["orders","NFC / QR Orders"],["invoices","Invoices"],["subscriptions","Subscriptions"],["expenses","Expenses"],["analytics","Analytics"]
    ];

    const RESOURCE = {
      packages:{title:"Packages",subtitle:"Edit the monthly and weekly packages shown on the public website.",columns:[["name","Package"],["monthly_price","Monthly","money"],["weekly_price","Weekly","money"],["active","Visible","bool"]],fields:[
        ["name","Name","text",true],["description","Description","textarea",true],["monthly_price","Monthly price (TL)","number",true],["weekly_price","Weekly price (TL)","number",true],["features","Features — one per line","list",false],["featured","Featured package","checkbox",false],["active","Visible on website","checkbox",false],["sort_order","Order","number",false]
      ]},
      services:{title:"Services",subtitle:"Manage the service cards on the public Services page.",columns:[["name","Service"],["icon","Icon"],["active","Visible","bool"],["sort_order","Order"]],fields:[
        ["icon","Icon","text",false],["name","Name","text",true],["description","Description","textarea",true],["tags","Tags — one per line","list",false],["active","Visible on website","checkbox",false],["sort_order","Order","number",false]
      ]},
      portfolio:{title:"Portfolio",subtitle:"Publish, edit or hide client projects without touching HTML.",columns:[["title","Project"],["type","Type"],["url","Live URL","link"],["active","Visible","bool"]],fields:[
        ["title","Project title","text",true],["slug","Short slug","text",false],["type","Project type","text",false],["description","Description","textarea",true],["image","Image filename or URL","text",false],["url","Live website URL","url",false],["tags","Tags — one per line","list",false],["active","Visible on website","checkbox",false],["sort_order","Order","number",false]
      ]},
      clients:{title:"Clients",subtitle:"Simple CRM for leads and active AuraDigital clients.",columns:[["name","Contact"],["company","Company"],["service","Service"],["status","Status","status"],["renewal_date","Renewal"]],fields:[
        ["name","Contact name","text",true],["company","Company","text",false],["email","Email","email",false],["phone","Phone","text",false],["service","Service","text",false],["status","Status","select",true,["lead","active","paused","closed"]],["renewal_date","Renewal date","date",false],["notes","Notes","textarea",false]
      ]},
      orders:{title:"NFC / QR Orders",subtitle:"Track physical NFC cards, QR menus, websites and other jobs.",columns:[["client_id","Client","client"],["type","Type"],["quantity","Qty"],["amount","Amount","money"],["status","Status","status"],["due_date","Due"]],fields:[
        ["client_id","Client","client",false],["type","Order type","select",true,["NFC","QR Menu","Website","Digital Marketing","Other"]],["quantity","Quantity","number",true],["amount","Total amount (TL)","number",true],["status","Status","select",true,["new","in-progress","ready","completed","cancelled"]],["due_date","Due date","date",false],["notes","Notes","textarea",false]
      ]},
      invoices:{title:"Invoices",subtitle:"Track what has been billed, paid and still outstanding.",columns:[["invoice_number","Invoice"],["client_id","Client","client"],["amount","Amount","money"],["status","Status","status"],["due_date","Due"]],fields:[
        ["client_id","Client","client",false],["invoice_number","Invoice number","text",true],["amount","Amount (TL)","number",true],["status","Status","select",true,["draft","sent","paid","overdue","cancelled"]],["due_date","Due date","date",false],["notes","Notes","textarea",false]
      ]},
      subscriptions:{title:"Subscriptions",subtitle:"Track recurring AuraDigital retainers and next billing dates.",columns:[["client_id","Client","client"],["plan","Plan"],["amount","Amount","money"],["interval","Interval"],["status","Status","status"],["next_billing_date","Next billing"]],fields:[
        ["client_id","Client","client",false],["plan","Plan","text",true],["amount","Recurring amount (TL)","number",true],["interval","Billing interval","select",true,["monthly","weekly"]],["status","Status","select",true,["active","paused","cancelled"]],["next_billing_date","Next billing date","date",false]
      ]},
      expenses:{title:"Expenses",subtitle:"Record business expenses so dashboard profit stays meaningful.",columns:[["date","Date"],["category","Category"],["description","Description"],["amount","Amount","money"]],fields:[
        ["date","Date","date",true],["category","Category","select",true,["Tools","Hosting","Advertising","Production","Freelancer","Office","Tax / Accounting","Other"]],["description","Description","text",true],["amount","Amount (TL)","number",true],["notes","Notes","textarea",false]
      ]}
    };

    const PRICE_FIELDS = [
      ["nfc_price","NFC Card","Standard card price"],["qr_menu_price","QR Menu","Digital menu setup"],["web_single_price","1-page Website","Starting price"],["web_multi_price","Multi-page Website","Starting price"],["web_dynamic_price","Dynamic Website","Starting price"]
    ];

    const state={view:"overview",clients:[],editing:null};
    const $=(id)=>document.getElementById(id);
    const esc=(value)=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
    const safeLink=(value)=>/^https?:\/\//i.test(String(value||"").trim())?String(value).trim():"";
    const money=(value)=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number(value||0))+" TL";

    async function api(path,options={}){
      const response=await fetch(path,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
      const data=response.status===204?{}:await response.json().catch(()=>({}));
      if(!response.ok){const error=new Error(data.error||"Request failed.");error.status=response.status;throw error}return data;
    }

    function buildNav(){
      $("sideNav").innerHTML=NAV.map(([id,label])=>`<button class="nav-item${id===state.view?" active":""}" data-view="${id}">${esc(label)}</button>`).join("");
      $("mobileNav").innerHTML=NAV.map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join("");
      $("mobileNav").value=state.view;
      document.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>openView(btn.dataset.view)));
    }

    async function checkSession(){try{const session=await api("/api/admin/session");if(session.authenticated)return showDashboard()}catch(_){}$("loginView").classList.remove("hidden");$("dashboardView").classList.add("hidden")}
    async function showDashboard(){$("loginView").classList.add("hidden");$("dashboardView").classList.remove("hidden");buildNav();const requested=location.hash.slice(1);await openView(NAV.some(([id])=>id===requested)?requested:"overview")}

    async function openView(view){state.view=view;location.hash=view==="overview"?"":view;buildNav();const meta=RESOURCE[view];$("pageTitle").textContent=meta?.title||({overview:"Overview",auramenu:"AuraMenu Requests",quicksite:"QuickSite Requests",pricing:"Pricing",analytics:"Analytics"}[view]||view);$("pageSubtitle").textContent=meta?.subtitle||({overview:"Your business at a glance.",auramenu:"Verify payment, review the requested menu and approve publishing.",quicksite:"Review customer websites, confirm payment and approve publishing.",pricing:"Control all public starting prices from one place.",analytics:"Privacy-friendly aggregate website traffic for the last 30 days."}[view]||"");$("content").innerHTML='<section class="panel"><p>Loading…</p></section>';
      try{if(view==="overview")await renderOverview();else if(view==="auramenu")await renderAuraMenu();else if(view==="quicksite")await renderQuickSite();else if(view==="pricing")await renderPricing();else if(view==="analytics")await renderAnalytics();else await renderResource(view)}catch(error){if(error.status===401)return checkSession();$("content").innerHTML=`<section class="panel"><div class="notice error">${esc(error.message)}</div></section>`}}

    async function renderOverview(){const d=await api("/api/admin/overview");const cards=[["AuraMenu requests",d.pendingAuraMenus,"warn"],["QuickSite requests",d.pendingQuickSites,"warn"],["Leads",d.leads],["Active clients",d.activeClients],["Open orders",d.openOrders],["Unpaid invoices",d.unpaidInvoices],["Paid revenue",money(d.revenue),"good"],["Expenses",money(d.expenses),"warn"],["Profit",money(d.profit),d.profit>=0?"good":"warn"],["Recurring / month",money(d.recurringRevenue),"good"],["Website views · 30d",d.views30d]];$("content").innerHTML=`<div class="metrics">${cards.map(([label,value,cls=""])=>`<div class="metric ${cls}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div><section class="panel"><div class="panel-head"><div><h2>Control center is live</h2><p>Website content, customer requests, CRM, orders, billing and KPIs share the same D1 database.</p></div><span class="status">Connected</span></div><p>New AuraMenu and QuickSite submissions remain red and locked until you confirm payment and approve publishing.</p></section>`}

    async function renderPricing(){const data=await api("/api/admin/settings");const map=Object.fromEntries((data.settings||[]).map(item=>[item.key,item.value]));$("content").innerHTML=`<section class="panel"><div class="panel-head"><div><h2>Public starting prices</h2><p>These values are used by the live NFC, QR Menu and website pricing areas.</p></div><span class="status">Live settings</span></div><div class="pricing-form">${PRICE_FIELDS.map(([key,label,help])=>`<label>${esc(label)} (TL)<small>${esc(help)}</small><input type="number" min="0" step="1" data-price-key="${key}" value="${esc(map[key]||0)}"></label>`).join("")}<div class="wide-actions"><button id="savePrices" class="btn btn-dark">Save all prices</button><span id="priceNotice" class="notice"></span></div></div></section>`;$("savePrices").addEventListener("click",savePrices)}

    async function savePrices(){const button=$("savePrices"),notice=$("priceNotice");button.disabled=true;notice.className="notice";notice.textContent="Saving…";try{await Promise.all([...document.querySelectorAll("[data-price-key]")].map(input=>api("/api/admin/settings/"+input.dataset.priceKey,{method:"PUT",body:JSON.stringify({value:input.value})})));notice.className="notice success";notice.textContent="Saved. Public pages will reflect the new prices."}catch(error){notice.className="notice error";notice.textContent=error.message}finally{button.disabled=false}}

    async function ensureClients(){const data=await api("/api/admin/clients");state.clients=data.items||[]}

    async function renderResource(resource){const config=RESOURCE[resource];if(["orders","invoices","subscriptions"].includes(resource)||resource==="clients")await ensureClients();const data=resource==="clients"?{items:state.clients}:await api("/api/admin/"+resource);const items=data.items||[];const head=config.columns.map(([,label])=>`<th>${esc(label)}</th>`).join("");const rows=items.map(item=>`<tr>${config.columns.map(col=>`<td>${formatCell(item,col)}</td>`).join("")}<td><div class="row-actions"><button class="btn btn-light btn-sm" data-edit="${item.id}">Edit</button><button class="btn btn-danger btn-sm" data-delete="${item.id}">Delete</button></div></td></tr>`).join("");$("content").innerHTML=`<section class="panel"><div class="panel-head"><div><h2>${esc(config.title)}</h2><p>${esc(config.subtitle)}</p></div><button id="addItem" class="btn btn-dark">+ Add</button></div>${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr>${head}<th></th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">No records yet. Add the first one.</div>'}</section>`;$("addItem").addEventListener("click",()=>openEditor(resource,null));document.querySelectorAll("[data-edit]").forEach(btn=>btn.addEventListener("click",()=>openEditor(resource,items.find(x=>String(x.id)===btn.dataset.edit))));document.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>deleteItem(resource,btn.dataset.delete)))}

    function formatCell(item,[key,,format]){const value=item[key];if(format==="money")return esc(money(value));if(format==="bool")return `<span class="pill ${Number(value)?"ok":""}">${Number(value)?"Yes":"No"}</span>`;if(format==="status")return `<span class="pill ${["active","paid","completed","ready"].includes(String(value))?"ok":"warn"}">${esc(value||"—")}</span>`;if(format==="client"){const client=state.clients.find(c=>Number(c.id)===Number(value));return esc(client?(client.company||client.name):value?"#"+value:"—")}if(format==="link"){const href=safeLink(value);return href?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">Open ↗</a>`:"—"}return esc(String(value??"—").length>52?String(value).slice(0,52)+"…":value??"—")}

    function openEditor(resource,item){state.editing={resource,item};const config=RESOURCE[resource];$("modalTitle").textContent=(item?"Edit ":"Add ")+config.title.replace(/s$/,"" );$("modalForm").innerHTML=config.fields.map(field=>fieldHtml(field,item)).join("")+`<div class="modal-actions"><button type="button" id="cancelModal" class="btn btn-light">Cancel</button><button class="btn btn-dark" type="submit">${item?"Save changes":"Create"}</button></div>`;$("modal").classList.remove("hidden");$("modal").setAttribute("aria-hidden","false");$("cancelModal").addEventListener("click",closeModal)}

    function fieldHtml([key,label,type,required,options],item){const value=item?.[key];const req=required?" required":"";const span=["textarea","list"].includes(type)?" span-2":"";if(type==="checkbox")return `<label class="${span}">${esc(label)}<span class="check"><input name="${key}" type="checkbox" ${item?Number(value)!==0:"active"===key?"checked":""}> Enabled</span></label>`;if(type==="textarea"||type==="list")return `<label class="${span}">${esc(label)}<textarea name="${key}"${req}>${esc(type==="list"?(Array.isArray(value)?value.join("\n"):""):value||"")}</textarea></label>`;if(type==="select")return `<label>${esc(label)}<select name="${key}"${req}>${(options||[]).map(option=>`<option value="${esc(option)}" ${String(value??options[0])===String(option)?"selected":""}>${esc(option)}</option>`).join("")}</select></label>`;if(type==="client")return `<label>${esc(label)}<select name="${key}"><option value="">No client</option>${state.clients.map(c=>`<option value="${c.id}" ${Number(value)===Number(c.id)?"selected":""}>${esc(c.company||c.name)}</option>`).join("")}</select></label>`;return `<label>${esc(label)}<input name="${key}" type="${type}" value="${esc(value??"")}"${type==="number"?' step="any" min="0"':""}${req}></label>`}

    async function saveEditor(event){event.preventDefault();const {resource,item}=state.editing;const config=RESOURCE[resource];const form=new FormData(event.currentTarget);const body={};for(const [key,,type] of config.fields){if(type==="checkbox")body[key]=event.currentTarget.elements[key].checked?1:0;else if(type==="list")body[key]=String(form.get(key)||"").split(/\n|,/).map(x=>x.trim()).filter(Boolean);else if(type==="number"||type==="client")body[key]=form.get(key)===""?null:Number(form.get(key));else body[key]=String(form.get(key)||"").trim()}const submit=event.currentTarget.querySelector("button[type=submit]");submit.disabled=true;try{await api("/api/admin/"+resource+(item?"/"+item.id:""),{method:item?"PUT":"POST",body:JSON.stringify(body)});closeModal();await openView(resource)}catch(error){alert(error.message)}finally{submit.disabled=false}}

    async function deleteItem(resource,id){if(!confirm("Delete this record?"))return;try{await api(`/api/admin/${resource}/${id}`,{method:"DELETE"});await openView(resource)}catch(error){alert(error.message)}}
    function closeModal(){$("modal").classList.add("hidden");$("modal").setAttribute("aria-hidden","true");state.editing=null}

async function renderAuraMenu(){
  const data=await api("/api/admin/auramenu");
  const items=data.requests||[];
  state.auraMenus=items;
  const pending=items.filter(item=>item.status==="pending").length;
  const unpaid=items.filter(item=>item.paymentStatus!=="paid").length;
  const live=items.filter(item=>item.status==="approved").length;
  const rows=items.map(item=>`<tr>
    <td><span class="request-state ${esc(item.status)}"><i></i>${esc(item.status)}</span></td>
    <td><strong>${esc(item.businessName)}</strong><small style="display:block;color:#6b7280">${esc(item.contactName)} · ${esc(item.contactPhone)}</small></td>
    <td>${esc(item.templateId)}<small style="display:block;color:#6b7280">auramenu.space/${esc(item.slug)}</small></td>
    <td><span class="pill ${item.paymentStatus==="paid"?"ok":"warn"}">${item.paymentStatus==="paid"?"Paid":"Unpaid"}</span></td>
    <td>${esc((item.categories||[]).length)} categories<small style="display:block;color:#6b7280">${esc((item.categories||[]).reduce((sum,category)=>sum+(category.items||[]).length,0))} products</small></td>
    <td><div class="row-actions">
      <button class="btn btn-light btn-sm" data-menu-details="${esc(item.id)}">Details</button>
      <a class="btn btn-light btn-sm" href="https://auramenu.space/status.html?id=${encodeURIComponent(item.id)}" target="_blank" rel="noopener noreferrer">Status</a>
      <button class="btn btn-light btn-sm" data-menu-pay="${esc(item.id)}">${item.paymentStatus==="paid"?"Mark unpaid":"Payment received"}</button>
      <button class="btn btn-dark btn-sm" data-menu-approve="${esc(item.id)}" ${item.paymentStatus!=="paid"||item.status==="approved"?"disabled":""}>Approve → green</button>
      <button class="btn btn-danger btn-sm" data-menu-reject="${esc(item.id)}">Request changes</button>
      ${item.status==="approved"?`<a class="btn btn-light btn-sm" href="https://auramenu.space/${encodeURIComponent(item.slug)}" target="_blank" rel="noopener noreferrer">Live ↗</a>`:""}
    </div></td>
  </tr>`).join("");
  $("content").innerHTML=`<div class="metrics">
    <div class="metric warn"><span>Red · pending</span><strong>${pending}</strong></div>
    <div class="metric warn"><span>Waiting payment</span><strong>${unpaid}</strong></div>
    <div class="metric good"><span>Green · published</span><strong>${live}</strong></div>
  </div>
  <section class="panel"><div class="panel-head"><div><h2>AuraMenu customer requests</h2><p>Requests start red. Confirm payment, inspect the menu, then approve it to publish the customer URL.</p></div><a class="btn btn-dark" href="https://auramenu.space" target="_blank" rel="noopener noreferrer">Open AuraMenu ↗</a></div>
  ${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Status</th><th>Customer</th><th>Menu</th><th>Payment</th><th>Content</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">No AuraMenu requests yet.</div>'}</section>`;
  document.querySelectorAll("[data-menu-details]").forEach(button=>button.addEventListener("click",()=>showAuraMenuDetails(items.find(item=>item.id===button.dataset.menuDetails))));
  document.querySelectorAll("[data-menu-pay]").forEach(button=>button.addEventListener("click",()=>{const item=items.find(value=>value.id===button.dataset.menuPay);return updateAuraMenu(item.id,{paymentStatus:item.paymentStatus==="paid"?"unpaid":"paid"})}));
  document.querySelectorAll("[data-menu-approve]").forEach(button=>button.addEventListener("click",()=>updateAuraMenu(button.dataset.menuApprove,{status:"approved"})));
  document.querySelectorAll("[data-menu-reject]").forEach(button=>button.addEventListener("click",()=>updateAuraMenu(button.dataset.menuReject,{status:"rejected"})));
}

function showAuraMenuDetails(item){
  if(!item)return;
  const categories=(item.categories||[]).map(category=>`<section class="request-category"><h3>${esc(category.emoji||"🍽️")} ${esc(category.name)}</h3><ul>${(category.items||[]).map(product=>`<li class="request-product">${product.imageUrl?`<img src="${esc(product.imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="request-product-placeholder">${esc(category.emoji||"🍽️")}</span>`}<div><strong>${esc(product.name)}</strong><small>${esc(product.price||"—")} ${esc(item.currency)}${product.description?` · ${esc(product.description)}`:""}</small></div></li>`).join("")||"<li>No products</li>"}</ul></section>`).join("");
  $("modalTitle").textContent=item.businessName+" · AuraMenu request";
  $("modalForm").innerHTML=`<div class="request-details span-2"><dl>
    <div><dt>Requested URL</dt><dd>auramenu.space/${esc(item.slug)}</dd></div><div><dt>Template</dt><dd>${esc(item.templateId)}</dd></div>
    <div><dt>Menu language</dt><dd>${esc(item.menuLanguage)}</dd></div><div><dt>Created</dt><dd>${esc(new Date(item.createdAt).toLocaleString())}</dd></div>
    <div><dt>Contact</dt><dd>${esc(item.contactName)} · ${esc(item.contactPhone)}</dd></div><div><dt>Email</dt><dd>${esc(item.email||"—")}</dd></div>
    <div><dt>Business phone</dt><dd>${esc(item.businessPhone||"—")}</dd></div><div><dt>WhatsApp</dt><dd>${esc(item.whatsapp||"—")}</dd></div>
    <div><dt>Address</dt><dd>${esc(item.address||"—")}</dd></div><div><dt>Payment reference</dt><dd>${esc(item.paymentReference||"—")}</dd></div>
  </dl>${categories}<label>Owner note<textarea id="menuOwnerNote" maxlength="500">${esc(item.ownerNote||"")}</textarea></label></div>
  <div class="modal-actions"><button type="button" id="saveMenuNote" class="btn btn-dark">Save note</button><button type="button" id="closeMenuDetails" class="btn btn-light">Close</button></div>`;
  state.editing=null;$("modal").classList.remove("hidden");$("modal").setAttribute("aria-hidden","false");
  $("closeMenuDetails").addEventListener("click",closeModal);$("saveMenuNote").addEventListener("click",async()=>{await updateAuraMenu(item.id,{ownerNote:$("menuOwnerNote").value},false);closeModal();await renderAuraMenu()});
}

async function updateAuraMenu(id,patch,refresh=true){
  try{await api("/api/admin/auramenu/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(patch)});if(refresh)await renderAuraMenu()}
  catch(error){alert(error.message)}
}

async function renderQuickSite(){
  const data=await api("/api/admin/quicksite");
  const items=data.projects||[];
  const pending=items.filter(item=>item.status==="pending").length;
  const unpaid=items.filter(item=>item.paymentStatus!=="paid").length;
  const live=items.filter(item=>item.status==="approved").length;
  const rows=items.map(item=>`<tr>
    <td><strong>${esc(item.businessName)}</strong><small style="display:block;color:#6b7280">${esc(item.contactName)} · ${esc(item.email)}</small></td>
    <td>${esc(item.templateId)}<small style="display:block;color:#6b7280">/${esc(item.slug)}</small></td>
    <td><span class="pill ${item.paymentStatus==="paid"?"ok":"warn"}">${item.paymentStatus==="paid"?"Paid":"Unpaid"}</span></td>
    <td><span class="pill ${item.status==="approved"?"ok":"warn"}">${esc(item.status)}</span></td>
    <td><div class="row-actions">
      <a class="btn btn-light btn-sm" href="/quicksite/preview/${encodeURIComponent(item.id)}" target="_blank">Preview</a>
      <button class="btn btn-light btn-sm" data-quick-pay="${esc(item.id)}">${item.paymentStatus==="paid"?"Mark unpaid":"Payment received"}</button>
      <button class="btn btn-dark btn-sm" data-quick-approve="${esc(item.id)}" ${item.paymentStatus!=="paid"?"disabled":""}>Approve</button>
      <button class="btn btn-danger btn-sm" data-quick-reject="${esc(item.id)}">Request changes</button>
      ${item.status==="approved"?`<a class="btn btn-light btn-sm" href="/quicksite/${encodeURIComponent(item.slug)}" target="_blank">Live ↗</a>`:""}
    </div></td>
  </tr>`).join("");
  $("content").innerHTML=`<div class="metrics">
    <div class="metric"><span>New requests</span><strong>${pending}</strong></div>
    <div class="metric warn"><span>Waiting payment</span><strong>${unpaid}</strong></div>
    <div class="metric good"><span>Published</span><strong>${live}</strong></div>
  </div>
  <section class="panel"><div class="panel-head"><div><h2>QuickSite customer requests</h2><p>Every submitted website appears here before it can be published.</p></div><a class="btn btn-dark" href="/quicksite" target="_blank">Open QuickSite ↗</a></div>
  ${items.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Website</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty">No QuickSite requests yet.</div>'}</section>`;
  document.querySelectorAll("[data-quick-pay]").forEach(button=>button.addEventListener("click",()=>updateQuickSite(button.dataset.quickPay,{paymentStatus:button.textContent.includes("received")?"paid":"unpaid"})));
  document.querySelectorAll("[data-quick-approve]").forEach(button=>button.addEventListener("click",()=>updateQuickSite(button.dataset.quickApprove,{status:"approved"})));
  document.querySelectorAll("[data-quick-reject]").forEach(button=>button.addEventListener("click",()=>updateQuickSite(button.dataset.quickReject,{status:"rejected"})));
}

async function updateQuickSite(id,patch){
  try{await api("/api/admin/quicksite/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(patch)});await renderQuickSite()}
  catch(error){alert(error.message)}
}

    async function renderAnalytics(){const data=await api("/api/admin/analytics");const daily=data.daily||[],pages=data.pages||[];const maxDay=Math.max(1,...daily.map(x=>Number(x.views||0))),maxPage=Math.max(1,...pages.map(x=>Number(x.views||0)));$("content").innerHTML=`<div class="analytics-grid"><section class="panel"><div class="panel-head"><div><h2>Daily views</h2><p>Last 30 days · aggregate counts only</p></div></div>${daily.length?`<div class="chart">${daily.map(x=>barRow(x.date,x.views,maxDay)).join("")}</div>`:'<div class="empty">Traffic will appear here as visitors browse the site.</div>'}</section><section class="panel"><div class="panel-head"><div><h2>Top pages</h2><p>No visitor identity or IP data stored.</p></div></div>${pages.length?`<div class="chart">${pages.map(x=>barRow(x.path,x.views,maxPage)).join("")}</div>`:'<div class="empty">No page-view data yet.</div>'}</section></div>`}
    function barRow(label,value,max){return `<div class="bar-row"><span title="${esc(label)}">${esc(String(label).length>16?String(label).slice(0,15)+"…":label)}</span><div class="bar-track"><div class="bar" style="width:${Math.max(3,Math.round(Number(value||0)/max*100))}%"></div></div><strong>${esc(value)}</strong></div>`}

    $("loginForm").addEventListener("submit",async event=>{event.preventDefault();$("loginBtn").disabled=true;$("loginNotice").className="notice";$("loginNotice").textContent="Signing in…";try{await api("/api/admin/login",{method:"POST",body:JSON.stringify({password:$("password").value})});$("password").value="";$("loginNotice").textContent="";await showDashboard()}catch(error){$("loginNotice").className="notice error";$("loginNotice").textContent=error.message}finally{$("loginBtn").disabled=false}});
    $("logoutBtn").addEventListener("click",async()=>{await api("/api/admin/logout",{method:"POST"}).catch(()=>{});location.reload()});
    $("mobileNav").addEventListener("change",event=>openView(event.target.value));$("modalClose").addEventListener("click",closeModal);$("modalForm").addEventListener("submit",saveEditor);$("modal").addEventListener("click",event=>{if(event.target===$("modal"))closeModal()});
    checkSession();
