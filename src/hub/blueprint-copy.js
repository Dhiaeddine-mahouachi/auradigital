const copy={
 en:['Overview','Marketplace','Insights','Other way','Not relevant','Do later','I already have this','Use the original route','Evidence link or description','Submit for review','Under review','Verified','Needs new evidence','Verified outcomes','Next mission'],
 tr:['Genel bakış','Pazar yeri','İçgörüler','Başka bir yol','Uygun değil','Daha sonra','Buna zaten sahibim','İlk yola dön','Kanıt bağlantısı veya açıklaması','İncelemeye gönder','İnceleniyor','Doğrulandı','Yeni kanıt gerekli','Doğrulanan sonuçlar','Sonraki görev'],
 fr:['Vue d’ensemble','Marketplace','Analyses','Autre méthode','Non pertinent','Plus tard','Je l’ai déjà','Revenir à la méthode initiale','Lien ou description de la preuve','Envoyer pour examen','En cours d’examen','Vérifié','Nouvelle preuve requise','Résultats vérifiés','Prochaine mission'],
 ar:['نظرة عامة','السوق','الرؤى','طريقة أخرى','غير مناسب','لاحقًا','لديّ هذا بالفعل','الرجوع إلى الطريقة الأصلية','رابط أو وصف للدليل','إرسال للمراجعة','قيد المراجعة','تم التحقق','يلزم دليل جديد','النتائج المحققة','المهمة التالية'],
};
export const blueprintLabels=lang=>Object.fromEntries(['overview','marketplace','insights','alternative','irrelevant','later','proof','original','proofLabel','submit','pending','approved','rejected','verified','next'].map((key,i)=>[key,copy[lang][i]]));

const commandCopy={
 en:['Growth Vision','Continue roadmap','Zoom in','Zoom out','Reset zoom','Recommended','Available','Customer completed','Explore solutions','Your existing tools','Business performance','Connect a supported analytics source to see business performance.','Priority missions','Let’s build your business growth plan.'],
 tr:['Büyüme Haritası','Yol haritasına devam et','Yakınlaştır','Uzaklaştır','Yakınlaştırmayı sıfırla','Önerilen','Kullanılabilir','Müşteri tamamladı','Çözümleri keşfedin','Mevcut araçlarınız','İş performansı','İş performansını görmek için desteklenen bir analiz kaynağı bağlayın.','Öncelikli görevler','İşletmenizin büyüme planını oluşturalım.'],
 fr:['Vision de croissance','Poursuivre la feuille de route','Agrandir','Réduire','Réinitialiser le zoom','Recommandé','Disponible','Terminé par le client','Explorer les solutions','Vos outils existants','Performance de l’entreprise','Connectez une source d’analyse compatible pour consulter les performances.','Missions prioritaires','Créons le plan de croissance de votre entreprise.'],
 ar:['رؤية النمو','متابعة خارطة الطريق','تكبير','تصغير','إعادة ضبط التكبير','موصى به','متاح','أكمله العميل','استكشف الحلول','أدواتك الحالية','أداء النشاط التجاري','اربط مصدر تحليلات مدعومًا لعرض أداء النشاط التجاري.','المهام ذات الأولوية','لنضع خطة نمو نشاطك التجاري.'],
};
export const commandLabels=lang=>Object.fromEntries(['vision','continue','zoomIn','zoomOut','zoomReset','recommended','available','selfDone','solutions','tools','performance','connect','priorities','onboarding'].map((key,i)=>[key,commandCopy[lang][i]]));
