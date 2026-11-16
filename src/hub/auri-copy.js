const states=['listening','thinking','working','typing','speaking','happy','success','error','evolving'];
const actions={
 en:['Listening','Preparing a reply…','Building your roadmap…','Building your roadmap…','Reply ready','Milestone verified','Roadmap saved','Auri could not finish the request','Auri evolved'],
 tr:['Dinliyor','Yanıt hazırlanıyor…','Yol haritası hazırlanıyor…','Yol haritası hazırlanıyor…','Yanıt hazır','Hedef doğrulandı','Yol haritası kaydedildi','Auri isteği tamamlayamadı','Auri gelişti'],
 fr:['À l’écoute','Préparation de la réponse…','Création de votre feuille de route…','Création de votre feuille de route…','Réponse prête','Objectif vérifié','Feuille de route enregistrée','Auri n’a pas pu traiter la demande','Auri a évolué'],
 ar:['يستمع','جارٍ تجهيز الرد…','جارٍ إعداد خارطة الطريق…','جارٍ إعداد خارطة الطريق…','الرد جاهز','تم التحقق من الإنجاز','تم حفظ خارطة الطريق','تعذر على أوري إكمال الطلب','تطوّر أوري'],
};
export const auriLabels=lang=>Object.fromEntries(states.map((state,i)=>[state,actions[lang][i]]));
export const auriNames=['Awakening','Learning','Helper','Builder','Operator','Strategist','Aura Master'];
