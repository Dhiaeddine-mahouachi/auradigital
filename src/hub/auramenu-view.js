// AuraHub → AuraMenu: the same menus the account sees in AuraMenu Studio (owner and staff roles).
const copy = {
  en: { title: 'AuraMenu', intro: 'Your restaurant menus and the menus you help manage.', empty: 'No AuraMenu menus on this account yet. Menus you open in AuraMenu Studio while signed in appear here.', create: 'Create a menu', open: 'Open in Studio', view: 'View menu', roles: { owner: 'Owner', manager: 'Manager', editor: 'Editor' }, live: 'Live', waiting: 'Waiting for approval', unpaid: 'Waiting for payment', error: 'Your menus could not be loaded. Try again.' },
  tr: { title: 'AuraMenu', intro: 'Restoran menülerin ve yönetmene yardım ettiğin menüler.', empty: 'Bu hesapta henüz AuraMenu menüsü yok. Giriş yapmışken AuraMenu Studio’da açtığın menüler burada görünür.', create: 'Menü oluştur', open: 'Studio’da aç', view: 'Menüyü gör', roles: { owner: 'Sahip', manager: 'Yönetici', editor: 'Editör' }, live: 'Yayında', waiting: 'Onay bekliyor', unpaid: 'Ödeme bekliyor', error: 'Menüler yüklenemedi. Tekrar dene.' },
  fr: { title: 'AuraMenu', intro: 'Vos menus de restaurant et ceux que vous aidez à gérer.', empty: 'Aucun menu AuraMenu sur ce compte. Les menus ouverts dans AuraMenu Studio en étant connecté apparaissent ici.', create: 'Créer un menu', open: 'Ouvrir dans Studio', view: 'Voir le menu', roles: { owner: 'Propriétaire', manager: 'Gérant', editor: 'Éditeur' }, live: 'En ligne', waiting: 'En attente de validation', unpaid: 'En attente de paiement', error: 'Impossible de charger vos menus. Réessayez.' },
  ar: { title: 'AuraMenu', intro: 'قوائم مطعمك والقوائم التي تساعد في إدارتها.', empty: 'لا توجد قوائم AuraMenu في هذا الحساب بعد. القوائم التي تفتحها في استوديو AuraMenu بعد تسجيل الدخول تظهر هنا.', create: 'أنشئ قائمة', open: 'افتح في الاستوديو', view: 'عرض القائمة', roles: { owner: 'المالك', manager: 'مدير', editor: 'محرر' }, live: 'منشورة', waiting: 'بانتظار الموافقة', unpaid: 'بانتظار الدفع', error: 'تعذر تحميل القوائم. حاول مجدداً.' },
};
const MENU_SITE = 'https://auramenu.space';

export async function renderAuraMenus({ host, lang, esc }) {
  const c = copy[lang] || copy.en;
  host.innerHTML = `<section class="os-card"><p class="os-muted">${esc(c.intro)}</p><div id="am-list" aria-busy="true">…</div></section>`;
  const list = host.querySelector('#am-list');
  let data;
  try {
    const response = await fetch('/api/auramenu/hub/menus', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error(String(response.status));
    data = await response.json();
  } catch { list.removeAttribute('aria-busy'); list.innerHTML = `<p class="os-muted" role="alert">${esc(c.error)}</p>`; return; }
  list.removeAttribute('aria-busy');
  const studio = String(data.studio || MENU_SITE + '/studio.html');
  const langParam = ['tr', 'en', 'ar', 'fr'].includes(lang) ? lang : 'tr';
  const create = `<a class="os-btn is-primary is-sm" href="${esc(`${MENU_SITE}/builder.html?lang=${langParam}`)}">${esc(c.create)}</a>`;
  if (!data.menus?.length) { list.innerHTML = `<p class="os-muted">${esc(c.empty)}</p><div class="os-inline-actions">${create}</div>`; return; }
  const state = m => (m.status === 'approved' && m.paymentStatus === 'paid') ? c.live : m.paymentStatus !== 'paid' && m.status === 'approved' ? c.unpaid : c.waiting;
  list.innerHTML = `<ul class="am-hub-menus" style="list-style:none;margin:16px 0;padding:0;display:grid;gap:12px">${data.menus.map(m => `
    <li class="os-card" style="margin:0;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
      <div style="min-width:0"><strong>${esc(m.businessName || m.slug)}</strong>
        <div class="os-muted" style="font-size:13px">${esc(c.roles[m.role] || m.role)} · ${esc(state(m))} · auramenu.space/${esc(m.slug)}</div></div>
      <div class="os-inline-actions">
        <a class="os-btn is-quiet is-sm" href="${esc(`${MENU_SITE}/${encodeURIComponent(m.slug)}`)}" target="_blank" rel="noopener">${esc(c.view)}</a>
        <a class="os-btn is-primary is-sm" href="${esc(`${studio}?id=${encodeURIComponent(m.id)}&lang=${langParam}`)}">${esc(c.open)}</a>
      </div></li>`).join('')}</ul><div class="os-inline-actions">${create.replace('is-primary', 'is-quiet')}</div>`;
}
