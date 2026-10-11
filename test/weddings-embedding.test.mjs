import test from 'node:test';
import assert from 'node:assert/strict';
import {secureResponse} from '../src/security-policy.js';
test('invitation HTML permits same-origin studio embedding while unrelated routes stay protected',()=>{
 const html=()=>new Response('<!doctype html>',{headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'; frame-ancestors 'none'",'X-Frame-Options':'DENY'}});
 for(const path of ['/weddings/preview.html','/weddings/royal-ivory.html']){const response=secureResponse(html(),new Request(`https://auradigitalworks.com${path}`),{},{});assert.equal(response.headers.get('X-Frame-Options'),'SAMEORIGIN');assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'self'/);assert.match(response.headers.get('Content-Security-Policy'),/frame-src 'self' https:\/\/www.google.com/)}
 for(const path of ['/admin/index.html','/contact','/aura-weddings','/weddings/personalization.js','/weddings/../admin/index.html']){const response=secureResponse(html(),new Request(`https://auradigitalworks.com${path}`),{},{});assert.equal(response.headers.get('X-Frame-Options'),'DENY');assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/)}
 const response=secureResponse(new Response('Not found',{status:404,headers:{'Content-Type':'text/html'}}),new Request('https://auradigitalworks.com/weddings/missing.html'),{},{});assert.equal(response.headers.get('X-Frame-Options'),'DENY');
});
