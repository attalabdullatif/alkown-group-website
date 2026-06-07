// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Site Content Admin (CMS) — Complete Edition
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";

const BUCKET = "site-images";

const C = {
  gold:"#c9a84c", goldLight:"#f0d080",
  g400:"#7a6e5a", g600:"#3d342a", g800:"#1e1810",
  dark:"#1e1a14", darkMid:"#2a2418",
  beige:"#f5f0e8", warmWhite:"#fffdf8",
  success:"#27ae60", error:"#c0392b",
};
const ff = "'Dubai','Cairo','Noto Naskh Arabic',sans-serif";
const inp = {
  width:"100%", padding:"10px 14px",
  border:`1px solid rgba(201,168,76,.25)`,
  background:C.beige, color:C.g800,
  fontSize:".9rem", borderRadius:6, fontFamily:ff,
  outline:"none", boxSizing:"border-box", lineHeight:1.7,
};

const SECTION_LABELS = {
  "_media": "🖼️ مكتبة الصور",
  hero:        "🏠 الهيرو (الرئيسية)",
  nav:         "🧭 شريط التنقل",
  about:       "ℹ️ من نحن",
  divisions:   "🏗️ الأقسام الأربعة",
  citizenship: "🌍 برامج الجنسية",
  travel:      "✈️ السفر والتأشيرات",
  advertising: "📣 وكالة الإعلان",
  academy:     "🎓 أكاديمية المهارات",
  company_formation: "🏢 تأسيس الشركات",
  why:         "⭐ لماذا نحن",
  cta:         "📢 قسم الدعوة",
  contact:     "📞 معلومات التواصل",
  footer:      "🔻 الفوتر",
  company:     "🏢 معلومات الشركة",
  colors:      "🎨 الألوان",
  typography:  "✍️ الخطوط والأحجام",
};

// ── JSON helpers ───────────────────────────────────────────────
const defProg = (flag,na,ne,ta,te,min,time) =>
  JSON.stringify({flag,name_ar:na,name_en:ne,type_ar:ta,type_en:te,min,time,bg_color:"",bg_image:""});
const defCard = (icon,ta,te,sa,se,da,de) =>
  JSON.stringify({icon,title_ar:ta,title_en:te,sub_ar:sa,sub_en:se,desc_ar:da,desc_en:de,bg_color:"",bg_image:""});
const defSvc = (icon,ta,te,da,de) =>
  JSON.stringify({icon,title_ar:ta,title_en:te,desc_ar:da,desc_en:de,bg_color:"",bg_image:""});
const defCourse = (icon,ta,te,la,le,weeks,cert) =>
  JSON.stringify({icon,title_ar:ta,title_en:te,level_ar:la,level_en:le,weeks,cert,bg_color:"",bg_image:""});

// ─────────────────────────────────────────────────────────────
const DEFAULT_ROWS = [
  // ── HERO ───────────────────────────────────────────────────
  {section:"hero",key:"badge",        label_ar:"شارة فوق العنوان",       type:"text",    value_ar:"خدمات عالمية متميزة",            value_en:"Premium Global Services"},
  {section:"hero",key:"title_line1",  label_ar:"العنوان — السطر الأول",  type:"text",    value_ar:"تأشيرات · إقامة",               value_en:"Global Travel, Visas"},
  {section:"hero",key:"title_line2",  label_ar:"العنوان — السطر الثاني", type:"text",    value_ar:"وحلول سفر عالمية",              value_en:"& Residency Solutions"},
  {section:"hero",key:"subtitle",     label_ar:"النص التوضيحي",          type:"textarea",value_ar:"مركز التأشيرات  ·  برامج الإقامة  ·  تأسيس الشركات",value_en:"Visa Services · Residency Programs · Company Formation"},
  {section:"hero",key:"cta1",         label_ar:"الزر الأول (ذهبي)",      type:"text",    value_ar:"تحقق من تأشيرتك",               value_en:"Check Visa Requirements"},
  {section:"hero",key:"cta2",         label_ar:"الزر الثاني",            type:"text",    value_ar:"قدّم طلبك الآن",               value_en:"Apply Now"},
  {section:"hero",key:"trust1",       label_ar:"شارة ثقة 1",             type:"text",    value_ar:"✅ خدمة موثوقة منذ 2014",        value_en:"✅ Trusted since 2014"},
  {section:"hero",key:"trust2",       label_ar:"شارة ثقة 2",             type:"text",    value_ar:"🌍 195+ دولة",                   value_en:"🌍 195+ Countries"},
  {section:"hero",key:"trust3",       label_ar:"شارة ثقة 3",             type:"text",    value_ar:"⚡ نتائج خلال دقائق",            value_en:"⚡ Results in minutes"},

  // ── NAV ────────────────────────────────────────────────────
  {section:"nav",key:"home",         label_ar:"رابط الرئيسية",          type:"text",value_ar:"الرئيسية",          value_en:"Home"},
  {section:"nav",key:"visa_center",  label_ar:"رابط مركز التأشيرات",    type:"text",value_ar:"مركز التأشيرات",    value_en:"Visa Center"},
  {section:"nav",key:"residency",    label_ar:"رابط برامج الإقامة",     type:"text",value_ar:"برامج الإقامة",     value_en:"Residency Programs"},
  {section:"nav",key:"company",      label_ar:"رابط تأسيس الشركات",     type:"text",value_ar:"تأسيس الشركات",     value_en:"Company Formation"},
  {section:"nav",key:"travel",       label_ar:"رابط السفر والسياحة",    type:"text",value_ar:"السفر والسياحة",    value_en:"Travel & Tourism"},
  {section:"nav",key:"knowledge",    label_ar:"رابط مركز المعرفة",      type:"text",value_ar:"مركز المعرفة",      value_en:"Knowledge Center"},
  {section:"nav",key:"about",        label_ar:"رابط من نحن",            type:"text",value_ar:"من نحن",            value_en:"About Us"},
  {section:"nav",key:"contact",      label_ar:"رابط التواصل",           type:"text",value_ar:"تواصل معنا",        value_en:"Contact"},
  {section:"nav",key:"book_btn",     label_ar:"زر احجز استشارة",        type:"text",value_ar:"احجز استشارة",      value_en:"Book Consultation"},
  {section:"nav",key:"dashboard",    label_ar:"زر لوحة التحكم",         type:"text",value_ar:"لوحة التحكم",       value_en:"Dashboard"},
  {section:"nav",key:"citizenship",  label_ar:"رابط برامج الجنسية",     type:"text",value_ar:"برامج الجنسية",     value_en:"Citizenship"},
  {section:"nav",key:"advertising",  label_ar:"رابط وكالة الإعلان",     type:"text",value_ar:"وكالة الإعلان",     value_en:"Advertising"},
  {section:"nav",key:"academy",      label_ar:"رابط الأكاديمية",        type:"text",value_ar:"أكاديمية المهارات",  value_en:"Academy"},

  // ── ABOUT ──────────────────────────────────────────────────
  {section:"about",key:"label",       label_ar:"تسمية القسم",     type:"text",    value_ar:"من نحن",                value_en:"Who We Are"},
  {section:"about",key:"title",       label_ar:"عنوان القسم",     type:"textarea",value_ar:"استشارات متميزة\nمبنية على الثقة",value_en:"A Premium Consultancy\nBuilt on Trust"},
  {section:"about",key:"description", label_ar:"وصف الشركة",      type:"textarea",value_ar:"مجموعة الكون هي مجموعة مؤسسية متميزة مقرها الإمارات العربية المتحدة، تقدم خدمات عالمية المستوى في مجالات السفر والجنسية والإعلان والتعليم.",value_en:"Alkown Group is a UAE-based premium corporate group delivering world-class services in travel, citizenship, branding, and education."},
  {section:"about",key:"stat1_value", label_ar:"إحصاء 1 — الرقم", type:"text",    value_ar:"5,000+",     value_en:"5,000+"},
  {section:"about",key:"stat1_label", label_ar:"إحصاء 1 — النص",  type:"text",    value_ar:"عميل راضٍ",  value_en:"Happy Clients"},
  {section:"about",key:"stat2_value", label_ar:"إحصاء 2 — الرقم", type:"text",    value_ar:"15+",        value_en:"15+"},
  {section:"about",key:"stat2_label", label_ar:"إحصاء 2 — النص",  type:"text",    value_ar:"دولة",       value_en:"Countries"},
  {section:"about",key:"stat3_value", label_ar:"إحصاء 3 — الرقم", type:"text",    value_ar:"98%",        value_en:"98%"},
  {section:"about",key:"stat3_label", label_ar:"إحصاء 3 — النص",  type:"text",    value_ar:"نسبة النجاح",value_en:"Success Rate"},
  {section:"about",key:"stat4_value", label_ar:"إحصاء 4 — الرقم", type:"text",    value_ar:"10+",        value_en:"10+"},
  {section:"about",key:"stat4_label", label_ar:"إحصاء 4 — النص",  type:"text",    value_ar:"سنوات خبرة", value_en:"Years of Excellence"},

  // ── DIVISIONS ──────────────────────────────────────────────
  {section:"divisions",key:"label",  label_ar:"تسمية القسم", type:"text",value_ar:"أقسامنا",              value_en:"Our Divisions"},
  {section:"divisions",key:"title",  label_ar:"عنوان القسم", type:"text",value_ar:"أربعة محاور للتميز",   value_en:"Four Pillars of Excellence"},
  {section:"divisions",key:"card_1", label_ar:"✈️ قسم 1 — السفر والتأشيرات",   type:"card",
    value_ar:defCard("✈","السفر والتأشيرات","Travel & Visas","التنقل العالمي","Global Mobility","تأشيرات سياحية وتجارية واستثمارية · خدمات VIP · حجز رحلات وفنادق · كونسيرج المطار","Tourist, business & investor visas · VIP travel services · Flight & hotel booking · Airport concierge"),value_en:""},
  {section:"divisions",key:"card_2", label_ar:"🌍 قسم 2 — برامج الجنسية",      type:"card",
    value_ar:defCard("🌍","برامج الجنسية","Citizenship Programs","الإقامة العالمية","Global Residency","جواز سفر ثانٍ · الإقامة بالاستثمار · هجرة المستثمرين · مقارنة الدول","Second passport programs · Residency by investment · Investor immigration · Country comparison"),value_en:""},
  {section:"divisions",key:"card_3", label_ar:"◈ قسم 3 — وكالة الإعلان",       type:"card",
    value_ar:defCard("◈","وكالة الإعلان","Advertising Agency","التميز الإبداعي","Creative Excellence","هوية بصرية · سوشيال ميديا · موشن جرافيك · إنتاج فيديو · حملات تسويقية","Brand identity · Social media · Motion graphics · Video production · Marketing campaigns"),value_en:""},
  {section:"divisions",key:"card_4", label_ar:"🎓 قسم 4 — أكاديمية المهارات",  type:"card",
    value_ar:defCard("🎓","أكاديمية المهارات","Skills Academy","التعليم المتميز","Premium Education","دورات لغات · مهارات أعمال · تدريب رقمي · برامج معتمدة عبر الإنترنت","Language courses · Business skills · Digital training · Certified online programs"),value_en:""},

  // ── CITIZENSHIP ────────────────────────────────────────────
  {section:"citizenship",key:"section_label",label_ar:"تسمية القسم",type:"text",value_ar:"برامج الجنسية والإقامة",value_en:"Citizenship & Residency Programs"},
  {section:"citizenship",key:"section_title",label_ar:"عنوان القسم", type:"text",value_ar:"مسارك نحو التنقل العالمي",value_en:"Your Path to Global Mobility"},
  {section:"citizenship",key:"program_1",label_ar:"🇵🇹 برنامج 1 — البرتغال",  type:"program",value_ar:defProg("🇵🇹","البرتغال","Portugal","برنامج الإقامة الدائمة","Golden Visa","€28,000","5-8 أشهر"),value_en:""},
  {section:"citizenship",key:"program_2",label_ar:"🇬🇷 برنامج 2 — اليونان",   type:"program",value_ar:defProg("🇬🇷","اليونان","Greece","تأشيرة ذهبية","Golden Visa","€250,000","6-12 شهر"),value_en:""},
  {section:"citizenship",key:"program_3",label_ar:"🇲🇹 برنامج 3 — مالطا",     type:"program",value_ar:defProg("🇲🇹","مالطا","Malta","جنسية","Citizenship","€690,000","12-24 شهر"),value_en:""},
  {section:"citizenship",key:"program_4",label_ar:"🇦🇪 برنامج 4 — الإمارات",  type:"program",value_ar:defProg("🇦🇪","الإمارات","UAE","تأشيرة ذهبية","Golden Visa","2 مليون درهم","30-60 يوم"),value_en:""},
  {section:"citizenship",key:"program_5",label_ar:"🇨🇾 برنامج 5 — قبرص",      type:"program",value_ar:defProg("🇨🇾","قبرص","Cyprus","إقامة","Residency","€300,000","2-3 أشهر"),value_en:""},
  {section:"citizenship",key:"program_6",label_ar:"🇧🇧 برنامج 6 — الكاريبي",  type:"program",value_ar:defProg("🇧🇧","الكاريبي","Caribbean","جنسية","Citizenship","$100,000","3-6 أشهر"),value_en:""},

  // ── TRAVEL ─────────────────────────────────────────────────
  {section:"travel",key:"hero_title",label_ar:"عنوان الصفحة",  type:"text",    value_ar:"السفر والتأشيرات",value_en:"Travel & Visas"},
  {section:"travel",key:"hero_sub",  label_ar:"النص الفرعي",    type:"text",    value_ar:"اكتشف العالم مع الكون",value_en:"Discover the World with Alkown"},
  {section:"travel",key:"intro",     label_ar:"مقدمة الصفحة",   type:"textarea",value_ar:"سواء كنت تخطط لعطلة أو تتوسع عالمياً في أعمالك، مجموعة الكون تقدم خدمات سفر وتأشيرات متكاملة بمعالجة VIP.",value_en:"Whether you're planning a holiday or expanding your business globally, Alkown Group offers end-to-end travel and visa services with VIP handling."},
  {section:"travel",key:"service_1", label_ar:"خدمة 1",type:"card",value_ar:defSvc("🛂","تأشيرات سياحية","Tourist Visas","معالجة سلسة لتأشيرات أفضل الوجهات","Smooth visa processing for top destinations worldwide"),value_en:""},
  {section:"travel",key:"service_2", label_ar:"خدمة 2",type:"card",value_ar:defSvc("💼","تأشيرات الأعمال","Business Visas","دعم احترافي للسفر التجاري والاجتماعات","Professional support for corporate travel and meetings"),value_en:""},
  {section:"travel",key:"service_3", label_ar:"خدمة 3",type:"card",value_ar:defSvc("💰","تأشيرات المستثمرين","Investor Visas","مساعدة كاملة لبرامج تأشيرات المستثمرين والرياديين","Full assistance for investor and entrepreneur visa programs"),value_en:""},
  {section:"travel",key:"service_4", label_ar:"خدمة 4",type:"card",value_ar:defSvc("✈","حجز الرحلات","Flight Booking","حجز رحلات متميز — اقتصادي وبزنس وطائرات خاصة","Premium flight booking — economy, business & private jets"),value_en:""},
  {section:"travel",key:"service_5", label_ar:"خدمة 5",type:"card",value_ar:defSvc("🏨","حجز الفنادق","Hotel Booking","حجوزات فندقية فاخرة مختارة حول العالم","Curated luxury hotel reservations worldwide"),value_en:""},
  {section:"travel",key:"service_6", label_ar:"خدمة 6",type:"card",value_ar:defSvc("👑","خدمات VIP","VIP Assistance","كونسيرج المطار والمسار السريع وصالة كبار الشخصيات","Airport concierge, fast-track, and VIP lounge access"),value_en:""},

  // ── ADVERTISING ────────────────────────────────────────────
  {section:"advertising",key:"hero_title",label_ar:"عنوان الصفحة",  type:"text",    value_ar:"وكالة الإعلان",value_en:"Advertising Agency"},
  {section:"advertising",key:"hero_sub",  label_ar:"النص الفرعي",    type:"text",    value_ar:"التميز الإبداعي يلتقي الاستراتيجية",value_en:"Creative Excellence Meets Strategy"},
  {section:"advertising",key:"intro",     label_ar:"مقدمة الصفحة",   type:"textarea",value_ar:"وكالة الكون للإعلان هي وكالة إبداعية متكاملة تجمع بين الجماليات الراقية والأداء المدفوع بالبيانات.",value_en:"Alkown Advertising is a full-service creative agency blending luxury aesthetics with data-driven performance."},
  {section:"advertising",key:"service_1", label_ar:"خدمة 1",type:"card",value_ar:defSvc("◈","الهوية البصرية","Brand Identity","الشعار والهوية البصرية ودليل العلامة التجارية","Logo, visual identity & brand guidelines"),value_en:""},
  {section:"advertising",key:"service_2", label_ar:"خدمة 2",type:"card",value_ar:defSvc("📱","السوشيال ميديا","Social Media","استراتيجية وإنشاء محتوى وإدارة المجتمع","Strategy, content creation & community management"),value_en:""},
  {section:"advertising",key:"service_3", label_ar:"خدمة 3",type:"card",value_ar:defSvc("🎬","موشن جرافيك","Motion Graphics","رسوم متحركة وتصميم حركي متميز","Premium animation and motion design"),value_en:""},
  {section:"advertising",key:"service_4", label_ar:"خدمة 4",type:"card",value_ar:defSvc("🎥","إنتاج الفيديو","Video Production","أفلام مؤسسية وإعلانات ومحتوى سينمائي","Corporate films, ads & cinematic content"),value_en:""},
  {section:"advertising",key:"service_5", label_ar:"خدمة 5",type:"card",value_ar:defSvc("🖥","تصميم UI/UX","UI/UX Design","واجهات رقمية جميلة تحقق نسب تحويل عالية","Beautiful, conversion-focused digital interfaces"),value_en:""},
  {section:"advertising",key:"service_6", label_ar:"خدمة 6",type:"card",value_ar:defSvc("📊","الحملات التسويقية","Marketing Campaigns","استراتيجية تسويقية متكاملة متعددة القنوات","Integrated multi-channel marketing strategy"),value_en:""},
  {section:"advertising",key:"service_7", label_ar:"خدمة 7",type:"card",value_ar:defSvc("🌐","تطوير المواقع","Web Development","مواقع إلكترونية متميزة وتطبيقات ويب","Premium websites and web applications"),value_en:""},
  {section:"advertising",key:"service_8", label_ar:"خدمة 8",type:"card",value_ar:defSvc("✍","استراتيجية المحتوى","Content Strategy","كتابة إعلانية ثنائية اللغة وتخطيط المحتوى","Bilingual copywriting and content planning"),value_en:""},

  // ── ACADEMY ────────────────────────────────────────────────
  {section:"academy",key:"hero_title",label_ar:"عنوان الصفحة",  type:"text",    value_ar:"أكاديمية المهارات",value_en:"Skills Academy"},
  {section:"academy",key:"hero_sub",  label_ar:"النص الفرعي",    type:"text",    value_ar:"تعلّم. انمُ. انجح.",value_en:"Learn. Grow. Succeed."},
  {section:"academy",key:"intro",     label_ar:"مقدمة الصفحة",   type:"textarea",value_ar:"أكاديمية الكون للمهارات تقدم برامج تطوير مهني مصممة للعالم الحديث. تعلّم من خبراء الصناعة واحصل على شهادات معترف بها وحوّل مسارك المهني.",value_en:"Alkown Skills Academy offers professional development programs designed for the modern world. Learn from industry experts, earn recognized certifications, and transform your career."},
  {section:"academy",key:"course_1",  label_ar:"دورة 1",type:"course",value_ar:defCourse("🗣","الإنجليزية للأعمال","Business English","جميع المستويات","All Levels",8,true),value_en:""},
  {section:"academy",key:"course_2",  label_ar:"دورة 2",type:"course",value_ar:defCourse("📢","التسويق الرقمي","Digital Marketing","مبتدئ–متقدم","Beginner–Advanced",10,true),value_en:""},
  {section:"academy",key:"course_3",  label_ar:"دورة 3",type:"course",value_ar:defCourse("🎨","الجرافيك ديزاين","Graphic Design","مبتدئ–احترافي","Beginner–Pro",12,true),value_en:""},
  {section:"academy",key:"course_4",  label_ar:"دورة 4",type:"course",value_ar:defCourse("💻","تطوير الويب","Web Development","مبتدئ–متقدم","Beginner–Advanced",16,true),value_en:""},
  {section:"academy",key:"course_5",  label_ar:"دورة 5",type:"course",value_ar:defCourse("📈","القيادة والإدارة","Leadership & Management","متوسط","Intermediate",6,true),value_en:""},
  {section:"academy",key:"course_6",  label_ar:"دورة 6",type:"course",value_ar:defCourse("💹","التخطيط المالي","Financial Planning","جميع المستويات","All Levels",8,true),value_en:""},

  // ── WHY ────────────────────────────────────────────────────
  {section:"why",key:"label",       label_ar:"تسمية القسم",     type:"text",    value_ar:"لماذا نحن",      value_en:"Why Choose Us"},
  {section:"why",key:"title",       label_ar:"عنوان القسم",     type:"text",    value_ar:"الفارق مع الكون",value_en:"The Alkown Difference"},
  {section:"why",key:"item1_icon",  label_ar:"أيقونة 1",        type:"text",    value_ar:"⚡",value_en:"⚡"},
  {section:"why",key:"item1_title", label_ar:"ميزة 1 — عنوان",  type:"text",    value_ar:"إنجاز سريع",     value_en:"Fast Processing"},
  {section:"why",key:"item1_desc",  label_ar:"ميزة 1 — وصف",    type:"textarea",value_ar:"إجراءات مبسطة وأوقات تسليم سريعة مع أقل قدر من الأوراق الرسمية.",value_en:"Streamlined procedures with rapid turnaround times."},
  {section:"why",key:"item2_icon",  label_ar:"أيقونة 2",        type:"text",    value_ar:"🤝",value_en:"🤝"},
  {section:"why",key:"item2_title", label_ar:"ميزة 2 — عنوان",  type:"text",    value_ar:"شراكات عالمية",  value_en:"Global Partnerships"},
  {section:"why",key:"item2_desc",  label_ar:"ميزة 2 — وصف",    type:"textarea",value_ar:"علاقات موثوقة مع المؤسسات والسفارات والوكالات حول العالم.",value_en:"Trusted relationships with institutions, embassies, and agencies worldwide."},
  {section:"why",key:"item3_icon",  label_ar:"أيقونة 3",        type:"text",    value_ar:"🛡",value_en:"🛡"},
  {section:"why",key:"item3_title", label_ar:"ميزة 3 — عنوان",  type:"text",    value_ar:"سرية تامة",      value_en:"100% Confidential"},
  {section:"why",key:"item3_desc",  label_ar:"ميزة 3 — وصف",    type:"textarea",value_ar:"خصوصيتك وأمانك محميان بالكامل في كل مرحلة.",value_en:"Your privacy and security are fully protected at every stage."},
  {section:"why",key:"item4_icon",  label_ar:"أيقونة 4",        type:"text",    value_ar:"👑",value_en:"👑"},
  {section:"why",key:"item4_title", label_ar:"ميزة 4 — عنوان",  type:"text",    value_ar:"تجربة VIP",      value_en:"VIP Experience"},
  {section:"why",key:"item4_desc",  label_ar:"ميزة 4 — وصف",    type:"textarea",value_ar:"خدمة كونسيرج شخصية مصممة من البداية حتى النهاية.",value_en:"Personalized concierge service tailored from start to finish."},
  {section:"why",key:"item5_icon",  label_ar:"أيقونة 5",        type:"text",    value_ar:"📋",value_en:"📋"},
  {section:"why",key:"item5_title", label_ar:"ميزة 5 — عنوان",  type:"text",    value_ar:"امتثال كامل",    value_en:"Full Compliance"},
  {section:"why",key:"item5_desc",  label_ar:"ميزة 5 — وصف",    type:"textarea",value_ar:"جميع خدماتنا مرخصة وموافقة قانونياً وفق أنظمة الإمارات.",value_en:"All services are fully licensed and legally compliant."},
  {section:"why",key:"item6_icon",  label_ar:"أيقونة 6",        type:"text",    value_ar:"💬",value_en:"💬"},
  {section:"why",key:"item6_title", label_ar:"ميزة 6 — عنوان",  type:"text",    value_ar:"دعم 24/7",       value_en:"24/7 Support"},
  {section:"why",key:"item6_desc",  label_ar:"ميزة 6 — وصف",    type:"textarea",value_ar:"فريق متعدد اللغات متاح دائماً لخدمتك في أي وقت.",value_en:"A dedicated multilingual team always available to serve you."},

  // ── CTA ────────────────────────────────────────────────────
  {section:"cta",key:"title",   label_ar:"عنوان قسم الدعوة",  type:"textarea",value_ar:"مستعد لبدء\nرحلتك؟",  value_en:"Ready to Begin\nYour Journey?"},
  {section:"cta",key:"subtitle",label_ar:"النص التوضيحي",      type:"textarea",value_ar:"احجز استشارة مجانية مع خبرائنا — بدون أي التزام، توجيه خالص.",value_en:"Book a free consultation with our experts — no obligation, pure guidance."},
  {section:"cta",key:"btn1",    label_ar:"الزر الأول",         type:"text",    value_ar:"احجز استشارة",     value_en:"Book Consultation"},
  {section:"cta",key:"btn2",    label_ar:"الزر الثاني",        type:"text",    value_ar:"تواصل عبر واتساب", value_en:"WhatsApp Us Now"},

  // ── CONTACT ────────────────────────────────────────────────
  {section:"contact",key:"phone1",       label_ar:"📱 هاتف 1",                  type:"phone",value_ar:"+90 534 764 1249",      value_en:"+90 534 764 1249"},
  {section:"contact",key:"phone1_wa",    label_ar:"واتساب 1 (بدون +)",          type:"phone",value_ar:"905347641249",           value_en:"905347641249"},
  {section:"contact",key:"phone1_label", label_ar:"تسمية الهاتف 1",             type:"text", value_ar:"إسطنبول",               value_en:"Istanbul"},
  {section:"contact",key:"phone2",       label_ar:"📱 هاتف 2",                  type:"phone",value_ar:"+971 54 490 9522",      value_en:"+971 54 490 9522"},
  {section:"contact",key:"phone2_wa",    label_ar:"واتساب 2 (بدون +)",          type:"phone",value_ar:"971544909522",           value_en:"971544909522"},
  {section:"contact",key:"phone2_label", label_ar:"تسمية الهاتف 2",             type:"text", value_ar:"دبي",                   value_en:"Dubai"},
  {section:"contact",key:"phone3",       label_ar:"📱 هاتف 3",                  type:"phone",value_ar:"+963 980 631 952",      value_en:"+963 980 631 952"},
  {section:"contact",key:"phone3_wa",    label_ar:"واتساب 3 (بدون +)",          type:"phone",value_ar:"963980631952",           value_en:"963980631952"},
  {section:"contact",key:"phone3_label", label_ar:"تسمية الهاتف 3",             type:"text", value_ar:"حلب",                   value_en:"Aleppo"},
  {section:"contact",key:"email",        label_ar:"📧 البريد الإلكتروني",        type:"email",value_ar:"info@alkownglobal.com", value_en:"info@alkownglobal.com"},
  {section:"contact",key:"email2",       label_ar:"📧 بريد إلكتروني ثانٍ",      type:"email",value_ar:"",value_en:""},
  {section:"contact",key:"address",      label_ar:"📍 العنوان",                  type:"text", value_ar:"إسطنبول · دبي · حلب",  value_en:"Istanbul · Dubai · Aleppo"},
  {section:"contact",key:"whatsapp_main",label_ar:"💬 واتساب الرئيسي",          type:"phone",value_ar:"971544909522",           value_en:"971544909522"},
  {section:"contact",key:"instagram",    label_ar:"📸 رابط انستغرام",            type:"url",  value_ar:"https://instagram.com/alkownglobal",value_en:"https://instagram.com/alkownglobal"},
  {section:"contact",key:"facebook",     label_ar:"📘 رابط فيسبوك",              type:"url",  value_ar:"https://facebook.com/alkownglobal", value_en:"https://facebook.com/alkownglobal"},
  {section:"contact",key:"twitter",      label_ar:"🐦 رابط تويتر/X",             type:"url",  value_ar:"",value_en:""},
  {section:"contact",key:"linkedin",     label_ar:"💼 رابط لينكدإن",             type:"url",  value_ar:"",value_en:""},
  {section:"contact",key:"tiktok",       label_ar:"🎵 رابط تيك توك",             type:"url",  value_ar:"",value_en:""},
  {section:"contact",key:"youtube",      label_ar:"▶️ رابط يوتيوب",              type:"url",  value_ar:"",value_en:""},

  // ── FOOTER ─────────────────────────────────────────────────
  {section:"footer",key:"tagline",          label_ar:"شعار الفوتر",              type:"text",    value_ar:"شريكك الموثوق نحو مستقبل أفضل",value_en:"Your trusted partner for a better future"},
  {section:"footer",key:"copyright",        label_ar:"نص حقوق النشر",            type:"text",    value_ar:"© 2026 الكون العالمية. جميع الحقوق محفوظة.",value_en:"© 2026 Alkown Global. All rights reserved."},
  {section:"footer",key:"newsletter_title", label_ar:"عنوان النشرة البريدية",    type:"text",    value_ar:"النشرة الإخبارية",             value_en:"Newsletter"},
  {section:"footer",key:"newsletter_sub",   label_ar:"وصف النشرة البريدية",      type:"textarea",value_ar:"ابق على اطلاع بأحدث عروضنا ورؤانا",value_en:"Stay updated with our latest offers & insights"},
  {section:"footer",key:"newsletter_ph",    label_ar:"نص placeholder حقل الإيميل",type:"text",  value_ar:"بريدك الإلكتروني",             value_en:"Your email address"},
  {section:"footer",key:"subscribe_btn",    label_ar:"نص زر الاشتراك",           type:"text",    value_ar:"اشترك",                        value_en:"Subscribe"},
  {section:"footer",key:"quick_links_title",label_ar:"عنوان روابط سريعة",        type:"text",    value_ar:"روابط سريعة",                  value_en:"Quick Links"},
  {section:"footer",key:"services_title",   label_ar:"عنوان قسم الخدمات",        type:"text",    value_ar:"خدماتنا",                      value_en:"Services"},
  {section:"footer",key:"contact_title",    label_ar:"عنوان قسم التواصل",        type:"text",    value_ar:"تواصل معنا",                   value_en:"Contact Us"},
  {section:"footer",key:"domain_text",      label_ar:"نص الدومين (أسفل يمين)",   type:"text",    value_ar:"ALKOWN.GLOBAL",                value_en:"ALKOWN.GLOBAL"},

  // ── COMPANY ────────────────────────────────────────────────
  {section:"company",key:"name_ar",  label_ar:"اسم الشركة عربي",    type:"text",value_ar:"الكون العالمية",    value_en:"Alkown Global"},
  {section:"company",key:"name_en",  label_ar:"اسم الشركة إنجليزي", type:"text",value_ar:"ALKOWN Global",     value_en:"ALKOWN Global"},
  {section:"company",key:"slogan_ar",label_ar:"شعار الشركة",         type:"text",value_ar:"بوابتك نحو العالم", value_en:"Your Gateway to the World"},

  // ── COMPANY FORMATION ──────────────────────────────────────
  // Hero
  {section:"company_formation",key:"hero_badge",    label_ar:"شارة الهيرو",           type:"text",    value_ar:"تأسيس الشركات",                 value_en:"Company Formation"},
  {section:"company_formation",key:"hero_title",    label_ar:"عنوان الهيرو",           type:"text",    value_ar:"أسّس شركتك في الإمارات وتركيا", value_en:"Start Your Company in UAE & Turkey"},
  {section:"company_formation",key:"hero_subtitle", label_ar:"النص التوضيحي",          type:"textarea",value_ar:"نتولى كل خطوة من التسجيل حتى الترخيص وفتح الحساب البنكي — أنت تركز على عملك، ونحن نهتم بالتفاصيل.",value_en:"We handle every step from registration to licensing and bank account opening — you focus on business, we handle the details."},
  {section:"company_formation",key:"hero_cta1",     label_ar:"الزر الأول",             type:"text",    value_ar:"احصل على استشارة مجانية",        value_en:"Get Free Consultation"},
  // Stats
  {section:"company_formation",key:"stat1_value",   label_ar:"إحصاء 1 — الرقم",       type:"text",    value_ar:"500+",           value_en:"500+"},
  {section:"company_formation",key:"stat1_label",   label_ar:"إحصاء 1 — النص",        type:"text",    value_ar:"شركة مؤسسة",     value_en:"Companies Founded"},
  {section:"company_formation",key:"stat2_value",   label_ar:"إحصاء 2 — الرقم",       type:"text",    value_ar:"48h",            value_en:"48h"},
  {section:"company_formation",key:"stat2_label",   label_ar:"إحصاء 2 — النص",        type:"text",    value_ar:"أسرع تأسيس",    value_en:"Fastest Setup"},
  {section:"company_formation",key:"stat3_value",   label_ar:"إحصاء 3 — الرقم",       type:"text",    value_ar:"4",              value_en:"4"},
  {section:"company_formation",key:"stat3_label",   label_ar:"إحصاء 3 — النص",        type:"text",    value_ar:"دول نعمل فيها", value_en:"Jurisdictions"},
  {section:"company_formation",key:"stat4_value",   label_ar:"إحصاء 4 — الرقم",       type:"text",    value_ar:"98%",            value_en:"98%"},
  {section:"company_formation",key:"stat4_label",   label_ar:"إحصاء 4 — النص",        type:"text",    value_ar:"نسبة النجاح",   value_en:"Success Rate"},
  // Jurisdictions (card)
  {section:"company_formation",key:"jurisdiction_1",label_ar:"🇦🇪 منطقة 1 — دبي البر الرئيسي", type:"card",
    value_ar:JSON.stringify({icon:"🇦🇪",title_ar:"دبي — البر الرئيسي",title_en:"Dubai Mainland",sub_ar:"5-10 أيام",sub_en:"5-10 days",desc_ar:"تجارة محلية حرة، بدون قيود قطاعية",desc_en:"Free local trade, no sector restrictions",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"jurisdiction_2",label_ar:"🏢 منطقة 2 — دبي المنطقة الحرة", type:"card",
    value_ar:JSON.stringify({icon:"🏢",title_ar:"دبي — المنطقة الحرة",title_en:"Dubai Free Zone",sub_ar:"3-7 أيام",sub_en:"3-7 days",desc_ar:"ملكية 100%، إعفاء ضريبي 50 عاماً",desc_en:"100% ownership, 50-year tax exemption",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"jurisdiction_3",label_ar:"🇹🇷 منطقة 3 — تركيا",              type:"card",
    value_ar:JSON.stringify({icon:"🇹🇷",title_ar:"تركيا",title_en:"Turkey",sub_ar:"7-14 يوم",sub_en:"7-14 days",desc_ar:"بيئة أعمال قوية، سوق أوروبي وآسيوي",desc_en:"Strong business environment, EU & Asian market",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"jurisdiction_4",label_ar:"🇬🇧 منطقة 4 — المملكة المتحدة",   type:"card",
    value_ar:JSON.stringify({icon:"🇬🇧",title_ar:"المملكة المتحدة",title_en:"United Kingdom",sub_ar:"24-48 ساعة",sub_en:"24-48 hours",desc_ar:"أسرع تسجيل شركات في العالم، سمعة عالمية",desc_en:"Fastest registration globally, worldwide reputation",bg_color:"",bg_image:""}),value_en:""},
  // Steps
  {section:"company_formation",key:"step_1",label_ar:"خطوة 1",type:"card",value_ar:JSON.stringify({icon:"💬",title_ar:"استشارة مجانية",   title_en:"Free Consultation",  desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"step_2",label_ar:"خطوة 2",type:"card",value_ar:JSON.stringify({icon:"🏢",title_ar:"اختيار نوع الشركة",  title_en:"Choose Company Type", desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"step_3",label_ar:"خطوة 3",type:"card",value_ar:JSON.stringify({icon:"📄",title_ar:"تجهيز الوثائق",     title_en:"Document Preparation",desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"step_4",label_ar:"خطوة 4",type:"card",value_ar:JSON.stringify({icon:"✅",title_ar:"التسجيل الرسمي",    title_en:"Official Registration",desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"step_5",label_ar:"خطوة 5",type:"card",value_ar:JSON.stringify({icon:"📋",title_ar:"الحصول على الرخصة",  title_en:"License Issuance",    desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"step_6",label_ar:"خطوة 6",type:"card",value_ar:JSON.stringify({icon:"🏦",title_ar:"فتح حساب بنكي",    title_en:"Bank Account Opening",desc_ar:"",desc_en:"",bg_color:"",bg_image:""}),value_en:""},
  // Packages
  {section:"company_formation",key:"package_1",label_ar:"🚀 باقة 1 — المبتدئ",  type:"package",
    value_ar:JSON.stringify({icon:"🚀",name_ar:"باقة المبتدئ",name_en:"Starter Package",price_ar:"يبدأ من 3,500 درهم",price_en:"From AED 3,500",popular:false,features_ar:["تسجيل الشركة","رخصة تجارية","عنوان تجاري","خدمة العملاء"],features_en:["Company Registration","Trade License","Business Address","Customer Support"],bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"package_2",label_ar:"💼 باقة 2 — الأعمال",  type:"package",
    value_ar:JSON.stringify({icon:"💼",name_ar:"باقة الأعمال",name_en:"Business Package",price_ar:"يبدأ من 7,000 درهم",price_en:"From AED 7,000",popular:true,features_ar:["كل ما في المبتدئ","فيزا المدير","حساب بنكي","مستشار قانوني","خدمة PRO"],features_en:["All Starter features","Manager Visa","Bank Account","Legal Advisor","PRO Services"],bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"package_3",label_ar:"👑 باقة 3 — المستثمر", type:"package",
    value_ar:JSON.stringify({icon:"👑",name_ar:"باقة المستثمر",name_en:"Investor Package",price_ar:"حسب الطلب",price_en:"Custom Pricing",popular:false,features_ar:["كل ما في الأعمال","إقامة المستثمر","الفيزا الذهبية","خدمة VIP كاملة","مستشار ضريبي"],features_en:["All Business features","Investor Residency","Golden Visa","Full VIP Service","Tax Advisor"],bg_color:"",bg_image:""}),value_en:""},
  // Why
  {section:"company_formation",key:"why_1",label_ar:"ميزة 1",type:"card",value_ar:JSON.stringify({icon:"⚡",title_ar:"تأسيس سريع",       title_en:"Fast Setup",         desc_ar:"خلال 48 ساعة لبعض الأنواع مع الوثائق الكاملة",desc_en:"As fast as 48 hours with full documentation",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"why_2",label_ar:"ميزة 2",type:"card",value_ar:JSON.stringify({icon:"🛡",title_ar:"امتثال قانوني",    title_en:"Legal Compliance",   desc_ar:"جميع الإجراءات معتمدة ومرخصة رسمياً",desc_en:"All procedures are officially certified",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"why_3",label_ar:"ميزة 3",type:"card",value_ar:JSON.stringify({icon:"💼",title_ar:"خدمة متكاملة",    title_en:"End-to-End Service", desc_ar:"من التسجيل حتى الحساب البنكي والفيزا",desc_en:"From registration to bank account and visa",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"why_4",label_ar:"ميزة 4",type:"card",value_ar:JSON.stringify({icon:"🌍",title_ar:"4 مناطق قضائية",  title_en:"4 Jurisdictions",   desc_ar:"الإمارات وتركيا والمملكة المتحدة وأكثر",desc_en:"UAE, Turkey, UK and more",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"why_5",label_ar:"ميزة 5",type:"card",value_ar:JSON.stringify({icon:"👑",title_ar:"دعم VIP",          title_en:"VIP Support",       desc_ar:"مستشارك الشخصي متاح طوال العملية",desc_en:"Your personal advisor available throughout",bg_color:"",bg_image:""}),value_en:""},
  {section:"company_formation",key:"why_6",label_ar:"ميزة 6",type:"card",value_ar:JSON.stringify({icon:"💰",title_ar:"أسعار تنافسية",   title_en:"Competitive Pricing",desc_ar:"باقات مرنة تناسب جميع أحجام الأعمال",desc_en:"Flexible packages for all business sizes",bg_color:"",bg_image:""}),value_en:""},
  // CTA
  {section:"company_formation",key:"cta_title",   label_ar:"عنوان الـ CTA",  type:"text",    value_ar:"جاهز لتأسيس شركتك؟",                          value_en:"Ready to Start Your Company?"},
  {section:"company_formation",key:"cta_subtitle", label_ar:"نص الـ CTA",     type:"textarea",value_ar:"تواصل معنا اليوم واحصل على استشارة مجانية.", value_en:"Contact us today for a free consultation."},
  {section:"company_formation",key:"cta_btn1",     label_ar:"زر CTA الأول",   type:"text",    value_ar:"احجز استشارة مجانية",                         value_en:"Book Free Consultation"},
  {section:"company_formation",key:"cta_btn2",     label_ar:"زر CTA الثاني",  type:"text",    value_ar:"تواصل معنا",                                  value_en:"Contact Us"},

  // ── COLORS ─────────────────────────────────────────────────
  {section:"colors",key:"primary",      label_ar:"الذهبي الرئيسي",    type:"color",value_ar:"#c9a84c",value_en:"#c9a84c"},
  {section:"colors",key:"primary_light",label_ar:"الذهبي الفاتح",     type:"color",value_ar:"#f0d080",value_en:"#f0d080"},
  {section:"colors",key:"dark_bg",      label_ar:"الخلفية الداكنة",   type:"color",value_ar:"#1e1a14",value_en:"#1e1a14"},
  {section:"colors",key:"text_main",    label_ar:"النص الرئيسي",      type:"color",value_ar:"#1e1810",value_en:"#1e1810"},
  {section:"colors",key:"text_sub",     label_ar:"النص الفرعي",       type:"color",value_ar:"#7a6e5a",value_en:"#7a6e5a"},
  {section:"colors",key:"bg_warm",      label_ar:"خلفية الصفحة",      type:"color",value_ar:"#fffdf8",value_en:"#fffdf8"},
  {section:"colors",key:"accent",       label_ar:"اللون التمييزي",     type:"color",value_ar:"#3498db",value_en:"#3498db"},

  // ── TYPOGRAPHY ─────────────────────────────────────────────
  {section:"typography",key:"font_arabic",      label_ar:"الخط العربي",           type:"fontselect",value_ar:"Cairo",                 value_en:"Cairo"},
  {section:"typography",key:"font_english",     label_ar:"الخط الإنجليزي",        type:"fontselect",value_ar:"Cormorant Garamond",    value_en:"Cormorant Garamond"},
  {section:"typography",key:"size_hero",        label_ar:"حجم عنوان الهيرو",      type:"text",      value_ar:"clamp(2.8rem,6vw,5.5rem)",value_en:"clamp(2.8rem,6vw,5.5rem)"},
  {section:"typography",key:"size_section",     label_ar:"حجم عناوين الأقسام",    type:"text",      value_ar:"clamp(1.8rem,4vw,3rem)",  value_en:"clamp(1.8rem,4vw,3rem)"},
  {section:"typography",key:"size_body",        label_ar:"حجم النص العادي",        type:"text",      value_ar:"1rem",                   value_en:"1rem"},
  {section:"typography",key:"size_small",       label_ar:"حجم النص الصغير",        type:"text",      value_ar:"0.85rem",                value_en:"0.85rem"},
  {section:"typography",key:"weight_title",     label_ar:"ثخانة العناوين",          type:"text",      value_ar:"800",                    value_en:"800"},
  {section:"typography",key:"line_height_body", label_ar:"تباعد الأسطر",            type:"text",      value_ar:"1.8",                    value_en:"1.8"},
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
async function saveRow(section, key, value_ar, value_en, label_ar, content_type) {
  return supabase.from("site_content").upsert(
    {section, key, value_ar, value_en, label_ar, content_type, is_active:true},
    {onConflict:"section,key"}
  );
}

async function deleteRow(section, key, isDynamic = false) {
  if (isDynamic) {
    // حذف كامل للحقول المضافة يدوياً
    return supabase.from("site_content").delete().match({section, key});
  } else {
    // إخفاء الحقل الافتراضي (is_active=false) بدلاً من الحذف
    return supabase.from("site_content").upsert(
      {section, key, is_active: false, value_ar:"", value_en:"", label_ar:"", content_type:"text"},
      {onConflict:"section,key"}
    );
  }
}

function SaveBtn({dirty,saving,saved,saveErr,onClick}) {
  if (saved) return <span style={{color:C.success,fontSize:".78rem",fontWeight:700}}>✓ تم الحفظ</span>;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
      {dirty && (
        <button onClick={onClick} disabled={saving} style={{
          padding:"7px 18px",background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
          border:"none",borderRadius:6,cursor:saving?"not-allowed":"pointer",
          color:C.dark,fontFamily:ff,fontWeight:700,fontSize:".82rem",opacity:saving?.7:1,
        }}>{saving?"⏳ جاري...":"💾 حفظ"}</button>
      )}
      {saveErr && (
        <div style={{
          color:C.error,fontSize:".72rem",background:"rgba(192,57,43,.1)",
          border:`1px solid rgba(192,57,43,.3)`,borderRadius:6,
          padding:"4px 10px",maxWidth:280,textAlign:"right",
        }}>❌ {saveErr}</div>
      )}
    </div>
  );
}

// ── Diagnostic Panel ───────────────────────────────────────────
function DiagnosticPanel({onClose}) {
  const [results,setResults]=useState([]);
  const [running,setRunning]=useState(false);

  const run = async () => {
    setRunning(true);
    setResults([]);
    const add = (label,ok,msg) => setResults(r=>[...r,{label,ok,msg}]);

    // 1. Connection
    try {
      const{error}=await supabase.from("site_content").select("count").limit(1);
      if(error) add("الاتصال بـ Supabase",false,error.message);
      else       add("الاتصال بـ Supabase",true,"متصل ✓");
    } catch(e){ add("الاتصال بـ Supabase",false,e.message); }

    // 2. Read
    try {
      const{data,error}=await supabase.from("site_content").select("*").limit(5);
      if(error) add("قراءة الجدول",false,error.message);
      else       add("قراءة الجدول",true,`${data?.length||0} صف موجود`);
    } catch(e){ add("قراءة الجدول",false,e.message); }

    // 3. Write test
    const testKey = `__test_${Date.now()}`;
    try {
      const{error}=await supabase.from("site_content").insert({
        section:"__test",key:testKey,value_ar:"test",value_en:"test",label_ar:"اختبار",content_type:"text",is_active:true
      });
      if(error) add("الكتابة للجدول",false,error.message);
      else {
        add("الكتابة للجدول",true,"نجح الحفظ ✓");
        // cleanup
        await supabase.from("site_content").delete().match({section:"__test",key:testKey});
      }
    } catch(e){ add("الكتابة للجدول",false,e.message); }

    // 4. Storage bucket
    try {
      const{error}=await supabase.storage.getBucket("site-images");
      if(error) add("Storage (site-images)",false,"الـ bucket غير موجود — أنشئه من Supabase → Storage");
      else       add("Storage (site-images)",true,"موجود ✓");
    } catch(e){ add("Storage (site-images)",false,e.message); }

    // 5. Auth
    try {
      const{data:{user}}=await supabase.auth.getUser();
      add("المستخدم الحالي",!!user, user ? `${user.email} (${user.id.slice(0,8)}...)` : "غير مسجل دخول — بعض العمليات تحتاج تسجيل");
    } catch(e){ add("المستخدم الحالي",false,e.message); }

    setRunning(false);
  };

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",
      display:"flex",alignItems:"center",justifyContent:"center",
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        background:"#fff",borderRadius:16,padding:28,width:"min(520px,92vw)",
        maxHeight:"85vh",overflowY:"auto",fontFamily:ff,direction:"rtl",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)",
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{color:C.g800,fontSize:"1.05rem",fontWeight:800}}>🔧 تشخيص الاتصال</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,fontSize:"1.3rem"}}>✕</button>
        </div>

        <button onClick={run} disabled={running} style={{
          width:"100%",padding:"12px",marginBottom:20,
          background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
          border:"none",borderRadius:8,cursor:running?"not-allowed":"pointer",
          color:C.dark,fontFamily:ff,fontWeight:800,fontSize:".95rem",
        }}>{running?"⏳ جاري الفحص...":"▶️ تشغيل الفحص"}</button>

        {results.map((r,i)=>(
          <div key={i} style={{
            display:"flex",gap:12,alignItems:"flex-start",
            padding:"10px 14px",borderRadius:8,marginBottom:8,
            background: r.ok ? "rgba(39,174,96,.08)" : "rgba(192,57,43,.08)",
            border:`1px solid ${r.ok?"rgba(39,174,96,.2)":"rgba(192,57,43,.2)"}`,
          }}>
            <span style={{fontSize:"1rem",marginTop:1}}>{r.ok?"✅":"❌"}</span>
            <div>
              <div style={{fontWeight:700,fontSize:".85rem",color:r.ok?C.success:C.error}}>{r.label}</div>
              <div style={{fontSize:".78rem",color:C.g600,marginTop:2}}>{r.msg}</div>
            </div>
          </div>
        ))}

        {results.length>0&&!running&&(
          <div style={{marginTop:16,padding:"12px 14px",background:"rgba(201,168,76,.06)",border:`1px solid rgba(201,168,76,.2)`,borderRadius:8,fontSize:".8rem",color:C.g600,lineHeight:1.7}}>
            💡 إذا فشل الاتصال: تأكد من تشغيل ملف SQL في Supabase → SQL Editor<br/>
            💡 إذا فشل الحفظ: اضغط "📥 تهيئة الكل" أولاً<br/>
            💡 إذا كانت Storage مفقودة: Supabase → Storage → New bucket → <strong>site-images</strong> → Public
          </div>
        )}
      </div>
    </div>
  );
}

function CardHeader({label_ar,section,keyName,dirty,saving,saved,saveErr,onSave,onDelete,isDynamic}) {
  const [confirmDel, setConfirmDel] = useState(false);

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); setTimeout(()=>setConfirmDel(false),3000); return; }
    await deleteRow(section, keyName, !!isDynamic);
    onDelete?.();
  };

  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
      <div>
        <div style={{fontWeight:700,color:C.g800,fontSize:".9rem"}}>{label_ar}</div>
        <div style={{color:C.g400,fontSize:".68rem",marginTop:2}}>{section}.{keyName}</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <SaveBtn dirty={dirty} saving={saving} saved={saved} onClick={onSave} />
        {onDelete && (
          <button onClick={handleDelete} title="حذف هذا الحقل" style={{
            padding:"6px 12px",
            background: confirmDel ? "rgba(192,57,43,.15)" : "rgba(192,57,43,.07)",
            border:`1px solid ${confirmDel ? C.error : "rgba(192,57,43,.2)"}`,
            borderRadius:6, cursor:"pointer", color:C.error,
            fontFamily:ff, fontSize:".78rem", fontWeight:700,
            transition:"all .2s",
          }}>
            {confirmDel ? "⚠️ تأكيد الحذف" : "🗑️"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADD NEW ROW PANEL
// ═══════════════════════════════════════════════════════════════
const TYPE_OPTIONS = [
  {value:"text",     label:"📝 نص قصير"},
  {value:"textarea", label:"📄 نص طويل"},
  {value:"card",     label:"🃏 بطاقة (مع خلفية)"},
  {value:"program",  label:"🌍 برنامج جنسية"},
  {value:"course",   label:"🎓 دورة تدريبية"},
  {value:"url",      label:"🔗 رابط URL"},
  {value:"phone",    label:"📱 رقم هاتف"},
  {value:"email",    label:"📧 بريد إلكتروني"},
  {value:"color",    label:"🎨 لون"},
];

function AddRowPanel({section, existingRows, onAdded}) {
  const [open,    setOpen]    = useState(false);
  const [type,    setType]    = useState("text");
  const [label,   setLabel]   = useState("");
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const genKey = () => {
    // Use section-aware prefix so MainWebsite can find the card
    const sectionPrefixMap = {
      travel:      { card:"service", course:"service", program:"service" },
      advertising: { card:"service", course:"service", program:"service" },
      academy:     { card:"course",  course:"course",  program:"course"  },
      citizenship: { card:"program", course:"program", program:"program" },
      divisions:   { card:"card",    course:"card",    program:"card"    },
      why:         { card:"item",    course:"item",    program:"item"    },
    };
    const sectionMap = sectionPrefixMap[section];
    const prefix = (sectionMap && sectionMap[type]) ||
      (type==="card"?"card": type==="course"?"course": type==="program"?"program":"field");
    const existing = existingRows.map(r=>r.key);
    let n = 1;
    while (existing.includes(`${prefix}_${n}`)) n++;
    return `${prefix}_${n}`;
  };

  const defaultVal = () => {
    if (type==="card")    return JSON.stringify({icon:"✨",title_ar:"عنوان جديد",title_en:"New Title",sub_ar:"",sub_en:"",desc_ar:"وصف",desc_en:"Description",bg_color:"",bg_image:""});
    if (type==="course")  return JSON.stringify({icon:"📚",title_ar:"دورة جديدة",title_en:"New Course",level_ar:"مبتدئ",level_en:"Beginner",weeks:8,cert:true,bg_color:"",bg_image:""});
    if (type==="program") return JSON.stringify({flag:"🌍",name_ar:"دولة جديدة",name_en:"New Country",type_ar:"نوع البرنامج",type_en:"Program Type",min:"",time:"",bg_color:"",bg_image:""});
    return "";
  };

  const handleAdd = async () => {
    if (!label.trim()) { setErr("⚠️ أدخل اسماً للحقل أولاً"); return; }
    setSaving(true); setErr("");
    try {
      const key = genKey();
      const dv  = defaultVal();
      const { error } = await supabase.from("site_content").insert({
        section,
        key,
        value_ar:     dv,
        value_en:     dv,
        label_ar:     label.trim(),
        content_type: type,
        is_active:    true,
      });
      if (error) throw error;
      setOpen(false);
      setLabel("");
      setType("text");
      onAdded?.();
    } catch(e) {
      console.error("AddRowPanel error:", e);
      setErr("❌ " + (e.message || "خطأ غير معروف — تحقق من قاعدة البيانات"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return (
    <button onClick={()=>setOpen(true)} style={{
      width:"100%", padding:"14px", marginTop:8,
      background:"rgba(201,168,76,.06)",
      border:`2px dashed rgba(201,168,76,.3)`,
      borderRadius:12, cursor:"pointer", color:C.gold,
      fontFamily:ff, fontSize:".88rem", fontWeight:700,
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      transition:"all .2s",
    }}>
      ➕ إضافة حقل / بطاقة / قسم جديد
    </button>
  );

  return (
    <div style={{background:"#fff",border:`2px solid ${C.gold}`,borderRadius:14,padding:"20px",marginTop:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <span style={{fontWeight:800,color:C.g800,fontSize:".95rem"}}>➕ إضافة جديد في: <span style={{color:C.gold}}>{SECTION_LABELS[section]||section}</span></span>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:C.g400,fontSize:"1.2rem",lineHeight:1}}>✕</button>
      </div>

      {/* Type selector */}
      <div style={{marginBottom:14}}>
        <label style={{display:"block",color:C.g600,fontSize:".78rem",fontWeight:700,marginBottom:8}}>نوع العنصر الجديد:</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {TYPE_OPTIONS.map(opt=>(
            <button key={opt.value} onClick={()=>setType(opt.value)} style={{
              padding:"7px 14px", borderRadius:20,
              background: type===opt.value ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.beige,
              border: type===opt.value ? "none" : `1px solid rgba(201,168,76,.25)`,
              cursor:"pointer", color: type===opt.value ? C.dark : C.g600,
              fontFamily:ff, fontSize:".8rem", fontWeight: type===opt.value?700:400,
              transition:"all .18s",
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Label input */}
      <div style={{marginBottom:14}}>
        <label style={{display:"block",color:C.g600,fontSize:".78rem",fontWeight:700,marginBottom:6}}>
          اسم الحقل (يظهر في الداشبورد):
        </label>
        <input
          type="text" value={label}
          onChange={e=>{setLabel(e.target.value);setErr("");}}
          placeholder="مثال: بطاقة خدمة جديدة، رابط تيليغرام..."
          style={{...inp, fontSize:".9rem"}}
          onKeyDown={e=>e.key==="Enter"&&handleAdd()}
          autoFocus
        />
        {err && (
          <div style={{
            background:"rgba(192,57,43,.1)", border:`1px solid ${C.error}`,
            borderRadius:8, padding:"10px 14px", marginTop:8,
            color:C.error, fontSize:".84rem", fontWeight:600,
          }}>{err}</div>
        )}
      </div>

      {/* Preview of key */}
      <div style={{marginBottom:16,padding:"8px 12px",background:C.beige,borderRadius:7}}>
        <span style={{color:C.g400,fontSize:".72rem"}}>المفتاح التلقائي: </span>
        <span style={{color:C.gold,fontFamily:"monospace",fontSize:".78rem",fontWeight:700}}>{section}.{genKey()}</span>
      </div>

      <div style={{display:"flex",gap:10}}>
        <button onClick={handleAdd} disabled={saving} style={{
          flex:1, padding:"11px",
          background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,
          border:"none", borderRadius:8, cursor:saving?"not-allowed":"pointer",
          color:C.dark, fontFamily:ff, fontWeight:800, fontSize:".9rem",
          opacity:saving?.7:1,
        }}>{saving?"جاري الإضافة...":"✅ إضافة"}</button>
        <button onClick={()=>setOpen(false)} style={{
          padding:"11px 20px", background:C.beige,
          border:`1px solid rgba(201,168,76,.2)`, borderRadius:8,
          cursor:"pointer", color:C.g600, fontFamily:ff, fontSize:".88rem",
        }}>إلغاء</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STANDARD FIELD
// ═══════════════════════════════════════════════════════════════
function ContentField({row,onSave,onDelete}) {
  const [arVal,setArVal] = useState(row.value_ar||"");
  const [enVal,setEnVal] = useState(row.value_en||"");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [saveErr,setSaveErr]=useState("");

  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    const {error} = await saveRow(row.section,row.key,arVal,enVal,row.label_ar,row.type);
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ غير معروف");
  };
  const El=row.type==="textarea"?"textarea":"input";
  const extra=row.type==="textarea"?{rows:3}:{type:row.type==="email"?"email":row.type==="url"?"url":"text"};
  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:10,padding:"18px 20px",transition:"border-color .2s"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".65rem",letterSpacing:".12em",textTransform:"uppercase",marginBottom:5,fontWeight:700}}>عربي 🇸🇦</label>
          <El {...extra} value={arVal} onChange={e=>{setArVal(e.target.value);setDirty(true);setSaved(false);}} dir="rtl"
            style={{...inp,resize:row.type==="textarea"?"vertical":"none"}}/>
        </div>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".65rem",letterSpacing:".12em",textTransform:"uppercase",marginBottom:5,fontWeight:700}}>English 🇬🇧</label>
          <El {...extra} value={enVal} onChange={e=>{setEnVal(e.target.value);setDirty(true);setSaved(false);}} dir="ltr"
            style={{...inp,resize:row.type==="textarea"?"vertical":"none",textAlign:"left"}}/>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COLOR FIELD
// ═══════════════════════════════════════════════════════════════
function ColorField({row,onSave,onDelete}) {
  const [val,setVal]=useState(row.value_ar||"#c9a84c");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [saveErr,setSaveErr]=useState("");
  const handleSave=async()=>{
    setSaving(true);setSaveErr("");
    const{error}=await saveRow(row.section,row.key,val,val,row.label_ar,"color");
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ في الحفظ");
  };
  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:10,padding:"16px 20px"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
        <input type="color" value={val} onChange={e=>{setVal(e.target.value);setDirty(true);setSaved(false);}}
          style={{width:60,height:52,border:"none",borderRadius:8,cursor:"pointer",padding:2}}/>
        <input type="text" value={val} onChange={e=>{setVal(e.target.value);setDirty(true);setSaved(false);}}
          style={{...inp,width:140,fontFamily:"monospace",fontSize:"1rem",letterSpacing:".06em"}} dir="ltr"/>
        <div style={{width:90,height:52,borderRadius:8,background:val,border:"1px solid rgba(0,0,0,.1)",boxShadow:"0 2px 8px rgba(0,0,0,.12)",flexShrink:0}}/>
        <span style={{color:C.g400,fontSize:".8rem"}}>معاينة</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FONT SELECT FIELD
// ═══════════════════════════════════════════════════════════════
const AR_FONTS=[
  "Dubai","Cairo","Noto Naskh Arabic","Tajawal","Almarai","Amiri",
  "IBM Plex Sans Arabic","Scheherazade New","Lateef","Reem Kufi",
];
const EN_FONTS=[
  "Cormorant Garamond","Georgia","Playfair Display",
  "Montserrat","Inter","Libre Baskerville","Dubai",
];

function FontSelectField({row,onSave,onDelete}) {
  const [val,      setVal]      = useState(row.value_ar||"Cairo");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [dirty,    setDirty]    = useState(false);
  const [saveErr,  setSaveErr]  = useState("");
  const [custom,   setCustom]   = useState("");  // custom font name input
  const [uploading,setUploading]= useState(false);
  const [uploadOk, setUploadOk] = useState("");
  const fileRef = useRef(null);

  const isAr = row.key.includes("arabic");
  const fonts = isAr ? AR_FONTS : EN_FONTS;

  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    const { error } = await saveRow(row.section, row.key, val, val, row.label_ar, "fontselect");
    setSaving(false);
    if (!error) { setSaved(true); setDirty(false); setTimeout(()=>setSaved(false),3000); onSave?.(); }
    else setSaveErr(error.message||"خطأ في الحفظ");
  };

  // Upload custom font file (.ttf / .woff / .woff2) to public/fonts
  const handleFontUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["ttf","woff","woff2","otf"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) { setSaveErr("صيغة غير مدعومة. استخدم .ttf .woff .woff2 .otf"); return; }

    setUploading(true); setSaveErr(""); setUploadOk("");
    try {
      // Upload via Supabase Storage → fonts bucket
      const name = file.name;
      const { error: upErr } = await supabase.storage
        .from("site-images")
        .upload(`fonts/${name}`, file, { upsert: true, contentType: "font/"+ext });
      if (upErr) throw upErr;

      // Get public URL
      const { data } = supabase.storage.from("site-images").getPublicUrl(`fonts/${name}`);
      const fontName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g," ");

      // Inject @font-face into page for instant preview
      const style = document.createElement("style");
      style.textContent = `@font-face{font-family:'${fontName}';src:url('${data.publicUrl}') format('${ext === "ttf" ? "truetype" : ext}');font-display:swap;}`;
      document.head.appendChild(style);

      setCustom(fontName);
      setVal(fontName);
      setDirty(true);
      setUploadOk(`✅ تم رفع "${fontName}" — اضغط حفظ لتطبيقه`);
    } catch (err) {
      setSaveErr(err.message || "فشل الرفع");
    }
    setUploading(false);
    e.target.value = "";
  };

  const allFonts = custom && !fonts.includes(custom) ? [...fonts, custom] : fonts;

  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:10,padding:"16px 20px"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>

      <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
        {/* Font selector */}
        <select value={val} onChange={e=>{setVal(e.target.value);setDirty(true);setSaved(false);}}
          style={{...inp,width:"auto",minWidth:220,cursor:"pointer"}}>
          {allFonts.map(f=><option key={f} value={f}>{f}</option>)}
        </select>

        {/* Preview */}
        <div style={{fontSize:"1.3rem",fontFamily:`'${val}',sans-serif`,color:C.g800,padding:"6px 14px",background:C.beige,borderRadius:6,minWidth:160,textAlign:"center"}}>
          {isAr ? "نموذج للخط العربي" : "Font Sample Text"}
        </div>
      </div>

      {/* Upload custom font */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8,flexWrap:"wrap"}}>
        <button
          onClick={()=>fileRef.current?.click()}
          disabled={uploading}
          style={{
            display:"flex",alignItems:"center",gap:6,
            background:"transparent",border:`1px dashed ${C.gold}`,
            color:C.gold,borderRadius:8,padding:"7px 16px",
            cursor:"pointer",fontSize:".82rem",fontFamily:"inherit",fontWeight:700,
            opacity:uploading?.6:1,
          }}>
          {uploading ? "⏳ جار الرفع…" : "📁 رفع خط مخصص (.ttf .woff .woff2)"}
        </button>
        <input ref={fileRef} type="file" accept=".ttf,.woff,.woff2,.otf" style={{display:"none"}} onChange={handleFontUpload} />
        {uploadOk && <span style={{color:C.success||"#27ae60",fontSize:".78rem"}}>{uploadOk}</span>}
        {saveErr  && <span style={{color:C.error||"#c0392b",fontSize:".78rem"}}>{saveErr}</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOADER
// ═══════════════════════════════════════════════════════════════
function ImageUploader({ value, onChange }) {
  const fileRef  = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [err, setErr]             = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("الملف يجب أن يكون صورة (JPG/PNG/WebP/GIF)"); return; }
    if (file.size > 8 * 1024 * 1024)    { setErr("الحجم الأقصى 8MB"); return; }

    setUploading(true); setErr(""); setProgress(10);

    // Sanitise filename
    const ext  = file.name.split(".").pop().toLowerCase();
    const name = `${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;

    setProgress(40);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(name, file, {
      cacheControl: "31536000", upsert: false, contentType: file.type,
    });

    if (upErr) {
      // Bucket might not exist — try to create it then retry
      if (upErr.message?.includes("Bucket not found") || upErr.statusCode === 404 || upErr.error === "Bucket not found") {
        await supabase.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 10485760 });
        const { error: upErr2 } = await supabase.storage.from(BUCKET).upload(name, file, {
          cacheControl: "31536000", upsert: false, contentType: file.type,
        });
        if (upErr2) { setErr("❌ " + upErr2.message); setUploading(false); return; }
      } else {
        setErr("❌ " + upErr.message); setUploading(false); return;
      }
    }

    setProgress(90);
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(name);
    onChange(publicUrl);
    setProgress(100);
    setUploading(false);
    e.target.value = ""; // reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) { const dt = new DataTransfer(); dt.items.add(file); fileRef.current.files = dt.files; handleFile({ target: { files: dt.files } }); }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />

      {/* Preview */}
      {value && (
        <div style={{ marginBottom:10, position:"relative", display:"inline-block" }}>
          <img src={value} alt="preview" style={{
            width:120, height:80, objectFit:"cover", borderRadius:8,
            border:`1px solid rgba(201,168,76,.25)`, display:"block",
          }} />
          <button onClick={()=>onChange("")} style={{
            position:"absolute", top:-6, right:-6, width:20, height:20,
            background:C.error, color:"#fff", border:"none", borderRadius:"50%",
            cursor:"pointer", fontSize:".7rem", display:"flex", alignItems:"center", justifyContent:"center",
          }}>✕</button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e=>e.preventDefault()}
        onClick={()=>!uploading&&fileRef.current?.click()}
        style={{
          border:`2px dashed rgba(201,168,76,${uploading?".6":".3"})`,
          borderRadius:10, padding:"16px 20px", cursor: uploading?"not-allowed":"pointer",
          background: uploading?"rgba(201,168,76,.04)":"transparent",
          textAlign:"center", transition:"all .2s",
        }}
      >
        {uploading ? (
          <div>
            <div style={{ color:C.gold, fontSize:".85rem", marginBottom:8 }}>⏳ جاري الرفع... {progress}%</div>
            <div style={{ height:4, background:"rgba(201,168,76,.15)", borderRadius:2 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:C.gold, borderRadius:2, transition:"width .3s" }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:"1.6rem", marginBottom:6 }}>📤</div>
            <div style={{ color:C.gold, fontSize:".82rem", fontWeight:700 }}>اضغط أو اسحب صورة هنا</div>
            <div style={{ color:C.g400, fontSize:".7rem", marginTop:3 }}>JPG · PNG · WebP · GIF · حتى 8MB</div>
          </div>
        )}
      </div>

      {err && <div style={{ color:C.error, fontSize:".76rem", marginTop:6, background:"rgba(192,57,43,.08)", padding:"6px 10px", borderRadius:6 }}>{err}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BG PICKER (shared) — with upload
// ═══════════════════════════════════════════════════════════════
function BgPicker({bgColor,bgImage,onColor,onImage}) {
  const [tab, setTab] = useState(bgImage?"upload":"color");

  return (
    <div style={{borderTop:`1px solid rgba(201,168,76,.1)`,paddingTop:14,marginTop:4}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:700,color:C.g600,fontSize:".8rem"}}>🎨 خلفية البطاقة</div>
        <div style={{display:"flex",gap:6}}>
          {[{k:"color",l:"🎨 لون"},{k:"upload",l:"📤 صورة"},{k:"url",l:"🔗 رابط"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              padding:"4px 12px", borderRadius:12, border:"none", cursor:"pointer", fontFamily:ff, fontSize:".72rem",
              background: tab===t.k ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.beige,
              color: tab===t.k ? C.dark : C.g600, fontWeight: tab===t.k ? 700 : 400,
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {tab==="color" && (
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <input type="color" value={bgColor||"#ffffff"} onChange={e=>onColor(e.target.value)}
            style={{width:52,height:44,border:"none",borderRadius:8,cursor:"pointer",padding:2}}/>
          <input type="text" value={bgColor} onChange={e=>onColor(e.target.value)}
            placeholder="#ffffff" style={{...inp,width:120,padding:"8px 10px",fontSize:".82rem",fontFamily:"monospace"}} dir="ltr"/>
          {bgColor && (
            <>
              <div style={{width:70,height:44,borderRadius:8,background:bgColor,border:"1px solid rgba(0,0,0,.1)"}}/>
              <button onClick={()=>onColor("")} style={{background:"rgba(192,57,43,.1)",color:C.error,border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:".75rem"}}>✕ حذف</button>
            </>
          )}
        </div>
      )}

      {tab==="upload" && (
        <ImageUploader value={bgImage} onChange={onImage} />
      )}

      {tab==="url" && (
        <div>
          <input type="url" value={bgImage} onChange={e=>onImage(e.target.value)}
            placeholder="https://example.com/image.jpg" dir="ltr" style={{...inp,fontSize:".85rem"}}/>
          {bgImage && (
            <div style={{marginTop:8,display:"flex",gap:10,alignItems:"center"}}>
              <img src={bgImage} alt="" style={{width:80,height:52,objectFit:"cover",borderRadius:6,border:"1px solid rgba(201,168,76,.2)"}} onError={e=>e.target.style.display="none"}/>
              <button onClick={()=>onImage("")} style={{background:"rgba(192,57,43,.1)",color:C.error,border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:".75rem"}}>✕ إزالة</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Small input helper ─────────────────────────────────────────
function SI({label,val,onChange,dir="rtl",type="text"}) {
  return (
    <div>
      <label style={{display:"block",color:C.g400,fontSize:".63rem",letterSpacing:".05em",marginBottom:4,fontWeight:700}}>{label}</label>
      <input type={type} value={val||""} onChange={e=>onChange(e.target.value)} dir={dir}
        style={{...inp,padding:"8px 10px",fontSize:".82rem"}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROGRAM FIELD (citizenship)
// ═══════════════════════════════════════════════════════════════
function ProgramField({row,onSave,onDelete}) {
  const parse=v=>{try{return JSON.parse(v);}catch{return{flag:"",name_ar:"",name_en:"",type_ar:"",type_en:"",min:"",time:"",bg_color:"",bg_image:""};}}
  const[d,setD]=useState(parse(row.value_ar));
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[dirty,setDirty]=useState(false);
  const upd=(f,v)=>{setD(p=>({...p,[f]:v}));setDirty(true);setSaved(false);};
  const [saveErr,setSaveErr]=useState("");
  const handleSave=async()=>{
    setSaving(true);setSaveErr("");
    const{error}=await saveRow(row.section,row.key,JSON.stringify(d),"",row.label_ar,"program");
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ");
  };
  const hasBg=d.bg_color||d.bg_image;
  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:12,padding:"20px",transition:"border-color .2s"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:4}}>
        <SI label="العلم (إيموجي)" val={d.flag}    onChange={v=>upd("flag",v)}/>
        <SI label="الاسم — عربي"   val={d.name_ar} onChange={v=>upd("name_ar",v)}/>
        <SI label="Name — English"  val={d.name_en} onChange={v=>upd("name_en",v)} dir="ltr"/>
        <SI label="نوع البرنامج — عربي" val={d.type_ar} onChange={v=>upd("type_ar",v)}/>
        <SI label="Type — English"  val={d.type_en} onChange={v=>upd("type_en",v)} dir="ltr"/>
        <SI label="الحد الأدنى للاستثمار" val={d.min} onChange={v=>upd("min",v)}/>
        <SI label="مدة المعالجة"   val={d.time}    onChange={v=>upd("time",v)}/>
      </div>
      <BgPicker bgColor={d.bg_color} bgImage={d.bg_image} onColor={v=>upd("bg_color",v)} onImage={v=>upd("bg_image",v)}/>
      {hasBg&&(
        <div style={{marginTop:12}}>
          <div style={{color:C.g400,fontSize:".63rem",fontWeight:700,marginBottom:8,letterSpacing:".1em"}}>معاينة:</div>
          <div style={{
            display:"inline-flex",flexDirection:"column",alignItems:"center",
            background:d.bg_image?`url(${d.bg_image}) center/cover`:d.bg_color||"#fff",
            borderRadius:14,padding:"24px 20px",border:"1px solid rgba(201,168,76,.2)",
            minWidth:170,boxShadow:"0 4px 16px rgba(0,0,0,.1)",
          }}>
            <div style={{fontSize:"2.2rem",marginBottom:8}}>{d.flag}</div>
            <div style={{fontWeight:800,color:d.bg_image?"#fff":C.g800,fontFamily:ff}}>{d.name_ar}</div>
            <div style={{color:C.gold,fontSize:".78rem",marginTop:4}}>{d.type_ar}</div>
            <div style={{color:d.bg_image?"rgba(255,255,255,.7)":C.g600,fontSize:".74rem",marginTop:6}}>يبدأ من {d.min}</div>
            <div style={{color:d.bg_image?"rgba(255,255,255,.5)":C.g400,fontSize:".7rem",marginTop:3}}>⏱ {d.time}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD FIELD (divisions, travel services, advertising services)
// ═══════════════════════════════════════════════════════════════
function CardField({row,onSave,onDelete}) {
  const parse=v=>{try{return JSON.parse(v);}catch{return{icon:"",title_ar:"",title_en:"",sub_ar:"",sub_en:"",desc_ar:"",desc_en:"",bg_color:"",bg_image:""};}}
  const[d,setD]=useState(parse(row.value_ar));
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[dirty,setDirty]=useState(false);
  const upd=(f,v)=>{setD(p=>({...p,[f]:v}));setDirty(true);setSaved(false);};
  const [saveErr,setSaveErr]=useState("");
  const handleSave=async()=>{
    setSaving(true);setSaveErr("");
    const{error}=await saveRow(row.section,row.key,JSON.stringify(d),"",row.label_ar,"card");
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ");
  };
  const hasSubFields = d.sub_ar!==undefined;
  const hasBg=d.bg_color||d.bg_image;
  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:12,padding:"20px",transition:"border-color .2s"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10,marginBottom:4}}>
        <SI label="الأيقونة (إيموجي أو رمز)" val={d.icon} onChange={v=>upd("icon",v)}/>
        <SI label="العنوان — عربي"  val={d.title_ar} onChange={v=>upd("title_ar",v)}/>
        <SI label="Title — English" val={d.title_en} onChange={v=>upd("title_en",v)} dir="ltr"/>
        {hasSubFields&&<SI label="النص الثانوي — عربي" val={d.sub_ar} onChange={v=>upd("sub_ar",v)}/>}
        {hasSubFields&&<SI label="Subtitle — English"   val={d.sub_en} onChange={v=>upd("sub_en",v)} dir="ltr"/>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".63rem",marginBottom:4,fontWeight:700}}>الوصف — عربي</label>
          <textarea value={d.desc_ar||""} onChange={e=>upd("desc_ar",e.target.value)} dir="rtl" rows={3}
            style={{...inp,resize:"vertical"}}/>
        </div>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".63rem",marginBottom:4,fontWeight:700}}>Description — English</label>
          <textarea value={d.desc_en||""} onChange={e=>upd("desc_en",e.target.value)} dir="ltr" rows={3}
            style={{...inp,resize:"vertical",textAlign:"left"}}/>
        </div>
      </div>
      <BgPicker bgColor={d.bg_color} bgImage={d.bg_image} onColor={v=>upd("bg_color",v)} onImage={v=>upd("bg_image",v)}/>
      {hasBg&&(
        <div style={{marginTop:12}}>
          <div style={{color:C.g400,fontSize:".63rem",fontWeight:700,marginBottom:8,letterSpacing:".1em"}}>معاينة البطاقة:</div>
          <div style={{
            display:"inline-flex",flexDirection:"column",alignItems:"center",gap:6,
            background:d.bg_image?`url(${d.bg_image}) center/cover`:d.bg_color||"#fff",
            borderRadius:14,padding:"22px 20px",border:"1px solid rgba(201,168,76,.2)",
            minWidth:180,boxShadow:"0 4px 16px rgba(0,0,0,.1)",
          }}>
            <div style={{fontSize:"2rem"}}>{d.icon}</div>
            <div style={{fontWeight:800,color:d.bg_image?"#fff":C.g800,fontFamily:ff,fontSize:"1rem"}}>{d.title_ar}</div>
            {d.sub_ar&&<div style={{color:C.gold,fontSize:".78rem"}}>{d.sub_ar}</div>}
            <div style={{color:d.bg_image?"rgba(255,255,255,.65)":C.g600,fontSize:".74rem",textAlign:"center",maxWidth:180,lineHeight:1.5}}>{d.desc_ar?.split("·")[0]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COURSE FIELD (academy)
// ═══════════════════════════════════════════════════════════════
function CourseField({row,onSave,onDelete}) {
  const parse=v=>{try{return JSON.parse(v);}catch{return{icon:"",title_ar:"",title_en:"",level_ar:"",level_en:"",weeks:8,cert:true,bg_color:"",bg_image:""};}}
  const[d,setD]=useState(parse(row.value_ar));
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[dirty,setDirty]=useState(false);
  const upd=(f,v)=>{setD(p=>({...p,[f]:v}));setDirty(true);setSaved(false);};
  const [saveErr,setSaveErr]=useState("");
  const handleSave=async()=>{
    setSaving(true);setSaveErr("");
    const{error}=await saveRow(row.section,row.key,JSON.stringify(d),"",row.label_ar,"course");
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ");
  };
  const hasBg=d.bg_color||d.bg_image;
  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:12,padding:"20px",transition:"border-color .2s"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10,marginBottom:4}}>
        <SI label="الأيقونة" val={d.icon} onChange={v=>upd("icon",v)}/>
        <SI label="اسم الدورة — عربي"  val={d.title_ar}  onChange={v=>upd("title_ar",v)}/>
        <SI label="Course Name — English" val={d.title_en} onChange={v=>upd("title_en",v)} dir="ltr"/>
        <SI label="المستوى — عربي"     val={d.level_ar}  onChange={v=>upd("level_ar",v)}/>
        <SI label="Level — English"     val={d.level_en}  onChange={v=>upd("level_en",v)} dir="ltr"/>
        <SI label="عدد الأسابيع"        val={d.weeks}     onChange={v=>upd("weeks",+v)} type="number"/>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".63rem",marginBottom:4,fontWeight:700}}>شهادة معتمدة؟</label>
          <div style={{display:"flex",gap:12,marginTop:8}}>
            {[{v:true,l:"✅ نعم"},{v:false,l:"❌ لا"}].map(opt=>(
              <label key={String(opt.v)} style={{display:"flex",gap:6,alignItems:"center",cursor:"pointer",color:C.g600,fontSize:".85rem"}}>
                <input type="radio" checked={d.cert===opt.v} onChange={()=>upd("cert",opt.v)}/>{opt.l}
              </label>
            ))}
          </div>
        </div>
      </div>
      <BgPicker bgColor={d.bg_color} bgImage={d.bg_image} onColor={v=>upd("bg_color",v)} onImage={v=>upd("bg_image",v)}/>
      {hasBg&&(
        <div style={{marginTop:12}}>
          <div style={{color:C.g400,fontSize:".63rem",fontWeight:700,marginBottom:8}}>معاينة:</div>
          <div style={{
            display:"inline-flex",flexDirection:"column",alignItems:"center",gap:6,
            background:d.bg_image?`url(${d.bg_image}) center/cover`:d.bg_color||"#fff",
            borderRadius:14,padding:"22px 20px",border:"1px solid rgba(201,168,76,.2)",minWidth:180,
          }}>
            <div style={{fontSize:"2rem"}}>{d.icon}</div>
            <div style={{fontWeight:800,color:d.bg_image?"#fff":C.g800,fontFamily:ff}}>{d.title_ar}</div>
            <div style={{color:C.gold,fontSize:".75rem"}}>{d.level_ar}</div>
            <div style={{color:d.bg_image?"rgba(255,255,255,.6)":C.g400,fontSize:".72rem"}}>{d.weeks} أسابيع {d.cert?"· 🎓 شهادة":""}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PACKAGE FIELD (تأسيس الشركات — باقات التسعير)
// ═══════════════════════════════════════════════════════════════
function PackageField({row,onSave,onDelete}) {
  const parse=v=>{try{return JSON.parse(v);}catch{return{icon:"🚀",name_ar:"",name_en:"",price_ar:"",price_en:"",popular:false,features_ar:[],features_en:[],bg_color:"",bg_image:""};}}
  const[d,setD]=useState(parse(row.value_ar));
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[dirty,setDirty]=useState(false);
  const[saveErr,setSaveErr]=useState("");
  const upd=(f,v)=>{setD(p=>({...p,[f]:v}));setDirty(true);setSaved(false);};

  const handleSave=async()=>{
    setSaving(true);setSaveErr("");
    const{error}=await saveRow(row.section,row.key,JSON.stringify(d),"",row.label_ar,"package");
    setSaving(false);
    if(!error){setSaved(true);setDirty(false);setTimeout(()=>setSaved(false),3000);onSave?.();}
    else setSaveErr(error.message||"خطأ");
  };

  const updFeature=(lng,i,v)=>{const k=`features_${lng}`;const a=[...(d[k]||[])];a[i]=v;upd(k,a);};
  const addFeat=(lng)=>{const k=`features_${lng}`;upd(k,[...(d[k]||[]),"ميزة جديدة"]);};
  const delFeat=(lng,i)=>{const k=`features_${lng}`;const a=[...(d[k]||[])];a.splice(i,1);upd(k,a);};

  return (
    <div style={{background:"#fff",border:`1px solid ${dirty?C.gold:"rgba(201,168,76,.12)"}`,borderRadius:12,padding:"20px",transition:"border-color .2s"}}>
      <CardHeader label_ar={row.label_ar} section={row.section} keyName={row.key} dirty={dirty} saving={saving} saved={saved} saveErr={saveErr||""} onSave={handleSave} onDelete={onDelete} isDynamic={!!row.isDynamic}/>
      {/* Basic info */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:14}}>
        <SI label="الأيقونة"         val={d.icon}     onChange={v=>upd("icon",v)}/>
        <SI label="الاسم — عربي"     val={d.name_ar}  onChange={v=>upd("name_ar",v)}/>
        <SI label="Name — English"   val={d.name_en}  onChange={v=>upd("name_en",v)} dir="ltr"/>
        <SI label="السعر — عربي"     val={d.price_ar} onChange={v=>upd("price_ar",v)}/>
        <SI label="Price — English"  val={d.price_en} onChange={v=>upd("price_en",v)} dir="ltr"/>
        <div>
          <label style={{display:"block",color:C.g400,fontSize:".63rem",marginBottom:6,fontWeight:700}}>⭐ الأكثر طلباً؟</label>
          <div style={{display:"flex",gap:14,marginTop:6}}>
            {[{v:true,l:"✅ نعم"},{v:false,l:"❌ لا"}].map(opt=>(
              <label key={String(opt.v)} style={{display:"flex",gap:5,alignItems:"center",cursor:"pointer",color:C.g600,fontSize:".85rem"}}>
                <input type="radio" checked={d.popular===opt.v} onChange={()=>upd("popular",opt.v)}/>{opt.l}
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Features */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:4}}>
        {[["ar","مميزات — عربي 🇸🇦","rtl"],["en","Features — English 🇬🇧","ltr"]].map(([lng,lbl,dir])=>(
          <div key={lng}>
            <label style={{display:"block",color:C.g400,fontSize:".65rem",letterSpacing:".1em",marginBottom:8,fontWeight:700}}>{lbl}</label>
            {(d[`features_${lng}`]||[]).map((f,j)=>(
              <div key={j} style={{display:"flex",gap:6,marginBottom:6}}>
                <input value={f} onChange={e=>updFeature(lng,j,e.target.value)} dir={dir}
                  style={{...inp,flex:1,padding:"7px 10px",fontSize:".82rem"}}/>
                <button onClick={()=>delFeat(lng,j)}
                  style={{background:"rgba(192,57,43,.08)",color:C.error,border:"none",borderRadius:5,padding:"0 8px",cursor:"pointer",fontSize:".8rem"}}>✕</button>
              </div>
            ))}
            <button onClick={()=>addFeat(lng)} style={{
              padding:"6px 12px",background:"rgba(201,168,76,.08)",border:`1px dashed rgba(201,168,76,.3)`,
              borderRadius:6,cursor:"pointer",color:C.gold,fontFamily:ff,fontSize:".76rem",fontWeight:700,width:"100%",marginTop:2,
            }}>+ إضافة ميزة</button>
          </div>
        ))}
      </div>
      <BgPicker bgColor={d.bg_color} bgImage={d.bg_image} onColor={v=>upd("bg_color",v)} onImage={v=>upd("bg_image",v)}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DISPATCHER
// ═══════════════════════════════════════════════════════════════
function FieldRenderer({row,onSave,onDelete}) {
  if (row.type==="program")    return <ProgramField    row={row} onSave={onSave} onDelete={onDelete}/>;
  if (row.type==="card")       return <CardField       row={row} onSave={onSave} onDelete={onDelete}/>;
  if (row.type==="course")     return <CourseField     row={row} onSave={onSave} onDelete={onDelete}/>;
  if (row.type==="package")    return <PackageField    row={row} onSave={onSave} onDelete={onDelete}/>;
  if (row.type==="color")      return <ColorField      row={row} onSave={onSave} onDelete={onDelete}/>;
  if (row.type==="fontselect") return <FontSelectField row={row} onSave={onSave} onDelete={onDelete}/>;
  return <ContentField row={row} onSave={onSave} onDelete={onDelete}/>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// MEDIA LIBRARY
// ═══════════════════════════════════════════════════════════════
function MediaLibrary() {
  const [files,    setFiles]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState("");
  const [deleting, setDeleting] = useState("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit: 200, sortBy: { column: "created_at", order: "desc" },
    });
    if (!error && data) setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"));
    setLoading(false);
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const getUrl = (name) => supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;

  const copyUrl = (name) => {
    navigator.clipboard.writeText(getUrl(name));
    setCopied(name);
    setTimeout(() => setCopied(""), 2000);
  };

  const deleteFile = async (name) => {
    if (!window.confirm(`حذف "${name}"؟`)) return;
    setDeleting(name);
    await supabase.storage.from(BUCKET).remove([name]);
    setDeleting("");
    loadFiles();
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)}KB`;
    return `${(bytes/1024/1024).toFixed(1)}MB`;
  };

  if (loading) return <div style={{textAlign:"center",padding:60,color:C.g400}}>⏳ جاري تحميل الصور...</div>;

  return (
    <div>
      {/* Upload area at top */}
      <div style={{background:"#fff",border:`1px solid rgba(201,168,76,.15)`,borderRadius:12,padding:20,marginBottom:20}}>
        <div style={{fontWeight:700,color:C.g800,fontSize:".95rem",marginBottom:12}}>📤 رفع صور جديدة</div>
        <ImageUploader value="" onChange={()=>loadFiles()} />
      </div>

      {/* Grid of images */}
      {files.length === 0 ? (
        <div style={{textAlign:"center",padding:60,background:"#fff",borderRadius:12,border:`1px solid rgba(201,168,76,.12)`}}>
          <div style={{fontSize:"3rem",marginBottom:12}}>🖼️</div>
          <p style={{color:C.g400}}>لا توجد صور مرفوعة بعد. ارفع صورة من الأعلى.</p>
        </div>
      ) : (
        <>
          <div style={{color:C.g400,fontSize:".78rem",marginBottom:12}}>{files.length} صورة مرفوعة</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
            {files.map(f => {
              const url = getUrl(f.name);
              return (
                <div key={f.name} style={{
                  background:"#fff", border:`1px solid rgba(201,168,76,.12)`,
                  borderRadius:10, overflow:"hidden", transition:"box-shadow .2s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(201,168,76,.15)"}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                >
                  <div style={{position:"relative",paddingTop:"65%",background:C.beige}}>
                    <img src={url} alt={f.name} style={{
                      position:"absolute",top:0,left:0,width:"100%",height:"100%",
                      objectFit:"cover",
                    }} onError={e=>{e.target.style.display="none";}} />
                  </div>
                  <div style={{padding:"10px 12px"}}>
                    <div style={{color:C.g600,fontSize:".7rem",marginBottom:6,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                      direction:"ltr",textAlign:"left"
                    }} title={f.name}>{f.name}</div>
                    {f.metadata?.size && <div style={{color:C.g400,fontSize:".65rem",marginBottom:8}}>{formatSize(f.metadata.size)}</div>}
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>copyUrl(f.name)} style={{
                        flex:1,padding:"6px 4px",fontSize:".72rem",fontFamily:ff,
                        background: copied===f.name ? "rgba(39,174,96,.12)" : "rgba(201,168,76,.1)",
                        color: copied===f.name ? C.success : C.gold,
                        border:`1px solid ${copied===f.name?"rgba(39,174,96,.3)":"rgba(201,168,76,.25)"}`,
                        borderRadius:6, cursor:"pointer", fontWeight:700, transition:"all .2s",
                      }}>
                        {copied===f.name ? "✓ تم النسخ" : "📋 نسخ الرابط"}
                      </button>
                      <button onClick={()=>deleteFile(f.name)} disabled={deleting===f.name} style={{
                        padding:"6px 8px",background:"rgba(192,57,43,.07)",
                        color:C.error,border:"1px solid rgba(192,57,43,.2)",
                        borderRadius:6,cursor:"pointer",fontSize:".75rem",
                      }}>
                        {deleting===f.name ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function SiteAdminPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [search, setSearch] = useState("");
  const [showDiag, setShowDiag] = useState(false);

  const sections = ["_media", ...new Set(DEFAULT_ROWS.map(r=>r.section))];

  const loadRows = useCallback(async()=>{
    setLoading(true);
    const{data}=await supabase.from("site_content").select("*").order("section").order("key");
    if(data&&data.length>0){
      // مفاتيح مخفية (is_active=false)
      const hiddenKeys=new Set(
        data.filter(d=>d.is_active===false).map(d=>`${d.section}::${d.key}`)
      );
      // Merge DEFAULT_ROWS مع قيم DB — استثناء المخفية
      const enriched=DEFAULT_ROWS
        .filter(def=>!hiddenKeys.has(`${def.section}::${def.key}`))
        .map(def=>{
          const fromDb=data.find(d=>d.section===def.section&&d.key===def.key&&d.is_active!==false);
          return fromDb?{...def,value_ar:fromDb.value_ar??def.value_ar,value_en:fromDb.value_en??def.value_en}:def;
        });
      // حقول مضافة ديناميكياً (غير موجودة في DEFAULT_ROWS)
      const defaultKeys=new Set(DEFAULT_ROWS.map(r=>`${r.section}::${r.key}`));
      const dynamicRows=data
        .filter(d=>!defaultKeys.has(`${d.section}::${d.key}`)&&d.is_active!==false)
        .map(d=>({
          section:d.section, key:d.key,
          label_ar:d.label_ar||d.key,
          type:d.content_type||"text",
          value_ar:d.value_ar||"", value_en:d.value_en||"",
          isDynamic:true,
        }));
      setRows([...enriched,...dynamicRows]);
    }else{setRows(DEFAULT_ROWS);}
    setLoading(false);
  },[]);

  useEffect(()=>{loadRows();},[loadRows]);

  const seedAll=async()=>{
    if(!window.confirm("سيضيف الحقول الناقصة فقط — التعديلات الموجودة لن تُمسح. متابعة؟"))return;
    setSeeding(true);

    // 1. اجلب المفاتيح الموجودة (بما فيها المخفية) في قاعدة البيانات
    const{data:existing}=await supabase.from("site_content").select("section,key,is_active");
    // أي مفتاح موجود في DB (سواء active أو مخفي) — لا نلمسه
    const existingKeys=new Set((existing||[]).map(r=>`${r.section}::${r.key}`));

    // 2. أضف فقط الحقول الغائبة (لا تلمس الموجودة)
    const newRows=DEFAULT_ROWS
      .filter(r=>!existingKeys.has(`${r.section}::${r.key}`))
      .map(r=>({
        section:r.section,key:r.key,value_ar:r.value_ar,value_en:r.value_en,
        label_ar:r.label_ar,content_type:r.type,is_active:true,
      }));

    if(newRows.length===0){
      setSeeding(false);
      alert("✅ جميع الحقول موجودة — لا يوجد شيء لإضافته وتعديلاتك محفوظة");
      return;
    }

    const{error}=await supabase.from("site_content").insert(newRows);
    setSeeding(false);
    if(!error){
      alert(`✅ تم إضافة ${newRows.length} حقل جديد\n✓ تعديلاتك الموجودة محفوظة ولم تُمسح`);
      loadRows();
    } else alert("خطأ: "+error.message);
  };

  const sectionRows = rows
    .filter(r=>r.section===activeSection)
    .filter(r=>!search||r.label_ar.includes(search)||r.key.includes(search));

  // Count by type for section badge
  const sectionCount=sec=>rows.filter(r=>r.section===sec).length;
  const typeColors={program:C.gold,card:"#3498db",course:"#27ae60",color:"#e74c3c",fontselect:"#9b59b6"};

  return (
    <div style={{fontFamily:ff,direction:"rtl",background:C.warmWhite,minHeight:"100vh"}}>
      {showDiag && <DiagnosticPanel onClose={()=>setShowDiag(false)} />}

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.dark},${C.darkMid})`,padding:"22px clamp(16px,4vw,48px)"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{color:"#fff",fontWeight:700,fontSize:"1.2rem",marginBottom:4}}>✏️ لوحة تحرير محتوى الموقع — النسخة الكاملة</h1>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:".78rem"}}>{DEFAULT_ROWS.length} حقل قابل للتعديل · {sections.length} قسم</p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>window.location.href="/"} style={{padding:"8px 16px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.14)",borderRadius:7,cursor:"pointer",color:"rgba(255,255,255,.6)",fontFamily:ff,fontSize:".8rem"}}>← الموقع</button>
            <button onClick={()=>setShowDiag(true)} style={{padding:"8px 16px",background:"rgba(255,100,100,.12)",border:"1px solid rgba(255,100,100,.3)",borderRadius:7,cursor:"pointer",color:"#ff8080",fontFamily:ff,fontSize:".8rem",fontWeight:700}}>
              🔧 تشخيص
            </button>
            <button onClick={seedAll} disabled={seeding} style={{padding:"8px 16px",background:"rgba(201,168,76,.14)",border:`1px solid rgba(201,168,76,.4)`,borderRadius:7,cursor:seeding?"not-allowed":"pointer",color:C.gold,fontFamily:ff,fontSize:".8rem",fontWeight:700,opacity:seeding?.7:1}}>
              {seeding?"جاري...":"📥 تهيئة الكل"}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"20px clamp(12px,3vw,40px)",display:"grid",gridTemplateColumns:"230px 1fr",gap:20,alignItems:"start"}}>

        {/* Sidebar */}
        <div style={{background:"#fff",borderRadius:12,border:`1px solid rgba(201,168,76,.12)`,overflow:"hidden",position:"sticky",top:16}}>
          <div style={{padding:"10px 14px",background:`linear-gradient(135deg,${C.dark},${C.darkMid})`}}>
            <span style={{color:C.gold,fontSize:".76rem",fontWeight:700,letterSpacing:".14em"}}>الأقسام ({sections.length})</span>
          </div>
          <div style={{maxHeight:"calc(100vh - 180px)",overflowY:"auto"}}>
            {sections.map(sec=>{
              const active=activeSection===sec;
              return (
                <button key={sec} onClick={()=>{setActiveSection(sec);setSearch("");}} style={{
                  width:"100%",padding:"11px 14px",
                  background:active?"rgba(201,168,76,.07)":"transparent",
                  border:"none",borderRight:active?`3px solid ${C.gold}`:"3px solid transparent",
                  cursor:"pointer",textAlign:"right",fontFamily:ff,fontSize:".84rem",
                  color:active?C.gold:C.g600,fontWeight:active?700:400,
                  transition:"all .15s",display:"flex",justifyContent:"space-between",alignItems:"center",
                }}>
                  <span>{SECTION_LABELS[sec]||sec}</span>
                  <span style={{fontSize:".65rem",color:C.g400,background:"rgba(201,168,76,.07)",padding:"2px 6px",borderRadius:8}}>{sectionCount(sec)}</span>
                </button>
              );
            })}
          </div>
          <div style={{padding:"10px 12px",background:"rgba(201,168,76,.04)",borderTop:`1px solid rgba(201,168,76,.08)`}}>
            <p style={{color:C.g400,fontSize:".68rem",lineHeight:1.7}}>💡 كل حقل له زر حفظ خاص — التغييرات تظهر فور إعادة تحميل الموقع.</p>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Section header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <div>
              <h2 style={{color:C.g800,fontSize:"1rem",fontWeight:700,marginBottom:2}}>
                {SECTION_LABELS[activeSection]||activeSection}
                <span style={{color:C.g400,fontSize:".76rem",fontWeight:400,marginRight:8}}>({sectionRows.length} حقل)</span>
              </h2>
              {lastSaved&&<span style={{color:C.success,fontSize:".73rem"}}>آخر حفظ: {lastSaved.toLocaleTimeString("ar")}</span>}
            </div>
            <input placeholder="🔍 بحث في الحقول..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{...inp,width:210,padding:"8px 13px",fontSize:".83rem"}}/>
          </div>

          {/* Legend */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            {Object.entries(typeColors).map(([t,col])=>(
              <span key={t} style={{fontSize:".68rem",color:col,background:`${col}18`,border:`1px solid ${col}30`,borderRadius:12,padding:"2px 9px",fontWeight:700}}>
                {t==="program"?"برنامج":t==="card"?"بطاقة":t==="course"?"دورة":t==="color"?"لون":"خط"}
              </span>
            ))}
            <span style={{fontSize:".68rem",color:C.g400,background:"rgba(201,168,76,.06)",border:`1px solid rgba(201,168,76,.15)`,borderRadius:12,padding:"2px 9px",fontWeight:700}}>نص</span>
          </div>

          {/* ── Media Library ── */}
          {activeSection === "_media" ? <MediaLibrary /> : loading?(
            <div style={{textAlign:"center",padding:70,color:C.g400}}>⏳ جاري التحميل...</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {sectionRows.map(row=>(
                <FieldRenderer
                  key={`${row.section}-${row.key}`}
                  row={row}
                  onSave={()=>setLastSaved(new Date())}
                  onDelete={()=>loadRows()}
                />
              ))}
              {sectionRows.length===0&&!search&&(
                <div style={{textAlign:"center",padding:60,background:"#fff",borderRadius:12,border:`1px solid rgba(201,168,76,.12)`}}>
                  <div style={{fontSize:"2.5rem",marginBottom:10}}>📭</div>
                  <p style={{color:C.g400}}>لا توجد حقول. اضغط "➕" أدناه أو "📥 تهيئة الكل".</p>
                </div>
              )}
              {sectionRows.length===0&&search&&(
                <div style={{textAlign:"center",padding:40,color:C.g400}}>🔍 لا توجد نتائج للبحث</div>
              )}
              {/* Add new row button */}
              {!search&&activeSection!=="_media"&&(
                <AddRowPanel
                  section={activeSection}
                  existingRows={rows.filter(r=>r.section===activeSection)}
                  onAdded={()=>{ loadRows(); setLastSaved(new Date()); }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
