// Approved public AuraDigital TRY catalogue. Do not duplicate prices in page templates.
// Historical customer invoices/subscriptions and existing international rate settings are separate.
export const catalogue = {
  version: "2026-10-13",
  currency: "TRY",
  taxes: "Taxes are confirmed in the individual proposal; do not assume tax-inclusive pricing.",
  website: [
    {id:"launch", name:"Launch", price:6750, billing:"once", audience:"Small businesses launching online", infraIncluded:false, features:["Up to 3 pages","Responsive design","Contact form","WhatsApp integration","Basic SEO"], includes:[]},
    {id:"growth", name:"Growth", price:13400, billing:"once", audience:"Growing brands with multiple services", infraIncluded:false, features:["4–10 pages","Premium custom design","Lead forms","Animations","SEO-ready structure"], includes:[]},
    {id:"system", name:"System", price:22400, billing:"once", audience:"Teams needing secure data access", infraIncluded:true, features:["Business website","Basic dashboard","Login and user roles","Data management","First-year standard infrastructure"], includes:["basic-dashboard"]},
    {id:"scale-commerce", name:"Scale Commerce", price:26900, billing:"once", audience:"Shops and service booking businesses", infraIncluded:true, features:["E-commerce OR booking website (choose one)","Payments","Order or appointment management","Administration interface","First-year standard infrastructure"], includes:["commerce-or-booking"]},
    {id:"business-platform", name:"Business Platform", price:35900, billing:"once", audience:"Businesses needing connected digital workflows", infraIncluded:true, features:["Website","Customer dashboard","Lightweight CRM","Limited workflow automation","Scoped integrations","First-year standard infrastructure"], includes:["basic-dashboard","crm"]},
  ],
  care: [
    {id:"essential-care", name:"Essential Care", price:1950, billing:"month", updates:2, audience:"Small sites requiring dependable upkeep", features:["2 small content updates per month total","Uptime monitoring","Basic security checks","Routine website checks"]},
    {id:"business-care", name:"Business Care", price:4900, billing:"month", updates:8, audience:"Active businesses needing regular changes", features:["Everything in Essential Care","8 content updates per month total","Technical maintenance","Monthly report","Support for one existing business email mailbox"]},
    {id:"growth-care", name:"Growth Care", price:7900, billing:"month", updates:16, audience:"Sites with ongoing conversion improvements", features:["Everything in Business Care","16 updates per month total","Performance checks","SEO reporting","Scoped conversion improvements"]},
    {id:"managed-growth", name:"Managed Growth", price:12900, billing:"month", updates:24, audience:"Businesses combining web care and advertising", featured:true, features:["Everything in Growth Care","24 updates per month total","Priority support","Scoped landing-page optimization","Basic one-channel ads management","Initial standard ads setup included"], includedAds:"basic-ads", includedSetup:true},
  ],
  infrastructure: [
    {id:"standard-infra", name:"Standard hosting, eligible domain & baseline security", price:2000, billing:"year", features:["Standard website hosting","Eligible standard domain","DNS configuration","SSL","Baseline security configuration"]},
    {id:"managed-hosting", name:"Enhanced managed hosting", price:350, billing:"month", from:true, features:["Enhanced managed infrastructure replaces equivalent standard hosting coverage","Domain registration priced separately unless agreed"]},
    {id:"business-email", name:"First business email mailbox setup", price:900, billing:"once", features:["First mailbox configuration","Third-party mailbox subscriptions charged separately"]},
    {id:"additional-email", name:"Additional business email mailbox setup", price:250, billing:"once", features:["Per additional mailbox","Provider subscription not included"]},
    {id:"security-hardening", name:"Advanced security hardening", price:3500, billing:"once", features:["Scoped security configuration and hardening"]},
  ],
  advertising: [
    {id:"ads-setup", name:"Advertising setup", price:2500, billing:"once", features:["Initial standard campaign setup"]},
    {id:"basic-ads", name:"Basic Ads Management", price:3500, billing:"month", features:["One advertising channel","Campaign oversight and optimization"]},
    {id:"advanced-ads", name:"Advanced Ads Management", price:6500, billing:"month", features:["Broader scoped campaign management","Reporting"]},
  ],
  saas: [
    {id:"spinflow-start", name:"Start", price:1490, billing:"month", users:3, features:["CRM","Sales tracking","Basic inventory","Reporting","3 included users","Standard cloud hosting, security and updates"], availability:"planned"},
    {id:"spinflow-business", name:"Business", price:3490, billing:"month", users:10, features:["Everything in Start","Advanced inventory","Purchasing and expenses","Staff permissions","Workflow automation","10 included users","Standard SaaS infrastructure"], availability:"planned"},
    {id:"spinflow-pro", name:"Pro", price:6990, billing:"month", users:25, branches:3, features:["Everything in Business","Advanced reporting","API access within plan limits","Up to 3 branches","25 included users","Priority support","Standard SaaS infrastructure"], availability:"planned"},
  ],
  saasAddons: [
    {id:"saas-user", name:"Additional SaaS user", price:150, billing:"month"},
    {id:"saas-branch", name:"Additional SaaS branch beyond plan allowance", price:750, billing:"month"},
  ],
  erp: [
    {id:"erp-essential", name:"ERP Essential", price:49900, billing:"once", annualHosting:6000, features:["CRM","Sales","Inventory","Dashboard","User permissions"]},
    {id:"erp-business", name:"ERP Business", price:79900, billing:"once", annualHosting:12000, features:["Essential features","Purchasing","Expenses","Staff permissions","Workflows","Reporting"]},
    {id:"erp-enterprise", name:"ERP Enterprise", price:129000, from:true, billing:"once", annualHosting:24000, hostingFrom:true, features:["Multi-department architecture","Custom modules","Advanced roles","Integrations","Reporting"]},
  ],
  erpAddons: [
    {id:"erp-reporting", name:"Reporting dashboard", price:5900, from:true, billing:"once"},
    {id:"erp-pos", name:"Restaurant POS/order module", price:9900, from:true, billing:"once"},
    {id:"erp-hr", name:"HR/attendance module", price:12900, from:true, billing:"once"},
    {id:"erp-accounting", name:"Accounting integration", price:7900, from:true, billing:"once"},
    {id:"erp-api", name:"Custom API integration", price:4900, from:true, billing:"once"},
  ],
  websiteAddons: [
    {id:"basic-dashboard", name:"Basic dashboard", price:11900, minRank:1},
    {id:"advanced-dashboard", name:"Advanced dashboard", price:18900, from:true, minRank:1},
    {id:"ecommerce", name:"E-commerce module", price:16900, minRank:1},
    {id:"booking", name:"Booking module", price:16900, minRank:1},
    {id:"crm", name:"Lightweight CRM module", price:14500, minRank:2},
  ],
  other: [
    {id:"auramenu-self", name:"AuraMenu self-service", price:1599, billing:"once"},
    {id:"auramenu-managed", name:"AuraMenu done-for-you", price:2500, from:true, billing:"once"},
    {id:"nfc-card", name:"Standard NFC card", price:700, from:true, billing:"once"},
    {id:"erp-maintenance", name:"Custom ERP maintenance / support", price:2500, from:true, billing:"month"},
  ],
};

export const groups = ["website","care","infrastructure","advertising","saas","saasAddons","erp","erpAddons","websiteAddons","other"];
export const getItem = id => groups.flatMap(g => catalogue[g]).find(p => p.id === id) || null;
export const fmt = (number, lang="en") => new Intl.NumberFormat(lang==="tr"?"tr-TR":"en-US",{maximumFractionDigits:0}).format(number)+" TL";
export const priceText = (item, lang="en") => (item.from ? (lang==="tr"?"Başlangıç ":"From ") : "")+fmt(item.price,lang)+(item.billing==="month"? (lang==="tr"?"/ay":"/month") : item.billing==="year"?(lang==="tr"?"/yıl":"/year"):"");
export const firstYearWebsite = (id, infra = true) => {
  const plan = catalogue.website.find(p => p.id === id);
  if (!plan) throw new Error("Unknown website plan");
  return plan.price + (infra && !plan.infraIncluded ? getItem("standard-infra").price : 0);
};
export const firstYearERP = id => {
  const plan=catalogue.erp.find(p=>p.id===id);
  if(!plan) throw new Error("Unknown ERP plan");
  return plan.price+plan.annualHosting;
};
export function quote({id, addons=[], standardHosting=false, enhancedHosting=false, managedErpHosting=true, extraUsers=0, extraBranches=0}={}) {
  const item=getItem(id);
  if(!item) throw new Error("Unknown catalogue entry");
  if(standardHosting && enhancedHosting) throw new Error("Choose one hosting option only");
  if(!Number.isInteger(extraUsers)||extraUsers<0||!Number.isInteger(extraBranches)||extraBranches<0) throw new Error("Invalid add-on quantity");
  const group=groups.find(g=>catalogue[g].includes(item));
  if(["websiteAddons","erpAddons","saasAddons"].includes(group)) throw new Error("Add-ons require a compatible parent package");
  if(group!=="website" && (standardHosting || enhancedHosting)) throw new Error("Website hosting selection is not applicable");
  if(group!=="saas" && (extraUsers || extraBranches)) throw new Error("SaaS quantities require a cloud ERP plan");
  const accepted=[];
  let once=item.billing==="once"?item.price:0, monthly=item.billing==="month"?item.price:0, annual=item.billing==="year"?item.price:0;
  const selected=[...new Set(addons)];
  if(group==="website") {
    const rank=catalogue.website.indexOf(item);
    for(const aid of selected) {
      const addon=catalogue.websiteAddons.find(a=>a.id===aid);
      if(!addon) throw new Error("Unknown website add-on");
      if(rank<addon.minRank) throw new Error("Add-on not eligible for this package");
      if(item.includes.includes(aid)) continue;
      if(item.includes.includes("commerce-or-booking") && ["ecommerce","booking"].includes(aid)) continue;
      if(aid==="advanced-dashboard" && item.includes.includes("basic-dashboard")) {
        // Upgrade scope/price is not approved; ask for a custom quote instead.
        throw new Error("Dashboard upgrade requires a scoped quote");
      }
      once+=addon.price;accepted.push(addon.id);
    }
    if(standardHosting&&!item.infraIncluded) annual+=getItem("standard-infra").price;
    if(enhancedHosting) monthly+=getItem("managed-hosting").price;
  } else if(group==="erp") {
    for(const aid of selected) {
      const addon=catalogue.erpAddons.find(a=>a.id===aid);
      if(!addon) throw new Error("Unknown ERP add-on");
      once+=addon.price;accepted.push(addon.id);
    }
    if(managedErpHosting) annual+=item.annualHosting;
  } else if(group==="saas") {
    if(selected.length) throw new Error("SaaS add-ons use user and branch quantities");
    if(extraBranches>0 && item.id!=="spinflow-pro") throw new Error("Branch allowance requires a scoped proposal");
    monthly+=extraUsers*getItem("saas-user").price + extraBranches*getItem("saas-branch").price;
  } else if(group==="care") {
    // Bundled Managed Growth ads setup/basic ads must never be charged again.
    if(selected.includes("advanced-ads")&&item.id==="managed-growth") monthly+=getItem("advanced-ads").price-getItem("basic-ads").price;
    else if(selected.length) throw new Error("Care add-on must be quoted separately");
  } else if(selected.length) throw new Error("Unsupported add-on combination");
  return {catalogueVersion:catalogue.version,id,addons:accepted,once,monthly,annual,firstYear:once+monthly*12+annual,
    indicative:true,taxNote:catalogue.taxes,
    hosting:(group==="website"?(item.infraIncluded?"included-first-year":enhancedHosting?"enhanced-managed":standardHosting?"standard-annual":"not-selected"):group==="erp"?(managedErpHosting?"managed-erp":"customer-managed"):group==="saas"?"included-saas":"not-included")};
}
