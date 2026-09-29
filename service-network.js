(() => {
  const section = document.querySelector('.service-network');
  if (!section) return;
  const map = section.querySelector('.network-map');
  const svg = section.querySelector('.network-wires');
  const hub = section.querySelector('.network-hub');
  const nodes = [...section.querySelectorAll('.network-node')];
  const NS = 'http://www.w3.org/2000/svg';
  const copy = {
    en: {eyebrow:'THE AURA ECOSYSTEM',title:'One studio. Every connection.',intro:'From the first search to the next customer. Explore the services that bring your business together.',web:['Websites','Built to convert'],ads:['Google Ads','Reach your customers'],social:['Social Media','Content that connects'],seo:['SEO','Get discovered'],menu:['AuraMenu','Your menu, online'],nfc:['NFC Cards','Connect in one tap'],automation:['WhatsApp Automation','Keep the conversation going']},
    tr: {eyebrow:'AURA EKOSİSTEMİ',title:'Tek stüdyo. Tüm bağlantılar.',intro:'İlk aramadan yeni müşteriye. İşletmenizi bir araya getiren hizmetleri keşfedin.',web:['Web Siteleri','Dönüşüm odaklı'],ads:['Google Ads','Müşterilerinize ulaşın'],social:['Sosyal Medya','Bağ kuran içerikler'],seo:['SEO','Daha kolay keşfedilin'],menu:['AuraMenu','Menünüz internette'],nfc:['NFC Kartlar','Tek dokunuşla bağlanın'],automation:['WhatsApp Otomasyonu','Sohbeti devam ettirin']},
    ar: {eyebrow:'منظومة AURA',title:'استوديو واحد. كل الروابط.',intro:'من أول بحث إلى العميل التالي. اكتشف الخدمات التي تربط أعمالك ببعضها.',web:['المواقع الإلكترونية','مصممة لتحقيق النتائج'],ads:['إعلانات Google','الوصول إلى عملائك'],social:['التواصل الاجتماعي','محتوى يصنع التواصل'],seo:['تحسين محركات البحث','يسهل العثور عليك'],menu:['AuraMenu','قائمتك على الإنترنت'],nfc:['بطاقات NFC','تواصل بلمسة واحدة'],automation:['أتمتة WhatsApp','استمرار المحادثة']}
  };
  function translate(lang) {
    const text = copy[lang] || copy.en;
    section.querySelectorAll('[data-network-copy]').forEach(el => { el.textContent = text[el.dataset.networkCopy]; });
    nodes.forEach(node => {
      const [label, detail] = text[node.dataset.service];
      node.querySelector('strong').textContent = label;
      node.querySelector('small').textContent = detail;
    });
  }
  let queued = 0;
  function draw() {
    queued = 0;
    const bounds = map.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const center = hub.getBoundingClientRect();
    const hx = center.left + center.width / 2 - bounds.left;
    const hy = center.top + center.height / 2 - bounds.top;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    svg.replaceChildren();
    nodes.forEach((node, i) => {
      const box = node.getBoundingClientRect();
      const x = box.left + box.width / 2 - bounds.left;
      const y = box.top + box.height / 2 - bounds.top;
      const dx = x - hx, dy = y - hy;
      const length = Math.hypot(dx, dy) || 1;
      const radius = center.width / 2 + 12;
      const sx = hx + dx / length * radius, sy = hy + dy / length * radius;
      const edge = Math.min(box.width / 2 / (Math.abs(dx) || 1), box.height / 2 / (Math.abs(dy) || 1));
      const ex = x - dx * edge, ey = y - dy * edge;
      const middle = (sy + ey) / 2;
      const path = `M ${sx} ${sy} C ${sx} ${middle}, ${ex} ${middle}, ${ex} ${ey}`;
      const group = document.createElementNS(NS, 'g');
      group.dataset.service = node.dataset.service;
      for (const cls of ['network-wire', 'network-signal']) {
        const wire = document.createElementNS(NS, 'path');
        wire.setAttribute('d', path); wire.setAttribute('pathLength', '100');
        wire.setAttribute('class', cls); wire.style.setProperty('--delay', `${-i * .8}s`);
        group.append(wire);
      }
      svg.append(group);
    });
  }
  function scheduleDraw() { if (!queued) queued = requestAnimationFrame(draw); }
  function focus(service) {
    map.classList.toggle('has-focus', Boolean(service));
    svg.querySelectorAll('g').forEach(g => g.classList.toggle('is-active', g.dataset.service === service));
  }
  nodes.forEach(node => {
    node.addEventListener('mouseenter', () => focus(node.dataset.service));
    node.addEventListener('mouseleave', () => focus(null));
    node.addEventListener('focus', () => focus(node.dataset.service));
    node.addEventListener('blur', () => focus(null));
  });
  window.addEventListener('aura:languagechange', e => { translate(e.detail.lang); scheduleDraw(); });
  translate(window.__auraLang || new URLSearchParams(location.search).get('lang') || 'en');
  if ('ResizeObserver' in window) new ResizeObserver(scheduleDraw).observe(map);
  else window.addEventListener('resize', scheduleDraw, {passive:true});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    section.classList.toggle('is-visible', entries[0].isIntersecting);
  }, {threshold:.1}).observe(section);
  else section.classList.add('is-visible');
  document.fonts?.ready.then(scheduleDraw);
  scheduleDraw();
})();
