// Reproducible sample vector artwork, never a production print proof.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
const context = vm.createContext({});
vm.runInContext(await readFile('weddings/vendor/qrcode.js', 'utf8'), context);
const qr = context.qrcode(0, 'M');
qr.addData('https://auradigitalworks.com/nfc'); qr.make();
const cells = [];
for (let row = 0; row < qr.getModuleCount(); row++) for (let col = 0; col < qr.getModuleCount(); col++) if (qr.isDark(row, col)) cells.push(`<rect x="${col + 4}" y="${row + 4}" width="1" height="1"/>`);
const qrSize = qr.getModuleCount() + 8;
const definitions = [
  ['oliva-bistro', 'Oliva Bistro', 'Restaurants', 'Digital Menu', 'Luxury', 'Green', '#153e32', '#e7d7ab', 'OLIVA', 'BISTRO & KITCHEN', 'A taste worth sharing.', false],
  ['roast-and-bean', 'Roast & Bean', 'Coffee Shops & Cafés', 'Loyalty', 'Modern', 'Brown', '#4b3024', '#f1cf9f', 'roast & bean', 'SPECIALTY COFFEE', 'Your daily ritual.', false],
  ['northbridge-consulting', 'Northbridge Consulting', 'Corporate & Business', 'Business Profile', 'Corporate', 'Blue', '#122f4b', '#c2d8ee', 'NORTHBRIDGE', 'CONSULTING', 'Ideas. Direction. Progress.', false],
  ['luna-beauty-studio', 'Luna Beauty Studio', 'Beauty Salons & Spas', 'Booking', 'Minimal', 'Pink', '#f4dce1', '#482837', 'luna', 'BEAUTY STUDIO', 'A moment for yourself.', true],
  ['pulse-fitness-club', 'Pulse Fitness Club', 'Gyms & Fitness', 'Social Media', 'Futuristic', 'Lime', '#15231b', '#d8f46c', 'PULSE', 'FITNESS CLUB', 'Find your next level.', false],
  ['titan-auto-detail', 'Titan Auto Detail', 'Automotive & Car Detailing', 'Google Reviews', 'Modern', 'Black', '#20242a', '#f4a46b', 'TITAN', 'AUTO DETAIL', 'Every detail matters.', false],
  ['brightcare-dental', 'BrightCare Dental', 'Dental & Medical Clinics', 'Booking', 'Minimal', 'Ivory', '#ecf4f2', '#18574f', 'BrightCare', 'DENTAL STUDIO', 'A brighter connection.', false],
  ['golden-key-realty', 'Golden Key Realty', 'Real Estate', 'Business Profile', 'Luxury', 'Gold', '#292820', '#dfc384', 'GOLDEN KEY', 'REALTY', 'Your next chapter.', false],
];
await mkdir('shop/artwork', { recursive: true });
const themes = [];
const esc = str => str.replaceAll('&', '&amp;');
for (const [slug, name, category, purpose, style, color, bg, fg, wordmark, label, tagline, vertical] of definitions) {
  const w = vertical ? 540 : 856, h = vertical ? 856 : 540;
  const header = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(name)} sample card"><rect width="${w}" height="${h}" rx="30" fill="${bg}"/><g fill="none" stroke="${fg}" opacity=".17"><circle cx="${w - 40}" cy="40" r="250"/><circle cx="${w - 40}" cy="40" r="210"/><path d="M40 ${h - 45}H${w - 40}"/></g>`;
  const front = `${header}<text x="48" y="78" fill="${fg}" font-family="Arial,sans-serif" font-size="15" letter-spacing="5">${esc(label)}</text><text x="48" y="${vertical ? 225 : 208}" fill="${fg}" font-family="${style === 'Luxury' ? 'Georgia,serif' : 'Arial,sans-serif'}" font-size="${vertical ? 70 : 52}" font-weight="${style === 'Futuristic' ? 900 : 500}">${esc(wordmark)}</text><text x="48" y="${vertical ? 275 : 251}" fill="${fg}" font-family="Arial,sans-serif" font-size="19">${esc(tagline)}</text><svg x="48" y="${vertical ? 420 : 310}" width="${vertical ? 220 : 158}" height="${vertical ? 220 : 158}" viewBox="0 0 ${qrSize} ${qrSize}"><rect width="${qrSize}" height="${qrSize}" fill="white"/><g fill="#07180f">${cells.join('')}</g></svg><g transform="translate(${vertical ? 326 : 247} ${vertical ? 461 : 328})" fill="none" stroke="${fg}" stroke-width="5" stroke-linecap="round"><path d="M0 14Q14 30 0 46M15 2Q41 30 15 58M30 -9Q70 30 30 69"/></g><text x="${vertical ? 322 : 243}" y="${vertical ? 578 : 431}" fill="${fg}" font-family="Arial,sans-serif" font-size="15" letter-spacing="2">TAP OR SCAN</text><text x="48" y="${h - 25}" fill="${fg}" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">NFC + QR / SAMPLE DESIGN</text></svg>`;
  const back = `${header}<text x="48" y="78" fill="${fg}" font-family="Arial,sans-serif" font-size="15" letter-spacing="4">${esc(label)}</text><text x="48" y="${vertical ? 285 : 235}" fill="${fg}" font-family="Georgia,serif" font-size="${vertical ? 36 : 48}">One small card.</text><text x="48" y="${vertical ? 342 : 300}" fill="${fg}" font-family="Georgia,serif" font-size="${vertical ? 36 : 48}">Every connection.</text><text x="48" y="${vertical ? 480 : 390}" fill="${fg}" font-family="Arial,sans-serif" font-size="18">${esc(purpose)}</text><text x="48" y="${h - 75}" fill="${fg}" font-family="Arial,sans-serif" font-size="15">Your business details, thoughtfully placed.</text><text x="48" y="${h - 25}" fill="${fg}" font-family="Arial,sans-serif" font-size="12" letter-spacing="2">AURADIGITAL / SAMPLE, NOT A PRINT PROOF</text></svg>`;
  const frontPath = `/shop/artwork/demo-${slug}-front.svg`, backPath = `/shop/artwork/demo-${slug}-back.svg`;
  await writeFile(`.${frontPath}`, front); await writeFile(`.${backPath}`, back);
  themes.push({ id: slug, slug, name, category, description: `${tagline} A ${style.toLowerCase()} NFC and QR card concept for ${category.toLowerCase()}. The QR and NFC symbol share the front. Sample artwork requires production and fulfillment approval.`, front: frontPath, back: backPath, orientation: vertical ? 'Vertical' : 'Horizontal', colors: [color], palette: [bg, fg], purpose, style, materials: ['PVC'], finishes: ['Matte', 'Glossy'], priceMinor: null, currency: 'TRY', status: 'demo', approved: false, available: false, popularity: 0, createdAt: '2026-10-27', badge: 'New' });
}
await writeFile('shop/catalog.seed.json', JSON.stringify(themes, null, 2) + '\n');
const values = themes.map(t => `('${t.id}', '${t.slug}', '${JSON.stringify(t).replaceAll("'", "''")}')`).join(',\n');
await writeFile('migrations/0022_shop_catalog.sql', `-- Additive shop catalog. All seed artwork is demo-only and cannot be purchased.\nCREATE TABLE IF NOT EXISTS shop_card_themes (\n  id TEXT PRIMARY KEY NOT NULL,\n  slug TEXT NOT NULL UNIQUE,\n  data_json TEXT NOT NULL CHECK(json_valid(data_json)),\n  created_at TEXT NOT NULL DEFAULT (datetime('now')),\n  updated_at TEXT NOT NULL DEFAULT (datetime('now'))\n);\nCREATE INDEX IF NOT EXISTS idx_shop_themes_updated ON shop_card_themes(updated_at);\nINSERT OR IGNORE INTO shop_card_themes (id, slug, data_json) VALUES\n${values};\n`);
console.log('Generated eight demo themes and 16 vector previews.');
// Keep uploaded artwork authoritative when rebuilding legacy sample assets.
await import('./import-shop-artwork.mjs');
