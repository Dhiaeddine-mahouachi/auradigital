import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hubFixture } from './hub-fixture.mjs';

async function setup() {
 const f=await hubFixture();
 f.sqlite.exec(await readFile(new URL('../migrations/0005_ai_employee.sql',import.meta.url),'utf8'));
 const actor=await f.user('auri-guide@example.test',true);
 f.env.AI_RATE_LIMITER={async limit(){return {success:true};}};
 f.env.AI_PROVIDER='cloudflare';
 f.env.AI_MODEL='@cf/meta/llama-3.1-8b-instruct-fp8';
 return {f,actor};
}

test('Hub Ask Auri uses its configured Workers AI provider without Ollama',async()=>{
 const {f,actor}=await setup();
 try {
  let calls=0;
  f.env.AI={async run(){calls++;return {response:JSON.stringify({reply:'Start by making your business easy to find.',packageIds:['auramenu-managed']}),usage:{prompt_tokens:110,completion_tokens:28}};}};
  const response=await f.call('/api/hub/onboarding/guide',actor,'POST',{question:'What should I do first?',lang:'en'});
  assert.equal(response.status,200,await response.clone().text());
  const data=await response.json();
  assert.match(data.reply,/business easy to find/i);
  assert.equal(calls,1);
  assert.equal(data.currency,'TRY');
  assert.equal(data.packages[0].id,'auramenu-managed');
  assert(Number.isFinite(data.packages[0].price));
  assert.equal((await f.DB.prepare('SELECT input_tokens FROM ai_usage').first()).input_tokens,110);
 } finally { f.sqlite.close(); }
});

test('Hub Ask Auri fails over to Workers AI when configured Ollama is down',async t=>{
 const {f,actor}=await setup();
 try {
  f.env.HUB_OLLAMA_URL='https://ollama.example.test/api/chat';
  f.env.HUB_OLLAMA_MODEL='test';
  let attempts=0,workersCalls=0;
  t.mock.method(globalThis,'fetch',async url=>{
   assert.equal(String(url),'https://ollama.example.test/api/chat');
   attempts++;
   return new Response('Unavailable',{status:503});
  });
  f.env.AI={async run(){workersCalls++;return {response:JSON.stringify({reply:'Start with an easy contact channel.',packageIds:[]}),usage:{prompt_tokens:90,completion_tokens:15}};}};
  const response=await f.call('/api/hub/onboarding/guide',actor,'POST',{question:'Where should I start?',lang:'en'});
  assert.equal(response.status,200,await response.clone().text());
  assert.equal((await response.json()).reply,'Start with an easy contact channel.');
  assert(attempts>=1);
  assert.equal(workersCalls,1);
 } finally { f.sqlite.close(); }
});

test('Hub Ask Auri returns a controlled error if neither provider is available',async()=>{
 const {f,actor}=await setup();
 try{
  delete f.env.AI;
  const response=await f.call('/api/hub/onboarding/guide',actor,'POST',{question:'Hello',lang:'en'});
  assert.equal(response.status,503);
 }finally{ f.sqlite.close(); }
});

test('Hub Ask Auri uses the site Workers AI fallback when the main provider is unconfigured Ollama',async()=>{
 const {f,actor}=await setup();
 try{
  Object.assign(f.env,{AI_PROVIDER:'ollama',AI_MODEL:'gpt-oss:20b',AI_FALLBACK_PROVIDER:'cloudflare',AI_FALLBACK_MODEL:'@cf/meta/llama-3.1-8b-instruct-fp8'});
  let model;
  f.env.AI={async run(name){model=name;return {response:JSON.stringify({reply:'Start with a clear website.',packageIds:[]}),usage:{prompt_tokens:50,completion_tokens:10}};}};
  const response=await f.call('/api/hub/onboarding/guide',actor,'POST',{question:'Hello',lang:'en'});
  assert.equal(response.status,200,await response.clone().text());
  assert.equal(model,'@cf/meta/llama-3.1-8b-instruct-fp8');
 }finally{ f.sqlite.close(); }
});
