import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const revision = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(revision || '')) throw new Error('Pass the exact AuraMenu Git commit to preview.');

const output = resolve('.wrangler');
await mkdir(output, { recursive: true });
const preview = await mkdtemp(join(output, 'auramenu-staging-'));
const assets = join(preview, 'assets');
const repository = 'https://github.com/Dhiaeddine-mahouachi/auramenu.git';
execFileSync('git', ['init', '-q', assets]);
execFileSync('git', ['fetch', '--depth=1', repository, revision], { cwd: assets, stdio: 'inherit' });
execFileSync('git', ['checkout', '--detach', 'FETCH_HEAD'], { cwd: assets, stdio: 'inherit' });

async function replace(file, before, after) {
  const path = join(assets, file);
  const source = await readFile(path, 'utf8');
  if (!source.includes(before)) throw new Error('The expected staging setting changed in ' + file);
  await writeFile(path, source.replaceAll(before, after));
}
await replace('am2/signin.js', 'const ACCOUNTS = "https://auradigitalworks.com";', 'const ACCOUNTS = "https://growth-staging.auradigitalworks.com";');
await replace('config.js', 'publicBase: "https://auramenu.space"', 'publicBase: "https://staging.auramenu.space"');
await replace('am2/studio.js', 'auramenu.space/', 'staging.auramenu.space/');
await replace('studio.html', '<div class="st-top-actions">', '<div class="st-top-actions"><a class="am-btn am-btn--sm am-btn--ghost" href="https://growth-staging.auradigitalworks.com/hub/menu-drafts">AuraHub</a>');
await writeFile(join(assets, '.assetsignore'), '.git\n.git/**\n.github/**\ndocs/**\ntests/**\nnode_modules/**\n_redirects\n');

const worker = join(preview, 'worker.js');
await writeFile(worker, `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auramenu/')) return env.AURA_CORE.fetch(request);
    const asset = await env.ASSETS.fetch(url.pathname === '/' ? new Request(new URL('/index.html', url), request) : request);
    if (asset.status !== 404 || request.method !== 'GET' || !/^\\/[a-z0-9-]+\\/?$/.test(url.pathname)) return asset;
    if (asset.body) await asset.body.cancel();
    return env.ASSETS.fetch(new Request(new URL('/menu.html', url), request));
  }
};\n`);

await writeFile(join(output, 'auramenu-staging.json'), JSON.stringify({
  name: 'auramenu-growth-staging', main: worker, compatibility_date: '2026-11-27',
  workers_dev: false, preview_urls: false,
  routes: [{ pattern: 'staging.auramenu.space', custom_domain: true }],
  services: [{ binding: 'AURA_CORE', service: 'auradigital-growth-staging' }],
  assets: { directory: assets, binding: 'ASSETS', html_handling: 'none', run_worker_first: true },
}, null, 2) + '\n');
