// Builds the AuraDigital redesign into static, pre-rendered pages for the
// Cloudflare Worker assets directory. Usage: node build.mjs <designDir> <repoDir>
import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'htmlparser2';
import { build as esbuild } from 'esbuild';
import { h } from 'preact';
import renderToString from 'preact-render-to-string';
import * as runtime from './runtime.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const [designDir, repoDir] = process.argv.slice(2);
const VERSION = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');

const ROUTES = {
  'Main.dc.html': '/', 'Solutions.dc.html': '/solutions', 'Shop.dc.html': '/service-shop', 'Packages.dc.html': '/packages',
  'AuraMenu.dc.html': '/aura-menu', 'Work.dc.html': '/portfolio', 'Help.dc.html': '/help', 'About.dc.html': '/about',
  'Contact.dc.html': '/contact', 'Weddings.dc.html': '/aura-weddings', 'NotFound.dc.html': '/', 'Hub.dc.html': '/hub/signup', 'HubApp.dc.html': '/hub', 'Mobile.dc.html': '/'
};
const PAGES = [
  ['Main', 'index.html', 'AuraDigital — Websites, AI & growth for your business', 'Websites, QR menus, Google visibility and WhatsApp automation for businesses in Türkiye and beyond — planned by AI, delivered by our Istanbul team.'],
  ['Solutions', 'solutions.html', 'Solutions — AuraDigital', 'Build, grow, automate and manage your business with AuraDigital.'],
  ['Shop', 'service-shop.html', 'Service Shop — AuraDigital', 'Choose websites, care plans, ads, AuraMenu, NFC cards and more with clear prices.'],
  ['Packages', 'packages.html', 'Packages & prices — AuraDigital', 'Launch ₺6,750 · Growth ₺13,400 · System ₺22,400. Care plans from ₺1,950/month.'],
  ['AuraMenu', 'aura-menu.html', 'AuraMenu — QR digital menus — AuraDigital', 'QR digital menus in Turkish, English and Arabic. Self-service ₺1,599 or done-for-you ₺2,500.'],
  ['Work', 'portfolio.html', 'Our work — AuraDigital', 'Websites, products and campaigns built by AuraDigital.'],
  ['Help', 'help.html', 'Help Center — AuraDigital', 'Answers about websites, AuraHub, payments, AuraMenu and WhatsApp automation.'],
  ['About', 'about.html', 'About — AuraDigital', 'An Istanbul-based digital agency combining AI with a hands-on team.'],
  ['Weddings', 'aura-weddings.html', 'AuraWeddings — Digital wedding invitations | AuraDigital', 'Luxury digital wedding invitations with animated opening, RSVP, countdown, map, gallery and music in Arabic, English, Turkish and French.'],
  ['NotFound', '404.html', 'Page not found — AuraDigital', 'This page could not be found. Continue to AuraDigital services, prices or contact.'],
  ['Contact', 'contact.html', 'Contact — AuraDigital', 'WhatsApp +90 538 550 76 74 · info@auradigitalworks.com · Istanbul, Türkiye.']
];
const COMPONENTS = ['Header', 'Footer', 'Auri', ...PAGES.map((p) => p[0])];
const BLOBS = {
  '56afe0dcf81cd1f38f2606979b5b33cb': '/media/aura-hero.mp4',
  'b95dcbf81f0bb28e06cef3098f8ecccc': '/media/aura-hero-poster.jpg',
  'e62003c87bc3e54eb3e4c978d7561582': '/project-erhan.png',
  '18b435ab4d0c6ef6d3d0aea85fc0f2fe': '/project-gateaux.png',
  'fa3669d6d8c834adc34efe0134c2a8e4': '/project-mutlu.png',
  'bbfed3b8644e412d33db8b05e7af370e': '/project-fifty.png',
  'c75b79c2c529830827d989d110e51421': '/media/landing/auramenu-live-20261116.png',
  '1437b95a8ce24a7792bbdd5c8a3e183d': '/media/landing/hub-growth-vision.png',
  '501c0abc1436e5b3a9193647e75297ad': '/media/landing/hub-my-services.png',
  '383fb40db1c79ce6236032f6e8f54ce3': '/media/landing/hub-requests.png',
  '60a21c95f5ece87c0a7657028a59d3c0': '/media/redesign/work-bentwalad.jpg',
  '22ee8190ae67c55cf00576c16162e287': '/media/redesign/work-weddings.jpg',
  '6895213b818d15b748dbc4f0602a0fb9': '/media/redesign/about-team.jpg',
  '15ec3fa6439e3bb5e1bdb565a3cf95f0': '/media/redesign/ad-monogram.png'
};

Object.assign(BLOBS, JSON.parse(fs.readFileSync(path.join(HERE, 'blobs-extra.json'), 'utf8')));
function localize(src) {
  let s = src;
  for (const [file, route] of Object.entries(ROUTES)) s = s.split(file).join(route);
  s = s.split('https://auradigitalworks.com/aura-weddings').join('/aura-weddings');
  for (const p of ['/shop/cards/', '/shop/cart', '/shop', '/account']) s = s.split('https://auradigitalworks.com' + p).join(p);
  s = s.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
    if (!BLOBS[id]) throw new Error('Unmapped asset ' + id);
    return BLOBS[id];
  });
  return s;
}

function toTree(nodes) {
  const out = [];
  for (const n of nodes) {
    if (n.type === 'text') { const t = n.data.replace(/\s+/g, ' '); if (t.trim()) out.push(t); }
    else if (n.type === 'tag' || n.type === 'script' || n.type === 'style') out.push([n.name, n.attribs, toTree(n.children || [])]);
  }
  return out;
}

const SHARED_CSS = fs.readFileSync(path.join(HERE, 'design', 'css.txt'), 'utf8').trim();
const SHARED_FONTS = fs.readFileSync(path.join(HERE, 'design', 'head.txt'), 'utf8').trim();
function parseDesign(name) {
  const raw = localize(fs.readFileSync(path.join(designDir, name + '.dc.html'), 'utf8'));
  const xdc = raw.slice(raw.indexOf('<x-dc>') + 6, raw.indexOf('</x-dc>'));
  // Design files share their stylesheet and font links through placeholders.
  const helmet = (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1]
    .replace('<!--CSS-->', () => SHARED_CSS).replace('<!--FONTS-->', () => SHARED_FONTS);
  const body = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const doc = parseDocument(body, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true, decodeEntities: true });
  const script = raw.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
  const title = (raw.match(/<title>([\s\S]*?)<\/title>/) || [, name])[1];
  return { name, helmet, tree: toTree(doc.children), script, title };
}

const designs = COMPONENTS.map(parseDesign);
// Wrap each page's sections (everything between the shared imports) in <main>
// so the AI knowledge index and screen readers find the page content.
for (const d of designs) {
  if (['Header', 'Footer', 'Auri'].includes(d.name)) continue;
  const root = d.tree.find((n) => Array.isArray(n));
  const kids = root[2];
  const first = kids.findIndex((n) => Array.isArray(n) && n[0] !== 'dc-import');
  let last = kids.length - 1; while (last >= 0 && !(Array.isArray(kids[last]) && kids[last][0] !== 'dc-import')) last--;
  root[2] = [...kids.slice(0, first), ['main', { id: 'main' }, kids.slice(first, last + 1)], ...kids.slice(last + 1)];
}

// 1) component module shared by Node (pre-render) and the browser bundle
const compSrc = "import { def } from './runtime.js';\n" + designs.map((d) =>
  `def(${JSON.stringify(d.name)}, ${JSON.stringify(d.tree)}, function (DCLogic) {\n${d.script}\nreturn Component;\n});`).join('\n\n');
fs.writeFileSync(path.join(HERE, 'components.gen.js'), compSrc);
fs.writeFileSync(path.join(HERE, 'entry.gen.js'), "import { h, hydrate } from 'preact';\nimport { registry } from './runtime.js';\nimport './components.gen.js';\nconst el = document.getElementById('app');\nconst C = el && registry[el.dataset.page];\nif (C) hydrate(h(C, {}), el);\nfor (const c of document.querySelectorAll('[data-chrome]')) { const K = registry[c.dataset.chrome]; if (K) hydrate(h(K, { active: c.dataset.active || 'none' }), c); }\n");

await esbuild({ entryPoints: [path.join(HERE, 'entry.gen.js')], bundle: true, minify: true, format: 'iife', target: ['es2019'], outfile: path.join(repoDir, 'redesign', 'app.js'), legalComments: 'none' });

// 2) pre-render each page in Node
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };
await import(pathToFileURL(path.join(HERE, 'components.gen.js')).href);
const css = designs.find((d) => d.name === 'Main').helmet;
const stripFonts = (x) => x.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
for (const [name, file, title, description] of PAGES) {
  const d = designs.find((x) => x.name === name);
  const html = renderToString(h(runtime.registry[name], {}));
  const extraCss = d.helmet.replace(css, '');
  const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description.replace(/"/g, '&quot;')}">
<meta name="theme-color" content="#0E2B1E">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
<meta property="og:image" content="https://auradigitalworks.com/auradigital-share-20260928.jpg">
<link rel="icon" href="/media/redesign/ad-icon-512.png">
<link rel="apple-touch-icon" href="/media/redesign/ad-icon-512.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/redesign/inter-tight-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/redesign/inter-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/redesign/fonts.css?v=${VERSION}">
${stripFonts(css).trim()}
${stripFonts(extraCss).trim()}
</head>
<body>
<div id="app" data-page="${name}">${html}</div>
<noscript><p style="font-family:Inter,sans-serif;padding:16px">WhatsApp +90 538 550 76 74 · info@auradigitalworks.com</p></noscript>
<script src="/redesign/app.js?v=${VERSION}" defer></script>
<script src="/redesign/i18n.js?v=${VERSION}" defer></script>
</body>
</html>
`;
  // Hand-maintained additions (e.g. a homepage promotion) live in tools/redesign/inject/<page>.{head,body-start,body-end}.html
  const inj = (part) => { const f = path.join(repoDir, 'tools', 'redesign', 'inject', file.replace(/\.html$/, '') + '.' + part + '.html'); return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() + '\n' : ''; };
  const finalPage = page.replace('</head>', () => inj('head') + '</head>').replace('<body>\n', () => '<body>\n' + inj('body-start')).replace('</body>', () => inj('body-end') + '</body>');
  fs.writeFileSync(path.join(repoDir, file), finalPage);
  console.log('built', file, (page.length / 1024).toFixed(0) + 'KB');
}
// 3) mount the shared header, footer and Auri on app-style pages (shop, NFC tools)
const SHELLS = [['shop/index.html', 'shop']];
const shellCss = stripFonts(css)
  .replace(/body\{margin:0;background:#FFFFFF\}/, '.ad-chrome{font-family:Inter,system-ui,sans-serif;line-height:1.55;color:#0B0F0C}')
  .replace(/(^|\n)a\{color:#0B0F0C;text-decoration:none\}/, '$1.ad-chrome a{color:#0B0F0C;text-decoration:none}')
  .replace(/section\{padding-left:18px !important;padding-right:18px !important;padding-top:64px !important\}/, '.ad-chrome section{padding-left:18px !important;padding-right:18px !important;padding-top:64px !important}')
  .replace('<style>', '<style data-ad-chrome>');
const chrome = (name, active) => `<div class="ad-chrome" data-chrome="${name}" data-active="${active}">${renderToString(h(runtime.registry[name], { active }))}</div>`;
const swap = (src, tag, html) => {
  const re = new RegExp(`<!--ad:${tag}-->[\\s\\S]*?<!--/ad:${tag}-->`);
  if (!re.test(src)) throw new Error('missing ad:' + tag + ' marker');
  return src.replace(re, () => `<!--ad:${tag}-->${html}<!--/ad:${tag}-->`);
};
for (const [file, active] of SHELLS) {
  const fp = path.join(repoDir, file);
  if (!fs.existsSync(fp)) continue;
  let src = fs.readFileSync(fp, 'utf8');
  src = swap(src, 'css', `\n<link rel="stylesheet" href="/redesign/fonts.css?v=${VERSION}">\n${shellCss.trim()}\n`);
  src = swap(src, 'header', chrome('Header', active));
  src = swap(src, 'footer', chrome('Footer', active) + chrome('Auri', active));
  src = swap(src, 'js', `<script src="/redesign/app.js?v=${VERSION}" defer></script><script src="/redesign/i18n.js?v=${VERSION}" defer></script>`);
  fs.writeFileSync(fp, src);
  console.log('chrome', file);
}
console.log('bundle', (fs.statSync(path.join(repoDir, 'redesign', 'app.js')).size / 1024).toFixed(0) + 'KB');
