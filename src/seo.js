const SITE_ORIGIN = "https://auradigitalworks.com";
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const PAGE_SEO = {
  "/": {
    "lang": "en",
    "title": "Digital Agency Istanbul | Websites, Ads & QR Menus | AuraDigital",
    "description": "AuraDigital is an Istanbul-based digital growth studio for websites, Google and Meta advertising, SEO, NFC cards and QR menus.",
    "type": "WebPage"
  },
  "/services": {
    "lang": "en",
    "title": "Web Design & Digital Marketing Istanbul | AuraDigital",
    "description": "Manage websites, Google Ads, Meta Ads, SEO, Google Maps, social media, content and automation with AuraDigital.",
    "type": "CollectionPage",
    "serviceType": [
      "Web Design",
      "Digital Marketing",
      "Google Ads",
      "Meta Ads",
      "SEO",
      "Social Media Management"
    ]
  },
  "/portfolio": {
    "lang": "en",
    "title": "Website & Digital Projects | AuraDigital Istanbul",
    "description": "Explore selected AuraDigital website, branding and digital experience projects for local businesses and creative brands.",
    "type": "CollectionPage"
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
    "description": "Digital wedding invitations in English, Turkish and Arabic with animated envelopes, custom themes, countdowns, RSVP, music and guest messages.",
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
    "title": "About AuraDigital | Digital Agency Istanbul",
    "description": "AuraDigital is an independent Istanbul-based digital growth studio connecting websites, advertising, social media, NFC and QR experiences.",
    "type": "AboutPage"
  },
  "/contact": {
    "lang": "en",
    "title": "Contact AuraDigital | Website & Digital Marketing Projects",
    "description": "Contact AuraDigital about your website, advertising, SEO, NFC card or QR menu project and get a tailored proposal.",
    "type": "ContactPage"
  }
};

const NOINDEX_PATHS = new Set([
  "/404.html",
  "/nfc-status.html",
  "/nfc-status",
]);

export const SEO_REDIRECTS = new Map([
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
