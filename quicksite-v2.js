const CATEGORIES = [
  {
    id: "coffee",
    label: "Coffee",
    icon: "☕",
    sample: {
      eyebrow: "ISTANBUL · SPECIALTY COFFEE",
      tagline: "Coffee worth slowing down for.",
      description:
        "A neighborhood coffee space built around thoughtful sourcing, warm service and slow mornings.",
      aboutTitle: "A daily ritual, made with care.",
      primaryCta: "View the menu",
      offers: [
        { name: "Espresso & filter", description: "Seasonal beans, dialed in every morning.", price: "₺120+" },
        { name: "House pastries", description: "Fresh bakes and small sweet things.", price: "₺95+" },
        { name: "Slow brunch", description: "Simple plates for long mornings.", price: "₺240+" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1511081692775-05d0f180a065?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "coffee-roast",
        name: "Roast House",
        desc: "Warm editorial coffee shop with rich photography.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=84",
        base: "espresso",
        theme: "editorial",
        color: "#9b4a2c",
      },
      {
        id: "coffee-minimal",
        name: "Daily Brew",
        desc: "Bright minimal café built around menu and location.",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=84",
        base: "nova-menu",
        theme: "clean",
        color: "#486447",
      },
      {
        id: "coffee-night",
        name: "After Hours",
        desc: "Dark modern specialty coffee design.",
        image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "dark",
        color: "#c27b3a",
      },
    ],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    sample: {
      eyebrow: "SEASONAL KITCHEN · ISTANBUL",
      tagline: "A table made for the moment.",
      description:
        "Season-led plates, thoughtful hospitality and an atmosphere designed for dinners that last.",
      aboutTitle: "The ingredient leads. The room follows.",
      primaryCta: "Reserve a table",
      offers: [
        { name: "Chef's menu", description: "A seasonal tasting experience.", price: "₺1.450" },
        { name: "À la carte", description: "Small plates, mains and desserts.", price: "₺320+" },
        { name: "Private table", description: "Intimate dinners and celebrations.", price: "Request" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "restaurant-bistro",
        name: "Table No. 7",
        desc: "Elegant bistro layout with dishes and booking CTA.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=84",
        base: "nova-menu",
        theme: "classic",
        color: "#9a3d32",
      },
      {
        id: "restaurant-luxe",
        name: "Maison",
        desc: "Luxury dining look for premium restaurants.",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=84",
        base: "espresso",
        theme: "luxury",
        color: "#6f5a37",
      },
      {
        id: "restaurant-street",
        name: "Street Kitchen",
        desc: "Bold fast-food and casual restaurant template.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "bold",
        color: "#d95e2f",
      },
    ],
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "✦",
    sample: {
      eyebrow: "BEAUTY · CARE · CONFIDENCE",
      tagline: "Your ritual, refined.",
      description:
        "Considered treatments, calm details and personal service for a beauty experience that feels like yours.",
      aboutTitle: "Beauty with intention, never excess.",
      primaryCta: "Book an appointment",
      offers: [
        { name: "Signature service", description: "A consultation-led treatment.", price: "₺950" },
        { name: "Color & finish", description: "Tailored color and lasting finish.", price: "₺1.600+" },
        { name: "Care ritual", description: "Restore, reset and leave glowing.", price: "₺780" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "beauty-soft",
        name: "Studio Aura",
        desc: "Soft premium salon and beauty studio layout.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "soft",
        color: "#b77678",
      },
      {
        id: "beauty-editorial",
        name: "Muse",
        desc: "Editorial beauty template with large imagery.",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=84",
        base: "mono-portfolio",
        theme: "editorial",
        color: "#8d6070",
      },
      {
        id: "beauty-dark",
        name: "Noir Studio",
        desc: "Dark luxury barber, nail or beauty studio.",
        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=84",
        base: "espresso",
        theme: "dark",
        color: "#8e734c",
      },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "⚡",
    sample: {
      eyebrow: "TRAIN · MOVE · PROGRESS",
      tagline: "Build strength that stays.",
      description:
        "Structured coaching, focused sessions and a clear path from your first assessment to lasting progress.",
      aboutTitle: "Training built around the person.",
      primaryCta: "Start training",
      offers: [
        { name: "Personal training", description: "One-to-one coaching and programming.", price: "₺1.200" },
        { name: "Small group", description: "Focused sessions with up to six people.", price: "₺550" },
        { name: "Mobility", description: "Move better, recover and stay ready.", price: "₺480" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1534368420009-621bfab424a8?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "fitness-power",
        name: "Forge",
        desc: "High-energy gym landing page with strong CTA.",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "bold",
        color: "#e4542d",
      },
      {
        id: "fitness-clean",
        name: "Form",
        desc: "Clean trainer, pilates and wellness layout.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=84",
        base: "mono-portfolio",
        theme: "clean",
        color: "#4f7762",
      },
      {
        id: "fitness-neon",
        name: "Pulse",
        desc: "Modern dark gym design with energetic accents.",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=84",
        base: "nova-menu",
        theme: "dark",
        color: "#8fae33",
      },
    ],
  },
  {
    id: "services",
    label: "Services",
    icon: "◼",
    sample: {
      eyebrow: "LOCAL EXPERT · CLEAR SERVICE",
      tagline: "The job done properly.",
      description:
        "Reliable local service, clear communication and a straightforward way to request help when you need it.",
      aboutTitle: "Professional work, without the uncertainty.",
      primaryCta: "Request a quote",
      offers: [
        { name: "Consultation", description: "Understand the job and the best next step.", price: "Free" },
        { name: "Core service", description: "Professional delivery from start to finish.", price: "Quote" },
        { name: "Ongoing care", description: "Maintenance and priority support.", price: "Monthly" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "services-local",
        name: "Local Pro",
        desc: "Trust-first site for repair, moving and local services.",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "clean",
        color: "#376d85",
      },
      {
        id: "services-corporate",
        name: "Clearline",
        desc: "Professional corporate service presentation.",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=84",
        base: "mono-portfolio",
        theme: "corporate",
        color: "#42566b",
      },
      {
        id: "services-bold",
        name: "Fixr",
        desc: "Bold conversion-focused service business template.",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=84",
        base: "espresso",
        theme: "bold",
        color: "#c16831",
      },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: "◎",
    sample: {
      eyebrow: "SELECTED WORK · 2026",
      tagline: "Ideas, made visible.",
      description:
        "A focused portfolio for creative work, selected collaborations and the thinking behind each project.",
      aboutTitle: "Clear ideas. Precise execution.",
      primaryCta: "View selected work",
      offers: [
        { name: "Creative direction", description: "Concept, system and visual language.", price: "Project" },
        { name: "Selected work", description: "A closer look at recent collaborations.", price: "Explore" },
        { name: "New collaboration", description: "Share your brief and timeline.", price: "Contact" },
      ],
      gallery: [
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82",
      ],
    },
    templates: [
      {
        id: "portfolio-grid",
        name: "Frame",
        desc: "Visual grid for photographers, designers and creators.",
        image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=84",
        base: "mono-portfolio",
        theme: "editorial",
        color: "#5d59a6",
      },
      {
        id: "portfolio-personal",
        name: "Profile",
        desc: "Personal brand and freelancer portfolio.",
        image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=84",
        base: "local-pro",
        theme: "clean",
        color: "#476b6c",
      },
      {
        id: "portfolio-studio",
        name: "Studio",
        desc: "Agency-style portfolio with strong case-study look.",
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=84",
        base: "nova-menu",
        theme: "dark",
        color: "#a14e37",
      },
    ],
  },
];

const PAYMENTS = [
  { id: "simple", name: "Simple Pay", desc: "Clean total and payment button.", mock: "₺ 2.500 → Pay" },
  { id: "invoice", name: "Invoice", desc: "Itemized professional payment view.", mock: "Invoice #QS-01" },
  { id: "deposit", name: "Deposit", desc: "Show deposit now and balance later.", mock: "30% Deposit" },
];

const SITE_CSS = `
  :root{--accent:#486447;--ink:#151713;--paper:#f7f3ec;--line:rgba(21,23,19,.14)}
  *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:inherit;text-decoration:none}img{display:block;width:100%;height:100%;object-fit:cover}.site-shell{width:min(1180px,calc(100% - 40px));margin:auto}.site-header{height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line)}.site-brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:-.03em}.site-brand img{width:34px;height:34px;border-radius:50%;object-fit:contain}.site-nav{display:flex;align-items:center;gap:24px;font-size:12px;font-weight:700}.site-nav-cta,.site-button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;background:var(--accent);color:#fff;font-size:12px;font-weight:850}.site-hero{min-height:680px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;padding:64px 0}.site-hero-copy{max-width:610px}.site-kicker{display:block;margin-bottom:20px;color:var(--accent);font-size:10px;font-weight:900;letter-spacing:.18em}.site-hero h1{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(54px,7vw,96px);font-weight:500;line-height:.92;letter-spacing:-.055em}.site-hero-copy>p{max-width:560px;margin:25px 0;color:rgba(21,23,19,.68);font-size:16px;line-height:1.65}.site-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.site-text-link{font-size:12px;font-weight:850}.site-hero-media{position:relative;height:550px;overflow:hidden;border-radius:28px}.site-image-label{position:absolute;left:18px;bottom:18px;padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.88);font-size:10px;font-weight:850;backdrop-filter:blur(10px)}.site-marquee{overflow:hidden;border-block:1px solid var(--line);white-space:nowrap}.site-marquee div{display:flex;justify-content:space-around;gap:32px;padding:18px 0;font-size:10px;font-weight:900;letter-spacing:.14em}.site-section{padding:100px 0}.site-section-head{display:grid;grid-template-columns:.72fr 1.28fr;gap:50px;align-items:start;margin-bottom:45px}.site-section-head small{color:var(--accent);font-size:10px;font-weight:900;letter-spacing:.15em}.site-section-head h2{max-width:760px;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(42px,5vw,72px);font-weight:500;line-height:.98;letter-spacing:-.045em}.site-about{background:#fff}.site-about-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:24px}.site-about-card{min-height:310px;padding:38px;border-radius:24px;background:color-mix(in srgb,var(--accent) 11%,#fff);display:flex;flex-direction:column;justify-content:space-between}.site-about-card p{max-width:600px;font-size:18px;line-height:1.55}.site-about-image{min-height:310px;border-radius:24px;overflow:hidden}.site-offers{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.site-offer{min-height:235px;padding:28px;border:1px solid var(--line);border-radius:20px;background:#fff;display:flex;flex-direction:column}.site-offer small{color:var(--accent);font-weight:900}.site-offer h3{margin:38px 0 10px;font-family:Georgia,"Times New Roman",serif;font-size:28px;font-weight:500}.site-offer p{margin:0;color:rgba(21,23,19,.62);font-size:13px;line-height:1.55}.site-offer b{margin-top:auto;padding-top:24px}.site-gallery{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:12px}.site-gallery figure{height:440px;margin:0;overflow:hidden;border-radius:20px}.site-gallery figure:nth-child(2),.site-gallery figure:nth-child(3){height:360px;margin-top:80px}.site-contact{background:var(--accent);color:#fff}.site-contact-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:60px;align-items:end}.site-contact h2{max-width:750px;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(46px,6vw,82px);font-weight:500;line-height:.95;letter-spacing:-.05em}.site-contact-card{padding:28px;border:1px solid rgba(255,255,255,.25);border-radius:20px;background:rgba(0,0,0,.1)}.site-contact-card span,.site-contact-card a{display:block;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.18);font-size:13px}.site-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:30px 0;font-size:11px}.theme-dark{--paper:#10110f;--ink:#f7f2e8;--line:rgba(255,255,255,.14)}.theme-dark .site-header,.theme-dark .site-marquee{border-color:var(--line)}.theme-dark .site-hero-copy>p,.theme-dark .site-offer p{color:rgba(255,255,255,.65)}.theme-dark .site-about{background:#171916}.theme-dark .site-about-card,.theme-dark .site-offer{border-color:var(--line);background:#20231f}.theme-dark .site-button,.theme-dark .site-nav-cta{color:#0e100d}.theme-bold{--paper:#f4ebde}.theme-bold .site-hero{grid-template-columns:1.08fr .92fr}.theme-bold .site-hero h1{text-transform:uppercase;font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif;font-size:clamp(66px,8vw,112px);line-height:.82;letter-spacing:-.04em}.theme-bold .site-hero-media{border-radius:4px;transform:rotate(1.5deg)}.theme-bold .site-offer,.theme-bold .site-about-card,.theme-bold .site-gallery figure{border-radius:5px}.theme-luxury{--paper:#171713;--ink:#f3ead8;--line:rgba(243,234,216,.16)}.theme-luxury .site-hero-copy>p,.theme-luxury .site-offer p{color:rgba(243,234,216,.68)}.theme-luxury .site-about{background:#211f19}.theme-luxury .site-about-card,.theme-luxury .site-offer{border-color:var(--line);background:#2a271f}.theme-luxury .site-button,.theme-luxury .site-nav-cta{color:#fff}.theme-soft{--paper:#fbf4f2}.theme-soft .site-hero-media,.theme-soft .site-about-card,.theme-soft .site-about-image,.theme-soft .site-offer,.theme-soft .site-gallery figure{border-radius:42px}.theme-corporate{--paper:#f1f4f7}.theme-corporate .site-hero h1,.theme-corporate .site-section-head h2,.theme-corporate .site-contact h2,.theme-corporate .site-offer h3{font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-weight:750}.theme-corporate .site-hero-media,.theme-corporate .site-about-card,.theme-corporate .site-about-image,.theme-corporate .site-offer,.theme-corporate .site-gallery figure{border-radius:8px}.theme-classic .site-hero{grid-template-columns:.92fr 1.08fr}.theme-classic .site-hero-media{order:-1}.theme-editorial .site-hero-media{height:620px}.theme-editorial .site-gallery{grid-template-columns:1fr 1fr 1fr}.theme-clean .site-hero{grid-template-columns:1.08fr .92fr}.theme-clean .site-hero-media{height:480px}.theme-clean .site-offer{box-shadow:0 18px 50px rgba(35,42,35,.08);border:0}
  @media(max-width:760px){.site-shell{width:min(100% - 24px,1180px)}.site-header{height:64px}.site-nav a:not(.site-nav-cta){display:none}.site-hero,.theme-bold .site-hero,.theme-classic .site-hero,.theme-clean .site-hero{min-height:auto;grid-template-columns:1fr;padding:44px 0}.theme-classic .site-hero-media{order:initial}.site-hero h1,.theme-bold .site-hero h1{font-size:52px}.site-hero-media,.theme-editorial .site-hero-media,.theme-clean .site-hero-media{height:390px;border-radius:20px;transform:none}.site-section{padding:64px 0}.site-section-head{grid-template-columns:1fr;gap:14px}.site-section-head h2{font-size:42px}.site-about-grid,.site-contact-grid{grid-template-columns:1fr}.site-offers{grid-template-columns:1fr}.site-offer{min-height:200px}.site-gallery{grid-template-columns:1fr 1fr}.site-gallery figure,.site-gallery figure:nth-child(2),.site-gallery figure:nth-child(3){height:300px;margin:0}.site-gallery figure:first-child{grid-column:1/-1}.site-contact h2{font-size:48px}.site-footer{align-items:flex-start;flex-direction:column}.site-marquee div{justify-content:flex-start;padding-inline:20px}}
`;

let category = CATEGORIES[0];
let template = category.templates[0];
let previewingTemplate = template;
let payment = PAYMENTS[0];
let lastModalTrigger = null;
let renderQueued = false;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const tabs = $("#categoryTabs");
const templateGrid = $("#templateGrid");
const paymentGrid = $("#paymentGrid");
const form = $("#quicksiteForm");
const modal = $("#templatePreviewModal");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function safeHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!["http:", "https:"].includes(url.protocol) || url.toString().length > 800) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function safeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
}

function safeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getFormValues() {
  return Object.fromEntries(new FormData(form).entries());
}

function getOffers() {
  return $$(".offer-row", form)
    .map((row) => ({
      name: $(".of-name", row).value.trim(),
      description: $(".of-desc", row).value.trim(),
      price: $(".of-price", row).value.trim(),
    }))
    .filter((item) => item.name);
}

function getTemplateCategory(candidate) {
  return CATEGORIES.find((item) => item.templates.some((option) => option.id === candidate.id)) || category;
}

function buildWebsiteDocument(candidate, custom = {}) {
  const candidateCategory = getTemplateCategory(candidate);
  const sample = candidateCategory.sample;
  const accent = safeColor(custom.primaryColor, candidate.color);
  const businessName = custom.businessName?.trim() || candidate.name;
  const tagline = custom.tagline?.trim() || sample.tagline;
  const description = custom.description?.trim() || sample.description;
  const heroImage = safeHttpUrl(custom.heroImageUrl) || candidate.image;
  const logoUrl = safeHttpUrl(custom.logoUrl);
  const customGallery = [custom.gallery1, custom.gallery2, custom.gallery3]
    .map(safeHttpUrl)
    .filter(Boolean);
  const gallery = [...customGallery, ...sample.gallery].filter((url, index, all) => all.indexOf(url) === index).slice(0, 3);
  const offers = Array.isArray(custom.offers) && custom.offers.length ? custom.offers : sample.offers;
  const phone = custom.phone?.trim() || "+90 538 000 00 00";
  const email = custom.email?.trim() || "hello@yourbusiness.com";
  const address = custom.address?.trim() || "Istanbul, Türkiye";
  const workingHours = custom.workingHours?.trim() || "Mon–Sun · 08:00–22:00";
  const instagram = custom.instagram?.trim() || "@yourbusiness";
  const brandMarkup = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt=""><span>${escapeHtml(businessName)}</span>`
    : `<span>${escapeHtml(businessName)}</span>`;
  const offerMarkup = offers
    .slice(0, 6)
    .map(
      (item, index) => `<article class="site-offer"><small>0${index + 1}</small><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><b>${escapeHtml(item.price || "Ask us")}</b></article>`,
    )
    .join("");
  const galleryMarkup = gallery
    .map((url, index) => `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(businessName)} gallery image ${index + 1}"></figure>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>${escapeHtml(businessName)}</title>
  <style>${SITE_CSS}</style>
</head>
<body class="theme-${escapeHtml(candidate.theme)}" style="--accent:${accent}">
  <header class="site-shell site-header">
    <a class="site-brand" href="#">${brandMarkup}</a>
    <nav class="site-nav"><a href="#about">About</a><a href="#services">Services</a><a href="#gallery">Gallery</a><a class="site-nav-cta" href="#contact">${escapeHtml(sample.primaryCta)}</a></nav>
  </header>
  <main>
    <section class="site-shell site-hero">
      <div class="site-hero-copy">
        <span class="site-kicker">${escapeHtml(sample.eyebrow)}</span>
        <h1>${escapeHtml(tagline)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="site-actions"><a class="site-button" href="#services">${escapeHtml(sample.primaryCta)} →</a><a class="site-text-link" href="#about">Discover the story ↓</a></div>
      </div>
      <div class="site-hero-media"><img src="${escapeHtml(heroImage)}" alt="${escapeHtml(businessName)}"><span class="site-image-label">${escapeHtml(candidate.name)} · ${escapeHtml(candidateCategory.label)}</span></div>
    </section>
    <div class="site-marquee"><div><span>WELCOME</span><span>✦</span><span>${escapeHtml(businessName.toUpperCase())}</span><span>✦</span><span>${escapeHtml(candidateCategory.label.toUpperCase())}</span><span>✦</span><span>ISTANBUL</span></div></div>
    <section class="site-section site-about" id="about"><div class="site-shell"><div class="site-section-head"><small>01 · ABOUT</small><h2>${escapeHtml(sample.aboutTitle)}</h2></div><div class="site-about-grid"><article class="site-about-card"><b>${escapeHtml(businessName)}</b><p>${escapeHtml(description)}</p><span>Thoughtful details · Clear service · Made for mobile</span></article><div class="site-about-image"><img src="${escapeHtml(gallery[0])}" alt="About ${escapeHtml(businessName)}"></div></div></div></section>
    <section class="site-section" id="services"><div class="site-shell"><div class="site-section-head"><small>02 · WHAT WE OFFER</small><h2>Simple choices, clearly presented.</h2></div><div class="site-offers">${offerMarkup}</div></div></section>
    <section class="site-section site-about" id="gallery"><div class="site-shell"><div class="site-section-head"><small>03 · GALLERY</small><h2>A closer look at the experience.</h2></div><div class="site-gallery">${galleryMarkup}</div></div></section>
    <section class="site-section site-contact" id="contact"><div class="site-shell site-contact-grid"><div><span class="site-kicker">LET'S CONNECT</span><h2>Ready when you are.</h2></div><div class="site-contact-card"><a href="#">${escapeHtml(phone)}</a><a href="#">${escapeHtml(email)}</a><span>${escapeHtml(address)}</span><span>${escapeHtml(workingHours)}</span><span>${escapeHtml(instagram)}</span></div></div></section>
  </main>
  <footer class="site-shell site-footer"><strong>${escapeHtml(businessName)}</strong><span>Website preview · QuickSite by AuraDigital</span><span>© 2026</span></footer>
</body>
</html>`;
}

function renderCategories() {
  tabs.innerHTML = CATEGORIES.map(
    (item) => `<button class="category-btn ${item.id === category.id ? "active" : ""}" type="button" role="tab" aria-selected="${item.id === category.id}" data-category="${item.id}"><span>${item.icon}</span><b>${item.label}</b><small>3 designs</small></button>`,
  ).join("");
}

function renderTemplates() {
  templateGrid.innerHTML = category.templates
    .map(
      (item, index) => `<article class="template-card ${item.id === template.id ? "active" : ""}">
        <button class="template-card-button" type="button" data-template="${item.id}" aria-label="Open full preview of ${escapeHtml(item.name)}">
          <div class="template-shot" style="background-image:url('${item.image}')">
            <div class="template-shot-copy"><small>${escapeHtml(category.label.toUpperCase())} · ${escapeHtml(item.theme.toUpperCase())}</small><strong>${escapeHtml(item.name)}</strong></div>
          </div>
          <div class="template-copy">
            <div class="template-copy-head"><strong>${escapeHtml(item.name)}</strong><span class="template-number">0${index + 1}</span></div>
            <p>${escapeHtml(item.desc)}</p>
            <div class="template-card-foot"><span class="template-style" style="--template-color:${item.color}"><i></i>${escapeHtml(item.theme)}</span><span class="template-action">${item.id === template.id ? "Selected ✓" : "Full preview ↗"}</span></div>
          </div>
        </button>
      </article>`,
    )
    .join("");
  $("#templateCount").textContent = `${category.templates.length} complete designs`;
}

function renderPayments() {
  paymentGrid.innerHTML = PAYMENTS.map(
    (item) => `<article class="payment-card ${item.id === payment.id ? "active" : ""}"><button type="button" data-payment="${item.id}" aria-pressed="${item.id === payment.id}"><span class="pay-mock">${escapeHtml(item.mock)}</span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.desc)}</small></button></article>`,
  ).join("");
}

function updateSelectionLabels() {
  const label = `${category.label} · ${template.name}`;
  $("#selectedPill").textContent = label;
  $("#submitDesign").textContent = label;
  $("#colorValue").textContent = form.primaryColor.value.toUpperCase();
}

function addOffer(values = {}) {
  const row = document.createElement("div");
  row.className = "offer-row";
  row.innerHTML = `<label>Item<input class="of-name" maxlength="100" placeholder="Item or service" value="${escapeHtml(values.name || "")}"></label><label>Description<input class="of-desc" maxlength="240" placeholder="Short description" value="${escapeHtml(values.description || "")}"></label><label>Price<input class="of-price" maxlength="40" placeholder="Price" value="${escapeHtml(values.price || "")}"></label><button class="remove-offer" type="button" aria-label="Remove item">×</button>`;
  $(".remove-offer", row).addEventListener("click", () => {
    row.remove();
    schedulePreview();
  });
  $$("input", row).forEach((input) => input.addEventListener("input", schedulePreview));
  $("#offers").appendChild(row);
}

function currentPreviewValues() {
  return { ...getFormValues(), offers: getOffers() };
}

function renderLivePreview() {
  renderQueued = false;
  const values = currentPreviewValues();
  $("#livePreviewFrame").srcdoc = buildWebsiteDocument(template, values);
  const slug = safeSlug(values.slug || values.businessName);
  $("#liveAddress").textContent = slug ? `${slug}.com` : "yourbusiness.com";
  $("#colorValue").textContent = safeColor(values.primaryColor, template.color).toUpperCase();
}

function schedulePreview() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(renderLivePreview);
}

function setSelectedTemplate(nextTemplate, shouldScroll = false) {
  template = nextTemplate;
  form.primaryColor.value = template.color;
  renderTemplates();
  updateSelectionLabels();
  renderLivePreview();
  if (shouldScroll) {
    $("#customizer").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function setModalDevice(device) {
  $("#previewWindowWrap").dataset.device = device;
  $$('[data-preview-device]').forEach((button) => {
    const active = button.dataset.previewDevice === device;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function openTemplatePreview(nextTemplate, trigger) {
  previewingTemplate = nextTemplate;
  lastModalTrigger = trigger;
  $("#previewModalTitle").textContent = nextTemplate.name;
  $("#previewModalCategory").textContent = `${category.label} website · ${nextTemplate.desc}`;
  $("#previewAddress").textContent = `${safeSlug(nextTemplate.name) || "sample"}.com`;
  $("#templatePreviewFrame").srcdoc = buildWebsiteDocument(nextTemplate);
  setModalDevice("desktop");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => $(".modal-close", modal).focus());
}

function closeTemplatePreview() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  $("#templatePreviewFrame").srcdoc = "";
  lastModalTrigger?.focus();
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  category = CATEGORIES.find((item) => item.id === button.dataset.category) || category;
  template = category.templates[0];
  form.primaryColor.value = template.color;
  renderCategories();
  renderTemplates();
  updateSelectionLabels();
  renderLivePreview();
});

templateGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) return;
  const nextTemplate = category.templates.find((item) => item.id === button.dataset.template);
  if (nextTemplate) openTemplatePreview(nextTemplate, button);
});

paymentGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-payment]");
  if (!button) return;
  payment = PAYMENTS.find((item) => item.id === button.dataset.payment) || payment;
  renderPayments();
});

$("#addOffer").addEventListener("click", () => addOffer());
form.addEventListener("input", schedulePreview);

$$('[data-live-device]').forEach((button) =>
  button.addEventListener("click", () => {
    $("#liveDeviceStage").dataset.device = button.dataset.liveDevice;
    $$('[data-live-device]').forEach((item) => item.classList.toggle("active", item === button));
  }),
);

$$('[data-preview-device]').forEach((button) =>
  button.addEventListener("click", () => setModalDevice(button.dataset.previewDevice)),
);

$$('[data-close-preview]').forEach((button) => button.addEventListener("click", closeTemplatePreview));
$("#selectPreviewTemplate").addEventListener("click", () => {
  setSelectedTemplate(previewingTemplate, true);
  closeTemplatePreview();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeTemplatePreview();
  if (event.key !== "Tab" || modal.hidden) return;
  const focusable = $$('button,[href],[tabindex]:not([tabindex="-1"])', modal).filter((element) => !element.disabled);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const values = getFormValues();
  const status = $("#submitStatus");
  const submitButton = $(".submit-btn", form);
  const marker = `[QUICKSITE V2]\nCategory: ${category.id}\nDesign: ${template.id}\nPayment layout: ${payment.id}\nPrice shown: 2.500 TL\n\n${values.requestMessage || ""}`;
  const payload = {
    templateId: template.base,
    industry: `${category.id}:${template.id}`,
    businessName: values.businessName,
    slug: values.slug,
    tagline: values.tagline,
    description: values.description,
    primaryColor: values.primaryColor,
    heroImageUrl: values.heroImageUrl,
    logoUrl: values.logoUrl,
    galleryUrls: [values.gallery1, values.gallery2, values.gallery3].filter(Boolean),
    offers: getOffers(),
    phone: values.phone,
    whatsapp: values.whatsapp,
    email: values.email,
    address: values.address,
    instagram: values.instagram,
    workingHours: values.workingHours,
    contactName: values.contactName,
    language: values.language,
    requestMessage: marker,
    eyebrow: category.sample.eyebrow,
    aboutTitle: category.sample.aboutTitle,
    primaryCta: category.sample.primaryCta,
    benefits: ["Mobile friendly", "Domain ready", "SSL included"],
  };
  status.textContent = "Sending your QuickSite request…";
  status.className = "submit-status";
  submitButton.disabled = true;
  try {
    const response = await fetch("/api/quicksite/projects", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed");
    status.textContent = `✓ Request received. Project: ${data.project?.slug || data.project?.id || "created"}`;
    status.classList.add("success");
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Request failed";
    status.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
});

const quicksiteBuildVideo = $("[data-quicksite-video]");
if (quicksiteBuildVideo) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  quicksiteBuildVideo.muted = true;
  quicksiteBuildVideo.defaultMuted = true;
  if (reduceMotion) {
    quicksiteBuildVideo.pause();
    quicksiteBuildVideo.removeAttribute("autoplay");
  } else {
    quicksiteBuildVideo.play().catch(() => {});
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) quicksiteBuildVideo.pause();
      else quicksiteBuildVideo.play().catch(() => {});
    });
  }
}

renderCategories();
renderTemplates();
renderPayments();
category.sample.offers.slice(0, 2).forEach(addOffer);
form.primaryColor.value = template.color;
updateSelectionLabels();
renderLivePreview();
