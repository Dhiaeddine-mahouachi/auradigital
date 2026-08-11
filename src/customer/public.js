import { json } from "../http.js";

export async function handleTenantPublicApi(request, db, url, corsHeaders = {}) {
  const menuMatch = url.pathname.match(/^\/api\/public\/menu\/([a-z0-9-]+)$/);
  if (menuMatch && request.method === "GET") {
    return (await getTenantMenu(db, menuMatch[1], corsHeaders)) || json({ error: "Menu not found." }, 404, corsHeaders);
  }
  const siteMatch = url.pathname.match(/^\/api\/public\/site\/([a-z0-9-]+)$/);
  if (siteMatch && request.method === "GET") {
    return (await getTenantWebsite(db, siteMatch[1], corsHeaders)) || json({ error: "Website not found." }, 404, corsHeaders);
  }
  return null;
}

export async function getTenantMenu(db, slug, headers = {}) {
  const business = await db.prepare(
    "SELECT b.*, ms.template,ms.primary_color,ms.secondary_color,ms.show_prices,ms.published,ms.revision " +
    "FROM businesses b JOIN customer_projects p ON p.business_id=b.id AND p.tenant_id=b.tenant_id " +
    "JOIN menu_settings ms ON ms.business_id=b.id AND ms.tenant_id=b.tenant_id " +
    "WHERE b.slug=? AND p.project_type='auramenu' AND p.status='active' AND ms.published=1 LIMIT 1",
  ).bind(slug).first();
  if (!business) return null;
  const [categoryRows, productRows] = await Promise.all([
    db.prepare("SELECT * FROM menu_categories WHERE tenant_id=? AND business_id=? AND active=1 ORDER BY sort_order,created_at").bind(business.tenant_id, business.id).all(),
    db.prepare("SELECT * FROM menu_products WHERE tenant_id=? AND business_id=? ORDER BY sort_order,created_at").bind(business.tenant_id, business.id).all(),
  ]);
  const products = productRows.results || [];
  const categories = (categoryRows.results || []).map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    emoji: category.emoji,
    items: products.filter((product) => product.category_id === category.id).map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.image,
      available: Boolean(product.available),
      featured: Boolean(product.featured),
      sortOrder: product.sort_order,
    })),
  }));
  return json({
    menu: {
      slug: business.slug,
      templateId: business.template,
      interfaceLanguage: business.language,
      menuLanguage: business.language,
      businessName: business.name,
      tagline: "",
      description: "",
      address: business.address,
      businessPhone: business.phone,
      whatsapp: business.whatsapp,
      email: business.email,
      instagram: business.instagram,
      facebook: business.facebook,
      logo: business.logo,
      openingHours: "",
      currency: business.currency,
      primaryColor: business.primary_color,
      secondaryColor: business.secondary_color,
      showPrices: Boolean(business.show_prices),
      categories,
      revision: business.revision,
      status: "approved",
    },
  }, 200, { "Cache-Control": "public, max-age=5, stale-while-revalidate=10", ETag: `W/\"menu-${business.revision}\"`, ...headers });
}

export async function getTenantWebsite(db, slug, headers = {}) {
  const website = await db.prepare(
    "SELECT w.*,b.slug,b.name,b.phone AS business_phone,b.whatsapp AS business_whatsapp,b.email AS business_email,b.address AS business_address,b.instagram AS business_instagram,b.facebook AS business_facebook,b.logo " +
    "FROM websites w JOIN businesses b ON b.id=w.business_id AND b.tenant_id=w.tenant_id " +
    "JOIN customer_projects p ON p.business_id=b.id AND p.tenant_id=b.tenant_id " +
    "WHERE b.slug=? AND p.project_type='quicksite' AND p.status='active' AND w.status='published' LIMIT 1",
  ).bind(slug).first();
  if (!website) return null;
  const [content, servicesResult, galleryResult] = await Promise.all([
    db.prepare("SELECT * FROM website_content WHERE tenant_id=? AND website_id=? LIMIT 1").bind(website.tenant_id, website.id).first(),
    db.prepare("SELECT * FROM website_services WHERE tenant_id=? AND website_id=? AND active=1 ORDER BY sort_order,created_at").bind(website.tenant_id, website.id).all(),
    db.prepare("SELECT * FROM website_gallery WHERE tenant_id=? AND website_id=? ORDER BY sort_order,created_at").bind(website.tenant_id, website.id).all(),
  ]);
  if (!content) return null;
  const services = servicesResult.results || [];
  const gallery = galleryResult.results || [];
  return json({
    project: {
      slug: website.slug,
      templateId: website.template_id,
      language: "tr",
      businessName: website.name,
      tagline: content.hero_subtitle,
      description: content.about_text,
      primaryColor: content.primary_color,
      phone: content.phone || website.business_phone,
      whatsapp: content.whatsapp || website.business_whatsapp,
      email: content.email || website.business_email,
      address: content.address || website.business_address,
      offers: services.map((service) => ({ name: service.title, description: service.description, price: service.price, image: service.image })),
      eyebrow: "",
      aboutTitle: content.about_title,
      primaryCta: content.primary_cta,
      secondaryCta: content.secondary_cta,
      workingHours: content.opening_hours,
      instagram: content.instagram || website.business_instagram,
      facebook: content.facebook || website.business_facebook,
      logoUrl: content.logo_image || website.logo,
      heroImageUrl: content.hero_image,
      galleryUrls: gallery.map((item) => item.image),
      gallery: gallery.map((item) => ({ image: item.image, caption: item.caption })),
      benefits: [],
      revision: website.revision,
    },
  }, 200, { "Cache-Control": "public, max-age=5, stale-while-revalidate=10", ETag: `W/\"site-${website.revision}\"`, ...headers });
}
