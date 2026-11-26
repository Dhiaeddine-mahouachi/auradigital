import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const output = await build({
  entryPoints: ['scripts/auri-parts-renderer.js'], bundle: true, format: 'iife',
  loader: { '.png': 'dataurl' }, write: false,
});
const temp = await mkdtemp(join(tmpdir(), 'auri-parts-'));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.AURI_CHROME || undefined,
    args: process.env.AURI_SOFTWARE_WEBGL === '1' ?
      ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] : [],
  });
  const page = await browser.newPage();
  await page.setContent('<!doctype html><meta charset="utf-8">');
  await page.addScriptTag({ content: output.outputFiles[0].text });
  const layers = await page.evaluate(() => window.renderAuriParts());
  await Promise.all(Object.entries(layers).map(([name, png]) => writeFile(join(temp, `${name}.png`), Buffer.from(png, 'base64'))));
  const result = spawnSync('python3', ['scripts/pack-auri-parts.py', temp], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Could not pack Auri artwork', { cause: result.error });
} finally {
  await browser?.close();
  await rm(temp, { recursive: true, force: true });
}
