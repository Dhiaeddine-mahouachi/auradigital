// AuraMenu load test (k6). Simulates diners scanning QR codes during a busy dinner service.
//
// Run against STAGING only:
//   k6 run -e BASE_URL=https://<your-staging-worker>.workers.dev -e SLUG=moka tools/loadtest/auramenu-k6.js
//
// Every request counts toward the Workers Free plan's 100,000 requests/day, and a full run
// sends roughly 20,000. Running it against production needs -e ALLOW_PRODUCTION=yes.
//
// Install k6: winget install k6 --source winget   (or https://grafana.com/docs/k6/latest/set-up/install-k6/)

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || '').replace(/\/$/, '');
const SLUGS = (__ENV.SLUG || 'moka').split(',').map((s) => s.trim()).filter(Boolean);
const PRODUCTION_HOSTS = ['auradigital.ink', 'www.auradigital.ink', 'auradigitalworks.com', 'www.auradigitalworks.com', 'auramenu.space', 'www.auramenu.space'];

if (!BASE_URL) throw new Error('Set BASE_URL, e.g. -e BASE_URL=https://auradigital-staging.example.workers.dev');
const host = BASE_URL.replace(/^https?:\/\//, '').split('/')[0];
if (PRODUCTION_HOSTS.includes(host) && __ENV.ALLOW_PRODUCTION !== 'yes') {
  throw new Error(`${host} is production. Use staging, or add -e ALLOW_PRODUCTION=yes if you really mean it.`);
}

export const options = {
  scenarios: {
    dinner_rush: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },   // tables filling up
        { duration: '3m', target: 60 },   // busy evening across many restaurants
        { duration: '1m', target: 120 },  // 10x spike
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],                      // under 1% errors
    'http_req_duration{kind:menu}': ['p(95)<800'],       // menu JSON under 0.8 s for 95% of scans
    'http_req_duration{kind:photo}': ['p(95)<1500'],
    'http_req_duration{kind:health}': ['p(95)<500'],
  },
};

const ORIGIN = { headers: { Origin: 'https://auramenu.space', Accept: 'application/json' } };

export default function () {
  const slug = SLUGS[Math.floor(Math.random() * SLUGS.length)];
  const menu = http.get(`${BASE_URL}/api/auramenu/sites/${slug}`, { ...ORIGIN, tags: { kind: 'menu' } });
  check(menu, {
    'menu 200': (r) => r.status === 200,
    'menu has categories': (r) => Array.isArray(r.json('menu.categories')),
  });

  // A diner's phone then loads the photos on screen (up to 4).
  const photos = [];
  try {
    for (const category of menu.json('menu.categories') || []) {
      for (const item of category.items || []) if (item.imageUrl) photos.push(item.imageUrl);
    }
  } catch { /* non-JSON response already failed the check above */ }
  for (const url of photos.slice(0, 4)) {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const photo = http.get(`${BASE_URL}${path}`, { tags: { kind: 'photo' } });
    check(photo, { 'photo 200': (r) => r.status === 200 });
  }

  if (__ITER % 20 === 0) {
    const health = http.get(`${BASE_URL}/api/health`, { tags: { kind: 'health' } });
    check(health, { 'health ok': (r) => r.status === 200 });
  }

  sleep(2 + Math.random() * 4); // a person reads the menu before the next scan
}
