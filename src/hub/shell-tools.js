import { hubIcon } from './hub-navigation.js';

const copy = {
  en: ['Search workspace pages','Notifications','Search','No matching pages','Close','Loading updates','List','Board','Request progress','Current status','Roadmap, requests, and service delivery in one place.'],
  fr: ['Rechercher des pages','Notifications','Rechercher','Aucun résultat','Fermer','Chargement des mises à jour','Liste','Tableau','Suivi de la demande','Statut actuel','Feuille de route, demandes et livraisons au même endroit.'],
  tr: ['Çalışma alanında ara','Bildirimler','Ara','Sonuç bulunamadı','Kapat','Güncellemeler yükleniyor','Liste','Pano','Talep ilerlemesi','Mevcut durum','Yol haritası, talepler ve hizmet teslimi tek yerde.'],
  ar: ['ابحث في صفحات مساحة العمل','الإشعارات','بحث','لا توجد نتائج','إغلاق','جار تحميل التحديثات','قائمة','لوحة','تقدم الطلب','الحالة الحالية','خارطة الطريق والطلبات وتسليم الخدمات في مكان واحد.'],
};
export const shellCopy = lang => copy[lang] || copy.en;

export function shellTools(labels, esc) {
  const [search,notifications,placeholder,,close]=labels;
  return `<div class="hub-tools">
    <button type="button" class="hub-tool" data-open-hub-panel="search" aria-label="${esc(search)}" aria-haspopup="dialog">${hubIcon('search')}</button>
    <button type="button" class="hub-tool" data-open-hub-panel="alerts" aria-label="${esc(notifications)}" aria-haspopup="dialog">${hubIcon('bell')}</button>
    <dialog class="hub-dialog" id="hub-search" aria-labelledby="hub-search-title"><header><h2 id="hub-search-title">${esc(search)}</h2><form method="dialog"><button class="hub-tool" aria-label="${esc(close)}">${hubIcon('close')}</button></form></header><label class="field"><span class="sr-only">${esc(search)}</span><input type="search" placeholder="${esc(placeholder)}" autofocus></label><div class="hub-work-rows" data-results></div></dialog>
    <dialog class="hub-dialog" id="hub-alerts" aria-labelledby="hub-alerts-title"><header><h2 id="hub-alerts-title">${esc(notifications)}</h2><form method="dialog"><button class="hub-tool" aria-label="${esc(close)}" autofocus>${hubIcon('close')}</button></form></header><div class="hub-work-rows" data-results aria-live="polite"></div></dialog>
  </div>`;
}

export function bindShellTools({labels, navItem, pages, loadAttention, renderAttention, esc, empty}) {
  const search = document.querySelector('#hub-search');
  const input = search.querySelector('input');
  const results = search.querySelector('[data-results]');
  const alerts = document.querySelector('#hub-alerts');
  const updates = alerts.querySelector('[data-results]');
  function searchPages() {
    const query = input.value.trim().toLocaleLowerCase();
    const matches = pages.filter(([, label]) => label.toLocaleLowerCase().includes(query));
    results.innerHTML = matches.map(([key]) => navItem(key)).join('') || `<p role="status">${esc(labels[3])}</p>`;
  }
  input.addEventListener('input', searchPages);
  document.querySelector('[data-open-hub-panel=search]').addEventListener('click', () => {
    input.value = '';
    searchPages();
    search.showModal();
  });
  document.querySelector('[data-open-hub-panel=alerts]').addEventListener('click', async () => {
    alerts.showModal();
    updates.innerHTML = `<p role="status">${esc(labels[5])}</p>`;
    try {
      const records = await loadAttention();
      if (updates.isConnected) updates.innerHTML = records.map(renderAttention).join('') || `<p>${esc(empty)}</p>`;
    } catch(error) {
      if (updates.isConnected) updates.innerHTML = `<p role="alert">${esc(error.message)}</p>`;
    }
  });
}
