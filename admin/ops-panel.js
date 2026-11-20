(function(){
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>String(v||"—").slice(0,10);
const money=v=>new Intl.NumberFormat("tr-TR",{maximumFractionDigits:0}).format(Number(v||0))+" TL";
const stages=["lead","contacted","quoted","negotiating","won","lost"];
const states=["todo","in-progress","blocked","done"];
const quoteStates=["draft","sent","accepted","declined"];
const tabs=[["pipeline","Sales Pipeline"],["tasks","Team Tasks"],["quotes","Quotations"],["requests","Request Assignments"],["alerts","Reminders"],["auri","Auri Insights"]];
let active="pipeline";
const opts=(items,selected,blank)=> (blank?"<option value=''>"+esc(blank)+"</option>":"")+
 items.map(x=>"<option value='"+esc(x.value)+"' "+(x.value===String(selected||"")?"selected":"")+">"+esc(x.name)+"</option>").join("");
const employeeOptions=(s,selected)=>opts((s.employees||[]).filter(x=>x.active).map(x=>({value:x.id,name:x.name})),selected,"Unassigned");
const clientOptions=(s,selected)=>opts((s.clients||[]).map(x=>({value:String(x.id),name:(x.company||x.name)+" (#"+x.id+")"})),selected,"Select customer");
const dateInput=v=>"<input type='date' name='dueDate' value='"+esc(v||"")+"'>";
const none=label=>"<div class='cc-empty'>"+esc(label)+"</div>";
const manager=(user)=>user?.role!=="viewer";
function pipeline(s,user){
 const writable=manager(user);
 return "<section class='cc-panel'><div class='cc-panel-head'><div><h2>Sales Pipeline</h2><p>Track every existing client from lead to closed deal.</p></div><span class='cc-count'>"+s.clients.length+" customers</span></div>"+
 "<div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Customer</th><th>Service</th><th>Stage</th><th>Assigned employee</th><th>Action</th></tr></thead><tbody>"+
 (s.clients||[]).map(c=>"<tr><td><strong>"+esc(c.company||c.name)+"</strong><small style='display:block'>#"+esc(c.id)+"</small></td><td>"+esc(c.service||"—")+"</td>"+
 "<td><select data-stage='"+esc(c.id)+"' "+(!writable?"disabled":"")+">"+opts(stages.map(x=>({value:x,name:x.charAt(0).toUpperCase()+x.slice(1)})),c.stage)+"</select></td>"+
 "<td><select data-pipeline-employee='"+esc(c.id)+"' "+(!writable?"disabled":"")+">"+employeeOptions(s,c.employeeId)+"</select></td>"+
 "<td>"+(writable?"<button class='cc-open' data-pipeline-save='"+esc(c.id)+"'>Save</button>":"Read-only")+"</td></tr>").join("")+
 "</tbody></table></div>"+(!s.clients.length?none("Add a customer in CRM to begin."):"")+"</section>";
}
function tasks(s,user){
 const can=manager(user),employees=employeeOptions(s),clients=clientOptions(s);
 const form=can?"<section class='cc-panel'><h2>Create employee task</h2><form id='ops-task-form' class='ops-form'>"+
  "<label>Task title<input name='title' required minlength='3' maxlength='160' placeholder='Prepare website proposal'></label>"+
  "<label>Customer<select name='clientId'>"+clients+"</select></label><label>Employee<select name='employeeId'>"+employees+"</select></label>"+
  "<label>Deadline"+dateInput("")+"</label><label>Priority<select name='priority'><option>normal</option><option>high</option><option>urgent</option></select></label>"+
  "<button class='cc-primary' type='submit'>Create task</button></form></section>":"";
 return form+"<section class='cc-panel'><div class='cc-panel-head'><h2>Assigned Tasks</h2><span class='cc-count'>"+s.tasks.length+" tasks</span></div>"+
 "<div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Task</th><th>Customer</th><th>Assigned to</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>"+
 s.tasks.map(t=>"<tr><td><strong>"+esc(t.title)+"</strong><small style='display:block'>"+esc(t.priority)+" priority</small></td><td>"+esc(t.company||"—")+"</td><td>"+esc(t.employee_name||"Unassigned")+"</td>"+
 "<td>"+esc(date(t.due_date))+"</td><td><select data-task-state='"+esc(t.id)+"' "+(!can?"disabled":"")+">"+opts(states.map(x=>({value:x,name:x})),t.status)+"</select></td>"+
 "<td>"+(can?"<button class='cc-open' data-task-save='"+esc(t.id)+"'>Save</button>":"Read-only")+"</td></tr>").join("")+"</tbody></table></div>"+
 (!s.tasks.length?none("No tasks yet. Assign the first task to an employee."):"")+"</section>";
}
function quotes(s,user){
 const can=manager(user);
 const filtered=s.catalogue.filter(x=>!x.from);
 const form=can?"<section class='cc-panel'><h2>Prepare a quotation</h2><p>Catalogue prices are indicative. Review scope, taxes, and any current negotiated rates before sending.</p>"+
 "<form id='ops-quote-form' class='ops-form'><label>Customer<select name='clientId' required>"+clientOptions(s)+"</select></label>"+
 "<label>Service / package<select name='itemId' required><option value=''>Select service</option>"+opts(filtered.map(x=>({value:x.id,name:x.name+" — "+money(x.amount)+" / "+x.billing})))+"</select></label>"+
 "<label>Responsible employee<select name='employeeId'>"+employeeOptions(s)+"</select></label>"+
 "<label>Internal notes<input type='text' name='notes' maxlength='500' placeholder='Proposal scope'></label><button class='cc-primary' type='submit'>Create draft quotation</button></form></section>":"";
 return form+"<section class='cc-panel'><div class='cc-panel-head'><h2>Quotation Drafts & Status</h2><span class='cc-count'>"+s.quotes.length+" quotations</span></div>"+
 "<div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Customer</th><th>Package</th><th>Indicative price</th><th>Status</th><th></th></tr></thead><tbody>"+
 s.quotes.map(q=>"<tr><td>"+esc(q.company||("#"+q.client_id))+"</td><td><strong>"+esc(q.item_name)+"</strong><small style='display:block'>"+esc(q.catalogue_version)+"</small></td>"+
 "<td>"+esc(money(q.amount))+" / "+esc(q.billing)+"</td><td><select data-quote-state='"+esc(q.id)+"' "+(!can||q.status==="accepted"?"disabled":"")+">"+
 opts(quoteStates.map(x=>({value:x,name:x})),q.status)+"</select></td><td>"+
 (can&&q.status!=="accepted"?"<button class='cc-open' data-quote-save='"+esc(q.id)+"'>Update</button>":"—")+"</td></tr>").join("")+"</tbody></table></div>"+
 (!s.quotes.length?none("No quotation drafts yet."):"")+
 "<p class='cc-muted-note'>Changing a quote to “sent” records your manual status only. Marking “accepted” creates a kickoff task; it does not invoice or charge the customer.</p></section>";
}
function requestAssignments(s,user,requests){
 const can=manager(user);
 const requestOptions=requests.map(r=>({value:r.kind+"|"+r.id,name:r.name+" — "+r.label+" (#"+r.id.slice(0,8)+")"}));
 const form=can?"<section class='cc-panel'><h2>Assign a customer request</h2><p>Assignments do not change the original request status or payment details.</p>"+
 "<form id='ops-assign-form' class='ops-form'><label>Request<select name='requestRef' required><option value=''>Select request</option>"+opts(requestOptions)+"</select></label>"+
 "<label>Employee<select name='employeeId'>"+employeeOptions(s)+"</select></label><label>Notes<input name='notes' type='text' maxlength='500' placeholder='Task instructions'></label>"+
 "<button class='cc-primary' type='submit'>Save assignment</button></form></section>":"";
 const names=new Map(s.employees.map(x=>[x.id,x.name]));
 return form+"<section class='cc-panel'><h2>Request ownership</h2><div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Request</th><th>Employee</th><th>Notes</th></tr></thead><tbody>"+
 (s.assignments||[]).map(a=>"<tr><td>"+esc(a.kind)+" · #"+esc(a.request_id.slice(0,12))+"</td><td>"+esc(names.get(a.employee_id)||"Unassigned")+"</td><td>"+esc(a.notes||"—")+"</td></tr>").join("")+
 "</tbody></table></div>"+(!s.assignments.length?none("No requests have been assigned in Operations."):"")+"</section>";
}
function alerts(s){
 return "<section class='cc-panel'><div class='cc-panel-head'><div><h2>Alerts & Renewals</h2><p>Derived from invoices, subscriptions, team follow-ups, and overdue tasks.</p></div><span class='cc-count'>"+s.alerts.length+" alerts</span></div>"+
 "<div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Type</th><th>Reminder</th><th>Due date</th></tr></thead><tbody>"+
 s.alerts.map(a=>"<tr><td>"+esc(a.type)+"</td><td><strong>"+esc(a.name)+"</strong></td><td>"+esc(date(a.due))+"</td></tr>").join("")+"</tbody></table></div>"+
 (!s.alerts.length?none("No upcoming or overdue items found."):"")+"</section>";
}
function auri(s,user){
 return "<section class='cc-panel'><span class='cc-eyebrow'>AURI — OPERATIONS BRIEF</span><h2>Where attention is needed</h2>"+
 "<p>These rule-based insights use real operations records. Auri AI can help draft messages and next steps, but will not send anything without approval.</p>"+
 "<div class='ops-insights'>"+s.insights.map(v=>"<div class='ops-insight'>✦ "+esc(v)+"</div>").join("")+"</div>"+
 (["owner","manager"].includes(user?.role)?"<button type='button' id='ops-open-ai' class='cc-primary'>Open Auri AI ↗</button>":"")+"</section>";
}
async function loadRequests(api){
 const spec=[["nfc","NFC card","/api/admin/nfc","requests"],["menu","AuraMenu","/api/admin/auramenu","requests"],["website","Website","/api/admin/quicksite","projects"],["pop","AuraPops","/api/admin/aurapops/pops","items"],["order","Order","/api/admin/orders","items"]];
 const responses=await Promise.allSettled(spec.map(x=>api(x[2])));
 const records=[];
 responses.forEach((response,i)=>{
  if(response.status!=="fulfilled")return;
  for(const item of response.value?.[spec[i][3]]||[]) {
   if(item.id)records.push({kind:spec[i][0],id:String(item.id),label:spec[i][1],name:String(item.businessName||item.title||item.name||item.company||"Customer")});
  }
 });
 return records;
}
async function render({root,api,user,go}){
 root.classList.add("cc-root");
 document.getElementById("pageTitle").textContent="Operations Center";
 document.getElementById("pageSubtitle").textContent="Sales, delivery, quotes and priority alerts.";
 root.innerHTML="<section class='cc-panel'>Loading your operations…</section>";
 const [s,requests]=await Promise.all([api("/api/admin/ops/snapshot"),loadRequests(api)]);
 const numbers=[["Leads",s.clients.filter(x=>["lead","contacted"].includes(x.stage)).length],["Open Tasks",s.tasks.filter(x=>x.status!=="done").length],["Quotation Drafts",s.quotes.filter(x=>x.status==="draft").length],["Reminders",s.alerts.length]];
 root.innerHTML="<div class='cc-welcome cc-welcome--compact'><div><span class='cc-eyebrow'>BUSINESS OPERATIONS</span><h2>One workspace. Every next step.</h2><p>Plan work, assign responsibilities, and follow up on customers.</p></div></div>"+
 "<div class='cc-metrics' style='grid-template-columns:repeat(4,minmax(0,1fr))'>"+
 numbers.map(x=>"<div class='cc-metric'><span class='cc-metric-label'>"+esc(x[0])+"</span><strong>"+esc(x[1])+"</strong></div>").join("")+"</div>"+
 "<nav class='ops-tabs' aria-label='Operations sections'>"+tabs.map(t=>"<button type='button' class='cc-filter "+(active===t[0]?"selected":"")+"' data-ops-tab='"+t[0]+"'>"+t[1]+"</button>").join("")+"</nav>"+
 "<p class='ops-msg' id='ops-message' role='status'></p><div id='ops-stage'>"+
 (active==="pipeline"?pipeline(s,user):active==="tasks"?tasks(s,user):active==="quotes"?quotes(s,user):active==="requests"?requestAssignments(s,user,requests):active==="alerts"?alerts(s):auri(s,user))+"</div>";
 const navigate=name=>{active=name;render({root,api,user,go});};
 root.querySelectorAll("[data-ops-tab]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.opsTab)));
 const msg=root.querySelector("#ops-message");
 async function update(path,method,payload,tab=active){
   msg.textContent="Saving…";
   try{await api(path,{method,body:JSON.stringify(payload)});active=tab;await render({root,api,user,go});}
   catch(error){msg.textContent=error.message||"Operation failed.";msg.style.color="#a02020";}
 }
 root.querySelectorAll("[data-pipeline-save]").forEach(b=>b.addEventListener("click",()=>{
   const id=b.dataset.pipelineSave;
   const stage=root.querySelector('[data-stage="'+id+'"]').value,employeeId=root.querySelector('[data-pipeline-employee="'+id+'"]').value;
   update("/api/admin/ops/pipeline","PATCH",{clientId:Number(id),stage,employeeId},"pipeline");
 }));
 root.querySelectorAll("[data-task-save]").forEach(b=>b.addEventListener("click",()=>{
   const id=b.dataset.taskSave,status=root.querySelector('[data-task-state="'+id+'"]').value;
   update("/api/admin/ops/tasks/"+encodeURIComponent(id),"PATCH",{status},"tasks");
 }));
 root.querySelectorAll("[data-quote-save]").forEach(b=>b.addEventListener("click",()=>{
   const id=b.dataset.quoteSave,status=root.querySelector('[data-quote-state="'+id+'"]').value;
   if(status==="accepted"&&!confirm("Confirm the customer accepted this quote? This creates a project kickoff task."))return;
   update("/api/admin/ops/quotes/"+encodeURIComponent(id),"PATCH",{status},"quotes");
 }));
 const taskForm=root.querySelector("#ops-task-form");
 taskForm?.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(taskForm);update("/api/admin/ops/tasks","POST",Object.fromEntries(f.entries()),"tasks");});
 const quoteForm=root.querySelector("#ops-quote-form");
 quoteForm?.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(quoteForm);update("/api/admin/ops/quotes","POST",Object.fromEntries(f.entries()),"quotes");});
 const assignForm=root.querySelector("#ops-assign-form");
 assignForm?.addEventListener("submit",e=>{e.preventDefault();const f=new FormData(assignForm);const [kind,requestId]=String(f.get("requestRef")||"").split("|");update("/api/admin/ops/assignments","PATCH",{kind,requestId,employeeId:f.get("employeeId"),notes:f.get("notes")},"requests");});
 root.querySelector("#ops-open-ai")?.addEventListener("click",()=>go("ai"));
}
window.AuraOps={render};
})();