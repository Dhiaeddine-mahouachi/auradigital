const states=['listening','thinking','working','typing','speaking','happy','success','error','evolving'];
const actions={
 en:['Listening','Preparing a reply…','Building your roadmap…','Building your roadmap…','Reply ready','Milestone verified','Roadmap saved','Auri could not finish the request','Auri evolved'],
 tr:['Dinliyor','Yanıt hazırlanıyor…','Yol haritası hazırlanıyor…','Yol haritası hazırlanıyor…','Yanıt hazır','Hedef doğrulandı','Yol haritası kaydedildi','Auri isteği tamamlayamadı','Auri gelişti'],
 fr:['À l’écoute','Préparation de la réponse…','Création de votre feuille de route…','Création de votre feuille de route…','Réponse prête','Objectif vérifié','Feuille de route enregistrée','Auri n’a pas pu traiter la demande','Auri a évolué'],
 ar:['يستمع','جارٍ تجهيز الرد…','جارٍ إعداد خارطة الطريق…','جارٍ إعداد خارطة الطريق…','الرد جاهز','تم التحقق من الإنجاز','تم حفظ خارطة الطريق','تعذر على أوري إكمال الطلب','تطوّر أوري'],
};
export const auriLabels=lang=>({...Object.fromEntries(states.map((state,i)=>[state,actions[lang][i]])),
 drafting:auriDraftCopy(lang).drafting,draft_ready:auriDraftCopy(lang).ready,
});
export const auriNames=['Awakening','Learning','Helper','Builder','Operator','Strategist','Aura Master'];

const controls={
 en:['AI Workspace','Hide companion','Show companion','Companion name','Ready to help','Stop voice','Companion hidden'],
 tr:['Yapay Zekâ Çalışma Alanı','Asistanı gizle','Asistanı göster','Asistanın adı','Yardıma hazır','Sesi durdur','Asistan gizli'],
 fr:['Espace de travail IA','Masquer le compagnon','Afficher le compagnon','Nom du compagnon','Prêt à aider','Arrêter la lecture','Compagnon masqué'],
 ar:['مساحة عمل الذكاء الاصطناعي','إخفاء الرفيق','إظهار الرفيق','اسم الرفيق','جاهز للمساعدة','إيقاف الصوت','الرفيق مخفي'],
};
export const auriControls=lang=>Object.fromEntries(['workspace','hide','show','name','ready','stop','hidden'].map((key,i)=>[key,controls[lang][i]]));

const draftCopy={
 en:['Draft customer follow-up','Preparing a follow-up draft…','Draft ready to review','Recent work','AI draft','Template draft','Saved for review'],
 tr:['Müşteri takip mesajı taslağı','Takip taslağı hazırlanıyor…','Taslak incelemeye hazır','Son çalışmalar','YZ taslağı','Şablon taslağı','İnceleme için kaydedildi'],
 fr:['Rédiger une relance client','Préparation du brouillon…','Brouillon à relire','Travaux récents','Brouillon IA','Brouillon à partir d’un modèle','Enregistré pour relecture'],
 ar:['إنشاء مسودة متابعة للعميل','جارٍ إعداد مسودة المتابعة…','المسودة جاهزة للمراجعة','العمل الأخير','مسودة بالذكاء الاصطناعي','مسودة من قالب','حُفظت للمراجعة'],
};
export const auriDraftCopy=lang=>Object.fromEntries(['create','drafting','ready','history','ai','template','review'].map((key,i)=>[key,draftCopy[lang][i]]));
