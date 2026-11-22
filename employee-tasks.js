(function(){
 "use strict";
 const dashboard=document.getElementById("dashboardView");
 const main=dashboard?.querySelector("main");
 if(!main)return;
 const slug=location.pathname.split("/").filter(Boolean)[0];
 if(!/^(qusai|malek|ala|yessin|yessine|emp-[a-z0-9-]{5,50})$/.test(slug||""))return;
 const apiRoot=slug==="qusai"?"/api/employee/":"/api/employee/"+slug+"/";
 const section=document.createElement("section");
 section.className="panel";
 section.style.cssText="background:#fff;border:1px solid #e4e9e3;border-radius:18px;padding:20px;margin:16px 0;box-shadow:0 3px 15px #103d2112";
 const title=document.createElement("h2");
 title.textContent="Assigned tasks";
 title.style.cssText="font-size:20px;margin:0 0 8px";
 const desc=document.createElement("p");
 desc.textContent="Work assigned by AuraDigital. Update a task when you make progress.";
 desc.style.cssText="font-size:13px;color:#748075;margin:0 0 12px";
 const button=document.createElement("button");
 button.type="button";button.textContent="Show my tasks";button.className="button button-primary";
 const message=document.createElement("p");
 message.setAttribute("role","status");message.style.cssText="font-size:12px;margin:12px 0;color:#536755";
 const list=document.createElement("div");
 list.style.cssText="display:grid;gap:9px;margin-top:14px";
 section.append(title,desc,button,message,list);
 main.append(section);
 let loaded=false;
 async function call(path,method="GET",body=null){
  const response=await fetch(apiRoot+path,{method,credentials:"same-origin",headers:{"Accept":"application/json",...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(data.error||"Cannot load tasks.");
  return data;
 }
 async function load(){
  if(dashboard.classList.contains("hidden"))return;
  message.textContent="Loading assigned tasks…";
  try{
   const data=await call("tasks");
   list.replaceChildren();
   for(const task of data.tasks||[]){
    const card=document.createElement("div");
    card.style.cssText="border:1px solid #e2ebe2;border-radius:12px;padding:13px;background:#fbfdf9;display:grid;gap:8px";
    const header=document.createElement("strong");
    header.textContent=task.title;
    const details=document.createElement("small");
    details.textContent=[task.company||"",task.priority+" priority",task.due_date?"Due "+task.due_date:""].filter(Boolean).join(" · ");
    const controls=document.createElement("div");
    controls.style.cssText="display:flex;gap:10px;flex-wrap:wrap;align-items:center";
    const select=document.createElement("select");
    select.setAttribute("aria-label","Task status");
    select.style.cssText="min-width:160px;padding:8px;border-radius:8px;border:1px solid #d4e0d4";
    for(const value of ["todo","in-progress","blocked","done"]){
     const option=document.createElement("option");
     option.value=value;option.textContent=value.replace("-"," ");option.selected=value===task.status;select.append(option);
    }
    const save=document.createElement("button");
    save.type="button";save.className="button button-primary";save.textContent="Save status";
    save.addEventListener("click",async()=>{
      save.disabled=true;
      try{await call("tasks/"+encodeURIComponent(task.id),"PATCH",{status:select.value});message.textContent="Task updated.";await load();}
      catch(e){message.textContent=e.message;}finally{save.disabled=false;}
    });
    controls.append(select,save);
    card.append(header,details,controls);
    list.append(card);
   }
   if(!(data.tasks||[]).length)message.textContent="No assigned tasks yet.";
   else message.textContent=(data.tasks||[]).length+" assigned task(s)";
   loaded=true;button.textContent="Refresh my tasks";
  }catch(e){message.textContent=e.message||"Tasks are unavailable.";}
 }
 button.addEventListener("click",load);
 const observer=new MutationObserver(()=>{
  if(!dashboard.classList.contains("hidden")&&!loaded)load();
  if(dashboard.classList.contains("hidden"))loaded=false;
 });
 observer.observe(dashboard,{attributes:true,attributeFilter:["class"]});
 if(!dashboard.classList.contains("hidden"))void load();
})();