import { ApiError } from './http.js';

const legacy = ['modern','orbit','maison','taste3d'];
export const standardIds = Object.freeze(Array.from({length:15},(_,index) => 'std-' + String(index+1).padStart(2,'0')));
export const premiumIds = Object.freeze(Array.from({length:15},(_,index) => 'pre-' + (index+16)));
const standardSet = new Set(standardIds);
const premiumSet = new Set(premiumIds);
const languages = ['en','tr','ar','fr'];
const weekDays = ['mon','tue','wed','thu','fri','sat','sun'];
const fonts = ['sans','serif','mono','editorial','condensed'];
const colors = ['primary','secondary','background','text','accent'];
const toggles = ['images','prices','information','socials','play','motion','ornaments'];
const linkNames = ['directions','instagram','facebook','tiktok','whatsapp','website','review'];
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const clean = (value,max) => typeof value === 'string' ? value.trim().slice(0,max) : '';

export const isCollectionDesign = id => standardSet.has(id) || premiumSet.has(id);
export const standardDesignsEnabled = env => env.AURAMENU_STANDARD_ENABLED === 'true';

// Standard plans (starter, annual) get the standard designs; the Premium plan (pro) gets the premium designs only.
// Older menus with a manual premium grant (AURAMENU_PREMIUM_MENU_IDS) keep both.
export function menuDesignAccess(env,{id,billing,pending = false,paid = false,planId} = {}) {
  const standardOn = standardDesignsEnabled(env), premiumOn = env.AURAMENU_PREMIUM_ENABLED === 'true';
  if ((planId || billing?.planId) === 'pro') return {standard:false,premium:premiumOn};
  const eligiblePeriod = pending || (paid && billing?.active);
  const grants = typeof env.AURAMENU_PREMIUM_MENU_IDS === 'string' ? env.AURAMENU_PREMIUM_MENU_IDS : '';
  const granted = premiumOn && Boolean(id && billing && eligiblePeriod && grants.split(',').some(grant => grant.trim() === id));
  return {standard:standardOn || granted,premium:granted};
}

export function assertMenuTemplate(id,{standard = false,premium = false,currentId} = {}) {
  if (legacy.includes(id)) return id;
  if (!isCollectionDesign(id)) throw new ApiError(400,'Choose a valid AuraMenu template.');
  if (id === currentId || (premiumSet.has(id) ? premium : standard)) return id;
  throw new ApiError(403,'This template is unavailable for your menu plan.');
}
function safeUrl(value,{strict = false} = {}) {
  const input = clean(value,2048);
  if (!input) return '';
  try {
    const url = new URL(input);
    if (['https:','http:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {}
  if (strict) throw new ApiError(400,'Restaurant and image links must use HTTP or HTTPS without credentials.');
  return '';
}
function localText(value,max) {
  if (!isObject(value)) return clean(value,max);
  return Object.fromEntries(languages.flatMap(lang => {
    const valueForLanguage = clean(value[lang],max);
    return valueForLanguage ? [[lang,valueForLanguage]] : [];
  }));
}
const translate = (value) => {
  const translations = {};
  for (const [key,max] of [['name',100],['description',600]]) {
    if (isObject(value?.[key])) translations[key] = localText(value[key],max);
  }
  return Object.keys(translations).length ? {translations} : {};
};
export function normalizeItemMetadata(item) {
  const result = translate(item.translations);
  for (const key of ['available','bestseller','seasonal','transparent']) {
    if (typeof item[key] === 'boolean') result[key] = item[key];
  }
  // "limited" = still orderable, only a few left (shown as "Few left" on the menu).
  if (item.available === 'limited') result.available = 'limited';
  const currency = clean(item.currency,3);
  if (/^[A-Z]{3}$/.test(currency)) result.currency = currency;
  const discountPrice = clean(item.discountPrice,40);
  if (discountPrice) result.discountPrice = discountPrice;
  for (const key of ['ingredients','allergens','dietary']) {
    if (Array.isArray(item[key])) result[key] = item[key].slice(0,20).map(value => localText(value,100)).filter(Boolean);
  }
  if (Array.isArray(item.variants)) {
    result.variants = item.variants.slice(0,20).filter(isObject).map(value => ({
      name:localText(value.name,100),price:clean(value.price,40),currency:/^[A-Z]{3}$/.test(value.currency) ? value.currency : '',
    }));
  }
  const imageSmall = safeUrl(item.imageSmall);
  if (imageSmall) result.imageSmall = imageSmall;
  return result;
}
export function normalizeCategoryMetadata(category, normalizeSections, depth) {
  const result = translate(category.translations);
  if (category.visible === false) result.visible = false;
  const description = localText(category.description,300);
  const imageUrl = safeUrl(category.imageUrl);
  if (description) result.description = description;
  if (imageUrl) result.imageUrl = imageUrl;
  if (Array.isArray(category.subcategories) && category.subcategories.length) {
    if (depth >= 2) throw new ApiError(400,'Use at most two levels of subcategories.');
    result.subcategories = normalizeSections(category.subcategories,depth+1);
  }
  return result;
}
export function *menuItems(categories) {
  for (const category of categories) {
    yield* category.items;
    if (category.subcategories) yield* menuItems(category.subcategories);
  }
}
export function normalizeMenuPresentation({restaurant,design}) {
  const output = {};
  if (isObject(restaurant)) {
    const result = {};
    for (const [key,max] of [['name',100],['tagline',140],['description',600],['announcement',200],['address',220],['openingHours',220]]) {
      const value = localText(restaurant[key],max);
      if (value) result[key] = value;
    }
    for (const key of ['logo','cover','coverSmall']) {
      const value = safeUrl(restaurant[key],{strict:true});
      if (value) result[key] = value;
    }
    // Short kitchen video for the menu (direct MP4/WebM link) and an optional still image shown before it plays.
    if (isObject(restaurant.video)) {
      const src = safeUrl(restaurant.video.src,{strict:true});
      if (src && /\.(mp4|webm|m4v)(?:$|[?#])/i.test(new URL(src).pathname + new URL(src).search)) {
        const video = {src};
        const poster = safeUrl(restaurant.video.poster,{strict:true});
        if (poster) video.poster = poster;
        result.video = video;
      }
    }
    // Weekly opening hours: {mon:'09:00-23:00', tue:'', ...}; an empty day means closed.
    if (isObject(restaurant.hours)) {
      const hours = {};
      for (const day of weekDays) {
        const value = clean(restaurant.hours[day],11);
        if (value === '' && day in restaurant.hours) hours[day] = '';
        else if (/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-4]):[0-5]\d$/.test(value)) hours[day] = value;
      }
      if (Object.keys(hours).length) result.hours = hours;
    }
    if (isObject(restaurant.links)) result.links = Object.fromEntries(linkNames.flatMap(key => {
      const value = safeUrl(restaurant.links[key],{strict:true});
      return value ? [[key,value]] : [];
    }));
    output.restaurant = result;
  }
  if (isObject(design)) {
    const result = {};
    for (const key of colors) {
      const value = clean(design[key],7);
      if (/^#[\da-f]{6}$/i.test(value)) result[key] = value;
    }
    for (const key of ['heading','body']) if (fonts.includes(design[key])) result[key] = design[key];
    for (const key of toggles) if (typeof design[key] === 'boolean') result[key] = design[key];
    if (Number.isInteger(design.radius)) result.radius = Math.min(32,Math.max(0,design.radius));
    for (const key of ['logo','cover']) {
      const value = safeUrl(design[key],{strict:true});
      if (value) result[key] = value;
    }
    output.design = result;
  }
  return output;
}
export async function getMenuPresentation(db,id) {
  const row = await db.prepare('SELECT presentation_json FROM auramenu_design_settings WHERE menu_id=?').bind(id).first();
  if (!row) return {};
  try { return normalizeMenuPresentation(JSON.parse(row.presentation_json)); } catch { return {}; }
}
export function saveMenuPresentation(db,id,presentation) {
  return db.prepare('INSERT INTO auramenu_design_settings(menu_id,presentation_json) VALUES(?,?) ON CONFLICT(menu_id) DO UPDATE SET presentation_json=excluded.presentation_json')
    .bind(id,JSON.stringify(presentation));
}
