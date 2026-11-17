import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  root: fileURLToPath(new URL('./marketing/', import.meta.url)),
  srcDir: fileURLToPath(new URL('./marketing/src/', import.meta.url)),
  outDir: fileURLToPath(new URL('./command-pages/', import.meta.url)),
  site: 'https://auradigitalworks.com',
  trailingSlash: 'never',
  build: { format: 'file', assets: 'static', assetsPrefix: '/command-pages' },
  vite: { plugins: [tailwind()], build: { assetsInlineLimit: 0 } },
});
