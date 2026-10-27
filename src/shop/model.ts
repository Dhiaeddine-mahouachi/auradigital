export const categories = ['Restaurants', 'Coffee Shops & Cafés', 'Corporate & Business', 'Beauty Salons & Spas', 'Barbershops', 'Gyms & Fitness', 'Automotive & Car Detailing', 'Real Estate', 'Dental & Medical Clinics', 'Hotels & Hospitality', 'Retail & Fashion', 'Events & Weddings', 'Freelancers & Creators', 'General Business', 'Travel & Tourism', 'Education', 'Legal Services', 'Technology & IT', 'Pet Services'] as const;
export const purposes = ['Business Profile', 'Digital Menu', 'Google Reviews', 'Booking', 'Loyalty', 'Social Media'] as const;
export const styles = ['Minimal', 'Luxury', 'Modern', 'Corporate', 'Colorful', 'Futuristic'] as const;
export type ArtworkCrop = { x: number; y: number; width: number; height: number };
export type PairedArtwork = { width: number; height: number; front: ArtworkCrop; back: ArtworkCrop };
export type Theme = {
  id: string; slug: string; name: string; category: string; description: string;
  front: string; back: string; orientation: 'Horizontal' | 'Vertical';
  artwork?: PairedArtwork;
  madeToOrder?: boolean;
  colors: string[]; palette: string[]; purpose: string; style: string;
  materials: string[]; finishes: string[]; priceMinor: number | null;
  currency: 'TRY'; status: 'demo' | 'published' | 'archived';
  approved: boolean; available: boolean; popularity: number; createdAt: string;
  badge: '' | 'New';
};
export type Personalization = { business: string; destination: string; destinationType: string; contact: string; phone: string; whatsapp: string; social: string; instructions: string };
export type CartItem = { id: string; themeId: string; quantity: number; material: string; finish: string; personalization: Personalization };
export type Filters = { search: string; category: string; purpose: string; style: string; color: string; orientation: string; maxPrice: string; sort: string };
export const emptyFilters: Filters = { search: '', category: '', purpose: '', style: '', color: '', orientation: '', maxPrice: '', sort: 'newest' };
export const destinationTypes = ['Website', 'AuraPops digital profile', 'AuraMenu digital menu', 'Booking page', 'Google review page', 'Link hub'];
export const emptyPersonalization: Personalization = { business: '', destination: '', destinationType: 'Website', contact: '', phone: '', whatsapp: '', social: '', instructions: '' };
export function money(amount: number | null, currency = 'TRY'): string {
  return amount === null ? 'Price on approval' : currency === 'TRY' ? new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(amount / 100) + ' TL' : new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount / 100);
}
export function canPurchase(theme: Theme): boolean {
  return theme.status !== 'archived' && (theme.madeToOrder === true || (theme.status === 'published' && theme.approved)) && theme.available && Number.isSafeInteger(theme.priceMinor) && Number(theme.priceMinor) > 0;
}
export function filterThemes(themes: Theme[], filters: Filters): Theme[] {
  const search = filters.search.trim().toLocaleLowerCase();
  const found = themes.filter(t => t.status !== 'archived' && (!search || [t.name, t.category, t.description, t.purpose].join(' ').toLocaleLowerCase().includes(search)) &&
    (!filters.category || t.category === filters.category) && (!filters.purpose || t.purpose === filters.purpose) && (!filters.style || t.style === filters.style) &&
    (!filters.color || t.colors.includes(filters.color)) && (!filters.orientation || t.orientation === filters.orientation) &&
    (!filters.maxPrice || (t.priceMinor !== null && t.priceMinor <= Number(filters.maxPrice) * 100)));
  return found.sort((a, b) => filters.sort === 'price-low' ? (a.priceMinor ?? Infinity) - (b.priceMinor ?? Infinity) : filters.sort === 'alphabetical' ? a.name.localeCompare(b.name) : filters.sort === 'price-high' ? (b.priceMinor ?? 0) - (a.priceMinor ?? 0) : filters.sort === 'popular' ? b.popularity - a.popularity || a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
}
export function safeUrl(value: unknown, optional = false): string {
  if (optional && value === '') return '';
  if (typeof value !== 'string' || value.length > 800) throw new Error('Enter a valid https:// destination URL.');
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Enter a valid https:// destination URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use an HTTPS link without embedded credentials.');
  return url.href;
}
export function validateItem(input: unknown, themes: Theme[], requirePersonalization = true): CartItem {
  if (!input || typeof input !== 'object') throw new Error('Invalid cart item.');
  const item = input as CartItem;
  const theme = themes.find(t => t.id === item.themeId && t.status !== 'archived');
  if (!theme) throw new Error('This theme is no longer available.');
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error('Quantity must be a whole number from 1 to 100.');
  if (!theme.materials.includes(item.material) || !theme.finishes.includes(item.finish)) throw new Error('Select a valid material and finish.');
  const raw = item.personalization;
  if (!raw || typeof raw !== 'object' || typeof raw.business !== 'string' || (requirePersonalization && !raw.business.trim())) throw new Error('Enter your business name.');
  const personalization = { ...emptyPersonalization };
  for (const key of Object.keys(personalization) as (keyof Personalization)[]) {
    if (typeof raw[key] !== 'string' || raw[key].length > (key === 'instructions' ? 1000 : key === 'destination' || key === 'social' ? 800 : 100)) throw new Error('A personalization field is invalid or too long.');
    personalization[key] = raw[key].trim();
  }
  if (!destinationTypes.includes(personalization.destinationType)) throw new Error('Select a valid destination type.');
  personalization.destination = safeUrl(personalization.destination, !requirePersonalization);
  personalization.social = safeUrl(personalization.social, true);
  return { id: typeof item.id === 'string' && /^[a-zA-Z0-9-]{1,60}$/.test(item.id) ? item.id : crypto.randomUUID(), themeId: theme.id, quantity: item.quantity, material: item.material, finish: item.finish, personalization };
}
export function restoreCart(raw: string | null, themes: Theme[]): CartItem[] {
  try {
    const data = JSON.parse(raw || 'null');
    if (data?.version !== 1 || !Array.isArray(data.items) || data.items.length > 50) return [];
    const ids = new Set<string>();
    return data.items.flatMap((item: unknown) => {
      try { const valid = validateItem(item, themes, false); if (ids.has(valid.id)) return []; ids.add(valid.id); return [valid]; } catch { return []; }
    });
  } catch { return []; }
}
export function quoteCart(items: unknown, themes: Theme[]) {
  if (!Array.isArray(items) || !items.length || items.length > 50) throw new Error('Your cart must contain 1 to 50 designs.');
  const lines = items.map(input => {
    const item = validateItem(input, themes, false), theme = themes.find(t => t.id === item.themeId)!;
    if (!canPurchase(theme)) throw new Error(`${theme.name} is unavailable. It cannot be ordered.`);
    return { ...item, name: theme.name, currency: theme.currency, unitMinor: theme.priceMinor!, subtotalMinor: theme.priceMinor! * item.quantity };
  });
  const subtotalMinor = lines.reduce((sum, line) => sum + line.subtotalMinor, 0);
  if (!Number.isSafeInteger(subtotalMinor)) throw new Error('Cart total is too large.');
  return { lines, currency: 'TRY', subtotalMinor, shippingMinor: null, taxMinor: null, totalMinor: null, payable: false };
}
