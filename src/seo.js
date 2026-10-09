const SITE_ORIGIN = "https://auradigitalworks.com";
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const PAGE_SEO = {
  "/": {
    "lang": "en",
    "title": "AuraDigital — Websites, Systems &amp; Digital Products",
    "description": "An independent digital product studio building premium websites, business systems, automation, menus, profiles and invitations.",
    "type": "WebPage"
  },
  "/services": {
    "lang": "en",
    "title": "Services — Websites, Systems &amp; Automation | AuraDigital",
    "description": "Explore AuraDigital web development, business systems, digital products, campaigns and automation.",
    "type": "WebPage"
  },
  "/portfolio": {
    "lang": "en",
    "title": "Selected Work &amp; Digital Products | AuraDigital",
    "description": "Explore AuraDigital’s existing client websites and product experiences, with honest project context and large previews.",
    "type": "WebPage"
  },
  "/aura-menu": {
    "lang": "en",
    "title": "QR Menu & Digital Menu Design Istanbul | AuraMenu",
    "description": "Mobile-friendly QR menus for restaurants and cafés. Choose your AuraMenu design and customize products, brand colors and languages.",
    "type": "WebPage",
    "serviceType": [
      "QR Menus",
      "Digital Menu Design",
      "Restaurant Menu Design"
    ]
  },
  "/aura-weddings": {
    "lang": "en",
    "title": "Digital Wedding Invitations & Online Designs | AuraWeddings",
    "description": "Digital wedding invitations in English, Turkish, Arabic and French with animated envelopes, custom themes, countdowns, RSVP, music and guest messages.",
    "type": "WebPage",
    "serviceType": [
      "Digital Wedding Invitations",
      "Online Invitation Design"
    ]
  },
  "/aurapops": {
    "lang": "en",
    "title": "AuraPops Smart QR Popups | AuraDigital",
    "description": "Explore AuraPops smart QR popup designs for menus, social links, maps, contact actions and interactive mini games, then build yours on aurapops.online.",
    "type": "WebPage",
    "serviceType": [
      "Smart QR Popup",
      "Digital Link Profile",
      "Interactive QR Experience"
    ]
  },
  "/nfc": {
    "lang": "en",
    "title": "NFC Cards & Google Review Cards Istanbul | AuraDigital",
    "description": "Custom NFC cards for Google reviews, websites, QR menus and social media. Explore AuraDigital card designs for your business.",
    "type": "WebPage",
    "serviceType": [
      "NFC Cards",
      "Google Review Cards",
      "Business NFC Cards"
    ]
  },
  "/nfc-studio": {
    "lang": "en",
    "title": "Design Your NFC Card | AuraDigital",
    "description": "Design your NFC card online. Customize colors, text, QR codes and destination links, then submit your design for review.",
    "type": "WebPage",
    "serviceType": [
      "NFC Card Design"
    ]
  },
  "/qr-menu": {
    "lang": "en",
    "title": "QR Menu Design Istanbul | Restaurant Digital Menus | AuraDigital",
    "description": "Fast, mobile-friendly QR digital menus for restaurants and cafés, tailored to your brand, products, prices and images.",
    "type": "WebPage",
    "serviceType": [
      "QR Menu Design",
      "Restaurant Digital Menus"
    ]
  },
  "/packages": {
    "lang": "en",
    "title": "Digital Marketing Plans Istanbul | AuraDigital",
    "description": "Explore weekly and monthly digital marketing plans combining social media, advertising, content, website support and optimization.",
    "type": "WebPage"
  },
  "/about": {
    "lang": "en",
    "title": "About AuraDigital — Independent Digital Studio",
    "description": "AuraDigital connects design, websites, digital products, software and automation for businesses.",
    "type": "AboutPage"
  },
  "/contact": {
    "lang": "en",
    "title": "Start a Project — AuraDigital",
    "description": "Submit your website, dashboard, e-commerce, menu, profile, invitation, NFC or automation brief to AuraDigital.",
    "type": "ContactPage"
  },
  "/websites": {
    "lang": "en",
    "serviceType": ["Website Development", "Custom Web Systems"],
    "title": "Website Development &amp; Custom Web Systems | AuraDigital",
    "description": "Configure a static, premium, dashboard or payment-enabled website. See localized starting prices and submit a project brief.",
    "type": "WebPage"
  },
  "/systems": {
    "lang": "en",
    "serviceType": ["Business Systems", "Dashboards", "SaaS Development"],
    "title": "Business Systems, Dashboards &amp; SaaS | AuraDigital",
    "description": "Custom dashboards, internal tools, CRM, ERP-like solutions, booking platforms, customer portals and automation.",
    "type": "WebPage"
  },
  "/pricing": {
    "lang": "en",
    "title": "Website Prices &amp; Project Configurator | AuraDigital",
    "description": "Explore localized website starting prices in TRY, TND, USD, EUR and GBP. Configure your scope for an instant estimate or custom quotation.",
    "type": "WebPage"
  },
  "/build": {
    "lang": "en",
    "title": "Build Your Website — Live Project Estimate | AuraDigital",
    "description": "Configure your website and submit a project request with localized pricing, feature selections and private supporting files.",
    "type": "WebPage"
  },
  "/privacy": {
    "lang": "en",
    "title": "Privacy Information | AuraDigital",
    "description": "How AuraDigital handles project intake information and private files.",
    "type": "WebPage"
  }
};

const NOINDEX_PATHS = new Set([
  "/project.html",
  "/404.html",
  "/nfc-status.html",
  "/nfc-status",
]);

export const SEO_REDIRECTS = new Map([
  ["/web-development.html", "/websites"],
  ["/systems.html", "/systems"],
  ["/pricing.html", "/pricing"],
  ["/build.html", "/build"],
  ["/privacy.html", "/privacy"],
  ["/home", "/"],
  ["/index.html", "/"],
  ["/services.html", "/services"],
  ["/hizmetler", "/services"],
  ["/portfolio.html", "/portfolio"],
  ["/aura-menu.html", "/aura-menu"],
  ["/aura-weddings.html", "/aura-weddings"],
  ["/auraweddings", "/aura-weddings"],
  ["/aurapops.html", "/aurapops"],
  ["/nfc.html", "/nfc"],
  ["/nfc-builder.html", "/nfc-studio"],
  ["/nfc-durum", "/nfc-status"],
  ["/nfc-status.html", "/nfc-status"],
  ["/qr-menu.html", "/qr-menu"],
  ["/packages.html", "/packages"],
  ["/paketler", "/packages"],
  ["/about.html", "/about"],
  ["/hakkimizda", "/about"],
  ["/contact.html", "/contact"],
  ["/iletisim", "/contact"],
]);

export function permanentSeoRedirect(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  const targetPath = SEO_REDIRECTS.get(url.pathname);
  if (!targetPath) return null;
  const target = new URL(targetPath, url.origin);
  target.search = url.search;
  return Response.redirect(target.toString(), 301);
}

export async function serveSeoAsset(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (!env.ASSETS) return null;

  const url = new URL(request.url);
  const pathname = canonicalPath(url.pathname);
  const meta = PAGE_SEO[pathname];
  const shouldNoindex = NOINDEX_PATHS.has(pathname);
  if (!meta && !shouldNoindex) return null;

  const assetPath = SEO_ASSETS.get(pathname) || pathname;
  const assetRequest = new Request(new URL(assetPath, request.url), request);
  const response = await env.ASSETS.fetch(assetRequest);

  if (request.method === "HEAD" || !isHtml(response)) {
    return withRobotsHeader(response, shouldNoindex);
  }

  if (shouldNoindex) {
    return withRobotsHeader(response, true);
  }

  const canonical = `${SITE_ORIGIN}${pathname}`;
  const schema = buildSchema(pathname, meta, canonical);
  const rewriter = new HTMLRewriter()
    .on('link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], meta[name="robots"], script[type="application/ld+json"]', {element(element) {element.remove();}})
    .on("html", {
      element(element) {
        element.setAttribute("lang", meta.lang);
      },
    })
    .on("title", {
      element(element) {
        element.setInnerContent(meta.title);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", meta.description);
      },
    })
    .on("head", {
      element(element) {
        element.append(buildHeadMarkup(meta, canonical, schema), { html: true });
      },
    });

  return rewriter.transform(response);
}

function canonicalPath(pathname) {
  if (pathname === "/index.html") return "/";
  return pathname;
}

const SEO_ASSETS = new Map([
  ["/websites", "/web-development.html"],
  ["/systems", "/systems.html"],
  ["/pricing", "/pricing.html"],
  ["/build", "/build.html"],
  ["/privacy", "/privacy.html"],
  ["/", "/index.html"],
  ["/services", "/services.html"],
  ["/portfolio", "/portfolio.html"],
  ["/aura-menu", "/aura-menu.html"],
  ["/aura-weddings", "/aura-weddings.html"],
  ["/aurapops", "/aurapops-showcase.html"],
  ["/nfc", "/nfc.html"],
  ["/nfc-studio", "/nfc-builder.html"],
  ["/nfc-status", "/nfc-status.html"],
  ["/qr-menu", "/qr-menu.html"],
  ["/packages", "/packages.html"],
  ["/about", "/about.html"],
  ["/contact", "/contact.html"],
]);

function isHtml(response) {
  const contentType = response.headers.get("Content-Type") || "";
  return contentType.toLowerCase().includes("text/html");
}

function withRobotsHeader(response, noindex) {
  if (!noindex) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function buildHeadMarkup(meta, canonical, schema) {
  const robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  return [
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:site_name" content="AuraDigital" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${meta.lang === "tr" ? "tr_TR" : "en_US"}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${SITE_ORIGIN}/auradigital-share-20260928.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="AuraDigital black monogram on acid yellow" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${SITE_ORIGIN}/auradigital-share-20260928.jpg" />`,
    `<meta name="twitter:image:alt" content="AuraDigital black monogram on acid yellow" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<script type="application/ld+json">${safeJson(schema)}</script>`,
  ].join("");
}

function buildSchema(pathname, meta, canonical) {
  const organization = {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "AuraDigital",
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/auradigital-mark-20260928.png`,
    description: "İstanbul merkezli web, dijital pazarlama, NFC ve QR menü stüdyosu.",
    areaServed: [
      { "@type": "City", name: "İstanbul" },
      { "@type": "Country", name: "Türkiye" },
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: "AuraDigital",
    inLanguage: "en-US",
    publisher: { "@id": ORGANIZATION_ID },
  };

  const page = {
    "@type": meta.type || "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: meta.title,
    description: meta.description,
    inLanguage: meta.lang === "tr" ? "tr-TR" : "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    breadcrumb: { "@id": `${canonical}#breadcrumb` },
  };

  const breadcrumbItems = [{
    "@type": "ListItem",
    position: 1,
    name: "AuraDigital",
    item: `${SITE_ORIGIN}/`,
  }];
  if (pathname !== "/") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: meta.title.split("|")[0].trim(),
      item: canonical,
    });
  }

  const graph = [organization, website, page, {
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: breadcrumbItems,
  }];

  if (meta.serviceType) {
    graph.push({
      "@type": "Service",
      "@id": `${canonical}#service`,
      name: meta.title.split("|")[0].trim(),
      description: meta.description,
      url: canonical,
      serviceType: meta.serviceType,
      provider: { "@id": ORGANIZATION_ID },
      areaServed: [
        { "@type": "City", name: "İstanbul" },
        { "@type": "Country", name: "Türkiye" },
      ],
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
