// Builds a single-file, hash-routed preview of the public pages (for review links only).
// Usage: node preview-build.mjs <outDir>   (run `node build.mjs ./design ../..` first)
// The live site keeps one HTML file per route; this preview swaps pages in place by #route,
// because review hosts often serve one document and block navigation between files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const OUT = path.resolve(process.argv[2] || '/tmp/site-preview');
const LIVE = 'https://auradigitalworks.com';

const PAGES = [
  ['home', 'index.html'], ['solutions', 'solutions.html'], ['service-shop', 'service-shop.html'], ['packages', 'packages.html'],
  ['aura-menu', 'aura-menu.html'], ['aura-weddings', 'aura-weddings.html'], ['portfolio', 'portfolio.html'], ['help', 'help.html'],
  ['about', 'about.html'], ['contact', 'contact.html'], ['404', '404.html'],
];
const ROUTES = { '': 'Main', cards: 'Shop', cart: 'Shop' };
const TITLES = {};
const styles = [];
let shared = '';
for (const [route, file] of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const name = html.match(/<div id="app" data-page="([^"]+)"/)[1];
  ROUTES[route] = name;
  TITLES[name] = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'AuraDigital';
  const blocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  if (!shared) shared = blocks[0];
  if (!styles.some((s) => s.name === name)) styles.push({ name, css: blocks.slice(1).join('\n') });
}

// Paths: page routes become #routes, product assets become relative, account/hub/checkout go to the live site.
const routeOf = { '/': '#home', '/solutions': '#solutions', '/service-shop': '#service-shop', '/packages': '#packages', '/aura-menu': '#aura-menu',
  '/aura-weddings': '#aura-weddings', '/portfolio': '#portfolio', '/help': '#help', '/about': '#about', '/contact': '#contact' };
function rewrite(text) {
  return text.replace(/(["'(=])(\/[A-Za-z0-9_\-./#?=&%]*)(["')])/g, (m, q, p, end) => {
    const base = p.split(/[?#]/)[0];
    if (base === '/service-shop' && /tab=cards/.test(p)) return q + '#cards' + end;
    if (base === '/service-shop' && p.endsWith('#cart')) return q + '#cart' + end;
    if (routeOf[base] !== undefined) return q + routeOf[base] + end;
    if (/^\/weddings\/signature-art\//.test(base)) return q + p.slice(1) + end;
    if (/^\/(hub|weddings|shop|account|nfc)/.test(base)) return q + LIVE + p + end;
    if (/^\/(redesign|fonts|media|i18n)\//.test(base)) return q + p.slice(1) + end;
    return m;
  }).replace(/fetch\('\/i18n\/'/g, "fetch('i18n/'").replace(/url\(\/(fonts|media|redesign)\//g, 'url($1/');
}

fs.mkdirSync(path.join(OUT, 'redesign'), { recursive: true });
const entry = path.join(HERE, 'preview-entry.gen.js');
fs.writeFileSync(entry, `import { h, render } from 'preact';
import { registry } from './runtime.js';
import './components.gen.js';
const ROUTES = ${JSON.stringify(ROUTES)};
const TITLES = ${JSON.stringify(TITLES)};
const el = document.getElementById('app');
let current = null;
function show() {
  const key = decodeURIComponent(location.hash.slice(1));
  const name = ROUTES[key] || (key && !ROUTES[key] ? (document.getElementById(key) ? current : 'NotFound') : 'Main');
  if (name === current) return;
  current = name;
  for (const s of document.querySelectorAll('style[data-pg]')) s.media = s.dataset.pg === name ? 'all' : 'not all';
  document.body.style.overflow = '';
  render(null, el); el.innerHTML = '';
  el.dataset.page = name;
  render(h(registry[name], {}), el);
  document.title = TITLES[name] || 'AuraDigital';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', show);
show();
`);
await esbuild({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', target: ['es2019'], outfile: path.join(OUT, 'redesign', 'app.js'), legalComments: 'none', absWorkingDir: HERE });
fs.unlinkSync(entry);
fs.writeFileSync(path.join(OUT, 'redesign', 'app.js'), rewrite(fs.readFileSync(path.join(OUT, 'redesign', 'app.js'), 'utf8')));

const head = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('<style')[0]
  .replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '').replace(/<title>[^<]*<\/title>/, '<title>AuraDigital preview</title>')
  .replace(/<link rel="manifest"[^>]*>/, '');
const page = rewrite(`${head}<style>${shared}</style>
${styles.map((s) => `<style data-pg="${s.name}" media="not all">${s.css}</style>`).join('\n')}
</head>
<body>
<div id="app"></div>
<script src="/redesign/app.js" defer></script>
<script src="/redesign/i18n.js" defer></script>
</body>
</html>
`).replace(/\?v=\d+/g, '');
fs.writeFileSync(path.join(OUT, 'index.html'), page);

// Assets: scripts, fonts, translations, media the pages use.
const copy = (rel) => { const src = path.join(ROOT, rel); if (!fs.existsSync(src)) return; fs.mkdirSync(path.dirname(path.join(OUT, rel)), { recursive: true }); fs.cpSync(src, path.join(OUT, rel), { recursive: true }); };
for (const rel of ['redesign/motion.js', 'redesign/i18n.js', 'redesign/fonts.css', 'fonts/redesign', 'i18n/tr.json', 'i18n/ar.json', 'media/redesign']) copy(rel);
for (const f of ['redesign/motion.js', 'redesign/i18n.js', 'redesign/fonts.css']) fs.writeFileSync(path.join(OUT, f), rewrite(fs.readFileSync(path.join(OUT, f), 'utf8')));
fs.writeFileSync(path.join(OUT, 'redesign/fonts.css'), fs.readFileSync(path.join(OUT, 'redesign/fonts.css'), 'utf8').replace(/url\((["']?)(fonts|media)\//g, 'url($1../$2/'));
const bundle = fs.readFileSync(path.join(OUT, 'redesign', 'app.js'), 'utf8');
for (const m of new Set([...bundle.matchAll(/"((?:media|weddings\/signature-art)\/[A-Za-z0-9_\-./]+\.(?:webp|png|jpg|jpeg|svg|mp4|webm))"/g)].map((x) => x[1]))) copy(m);
const art = path.join(ROOT, 'weddings/signature-art');
for (const f of fs.readdirSync(art)) if (/^[a-z0-9-]+\.webp$/.test(f) && !/-(mobile|thumb)\.webp$/.test(f) && bundle.includes(f.replace('.webp', ''))) copy('weddings/signature-art/' + f);
console.log('preview →', OUT, Object.keys(ROUTES).length, 'routes');
