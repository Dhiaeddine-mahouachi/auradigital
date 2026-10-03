import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../i18n.js',import.meta.url),'utf8');
function setup(search='',saved='tr'){
 const document={title:'AuraDigital',documentElement:{},body:{classList:{toggle(){}}},createTreeWalker:()=>({nextNode:()=>null}),querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}};
 const window={dispatchEvent(){}};
 const context={document,window,location:{search,href:'https://auradigitalworks.com/'+search},history:{state:null,replaceState(){}},NodeFilter:{SHOW_TEXT:4},URLSearchParams,URL,CustomEvent:class{},localStorage:{getItem:()=>saved,setItem(){}}};
 vm.runInNewContext(source,context);return context;
}
test('clean URLs start in English even when the browser previously saved Turkish',()=>{
 const c=setup();assert.equal(c.document.documentElement.lang,'en');assert.equal(c.window.AuraI18n.current(),'en');
 assert.equal(c.window.AuraI18n.translate('Hizmetler'),'Services');
});
test('English source strings can switch to Turkish and back without losing their translations',()=>{
 const c=setup();c.window.AuraI18n.setLanguage('tr');assert.equal(c.window.AuraI18n.translate('Services'),'Hizmetler');
 c.window.AuraI18n.setLanguage('en');assert.equal(c.window.AuraI18n.translate('Services'),'Services');
});
test('an explicitly selected language in the URL still takes precedence',()=>{
 assert.equal(setup('?lang=ar').document.documentElement.lang,'ar');assert.equal(setup('?lang=tr').document.documentElement.lang,'tr');
});
