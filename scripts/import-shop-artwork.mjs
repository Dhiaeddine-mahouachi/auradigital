// Register the uploaded originals and browser viewports; do not resample artwork.
import { readFile, writeFile } from 'node:fs/promises';
const manifest = JSON.parse(await readFile('shop/artwork/uploaded-manifest.json', 'utf8'));
const themes = JSON.parse(await readFile('shop/catalog.seed.json', 'utf8')).map(theme => ({ ...theme, ...manifest[theme.id] }));
await writeFile('shop/catalog.seed.json', JSON.stringify(themes, null, 2) + '\n');
const quote = value => `'${value.replaceAll("'", "''")}'`;
const updates = Object.entries(manifest).map(([id, artwork]) => `UPDATE shop_card_themes SET data_json = json_patch(data_json, ${quote(JSON.stringify(artwork))}), updated_at = datetime('now') WHERE id = ${quote(id)} AND json_extract(data_json, '$.front') = ${quote(`/shop/artwork/demo-${id}-front.svg`)} AND json_extract(data_json, '$.back') = ${quote(`/shop/artwork/demo-${id}-back.svg`)};`);
await writeFile('migrations/0023_shop_uploaded_artwork.sql', '-- Replace only the original sample artwork references. Preserve custom themes and all other catalog fields.\n' + updates.join('\n') + '\n');
console.log('Registered eight uploaded artwork pairs and their separate front/back viewports.');
