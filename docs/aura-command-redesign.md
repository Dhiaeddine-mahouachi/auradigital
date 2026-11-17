# Aura Command redesign

Aura Command gives a small business owner one starting action, **Build my roadmap**, and a clear place to track the work. Auri helps the owner choose and order the work. AuraDigital confirms scope and delivers the hands-on services through the existing customer workspace.

## 1. Design system and shared components

The website uses Astro static output and Tailwind utilities. The Cloudflare Worker serves the clean routes and reads prices from the existing published regional catalogue. AuraHub continues to use its production JavaScript bundle and APIs. Both surfaces load the same CSS variables.

| Area | Implementation |
|---|---|
| Tokens | `command-assets/tokens.css` defines dark and light surfaces, text, borders, semantic colors, focus, radii, elevation and typography. |
| Typography | Space Grotesk for display and Inter for text. Fonts are self-hosted. Arabic uses the system fallback. |
| Shared marketing components | `marketing/src/components/` contains Layout, Button, PageHero, ServiceCard, ServiceVisual, Tabs, FAQ, Icon and Auri. |
| Motion and focus | `marketing/src/theme.css` handles hover, scroll reveals, responsive grids and reduced motion. `command-assets/site.js` handles keyboard tabs, menus, filtering and the comparison control. |
| Shared Hub primitives | `hub/hub.css`, `src/hub/shell-tools.js` and the existing view modules provide the shell, panels, statuses, progress, forms, dialogs, toasts and empty states. |
| Content | `marketing/src/content.mjs` holds services, industries, journey, guide and FAQ data. `marketing/src/pages.mjs` holds route metadata and the legal page structure. Each record can be migrated to a CMS on its own. |
| SEO | Build generates 1200 × 630 social cards. Templates add metadata, canonicals and structured data. Hub and draft legal pages are marked noindex. |
| Localization | Language selection persists across marketing and Hub. Marketing navigation and roadmap CTA copy have EN/TR/FR/AR translations. Arabic switches the layout to RTL. Marketing body copy is currently English. |

## 2–5. Marketing page map

Section copy, controls and layout are in the source file listed for each page. Pages use a sticky header, a mobile menu, a shared footer and the same roadmap CTA.

| Route | Purpose and headline | Section order | Responsive behavior and code |
|---|---|---|---|
| `/` | Get a roadmap. “Meet Auri. Build what’s next.” | Hero and illustrative Hub, trust strip, industry scenarios, process, service bento, real Hub captures, comparison, AI and team, portfolio examples, pricing, six FAQs, roadmap CTA | Hero and scenarios split at tablet widths. Desktop process intro sticks while the cards scroll. Tabs wrap and the range control works at small widths. `Home.astro` |
| `/services` | Find a service by goal. “Build the next thing your business needs.” | Goal filters, seven cards, roadmap CTA | One column on small phones, two on tablet, four on desktop. `[...slug].astro`, `ServiceCard.astro` |
| `/services/website` | Explain a website build. “Give customers one place to find you.” | Hero and browser preview, inclusions, process, sample and scope, FAQ, related services | Hero, scope and process stack on phones. `ServiceDetail.astro`, `ServiceVisual.astro`, website record in `content.mjs` |
| `/pricing` | Explain free planning and paid work. “Start free. Pay for what you build.” | Free/project/care cards, billing-period controls, comparison, scope confirmation, FAQs | Cards stack on phones. Comparison stays in a focusable overflow region. `Pricing.astro` |
| `/product` | Explain the platform. “Plan it. Build it. Grow it.” | Roadmap stages, missions, Auri evolution, human handoff, connections, privacy link | Roadmap cards grow from one to four columns. `Product.astro` |
| `/auri` | Show what Auri does. “A guide for your next move.” | Character levels, prompt examples, industry conversations, team and approval boundaries, data link | Character moves below the intro on phones. Tabs and chips wrap. `MeetAuri.astro` |
| `/services/auramenu` | Show a QR menu. “Put your menu one scan away.” | Shared detail template with a menu preview, QR assets and editing guidance | Stacked template. `ServiceDetail.astro`, `ServiceVisual.astro`, AuraMenu record |
| `/services/ai-whatsapp` | Show reply assistance. “Answer customers while you work.” | Shared detail template with a sample thread, reply and routing scope | Stacked template and readable reply bubbles. `ServiceDetail.astro`, `ServiceVisual.astro`, AI record |
| `/services/maps-seo` | Improve local discovery. “Help nearby customers discover you.” | Shared detail template with listing preview, local SEO steps and agreed deliverables | Stacked template. `ServiceDetail.astro`, `ServiceVisual.astro`, Maps record |
| `/services/business-email` | Explain mailbox setup. “Send from your own business domain.” | Shared detail template with inbox example, DNS setup and handover | Stacked template with LTR email strings. `ServiceDetail.astro`, `ServiceVisual.astro`, email record |
| `/services/hosting-security` | Explain site infrastructure. “Keep your site online and ready.” | Shared detail template with status example, HTTPS checks and renewals | Stacked template. `ServiceDetail.astro`, `ServiceVisual.astro`, hosting record |
| `/services/brand-creative` | Explain a visual identity project. “Look recognizable wherever you show up.” | Shared detail template with a palette board, creative scope and asset handoff | Stacked template. `ServiceDetail.astro`, `ServiceVisual.astro`, brand record |
| `/industries` | Choose a business type. “A plan that fits your business.” | Four industry links, roadmap CTA | One or two columns. `[...slug].astro` |
| `/industries/restaurants-cafes` | Prioritize the menu and local discovery. “Get more guests from search to table.” | Guest pain points, Auri plan, recommended services, illustrative café scenario | Roadmap stacks below hero on phones. `Industry.astro`, restaurant record |
| `/industries/local-services` | Prioritize coverage and inquiries. “Make it easier to book your work.” | Quote friction, Auri plan, recommended services, illustrative mover scenario | Shared industry layout. `Industry.astro`, local-services record |
| `/industries/retail-shops` | Prioritize in-store discovery. “Bring more people to your shop.” | Hours and products, Auri plan, recommended services, illustrative shop scenario | Shared industry layout. `Industry.astro`, retail record |
| `/industries/creators-freelancers` | Prioritize portfolio and leads. “Turn your best work into new inquiries.” | Portfolio friction, Auri plan, recommended services, illustrative freelancer scenario | Shared industry layout. `Industry.astro`, creator record |
| `/how-it-works` | Explain the milestones. “Know what happens next.” | Seven-step timeline from first conversation through support | Timeline stacks beside a sticky intro on desktop and below it on phones. `[...slug].astro` |
| `/about` | Explain the people and delivery model. “Give small businesses a way forward.” | Mission, values, founder, team contact | Values and team grids stack. `[...slug].astro` |
| `/contact` | Contact the team. “Talk through what you need.” | Region, WhatsApp and email, project form, confirmation receipt | Form stacks under contact options. `Contact.astro`, existing contact handler in `script.js` |
| `/resources` | Find guides and answers. “Find answers for your next step.” | Search, category filters, featured guide, help FAQs | Search stays full width. Guides form a one- or two-column grid. `ResourceLibrary.astro` |
| `/privacy`, `/terms`, `/cookies` | Present policy content in a readable format. “Privacy”, “Terms”, “Cookies.” | Date, jump links and policy topics | Contents is sticky on wide screens and in flow on phones. `[...slug].astro`, `pages.mjs` |
| `/404` | Recover from a bad link. “That page moved on.” | Auri illustration, resource search, home and service links | Single column on phones. `[...slug].astro` |

The service and portfolio previews distinguish real product captures and portfolio examples from illustrative work. Approved customer quotes and case-study metrics, full policy text, calendar embed, response time and additional team details are marked `[PLACEHOLDER]`. The billing toggle compares separately scoped monthly care and annual infrastructure, using the existing catalogue.

## 6. AuraHub screen map

| Route | Purpose and visible copy | Layout and source |
|---|---|---|
| `/hub/signup`, `/hub/login` | Create an account or sign in. “Roadmap, requests, and service delivery in one place.” | Auri and form split on desktop, stacked on phones, with existing validation and Google sign-in where configured. `src/hub/app.js` |
| `/hub/onboarding` | Capture business type, goals and existing assets. “Build my roadmap.” | Existing guided flow and progress, restyled through shared tokens. `src/hub/onboarding.js` |
| `/hub`, `/hub/roadmap` | See the recommended action, milestones and Auri level. “Growth Vision.” | Five roadmap stages and mobile stepper, dark navigation, responsive panels. `src/hub/app.js`, `src/hub/roadmap-view.js` |
| `/hub/work` | Review current service status, catalogue and available service detail. “My Services.” | Cards and detail views wrap at narrow widths. `src/hub/service-view.js` |
| `/hub/requests` | Track requests and reviews. “List”, “Board”, “Request progress.” | List/board switch, current status derived from records, links to available drafts. Board stacks on phones. `src/hub/app.js`, `src/hub/work-view.js` |
| `/hub/auri` | Ask Auri about the business or a request. “Ask Auri.” | Existing context-aware chat and guide connected to Hub context. `src/hub/app.js`, `src/hub/guide-view.js` |
| `/hub/settings` | Manage account, language, business and team access. “Settings.” | Settings panels, links to current billing/account screens and a profile/roadmap JSON export. `src/hub/settings-view.js` |

The app shell uses the Hub wordmark for home, a five-item sidebar or bottom bar, a business switcher, and keyboard-accessible search and notification dialogs. Search matches available Hub destinations. Notifications show real scoped work that needs attention.

## Verification and release checklist

- [ ] Walk the 360, 768, 1280 and 1920 px layouts in Chromium, Safari and Firefox. Test keyboard navigation, tab arrows, Escape, visible focus, dialogs, RTL, reduced motion, contrast and screen reader announcements.
- [ ] Run audits on the deployed origin for Lighthouse 90+, image loading, font fallback and layout stability.
- [ ] Check route status codes, canonical URLs, social cards, sitemap and structured data on the deployed origin. Confirm legal copy before indexing policy pages.
- [ ] Confirm the live contact receipt, configured SSO, signed-in onboarding, saved workspace, regional pricing, request review and permission boundaries in a staging workspace.
- [ ] Supply missing business content and finish any requested integrations. Apple sign-in, calendar booking, generic request attachments/comments/approval, notification preferences and account-wide export need backend or provider support to be operational.
- [ ] Run `npm run check`, `npm test` and `npm run deploy:check`. Start the local Cloudflare preview with `npm exec -- wrangler dev`. The separate `npm run dev` uses synthetic Hub data for UI checks.
