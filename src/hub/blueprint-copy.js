const copy={
 en:['Overview','Marketplace','Insights','Other way','Not relevant','Do later','I already have this','Use the original route','Evidence link or description','Submit for review','Under review','Verified','Needs new evidence','Verified outcomes','Next mission'],
 tr:['Genel bakış','Pazar yeri','İçgörüler','Başka bir yol','Uygun değil','Daha sonra','Buna zaten sahibim','İlk yola dön','Kanıt bağlantısı veya açıklaması','İncelemeye gönder','İnceleniyor','Doğrulandı','Yeni kanıt gerekli','Doğrulanan sonuçlar','Sonraki görev'],
 fr:['Vue d’ensemble','Marketplace','Analyses','Autre méthode','Non pertinent','Plus tard','Je l’ai déjà','Revenir à la méthode initiale','Lien ou description de la preuve','Envoyer pour examen','En cours d’examen','Vérifié','Nouvelle preuve requise','Résultats vérifiés','Prochaine mission'],
 ar:['نظرة عامة','السوق','الرؤى','طريقة أخرى','غير مناسب','لاحقًا','لديّ هذا بالفعل','الرجوع إلى الطريقة الأصلية','رابط أو وصف للدليل','إرسال للمراجعة','قيد المراجعة','تم التحقق','يلزم دليل جديد','النتائج المحققة','المهمة التالية'],
};
export const blueprintLabels=lang=>Object.fromEntries(['overview','marketplace','insights','alternative','irrelevant','later','proof','original','proofLabel','submit','pending','approved','rejected','verified','next'].map((key,i)=>[key,copy[lang][i]]));
