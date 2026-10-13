import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { catalogue, getItem, quote, firstYearWebsite, firstYearERP } from "../pricing/catalogue.js";
import app from "../src/worker-entry.js";
import { d1 } from "./d1.mjs";

test("approved one-time website packages remain authoritative", () => {
  assert.deepEqual(catalogue.website.map(p => p.price), [6750, 13400, 22400, 26900, 35900]);
  assert.equal(firstYearWebsite("launch"), 8750);
  assert.equal(firstYearWebsite("growth"), 15400);
  assert.equal(firstYearWebsite("system"), 22400);
  assert.equal(firstYearWebsite("scale-commerce"), 26900);
  assert.equal(firstYearWebsite("business-platform"), 35900);
});
test("monthly website care tiers never contain retired weekly prices", () => {
  assert.deepEqual(catalogue.care.map(p => p.price), [1950, 4900, 7900, 12900]);
  assert.deepEqual(catalogue.care.map(p => p.updates), [2,8,16,24]);
  assert.ok(catalogue.care.every(p => p.billing === "month"));
  assert.equal(quote({ id:"managed-growth", addons:["advanced-ads"] }).monthly, 15900);
  assert.equal(quote({ id:"managed-growth" }).monthly, 12900);
});
test("website add-on and hosting calculation avoids double billing", () => {
  assert.equal(quote({ id:"growth", addons:["basic-dashboard"] }).once, 25300);
  assert.equal(quote({ id:"growth", addons:["ecommerce"] }).once, 30300);
  assert.equal(quote({ id:"system", addons:["crm"] }).once, 36900);
  assert.equal(quote({ id:"business-platform", addons:["crm", "basic-dashboard"], standardHosting:true }).firstYear, 35900);
  assert.equal(quote({ id:"scale-commerce", addons:["ecommerce"], standardHosting:true }).firstYear, 26900);
  assert.equal(quote({ id:"launch", standardHosting:true }).firstYear, 8750);
  assert.equal(quote({ id:"launch", enhancedHosting:true }).firstYear, 6750 + 350 * 12);
  assert.throws(() => quote({ id:"launch", addons:["crm"] }), /eligible/);
  assert.throws(() => quote({ id:"launch", standardHosting:true, enhancedHosting:true }), /one hosting/);
  assert.throws(() => quote({ id:"system", addons:["advanced-dashboard"] }), /scoped quote/);
  assert.throws(() => quote({ id:"basic-dashboard" }), /parent package/);
  assert.throws(() => quote({ id:"erp-pos" }), /parent package/);
});
test("ERP and SaaS purchasing models remain distinct", () => {
  assert.deepEqual(catalogue.saas.map(p=>p.price), [1490,3490,6990]);
  assert.ok(catalogue.saas.every(p=>p.availability==="planned"));
  assert.deepEqual(catalogue.erp.map(p=>p.price), [49900,79900,129000]);
  assert.deepEqual(catalogue.erp.map(p=>p.annualHosting), [6000,12000,24000]);
  assert.equal(firstYearERP("erp-essential"), 55900);
  assert.equal(firstYearERP("erp-business"), 91900);
  assert.equal(firstYearERP("erp-enterprise"), 153000);
  assert.equal(quote({id:"erp-business", managedErpHosting:false}).firstYear, 79900);
  assert.equal(quote({id:"spinflow-pro", extraUsers:2,extraBranches:1}).monthly, 8040);
  assert.throws(()=>quote({id:"spinflow-start",extraBranches:1}),/allowance/);
  assert.equal(getItem("erp-pos").price, 9900);
  assert.equal(getItem("business-email").price, 900);
});
test("public pages load the shared catalogue without exposing old tiers", () => {
  const html=name=>readFileSync(new URL("../"+name+".html",import.meta.url),"utf8");
  for(const name of ["index","services","packages","websites","spinflow","contact"]){
    const s=html(name);assert.match(s,/pricing\/ui\.js/);assert.match(s,/<footer id="siteFooter">/);
  }
  assert.doesNotMatch(html("packages"), /3[.,]590|5[.,]590|7[.,]590|data-weekly|data-price-mode/);
  assert.doesNotMatch(html("services"), /Social Media &amp; Content|1 Sayfa · 5\.000/);
  assert.match(html("index"), /class="service-network"/);
});
test("contact API stores server-verified pricing and rejects invented prices", async () => {
  const sqlite=new DatabaseSync(":memory:");
  const db=d1(sqlite);
  const allow={limit:async()=>({success:true})};
  const env={DB:db,TRACK_RATE_LIMITER:allow,LOGIN_RATE_LIMITER:allow};
  const ctx={waitUntil(){}};
  try {
    const call=async (body)=>app.fetch(new Request("https://auradigitalworks.com/api/contact",{
      method:"POST",headers:{Origin:"https://auradigitalworks.com","Content-Type":"application/json"},
      body:JSON.stringify(body)
    }),env,ctx);
    const base={name:"Pricing test business",email:"pricing-test@example.com",phone:"+90 500 111 0000",service:"Pricing / Quote",message:"Request a plan.",language:"en"};
    const response=await call({...base,pricingSelection:{id:"growth",addons:["basic-dashboard"],standardHosting:true}});
    assert.equal(response.status,201,await response.text().catch(()=>""));
    const row=await db.prepare("SELECT notes FROM clients WHERE email=?").bind(base.email).first();
    assert.match(row.notes, /Verified catalogue quote snapshot/);
    assert.match(row.notes, /"oneTime":25300/);
    assert.match(row.notes, /"annual":2000/);
    assert.match(row.notes, /"catalogueVersion":"2026-10-13"/);
    const invalid=await call({...base,email:"second@example.com",pricingSelection:{id:"growth",addons:["invented-addon"]}});
    assert.equal(invalid.status,400);
    assert.equal((await db.prepare("SELECT COUNT(*) count FROM clients WHERE email=?").bind("second@example.com").first()).count,0);
  } finally { sqlite.close(); }
});


test("public pricing APIs expose only approved active prices and no weekly offers", async () => {
  const sqlite=new DatabaseSync(":memory:");
  const db=d1(sqlite);
  const limiter={limit:async()=>({success:true})};
  const env={DB:db,TRACK_RATE_LIMITER:limiter,LOGIN_RATE_LIMITER:limiter};
  const ctx={waitUntil(){}};
  try {
    const pricingResponse=await app.fetch(new Request("https://auradigitalworks.com/api/pricing"),env,ctx);
    assert.equal(pricingResponse.status,200);
    const current=(await pricingResponse.json()).catalogue;
    assert.equal(current.version,catalogue.version);
    assert.deepEqual(current.care.map(x=>x.price),[1950,4900,7900,12900]);
    const contentResponse=await app.fetch(new Request("https://auradigitalworks.com/api/public-content"),env,ctx);
    assert.equal(contentResponse.status,200);
    const content=await contentResponse.json();
    assert.deepEqual(content.packages.map(x=>x.monthly_price),[1950,4900,7900,12900]);
    assert.ok(content.packages.every(x=>x.weekly_price===0));
    assert.equal(content.pricing.version,catalogue.version);
    assert.equal(content.pricing.infrastructure.find(x=>x.id==="standard-infra").price,2000);
  } finally {sqlite.close();}
});
