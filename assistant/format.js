// Render a small Markdown subset through DOM nodes, never model-authored HTML.
export function safeLink(value,base='https://auradigitalworks.com') {
 try {
  const url=new URL(value,base);
  if(url.protocol!=='https:'||url.username||url.password||!['auradigitalworks.com','www.auradigitalworks.com','auramenu.space','aurapops.online','wa.me'].includes(url.hostname))return null;
  return url.href;
 }catch{return null;}
}
export function renderMessage(text) {
 const p=document.createElement('p');
 const parts=String(text).split(/(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^\s)]+\))/g);
 for(const part of parts){
  if(part.startsWith('**')&&part.endsWith('**')){const strong=document.createElement('strong');strong.textContent=part.slice(2,-2);p.append(strong);continue;}
  const match=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/),href=match&&safeLink(match[2]);
  if(href){const a=document.createElement('a');a.textContent=match[1];a.href=href;a.rel='noopener noreferrer';p.append(a);}
  else p.append(document.createTextNode(part));
 }
 return p;
}
