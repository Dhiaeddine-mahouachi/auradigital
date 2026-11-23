// Builds i18n/tr.json and i18n/ar.json (served as static assets) from the
// hand-written phrase tables in tools/i18n/site-copy-*.txt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = { tr: {}, ar: {} };
for (const file of fs.readdirSync(here).filter(f => /^site-copy-.*\.txt$/.test(f)).sort()) {
  for (const [n, line] of fs.readFileSync(path.join(here, file), 'utf8').split('\n').entries()) {
    if (!line.trim() || line.startsWith('#')) continue;
    const parts = line.split('|||').map(s => s.trim());
    if (parts.length !== 3 || parts.some(p => !p)) throw new Error(`${file}:${n + 1}: expected "en ||| tr ||| ar"`);
    const key = parts[0].replace(/\s+/g, ' ');
    out.tr[key] = parts[1]; out.ar[key] = parts[2];
  }
}
fs.mkdirSync(path.join(root, 'i18n'), { recursive: true });
for (const lang of ['tr', 'ar']) fs.writeFileSync(path.join(root, 'i18n', lang + '.json'), JSON.stringify(out[lang]) + '\n');
console.log('i18n phrases:', Object.keys(out.tr).length);
