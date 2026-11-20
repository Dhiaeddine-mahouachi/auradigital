(function(){
"use strict";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dt=v=>String(v||"—").replace("T"," ").slice(0,19);
async function render({root,api,user}){
 if(user?.role!=="owner"){root.innerHTML="<section class='cc-panel'>Owner access required.</section>";return;}
 root.classList.add("cc-root");
 document.getElementById("pageTitle").textContent="Employee Dashboards";
 document.getElementById("pageSubtitle").textContent="Create workspaces and review employee logs.";
 root.innerHTML="<section class='cc-panel'>Loading employees and activity…</section>";
 const data=await api("/api/admin/managed-employees");
 const fixed=["qusai","malek","ala","yessin"];
 const employees=data.employees||[];
 const profiles=[
   ...fixed.map(p=>employees.find(e=>e.portal===p)||{portal:p,name:p.charAt(0).toUpperCase()+p.slice(1),configured:false,clients:0,followUps:0}),
   ...employees.filter(e=>!fixed.includes(e.portal))
 ];
 const cards=profiles.map(e=>"<article class='cc-section-card' style='cursor:default;min-height:180px'>"+
   "<span class='cc-section-icon'>♙</span><strong>"+esc(e.name)+"</strong>"+
   "<small>"+(e.configured?(e.active?"Active":"Inactive"):"Not configured")+" · "+Number(e.clients||0)+" clients · "+Number(e.followUps||0)+" follow-ups</small>"+
   "<small>Last login: "+esc(dt(e.lastLogin))+"</small>"+
   "<a class='cc-open' href='/"+encodeURIComponent(e.portal)+"' target='_blank' rel='noopener noreferrer'>Open dashboard ↗</a></article>").join("");
 const options=profiles.map(e=>"<option value='"+esc(e.portal)+"'>"+esc(e.name)+"</option>").join("");
 root.innerHTML="<div class='cc-welcome cc-welcome--compact'><div><span class='cc-eyebrow'>TEAM WORKSPACES</span><h2>Employee Dashboards</h2><p>Create accounts and review employee work.</p></div><button type='button' id='staff-add' class='cc-primary'>+ Add Employee Dashboard</button></div>"+
  "<section class='cc-panel' id='staff-create' hidden><h2>Create a private employee dashboard</h2><p>A strong temporary password is generated automatically and must be changed at first login.</p>"+
  "<form id='staff-create-form' style='display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-top:14px'>"+
  "<label style='flex:1;min-width:190px'>Employee name<input name='name' type='text' minlength='2' maxlength='80' required placeholder='First and last name' autocomplete='off'></label>"+
  "<button type='submit' class='cc-primary'>Create dashboard</button><button id='staff-cancel' type='button' class='cc-open'>Cancel</button></form>"+
  "<p id='staff-create-error' role='alert'></p><div id='staff-created' hidden></div></section>"+
  "<section class='cc-panel'><div class='cc-panel-head'><div><h2>Private employee workspaces</h2><p>Existing portals remain unchanged.</p></div><span class='cc-count'>"+profiles.length+" accounts</span></div>"+
  "<div class='cc-section-grid' style='grid-template-columns:repeat(auto-fit,minmax(200px,1fr))'>"+cards+"</div></section>"+
  "<section class='cc-panel'><div class='cc-panel-head'><div><h2>Employee activity logs</h2><p>Sign-ins, client changes, account creation and other recorded actions.</p></div>"+
  "<select id='staff-filter' style='max-width:190px'><option value=''>All employees</option>"+options+"</select></div>"+
  "<div class='cc-table-wrap'><table class='cc-table'><thead><tr><th>Employee</th><th>Action</th><th>Record</th><th>Time (UTC)</th></tr></thead><tbody id='staff-log-rows'></tbody></table></div>"+
  "<p id='staff-log-empty' class='cc-muted-note' hidden>No recorded activity for this employee.</p></section>";
 const tbody=root.querySelector("#staff-log-rows"),filter=root.querySelector("#staff-filter"),empty=root.querySelector("#staff-log-empty");
 const logs=data.logs||[];
 function showLogs(){
   const chosen=filter.value,show=logs.filter(e=>!chosen||e.portal===chosen);
   tbody.innerHTML=show.map(e=>"<tr><td><strong>"+esc(profiles.find(p=>p.portal===e.portal)?.name||e.portal)+"</strong></td>"+
    "<td>"+esc(String(e.action).replaceAll("_"," "))+"</td><td>"+esc(e.target||"—")+"</td><td class='cc-date'>"+esc(dt(e.at))+"</td></tr>").join("");
   empty.hidden=show.length>0;
 }
 filter.addEventListener("change",showLogs);showLogs();
 const create=root.querySelector("#staff-create");
 root.querySelector("#staff-add").addEventListener("click",()=>{create.hidden=false;create.querySelector("input").focus();});
 root.querySelector("#staff-cancel").addEventListener("click",()=>{create.hidden=true;});
 root.querySelector("#staff-create-form").addEventListener("submit",async event=>{
   event.preventDefault();
   const form=event.currentTarget,button=form.querySelector("[type=submit]"),error=root.querySelector("#staff-create-error"),result=root.querySelector("#staff-created");
   error.textContent="";result.hidden=true;button.disabled=true;
   try{
     const name=String(new FormData(form).get("name")||"");
     const created=await api("/api/admin/managed-employees",{method:"POST",body:JSON.stringify({name})});
     const member=created.employee;
     result.hidden=false;
     result.innerHTML="<div class='cc-load-warning' style='margin-top:12px'><strong>Created: "+esc(member.name)+"</strong><p>Share the private link and password securely. The temporary password appears once and must be changed on first login.</p>"+
      "<p><a target='_blank' rel='noopener noreferrer' href='"+esc(member.url)+"'>"+esc(location.origin+member.url)+"</a></p>"+
      "<label>One-time password<input id='staff-temp' type='text' readonly value='"+esc(created.temporaryPassword)+"'></label>"+
      "<button id='staff-copy' class='cc-open' type='button'>Copy password</button> "+
      "<button id='staff-refresh' class='cc-open' type='button'>Refresh employee list</button></div>";
     result.querySelector("#staff-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(created.temporaryPassword);}catch{result.querySelector("#staff-temp").select();}});
     result.querySelector("#staff-refresh").addEventListener("click",()=>render({root,api,user}));
     form.reset();
   }catch(e){error.textContent=e.message||"Could not create employee account.";}
   finally{button.disabled=false;}
 });
}
window.AuraStaff={render};
})();