import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, tariff, aiConfigured } from '../src/ai-provider.js';

const messages = [{ role: 'system', content: 'sys' }, { role: 'user', content: JSON.stringify({ message: 'hi', approvedPackages: [] }) }];
const cfReply = { response: JSON.stringify({ reply: 'Hello from Workers AI', intent: 'discovery', memory: {}, selection: null }), usage: { prompt_tokens: 10, completion_tokens: 5 } };

test('ollama counts as a configured provider (previously ignored)', () => {
  assert.equal(aiConfigured({ AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b' }), true);
  assert.equal(aiConfigured({ AI_PROVIDER: 'cloudflare', AI_MODEL: '@cf/meta/llama-3.1-8b-instruct-fp8' }), true);
  assert.equal(aiConfigured({}), false);
});

test('ollama tariff works without manual rates and budgets against the fallback', () => {
  const t = tariff({ AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b', AI_FALLBACK_PROVIDER: 'cloudflare' });
  assert.equal(t.output, 0.287);
  assert.ok(tariff({ AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b' }).max > 0);
});

test('falls back to Workers AI when the Ollama host is not configured', async () => {
  const env = { AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b', AI_FALLBACK_PROVIDER: 'cloudflare', AI: { run: async () => cfReply } };
  const out = await generate(env, messages, 'req-fallback-000000001');
  assert.equal(out.result.reply, 'Hello from Workers AI');
  assert.equal(out.fallback, true);
});

test('falls back when the Ollama host is down', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('down', { status: 502 });
  try {
    const env = { AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b', AI_BASE_URL: 'https://ollama.example.com/api/chat', AI_PRIMARY_TIMEOUT_MS: '4000', AI_FALLBACK_PROVIDER: 'cloudflare', AI: { run: async () => cfReply } };
    const out = await generate(env, messages, 'req-fallback-000000002');
    assert.equal(out.result.reply, 'Hello from Workers AI');
  } finally { globalThis.fetch = realFetch; }
});

test('uses Ollama when it is healthy', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ message: { content: JSON.stringify({ reply: 'Hello from Ollama', intent: 'discovery', memory: {}, selection: null }) }, prompt_eval_count: 8, eval_count: 4 });
  try {
    const env = { AI_PROVIDER: 'ollama', AI_MODEL: 'llama3.1:8b', AI_BASE_URL: 'https://ollama.example.com/api/chat', AI_FALLBACK_PROVIDER: 'cloudflare', AI: { run: async () => cfReply } };
    const out = await generate(env, messages, 'req-fallback-000000003');
    assert.equal(out.result.reply, 'Hello from Ollama');
    assert.notEqual(out.fallback, true);
  } finally { globalThis.fetch = realFetch; }
});

import { ollamaEndpoint, OLLAMA_CLOUD_CHAT } from '../src/ai-provider.js';

test('Ollama endpoint accepts a host, the API root or the full chat URL', () => {
  assert.equal(String(ollamaEndpoint({ AI_BASE_URL: 'https://ollama.com' })), OLLAMA_CLOUD_CHAT);
  assert.equal(String(ollamaEndpoint({ AI_BASE_URL: 'https://ollama.com/api/' })), OLLAMA_CLOUD_CHAT);
  assert.equal(String(ollamaEndpoint({ AI_BASE_URL: 'https://gpu.example.com/api/chat' })), 'https://gpu.example.com/api/chat');
  assert.equal(ollamaEndpoint({ AI_BASE_URL: 'http://localhost:11434' }), null);
  assert.equal(ollamaEndpoint({}), null);
});

test('an Ollama Cloud API key alone selects ollama.com with bearer auth and short thinking', async () => {
  const realFetch = globalThis.fetch; let seen;
  globalThis.fetch = async (url, init) => { seen = { url: String(url), auth: init.headers.Authorization, body: JSON.parse(init.body) }; return Response.json({ message: { content: JSON.stringify({ reply: 'Hello from Ollama Cloud' }) }, prompt_eval_count: 5, eval_count: 3 }); };
  try {
    const out = await generate({ AI_PROVIDER: 'ollama', AI_MODEL: 'gpt-oss:20b', OLLAMA_API_KEY: 'k-test' }, messages, 'req-cloud-000000001');
    assert.equal(out.result.reply, 'Hello from Ollama Cloud');
    assert.equal(seen.url, OLLAMA_CLOUD_CHAT);
    assert.equal(seen.auth, 'Bearer k-test');
    assert.equal(seen.body.think, 'low');
    assert.equal(seen.body.stream, false);
  } finally { globalThis.fetch = realFetch; }
});

test('Ollama Cloud without a key falls back instead of sending an unauthenticated call', async () => {
  const realFetch = globalThis.fetch; let called = false;
  globalThis.fetch = async () => { called = true; return new Response('', { status: 401 }); };
  try {
    const env = { AI_PROVIDER: 'ollama', AI_MODEL: 'gpt-oss:20b', AI_BASE_URL: 'https://ollama.com', AI_FALLBACK_PROVIDER: 'cloudflare', AI: { run: async () => cfReply } };
    const out = await generate(env, messages, 'req-cloud-000000002');
    assert.equal(out.result.reply, 'Hello from Workers AI');
    assert.equal(called, false);
  } finally { globalThis.fetch = realFetch; }
});

import { aiConnectionCheck } from '../src/ai-employee.js';

test('admin connection check names settings without values and explains failures', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"error":"unauthorized"}', { status: 401 });
  try {
    const misnamed = await aiConnectionCheck({ AI_PROVIDER: 'ollama', AI_MODEL: 'gpt-oss:20b', AURI_OLLAMA_SECRET: 'secret-value', AI_FALLBACK_PROVIDER: 'cloudflare', AI: { run: async () => { throw new Error('4006: daily free allocation exceeded'); } }, DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) } });
    assert.equal(misnamed.settings.ollamaKeyFound, false);
    assert.ok(misnamed.settings.settingNames.includes('AURI_OLLAMA_SECRET'));
    assert.doesNotMatch(JSON.stringify(misnamed), /secret-value/);
    assert.match(misnamed.result.ollama.reason, /OLLAMA_API_KEY/);
    assert.match(misnamed.result.workersAI.detail, /daily free allocation/);
    const rejected = await aiConnectionCheck({ AI_PROVIDER: 'ollama', AI_MODEL: 'gpt-oss:20b', OLLAMA_API_KEY: 'k', DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) } });
    assert.equal(rejected.result.ollama.status, 401);
    assert.match(rejected.result.ollama.reason, /rejected the key/);
  } finally { globalThis.fetch = realFetch; }
});
