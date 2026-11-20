(function auraControlModule() {
  "use strict";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const formatMoney = value => new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number(value||0)) + " TL";
  const types = [
    {name:"All",key:"all"},
    {name:"Websites",key:"website"},
    {name:"AuraMenu",key:"menu"},
    {name:"NFC",key:"nfc"},
    {name:"AuraPops",key:"pop"},
    {name:"Other orders",key:"order"}
  ];
  const sections = {
    finance:[
      ["invoices","Invoices","Track issued, paid and overdue invoices","▣"],
      ["subscriptions","Subscriptions","Recurring plans and upcoming billing","↻"],
      ["expenses","Expenses","Operating costs and bookkeeping","◫"],
      ["analytics","Analytics","Website performance and traffic","▥"]
    ],
    catalog:[
      ["global-pricing","Global Pricing","Regional pricing and published rates","₺"],
      ["packages","Packages","Manage customer-facing packages","◈"],
      ["services","Services","Manage service cards and descriptions","✧"],
      ["portfolio","Portfolio","Published work and case studies","▧"],
      ["shop","Shop Catalog","NFC and smart card products","▤"],
      ["pricing","Legacy Pricing","Older price settings; retained for compatibility","⌁"]
    ],
    settingsgroup:[
      ["team","Team & Access","Staff accounts and permission levels","♙"],
      ["audit","Security Log","Audit activity and access history","♧"],
      ["workspace","Notes & Images","Private notes and visual references","▤"],
      ["menuaccess","Menu Editing Access","Manage paid editing windows","◷"]
    ]
  };
  const requestEndpoints = [
    ["nfc","/api/admin/nfc","requests"],
    ["menu","/api/admin/auramenu","requests"],
    ["website","/api/admin/quicksite","projects"],
    ["pop","/api/admin/aurapops/pops","items"],
    ["order","/api/admin/orders","items"]
  ];
  const requestInfo = {
    nfc: {label:"NFC Cards",view:"nfc",symbol:"▣"},
    menu: {label:"AuraMenu",view:"auramenu",symbol:"◫"},
    website: {label:"Website",view:"quicksite",symbol:"◎"},
    pop: {label:"AuraPops",view:"aurapops",symbol:"✦"},
    order: {label:"Order",view:"orders",symbol:"▤"}
  };
  const toDate = value => {
    if (!value) return null;
    let date = new Date(String(value).includes("T") ? value : String(value).replace(" ","T")+"Z");
    return Number.isFinite(date.getTime()) ? date : null;
  };
  const showDate = value => {
    const parsed = toDate(value);
    return parsed ? parsed.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";
  };
  function normalizeItem(item,type) {
    const createdAt = item.createdAt || item.created_at || item.submittedAt || item.created_at_utc || item.updatedAt || item.updated_at || "";
    const business = item.businessName || item.company || item.shipping?.business || item.contactName || item.title || item.name || ("Order #"+String(item.id||""));
    const title = type==="nfc" ? ((item.cardType==="reviews"?"Review NFC":item.cardType==="menu"?"Menu NFC":"Website NFC") + (item.quantity ? " · "+item.quantity+" card(s)" : "")) :
      type==="menu" ? [item.templateId, item.slug].filter(Boolean).join(" · ") :
      type==="website" ? [item.templateId, item.slug].filter(Boolean).join(" · ") :
      type==="pop" ? (item.subtitle || item.title || "Digital profile") :
      [item.type,item.quantity ? "Qty "+item.quantity : ""].filter(Boolean).join(" · ");
    return {
      id:String(item.id||""),type,business:String(business),title:String(title||requestInfo[type].label),
      status:String(item.status||"new").toLowerCase(),payment:String(item.paymentStatus||item.payment_status||""),
      createdAt,sort:toDate(createdAt)?.getTime()||0,
      contact:String(item.contactName||item.name||""),
      view:requestInfo[type].view
    };
  }
  async function loadRequests(api) {
    const results = await Promise.allSettled(requestEndpoints.map(([,endpoint])=>api(endpoint)));
    const failed = [];
    const rows = [];
    results.forEach((result,index)=>{
      const [kind,endpoint,field] = requestEndpoints[index];
      if (result.status!=="fulfilled") {failed.push(requestInfo[kind].label);return;}
      const values=result.value?.[field];
      if(!Array.isArray(values)){failed.push(requestInfo[kind].label);return;}
      values.forEach(item=>rows.push(normalizeItem(item,kind)));
    });
    rows.sort((a,b)=>b.sort-a.sort);
    return {rows,failed};
  }
  const tagClass = status => {
    if (["approved","completed","paid","delivered","ready","active"].includes(status)) return "done";
    if (["rejected","cancelled","lost"].includes(status)) return "closed";
    if (["in-progress","in_progress","processing","working"].includes(status)) return "working";
    return "pending";
  };
  function statusTag(status) {
    const label = status.replace(/[_-]/g," ").replace(/\b\w/g,c=>c.toUpperCase());
    return `<span class="cc-state cc-state--${tagClass(status)}"><i></i>${escapeHtml(label)}</span>`;
  }
  function tableRows(rows) {
    return rows.map(row=>`<tr data-kind="${escapeHtml(row.type)}" data-search="${escapeHtml([row.id,row.business,row.title,row.status,row.contact].join(" ").toLowerCase())}">
      <td><span class="cc-request-code">#${escapeHtml(row.id.slice(0,8)||"—")}</span></td>
      <td><span class="cc-client-avatar">${escapeHtml(row.business.charAt(0).toUpperCase())}</span><span class="cc-client-name"><strong>${escapeHtml(row.business)}</strong>${row.contact&&row.contact!==row.business?`<small>${escapeHtml(row.contact)}</small>`:""}</span></td>
      <td><span class="cc-service-icon">${requestInfo[row.type].symbol}</span><strong>${requestInfo[row.type].label}</strong></td>
      <td class="cc-details">${escapeHtml(row.title)}${row.payment?`<small>Payment: ${escapeHtml(row.payment)}</small>`:""}</td>
      <td>${statusTag(row.status)}</td>
      <td class="cc-date">${escapeHtml(showDate(row.createdAt))}</td>
      <td><button type="button" class="cc-open" data-open="${escapeHtml(row.view)}" aria-label="Open ${escapeHtml(requestInfo[row.type].label)} request">Open ↗</button></td>
    </tr>`).join("");
  }
  function tableBlock(rows,full=false) {
    return `<section class="cc-panel cc-request-panel">
      <div class="cc-panel-head">
        <div><span class="cc-eyebrow">REQUEST CENTER</span><h2>${full?"All Requests & Orders":"Recent Requests"}</h2><p>Real requests from your existing AuraDigital systems.</p></div>
        ${full?`<span class="cc-count">${rows.length} records loaded</span>`:`<button class="cc-text-btn" data-destination="requests">View all requests ↗</button>`}
      </div>
      <div class="cc-filter-row"><div class="cc-filters" aria-label="Filter request type">${types.map((type,i)=>`<button type="button" class="cc-filter ${i===0?"selected":""}" data-filter="${type.key}">${type.name}</button>`).join("")}</div><input class="cc-search" type="search" aria-label="Search requests" placeholder="Search requests…"></div>
      <div class="cc-table-wrap"><table class="cc-table"><thead><tr><th>Reference</th><th>Customer</th><th>Service</th><th>Details</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${tableRows(rows)}</tbody></table>
      <div class="cc-table-empty" hidden>No matching requests.</div></div>
      ${full?"":`<p class="cc-muted-note">Showing up to 12 most recent requests. Open “View all” for more.</p>`}
    </section>`;
  }
  function bindTable(root,go) {
    const search = root.querySelector(".cc-search");
    const empty = root.querySelector(".cc-table-empty");
    const buttons = [...root.querySelectorAll(".cc-filter")];
    const tableRows = [...root.querySelectorAll(".cc-table tbody tr")];
    function filter() {
      const kind = buttons.find(b=>b.classList.contains("selected"))?.dataset.filter||"all";
      const query = search?.value?.toLowerCase().trim()||"";
      let visible=0;
      tableRows.forEach(row=>{
        const match = (kind==="all"||row.dataset.kind===kind)&&(!query||row.dataset.search.includes(query));
        row.hidden=!match;
        if(match)visible++;
      });
      if(empty)empty.hidden=visible>0;
    }
    buttons.forEach(b=>b.addEventListener("click",()=>{
      buttons.forEach(x=>{x.classList.toggle("selected",x===b);x.setAttribute("aria-pressed",String(x===b));});
      filter();
    }));
    search?.addEventListener("input",filter);
    const globalSearch=document.querySelector("#cc-global-search");
    if(globalSearch&&root.querySelector(".cc-request-panel")){
      search.value=globalSearch.value;
      globalSearch.oninput=()=>{if(!document.body.contains(root))return;search.value=globalSearch.value;filter();};
    }
    filter();
  }
  function metric(label,number,icon,desc) {
    return `<article class="cc-metric"><span class="cc-metric-icon">${icon}</span><span class="cc-metric-label">${escapeHtml(label)}</span><strong>${escapeHtml(number)}</strong><small>${escapeHtml(desc)}</small></article>`;
  }
  // Use one binding path for every dashboard navigation button. Previously only
  // .cc-action and .cc-link were connected, leaving pricing/settings cards,
  // the hero CTA, request View all, and Auri shortcuts unresponsive.
  function quickActions(go,root) {
    root.querySelectorAll('button[data-destination],button[data-open]').forEach(button=>{
      const destination = button.dataset.destination || button.dataset.open;
      if (!destination) return;
      button.addEventListener('click', () => go(destination));
    });
  }
  function activity(rows) {
    if(!rows.length) return `<p class="cc-empty">No recent request activity.</p>`;
    return rows.slice(0,5).map(row=>`<div class="cc-activity"><span class="cc-activity-symbol">${requestInfo[row.type].symbol}</span><div><strong>${escapeHtml(row.business)}</strong><small>${escapeHtml(requestInfo[row.type].label)} · ${escapeHtml(row.status)} · ${escapeHtml(showDate(row.createdAt))}</small></div></div>`).join("");
  }
  const actions = [
    ["＋","Manage Clients","clients"],
    ["▣","View Orders","requests"],
    ["▤","Invoices","invoices"],
    ["◈","Edit Services","services"],
    ["♙","Manage Team","team"],
    ["✦","AI Employee","ai"]
  ];
  async function overview({root,api,go,user}) {
    root.classList.add("cc-root");
    root.innerHTML = `<section class="cc-loading">Loading requests and business statistics…</section>`;
    const [summary,requests] = await Promise.all([
      api("/api/admin/overview").catch(()=>null),
      loadRequests(api)
    ]);
    const rows = requests.rows;
    const pending = rows.filter(row=>!["approved","completed","cancelled","rejected","delivered"].includes(row.status)).length;
    const displayName = user?.displayName||user?.username||"team";
    const cards = [
      ["New Leads",summary?.leads,"♙","CRM leads"],
      ["Pending Requests",requests.failed.length?"—":pending,"◷","Across request systems"],
      ["Active Clients",summary?.activeClients,"▣","Active customers"],
      ["Open Orders",summary?.openOrders,"▤","Ongoing orders"],
      ["Unpaid Invoices",summary?.unpaidInvoices,"▥","Awaiting payment"],
      ["Recurring / Month",summary?formatMoney(summary.recurringRevenue):null,"₺","Tracked monthly revenue"]
    ];
    root.innerHTML = `<div class="cc-welcome cc-welcome--hero"><div class="cc-hero-copy"><span class="cc-eyebrow">AURADIGITAL CONTROL CENTER</span><h2>AuraDigital <em>Control</em></h2><p>Welcome, ${escapeHtml(displayName)}. Manage your requests, team and growth — all in one place.</p><button class="cc-primary" data-destination="requests">View all requests <span>↗</span></button></div><img class="cc-banner-auri" src="/media/landing/hub-auri.png" alt="Auri, AuraDigital assistant" loading="lazy"></div>
      <div class="cc-metrics">${cards.map(([label,value,icon,desc])=>metric(label,value===null||value===undefined?"—":String(value),icon,desc)).join("")}</div>
      ${requests.failed.length?`<p class="cc-load-warning" role="status">Some request services could not be loaded: ${escapeHtml(requests.failed.join(", "))}. Your saved data has not been changed.</p>`:""}
      <div class="cc-dashboard-grid">
        <div class="cc-main-column">${tableBlock(rows.slice(0,12))}</div>
        <div class="cc-side-column">
          <section class="cc-panel cc-quick-panel"><h2>Quick Actions</h2><div class="cc-actions">${actions.filter(([, ,view])=>view!=="ai"||["owner","manager"].includes(user?.role)).filter(([, ,view])=>view!=="team"||user?.role==="owner").map(([icon,label,view])=>`<button class="cc-action" data-destination="${view}"><span>${icon}</span>${label}</button>`).join("")}</div></section>
          <section class="cc-panel cc-activity-panel"><div class="cc-panel-head"><h2>Recent Activity</h2></div>${activity(rows)}</section>
          <section class="cc-auri"><img src="/media/landing/hub-auri.png" alt="Auri assistant" loading="lazy"><div><span>YOUR AI OPERATIONS ASSISTANT</span><h2>Auri</h2><p>Review AI activity and manage approved knowledge.</p><button class="cc-auri-btn" data-destination="${["owner","manager"].includes(user?.role)?"ai":"clients"}">${["owner","manager"].includes(user?.role)?"Open AI Employee":"Open CRM"} ↗</button></div></section>
        </div>
      </div>`;
    bindTable(root,go);
    quickActions(go,root);
    document.getElementById("pageTitle").textContent="Dashboard";
    document.getElementById("pageSubtitle").textContent="Requests, customers and revenue at a glance.";
  }
  async function group({root,api,go,view,user}) {
    root.classList.add("cc-root");
    if(view==="requests") {
      root.innerHTML=`<section class="cc-loading">Loading existing requests…</section>`;
      const data=await loadRequests(api);
      root.innerHTML=`<div class="cc-welcome cc-welcome--compact"><div><span class="cc-eyebrow">OPERATIONS</span><h2>Projects & Orders</h2><p>Access every original request-processing screen from a single workspace.</p></div></div>
      ${data.failed.length?`<p class="cc-load-warning">Could not load: ${escapeHtml(data.failed.join(", "))}. All original request pages are still available below.</p>`:""}
      <div class="cc-request-links">${[["nfc","NFC Designs"],["auramenu","AuraMenu"],["quicksite","QuickSite"],["aurapops","AuraPops"],["orders","Orders"],["menuaccess","Menu Editing"]].map(([id,title])=>`<button class="cc-link" data-destination="${id}">${title} <span>↗</span></button>`).join("")}</div>
      ${tableBlock(data.rows,true)}`;
      bindTable(root,go);quickActions(go,root);
      return;
    }
    const options = sections[view]||[];
    const accessible=options.filter(([id])=>{
      if (["team","audit"].includes(id) && user?.role!=="owner") return false;
      if (id==="global-pricing" && !["owner","manager"].includes(user?.role)) return false;
      return true;
    });
    const names={finance:["Finance","Manage payments, invoices, expenses and recurring services."],catalog:["Services & Pricing","Control your current offers and all existing price settings."],settingsgroup:["Settings & Workspace","Your team, access control and internal tools."]};
    const [title,subtitle]=names[view]||["Management","Choose a section"];
    root.innerHTML=`<div class="cc-welcome cc-welcome--compact"><div><span class="cc-eyebrow">MANAGEMENT</span><h2>${title}</h2><p>${subtitle}</p></div></div>
      <div class="cc-section-grid">${accessible.map(([id,label,description,icon])=>`<button class="cc-section-card" data-destination="${id}"><span class="cc-section-icon">${icon}</span><strong>${label}</strong><small>${description}</small><span class="cc-card-arrow">↗</span></button>`).join("")}</div>
      ${view==="settingsgroup"?`<div class="cc-panel cc-note-panel"><h2>Other tools</h2><a href="/weddings/studio.html">Open Wedding Studio ↗</a></div>`:""}`;
    quickActions(go,root);
  }
  window.AuraControl = {overview,group};
})();
