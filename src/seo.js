const SITE_ORIGIN = "https://auradigital.ink";
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

const PAGE_SEO = {
  "/": {
    lang: "tr",
    title: "Dijital Ajans İstanbul | Web, Reklam & QR Menü | AuraDigital",
    description: "AuraDigital İstanbul'da web tasarım, Google ve Meta reklamları, SEO, NFC kart ve QR dijital menü çözümleri sunan dijital büyüme stüdyosudur.",
    type: "WebPage",
  },
  "/services": {
    lang: "tr",
    title: "Dijital Pazarlama & Web Tasarım İstanbul | AuraDigital",
    description: "İstanbul'da web tasarım, Google Ads, Meta Ads, SEO, Google Maps, sosyal medya, içerik ve otomasyon hizmetlerini AuraDigital ile tek çatı altında yönetin.",
    type: "CollectionPage",
    serviceType: ["Web Tasarım", "Dijital Pazarlama", "Google Ads", "Meta Ads", "SEO", "Sosyal Medya Yönetimi"],
  },
  "/portfolio": {
    lang: "tr",
    title: "Web Tasarım & Dijital Projeler | AuraDigital İstanbul",
    description: "AuraDigital'in web tasarım, yerel işletme, marka ve dijital deneyim projelerini inceleyin. İstanbul merkezli seçili çalışmalar ve gerçek proje örnekleri.",
    type: "CollectionPage",
  },
  "/aura-menu": {
    lang: "tr",
    title: "QR Menü & Dijital Menü Tasarımı İstanbul | AuraMenu",
    description: "Restoran ve kafeler için mobil uyumlu QR menü ve dijital menü tasarımı. AuraMenu ile tasarımınızı seçin, ürünlerinizi ve marka renklerinizi özelleştirin.",
    type: "WebPage",
    serviceType: ["QR Menü", "Dijital Menü Tasarımı", "Restoran Menü Tasarımı"],
  },
  "/nfc": {
    lang: "tr",
    title: "NFC Kart & Google Yorum Kartı İstanbul | AuraDigital",
    description: "Google yorum, web sitesi, QR menü ve sosyal medya için özelleştirilebilir NFC kart çözümleri. İstanbul'da işletmenize özel NFC kart tasarımı.",
    type: "WebPage",
    serviceType: ["NFC Kart", "Google Yorum NFC Kartı", "İşletme NFC Kartı"],
  },
  "/nfc-studio": {
    lang: "tr",
    title: "NFC Kart Tasarla | Google Yorum & Web NFC Kartı | AuraDigital",
    description: "NFC kartınızı online tasarlayın; renk, metin, QR kod ve hedef bağlantıyı özelleştirip Google yorum veya web sitesi için tasarım talebi gönderin.",
    type: "WebPage",
    serviceType: ["NFC Kart Tasarımı"],
  },
  "/qr-menu": {
    lang: "tr",
    title: "QR Menü Tasarımı İstanbul | Restoran Dijital Menü | AuraDigital",
    description: "İstanbul'daki restoran ve kafeler için hızlı, mobil uyumlu ve markaya özel QR dijital menü tasarımı. Ürün, fiyat ve görsellerinizi kolayca sunun.",
    type: "WebPage",
    serviceType: ["QR Menü Tasarımı", "Restoran Dijital Menü"],
  },
  "/packages": {
    lang: "tr",
    title: "Dijital Pazarlama Paketleri İstanbul | AuraDigital",
    description: "Sosyal medya, reklam, içerik, web desteği ve optimizasyonu birleştiren haftalık ve aylık dijital pazarlama paketlerini inceleyin.",
    type: "WebPage",
  },
  "/about": {
    lang: "tr",
    title: "AuraDigital Hakkında | İstanbul Dijital Ajans",
    description: "AuraDigital; web, reklam, sosyal medya, NFC ve QR deneyimlerini tek sistemde birleştiren İstanbul merkezli bağımsız dijital büyüme stüdyosudur.",
    type: "AboutPage",
  },
  "/contact": {
    lang: "tr",
    title: "Dijital Ajans İstanbul İletişim & Teklif | AuraDigital",
    description: "Web tasarım, dijital reklam, SEO, NFC kart veya QR menü projeniz için AuraDigital ile iletişime geçin ve işletmenize özel teklif alın.",
    type: "ContactPage",
  },
  "/quicksite": {
    lang: "en",
    title: "QuickSite Website Builder for Businesses | AuraDigital",
    description: "Preview a ready-made business website, customize its content and style, and send your QuickSite request to AuraDigital for publishing.",
    type: "WebPage",
    serviceType: ["Business Website Builder", "Small Business Website Design"],
  },
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
  ["/quicksite-v2.html", "/quicksite"],
]);

export function permanentSeoRedirect(request) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  const targetPath = SEO_REDIRECTS.get(url.pathname);
  if (!targetPath) return null;
  const target = new URL(targetPath, url.origin);
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
    })
    .on("video[data-background-video]", {
      element(element) {
        element.setAttribute("preload", "metadata");
      },
    })
    .on(".project-grid img", {
      element(element) {
        element.setAttribute("loading", "lazy");
        element.setAttribute("decoding", "async");
      },
    })
    .on(".visual-explainers img", {
      element(element) {
        element.setAttribute("loading", "lazy");
        element.setAttribute("decoding", "async");
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
  ["/nfc", "/nfc.html"],
  ["/nfc-studio", "/nfc-builder.html"],
  ["/nfc-status", "/nfc-status.html"],
  ["/qr-menu", "/qr-menu.html"],
  ["/packages", "/packages.html"],
  ["/about", "/about.html"],
  ["/contact", "/contact.html"],
  ["/quicksite", "/quicksite-v2.html"],
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
    `<meta name="twitter:card" content="summary" />`,
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
    logo: `${SITE_ORIGIN}/auradigital-mark.svg`,
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
    inLanguage: "tr-TR",
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
