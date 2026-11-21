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
