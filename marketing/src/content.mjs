export const roadmap = '/hub/signup';
export const services = [
  {slug:'website', name:'Website', icon:'panels-top-left', goal:'Get online', headline:'Give customers one place to find you.', detail:'A fast, professional site that makes it easy to see what you offer and take the next step.', items:['Mobile-friendly pages','Clear contact or booking links','Search-ready page structure'], delivery:'A published website and a handover showing how to update it.', asset:'/media/landing/showcase-website.webp', visual:'Café website example', reference:'/websites', price:'launch'},
  {slug:'auramenu', name:'AuraMenu', icon:'qr-code', goal:'Get online', headline:'Put your menu one scan away.', detail:'Let guests browse dishes, prices and languages on their phones. Update your menu whenever it changes.', items:['Mobile menu page','Table-ready QR code','Categories, prices and languages'], delivery:'A live menu link, a QR asset and menu editing access where included.', asset:'/media/landing/showcase-menu.webp', visual:'QR menu example', reference:'/aura-menu', price:'auramenu-managed'},
  {slug:'ai-whatsapp', name:'AI & WhatsApp replies', icon:'messages-square', goal:'Get customers', headline:'Answer customers while you work.', detail:'Prepare answers for common questions and give your team a clear path to take over.', items:['Frequently asked replies','Routing to a person','Review and test scenarios'], delivery:'An agreed reply flow and a handover for the people managing it.', visual:'WhatsApp reply example'},
  {slug:'maps-seo', name:'Google Maps & SEO', icon:'map-pin', goal:'Get found', headline:'Help nearby customers discover you.', detail:'Make your business information consistent and give search engines a clearer view of what you do.', items:['Business Profile review','Local listing recommendations','On-page search improvements'], delivery:'A summary of completed changes and a checklist for maintaining your listing.', visual:'Local search example'},
  {slug:'business-email', name:'Business email', icon:'mail', goal:'Run smoothly', headline:'Send from your own business domain.', detail:'Set up a professional mailbox customers can recognize and your team can manage.', items:['Mailbox and domain setup','DNS verification','Send and receive checks'], delivery:'A working mailbox and sign-in instructions.', visual:'Custom-domain inbox example'},
  {slug:'hosting-security', name:'Hosting & security', icon:'shield-check', goal:'Run smoothly', headline:'Keep your site online and ready.', detail:'Get your hosting, HTTPS and renewal dates set up with a clear record of what is covered.', items:['Hosting and domain configuration','HTTPS checks','Renewal details in your Hub'], delivery:'Hosting setup, live connection checks and a record of renewal terms.', visual:'Hosting status example', price:'standard-infra'},
  {slug:'brand-creative', name:'Brand & creative', icon:'palette', goal:'Get customers', headline:'Look recognizable wherever you show up.', detail:'Give your website, menu or socials a consistent visual identity your team can reuse.', items:['Visual direction','Agreed creative assets','Color and typography guidance'], delivery:'The approved creative files and a short usage guide.', visual:'Visual identity example'},
];

export const industries = [
  {slug:'restaurants-cafes', name:'Restaurants & cafés', icon:'utensils', headline:'Get more guests from search to table.', pain:'Paper menus go out of date. Guests need opening hours, directions and a menu before they visit.', steps:['Publish a QR menu','Make your location easy to find','Prepare replies for opening hours and bookings'], ask:'Let’s get your menu online first. Then we can help guests find you nearby.', recommended:['auramenu','maps-seo','ai-whatsapp'], result:'A café can give guests one menu link to open from a table, a search result or a message.'},
  {slug:'local-services', name:'Local services', icon:'wrench', headline:'Make it easier to book your work.', pain:'Customers want to know your service area, what you do and how to get a quote.', steps:['Publish services and coverage','Improve your Maps listing','Give inquiries a clear reply path'], ask:'Start with a page that tells customers where you work and how to ask for a quote.', recommended:['website','maps-seo','ai-whatsapp'], result:'A local moving company can show service areas and collect clear quote details in one place.'},
  {slug:'retail-shops', name:'Retail & shops', icon:'store', headline:'Bring more people to your shop.', pain:'Opening hours and product availability are easy to lose across maps, messages and social profiles.', steps:['Make hours and directions easy to find','Showcase your products','Prepare replies for FAQs'], ask:'Let’s start with current hours and directions, then show customers what they can find in store.', recommended:['maps-seo','website','ai-whatsapp'], result:'A neighborhood shop can give customers one place for directions, collections and common questions.'},
  {slug:'creators-freelancers', name:'Creators & freelancers', icon:'pen-tool', headline:'Turn your best work into new inquiries.', pain:'A scattered portfolio makes it hard to explain what you do and where a client should contact you.', steps:['Choose a visual direction','Publish a focused portfolio','Set up a branded mailbox'], ask:'Pick a few strong projects first. We can build a site that makes your offer clear.', recommended:['brand-creative','website','business-email'], result:'A freelancer can share one portfolio link, explain their offer and receive inquiries at a business email.'},
];

export const journey = [
  ['Talk to Auri','Tell Auri what you do, what you already have and where you want to go.','A few minutes'],
  ['Get your roadmap','Review the suggested steps and choose where to start.','During onboarding'],
  ['Request a service','Share the details and files the team needs.','When you’re ready'],
  ['Confirm the scope','Review deliverables, price and timeline before approving the work.','Agreed with the team'],
  ['Track the build','Follow updates and review drafts in AuraHub.','During production'],
  ['Receive your work','Get the files, links or account handover you agreed on.','On the agreed date'],
  ['Get support','Use your request history to ask about follow-up or ongoing care.','According to your scope'],
];

export const faqs = [
  ['Who is Aura Command for?', 'Small business owners who want a clear plan for their website, menu, visibility or customer replies.'],
  ['Do I need to buy a service?', 'You can build a roadmap first. The team confirms a scope and price if you choose to request work.'],
  ['Can I keep my current website or tools?', 'Yes. Tell Auri what you already use so it can suggest which gaps to work on.'],
  ['Who delivers the work?', 'Auri helps you plan. The AuraDigital team reviews requests, confirms scope and handles agreed delivery.'],
  ['How do I track a request?', 'Use AuraHub to view its status, review the draft and follow the team’s updates.'],
  ['When will my service be ready?', 'Timelines depend on the work and materials needed. You review a target date when the team confirms your scope.'],
];

export const resources = [
  {title:'Get your first website brief ready', category:'Website', intro:'Write down who you help, what you offer and what customers should do next.', body:'Collect your main services, logo, photos, opening hours and contact information. Choose one main action for each page. Bring these details into AuraHub when you request a website.'},
  {title:'Make your menu easier to update', category:'AuraMenu', intro:'Start with clear categories, current prices and one source for menu changes.', body:'List dishes by category, verify prices and note dietary information your team can confirm. Decide who will review updates before customers see them.'},
  {title:'Prepare replies your team can reuse', category:'Automation', intro:'Start with the questions your customers ask every day.', body:'Write your answers for hours, pricing, bookings and service areas. Identify when a teammate should take over. Test the replies with your team before using them with customers.'},
  {title:'Check how customers find you on Maps', category:'Visibility', intro:'Review the information people see before they call or visit.', body:'Check that your name, opening hours, address and phone number match your website. Update photos and add a working link to the page customers need most.'},
];
