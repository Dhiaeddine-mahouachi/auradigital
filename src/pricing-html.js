import { catalogue, getItem, fmt, priceText, firstYearWebsite, firstYearERP } from "../pricing/catalogue.js";

// Initial HTML is generated from the same catalogue as interactive browser and API pricing.
// The client-side pricing module progressively enhances these sections after module load.
const escape = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
  .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const amount = n => escape(fmt(n));
const price = item => escape(priceText(item));
const action = (p,label="Request Quote") => '<a class="btn btn-ghost" href="/contact?service=pricing&amp;plan='+
  encodeURIComponent(p.id)+'">'+escape(label)+' ↗</a>';
const bullets = values => '<ul class="aura-price-features">'+(values||[]).map(x=>'<li>'+escape(x)+'</li>').join("")+'</ul>';
const card = (p,note="",label="Choose Package") => '<article class="aura-price-card">'+
  '<h3>'+escape(p.name)+'</h3>'+(p.audience?'<p class="aura-price-audience">'+escape(p.audience)+'</p>':'')+
  '<p class="aura-price-money">'+price(p)+'</p><small class="aura-price-period">'+(p.billing==="month"?"Monthly":p.billing==="year"?"Annual":"One-time")+'</small>'+
  (p.availability==="planned"?'<p class="aura-price-warning">Planned service · request availability</p>':'')+
  '<details class="aura-price-details" open><summary>View full features</summary>'+bullets(p.features)+'</details>'+
  (note?'<p class="aura-price-total">'+note+'</p>':'')+action(p,label)+'</article>';
const grid = (items,extra="") => '<div class="aura-price-card-grid">'+items.map(p=>card(p,extra)).join("")+'</div>';
const services = [
  ["Web Design & Development","launch","/websites","Business websites, landing pages and web applications."],
  ["Google & Meta Ads","basic-ads","#advertising","Campaign setup, conversion tracking and management."],
  ["Website Care","essential-care","/packages","Website maintenance, uptime checks and defined monthly updates."],
  ["Hosting & Security","standard-infra","#infrastructure","Domain, DNS, SSL, hosting and baseline protection."],
  ["Business Email","business-email","#infrastructure","Business mailbox setup; provider subscriptions are separate."],
  ["ERP & systems","spinflow-start","/spinflow","Cloud SaaS and scoped custom ERP for business operations."],
  ["SEO & Google Maps",null,"/contact?service=SEO","Local visibility and on-page SEO."],
  ["AI & Automation",null,"/contact?service=AI%20%26%20Automation","Lead routing and workflow automation."],
  ["Brand & Creative Direction",null,"/contact?service=Brand%20Design","Brand identity and advertising creative."],
  ["NFC & QR","nfc-card","/nfc","NFC cards, digital menus and smart experiences."],
  ["AuraWeddings",null,"/aura-weddings","Animated invitations, design studio and RSVP."],
];
const home = [
  ["Websites & Development","launch","/websites"],
  ["Website Management","essential-care","/packages"],
  ["Hosting & Security","standard-infra","/services#infrastructure"],
  ["Advertising & Growth","basic-ads","/services#advertising"],
  ["Business Systems & ERP","spinflow-start","/spinflow"],
  ["Dashboards & Automation","basic-dashboard","/websites#web-addons"],
];
const tr = (title,url,item) => '<a class="aura-price-mini" href="'+escape(url)+'">'+
    '<span>'+escape(title)+'</span><b>'+price(item)+'</b><span aria-hidden="true">↗</span></a>';
const serviceCard = ([name,id,url,description]) => {
  const item=id?getItem(id):null;
  return '<article class="service-card"><div><h3>'+escape(name)+'</h3><p>'+escape(description)+'</p>'+
  '<p class="aura-price-service">'+(item?price(item):'Request Quote')+'</p>'+
  (id==="spinflow-start"?'<p class="aura-price-footnote">Custom ERP: '+price(getItem("erp-essential"))+'</p>':'')+
  '<a class="service-link" href="'+escape(url)+'">Explore ↗</a></div></article>';
};
const infraRows = catalogue.infrastructure.map(p=>'<article><div><strong>'+escape(p.name)+'</strong>'+
    '<small>'+escape((p.features||[]).join(" · "))+'</small></div><div><b>'+price(p)+'</b>'+
    '<a href="/contact?service=pricing&amp;plan='+escape(p.id)+'">Request Quote ↗</a></div></article>').join("");
const websiteCards = () => catalogue.website.map(p=>card(p,
  (p.infraIncluded?'First-year infrastructure included. ':'Optional infrastructure. ')+
  'First-year with standard hosting: <b>'+amount(firstYearWebsite(p.id,true))+'</b>')).join("");
const planComparison = () => '<div class="aura-price-table"><table><thead><tr><th>Compare packages</th>'+
 catalogue.website.map(p=>'<th>'+escape(p.name)+'</th>').join("")+'</tr></thead><tbody>'+
 '<tr><th>One-time price</th>'+catalogue.website.map(p=>'<td>'+amount(p.price)+'</td>').join("")+'</tr>'+
 '<tr><th>First-year infrastructure</th>'+catalogue.website.map(p=>'<td>'+
  (p.infraIncluded?'Included':'Optional')+'</td>').join("")+'</tr></tbody></table></div>';
const webAddons = () => '<div class="aura-price-compact">'+catalogue.websiteAddons.map(p=>
 '<article><strong>'+escape(p.name)+'</strong><b>'+escape(p.from?'From ':'')+amount(p.price)+'</b></article>').join("")+
 '</div><p class="aura-price-footnote">Dashboard and commerce/booking modules require Growth or above; CRM requires System or above. Included functionality is never charged twice. Choose options with the interactive configurator, or request a scoped quote.</p>';
const erpSection = () => '<div class="aura-price-card-grid">'+catalogue.erp.map(p=>card(p,
  'Managed ERP hosting: '+amount(p.annualHosting)+'/year; first-year combined: <b>'+amount(firstYearERP(p.id))+'</b>')).join("")+'</div>';
export function renderPricingFallback(view) {
 switch(view) {
  case "home": return '<div class="aura-price-mini-grid">'+home.map(([name,id,url])=>
    tr(name,url,getItem(id))).join("")+'</div>';
  case "services": return services.map(serviceCard).join("");
  case "packages": return catalogue.care.map(p=>card(p, p.updates+' total content updates / month')).join("");
  case "infrastructure": return '<div class="aura-price-compact">'+infraRows+'</div>';
  case "advertising": return grid(catalogue.advertising)+
    '<p class="aura-price-footnote"><b>Advertising media spend is not included.</b> Managed Growth includes basic management and initial setup. Advanced management upgrade: '+amount(getItem("advanced-ads").price-getItem("basic-ads").price)+'/month.</p>';
  case "websites": return websiteCards();
  case "website-compare": return planComparison();
  case "web-addons": return webAddons();
  case "spinflow": return '<h3>Spinflow Cloud · SaaS (planned)</h3>'+grid(catalogue.saas)+
    '<h3 style="margin-top:2rem">Spinflow Custom · One-Time ERP</h3>'+erpSection()+
    '<p class="aura-price-footnote">SaaS hosting is included. Custom ERP managed hosting is annual, and approved customer-managed hosting is optional.</p>';
  default: return "";
 }
}
