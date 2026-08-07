(function () {
  const rows = [
    [
      "AuraDigital — Web, Reklam, NFC & QR Menü",
      "AuraDigital — Web, Ads, NFC & QR Menu",
      "AuraDigital — المواقع والإعلانات وNFC وقوائم QR",
    ],
    [
      "Hizmetler — AuraDigital",
      "Services — AuraDigital",
      "الخدمات — AuraDigital",
    ],
    [
      "NFC Akıllı Kartlar — AuraDigital",
      "NFC Smart Cards — AuraDigital",
      "بطاقات NFC الذكية — AuraDigital",
    ],
    [
      "QR Dijital Menü — AuraDigital",
      "QR Digital Menu — AuraDigital",
      "قائمة QR الرقمية — AuraDigital",
    ],
    [
      "Paketler & Abonelikler — AuraDigital",
      "Packages & Subscriptions — AuraDigital",
      "الباقات والاشتراكات — AuraDigital",
    ],
    ["Hakkımızda — AuraDigital", "About — AuraDigital", "من نحن — AuraDigital"],
    [
      "İletişim — AuraDigital",
      "Contact — AuraDigital",
      "تواصل معنا — AuraDigital",
    ],
    [
      "Sayfa Bulunamadı — AuraDigital",
      "Page Not Found — AuraDigital",
      "الصفحة غير موجودة — AuraDigital",
    ],
    ["Ana Sayfa", "Home", "الرئيسية"],
    ["Hizmetler", "Services", "الخدمات"],
    ["Paketler", "Packages", "الباقات"],
    ["Hakkımızda", "About", "من نحن"],
    ["İletişim", "Contact", "تواصل معنا"],
    ["Şirket", "Company", "الشركة"],
    ["Başlayalım", "Let's start", "لنبدأ"],
    ["Abonelikler", "Subscriptions", "الاشتراكات"],
    ["NFC Kartlar", "NFC Cards", "بطاقات NFC"],
    ["Sık Sorulanlar", "FAQ", "الأسئلة الشائعة"],
    ["Projenizi Konuşalım", "Let's Talk", "لنتحدث عن مشروعك"],
    ["Menüyü aç", "Open menu", "فتح القائمة"],
    ["Dil", "Language", "اللغة"],
    ["AuraDigital ana sayfa", "AuraDigital home", "صفحة AuraDigital الرئيسية"],
    ["QR Menü", "QR Menu", "قائمة QR"],
    ["Ücretsiz ön görüşme →", "Free consultation →", "استشارة مجانية ←"],
    ["Ücretsiz ön görüşme ↗", "Free consultation ↗", "استشارة مجانية ↗"],
    [
      "© 2026 AuraDigital. Tüm hakları saklıdır.",
      "© 2026 AuraDigital. All rights reserved.",
      "© 2026 AuraDigital. جميع الحقوق محفوظة.",
    ],
    ["İstanbul · Türkiye", "Istanbul · Turkey", "إسطنبول · تركيا"],
    ["Fiyat periyodu", "Billing period", "فترة التسعير"],
    ["/ Hizmetler", "/ Services", "/ الخدمات"],
    ["/ NFC", "/ NFC", "/ NFC"],
    ["/ QR Menü", "/ QR Menu", "/ قائمة QR"],
    ["/ Paketler", "/ Packages", "/ الباقات"],
    ["/ Hakkımızda", "/ About", "/ من نحن"],
    ["/ İletişim", "/ Contact", "/ تواصل معنا"],
    [
      "Web tasarımından reklam yönetimine, NFC deneyimlerinden QR menülere kadar markanızın dijital sistemini tek bir profesyonel ekip gibi kuruyoruz.",
      "From web design and advertising to NFC experiences and QR menus, we build your brand's digital system as one professional team.",
      "من تصميم المواقع والإعلانات إلى تجارب NFC وقوائم QR، نبني النظام الرقمي لعلامتك كفريق احترافي واحد.",
    ],
    [
      "Dijital Growth Studio · İstanbul",
      "Digital Growth Studio · Istanbul",
      "استوديو نمو رقمي · إسطنبول",
    ],
    [
      "Dijitalde daha iyi görün.",
      "Look better online.",
      "اظهر بصورة أفضل رقمياً.",
    ],
    ["Daha iyi büyü.*", "Grow better.*", "وانمُ بشكل أفضل.*"],
    [
      "*Web, reklam, içerik, NFC ve QR deneyimlerini tek bir sistemde birleştirip işletmenizin müşteriye daha net ulaşmasını sağlıyoruz.",
      "*We bring web, advertising, content, NFC and QR experiences into one system so your business can reach customers more clearly.",
      "*نجمع الموقع والإعلانات والمحتوى وتجارب NFC وQR في نظام واحد حتى يصل نشاطك إلى العملاء بصورة أوضح.",
    ],
    [
      "Projenizi konuşalım",
      "Let's talk about your project",
      "لنتحدث عن مشروعك",
    ],
    ["Çözümleri keşfet", "Explore solutions", "اكتشف الحلول"],
    ["Tek dijital partner", "One digital partner", "شريك رقمي واحد"],
    [
      "Strategy · Creative · Technology · Growth",
      "Strategy · Creative · Technology · Growth",
      "الاستراتيجية · الإبداع · التقنية · النمو",
    ],
    [
      "Ekibinizle yan yana çalışıyor, dijital tarafta ihtiyacınız olan yapıyı kuruyor ve büyümeyi birlikte takip ediyoruz.",
      "We work alongside your team, build the digital structure you need and track growth together.",
      "نعمل إلى جانب فريقك، ونبني الهيكل الرقمي الذي تحتاجه، ونتابع النمو معاً.",
    ],
    ["Aşağı kaydır ↓", "Scroll down ↓", "مرر للأسفل ↓"],
    ["Web · Local business", "Web · Local business", "موقع · نشاط محلي"],
    ["Web · Automotive", "Web · Automotive", "موقع · سيارات"],
    ["Web · Visual commerce", "Web · Visual commerce", "موقع · تجارة بصرية"],
    [
      "QR · Restaurant experience",
      "QR · Restaurant experience",
      "QR · تجربة المطاعم",
    ],
    ["Markanız için", "For your brand", "لعلامتك التجارية"],
    ["tek bir dijital sistem.", "one digital system.", "نظام رقمي واحد."],
    [
      "Web siteniz, reklamlarınız, sosyal medya görünümünüz, NFC temas noktalarınız ve QR menünüz birbirinden kopuk olmamalı. Hepsini aynı strateji, aynı kalite ve aynı hedef altında birleştiriyoruz.",
      "Your website, ads, social presence, NFC touchpoints and QR menu should work together. We connect them under one strategy, one quality standard and one goal.",
      "يجب أن يعمل موقعك وإعلاناتك وحضورك على وسائل التواصل ونقاط NFC وقائمة QR كنظام واحد. نوحّدها تحت استراتيجية وجودة وهدف واحد.",
    ],
    ["Ücretsiz ön görüşme", "Free consultation", "استشارة مجانية"],
    ["Neler yapıyoruz?", "What we do", "ماذا نقدم؟"],
    ["Aura standardı", "The Aura standard", "معيار Aura"],
    [
      "Strateji + Tasarım + Uygulama",
      "Strategy + Design + Execution",
      "استراتيجية + تصميم + تنفيذ",
    ],
    [
      "Gösterişli bir site değil; müşteriyi yönlendiren, markaya güven kazandıran ve satış sürecinizi destekleyen bir sistem kuruyoruz.",
      "Not just a flashy website — we build a system that guides customers, builds trust and supports your sales process.",
      "لا نبني مجرد موقع جذاب؛ بل نظاماً يوجّه العملاء ويعزز الثقة ويدعم عملية البيع.",
    ],
    ["Keşfet", "Explore", "اكتشف"],
    [
      "Tek ekip, tutarlı marka dili",
      "One team, consistent brand voice",
      "فريق واحد وهوية متناسقة",
    ],
    [
      "Her ekranda güçlü deneyim",
      "Strong on every screen",
      "تجربة قوية على كل شاشة",
    ],
    [
      "Fizikselden dijitale tek dokunuş",
      "One tap from physical to digital",
      "لمسة واحدة من الواقع إلى الرقمي",
    ],
    [
      "Yayın sonrası devam eden destek",
      "Ongoing post-launch support",
      "دعم مستمر بعد الإطلاق",
    ],
    ["Hizmet ekosistemi", "Service ecosystem", "منظومة الخدمات"],
    ["İhtiyacınız neyse,", "Whatever you need,", "مهما كان احتياجك،"],
    [
      "aynı kalite çizgisinde.",
      "with the same quality standard.",
      "بنفس معيار الجودة.",
    ],
    [
      "Bir web sitesinden fazlasını kuruyoruz. Müşterinin sizi bulduğu, tanıdığı, güvendiği ve harekete geçtiği tüm dijital temas noktalarını birlikte tasarlıyoruz.",
      "We build more than a website. We design every digital touchpoint where customers find you, understand you, trust you and take action.",
      "نبني أكثر من مجرد موقع. نصمم كل نقطة رقمية يجدك فيها العميل ويتعرف عليك ويثق بك ويتخذ الإجراء.",
    ],
    ["Web & Landing Pages", "Web & Landing Pages", "المواقع وصفحات الهبوط"],
    [
      "Hızlı, mobil uyumlu, dönüşüm odaklı kurumsal siteler ve landing page'ler.",
      "Fast, mobile-first corporate websites and conversion-focused landing pages.",
      "مواقع سريعة ومتجاوبة وصفحات هبوط مصممة للتحويل.",
    ],
    ["Detayları gör →", "See details →", "عرض التفاصيل ←"],
    ["Ads & Growth", "Ads & Growth", "الإعلانات والنمو"],
    [
      "Meta ve Google reklamları, kampanya kurgusu, takip ve sürekli optimizasyon.",
      "Meta and Google ads, campaign strategy, tracking and continuous optimization.",
      "إعلانات Meta وGoogle، استراتيجية الحملات، التتبع والتحسين المستمر.",
    ],
    ["Growth hizmetleri →", "Growth services →", "خدمات النمو ←"],
    ["Social & Content", "Social & Content", "التواصل والمحتوى"],
    [
      "Sosyal medya yönetimi, yaratıcı içerik, marka dili ve performans odaklı görseller.",
      "Social media management, creative content, brand voice and performance-led visuals.",
      "إدارة وسائل التواصل، محتوى إبداعي، هوية العلامة ومواد بصرية موجهة للأداء.",
    ],
    ["İçeriği keşfet →", "Explore content →", "اكتشف المحتوى ←"],
    ["NFC Smart Cards", "NFC Smart Cards", "بطاقات NFC الذكية"],
    [
      "Google yorum, menü, sosyal medya veya özel link için tek dokunuşlu NFC kartlar.",
      "One-tap NFC cards for Google reviews, menus, social media or custom links.",
      "بطاقات NFC بلمسة واحدة لتقييمات Google والقوائم والتواصل أو الروابط المخصصة.",
    ],
    ["NFC ürünleri →", "NFC products →", "منتجات NFC ←"],
    ["QR Digital Menu", "QR Digital Menu", "قائمة QR الرقمية"],
    [
      "Restoran ve kafeler için şık, hızlı, telefona uyumlu ve kolay güncellenen dijital menüler.",
      "Elegant, fast, mobile-friendly digital menus that are easy to update for restaurants and cafés.",
      "قوائم رقمية أنيقة وسريعة ومتجاوبة وسهلة التحديث للمطاعم والمقاهي.",
    ],
    ["Menü çözümü →", "Menu solution →", "حل القوائم ←"],
    [
      "Lead toplama, WhatsApp akışları ve tekrar eden işleri azaltan pratik otomasyonlar.",
      "Practical automations for lead capture, WhatsApp flows and repetitive work.",
      "أتمتة عملية لجمع العملاء المحتملين ومسارات WhatsApp وتقليل الأعمال المتكررة.",
    ],
    ["Otomasyonlar →", "Automations →", "الأتمتة ←"],
    ["Fiziksel + dijital", "Physical + digital", "واقعي + رقمي"],
    [
      "Masanızdan müşterinin",
      "From your table to the customer's",
      "من طاولتك إلى",
    ],
    ["telefonuna.", "phone.", "هاتف العميل."],
    [
      "NFC ve QR ürünlerimizi sadece baskı ürünü olarak değil, doğru hedefe bağlı dijital temas noktaları olarak tasarlıyoruz.",
      "We design NFC and QR products as digital touchpoints connected to the right destination — not just printed objects.",
      "نصمم منتجات NFC وQR كنقاط تواصل رقمية مرتبطة بالوجهة الصحيحة، وليس كمطبوعات فقط.",
    ],
    ["Bir dokunuş,", "One tap,", "لمسة واحدة،"],
    ["bir sonraki aksiyon.", "the next action.", "والخطوة التالية."],
    [
      "Müşteriyi Google yorumlarınıza, dijital menünüze, Instagram profilinize veya size özel bir landing page'e yönlendirin.",
      "Send customers directly to Google reviews, your digital menu, Instagram or a custom landing page.",
      "وجّه العملاء مباشرة إلى تقييمات Google أو قائمتك الرقمية أو Instagram أو صفحة هبوط مخصصة.",
    ],
    ["NFC'yi keşfet", "Explore NFC", "اكتشف NFC"],
    ["Paket mantığı", "Package model", "نظام الباقات"],
    [
      "Tek seferlik proje değil,",
      "Not a one-off project,",
      "ليس مشروعاً لمرة واحدة،",
    ],
    ["sürekli ilerleme.", "continuous progress.", "بل تقدم مستمر."],
    [
      "İhtiyacınıza göre aylık veya haftalık çalışma seçin. Ne alacağınız baştan belli, süreç düzenli, iletişim net.",
      "Choose monthly or weekly support. You know the scope from day one, with a structured process and clear communication.",
      "اختر دعماً شهرياً أو أسبوعياً. تعرف نطاق العمل من البداية ضمن عملية منظمة وتواصل واضح.",
    ],
    ["Başlangıç", "Starter", "البداية"],
    ["Temel sosyal yönetim", "Basic social management", "إدارة أساسية للتواصل"],
    [
      "Temel sosyal medya yönetimi",
      "Basic social media management",
      "إدارة أساسية لوسائل التواصل",
    ],
    ["Aylık içerik planı", "Monthly content plan", "خطة محتوى شهرية"],
    [
      "İçerik planı ve düzenleme",
      "Content planning & editing",
      "تخطيط المحتوى وتحريره",
    ],
    [
      "Temel performans takibi",
      "Basic performance tracking",
      "متابعة الأداء الأساسية",
    ],
    [
      "Web küçük güncellemeler",
      "Small website updates",
      "تحديثات صغيرة للموقع",
    ],
    ["Paketi incele", "View package", "عرض الباقة"],
    ["Bu paketle başla", "Choose Start", "اختر باقة Start"],
    ["ÖNERİLEN", "RECOMMENDED", "موصى به"],
    [
      "Sosyal + reklam yönetimi",
      "Social + ad management",
      "إدارة التواصل والإعلانات",
    ],
    [
      "İçerik & kreatif desteği",
      "Content & creative support",
      "دعم المحتوى والإبداع",
    ],
    [
      "Aylık rapor & optimizasyon",
      "Monthly report & optimization",
      "تقرير وتحسين شهري",
    ],
    [
      "Web / landing desteği",
      "Web / landing support",
      "دعم الموقع وصفحات الهبوط",
    ],
    [
      "Landing / web desteği",
      "Landing / web support",
      "دعم صفحات الهبوط والموقع",
    ],
    ["Growth'u seç", "Choose Growth", "اختر Growth"],
    ["Reklam optimizasyonu", "Ad optimization", "تحسين الإعلانات"],
    ["Pro'yu seç", "Choose Pro", "اختر Pro"],
    ["Scale'i seç", "Choose Scale", "اختر Scale"],
    ["Çok kanallı büyüme", "Multi-channel growth", "نمو متعدد القنوات"],
    ["Daha yoğun içerik üretimi", "Higher-volume content", "إنتاج محتوى مكثف"],
    ["SEO / Maps takibi", "SEO / Maps tracking", "متابعة SEO وMaps"],
    ["Öncelikli destek", "Priority support", "دعم أولوية"],
    ["Tam dijital yönetim", "Full digital management", "إدارة رقمية كاملة"],
    [
      "İleri kampanya optimizasyonu",
      "Advanced campaign optimization",
      "تحسين متقدم للحملات",
    ],
    ["Automation desteği", "Automation support", "دعم الأتمتة"],
    ["Strateji görüşmeleri", "Strategy sessions", "جلسات استراتيجية"],
    ["Çalışma sistemi", "How we work", "طريقة عملنا"],
    ["Profesyonellik,", "Professionalism", "الاحترافية"],
    ["süreçte görünür.", "shows in the process.", "تظهر في العملية."],
    [
      "Ne yapıldığını, neden yapıldığını ve sırada ne olduğunu bilirsiniz. Projeyi belirsiz bir mesaj trafiğine bırakmayız.",
      "You always know what is being done, why it matters and what comes next. We keep the project structured and transparent.",
      "تعرف دائماً ما الذي يتم ولماذا وما الخطوة التالية. نحافظ على المشروع منظماً وواضحاً.",
    ],
    ["İhtiyacı anlıyoruz", "We understand the need", "نفهم الاحتياج"],
    [
      "Hedef, müşteri, rakip ve mevcut dijital varlıkları netleştiriyoruz.",
      "We clarify the goal, customer, competitors and existing digital assets.",
      "نحدد الهدف والعميل والمنافسين والأصول الرقمية الحالية.",
    ],
    ["Sistemi planlıyoruz", "We plan the system", "نخطط للنظام"],
    [
      "Sayfalar, mesaj, görsel dil ve gerekiyorsa reklam akışını tasarlıyoruz.",
      "We plan pages, messaging, visual direction and the ad journey when needed.",
      "نخطط للصفحات والرسائل والهوية البصرية ومسار الإعلانات عند الحاجة.",
    ],
    ["Üretiyoruz", "We build", "ننفذ"],
    [
      "Tasarım, geliştirme, içerik ve entegrasyonları tek bir çizgide tamamlıyoruz.",
      "We deliver design, development, content and integrations as one consistent system.",
      "ننجز التصميم والتطوير والمحتوى والتكاملات ضمن نظام متناسق.",
    ],
    ["Takip ediyoruz", "We optimize", "نطوّر ونحسّن"],
    [
      "Yayın sonrası ölçüyor, güncelliyor ve büyüme fırsatlarını iyileştiriyoruz.",
      "After launch, we measure, update and improve growth opportunities.",
      "بعد الإطلاق نقيس ونحدّث ونحسن فرص النمو.",
    ],
    ["Yeni bir proje mi?", "A new project?", "مشروع جديد؟"],
    ["Markanızı birlikte", "Let's take your brand", "لنأخذ علامتك"],
    [
      "bir üst seviyeye taşıyalım.",
      "to the next level.",
      "إلى المستوى التالي.",
    ],
    [
      "İhtiyacınızı anlatın. Size en mantıklı kapsamı ve paketi birlikte belirleyelim.",
      "Tell us what you need and we'll define the most sensible scope and package together.",
      "أخبرنا بما تحتاجه وسنحدد معاً النطاق والباقة الأنسب.",
    ],
    [
      "Projenizi anlatın ↗",
      "Tell us about your project ↗",
      "أخبرنا عن مشروعك ↗",
    ],
    ["Fiyatları görün", "See pricing", "عرض الأسعار"],
    [
      "Uçtan uca dijital hizmetler",
      "End-to-end digital services",
      "خدمات رقمية متكاملة",
    ],
    ["Sadece görünmek değil,", "Beyond visibility,", "أكثر من مجرد الظهور،"],
    ["sonuç üretmek.", "built for results.", "نصنع نتائج."],
    [
      "İhtiyacınız ister yeni bir web sitesi, ister reklam yönetimi, ister tüm dijital görünümünüz olsun; her hizmeti aynı stratejinin parçası olarak ele alıyoruz.",
      "Whether you need a new website, ad management or your entire digital presence, we treat every service as part of one strategy.",
      "سواء كنت تحتاج موقعاً جديداً أو إدارة إعلانات أو حضوراً رقمياً كاملاً، نتعامل مع كل خدمة كجزء من استراتيجية واحدة.",
    ],
    [
      "Web Tasarım & Geliştirme",
      "Web Design & Development",
      "تصميم وتطوير المواقع",
    ],
    [
      "Kurumsal web siteleri, landing page'ler, portfolyolar ve satış odaklı sayfalar. Mobil uyum, hız, SEO temeli ve net CTA yapısı standart.",
      "Corporate websites, landing pages, portfolios and sales-focused pages. Responsive design, speed, SEO foundations and clear CTAs are standard.",
      "مواقع شركات وصفحات هبوط ومعارض أعمال وصفحات موجهة للمبيعات. التجاوب والسرعة وأساسيات SEO وCTA الواضحة ضمن الأساس.",
    ],
    [
      "Kampanya kurulumu, hedef kitle, kreatif, dönüşüm takibi, bütçe kontrolü ve sürekli optimizasyon.",
      "Campaign setup, audiences, creative, conversion tracking, budget control and continuous optimization.",
      "إعداد الحملات والجمهور والمحتوى وتتبع التحويلات والتحكم بالميزانية والتحسين المستمر.",
    ],
    [
      "Sosyal Medya & İçerik",
      "Social Media & Content",
      "وسائل التواصل والمحتوى",
    ],
    [
      "İçerik planı, tasarım dili, kısa video fikirleri, kampanya görselleri ve hesabınızın düzenli yönetimi.",
      "Content planning, visual language, short-video ideas, campaign creative and consistent account management.",
      "تخطيط المحتوى والهوية البصرية وأفكار الفيديو القصير وتصاميم الحملات وإدارة الحساب.",
    ],
    ["SEO & Google Maps", "SEO & Google Maps", "SEO وGoogle Maps"],
    [
      "Yerel işletmeler için görünürlük, Google Business optimizasyonu, web içi SEO ve içerik fırsatları.",
      "Local visibility, Google Business optimization, on-page SEO and content opportunities.",
      "ظهور محلي وتحسين Google Business وSEO داخل الموقع وفرص المحتوى.",
    ],
    [
      "Lead toplama akışları, WhatsApp yönlendirmeleri, basit CRM yapıları ve tekrar eden süreçleri azaltan otomasyonlar.",
      "Lead-capture flows, WhatsApp routing, simple CRM structures and automations that reduce repetitive work.",
      "مسارات جمع العملاء وتوجيه WhatsApp وهياكل CRM بسيطة وأتمتة تقلل العمل المتكرر.",
    ],
    [
      "Brand & Creative Direction",
      "Brand & Creative Direction",
      "الهوية والتوجيه الإبداعي",
    ],
    [
      "Renk, tipografi, sosyal görünüm ve kampanya kreatiflerini markanın tek bir profesyonel sistem gibi hissettirmesi için düzenliyoruz.",
      "We align color, typography, social presence and campaign creative so the brand feels like one professional system.",
      "نوحّد اللون والخط والحضور الاجتماعي وإبداعات الحملات لتبدو العلامة كنظام احترافي واحد.",
    ],
    ["Doğru kombinasyon", "The right mix", "المزيج الصحيح"],
    ["Her işletmeye", "We don't sell", "لا نبيع"],
    [
      "aynı paketi satmıyoruz.",
      "the same package to everyone.",
      "نفس الباقة للجميع.",
    ],
    [
      "Önce darboğazı buluyoruz. Yeni bir işletmede web + Google Maps öncelikli olabilir; aktif bir markada reklam + landing page + içerik daha hızlı sonuç verebilir.",
      "We first identify the bottleneck. A new business may need web + Google Maps first; an active brand may grow faster with ads + landing pages + content.",
      "نحدد نقطة التعطّل أولاً. قد يحتاج النشاط الجديد إلى الموقع وGoogle Maps، بينما تستفيد العلامة النشطة أسرع من الإعلانات وصفحات الهبوط والمحتوى.",
    ],
    ["Temel", "Foundation", "الأساس"],
    [
      "Web, marka görünümü ve doğru iletişim kanalları.",
      "Website, brand presence and the right communication channels.",
      "الموقع وحضور العلامة وقنوات التواصل الصحيحة.",
    ],
    ["Trafik", "Traffic", "الزيارات"],
    [
      "Google, Meta, Maps ve içerik ile doğru kitleyi getiririz.",
      "We bring the right audience through Google, Meta, Maps and content.",
      "نجلب الجمهور المناسب عبر Google وMeta وMaps والمحتوى.",
    ],
    ["Dönüşüm", "Conversion", "التحويل"],
    [
      "Landing, CTA, form, QR/NFC ve mesaj akışıyla aksiyonu kolaylaştırırız.",
      "We make action easy through landing pages, CTAs, forms, QR/NFC and messaging flows.",
      "نسهّل الإجراء عبر صفحات الهبوط وCTA والنماذج وQR/NFC ومسارات الرسائل.",
    ],
    ["Takip", "Optimization", "المتابعة"],
    [
      "Sonuçları izler, veriye göre bir sonraki hamleyi iyileştiririz.",
      "We track results and improve the next move based on data.",
      "نتابع النتائج ونحسن الخطوة التالية بناءً على البيانات.",
    ],
    [
      "Kapsamı birlikte seçelim",
      "Let's choose the scope together",
      "لنحدد النطاق معاً",
    ],
    ["İhtiyacınız için", "For your needs,", "لاحتياجك،"],
    [
      "en mantıklı sistemi kuralım.",
      "let's build the right system.",
      "لنبنِ النظام الأنسب.",
    ],
    ["Teklif isteyin ↗", "Request a proposal ↗", "اطلب عرضاً ↗"],
    ["Abonelik paketleri", "Subscription packages", "باقات الاشتراك"],
    [
      "Fiziksel temas, dijital aksiyon",
      "Physical touch, digital action",
      "تفاعل واقعي، إجراء رقمي",
    ],
    ["Dokundur. Aç.", "Tap. Open.", "المس. افتح."],
    ["Tamamla.", "Done.", "تم."],
    [
      "Müşterinizin Google yorumu bırakmasını, menünüzü açmasını veya size ulaşmasını tek dokunuşa indirin. NTAG213 tabanlı NFC ürünleri günlük işletme kullanımı için sade ve hızlı bir deneyim sunar.",
      "Make Google reviews, menu access or contacting you a one-tap action. NTAG213-based NFC products offer a simple, fast daily business experience.",
      "اجعل تقييم Google أو فتح القائمة أو التواصل معك بلمسة واحدة. منتجات NFC المبنية على NTAG213 توفر تجربة يومية بسيطة وسريعة.",
    ],
    ["Nasıl çalışır?", "How does it work?", "كيف يعمل؟"],
    ["3 saniyede", "In 3 seconds,", "خلال 3 ثوانٍ،"],
    ["doğru sayfa.", "the right page.", "الصفحة الصحيحة."],
    [
      "Uygulama indirmeye gerek yok. Uyumlu telefonda kartı yaklaştırın; tanımladığınız bağlantı açılır.",
      "No app required. Tap a compatible phone near the card and your configured link opens.",
      "لا حاجة لتطبيق. قرّب هاتفاً متوافقاً من البطاقة وسيفتح الرابط المحدد.",
    ],
    ["Kartı konumlandırın", "Place the card", "ضع البطاقة"],
    [
      "Kasa, masa, resepsiyon veya paket üstü.",
      "At the checkout, table, reception or on packaging.",
      "عند الكاشير أو الطاولة أو الاستقبال أو على التغليف.",
    ],
    [
      "Müşteri telefonunu yaklaştırır",
      "Customer taps their phone",
      "يقرّب العميل هاتفه",
    ],
    [
      "NFC alanı bağlantıyı otomatik algılar.",
      "The NFC field detects the link automatically.",
      "تتعرف منطقة NFC على الرابط تلقائياً.",
    ],
    ["İstenen sayfa açılır", "The destination opens", "تفتح الوجهة"],
    [
      "Google Review, menü, Instagram, WhatsApp veya özel landing page.",
      "Google Review, menu, Instagram, WhatsApp or a custom landing page.",
      "تقييم Google أو القائمة أو Instagram أو WhatsApp أو صفحة هبوط مخصصة.",
    ],
    ["Ürün seçenekleri", "Product options", "خيارات المنتج"],
    ["Standart veya", "Standard or", "قياسي أو"],
    ["markanıza özel.", "custom to your brand.", "مخصص لعلامتك."],
    [
      "Hızlı teslim için genel tasarımlar; daha premium görünüm için logo, renk ve kullanım senaryonuza göre özel tasarım.",
      "Choose ready designs for speed or a custom branded version using your logo, colors and use case.",
      "اختر تصميماً جاهزاً للسرعة أو نسخة مخصصة بشعارك وألوانك واستخدامك.",
    ],
    ["Ready-to-use NFC Card", "Ready-to-use NFC Card", "بطاقة NFC جاهزة"],
    [
      "Restoran, kafe, berber, klinik ve mağaza gibi farklı işletmelerde kullanılabilen sade profesyonel tasarım.",
      "A clean professional design for restaurants, cafés, barbers, clinics, shops and more.",
      "تصميم احترافي بسيط للمطاعم والمقاهي والحلاقين والعيادات والمتاجر وغيرها.",
    ],
    ["'den başlayan", "starting from", "ابتداءً من"],
    ["Branded NFC Card", "Branded NFC Card", "بطاقة NFC مخصصة"],
    [
      "İşletmenin logosu, renkleri, CTA metni ve yönlendirme hedefiyle hazırlanan özel tasarım. Çoklu siparişlerde adet fiyatı düşer.",
      "Custom design with your logo, colors, CTA and destination. Unit pricing improves for larger quantities.",
      "تصميم مخصص بالشعار والألوان وCTA والوجهة. ينخفض سعر الوحدة للكميات الأكبر.",
    ],
    ["Teklif", "Quote", "عرض سعر"],
    ["/ tasarıma göre", "/ by design", "/ حسب التصميم"],
    ["Kullanım alanları", "Use cases", "الاستخدامات"],
    ["Bir kart,", "One card,", "بطاقة واحدة،"],
    ["birçok senaryo.", "many use cases.", "استخدامات عديدة."],
    [
      "Memnun müşteriyi doğrudan yorum ekranına yönlendirin ve adımları azaltın.",
      "Send happy customers directly to the review screen and remove extra steps.",
      "وجّه العملاء السعداء مباشرة إلى شاشة التقييم وقلّل الخطوات.",
    ],
    ["Dijital Menü", "Digital Menu", "قائمة رقمية"],
    [
      "Masanın üzerinde NFC + QR ile güncel menüyü saniyeler içinde açın.",
      "Open the latest menu in seconds with NFC + QR on the table.",
      "افتح أحدث قائمة خلال ثوانٍ عبر NFC + QR على الطاولة.",
    ],
    ["Social & Contact", "Social & Contact", "التواصل والاتصال"],
    [
      "Instagram, WhatsApp, Linktree veya kişisel profil bağlantısını tek dokunuşta paylaşın.",
      "Share Instagram, WhatsApp, Linktree or a profile link with one tap.",
      "شارك Instagram أو WhatsApp أو Linktree أو رابط الملف بلمسة واحدة.",
    ],
    ["Toplu sipariş", "Bulk order", "طلب كميات"],
    [
      "5, 10 veya daha fazla kart için",
      "For 5, 10 or more cards,",
      "لـ 5 أو 10 بطاقات أو أكثر،",
    ],
    ["özel fiyat.", "special pricing.", "سعر خاص."],
    [
      "Kaç kart istediğinizi ve kullanım amacını yazın; size doğru formatı önerelim.",
      "Tell us the quantity and use case, and we'll recommend the right format.",
      "أخبرنا بالكمية والاستخدام وسنقترح الصيغة المناسبة.",
    ],
    ["NFC teklifi alın ↗", "Get an NFC quote ↗", "احصل على عرض NFC ↗"],
    ["QR Menü ile birleştir", "Combine with QR Menu", "ادمجها مع قائمة QR"],
    [
      "Restoran deneyimini modernleştirin",
      "Modernize the restaurant experience",
      "طوّر تجربة المطعم",
    ],
    ["Menünüz telefonda", "Make your menu look", "اجعل قائمتك تبدو"],
    ["gerçekten iyi görünsün.", "great on every phone.", "رائعة على كل هاتف."],
    [
      "PDF açan sıradan bir QR kod yerine, markanıza özel, mobil uyumlu, hızlı ve kategori bazlı dijital menü tasarlıyoruz. Fiyat ve ürün güncellemeleri daha kolay olur.",
      "Instead of a QR code that opens a PDF, we design a fast, mobile-first, category-based digital menu for your brand. Price and product updates become easier.",
      "بدلاً من QR يفتح ملف PDF، نصمم قائمة رقمية سريعة ومتجاوبة ومقسمة حسب الفئات لعلامتك. وتصبح تحديثات الأسعار والمنتجات أسهل.",
    ],
    ["QR okutulur,", "Scan the QR,", "امسح QR،"],
    ["menü hemen açılır.", "the menu opens instantly.", "وتفتح القائمة فوراً."],
    [
      "Telefon ekranına göre tasarlanmış bir arayüz: kategoriler, ürün fotoğrafları, açıklamalar, fiyatlar ve gerekli dil seçenekleri.",
      "An interface designed for phones: categories, product photos, descriptions, prices and language options when needed.",
      "واجهة مصممة للهاتف: فئات وصور منتجات ووصف وأسعار وخيارات لغات عند الحاجة.",
    ],
    ["Markanıza göre tasarım", "Designed for your brand", "مصمم لعلامتك"],
    [
      "Logo, renk, font ve restoran atmosferi.",
      "Logo, colors, typography and restaurant atmosphere.",
      "الشعار والألوان والخط وأجواء المطعم.",
    ],
    ["Kolay kategori yapısı", "Easy categories", "فئات سهلة"],
    [
      "Kahvaltı, ana yemek, içecek, tatlı ve daha fazlası.",
      "Breakfast, mains, drinks, desserts and more.",
      "فطور وأطباق رئيسية ومشروبات وحلويات وأكثر.",
    ],
    ["QR + NFC birlikte", "QR + NFC together", "QR + NFC معاً"],
    [
      "Müşteriye iki hızlı erişim seçeneği sunun.",
      "Give customers two fast ways to access the menu.",
      "امنح العميل طريقتين سريعتين للوصول للقائمة.",
    ],
    ["Başlangıç paketi", "Starter package", "باقة البداية"],
    ["Basit fiyat,", "Simple pricing,", "سعر بسيط،"],
    ["profesyonel görünüm.", "professional look.", "مظهر احترافي."],
    [
      "İşletmenin ürün sayısı, dil sayısı ve güncelleme ihtiyacına göre kapsamı netleştiriyoruz.",
      "We define the scope based on product count, languages and update needs.",
      "نحدد النطاق حسب عدد المنتجات واللغات واحتياجات التحديث.",
    ],
    ["Dijital Menü Kurulumu", "Digital Menu Setup", "إعداد القائمة الرقمية"],
    [
      "Mobil tasarım, kategori yapısı, QR üretimi, temel ürün girişi ve yayınlama desteği.",
      "Mobile design, category structure, QR generation, initial product entry and launch support.",
      "تصميم للهاتف وهيكلة الفئات وإنشاء QR وإدخال المنتجات الأساسي ودعم الإطلاق.",
    ],
    ["Özel paket", "Custom package", "باقة مخصصة"],
    ["/ adet bazlı", "/ by quantity", "/ حسب الكمية"],
    [
      "Menü kurulumu ile masalara yerleştirilecek NFC/QR kartlarını tek bir görsel sistemde birleştirin.",
      "Combine the menu and table NFC/QR cards in one visual system.",
      "ادمج القائمة وبطاقات NFC/QR على الطاولات ضمن نظام بصري واحد.",
    ],
    ["Restoranınız için demo", "Demo for your restaurant", "عرض لمطعمك"],
    ["Menünüzü bize gönderin,", "Send us your menu,", "أرسل لنا قائمتك،"],
    [
      "nasıl dönüşebileceğini konuşalım.",
      "let's discuss how it can evolve.",
      "ولنتحدث كيف يمكن تطويرها.",
    ],
    [
      "QR Menü teklifi ↗",
      "Get a QR Menu quote ↗",
      "احصل على عرض قائمة QR ↗",
    ],
    ["NFC kartları gör", "See NFC cards", "عرض بطاقات NFC"],
    [
      "Net kapsam · esnek çalışma",
      "Clear scope · flexible support",
      "نطاق واضح · عمل مرن",
    ],
    ["Büyüme için", "Built for", "مصمم من أجل"],
    ["düzenli destek.", "consistent growth.", "نمو مستمر."],
    [
      "Aylık devamlılık veya kısa süreli haftalık çalışma seçebilirsiniz. Paketler; içerik, reklam, web desteği ve optimizasyon yoğunluğuna göre ölçeklenir.",
      "Choose ongoing monthly support or short weekly engagements. Packages scale by content, ads, web support and optimization intensity.",
      "اختر دعماً شهرياً مستمراً أو عملاً أسبوعياً قصيراً. تتدرج الباقات حسب المحتوى والإعلانات ودعم الموقع والتحسين.",
    ],
    ["Aylık", "Monthly", "شهري"],
    ["Haftalık", "Weekly", "أسبوعي"],
    [
      "Dijital düzenini kurmak isteyen küçük işletmeler.",
      "For small businesses building their digital foundation.",
      "للأعمال الصغيرة التي تبني أساسها الرقمي.",
    ],
    [
      "Düzenli müşteri kazanımı isteyen işletmeler.",
      "For businesses that want consistent customer acquisition.",
      "للأعمال التي تريد اكتساب عملاء باستمرار.",
    ],
    ["EN ÇOK TERCİH", "MOST POPULAR", "الأكثر طلباً"],
    [
      "Sosyal medya + reklam yönetimi",
      "Social media + ad management",
      "إدارة التواصل والإعلانات",
    ],
    [
      "Kreatif ve içerik desteği",
      "Creative & content support",
      "دعم الإبداع والمحتوى",
    ],
    [
      "Aylık performans raporu",
      "Monthly performance report",
      "تقرير أداء شهري",
    ],
    ["Kampanya optimizasyonu", "Campaign optimization", "تحسين الحملات"],
    [
      "Birden fazla kanalda büyümek isteyen markalar.",
      "For brands growing across multiple channels.",
      "للعلامات التي تنمو عبر قنوات متعددة.",
    ],
    [
      "Çok kanallı büyüme yönetimi",
      "Multi-channel growth management",
      "إدارة نمو متعددة القنوات",
    ],
    [
      "Daha yoğun içerik planı",
      "Higher-volume content plan",
      "خطة محتوى أكثر كثافة",
    ],
    [
      "SEO & Google Maps takibi",
      "SEO & Google Maps tracking",
      "متابعة SEO وGoogle Maps",
    ],
    [
      "Dijital tarafı dış ekip gibi yönetmek isteyenler.",
      "For businesses that want an external digital team.",
      "للأعمال التي تريد فريقاً رقمياً خارجياً.",
    ],
    ["AI / automation desteği", "AI / automation support", "دعم AI والأتمتة"],
    [
      "Öncelikli üretim sırası",
      "Priority production queue",
      "أولوية في التنفيذ",
    ],
    [
      "Reklam medya bütçesi ve üçüncü taraf yazılım/hosting ücretleri paket ücretine dahil değildir. Kesin kapsam ön görüşmede netleştirilir.",
      "Ad spend and third-party software/hosting fees are not included. Final scope is confirmed during the initial consultation.",
      "ميزانية الإعلانات ورسوم البرامج أو الاستضافة الخارجية غير مشمولة. يتم تأكيد النطاق في الاستشارة الأولى.",
    ],
    ["Proje bazlı", "Project-based", "حسب المشروع"],
    ["Abonelik dışında", "Beyond subscriptions,", "إلى جانب الاشتراكات،"],
    ["tek seferlik işler.", "one-off projects.", "مشاريع لمرة واحدة."],
    [
      "Sadece web sitesi, QR Menü veya NFC ürünü istiyorsanız aylık paket almak zorunda değilsiniz.",
      "If you only need a website, QR Menu or NFC product, you do not need a monthly package.",
      "إذا كنت تحتاج فقط موقعاً أو قائمة QR أو منتج NFC فلست بحاجة إلى باقة شهرية.",
    ],
    ["Web Tasarım", "Web Design", "تصميم المواقع"],
    [
      "Tek sayfa kurumsal site 5.000 TL'den, çok sayfalı site 8.000 TL'den, dinamik projeler 12.000 TL'den başlar.",
      "One-page corporate sites start at 5,000 TL, multi-page sites at 8,000 TL and dynamic projects at 12,000 TL.",
      "تبدأ المواقع ذات الصفحة الواحدة من 5,000 TL، ومتعددة الصفحات من 8,000 TL، والمشاريع الديناميكية من 12,000 TL.",
    ],
    [
      "Standart NFC kartlar 700 TL'den; dijital QR Menü kurulumu 2.500 TL'den başlar. Toplu kart siparişlerinde özel fiyatlandırma yapılır.",
      "Standard NFC cards start at 700 TL; digital QR Menu setup starts at 2,500 TL. Bulk card orders receive custom pricing.",
      "تبدأ بطاقات NFC القياسية من 700 TL، وإعداد قائمة QR من 2,500 TL، مع أسعار خاصة للكميات.",
    ],
    ["Sık sorulanlar", "Frequently asked questions", "الأسئلة الشائعة"],
    ["Başlamadan önce", "Before we start,", "قبل أن نبدأ،"],
    ["net olsun.", "let's make it clear.", "لنوضح كل شيء."],
    ["Taahhüt var mı?", "Is there a commitment?", "هل يوجد التزام؟"],
    [
      "Paket kapsamı ve çalışma süresi teklif üzerinde netleştirilir. Kısa ihtiyaçlar için haftalık seçenek kullanılabilir.",
      "Scope and duration are defined in the proposal. Weekly options are available for short-term needs.",
      "يتم تحديد النطاق والمدة في العرض، مع خيار أسبوعي للاحتياجات القصيرة.",
    ],
    [
      "Reklam bütçesi dahil mi?",
      "Is ad spend included?",
      "هل ميزانية الإعلان مشمولة؟",
    ],
    [
      "Hayır. AuraDigital yönetim ve optimizasyonu sağlar; Meta/Google medya harcaması doğrudan işletmenin reklam bütçesidir.",
      "No. AuraDigital handles management and optimization; Meta/Google media spend comes from the business's ad budget.",
      "لا. AuraDigital تتولى الإدارة والتحسين، أما الإنفاق على Meta/Google فمن ميزانية الإعلان الخاصة بالنشاط.",
    ],
    [
      "İçerikleri kim hazırlıyor?",
      "Who creates the content?",
      "من ينشئ المحتوى؟",
    ],
    [
      "Pakete göre tasarım/kreatif desteğini biz üstleniriz. Özel fotoğraf-video çekimi gerekiyorsa kapsam ayrıca planlanır.",
      "We provide design/creative support depending on the package. Custom photo/video shoots are scoped separately when needed.",
      "نقدم دعم التصميم والإبداع حسب الباقة، ويتم تسعير تصوير الصور والفيديو المخصص بشكل منفصل عند الحاجة.",
    ],
    [
      "Web sitem zaten varsa?",
      "What if I already have a website?",
      "ماذا لو لدي موقع بالفعل؟",
    ],
    [
      "Yeni site şart değil. Mevcut yapıyı inceleyip gerekli landing page, güncelleme ve optimizasyonlarla devam edebiliriz.",
      "A new site is not required. We can review your current setup and continue with landing pages, updates and optimization.",
      "لا تحتاج بالضرورة لموقع جديد. نراجع موقعك الحالي ونكمل بصفحات هبوط وتحديثات وتحسينات.",
    ],
    ["Kararsız mısınız?", "Not sure which package?", "غير متأكد من الباقة؟"],
    ["İhtiyacınıza göre", "Based on your needs,", "حسب احتياجك،"],
    [
      "paketi birlikte seçelim.",
      "let's choose the package together.",
      "لنختر الباقة معاً.",
    ],
    ["Digital Growth Studio", "Digital Growth Studio", "استوديو النمو الرقمي"],
    ["Küçük ekip çevikliği,", "Small-team agility,", "مرونة فريق صغير،"],
    [
      "profesyonel sistem disiplini.",
      "professional-system discipline.",
      "وانضباط نظام احترافي.",
    ],
    [
      "AuraDigital; işletmelerin web, reklam, sosyal medya ve fiziksel-dijital temas noktalarını tek bir tutarlı sistem altında toplamak için kurulmuş bağımsız bir dijital stüdyodur.",
      "AuraDigital is an independent digital studio built to unite web, advertising, social media and physical-to-digital touchpoints into one consistent system.",
      "AuraDigital استوديو رقمي مستقل يجمع المواقع والإعلانات ووسائل التواصل ونقاط التواصل الواقعية-الرقمية ضمن نظام متناسق واحد.",
    ],
    ["Neye inanıyoruz?", "What do we believe?", "بماذا نؤمن؟"],
    [
      "İyi tasarım güven verir.",
      "Good design builds trust.",
      "التصميم الجيد يبني الثقة.",
    ],
    [
      "İyi sistem iş getirir.",
      "A good system drives business.",
      "والنظام الجيد يجلب الأعمال.",
    ],
    [
      "Bizim için profesyonellik; sadece güzel görünmek değil. Hızlı cevap veren bir web sitesi, müşteriyi doğru aksiyona götüren mesaj, ölçülen reklam ve kolay kullanılan NFC/QR deneyimi birlikte çalışmalı.",
      "For us, professionalism is more than looking good. A fast website, clear messaging, measurable ads and effortless NFC/QR experiences need to work together.",
      "بالنسبة لنا الاحترافية أكثر من مظهر جميل. يجب أن يعمل الموقع السريع والرسائل الواضحة والإعلانات القابلة للقياس وتجارب NFC/QR معاً.",
    ],
    ["Net iletişim", "Clear communication", "تواصل واضح"],
    [
      "Kapsamı, beklentiyi ve sonraki adımı açık tutarız. Müşteri teknik detayların içinde kaybolmadan projenin nerede olduğunu bilir.",
      "We keep scope, expectations and next steps clear, so clients always know where the project stands.",
      "نوضح النطاق والتوقعات والخطوات التالية ليعرف العميل دائماً أين وصل المشروع.",
    ],
    ["Tasarıma özen", "Design craft", "عناية بالتصميم"],
    [
      "Şablon hissi yerine işletmeye uyan renk, tipografi, görsel hiyerarşi ve marka dili kurarız.",
      "Instead of a template feel, we build a visual language with color, typography and hierarchy that fits the business.",
      "بدلاً من إحساس القالب، نبني لغة بصرية بالألوان والخط والتسلسل تناسب النشاط.",
    ],
    ["Sonuç odaklılık", "Results focus", "تركيز على النتائج"],
    [
      "Sayfa hızı, mobil deneyim, CTA, reklam verisi ve kullanıcı davranışı gibi pratik sonuçlara bakarız.",
      "We focus on practical outcomes such as speed, mobile experience, CTAs, ad data and user behavior.",
      "نركز على نتائج عملية مثل السرعة وتجربة الهاتف وCTA وبيانات الإعلانات وسلوك المستخدم.",
    ],
    ["Yayın sonrası destek", "Post-launch support", "دعم بعد الإطلاق"],
    [
      "İş siteyi yayına almakla bitmez. Aboneliklerle içerik, kampanya, optimizasyon ve güncellemeleri sürdürürüz.",
      "The work does not end at launch. Subscriptions keep content, campaigns, optimization and updates moving.",
      "العمل لا ينتهي عند الإطلاق. الاشتراكات تضمن استمرار المحتوى والحملات والتحسين والتحديثات.",
    ],
    ["İstanbul'dan daha uzağa", "Beyond Istanbul", "أبعد من إسطنبول"],
    [
      "Yerel işletme gerçekliği,",
      "Local-business reality,",
      "واقع الأعمال المحلية،",
    ],
    [
      "uluslararası kalite hedefi.",
      "international quality standards.",
      "ومعيار جودة دولي.",
    ],
    [
      "Restoran, hizmet işletmesi, butik marka veya büyüyen şirket fark etmeksizin; erişilebilir fiyatla düzenli ve premium bir dijital görünüm kurmaya odaklanıyoruz.",
      "From restaurants and service businesses to boutique brands and growing companies, we focus on a consistent premium digital presence at an accessible level.",
      "من المطاعم والخدمات إلى العلامات المتخصصة والشركات النامية، نركز على حضور رقمي احترافي ومتناسق بمستوى متاح.",
    ],
    ["Temel platform", "Core platform", "المنصة الأساسية"],
    [
      "Markanın kontrol ettiği hızlı ve güven veren ana dijital merkez.",
      "A fast, trusted digital hub controlled by the brand.",
      "مركز رقمي سريع وموثوق تملكه العلامة.",
    ],
    ["Trafik motoru", "Traffic engine", "محرك الزيارات"],
    [
      "Reklam, Maps ve içerik ile doğru kişilere görünürlük.",
      "Visibility to the right people through ads, Maps and content.",
      "ظهور للأشخاص المناسبين عبر الإعلانات وMaps والمحتوى.",
    ],
    [
      "Fiziksel müşteri deneyimini dijital aksiyona bağlayan temas noktaları.",
      "Touchpoints that connect physical customer experience to digital action.",
      "نقاط تواصل تربط تجربة العميل الواقعية بالإجراء الرقمي.",
    ],
    ["Süreklilik", "Continuity", "الاستمرارية"],
    [
      "Abonelik sistemi ile düzenli geliştirme ve optimizasyon.",
      "Continuous development and optimization through subscriptions.",
      "تطوير وتحسين مستمر عبر الاشتراكات.",
    ],
    ["Birlikte çalışalım", "Let's work together", "لنعمل معاً"],
    [
      "Sıradaki dijital hamlenizi",
      "Let's discuss your next",
      "لنتحدث عن خطوتك",
    ],
    ["konuşalım.", "digital move.", "الرقمية التالية."],
    ["Bize ulaşın ↗", "Contact us ↗", "تواصل معنا ↗"],
    ["Hizmetleri görün", "View services", "عرض الخدمات"],
    ["Yeni proje", "New project", "مشروع جديد"],
    ["Fikrinizi anlatın.", "Tell us your idea.", "أخبرنا بفكرتك."],
    [
      "Yolu birlikte netleştirelim.",
      "We'll shape the path together.",
      "لنحدد الطريق معاً.",
    ],
    [
      "Web sitesi, reklam, NFC, QR Menü veya aylık dijital yönetim… Ne istediğinizi biliyorsanız yazın; henüz emin değilseniz de sorun değil.",
      "Website, ads, NFC, QR Menu or monthly digital management — tell us what you need, or come to us even if you are not sure yet.",
      "موقع أو إعلانات أو NFC أو قائمة QR أو إدارة رقمية شهرية — أخبرنا بما تحتاجه، وحتى إن لم تكن متأكداً بعد فلا مشكلة.",
    ],
    [
      "İhtiyacınızı kısaca yazmanız yeterli. Uygun kapsamı ve sonraki adımı birlikte belirleyebiliriz.",
      "A short note about your needs is enough. We can define the right scope and next step together.",
      "يكفي أن تكتب احتياجك باختصار، وسنحدد معاً النطاق والخطوة التالية.",
    ],
    ["Ad / İşletme", "Name / Business", "الاسم / النشاط"],
    ["Telefon / WhatsApp", "Phone / WhatsApp", "الهاتف / WhatsApp"],
    ["İlgilendiğiniz hizmet", "Service you need", "الخدمة المطلوبة"],
    ["Kısaca anlatın", "Tell us briefly", "اكتب لنا باختصار"],
    ["Web Tasarım", "Web Design", "تصميم موقع"],
    [
      "Aylık / Haftalık Paket",
      "Monthly / Weekly Package",
      "باقة شهرية / أسبوعية",
    ],
    ["NFC Kart", "NFC Card", "بطاقة NFC"],
    ["QR Dijital Menü", "QR Digital Menu", "قائمة QR رقمية"],
    ["Reklam Yönetimi", "Ad Management", "إدارة الإعلانات"],
    ["Sosyal Medya", "Social Media", "وسائل التواصل"],
    ["Diğer", "Other", "أخرى"],
    ["Mesajı hazırla ↗", "Prepare message ↗", "جهّز الرسالة ↗"],
    [
      "Form gönderildiğinde e-posta uygulamanızda mesaj hazırlanır. Backend gerekmez; bu yüzden site doğrudan açıldığında da çalışır.",
      "Submitting prepares the message in your email app. No backend is required, so it also works when the site is opened directly.",
      "عند الإرسال يتم تجهيز الرسالة في تطبيق البريد. لا يحتاج الموقع إلى Backend، لذلك يعمل حتى عند فتحه مباشرة.",
    ],
    ["Daha hazır değil misiniz?", "Not ready yet?", "لست مستعداً بعد؟"],
    ["Önce paketleri ve", "Explore packages and", "اطلع أولاً على الباقات و"],
    ["hizmetleri inceleyin.", "services first.", "الخدمات."],
    ["Bu sayfa", "This page", "هذه الصفحة"],
    ["burada değil.", "is not here.", "غير موجودة هنا."],
    [
      "Bağlantı değişmiş olabilir. Ana sayfaya dönüp AuraDigital hizmetlerini keşfedebilirsiniz.",
      "The link may have changed. Return home to explore AuraDigital services.",
      "قد يكون الرابط تغير. عد إلى الرئيسية لاستكشاف خدمات AuraDigital.",
    ],
    ["Ana sayfaya dön →", "Back to home →", "العودة للرئيسية ←"],
    ["Adınız veya marka adı", "Your name or brand", "اسمك أو اسم العلامة"],
    [
      "Ne yapmak istiyorsunuz? Yaklaşık zamanlama ve varsa bütçe aralığını yazabilirsiniz.",
      "What would you like to build? You can include timing and an approximate budget range.",
      "ماذا تريد أن تنفذ؟ يمكنك ذكر المدة والميزانية التقريبية إن وجدت.",
    ],
    ["Portfolio", "Portfolio", "أعمالنا"],
    ["Seçili işler", "Selected work", "أعمال مختارة"],
    ["Sözden önce,", "Before the pitch,", "قبل الكلام،"],
    ["işi gösterelim.", "see the work.", "شاهد العمل."],
    [
      "Farklı sektörler için ürettiğimiz web, marka ve dijital deneyim çalışmalarından seçkiler.",
      "A selection of web, brand and digital experiences built for different industries.",
      "مختارات من أعمال المواقع والعلامات والتجارب الرقمية التي صممناها لقطاعات مختلفة.",
    ],
    ["Tüm projeleri görün →", "View all projects →", "شاهد كل المشاريع ←"],
    ["Markanız dijitalde", "Your brand should feel", "يجب أن تبدو علامتك"],
    ["hazır hissettirmeli.", "ready for digital.", "جاهزة رقمياً."],
    ["Nasıl çalıştığımızı görün ↗", "See how we work ↗", "شاهد كيف نعمل ↗"],
    ["Tek bir menü değil,", "Not one menu,", "ليست قائمة واحدة،"],
    ["size uyan tasarım.", "a design that fits you.", "بل تصميم يناسبك."],
    [
      "3D etkileşimden lüks editorial görünüme kadar dört farklı tasarım yönünden birini seçin; renkleri, içerikleri ve marka detaylarını işletmenize uyarlayalım.",
      "Choose from four design directions, from interactive 3D to a luxury editorial look; we will adapt the colors, content and brand details to your business.",
      "اختر من أربعة اتجاهات تصميم، من التجربة ثلاثية الأبعاد التفاعلية إلى الأسلوب التحريري الفاخر، وسنكيّف الألوان والمحتوى وتفاصيل العلامة مع نشاطك.",
    ],
    [
      "AuraMenu tasarımlarını seçin ↗",
      "Choose AuraMenu designs ↗",
      "اختر تصاميم AuraMenu ↗",
    ],
    [
      "Portfolio — AuraDigital",
      "Portfolio — AuraDigital",
      "أعمالنا — AuraDigital",
    ],
    ["İşimiz kendini", "Let our work", "دع أعمالنا"],
    ["anlatsın.", "speak for itself.", "تتحدث عن نفسها."],
    [
      "Farklı sektörlerdeki işletmeler için tasarladığımız dijital deneyimler. Her projede aynı şablonu değil, markanın ihtiyacına uyan sistemi kuruyoruz.",
      "Digital experiences designed for businesses across different industries. We do not reuse one template; we build the system that fits each brand.",
      "تجارب رقمية صممناها لأعمال من قطاعات مختلفة. لا نكرر قالباً واحداً، بل نبني النظام المناسب لكل علامة.",
    ],
    [
      "Hizmetleri net anlatan, mobilde hızlı aksiyon veren ve yerel güven hissini güçlendiren dijital görünüm.",
      "A digital presence that explains services clearly, drives fast mobile action and strengthens local trust.",
      "حضور رقمي يوضح الخدمات ويُسهّل الإجراء على الهاتف ويعزز الثقة المحلية.",
    ],
    [
      "Otomotiv sektörüne uygun daha teknik, net ve güven veren bir web sunumu.",
      "A more technical, clear and trustworthy web presence tailored to automotive.",
      "حضور ويب تقني وواضح وموثوق يناسب قطاع السيارات.",
    ],
    [
      "Güçlü bir görsel karakter etrafında şekillenen marka ve dijital deneyim çalışması.",
      "A brand and digital experience shaped around a bold visual character.",
      "تجربة علامة ورقمية مبنية حول شخصية بصرية قوية.",
    ],
    [
      "Ürünü öne çıkaran, daha yumuşak ve görsel ağırlıklı bir dijital vitrin yaklaşımı.",
      "A softer, visual-first digital showcase that puts the product at the center.",
      "واجهة رقمية ناعمة وبصرية تضع المنتج في المقدمة.",
    ],
    [
      "Güzel görünmek yetmez.",
      "Looking good is not enough.",
      "المظهر الجميل لا يكفي.",
    ],
    ["İşe yaramalı.", "It has to work.", "يجب أن ينجح."],
    ["Bir sonraki proje", "The next project", "المشروع التالي"],
    ["Sizin markanız için", "For your brand,", "لعلامتك،"],
    [
      "neyi daha iyi yapabiliriz?",
      "what can we make better?",
      "ما الذي يمكننا تحسينه؟",
    ],
    ["Brief gönderin ↗", "Send a brief ↗", "أرسل ملخص المشروع ↗"],
    [
      "AuraMenu — Dijital Menü Tasarımları | AuraDigital",
      "AuraMenu — Digital Menu Designs | AuraDigital",
      "AuraMenu — تصاميم القوائم الرقمية | AuraDigital",
    ],
    ["Menünüzü açmadan önce", "Before opening the menu,", "قبل فتح القائمة،"],
    ["tasarımınızı seçin.", "choose your design.", "اختر تصميمك."],
    [
      "AuraMenu, restoran ve kafeler için tek tip bir QR menü değildir. Beğendiğiniz tasarım yönünü seçin; logonuzu, renklerinizi, ürünlerinizi ve gerekli dilleri işletmenize göre uyarlayalım.",
      "AuraMenu is not a one-size-fits-all QR menu. Choose a design direction you like and we will adapt your logo, colors, products and languages to your business.",
      "AuraMenu ليست قائمة QR موحدة للجميع. اختر التصميم الذي يعجبك وسنكيّف الشعار والألوان والمنتجات واللغات مع نشاطك.",
    ],
    ["Tasarımları keşfet ↓", "Explore designs ↓", "استكشف التصاميم ↓"],
    [
      "Kendi tasarımımı istiyorum ↗",
      "I want a custom design ↗",
      "أريد تصميماً خاصاً ↗",
    ],
    ["Bir stil seçin.", "Choose a style.", "اختر أسلوباً."],
    [
      "Gerisini markanıza uyduralım.",
      "We will tailor the rest to your brand.",
      "ونكيّف الباقي مع علامتك.",
    ],
    [
      "Aşağıdaki tasarımlar başlangıç yönleridir. Renk, tipografi, kategori yapısı, fotoğraf kullanımı ve dil seçenekleri değiştirilebilir.",
      "These designs are starting directions. Colors, typography, category structure, photography and languages can all be customized.",
      "هذه التصاميم نقطة بداية. يمكن تخصيص الألوان والخطوط وهيكل الفئات والصور واللغات.",
    ],
    ["AuraMenu kurulumu", "AuraMenu setup", "إعداد AuraMenu"],
    ["'den başlayan", "starting from", "ابتداءً من"],
    [
      "Mobil tasarım · QR yayınlama · marka uyarlaması · temel ürün kurulumu",
      "Mobile design · QR publishing · brand adaptation · basic product setup",
      "تصميم للهاتف · نشر QR · تكييف العلامة · إعداد المنتجات الأساسي",
    ],
    [
      "Dönen yemek kategorileri, öne çıkan ürünler ve WhatsApp siparişiyle etkileşimli orbit tarzı menü.",
      "Interactive orbit-style menu with rotating food categories, spotlight products and WhatsApp ordering.",
      "قائمة تفاعلية بنمط المدار مع فئات طعام دوارة ومنتجات بارزة وطلب عبر WhatsApp.",
    ],
    [
      "Premium kartlar, büyük yemek vitrinleri ve lüks stil ile zarif restoran menüsü.",
      "Elegant restaurant menu with premium cards, large food showcases and luxury styling.",
      "قائمة مطعم أنيقة ببطاقات فاخرة وعروض كبيرة للأطباق وتصميم راقٍ.",
    ],
    [
      "Yüzen ürün kartları ve etkileyici ürün geçişleriyle animasyonlu 3D yemek sunumu.",
      "Animated 3D food presentation with floating product cards and immersive product switching.",
      "عرض طعام ثلاثي الأبعاد متحرك مع بطاقات منتجات عائمة وانتقالات غامرة بين المنتجات.",
    ],
    [
      "Restoranlar, kafeler ve delivery için optimize edilmiş mobile-first menü tasarımı.",
      "Mobile-first menu design optimized for restaurants, cafés and delivery.",
      "تصميم قائمة للهاتف أولاً ومحسّن للمطاعم والمقاهي وخدمات التوصيل.",
    ],
    ["Open Design ↗", "Open Design ↗", "افتح التصميم ↗"],
    ["Bu tasarımı seç →", "Choose this design →", "اختر هذا التصميم ←"],
    [
      "Özel tasarım iste ↗",
      "Request custom design ↗",
      "اطلب تصميماً خاصاً ↗",
    ],
    ["Her tasarımda", "With every design", "في كل تصميم"],
    ["Görünüm değişir.", "The look changes.", "المظهر يتغير."],
    ["Standart değişmez.", "The standard does not.", "المعيار ثابت."],
    ["Telefon için tasarım", "Designed for phones", "مصمم للهاتف"],
    ["Markanıza uyarlanır", "Adapted to your brand", "يُكيّف مع علامتك"],
    ["Çoklu dil", "Multiple languages", "لغات متعددة"],
    ["Kolay güncelleme", "Easy updates", "تحديث سهل"],
    ["AuraMenu başlangıç", "Start with AuraMenu", "ابدأ مع AuraMenu"],
    ["Bir tasarım beğendiniz mi?", "Found a design you like?", "أعجبك تصميم؟"],
    ["Markanıza uyarlayalım.", "Let's make it yours.", "لنجعله لعلامتك."],
    [
      "AuraMenu teklifi alın ↗",
      "Get an AuraMenu quote ↗",
      "احصل على عرض AuraMenu ↗",
    ],
    ["NFC ile birleştirin", "Combine with NFC", "ادمجه مع NFC"],
    ["İşletmenizin", "Like your business's", "مثل فريق"],
    ["dijital ekibi gibi.", "digital team.", "رقمي لأعمالك."],
    [
      "Stratejiden tasarıma, reklamdan web sitesine kadar ekibinizle birlikte çalışır; dijital tarafın düzenli ilerlemesini sağlarız.",
      "From strategy and design to advertising and websites, we work alongside your team to keep the digital side moving consistently.",
      "من الاستراتيجية والتصميم إلى الإعلانات والمواقع، نعمل إلى جانب فريقك لضمان تقدم الجانب الرقمي باستمرار.",
    ],
    [
      "Çalışma modelimizi görün ↗",
      "See how we work ↗",
      "شاهد طريقة عملنا ↗",
    ],
    [
      "İşletmenize sadece içerik değil,",
      "We give your business more than content —",
      "لا نقدم لأعمالك محتوى فقط،",
    ],
    ["hareket kazandırıyoruz.", "we create momentum.", "بل نصنع حركة ونمواً."],
    [
      "Ekibimiz markayı anlar, kampanyayı tasarlar, doğru kanallarda yayınlar ve sonucu takip eder. Web sitesi, reklam ve içerik aynı hedef için birlikte çalışır.",
      "Our team understands the brand, designs the campaign, launches on the right channels and tracks the result. Website, ads and content work toward the same goal.",
      "يفهم فريقنا العلامة ويصمم الحملة وينشرها في القنوات المناسبة ويتابع النتائج. يعمل الموقع والإعلانات والمحتوى لتحقيق هدف واحد.",
    ],
    [
      "Müşterinin gördüğü reklamdan, tıkladığı landing page'e ve gönderdiği WhatsApp mesajına kadar akışı tek sistem gibi tasarlıyoruz.",
      "From the ad a customer sees to the landing page they click and the WhatsApp message they send, we design the journey as one system.",
      "من الإعلان الذي يراه العميل إلى صفحة الهبوط التي يضغط عليها ورسالة WhatsApp التي يرسلها، نصمم الرحلة كنظام واحد.",
    ],
    [
      "Bir kampanya başlatalım ↗",
      "Let's launch a campaign ↗",
      "لنطلق حملة ↗",
    ],
    [
      "İşletmeyi ve hedefi anlarız.",
      "We understand the business and its goal.",
      "نفهم النشاط وهدفه.",
    ],
    [
      "Web, içerik ve reklam kreatifini üretiriz.",
      "We create the web, content and ad creative.",
      "نصمم الموقع والمحتوى وإبداعات الإعلان.",
    ],
    [
      "Doğru kanalda müşteriye ulaşırız.",
      "We reach customers on the right channel.",
      "نصل إلى العملاء عبر القناة المناسبة.",
    ],
    [
      "Veriyi takip eder, iyileştiririz.",
      "We track the data and improve.",
      "نتابع البيانات ونحسّن الأداء.",
    ],
    [
      "Canlı siteyi ziyaret et ↗",
      "Visit live site ↗",
      "زيارة الموقع المباشر ↗",
    ],
    [
      "Canlı AuraMenu'yi gör ↗",
      "View live AuraMenu ↗",
      "شاهد AuraMenu مباشرة ↗",
    ],
    ["WhatsApp'tan gönder ↗", "Send via WhatsApp ↗", "إرسال عبر WhatsApp ↗"],
    ["700 TL'den başlayan", "Starting from 700 TL", "ابتداءً من 700 TL"],
    ["2.500 TL'den başlayan", "Starting from 2,500 TL", "ابتداءً من 2,500 TL"],
    [
      "Form gönderildiğinde mesajınız WhatsApp'ta +90 538 550 76 74 numarasına hazır olarak açılır. Göndermeden önce mesajı kontrol edebilirsiniz.",
      "Submitting opens your prepared message in WhatsApp for +90 538 550 76 74. You can review it before sending.",
      "عند إرسال النموذج ستفتح رسالتك جاهزة في WhatsApp للرقم +90 538 550 76 74. يمكنك مراجعتها قبل الإرسال.",
    ],
    ["Çerez tercihleri", "Cookie preferences", "تفضيلات ملفات الارتباط"],
    [
      "Daha iyi bir site deneyimi için gerekli depolamayı ve, izin verirseniz, gelecekteki performans ölçümlerini kullanabiliriz. Tercihinizi istediğiniz zaman değiştirebilirsiniz.",
      "We use necessary storage for a better site experience and, with your permission, may use performance measurement in the future. You can change your choice at any time.",
      "نستخدم التخزين الضروري لتحسين تجربة الموقع، وقد نستخدم قياس الأداء مستقبلاً بموافقتك. يمكنك تغيير اختيارك في أي وقت.",
    ],
    ["Sadece gerekli", "Necessary only", "الضرورية فقط"],
    ["Tümünü kabul et", "Accept all", "قبول الكل"],
    ["Hepsini reddet", "Reject all", "رفض الكل"],
    ["Çerez ayarları", "Cookie settings", "إعدادات ملفات الارتباط"],
    ["3D ürün önizleme", "3D product preview", "معاينة المنتج ثلاثية الأبعاد"],
    ["Kartı ekranda değil,", "See the card as", "شاهد البطاقة كـ"],
    ["ürün gibi görün.", "a real product.", "منتج حقيقي."],
    [
      "NFC ve QR kart tasarımını üretimden önce gerçek bir fiziksel ürün hissiyle sunuyoruz. Renk, mesaj, logo ve yönlendirme markanıza göre değişir.",
      "Preview the NFC and QR card design like a real physical product before production. Colors, message, logo and destination adapt to your brand.",
      "نقدم تصميم بطاقات NFC وQR كمنتج مادي حقيقي قبل الإنتاج. تتكيف الألوان والرسالة والشعار والوجهة مع علامتك.",
    ],
    [
      "QR + NFC fiziksel tasarım",
      "QR + NFC physical design",
      "تصميم QR + NFC المادي",
    ],
    ["Masanın üzerinde de", "Premium on the table,", "مظهر فاخر على الطاولة"],
    ["premium görünsün.", "not just on screen.", "وليس على الشاشة فقط."],
    [
      "Dijital menünün giriş noktasını da tasarlıyoruz: masa kartı, ödeme noktası veya paket üzerinde markanızla uyumlu QR ve NFC.",
      "We also design the entry point to your digital menu: branded QR and NFC for table cards, checkout points or packaging.",
      "نصمم أيضاً نقطة الدخول إلى قائمتك الرقمية: QR وNFC متوافقان مع علامتك لبطاقات الطاولة أو نقطة الدفع أو التغليف.",
    ],
    [
      "3D menü tasarımlarını gör ↗",
      "See 3D menu designs ↗",
      "شاهد تصاميم القائمة ثلاثية الأبعاد ↗",
    ],
    [
      "3D NFC ve QR kart önizlemesi",
      "3D NFC and QR card preview",
      "معاينة ثلاثية الأبعاد لبطاقات NFC وQR",
    ],
    [
      "3D QR menü ve NFC kart önizlemesi",
      "3D QR menu and NFC card preview",
      "معاينة ثلاثية الأبعاد لقائمة QR وبطاقة NFC",
    ],
    ["Sohbeti kapat", "Close chat", "إغلاق المحادثة"],
    ["Sorunuzu yazın…", "Type your question…", "اكتب سؤالك…"],
    ["Sorunuzu yazın", "Type your question", "اكتب سؤالك"],
    ["Gönder", "Send", "إرسال"],
    ["/ ay", "/ mo", "/ شهر"],
    ["/ hafta", "/ wk", "/ أسبوع"],
  ];
  const maps = { en: new Map(), ar: new Map() };
  rows.forEach(([tr, en, ar]) => {
    maps.en.set(tr, en);
    maps.ar.set(tr, ar);
  });
  const supported = ["tr", "en", "ar"];
  const originals = new WeakMap();
  const attrOriginals = new WeakMap();
  const originalTitle = document.title;
  function storageGet() {
    try {
      return localStorage.getItem("aura-lang");
    } catch {
      return null;
    }
  }
  function storageSet(v) {
    try {
      localStorage.setItem("aura-lang", v);
    } catch {}
  }
  function initial() {
    const q = new URLSearchParams(location.search).get("lang");
    if (supported.includes(q)) return q;
    const s = storageGet();
    return supported.includes(s) ? s : "tr";
  }
  function mapped(key, lang) {
    return lang === "tr" ? key : maps[lang].get(key) || key;
  }
  function translateTextNodes(lang) {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (!originals.has(n)) originals.set(n, n.nodeValue);
      const raw = originals.get(n),
        key = raw.trim().replace(/\s+/g, " ");
      if (!key) continue;
      const val = mapped(key, lang);
      const leading = raw.match(/^\s*/)?.[0] || "";
      const trailing = raw.match(/\s*$/)?.[0] || "";
      n.nodeValue = `${leading}${val}${trailing}`;
    }
  }
  function translateAttrs(lang) {
    document
      .querySelectorAll("[placeholder],[aria-label],[alt]")
      .forEach((el) => {
        let o = attrOriginals.get(el);
        if (!o) {
          o = {
            placeholder: el.getAttribute("placeholder"),
            ariaLabel: el.getAttribute("aria-label"),
            alt: el.getAttribute("alt"),
          };
          attrOriginals.set(el, o);
        }
        for (const [prop, attr] of [
          ["placeholder", "placeholder"],
          ["ariaLabel", "aria-label"],
          ["alt", "alt"],
        ]) {
          if (o[prop]) el.setAttribute(attr, mapped(o[prop], lang));
        }
      });
  }
  function syncLinks(lang) {
    document.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (!h || /^(https?:|mailto:|tel:|#)/i.test(h)) return;
      const parts = h.split("#"),
        pathAndQuery = parts[0],
        base = pathAndQuery.split("?")[0];
      if (!/\.html$/i.test(base)) return;
      const query = new URLSearchParams(pathAndQuery.split("?")[1] || "");
      query.set("lang", lang);
      a.setAttribute(
        "href",
        `${base}?${query.toString()}${parts[1] ? "#" + parts[1] : ""}`,
      );
    });
  }
  function setDir(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", lang === "ar");
  }
  function updateSwitcher(lang) {
    document
      .querySelectorAll("[data-lang]")
      .forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    const cur = document.querySelector(".lang-current-label");
    if (cur) cur.textContent = lang.toUpperCase();
  }
  function apply(lang, save = true) {
    if (!supported.includes(lang)) lang = "tr";
    setDir(lang);
    translateTextNodes(lang);
    translateAttrs(lang);
    document.title = mapped(originalTitle, lang);
    syncLinks(lang);
    updateSwitcher(lang);
    if (save) storageSet(lang);
    window.__auraLang = lang;
  }
  function period(mode) {
    const lang = window.__auraLang || initial();
    return mode === "weekly" ? mapped("/ hafta", lang) : mapped("/ ay", lang);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (!b) return;
    e.preventDefault();
    apply(b.dataset.lang);
    document.querySelector(".lang-menu")?.classList.remove("open");
    document
      .querySelector(".lang-current")
      ?.setAttribute("aria-expanded", "false");
  });
  window.AuraI18n = {
    setLanguage: apply,
    current: () => window.__auraLang || initial(),
    period,
  };
  apply(initial(), false);
})();
