const copy = {
  en: ['Recent orders', 'Orders from this AuraDigital account across workspaces.', 'You have no orders yet.', 'Awaiting bank transfer', 'Cancelled', 'Awaiting artwork approval', 'In production', 'Shipped', 'Delivered', 'Payment verified', 'Check my orders', 'NFC fulfillment', 'No active card orders.', 'Browse cards', 'Request a quote', 'Service requests', 'Received', 'No requests have been submitted from this workspace.'],
  tr: ['Son siparişler', 'Bu AuraDigital hesabının tüm çalışma alanlarındaki siparişleri.', 'Henüz siparişiniz yok.', 'Havale bekleniyor', 'İptal edildi', 'Tasarım onayı bekleniyor', 'Üretimde', 'Gönderildi', 'Teslim edildi', 'Ödeme doğrulandı', 'Siparişlerimi kontrol et', 'NFC sipariş süreci', 'Aktif kart siparişiniz yok.', 'Kartlara göz at', 'Teklif iste', 'Hizmet talepleri', 'Alındı', 'Bu çalışma alanından henüz talep gönderilmedi.'],
  fr: ['Commandes récentes', 'Commandes de ce compte AuraDigital pour tous les espaces.', 'Vous n’avez encore aucune commande.', 'En attente du virement', 'Annulée', 'En attente de validation du visuel', 'En production', 'Expédiée', 'Livrée', 'Paiement vérifié', 'Consulter mes commandes', 'Suivi des cartes NFC', 'Aucune commande de cartes en cours.', 'Voir les cartes', 'Demander un devis', 'Demandes de service', 'Reçue', 'Aucune demande envoyée depuis cet espace.'],
  ar: ['الطلبات الأخيرة', 'طلبات حساب AuraDigital هذا عبر جميع مساحات العمل.', 'ليست لديك طلبات بعد.', 'بانتظار التحويل البنكي', 'ملغى', 'بانتظار اعتماد التصميم', 'قيد الإنتاج', 'تم الشحن', 'تم التسليم', 'تم التحقق من الدفع', 'تحقق من طلباتي', 'متابعة طلبات NFC', 'لا توجد طلبات بطاقات قيد التنفيذ.', 'تصفح البطاقات', 'اطلب عرض سعر', 'طلبات الخدمات', 'تم الاستلام', 'لم تُرسل أي طلبات من مساحة العمل هذه.'],
};

export function commerceCopy(lang) {
  const [orders, scope, empty, awaiting_transfer, cancelled, awaiting_artwork, in_production,
    shipped, delivered, paid, ask, fulfillment, noFulfillment, browse, quote, requests, received, noRequests] = copy[lang] || copy.en;
  return {
    orders, scope, empty, ask, fulfillment, noFulfillment, browse, quote, requests, received, noRequests,
    payment: { awaiting_transfer, cancelled, paid },
    production: { awaiting_artwork, in_production, shipped, delivered },
  };
}

export function orderMarkup(orders, lang, esc) {
  const labels = commerceCopy(lang);
  const items = orders.map(order => {
    const total = new Intl.NumberFormat(lang, { style: 'currency', currency: order.currency }).format(order.totalMinor / 100);
    const production = order.paymentStatus === 'paid' ? labels.production[order.productionStatus] : '';
    const status = [labels.payment[order.paymentStatus], production].filter(Boolean).join(' · ');
    return `<li><a href="/shop/orders/${encodeURIComponent(order.id)}"><bdi>${esc(order.reference)}</bdi></a><span>${esc(status)}</span><bdi>${esc(total)}</bdi></li>`;
  });
  return `<ul class="hub-order-list">${items.join('')}</ul>`;
}
