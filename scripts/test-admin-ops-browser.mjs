import assert from "node:assert/strict";
import {chromium} from "playwright";
const origin=process.env.AURA_OPS_TEST_ORIGIN||"http://127.0.0.1:4197";
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined});
const snapshot={
 clients:[{id:12,name:"Test Owner",company:"Test Café",service:"Website",stage:"contacted",employeeId:null}],
 tasks:[{id:"11111111-1111-4111-8111-111111111111",client_id:12,company:"Test Café",employee_id:"e1",employee_name:"Qusai",title:"Send proposal",priority:"high",status:"todo",due_date:"2026-11-30"}],
 quotes:[],assignments:[],employees:[{id:"e1",name:"Qusai",portal:"qusai",active:true}],
 alerts:[{type:"renewal",name:"Test Café hosting",due:"2026-12-01"}],
 activity:[],catalogue:[{id:"launch",name:"Launch Website",amount:6700,currency:"TRY",billing:"once",from:false}],
 insights:["1 renewal due soon.","1 active team task."]
};
const staff={
 employees:[{id:"e1",portal:"qusai",name:"Qusai",configured:true,active:true,clients:5,followUps:1,lastLogin:"2026-11-19"}],
 logs:[{portal:"qusai",actor:"qusai",action:"client_created",target:"1234",at:"2026-11-19 08:30:00"}]
};
const known={
 "/api/admin/overview":{leads:1,activeClients:1,openOrders:0,unpaidInvoices:0,recurringRevenue:0},
 "/api/admin/nfc":{requests:[]}, "/api/admin/auramenu":{requests:[]},
 "/api/admin/quicksite":{projects:[]},"/api/admin/aurapops/pops":{items:[]},
 "/api/admin/orders":{items:[]},
 "/api/admin/managed-employees":staff,
 "/api/admin/ops/snapshot":snapshot
};
try {
 for(const role of ["owner","viewer"]){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  let creations=0;
  await page.route("**/api/admin/**",async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;
   const admin=req.method()==="GET";
   if(path==="/api/admin/session"){
      return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({authenticated:true,user:{id:"test",username:role,displayName:"Test",role}})});
   }
   if(!admin){
     if(path==="/api/admin/managed-employees"&&role==="owner"&&req.method()==="POST"){
       creations++;
       return route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({employee:{id:"e2",portal:"emp-nadia-ab12cd34",name:"Nadia",url:"/emp-nadia-ab12cd34"},temporaryPassword:"SecureMockOnly1234567890",passwordChangeRequired:true})});
     }
     return route.fulfill({status:403,contentType:"application/json",body:'{"error":"Writes are forbidden in QA"}'});
   }
   return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(known[path]||{items:[]})});
  });
  await page.goto(origin+"/admin/index.html",{waitUntil:"domcontentloaded"});
  await page.locator("#dashboardView:not(.hidden)").waitFor();
  await page.locator("#content .cc-request-panel").waitFor();
  if(role==="owner"){
    await page.locator('#content .cc-action[data-destination="staff"]').click();
    await page.locator("#staff-create:not([hidden])").waitFor();
    await page.goBack();
    await page.locator("#content .cc-request-panel").waitFor();
  }
  await page.locator('#sideNav [data-view="operations"]').click();
  await page.locator("#content h2").filter({hasText:"Sales Pipeline"}).first().waitFor();
  assert.ok((await page.locator("#content").innerText()).includes("Test Café"));
  for(const label of ["Team Tasks","Quotations","Request Assignments","Reminders","Auri Insights"]){
    await page.getByRole("button",{name:label,exact:true}).click();
    assert.ok((await page.locator("#content").innerText()).includes(label==="Reminders"?"Alerts & Renewals":label==="Quotations"?"Quotation Drafts":label==="Auri Insights"?"Where attention is needed":label==="Request Assignments"?"Request ownership":"Assigned Tasks"));
  }
  await page.locator('#sideNav [data-view="settingsgroup"]').click();
  await page.locator("#content .cc-section-grid").waitFor();
  if(role==="owner"){
    await page.locator('#content button[data-destination="staff"]').click();
    await page.locator("#staff-add").waitFor();
    assert.ok((await page.locator("#content").innerText()).includes("Qusai"));
    await page.locator("#staff-filter").selectOption("qusai");
    assert.equal(await page.locator("#staff-log-rows tr").count(),1);
    await page.locator("#staff-add").click();
    await page.locator("#staff-create-form input[name=name]").fill("Nadia");
    await page.locator("#staff-create-form button[type=submit]").click();
    await page.locator("#staff-created:not([hidden])").waitFor();
    assert.ok((await page.locator("#staff-created").innerText()).includes("emp-nadia-ab12cd34"));
    assert.equal(creations,1);
    await page.goBack();
    await page.locator("#content .cc-section-grid").waitFor();
  }else{
    assert.equal(await page.locator("#content button[data-destination=staff]").count(),0);
    assert.equal(creations,0);
  }
  assert.deepEqual(errors,[],"No runtime exceptions");
  await page.close();
 }
 console.log("PASS: Operations, employee creation, audit logs, role access and browser navigation.");
}finally{await browser.close();}
