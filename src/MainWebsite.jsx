import { useState, useEffect, useMemo, useCallback } from "react";
import { useContent } from "./context/ContentContext";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import { createRequestForClient, findOrCreateClient } from "./lib/crm";
import VisaCenterPage from "./pages/visa/VisaCenterPage";
import VisaResultPage from "./pages/visa/VisaResultPage";
import VisaApplicationPage from "./pages/visa/VisaApplicationPage";
import VisaAdminIntelligencePage from "./pages/visa/VisaAdminIntelligence";
import VisaTrackPage from "./pages/visa/VisaTrackPage";
import { setSEOMeta, setStructuredData, ORGANIZATION_SCHEMA, PAGE_SEO } from "./services/seoService";
import ResidencyPage from "./pages/Residency";
import TravelFullPage from "./pages/Travel";

// ── Company Formation Data ────────────────────────────────────
const CF_JURISDICTIONS = [
  // UAE
  { flag:'🇦🇪', nameAr:'رخصة تاجر دبي', nameEn:'Dubai Trader License', timeAr:'3-5 أيام', timeEn:'3-5 days', tagAr:'رخصة + بنك', tagEn:'License + Bank',
    descAr:'رخصة تجارية مع فتح حساب بنكي — الخيار الأمثل للتجار وأصحاب المشاريع الصغيرة',
    descEn:'Trade license with bank account opening — ideal for traders and small business owners',
    detailsAr:['رخصة تجارية معتمدة','فتح حساب بنكي تجاري','عنوان تجاري رسمي','دعم كامل بعد التأسيس'],
    detailsEn:['Certified trade license','Business bank account opening','Official business address','Full post-setup support'] },
  { flag:'🇦🇪', nameAr:'الإمارات — رخصة المهن الحرة', nameEn:'UAE Freelance License', timeAr:'5-7 أيام', timeEn:'5-7 days', tagAr:'إقامة + تأمين', tagEn:'Visa + Insurance',
    descAr:'رخصة مهن حرة شاملة الإقامة وتأمين صحي — مثالية للمستقلين والمحترفين',
    descEn:'Freelance license including residency visa and health insurance — perfect for freelancers',
    detailsAr:['رخصة المهن الحرة','إقامة المستثمر','ضمان صحي شامل','العمل في كل الإمارات'],
    detailsEn:['Freelance professional license','Investor residency visa','Comprehensive health insurance','Work across all UAE'] },
  { flag:'🇦🇪', nameAr:'الإمارات — المنطقة الحرة', nameEn:'UAE Free Zone', timeAr:'3-7 أيام', timeEn:'3-7 days', tagAr:'إعفاء ضريبي', tagEn:'Tax Free',
    descAr:'ملكية 100%، إعفاء ضريبي كامل، استيراد وتصدير بدون رسوم جمركية — أكثر من 40 منطقة حرة',
    descEn:'100% ownership, full tax exemption, duty-free import/export — 40+ free zones available',
    detailsAr:['لا ضريبة على الدخل','تحويل عملات حر','أكثر من 40 منطقة حرة','ملكية أجنبية 100%'],
    detailsEn:['Zero income tax','Free currency transfer','40+ free zones','100% foreign ownership'] },
  { flag:'🇦🇪', nameAr:'الإمارات — البر الرئيسي', nameEn:'UAE Mainland', timeAr:'7-14 يوم', timeEn:'7-14 days', tagAr:'عقود حكومية', tagEn:'Gov. Contracts',
    descAr:'العمل في كل الإمارات بدون قيود مع إمكانية التعاقد مع الجهات الحكومية — السعر بعد دراسة النشاط',
    descEn:'Trade across all UAE with no restrictions and ability to contract with government — pricing after activity review',
    detailsAr:['العمل في كل الإمارات','عقود حكومية وخاصة','ملكية أجنبية 100%','السعر حسب النشاط'],
    detailsEn:['Trade across all UAE','Government & private contracts','100% foreign ownership','Price based on activity'] },
  // GCC & Middle East
  { flag:'🇶🇦', nameAr:'قطر', nameEn:'Qatar', timeAr:'10-21 يوم', timeEn:'10-21 days', tagAr:'سوق خليجي', tagEn:'Gulf Market',
    descAr:'تأسيس شركتك في دولة قطر — سوق خليجي واعد مع بيئة أعمال متطورة ومستقرة',
    descEn:'Register your company in Qatar — a promising Gulf market with advanced and stable business environment',
    detailsAr:['سوق قطري متنامٍ','بنية تحتية عالمية','إمكانية الشراكة المحلية','دعم بعد التأسيس'],
    detailsEn:['Growing Qatari market','World-class infrastructure','Local partnership options','Post-setup support'] },
  { flag:'🇸🇦', nameAr:'المملكة العربية السعودية', nameEn:'Saudi Arabia', timeAr:'7-14 يوم', timeEn:'7-14 days', tagAr:'ملكية 100%', tagEn:'100% Ownership',
    descAr:'ملكية أجنبية 100% في إطار رؤية 2030 — أكبر اقتصاد في الشرق الأوسط',
    descEn:'100% foreign ownership under Vision 2030 — largest economy in the Middle East',
    detailsAr:['ملكية أجنبية 100%','حوافز رؤية 2030','سوق 35 مليون مستهلك','بيئة استثمار متنامية'],
    detailsEn:['100% foreign ownership','Vision 2030 incentives','35M consumer market','Growing investment environment'] },
  { flag:'🇴🇲', nameAr:'سلطنة عمان', nameEn:'Sultanate of Oman', timeAr:'14-30 يوم', timeEn:'14-30 days', tagAr:'استقرار عالٍ', tagEn:'High Stability',
    descAr:'بيئة استثمارية مستقرة في سلطنة عمان — السعر يحدد بعد دراسة النشاط والموافقات المطلوبة',
    descEn:'Stable investment environment in Oman — pricing determined after activity and approvals review',
    detailsAr:['بيئة أعمال مستقرة','ضرائب منخفضة','السعر حسب النشاط','موافقات الجهات المختصة'],
    detailsEn:['Stable business environment','Low taxes','Price based on activity','Subject to authority approvals'] },
  { flag:'🇸🇾', nameAr:'سوريا', nameEn:'Syria', timeAr:'حسب الحالة', timeEn:'Case by case', tagAr:'طلب خاص', tagEn:'Custom',
    descAr:'تأسيس شركة في سوريا — السعر يحدد بعد الاطلاع على النشاط المطلوب وموافقات من جهات معينة إضافية',
    descEn:'Company setup in Syria — pricing after reviewing the required activity and specific authority approvals',
    detailsAr:['دراسة تفصيلية للنشاط','موافقات الجهات المختصة','استشارة أولية مجانية','متابعة كاملة للملف'],
    detailsEn:['Detailed activity review','Required authority approvals','Free initial consultation','Full file follow-up'] },
  { flag:'🇪🇬', nameAr:'مصر', nameEn:'Egypt', timeAr:'14-30 يوم', timeEn:'14-30 days', tagAr:'+ إقامة مستثمر', tagEn:'+ Investor Visa',
    descAr:'تأسيس شركة في مصر مع الحصول على إقامة المستثمر — سوق واعد بتكاليف تشغيل منخفضة',
    descEn:'Company in Egypt with investor residency — promising market with low operating costs',
    detailsAr:['إقامة المستثمر مع الشركة','سوق +100 مليون مستهلك','تكاليف تشغيل منخفضة','حوافز استثمارية حكومية'],
    detailsEn:['Investor residency with company','100M+ consumer market','Low operating costs','Government investment incentives'] },
  // International
  { flag:'🇹🇷', nameAr:'تركيا', nameEn:'Turkey', timeAr:'14-21 يوم', timeEn:'14-21 days', tagAr:'جسر أوروبا-آسيا', tagEn:'EU-Asia Bridge',
    descAr:'بوابة بين أوروبا وآسيا — السعر بعد دراسة النشاط وتحديد عنوان العمل والموافقات المطلوبة',
    descEn:'Gateway between Europe and Asia — pricing after activity review, work address and required approvals',
    detailsAr:['ملكية أجنبية 100%','سوق 85 مليون مستهلك','السعر حسب النشاط والعنوان','موافقات الجهات المختصة'],
    detailsEn:['100% foreign ownership','85M consumer market','Price based on activity & address','Subject to authority approvals'] },
  { flag:'🇮🇩', nameAr:'إندونيسيا', nameEn:'Indonesia', timeAr:'21-45 يوم', timeEn:'21-45 days', tagAr:'+ إقامة مستثمر', tagEn:'+ Investor Visa',
    descAr:'تأسيس شركة في إندونيسيا مع الحصول على إقامة المستثمر — أكبر اقتصاد في جنوب شرق آسيا',
    descEn:'Company in Indonesia with investor residency — largest economy in Southeast Asia',
    detailsAr:['إقامة المستثمر مع الشركة','سوق 270 مليون مستهلك','نمو اقتصادي متسارع','استشارة مجانية أولية'],
    detailsEn:['Investor residency with company','270M consumer market','Fast-growing economy','Free initial consultation'] },
];
const CF_STEPS = {
  ar: [
    { icon:"💬", t:"استشارة مجانية",    d:"نحلل وضعك ونختار أفضل مسار" },
    { icon:"🏢", t:"اختيار نوع الشركة", d:"LLC أو Free Zone أو Mainland" },
    { icon:"📝", t:"تجهيز الوثائق",     d:"نعدّ كل المستندات بدقة" },
    { icon:"✅", t:"التسجيل الرسمي",    d:"تقديم الطلب للجهات المختصة" },
    { icon:"📋", t:"الحصول على الرخصة", d:"رخصة تجارية سارية ومعتمدة" },
    { icon:"🏦", t:"فتح حساب بنكي",    d:"حساب تجاري في بنك محلي" },
    { icon:"🪪", t:"تأشيرات الموظفين",  d:"فيزا المدير والموظفين" },
    { icon:"🎯", t:"بدء العمل",         d:"شركتك جاهزة للانطلاق!" },
  ],
  en: [
    { icon:"💬", t:"Free Consultation",     d:"We analyze and choose the best path" },
    { icon:"🏢", t:"Choose Company Type",   d:"LLC, Free Zone or Mainland" },
    { icon:"📝", t:"Document Preparation",  d:"We prepare all documents accurately" },
    { icon:"✅", t:"Official Registration", d:"Submit application to authorities" },
    { icon:"📋", t:"License Issuance",      d:"Valid and certified trade license" },
    { icon:"🏦", t:"Bank Account Opening",  d:"Business account at a local bank" },
    { icon:"🪪", t:"Staff Visas",           d:"Manager and employee visas" },
    { icon:"🎯", t:"Start Operations",      d:"Your company is ready to launch!" },
  ],
};
const CF_PACKAGES = [ // eslint-disable-line no-unused-vars
  { icon:"🚀", nameAr:"باقة المبتدئ",   nameEn:"Starter",   priceAr:"يبدأ من 3,500 درهم", priceEn:"From AED 3,500", popular:false,
    featuresAr:["تسجيل الشركة","رخصة تجارية","عنوان تجاري مرخص","شهادة التأسيس","خدمة العملاء 24/7"],
    featuresEn:["Company Registration","Trade License","Licensed Business Address","Certificate of Incorporation","24/7 Customer Support"],
    notAr:["فيزا المدير","حساب بنكي","مستشار قانوني"],
    notEn:["Manager Visa","Bank Account","Legal Advisor"] },
  { icon:"💼", nameAr:"باقة الأعمال",   nameEn:"Business",  priceAr:"يبدأ من 7,000 درهم", priceEn:"From AED 7,000", popular:true,
    featuresAr:["كل ما في المبتدئ","فيزا المدير التنفيذي","فتح حساب بنكي","مستشار قانوني متخصص","خدمة PRO كاملة","دعم ضريبي VAT"],
    featuresEn:["All Starter features","Executive Manager Visa","Bank Account Opening","Specialized Legal Advisor","Full PRO Services","VAT Tax Support"],
    notAr:["إقامة المستثمر","الفيزا الذهبية"],
    notEn:["Investor Residency","Golden Visa"] },
  { icon:"👑", nameAr:"باقة المستثمر",  nameEn:"Investor",  priceAr:"حسب الطلب",           priceEn:"Custom Pricing",  popular:false,
    featuresAr:["كل ما في الأعمال","إقامة المستثمر","الفيزا الذهبية الإماراتية","تأشيرات عائلية","مستشار ضريبي دولي","خدمة VIP شخصية","اجتماعات حضورية"],
    featuresEn:["All Business features","Investor Residency","UAE Golden Visa","Family Visas","International Tax Advisor","Personal VIP Service","In-person meetings"],
    notAr:[],
    notEn:[] },
];
const CF_SERVICES = {
  ar: ["تأسيس سريع خلال 48 ساعة","امتثال قانوني 100%","خدمة متكاملة من التسجيل للبنك","11 وجهة عالمية","دعم VIP شخصي","بدون رسوم خفية","فيزا المستثمر والإقامة","خدمة PRO متكاملة","تسجيل العلامة التجارية","استشارات الحوكمة","إدارة التراخيص السنوية","دعم ضريبي وامتثال VAT"],
  en: ["Fast setup in 48 hours","100% legal compliance","End-to-end service","11 global destinations","Personal VIP support","No hidden fees","Investor visa & residency","Full PRO services","Trademark registration","Corporate governance","Annual license management","Tax & VAT compliance support"],
};
const CF_INDUSTRIES = {
  ar: [
    { icon:"🛒", t:"التجارة الإلكترونية" },
    { icon:"🏗️", t:"المقاولات والبناء" },
    { icon:"🍽️", t:"المطاعم والكافيهات" },
    { icon:"💻", t:"التقنية والبرمجيات" },
    { icon:"🏥", t:"الرعاية الصحية" },
    { icon:"📦", t:"الاستيراد والتصدير" },
    { icon:"🎨", t:"الإعلام والإعلان" },
    { icon:"🏨", t:"السياحة والفنادق" },
    { icon:"📚", t:"التعليم والتدريب" },
    { icon:"⚡", t:"الطاقة والبيئة" },
    { icon:"🚗", t:"السيارات والنقل" },
    { icon:"💰", t:"المال والاستثمار" },
  ],
  en: [
    { icon:"🛒", t:"E-Commerce" },
    { icon:"🏗️", t:"Construction" },
    { icon:"🍽️", t:"Restaurants & Cafes" },
    { icon:"💻", t:"Technology & Software" },
    { icon:"🏥", t:"Healthcare" },
    { icon:"📦", t:"Import & Export" },
    { icon:"🎨", t:"Media & Advertising" },
    { icon:"🏨", t:"Tourism & Hotels" },
    { icon:"📚", t:"Education & Training" },
    { icon:"⚡", t:"Energy & Environment" },
    { icon:"🚗", t:"Automotive & Transport" },
    { icon:"💰", t:"Finance & Investment" },
  ],
};
const CF_WHY = {
  ar: [
    { icon:"⚡", t:"تأسيس خلال 48 ساعة",   d:"نُنجز معاملاتك بأسرع وقت ممكن بدون تأخير أو بيروقراطية" },
    { icon:"🔍", t:"شفافية تامة",            d:"لا رسوم خفية ولا مفاجآت — تعرف التكلفة الكاملة مسبقاً" },
    { icon:"👨‍💼", t:"فريق خبراء متخصص",      d:"محامون ومستشارون ذوو خبرة +10 سنوات في تأسيس الشركات" },
    { icon:"🌍", t:"تغطية 20+ دولة",         d:"نؤسس شركتك في الإمارات والسعودية وتركيا وأوروبا والعالم" },
    { icon:"📞", t:"دعم 24/7",               d:"فريقنا متاح على مدار الساعة للإجابة على استفساراتك" },
    { icon:"🏆", t:"+2,000 شركة مؤسسة",      d:"ثقة أكثر من ألفي عميل عبر 10 سنوات من الخبرة الناجحة" },
  ],
  en: [
    { icon:"⚡", t:"Setup in 48 Hours",       d:"We complete your paperwork as fast as possible without delays" },
    { icon:"🔍", t:"Full Transparency",        d:"No hidden fees, no surprises — know the full cost upfront" },
    { icon:"👨‍💼", t:"Expert Team",             d:"Lawyers and consultants with 10+ years in company formation" },
    { icon:"🌍", t:"20+ Countries Coverage",   d:"We register in UAE, Saudi Arabia, Turkey, Europe and beyond" },
    { icon:"📞", t:"24/7 Support",             d:"Our team is available round the clock for all your inquiries" },
    { icon:"🏆", t:"2,000+ Companies Founded", d:"Trusted by 2,000+ clients across 10 years of proven success" },
  ],
};
const CF_FAQ = {
  ar: [
    { q:"كم تكلفة تأسيس شركة في دبي؟",         a:"تبدأ التكاليف من 3,500 درهم للمنطقة الحرة وتختلف حسب نوع الشركة والنشاط. نقدم استشارة مجانية لتحديد التكلفة الدقيقة لاحتياجاتك." },
    { q:"هل أحتاج للحضور شخصياً للتأسيس؟",     a:"لا! نعالج معظم المعاملات عن بُعد. في بعض الحالات قد تحتاج للحضور مرة واحدة فقط لإتمام توثيق العقود." },
    { q:"ما الفرق بين Mainland و Free Zone؟",    a:"Mainland يتيح التجارة في السوق المحلي الإماراتي بالكامل. Free Zone يوفر إعفاءات ضريبية كاملة لكن مع قيود على التجارة المحلية المباشرة." },
    { q:"كم يستغرق فتح حساب بنكي للشركة؟",      a:"عادةً من 2 إلى 4 أسابيع بعد التأسيس. نساعدك في اختيار البنك المناسب وإعداد جميع المستندات المطلوبة." },
    { q:"هل يمكن تأسيس شركة وأنا في بلدي؟",     a:"نعم بالتأكيد! يمكنك تأسيس شركتك في الإمارات أو السعودية أو تركيا عن بُعد كلياً من خلال خدمتنا الرقمية المتكاملة." },
    { q:"ما الأنشطة التجارية المسموح بها؟",       a:"أكثر من 2,000 نشاط تجاري مرخص — من التجارة والخدمات إلى التقنية والرعاية الصحية. نساعدك في اختيار النشاط الأنسب." },
  ],
  en: [
    { q:"How much does it cost to set up a company in Dubai?",      a:"Costs start from AED 3,500 for Free Zone and vary by company type and activity. We offer a free consultation to determine the exact cost for your needs." },
    { q:"Do I need to be physically present for the setup?",        a:"No! We handle most procedures remotely. In some cases you may need to appear once to complete contract notarization." },
    { q:"What's the difference between Mainland and Free Zone?",    a:"Mainland allows trading across the full UAE local market. Free Zone provides full tax exemptions but with restrictions on direct local trading." },
    { q:"How long does it take to open a corporate bank account?",  a:"Usually 2 to 4 weeks after incorporation. We help you choose the right bank and prepare all required documents." },
    { q:"Can I set up a company while still in my home country?",   a:"Absolutely! You can incorporate your company in UAE, Saudi Arabia, or Turkey fully remotely through our integrated digital service." },
    { q:"What business activities are permitted?",                  a:"Over 2,000 licensed activities — from trading and services to technology and healthcare. We help you choose the most suitable activity." },
  ],
};

// ── Knowledge Center Data ────────────────────────────────────
const KC_CATEGORIES = {
  all:         { ar:"الكل",             en:"All",               icon:"🌐", color:"#7a6b50" },
  citizenship: { ar:"برامج الجنسية",    en:"Citizenship",       icon:"🌍", color:"#8a6010" },
  residency:   { ar:"برامج الإقامة",    en:"Residency",         icon:"🏡", color:"#1a6b3c" },
  visa:        { ar:"أدلة التأشيرة",   en:"Visa Guides",       icon:"🛂", color:"#1565c0" },
  company:     { ar:"تأسيس الشركات",   en:"Company Formation", icon:"🏢", color:"#6a1b9a" },
  travel:      { ar:"السفر والسياحة",   en:"Travel Guides",     icon:"✈️", color:"#c17900" },
};
const KC_DEFAULT_ARTICLES = [
  { id:"cit-dominica", category:"citizenship", featured:true, date:"2025-06-01", readTime:9,
    titleAr:"جنسية دومينيكا بالاستثمار — الدليل الكامل 2025",
    titleEn:"Dominica Citizenship by Investment — Complete Guide 2025",
    excerptAr:"أسرع وأوفر برنامج جنسية في العالم. 140 دولة بدون تأشيرة، لا يشترط الإقامة، وجواز سفر كاريبي معترف به دولياً.",
    excerptEn:"The world's fastest and most affordable citizenship program. 140 visa-free countries, no residency required.",
    contentAr:"## نبذة عن البرنامج\nلضمان الشفافية والمصداقية، وضعت حكومة دومينيكا مجموعة من الشروط الواضحة التي يجب على جميع المتقدمين استيفاؤها. البرنامج قائم منذ 1993 ويُعدّ من أقدم وأفضل برامج الجنسية بالاستثمار عالمياً.\n\n## شروط الحصول على الجنسية\n• أن يكون عمر المتقدم 18 عامًا أو أكثر\n• امتلاك سجل جنائي نظيف وخالٍ من أي مخالفات\n• تقديم إثبات قانوني لمصدر الأموال المستخدمة في الاستثمار\n• الأبناء المعالون تحت سن 30 عامًا مشمولون\n• الآباء المعالون فوق سن 65 عامًا مشمولون\n• اجتياز فحص التدقيق الأمني الإلزامي\n\n## المزايا الرئيسية\n• السفر بدون تأشيرة إلى 140 دولة بما فيها دول الشنغن والصين والمملكة المتحدة\n• لا يُشترط الإقامة قبل الحصول على الجنسية أو بعدها\n• الجنسية مدى الحياة وقابلة للتوريث للأجيال القادمة\n• ازدواجية الجنسية مسموحة\n• لا ضريبة على الدخل العالمي لغير المقيمين\n\n## خيارات الاستثمار\n→ صندوق التنمية الاقتصادية (EDF): تبرع لا يُسترد — من 200,000 دولار للأسرة\n→ الاستثمار العقاري المعتمد: 200,000 دولار يُحتفظ به لمدة 3 سنوات على الأقل\n\n## التكاليف التفصيلية\n$ التبرع للصندوق: 100,000 دولار (متقدم فردي) أو 200,000 دولار (أسرة من 4)\n$ رسوم الحكومة والإدارة: تبدأ من 50,000 دولار\n$ رسوم معالجة الملف: تختلف حسب عدد أفراد الأسرة\n\n## مدة الحصول على الجنسية\nمن 6 إلى 9 أشهر فقط",
    contentEn:"## About the Program\nDominica has set clear transparent requirements for its Citizenship by Investment Program since 1993, one of the oldest and most reputable globally.\n\n## Eligibility Requirements\n• Applicant must be at least 18 years old\n• Clean criminal record with no violations\n• Legal proof of the source of investment funds\n• Dependent children under 30 can be included\n• Dependent parents over 65 can be included\n• Mandatory security background check\n\n## Key Benefits\n• Visa-free access to 140 countries including Schengen, China and UK\n• No residency required before or after citizenship\n• Lifetime citizenship, hereditary for future generations\n• Dual citizenship allowed\n• No tax on global income for non-residents\n\n## Investment Options\n→ Economic Diversification Fund (EDF): non-refundable donation from $200,000 for a family\n→ Approved Real Estate: $200,000 held for minimum 3 years\n\n## Detailed Costs\n$ Fund donation: $100,000 (single) or $200,000 (family of 4)\n$ Government and admin fees: starting from $50,000\n\n## Processing Time\n6 to 9 months" },

  { id:"cit-malta", category:"citizenship", featured:true, date:"2025-06-01", readTime:11,
    titleAr:"الجنسية المالطية — جواز الاتحاد الأوروبي الأقوى في العالم",
    titleEn:"Malta Citizenship — World's Most Powerful EU Passport",
    excerptAr:"190 دولة بدون تأشيرة. حق العيش والعمل في أي دولة أوروبية. ثلاث مراحل واضحة للحصول على الجواز الأوروبي.",
    excerptEn:"190 visa-free countries. Right to live and work anywhere in the EU. Three clear phases to an EU passport.",
    contentAr:"## نبذة عن مالطا وبرنامجها\nمالطا دولة في الاتحاد الأوروبي وجوازها يُصنَّف ضمن الأقوى عالمياً. يعيش المواطن المالطي بحرية تامة في 27 دولة أوروبية مع حق العمل والدراسة والإقامة الدائمة.\n\n## المرحلة الأولى: الإقامة\n• يحصل مقدم الطلب على بطاقة الإقامة المالطية خلال 1 إلى 3 أسابيع من تقديم الطلب\n• يجب الاحتفاظ بالإقامة المالطية لمدة 36 شهرًا (أو 12 شهرًا حسب الخيار المختار)\n• خلال هذه الفترة يجب على المستثمر قضاء وقت فعلي في مالطا\n\n## المرحلة الثانية: طلب الأهلية\n• بعد إصدار بطاقة الإقامة يُقدَّم طلب الأهلية للحصول على الجنسية\n• يتم إصدار خطاب الموافقة على الأهلية خلال 120 إلى 150 يومًا\n• يُشترط استيفاء جميع المستندات المطلوبة لضمان سرعة المعالجة\n\n## المرحلة الثالثة: الجنسية النهائية\n• بعد مرور 12 أو 36 شهرًا من الإقامة ونجاح تقييم الأهلية يُقدَّم طلب الجنسية الرسمي\n• تُصدر دعوة لأداء قسم الولاء\n• بمجرد أداء القسم تُصدر شهادة التجنيس وجواز السفر المالطي\n• تواصل الجهة المختصة مراقبة الامتثال لمدة خمس سنوات\n\n## المزايا الاستثنائية\n• جواز سفر الاتحاد الأوروبي — دخول 190 دولة بلا تأشيرة\n• الحق الكامل في العيش والعمل والدراسة في أي دولة أوروبية\n• ازدواجية الجنسية مسموحة\n• الأسرة الكاملة مشمولة في الطلب\n\n## التكاليف (خيار 12 شهراً)\n$ الاستثمار الأساسي في الصندوق الوطني: 600,000 يورو\n$ إيجار عقار في مالطا: 16,000 يورو سنوياً (أو شراء 700,000+)\n$ تبرع للمنظمات الخيرية المحلية: 10,000 يورو\n\n## مدة الحصول على الجنسية\nمن 12 إلى 36 شهراً حسب الخيار المختار",
    contentEn:"## About Malta\nMalta is an EU member state and its passport ranks among the world's most powerful, granting full freedom to live, work and study across 27 European countries.\n\n## Phase 1: Residency\n• Residence card issued within 1 to 3 weeks\n• Must maintain Maltese residency for 36 months (or 12 months on fast track)\n• Applicant must spend actual time in Malta\n\n## Phase 2: Eligibility Application\n• After residence card, eligibility application is submitted\n• Approval letter issued within 120 to 150 days\n\n## Phase 3: Citizenship\n• After 12 or 36 months the citizenship application is submitted\n• Invitation to take the Oath of Allegiance\n• Certificate of Naturalization and passport issued upon oath\n• Compliance monitored for five years\n\n## Exceptional Benefits\n• EU passport — visa-free access to 190 countries\n• Full right to live, work and study in any EU country\n• Dual citizenship allowed\n• Full family coverage\n\n## Costs (12-month track)\n$ National Development Fund: 600,000 euros\n$ Property in Malta: 16,000 euros/year rent (or 700,000+ purchase)\n$ Charitable donation: 10,000 euros\n\n## Processing Time\n12 to 36 months" },

  { id:"cit-saint-lucia", category:"citizenship", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"جنسية سانت لوسيا — تشمل الشنغن والمملكة المتحدة وأسرتك كاملة",
    titleEn:"Saint Lucia Citizenship — Schengen, UK and Full Family Coverage",
    excerptAr:"جواز سفر كاريبي لـ 140 دولة. الأبناء حتى سن 31 والأشقاء غير المتزوجين — أوسع تغطية عائلية في الكاريبي.",
    excerptEn:"Caribbean passport for 140 countries. Children up to age 31 and unmarried siblings — widest family coverage in the Caribbean.",
    contentAr:"## برنامج جنسية سانت لوسيا\nيتميز هذا البرنامج بأوسع تغطية عائلية في منطقة الكاريبي. وضعت الحكومة شروطاً واضحة لضمان نزاهة البرنامج ومصداقيته.\n\n## شروط الأهلية\n• أن يكون العمر 18 عامًا على الأقل\n• عدم وجود سجل جنائي\n• تقديم إثبات مصدر الأموال للاستثمار\n• الأبناء المعالون حتى سن 31 عامًا مشمولون\n• الآباء المعالون من عمر 55 عامًا فما فوق مشمولون\n• الأشقاء غير المتزوجين حتى سن 18 عامًا مشمولون\n• اجتياز فحص التدقيق الأمني الإلزامي\n\n## المزايا الرئيسية\n• السفر بدون تأشيرة لـ 140 دولة بما فيها الشنغن والمملكة المتحدة وهونغ كونغ\n• الأبناء المعالون مشمولون حتى سن 31 — الأوسع في الكاريبي\n• الوالدان المعالون من عمر 55+ مشمولون\n• الأشقاء غير المتزوجين حتى 18 مشمولون\n• ازدواجية الجنسية مسموحة\n• لا يُشترط الإقامة\n\n## خيارات الاستثمار\n→ صندوق الاقتصاد الوطني (NEF): تبرع لا يُسترد — 240,000 دولار للأسرة\n→ استثمار عقاري معتمد: 300,000 دولار يُحتفظ به 5 سنوات\n→ سندات حكومية: 300,000 دولار لمدة 5 سنوات\n\n## التكاليف\n$ NEF للفرد: 100,000 دولار\n$ NEF للأسرة من 4 أفراد: 140,000 دولار\n\n## مدة المعالجة\nمن 12 إلى 18 شهراً",
    contentEn:"## Saint Lucia Citizenship Program\nThis program has the widest family coverage in the Caribbean. The government set clear requirements ensuring program integrity.\n\n## Eligibility Requirements\n• At least 18 years old\n• No criminal record\n• Proof of source of investment funds\n• Dependent children up to age 31 included\n• Dependent parents aged 55+ included\n• Unmarried siblings up to age 18 included\n• Mandatory security background check\n\n## Key Benefits\n• Visa-free to 140 countries including Schengen, UK and Hong Kong\n• Dependent children up to age 31 — widest in the Caribbean\n• Parents 55+ included\n• Dual citizenship allowed\n• No residency requirement\n\n## Investment Options\n→ National Economic Fund (NEF): non-refundable from $240,000 for family\n→ Approved real estate: $300,000 held for 5 years\n→ Government bonds: $300,000 for 5 years\n\n## Costs\n$ NEF single applicant: $100,000\n$ NEF family of 4: $140,000\n\n## Processing Time\n12 to 18 months" },

  { id:"cit-grenada", category:"citizenship", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"جنسية غرينادا — الدولة الكاريبية الوحيدة بمعاهدة E-2 الأمريكية",
    titleEn:"Grenada Citizenship — Only Caribbean Nation with US E-2 Treaty",
    excerptAr:"143 دولة بدون تأشيرة. الميزة الحصرية: مسار للوصول إلى تأشيرة المستثمر الأمريكية E-2 للجنسيات غير المؤهلة عادةً.",
    excerptEn:"143 visa-free countries. Exclusive: path to US E-2 investor visa for nationalities usually ineligible.",
    contentAr:"## ما يجعل جنسية غرينادا استثنائية\nيستند البرنامج إلى أساس قانوني متين يضمن أن كل فائدة هي حق دائم ومحمي مصمم لتعزيز حريتك العالمية وتأمين مستقبل أسرتك.\n\n## المزايا الرئيسية والحصرية\n• السفر بدون تأشيرة إلى 143 دولة بما فيها منطقة الشنغن والمملكة المتحدة والصين\n• الميزة الحصرية: معاهدة تأشيرة المستثمر E-2 مع الولايات المتحدة الأمريكية — غرينادا الدولة الكاريبية الوحيدة بهذه الميزة\n• توريث الجنسية للأطفال حديثي الولادة تلقائياً\n• السماح بازدواجية الجنسية\n• إمكانية كفالة الأشقاء في نفس الطلب\n• عدم فرض ضرائب على الدخل العالمي لغير المقيمين\n\n## ما هي تأشيرة E-2؟\nتأشيرة E-2 أمريكية خاصة بالمستثمرين تتيح العيش والعمل في الولايات المتحدة بشرط الاستثمار في عمل تجاري أمريكي. غرينادا هي الدولة الكاريبية الوحيدة التي وقّعت معاهدة E-2 مع أمريكا مما يعني أن حاملي جنسيتها يمكنهم التقديم لهذه التأشيرة المميزة.\n\n## شروط الأهلية\n• العمر 18 عامًا أو أكثر\n• سجل جنائي نظيف\n• إثبات مصدر الأموال القانوني\n• اجتياز فحص العناية الواجبة\n\n## خيارات الاستثمار\n→ صندوق التنمية الوطنية (NTF): تبرع لا يُسترد — 235,000 دولار للأسرة\n→ استثمار عقاري معتمد: 270,000 دولار لمدة 5 سنوات\n\n## مدة المعالجة\nمن 6 إلى 9 أشهر",
    contentEn:"## What Makes Grenada Exceptional\nBuilt on solid legal foundation, every benefit is a permanent protected right designed to enhance your global freedom.\n\n## Key and Exclusive Benefits\n• Visa-free travel to 143 countries including Schengen, UK and China\n• EXCLUSIVE: US E-2 investor visa treaty — Grenada is the ONLY Caribbean nation with this\n• Children born after naturalization automatically inherit citizenship\n• Dual citizenship allowed\n• Siblings can be included\n• No tax on global income for non-residents\n\n## What is the E-2 Visa?\nThe E-2 visa allows investors to live and work in the US by investing in an American business. Grenada is the only Caribbean nation with a US E-2 treaty.\n\n## Eligibility Requirements\n• Age 18 or older\n• Clean criminal record\n• Legal proof of source of funds\n• Pass due diligence checks\n\n## Investment Options\n→ National Transformation Fund (NTF): non-refundable from $235,000 for family\n→ Approved real estate: $270,000 for 5 years\n\n## Processing Time\n6 to 9 months" },

  { id:"cit-turkey", category:"citizenship", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"الجنسية التركية بالاستثمار العقاري — اقتصاد G20 وجواز 111 دولة",
    titleEn:"Turkish Citizenship by Real Estate — G20 Economy, 111-Country Passport",
    excerptAr:"تركيا عضو G20. استثمار 400,000 دولار عقاري يمنحك جواز سفر يتيح دخول 111 دولة بلا تأشيرة.",
    excerptEn:"Turkey is a G20 member. $400,000 real estate investment grants a passport for visa-free access to 111 countries.",
    contentAr:"## الجنسية التركية خطوة بخطوة\nيتم توجيه عملية التقديم من خلال مستشارين ذوي خبرة لضمان الحصول على جواز السفر التركي في أقصر وقت ممكن.\n\n## خطوات الحصول على الجنسية التركية\n→ الخطوة 1: جمع وترجمة وتوثيق جميع المستندات المطلوبة لاستيفاء متطلبات الحكومة التركية\n→ الخطوة 2: تقديم المستندات والرسوم إلى الحكومة التركية للموافقة المبدئية\n→ الخطوة 3: بعد الحصول على الموافقة المبدئية يتم توجيه المتقدم لإجراء المدفوعات المالية اللازمة وإتمام الاستثمار\n→ الخطوة 4: بمجرد الموافقة النهائية تتم دعوة المتقدم لزيارة تركيا لأداء قسم الولاء\n→ الخطوة 5: استلام جواز السفر التركي رسمياً\n\n## المزايا الرئيسية\n• جواز سفر تركي يتيح دخول 111 دولة بلا تأشيرة بما فيها هونغ كونغ واليابان وسنغافورة\n• استثمار عقاري في سوق عقارات تركي مزدهر ومتنامٍ\n• ازدواجية الجنسية مسموحة\n• تركيا اقتصاد G20 — المرتبة السابعة عشرة عالمياً\n• الأسرة الكاملة مشمولة في الطلب\n\n## شروط الأهلية\n• الاستثمار في عقار بقيمة 400,000 دولار أمريكي على الأقل\n• الاحتفاظ بالعقار لمدة 3 سنوات على الأقل\n• عدم وجود سجل جنائي\n• إثبات مصدر الأموال القانوني\n\n## التكاليف\n$ الاستثمار العقاري الحد الأدنى: 400,000 دولار\n$ رسوم التقديم والتوثيق: 3,000 - 5,000 دولار تقريباً\n\n## مدة المعالجة\nمن 6 إلى 9 أشهر",
    contentEn:"## Turkish Citizenship Step by Step\nExperienced advisors guide the entire process to obtain Turkish citizenship in the shortest possible time.\n\n## Steps to Turkish Citizenship\n→ Step 1: Collect, translate and notarize all required documents\n→ Step 2: Submit documents and fees for preliminary approval\n→ Step 3: After preliminary approval, complete investment payments\n→ Step 4: After final approval, visit Turkey to take the Oath of Allegiance\n→ Step 5: Receive the Turkish passport officially\n\n## Key Benefits\n• Turkish passport for 111 countries including Hong Kong, Japan and Singapore\n• Real estate investment in a booming Turkish market\n• Dual citizenship allowed\n• Turkey is a G20 economy ranked 17th globally\n• Full family coverage\n\n## Eligibility\n• Real estate investment of at least $400,000\n• Hold the property for minimum 3 years\n• Clean criminal record\n\n## Costs\n$ Minimum real estate: $400,000\n$ Application fees: approximately $3,000-$5,000\n\n## Processing Time\n6 to 9 months" },

  { id:"cit-stkitts", category:"citizenship", featured:false, date:"2025-06-01", readTime:7,
    titleAr:"سانت كيتس ونيفيس — أقدم برنامج جنسية في العالم منذ 1984",
    titleEn:"St. Kitts & Nevis — World's Oldest Citizenship Program Since 1984",
    excerptAr:"أكثر من 40 عاماً من الموثوقية. 157 دولة بدون تأشيرة — الأكثر في الكاريبي. يشمل الشنغن والمملكة المتحدة وكندا.",
    excerptEn:"Over 40 years of reliability. 157 visa-free countries — most in Caribbean. Includes Schengen, UK and Canada.",
    contentAr:"## أقدم برنامج في العالم\nأُطلق برنامج سانت كيتس ونيفيس للجنسية بالاستثمار عام 1984 مما يجعله أقدم برنامج من نوعه في العالم. خلال أكثر من 40 عاماً أثبت البرنامج موثوقيته الاستثنائية ومتانته القانونية.\n\n## خطوات الحصول على الجنسية\n→ الخطوة 1: حجز استشارة مجانية مع مستشارين متخصصين\n→ الخطوة 2: تقديم المستندات إلى الحكومة مع دفع الرسوم الثابتة لبدء معالجة الطلب\n→ الخطوة 3: عند الموافقة المبدئية يتم سداد المبلغ الاستثماري المطلوب\n→ الخطوة 4: يحصل المتقدم على شهادة التسجيل ويصبح مواطناً رسمياً\n→ الخطوة 5: تقديم طلب جواز السفر وتسليمه للمتقدم\n\n## المزايا الرئيسية\n• 157 دولة بدون تأشيرة — الأعلى بين الدول الكاريبية\n• يشمل منطقة شنغن والمملكة المتحدة وكندا وهونغ كونغ\n• ازدواجية الجنسية مسموحة\n• لا يُشترط الإقامة قبل أو بعد الحصول على الجنسية\n• الجنسية مدى الحياة وقابلة للتوريث\n• لا ضريبة على الدخل العالمي لغير المقيمين\n\n## خيارات الاستثمار\n→ صندوق التنمية المستدامة (SISC): تبرع لا يُسترد — 250,000 دولار للأسرة\n→ استثمار عقاري معتمد: 325,000 دولار يُحتفظ به 7 سنوات\n\n## مدة المعالجة\nمن 6 إلى 9 أشهر",
    contentEn:"## World's Oldest Program\nLaunched in 1984, St. Kitts and Nevis CBI program is the oldest in the world. Over 40+ years it has proven exceptional reliability and legal strength.\n\n## Steps to Citizenship\n→ Step 1: Free consultation with specialist advisors\n→ Step 2: Submit documents with fixed fees to begin processing\n→ Step 3: Upon preliminary approval, pay the required investment amount\n→ Step 4: Receive Certificate of Registration and become an official citizen\n→ Step 5: Submit passport application and receive it\n\n## Key Benefits\n• 157 visa-free countries — highest among Caribbean nations\n• Includes Schengen, UK, Canada and Hong Kong\n• Dual citizenship allowed\n• No residency required before or after citizenship\n• Lifetime hereditary citizenship\n• No tax on global income for non-residents\n\n## Investment Options\n→ Sustainable Island State Contribution (SISC): non-refundable from $250,000 for family\n→ Approved real estate: $325,000 for 7 years\n\n## Processing Time\n6 to 9 months" },

  { id:"res-portugal-golden", category:"residency", featured:true, date:"2025-06-01", readTime:11,
    titleAr:"الفيزا الذهبية البرتغالية — الدليل الشامل 2025",
    titleEn:"Portugal Golden Visa — Complete Guide 2025",
    excerptAr:"7 أيام في السنة تكفي. استثمار 500,000 يورو يفتح لك أبواب الجنسية الأوروبية بعد 5 سنوات وجواز 191 دولة.",
    excerptEn:"Only 7 days per year required. 500,000 euro investment opens the door to European citizenship after 5 years.",
    contentAr:"## نبذة عن البرتغال\nتُعد البرتغال واحدة من أقدم الدول الأوروبية وتتميز بتاريخ عريق يمتد لآلاف السنين. تشتهر بشواطئها الطويلة المشمسة على طول الساحل الأطلسي وقراها التقليدية ومعمارها التاريخي ومدنها المزدهرة مثل لشبونة وبورتو التي تمزج بين الحداثة والتراث. توفر البرتغال جودة حياة عالية مع مناخ معتدل ونظام صحي وتعليمي متطور وتكاليف معيشة معقولة مقارنة بالدول الأوروبية الأخرى.\n\n## المزايا الرئيسية للفيزا الذهبية\n• الحق في العيش والعمل والدراسة داخل البرتغال\n• دخول بدون تأشيرة لجميع دول منطقة الشنغن الـ 27\n• الأهلية للحصول على الجنسية البرتغالية بعد 5 سنوات — جواز يتيح دخول 191 دولة\n• يكفي الحضور 7 أيام فقط سنوياً للحفاظ على الإقامة\n• الاستفادة من برنامج ITS الضريبي المحفّز للوافدين الجدد\n\n## أفراد الأسرة المشمولون\n• الزوج أو الزوجة\n• الأبناء تحت 18 عامًا\n• الأطفال المعالون تحت سن 26 (غير متزوجين وطلاب بدوام كامل)\n• الوالدان المعالون من عمر 65 فأكثر\n\n## خيارات الاستثمار المتاحة\n→ الاستثمار في صندوق مؤهَّل (الأكثر شيوعاً): 500,000 يورو في صناديق استثمارية معتمدة\n→ تأسيس شركة وتوفير 10 وظائف في البرتغال: 500,000 يورو\n→ التبرع للبحث العلمي أو التطور التكنولوجي: 500,000 يورو\n→ التبرع للفنون أو التراث الثقافي الوطني: 250,000 يورو\n\n## التكاليف التفصيلية\n$ الاستثمار الرئيسي: 500,000 يورو (للصندوق)\n$ رسوم تقديم الطلب: 605 يورو لكل فرد\n$ رسوم إصدار بطاقة الإقامة: 6,045 يورو لكل فرد\n$ رسوم التجديد (كل سنتين): 3,023 يورو لكل فرد\n\n## مدة الحصول على الإقامة\nمن 12 إلى 18 شهراً",
    contentEn:"## About Portugal\nPortugal is one of Europe's oldest nations with rich history spanning thousands of years. Known for long sunny beaches along the Atlantic coast, traditional villages, historic architecture and thriving cities like Lisbon and Porto. High quality of life with temperate climate, advanced healthcare and education.\n\n## Key Benefits of the Golden Visa\n• Right to live, work and study in Portugal\n• Visa-free access to all 27 Schengen countries\n• Eligibility for Portuguese citizenship after 5 years — passport for 191 countries\n• Only 7 days per year required to maintain residency\n• Benefit from the ITS tax incentive program for newcomers\n\n## Family Coverage\n• Spouse\n• Children under 18\n• Dependent children under 26 (unmarried, full-time students)\n• Dependent parents aged 65+\n\n## Investment Options\n→ Qualified investment fund (most popular): 500,000 euros in approved funds\n→ Company setup plus 10 jobs in Portugal: 500,000 euros\n→ Scientific research donation: 500,000 euros\n→ Arts or national heritage donation: 250,000 euros\n\n## Detailed Costs\n$ Main investment: 500,000 euros\n$ Application fee: 605 euros per person\n$ Residence card: 6,045 euros per person\n$ Renewal every 2 years: 3,023 euros per person\n\n## Timeline\n12 to 18 months" },

  { id:"res-uae-golden", category:"residency", featured:true, date:"2025-06-01", readTime:9,
    titleAr:"الإقامة الذهبية الإماراتية — 10 سنوات بدون كفيل",
    titleEn:"UAE Golden Residency — 10 Years, No Sponsor Needed",
    excerptAr:"إقامة ذاتية الكفالة لـ 10 سنوات. تأسيس شركات بملكية 100%. الأكثر طلباً في المنطقة العربية.",
    excerptEn:"Self-sponsored 10-year residency. 100% company ownership. Most sought-after in the Arab world.",
    contentAr:"## الإقامة الذهبية الإماراتية\nمن أكثر برامج الإقامة طلباً في العالم العربي. تُتيح للمستثمرين والمواهب المتخصصة الإقامة في الإمارات لمدة 5 أو 10 سنوات بدون الحاجة إلى كفيل.\n\n## الفئة الأولى: المستثمرون في الاستثمارات العامة (إقامة 10 سنوات بدون كفيل)\n• تقديم خطاب من صندوق استثماري معتمد في الإمارات يثبت إيداع مبلغ مليوني درهم\n• أو تقديم رخصة تجارية أو صناعية سارية مع بيان شراكة يوضح رأس مال لا يقل عن مليوني درهم\n• أو تقديم خطاب من الهيئة الاتحادية للضرائب يثبت مدفوعات حكومية سنوية لا تقل عن 250,000 درهم\n• يُشترط أن تكون الملكية للمستثمر بالكامل وليست كقرض\n\n## الفئة الثانية: المستثمرون في العقارات (إقامة 5 سنوات قابلة للتجديد)\n• ملكية عقار بقيمة لا تقل عن مليوني درهم\n• أو شراء عقار باستخدام قرض من بنوك محلية معتمدة من الجهات الرسمية\n\n## الفئة الثالثة: رواد الأعمال (إقامة 5 سنوات قابلة للتجديد)\n• امتلاك مشروع اقتصادي يركز على الابتكار التقني أو المستقبلي\n• الحصول على موافقة مدقق حسابات معتمد يثبت أن قيمة المشروع لا تقل عن 500,000 درهم\n• موافقة من السلطات المحلية تؤكد الطابع التقني أو المستقبلي للمشروع\n• موافقة من حاضنة أعمال معتمدة تدعم النشاط المقترح\n\n## الفئة الرابعة: ذوو المهارات المتخصصة البارزة\nيشمل الأطباء والعلماء والفنانين والمخترعين والمديرين التنفيذيين وحاملي الدكتوراه والمتخصصين في الهندسة والعلوم والتقنية.\n\n## المزايا الرئيسية\n• إقامة ذاتية الكفالة — لا تحتاج لكفيل\n• تأسيس شركات بملكية 100% بدون شريك محلي\n• الأسرة الكاملة مشمولة بنفس مدة الإقامة\n• تجديد سهل وسريع\n\n## مدة المعالجة\nبضعة أسابيع فقط",
    contentEn:"## UAE Golden Residency\nOne of the most sought-after programs in the Arab world, allowing investors and specialized talent to reside in the UAE for 5 or 10 years without a sponsor.\n\n## Category 1: Public Investment Investors (10-Year Self-Sponsored Residency)\n• Letter from approved investment fund confirming AED 2 million deposit\n• OR valid trade or industrial license with partnership statement showing capital of at least AED 2 million\n• OR letter from Federal Tax Authority confirming annual government payments of at least AED 250,000\n• Full ownership required, not a loan\n\n## Category 2: Real Estate Investors (5-Year Renewable)\n• Property ownership valued at minimum AED 2 million\n• Or property purchased via mortgage from officially approved local banks\n\n## Category 3: Entrepreneurs (5-Year Renewable)\n• Economic project focused on technical or future innovation\n• Certified auditor approval confirming project value of AED 500,000 or more\n• Local authority confirmation of technical nature\n• Letter from approved business incubator\n\n## Category 4: Specialized Talent\nIncludes doctors, scientists, artists, inventors, executives, PhD holders, engineers and technology specialists.\n\n## Key Benefits\n• Self-sponsored residency — no sponsor needed\n• 100% company ownership without a local partner\n• Full family coverage with same duration\n• Easy and fast renewal\n\n## Processing Time\nJust a few weeks" },

  { id:"res-portugal-d7", category:"residency", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"تأشيرة البرتغال D7 — للدخل السلبي والمتقاعدين",
    titleEn:"Portugal D7 Visa — For Passive Income and Retirees",
    excerptAr:"دخل شهري 1,000 يورو يكفي للحصول على إقامة برتغالية. مسار للجنسية بعد 5 سنوات وجواز 191 دولة.",
    excerptEn:"Monthly income of 1,000 euros is enough to get Portuguese residency. Path to citizenship after 5 years.",
    contentAr:"## تأشيرة D7 البرتغالية\nتأشيرة D7 مصمّمة للأفراد الذين يمتلكون دخلاً سلبياً ثابتاً من الخارج كالمعاشات التقاعدية ودخل الإيجارات وأرباح الاستثمارات وتُتيح لهم الإقامة القانونية في البرتغال.\n\n## مزايا تأشيرة D7\n• العيش في البرتغال والاستفادة من الدخل السلبي القادم من الخارج\n• حق لمّ الشمل للزوج/الزوجة والأطفال المعالين والوالدين المعالين\n• السفر بدون تأشيرة إلى جميع دول منطقة الشنغن\n• الوصول إلى الرعاية الصحية العامة المجانية والتعليم العالي المرموق\n• الأهلية لبرنامج ITS الضريبي المحفّز الذي يوفر ضرائب منخفضة على الدخل الأجنبي\n• الأهلية للحصول على الإقامة الدائمة والجنسية بعد 5 سنوات\n\n## الشروط الأساسية\n• عمر 18 عامًا فأكثر\n• ليس من مواطني الاتحاد الأوروبي\n• سجل جنائي نظيف\n• دخل شهري ثابت لا يقل عن 1,000 يورو من مصادر دخل سلبي\n• استئجار أو امتلاك سكن في البرتغال\n• تأمين صحي ساري المفعول\n\n## مصادر الدخل المقبولة\n→ معاشات التقاعد والتأمين الاجتماعي\n→ دخل الإيجارات من العقارات\n→ أرباح الأسهم والاستثمارات المالية\n→ دخل حقوق الملكية الفكرية\n→ أي مصدر دخل سلبي ثابت وقانوني آخر\n\n## لمّ الشمل الممكن\n• الزوج أو الزوجة\n• الأبناء المعالون تحت 18 (أو تحت 26 إن كانوا طلاباً)\n• الوالدان المعالون\n\n## الحد الأدنى للدخل\n1,000 يورو شهرياً بدون استثمار محدد\n\n## مدة المعالجة\nمن 2 إلى 3 أشهر",
    contentEn:"## Portugal D7 Visa\nDesigned for individuals with stable passive income from abroad such as pensions, rental income and investment dividends, allowing legal residency in Portugal.\n\n## D7 Benefits\n• Live in Portugal using passive income from abroad\n• Family reunification for spouse, dependent children and parents\n• Visa-free travel across all 27 Schengen countries\n• Free public healthcare and prestigious higher education\n• Eligible for ITS tax incentive with lower taxes on foreign income\n• Eligible for permanent residency and citizenship after 5 years\n\n## Core Requirements\n• Age 18 or older\n• Non-EU citizen\n• Clean criminal record\n• Stable monthly passive income of at least 1,000 euros\n• Rent or own housing in Portugal\n• Valid health insurance\n\n## Accepted Income Sources\n→ Retirement and social security pensions\n→ Real estate rental income\n→ Stock dividends and investment returns\n→ Intellectual property royalties\n→ Any other stable legal passive income\n\n## Minimum Income\n1,000 euros monthly, no specific investment required\n\n## Processing Time\n2 to 3 months" },

  { id:"res-portugal-d8", category:"residency", featured:false, date:"2025-06-01", readTime:9,
    titleAr:"تأشيرة البرتغال D8 — للعمل عن بُعد والرحّالة الرقميين",
    titleEn:"Portugal D8 — Digital Nomad and Remote Work Visa",
    excerptAr:"أُطلقت أكتوبر 2022. دخل 3,480 يورو/شهر يفتح لك باب العيش في البرتغال مع الحفاظ على وظيفتك عن بُعد.",
    excerptEn:"Launched October 2022. 3,480 euros per month income unlocks living in Portugal while keeping your remote job.",
    contentAr:"## ما هي تأشيرة D8؟\nتُعرف تأشيرة D8 البرتغالية بأنها تأشيرة الرحّل الرقميين التي أُطلقت في أكتوبر 2022 لتمكين العاملين عن بُعد والمستقلين من العيش في البرتغال أثناء العمل لصالح شركات أو عملاء خارجها.\n\n## مزايا تأشيرة D8\n• تمنح تصريح إقامة لمدة سنتين قابلاً للتجديد\n• الجنسية البرتغالية بعد 5 سنوات — جواز 191 دولة\n• نظام Beckham Law الضريبي — ضريبة ثابتة 24% على الدخل\n• حرية التنقل في منطقة الشنغن\n• جودة حياة عالية بتكاليف معيشة منخفضة مقارنة بغرب أوروبا\n\n## شروط الأهلية\n• أن يكون المتقدمون بعمر 18 عامًا أو أكثر\n• أن يكونوا من غير مواطني دول الاتحاد الأوروبي\n• ألا يكون لديهم أي سجل جنائي\n• أن يكونوا عاملين عن بُعد كموظفين أو مستقلين لصالح جهة خارج البرتغال\n• إثبات دخل شهري لا يقل عن 3,480 يورو\n• استئجار أو امتلاك عقار في البرتغال\n• وجود تأمين صحي ساري المفعول\n\n## أفراد العائلة الذين يمكن إضافتهم\n• الزوج أو الزوجة (في زواج قانوني أو شراكة مدنية معترف بها)\n• الأطفال تحت 18 عامًا\n• الأطفال فوق 18 عامًا (غير متزوجين ومعتمدين ماليًا وطلاب بدوام كامل)\n• والدا مقدم الطلب الرئيسي أو والدا الزوج/الزوجة إذا كانوا معتمدين مالياً\n\n## ما بعد الـ 5 سنوات\nعند إتمام خمس سنوات يصبح الحصول على الجنسية البرتغالية أمرًا ممكنًا مع جواز السفر البرتغالي يمكن السفر إلى 191 دولة بدون تأشيرة.\n\n## الحد الأدنى للدخل\n3,480 يورو شهرياً من عمل عن بُعد أو عمل حر\n\n## مدة المعالجة\nحوالي 6 أشهر",
    contentEn:"## What is the D8 Visa?\nThe Portuguese D8 Digital Nomad Visa was launched in October 2022 to enable remote workers and freelancers to live in Portugal while working for companies or clients outside the country.\n\n## D8 Benefits\n• 2-year renewable residence permit\n• Portuguese citizenship after 5 years, passport for 191 countries\n• Beckham Law flat 24% income tax\n• Schengen zone travel freedom\n• High quality of life with lower costs than Western Europe\n\n## Eligibility Requirements\n• Age 18 or older\n• Non-EU citizen\n• No criminal record\n• Work remotely as employee or freelancer for entities outside Portugal\n• Monthly income of at least 3,480 euros\n• Rent or own housing in Portugal\n• Valid health insurance\n\n## Family Members Included\n• Spouse (legal marriage or recognized civil partnership)\n• Children under 18\n• Children over 18 who are unmarried, financially dependent, full-time students\n• Parents of applicant or spouse if financially dependent\n\n## After 5 Years\nPortuguese citizenship becomes available with a passport granting visa-free access to 191 countries.\n\n## Processing Time\nApproximately 6 months" },

  { id:"res-portugal-d2", category:"residency", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"تأشيرة البرتغال D2 — لرواد الأعمال وأصحاب المشاريع",
    titleEn:"Portugal D2 Visa — For Entrepreneurs and Business Owners",
    excerptAr:"أسّس مشروعك في البرتغال وعش في أوروبا. لا يوجد حد أدنى ثابت للاستثمار. جنسية أوروبية بعد 5 سنوات.",
    excerptEn:"Start your business in Portugal and live in Europe. No fixed minimum investment. EU citizenship after 5 years.",
    contentAr:"## تأشيرة D2 لرواد الأعمال\nتأشيرة D2 البرتغالية مخصّصة لرواد الأعمال الذين يرغبون في تأسيس وإدارة عمل تجاري داخل البرتغال مع مسار واضح للإقامة الدائمة أو الجنسية بعد خمس سنوات.\n\n## مسارات التقديم الثلاثة\n→ شراء شركة برتغالية قائمة أو حصة منها\n→ تقديم خطة عمل شاملة لمشروع جديد\n→ إنشاء فرع لشركتك الأجنبية الحالية داخل البرتغال\n\n## شروط الأهلية\n• يجب أن يكون المتقدّمون بعمر 18 عامًا فما فوق\n• يجب أن يكونوا من خارج دول الاتحاد الأوروبي\n• يجب ألا يكون لديهم سجلّ جنائي\n• امتلاك شركة قائمة أو تقديم خطة عمل مفصّلة أو إنشاء فرع لشركة أجنبية في البرتغال\n• استئجار أو امتلاك سكن في البرتغال\n• إثبات وجود أموال كافية للعيش في البرتغال لمدة عام واحد على الأقل\n• امتلاك تأمين صحي ساري المفعول\n\n## مدة الإقامة\nتأشيرة D2 صالحة مبدئيًا لأربعة أشهر للدخول وتقديم طلب الإقامة ثم تصريح إقامة لمدة عامين قابل للتجديد لفترات إضافية مدتها ثلاث سنوات.\n\n## مسار الجنسية\nعند إتمام خمس سنوات يصبح الحصول على الجنسية البرتغالية ممكناً وجواز يتيح دخول 191 دولة بدون تأشيرة.\n\n## الحد الأدنى للاستثمار\nلا يوجد حد ثابت — يجب إثبات توفر الأموال الكافية لدعم الأعمال والإقامة.\n\n## مدة المعالجة\nمن شهرين إلى ثلاثة أشهر",
    contentEn:"## D2 Visa for Entrepreneurs\nThe Portuguese D2 visa is for entrepreneurs wishing to establish and manage a business in Portugal, with a path to permanent residency or citizenship after 5 years.\n\n## Three Application Pathways\n→ Purchase an existing Portuguese company or stake in one\n→ Submit a comprehensive business plan for a new project\n→ Establish a branch of your existing foreign company in Portugal\n\n## Eligibility Requirements\n• Age 18 or older\n• Non-EU citizen\n• No criminal record\n• Own a company, submit a business plan, or establish a foreign branch in Portugal\n• Rent or own housing in Portugal\n• Prove sufficient funds for at least one year\n• Valid health insurance\n\n## Residency Duration\n4-month visa to enter and apply, then 2-year residence permit renewable for 3-year periods.\n\n## Citizenship Pathway\nAfter 5 years, Portuguese citizenship with a 191-country passport.\n\n## Processing Time\n2 to 3 months" },

  { id:"res-spain-golden", category:"residency", featured:false, date:"2025-06-01", readTime:9,
    titleAr:"الفيزا الذهبية الإسبانية — المرتبة الثالثة عالمياً وحرية أوروبا",
    titleEn:"Spain Golden Visa — World 3rd Strongest Passport and European Freedom",
    excerptAr:"500,000 يورو في عقارات إسبانيا. لا يشترط الإقامة. جواز إسباني يفتح أكثر من 190 دولة بعد 10 سنوات.",
    excerptEn:"500,000 euros in Spanish property. No residency required. Spanish passport opens 190 plus countries after 10 years.",
    contentAr:"## الفيزا الذهبية الإسبانية\nأطلقت الحكومة الإسبانية برنامج التأشيرة الذهبية عام 2013 لدعم الاقتصاد الوطني مما يتيح للمستثمرين الأجانب الحصول على الإقامة من خلال استثمار 500,000 يورو أو أكثر في العقارات مع إمكانية تأجيرها لتحقيق عائد مالي.\n\n## المزايا الرئيسية\n• حرية الإقامة والعمل والدراسة داخل إسبانيا\n• إمكانية الحصول على الجنسية الإسبانية بعد 10 سنوات من الإقامة القانونية\n• استثمار عقاري مربح مع عوائد إيجارية مجزية\n• حرية التنقل داخل منطقة شنغن دون تأشيرات إضافية\n• مرونة في الإقامة — لا يشترط الإقامة الدائمة داخل إسبانيا\n• جواز السفر الإسباني يحتل المرتبة الثالثة عالمياً (أكثر من 190 دولة بدون تأشيرة)\n\n## مدة الإقامة والمسار\n• تصريح إقامة لمدة عامين قابل للتجديد لفترة خمس سنوات إضافية\n• بعد 5 سنوات: إقامة دائمة بشرط الإقامة في إسبانيا 6 أشهر سنوياً\n• بعد 10 سنوات: الجنسية الإسبانية\n\n## أفراد الأسرة المشمولون\n• الزوج أو الزوجة\n• الأبناء دون سن 18 عامًا\n• الوالدان المعالون ماليًا من قِبَل المتقدم الرئيسي\n\n## خيارات الاستثمار\n→ عقار سكني أو تجاري: 500,000 يورو\n→ أوراق مالية إسبانية حكومية أو خاصة: مليون يورو\n→ ودائع بنكية في بنك إسباني: مليون يورو\n→ مشاريع عمل تخلق وظائف في إسبانيا: مليون يورو\n\n## شروط الأهلية\n• أن يكون عمر المستثمر 18 عامًا أو أكثر عند التقديم\n• سجل نظيف من أي سوابق جنائية في إسبانيا أو في أي دولة أقام بها خلال السنوات الخمس الماضية\n• عدم وجود حالات رفض تأشيرة أو منع دخول إلى دول الاتحاد الأوروبي\n• إثبات امتلاك موارد مالية كافية\n• تأمين صحي شامل لكل أفراد الأسرة\n\n## مدة المعالجة\nمن 2 إلى 3 أشهر",
    contentEn:"## Spain Golden Visa\nSpain launched its Golden Visa program in 2013, allowing foreign investors to obtain residency through real estate investment of 500,000 euros or more with the option to rent it for income.\n\n## Key Benefits\n• Freedom to live, work and study in Spain\n• Spanish citizenship after 10 years of legal residency\n• Profitable real estate with solid rental yields\n• Schengen zone travel freedom\n• No mandatory residency in Spain\n• Spanish passport ranked 3rd globally, 190 plus countries\n\n## Residency and Pathway\n• 2-year permit, renewable for 5 more years\n• After 5 years: permanent residency (requires 6 months per year in Spain)\n• After 10 years: Spanish citizenship\n\n## Family Coverage\n• Spouse\n• Children under 18\n• Financially dependent parents\n\n## Investment Options\n→ Residential or commercial property: 500,000 euros\n→ Spanish government or private securities: 1 million euros\n→ Bank deposits in Spanish bank: 1 million euros\n→ Business projects creating jobs in Spain: 1 million euros\n\n## Eligibility\n• Age 18 or older\n• Clean criminal record in Spain and countries of residence in past 5 years\n• No previous EU visa rejection\n• Proof of sufficient financial resources\n• Comprehensive health insurance\n\n## Processing Time\n2 to 3 months" },

  { id:"res-spain-nomad", category:"residency", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"تأشيرة نوماد إسبانيا الرقمية — للعمل عن بُعد في أوروبا",
    titleEn:"Spain Digital Nomad Visa — Work Remotely from Europe",
    excerptAr:"أُطلقت 2023. ضريبة ثابتة 24% (Beckham Law). دخل 2,520 يورو/شهر يكفي. مسار للجنسية بعد 10 سنوات.",
    excerptEn:"Launched 2023. Flat 24% tax Beckham Law. 2,520 euros per month income sufficient. Path to Spanish citizenship after 10 years.",
    contentAr:"## تأشيرة نوماد إسبانيا الرقمية\nأطلقت إسبانيا عام 2023 برنامج تأشيرة الرحالة الرقميين الذي يتيح للموظفين عن بُعد وأصحاب الأعمال الرقمية من خارج الاتحاد الأوروبي الإقامة القانونية في إسبانيا أثناء العمل لصالح شركات أو عملاء خارجها.\n\n## المزايا الرئيسية\n• حرية الإقامة والعمل عن بُعد من إسبانيا\n• نظام Beckham Law الضريبي — ضريبة ثابتة 24% على الدخل (بدلاً من حتى 47%)\n• حرية التنقل داخل منطقة شنغن\n• جودة حياة عالية ومستوى معيشي ممتاز\n• مسار للإقامة الدائمة بعد 5 سنوات\n• مسار للجنسية الإسبانية بعد 10 سنوات\n\n## مدة الإقامة\n• سنة واحدة كفيزا أولية من الخارج أو 3 سنوات كإقامة مباشرة داخل إسبانيا\n• قابلة للتجديد حتى 5 سنوات إجمالاً\n\n## أفراد العائلة المشمولون\n• الزوج أو الزوجة\n• الأبناء المعالون (دون 18 أو حتى 25 إذا كانوا طلاباً)\n• الوالدان المعالون ماليًا\n\n## شروط الأهلية\n• عمر 18 عامًا أو أكثر\n• سجل جنائي نظيف خلال آخر 5 سنوات\n• إثبات العمل عن بُعد لصالح شركة خارج إسبانيا أو نشاط حر رقمي قائم\n• دخل شهري لا يقل عن 2,520 يورو للفرد\n• +945 يورو إضافية للزوج/الزوجة و+315 يورو إضافية لكل طفل\n• عقد عمل أو إثبات نشاط مهني مستمر لأكثر من 3 أشهر\n• تأمين صحي شامل من شركة معتمدة في إسبانيا\n\n## مدة المعالجة\nمن 1 إلى 3 أشهر",
    contentEn:"## Spain Digital Nomad Visa\nSpain launched its Digital Nomad Visa in 2023, allowing remote workers and digital entrepreneurs from outside the EU to legally reside in Spain while working for companies or clients abroad.\n\n## Key Benefits\n• Freedom to live and work remotely from Spain\n• Beckham Law flat 24% income tax instead of up to 47%\n• Schengen zone travel freedom\n• High quality of life and excellent living standards\n• Path to permanent residency after 5 years\n• Path to Spanish citizenship after 10 years\n\n## Residency Duration\n• 1-year visa from abroad or 3-year residence inside Spain\n• Renewable up to 5 years total\n\n## Family Coverage\n• Spouse\n• Dependent children under 18 or up to 25 if students\n• Financially dependent parents\n\n## Eligibility Requirements\n• Age 18 or older\n• Clean criminal record for past 5 years\n• Proof of remote work for a company outside Spain or established digital freelance activity\n• Monthly income of at least 2,520 euros per person\n• Plus 945 euros for spouse and 315 euros per child\n• Contract or proof of 3 plus months professional activity\n• Comprehensive health insurance from Spain-approved provider\n\n## Processing Time\n1 to 3 months" },

  { id:"res-greece-golden", category:"residency", featured:false, date:"2025-06-01", readTime:8,
    titleAr:"الفيزا الذهبية اليونانية — أقل تكلفة في أوروبا بأسرها",
    titleEn:"Greece Golden Visa — Lowest Investment Cost in All of Europe",
    excerptAr:"250,000 يورو فقط — أقل حد استثماري أوروبي. لا يشترط الإقامة. حرية الشنغن ومسار للجنسية بعد 7 سنوات.",
    excerptEn:"Just 250,000 euros — Europe's absolute lowest investment threshold. No residency required. Schengen freedom, citizenship after 7 years.",
    contentAr:"## الفيزا الذهبية اليونانية\nتقدّم اليونان أدنى حد استثماري في أوروبا بأسرها للحصول على الإقامة الأوروبية مما يجعلها وجهة مثالية للمستثمرين الباحثين عن مدخل ميسور التكلفة للاتحاد الأوروبي.\n\n## المزايا الرئيسية\n• أقل حد استثماري في جميع دول أوروبا\n• لا يُشترط الإقامة الفعلية في اليونان\n• حرية التنقل في 27 دولة الشنغن\n• مسار للجنسية اليونانية بعد 7 سنوات\n• استثمار عقاري في سوق نشط ومتنامٍ\n• الأسرة الكاملة مشمولة\n\n## التكاليف التفصيلية\n$ الاستثمار العقاري (الحد الأدنى): 250,000 يورو\n$ الضرائب والرسوم القانونية والمصاريف الإدارية: حوالي 6.4% من قيمة العقار أي ~16,000 يورو\n$ رسوم التأشيرة الذهبية: 2,000 يورو لكل متقدم رئيسي\n$ رسوم فحص خلفية العقار: 250 يورو + ضريبة القيمة المضافة بنسبة 24%\n$ اتفاقية عقد شراء العقار: 1,000 يورو\n$ رسوم تقديم الطلب السكني: 300 يورو + ضريبة القيمة المضافة 24% لكل متقدم\n\n## مدة الإقامة\n• إقامة لمدة 5 سنوات قابلة للتجديد\n• لا يُشترط قضاء أي وقت فعلي في اليونان\n\n## مسار الجنسية\nبعد 7 سنوات من الإقامة القانونية يمكن التقدم للجنسية اليونانية جواز الاتحاد الأوروبي.\n\n## مدة المعالجة\nمن 2 إلى 4 أشهر",
    contentEn:"## Greece Golden Visa\nGreece offers Europe's absolute lowest investment threshold for residency, making it the ideal affordable entry point into the European Union.\n\n## Key Benefits\n• Lowest investment minimum in all of Europe\n• No physical residency in Greece required\n• Freedom in all 27 Schengen countries\n• Path to Greek citizenship after 7 years\n• Real estate investment in an active growing market\n• Full family coverage\n\n## Detailed Costs\n$ Real estate investment minimum: 250,000 euros\n$ Taxes, legal fees and admin: about 6.4% of property value, approximately 16,000 euros\n$ Golden Visa fee: 2,000 euros per main applicant\n$ Property background check: 250 euros plus 24% VAT\n$ Purchase contract: 1,000 euros\n$ Residential application fee: 300 euros plus 24% VAT per applicant\n\n## Residency Duration\n• 5-year renewable residency permit\n• No actual time in Greece required\n\n## Citizenship Pathway\nAfter 7 years of legal residency, apply for Greek citizenship and an EU passport.\n\n## Processing Time\n2 to 4 months" },

  { id:"res-usa-eb5", category:"residency", featured:false, date:"2025-06-01", readTime:9,
    titleAr:"برنامج EB-5 — البطاقة الخضراء الأمريكية بالاستثمار",
    titleEn:"EB-5 Program — US Green Card via Investment",
    excerptAr:"استثمر 800,000 - 1,050,000 دولار في مشروع أمريكي ووفّر 10 وظائف للحصول على الإقامة الدائمة الأمريكية.",
    excerptEn:"Invest 800,000 to 1,050,000 dollars in a US project, create 10 jobs, and obtain permanent US residency.",
    contentAr:"## برنامج EB-5 للمستثمر المهاجر\nالولايات المتحدة وجهة مفضلة للمستثمرين الدوليين الراغبين في الحصول على الإقامة الدائمة. برنامج المستثمر المهاجر EB-5 أُنشئ بواسطة الكونغرس الأمريكي عام 1990.\n\n## المزايا الرئيسية\n• الطريق السريع للحصول على البطاقة الخضراء الأمريكية الدائمة\n• الحق الكامل بالعمل والاستثمار في أي قطاع بالولايات المتحدة\n• إمكانية التقديم للحصول على الجنسية الأمريكية بعد خمس سنوات من الإقامة القانونية\n• لا يتطلب خبرة عمل محددة أو مستوى تعليمي معين أو كفاءة لغوية\n\n## أفراد الأسرة المشمولون\n• الزوج أو الزوجة\n• الأطفال المعالون غير المتزوجين الذين تقل أعمارهم عن 21 عامًا\n\n## خيارات الاستثمار\n→ الاستثمار في منطقة مستهدفة للوظائف (TEA): 800,000 دولار في منطقة ريفية أو ذات بطالة مرتفعة\n→ الاستثمار في منطقة اعتيادية غير مستهدفة: 1,050,000 دولار\n\n## الشرط الجوهري\nيشترط على كل استثمار توفير عشرة وظائف دائمة بدوام كامل للعمال الأمريكيين المؤهلين\n\n## خطوات الحصول على البطاقة الخضراء\n→ الاستشارة الأولية: تقييم المؤهلات وتحديد أفضل مسار\n→ اختيار المشروع الاستثماري المناسب\n→ تقديم طلب I-526 إلى USCIS\n→ مقابلة السفارة أو القنصلية الأمريكية\n→ الحصول على البطاقة الخضراء الشرطية لمدة سنتين\n→ تقديم I-829 لرفع الشرطية وتثبيت الإقامة الدائمة\n\n## مدة المعالجة\nمن 24 إلى 36 شهراً",
    contentEn:"## EB-5 Immigrant Investor Program\nEstablished by Congress in 1990, the EB-5 program is a top path for international investors seeking permanent US residency.\n\n## Key Benefits\n• Fast track to a permanent US Green Card\n• Full right to work and invest in any US sector\n• Eligible for US citizenship after 5 years of legal residency\n• No specific work experience, education or language proficiency required\n\n## Family Coverage\n• Spouse\n• Unmarried dependent children under 21\n\n## Investment Options\n→ Targeted Employment Area TEA: 800,000 dollars in a rural or high-unemployment area project\n→ Non-targeted area: 1,050,000 dollars\n\n## Core Requirement\nEach investment must create 10 permanent full-time jobs for qualified US workers\n\n## Steps to Green Card\n→ Initial consultation and qualification assessment\n→ Select appropriate investment project\n→ File I-526 petition with USCIS\n→ Embassy or consulate interview\n→ Receive conditional Green Card for 2 years\n→ File I-829 to remove conditions and confirm permanent residency\n\n## Processing Time\n24 to 36 months" },

  { id:"res-canada-startup", category:"residency", featured:false, date:"2025-06-01", readTime:9,
    titleAr:"كندا — برنامج الشركات الناشئة للإقامة الدائمة والجنسية",
    titleEn:"Canada — Startup Visa Program for Permanent Residency and Citizenship",
    excerptAr:"أسّس شركتك المبتكرة في كندا واحصل على الإقامة الدائمة. جواز كندي لـ 146 دولة ورعاية صحية مجانية.",
    excerptEn:"Launch your innovative startup in Canada and get permanent residency. Canadian passport for 146 countries and free healthcare.",
    contentAr:"## برنامج الشركات الناشئة الكندي\nyُعد برنامج تأشيرة الشركات الناشئة في كندا فرصة فريدة لرواد الأعمال الدوليين الراغبين في تأسيس أعمال مبتكرة والمساهمة في الاقتصاد الكندي مع إمكانية الحصول على الإقامة الدائمة ومن ثم الجنسية الكندية.\n\n## مزايا الجنسية الكندية\n• جواز السفر الكندي من أقوى جوازات السفر عالمياً — يسمح بالسفر بدون تأشيرة إلى 146 دولة\n• الحق في العيش والعمل والدراسة في أي مكان داخل كندا بحرية تامة\n• إمكانية شمول الأسرة بالكامل: الزوج/الزوجة والأبناء غير المتزوجين التابعين تحت سن 21 عامًا\n• الاستفادة من نظام الرعاية الصحية والتعليم المجاني عالي الجودة\n• حماية قانونية كاملة ومزايا اجتماعية وإمكانية المشاركة في الانتخابات والحياة المدنية\n• جودة حياة عالية في بيئة آمنة ومستقرة\n\n## الشروط الأساسية\n• امتلاك مشروع مبتكر معتمد من حاضنة أعمال كندية معتمدة أو صندوق رأس مال مخاطر معتمد\n• مهارات كافية في الإنجليزية أو الفرنسية\n• توفر أموال كافية لدعم الأسرة عند الوصول إلى كندا\n\n## مسار الجنسية\n• الحصول على الإقامة الدائمة عند الموافقة على الطلب\n• الإقامة في كندا لمدة 3 سنوات خلال فترة 5 سنوات\n→ ثم التقديم للحصول على الجنسية الكندية\n\n## مدة المعالجة\nمن 12 إلى 31 شهراً",
    contentEn:"## Canada Startup Visa Program\nA unique opportunity for international entrepreneurs to establish innovative businesses in Canada, with a clear path to permanent residency and then Canadian citizenship. After 3 years of residency within 5 years, applicants can apply for Canadian citizenship.\n\n## Benefits of Canadian Citizenship\n• Canadian passport ranks among the world's most powerful, visa-free to 146 countries\n• Full right to live, work and study anywhere in Canada\n• Full family coverage including spouse and unmarried dependent children under 21\n• Access to free high-quality healthcare and education\n• Full legal protection, social benefits and participation in civic life\n• High quality of life in a safe stable environment\n\n## Core Requirements\n• Innovative project approved by a designated Canadian business incubator or venture capital fund\n• Sufficient English or French language skills\n• Adequate funds to support the family upon arrival\n\n## Citizenship Pathway\n• Obtain permanent residency upon approval\n• Reside in Canada for 3 years within a 5-year period\n→ Then apply for Canadian citizenship\n\n## Processing Time\n12 to 31 months" },

  { id:"visa-schengen", category:"visa", featured:false, date:"2025-01-10", readTime:8,
    titleAr:"دليل تأشيرة شنغن للمواطنين العرب — كل ما تحتاج معرفته",
    titleEn:"Schengen Visa Guide for Arab Citizens — Everything You Need",
    excerptAr:"تأشيرة واحدة لـ 27 دولة أوروبية. الوثائق المطلوبة، نصائح القبول، وأفضل الدول للتقديم.",
    excerptEn:"One visa for 27 European countries. Required documents, approval tips, and best countries to apply.",
    contentAr:"## ما هي تأشيرة شنغن؟\nتأشيرة شنغن تتيح حامليها السفر بحرية تامة بين 27 دولة أوروبية تشكّل منطقة شنغن بدون الحاجة لتأشيرات منفصلة عند العبور أو الدخول لكل دولة.\n\n## المستندات المطلوبة للتقديم\n• جواز سفر ساري لمدة لا تقل عن 6 أشهر بعد تاريخ العودة المخطط\n• حجز طيران مؤكد ذهاباً وإياباً\n• حجز فندق مؤكد لجميع ليالي الإقامة\n• تأمين سفر يغطي تكاليف طبية لا تقل عن 30,000 يورو\n• كشف حساب بنكي للأشهر الثلاثة أو الستة الأخيرة\n• خطاب من جهة العمل أو إثبات نشاط تجاري\n• صور شخصية حديثة بالمواصفات المطلوبة\n• استمارة طلب التأشيرة مكتملة وموقّعة\n\n## نصائح لزيادة فرص القبول\n→ قدّم عبر السفارة أو القنصلية لدولة الوجهة الرئيسية\n→ إن كنت تزور دولاً متعددة قدّم عبر الدولة التي ستقضي فيها أكثر الوقت\n→ احرص على إظهار ارتباطات قوية ببلدك من عمل وأسرة وعقار\n→ لا تحجز تذاكر طيران باهظة قبل الحصول على الموافقة\n→ حافظ على رصيد بنكي لا يقل عن 500 يورو لكل أسبوع من الرحلة",
    contentEn:"## What is the Schengen Visa?\nThe Schengen visa allows holders to travel freely between 27 European countries in the Schengen Area without needing separate visas for each country.\n\n## Required Documents\n• Valid passport for at least 6 months after planned return date\n• Confirmed round-trip flight booking\n• Confirmed hotel reservation for all nights\n• Travel insurance covering medical costs of at least 30,000 euros\n• Bank statement for the last 3 or 6 months\n• Letter from employer or proof of business activity\n• Recent passport photos meeting specifications\n• Completed and signed visa application form\n\n## Tips to Increase Approval Chances\n→ Apply through the embassy of your main destination\n→ If visiting multiple countries apply where you will spend the most time\n→ Show strong ties to your home country such as job, family and property\n→ Do not book expensive flights before getting approval\n→ Maintain bank balance of at least 500 euros per week of the trip" },

  { id:"company-uae", category:"company", featured:false, date:"2025-01-14", readTime:9,
    titleAr:"تأسيس شركة في الإمارات — الدليل الكامل خطوة بخطوة",
    titleEn:"Setting Up a Company in UAE — Complete Step-by-Step Guide",
    excerptAr:"المناطق الحرة أم البر الرئيسي؟ أنواع الشركات، التراخيص، والتكاليف التفصيلية في دبي والإمارات.",
    excerptEn:"Free Zone vs Mainland? Company types, licenses, and detailed costs in Dubai and the UAE.",
    contentAr:"## لماذا تأسيس شركتك في الإمارات؟\nالإمارات من أفضل بيئات الأعمال عالمياً. لا ضريبة على الدخل الشخصي وضريبة الشركات لا تتجاوز 9% وبنية تحتية عالمية المستوى وموقع استراتيجي يربط الشرق بالغرب.\n\n## أنواع الشركات في الإمارات\n→ شركة البر الرئيسي (Mainland): تعمل في جميع أنحاء الإمارات وتتعامل مع الجهات الحكومية مباشرة\n→ المنطقة الحرة (Free Zone): ملكية أجنبية 100% وإعفاءات ضريبية خاصة ومناسبة للتجارة الدولية\n→ الشركة الخارجية (Offshore): للأعمال الدولية فقط لا يمكنها ممارسة نشاط داخل الإمارات مباشرة\n\n## التكاليف التقريبية\n$ منطقة حرة صغيرة (نشاط واحد): 15,000 - 30,000 درهم\n$ منطقة حرة (متعددة الأنشطة): 25,000 - 50,000 درهم\n$ بر رئيسي (نشاط تجاري عادي): 20,000 - 50,000 درهم\n$ بر رئيسي (أنشطة مهنية): 15,000 - 35,000 درهم\n\n## المراحل الرئيسية للتأسيس\n→ اختيار نوع الشركة والنشاط التجاري\n→ تسجيل الاسم التجاري والحصول على الموافقة\n→ تقديم المستندات وسداد الرسوم\n→ الحصول على الترخيص التجاري\n→ فتح حساب بنكي تجاري\n→ استخراج الإقامات للمؤسسين والموظفين\n\n## مزايا الإمارات للأعمال\n• لا ضريبة على الدخل الشخصي\n• ضريبة الشركات 9% فقط على الأرباح فوق 375,000 درهم\n• بيئة عمل دولية ومتعددة الثقافات\n• حماية قانونية قوية للملكية الفكرية\n• سهولة تحويل الأرباح خارج الدولة بدون قيود",
    contentEn:"## Why Set Up Your Company in the UAE?\nThe UAE is among the world's best business environments. No personal income tax, corporate tax max 9%, world-class infrastructure, and strategic location connecting East and West.\n\n## Company Types in the UAE\n→ Mainland Company: operates across UAE and deals directly with government entities\n→ Free Zone: 100% foreign ownership and special tax exemptions, ideal for international trade\n→ Offshore Company: for international business only, cannot operate directly inside the UAE\n\n## Approximate Costs\n$ Small free zone single activity: AED 15,000 to 30,000\n$ Free zone multi-activity: AED 25,000 to 50,000\n$ Mainland regular commercial: AED 20,000 to 50,000\n$ Mainland professional activities: AED 15,000 to 35,000\n\n## Main Setup Phases\n→ Choose company type and business activity\n→ Register trade name and obtain approval\n→ Submit documents and pay fees\n→ Obtain trade license\n→ Open a corporate bank account\n→ Issue residency visas for founders and staff\n\n## UAE Business Advantages\n• No personal income tax\n• Corporate tax only 9% on profits above AED 375,000\n• International multicultural business environment\n• Strong intellectual property protection\n• Easy profit repatriation with no restrictions" },

  { id:"travel-turkey", category:"travel", featured:false, date:"2025-01-11", readTime:8,
    titleAr:"السياحة في تركيا — الدليل الشامل 2025",
    titleEn:"Tourism in Turkey — Complete Guide 2025",
    excerptAr:"أفضل المدن والمعالم في تركيا وأفضل أوقات الزيارة والتكاليف ومتطلبات الدخول.",
    excerptEn:"Best cities and attractions in Turkey with timing tips, costs and entry requirements.",
    contentAr:"## السياحة في تركيا\nوجهة سياحية عالمية استثنائية تجمع بين التاريخ العريق والطبيعة الخلابة والحداثة المتطورة. تُعد تركيا واحدة من أكثر الوجهات السياحية زيارةً في العالم.\n\n## أبرز الوجهات السياحية\n• إسطنبول: مدينة القارتين — آيا صوفيا والبازار الكبير وقصر توبقابي والبوسفور\n• كابادوكيا: رحلات البالون الساحرة والمدن الجوفية التاريخية والكنائس الصخرية\n• أنطاليا: شواطئ المتوسط الخلابة وآثار سيدة وبرج جة\n• طرابزون: الطبيعة الخضراء الغنية ودير صومعة وبحيرة أوزنغول\n• بورصة: الجبال الثلجية والحمامات الحرارية والسوق التاريخية\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): طقس معتدل رائع وازدهار الطبيعة\n→ الخريف (سبتمبر-نوفمبر): هادئ وجميل وأسعار معتدلة\n→ الصيف (يونيو-أغسطس): موسم الشواطئ وحار في الداخل\n→ الشتاء (ديسمبر-فبراير): رائع في كابادوكيا وبارد في أغلب المناطق\n\n## متطلبات الدخول لتركيا\n• معظم الجنسيات العربية تحتاج تأشيرة مسبقة أو e-Visa\n• التأشيرة الإلكترونية e-Visa متاحة عبر الإنترنت لكثير من الجنسيات العربية\n• جواز سفر ساري لأكثر من 6 أشهر من تاريخ الدخول\n\n## تكاليف الرحلة التقريبية\n$ تأشيرة e-Visa: 50-100 دولار حسب الجنسية\n$ فندق في إسطنبول متوسط: 80-150 دولار للليلة\n$ وجبة في مطعم متوسط: 10-20 دولار",
    contentEn:"## Tourism in Turkey\nAn exceptional world-class destination combining rich history, stunning nature and modern development. Turkey ranks among the world's most visited tourist destinations.\n\n## Top Tourist Destinations\n• Istanbul: city of two continents with Hagia Sophia, Grand Bazaar, Topkapi Palace and Bosphorus\n• Cappadocia: magical balloon rides, ancient underground cities and rock-carved churches\n• Antalya: stunning Mediterranean beaches, Side and Perge ruins\n• Trabzon: lush green nature, Sumela Monastery and Uzungol lake\n• Bursa: snowy mountains, thermal baths and historic bazaar\n\n## Best Times to Visit\n→ Spring March to May: excellent mild weather and nature in bloom\n→ Autumn September to November: peaceful, beautiful and moderate prices\n→ Summer June to August: beach season, hot inland\n→ Winter December to February: magical in Cappadocia, cold in most areas\n\n## Turkey Entry Requirements\n• Most Arab nationalities require a prior visa or e-Visa\n• e-Visa available online for many Arab nationalities\n• Passport valid for more than 6 months from entry date\n\n## Approximate Trip Costs\n$ e-Visa: 50 to 100 dollars depending on nationality\n$ Hotel in Istanbul mid-range: 80 to 150 dollars per night\n$ Meal at mid-range restaurant: 10 to 20 dollars" },

  // ── Company Formation Articles ──────────────────────────────
  { id:"company-dubai-trader", category:"company", featured:true, date:"2026-06-01", readTime:8,
    titleAr:"رخصة تاجر دبي — الدليل الكامل 2026",
    titleEn:"Dubai Trader License — Complete Guide 2026",
    excerptAr:"احصل على رخصة تجارية دبي مع حساب بنكي خلال 3-5 أيام. الخيار الأسرع والأوفر لبدء نشاطك التجاري في الإمارات.",
    excerptEn:"Get a Dubai trade license with a bank account in 3-5 days. The fastest and most cost-effective way to start your business in the UAE.",
    contentAr:"## رخصة تاجر دبي — نظرة عامة\nرخصة تاجر دبي هي من أسرع وأبسط طرق الحصول على ترخيص تجاري في الإمارات العربية المتحدة. تتيح لك ممارسة نشاطك التجاري بشكل قانوني كامل مع فتح حساب بنكي تجاري.\n\n## ما تشمله الخدمة\n• رخصة تجارية دبي سارية المفعول\n• فتح حساب بنكي تجاري\n• توجيه كامل لاختيار النشاط التجاري المناسب\n• تسجيل رقم ضريبي (VAT) إذا لزم الأمر\n\n## المزايا الرئيسية\n• من أسرع التراخيص في المنطقة — 3 إلى 5 أيام عمل\n• لا يشترط وجود مكتب فعلي في بعض الأنشطة\n• تكلفة منخفضة مقارنة بأنواع التراخيص الأخرى\n• مناسب لممارسة التجارة والاستيراد والتصدير\n• بيئة قانونية ومالية مستقرة وشفافة\n\n## الأنشطة التجارية المدعومة\n→ تجارة عامة واستيراد وتصدير\n→ تجارة التجزئة والجملة\n→ الوكالات التجارية\n→ التجارة الإلكترونية\n→ وكالات التسويق والإعلان\n\n## متطلبات التقديم\n• نسخة من جواز السفر\n• صورة شخصية\n• عنوان المقر (يمكننا توفيره)\n• اختيار اسم الشركة\n\n## التكاليف التقريبية\n$ الرخصة التجارية: تبدأ من 8,000 - 15,000 درهم سنوياً\n$ رسوم الخدمات الإدارية والتأسيس: حسب الخدمات المطلوبة\n\n## المدة الزمنية\nمن 3 إلى 5 أيام عمل للحصول على الرخصة وفتح الحساب البنكي",
    contentEn:"## Dubai Trader License — Overview\nThe Dubai Trader License is one of the fastest and simplest ways to obtain a trade license in the UAE. It allows you to conduct business legally with a commercial bank account.\n\n## What's Included\n• Valid Dubai trade license\n• Commercial bank account opening\n• Full guidance on choosing the right business activity\n• VAT registration if required\n\n## Key Benefits\n• Among the fastest licenses in the region — 3 to 5 business days\n• No physical office required for some activities\n• Lower cost compared to other license types\n• Suitable for trade, import and export\n• Stable and transparent legal and financial environment\n\n## Supported Business Activities\n→ General trade, import and export\n→ Retail and wholesale trade\n→ Commercial agencies\n→ E-commerce\n→ Marketing and advertising agencies\n\n## Application Requirements\n• Passport copy\n• Personal photo\n• Registered address (we can provide)\n• Company name selection\n\n## Approximate Costs\n$ Trade license: starting from AED 8,000 - 15,000 per year\n$ Administrative and setup fees: based on required services\n\n## Timeline\n3 to 5 business days for license and bank account" },

  { id:"company-uae-freelance", category:"company", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"رخصة المهن الحرة في الإمارات — رخصة + إقامة + تأمين صحي",
    titleEn:"UAE Freelance License — License + Residency + Health Insurance",
    excerptAr:"مثالية للمستقلين والمبدعين. احصل على رخصة عمل حر مع إقامة إماراتية وتأمين صحي في حزمة واحدة.",
    excerptEn:"Perfect for freelancers and creatives. Get a freelance license with UAE residency and health insurance in one package.",
    contentAr:"## رخصة المهن الحرة في الإمارات\nتُعد رخصة المهن الحرة في الإمارات الحل الأمثل للمستقلين والمحترفين الذين يرغبون في العمل بشكل قانوني في الإمارات مع الاستمتاع بمزايا الإقامة الكاملة.\n\n## ما تشمله الخدمة\n• رخصة عمل حر سارية المفعول\n• تصريح إقامة إماراتية (فيزا)\n• تأمين صحي معتمد\n• توجيه كامل طوال العملية\n\n## المزايا الرئيسية\n• العمل القانوني كمستقل أو موظف مستقل\n• إقامة رسمية في الإمارات لمدة سنتين قابلة للتجديد\n• تأمين صحي مشمول في الباقة\n• إمكانية فتح حساب بنكي شخصي وتجاري\n• الحرية الكاملة في العمل مع عملاء محليين ودوليين\n\n## الأنشطة المدعومة\n→ تصميم جرافيك وهوية بصرية\n→ تطوير برمجيات ومواقع إلكترونية\n→ كتابة محتوى وترجمة\n→ استشارات تسويقية وأعمال\n→ تصوير فوتوغرافي وفيديو\n→ تعليم وتدريب أونلاين\n\n## متطلبات التقديم\n• نسخة من جواز السفر\n• صورة شخصية\n• شهادات أكاديمية أو مهنية (إن وجدت)\n• سيرة ذاتية\n\n## التكاليف التقريبية\n$ الحزمة الكاملة: تبدأ من 7,500 - 12,000 درهم سنوياً\n\n## المدة الزمنية\nمن 5 إلى 10 أيام عمل",
    contentEn:"## UAE Freelance License\nThe UAE Freelance License is the ideal solution for independent professionals who want to work legally in the UAE with full residency benefits.\n\n## What's Included\n• Valid freelance license\n• UAE residency permit (visa)\n• Approved health insurance\n• Full guidance throughout the process\n\n## Key Benefits\n• Legal work as a freelancer or independent contractor\n• Official UAE residency for 2 years renewable\n• Health insurance included in the package\n• Ability to open personal and business bank accounts\n• Full freedom to work with local and international clients\n\n## Supported Activities\n→ Graphic design and visual identity\n→ Software and web development\n→ Content writing and translation\n→ Marketing and business consulting\n→ Photography and videography\n→ Online teaching and training\n\n## Application Requirements\n• Passport copy\n• Personal photo\n• Academic or professional certificates if available\n• CV/Resume\n\n## Approximate Costs\n$ Full package: starting from AED 7,500 - 12,000 per year\n\n## Timeline\n5 to 10 business days" },

  { id:"company-uae-freezone", category:"company", featured:true, date:"2026-06-01", readTime:9,
    titleAr:"تأسيس شركة في المناطق الحرة بالإمارات — الدليل الكامل 2026",
    titleEn:"UAE Free Zone Company — Complete Guide 2026",
    excerptAr:"ملكية أجنبية 100%، إعفاء ضريبي كامل، وأكثر من 40 منطقة حرة للاختيار. الحل الأمثل للشركات الدولية.",
    excerptEn:"100% foreign ownership, full tax exemption, and over 40 free zones to choose from. The ideal solution for international companies.",
    contentAr:"## المناطق الحرة في الإمارات — نظرة عامة\nتضم الإمارات أكثر من 40 منطقة حرة متخصصة توفر بيئة أعمال استثنائية للشركات الأجنبية. تتميز هذه المناطق بإعفاءات ضريبية شاملة وملكية أجنبية كاملة.\n\n## أبرز المناطق الحرة\n→ مركز دبي المالي العالمي (DIFC): للخدمات المالية والاستشارات\n→ مجمع دبي للأعمال (DMCC): تجارة السلع والذهب والمجوهرات\n→ مدينة دبي للإنترنت (DIC): تكنولوجيا المعلومات والاتصالات\n→ مدينة دبي للإعلام (DMC): الإعلام والترفيه والاتصالات\n→ منطقة مصدر الحرة (أبوظبي): الطاقة المتجددة والتكنولوجيا\n→ المنطقة الحرة بجبل علي (JAFZA): التصنيع والتوزيع\n\n## المزايا الرئيسية\n• ملكية أجنبية 100% بدون شريك محلي\n• إعفاء ضريبي كامل على الأرباح لفترات طويلة\n• لا ضريبة على الدخل الشخصي\n• حرية تحويل الأرباح والرأس المال للخارج بالكامل\n• إجراءات تأسيس سريعة وبيروقراطية منخفضة\n• بنية تحتية متطورة وعالمية المستوى\n\n## ما تشمله خدمتنا\n• دراسة واختيار المنطقة الحرة الأنسب لنشاطك\n• تسجيل الشركة وإصدار الرخصة\n• فتح حساب بنكي تجاري\n• تأشيرات الإقامة للمؤسسين والموظفين\n• خدمات المحاسبة والامتثال\n\n## التكاليف التقريبية\n$ الحزمة الأساسية: تبدأ من 15,000 - 25,000 درهم\n$ تشمل: الرخصة + الشهادة + بطاقة عمل + تأشيرة إقامة\n\n## المدة الزمنية\nمن 3 إلى 7 أيام عمل",
    contentEn:"## UAE Free Zones — Overview\nThe UAE has over 40 specialized free zones offering exceptional business environments for foreign companies, with comprehensive tax exemptions and full foreign ownership.\n\n## Top Free Zones\n→ Dubai International Financial Centre (DIFC): financial services and consulting\n→ Dubai Multi Commodities Centre (DMCC): commodities, gold and jewellery\n→ Dubai Internet City (DIC): IT and communications\n→ Dubai Media City (DMC): media, entertainment and communications\n→ Masdar Free Zone (Abu Dhabi): renewable energy and technology\n→ Jebel Ali Free Zone (JAFZA): manufacturing and distribution\n\n## Key Benefits\n• 100% foreign ownership with no local partner required\n• Full tax exemption on profits for extended periods\n• No personal income tax\n• Complete freedom to repatriate profits and capital\n• Fast setup with minimal bureaucracy\n• World-class advanced infrastructure\n\n## What Our Service Includes\n• Study and selection of the best free zone for your activity\n• Company registration and license issuance\n• Commercial bank account opening\n• Residency visas for founders and employees\n• Accounting and compliance services\n\n## Approximate Costs\n$ Basic package: starting from AED 15,000 - 25,000\n$ Includes: license + certificate + business card + residency visa\n\n## Timeline\n3 to 7 business days" },

  { id:"company-uae-mainland", category:"company", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"تأسيس شركة في البر الرئيسي (Mainland) بالإمارات 2026",
    titleEn:"UAE Mainland Company Formation 2026",
    excerptAr:"الخيار الأفضل للشركات التي تريد العمل مع الجهات الحكومية والعقود الكبرى. ملكية أجنبية 100% في معظم القطاعات.",
    excerptEn:"Best option for companies wanting to work with government entities and large contracts. 100% foreign ownership in most sectors.",
    contentAr:"## شركات البر الرئيسي في الإمارات\nتُتيح شركات البر الرئيسي (Mainland) العمل في أي مكان داخل الإمارات وخارجها دون قيود جغرافية، مع إمكانية التعاقد مع الجهات الحكومية.\n\n## التغييرات التشريعية 2021-2023\nمنذ إصلاحات قانون الشركات الإماراتي، أصبح بإمكان الأجانب امتلاك 100% من الشركات في معظم القطاعات دون الحاجة لشريك محلي، باستثناء بعض القطاعات الاستراتيجية.\n\n## المزايا الرئيسية\n• العمل في كامل أراضي الإمارات دون قيود\n• إمكانية التعاقد مع الحكومة والشركات الكبرى\n• ملكية أجنبية 100% في معظم القطاعات\n• لا قيود على عدد التأشيرات (مرتبطة بمساحة المكتب)\n• سهولة التوسع وفتح فروع\n• المصداقية العالية في السوق المحلية\n\n## أنواع الشركات في البر الرئيسي\n→ شركة ذات مسؤولية محدودة (LLC) — الأكثر شيوعاً\n→ مؤسسة فردية\n→ شركة مساهمة عامة (PJSC)\n→ شركة مساهمة خاصة (PJSC)\n→ فرع شركة أجنبية\n\n## ما تشمله خدمتنا\n• دراسة وتحديد النشاط التجاري المناسب\n• اختيار اسم الشركة والحصول على الموافقة\n• التسجيل في الجهات الحكومية المختصة\n• فتح حساب بنكي تجاري\n• تأشيرات الإقامة\n• خدمات الامتثال والمحاسبة\n\n## التكاليف التقريبية\n$ رسوم التأسيس والرخصة: تبدأ من 15,000 - 30,000 درهم\n\n## المدة الزمنية\nمن 7 إلى 15 يوم عمل",
    contentEn:"## UAE Mainland Companies\nMainland companies allow unrestricted operations anywhere in the UAE and abroad, with the ability to contract with government entities.\n\n## 2021-2023 Legislative Changes\nSince UAE company law reforms, foreigners can own 100% of companies in most sectors without a local partner, except for some strategic sectors.\n\n## Key Benefits\n• Operate across the entire UAE without restrictions\n• Can contract with government and major companies\n• 100% foreign ownership in most sectors\n• No visa quota limits (tied to office space)\n• Easy expansion and branch opening\n• High credibility in the local market\n\n## Types of Mainland Companies\n→ Limited Liability Company (LLC) — most common\n→ Sole Establishment\n→ Public Joint Stock Company (PJSC)\n→ Private Joint Stock Company\n→ Foreign Company Branch\n\n## What Our Service Includes\n• Study and determine the appropriate business activity\n• Company name selection and approval\n• Registration with relevant government authorities\n• Commercial bank account opening\n• Residency visas\n• Compliance and accounting services\n\n## Approximate Costs\n$ Formation and license fees: starting from AED 15,000 - 30,000\n\n## Timeline\n7 to 15 business days" },

  { id:"company-qatar", category:"company", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"تأسيس شركة في قطر — الدليل الشامل 2026",
    titleEn:"Company Formation in Qatar — Complete Guide 2026",
    excerptAr:"سوق خليجي واعد بعد نجاح كأس العالم. ملكية أجنبية 100% في قطاعات متعددة مع بنية تحتية عالمية.",
    excerptEn:"Promising Gulf market after World Cup success. 100% foreign ownership in multiple sectors with world-class infrastructure.",
    contentAr:"## قطر — بيئة الأعمال\nتحتل قطر مكانة متميزة كوجهة استثمارية عالمية بعد نجاح استضافة كأس العالم 2022. تتمتع بأعلى دخل فردي في العالم وبنية تحتية استثنائية.\n\n## أبرز القطاعات الاستثمارية\n→ التكنولوجيا والابتكار الرقمي\n→ الخدمات المالية والاستشارات\n→ البناء والعقارات\n→ الرعاية الصحية والتعليم\n→ السياحة والضيافة\n→ الطاقة والبيئة\n\n## المزايا الرئيسية\n• ملكية أجنبية 100% في معظم القطاعات (بموجب القانون رقم 1 لعام 2019)\n• لا ضريبة على الدخل الشخصي\n• ضريبة الشركات 10% فقط (من أدنى المعدلات خليجياً)\n• استقرار سياسي واقتصادي مرتفع\n• بنية تحتية متطورة ومرافق عالمية المستوى\n• سوق مرتبط بالعقود الحكومية الكبرى\n\n## أنواع الشركات في قطر\n→ شركة ذات مسؤولية محدودة (LLC)\n→ شركة مساهمة\n→ مكتب تمثيلي\n→ فرع شركة أجنبية\n→ الشركة في منطقة قطر للعلوم والتكنولوجيا (QSTP)\n\n## متطلبات التأسيس\n• نسخة من جواز السفر\n• عنوان مكتب مسجل في قطر\n• رأس مال مسجل (يختلف حسب النشاط)\n• شهادات مهنية (لبعض الأنشطة)\n\n## التكاليف التقريبية\n$ رسوم التأسيس والتسجيل: تبدأ من 5,000 - 15,000 ريال قطري\n\n## المدة الزمنية\nمن 2 إلى 4 أسابيع",
    contentEn:"## Qatar — Business Environment\nQatar holds a prominent position as a global investment destination following the successful hosting of FIFA World Cup 2022, with the world's highest per-capita income and exceptional infrastructure.\n\n## Key Investment Sectors\n→ Technology and digital innovation\n→ Financial services and consulting\n→ Construction and real estate\n→ Healthcare and education\n→ Tourism and hospitality\n→ Energy and environment\n\n## Key Benefits\n• 100% foreign ownership in most sectors (under Law No. 1 of 2019)\n• No personal income tax\n• Corporate tax only 10% (among the lowest in the Gulf)\n• High political and economic stability\n• Advanced infrastructure and world-class facilities\n• Market linked to major government contracts\n\n## Types of Companies in Qatar\n→ Limited Liability Company (LLC)\n→ Joint Stock Company\n→ Representative Office\n→ Foreign Company Branch\n→ Qatar Science and Technology Park (QSTP) company\n\n## Formation Requirements\n• Passport copy\n• Registered office address in Qatar\n• Registered capital (varies by activity)\n• Professional certificates for some activities\n\n## Approximate Costs\n$ Formation and registration fees: starting from QAR 5,000 - 15,000\n\n## Timeline\n2 to 4 weeks" },

  { id:"company-saudi", category:"company", featured:true, date:"2026-06-01", readTime:9,
    titleAr:"تأسيس شركة في المملكة العربية السعودية — ملكية أجنبية 100% (2026)",
    titleEn:"Company Formation in Saudi Arabia — 100% Foreign Ownership (2026)",
    excerptAr:"أكبر اقتصاد عربي وأسرعه نمواً. ملكية أجنبية 100% في ظل رؤية 2030 وحوافز استثمارية غير مسبوقة.",
    excerptEn:"Largest and fastest-growing Arab economy. 100% foreign ownership under Vision 2030 with unprecedented investment incentives.",
    contentAr:"## المملكة العربية السعودية — رؤية 2030 والاستثمار الأجنبي\nتشهد المملكة العربية السعودية تحولاً اقتصادياً غير مسبوق في إطار رؤية 2030، مما يجعلها وجهة استثمارية جذابة على المستوى الدولي.\n\n## التغييرات التشريعية الجديدة\n• ملكية أجنبية 100% في معظم القطاعات التجارية\n• تسهيل إجراءات التراخيص والتسجيل\n• إنشاء هيئة الاستثمار (SAGIA) المطورة\n• إعفاءات ضريبية للمشاريع الاستراتيجية\n• برامج دعم المستثمرين الأجانب\n\n## القطاعات الأكثر جذباً للاستثمار\n→ التكنولوجيا والاقتصاد الرقمي\n→ السياحة والترفيه (نمو استثنائي)\n→ الرعاية الصحية والصيدلة\n→ الطاقة المتجددة (استهداف 50% طاقة نظيفة)\n→ التصنيع والصناعات غير النفطية\n→ الخدمات المالية\n\n## أنواع الشركات\n→ شركة ذات مسؤولية محدودة (LLC) — الأشيع للأجانب\n→ شركة مساهمة\n→ مكتب تمثيلي إقليمي\n→ فرع شركة أجنبية\n→ شركة شراكة\n\n## ما تشمله خدمتنا\n• الحصول على ترخيص الاستثمار الأجنبي\n• تسجيل الشركة في وزارة التجارة\n• الحصول على السجل التجاري\n• فتح حساب بنكي تجاري\n• تأشيرات العمل والإقامة\n\n## التكاليف التقريبية\n$ رسوم الترخيص والتأسيس: تبدأ من 5,000 - 15,000 ريال سعودي\n\n## المدة الزمنية\nمن 2 إلى 6 أسابيع حسب القطاع",
    contentEn:"## Saudi Arabia — Vision 2030 and Foreign Investment\nSaudi Arabia is undergoing unprecedented economic transformation under Vision 2030, making it an attractive investment destination internationally.\n\n## New Legislative Changes\n• 100% foreign ownership in most commercial sectors\n• Simplified licensing and registration procedures\n• Enhanced Saudi Investment Authority (SAGIA)\n• Tax exemptions for strategic projects\n• Foreign investor support programs\n\n## Most Attractive Investment Sectors\n→ Technology and digital economy\n→ Tourism and entertainment (exceptional growth)\n→ Healthcare and pharmaceuticals\n→ Renewable energy (targeting 50% clean energy)\n→ Manufacturing and non-oil industries\n→ Financial services\n\n## Types of Companies\n→ Limited Liability Company (LLC) — most common for foreigners\n→ Joint Stock Company\n→ Regional Representative Office\n→ Foreign Company Branch\n→ Partnership Company\n\n## What Our Service Includes\n• Obtaining foreign investment license\n• Company registration with Ministry of Commerce\n• Commercial registration (CR)\n• Commercial bank account opening\n• Work and residency visas\n\n## Approximate Costs\n$ License and formation fees: starting from SAR 5,000 - 15,000\n\n## Timeline\n2 to 6 weeks depending on sector" },

  { id:"company-oman", category:"company", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأسيس شركة في سلطنة عُمان — بيئة الأعمال المستقرة 2026",
    titleEn:"Company Formation in Oman — Stable Business Environment 2026",
    excerptAr:"استقرار سياسي واقتصادي عالٍ. بيئة أعمال شفافة مع إصلاحات قانونية واسعة تجذب المستثمرين الأجانب.",
    excerptEn:"High political and economic stability. Transparent business environment with broad legal reforms attracting foreign investors.",
    contentAr:"## سلطنة عُمان — بيئة الأعمال\nتتمتع سلطنة عُمان باستقرار سياسي واقتصادي استثنائي مما يجعلها وجهة استثمارية آمنة وجذابة في منطقة الخليج العربي.\n\n## التطورات التشريعية الحديثة\n• قانون الاستثمار الأجنبي الجديد 2019 — يتيح الملكية الأجنبية 100% في معظم القطاعات\n• إنشاء نافذة استثمارية موحدة لتسهيل الإجراءات\n• حوافز ضريبية للمشاريع التي تتجاوز قيمتها 500,000 ريال عُماني\n• تخفيضات في الرسوم الحكومية لتشجيع الاستثمار\n\n## أبرز القطاعات الاستثمارية\n→ السياحة والضيافة (أولوية وطنية)\n→ اللوجستيات والموانئ\n→ التعدين والصناعات الاستخراجية\n→ الزراعة وصيد الأسماك\n→ التعليم والرعاية الصحية\n→ التكنولوجيا والابتكار\n\n## المزايا الرئيسية\n• استقرار سياسي واقتصادي مرتفع\n• بيئة قانونية شفافة وحامية لحقوق المستثمرين\n• موقع استراتيجي على بحر العرب وخليج عُمان\n• تكاليف تشغيل معقولة مقارنة بالإمارات والسعودية\n• علاقات تجارية ممتازة مع آسيا وأفريقيا\n\n## أنواع الشركات\n→ شركة ذات مسؤولية محدودة (LLC)\n→ شركة مساهمة مقفلة\n→ فرع شركة أجنبية\n→ مكتب تمثيلي\n\n## التكاليف التقريبية\n$ رسوم التأسيس والترخيص: تبدأ من 1,000 - 5,000 ريال عُماني\n\n## المدة الزمنية\nمن 2 إلى 4 أسابيع",
    contentEn:"## Sultanate of Oman — Business Environment\nOman enjoys exceptional political and economic stability, making it a safe and attractive investment destination in the Arabian Gulf region.\n\n## Recent Legislative Developments\n• New Foreign Investment Law 2019 — allows 100% foreign ownership in most sectors\n• Unified investment window established to streamline procedures\n• Tax incentives for projects exceeding OMR 500,000 in value\n• Reduction in government fees to encourage investment\n\n## Key Investment Sectors\n→ Tourism and hospitality (national priority)\n→ Logistics and ports\n→ Mining and extractive industries\n→ Agriculture and fisheries\n→ Education and healthcare\n→ Technology and innovation\n\n## Key Benefits\n• High political and economic stability\n• Transparent legal environment protecting investor rights\n• Strategic location on the Arabian Sea and Gulf of Oman\n• Reasonable operating costs compared to UAE and Saudi Arabia\n• Excellent trade relations with Asia and Africa\n\n## Types of Companies\n→ Limited Liability Company (LLC)\n→ Closed Joint Stock Company\n→ Foreign Company Branch\n→ Representative Office\n\n## Approximate Costs\n$ Formation and licensing fees: starting from OMR 1,000 - 5,000\n\n## Timeline\n2 to 4 weeks" },

  { id:"company-egypt", category:"company", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"تأسيس شركة في مصر مع إقامة المستثمر — الدليل الكامل 2026",
    titleEn:"Company Formation in Egypt with Investor Residency — Complete Guide 2026",
    excerptAr:"أكبر سوق عربي بأكثر من 100 مليون مستهلك. احصل على شركة وإقامة مستثمر في أسرع اقتصاد نامٍ في المنطقة.",
    excerptEn:"Largest Arab market with over 100 million consumers. Get a company and investor residency in the fastest growing economy in the region.",
    contentAr:"## مصر — فرصة الاستثمار\nتُعد مصر الوجهة الاستثمارية الأبرز في أفريقيا والشرق الأوسط بفضل سوقها الضخم الذي يضم أكثر من 100 مليون مستهلك.\n\n## المزايا الاستثمارية\n• أكبر سوق استهلاكي في العالم العربي\n• موقع استراتيجي يربط أفريقيا وآسيا وأوروبا\n• تكاليف عمالة تنافسية\n• قانون الاستثمار 72 لعام 2017 — يوفر ضمانات قوية للمستثمرين\n• حوافز ضريبية متعددة في المناطق الاستثمارية\n• إمكانية الحصول على إقامة المستثمر\n\n## إقامة المستثمر في مصر\nعند تأسيس شركة بحد أدنى من رأس المال، يمكنك الحصول على إقامة مستثمر في مصر صالحة لمدة 3-5 سنوات وقابلة للتجديد.\n\n## أنواع الشركات\n→ شركة ذات مسؤولية محدودة (LLC)\n→ شركة مساهمة مصرية\n→ فرع شركة أجنبية\n→ مكتب تمثيلي\n→ الشركة في المنطقة الاقتصادية الخاصة\n\n## القطاعات الواعدة\n→ التكنولوجيا وبرامج الحاسب\n→ السياحة والضيافة\n→ الزراعة والأغذية\n→ الرعاية الصحية والصيدلة\n→ التشييد والبناء\n→ الطاقة المتجددة\n\n## التكاليف التقريبية\n$ رسوم التأسيس: تبدأ من 5,000 - 20,000 جنيه مصري\n$ رأس المال المطلوب: يختلف حسب نوع الشركة\n\n## المدة الزمنية\nمن 2 إلى 4 أسابيع",
    contentEn:"## Egypt — Investment Opportunity\nEgypt is the premier investment destination in Africa and the Middle East thanks to its massive market of over 100 million consumers.\n\n## Investment Advantages\n• Largest consumer market in the Arab world\n• Strategic location connecting Africa, Asia and Europe\n• Competitive labor costs\n• Investment Law No. 72 of 2017 provides strong investor guarantees\n• Multiple tax incentives in investment zones\n• Ability to obtain investor residency\n\n## Investor Residency in Egypt\nWhen establishing a company with a minimum capital requirement, you can obtain investor residency in Egypt valid for 3-5 years and renewable.\n\n## Types of Companies\n→ Limited Liability Company (LLC)\n→ Egyptian Joint Stock Company\n→ Foreign Company Branch\n→ Representative Office\n→ Company in Special Economic Zone\n\n## Promising Sectors\n→ Technology and software\n→ Tourism and hospitality\n→ Agriculture and food\n→ Healthcare and pharmaceuticals\n→ Construction\n→ Renewable energy\n\n## Approximate Costs\n$ Formation fees: starting from EGP 5,000 - 20,000\n$ Required capital: varies by company type\n\n## Timeline\n2 to 4 weeks" },

  { id:"company-turkey", category:"company", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"تأسيس شركة في تركيا — جسر أوروبا وآسيا (2026)",
    titleEn:"Company Formation in Turkey — Bridge Between Europe and Asia (2026)",
    excerptAr:"اقتصاد G20 بتكاليف تشغيل منخفضة. تركيا جسر استراتيجي مع وصول لأسواق أوروبا وآسيا وأفريقيا.",
    excerptEn:"G20 economy with low operating costs. Turkey is a strategic bridge with access to European, Asian and African markets.",
    contentAr:"## تركيا — الاقتصاد الجسر\nتقع تركيا في موقع استراتيجي استثنائي يجمع بين قارتي أوروبا وآسيا، مما يجعلها مركزاً تجارياً حيوياً يربط أسواقاً بمئات الملايين من المستهلكين.\n\n## المزايا الاستثمارية\n• اقتصاد G20 — المرتبة 17 عالمياً\n• تكاليف تشغيل وعمالة تنافسية\n• إجراءات تأسيس الشركات سريعة وبسيطة\n• اتفاقيات تجارة حرة مع أكثر من 20 دولة\n• ملكية أجنبية 100% في معظم القطاعات\n• قاعدة صناعية متنوعة وقوية\n\n## أنواع الشركات\n→ شركة مساهمة (AŞ) — للشركات الكبرى\n→ شركة ذات مسؤولية محدودة (Ltd. Şti.) — الأكثر شيوعاً\n→ شركة شخص واحد ذات مسؤولية محدودة\n→ مؤسسة تجارية فردية\n→ فرع شركة أجنبية\n\n## القطاعات الواعدة\n→ النسيج والملبوسات (تركيا من أكبر المصدرين)\n→ التكنولوجيا والتطوير البرمجي\n→ السياحة والضيافة\n→ الزراعة والأغذية المصنعة\n→ الاستيراد والتصدير\n→ العقارات\n\n## ما تشمله خدمتنا\n• تسجيل الشركة في السجل التجاري\n• الحصول على الرقم الضريبي\n• فتح حساب بنكي تجاري\n• تأشيرات العمل والإقامة\n• الخدمات المحاسبية والقانونية\n\n## التكاليف التقريبية\n$ رأس المال الأدنى للشركة ذات المسؤولية المحدودة: 10,000 ليرة تركية\n$ رسوم التأسيس والخدمات: تبدأ من 1,500 - 3,000 دولار\n\n## المدة الزمنية\nمن 5 إلى 10 أيام عمل",
    contentEn:"## Turkey — The Bridge Economy\nTurkey occupies a uniquely strategic location bridging Europe and Asia, making it a vital commercial hub connecting markets of hundreds of millions of consumers.\n\n## Investment Advantages\n• G20 economy — 17th globally\n• Competitive operating and labor costs\n• Fast and simple company formation procedures\n• Free trade agreements with over 20 countries\n• 100% foreign ownership in most sectors\n• Diverse and strong industrial base\n\n## Types of Companies\n→ Joint Stock Company (AŞ) — for large corporations\n→ Limited Liability Company (Ltd. Şti.) — most common\n→ Single-Person LLC\n→ Sole Proprietorship\n→ Foreign Company Branch\n\n## Promising Sectors\n→ Textiles and clothing (Turkey among largest exporters)\n→ Technology and software development\n→ Tourism and hospitality\n→ Agriculture and processed foods\n→ Import and export\n→ Real estate\n\n## What Our Service Includes\n• Company registration in commercial registry\n• Tax number registration\n• Commercial bank account opening\n• Work and residency visas\n• Accounting and legal services\n\n## Approximate Costs\n$ Minimum capital for LLC: TRY 10,000\n$ Formation and service fees: starting from $1,500 - $3,000\n\n## Timeline\n5 to 10 business days" },

  { id:"company-indonesia", category:"company", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"تأسيس شركة PT PMA في إندونيسيا مع إقامة المستثمر (2026)",
    titleEn:"PT PMA Company Formation in Indonesia with Investor Residency (2026)",
    excerptAr:"أكبر اقتصاد في جنوب شرق آسيا. تأسيس شركة PT PMA مع إقامة مستثمر في أسرع اقتصاد نمواً في آسيا.",
    excerptEn:"Southeast Asia's largest economy. Form a PT PMA company with investor residency in Asia's fastest growing economy.",
    contentAr:"## إندونيسيا — العملاق الاقتصادي الآسيوي\nإندونيسيا هي أكبر اقتصاد في جنوب شرق آسيا وعضو في مجموعة G20، مع سوق استهلاكي يضم أكثر من 270 مليون شخص.\n\n## ما هي شركة PT PMA؟\nPT PMA (Perseroan Terbatas Penanaman Modal Asing) هي شركة استثمار أجنبي المعترف بها رسمياً في إندونيسيا. تتيح للأجانب تملك حصص في شركات إندونيسية بشكل قانوني.\n\n## إقامة المستثمر في إندونيسيا\nعند تأسيس شركة PT PMA، يمكنك الحصول على تصريح إقامة مستثمر (KITAS) صالح لمدة سنة إلى سنتين وقابل للتجديد.\n\n## المزايا الرئيسية\n• الوصول إلى سوق من 270+ مليون مستهلك\n• تكاليف عمالة تنافسية جداً\n• مصادر طبيعية غنية ومتنوعة\n• اقتصاد ينمو بمعدل 5%+ سنوياً\n• انخفاض التشبع في كثير من القطاعات\n• إقامة مستثمر مشمولة\n\n## القطاعات الواعدة\n→ التكنولوجيا والتجارة الإلكترونية\n→ السياحة والضيافة\n→ الزراعة والأغذية\n→ الطاقة المتجددة\n→ التصنيع والصناعة\n→ الرعاية الصحية\n\n## متطلبات التأسيس\n• الحد الأدنى لرأس المال: 10 مليار روبية إندونيسية (حوالي 650,000 دولار) للشركات الكبرى\n• بعض القطاعات تقبل رؤوس أموال أصغر\n• عنوان مكتب مسجل في إندونيسيا\n• شريك محلي في بعض القطاعات\n\n## التكاليف التقريبية\n$ رسوم التأسيس والخدمات القانونية: 3,000 - 8,000 دولار\n\n## المدة الزمنية\nمن 4 إلى 8 أسابيع",
    contentEn:"## Indonesia — Asia's Economic Giant\nIndonesia is Southeast Asia's largest economy and a G20 member, with a consumer market of over 270 million people.\n\n## What is PT PMA?\nPT PMA (Perseroan Terbatas Penanaman Modal Asing) is the officially recognized foreign investment company in Indonesia, allowing foreigners to legally own shares in Indonesian companies.\n\n## Investor Residency in Indonesia\nWhen establishing a PT PMA company, you can obtain an investor residency permit (KITAS) valid for 1 to 2 years and renewable.\n\n## Key Benefits\n• Access to a market of 270+ million consumers\n• Very competitive labor costs\n• Rich and diverse natural resources\n• Economy growing at 5%+ annually\n• Low saturation in many sectors\n• Investor residency included\n\n## Promising Sectors\n→ Technology and e-commerce\n→ Tourism and hospitality\n→ Agriculture and food\n→ Renewable energy\n→ Manufacturing and industry\n→ Healthcare\n\n## Formation Requirements\n• Minimum capital: IDR 10 billion (approximately $650,000) for large companies\n• Some sectors accept smaller capital\n• Registered office address in Indonesia\n• Local partner in some sectors\n\n## Approximate Costs\n$ Formation and legal service fees: $3,000 - $8,000\n\n## Timeline\n4 to 8 weeks" },

  { id:"company-syria", category:"company", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأسيس شركة في سوريا — دليل المستثمر الأجنبي 2026",
    titleEn:"Company Formation in Syria — Foreign Investor Guide 2026",
    excerptAr:"سوريا في مرحلة إعادة الإعمار توفر فرصاً استثمارية فريدة. ندرس وضعك ونقدم لك السعر والخطة المناسبة.",
    excerptEn:"Syria in reconstruction phase offers unique investment opportunities. We study your situation and provide the right price and plan.",
    contentAr:"## سوريا — فرص الإعمار والاستثمار\nتمر سوريا بمرحلة حساسة وهامة من إعادة الإعمار والانتعاش الاقتصادي، مما يُشكّل فرصاً استثمارية لمن يفهم السوق المحلي ويمتلك الشبكة الصحيحة.\n\n## لماذا سوريا الآن؟\n• مرحلة إعادة الإعمار — طلب هائل على السلع والخدمات\n• اليد العاملة الماهرة بتكاليف تنافسية\n• موقع جغرافي استراتيجي يربط الشرق الأوسط بأوروبا\n• فرص في قطاعات متعددة لم تُستثمر بعد\n• علاقات تجارية تاريخية عميقة\n\n## القطاعات ذات الأولوية\n→ مواد البناء والإنشاء\n→ الاستيراد والتوزيع\n→ الخدمات الطبية والدوائية\n→ التكنولوجيا والاتصالات\n→ الزراعة والصناعات الغذائية\n→ الطاقة والمحروقات\n\n## ملاحظة مهمة\nنظراً للوضع الخاص لسوريا، تحتاج كل حالة استثمارية إلى دراسة معمقة. لذلك نقدم السعر والخطة بعد دراسة متطلباتك الخاصة.\n\n## ما نقدمه\n• دراسة مفصلة لجدوى الاستثمار في سوريا\n• تقييم المخاطر والفرص الخاصة بنشاطك\n• التواصل مع الشبكات المحلية الموثوقة\n• توجيه قانوني وإداري كامل\n• تأسيس الكيان القانوني المناسب\n\n## السعر\nالسعر بعد الدراسة — تواصل معنا لتقييم مجاني لوضعك\n\n## المدة الزمنية\nتختلف حسب نوع النشاط والهيكل القانوني المطلوب",
    contentEn:"## Syria — Reconstruction and Investment Opportunities\nSyria is going through a sensitive and important phase of reconstruction and economic recovery, creating unique investment opportunities for those who understand the local market.\n\n## Why Syria Now?\n• Reconstruction phase — massive demand for goods and services\n• Skilled labor at competitive costs\n• Strategic geographic location connecting the Middle East to Europe\n• Opportunities in multiple unexplored sectors\n• Deep historical trade relationships\n\n## Priority Sectors\n→ Construction materials and building\n→ Import and distribution\n→ Medical and pharmaceutical services\n→ Technology and communications\n→ Agriculture and food industries\n→ Energy and fuel\n\n## Important Note\nDue to Syria's special situation, each investment case requires in-depth study. Therefore we provide pricing and planning after studying your specific requirements.\n\n## What We Offer\n• Detailed feasibility study for investing in Syria\n• Risk and opportunity assessment for your specific activity\n• Connection with trusted local networks\n• Complete legal and administrative guidance\n• Establishment of the appropriate legal entity\n\n## Pricing\nPrice after study — contact us for a free evaluation of your situation\n\n## Timeline\nVaries depending on business type and required legal structure" },

  // ── Visa Articles ──────────────────────────────────────────
  { id:"visa-south-korea", category:"visa", featured:true, date:"2026-06-01", readTime:7,
    titleAr:"تأشيرة كوريا الجنوبية — الدليل الكامل 2026",
    titleEn:"South Korea Visa — Complete Guide 2026",
    excerptAr:"كل ما تحتاجه لتأشيرة كوريا الجنوبية: الأوراق المطلوبة، الرسوم، المدة، ونصائح لقبول الطلب.",
    excerptEn:"Everything you need for a South Korea visa: required documents, fees, processing time, and tips for approval.",
    contentAr:"## تأشيرة كوريا الجنوبية\n\nتُعد كوريا الجنوبية وجهة سياحية وتجارية رائعة، معروفة بتكنولوجيا متطورة وثقافة آسيوية فريدة وخدمات صحية عالية الجودة.\n\n## أنواع التأشيرات المتاحة\n→ تأشيرة سياحية قصيرة الأمد (C-3): للزيارات السياحية\n→ تأشيرة أعمال (C-3-4): للاجتماعات والمؤتمرات التجارية\n→ تأشيرة علاج طبي (C-3-3): للمرضى والمرافقين\n→ تأشيرة الترانزيت (C-2)\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية حديثة بخلفية بيضاء\n• استمارة طلب التأشيرة مكتملة\n• كشف حساب بنكي لآخر 3 أشهر\n• حجز فندق مؤكد\n• تذاكر سفر ذهاب وعودة\n• خطاب عمل أو وثيقة تجارية (للأعمال)\n• تأمين سفر شامل\n\n## الرسوم والمدة\n$ رسوم التأشيرة: 40-50 دولار تقريباً\n⏱ مدة المعالجة: 3-5 أيام عمل\n\n## نصائح للقبول\n• إظهار روابط قوية ببلد الإقامة (عقد عمل، عائلة، عقار)\n• كشف حساب يُظهر رصيداً كافياً للرحلة\n• حجوزات فندقية كاملة لمدة الإقامة\n• تاريخ سفر نظيف وسابق يُعزز الطلب",
    contentEn:"## South Korea Visa\n\nSouth Korea is a remarkable tourist and business destination, known for advanced technology, unique Asian culture and high-quality healthcare.\n\n## Available Visa Types\n→ Short-term tourist visa (C-3): for tourism\n→ Business visa (C-3-4): for meetings and conferences\n→ Medical treatment visa (C-3-3): for patients and companions\n→ Transit visa (C-2)\n\n## Required Documents\n• Passport valid for more than 6 months\n• Recent personal photos with white background\n• Completed visa application form\n• Bank statement for last 3 months\n• Confirmed hotel booking\n• Return flight tickets\n• Work letter or business document\n• Comprehensive travel insurance\n\n## Fees and Timeline\n$ Visa fee: approximately $40-50\n⏱ Processing time: 3-5 business days\n\n## Tips for Approval\n• Show strong ties to country of residence (work contract, family, property)\n• Bank statement showing sufficient funds\n• Complete hotel bookings for the entire stay\n• Clean travel history strengthens the application" },

  { id:"visa-indonesia-2m", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة إندونيسيا — شهرين (B211A)",
    titleEn:"Indonesia Visa — 2 Months (B211A)",
    excerptAr:"تأشيرة إقامة قابلة للتمديد لمدة شهرين. الأفضل للزيارات الممتدة وإجراء الأعمال ومستكشفي إندونيسيا.",
    excerptEn:"Extendable 2-month stay visa. Best for extended visits, business exploration and discovering Indonesia.",
    contentAr:"## تأشيرة إندونيسيا B211A — شهران\n\nتُعد تأشيرة B211A من أكثر التأشيرات طلباً في إندونيسيا، وهي مثالية للمسافرين الذين يودون قضاء وقت ممتد في البلاد.\n\n## مميزات التأشيرة\n• مدة إقامة شهران (60 يوم)\n• قابلة للتمديد لشهرين إضافيين داخل إندونيسيا\n• تُمنح كتأشيرة مفردة الدخول\n• تسمح بممارسة بعض الأنشطة الاجتماعية والعائلية\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• كشف حساب بنكي\n• خطاب دعوة أو حجز فندقي\n• تأمين سفر\n• استمارة الطلب\n\n## الرسوم والمدة\n$ رسوم التأشيرة: 50-80 دولار\n⏱ مدة المعالجة: 3-7 أيام عمل\n\n## ملاحظة هامة\nيمكن التمديد من داخل إندونيسيا عبر مكاتب الهجرة للحصول على شهرين إضافيين.",
    contentEn:"## Indonesia B211A Visa — 2 Months\n\nThe B211A visa is one of Indonesia's most requested visas, ideal for travelers wishing to spend extended time in the country.\n\n## Visa Features\n• 2-month stay (60 days)\n• Extendable for 2 additional months inside Indonesia\n• Granted as a single-entry visa\n• Allows some social and family activities\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Bank statement\n• Invitation letter or hotel booking\n• Travel insurance\n• Application form\n\n## Fees and Timeline\n$ Visa fee: $50-80\n⏱ Processing time: 3-7 business days\n\n## Important Note\nExtension is possible inside Indonesia through immigration offices for 2 additional months." },

  { id:"visa-indonesia-1y", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة إندونيسيا — سنة (E33G / ITAP)",
    titleEn:"Indonesia Visa — 1 Year (E33G / ITAP)",
    excerptAr:"تأشيرة إقامة سنوية لإندونيسيا. مثالية للعمل عن بُعد والمقيمين طويل الأمد والمستثمرين.",
    excerptEn:"Annual residency visa for Indonesia. Ideal for remote workers, long-term residents and investors.",
    contentAr:"## تأشيرة إندونيسيا لمدة سنة\n\nتوفر إندونيسيا تأشيرة إقامة سنوية مناسبة للمقيمين طويل الأمد، خاصة في ظل انتشار العمل عن بُعد.\n\n## أنواع التأشيرات السنوية\n→ E33G: تأشيرة زائر اجتماعي سنوية\n→ ITAS (إذن الإقامة المؤقت): للعمل والاستثمار\n→ تأشيرة نومادي رقمي (Digital Nomad): للعمل عن بُعد لمدة 5 سنوات\n\n## المزايا الرئيسية\n• إقامة قانونية كاملة لمدة سنة\n• إمكانية العمل عن بُعد بشكل قانوني\n• تكاليف معيشة منخفضة جداً مقارنة بالخليج\n• مناخ استوائي جميل طوال العام\n\n## المستندات المطلوبة\n• جواز سفر ساري\n• دليل على الدخل الشهري (لتأشيرة العمل عن بُعد: 2000 دولار شهرياً على الأقل)\n• كشف حساب بنكي\n• تأمين صحي\n• صور شخصية\n\n## الرسوم التقريبية\n$ تأشيرة سنوية: 150-300 دولار حسب النوع\n⏱ مدة المعالجة: 5-14 يوم",
    contentEn:"## Indonesia 1-Year Visa\n\nIndonesia offers an annual residency visa suitable for long-term residents, especially with the rise of remote work.\n\n## Types of Annual Visas\n→ E33G: Annual social visitor visa\n→ ITAS (Temporary Stay Permit): for work and investment\n→ Digital Nomad Visa: for remote workers up to 5 years\n\n## Key Benefits\n• Full legal residency for 1 year\n• Legal remote work capability\n• Very low living costs compared to Gulf\n• Beautiful tropical climate year-round\n\n## Required Documents\n• Valid passport\n• Proof of monthly income (remote work visa: minimum $2,000/month)\n• Bank statement\n• Health insurance\n• Personal photos\n\n## Approximate Fees\n$ Annual visa: $150-300 depending on type\n⏱ Processing time: 5-14 days" },

  { id:"visa-indonesia-5y", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة إندونيسيا — خمس سنوات (KITAP)",
    titleEn:"Indonesia Visa — 5 Years (KITAP Permanent Stay)",
    excerptAr:"بطاقة الإقامة الدائمة في إندونيسيا. لمن أمضى سنوات طويلة في البلاد ويريد استقراراً طويل الأمد.",
    excerptEn:"Indonesia Permanent Stay Permit. For those who have spent years in the country and want long-term stability.",
    contentAr:"## KITAP — إذن الإقامة الدائمة في إندونيسيا\n\nيُعد KITAP (Kartu Izin Tinggal Tetap) أعلى مستوى من الإقامة القانونية يمكن أن يحصل عليه الأجانب في إندونيسيا دون الحصول على الجنسية.\n\n## من يمكنه التقديم؟\n• من أمضى 5 سنوات متواصلة بإقامة مؤقتة (ITAS) صالحة\n• المتزوجون من مواطنين إندونيسيين\n• أصحاب الاستثمارات طويلة الأمد في إندونيسيا\n• المتقاعدون (بشروط خاصة)\n\n## مميزات KITAP\n• صالح لمدة 5 سنوات قابل للتجديد\n• لا حاجة لتجديد سنوي مرهق\n• حرية الدخول والخروج من إندونيسيا\n• إمكانية فتح حسابات بنكية وتأسيس أعمال\n• إقامة مستقرة لك ولعائلتك\n\n## متطلبات التقديم\n• إثبات الإقامة السابقة الطويلة (5 سنوات ITAS)\n• سجل جنائي نظيف\n• دليل على الاستقرار المالي\n• تأمين صحي ساري\n\n## الرسوم التقريبية\n$ رسوم KITAP: 500-800 دولار\n⏱ مدة المعالجة: 14-30 يوم",
    contentEn:"## KITAP — Indonesia Permanent Stay Permit\n\nKITAP (Kartu Izin Tinggal Tetap) is the highest level of legal residency foreigners can obtain in Indonesia without citizenship.\n\n## Who Can Apply?\n• Those with 5 consecutive years of valid temporary stay (ITAS)\n• Those married to Indonesian citizens\n• Long-term investors in Indonesia\n• Retirees (with special conditions)\n\n## KITAP Benefits\n• Valid for 5 years renewable\n• No burdensome annual renewal\n• Freedom to enter and exit Indonesia\n• Ability to open bank accounts and establish businesses\n• Stable residency for you and your family\n\n## Application Requirements\n• Proof of long previous residency (5 years ITAS)\n• Clean criminal record\n• Evidence of financial stability\n• Valid health insurance\n\n## Approximate Fees\n$ KITAP fees: $500-800\n⏱ Processing time: 14-30 days" },

  { id:"visa-thailand", category:"visa", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأشيرة تايلاند — السياحة والإقامة 2026",
    titleEn:"Thailand Visa — Tourism and Residency 2026",
    excerptAr:"تايلاند وجهة لا مثيل لها للسياحة والإقامة. خيارات تأشيرة متعددة وتكاليف معيشة منخفضة مع جودة حياة عالية.",
    excerptEn:"Thailand is an unmatched destination for tourism and residency. Multiple visa options and low cost of living with high quality of life.",
    contentAr:"## تأشيرة تايلاند — نظرة عامة\n\nتعد تايلاند من أكثر الوجهات شعبية في جنوب شرق آسيا، تجمع بين الشواطئ الخلابة والثقافة الغنية والطعام الشهي وتكاليف المعيشة المعقولة.\n\n## أنواع التأشيرات\n→ إعفاء من التأشيرة (Visa Exemption): 30 يوماً لكثير من الجنسيات العربية\n→ تأشيرة سياحية (TR): 60 يوماً قابلة للتمديد 30 يوماً\n→ تأشيرة التقاعد (Non-OA): لمن تجاوز 50 عاماً\n→ تأشيرة طويلة الأمد (LTR Visa): 10 سنوات للعمل عن بُعد والمستثمرين\n→ تأشيرة SMART Visa: للمتخصصين وأصحاب المشاريع\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• حجز فندق مؤكد أو دعوة\n• كشف حساب يُظهر 20,000 بات تايلاندي على الأقل\n• تذاكر ذهاب وعودة\n• تأمين سفر\n\n## تأشيرة LTR — العمل عن بُعد\n• صالحة 10 سنوات للعاملين عن بُعد\n• شرط الدخل: 80,000 دولار سنوياً\n• إعفاء ضريبي على الدخل من الخارج\n\n## الرسوم التقريبية\n$ تأشيرة سياحية: 35-40 دولار\n⏱ مدة المعالجة: 1-3 أيام عمل",
    contentEn:"## Thailand Visa — Overview\n\nThailand is one of Southeast Asia's most popular destinations, combining stunning beaches, rich culture, delicious food and reasonable cost of living.\n\n## Visa Types\n→ Visa Exemption: 30 days for many Arab nationalities\n→ Tourist Visa (TR): 60 days extendable by 30 days\n→ Retirement Visa (Non-OA): for those over 50\n→ Long-Term Resident Visa (LTR): 10 years for remote workers and investors\n→ SMART Visa: for specialists and entrepreneurs\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Confirmed hotel booking or invitation\n• Bank statement showing minimum THB 20,000\n• Return flight tickets\n• Travel insurance\n\n## LTR Visa — Remote Work\n• Valid 10 years for remote workers\n• Income requirement: $80,000 per year\n• Tax exemption on foreign-sourced income\n\n## Approximate Fees\n$ Tourist visa: $35-40\n⏱ Processing time: 1-3 business days" },

  { id:"visa-malaysia", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة ماليزيا — بوابة آسيا الجنوبية الشرقية",
    titleEn:"Malaysia Visa — Gateway to Southeast Asia",
    excerptAr:"ماليزيا وجهة آسيوية متميزة بتكاليف معيشة منخفضة وثقافة متعددة الأعراق وطبيعة خلابة.",
    excerptEn:"Malaysia is a distinguished Asian destination with low cost of living, multicultural society and stunning nature.",
    contentAr:"## تأشيرة ماليزيا\n\nتتميز ماليزيا بكونها مزيجاً فريداً من الثقافات الآسيوية المختلفة مع بنية تحتية حديثة وتكاليف معيشية منافسة.\n\n## أبرز المزايا\n• كوالالمبور مدينة حديثة ومتطورة بتكاليف منخفضة\n• إعفاء من التأشيرة لكثير من الجنسيات العربية لمدة 30 يوماً\n• نظام ماليزيا وجهتي الثانية (MM2H) للإقامة طويلة الأمد\n• لغة إنجليزية واسعة الانتشار\n\n## أنواع التأشيرات\n→ إعفاء تلقائي: 30 يوماً للكثير من الجنسيات العربية\n→ eVisa ماليزيا: للجنسيات غير المعفاة\n→ تأشيرة MM2H: إقامة 5-10 سنوات للمتقاعدين والمستثمرين\n→ تأشيرة طالب أو عمل\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• حجز فندقي\n• تذاكر عودة\n• كشف حساب بنكي\n\n## برنامج MM2H — الإقامة طويلة الأمد\n• تأشيرة إقامة 5 سنوات قابلة للتجديد\n• شرط الدخل الشهري: 40,000 رينغيت ماليزي\n• إيداع بنكي ثابت: 1 مليون رينغيت\n\n## الرسوم\n$ رسوم eVisa: 20-30 دولار\n⏱ مدة المعالجة: 1-3 أيام",
    contentEn:"## Malaysia Visa\n\nMalaysia is a unique blend of different Asian cultures with modern infrastructure and competitive cost of living.\n\n## Key Advantages\n• Kuala Lumpur is a modern and advanced city at low costs\n• Visa exemption for many Arab nationalities for 30 days\n• Malaysia My Second Home (MM2H) for long-term residency\n• Widely spoken English\n\n## Visa Types\n→ Automatic exemption: 30 days for many Arab nationalities\n→ Malaysia eVisa: for non-exempt nationalities\n→ MM2H Visa: 5-10 year residency for retirees and investors\n→ Student or work visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Hotel booking\n• Return tickets\n• Bank statement\n\n## MM2H Program — Long-Term Residency\n• 5-year renewable residency visa\n• Monthly income requirement: MYR 40,000\n• Fixed bank deposit: MYR 1 million\n\n## Fees\n$ eVisa fees: $20-30\n⏱ Processing time: 1-3 days" },

  { id:"visa-brazil", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة البرازيل — أكبر دول أمريكا اللاتينية",
    titleEn:"Brazil Visa — South America's Largest Country",
    excerptAr:"البرازيل فرصة سياحية وتجارية استثنائية. الأمازون، الكرنفال، وأسواق اقتصادية ضخمة تنتظرك.",
    excerptEn:"Brazil is an exceptional tourism and business opportunity. The Amazon, Carnival, and massive economic markets await you.",
    contentAr:"## تأشيرة البرازيل\n\nالبرازيل هي الدولة الأكبر في أمريكا اللاتينية واقتصادها التاسع في العالم، تجمع بين تنوع طبيعي استثنائي وسوق استهلاكي ضخم.\n\n## من يحتاج تأشيرة؟\nتحتاج معظم الجنسيات العربية إلى تأشيرة للبرازيل. أعلنت البرازيل مؤخراً إعفاء بعض الجنسيات من التأشيرة تدريجياً.\n\n## أنواع التأشيرات\n→ تأشيرة سياحية (VITUR): للسياحة حتى 90 يوماً\n→ تأشيرة أعمال (VITEM-II): للاجتماعات التجارية\n→ تأشيرة علاج طبي (VITEM-XI): للعلاج والمرافقين\n→ تأشيرة مؤتمرات وفعاليات\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة الطلب الإلكترونية\n• صور شخصية مواصفات محددة\n• تذاكر ذهاب وعودة محجوزة\n• حجوزات فندقية للإقامة كاملة\n• كشف حساب بنكي لآخر 3 أشهر\n• تأمين سفر يغطي البرازيل\n• خطاب عمل أو خطاب دعوة\n\n## الرسوم والمدة\n$ رسوم التأشيرة: 40-80 دولار\n⏱ مدة المعالجة: 5-15 يوم عمل",
    contentEn:"## Brazil Visa\n\nBrazil is South America's largest country and the world's ninth economy, combining exceptional natural diversity with a massive consumer market.\n\n## Who Needs a Visa?\nMost Arab nationalities need a visa for Brazil. Brazil has recently announced gradual exemptions for some nationalities.\n\n## Visa Types\n→ Tourist visa (VITUR): for tourism up to 90 days\n→ Business visa (VITEM-II): for business meetings\n→ Medical treatment visa (VITEM-XI): for treatment and companions\n→ Conference and events visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Electronic application form\n• Personal photos with specific requirements\n• Confirmed return flight tickets\n• Hotel bookings for entire stay\n• Bank statement for last 3 months\n• Travel insurance covering Brazil\n• Work letter or invitation letter\n\n## Fees and Timeline\n$ Visa fee: $40-80\n⏱ Processing time: 5-15 business days" },

  { id:"visa-colombia", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة كولومبيا — جوهرة أمريكا الجنوبية",
    titleEn:"Colombia Visa — Gem of South America",
    excerptAr:"كولومبيا تتحول إلى وجهة سياحية وتجارية رائدة. مناخ متنوع وتكاليف معيشة منخفضة وترحيب استثنائي.",
    excerptEn:"Colombia is becoming a leading tourism and business destination. Diverse climate, low cost of living and exceptional hospitality.",
    contentAr:"## تأشيرة كولومبيا\n\nتشهد كولومبيا طفرة سياحية وتجارية في السنوات الأخيرة، وقد باتت وجهة مفضلة للرحالة والمستثمرين من حول العالم.\n\n## هل تحتاج تأشيرة؟\nكثير من الجنسيات العربية تستطيع دخول كولومبيا بدون تأشيرة لمدة 90 يوماً، بينما يحتاج بعضها إلى تأشيرة مسبقة.\n\n## أنواع التأشيرات\n→ تأشيرة سياحية (V): للسياحة والزيارات\n→ تأشيرة أعمال (NE): للاجتماعات والمعارض\n→ تأشيرة الإقامة الطويلة (M): للمستثمرين والمتقاعدين\n→ تأشيرة العمل عن بُعد (Digital Nomad)\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• تذاكر ذهاب وعودة\n• حجوزات فندقية\n• كشف حساب بنكي\n• تأمين سفر\n\n## أبرز وجهات كولومبيا\n→ بوغوتا: العاصمة بالمرتفعات\n→ ميديلين: مدينة الربيع الأبدي\n→ كارتاخينا: المدينة الاستوائية على البحر الكاريبي\n→ القهوة الكولومبية الشهيرة\n\n## الرسوم\n$ رسوم تأشيرة الأعمال: 52 دولار\n⏱ مدة المعالجة: 3-10 أيام",
    contentEn:"## Colombia Visa\n\nColombia is experiencing a tourism and business boom in recent years, becoming a favorite destination for travelers and investors worldwide.\n\n## Do You Need a Visa?\nMany Arab nationalities can enter Colombia without a visa for 90 days, while some require a prior visa.\n\n## Visa Types\n→ Tourist visa (V): for tourism and visits\n→ Business visa (NE): for meetings and exhibitions\n→ Long-term residency visa (M): for investors and retirees\n→ Digital Nomad visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Return flight tickets\n• Hotel bookings\n• Bank statement\n• Travel insurance\n\n## Top Colombian Destinations\n→ Bogotá: highland capital\n→ Medellín: city of eternal spring\n→ Cartagena: tropical Caribbean city\n→ Famous Colombian coffee\n\n## Fees\n$ Business visa fee: $52\n⏱ Processing time: 3-10 days" },

  { id:"visa-serbia", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة صربيا — بوابة أوروبا بدون قيود",
    titleEn:"Serbia Visa — European Gateway Without Restrictions",
    excerptAr:"صربيا وجهة أوروبية بدون تعقيدات. تكاليف معيشة منخفضة، إقامة ميسرة، وبوابة قانونية لأوروبا.",
    excerptEn:"Serbia is a European destination without complications. Low cost of living, easy residency and a legal gateway to Europe.",
    contentAr:"## تأشيرة صربيا\n\nأصبحت صربيا وجهة مفضلة لكثير من الجنسيات العربية الباحثة عن إقامة أوروبية بتكاليف معقولة وإجراءات مبسطة.\n\n## لماذا صربيا؟\n• إقامة مجانية أو ميسرة لكثير من الجنسيات العربية\n• تكاليف معيشة من أدنى مستويات أوروبا\n• مدينة بلغراد نابضة بالحياة والسياحة\n• لا تتطلب تأشيرة شنغن لدخولها\n• برامج إقامة قانونية مرنة للمستثمرين\n\n## من يدخل بدون تأشيرة؟\nكثير من الجنسيات العربية تستطيع دخول صربيا بدون تأشيرة مسبقة لمدة تصل إلى 30 أو 90 يوماً حسب الاتفاقيات الثنائية.\n\n## أنواع الإقامة في صربيا\n→ إقامة مؤقتة لأسباب العمل\n→ إقامة مؤقتة للدراسة\n→ إقامة مؤقتة للاستثمار (شركة في صربيا)\n→ لم الشمل العائلي\n\n## المستندات المطلوبة للإقامة\n• جواز سفر ساري\n• عقد إيجار مسجل\n• وثيقة الغرض من الإقامة (عمل، دراسة، استثمار)\n• شهادة عدم سوابق جنائية\n• تأمين صحي\n\n## الرسوم\n$ طلب الإقامة: 50-150 يورو\n⏱ مدة المعالجة: 30-60 يوم",
    contentEn:"## Serbia Visa\n\nSerbia has become a preferred destination for many Arab nationalities seeking European residency with reasonable costs and simplified procedures.\n\n## Why Serbia?\n• Free or easy entry for many Arab nationalities\n• Living costs among Europe's lowest\n• Belgrade is a vibrant city for tourism\n• Does not require Schengen visa to enter\n• Flexible legal residency programs for investors\n\n## Who Enters Without Visa?\nMany Arab nationalities can enter Serbia without prior visa for 30 or 90 days depending on bilateral agreements.\n\n## Types of Residency in Serbia\n→ Temporary residency for work\n→ Temporary residency for study\n→ Temporary residency for investment (company in Serbia)\n→ Family reunification\n\n## Required Documents for Residency\n• Valid passport\n• Registered rental contract\n• Document stating purpose of stay\n• Criminal record certificate\n• Health insurance\n\n## Fees\n$ Residency application: €50-150\n⏱ Processing time: 30-60 days" },

  { id:"visa-schengen", category:"visa", featured:true, date:"2026-06-01", readTime:10,
    titleAr:"تأشيرة شنغن — الملف الاحترافي للدول الأوروبية 2026",
    titleEn:"Schengen Visa — Professional File for European Countries 2026",
    excerptAr:"ندرس وضعك ونبني ملفاً احترافياً يرفع نسبة القبول إلى أقصى حد. 27 دولة أوروبية بتأشيرة واحدة.",
    excerptEn:"We study your situation and build a professional file that maximizes approval chances. 27 European countries with one visa.",
    contentAr:"## تأشيرة شنغن — المنطقة الأوروبية الموحدة\n\nتأشيرة شنغن هي مفتاح 27 دولة أوروبية بوثيقة سفر واحدة. تُعد من أصعب التأشيرات للحصول عليها، لكن مع الملف الاحترافي الصحيح ترتفع نسبة القبول بشكل كبير.\n\n## الدول المشمولة في منطقة شنغن\nألمانيا، فرنسا، إيطاليا، إسبانيا، هولندا، بلجيكا، النمسا، سويسرا، اليونان، البرتغال، السويد، النرويج، الدانمارك، فنلندا، بولندا، التشيك، المجر، وغيرها (27 دولة).\n\n## السفارات الأسهل والأصعب\n→ الأسهل: السفارة الإيطالية، الإسبانية، اليونانية\n→ الأصعب: السفارة الألمانية، الفرنسية، الهولندية\n\n## ما يشمله ملفنا الاحترافي\n• تحليل وضعك الكامل وتحديد أفضل السفارة لك\n• إرشادات تفصيلية لكل وثيقة مطلوبة\n• مراجعة كاملة للملف قبل التقديم\n• تحضير خطاب تغطية احترافي\n• نصائح مقابلة القنصلية\n\n## المستندات الأساسية المطلوبة\n• جواز سفر ساري لأكثر من 3 أشهر بعد الرحلة\n• صور شخصية بمواصفات بيومترية\n• استمارة طلب مكتملة بدقة\n• حجز تذاكر طيران (غير مؤكد يُفضل)\n• حجوزات فندقية قابلة للاسترداد\n• تأمين سفر شنغن (30,000 يورو على الأقل)\n• كشف حساب بنكي لآخر 3-6 أشهر\n• خطاب عمل أو وثائق نشاط تجاري\n• وثائق تُثبت الروابط ببلد الإقامة\n\n## أسباب رفض التأشيرة وكيف نتجنبها\n• ضعف الملف المالي — نساعدك في تقديم المالية بالشكل المناسب\n• عدم إثبات نية العودة — نوثق روابطك ببلدك\n• ملف ناقص أو خاطئ — نراجع كل وثيقة بعناية\n• تاريخ رفض سابق — نضع استراتيجية للتعامل معه\n\n## الرسوم\n$ رسوم تأشيرة شنغن: 80 يورو للبالغين\n⏱ مدة المعالجة: 10-15 يوم عمل (يُنصح بالتقديم قبل 6 أسابيع)",
    contentEn:"## Schengen Visa — Unified European Zone\n\nThe Schengen Visa is the key to 27 European countries with one travel document. It is one of the hardest visas to obtain, but with the right professional file, approval chances rise significantly.\n\n## Countries in the Schengen Zone\nGermany, France, Italy, Spain, Netherlands, Belgium, Austria, Switzerland, Greece, Portugal, Sweden, Norway, Denmark, Finland, Poland, Czech Republic, Hungary and others (27 countries).\n\n## Easiest and Hardest Embassies\n→ Easiest: Italian, Spanish, Greek embassies\n→ Hardest: German, French, Dutch embassies\n\n## What Our Professional File Includes\n• Complete analysis of your situation and choosing the best embassy\n• Detailed guidance for each required document\n• Complete file review before submission\n• Professional cover letter preparation\n• Consulate interview tips\n\n## Essential Required Documents\n• Passport valid more than 3 months after trip\n• Personal photos with biometric specifications\n• Accurately completed application form\n• Flight ticket booking (non-confirmed preferred)\n• Refundable hotel bookings\n• Schengen travel insurance (minimum €30,000)\n• Bank statement for last 3-6 months\n• Work letter or business documents\n• Documents proving ties to country of residence\n\n## Rejection Reasons and How We Avoid Them\n• Weak financial file — we help present finances properly\n• Failure to prove return intention — we document your home country ties\n• Incomplete or incorrect file — we review every document carefully\n• Previous rejection history — we create a strategy to address it\n\n## Fees\n$ Schengen visa fee: €80 for adults\n⏱ Processing time: 10-15 business days (recommend applying 6 weeks in advance)" },

  { id:"visa-iraq-erbil", category:"visa", featured:false, date:"2026-06-01", readTime:5,
    titleAr:"تأشيرة العراق — أربيل (إقليم كردستان)",
    titleEn:"Iraq Visa — Erbil (Kurdistan Region)",
    excerptAr:"تأشيرة أربيل وإقليم كردستان العراق. إجراءات مبسطة ومدينة آمنة ومتطورة في شمال العراق.",
    excerptEn:"Erbil and Kurdistan Region of Iraq visa. Simplified procedures and a safe, modern city in northern Iraq.",
    contentAr:"## تأشيرة أربيل — إقليم كردستان\n\nتعد أربيل عاصمة إقليم كردستان العراق واحدة من أكثر المدن العراقية أماناً وتطوراً، وتشهد نمواً تجارياً واستثمارياً ملحوظاً.\n\n## طرق الدخول إلى أربيل\n→ تأشيرة عند الوصول (VOA): متاحة لكثير من الجنسيات في مطار أربيل الدولي\n→ التأشيرة المسبقة: عبر القنصليات العراقية\n→ التصريح الإلكتروني: عبر البوابة الإلكترونية لإقليم كردستان\n\n## المناطق المشمولة\nتأشيرة أربيل تشمل إقليم كردستان بالكامل: أربيل، السليمانية، دهوك.\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• حجز فندق أو دعوة\n• دليل على الغرض من الزيارة (سياحة، أعمال، زيارة عائلية)\n\n## الرسوم\n$ تأشيرة عند الوصول: 75-100 دولار\n⏱ مدة الإقامة: 30 يوماً قابلة للتمديد\n\n## ملاحظة\nللزيارات إلى بغداد أو المحافظات الأخرى، تحتاج إلى تأشيرة عراقية فيدرالية منفصلة.",
    contentEn:"## Erbil Visa — Kurdistan Region\n\nErbil, capital of the Kurdistan Region of Iraq, is one of the safest and most developed Iraqi cities, experiencing notable commercial and investment growth.\n\n## Ways to Enter Erbil\n→ Visa on Arrival (VOA): available for many nationalities at Erbil International Airport\n→ Prior visa: through Iraqi consulates\n→ Electronic permit: via Kurdistan Region's e-portal\n\n## Areas Covered\nErbil visa covers the entire Kurdistan Region: Erbil, Sulaymaniyah, Dohuk.\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Hotel booking or invitation\n• Proof of visit purpose (tourism, business, family visit)\n\n## Fees\n$ Visa on Arrival: $75-100\n⏱ Stay duration: 30 days extendable\n\n## Note\nFor visits to Baghdad or other governorates, you need a separate federal Iraqi visa." },

  { id:"visa-iraq-baghdad", category:"visa", featured:false, date:"2026-06-01", readTime:5,
    titleAr:"تأشيرة العراق — بغداد (الفيدرالية)",
    titleEn:"Iraq Visa — Baghdad (Federal)",
    excerptAr:"التأشيرة الفيدرالية العراقية للدخول إلى بغداد وكافة المحافظات العراقية. إجراءات وأوراق مفصلة.",
    excerptEn:"Federal Iraqi visa for entry to Baghdad and all Iraqi governorates. Detailed procedures and documents.",
    contentAr:"## التأشيرة العراقية الفيدرالية — بغداد\n\nللدخول إلى بغداد وسائر المحافظات العراقية خارج إقليم كردستان، تحتاج إلى التأشيرة العراقية الفيدرالية الصادرة عن وزارة الداخلية العراقية.\n\n## من يحتاج تأشيرة؟\nمعظم الجنسيات غير العربية تحتاج تأشيرة مسبقة. بعض الجنسيات العربية تدخل بدون تأشيرة.\n\n## أنواع التأشيرات\n→ تأشيرة سياحية\n→ تأشيرة أعمال\n→ تأشيرة زيارة عائلية\n→ تأشيرة دينية (زيارة المراقد المقدسة)\n→ تأشيرة صحفية\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة طلب مكتملة\n• صور شخصية\n• خطاب دعوة من جهة عراقية معتمدة\n• كشف حساب بنكي\n• تأمين سفر\n• حجز فندق مؤكد في بغداد\n\n## الرسوم والمدة\n$ رسوم التأشيرة: تختلف حسب الجنسية\n⏱ مدة المعالجة: 2-4 أسابيع\n\n## تنبيه هام\nيُنصح بالتواصل مع مكتبنا لمعرفة متطلبات جنسيتك تحديداً، حيث تتغير الإجراءات بشكل متكرر.",
    contentEn:"## Federal Iraqi Visa — Baghdad\n\nTo enter Baghdad and other Iraqi governorates outside Kurdistan Region, you need the federal Iraqi visa issued by the Iraqi Ministry of Interior.\n\n## Who Needs a Visa?\nMost non-Arab nationalities need a prior visa. Some Arab nationalities can enter without a visa.\n\n## Visa Types\n→ Tourist visa\n→ Business visa\n→ Family visit visa\n→ Religious visa (visiting holy shrines)\n→ Press visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Completed application form\n• Personal photos\n• Invitation letter from an approved Iraqi entity\n• Bank statement\n• Travel insurance\n• Confirmed hotel booking in Baghdad\n\n## Fees and Timeline\n$ Visa fees: vary by nationality\n⏱ Processing time: 2-4 weeks\n\n## Important Note\nWe recommend contacting our office for specific requirements based on your nationality, as procedures change frequently." },

  { id:"visa-egypt", category:"visa", featured:false, date:"2026-06-01", readTime:5,
    titleAr:"تأشيرة مصر — بوابة أفريقيا والشرق الأوسط",
    titleEn:"Egypt Visa — Gateway to Africa and the Middle East",
    excerptAr:"تأشيرة مصر لزيارة الأهرامات والغردقة وشرم الشيخ. eVisa سهلة وسريعة أو تأشيرة عند الوصول.",
    excerptEn:"Egypt visa to visit the Pyramids, Hurghada and Sharm El Sheikh. Easy and fast eVisa or visa on arrival.",
    contentAr:"## تأشيرة مصر\n\nمصر وجهة سياحية وتاريخية لا مثيل لها، تجمع بين الحضارة الفرعونية وسواحل البحر الأحمر والبحر المتوسط.\n\n## طرق الحصول على التأشيرة\n→ eVisa المصرية: الأسهل والأسرع — عبر موقع visa2egypt.gov.eg\n→ تأشيرة عند الوصول: متاحة في المطارات الدولية لمعظم الجنسيات\n→ التأشيرة من القنصلية: للحالات الخاصة\n\n## من لا يحتاج تأشيرة؟\nمواطنو الدول العربية الكثير منهم يدخلون مصر بدون تأشيرة بالبطاقة الشخصية.\n\n## أنواع التأشيرة المصرية\n→ تأشيرة مفردة: مدة شهر، دخول واحد\n→ تأشيرة متعددة: مدة شهر، دخول متعدد\n→ تأشيرة سياحية (Sinai Only): لزيارة سيناء فقط من طابا\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية\n• حجز فندق\n• تذاكر ذهاب وعودة\n• كشف حساب بنكي\n\n## الرسوم\n$ eVisa مفردة: 25 دولار\n$ eVisa متعددة: 60 دولار\n$ تأشيرة عند الوصول: 25 دولار\n⏱ مدة eVisa: 3-5 أيام عمل",
    contentEn:"## Egypt Visa\n\nEgypt is an unmatched tourism and historical destination, combining Pharaonic civilization with Red Sea and Mediterranean coasts.\n\n## Ways to Get the Visa\n→ Egyptian eVisa: easiest and fastest via visa2egypt.gov.eg\n→ Visa on Arrival: available at international airports for most nationalities\n→ Consulate visa: for special cases\n\n## Who Doesn't Need a Visa?\nMany Arab nationality citizens enter Egypt without a visa using their national ID.\n\n## Types of Egyptian Visa\n→ Single entry: 1 month, one entry\n→ Multiple entry: 1 month, multiple entries\n→ Sinai Only tourist visa: to visit Sinai only from Taba\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photos\n• Hotel booking\n• Return flight tickets\n• Bank statement\n\n## Fees\n$ Single eVisa: $25\n$ Multiple eVisa: $60\n$ Visa on Arrival: $25\n⏱ eVisa processing: 3-5 business days" },

  { id:"visa-libya", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة ليبيا — وموافقة الدخول إلى بنغازي",
    titleEn:"Libya Visa — and Benghazi Entry Permit",
    excerptAr:"تأشيرة ليبيا للأعمال والزيارات، مع خدمة موافقة الدخول الخاصة لبنغازي وشرق ليبيا.",
    excerptEn:"Libya visa for business and visits, with special entry permit service for Benghazi and eastern Libya.",
    contentAr:"## تأشيرة ليبيا وموافقة الدخول\n\nليبيا في مرحلة إعادة انفتاح تدريجي، وتزداد حركة الأعمال والزيارات إليها تدريجياً. نقدم خدمتين منفصلتين لطرابلس وبنغازي.\n\n## تأشيرة ليبيا — طرابلس\n→ تُصدر عبر السفارات الليبية في الخارج\n→ تستلزم دعوة رسمية من جهة ليبية\n→ الوثائق المطلوبة تختلف حسب الجنسية\n\n## موافقة الدخول — بنغازي وشرق ليبيا\nبنغازي وشرق ليبيا تخضع لسلطة مختلفة عن طرابلس، مما يستلزم الحصول على موافقة دخول خاصة.\n\n## من نخدم\n• رجال الأعمال المتجهون لليبيا\n• المقيمون السابقون في ليبيا الراغبون بالعودة\n• الشركات الراغبة في استكشاف الفرص الليبية\n• الزيارات العائلية\n\n## المستندات المطلوبة (عامة)\n• جواز سفر ساري لأكثر من 6 أشهر\n• خطاب دعوة من جهة ليبية موثقة\n• صور شخصية\n• كشف حساب بنكي\n• سيرة ذاتية (لبعض الحالات)\n• وثائق النشاط التجاري (للأعمال)\n\n## ملاحظة هامة\nنظراً للوضع الخاص في ليبيا، يتم تقدير السعر والمتطلبات بعد دراسة كل حالة على حدة. تواصل معنا للاستشارة المجانية.",
    contentEn:"## Libya Visa and Entry Permit\n\nLibya is in a phase of gradual reopening, with business and visit activity increasing steadily. We offer two separate services for Tripoli and Benghazi.\n\n## Libya Visa — Tripoli\n→ Issued through Libyan embassies abroad\n→ Requires official invitation from a Libyan entity\n→ Required documents vary by nationality\n\n## Entry Permit — Benghazi and Eastern Libya\nBenghazi and eastern Libya are under different authority from Tripoli, requiring a special entry permit.\n\n## Who We Serve\n• Business people traveling to Libya\n• Former residents wishing to return\n• Companies wanting to explore Libyan opportunities\n• Family visits\n\n## Required Documents (General)\n• Passport valid more than 6 months\n• Invitation letter from a documented Libyan entity\n• Personal photos\n• Bank statement\n• CV/Resume for some cases\n• Business documents for business visits\n\n## Important Note\nDue to Libya's special situation, price and requirements are assessed after studying each case individually. Contact us for a free consultation." },

  { id:"visa-algeria", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة الجزائر — ثالث أكبر دول أفريقيا",
    titleEn:"Algeria Visa — Africa's Third Largest Country",
    excerptAr:"تأشيرة الجزائر للسياحة والأعمال. إجراءات واضحة ومواقع سياحية استثنائية تشمل الصحراء الكبرى.",
    excerptEn:"Algeria visa for tourism and business. Clear procedures and exceptional tourist sites including the Sahara Desert.",
    contentAr:"## تأشيرة الجزائر\n\nالجزائر هي ثالث أكبر دول أفريقيا مساحةً وتمتلك تنوعاً جغرافياً وثقافياً استثنائياً من البحر المتوسط إلى الصحراء الكبرى.\n\n## أنواع التأشيرات\n→ تأشيرة سياحية: للزيارات السياحية\n→ تأشيرة أعمال: للاجتماعات والمعارض التجارية\n→ تأشيرة عائلية: لزيارة الأقارب المقيمين في الجزائر\n→ تأشيرة طبية\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة طلب مكتملة باللغة الفرنسية أو العربية\n• صورتان شخصيتان\n• تذاكر سفر ذهاب وعودة\n• حجز فندق مؤكد أو وثيقة دعوة موثقة\n• كشف حساب بنكي لـ 3 أشهر\n• وثيقة التأمين الصحي\n• خطاب عمل أو وثيقة تجارية (للأعمال)\n\n## أبرز المعالم السياحية\n→ تيمقاد: المدينة الرومانية الأثرية\n→ جانت: بوابة الصحراء الكبرى\n→ القصبة: قلب الجزائر العاصمة التاريخي\n→ قسنطينة: مدينة الجسور المعلقة\n\n## الرسوم\n$ رسوم التأشيرة: تختلف حسب الجنسية والنوع\n⏱ مدة المعالجة: 5-15 يوم عمل",
    contentEn:"## Algeria Visa\n\nAlgeria is Africa's third largest country with exceptional geographical and cultural diversity from the Mediterranean to the Sahara Desert.\n\n## Visa Types\n→ Tourist visa: for tourism\n→ Business visa: for meetings and trade fairs\n→ Family visa: for visiting relatives in Algeria\n→ Medical visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Completed application form in French or Arabic\n• Two personal photos\n• Return flight tickets\n• Confirmed hotel booking or notarized invitation\n• Bank statement for 3 months\n• Health insurance document\n• Work letter or business document for business visa\n\n## Top Tourist Attractions\n→ Timgad: Roman archaeological city\n→ Djanet: gateway to the Sahara Desert\n→ Casbah: historic heart of Algiers\n→ Constantine: city of hanging bridges\n\n## Fees\n$ Visa fees: vary by nationality and type\n⏱ Processing time: 5-15 business days" },

  { id:"visa-morocco", category:"visa", featured:false, date:"2026-06-01", readTime:5,
    titleAr:"تأشيرة المغرب — بوابة أفريقيا على الأطلسي",
    titleEn:"Morocco Visa — Africa's Atlantic Gateway",
    excerptAr:"المغرب وجهة سياحية رائعة بدون تأشيرة لكثير من العرب. مراكش، فاس، الرباط وشواطئ المحيط.",
    excerptEn:"Morocco is a wonderful destination without a visa for many Arabs. Marrakech, Fes, Rabat and ocean beaches.",
    contentAr:"## تأشيرة المغرب\n\nيتميز المغرب بأنه وجهة معفاة من التأشيرة لكثير من الجنسيات العربية، مما يجعله وجهة مثالية للسياحة والأعمال في شمال أفريقيا.\n\n## من لا يحتاج تأشيرة؟\nمعظم الجنسيات العربية تدخل المغرب بدون تأشيرة لمدة تتراوح بين 30 و90 يوماً بموجب الاتفاقيات الثنائية.\n\n## من يحتاج تأشيرة؟\nبعض الجنسيات غير المعفاة تحتاج إلى تقديم طلب تأشيرة مسبق عبر السفارات المغربية.\n\n## أنواع التأشيرات\n→ تأشيرة سياحية (مدة شهر)\n→ تأشيرة أعمال (مدة 3 أشهر)\n→ تصريح الإقامة: للمقيمين طويل الأمد\n\n## المستندات المطلوبة (للجنسيات التي تحتاج تأشيرة)\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة طلب\n• صور شخصية\n• تذاكر ذهاب وعودة\n• حجز فندق\n• كشف حساب بنكي\n\n## أبرز الوجهات في المغرب\n→ مراكش: المدينة الحمراء الساحرة\n→ فاس: عاصمة التراث والحضارة الإسلامية\n→ الرباط: العاصمة الحديثة\n→ الدار البيضاء: المركز الاقتصادي\n→ أكادير: شاطئ المحيط الأطلسي\n\n## الرسوم\n$ تأشيرة سياحية: 20-40 يورو\n⏱ مدة المعالجة: 5-10 أيام",
    contentEn:"## Morocco Visa\n\nMorocco stands out as a visa-exempt destination for many Arab nationalities, making it an ideal destination for tourism and business in North Africa.\n\n## Who Doesn't Need a Visa?\nMost Arab nationalities enter Morocco without a visa for 30 to 90 days under bilateral agreements.\n\n## Who Needs a Visa?\nSome non-exempt nationalities need to apply for a prior visa through Moroccan embassies.\n\n## Visa Types\n→ Tourist visa (1 month)\n→ Business visa (3 months)\n→ Residency permit: for long-term residents\n\n## Required Documents (for nationalities needing visa)\n• Passport valid more than 6 months\n• Application form\n• Personal photos\n• Return flight tickets\n• Hotel booking\n• Bank statement\n\n## Top Destinations in Morocco\n→ Marrakech: the magical red city\n→ Fes: capital of Islamic heritage and civilization\n→ Rabat: the modern capital\n→ Casablanca: economic center\n→ Agadir: Atlantic Ocean beach\n\n## Fees\n$ Tourist visa: €20-40\n⏱ Processing time: 5-10 days" },

  { id:"visa-uae", category:"visa", featured:true, date:"2026-06-01", readTime:8,
    titleAr:"تأشيرة الإمارات العربية المتحدة — الدليل الكامل 2026",
    titleEn:"UAE Visa — Complete Guide 2026",
    excerptAr:"دبي وأبوظبي تستقبلان العالم. تأشيرات متعددة من السياحة للإقامة الذهبية. نساعدك تحصل على أنسبها.",
    excerptEn:"Dubai and Abu Dhabi welcome the world. Multiple visas from tourism to Golden Residency. We help you get the right one.",
    contentAr:"## تأشيرة الإمارات — مركز العالم\n\nتُعد الإمارات العربية المتحدة واحدة من أكثر الدول ترحيباً بالزوار والمقيمين في العالم، وتوفر مجموعة واسعة من خيارات التأشيرات.\n\n## أنواع التأشيرات المتاحة\n→ تأشيرة سياحية 30 يوم: للزيارة السياحية قصيرة\n→ تأشيرة سياحية 60 يوم: للإقامة المتوسطة\n→ تأشيرة 90 يوم متعددة الدخول: للتنقل المتكرر\n→ تأشيرة زيارة لمرة واحدة (14 يوم): للعبور والزيارات السريعة\n→ الإقامة الذهبية (5 أو 10 سنوات): للمستثمرين والكفاءات\n→ تأشيرة العمل: مرتبطة بصاحب العمل\n→ تأشيرة الإقامة الذاتية للعمل الحر\n\n## التأشيرة الإلكترونية الإماراتية\nيمكن الحصول على التأشيرة بالكامل إلكترونياً عبر ICP.gov.ae أو مطارات دبي أو شركات السفر المعتمدة.\n\n## المستندات المطلوبة (سياحة)\n• جواز سفر ساري لأكثر من 6 أشهر\n• صورة شخصية خلفية بيضاء\n• حجز طيران\n• حجز فندقي أو دعوة\n• كشف حساب بنكي\n\n## الإقامة الذهبية\n• للمستثمرين بعقار أو شركة\n• للكفاءات الاستثنائية (أطباء، مهندسون، علماء)\n• للطلاب المتفوقين\n• للرياضيين والمبدعين\n\n## الرسوم التقريبية\n$ تأشيرة 30 يوم: 150-200 درهم\n$ تأشيرة 60 يوم: 300-400 درهم\n$ تأشيرة 90 يوم متعددة: 500-700 درهم\n⏱ مدة المعالجة: 3-5 أيام عمل",
    contentEn:"## UAE Visa — Center of the World\n\nThe UAE is one of the world's most welcoming countries for visitors and residents, offering a wide range of visa options.\n\n## Available Visa Types\n→ 30-day tourist visa: for short tourism\n→ 60-day tourist visa: for medium stays\n→ 90-day multiple-entry visa: for frequent travel\n→ Single-entry visit visa (14 days): for transit and quick visits\n→ Golden Residency (5 or 10 years): for investors and talents\n→ Work visa: tied to employer\n→ Self-employment residency visa\n\n## UAE Electronic Visa\nVisas can be obtained entirely online via ICP.gov.ae, Dubai airports or approved travel agencies.\n\n## Required Documents (Tourism)\n• Passport valid more than 6 months\n• Personal photo with white background\n• Flight booking\n• Hotel booking or invitation\n• Bank statement\n\n## Golden Residency\n• For investors with real estate or company\n• For exceptional talents (doctors, engineers, scientists)\n• For outstanding students\n• For athletes and creatives\n\n## Approximate Fees\n$ 30-day visa: AED 150-200\n$ 60-day visa: AED 300-400\n$ 90-day multiple: AED 500-700\n⏱ Processing time: 3-5 business days" },

  { id:"visa-saudi-tourism", category:"visa", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأشيرة المملكة السعودية — سياحية 2026",
    titleEn:"Saudi Arabia Visa — Tourism 2026",
    excerptAr:"المملكة تفتح أبوابها للسياحة. اكتشف الرياض وجدة والعلا والأحساء بتأشيرة سياحية سهلة.",
    excerptEn:"Saudi Arabia opens its doors to tourism. Discover Riyadh, Jeddah, AlUla and Al Ahsa with an easy tourist visa.",
    contentAr:"## التأشيرة السياحية السعودية\n\nأطلقت المملكة العربية السعودية برنامجها السياحي في إطار رؤية 2030، وأصبحت تأشيرة السياحة متاحة لأكثر من 49 جنسية بسهولة عبر الإنترنت.\n\n## كيف تحصل على التأشيرة؟\n→ موقع visitsaudi.com: الأسرع والأسهل\n→ تطبيق Nusuk: للحجوزات السياحية المتكاملة\n→ عند الوصول: متاحة في المطارات الدولية لبعض الجنسيات\n\n## مزايا التأشيرة السياحية\n• صالحة سنة كاملة\n• تتيح إقامة 90 يوماً إجمالياً\n• دخول متعدد\n• تشمل أداء العمرة (رمضان وغيره) للجنسيات المؤهلة\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صورة شخصية\n• حجز طيران\n• تأمين سفر\n• كشف حساب بنكي (أحياناً)\n\n## أبرز المعالم\n→ الرياض: المركز العمراني الضخم وسوق الأحد\n→ جدة: كورنيش البحر الأحمر والبلد التاريخي\n→ العلا: مدائن صالح الأثرية (تراث يونسكو)\n→ الأحساء: أكبر واحة نخيل في العالم (تراث يونسكو)\n→ نيوم وذا لاين: مشاريع المستقبل\n\n## الرسوم\n$ التأشيرة السياحية: 300 ريال سعودي (80 دولار تقريباً)\n$ تشمل تأمين صحي إلزامي\n⏱ مدة المعالجة: فورية إلى 3 أيام",
    contentEn:"## Saudi Arabia Tourist Visa\n\nSaudi Arabia launched its tourism program under Vision 2030, and tourist visas are now easily available online for over 49 nationalities.\n\n## How to Get the Visa?\n→ visitsaudi.com: fastest and easiest\n→ Nusuk app: for integrated tourism bookings\n→ On arrival: available at international airports for some nationalities\n\n## Tourist Visa Benefits\n• Valid for a full year\n• Allows 90 days total stay\n• Multiple entries\n• Includes Umrah (Ramadan and other times) for eligible nationalities\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photo\n• Flight booking\n• Travel insurance\n• Bank statement (sometimes)\n\n## Top Attractions\n→ Riyadh: massive urban center and Sunday market\n→ Jeddah: Red Sea corniche and historic district\n→ AlUla: Hegra archaeological site (UNESCO heritage)\n→ Al Ahsa: world's largest palm oasis (UNESCO heritage)\n→ NEOM and The Line: future projects\n\n## Fees\n$ Tourist visa: SAR 300 (approximately $80)\n$ Includes mandatory health insurance\n⏱ Processing time: instant to 3 days" },

  { id:"visa-saudi-business", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة المملكة السعودية — تجارية سنة",
    titleEn:"Saudi Arabia Visa — Annual Business",
    excerptAr:"تأشيرة أعمال سنوية متعددة الدخول للسعودية. مناسبة للمستثمرين ورجال الأعمال وأصحاب العقود.",
    excerptEn:"Annual multiple-entry business visa for Saudi Arabia. Suitable for investors, businessmen and contract holders.",
    contentAr:"## التأشيرة التجارية السعودية السنوية\n\nتُعد التأشيرة التجارية السنوية الحل الأمثل لرجال الأعمال والمستثمرين الذين يترددون على المملكة بشكل منتظم.\n\n## مميزات التأشيرة التجارية\n• صالحة سنة كاملة\n• دخول متعدد\n• إقامة حتى 90 يوماً في كل زيارة\n• تشمل حضور المؤتمرات والمعارض وإجراء الصفقات\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• خطاب دعوة من شركة سعودية مسجلة\n• السجل التجاري للشركة الداعية\n• بطاقة الهوية التجارية للشركة السعودية\n• كشف حساب تجاري للشركة المتقدمة\n• خطاب مصرح من صاحب العمل\n• صور شخصية\n• تأمين سفر شامل\n\n## قطاعات الأعمال الرئيسية في السعودية\n→ النفط والطاقة والمقاولات\n→ التكنولوجيا والاتصالات\n→ السياحة والضيافة\n→ الرعاية الصحية والدوائية\n→ التعليم والتدريب\n\n## الرسوم\n$ تأشيرة تجارية سنوية: 500-1000 ريال تقريباً\n⏱ مدة المعالجة: 5-15 يوم عمل",
    contentEn:"## Saudi Arabia Annual Business Visa\n\nThe annual business visa is the ideal solution for businessmen and investors who travel to Saudi Arabia regularly.\n\n## Business Visa Features\n• Valid for a full year\n• Multiple entries\n• Stay up to 90 days per visit\n• Includes attending conferences, exhibitions and conducting deals\n\n## Required Documents\n• Passport valid more than 6 months\n• Invitation letter from a registered Saudi company\n• Commercial registration of the inviting company\n• Commercial ID of the Saudi company\n• Commercial bank statement of the applying company\n• Authorized letter from employer\n• Personal photos\n• Comprehensive travel insurance\n\n## Key Business Sectors in Saudi Arabia\n→ Oil, energy and contracting\n→ Technology and communications\n→ Tourism and hospitality\n→ Healthcare and pharmaceuticals\n→ Education and training\n\n## Fees\n$ Annual business visa: approximately SAR 500-1000\n⏱ Processing time: 5-15 business days" },

  { id:"visa-qatar", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة قطر — الدوحة والخليج المتطور",
    titleEn:"Qatar Visa — Doha and the Developed Gulf",
    excerptAr:"قطر وجهة خليجية متطورة تشهد نمواً استثمارياً غير مسبوق. تأشيرة سهلة وإجراءات رقمية متطورة.",
    excerptEn:"Qatar is a sophisticated Gulf destination experiencing unprecedented investment growth. Easy visa and advanced digital procedures.",
    contentAr:"## تأشيرة قطر\n\nاستمراراً لنجاح كأس العالم 2022، طورت قطر منظومتها السياحية والاستثمارية بشكل كبير وأصبحت إجراءات التأشيرة أكثر سهولة.\n\n## من يدخل بدون تأشيرة؟\nأكثر من 95 جنسية تدخل قطر بدون تأشيرة لمدة تتراوح بين 30 و90 يوماً. كثير من الجنسيات العربية مشمولة.\n\n## أنواع التأشيرات\n→ eVisa: متاحة إلكترونياً عبر موقع قطر القطرية\n→ Hayya Card: نظام دخول خاص للزيارات الكبرى\n→ تأشيرة الأعمال: للزيارات التجارية\n→ تأشيرة عبور (Transit): حتى 96 ساعة\n→ الإقامة طويلة الأمد: للمقيمين بالعمل أو الاستثمار\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صورة شخصية\n• حجز فندقي مؤكد\n• تذاكر ذهاب وعودة\n• كشف حساب بنكي\n• تأمين سفر\n\n## أبرز معالم قطر\n→ متحف الفن الإسلامي — تحفة معمارية عالمية\n→ سوق واقف — تجربة تراثية خليجية أصيلة\n→ اللؤلؤة قطر — جزيرة اصطناعية راقية\n→ الكورنيش الدوحة\n\n## الرسوم\n$ eVisa سياحية: 200 ريال قطري\n⏱ مدة المعالجة: 3-4 أيام عمل",
    contentEn:"## Qatar Visa\n\nContinuing the success of FIFA World Cup 2022, Qatar has greatly developed its tourism and investment ecosystem, making visa procedures much easier.\n\n## Who Enters Without a Visa?\nMore than 95 nationalities enter Qatar without a visa for 30 to 90 days. Many Arab nationalities are included.\n\n## Visa Types\n→ eVisa: available electronically via Qatar Airways website\n→ Hayya Card: special entry system for major events\n→ Business visa: for commercial visits\n→ Transit visa: up to 96 hours\n→ Long-term residency: for work or investment residents\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photo\n• Confirmed hotel booking\n• Return flight tickets\n• Bank statement\n• Travel insurance\n\n## Top Qatar Attractions\n→ Museum of Islamic Art — world architectural masterpiece\n→ Souq Waqif — authentic Gulf heritage experience\n→ The Pearl-Qatar — upscale artificial island\n→ Doha Corniche\n\n## Fees\n$ Tourist eVisa: QAR 200\n⏱ Processing time: 3-4 business days" },

  { id:"visa-umrah", category:"visa", featured:true, date:"2026-06-01", readTime:8,
    titleAr:"برنامج عمرة — الخدمة المتكاملة",
    titleEn:"Umrah Program — Complete Service Package",
    excerptAr:"نؤمن لك تأشيرة العمرة وتذاكر الطيران والفنادق المريحة في مكة والمدينة. رحلة روحية مريحة ومنظمة.",
    excerptEn:"We arrange your Umrah visa, flights and comfortable hotels in Mecca and Medina. A comfortable and organized spiritual journey.",
    contentAr:"## برنامج العمرة المتكامل\n\nالعمرة رحلة روحية عميقة الأثر في القلوب، ونحرص على أن تكون تجربتك مريحة ومنظمة تتيح لك التفرغ الكامل للعبادة والذكر.\n\n## ما يشمله البرنامج\n• استخراج تأشيرة العمرة بشكل كامل\n• حجز تذاكر الطيران من بلدك إلى جدة أو المدينة\n• فندق مريح في مكة المكرمة (قريب من الحرم)\n• فندق مريح في المدينة المنورة (قريب من المسجد النبوي)\n• نقل من المطار وبين المدينتين\n• مرشد عمرة معتمد (خياري)\n\n## متطلبات تأشيرة العمرة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صور شخصية بمواصفات السفارة\n• تطعيم الباسيل (الحمى الشوكية) — إلزامي\n• للمرأة: وجود محرم أو إثبات الجماعة النسائية\n• للمرأة تحت 45 سنة: يُشترط السفر مع محرم\n\n## الأوقات المفضلة للعمرة\n→ رمضان: الأعلى أجراً والأكثر روحانية\n→ العشر الأواخر من رمضان: المكانة الاستثنائية\n→ محرم وصفر: أقل ازدحاماً وأسعار معتدلة\n→ شعبان وربيع الأول: توازن بين الروحانية والأسعار\n\n## مستويات البرامج\n→ الاقتصادي: فنادق معقولة على بُعد أكثر من الحرم\n→ المتوسط: فنادق 4 نجوم على بُعد مناسب\n→ الفاخر: فنادق 5 نجوم مطلة على الكعبة\n\n## السعر\nيختلف حسب انطلاق الرحلة وعدد الأفراد والمستوى المطلوب. تواصل معنا للحصول على عرض مخصص.",
    contentEn:"## Complete Umrah Program\n\nUmrah is a deeply spiritual journey that touches hearts, and we ensure your experience is comfortable and organized so you can fully focus on worship and remembrance.\n\n## What's Included\n• Complete Umrah visa processing\n• Flight booking from your country to Jeddah or Medina\n• Comfortable hotel in Mecca (close to Haram)\n• Comfortable hotel in Medina (close to the Prophet's Mosque)\n• Airport and inter-city transfers\n• Certified Umrah guide (optional)\n\n## Umrah Visa Requirements\n• Passport valid more than 6 months\n• Personal photos to embassy specifications\n• Meningitis vaccination — mandatory\n• For women: male guardian (mahram) or proof of women's group travel\n• For women under 45: must travel with mahram\n\n## Best Times for Umrah\n→ Ramadan: highest reward and most spiritual\n→ Last 10 days of Ramadan: exceptional spiritual status\n→ Muharram and Safar: less crowded, moderate prices\n→ Sha'ban and Rabi' Al-Awwal: balance between spirituality and prices\n\n## Program Levels\n→ Economy: reasonable hotels farther from Haram\n→ Standard: 4-star hotels at comfortable distance\n→ Luxury: 5-star hotels overlooking the Kaaba\n\n## Pricing\nVaries by departure location, number of people and required level. Contact us for a customized offer." },

  { id:"visa-turkey", category:"visa", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأشيرة تركيا — سياحية تجارية طبية معارض",
    titleEn:"Turkey Visa — Tourism, Business, Medical, Exhibitions",
    excerptAr:"تركيا وجهة شاملة لكل الأغراض. تأشيرة e-Visa سريعة أو تأشيرة قنصلية متعددة للأعمال والعلاج.",
    excerptEn:"Turkey is a comprehensive destination for all purposes. Fast e-Visa or multiple-entry consulate visa for business and medical.",
    contentAr:"## تأشيرة تركيا — الخيار الشامل\n\nتجمع تركيا بين السياحة الطبيعية والتاريخية والعلاج الطبي المتطور والأعمال التجارية المزدهرة والمعارض الدولية، مما يجعلها وجهة لكل أغراض السفر.\n\n## أنواع التأشيرات التركية\n→ e-Visa الإلكترونية: للسياحة والأعمال — حتى 90 يوماً\n→ تأشيرة قنصلية سياحية: متعددة الدخول\n→ تأشيرة أعمال طويلة الأمد\n→ تأشيرة علاج طبي\n→ تأشيرة المعارض والمؤتمرات\n\n## e-Visa التركية\n• تُطلب عبر evisa.gov.tr\n• تُصدر خلال دقائق إلى ساعات\n• صالحة لمدة 180 يوماً\n• تتيح إقامة 90 يوماً\n• رسومها 50-150 دولار حسب الجنسية\n\n## تأشيرة العلاج الطبي\nتركيا من أبرز وجهات السياحة الطبية في العالم، وتتميز بـ:\n• جراحة الشعر والتجميل\n• زراعة الأسنان\n• العمليات القلبية والمفصلية\n• العلاج الطبيعي وإعادة التأهيل\n\n## تأشيرة المعارض\nيُقام في إسطنبول وأنطاليا مئات المعارض الدولية سنوياً في قطاعات:\n→ النسيج والملبوسات (IEFT)\n→ الأثاث والديكور (IMOB)\n→ الغذاء والزراعة\n→ الطاقة والتكنولوجيا\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة طلب مكتملة\n• كشف حساب بنكي\n• حجز فندق أو دعوة\n• خطاب طبي (لتأشيرة العلاج)\n• دعوة معرض (للمعارض)\n\n## الرسوم\n$ e-Visa: 50-150 دولار حسب الجنسية\n⏱ مدة المعالجة: فورية للـeVisa، 5-10 أيام للقنصلية",
    contentEn:"## Turkey Visa — Comprehensive Option\n\nTurkey combines natural and historical tourism, advanced medical treatment, thriving business and international exhibitions, making it a destination for all travel purposes.\n\n## Types of Turkish Visas\n→ e-Visa (online): for tourism and business — up to 90 days\n→ Consulate tourist visa: multiple entries\n→ Long-term business visa\n→ Medical treatment visa\n→ Exhibition and conference visa\n\n## Turkish e-Visa\n• Applied for at evisa.gov.tr\n• Issued within minutes to hours\n• Valid for 180 days\n• Allows 90-day stay\n• Fees: $50-150 depending on nationality\n\n## Medical Treatment Visa\nTurkey is among the world's top medical tourism destinations, known for:\n• Hair transplant and cosmetic surgery\n• Dental implants\n• Cardiac and joint surgeries\n• Physical therapy and rehabilitation\n\n## Exhibition Visa\nHundreds of international exhibitions are held annually in Istanbul and Antalya in sectors:\n→ Textiles and clothing (IEFT)\n→ Furniture and decor (IMOB)\n→ Food and agriculture\n→ Energy and technology\n\n## Required Documents\n• Passport valid more than 6 months\n• Completed application form\n• Bank statement\n• Hotel booking or invitation\n• Medical letter (for medical visa)\n• Exhibition invitation (for exhibitions)\n\n## Fees\n$ e-Visa: $50-150 depending on nationality\n⏱ Processing time: instant for eVisa, 5-10 days for consulate" },

  { id:"visa-oman", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة سلطنة عُمان — جوهرة الخليج الهادئة",
    titleEn:"Oman Visa — The Gulf's Quiet Gem",
    excerptAr:"سلطنة عُمان وجهة خليجية فريدة بين الجبال والبحار والصحراء. تأشيرة إلكترونية سهلة وترحيب استثنائي.",
    excerptEn:"Oman is a unique Gulf destination between mountains, seas and desert. Easy eVisa and exceptional hospitality.",
    contentAr:"## تأشيرة سلطنة عُمان\n\nتتميز عُمان بطبيعة خلابة ومتنوعة وشعب مرحِّب وتاريخ عريق، وقد طورت منظومتها السياحية بشكل ملحوظ في السنوات الأخيرة.\n\n## من يدخل بدون تأشيرة؟\nمواطنو دول مجلس التعاون الخليجي يدخلون عُمان بدون تأشيرة. كثير من الجنسيات العربية تدخل بدون تأشيرة لمدة 30 يوماً.\n\n## أنواع التأشيرات\n→ eVisa: إلكترونية عبر evisa.rop.gov.om\n→ تأشيرة عند الوصول: في المطارات الدولية لبعض الجنسيات\n→ تأشيرة متعددة الدخول: لمدة سنة\n→ تأشيرة عبور: حتى 4 أيام\n\n## أنواع التأشيرات الإلكترونية\n→ تأشيرة لمدة 10 أيام\n→ تأشيرة لمدة 30 يوماً — الأكثر طلباً\n→ تأشيرة سنوية متعددة الدخول\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صورة شخصية رقمية\n• حجز فندق\n• تذاكر ذهاب وعودة\n• تأمين سفر\n\n## أبرز الوجهات في عُمان\n→ مسقط: العاصمة الهادئة والراقية\n→ نزوى: قلعة عُمان التاريخية\n→ صلالة: الطبيعة الاستوائية وشلالات الخريف\n→ مسندم: فيوردات الخليج\n→ الوهيبة: صحراء ساحرة\n\n## الرسوم\n$ تأشيرة 30 يوم: 20 ريال عُماني\n$ تأشيرة سنوية: 50 ريال عُماني\n⏱ مدة المعالجة: 24-72 ساعة",
    contentEn:"## Oman Visa\n\nOman is distinguished by stunning and diverse nature, welcoming people and rich history, and has significantly developed its tourism ecosystem in recent years.\n\n## Who Enters Without a Visa?\nGCC citizens enter Oman without a visa. Many Arab nationalities enter without a visa for 30 days.\n\n## Visa Types\n→ eVisa: online at evisa.rop.gov.om\n→ Visa on Arrival: at international airports for some nationalities\n→ Multiple-entry visa: for 1 year\n→ Transit visa: up to 4 days\n\n## Electronic Visa Types\n→ 10-day visa\n→ 30-day visa — most requested\n→ Annual multiple-entry visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Digital personal photo\n• Hotel booking\n• Return flight tickets\n• Travel insurance\n\n## Top Oman Destinations\n→ Muscat: quiet and elegant capital\n→ Nizwa: historic Omani fort\n→ Salalah: tropical nature and Khareef waterfalls\n→ Musandam: Gulf fjords\n→ Wahiba Sands: magical desert\n\n## Fees\n$ 30-day visa: OMR 20\n$ Annual visa: OMR 50\n⏱ Processing time: 24-72 hours" },

  { id:"visa-kuwait", category:"visa", featured:false, date:"2026-06-01", readTime:6,
    titleAr:"تأشيرة الكويت — قلب الخليج التجاري",
    titleEn:"Kuwait Visa — The Commercial Heart of the Gulf",
    excerptAr:"الكويت مركز تجاري خليجي بارز. تأشيرة للزيارات التجارية والسياحية مع إجراءات رقمية متطورة.",
    excerptEn:"Kuwait is a prominent Gulf commercial center. Visa for business and tourism visits with advanced digital procedures.",
    contentAr:"## تأشيرة الكويت\n\nتُعد الكويت من أغنى دول العالم بالنسبة للفرد، وتشهد حركة تجارية وأعمال نشطة مما يجعلها وجهة مهمة لرجال الأعمال في المنطقة.\n\n## من يدخل بدون تأشيرة؟\nمواطنو دول مجلس التعاون الخليجي يدخلون الكويت بدون تأشيرة. بعض الجنسيات العربية مشمولة باتفاقيات الإعفاء.\n\n## أنواع التأشيرات\n→ eVisa الكويت: عبر البوابة الإلكترونية visa.e.gov.kw\n→ تأشيرة عند الوصول: لبعض الجنسيات في مطار الكويت\n→ تأشيرة أعمال قابلة للتجديد\n→ تأشيرة عائلية\n\n## مدد التأشيرات المتاحة\n→ تأشيرة مفردة: حتى 30 يوم\n→ تأشيرة متعددة 3 أشهر\n→ تأشيرة متعددة 6 أشهر\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• صورة شخصية\n• حجز فندق مؤكد أو خطاب دعوة\n• تذاكر ذهاب وعودة\n• كشف حساب بنكي لـ 3 أشهر\n• تأمين سفر\n• خطاب عمل للأعمال\n\n## أبرز مناطق الكويت\n→ برج الكويت وسوق المباركية\n→ الأفنيوز — أحد أكبر مراكز التسوق في الشرق الأوسط\n→ السيف — المنطقة البحرية الجميلة\n\n## الرسوم\n$ eVisa مفردة: 10-15 دينار كويتي\n⏱ مدة المعالجة: 3-7 أيام عمل",
    contentEn:"## Kuwait Visa\n\nKuwait is one of the world's wealthiest countries per capita and has active commercial and business activity, making it an important destination for regional businessmen.\n\n## Who Enters Without a Visa?\nGCC citizens enter Kuwait without a visa. Some Arab nationalities are covered by exemption agreements.\n\n## Visa Types\n→ Kuwait eVisa: via visa.e.gov.kw portal\n→ Visa on Arrival: for some nationalities at Kuwait Airport\n→ Renewable business visa\n→ Family visa\n\n## Available Visa Durations\n→ Single entry: up to 30 days\n→ Multiple entry 3 months\n→ Multiple entry 6 months\n\n## Required Documents\n• Passport valid more than 6 months\n• Personal photo\n• Confirmed hotel booking or invitation letter\n• Return flight tickets\n• Bank statement for 3 months\n• Travel insurance\n• Work letter for business visits\n\n## Top Kuwait Areas\n→ Kuwait Towers and Al-Mubarakiyah Souq\n→ The Avenues — one of the largest malls in the Middle East\n→ Seif — beautiful waterfront area\n\n## Fees\n$ Single eVisa: KWD 10-15\n⏱ Processing time: 3-7 business days" },

  { id:"visa-japan", category:"visa", featured:true, date:"2026-06-01", readTime:8,
    titleAr:"تأشيرة اليابان — الدليل الكامل للعرب 2026",
    titleEn:"Japan Visa — Complete Arabic Guide 2026",
    excerptAr:"اليابان وجهة حلم لملايين العرب. نساعدك تحضر ملفاً متكاملاً يرفع نسبة قبول طلبك إلى أعلى مستوى.",
    excerptEn:"Japan is a dream destination for millions of Arabs. We help you prepare a comprehensive file that maximizes your approval chances.",
    contentAr:"## تأشيرة اليابان — وجهة الأحلام\n\nتُعد اليابان من أكثر الوجهات التي يحلم بها المسافرون العرب بسبب ثقافتها الفريدة وطبيعتها الخلابة وتكنولوجيتها المتطورة.\n\n## أنواع التأشيرات اليابانية\n→ تأشيرة سياحية مفردة: للزيارة السياحية\n→ تأشيرة متعددة 3 سنوات: لمن سبق له الزيارة\n→ تأشيرة متعددة 5 سنوات: لمن له تاريخ سفر قوي\n→ تأشيرة أعمال\n→ تأشيرة طبية\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر\n• استمارة طلب مكتملة بدقة\n• صورة شخصية 4.5×4.5 سم حديثة\n• جدول رحلة تفصيلي يوم بيوم\n• حجوزات فندقية مؤكدة (قابلة للاسترداد)\n• تذاكر طيران ذهاباً وإياباً\n• كشف حساب بنكي لآخر 3-6 أشهر (مُصدَّق)\n• خطاب بنكي يُثبت القدرة المالية\n• وثائق تُثبت الوضع الوظيفي (خطاب عمل، تصريح إقامة)\n• تأمين سفر شامل\n\n## الأسباب الشائعة للرفض\n• كشف حساب ضعيف أو غير كافٍ\n• جدول رحلة غير منطقي أو منقوص\n• عدم التطابق بين الملف وسبب الزيارة\n• تاريخ رفض سابق دون معالجة المشكلة\n\n## نصائح مهمة من خبرتنا\n• احرص على رصيد بنكي مستقر على مدى 3 أشهر على الأقل\n• جهّز جدول رحلة واقعياً ومفصلاً\n• احجز فنادق قابلة للإلغاء مجاناً\n• قدّم الطلب قبل الرحلة بـ 6-8 أسابيع على الأقل\n\n## أبرز الوجهات في اليابان\n→ طوكيو: المدينة المستقبلية\n→ كيوتو: معابد وحدائق تقليدية\n→ أوساكا: جنة الطعام\n→ هوكايدو: الطبيعة الجبلية والثلوج\n\n## الرسوم\n$ رسوم التأشيرة: 3,000 ين ياباني\n⏱ مدة المعالجة: 5-10 أيام عمل",
    contentEn:"## Japan Visa — Dream Destination\n\nJapan is one of the most dreamed-about destinations for Arab travelers due to its unique culture, stunning nature and advanced technology.\n\n## Types of Japanese Visas\n→ Single-entry tourist visa: for tourism\n→ 3-year multiple-entry: for previous visitors\n→ 5-year multiple-entry: for those with strong travel history\n→ Business visa\n→ Medical visa\n\n## Required Documents\n• Passport valid more than 6 months\n• Accurately completed application form\n• Recent 4.5×4.5cm personal photo\n• Detailed day-by-day itinerary\n• Confirmed hotel bookings (refundable)\n• Return flight tickets\n• Bank statement for last 3-6 months (certified)\n• Bank letter confirming financial capacity\n• Work status documents (work letter, residency permit)\n• Comprehensive travel insurance\n\n## Common Rejection Reasons\n• Weak or insufficient bank statement\n• Illogical or incomplete itinerary\n• Mismatch between file and visit purpose\n• Previous rejection without addressing the issue\n\n## Important Tips from Our Experience\n• Maintain stable bank balance for at least 3 months\n• Prepare a realistic and detailed itinerary\n• Book hotels with free cancellation\n• Apply at least 6-8 weeks before the trip\n\n## Top Destinations in Japan\n→ Tokyo: the city of the future\n→ Kyoto: traditional temples and gardens\n→ Osaka: food paradise\n→ Hokkaido: mountain nature and snow\n\n## Fees\n$ Visa fee: JPY 3,000\n⏱ Processing time: 5-10 business days" },

  { id:"visa-china", category:"visa", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"تأشيرة الصين — فرص لا محدودة في الشرق الأقصى",
    titleEn:"China Visa — Unlimited Opportunities in the Far East",
    excerptAr:"الصين أكبر اقتصاد في العالم وشريك تجاري أساسي. تأشيرة أعمال أو سياحية مع تحضير ملف متكامل.",
    excerptEn:"China is the world's largest economy and a key trade partner. Business or tourist visa with comprehensive file preparation.",
    contentAr:"## تأشيرة الصين\n\nتُعد الصين شريكاً تجارياً حيوياً لكثير من دول العالم العربي، وتشهد أعداداً متزايدة من رجال الأعمال العرب الزائرين لمدنها الصناعية والتجارية.\n\n## أنواع التأشيرات الصينية\n→ L (سياحية): للزيارات السياحية\n→ M (أعمال): لرجال الأعمال والزيارات التجارية\n→ F (تبادل وزيارات): للمؤتمرات والمعارض\n→ X (دراسة): للطلاب\n→ Z (عمل): للعمالة المهنية\n\n## معارض الصين التجارية الكبرى\n→ معرض كانتون (غوانغتشو): أكبر معرض تجاري في العالم — مرتين سنوياً\n→ معرض يوييو (يوييو): مستلزمات البيع بالتجزئة\n→ معرض شنغهاي الدولي: الصناعات الكبرى\n\n## المستندات المطلوبة\n• جواز سفر ساري لأكثر من 6 أشهر مع صفحتين فارغتين على الأقل\n• استمارة طلب مكتملة ومطبوعة\n• صورة شخصية مواصفات محددة\n• تذاكر طيران\n• حجز فندقي\n• خطاب دعوة من الجهة الصينية (للأعمال)\n• تسجيل في المعرض (لتأشيرة المعارض)\n• كشف حساب بنكي\n\n## الإعفاء المتبادل الجديد\nأعلنت الصين مؤخراً إعفاء مواطني عدد من الدول العربية من تأشيرة الدخول لمدة تصل إلى 30 يوماً. تحقق من وضع جنسيتك.\n\n## الرسوم\n$ رسوم التأشيرة: تختلف حسب الجنسية والنوع\n⏱ مدة المعالجة: 4-5 أيام عمل عادةً",
    contentEn:"## China Visa\n\nChina is a vital trade partner for many Arab countries, and increasing numbers of Arab businessmen visit its industrial and commercial cities.\n\n## Types of Chinese Visas\n→ L (Tourist): for tourism\n→ M (Business): for businessmen and commercial visits\n→ F (Exchange and visits): for conferences and exhibitions\n→ X (Study): for students\n→ Z (Work): for professional workers\n\n## China's Major Trade Fairs\n→ Canton Fair (Guangzhou): world's largest trade fair — twice yearly\n→ Yiwu Fair: retail supplies\n→ Shanghai International Fair: major industries\n\n## Required Documents\n• Passport valid more than 6 months with at least 2 blank pages\n• Completed and printed application form\n• Personal photo with specific requirements\n• Flight tickets\n• Hotel booking\n• Invitation letter from Chinese entity (for business)\n• Exhibition registration (for exhibition visa)\n• Bank statement\n\n## New Mutual Visa Exemption\nChina recently announced visa-free entry for citizens of several Arab countries for up to 30 days. Check your nationality's status.\n\n## Fees\n$ Visa fees: vary by nationality and type\n⏱ Processing time: usually 4-5 business days" },


  // ── Travel & Tourism Articles ────────────────────────────────

  { id:"travel-istanbul", category:"travel", featured:true, date:"2026-06-01", readTime:10,
    titleAr:"إسطنبول — مدينة القارتين الساحرة | دليل شامل 2026",
    titleEn:"Istanbul — The Enchanting City of Two Continents | Complete Guide 2026",
    excerptAr:"إسطنبول حيث يلتقي الشرق والغرب. آيا صوفيا والمسجد الأزرق والبسفور وأسواق البهارات — تجربة لا تُنسى في أجمل مدن العالم.",
    excerptEn:"Istanbul where East meets West. Hagia Sophia, Blue Mosque, Bosphorus and Spice Markets — an unforgettable experience in one of the world's most beautiful cities.",
    contentAr:"## إسطنبول — عروس المدائن\n\nتقف إسطنبول عند ملتقى قارتي أوروبا وآسيا، محتضنةً حضارات متعاقبة من الرومان إلى البيزنطيين إلى العثمانيين، مما يجعلها مدينة فريدة في تاريخ البشرية.\n\n## أبرز المعالم السياحية\n\n### منطقة السلطان أحمد (القلب التاريخي)\n• آيا صوفيا: تحفة معمارية بيزنطية-عثمانية لا مثيل لها، تحولت إلى مسجد عام 2020\n• المسجد الأزرق (السلطان أحمد): ذو المآذن الست والبلاط الإزنيقي الأزرق الساحر\n• قصر توبقابي: مقر حكم السلاطين العثمانيين لأربعة قرون وخزائنه الأسطورية\n• الحيبدروم: الملعب البيزنطي العريق والمسلّة المصرية\n\n### أحياء لا تفوتها\n• بازار مصر (سوق البهارات): روائح التوابل والحلوى التركية\n• البازار الكبير: أحد أقدم وأكبر الأسواق المسقوفة في العالم (4,000 محل)\n• بيوغلو وشارع الاستقلال: قلب الحياة الليلية والمطاعم العصرية\n• كاراكوي: الحي الفني العصري على ضفاف البسفور\n• نيشانتاشي: التسوق الراقي والمحلات العالمية\n\n### تجارب البسفور\n• رحلة بحرية على المضيق بين القارتين\n• أورطاكوي: المسجد المطل على البسفور والمأكولات الشعبية\n• كاديكوي: الوجه الآسيوي الحيوي والأسواق الطازجة\n• جزر الأميرات: هروب هادئ من صخب المدينة\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): موسم أزهار الكرز الأتراح في الحدائق العامة وطقس مثالي\n→ الخريف (سبتمبر-نوفمبر): أقل ازدحاماً وأسعار معتدلة وألوان خريفية رائعة\n→ الصيف: الأكثر ازدحاماً والأعلى أسعاراً لكن نشاط لا يتوقف\n→ الشتاء: مناخ بارد وأسعار منخفضة وأجواء رومانسية نادرة\n\n## المأكولات التي لا تفوتها\n• البالق إيكمك: ساندويتش السمك الشهير على ضفاف البسفور\n• الكبدة بالبصل الأسطاصة\n• الباسطرما والسوجوك التركي\n• حلوى الكنافة التركية وبقلاوة غازي عنتاب\n• التشاي التركي في استكانات الزجاج الصغيرة\n• القهوة التركية المطحونة ناعماً\n\n## نصائح عملية\n→ بطاقة إسطنبول (Istanbul Card): للتنقل السهل بالمترو والحافلة والعبّارة\n→ تجنب سيارات الأجرة بدون عداد\n→ الجانب الأوروبي للمعالم التاريخية، الجانب الآسيوي للحياة المحلية الأصيلة\n→ ارتدِ حذاءً مريحاً — المدينة على التلال\n\n## التكاليف التقريبية\n$ فندق 4 نجوم: 80-150 دولار/ليلة\n$ وجبة في مطعم متوسط: 10-20 دولار\n$ رحلة البسفور: 15-25 دولار\n$ البازار الكبير: لا يوجد رسوم دخول",
    contentEn:"## Istanbul — Bride of Cities\n\nIstanbul stands at the meeting point of Europe and Asia, embracing successive civilizations from Romans to Byzantines to Ottomans, making it a unique city in human history.\n\n## Top Tourist Attractions\n\n### Sultanahmet Area (Historic Heart)\n• Hagia Sophia: unmatched Byzantine-Ottoman architectural masterpiece, converted to mosque in 2020\n• Blue Mosque: with six minarets and stunning blue Iznik tiles\n• Topkapi Palace: Ottoman Sultans' seat of power for four centuries with legendary treasures\n• Hippodrome: ancient Byzantine stadium and Egyptian obelisk\n\n### Neighborhoods Not to Miss\n• Egyptian Bazaar (Spice Market): aromas of spices and Turkish sweets\n• Grand Bazaar: one of the world's oldest and largest covered markets (4,000 shops)\n• Beyoglu and Istiklal Street: heart of nightlife and modern restaurants\n• Karakoy: hip artistic neighborhood on Bosphorus banks\n• Nisantasi: upscale shopping and international stores\n\n### Bosphorus Experiences\n• Boat trip across the strait between continents\n• Ortakoy: mosque overlooking Bosphorus and street food\n• Kadikoy: vibrant Asian side with fresh markets\n• Princes Islands: quiet escape from city noise\n\n## Best Times to Visit\n→ Spring (March-May): cherry blossom season and perfect weather\n→ Autumn (September-November): less crowded, moderate prices, wonderful fall colors\n→ Summer: busiest and most expensive but non-stop activity\n→ Winter: cold weather, low prices, rare romantic atmosphere\n\n## Must-Try Foods\n• Balik Ekmek: famous fish sandwich on the Bosphorus\n• Liver with onions (Arnavut Cigeri)\n• Turkish pastrami and sujuk\n• Turkish baklava from Gaziantep\n• Turkish tea in small glass cups\n• Finely ground Turkish coffee\n\n## Practical Tips\n→ Istanbul Card: for easy metro, bus and ferry transport\n→ Avoid taxis without meters\n→ European side for historical monuments, Asian side for authentic local life\n→ Wear comfortable shoes — the city is hilly\n\n## Approximate Costs\n$ 4-star hotel: $80-150/night\n$ Mid-range restaurant meal: $10-20\n$ Bosphorus cruise: $15-25\n$ Grand Bazaar: no entrance fee" },

  { id:"travel-trabzon", category:"travel", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"طرابزون وأوزونغول — جنة تركيا الخضراء على البحر الأسود",
    titleEn:"Trabzon and Uzungol — Turkey's Green Paradise on the Black Sea",
    excerptAr:"طرابزون حيث تلتقي الجبال الخضراء بالبحر الأسود. دير صومعة المعلق وبحيرة أوزونغول الساحرة — طبيعة لا مثيل لها.",
    excerptEn:"Trabzon where green mountains meet the Black Sea. Sumela Monastery and magical Uzungol Lake — unmatched nature.",
    contentAr:"## طرابزون — الجنة الخضراء\n\nتقع طرابزون على ساحل البحر الأسود شمال شرق تركيا، وتشتهر بطبيعتها الخلابة المغطاة بالغابات الخضراء والمناخ الرطب المعتدل.\n\n## دير صومعة (سوميلا)\nمن أبرز معالم طرابزون وتركيا بأسرها:\n• أُسِّس عام 386 ميلادي محفوراً في الصخر على ارتفاع 1,200 متر\n• فسيفساء ولوحات جدارية بيزنطية لا تُقدَّر\n• المنظر من الدير على الغابات يُعدّ من أجمل مناظر تركيا\n• على بُعد 46 كم من مركز طرابزون\n\n## بحيرة أوزونغول\nكلمة أوزونغول تعني بالتركية «البحيرة الطويلة»:\n• بحيرة طبيعية تقع وسط جبال شاهقة وغابات كثيفة\n• ارتفاع 1,090 متر فوق مستوى البحر\n• تحيط بها بيوت خشبية تقليدية وفنادق شلالات\n• في الشتاء تكتسي الثلوج الجبال المحيطة فتتحول إلى لوحة فنية\n• المسجد الصغير في وسط البحيرة من أكثر المناظر تصويراً في تركيا\n\n## معالم أخرى في طرابزون\n→ آيا صوفيا طرابزون: مسجد بيزنطي أقدم من إسطنبول\n→ قلعة طرابزون التاريخية: تُطل على المدينة بأسرها\n→ بحيرة سيرا: بحيرة صغيرة على ارتفاع عالٍ في الجبال\n→ الميدان: الساحة الرئيسية في قلب المدينة\n\n## رياضات وأنشطة\n• التجوال في مسارات الغابات\n• ركوب الخيل في أوزونغول\n• التزلج في Kartepe وقريباً من طرابزون\n• الاستمتاع بالشلالات المتعددة\n\n## أفضل أوقات الزيارة\n→ الربيع (إبريل-يونيو): الطبيعة في أزهى حللها\n→ الصيف (يوليو-أغسطس): الهروب من حر المدن\n→ الخريف (سبتمبر-أكتوبر): ألوان الخريف الذهبية\n→ الشتاء (ديسمبر-فبراير): المناظر الثلجية الساحرة\n\n## المأكولات المحلية\n• مدقوقة البيض والزبدة في طبق النحاس\n• خبز الذرة (Misir Ekmeği)\n• حمسي (سمك الأنشوجة المقلي)\n• مربى الحور الذهبي\n\n## التكاليف التقريبية\n$ فندق في أوزونغول: 60-120 دولار/ليلة\n$ وجبة محلية: 8-15 دولار\n$ تذكرة دير صومعة: 15 دولار",
    contentEn:"## Trabzon — The Green Paradise\n\nTrabzon sits on Turkey's Black Sea coast in the northeast, famous for its stunning nature covered with green forests and mild humid climate.\n\n## Sumela Monastery\nOne of Trabzon's and Turkey's most prominent attractions:\n• Founded in 386 AD carved into rock at 1,200 meters elevation\n• Priceless Byzantine mosaics and murals\n• View from monastery over forests is one of Turkey's most beautiful\n• 46 km from Trabzon center\n\n## Uzungol Lake\nUzungol means 'Long Lake' in Turkish:\n• Natural lake surrounded by towering mountains and dense forests\n• 1,090 meters above sea level\n• Surrounded by traditional wooden houses and waterfall hotels\n• In winter snow covers surrounding mountains creating a painting\n• Small mosque in the middle of the lake is one of Turkey's most photographed views\n\n## Other Trabzon Attractions\n→ Trabzon Hagia Sophia: Byzantine mosque older than Istanbul's\n→ Trabzon Historical Castle: overlooks the entire city\n→ Sera Lake: small lake at high mountain altitude\n→ Meydan: main square in city center\n\n## Sports and Activities\n• Forest trail walking\n• Horse riding in Uzungol\n• Skiing in Kartepe and near Trabzon\n• Enjoying numerous waterfalls\n\n## Best Times to Visit\n→ Spring (April-June): nature at its most beautiful\n→ Summer (July-August): escape from city heat\n→ Autumn (September-October): golden autumn colors\n→ Winter (December-February): magical snowy landscapes\n\n## Approximate Costs\n$ Hotel in Uzungol: $60-120/night\n$ Local meal: $8-15\n$ Sumela Monastery ticket: $15" },

  { id:"travel-antalya", category:"travel", featured:false, date:"2026-06-01", readTime:8,
    titleAr:"أنطاليا — اللؤلؤة الفيروزية للمتوسط | دليل 2026",
    titleEn:"Antalya — The Turquoise Pearl of the Mediterranean | Guide 2026",
    excerptAr:"أنطاليا الشواطئ الفيروزية والمدينة العتيقة وآثار ليكيا الرومانية. الوجهة الأولى في تركيا للشمس والبحر والتاريخ.",
    excerptEn:"Antalya turquoise beaches, old city and Lycian-Roman ruins. Turkey's top destination for sun, sea and history.",
    contentAr:"## أنطاليا — لؤلؤة البحر المتوسط\n\nتحتل أنطاليا المرتبة الأولى بين أكثر المدن التركية زيارةً من الأجانب، وتمزج بين آلاف السنين من التاريخ وأجمل شواطئ المتوسط.\n\n## الكاليتشي (المدينة القديمة)\n• الحي التاريخي المسوّر بأسوار رومانية وسلجوقية وعثمانية\n• مرسى يخوت ساحر محاط بالمطاعم والمقاهي\n• منارة يفلي الأنيقة الشعار الأبرز لأنطاليا\n• بوابة هادريان الرومانية (130 ميلادي)\n• شوارع مرصوفة بالحجارة ومحلات الحرف اليدوية\n\n## الشواطئ الأسطورية\n→ شاطئ كونيالتي: شاطئ المدينة الرئيسي بالحصى الأزرق\n→ شاطئ لارا: 12 كم من الرمال الذهبية وفنادق الأول في العالم\n→ شاطئ كيمير: أكثر الشواطئ التركية جمالاً\n→ شاطئ غضبة (غوينوك): تحيط به الجبال مباشرة\n→ كونياك والسياحة الريفية في القرى الجبلية\n\n## الآثار والمتاحف\n• متحف أنطاليا: من أغنى المتاحف بالآثار الرومانية والإغريقية في العالم\n• بيرج: مدينة رومانية على بُعد 60 كم تضم مسرحاً يتسع لـ 15,000 شخص\n• أسبندوس: أفضل المدرجات الرومانية المحفوظة في العالم\n• شلالات دودن: شلالات تنحدر مباشرة في البحر المتوسط\n• غار أياديني الرائع\n\n## الأنشطة المائية\n• ركوب الجت سكي والموز المائي\n• رياضة الغوص في مياه المتوسط الشفافة\n• رحلات القوارب إلى خلجان لا يمكن الوصول إليها براً\n• الكانوي بين الصخور\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): طقس مثالي وأسعار معتدلة\n→ الصيف (يونيو-أغسطس): موسم الذروة، حار وصاخب لكن لا ينام\n→ الخريف (سبتمبر-أكتوبر): شمس لطيفة وبحر دافئ وأسعار أقل\n\n## المأكولات الخاصة\n• كفتة أنطاليا (Et)\n• شوربة التفاح الطازجة\n• تِرِم (فطيرة بالجبن والبيض)\n• الطازة — عصير الرمان الطبيعي\n\n## التكاليف التقريبية\n$ فندق فاخر オールインクلوسيف: 80-200 دولار/ليلة شامل كل شيء\n$ فندق مدينة قديمة (Boutique): 50-100 دولار\n$ رحلة قارب: 20-40 دولار",
    contentEn:"## Antalya — Pearl of the Mediterranean\n\nAntalya ranks first among Turkey's most visited cities by foreigners, blending thousands of years of history with the most beautiful Mediterranean beaches.\n\n## Kaleiçi (Old City)\n• Historic neighborhood walled by Roman, Seljuk and Ottoman walls\n• Charming yacht harbor surrounded by restaurants and cafes\n• Yivli Minaret — Antalya's most prominent symbol\n• Hadrian's Gate (130 AD)\n• Cobblestone streets and handicraft shops\n\n## Legendary Beaches\n→ Konyaaltı Beach: main city beach with blue pebbles\n→ Lara Beach: 12 km of golden sand and world's top hotels\n→ Kemer Beach: one of Turkey's most beautiful\n→ Gazipaşa Beach: mountains directly surrounding it\n\n## Ruins and Museums\n• Antalya Museum: one of the world's richest in Roman and Greek artifacts\n• Perge: Roman city 60 km away with a 15,000-seat theater\n• Aspendos: best-preserved Roman amphitheater in the world\n• Düden Waterfalls: cascades directly into the Mediterranean\n\n## Water Activities\n• Jet ski and banana boat riding\n• Scuba diving in crystal-clear Mediterranean waters\n• Boat trips to coves only reachable by sea\n• Kayaking between rocks\n\n## Best Times to Visit\n→ Spring (March-May): perfect weather and moderate prices\n→ Summer (June-August): peak season, hot and lively\n→ Autumn (September-October): gentle sun, warm sea, lower prices\n\n## Approximate Costs\n$ Luxury all-inclusive hotel: $80-200/night including everything\n$ Old City boutique hotel: $50-100\n$ Boat trip: $20-40" },

  { id:"travel-cappadocia", category:"travel", featured:true, date:"2026-06-01", readTime:9,
    titleAr:"كابادوكيا — سحر البالونات وبيوت الكهوف في قلب تركيا",
    titleEn:"Cappadocia — Hot Air Balloon Magic and Cave Houses in Turkey's Heart",
    excerptAr:"طيران البالون عند الفجر فوق وادي الحب وبيوت الكهوف المحفورة في الصخر — تجربة من آخر العالم.",
    excerptEn:"Hot air balloon flight at dawn over Love Valley and cave houses carved in rock — an out-of-this-world experience.",
    contentAr:"## كابادوكيا — أرض الأحلام\n\nتقع كابادوكيا في وسط الأناضول بتركيا وتُعد واحدة من أعجب مناطق العالم جيولوجياً وتاريخياً. الطبيعة هنا تفوق الخيال.\n\n## رحلة البالون عند الفجر\nالتجربة التي لا تُنسى في حياتك:\n• الانطلاق قبل شروق الشمس بساعة في برد الفجر\n• الارتفاع فوق «مداخن الجنيات» الصخرية الغريبة\n• مشاهدة الشمس وهي تشرق محولةً الوادي إلى لوحة ذهبية\n• المشاركة مع عشرات البالونات الملونة\n• الهبوط ثم الاحتفال بكأس شامبانيا\n• المدة: 1-1.5 ساعة\n• السعر: 150-250 دولار للشخص\n\n## المناطق الأبرز في كابادوكيا\n\n### وادي الغوريمي\n• المتحف المفتوح للكنائس البيزنطية المحفورة في الصخر\n• لوحات جدارية ملونة من القرن العاشر\n• تراث يونسكو منذ 1984\n\n### تشكيلات مداخن الجنيات\n• أعمدة صخرية غريبة الشكل بعدة أمتار ارتفاعاً\n• منطقة باشهير وضارة أشهر المناطق\n\n### المدن الجوفية\n• مدينة ديرينكيو التحت أرضية: تصل إلى 85 متراً تحت الأرض و18 طابقاً\n• كانت تُؤوي 10,000 شخص في العصور المسيحية الأولى\n\n### الوديان السياحية\n• وادي الحب: تكوينات صخرية منحوتة بالطبيعة\n• وادي الحمام: منطقة للتجوال على الأقدام\n• وادي إيهلارا: وادٍ عميق مع نهر جميل وكنائس صخرية\n\n## الأنشطة في كابادوكيا\n• ركوب الخيل في الوديان\n• الـ ATV بين التكوينات الصخرية\n• الطهي في دروس تحضير الأطعمة المحلية\n• التسوق في السجاد والخزف اليدوي\n• أمسية الرقص التركي التقليدي\n\n## أين تقيم؟\nبيوت الكهوف (Cave Hotels) في غوريمي وأورغوب تجربة فريدة:\n• تنسجم مع الطبيعة الصخرية المحيطة\n• مريحة ودافئة شتاءً وباردة صيفاً\n• بعضها بحمام سباحة خارجي في الصخر\n\n## أفضل الأوقات\n→ الربيع والخريف: الأمثل للبالون ورياضة التجوال\n→ الشتاء: مناظر ثلجية ساحرة وأقل ازدحاماً\n→ الصيف: حار في النهار لكن الليل بارد\n\n## التكاليف التقريبية\n$ بيت كهف فاخر: 100-200 دولار/ليلة\n$ تجربة البالون: 150-250 دولار\n$ المتحف المفتوح: 15 دولار\n$ جولة ATV: 40-60 دولار",
    contentEn:"## Cappadocia — Land of Dreams\n\nCappadocia in central Anatolia is one of the world's most geologically and historically wondrous regions. The nature here surpasses imagination.\n\n## Hot Air Balloon Ride at Dawn\nThe unforgettable experience of your life:\n• Departing one hour before sunrise in the cold dawn\n• Rising above strange rock 'fairy chimneys'\n• Watching the sun rise transforming the valley to a golden painting\n• Flying alongside dozens of colorful balloons\n• Landing then celebrating with champagne\n• Duration: 1-1.5 hours\n• Price: $150-250 per person\n\n## Cappadocia's Top Areas\n\n### Göreme Valley\n• Open-air museum of Byzantine churches carved in rock\n• Colorful 10th century murals\n• UNESCO heritage since 1984\n\n### Fairy Chimney Formations\n• Strangely shaped rock pillars several meters tall\n• Paşabağ and Devrent areas are most famous\n\n### Underground Cities\n• Derinkuyu underground city: reaching 85 meters deep with 18 floors\n• Once housed 10,000 people in early Christian times\n\n## Activities in Cappadocia\n• Horseback riding in the valleys\n• ATV between rock formations\n• Cooking classes for local cuisine\n• Shopping for handmade carpets and ceramics\n• Traditional Turkish dancing evening\n\n## Where to Stay?\nCave Hotels in Göreme and Ürgüp are a unique experience:\n• Blend with surrounding rocky nature\n• Comfortable, warm in winter and cool in summer\n• Some with outdoor swimming pools in the rock\n\n## Best Times\n→ Spring and Autumn: ideal for balloons and hiking\n→ Winter: magical snowy landscapes and less crowded\n→ Summer: hot days but cool nights\n\n## Approximate Costs\n$ Luxury cave hotel: $100-200/night\n$ Balloon experience: $150-250\n$ Open-air museum: $15\n$ ATV tour: $40-60" },

  { id:"travel-bali", category:"travel", featured:true, date:"2026-06-01", readTime:10,
    titleAr:"بالي — جنة الآلهة في إندونيسيا | الدليل الكامل 2026",
    titleEn:"Bali — Island of the Gods in Indonesia | Complete Guide 2026",
    excerptAr:"بالي الشواطئ الأسطورية والمعابد الهندوسية وحقول الأرز الزمردية وغروب الشمس الذي يسرق الأنفاس.",
    excerptEn:"Bali legendary beaches, Hindu temples, emerald rice terraces and breath-stealing sunsets.",
    contentAr:"## بالي — جنة الآلهة\n\nبالي ليست مجرد جزيرة، هي تجربة روحية وجمالية استثنائية. تُعدّ من أكثر الجزر زيارةً في العالم وجهةً تجمع بين الروحانية والطبيعة والثقافة والترفيه.\n\n## أقسام بالي السياحية\n\n### أوبود — قلب الثقافة\n• غابة القرود الشهيرة (Monkey Forest): 700 قرد بين أشجار ضخمة\n• تراسات أرز تيغالالانغ: حقول أرز متدرجة على منحدرات خضراء (تراث يونسكو)\n• مركز الفنون التقليدية وعروض رقص الكيتشاك\n• ورش الفخار والنحت والرسم\n• مطاعم الصحة العضوية وصالات اليوغا\n• الجسر الزجاجي فوق الغابة بمنظر 360 درجة\n\n### المنطقة الجنوبية (كوتا/سيمينياك/كانغو)\n• شاطئ كوتا: الأشهر والأكثر حيوية\n• شاطئ سيمينياك: أكثر رقياً وهدوءاً\n• شاطئ كانغو: مفضل عشاق ركوب الأمواج\n• نادي فينيكس الأسطوري على الشاطئ\n• بوابة معبد تناهلوت فوق الصخر في البحر\n\n### أولووواتو وجنوب بالي\n• معبد أولوواتو: فوق منحدر 70 متراً على البحر\n• عروض رقص الكيتشاك عند الغروب\n• شاطئ بادانغ بادانغ: الجنة الخفية\n• بادانغ-بادانغ كليف جامب\n\n### كلونغكونغ وشرق بالي\n• بحيرة باتور البركانية: رحلات ركوب الدراجات في الفجر حول البركان\n• معبد بيساكي: معبد الأم فوق البركان\n• تيرتاغانغا: بركة المياه المقدسة التاريخية\n\n## التجارب الفريدة في بالي\n• دروس الطبخ البالية التقليدي\n• يوم في مزرعة القهوة (Kopi Luwak)\n• رحلة الشلالات المخفية (Gitgit, Sekumpul)\n• التأمل والريتريت الروحي في أوبود\n• رياضة الرافتينغ في نهر أيونغ\n• تجربة المعابد الهندوسية في الأعياد\n\n## أفضل أوقات الزيارة\n→ الموسم الجاف (إبريل-أكتوبر): الأمثل لكل الأنشطة\n→ يوليو-أغسطس: الأكثر ازدحاماً والأعلى أسعاراً\n→ الموسم الممطر (نوفمبر-مارس): هطول متقطع لكن تراسات الأرز في أجمل حالاتها\n\n## نصائح للمسافر العربي\n• بالي جزيرة هندوسية — احترام الشعائر والمعابد مهم\n• المطبخ البالي يحتوي على لحم خنزير في كثير من الأطباق — اسأل دائماً\n• يتوفر طعام حلال في أوبود وكوتا\n• بالي تمتلك عيادات تجميل وطب أسنان عالمية بأسعار منخفضة\n\n## التكاليف التقريبية\n$ منتجع فاخر (Villa خاصة): 100-300 دولار/ليلة\n$ فندق 3-4 نجوم: 40-100 دولار/ليلة\n$ وجبة في مطعم محلي: 3-8 دولار\n$ دراجة نارية للإيجار/يوم: 5-8 دولار\n$ جولة بالي كاملة: 30-60 دولار",
    contentEn:"## Bali — Island of the Gods\n\nBali is not just an island, it's an exceptional spiritual and aesthetic experience. One of the world's most visited islands, combining spirituality, nature, culture and entertainment.\n\n## Bali's Tourism Zones\n\n### Ubud — Cultural Heart\n• Famous Monkey Forest: 700 monkeys among giant trees\n• Tegalalang Rice Terraces: stepped rice fields on green slopes (UNESCO heritage)\n• Traditional arts center and Kecak dance performances\n• Pottery, sculpting and painting workshops\n• Organic health restaurants and yoga studios\n• Glass bridge over forest with 360-degree view\n\n### Southern Area (Kuta/Seminyak/Canggu)\n• Kuta Beach: most famous and lively\n• Seminyak Beach: more upscale and quiet\n• Canggu Beach: surfing enthusiasts' favorite\n• Legendary Potato Head Beach Club\n• Tanah Lot temple gate on rock in the sea\n\n### Uluwatu and South Bali\n• Uluwatu Temple: above a 70-meter cliff overlooking the sea\n• Kecak dance performances at sunset\n• Padang Padang Beach: hidden paradise\n\n## Unique Bali Experiences\n• Traditional Balinese cooking classes\n• Day at coffee plantation (Kopi Luwak)\n• Hidden waterfall trips (Gitgit, Sekumpul)\n• Meditation and spiritual retreat in Ubud\n• White water rafting on Ayung River\n\n## Best Times to Visit\n→ Dry season (April-October): ideal for all activities\n→ July-August: busiest and most expensive\n→ Rainy season (November-March): intermittent rain but rice terraces at their most beautiful\n\n## Tips for Arab Travelers\n• Bali is a Hindu island — respecting rituals and temples is important\n• Balinese cuisine contains pork in many dishes — always ask\n• Halal food available in Ubud and Kuta\n\n## Approximate Costs\n$ Luxury resort (private villa): $100-300/night\n$ 3-4 star hotel: $40-100/night\n$ Local restaurant meal: $3-8\n$ Motorcycle rental/day: $5-8\n$ Full Bali tour: $30-60" },

  { id:"travel-lombok", category:"travel", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"لومبوك — الجوهرة الخفية بجانب بالي",
    titleEn:"Lombok — The Hidden Gem Next to Bali",
    excerptAr:"لومبوك الجمال الأصيل بعيداً عن الزحام. جبل رينجاني وشلالات سندانغ جيلي وشواطئ الجزر الثلاث البكر.",
    excerptEn:"Lombok authentic beauty away from crowds. Rinjani volcano, Sendang Gile waterfalls and pristine Three Islands beaches.",
    contentAr:"## لومبوك — الجوهرة غير المكتشفة\n\nتقع لومبوك شرق بالي مباشرةً، وتُعدّ أقل ازدحاماً وأكثر أصالةً. تجمع بين الجبال البركانية والشواطئ البيضاء والثقافة الساساك المحلية.\n\n## جبل رينجاني (3,726 متر)\nثاني أعلى بركان في إندونيسيا:\n• رحلات التسلق لـ 2-3 أيام للوصول للقمة\n• بحيرة سيغارا أناك داخل الفوهة البركانية\n• مناظر تُطل على بالي وجزر جيلي\n• الشروق من القمة من أجمل مناظر إندونيسيا\n• مناسب لمحبي المشي والمغامرة\n\n## جزر جيلي الثلاث\nالجنة المثلثة الصغيرة:\n• جيلي ترواانغان: الأكثر حيوية وسهراً\n• جيلي مينو: الأهدأ والأكثر رومانسية\n• جيلي أير: التوازن بين الحيوية والهدوء\n• لا سيارات ولا دراجات نارية في الجزر الثلاث — تنقل بالعربات والدراجات فقط\n• غوص استثنائي مع السلاحف والأسماك الملونة\n• شروق وغروب شمس من أجمل في العالم\n\n## شلالات سندانغ جيلي\nمن أجمل الشلالات في إندونيسيا:\n• شلالان متتاليان وسط غابة استوائية\n• مياه باردة نقية تنحدر من جبل رينجاني\n• يمكن السباحة في البركة الطبيعية أسفل الشلال\n\n## أكواه والثقافة الساساك\n• قرية ساساك: حياة المجتمعات المحلية الأصيلة\n• نسج القماش اليدوي (Tenun Sasak)\n• المساجد التقليدية وعمارة الجنوب الإسلامي\n\n## أبرز الشواطئ\n→ شاطئ كوتا لومبوك: مختلف كلياً عن كوتا بالي — أبيض وهادئ\n→ شاطئ سيلونغ بيلاناك: من أجمل الشواطئ الطبيعية في العالم\n→ شاطئ مووياك: للعزلة الكاملة\n\n## التكاليف التقريبية\n$ إقامة في جيلي: 30-100 دولار/ليلة\n$ عبّارة من بالي إلى لومبوك: 20-30 دولار\n$ رحلة تسلق رينجاني: 150-300 دولار (يومان)",
    contentEn:"## Lombok — The Undiscovered Gem\n\nLombok sits directly east of Bali and is less crowded and more authentic. It combines volcanic mountains, white beaches and local Sasak culture.\n\n## Mount Rinjani (3,726m)\nIndonesia's second highest volcano:\n• 2-3 day trekking trips to reach the summit\n• Segara Anak lake inside the volcanic crater\n• Views overlooking Bali and Gili Islands\n• Sunrise from the summit is one of Indonesia's most beautiful\n• Ideal for hiking and adventure lovers\n\n## Three Gili Islands\nThe small triangular paradise:\n• Gili Trawangan: most lively and nightlife\n• Gili Meno: quietest and most romantic\n• Gili Air: balance between liveliness and tranquility\n• No cars or motorcycles on any of the three islands\n• Exceptional snorkeling with turtles and colorful fish\n\n## Sendang Gile Waterfalls\nAmong Indonesia's most beautiful waterfalls:\n• Two consecutive waterfalls in tropical forest\n• Cold pure water flowing from Mount Rinjani\n• Swimming possible in natural pool below waterfall\n\n## Approximate Costs\n$ Gili Islands accommodation: $30-100/night\n$ Ferry from Bali to Lombok: $20-30\n$ Rinjani trekking trip: $150-300 (two days)" },

  { id:"travel-yogyakarta", category:"travel", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"يوغياكارتا — قلب الثقافة والحضارة الإندونيسية",
    titleEn:"Yogyakarta — Heart of Indonesian Culture and Civilization",
    excerptAr:"يوغياكارتا مدينة الفنون والمعابد البوذية الهندوسية والبراكين. موقع بوروبودور أعظم معبد بوذي في العالم.",
    excerptEn:"Yogyakarta city of arts, Buddhist-Hindu temples and volcanoes. Borobudur, the world's greatest Buddhist temple.",
    contentAr:"## يوغياكارتا — المدينة الثقافية\n\nتُعرف محلياً بـ يوغيا وهي مدينة تكسوها ملامح الحضارة الجاوية العريقة، مدينة الفنون والباتيك والسلاطين والمعابد الأسطورية.\n\n## معبد بوروبودور\nتحفة حضارية عالمية:\n• أكبر معبد بوذي في العالم وأحد عجائب الدنيا السبع الجديدة\n• بُني في القرن التاسع الميلادي خلال أسرة شيلندرا\n• 9 طوابق متدرجة و504 تمثال بوذا و2,672 لوحة منحوتة\n• تراث يونسكو منذ 1991\n• المشاهدة عند الفجر: أجمل التجارب الروحية في آسيا\n\n## معبد بَرامبانان\n• معقد معابد هندوسية من القرن التاسع\n• 240 معبداً، أبرزها ثلاثة مخصصة للثالوث الهندوسي\n• على بُعد 17 كم من يوغيا\n• عروض الرقص الرامايانا تحت النجوم عند الغروب\n\n## بركان ميرابي\n• أحد أكثر البراكين نشاطاً في العالم\n• جولات الجيب في منطقة الرماد\n• المشاهدة من مسافة آمنة\n• متحف الكوارث البركانية\n\n## كرتون القصر الملكي\n• قصر سلطان يوغياكارتا التاريخي\n• يُعقد فيه حفلات رقص الباتيك وعروض الظل\n• مبنى عمارته هولندية-جاوية فريدة\n\n## أسواق الباتيك ومناطق التسوق\n• شارع مالييوبورو: شارع التسوق الأشهر في يوغيا\n• منطقة بيبيت: ورش الباتيك اليدوي\n• سوق بيرينغهاريجو: للتحف والصناعات اليدوية\n\n## التكاليف التقريبية\n$ فندق 3 نجوم: 25-60 دولار/ليلة\n$ تذكرة بوروبودور: 25 دولار\n$ تذكرة برامبانان: 20 دولار\n$ جولة جيب بركان ميرابي: 30-50 دولار",
    contentEn:"## Yogyakarta — The Cultural City\n\nLocally known as 'Yogya', it's a city steeped in ancient Javanese civilization features, a city of arts, batik, sultans and legendary temples.\n\n## Borobudur Temple\nA world civilizational masterpiece:\n• World's largest Buddhist temple and one of the New Seven Wonders\n• Built in the 9th century AD during the Shailendra dynasty\n• 9 stepped platforms, 504 Buddha statues and 2,672 carved panels\n• UNESCO heritage since 1991\n• Dawn viewing: one of Asia's most beautiful spiritual experiences\n\n## Prambanan Temple\n• 9th century Hindu temple complex\n• 240 temples, most notable three dedicated to the Hindu Trinity\n• 17 km from Yogya\n• Ramayana dance performances under stars at sunset\n\n## Mount Merapi\n• One of the world's most active volcanoes\n• Jeep tours in the ash zone\n• Viewing from safe distance\n\n## Approximate Costs\n$ 3-star hotel: $25-60/night\n$ Borobudur ticket: $25\n$ Prambanan ticket: $20\n$ Merapi jeep tour: $30-50" },

  { id:"travel-komodo", category:"travel", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"جزر كومودو — ديناصورات حية وشواطئ وردية",
    titleEn:"Komodo Islands — Living Dinosaurs and Pink Beaches",
    excerptAr:"كومودو حيث تسكن تنانين كومودو الأسطورية والشواطئ الوردية النادرة. واحدة من أكثر الوجهات الطبيعية إثارةً في العالم.",
    excerptEn:"Komodo where legendary Komodo dragons and rare pink beaches exist. One of the world's most thrilling natural destinations.",
    contentAr:"## جزر كومودو — العالم البدائي\n\nتُشكّل جزر كومودو حديقة وطنية مدرجة على قائمة تراث يونسكو، وتحتضن آخر تنانين كومودو الحية على وجه الأرض.\n\n## تنانين كومودو\n• أكبر سحلية حية في العالم — تصل إلى 3 أمتار وزنها 70 كغ\n• حيوان ما قبل التاريخ لا يزال يعيش في العصر الحديث\n• يوجد حوالي 5,700 تنين في الجزر\n• جولات مُرافقة برفقة حراس متخصصين\n• الأفضل مشاهدتهم صباحاً قرب أماكن التغذية\n\n## الشاطئ الوردي (Pink Beach)\nمن أكثر الظواهر الطبيعية ندرةً في العالم:\n• الرمال الوردية ناتجة عن خليط الرمل الأبيض وشظايا مرجان أحمر\n• يوجد 7 شواطئ وردية فقط في العالم وكومودو من أشهرها\n• لون الشاطئ يتغير حسب زاوية ضوء الشمس\n\n## الغوص وسط الشعاب المرجانية\nكومودو تُعدّ من أفضل مناطق الغوص في العالم:\n• تنوع بيولوجي استثنائي تحت الماء\n• رؤية أسماك المانتا والسلاحف وأسماك القرش الحوت\n• مياه صافية ذات مشاهد تحت مائية لا تُقدَّر\n\n## كيف تصل؟\n• الوصول من لابوان باجو (فلوريس) بالقارب\n• رحلات اليوم الواحد أو رحلات إقامة على القارب (Liveaboard)\n\n## التكاليف التقريبية\n$ رحلة يوم كامل: 50-100 دولار\n$ إقامة على القارب (Liveaboard): 200-500 دولار/ليلة\n$ رسوم الدخول لحديقة كومودو: 25-30 دولار",
    contentEn:"## Komodo Islands — The Primeval World\n\nKomodo Islands form a UNESCO World Heritage national park and harbor the last living Komodo dragons on earth.\n\n## Komodo Dragons\n• World's largest living lizard — reaching 3 meters and weighing 70 kg\n• Prehistoric animal still living in modern times\n• About 5,700 dragons exist on the islands\n• Guided tours with specialist rangers\n• Best seen in the morning near feeding areas\n\n## Pink Beach\nOne of the world's rarest natural phenomena:\n• Pink sand results from mixture of white sand and red coral fragments\n• Only 7 pink beaches in the world, Komodo is among the most famous\n• Beach color changes with sun angle\n\n## Diving Among Coral Reefs\nKomodo is considered one of the world's best diving spots:\n• Exceptional underwater biodiversity\n• Seeing manta rays, turtles and whale sharks\n\n## How to Get There?\n• Arrive from Labuan Bajo (Flores) by boat\n• Day trips or liveaboard stays\n\n## Approximate Costs\n$ Full day trip: $50-100\n$ Liveaboard: $200-500/night\n$ Komodo park entrance: $25-30" },

  { id:"travel-georgia", category:"travel", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"جورجيا تبليسي وكاخيتي — أوروبا القوقاز بتكاليف لا تصدق",
    titleEn:"Georgia Tbilisi and Kakheti — Caucasus Europe at Unbelievable Costs",
    excerptAr:"جورجيا وجهة ترتقي بسرعة على قوائم المفضلات العربية. تبليسي الساحرة وجبال القوقاز الثلجية ومناطق نبيذ كاخيتي.",
    excerptEn:"Georgia is rapidly rising on Arab travel favorites lists. Charming Tbilisi, snowy Caucasus mountains and Kakheti wine regions.",
    contentAr:"## جورجيا — درة القوقاز\n\nأصبحت جورجيا في السنوات الأخيرة من أكثر الوجهات جذباً للسياح العرب، تجمع بين الأسعار المعقولة والطبيعة الخلابة والتاريخ والضيافة الحارة.\n\n## تبليسي — العاصمة الساحرة\n• حي متسخيتا الأثري: تقاطع الحضارات القديمة\n• حمامات تبليسي الكبريتية في حي أباناتوبي\n• قلعة ناريكالا المطلة على المدينة بأسرها\n• تمثال الأم جورجيا\n• حي آبانوتوبي: الحمامات التاريخية ذات القباب\n• شارع روستافيلي: قلب الحياة الثقافية\n• عبّارة الروبيك الحديثة على النهر\n\n## كاخيتي — مهد النبيذ\n• المنطقة الأشهر لإنتاج النبيذ الجورجي منذ 8,000 سنة\n• دير دافيد غاريجا المنحوت في الصخر\n• المشي في الكروم الذهبية الخريفية\n\n## كاشبيتي وغودوري\n• محطة تزلج غودوري الشهيرة (1800-2196 م)\n• كنيسة القديسة سمعان في الصخر\n\n## كازبيغي وجبل كازبيك\n• منظر يصعب تصديقه — كنيسة غيرغيتي في السحاب\n• تسلق جبل كازبيك (5,047 م) للمتمرسين\n• قرى جبلية أصيلة\n\n## لماذا جورجيا للعرب؟\n• لا تحتاج تأشيرة (معظم الجنسيات العربية)\n• تكاليف معيشة منخفضة جداً\n• طعام لذيذ ومتنوع\n• أهل الترحيب والكرم المشهور عنهم\n• ليلة في تبليسي مقابل 30-60 دولار فقط\n\n## أفضل أوقات الزيارة\n→ الربيع (إبريل-يونيو): ازدهار طبيعي ومناخ مثالي\n→ الخريف (سبتمبر-نوفمبر): موسم حصاد النبيذ وألوان ذهبية\n→ الشتاء: للتزلج في غودوري\n\n## التكاليف التقريبية\n$ فندق وسط المدينة: 40-80 دولار/ليلة\n$ وجبة في مطعم جيد: 8-15 دولار\n$ رحلة ليوم كامل: 30-50 دولار",
    contentEn:"## Georgia — Jewel of the Caucasus\n\nGeorgia has become in recent years one of the most attractive destinations for Arab tourists, combining reasonable prices, stunning nature, history and warm hospitality.\n\n## Tbilisi — The Enchanting Capital\n• Mtskheta historic district: crossroads of ancient civilizations\n• Tbilisi sulfur baths in Abanotubani neighborhood\n• Narikala Castle overlooking the entire city\n• Mother of Georgia statue\n• Rustaveli Avenue: heart of cultural life\n\n## Kakheti — Cradle of Wine\n• Most famous Georgian wine production region for 8,000 years\n• David Gareja Monastery carved in rock\n\n## Why Georgia for Arabs?\n• No visa required (most Arab nationalities)\n• Very low cost of living\n• Delicious and diverse food\n• Famously warm and hospitable people\n• Night in Tbilisi for just $30-60\n\n## Approximate Costs\n$ City center hotel: $40-80/night\n$ Good restaurant meal: $8-15\n$ Full-day tour: $30-50" },

  { id:"travel-maldives", category:"travel", featured:true, date:"2026-06-01", readTime:8,
    titleAr:"المالديف — جنة المحيط الهندي والعوامات الفاخرة",
    titleEn:"Maldives — Indian Ocean Paradise and Luxury Overwater Villas",
    excerptAr:"المالديف حيث الفيلا فوق المياه الكريستالية وأسماك القرش وأسماك المانتا. وجهة شهر العسل والاسترخاء الأول في العالم.",
    excerptEn:"Maldives where overwater villas sit above crystal waters with sharks and manta rays. World's top honeymoon and relaxation destination.",
    contentAr:"## المالديف — السلام المطلق\n\nجمهورية المالديف سلسلة جزر في المحيط الهندي تتكون من 26 مرجانياً و1,192 جزيرة، معظمها غير مأهول. تُحتل دائماً المركز الأول في قوائم وجهات شهر العسل والسياحة الفاخرة.\n\n## تجربة الفيلا فوق الماء\nالتجربة التي تستحق كل قرش:\n• فيلا خشبية معلقة فوق المياه الفيروزية مباشرةً\n• أرضية زجاجية ترى من خلالها الأسماك تسبح أسفلك\n• درج خاص ينزل مباشرة إلى المياه\n• منظر اللانهاية على المحيط\n• خدمة استثنائية في عزلة تامة\n\n## الأنشطة المائية\n• غوص حر (Snorkeling): أسماك ملونة وشعاب مرجانية في الشالو\n• الغطس (Scuba Diving): رؤية أسماك القرش الحوت وأسماك المانتا\n• ركوب الدراجات المائية والقوارب الشفافة\n• رياضة الإبحار والرياح\n• صيد الأسماك التقليدي مع السكان المحليين\n• جلسات اليوغا على منصة فوق البحر\n\n## أشهر العتولات (Atolls)\n→ ماليه الوسطى: الأشهر وأقل تكلفةً\n→ باا: محمية يونسكو وأسماك مانتا\n→ آري: أفضل الغطس والفنادق\n→ النورث ماليه: أقرب للمطار الدولي\n\n## نصائح لتوفير التكاليف\n• اختر جزيرة سكانية محلية بدلاً من المنتجع المنعزل\n• الفنادق الصغيرة المحلية Guesthouse في جزر مثل Maafushi وHuraa\n• الزيارة في موسم الكتف (مايو-نوفمبر) بأسعار أقل بكثير\n• حجز مبكر قبل 3-6 أشهر\n\n## أفضل أوقات الزيارة\n→ الموسم الجاف (نوفمبر-إبريل): مثالي للغطس والطقس\n→ موسم المانتا (مايو-نوفمبر) في منطقة باا\n\n## التكاليف التقريبية\n$ منتجع فاخر فوق الماء: 300-1000 دولار/ليلة\n$ Guesthouse في جزيرة محلية: 60-150 دولار/ليلة\n$ رحلة الغطس: 60-100 دولار\n$ رحلة مشاهدة المانتا: 80-150 دولار",
    contentEn:"## Maldives — Absolute Peace\n\nRepublic of Maldives is an Indian Ocean archipelago of 26 atolls and 1,192 islands, most uninhabited. It consistently tops lists of honeymoon and luxury tourism destinations.\n\n## Overwater Villa Experience\nThe experience worth every penny:\n• Wooden villa suspended directly above turquoise waters\n• Glass floor allowing you to see fish swimming below\n• Private staircase descending directly into the water\n• Infinite ocean view\n• Exceptional service in complete isolation\n\n## Water Activities\n• Snorkeling: colorful fish and coral reefs in the shallows\n• Scuba Diving: seeing whale sharks and manta rays\n• Water bikes and transparent kayaks\n• Sailing and wind sports\n• Traditional fishing with locals\n• Yoga sessions on sea platform\n\n## Tips to Save Costs\n• Choose a local inhabited island instead of isolated resort\n• Small local Guesthouses on islands like Maafushi and Huraa\n• Visit in shoulder season (May-November) at much lower prices\n• Early booking 3-6 months ahead\n\n## Best Times to Visit\n→ Dry season (November-April): ideal for diving and weather\n→ Manta season (May-November) in Baa Atoll\n\n## Approximate Costs\n$ Luxury overwater resort: $300-1000/night\n$ Local island Guesthouse: $60-150/night\n$ Diving trip: $60-100\n$ Manta ray viewing: $80-150" },

  { id:"travel-japan-tokyo-kyoto", category:"travel", featured:false, date:"2026-06-01", readTime:10,
    titleAr:"اليابان — طوكيو وكيوتو وأوساكا | دليل المسافر العربي",
    titleEn:"Japan — Tokyo, Kyoto and Osaka | Arab Traveler's Guide",
    excerptAr:"اليابان وجهة حلم استثنائية تجمع المستقبل الرقمي بالماضي الإمبراطوري. أزهار الكرز والمعابد والطعام الأرقى في العالم.",
    excerptEn:"Japan is an exceptional dream destination combining digital future with imperial past. Cherry blossoms, temples and the world's finest cuisine.",
    contentAr:"## اليابان — وجهة الأحلام\n\nاليابان تجربة من نوع آخر تماماً — حيث يلتقي الحضارة العريقة بالتكنولوجيا المتقدمة، والهدوء الآسيوي بالنبض الحضري الذي لا يهدأ.\n\n## طوكيو — المدينة التي لا تنام\n\n### الأحياء الأبرز\n• شينجوكو: مركز التسوق والحياة الليلية الصاخبة\n• شيبويا: أشهر تقاطع مشاة في العالم\n• هاراجوكو: الموضة الغريبة وشارع تاكيشيتا\n• أكيهابارا: عاصمة الإلكترونيات والأنيمي والتكنولوجيا\n• أساكوسا: معبد سينسوجي وأجواء اليابان التقليدية\n• أوداييبا: الجزيرة الاصطناعية والعمارة المستقبلية\n\n### التجارب الفريدة في طوكيو\n• تناول الطعام في مطعم على شكل روبوت\n• مقهى القطط أو الحيوانات\n• أكل السوشي في مطعم بسير الحزام\n• شراء تجهيزات الطبخ في سوق تسوكيجي\n\n## كيوتو — روح اليابان\n• فوشيمي إيناري: نفق من آلاف البوابات الحمراء (تورييه)\n• مجمع معابد كينكاكوجي (الجناح الذهبي)\n• معبد غينكاكوجي (الجناح الفضي)\n• حي غيون للغيشا الأصيل\n• معابد آراشياما وغابة الخيزران\n• حدائق نيجو-جو القصر الإمبراطوري\n\n## نارا — الغزلان المقدسة\n• مدينة على بُعد ساعة من كيوتو\n• غزلان مقدسة تتجول بحرية في المدينة\n• معبد توداي-جي: أكبر هيكل خشبي في العالم\n\n## أوساكا — جنة الطعام\n• قلعة أوساكا التاريخية\n• دوتونبوري: قلب الحياة الليلية والمطاعم\n• تاكوياكي (كرات الأخطبوط) وأوكونوميياكي\n• يونيفيرسال ستوديوز جابان\n\n## الطعام الحلال في اليابان\n• المطاعم الحلال تتكاثر بسرعة خاصة في طوكيو وأوساكا وكيوتو\n• تطبيق Halal Gourmet Japan لإيجاد المطاعم\n• معظم محلات السوشي تقدم بدائل خالية من الكحول\n\n## موسم أزهار الكرز (Sakura)\n• إبريل في معظم المدن\n• من أجمل الأوقات للزيارة ولكن الأكثر ازدحاماً والأعلى أسعاراً\n• حدائق أوينو وشينجوكو الأكثر شهرة في طوكيو\n\n## التكاليف التقريبية\n$ فندق كابسول (تجربة فريدة): 30-50 دولار/ليلة\n$ فندق 3 نجوم: 80-150 دولار/ليلة\n$ وجبة في مطعم متوسط: 10-25 دولار\n$ تذكرة القطار السريع شينكانسن (طوكيو-كيوتو): 130 دولار",
    contentEn:"## Japan — Dream Destination\n\nJapan is a completely different experience — where ancient civilization meets advanced technology, and Asian tranquility meets the urban pulse that never stops.\n\n## Tokyo — The City That Never Sleeps\n\n### Top Neighborhoods\n• Shinjuku: shopping and nightlife hub\n• Shibuya: world's most famous pedestrian crossing\n• Harajuku: quirky fashion and Takeshita Street\n• Akihabara: electronics, anime and technology capital\n• Asakusa: Senso-ji Temple and traditional Japan atmosphere\n• Odaiba: artificial island and futuristic architecture\n\n## Kyoto — Soul of Japan\n• Fushimi Inari: tunnel of thousands of red torii gates\n• Kinkaku-ji (Golden Pavilion)\n• Gion district for authentic geisha\n• Arashiyama temples and bamboo forest\n\n## Osaka — Food Paradise\n• Osaka Castle\n• Dotonbori: heart of nightlife and restaurants\n• Takoyaki and Okonomiyaki\n• Universal Studios Japan\n\n## Halal Food in Japan\n• Halal restaurants multiplying rapidly especially in Tokyo, Osaka and Kyoto\n• Halal Gourmet Japan app to find restaurants\n\n## Approximate Costs\n$ Capsule hotel: $30-50/night\n$ 3-star hotel: $80-150/night\n$ Mid-range restaurant meal: $10-25\n$ Shinkansen bullet train (Tokyo-Kyoto): $130" },

  { id:"travel-singapore", category:"travel", featured:false, date:"2026-06-01", readTime:7,
    titleAr:"سنغافورة — مدينة الأسد في قلب آسيا",
    titleEn:"Singapore — The Lion City in the Heart of Asia",
    excerptAr:"سنغافورة النظافة والنظام والتكنولوجيا في مدينة دولة ساحرة. حدائق على الخليج وشارع العرب والتسوق الأرقى.",
    excerptEn:"Singapore cleanliness, order and technology in a charming city-state. Gardens by the Bay, Arab Street and premier shopping.",
    contentAr:"## سنغافورة — دولة المدينة الرائدة\n\nسنغافورة هي واحدة من أكثر المدن تقدماً ونظافةً في العالم، وجهة مثالية للعائلات والمسافرين الباحثين عن تجربة آسيوية متحضرة.\n\n## المعالم الأبرز\n\n### حدائق على الخليج (Gardens by the Bay)\n• أشجار Supertree العملاقة الاصطناعية المضاءة ليلاً\n• قبب مناخية تحتوي على غابات مدارية وجبلية\n• عرض الضوء والصوت المجاني كل ليلة\n\n### مارينا باي ساندز\n• فندق ذو تصميم معماري فريد (قوارب حجرية على الهواء)\n• حوض سباحة لانهاية على ارتفاع 200 متر\n• مركز تسوق ومنصة مشاهدة للمدينة\n\n### جزيرة سنتوسا\n• ملاهي يونيفيرسال ستوديوز سنغافورة\n• شواطئ مصنوعة ومنتجعات خمس نجوم\n• برج G-Max Reverse Bungy\n\n### شارع العرب (Arab Street / Kampong Glam)\n• حي مسلم تاريخي بمساجد بهية\n• مسجد السلطان التاريخي ذو القبة الذهبية\n• مطاعم حلال متنوعة من كل أنحاء آسيا\n• تسوق في البهارات والعطور والأقمشة\n\n### ليتل إنديا وتشاينا تاون\n• أحياء ثقافية تعكس التنوع الهائل في سنغافورة\n• سوق بعيتس باسار (Tekka Centre): مطبخ عالمي شعبي بأسعار منخفضة\n\n## نصائح للمسافر المسلم\n• مسجد السلطان في شارع العرب من أجمل المساجد في جنوب شرق آسيا\n• مطاعم حلال معتمدة بكثرة في كمبونغ غلام والمولات الكبرى\n• الكحول مقيد وأسعاره مرتفعة جداً\n\n## أفضل أوقات الزيارة\n→ فبراير-إبريل ونوفمبر: أفضل الطقس\n→ تجنب يونيو-يوليو وديسمبر-يناير (موسم الأمطار الغزيرة)\n\n## التكاليف التقريبية\n$ فندق 4 نجوم: 150-250 دولار/ليلة\n$ وجبة في Hawker Centre: 4-8 دولار\n$ تذكرة يونيفيرسال ستوديوز: 70-80 دولار\n$ مواصلات MRT: 1-3 دولار للرحلة",
    contentEn:"## Singapore — The Leading City-State\n\nSingapore is one of the world's most advanced and cleanest cities, an ideal destination for families and travelers seeking a sophisticated Asian experience.\n\n## Top Attractions\n\n### Gardens by the Bay\n• Giant artificial Supertrees illuminated at night\n• Climate domes containing tropical and mountain forests\n• Free nightly light and sound show\n\n### Marina Bay Sands\n• Hotel with unique architecture\n• Infinity pool at 200-meter elevation\n• Shopping mall and city observation deck\n\n### Sentosa Island\n• Universal Studios Singapore\n• Man-made beaches and five-star resorts\n\n### Arab Street / Kampong Glam\n• Historic Muslim neighborhood with beautiful mosques\n• Sultan Mosque with golden dome\n• Diverse halal restaurants from across Asia\n\n## Tips for Muslim Travelers\n• Sultan Mosque is one of Southeast Asia's most beautiful\n• Certified halal restaurants abundant in Kampong Glam\n\n## Approximate Costs\n$ 4-star hotel: $150-250/night\n$ Hawker Centre meal: $4-8\n$ Universal Studios ticket: $70-80\n$ MRT transport: $1-3 per trip" },

  { id:"travel-morocco-cities", category:"travel", featured:false, date:"2026-06-01", readTime:9,
    titleAr:"مراكش وفاس وشفشاون — أسحر مدن المغرب",
    titleEn:"Marrakech, Fez and Chefchaouen — Morocco's Most Enchanting Cities",
    excerptAr:"مراكش المدينة الحمراء وفاس القديمة الأعرق في التاريخ وشفشاون المدينة الزرقاء — المغرب تجربة سحر بلا نهاية.",
    excerptEn:"Marrakech the red city, ancient Fez richest in history, and Chefchaouen the blue city — Morocco an endless magical experience.",
    contentAr:"## المغرب — مملكة التنوع\n\nالمغرب يجمع الحضارة العربية الأمازيغية والأندلسية والأفريقية في تناغم فريد، ويوفر للمسافر تجارب لا نهاية لها من الطعام إلى الطبيعة إلى التاريخ.\n\n## مراكش — المدينة الحمراء\n\n### جامع الفنا\n• الساحة الأشهر في أفريقيا وربما في العالم العربي\n• نهاراً: عروض الثعابين والقرود والعرافين\n• مساءً: مطاعم شعبية مفتوحة مع عروض موسيقية وحكواتية\n• صُنفت تراثاً ثقافياً غير مادي من يونسكو\n\n### المدينة القديمة (المدينة)\n• أسواق ومتاجر وأزقة متشعبة لا تنتهي\n• سوق الصباغين: حوض صباغة الجلود الشهير الذي يُرى من الأعلى\n• قصر البهية من القرن التاسع عشر\n• مدرسة بن يوسف الإسلامية التحفة المعمارية\n\n### الرياضات والأنشطة\n• ركوب الدراجات في أزقة المدينة\n• دروس الطبخ المغربي\n• جلسة الحمام المغربي التقليدي\n• رحلات الصحراء من أكادير\n\n## فاس — أقدم مدن العالم المعمورة\n• فاس البالي المدرجة على قائمة تراث يونسكو\n• المسيرة داخل الأزقة الضيقة كأنك عدت ألف سنة للوراء\n• جامع القرويين: أقدم جامعة في العالم (859 ميلادي)\n• المدارس الإسلامية البديعة كمدرسة البو عنانية\n• الحرف اليدوية الأصيلة: خزف، جلود، ونسيج\n\n## شفشاون — المدينة الزرقاء\n• مدينة في قلب جبال الريف مطلية بكل درجات الأزرق\n• شوارع ضيقة رائعة للتصوير\n• أجواء هادئة وسكينة تختلف عن مراكش وفاس\n• المشي في الجبال المحيطة\n\n## الصحراء المغربية — مرزوكة\n• كثبان رملية تصل إلى 150 متراً ارتفاعاً\n• نوم تحت النجوم في خيمة بربرية\n• ركوب الجمال عند الغروب\n• 8-10 ساعات بالسيارة من مراكش أو 3 ساعات من فاس\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو) والخريف (سبتمبر-نوفمبر): الأمثل\n→ الصيف: حار جداً في الداخل خاصة مراكش (40°C+)\n\n## التكاليف التقريبية\n$ رياض (Riad) في مراكش: 60-200 دولار/ليلة\n$ وجبة كوسكوس: 8-15 دولار\n$ رحلة صحراء ليلة كاملة: 80-150 دولار",
    contentEn:"## Morocco — Kingdom of Diversity\n\nMorocco combines Arab, Amazigh, Andalusian and African civilizations in a unique harmony, offering travelers endless experiences from food to nature to history.\n\n## Marrakech — The Red City\n\n### Jemaa el-Fna\n• Most famous square in Africa and possibly the Arab world\n• Daytime: snake charmer and monkey performances\n• Evening: open-air restaurants with musical and storytelling shows\n• UNESCO-listed intangible cultural heritage\n\n### Old City (Medina)\n• Never-ending markets, shops and branching alleys\n• Tanneries: leather dyeing vats seen from above\n• Bahia Palace from the 19th century\n• Ben Youssef Madrasa — architectural masterpiece\n\n## Fez — One of the World's Oldest Inhabited Cities\n• UNESCO-listed Fes el-Bali\n• Walking inside narrow alleys as if transported 1000 years back\n• Al-Qarawiyyin Mosque: world's oldest university (859 AD)\n\n## Chefchaouen — The Blue City\n• Mountain city painted in all shades of blue\n• Narrow streets perfect for photography\n• Quiet and serene atmosphere\n\n## Sahara Desert — Merzouga\n• Sand dunes reaching 150 meters height\n• Sleeping under stars in Berber tent\n• Camel riding at sunset\n\n## Best Times to Visit\n→ Spring (March-May) and Autumn (September-November): ideal\n→ Summer: extremely hot inland especially Marrakech (40°C+)\n\n## Approximate Costs\n$ Riad in Marrakech: $60-200/night\n$ Couscous meal: $8-15\n$ Desert overnight trip: $80-150" },


  { id:"travel-egypt-cairo", category:"travel", featured:true, date:"2026-06-05", readTime:10,
    titleAr:"مصر — الأهرامات والقاهرة وشواطئ البحر الأحمر | دليل 2026",
    titleEn:"Egypt — Pyramids, Cairo and Red Sea Beaches | Guide 2026",
    excerptAr:"مصر حضارة عمرها 7000 سنة. أهرامات الجيزة وأبو الهول والأقصر وشرم الشيخ والغردقة — كل ما تحتاجه في وجهة واحدة.",
    excerptEn:"Egypt — 7000 years of civilization. Giza Pyramids, Sphinx, Luxor, Sharm El-Sheikh and Hurghada — everything you need in one destination.",
    contentAr:"## مصر — أم الدنيا\n\nلا توجد دولة في العالم تجمع هذا الكم من التاريخ والطبيعة والتنوع في مكان واحد. من أعماق التاريخ الفرعوني إلى شواطئ البحر الأحمر الأسطورية، مصر تجربة حياة كاملة.\n\n## القاهرة الكبرى\n\n### أهرامات الجيزة وأبو الهول\n• الأهرامات من عجائب الدنيا السبع الوحيدة الباقية\n• هرم خوفو: بُني قبل 4500 سنة بـ 2.3 مليون قطعة حجرية\n• أبو الهول: الحارس الأسطوري للأهرامات\n• المتحف الكبير المصري (GEM): أضخم متحف أثري في العالم — افتُتح 2023\n• رحلة الخيول والجمال حول الأهرامات\n• عرض الصوت والضوء ليلاً\n\n### وسط القاهرة التاريخي\n• خان الخليلي: أشهر أسواق الشرق منذ 1382 ميلادي\n• الأزهر الشريف: أعرق جامعة إسلامية في التاريخ\n• حي الحسين والمشي في أزقة القاهرة الفاطمية\n• مسجد محمد علي (قلعة صلاح الدين) المطل على القاهرة\n• المتحف المصري بالتحرير: موميات الفراعنة والكنوز\n\n### القاهرة المعاصرة\n• منطقة مصر الجديدة والتجمع الخامس\n• برج القاهرة وعرض النيل\n• أسواق التسوق الحديثة\n\n## الأقصر وأسوان — فلسطين الفراعنة\n\n### الأقصر (طيبة القديمة)\n• معبد الكرنك: أكبر مجمع معابد في العالم — مبني على مدى 2000 سنة\n• معبد الأقصر: في قلب المدينة\n• وادي الملوك: مقابر رمسيس وتوت عنخ آمون\n• وادي الملكات\n• رحلة البالون فوق الأقصر عند الفجر\n\n### أسوان\n• السد العالي والبحيرة الأعلى في العالم\n• معبد أبو سمبل: أُنقذ من الغرق ونُقل حجراً حجراً\n• جزيرة فيلة والمعابد المغمورة\n• النوبيون وقراهم الملونة\n• رحلة الفلوكة على النيل\n\n## شواطئ البحر الأحمر\n\n### شرم الشيخ\n• من أفضل مناطق الغوص في العالم\n• الشعاب المرجانية وأسماك القرش الحوت\n• نعمة باي ونبق وراس محمد\n• سانت كاترين وجبل سيناء (المشي ليلاً لمشاهدة الشروق)\n\n### الغردقة\n• شاطئ ممتد وفنادق الكل شامل\n• الغوص ورياضات الشراع\n• جزر الغردقة البكر\n\n### دهب\n• وجهة الغطس الأسطورية (Blue Hole)\n• أجواء متحررة وهادئة\n• رياضة الكايت سيرف\n\n## الواحات والصحراء\n• واحة سيوة: الواحة الأجمل في العالم المتوسط\n• الصحراء البيضاء: تكوينات طبشورية بيضاء كالقمر\n\n## أفضل أوقات الزيارة\n→ أكتوبر-إبريل: الأمثل للقاهرة والأقصر (طقس معتدل)\n→ طوال السنة: للبحر الأحمر مع تجنب الصيف الحار\n\n## التكاليف التقريبية\n$ فندق 5 نجوم في القاهرة: 80-200 دولار\n$ فندق كل شامل في الغردقة: 60-150 دولار\n$ رحلة البالون في الأقصر: 80-120 دولار\n$ تذكرة أهرامات + متحف: 30-50 دولار",
    contentEn:"## Egypt — Mother of the World\n\nNo country in the world combines this much history, nature and diversity in one place. From the depths of Pharaonic history to the legendary Red Sea beaches, Egypt is a complete life experience.\n\n## Greater Cairo\n\n### Giza Pyramids and Sphinx\n• Pyramids — the only remaining Wonder of the Ancient World\n• Pyramid of Khufu: built 4,500 years ago with 2.3 million stone blocks\n• Sphinx: legendary guardian of the pyramids\n• Grand Egyptian Museum (GEM): world's largest archaeological museum — opened 2023\n\n### Historic Cairo\n• Khan el-Khalili: Middle East's most famous bazaar since 1382 AD\n• Al-Azhar: oldest Islamic university in history\n• Hussein district and walking Fatimid Cairo alleys\n• Muhammad Ali Mosque (Saladin Citadel) overlooking Cairo\n\n## Luxor and Aswan — Pharaonic Palestine\n\n### Luxor (Ancient Thebes)\n• Karnak Temple: world's largest temple complex — built over 2000 years\n• Valley of the Kings: tombs of Ramesses and Tutankhamun\n• Hot air balloon over Luxor at dawn\n\n## Red Sea Beaches\n\n### Sharm El-Sheikh\n• One of the world's best diving spots\n• Coral reefs and whale sharks\n• St. Catherine and Mount Sinai\n\n### Hurghada\n• Extended beach and all-inclusive hotels\n• Diving and sailing sports\n\n## Best Times to Visit\n→ October-April: ideal for Cairo and Luxor\n→ Year-round: for Red Sea, avoid hot summer\n\n## Approximate Costs\n$ 5-star hotel in Cairo: $80-200\n$ All-inclusive Hurghada hotel: $60-150\n$ Luxor balloon: $80-120" },

  { id:"travel-tunisia", category:"travel", featured:false, date:"2026-06-05", readTime:8,
    titleAr:"تونس — جوهرة المغرب العربي بين البحر والصحراء",
    titleEn:"Tunisia — North Africa's Gem Between Sea and Desert",
    excerptAr:"تونس الحضارات المتعاقبة — قرطاج الفينيقية وسيدي بوسعيد الأزرق وصحراء دوز وشواطئ الحمامات. رحلة في الزمن.",
    excerptEn:"Tunisia — successive civilizations: Phoenician Carthage, blue Sidi Bou Said, Douz desert and Hammamet beaches. A journey through time.",
    contentAr:"## تونس — بلاد الياسمين\n\nتُعد تونس من أجمل وجهات البحر الأبيض المتوسط، تجمع في مساحة صغيرة بين الحضارة الفينيقية والرومانية والإسلامية والبحر الأزرق والصحراء الذهبية.\n\n## تونس العاصمة\n\n### المدينة العتيقة (تراث يونسكو)\n• الجامع الأعظم الزيتونة: أقدم جامعة في العالم الإسلامي (737 ميلادي)\n• أزقة المدينة العتيقة ومتاجر العطور والسجاد والنحاس\n• قصر دار المصمودي وقصور الأعيان\n• سوق الشاشية (الطربوش) والحرف التقليدية\n\n### سيدي بوسعيد\n• القرية الأجمل في تونس على تل مطل على البحر\n• كل شيء فيها أبيض وأزرق كاللوحة\n• أكثر المناطق تصويراً في تونس\n• مقاهي ترى منها البحر الأبيض المتوسط والساحل\n\n### قرطاج\n• عاصمة الحضارة الفينيقية الأسطورية (814 ق.م)\n• تراث يونسكو — منتزه قرطاج الأثري\n• متحف قرطاج على تل بيرسا\n• حمامات أنطونيوس: ثالث أكبر الحمامات الرومانية في العالم\n\n## المدن التاريخية الكبرى\n\n### سوسة والمنستير والمهدية\n• مدن ساحلية جميلة بمدن عتيقة وقلاع بيزنطية\n• ريبات سوسة: تحصين بحري إسلامي رائع\n• منتجعات الحمامات السياحية على البحر\n\n### القيروان\n• أقدس مدينة إسلامية في المغرب العربي\n• الجامع الكبير: من أعظم المساجد في العالم الإسلامي\n• الصناعات اليدوية التقليدية — السجاد الكيرواني الشهير\n\n### صفاقس\n• ثاني أكبر مدن تونس\n• المدينة العتيقة الأقل سياحيةً والأكثر أصالة\n\n## الصحراء والجنوب\n\n### دوز — بوابة الصحراء\n• أشهر واحات تونس وبوابة الصحراء الكبرى\n• ركوب الجمال في الكثبان الرملية\n• مهرجان الصحراء الدولي (ديسمبر)\n\n### مطماطة\n• قرى المنازل المحفورة تحت الأرض (ترoglodytes)\n• منزل مطماطة الشهير كان موقع تصوير فيلم حرب النجوم\n\n### الشط\n• بحيرة الملح الجافة الأضخم في أفريقيا\n• تنعكس عليها السماء كالمرآة في الشتاء\n\n## جزيرة جربة\n• أجمل جزر تونس وأكثرها شهرة\n• مزيج ساحر من الثقافة البربرية واليهودية والعربية\n• شواطئ بيضاء وفنادق على الواجهة البحرية\n• حارة جيارة اليهودية وكنيس الغريبة العتيق\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): مثالي لكل المناطق\n→ الخريف (سبتمبر-نوفمبر): لطيف ومعتدل\n→ الصيف: حار في الداخل ولكن ممتاز للشواطئ\n\n## التكاليف التقريبية\n$ فندق 4 نجوم في الحمامات: 50-100 دولار\n$ وجبة كسكسي أو بريك: 5-12 دولار\n$ رحلة صحراء ليومين: 80-150 دولار\n$ تذكرة قرطاج: 8-12 دولار",
    contentEn:"## Tunisia — Land of Jasmine\n\nTunisia is one of the Mediterranean's most beautiful destinations, combining Phoenician, Roman and Islamic civilizations in a small area alongside blue sea and golden desert.\n\n## Tunis Capital\n\n### Medina (UNESCO Heritage)\n• Zitouna Grand Mosque: oldest university in Islamic world (737 AD)\n• Medina alleys and shops of perfumes, carpets and copper\n\n### Sidi Bou Said\n• Tunisia's most beautiful village on a hill overlooking the sea\n• Everything white and blue like a painting\n• Most photographed area in Tunisia\n\n### Carthage\n• Capital of legendary Phoenician civilization (814 BC)\n• UNESCO heritage — Carthage archaeological park\n\n## The Desert South\n\n### Douz — Gateway to the Sahara\n• Tunisia's most famous oasis\n• Camel rides in sand dunes\n\n### Matmata\n• Underground troglodyte villages\n• Famous Matmata house was a Star Wars filming location\n\n## Djerba Island\n• Tunisia's most famous island\n• Mix of Berber, Jewish and Arab culture\n• White beaches and seafront hotels\n\n## Best Times\n→ Spring (March-May): ideal for all areas\n→ Autumn (September-November): pleasant and mild\n\n## Approximate Costs\n$ 4-star hotel in Hammamet: $50-100\n$ Couscous or Brik meal: $5-12\n$ 2-day desert trip: $80-150" },

  { id:"travel-spain", category:"travel", featured:true, date:"2026-06-05", readTime:10,
    titleAr:"إسبانيا — برشلونة وغرناطة ومدريد | دليل الأندلس الحديث",
    titleEn:"Spain — Barcelona, Granada and Madrid | Guide to Modern Andalusia",
    excerptAr:"إسبانيا حيث الأندلس الإسلامية تلتقي أوروبا المعاصرة. قصر الحمراء وغاودي وسيرة الفلامنكو وطعام لا يُنسى.",
    excerptEn:"Spain where Islamic Andalusia meets modern Europe. Alhambra, Gaudi, Flamenco and unforgettable food.",
    contentAr:"## إسبانيا — أوروبا بنكهة الأندلس\n\nإسبانيا وجهة استثنائية تجمع بين إرث الحضارة الإسلامية في الأندلس والثقافة الأوروبية الحديثة والطعام الأشهى والشواطئ الأرقى.\n\n## برشلونة — مدينة الفنون والهندسة\n\n### روائع غاودي\n• كنيسة الساغرادا فاميليا: تحفة معمارية قيد البناء منذ 1882 — تراث يونسكو\n• حديقة غويل: مدينة ألوان وفسيفساء خيالية\n• بيت باتيو وبيت ميلا: معمار عضوي لا مثيل له\n\n### شوارع وأحياء برشلونة\n• شارع لاس رامبلاس: الشريان النابض للمدينة\n• حي الغوطيك: قلب برشلونة التاريخي من العصر الروماني\n• حي البورن: أكثر الأحياء فناً وحيوية\n• الميناء الأولمبي والشاطئ\n\n### الغذاء البرشلوني\n• سوق بوكيريا العريق — كل أنواع الطعام الطازج\n• تاباس وبان توماكيت (خبز الطماطم)\n• مأكولات البحر المتوسط الطازجة\n\n## غرناطة — قلب الأندلس الإسلامية\n\n### قصر الحمراء (الأكثر زيارةً في إسبانيا)\n• من أجمل القصور الإسلامية في تاريخ البشرية\n• قصر نصري بزخارفه الهندسية المذهلة\n• جنان العريف على الجانب الآخر\n• حدائق الجنرالفي المطلة على الحمراء\n• يُنصح بالحجز قبل أشهر\n\n### حي البيازين\n• الحي العربي التاريخي يقابل الحمراء\n• تراث يونسكو\n• المقاهي الأرابية والعطور الأندلسية\n• أجمل المناظر للحمراء من حي البيازين\n\n### المسجد الكبير الجديد في غرناطة\n• بُني حديثاً في الحي العربي\n• يطل على الحمراء مباشرة\n\n## إشبيلية\n• كاتدرائية إشبيلية وبرج الخيرالدة (المنارة الأندلسية المحولة)\n• قصر الموزراب (Real Alcázar) — تراث يونسكو\n• حي تريانا على ضفاف نهر الوادي الكبير\n• مهد رقصة الفلامنكو الأصيلة\n\n## قرطبة\n• المسجد الكبير قرطبة (الميسكيتا): تحفة معمارية إسلامية تحولت لكنيسة\n• مدينة مديناة الزهراء الأثرية — عاصمة الخلافة الأموية\n• الجسر الروماني على نهر الوادي الكبير\n\n## مدريد\n• متحف البرادو: من أعظم متاحف الفن في العالم\n• بوابة الشمس (بويرتا ديل سول) وقلب المدينة\n• متنزه ريتيرو الجميل\n• العتاق وأسواق الأحد\n\n## الشواطئ الإسبانية\n→ كوستا ديل سول (ملقة): أشهر شواطئ إسبانيا\n→ جزر الكناري: طقس مثالي طوال السنة\n→ كوستا برافا (قرب برشلونة): الأجمل\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): الأمثل لكل المدن\n→ الخريف (سبتمبر-أكتوبر): مناخ رائع وأسعار أقل\n→ الصيف: حار جداً في الجنوب (أندلس) لكن ممتاز على الشواطئ\n\n## نصائح للمسافر المسلم\n• المطاعم الحلال كثيرة في غرناطة وإشبيلية خاصة في الأحياء التاريخية\n• اعتنِ بزيارة المساجد التاريخية المحولة برؤية تاريخية\n\n## التكاليف التقريبية\n$ فندق 4 نجوم في برشلونة: 100-200 دولار\n$ وجبة تاباس: 10-20 دولار\n$ تذكرة الحمراء: 14-18 يورو\n$ بطاقة المترو برشلونة (10 تنقلات): 11 يورو",
    contentEn:"## Spain — Europe with an Andalusian Flavor\n\nSpain is an exceptional destination combining Islamic Andalusian heritage with modern European culture, finest food and most elegant beaches.\n\n## Barcelona — City of Arts and Architecture\n\n### Gaudi Masterpieces\n• Sagrada Familia: architectural masterpiece under construction since 1882 — UNESCO\n• Park Güell: colorful fantasy mosaic city\n\n### Barcelona Streets\n• La Rambla: the city's pulsing artery\n• Gothic Quarter: historic heart from Roman era\n• Born neighborhood: most artistic and lively\n\n## Granada — Heart of Islamic Andalusia\n\n### Alhambra Palace (Spain's most visited)\n• One of history's most beautiful Islamic palaces\n• Nasrid Palaces with stunning geometric decorations\n• UNESCO heritage\n• Book months in advance\n\n### Albaicin Quarter\n• Historic Arab neighborhood facing Alhambra\n• Arabic cafes and Andalusian perfumes\n\n## Seville\n• Cathedral and Giralda tower (converted Andalusian minaret)\n• Real Alcázar palace — UNESCO\n• Birthplace of authentic Flamenco dance\n\n## Córdoba\n• The Great Mosque (Mezquita): Islamic architectural masterpiece converted to church\n• Medina Azahara archaeological city — Umayyad Caliphate capital\n\n## Tips for Muslim Travelers\n• Halal restaurants abundant in Granada and Seville especially in historic quarters\n\n## Approximate Costs\n$ 4-star hotel in Barcelona: $100-200\n$ Tapas meal: $10-20\n$ Alhambra ticket: €14-18" },

  { id:"travel-italy", category:"travel", featured:true, date:"2026-06-05", readTime:10,
    titleAr:"إيطاليا — روما والبندقية وأمالفي | أجمل بلد في العالم",
    titleEn:"Italy — Rome, Venice and Amalfi | The World's Most Beautiful Country",
    excerptAr:"إيطاليا الكولوسيوم والفاتيكان وقنوات البندقية وساحل أمالفي وطعام لا يُوصف. كل مدينة فيها متحف حي.",
    excerptEn:"Italy — Colosseum, Vatican, Venice canals, Amalfi Coast and indescribable food. Every city is a living museum.",
    contentAr:"## إيطاليا — متحف العالم الحي\n\nإيطاليا تحتضن أكبر عدد من مواقع تراث يونسكو في العالم (58 موقعاً). كل مدينة فيها لوحة فنية مستقلة وتجربة تاريخية وثقافية لا تُنسى.\n\n## روما — المدينة الخالدة\n\n### المعالم الأسطورية\n• الكولوسيوم: الملعب الروماني الأشهر في تاريخ البشرية (72 ميلادي)\n• المنتدى الروماني: قلب الإمبراطورية الرومانية\n• نافورة تريفي: رمي عملة وتمنِّ الأمنية\n• بانتيون: معبد روماني محفوظ منذ 125 ميلادي\n• ساحة نابولي والسلالم الإسبانية\n\n### دولة الفاتيكان (داخل روما)\n• أصغر دولة في العالم مساحةً\n• كنيسة القديس بطرس: أعظم كنائس العالم المسيحي\n• متاحف الفاتيكان وسقف كنيسة سيستين لميكيلانجيلو\n• الجمهور مفتوح للجميع في الساحة\n\n## البندقية — المدينة العائمة\n• لا توجد سيارات في المدينة — فقط القنوات والقوارب\n• ركوب الغوندولا في القنوات: التجربة الأيقونية\n• جسر ريالتو وسوق السمك\n• ساحة القديس مرقس وكنيستها البيزنطية\n• حي مورانو: مصنع الزجاج الفينيسي الشهير\n• مهرجان البندقية المائي (فبراير)\n\n## فلورنسا — عاصمة النهضة الأوروبية\n• غاليريا أوفيتشي: من أعظم متاحف الفن في العالم (عباءة بوتيتشيلي وليوناردو)\n• كاتدرائية سانتا ماريا ديل فيوري وقبتها الشهيرة\n• جسر فيكيو فوق نهر أرنو\n• ميكيلانجيلو وتمثال داوود الأصلي\n• حديقة بوبولي الفاخرة\n\n## ميلانو — عاصمة الموضة والتصميم\n• آخر عشاء ليوناردو دافنشي (La Cena)\n• الدومو (كاتدرائية ميلانو): رائعة القوطية\n• أسبوع الموضة العالمي (يناير وسبتمبر)\n• منطقة برييرا للفن والمطاعم الراقية\n\n## نابولي والجنوب\n\n### ساحل أمالفي\n• أجمل ساحل في البحر المتوسط — تراث يونسكو\n• قرى الأكليرا وبوسيتانو وأمالفي ورافيلو\n• تتدلى البيوت الملونة على المنحدرات الشاهقة\n• زيارة بالقارب بين الخلجان\n\n### بومبيي\n• المدينة الرومانية المدفونة تحت رماد بركان فيزوف عام 79 ميلادي\n• من أهم المواقع الأثرية في التاريخ\n\n### كابري\n• جزيرة الحجر الأزرق الساحرة\n• الكهف الأزرق الشهير\n\n## الطعام الإيطالي — تجربة مقدسة\n• البيتزا نابولية الأصيلة (في نابولي)\n• الريزوتو والباستا الطازجة (في بولونيا وروما)\n• الجيلاتو — الآيس كريم الإيطالي\n• القهوة الإسبريسو الإيطالي\n• النبيذ والتراميسو\n\n## نصائح للمسافر المسلم\n• المطاعم الحلال متوفرة في روما وميلانو ولكن تحقق دائماً\n• مطاعم البيتزا كثيرة منها بدون لحوم\n\n## أفضل الأوقات\n→ الربيع (إبريل-يونيو): الأجمل والأهدأ\n→ الخريف (سبتمبر-أكتوبر): ممتاز وأسعار أقل من الصيف\n→ الشتاء: لروما والمتاحف — هادئ وأسعار منخفضة\n\n## التكاليف التقريبية\n$ فندق 3 نجوم في روما: 80-150 دولار\n$ وجبة في مطعم عادي: 15-30 دولار\n$ تذكرة الكولوسيوم: 16-22 يورو\n$ الغوندولا في البندقية: 80-100 يورو (حتى 6 أشخاص)",
    contentEn:"## Italy — The World's Living Museum\n\nItaly hosts the world's largest number of UNESCO World Heritage sites (58 sites). Every city is an independent masterpiece.\n\n## Rome — The Eternal City\n\n### Legendary Landmarks\n• Colosseum: history's most famous Roman arena (72 AD)\n• Roman Forum: heart of the Roman Empire\n• Trevi Fountain: throw a coin and make a wish\n• Pantheon: preserved Roman temple since 125 AD\n\n### Vatican City\n• World's smallest country\n• St. Peter's Basilica: greatest Christian church\n• Vatican Museums and Michelangelo's Sistine Chapel ceiling\n\n## Venice — The Floating City\n• No cars — only canals and boats\n• Gondola ride: the iconic experience\n• Rialto Bridge and fish market\n• St. Mark's Square and Byzantine basilica\n\n## Florence — Capital of the Renaissance\n• Uffizi Gallery: one of world's greatest art museums\n• Michelangelo and the original David statue\n\n## Amalfi Coast\n• Mediterranean's most beautiful coastline — UNESCO\n• Colorful houses clinging to steep cliffs\n\n## Italian Food — A Sacred Experience\n• Authentic Neapolitan pizza (in Naples)\n• Fresh pasta in Bologna and Rome\n• Gelato — Italian ice cream\n• Italian espresso\n\n## Approximate Costs\n$ 3-star hotel in Rome: $80-150\n$ Regular restaurant meal: $15-30\n$ Colosseum ticket: €16-22\n$ Gondola in Venice: €80-100 (up to 6 people)" },

  { id:"travel-greece", category:"travel", featured:false, date:"2026-06-05", readTime:8,
    titleAr:"اليونان — سانتوريني وأثينا وميكونوس | أساطير في الواقع",
    titleEn:"Greece — Santorini, Athens and Mykonos | Legends Come to Life",
    excerptAr:"اليونان مهد الحضارة الغربية. سانتوريني بغروبها الأشهر في العالم وأثينا بالأكروبوليس وجزر البحر الإيجي الساحرة.",
    excerptEn:"Greece — cradle of Western civilization. Santorini with the world's most famous sunset, Athens Acropolis and enchanting Aegean islands.",
    contentAr:"## اليونان — أسطورة حية\n\nاليونان مهد الديمقراطية والفلسفة والأولمبياد، وتمتلك من الجمال الطبيعي ما يجعلها دائماً في قمة قوائم الوجهات المفضلة عالمياً.\n\n## سانتوريني — أجمل جزيرة في العالم\n\n### إيا (أويا)\n• قرية ذات منازل زرقاء وبيضاء فوق منحدرات بركانية\n• غروب الشمس في إيا: ينتظره الناس من حول العالم\n• من أكثر المناطق تصويراً في العالم بلا منازع\n\n### فيرا\n• عاصمة الجزيرة وأكثرها حيوية\n• الطريق المشاة بين فيرا وإيا: من أجمل المشايات\n• المتحف الأثري وآثار مينوسية\n\n### الأنشطة\n• السباحة في شواطئ الرمال البركانية السوداء (بيريسا وكاماري)\n• رحلة بحرية للبركان النشط في المياه\n• الغطس في المياه الفيروزية\n• دروس صنع الخزف المحلي\n\n## أثينا — مهد الحضارة\n\n### الأكروبوليس\n• من أهم المواقع الأثرية في تاريخ البشرية\n• البارثينون: معبد الإلهة أثينا (447-438 ق.م)\n• متحف الأكروبوليس الحديث: تحفة معمارية\n\n### أحياء أثينا\n• حي مونستيراكي: سوق تراثي ومطاعم وحياة ليلية\n• حي بلاكا: أجمل الأحياء التاريخية\n• ميدان سينتاغما: قلب العاصمة\n\n### الغذاء اليوناني\n• سوفلاكي وجيروس: الأكلة الوطنية\n• الفتة والتزاتزيكي\n• أخطبوط مشوي على الجمر\n• موساكا وسبانكوبيتا\n\n## ميكونوس — جزيرة الحياة الليلية\n• معروفة بعماراتها الكيكلادية البيضاء والحيوية الليلية\n• شواطئ بارادايس وسوبر بارادايس\n• طواحين الهواء الشهيرة\n\n## رودس — فارس القرون الوسطى\n• قلعة فرسان القديس يوحنا الصليبية الأحسن حفظاً في العالم\n• المدينة القديمة تراث يونسكو\n• شاطئ ليندوس ومعبد أبوللو فوق المنحدر\n\n## كريت — الجزيرة الكبرى\n• قصر كنوسوس البطلي: مركز الحضارة المينوسية\n• جورج سامارييا: أجمل ممر جبلي في أوروبا\n• شاطئ إيلافونيسي الوردي الفريد\n\n## أفضل أوقات الزيارة\n→ مايو-يونيو وسبتمبر-أكتوبر: الأمثل — طقس رائع وأسعار معقولة\n→ يوليو-أغسطس: الأكثر ازدحاماً والأعلى أسعاراً\n\n## التكاليف التقريبية\n$ فندق في سانتوريني: 150-400 دولار (الموقع والإطلالة تحدد السعر)\n$ فندق في أثينا: 70-150 دولار\n$ عبّارة بين الجزر: 30-80 يورو\n$ وجبة في مطعم عادي: 12-25 يورو",
    contentEn:"## Greece — A Living Legend\n\nGreece is the cradle of democracy, philosophy and the Olympics, possessing natural beauty that keeps it at the top of global travel favorites.\n\n## Santorini — World's Most Beautiful Island\n\n### Oia\n• Village of blue and white houses above volcanic cliffs\n• Oia sunset: awaited by people from around the world\n• Undisputedly the world's most photographed area\n\n## Athens — Cradle of Civilization\n\n### Acropolis\n• One of history's most important archaeological sites\n• Parthenon: temple of goddess Athena (447-438 BC)\n\n### Athens Neighborhoods\n• Monastiraki: heritage market, restaurants, nightlife\n• Plaka: most beautiful historic district\n\n## Greek Food\n• Souvlaki and Gyros: the national dish\n• Grilled octopus\n• Moussaka and Spanakopita\n\n## Best Times\n→ May-June and September-October: ideal\n→ July-August: busiest and most expensive\n\n## Approximate Costs\n$ Hotel in Santorini: $150-400\n$ Hotel in Athens: $70-150\n$ Ferry between islands: €30-80\n$ Regular restaurant meal: €12-25" },

  { id:"travel-france-paris", category:"travel", featured:false, date:"2026-06-05", readTime:9,
    titleAr:"فرنسا — باريس ونورماندي وريفييرا | نور العالم",
    titleEn:"France — Paris, Normandy and Riviera | Light of the World",
    excerptAr:"باريس برج إيفل والمتاحف والأزياء والطعام الأرقى. جنوب فرنسا الريفييرا الفرنسية وكروم البروفانس وقلاع اللوار.",
    excerptEn:"Paris — Eiffel Tower, museums, fashion and finest food. Southern France Riviera, Provence vineyards and Loire castles.",
    contentAr:"## فرنسا — نور العالم\n\nفرنسا الوجهة السياحية الأولى في العالم بأكثر من 90 مليون زائر سنوياً. باريس وحدها كافية لتكون وجهة حلم، لكن الريف الفرنسي ليس أقل جمالاً.\n\n## باريس — مدينة النور\n\n### المعالم الأيقونية\n• برج إيفل: رمز فرنسا والأكثر زيارةً في العالم\n• متحف اللوفر: أكبر متحف فني في العالم (الموناليزا وغيرها)\n• متحف أورسيه: روائع الانطباعية (مونيه وفان غوخ)\n• كاتدرائية نوتردام: تعاد للحياة بعد حريق 2019\n• قوس النصر وشارع الشانزيليزيه\n• قصر فرساي: مقر الملك لويس الرابع عشر\n\n### أحياء باريس\n• مونمارتر: الحي الفني وكنيسة ساكريه كور\n• لو ماريه: حي اليهود التاريخي والفن المعاصر\n• سان جيرمان: قلب الحياة الفكرية الباريسية\n• الخامس (لاتيني): جامعة السوربون وأجواء الطلاب\n\n### تجارب باريسية فريدة\n• كروز نهر السين بالقوارب\n• تناول الإفطار في مقهى باريسي حقيقي\n• الجادة السادسة عشرة والتسوق\n• متحف أورسيه غروب الشمس\n\n## جنوب فرنسا\n\n### كوت دازور (الريفييرا الفرنسية)\n• نيس وكان وموناكو: الأرقى والأجمل\n• مونت كارلو والقصور\n• شواطئ البحر الأبيض المتوسط\n\n### بروفانس\n• حقول اللافندر الأرجوانية (يونيو-أغسطس)\n• أفينيون وقصر البابا\n• جسر بون فيزيت الأثري\n\n## قصور وادي اللوار\n• أكثر من 300 قصر ملكي على ضفاف النهر\n• شاتو دو شامبور: أضخم قصور اللوار\n• تراث يونسكو للوادي بأكمله\n\n## الطعام الفرنسي\n• الكروسان والخبز الفرنسي الطازج\n• الجبن الفرنسي — أكثر من 400 نوع\n• الكيش والفوا غرا والكريب\n• الشوكولاته والحلويات الفرنسية\n\n## نصائح للمسافر المسلم\n• المطاعم الحلال متوفرة بكثرة في باريس خاصة في أحياء الهجرة\n• الأحياء الشمالية (لابس وباربيس) بها أسواق عربية ومطاعم حلال\n\n## أفضل الأوقات\n→ الربيع (إبريل-يونيو): الأجمل في باريس\n→ الخريف (سبتمبر-نوفمبر): أهدأ وأسعار أقل\n→ الصيف: الأعلى ازدحاماً ولكن المهرجانات كثيرة\n\n## التكاليف التقريبية\n$ فندق 3 نجوم في باريس: 120-200 دولار\n$ وجبة في مطعم متوسط: 20-40 يورو\n$ تذكرة اللوفر: 17 يورو\n$ تذكرة برج إيفل (للقمة): 29 يورو",
    contentEn:"## France — Light of the World\n\nFrance is the world's top tourist destination with over 90 million visitors annually. Paris alone is enough to be a dream destination.\n\n## Paris — City of Light\n\n### Iconic Landmarks\n• Eiffel Tower: France's symbol and world's most visited\n• Louvre Museum: world's largest art museum (Mona Lisa and more)\n• Musée d'Orsay: Impressionism masterpieces\n• Notre-Dame Cathedral: being revived after 2019 fire\n• Arc de Triomphe and Champs-Élysées\n• Palace of Versailles: home of King Louis XIV\n\n### Parisian Experiences\n• Seine River cruise\n• Breakfast in a real Parisian café\n\n## Southern France\n\n### Côte d'Azur (French Riviera)\n• Nice, Cannes and Monaco: most upscale and beautiful\n• Monte Carlo and palaces\n\n### Provence\n• Purple lavender fields (June-August)\n\n## Loire Valley Castles\n• Over 300 royal castles on river banks\n• UNESCO heritage for entire valley\n\n## Tips for Muslim Travelers\n• Halal restaurants abundant in Paris especially in immigrant neighborhoods\n\n## Approximate Costs\n$ 3-star Paris hotel: $120-200\n$ Mid-range restaurant: €20-40\n$ Louvre ticket: €17\n$ Eiffel Tower (top): €29" },

  { id:"travel-jordan", category:"travel", featured:false, date:"2026-06-05", readTime:8,
    titleAr:"الأردن — البتراء والبحر الميت وواديرم | روح الشرق",
    titleEn:"Jordan — Petra, Dead Sea and Wadi Rum | Soul of the East",
    excerptAr:"الأردن كنز أثري وطبيعي بلا منافس. البتراء إحدى عجائب الدنيا ووادي رم الصحراء المريخية والبحر الميت الأدنى نقطة على الأرض.",
    excerptEn:"Jordan is an unmatched archaeological and natural treasure. Petra is a Wonder of the World, Wadi Rum the Martian desert and the Dead Sea the lowest point on Earth.",
    contentAr:"## الأردن — الكنز المخفي في قلب الشرق\n\nتُعد المملكة الأردنية الهاشمية من أأمن وجهات الشرق الأوسط وأغناها تاريخياً، تجمع بين حضارات لا تُحصى وطبيعة متنوعة استثنائية.\n\n## البتراء — عجبة الدنيا\n• إحدى عجائب الدنيا السبع الجديدة وتراث يونسكو\n• مدينة محفورة في الصخر الوردي بنتها الأنباط قبل 2000 سنة\n• الخزنة (Al-Khazneh): الواجهة الأشهر تُستكشف عبر ممر السيق الضيق\n• الدير: معبد ضخم يتطلب تسلق 800 درجة\n• المسرح النبطي المحفور في الصخر (7,000 مقعد)\n• البتراء بالليل: الآلاف من الشموع تضيء الطريق للخزنة (ثلاث ليالٍ أسبوعياً)\n• تستطيع قضاء يومين كاملين بدون رؤية كل شيء\n\n## وادي رم — الصحراء المريخية\n• أكثر الصحاري إثارةً في العالم — مواقع تصوير فيلم المريخي والعقيد لورنس\n• جبال حمراء شاهقة وكثبان رملية ذهبية\n• الإقامة في الخيام الفاخرة تحت النجوم (Bubble Tent)\n• رحلات الجيب وركوب الجمال\n• جبال مضللة ووادي عملاق وكهوف رسوم صخرية\n\n## البحر الميت\n• أخفض نقطة على سطح الأرض (-430 متر)\n• المياه الأكثر ملوحة في العالم — لا تستطيع الغرق\n• الطفو الطبيعي تجربة لا تُنسى\n• الطين الأسود العلاجي الشهير\n• منتجعات سبا فاخرة على الشاطئ\n\n## عمّان — العاصمة العريقة\n• مبنية على سبعة تلال مثل روما\n• قلعة عمّان: آثار رومانية وبيزنطية وأموية\n• المدرج الروماني: يتسع لـ 6,000 شخص\n• منطقة الرابية والعبدلي الحديثة\n• ساحة الرأي والبلد — قلب عمّان القديمة\n\n## جرش — بومبيي الشرق\n• أفضل مدينة رومانية محفوظة خارج إيطاليا\n• الشارع المعمد والمدرج الشمالي والقوس الظافر\n• مهرجان جرش الصيفي السنوي\n\n## أقبة والبحر الأحمر\n• الغوص في شعاب مرجانية من الأجمل في العالم\n• الموقع الاستراتيجي بين البحر الأحمر وصحراء وادي رم\n\n## أفضل الأوقات\n→ الربيع (مارس-مايو): الأمثل لكل الأنشطة\n→ الخريف (سبتمبر-نوفمبر): رائع ومعتدل\n→ الشتاء: للبحر الميت والبتراء بأسعار منخفضة\n\n## التكاليف التقريبية\n$ تذكرة البتراء (يوم): 50 دينار أردني (70 دولار)\n$ فندق 4 نجوم في عمّان: 60-120 دولار\n$ ليلة في خيمة وادي رم: 80-200 دولار\n$ رحلة جيب وادي رم (نصف يوم): 25-50 دولار",
    contentEn:"## Jordan — The Hidden Treasure of the East\n\nThe Hashemite Kingdom of Jordan is one of the Middle East's safest and most historically rich destinations.\n\n## Petra — Wonder of the World\n• One of the New Seven Wonders and UNESCO heritage\n• City carved in pink rock built by Nabataeans 2000 years ago\n• The Treasury (Al-Khazneh): most famous facade discovered through the narrow Siq corridor\n• Petra by Night: thousands of candles light the way to the Treasury\n\n## Wadi Rum — The Martian Desert\n• World's most thrilling desert — filming location for The Martian and Lawrence of Arabia\n• Towering red mountains and golden sand dunes\n• Staying in luxury tents under stars (Bubble Tent)\n\n## Dead Sea\n• Earth's lowest point (-430 meters)\n• World's saltiest water — you cannot sink\n• Natural floating — an unforgettable experience\n\n## Jerash — Pompeii of the East\n• Best preserved Roman city outside Italy\n\n## Approximate Costs\n$ Petra ticket (1 day): 50 JD ($70)\n$ 4-star hotel in Amman: $60-120\n$ Night in Wadi Rum tent: $80-200" },

  { id:"travel-azerbaijan", category:"travel", featured:false, date:"2026-06-05", readTime:7,
    titleAr:"أذربيجان باكو — المدينة النارية بين أوروبا وآسيا",
    titleEn:"Azerbaijan Baku — The City of Fire Between Europe and Asia",
    excerptAr:"باكو المدينة الحديثة المذهلة على بحر قزوين مع أبراج اللهب الأيقونية والمدينة القديمة التراثية وطبيعة استثنائية.",
    excerptEn:"Baku — stunning modern city on the Caspian Sea with iconic Flame Towers, UNESCO old city and exceptional nature.",
    contentAr:"## أذربيجان — أرض النار\n\nأذربيجان وجهة آسيوية-أوروبية فريدة تجمع الحداثة المعمارية المذهلة بالتراث القوقازي العريق، وتحظى باهتمام متزايد من السياح العرب.\n\n## باكو — اللؤلؤة على بحر قزوين\n\n### الأحياء الحديثة\n• أبراج اللهب (Flame Towers): الرمز الأبرز لباكو — ثلاثة أبراج ضخمة مصممة بشكل شعلة نار\n• كورنيش باكو: مشاية بحرية طويلة على بحر قزوين\n• مركز حيدر علييف: تحفة معمارية للمصممة زها حديد\n• تلة شهداء: منظر بانورامي كامل على المدينة والبحر\n\n### المدينة القديمة (إيتشري شهير)\n• مدرجة على قائمة تراث يونسكو\n• قلعة الصخرة القديمة\n• برج العذراء الأسطوري من القرن الثاني عشر\n• أزقة حجرية ضيقة ومنازل تاريخية\n• قصر شيروانشاه — مجمع قصور العصور الوسطى\n\n## وجهات خارج باكو\n\n### غوبوستان\n• متحف الرسوم الصخرية البدائية على بُعد 60 كم\n• تراث يونسكو\n• براكين الطين المبردة الغريبة القريبة منه\n\n### غاباللا\n• مدينة جبلية خلابة\n• الكابل كار لقمة الجبل\n• متنزه غاباللا وألعاب المغامرة\n• مثالية للهروب من حر المدينة\n\n### شكي\n• مدينة تاريخية وسط الجبال\n• قصر شكي خان المبهج بالفسيفساء والنقوش\n• الحرير الشكي الشهير\n\n## لماذا أذربيجان للعرب؟\n• لا تحتاج تأشيرة لكثير من الجنسيات العربية (eVisa سهلة)\n• ثقافة مسلمة مع انفتاح كبير\n• لغة أذرية قريبة من التركية\n• تكاليف معيشة منخفضة جداً\n• رحلات مباشرة من دول الخليج والعراق\n\n## أفضل أوقات الزيارة\n→ الربيع (مارس-مايو): بلوم الطبيعة وطقس مثالي\n→ الصيف (يونيو-أغسطس): حار في باكو لكن رائع في الجبال\n→ الخريف (سبتمبر-نوفمبر): ألوان خريفية استثنائية\n\n## التكاليف التقريبية\n$ فندق 4 نجوم في باكو: 50-100 دولار\n$ وجبة في مطعم متوسط: 8-15 دولار\n$ تذكرة كابل كار غاباللا: 10-15 دولار",
    contentEn:"## Azerbaijan — Land of Fire\n\nAzerbaijan is a unique Asian-European destination combining stunning modern architecture with ancient Caucasian heritage.\n\n## Baku — Pearl on the Caspian\n\n### Modern Areas\n• Flame Towers: Baku's most prominent symbol — three massive towers designed as flames\n• Baku Boulevard: long seafront promenade on the Caspian\n• Heydar Aliyev Center: architectural masterpiece by Zaha Hadid\n\n### Old City (Icherisheher)\n• UNESCO World Heritage\n• Maiden Tower — legendary 12th-century tower\n• Shirvanshah Palace — medieval palace complex\n\n## Outside Baku\n\n### Gobustan\n• Primitive rock art museum — UNESCO heritage\n• Nearby cold mud volcanoes\n\n### Gabala\n• Beautiful mountain city\n• Cable car to mountaintop\n\n## Why Azerbaijan for Arabs?\n• No visa needed for many Arab nationalities (easy eVisa)\n• Muslim culture with great openness\n• Very low cost of living\n• Direct flights from Gulf countries and Iraq\n\n## Approximate Costs\n$ 4-star hotel in Baku: $50-100\n$ Mid-range restaurant: $8-15" },

  { id:"travel-bosnia", category:"travel", featured:false, date:"2026-06-05", readTime:7,
    titleAr:"البوسنة والهرسك — سراييفو وموستار | أوروبا بقلب إسلامي",
    titleEn:"Bosnia and Herzegovina — Sarajevo and Mostar | Europe with an Islamic Heart",
    excerptAr:"سراييفو المدينة الوحيدة في أوروبا التي تسمع فيها الأذان وترى الكنيسة والكاتدرائية والمسجد والكنيس في شارع واحد.",
    excerptEn:"Sarajevo — Europe's only city where you hear the adhan and see a church, cathedral, mosque and synagogue on one street.",
    contentAr:"## البوسنة والهرسك — جوهرة البلقان\n\nتُعد البوسنة وجهة آسرة تجمع الروح الإسلامية بالهوية الأوروبية في مزيج فريد لا يوجد في أي مكان آخر على الأرض.\n\n## سراييفو — القدس الأوروبية\n\n### باشارشيا (السوق القديم)\n• القلب النابض للمدينة القديمة — سوق عثماني يعود لـ1462\n• جامع الغازي خسرو بك: أعظم المساجد العثمانية في البلقان\n• نافورة سيبيليا التراثية\n• حرفيو النحاس والأقمشة والتقاليد\n\n### التعايش الديني الفريد\n• في شارع واحد: مسجد، كنيسة كاثوليكية، كاتدرائية أرثوذكسية، كنيس يهودي\n• أُطلق عليها القدس الأوروبية لتنوعها الديني المذهل\n\n### تاريخ المدينة\n• ملتقى حضارات العالم\n• متحف حصار سراييفو (1992-1995)\n• الجسر الذي اغتيل فيه الأرشيدوق فرانز فرديناند عام 1914\n\n## موستار — جسر الحياة\n• جسر ستاري موست العثماني (1566) المُعاد بناؤه — تراث يونسكو\n• يقفز الشباب المحليون من ارتفاع 21 متراً في النهر الأزرق\n• المدينة القديمة وأسواقها التراثية\n• الحرف البوسنية اليدوية\n\n## الطبيعة والجبال\n• بيلياشنيتسا: جبل تزلج يطل على سراييفو\n• كونيتش وكانيون نهر نيريتفا\n• كراليشا: جبال خضراء رائعة\n\n## لماذا البوسنة للسياح المسلمين؟\n• الأذان يُرفع في كل مكان\n• الطعام الحلال في كل المطاعم تقريباً\n• الناس مضيافون بشكل استثنائي\n• لا تأشيرة لكثير من الجنسيات العربية\n• أسعار منخفضة جداً مقارنة بأوروبا الغربية\n\n## أفضل الأوقات\n→ الربيع والصيف: للطبيعة والتجوال\n→ الشتاء: للتزلج في بيلياشنيتسا\n\n## التكاليف التقريبية\n$ فندق 4 نجوم في سراييفو: 50-90 دولار\n$ وجبة في مطعم جيد: 8-15 دولار\n$ جولة مشاية في المدينة: مجانية",
    contentEn:"## Bosnia and Herzegovina — Balkan Gem\n\nBosnia is a captivating destination combining Islamic spirit with European identity in a unique blend found nowhere else on Earth.\n\n## Sarajevo — The Jerusalem of Europe\n\n### Baščaršija (Old Market)\n• City's vibrant old heart — Ottoman market dating to 1462\n• Gazi Husrev-beg Mosque: greatest Ottoman mosque in the Balkans\n\n### Unique Religious Coexistence\n• On one street: mosque, Catholic church, Orthodox cathedral, Jewish synagogue\n• Called Jerusalem of Europe for its remarkable religious diversity\n\n## Mostar — Bridge of Life\n• Stari Most Ottoman bridge (1566) rebuilt — UNESCO heritage\n• Local youth jump from 21 meters into the blue river\n\n## Why Bosnia for Muslim Tourists?\n• Adhan heard everywhere\n• Halal food in almost all restaurants\n• Exceptionally hospitable people\n• No visa for many Arab nationalities\n• Very low prices compared to Western Europe\n\n## Approximate Costs\n$ 4-star hotel in Sarajevo: $50-90\n$ Good restaurant meal: $8-15" },

  { id:"travel-albania", category:"travel", featured:false, date:"2026-06-05", readTime:6,
    titleAr:"ألبانيا — أوروبا المخفية التي لم تكتشفها بعد",
    titleEn:"Albania — The Hidden Europe You Haven't Discovered Yet",
    excerptAr:"ألبانيا شواطئ المتوسط البكر والجبال الدرامية وتيرانا النابضة — كل هذا بأسعار لا تصدق وحشود سياحية معدومة.",
    excerptEn:"Albania — pristine Mediterranean beaches, dramatic mountains and vibrant Tirana — all at unbelievable prices with almost no tourist crowds.",
    contentAr:"## ألبانيا — الكنز الأوروبي غير المكتشف\n\nتُعد ألبانيا من أسرع الوجهات الأوروبية نمواً سياحياً، تجمع شواطئ المتوسط المعروفة مع تكاليف أقل بكثير من كرواتيا أو إيطاليا المجاورتين.\n\n## تيرانا — العاصمة الملونة\n• ساحة سكندربيغ: قلب العاصمة الصاخب\n• مسجد اتحيم بي: رمز الإسلام في ألبانيا\n• بونكر الديكتاتور هوكسا وتحوله لمتحف\n• الحي الجديد (Blloku): أكثر أحياء تيرانا حيوية\n• متحف الأوبونتوس وجداريات الفن الشعبي\n\n## ساحل البحر الأبيض المتوسط\n\n### ريفييرا الألبانية\n• شواطئ بكر لم تستوطنها بعد الفنادق الضخمة\n• كيميرا وهيمارا وسارانده\n• مياه فيروزية نقية تنافس كرواتيا بأسعار أقل 3-4 مرات\n\n### بوتريت (تراث يونسكو)\n• أثرية قديمة على ضفاف البحيرة\n• قلعة فوق التل وملاعب رومانية\n\n## ألبانيا الجبلية\n• جبال الألب الألبانية في الشمال: تسلق ومشي في طبيعة استثنائية\n• تيث وفالبونه: قرى جبلية عريقة\n• وادي ثيث: من أجمل الأودية في أوروبا\n\n## لماذا ألبانيا؟\n• أسعار لا تصدق — من أرخص دول أوروبا\n• لا تأشيرة لمعظم الجنسيات العربية في الصيف\n• سكان مسلمون في الأغلب — ترحيب استثنائي بالعرب\n• لا ازدحام سياحي بعد\n\n## التكاليف التقريبية\n$ فندق 4 نجوم: 40-80 دولار\n$ وجبة ممتازة: 6-12 دولار\n$ إيجار سيارة/يوم: 25-40 دولار",
    contentEn:"## Albania — Undiscovered European Treasure\n\nAlbania is one of Europe's fastest-growing tourist destinations, combining Mediterranean beaches with much lower costs than neighboring Croatia or Italy.\n\n## Tirana — The Colorful Capital\n• Skanderbeg Square: the vibrant capital center\n• Colorful murals and lively Blloku neighborhood\n\n## Albanian Riviera\n• Pristine beaches not yet overrun by large hotels\n• Ksamil, Himara and Sarande\n• Turquoise pure waters rivaling Croatia at 3-4x lower prices\n\n## Why Albania?\n• Unbelievable prices — among Europe's cheapest\n• No visa for most Arab nationalities in summer\n• Majority Muslim population — exceptional welcome for Arabs\n• No tourist crowds yet\n\n## Approximate Costs\n$ 4-star hotel: $40-80\n$ Excellent meal: $6-12\n$ Car rental/day: $25-40" },

  { id:"travel-srilanka", category:"travel", featured:false, date:"2026-06-05", readTime:7,
    titleAr:"سريلانكا — جوهرة المحيط الهندي بين الشاي والأفيال",
    titleEn:"Sri Lanka — Indian Ocean Gem Between Tea and Elephants",
    excerptAr:"سريلانكا صخرة سيجيريا وحدائق الشاي ومحمية الأفيال والشواطئ الذهبية والمعابد البوذية — في مساحة صغيرة لا يُصدق.",
    excerptEn:"Sri Lanka — Sigiriya Rock, tea gardens, elephant sanctuary, golden beaches and Buddhist temples — in an unbelievably small area.",
    contentAr:"## سريلانكا — اللؤلؤة الآسيوية\n\nرغم صغر مساحتها، تحتضن سريلانكا تنوعاً طبيعياً وثقافياً مذهلاً يجعلها وجهة مثالية لمحبي المغامرة والطبيعة والتاريخ.\n\n## صخرة سيجيريا\n• قلعة ملكية فوق صخرة بركانية ترتفع 200 متر\n• تراث يونسكو\n• لوحات جدارية من القرن الخامس\n• المشي 1,200 درجة للوصول للقمة\n• المنظر من القمة: غابات خضراء ممتدة حتى الأفق\n\n## حدائق الشاي في كاندي\n• سريلانكا من أكبر منتجي الشاي في العالم\n• مدرجات خضراء تملأ التلال\n• جولات في مصانع الشاي ومشاهدة عملية الإنتاج\n• كانوبي وولك فوق الغابة\n\n## محمية أفيال أودا والبا\n• أكبر تجمع للأفيال في آسيا\n• مشاهدة مئات الأفيال في موسم التجمع الموسمي\n\n## المعابد البوذية\n• معبد السن في كانديGold: يحتضن سن بوذا المقدسة\n• دامبولا: معبد كهفي ببوذا ذهبي عملاق\n\n## الشواطئ\n→ الجانب الغربي والجنوبي: أبيضو فيروزي\n→ سواحل أرواغام باي: مفضلة ركوب الأمواج\n→ ترينكومالي: شمال شرق — من أجمل مواني العالم\n\n## أفضل الأوقات\n→ الجانب الغربي والجنوبي: نوفمبر-إبريل\n→ الجانب الشرقي: مايو-سبتمبر\n\n## التكاليف التقريبية\n$ فندق 4 نجوم: 60-120 دولار\n$ وجبة محلية: 3-8 دولار\n$ رحلة يومية كاملة: 40-70 دولار",
    contentEn:"## Sri Lanka — Asian Pearl\n\nDespite its small size, Sri Lanka hosts amazing natural and cultural diversity making it ideal for adventure, nature and history lovers.\n\n## Sigiriya Rock\n• Royal fortress atop 200-meter volcanic rock\n• UNESCO heritage\n• 5th-century murals\n• 1,200 steps to reach the summit\n\n## Kandy Tea Gardens\n• Sri Lanka is one of the world's largest tea producers\n• Green terraces covering the hills\n\n## Udawalawa Elephant Sanctuary\n• Asia's largest elephant gathering\n\n## Best Times\n→ West and south coast: November-April\n→ East coast: May-September\n\n## Approximate Costs\n$ 4-star hotel: $60-120\n$ Local meal: $3-8\n$ Full-day trip: $40-70" },

  { id:"travel-vietnam", category:"travel", featured:false, date:"2026-06-05", readTime:8,
    titleAr:"فيتنام — هالونغ باي وهوي أن وهانوي | آسيا بنكهة مختلفة",
    titleEn:"Vietnam — Ha Long Bay, Hoi An and Hanoi | Asia with a Different Flavor",
    excerptAr:"فيتنام خليج هالونغ بالناطحات الجيرية وهوي أن المدينة الفانوسية وهانوي العاصمة المزدحمة. آسيا بأسعار لا تُصدق.",
    excerptEn:"Vietnam — Ha Long Bay limestone towers, lantern city Hoi An and bustling Hanoi. Asia at unbelievable prices.",
    contentAr:"## فيتنام — آسيا الحقيقية\n\nفيتنام من أسرع الوجهات السياحية نمواً في آسيا، تجمع بين الطبيعة الاستثنائية والتاريخ الغني والطعام الاستثنائي والتكاليف المنخفضة جداً.\n\n## خليج هالونغ (تراث يونسكو)\n• من أجمل مناظر الطبيعة في العالم بلا جدال\n• 1,969 جزيرة وكتلة صخرية جيرية تنبثق من المياه الخضراء\n• رحلات المبيت على القوارب (Cruise) بين الجزر\n• الكهوف الضخمة كالكهف المضيء (Sửng Sốt)\n• كاياك بين الصخور والمغارات\n• شروق الشمس من القارب وسط الضباب\n\n## هوي أن — المدينة الفانوسية\n• مدينة قديمة تراث يونسكو محفوظة منذ القرنين الخامس عشر والسادس عشر\n• الفوانيس الملونة تضيء كل شارع في الليل\n• خياطة ملابس بالمقاس خلال 24 ساعة\n• جسر الفانوس اليابانية التاريخي\n• مهرجان الفوانيس في كل ليلة بدر\n\n## هانوي — العاصمة التاريخية\n• بحيرة هوان كيم في قلب المدينة\n• الحي القديم ذو الـ 36 شارع الحرفي\n• متحف هو تشي منه\n• حديقة حلبة القتال المياه\n\n## هوشيمن (سايغون) — المدينة النابضة\n• المدينة الأكثر ازدحاماً ونشاطاً\n• أنفاق كيوتشي الحربية التاريخية\n• بورصة المباني الاستعمارية الفرنسية\n\n## رحلات الطبيعة\n→ سابا: مدرجات الأرز في الشمال وقبائل الأقليات\n→ فونغ نها: أطول كهف في العالم (Son Doong)\n→ فو كووك: جزيرة شاطئية استوائية\n\n## الطعام الفيتنامي\n• فو (Phở): حساء الشعيرية الشهير\n• باه مي: ساندويتش الخبز الفرنسي\n• أكل الشارع لا مثيل له في آسيا\n\n## أفضل الأوقات\n→ الشمال (هانوي وهالونغ): أكتوبر-إبريل\n→ الوسط (هوي أن): فبراير-إبريل\n→ الجنوب: نوفمبر-إبريل\n\n## التكاليف التقريبية\n$ فندق 4 نجوم: 40-80 دولار\n$ رحلة هالونغ ليلتان: 100-200 دولار\n$ وجبة شارع: 2-5 دولار",
    contentEn:"## Vietnam — Real Asia\n\nVietnam is one of Asia's fastest-growing tourist destinations, combining exceptional nature, rich history, extraordinary food and very low costs.\n\n## Ha Long Bay (UNESCO)\n• Undeniably one of the world's most beautiful natural landscapes\n• 1,969 limestone islands rising from green waters\n• Overnight boat cruises between islands\n• Kayaking through rocks and caves\n\n## Hoi An — Lantern City\n• UNESCO Old Town preserved from 15th-16th centuries\n• Colorful lanterns illuminating every street at night\n• Tailored clothes made to measure in 24 hours\n• Lantern festival on every full moon night\n\n## Hanoi — Historic Capital\n• Hoan Kiem Lake in city center\n• Old Quarter with 36 craft streets\n\n## Nature Trips\n→ Sapa: northern rice terraces and ethnic minority villages\n→ Phong Nha: world's longest cave (Son Doong)\n\n## Best Times\n→ North (Hanoi, Ha Long): October-April\n→ South: November-April\n\n## Approximate Costs\n$ 4-star hotel: $40-80\n$ Ha Long 2-night cruise: $100-200\n$ Street food meal: $2-5" },

];

/* ═══════════════════════════════════════════════════════════════
   ALKOWN GROUP — Complete Bilingual Luxury Corporate Website
   الكون · Luxury · Minimal · Modern Arabic Corporate
═══════════════════════════════════════════════════════════════ */

// ── TRANSLATIONS ──────────────────────────────────────────────
const T = {
  en: {
    dir: "ltr",
    lang: "EN",
    switchLabel: "عربي",
    nav: {
      home: "Home", travel: "Travel & Tourism",
      "visa-center": "Visa Center",
      residency: "Residency Programs",
      "company-formation": "Company Formation",
      knowledge: "Knowledge Center",
      about: "About Us", contact: "Contact",
      book: "Book Consultation", dashboard: "Dashboard",
      student: "Student Portal", citizenship: "Citizenship",
      advertising: "Advertising", academy: "Academy",
    },
    hero: {
      badge: "Premium Global Services",
      h1: "Global Travel, Visas\n& Residency Solutions",
      sub: "Visa Services  ·  Residency Programs  ·  Company Formation  ·  Travel & Tourism",
      cta1: "Check Visa Requirements", cta2: "Apply Now"
    },
    about: {
      label: "Who We Are",
      h2: "A Premium Consultancy\nBuilt on Trust",
      p: "Alkown Group is a UAE-based premium corporate group delivering world-class services in travel, citizenship, branding, and education. We combine local expertise with global reach to deliver results that exceed expectations — with full transparency and VIP attention at every step.",
      stat1v: "5,000+", stat1l: "Clients Served",
      stat2v: "15+", stat2l: "Countries",
      stat3v: "98%", stat3l: "Success Rate",
      stat4v: "10+", stat4l: "Years of Excellence"
    },
    divisions: {
      label: "Our Divisions",
      h2: "Four Pillars of Excellence",
      cards: [
        { icon: "✈", title: "Travel & Visas", sub: "Global Mobility", desc: "Tourist, business & investor visas · VIP travel services · Flight & hotel booking · Airport concierge", cta: "Explore" },
        { icon: "🌍", title: "Citizenship Programs", sub: "Global Residency", desc: "Second passport programs · Residency by investment · Investor immigration · Country comparison", cta: "Explore" },
        { icon: "◈", title: "Advertising Agency", sub: "Creative Excellence", desc: "Brand identity · Social media · Motion graphics · Video production · Marketing campaigns", cta: "Explore" },
        { icon: "🎓", title: "Skills Academy", sub: "Premium Education", desc: "Language courses · Business skills · Digital training · Certified online programs · Mentorship", cta: "Explore" }
      ]
    },
    why: {
      label: "Why Choose Us",
      h2: "The Alkown Difference",
      items: [
        { icon: "⚡", title: "Fast Processing", desc: "Streamlined procedures with rapid turnaround times and minimal paperwork." },
        { icon: "🤝", title: "Global Partnerships", desc: "Trusted relationships with institutions, embassies, and agencies worldwide." },
        { icon: "🛡", title: "100% Confidential", desc: "Your privacy and security are fully protected at every stage." },
        { icon: "👑", title: "VIP Experience", desc: "Personalized concierge service tailored from start to finish." },
        { icon: "📋", title: "Full Compliance", desc: "All services are fully licensed and legally compliant with UAE regulations." },
        { icon: "💬", title: "24/7 Support", desc: "A dedicated multilingual team always available to serve you." }
      ]
    },
    testimonials: {
      label: "Client Stories",
      h2: "Words from Our Clients",
      items: [
        { name: "Ahmed Al Mansouri", role: "Business Investor, Dubai", text: "Alkown Group handled my UAE company formation and investor visa seamlessly. Professional, fast, and absolutely trustworthy. I highly recommend their services to any serious investor." },
        { name: "Sarah Johnson", role: "Visa Client, London", text: "The team processed my investor visa in record time with clear communication throughout. I never felt lost — every step was explained and handled with true professionalism." },
        { name: "Mohammed Al Rashid", role: "Academy Student, Riyadh", text: "The Skills Academy transformed my career path. World-class instructors, modern curriculum, and an incredible learning experience. I earned my certification in just 8 weeks." }
      ]
    },
    cta: {
      h2: "Ready to Begin\nYour Journey?",
      sub: "Book a free consultation with our experts — no obligation, pure guidance.",
      btn1: "Book Consultation", btn2: "WhatsApp Us Now"
    },
    footer: {
      tagline: "Your trusted partner for a better future",
      qlinks: "Quick Links", services: "Services", contact: "Contact Us",
      newsletter: "Newsletter", nlSub: "Stay updated with our latest offers & insights",
      nlPh: "Your email address", subscribe: "Subscribe",
      copy: "© 2026 Alkown Global. All rights reserved.",
      address: "Istanbul · Dubai · Aleppo",
      phone: "+90 534 764 1249 | +971 54 490 9522 | +963 980 631 952",
      email: "info@alkownglobal.com",
      social: "@alkown.global — Instagram & Facebook",
      license: ""
    },
    travel: {
      hero: "Travel & Visas",
      heroSub: "Discover the World with Alkown",
      intro: "Whether you're planning a holiday, expanding your business globally, or seeking investment-grade travel solutions, Alkown Group offers end-to-end travel and visa services with VIP handling.",
      services: [
        { icon: "🛂", title: "Tourist Visas", desc: "Smooth visa processing for top destinations worldwide" },
        { icon: "💼", title: "Business Visas", desc: "Professional support for corporate travel and meetings" },
        { icon: "💰", title: "Investor Visas", desc: "Full assistance for investor and entrepreneur visa programs" },
        { icon: "✈", title: "Flight Booking", desc: "Premium flight booking — economy, business & private jets" },
        { icon: "🏨", title: "Hotel Booking", desc: "Curated luxury hotel reservations worldwide" },
        { icon: "👑", title: "VIP Assistance", desc: "Airport concierge, fast-track, and VIP lounge access" }
      ]
    },
    citizenship: {
      hero: "Citizenship Programs",
      heroSub: "Your Path to Global Mobility",
      intro: "Alkown Group specializes in premium citizenship and residency-by-investment programs. Our legal experts guide you through the entire process — from program selection to passport delivery.",
      programs: [
        { flag: "🇵🇹", name: "Portugal", type: "Golden Visa", min: "€28,000", time: "5-8 months" },
        { flag: "🇬🇷", name: "Greece", type: "Golden Visa", min: "€250,000", time: "6-12 months" },
        { flag: "🇲🇹", name: "Malta", type: "Citizenship", min: "€690,000", time: "12-24 months" },
        { flag: "🇦🇪", name: "UAE", type: "Golden Visa", min: "AED 2M", time: "30-60 days" },
        { flag: "🇨🇾", name: "Cyprus", type: "Residency", min: "€300,000", time: "2-3 months" },
        { flag: "🇧🇧", name: "Caribbean", type: "Citizenship", min: "$100,000", time: "3-6 months" }
      ],
      services: ["Second Passport Programs", "Residency by Investment", "Investor Immigration", "Country Comparison", "Legal Consultation", "Document Preparation", "Application Tracking", "Post-approval Support"]
    },
    advertising: {
      hero: "Advertising Agency",
      heroSub: "Creative Excellence Meets Strategy",
      intro: "Alkown Advertising is a full-service creative agency blending luxury aesthetics with data-driven performance. We build brands that inspire, campaigns that convert, and content that resonates.",
      services: [
        { icon: "◈", title: "Brand Identity", desc: "Logo, visual identity & brand guidelines" },
        { icon: "📱", title: "Social Media", desc: "Strategy, content creation & community management" },
        { icon: "🎬", title: "Motion Graphics", desc: "Premium animation and motion design" },
        { icon: "🎥", title: "Video Production", desc: "Corporate films, ads & cinematic content" },
        { icon: "🖥", title: "UI/UX Design", desc: "Beautiful, conversion-focused digital interfaces" },
        { icon: "📊", title: "Marketing Campaigns", desc: "Integrated multi-channel marketing strategy" },
        { icon: "🌐", title: "Web Development", desc: "Premium websites and web applications" },
        { icon: "✍", title: "Content Strategy", desc: "Bilingual copywriting and content planning" }
      ]
    },
    academy: {
      hero: "Skills Academy",
      heroSub: "Learn. Grow. Succeed.",
      intro: "Alkown Skills Academy offers professional development programs designed for the modern world. Learn from industry experts, earn recognized certifications, and transform your career.",
      courses: [
        { icon: "🗣", title: "Business English", level: "All Levels", weeks: 8, cert: true },
        { icon: "📢", title: "Digital Marketing", level: "Beginner–Advanced", weeks: 10, cert: true },
        { icon: "🎨", title: "Graphic Design", level: "Beginner–Pro", weeks: 12, cert: true },
        { icon: "💻", title: "Web Development", level: "Beginner–Advanced", weeks: 16, cert: true },
        { icon: "📈", title: "Leadership & Management", level: "Intermediate", weeks: 6, cert: true },
        { icon: "💹", title: "Financial Planning", level: "All Levels", weeks: 8, cert: true }
      ]
    },
    booking: {
      hero: "Book a Consultation",
      heroSub: "Schedule your free session with our experts",
      step1: "Personal Info", step2: "Select Service", step3: "Upload Files", step4: "Review & Send",
      name: "Full Name", email: "Email Address", phone: "Phone Number",
      whatsapp: "WhatsApp Number",
      service: "Select Service", date: "Preferred Date", time: "Preferred Time",
      msg: "Additional Notes (optional)",
      submit: "Submit Request",
      uploadLabel: "Upload Files", uploadSub: "Passport, ID, Photos, or any required documents",
      fileTypes: ["Passport", "National ID", "Photo", "Supporting Document"],
      reviewTitle: "Review Your Request",
      bankTitle: "Bank Transfer Details",
      bankNote: "After submitting, please transfer the amount and send the receipt via WhatsApp.",
      times: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
      success: "Request Submitted!", successSub: "We've sent a confirmation and invoice to your email. Our team will review your request within 24 hours."
    },
    dashboard: {
      hero: "Client Dashboard",
      welcome: "Welcome back,",
      client: "Premium Client",
      tabs: { apps: "Applications", docs: "Documents", invoices: "Invoices", support: "Support" },
      statuses: ["In Review", "Approved", "Processing", "Completed"],
      statusColors: ["#e8a020", "#27ae60", "#3498db", "#c9a84c"],
      upload: "Upload Document", newApp: "New Application",
      apps: [
        { id: "AK-2024-001", service: "UAE Investor Visa", status: 2, date: "2024-11-01", progress: 65, officer: "Ms. Fatima Al-Hashemi" },
        { id: "AK-2024-002", service: "Portugal Golden Visa", status: 0, date: "2024-10-15", progress: 30, officer: "Mr. Khalid Mansouri" },
        { id: "AK-2024-003", service: "UAE Company Formation", status: 3, date: "2024-09-20", progress: 100, officer: "Ms. Sara Ahmed" }
      ],
      invoices: [
        { id: "INV-2024-001", service: "UAE Investor Visa", amount: "AED 8,500", date: "2024-11-01", paid: true },
        { id: "INV-2024-002", service: "Company Formation", amount: "AED 15,000", date: "2024-09-20", paid: true }
      ]
    },
    student: {
      hero: "Student Portal",
      heroSub: "Your learning journey starts here",
      courses: [
        { title: "Business English — Advanced", progress: 72, lessons: 24, done: 17, cert: false },
        { title: "Digital Marketing Mastery", progress: 45, lessons: 32, done: 14, cert: false },
        { title: "Graphic Design Fundamentals", progress: 100, lessons: 20, done: 20, cert: true }
      ],
      tabs: { courses: "My Courses", certs: "Certificates", schedule: "Schedule", profile: "Profile" }
    }
  },
  ar: {
    dir: "rtl",
    lang: "AR",
    switchLabel: "EN",
    nav: {
      home: "الرئيسية",
      "visa-center": "مركز التأشيرات",
      residency: "برامج الإقامة",
      "company-formation": "تأسيس الشركات",
      travel: "السفر والسياحة",
      knowledge: "مركز المعرفة",
      about: "من نحن", contact: "تواصل معنا",
      book: "احجز استشارة", dashboard: "لوحة التحكم",
      student: "بوابة الطالب",
      citizenship: "برامج الجنسية",
      advertising: "وكالة الإعلان", academy: "أكاديمية المهارات",
    },
    hero: {
      badge: "خدمات عالمية متميزة",
      h1: "بوابتك\nنحو العالم",
      sub: "السفر والتأشيرات  ·  برامج الجنسية  ·  وكالة الإعلان  ·  أكاديمية المهارات",
      cta1: "تحقق من تأشيرتك", cta2: "قدّم طلبك الآن"
    },
    about: {
      label: "من نحن",
      h2: "استشارات متميزة\nمبنية على الثقة",
      p: "مجموعة الكون هي مجموعة مؤسسية متميزة مقرها الإمارات العربية المتحدة، تقدم خدمات عالمية المستوى في مجالات السفر والجنسية والإعلان والتعليم. نجمع بين الخبرة المحلية والانتشار العالمي لتقديم نتائج تفوق التوقعات — بشفافية كاملة واهتمام VIP في كل خطوة.",
      stat1v: "+5,000", stat1l: "عميل",
      stat2v: "+15", stat2l: "دولة",
      stat3v: "98%", stat3l: "نسبة النجاح",
      stat4v: "+10", stat4l: "سنوات تميّز"
    },
    divisions: {
      label: "أقسامنا",
      h2: "أربعة محاور للتميز",
      cards: [
        { icon: "✈", title: "السفر والتأشيرات", sub: "التنقل العالمي", desc: "تأشيرات سياحية وتجارية واستثمارية · خدمات VIP · حجز رحلات وفنادق · كونسيرج المطار", cta: "استكشف" },
        { icon: "🌍", title: "برامج الجنسية", sub: "الإقامة العالمية", desc: "جواز سفر ثانٍ · الإقامة بالاستثمار · هجرة المستثمرين · مقارنة الدول", cta: "استكشف" },
        { icon: "◈", title: "وكالة الإعلان", sub: "التميز الإبداعي", desc: "هوية بصرية · سوشيال ميديا · موشن جرافيك · إنتاج فيديو · حملات تسويقية", cta: "استكشف" },
        { icon: "🎓", title: "أكاديمية المهارات", sub: "التعليم المتميز", desc: "دورات لغات · مهارات أعمال · تدريب رقمي · برامج معتمدة عبر الإنترنت · إرشاد", cta: "استكشف" }
      ]
    },
    why: {
      label: "لماذا نحن",
      h2: "الفارق مع الكون",
      items: [
        { icon: "⚡", title: "إنجاز سريع", desc: "إجراءات مبسطة وأوقات تسليم سريعة مع أقل قدر من الأوراق الرسمية." },
        { icon: "🤝", title: "شراكات عالمية", desc: "علاقات موثوقة مع المؤسسات والسفارات والوكالات حول العالم." },
        { icon: "🛡", title: "سرية تامة", desc: "خصوصيتك وأمانك محميان بالكامل في كل مرحلة." },
        { icon: "👑", title: "تجربة VIP", desc: "خدمة كونسيرج شخصية مصممة من البداية حتى النهاية." },
        { icon: "📋", title: "امتثال كامل", desc: "جميع خدماتنا مرخصة وموافقة قانونياً وفق أنظمة الإمارات." },
        { icon: "💬", title: "دعم 24/7", desc: "فريق متعدد اللغات متاح دائماً لخدمتك في أي وقت." }
      ]
    },
    testimonials: {
      label: "آراء العملاء",
      h2: "ما يقوله عملاؤنا",
      items: [
        { name: "أحمد المنصوري", role: "مستثمر أعمال، دبي", text: "تولت مجموعة الكون تأسيس شركتي وتأشيرة المستثمر بسلاسة تامة. احترافية عالية وسرعة في الإنجاز وثقة مطلقة. أنصح كل مستثمر جاد بالتواصل معهم." },
        { name: "سارة جونسون", role: "عميلة تأشيرة، لندن", text: "أنجز الفريق تأشيرة المستثمر في وقت قياسي مع تواصل واضح طوال الوقت. لم أشعر بالضياع أبداً — كل خطوة كانت مشروحة ومُعالجة بمهنية حقيقية." },
        { name: "محمد الراشد", role: "طالب في الأكاديمية، الرياض", text: "غيّرت أكاديمية المهارات مساري المهني. مدربون عالميون، منهج عصري، وتجربة تعليمية رائعة. حصلت على شهادتي في ثمانية أسابيع فقط." }
      ]
    },
    cta: {
      h2: "مستعد لبدء\nرحلتك؟",
      sub: "احجز استشارة مجانية مع خبرائنا — بدون أي التزام، توجيه خالص.",
      btn1: "احجز استشارة", btn2: "تواصل عبر واتساب"
    },
    footer: {
      tagline: "شريكك الموثوق نحو مستقبل أفضل",
      qlinks: "روابط سريعة", services: "خدماتنا", contact: "تواصل معنا",
      newsletter: "النشرة الإخبارية", nlSub: "ابق على اطلاع بأحدث عروضنا ورؤانا",
      nlPh: "بريدك الإلكتروني", subscribe: "اشترك",
      copy: "© 2026 Alkown Global. جميع الحقوق محفوظة.",
      address: "إسطنبول · دبي · حلب",
      phone: "+90 534 764 1249 | +971 54 490 9522 | +963 980 631 952",
      email: "info@alkownglobal.com",
      social: "@alkown.global — Instagram & Facebook",
      license: ""
    },
    travel: {
      hero: "السفر والتأشيرات",
      heroSub: "اكتشف العالم مع الكون",
      intro: "سواء كنت تخطط لعطلة، أو تتوسع في أعمالك عالمياً، أو تبحث عن حلول سفر بمستوى الاستثمار، تقدم مجموعة الكون خدمات شاملة للسفر والتأشيرات مع معالجة VIP.",
      services: [
        { icon: "🛂", title: "تأشيرات سياحية", desc: "معالجة سلسة للتأشيرات لأبرز الوجهات حول العالم" },
        { icon: "💼", title: "تأشيرات تجارية", desc: "دعم احترافي للسفر المؤسسي والاجتماعات" },
        { icon: "💰", title: "تأشيرات استثمارية", desc: "مساعدة كاملة لبرامج تأشيرات المستثمر ورائد الأعمال" },
        { icon: "✈", title: "حجز طيران", desc: "حجز رحلات متميز — اقتصادي وأعمال وطيران خاص" },
        { icon: "🏨", title: "حجز فنادق", desc: "حجوزات فنادق فاخرة مختارة بعناية حول العالم" },
        { icon: "👑", title: "مساعدة VIP", desc: "كونسيرج المطار والمسار السريع وصالات كبار الشخصيات" }
      ]
    },
    citizenship: {
      hero: "برامج الإقامة الدائمة\nبرامج الجنسية الثانية",
      heroSub: "طريقك نحو التنقل العالمي",
      intro: "تتخصص مجموعة الكون في برامج الجنسية والإقامة المتميزة عبر الاستثمار. يرشدك خبراؤنا القانونيون طوال العملية بأكملها — من اختيار البرنامج حتى تسليم جواز السفر.",
      programs: [
        { flag: "🇵🇹", name: "البرتغال", type: "برنامج الإقامة الدائمة", min: "€28,000", time: "5-8 شهر" },
        { flag: "🇬🇷", name: "اليونان", type: "تأشيرة ذهبية", min: "€250,000", time: "6-12 شهر" },
        { flag: "🇲🇹", name: "مالطا", type: "جنسية", min: "€690,000", time: "12-24 شهر" },
        { flag: "🇦🇪", name: "الإمارات", type: "تأشيرة ذهبية", min: "2 مليون درهم", time: "30-60 يوم" },
        { flag: "🇨🇾", name: "قبرص", type: "إقامة", min: "€300,000", time: "2-3 أشهر" },
        { flag: "🇧🇧", name: "الكاريبي", type: "جنسية", min: "$100,000", time: "3-6 أشهر" }
      ],
      services: ["برامج جواز سفر ثانٍ", "الإقامة بالاستثمار", "هجرة المستثمرين", "مقارنة الدول", "استشارة قانونية", "إعداد المستندات", "متابعة الطلبات", "دعم ما بعد الموافقة"]
    },
    advertising: {
      hero: "وكالة الإعلان",
      heroSub: "الإبداع يلتقي بالاستراتيجية",
      intro: "إعلان الكون وكالة إبداعية متكاملة تمزج بين الجماليات الفاخرة والأداء المدفوع بالبيانات. نبني علامات تجارية تُلهم، وحملات تُحوّل، ومحتوى يُؤثّر.",
      services: [
        { icon: "◈", title: "هوية بصرية", desc: "شعار وهوية مرئية وإرشادات العلامة التجارية" },
        { icon: "📱", title: "سوشيال ميديا", desc: "استراتيجية وإنتاج محتوى وإدارة المجتمع" },
        { icon: "🎬", title: "موشن جرافيك", desc: "أنيميشن متميز وتصميم حركة احترافي" },
        { icon: "🎥", title: "إنتاج فيديو", desc: "أفلام مؤسسية وإعلانات ومحتوى سينمائي" },
        { icon: "🖥", title: "تصميم UI/UX", desc: "واجهات رقمية جميلة ومحسّنة للتحويل" },
        { icon: "📊", title: "حملات تسويقية", desc: "استراتيجية تسويق متكاملة متعددة القنوات" },
        { icon: "🌐", title: "تطوير مواقع", desc: "مواقع وتطبيقات ويب متميزة" },
        { icon: "✍", title: "استراتيجية المحتوى", desc: "كتابة إبداعية ثنائية اللغة وتخطيط محتوى" }
      ]
    },
    academy: {
      hero: "أكاديمية المهارات",
      heroSub: "تعلّم. نمُ. انجح.",
      intro: "تقدم أكاديمية مهارات الكون برامج تطوير مهني مصممة للعالم الحديث. تعلّم من خبراء الصناعة، واحصل على شهادات معتمدة، وحوّل مسارك المهني.",
      courses: [
        { icon: "🗣", title: "الإنجليزية للأعمال", level: "جميع المستويات", weeks: 8, cert: true },
        { icon: "📢", title: "التسويق الرقمي", level: "مبتدئ – متقدم", weeks: 10, cert: true },
        { icon: "🎨", title: "الجرافيك ديزاين", level: "مبتدئ – محترف", weeks: 12, cert: true },
        { icon: "💻", title: "تطوير المواقع", level: "مبتدئ – متقدم", weeks: 16, cert: true },
        { icon: "📈", title: "القيادة والإدارة", level: "متوسط", weeks: 6, cert: true },
        { icon: "💹", title: "التخطيط المالي", level: "جميع المستويات", weeks: 8, cert: true }
      ]
    },
    booking: {
      hero: "احجز استشارة",
      heroSub: "جدوّل جلستك المجانية مع خبرائنا",
      step1: "المعلومات الشخصية", step2: "اختيار الخدمة", step3: "رفع الملفات", step4: "المراجعة والإرسال",
      name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "رقم الهاتف",
      whatsapp: "رقم الواتساب",
      service: "اختر الخدمة", date: "التاريخ المفضل", time: "الوقت المفضل",
      msg: "ملاحظات إضافية (اختياري)",
      submit: "إرسال الطلب",
      uploadLabel: "رفع الملفات", uploadSub: "جواز السفر، الهوية، الصور، أو أي وثائق مطلوبة",
      fileTypes: ["جواز السفر", "الهوية الوطنية", "صورة شخصية", "وثيقة داعمة"],
      reviewTitle: "مراجعة طلبك",
      bankTitle: "بيانات التحويل البنكي",
      bankNote: "بعد الإرسال، يرجى تحويل المبلغ وإرسال الإيصال على الواتساب.",
      times: ["09:00 ص", "10:00 ص", "11:00 ص", "12:00 م", "02:00 م", "03:00 م", "04:00 م", "05:00 م"],
      success: "تم إرسال طلبك!", successSub: "أرسلنا تأكيداً وفاتورة على بريدك الإلكتروني. سيراجع فريقنا طلبك خلال 24 ساعة."
    },
    dashboard: {
      hero: "لوحة التحكم",
      welcome: "مرحباً بعودتك،",
      client: "عميل مميز",
      tabs: { apps: "الطلبات", docs: "المستندات", invoices: "الفواتير", support: "الدعم" },
      statuses: ["قيد المراجعة", "موافق عليه", "قيد المعالجة", "مكتمل"],
      statusColors: ["#e8a020", "#27ae60", "#3498db", "#c9a84c"],
      upload: "رفع مستند", newApp: "طلب جديد",
      apps: [
        { id: "AK-2024-001", service: "تأشيرة مستثمر إماراتي", status: 2, date: "2024-11-01", progress: 65, officer: "فاطمة الهاشمي" },
        { id: "AK-2024-002", service: "التأشيرة الذهبية البرتغالية", status: 0, date: "2024-10-15", progress: 30, officer: "خالد المنصوري" },
        { id: "AK-2024-003", service: "تأسيس شركة في الإمارات", status: 3, date: "2024-09-20", progress: 100, officer: "سارة أحمد" }
      ],
      invoices: [
        { id: "INV-2024-001", service: "تأشيرة مستثمر إماراتي", amount: "8,500 درهم", date: "2024-11-01", paid: true },
        { id: "INV-2024-002", service: "تأسيس شركة", amount: "15,000 درهم", date: "2024-09-20", paid: true }
      ]
    },
    student: {
      hero: "بوابة الطالب",
      heroSub: "رحلتك التعليمية تبدأ هنا",
      courses: [
        { title: "الإنجليزية للأعمال — متقدم", progress: 72, lessons: 24, done: 17, cert: false },
        { title: "إتقان التسويق الرقمي", progress: 45, lessons: 32, done: 14, cert: false },
        { title: "أساسيات الجرافيك ديزاين", progress: 100, lessons: 20, done: 20, cert: true }
      ],
      tabs: { courses: "دوراتي", certs: "الشهادات", schedule: "الجدول", profile: "الملف الشخصي" }
    }
  }
};

// ── THEME ─────────────────────────────────────────────────────
const C = {
  // ذهبي أقوى وأكثر إشراقاً
  gold: "#c8922a", goldLight: "#f5c842", goldDark: "#8a6010",
  goldMid: "#d4a843",
  goldGlow: "rgba(200,146,42,0.40)",
  // خلفيات دافئة راقية
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g200: "#ddd0bc", g400: "#7a6b50",
  g600: "#3d3020", g800: "#1e1508",
  // داكن فاخر
  dark: "#16100a", darkMid: "#211608",
  // ألوان مساعدة
  success: "#2d9c5a", error: "#c0392b", info: "#2980b9",
};

// ── HELPERS ───────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const gold = (extra = "") =>
  `background:linear-gradient(135deg,${C.gold} 0%,${C.goldLight} 45%,${C.gold} 100%);${extra}`;

// ── Helper: hex → r,g,b ───────────────────────────────────────
const hexRgb = (hex="") => {
  const h=hex.replace("#","");
  if(h.length!==6)return"200,146,42";
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
};

// ── GLOBAL STYLES (function so colors/fonts are dynamic) ──────
const buildCSS = (C, ff) => `
@font-face {
  font-family: 'Dubai';
  src: url('/fonts/DUBAI-BOLD.TTF') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Cairo:wght@300;400;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{-webkit-font-smoothing:antialiased;background:${C.warmWhite}}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:${C.g100}}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,${C.gold},${C.goldLight});border-radius:4px}
::-webkit-scrollbar-thumb:hover{background:${C.gold}}
h1,h2,h3,h4{font-weight:800;color:${C.g800};line-height:1.2}
button{font-weight:700}
p{font-weight:400;line-height:1.8}
a{transition:color .2s}
::selection{background:${C.goldGlow};color:${C.g800}}

/* ── تحسين الموبايل ── */
.nav-desktop{display:flex}
.nav-hamburger{display:none}
.mob-overlay{display:none}
@media(max-width:860px){
  .nav-desktop{display:none!important}
  .nav-hamburger{display:flex!important}
  .mob-overlay{display:block}
  h1{font-size:clamp(1.7rem,7vw,2.6rem)!important}
  h2{font-size:clamp(1.3rem,5vw,2rem)!important}
  section{padding:52px 20px!important}
  .card:hover{transform:none!important;box-shadow:none!important}
  table{font-size:.82rem}
  .hide-mobile{display:none!important}
}
@media(max-width:480px){
  .grid-2{grid-template-columns:1fr!important}
  .grid-3{grid-template-columns:1fr!important}
  .grid-4{grid-template-columns:1fr 1fr!important}
}
@keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}

/* ── Animations ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 ${C.goldGlow}}70%{box-shadow:0 0 0 16px rgba(200,146,42,0)}}
@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}

.fu{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both}
.fu2{animation:fadeUp .7s .12s cubic-bezier(.22,1,.36,1) both}
.fu3{animation:fadeUp .7s .24s cubic-bezier(.22,1,.36,1) both}
.fu4{animation:fadeUp .7s .36s cubic-bezier(.22,1,.36,1) both}

/* ── Shimmer text ── */
.shimmer{
  background:linear-gradient(90deg,${C.goldDark} 0%,${C.goldLight} 30%,${C.gold} 55%,${C.goldLight} 80%,${C.goldDark} 100%);
  background-size:250% auto;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  animation:shimmer 5s linear infinite
}

/* ── أزرار رئيسية ── */
.gbtn{
  background:linear-gradient(135deg,${C.goldDark} 0%,${C.gold} 35%,${C.goldLight} 65%,${C.gold} 100%);
  background-size:200% 200%;
  color:${C.dark};
  border:none;
  padding:14px 36px;
  font-size:.83rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:800;
  transition:all .35s cubic-bezier(.25,.46,.45,.94);
  box-shadow:0 4px 18px rgba(200,146,42,.25);
  position:relative;
  overflow:hidden
}
.gbtn::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);
  opacity:0;
  transition:opacity .3s
}
.gbtn:hover{
  transform:translateY(-3px);
  box-shadow:0 14px 40px ${C.goldGlow};
  background-position:right center
}
.gbtn:hover::after{opacity:1}
.gbtn:active{transform:translateY(-1px)}

/* ── أزرار ثانوية ── */
.obtn{
  background:transparent;
  color:${C.gold};
  border:1.5px solid rgba(200,146,42,.5);
  padding:12px 30px;
  font-size:.82rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:600;
  transition:all .3s
}
.obtn:hover{border-color:${C.gold};background:rgba(200,146,42,.08);transform:translateY(-2px);box-shadow:0 6px 20px rgba(200,146,42,.15)}

/* ── أزرار داكنة ── */
.dbtn{
  background:${C.g800};
  color:${C.goldLight};
  border:none;
  padding:14px 34px;
  font-size:.82rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  cursor:pointer;
  border-radius:3px;
  font-weight:700;
  transition:all .3s;
  box-shadow:0 4px 16px rgba(0,0,0,.2)
}
.dbtn:hover{background:${C.dark};transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.3)}

/* ── بطاقات ── */
.card{
  background:#fff;
  border:1px solid rgba(200,146,42,.12);
  transition:all .4s cubic-bezier(.25,.46,.45,.94);
  cursor:pointer;
  position:relative;
  overflow:hidden
}
.card::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:2px;
  background:linear-gradient(90deg,transparent,${C.gold},transparent);
  opacity:0;
  transition:opacity .4s
}
.card:hover{transform:translateY(-8px);box-shadow:0 28px 72px rgba(120,90,20,.14)!important;border-color:rgba(200,146,42,.28)}
.card:hover::before{opacity:1}
.card:hover .gl{width:60px!important}

/* ── خط ذهبي ── */
.gl{width:28px;height:2px;background:linear-gradient(90deg,${C.gold},${C.goldLight});transition:width .45s ease;margin-bottom:16px;border-radius:2px}

/* ── مدخلات ── */
input,textarea,select{outline:none;font-family:inherit;transition:all .25s}
input:focus,textarea:focus,select:focus{
  border-color:${C.gold}!important;
  box-shadow:0 0 0 4px rgba(200,146,42,.1)!important
}
input::placeholder,textarea::placeholder{color:${C.g400};opacity:.7}

/* ── تبويبات ── */
.tab-btn{background:transparent;border:none;cursor:pointer;padding:12px 22px;font-size:.83rem;letter-spacing:.08em;transition:all .3s;border-bottom:2px solid transparent;margin-bottom:-2px;color:${C.g400}}
.tab-active{color:${C.gold}!important;border-bottom-color:${C.gold}!important;font-weight:700}
.tab-btn:hover{color:${C.gold}}

/* ── شريط تمييز ── */
.gold-bar{height:3px;background:linear-gradient(90deg,${C.goldDark},${C.gold},${C.goldLight},${C.gold},${C.goldDark});background-size:200% auto;animation:shimmer 4s linear infinite}
`;

// ── LOGO ──────────────────────────────────────────────────────
// (buildCSS is now a function — called inside AlkownGroup with dynamic values)
function Logo({ size = "md" }) {
  const s = { sm: [1.5, .58, .5], md: [1.9, .66, .58], lg: [3.2, .95, .82] }[size];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <span style={{
        fontSize: s[0] + "rem", fontFamily: "'Dubai','Cairo',sans-serif", fontWeight: 700, lineHeight: 1,
        background: `linear-gradient(135deg,${C.goldDark} 0%,${C.goldLight} 38%,${C.gold} 65%,${C.goldDark} 100%)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        filter: "drop-shadow(0 2px 12px rgba(200,146,42,.5))"
      }}>الكون</span>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, gap: 1 }}>
        <span style={{ fontSize: s[1] + "rem", fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif", color: C.gold, fontWeight: 700, letterSpacing: ".22em", textTransform: "uppercase" }}>ALKOWN</span>
        <span style={{ fontSize: s[2] + "rem", color: C.g400, letterSpacing: ".30em", fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif", fontWeight: 400, textTransform: "uppercase" }}>GLOBAL</span>
      </div>
    </div>
  );
}

// ── GOLD DIVIDER ──────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px auto", width: "fit-content" }}>
      <div style={{ width: 44, height: 1, background: `linear-gradient(90deg,transparent,${C.gold})` }} />
      <div style={{ position: "relative", width: 8, height: 8 }}>
        <div style={{ width: 8, height: 8, background: C.gold, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", inset: -3, border: `1px solid rgba(200,146,42,.3)`, transform: "rotate(45deg)" }} />
      </div>
      <div style={{ width: 44, height: 1, background: `linear-gradient(90deg,${C.gold},transparent)` }} />
    </div>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────
function Label({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg,transparent,${C.gold})`, borderRadius: 2 }} />
      <span style={{ fontSize: ".68rem", letterSpacing: ".28em", color: C.gold, textTransform: "uppercase", fontFamily: "'Cairo',sans-serif", fontWeight: 700 }}>{text}</span>
      <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg,${C.gold},transparent)`, borderRadius: 2 }} />
    </div>
  );
}

// ── GOLD PARTICLES ────────────────────────────────────────────
function Particles({ n = 16 }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[...Array(n)].map((_, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
          background: `rgba(${180 + i * 3},${140 + i * 2},60,${.25 + (i % 5) * .08})`,
          left: `${(i * 19 + 7) % 100}%`, top: `${(i * 27 + 5) % 100}%`,
          animation: `float ${4 + i % 5}s ease-in-out infinite`,
          animationDelay: `${i * .38}s`
        }} />
      ))}
    </div>
  );
}

// ── HERO BG SVG ───────────────────────────────────────────────
function HeroBG() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .18 }}
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <path d="M0,380 Q360,160 720,320 T1440,280" fill="none" stroke={C.gold} strokeWidth="1.2"
        strokeDasharray="1000" style={{ animation: "draw 4s ease both" }} />
      <path d="M0,560 Q430,360 860,500 T1440,460" fill="none" stroke={C.gold} strokeWidth=".6" />
      <circle cx="1150" cy="180" r="180" fill="none" stroke={C.gold} strokeWidth=".7" />
      <circle cx="1150" cy="180" r="110" fill="none" stroke={C.gold} strokeWidth=".4" />
      <circle cx="240" cy="700" r="120" fill="none" stroke={C.gold} strokeWidth=".5" />
      <path d="M80,80 L116,116 L80,152 L44,116Z" fill="none" stroke={C.gold} strokeWidth=".7" />
      <path d="M1350,650 L1380,680 L1350,710 L1320,680Z" fill="none" stroke={C.gold} strokeWidth=".5" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function AlkownGroup() {
  const [lang, setLang] = useState("ar");
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visaParams, setVisaParams] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem("site-dark") === "1");
  const toggleDark = () => setDark(d => { const n = !d; localStorage.setItem("site-dark", n ? "1" : "0"); return n; });

  // تطبيق الوضع الليلي على body
  useEffect(() => {
    document.body.style.background = dark ? "#0d0b08" : "";
    document.body.style.margin = "0";
  }, [dark]);
  const { get: cGet, getSection } = useContent();
  const g = (sec, key) => cGet(sec, key, lang);

  // ── ألوان وخطوط ديناميكية من قاعدة البيانات ──────────────────
  const dynGold      = cGet("colors","primary","ar")      || C.gold;
  const dynGoldLight = cGet("colors","primary_light","ar") || C.goldLight;
  const dynDark      = cGet("colors","dark_bg","ar")       || C.dark;
  const dynG800      = cGet("colors","text_main","ar")     || C.g800;
  const dynG400      = cGet("colors","text_sub","ar")      || C.g400;
  const dynBgWarm    = cGet("colors","bg_warm","ar")       || C.warmWhite;
  const dynFontAr    = cGet("typography","font_arabic","ar") || "Dubai";
  const dynFontEn    = cGet("typography","font_english","ar") || "Dubai";
  const dynFf        = `'Dubai','${dynFontAr}','Cairo','Noto Naskh Arabic',sans-serif`;
  const dynSizeHero  = cGet("typography","size_hero","ar")    || "clamp(2.8rem,6vw,5.5rem)";
  const dynSizeSec   = cGet("typography","size_section","ar") || "clamp(1.8rem,4vw,3rem)";

  const DC = useMemo(() => ({
    ...C,
    gold:      dynGold,
    goldLight: dynGoldLight,
    goldDark:  dynGold,
    goldMid:   dynGoldLight,
    goldGlow:  `rgba(${hexRgb(dynGold)},0.40)`,
    dark:      dynDark,
    darkMid:   dynDark,
    g800:      dynG800,
    g400:      dynG400,
    warmWhite: dynBgWarm,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [dynGold,dynGoldLight,dynDark,dynG800,dynG400,dynBgWarm]);

  const dynamicCSS = useMemo(
    () => buildCSS(DC, dynFf),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [dynGold,dynGoldLight,dynDark,dynG800,dynG400,dynBgWarm,dynFf]);

  // Merge DB cards with T[] defaults — DB wins per index, extras appended
  const mergeCards = (section, prefix, defaults) => {
    const sec = getSection(section, "ar"); // JSON has both langs
    const dbKeys = Object.keys(sec)
      .filter(k => k.startsWith(prefix + "_"))
      .sort((a,b)=>(parseInt(a.split("_").pop())||0)-(parseInt(b.split("_").pop())||0));
    if (!dbKeys.length) return null; // no DB data → use hardcoded T
    // Build map: index → raw JSON
    const dbMap = {};
    dbKeys.forEach(k => { const n=parseInt(k.split("_").pop()); if(n) dbMap[n]=sec[k]; });
    const maxN = Math.max(...dbKeys.map(k=>parseInt(k.split("_").pop())||0), defaults.length);
    const result = [];
    for (let i = 1; i <= maxN; i++) {
      if (dbMap[i]) result.push(dbMap[i]); // raw JSON string
      else if (i <= defaults.length) result.push(null); // use T default
      // skip if beyond defaults and no DB key
    }
    return result; // array of (raw JSON string | null for T-default)
  };

  // Parse JSON card from DB, merge with default
  const parseCard = (raw, def) => {
    if (!raw) return def;
    try {
      const d = JSON.parse(raw);
      const l = lang;
      return {
        ...def,
        icon:     d.icon           || def.icon,
        title:    d[`title_${l}`]  || def.title,
        sub:      d[`sub_${l}`]    || def.sub,
        desc:     d[`desc_${l}`]   || def.desc,
        cta:      def.cta,
        bg_color: d.bg_color       || "",
        bg_image: d.bg_image       || "",
      };
    } catch { return def; }
  };
  const parseSvc = (raw, def) => {
    if (!raw) return def;
    try {
      const d = JSON.parse(raw);
      const l = lang;
      return { ...def, icon: d.icon||def.icon, title: d[`title_${l}`]||def.title, desc: d[`desc_${l}`]||def.desc,
        bg_color: d.bg_color||"", bg_image: d.bg_image||"" };
    } catch { return def; }
  };
  const parseCourse = (raw, def) => {
    if (!raw) return def;
    try {
      const d = JSON.parse(raw);
      const l = lang;
      return { ...def, icon: d.icon||def.icon, title: d[`title_${l}`]||def.title, level: d[`level_${l}`]||def.level,
        weeks: d.weeks||def.weeks, cert: d.cert??def.cert, bg_color: d.bg_color||"", bg_image: d.bg_image||"" };
    } catch { return def; }
  };

  const t = {
    ...T[lang],
    nav: {
      ...T[lang].nav,
      home:               g("nav","home")         || T[lang].nav.home,
      "visa-center":      g("nav","visa_center")  || T[lang].nav["visa-center"],
      residency:          g("nav","residency")    || T[lang].nav.residency,
      "company-formation":g("nav","company")      || T[lang].nav["company-formation"],
      travel:             g("nav","travel")       || T[lang].nav.travel,
      knowledge:          g("nav","knowledge")    || T[lang].nav.knowledge,
      about:              g("nav","about")        || T[lang].nav.about,
      contact:            g("nav","contact")      || T[lang].nav.contact,
      book:               g("nav","book_btn")     || T[lang].nav.book,
      dashboard:          g("nav","dashboard")    || T[lang].nav.dashboard,
      citizenship:        g("nav","citizenship")  || T[lang].nav.citizenship,
      advertising:        g("nav","advertising")  || T[lang].nav.advertising,
      academy:            g("nav","academy")      || T[lang].nav.academy,
    },
    hero: {
      ...T[lang].hero,
      badge: g("hero","badge")       || T[lang].hero.badge,
      h1: (() => { const l1=g("hero","title_line1"), l2=g("hero","title_line2"); return (l1&&l2)?`${l1}\n${l2}`:T[lang].hero.h1; })(),
      sub:   g("hero","subtitle")    || T[lang].hero.sub,
      cta1:  g("hero","cta1")        || T[lang].hero.cta1,
      cta2:  g("hero","cta2")        || T[lang].hero.cta2,
      trust1:g("hero","trust1")      || T[lang].hero.trust1,
      trust2:g("hero","trust2")      || T[lang].hero.trust2,
      trust3:g("hero","trust3")      || T[lang].hero.trust3,
    },
    about: {
      ...T[lang].about,
      label:  g("about","label")       || T[lang].about.label,
      h2:     g("about","title")       || T[lang].about.h2,
      p:      g("about","description") || T[lang].about.p,
      stat1v: g("about","stat1_value") || T[lang].about.stat1v,
      stat1l: g("about","stat1_label") || T[lang].about.stat1l,
      stat2v: g("about","stat2_value") || T[lang].about.stat2v,
      stat2l: g("about","stat2_label") || T[lang].about.stat2l,
      stat3v: g("about","stat3_value") || T[lang].about.stat3v,
      stat3l: g("about","stat3_label") || T[lang].about.stat3l,
      stat4v: g("about","stat4_value") || T[lang].about.stat4v,
      stat4l: g("about","stat4_label") || T[lang].about.stat4l,
    },
    divisions: {
      ...T[lang].divisions,
      label: g("divisions","label") || T[lang].divisions.label,
      h2:    g("divisions","title") || T[lang].divisions.h2,
      cards: (() => {
        const merged = mergeCards("divisions","card",T[lang].divisions.cards);
        if (!merged) return T[lang].divisions.cards;
        return merged.map((raw,i) => raw ? parseCard(raw, T[lang].divisions.cards[i]||T[lang].divisions.cards[0]) : (T[lang].divisions.cards[i]||T[lang].divisions.cards[0]));
      })(),
    },
    travel: {
      ...T[lang].travel,
      hero:    g("travel","hero_title") || T[lang].travel.hero,
      heroSub: g("travel","hero_sub")   || T[lang].travel.heroSub,
      intro:   g("travel","intro")      || T[lang].travel.intro,
      services: (() => {
        const merged = mergeCards("travel","service",T[lang].travel.services);
        if (!merged) return T[lang].travel.services;
        return merged.map((raw,i) => raw ? parseSvc(raw, T[lang].travel.services[i]||T[lang].travel.services[0]) : (T[lang].travel.services[i]||T[lang].travel.services[0]));
      })(),
    },
    citizenship: {
      ...T[lang].citizenship,
      programs: (() => {
        const merged = mergeCards("citizenship","program",T[lang].citizenship.programs);
        if (!merged) return T[lang].citizenship.programs;
        return merged.map((raw,i) => {
          const def = T[lang].citizenship.programs[i]||T[lang].citizenship.programs[0];
          if (!raw) return def;
          try {
            const d = JSON.parse(raw);
            return {...def,flag:d.flag||def.flag,name:d[`name_${lang}`]||def.name,type:d[`type_${lang}`]||def.type,min:d.min||def.min,time:d.time||def.time};
          } catch { return def; }
        });
      })(),
    },
    advertising: {
      ...T[lang].advertising,
      hero:    g("advertising","hero_title") || T[lang].advertising.hero,
      heroSub: g("advertising","hero_sub")   || T[lang].advertising.heroSub,
      intro:   g("advertising","intro")      || T[lang].advertising.intro,
      services: (() => {
        const merged = mergeCards("advertising","service",T[lang].advertising.services);
        if (!merged) return T[lang].advertising.services;
        return merged.map((raw,i) => raw ? parseSvc(raw, T[lang].advertising.services[i]||T[lang].advertising.services[0]) : (T[lang].advertising.services[i]||T[lang].advertising.services[0]));
      })(),
    },
    academy: {
      ...T[lang].academy,
      hero:    g("academy","hero_title") || T[lang].academy.hero,
      heroSub: g("academy","hero_sub")   || T[lang].academy.heroSub,
      intro:   g("academy","intro")      || T[lang].academy.intro,
      courses: (() => {
        const merged = mergeCards("academy","course",T[lang].academy.courses);
        if (!merged) return T[lang].academy.courses;
        return merged.map((raw,i) => raw ? parseCourse(raw, T[lang].academy.courses[i]||T[lang].academy.courses[0]) : (T[lang].academy.courses[i]||T[lang].academy.courses[0]));
      })(),
    },
    cta: {
      ...T[lang].cta,
      h2:   g("cta","title")    || T[lang].cta.h2,
      sub:  g("cta","subtitle") || T[lang].cta.sub,
      btn1: g("cta","btn1")     || T[lang].cta.btn1,
      btn2: g("cta","btn2")     || T[lang].cta.btn2,
    },
    why: {
      ...T[lang].why,
      label: g("why","label") || T[lang].why.label,
      h2:    g("why","title") || T[lang].why.h2,
      items: T[lang].why.items.map((def,i) => ({
        ...def,
        icon:  g("why",`item${i+1}_icon`)  || def.icon,
        title: g("why",`item${i+1}_title`) || def.title,
        desc:  g("why",`item${i+1}_desc`)  || def.desc,
      })),
    },
    footer: {
      ...T[lang].footer,
      tagline:   g("footer","tagline")          || T[lang].footer.tagline,
      copy:      g("footer","copyright")        || T[lang].footer.copy,
      address:   g("contact","address")         || T[lang].footer.address,
      email:     g("contact","email")           || T[lang].footer.email,
      newsletter: g("footer","newsletter_title")|| T[lang].footer.newsletter,
      nlSub:     g("footer","newsletter_sub")   || T[lang].footer.nlSub,
      nlPh:      g("footer","newsletter_ph")    || T[lang].footer.nlPh,
      subscribe: g("footer","subscribe_btn")    || T[lang].footer.subscribe,
      qlinks:    g("footer","quick_links_title")|| T[lang].footer.qlinks,
      services:  g("footer","services_title")   || T[lang].footer.services,
      contact:   g("footer","contact_title")    || T[lang].footer.contact,
      phone: (() => { const p1=g("contact","phone1"),p2=g("contact","phone2"),p3=g("contact","phone3"); return (p1&&p2&&p3)?`${p1} | ${p2} | ${p3}`:T[lang].footer.phone; })(),
    },
  };

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 55);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  }, [page]);

  const ff = lang === "ar" ? dynFf : `'${dynFontEn}',Georgia,serif`;

  // SEO — update on page change
  useEffect(() => {
    const seoKey = page === "home" ? "home" : PAGE_SEO[page] ? page : null;
    if (seoKey) {
      const cfg = PAGE_SEO[seoKey]?.[lang] || {};
      setSEOMeta({ ...cfg, lang, canonical: page === "home" ? "/" : `/${page}` });
    }
    if (page === "home") setStructuredData(ORGANIZATION_SCHEMA);
  }, [page, lang]);

  const navItems = [
    { k: "home",             l: t.nav.home },
    { k: "visa-center",      l: t.nav["visa-center"] },
    { k: "residency",        l: t.nav.residency },
    { k: "company-formation",l: t.nav["company-formation"] },
    { k: "knowledge",        l: t.nav.knowledge },
    { k: "about",            l: t.nav.about },
  ];

  return (
    <div style={{ fontFamily: ff, direction: t.dir, background: dark ? "#0d0b08" : C.warmWhite, minHeight: "100vh", overflowX: "hidden", color: C.g800 }}>
      {/* Dynamic Google Fonts import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(dynFontAr).replace(/%20/g,"+")}:wght@400;600;700;800;900&family=${encodeURIComponent(dynFontEn).replace(/%20/g,"+")}&display=swap');`}</style>
      <style>{dynamicCSS}</style>
      <style>{`:root{
        --gold:${DC.gold};--goldL:${DC.goldLight};--goldD:${DC.goldDark};
        --dark:${DC.dark};--g800:${DC.g800};--g600:${C.g600};--g400:${DC.g400};
        --bgWarm:${DC.warmWhite};
        --ff:'Dubai','${dynFontAr}','Noto Naskh Arabic',sans-serif;
        --ffEn:'Dubai','${dynFontEn}',sans-serif;
        --sizeHero:${dynSizeHero};
        --sizeSec:${dynSizeSec};
      }
      *{font-family:var(--ff)!important}
      body{background:var(--bgWarm)!important}
      `}</style>

      {/* ── شريط ذهبي علوي ── */}
      <div className="gold-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 3 }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 3, left: 0, right: 0, zIndex: 999,
        background: scrolled ? "rgba(255,252,245,.97)" : "transparent",
        backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
        borderBottom: scrolled ? `1px solid rgba(200,146,42,.18)` : "none",
        boxShadow: scrolled ? "0 4px 32px rgba(120,80,10,.08)" : "none",
        transition: "all .45s cubic-bezier(.25,.46,.45,.94)", padding: "0 clamp(16px,4vw,48px)"
      }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div onClick={() => setPage("home")} style={{ transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <Logo size="sm" />
          </div>

          {/* Desktop links */}
          <div className="nav-desktop" style={{ gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {navItems.map(n => (
              <button key={n.k} onClick={() => setPage(n.k)} style={{
                background: page === n.k ? "rgba(200,146,42,.08)" : "transparent",
                border: "none", cursor: "pointer", fontFamily: ff,
                fontSize: ".82rem", letterSpacing: ".06em", padding: "7px 13px", borderRadius: 20,
                color: page === n.k ? C.gold : C.g600,
                fontWeight: page === n.k ? 700 : 400, transition: "color .25s"
              }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = page === n.k ? C.gold : C.g600}
              >{n.l}</button>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="nav-desktop" style={{ gap: 10, alignItems: "center" }}>
            <button onClick={() => setPage("dashboard")} style={{
              background: "transparent", border: `1px solid rgba(201,168,76,.3)`, cursor: "pointer",
              fontFamily: ff, fontSize: ".75rem", letterSpacing: ".1em", padding: "6px 12px",
              color: C.g400, borderRadius: 2, transition: "all .3s"
            }}
              onMouseEnter={e => { e.target.style.color = C.gold; e.target.style.borderColor = C.gold; }}
              onMouseLeave={e => { e.target.style.color = C.g400; e.target.style.borderColor = "rgba(201,168,76,.3)"; }}
            >{t.nav.dashboard}</button>
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} style={{
              background: "transparent", border: `1px solid rgba(201,168,76,.38)`,
              color: C.gold, padding: "6px 14px", fontSize: ".73rem", letterSpacing: ".1em",
              cursor: "pointer", borderRadius: 2, fontFamily: ff, transition: "all .3s", fontWeight: 700
            }}>{t.switchLabel}</button>
            {/* زر الوضع الليلي */}
            <button onClick={toggleDark} title={dark ? "الوضع الفاتح" : "الوضع الداكن"} style={{
              background: dark ? "rgba(201,168,76,.15)" : "transparent",
              border: `1px solid rgba(201,168,76,.38)`,
              color: C.gold, padding: "6px 10px", fontSize: ".92rem",
              cursor: "pointer", borderRadius: 2, transition: "all .3s", lineHeight: 1
            }}>{dark ? "☀️" : "🌙"}</button>
            <button className="gbtn" style={{ padding: "9px 20px", fontSize: ".72rem", fontFamily: ff }} onClick={() => setPage("booking")}>
              {t.nav.book}
            </button>
          </div>

          {/* Mobile: lang + hamburger */}
          <div className="nav-hamburger" style={{ gap: 10, alignItems: "center" }}>
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} style={{
              background:"transparent", border:`1px solid rgba(201,168,76,.38)`,
              color:C.gold, padding:"5px 12px", fontSize:".72rem", cursor:"pointer",
              borderRadius:2, fontFamily:ff, fontWeight:700
            }}>{t.switchLabel}</button>
            <button onClick={() => setMobileOpen(o => !o)} style={{
              background: mobileOpen ? "rgba(201,168,76,.12)" : "transparent",
              border: `1px solid rgba(201,168,76,${mobileOpen?".5":".28"})`,
              borderRadius: 8, cursor: "pointer", padding: "8px 10px",
              display: "flex", flexDirection: "column", gap: 5, transition: "all .25s"
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: 22, height: 2,
                  background: C.gold, borderRadius: 2, transition: "all .3s",
                  transform: mobileOpen
                    ? i===0 ? "translateY(7px) rotate(45deg)"
                    : i===2 ? "translateY(-7px) rotate(-45deg)"
                    : "scaleX(0)"
                    : "none",
                  opacity: mobileOpen && i===1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {mobileOpen && (
        <div className="mob-overlay" style={{
          position: "fixed", top: 77, left: 0, right: 0, zIndex: 998,
          background: "rgba(255,252,245,.98)", backdropFilter: "blur(24px)",
          borderBottom: `1px solid rgba(201,168,76,.18)`,
          boxShadow: "0 8px 40px rgba(120,80,10,.1)",
          animation: "slideDown .25s ease",
          direction: t.dir,
        }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 24px 28px" }}>
            {/* Nav links */}
            {[...navItems,
              {k:"booking", l:t.nav.book},
              {k:"dashboard", l:t.nav.dashboard},
            ].map(n => (
              <button key={n.k} onClick={() => { setPage(n.k); setMobileOpen(false); }} style={{
                display: "block", width: "100%", padding: "14px 0",
                background: "transparent", border: "none", borderBottom: `1px solid rgba(201,168,76,.1)`,
                cursor: "pointer", fontFamily: ff, fontSize: "1rem",
                color: page === n.k ? C.gold : C.g700 || C.g800,
                fontWeight: page === n.k ? 700 : 400,
                textAlign: t.dir === "rtl" ? "right" : "left",
                transition: "color .2s",
              }}>{n.l}</button>
            ))}

            {/* Book CTA */}
            <button className="gbtn" onClick={() => { setPage("booking"); setMobileOpen(false); }}
              style={{ width:"100%", marginTop:20, padding:"14px", fontFamily:ff, fontSize:".95rem" }}>
              {t.nav.book}
            </button>
          </div>
        </div>
      )}

      {/* ── PAGES ── */}
      <div style={dark ? {
        paddingTop: 80,
        filter: "invert(0.88) hue-rotate(180deg) brightness(0.96)",
        minHeight: "100vh",
      } : { paddingTop: 80 }}>
        {page === "home" && <HomePage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "travel" && <TravelFullPage lang={lang} ff={ff} setPage={setPage} />}
        {page === "advertising" && <AdvertisingPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "academy" && <AcademyPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "about" && <AboutPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "booking" && <BookingPage t={t} lang={lang} ff={ff} />}
        {page === "dashboard" && <DashboardPage t={t} lang={lang} ff={ff} />}
        {page === "student" && <StudentPage t={t} lang={lang} ff={ff} />}
        {page === "visa-center" && <VisaCenterPage lang={lang} ff={ff} setPage={setPage} setVisaParams={setVisaParams} />}
        {page === "visa-result" && <VisaResultPage params={visaParams} lang={lang} ff={ff} setPage={setPage} setVisaParams={setVisaParams} />}
        {page === "visa-apply" && <VisaApplicationPage lang={lang} ff={ff} setPage={setPage} initialParams={visaParams} />}
        {page === "visa-admin" && <VisaAdminIntelligencePage />}
        {page === "visa-track" && <VisaTrackPage lang={lang} ff={ff} setPage={setPage} />}
        {page === "knowledge" && <KnowledgeCenterPage lang={lang} ff={ff} setPage={setPage} />}
        {page === "company-formation" && <CompanyFormationPage lang={lang} ff={ff} setPage={setPage} />}
        {page === "residency" && <ResidencyPage lang={lang} ff={ff} setPage={setPage} />}
      </div>

      <Footer t={t} lang={lang} ff={ff} setPage={setPage} />

      {/* WhatsApp FAB */}
      <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer"
        style={{
          position: "fixed", bottom: 28, right: lang === "ar" ? "auto" : 28, left: lang === "ar" ? 28 : "auto",
          width: 56, height: 56, borderRadius: "50%", background: "#25D366",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", boxShadow: "0 6px 24px rgba(37,211,102,.4)", zIndex: 998,
          textDecoration: "none", transition: "all .3s", animation: "pulse 3s infinite"
        }}>💬</a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function HomePage({ t, lang, ff, setPage }) {
  const [tIdx, setTIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTIdx(i => (i + 1) % t.testimonials.items.length), 5000);
    return () => clearInterval(id);
  }, [t]);

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(140deg,${C.cream} 0%,${C.beige} 45%,#ede4d4 75%,${C.beige} 100%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse 80% 60% at 68% 38%,rgba(201,168,76,.1) 0%,transparent 65%), radial-gradient(ellipse 55% 80% at 18% 72%,rgba(201,168,76,.06) 0%,transparent 60%)` }} />
        <HeroBG />
        <Particles n={18} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 960, padding: "0 clamp(20px,5vw,60px)", fontFamily: ff }}>
          {/* Badge */}
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(201,168,76,.1)", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 40, padding: "7px 22px", marginBottom: 30 }}>
            <div style={{ width: 7, height: 7, background: C.gold, borderRadius: "50%", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: ".7rem", letterSpacing: ".22em", color: C.gold, textTransform: "uppercase" }}>{t.hero.badge}</span>
          </div>

          <div className="fu2" style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Logo size="lg" />
          </div>

          <div className="fu2"><Divider /></div>

          <h1 className="fu3" style={{
            fontSize: "var(--sizeHero,clamp(2.6rem,6.5vw,5.4rem))", fontWeight: 700, color: C.g800,
            lineHeight: 1.12, margin: "18px 0 14px", letterSpacing: lang === "ar" ? ".02em" : "-.025em",
            whiteSpace: "pre-line"
          }}>{t.hero.h1}</h1>

          <p className="fu3" style={{ fontSize: "clamp(.8rem,1.8vw,.92rem)", color: C.g400, letterSpacing: ".18em", marginBottom: 36 }}>{t.hero.sub}</p>

          {/* ── CTA Buttons ── */}
          <div className="fu4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
            <button
              className="gbtn"
              style={{ fontFamily: ff, fontSize: "clamp(.82rem,1.6vw,.95rem)", padding: "14px 32px" }}
              onClick={() => setPage("visa-center")}
            >
              🔍 {t.hero.cta1}
            </button>
            <button
              className="obtn"
              style={{ fontFamily: ff, fontSize: "clamp(.82rem,1.6vw,.95rem)", padding: "14px 32px" }}
              onClick={() => setPage("visa-center")}
            >
              📋 {t.hero.cta2}
            </button>
          </div>

          {/* Trust badges */}
          <div className="fu4" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
            {[
              lang === "ar" ? " خدمة موثوقة منذ 2015" : " Trusted since 2015",
              lang === "ar" ? "🌍 195+ دولة" : "🌍 195+ Countries",
              lang === "ar" ? "⚡ نتائج خلال دقائق" : "⚡ Results in minutes",
            ].map((b, i) => (
              <span key={i} style={{ color: C.g400, fontSize: ".78rem", letterSpacing: ".06em" }}>{b}</span>
            ))}
          </div>
        </div>

        <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} viewBox="0 0 1440 80" preserveAspectRatio="none" height={72}>
          <path d="M0,36 Q360,0 720,36 T1440,36 L1440,80 L0,80 Z" fill={C.warmWhite} />
        </svg>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: "96px clamp(20px,6vw,80px)", background: C.warmWhite }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Label text={t.about.label} />
            <h2 style={{ fontSize: "var(--sizeSec,clamp(1.8rem,4vw,3rem))", fontWeight: 800, color: C.g800, marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.25 }}>{t.about.h2}</h2>
            <Divider />
            <p style={{ maxWidth: 680, margin: "16px auto 0", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.about.p}</p>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 3 }}>
            {[[t.about.stat1v, t.about.stat1l], [t.about.stat2v, t.about.stat2l], [t.about.stat3v, t.about.stat3l], [t.about.stat4v, t.about.stat4l]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center", padding: "44px 24px", background: i % 2 === 0 ? C.beige : "#fff", borderTop: `3px solid rgba(201,168,76,${i % 2 === 0 ? .5 : .25})` }}>
                <div className="shimmer" style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{v}</div>
                <div style={{ fontSize: ".76rem", color: C.g400, letterSpacing: ".17em", textTransform: "uppercase", marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MINI VISA CHECKER ── */}
      <section style={{ padding: "0 clamp(20px,6vw,80px)", background: C.warmWhite }}>
        <div style={{ maxWidth: 900, margin: "0 auto", background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`, borderRadius: 16, padding: "36px 40px", border: `1px solid rgba(201,168,76,.2)`, boxShadow: "0 20px 60px rgba(0,0,0,.15)", transform: "translateY(-32px)" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>🔍 {lang === "ar" ? "تحقق من تأشيرتك فوراً" : "Instant Visa Check"}</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem", flex: 1, minWidth: 200, textAlign: "center", padding: "14px", background: "rgba(255,255,255,.06)", borderRadius: 8, border: "1px solid rgba(201,168,76,.2)", cursor: "pointer" }}
              onClick={() => setPage("visa-center")}>
              {lang === "ar" ? "🌍 اختر جنسيتك..." : "🌍 Select nationality..."}
            </div>
            <div style={{ color: "rgba(255,255,255,.3)", fontSize: "1.2rem" }}>→</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: ".88rem", flex: 1, minWidth: 200, textAlign: "center", padding: "14px", background: "rgba(255,255,255,.06)", borderRadius: 8, border: "1px solid rgba(201,168,76,.2)", cursor: "pointer" }}
              onClick={() => setPage("visa-center")}>
              {lang === "ar" ? "✈️ اختر وجهتك..." : "✈️ Select destination..."}
            </div>
            <button onClick={() => setPage("visa-center")} style={{
              padding: "14px 28px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 800, fontSize: ".88rem", whiteSpace: "nowrap",
            }}>
              {lang === "ar" ? "فحص التأشيرة ←" : "Check Visa →"}
            </button>
          </div>
        </div>
      </section>

      {/* ── DIVISIONS ── */}
      <section id="divisions-sec" style={{ padding: "64px clamp(20px,6vw,80px) 96px", background: "#fff" }}>
        <div style={{ maxWidth: 1340, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Label text={lang === "ar" ? "خدماتنا الرئيسية" : "Our Core Services"} />
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: C.g800, marginTop: 10 }}>
              {lang === "ar" ? "كل ما تحتاجه في مكان واحد" : "Everything You Need in One Place"}
            </h2>
            <Divider />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(276px,1fr))", gap: 22 }}>
            {[
              { icon: "🛂", titleAr: "خدمات التأشيرة", titleEn: "Visa Services", subAr: "مركز التأشيرات", subEn: "Visa Center", descAr: "فحص فوري لمتطلبات التأشيرة · تقديم الطلبات · تتبع الحالة · دعم 195+ دولة", descEn: "Instant visa check · Application filing · Status tracking · 195+ countries", page: "visa-center" },
              { icon: "🏠", titleAr: "برامج الإقامة", titleEn: "Residency Programs", subAr: "الإقامة والجنسية", subEn: "Residency & Citizenship", descAr: "جنسية ثانية · إقامة بالاستثمار · الفيزا الذهبية · برامج أوروبية", descEn: "Second passport · Residency by investment · Golden Visa · European programs", page: "residency" },
              { icon: "🏢", titleAr: "تأسيس الشركات", titleEn: "Company Formation", subAr: "الإمارات وتركيا والعالم", subEn: "UAE, Turkey & Globally", descAr: "تسجيل شركات · ترخيص كامل · حساب بنكي · فيزا المستثمر · خدمة PRO", descEn: "Company registration · Full licensing · Bank account · Investor visa · PRO services", page: "company-formation" },
              { icon: "✈️", titleAr: "السفر والسياحة", titleEn: "Travel & Tourism", subAr: "رحلات VIP", subEn: "VIP Travel Services", descAr: "حجز تذاكر وفنادق · رحلات منظمة فاخرة · خدمات مطار VIP · تأمين سفر", descEn: "Flights & hotels · Luxury tours · VIP airport services · Travel insurance", page: "travel" },
            ].map((svc, i) => (
              <div key={i} className="card" onClick={() => setPage(svc.page)} style={{ padding: "40px 34px" }}>
                <div style={{ position: "absolute", top: 0, [lang === "ar" ? "left" : "right"]: 0, width: 52, height: 52, borderTop: `1px solid rgba(201,168,76,.35)`, [lang === "ar" ? "borderLeft" : "borderRight"]: `1px solid rgba(201,168,76,.35)` }} />
                <div style={{ fontSize: "2.4rem", marginBottom: 18 }}>{svc.icon}</div>
                <div style={{ fontSize: ".68rem", letterSpacing: ".2em", color: C.gold, textTransform: "uppercase", marginBottom: 6 }}>{lang === "ar" ? svc.subAr : svc.subEn}</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: C.g800, marginBottom: 10 }}>{lang === "ar" ? svc.titleAr : svc.titleEn}</h3>
                <div className="gl" />
                <p style={{ color: C.g600, fontSize: ".87rem", lineHeight: 1.85, marginBottom: 26 }}>{lang === "ar" ? svc.descAr : svc.descEn}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.gold, fontSize: ".78rem", fontWeight: 700 }}>
                  <span>{lang === "ar" ? "اكتشف المزيد ←" : "Explore →"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ padding: "96px clamp(20px,6vw,80px)", background: `linear-gradient(140deg,${C.dark} 0%,${C.darkMid} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(ellipse at 28% 55%,rgba(201,168,76,.09) 0%,transparent 55%)` }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .1 }} viewBox="0 0 1440 600">
          <circle cx="1220" cy="100" r="280" fill="none" stroke={C.gold} strokeWidth="1" />
          <circle cx="180" cy="500" r="200" fill="none" stroke={C.gold} strokeWidth=".5" />
        </svg>
        <div style={{ maxWidth: 1260, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <Label text={t.why.label} />
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, color: C.beige, marginTop: 10 }}>{t.why.h2}</h2>
            <Divider />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 3 }}>
            {t.why.items.map((item, i) => (
              <div key={i} className="card" style={{ padding: "34px 30px", background: "rgba(255,253,248,.04)", border: `1px solid rgba(201,168,76,.15)`, backdropFilter: "blur(12px)" }}>
                <div style={{ fontSize: "1.9rem", marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: C.goldLight, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ color: C.g400, fontSize: ".87rem", lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "96px clamp(20px,6vw,80px)", background: C.warmWhite }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <Label text={t.testimonials.label} />
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, color: C.g800, marginTop: 10 }}>{t.testimonials.h2}</h2>
          <Divider />

          <div style={{ marginTop: 48, position: "relative" }} key={tIdx}>
            <div style={{
              background: "#fff", border: `1px solid rgba(201,168,76,.2)`,
              padding: "clamp(28px,5vw,56px) clamp(22px,6vw,64px)",
              position: "relative", animation: "fadeIn .5s ease"
            }}>
              <div style={{
                fontSize: "5.5rem", color: "rgba(201,168,76,.12)", fontFamily: "Georgia",
                position: "absolute", top: 8, [lang === "ar" ? "right" : "left"]: 24, lineHeight: 1
              }}>"</div>
              <p style={{ fontSize: "clamp(.92rem,2vw,1.06rem)", color: C.g600, lineHeight: 1.95, fontStyle: "italic", marginBottom: 30, position: "relative" }}>
                {t.testimonials.items[tIdx].text}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: `linear-gradient(135deg,${C.gold},${C.goldLight})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", color: C.g800, fontWeight: 800, flexShrink: 0
                }}>{t.testimonials.items[tIdx].name.charAt(0)}</div>
                <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
                  <div style={{ fontWeight: 700, color: C.g800, fontSize: ".95rem" }}>{t.testimonials.items[tIdx].name}</div>
                  <div style={{ color: C.gold, fontSize: ".76rem", letterSpacing: ".1em" }}>{t.testimonials.items[tIdx].role}</div>
                </div>
              </div>
            </div>
            {/* dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 26 }}>
              {t.testimonials.items.map((_, i) => (
                <div key={i} onClick={() => setTIdx(i)} style={{
                  width: i === tIdx ? 26 : 8, height: 8, borderRadius: 4,
                  background: i === tIdx ? C.gold : C.g200,
                  cursor: "pointer", transition: "all .3s"
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px clamp(20px,6vw,80px)", background: `linear-gradient(140deg,${C.gold} 0%,${C.goldLight} 45%,${C.gold} 100%)`, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .08 }} viewBox="0 0 1440 400">
          <circle cx="720" cy="200" r="340" fill="none" stroke={C.g800} strokeWidth="1.2" />
          <circle cx="720" cy="200" r="240" fill="none" stroke={C.g800} strokeWidth=".7" />
        </svg>
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: "clamp(2rem,5.5vw,3.8rem)", fontWeight: 600, color: C.g800, marginBottom: 14, lineHeight: 1.2, whiteSpace: "pre-line" }}>{t.cta.h2}</h2>
          <p style={{ color: "rgba(45,40,32,.65)", fontSize: "1rem", marginBottom: 44, letterSpacing: ".08em" }}>{t.cta.sub}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="dbtn" style={{ fontFamily: "inherit" }} onClick={() => setPage("booking")}>{t.cta.btn1}</button>
            <button style={{ background: "transparent", color: C.g800, border: "2px solid rgba(45,40,32,.35)", padding: "12px 36px", fontSize: ".82rem", letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", borderRadius: 2, transition: "all .3s" }}>{t.cta.btn2}</button>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// // ═══════════════════════════════════════════════════════════════
// INNER PAGE HERO
// ═══════════════════════════════════════════════════════════════
function PageHero({ title, subtitle, children }) {
  return (
    <section
      style={{
        padding: "110px clamp(20px,6vw,80px) 90px",
        background: `
          radial-gradient(circle at top right, rgba(212,175,55,0.15), transparent 35%),
          linear-gradient(140deg, ${C.dark} 0%, ${C.darkMid} 100%)
        `,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HeroBG />
      <Particles n={18} />

      {/* Glow Effect */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.08)",
          filter: "blur(100px)",
          top: "-150px",
          right: "-100px",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            border: `1px solid ${C.gold}`,
            borderRadius: "999px",
            color: C.gold,
            fontSize: ".75rem",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          ALKOWN GLOBAL
        </span>

        <h1
          className="fu"
          style={{
            fontSize: "clamp(2.4rem,5vw,4.8rem)",
            fontWeight: 800,
            color: C.beige,
            lineHeight: 1.15,
            marginBottom: "18px",
            letterSpacing: ".02em",
          }}
        >
          {title}
        </h1>

        <Divider />

        <p
          className="fu2"
          style={{
            color: C.gold,
            letterSpacing: ".22em",
            fontSize: ".82rem",
            textTransform: "uppercase",
            marginTop: "14px",
            marginBottom: "26px",
          }}
        >
          {subtitle}
        </p>

        {children}
      </div>
    </section>
  );
}
// ═══════════════════════════════════════════════════════════════
// TRAVEL PAGE (legacy — replaced by TravelFullPage from pages/Travel.jsx)
// ═══════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
function TravelPage({ t, lang, ff, setPage }) {
  const [dbServices, setDbServices] = useState([]);
  useEffect(() => {
    supabase.from("services").select("id, name, price, price_min, price_max").eq("is_active", true).order("name").then(({ data }) => setDbServices(data || []));
  }, []);

  function priceLabel(s) {
    if (s.price_min && s.price_max) return `$${Number(s.price_min).toLocaleString()} – $${Number(s.price_max).toLocaleString()}`;
    if (s.price_min) return `$${Number(s.price_min).toLocaleString()}+`;
    if (s.price) return `$${Number(s.price).toLocaleString()}`;
    return "—";
  }

  return (
    <>
      <PageHero title={t.travel.hero} subtitle={t.travel.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.travel.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 20 }}>
            {t.travel.services.map((svc, i) => {
              const hasBg = svc.bg_image || svc.bg_color;
              const cardStyle = hasBg ? {
                backgroundImage: svc.bg_image ? `url(${svc.bg_image})` : "none",
                backgroundColor: svc.bg_color || "#fff",
                backgroundSize: "cover", backgroundPosition: "center",
              } : {};
              return (
              <div key={i} className="card" style={{ padding: "36px 32px", display: "flex", gap: 18, alignItems: "flex-start", ...cardStyle }}>
                <div style={{ width: 48, height: 48, background: `linear-gradient(135deg,rgba(201,168,76,.14),rgba(240,208,128,.08))`, border: `1px solid rgba(201,168,76,.3)`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{svc.icon}</div>
                <div>
                  <h3 style={{ color: hasBg&&svc.bg_image?"#fff":C.g800, fontWeight: 700, marginBottom: 7, fontSize: ".98rem" }}>{svc.title}</h3>
                  <div className="gl" style={{ marginBottom: 8 }} />
                  <p style={{ color: hasBg&&svc.bg_image?"rgba(255,255,255,.8)":C.g400, fontSize: ".84rem", lineHeight: 1.7 }}>{svc.desc}</p>
                </div>
              </div>
            )})}
          </div>

          {/* قائمة الأسعار من قاعدة البيانات */}
          {dbServices.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 8 }}>
                  {lang === "ar" ? "أسعار التأشيرات" : "Visa Pricing"}
                </div>
                <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: C.g800, margin: 0 }}>
                  {lang === "ar" ? "قائمة خدماتنا وأسعارها" : "Our Services & Pricing"}
                </h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {dbServices.map(s => (
                  <div key={s.id} className="card" style={{ padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ color: C.g800, fontWeight: 600, fontSize: ".9rem", lineHeight: 1.5 }}>{s.name}</span>
                    <span style={{ color: C.gold, fontWeight: 800, fontSize: ".95rem", whiteSpace: "nowrap", flexShrink: 0 }}>{priceLabel(s)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 56 }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>{t.nav.book}</button>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CITIZENSHIP PAGE
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// COMPANY FORMATION PAGE
// ═══════════════════════════════════════════════════════════════
function CompanyFormationPage({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const steps    = ar ? CF_STEPS.ar    : CF_STEPS.en;
  const services = ar ? CF_SERVICES.ar : CF_SERVICES.en;
  const industries = ar ? CF_INDUSTRIES.ar : CF_INDUSTRIES.en;
  const whyUs    = ar ? CF_WHY.ar      : CF_WHY.en;
  const faqs     = ar ? CF_FAQ.ar      : CF_FAQ.en;
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <PageHero
        title={ar ? "تأسيس الشركات" : "Company Formation"}
        subtitle={ar ? "الإمارات · السعودية · تركيا · المملكة المتحدة · والعالم" : "UAE · Saudi · Turkey · UK · Worldwide"}
      />

      {/* ── Stats Bar ── */}
      <div style={{ background: C.beige, borderBottom: `1px solid rgba(201,168,76,.12)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {[
            [ar ? "+2,000" : "2,000+", ar ? "شركة مؤسسة"   : "Companies Founded"],
            [ar ? "48h"    : "48h",    ar ? "أسرع تأسيس"    : "Fastest Setup"],
            [ar ? "11"     : "11",     ar ? "وجهة عالمية"   : "Destinations"],
            [ar ? "98%"    : "98%",    ar ? "نسبة النجاح"   : "Success Rate"],
            [ar ? "10+"    : "10+",    ar ? "سنوات خبرة"    : "Years Experience"],
          ].map(([v, l], i, arr) => (
            <div key={i} style={{ textAlign:"center", padding:"28px 12px", borderInlineEnd: i<arr.length-1 ? `1px solid rgba(201,168,76,.12)` : "none" }}>
              <div className="shimmer" style={{ fontSize:"2rem", fontWeight:800, fontFamily:"Georgia,serif", display:"block" }}>{v}</div>
              <div style={{ fontSize:".72rem", color:C.g400, letterSpacing:".15em", textTransform:"uppercase", marginTop:6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust Banner ── */}
      <div style={{ background:`linear-gradient(135deg,${C.dark},${C.darkMid})`, padding:"18px clamp(20px,6vw,80px)", borderBottom:`1px solid rgba(201,168,76,.15)` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"clamp(16px,4vw,48px)" }}>
          {[
            ar?"✅ بدون رسوم خفية":"✅ No Hidden Fees",
            ar?"⚡ تأسيس في 48 ساعة":"⚡ Setup in 48 Hours",
            ar?"📞 دعم 24/7":"📞 24/7 Support",
            ar?"🔒 امتثال قانوني 100%":"🔒 100% Legal Compliance",
            ar?"🌍 +20 دولة":"🌍 20+ Countries",
          ].map((t,i) => (
            <span key={i} style={{ color:"rgba(255,255,255,.75)", fontSize:".82rem", letterSpacing:".06em", whiteSpace:"nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      <section style={{ padding:"80px clamp(20px,6vw,80px)", background:"#fff" }}>
        <div style={{ maxWidth:1260, margin:"0 auto" }}>

          {/* ── Jurisdictions ── */}
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <Label text={ar ? "المناطق المتاحة" : "Available Jurisdictions"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.4rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "نؤسس شركتك في 11 وجهة عالمية" : "We Register Your Company in 11 Global Destinations"}
            </h2>
            <Divider />
            <p style={{ color:C.g400, maxWidth:560, margin:"12px auto 0", fontSize:".9rem", lineHeight:1.8 }}>
              {ar ? "اختر الوجهة الأنسب لنشاطك التجاري — نوجهك لأفضل قرار بناءً على احتياجاتك وميزانيتك" : "Choose the best destination for your business — we guide you to the optimal decision based on your needs and budget"}
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:80 }}>
            {CF_JURISDICTIONS.map((j, i) => (
              <div key={i} className="card" style={{ padding:"32px 24px", position:"relative", overflow:"hidden" }}>
                {/* Tag */}
                <div style={{ position:"absolute", top:14, insetInlineStart:14, background:`rgba(201,168,76,.12)`, border:`1px solid rgba(201,168,76,.25)`, borderRadius:20, padding:"3px 10px", fontSize:".6rem", letterSpacing:".12em", color:C.gold, fontWeight:700, textTransform:"uppercase" }}>
                  {ar ? j.tagAr : j.tagEn}
                </div>
                <div style={{ textAlign:"center", paddingTop:16 }}>
                  <div style={{ fontSize:"2.6rem", marginBottom:8 }}>{j.flag}</div>
                  <h3 style={{ fontSize:"1.05rem", color:C.g800, fontWeight:800, marginBottom:4 }}>{ar ? j.nameAr : j.nameEn}</h3>
                  <div style={{ color:C.gold, fontSize:".72rem", letterSpacing:".15em", textTransform:"uppercase", marginBottom:12 }}>⏱ {ar ? j.timeAr : j.timeEn}</div>
                  <div className="gl" style={{ margin:"0 auto 14px" }} />
                  <p style={{ color:C.g400, fontSize:".82rem", lineHeight:1.7, marginBottom:16 }}>{ar ? j.descAr : j.descEn}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, textAlign:ar?"right":"left" }}>
                    {(ar ? j.detailsAr : j.detailsEn).map((d,k) => (
                      <div key={k} style={{ display:"flex", alignItems:"center", gap:7, fontSize:".78rem", color:C.g600 }}>
                        <span style={{ color:C.gold, fontSize:".7rem" }}>◆</span>{d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Industries ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Label text={ar ? "القطاعات التي نخدمها" : "Industries We Serve"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "خبرة في كل القطاعات" : "Expertise Across All Sectors"}
            </h2>
            <Divider />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:14, marginBottom:80 }}>
            {industries.map((ind,i) => (
              <div key={i} style={{ textAlign:"center", padding:"20px 12px", background:C.beige, border:`1px solid rgba(201,168,76,.12)`, borderRadius:8, transition:"all .25s", cursor:"default" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=`rgba(201,168,76,.1)`; e.currentTarget.style.borderColor=`rgba(201,168,76,.35)`; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=C.beige; e.currentTarget.style.borderColor=`rgba(201,168,76,.12)`; }}>
                <div style={{ fontSize:"1.8rem", marginBottom:8 }}>{ind.icon}</div>
                <div style={{ fontSize:".76rem", color:C.g800, fontWeight:600, lineHeight:1.4 }}>{ind.t}</div>
              </div>
            ))}
          </div>

          {/* ── Process Steps ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Label text={ar ? "خطوات التأسيس" : "The Process"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "كيف نؤسس شركتك؟" : "How We Set Up Your Company"}
            </h2>
            <Divider />
          </div>
          <div style={{ background:`linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius:16, padding:"52px clamp(20px,4vw,52px)", marginBottom:80, border:`1px solid rgba(201,168,76,.15)`, boxShadow:`0 20px 60px rgba(0,0,0,.12)` }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:32 }}>
              {steps.map((step,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ position:"relative", marginBottom:14 }}>
                    <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${C.goldDark},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:"1.3rem", boxShadow:`0 4px 18px rgba(201,168,76,.3)` }}>
                      {step.icon}
                    </div>
                    <div style={{ position:"absolute", top:-5, insetInlineEnd:-2, width:22, height:22, borderRadius:"50%", background:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:".6rem", fontWeight:800, color:C.dark }}>
                      {i+1}
                    </div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,.9)", fontSize:".85rem", fontWeight:700, marginBottom:4 }}>{step.t}</div>
                  <div style={{ color:"rgba(255,255,255,.45)", fontSize:".74rem", lineHeight:1.5 }}>{step.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Why Us ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Label text={ar ? "لماذا الكون؟" : "Why Alkown?"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "ما يميزنا عن غيرنا" : "What Sets Us Apart"}
            </h2>
            <Divider />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginBottom:80 }}>
            {whyUs.map((w,i) => (
              <div key={i} style={{ display:"flex", gap:18, padding:"28px 22px", background:C.beige, border:`1px solid rgba(201,168,76,.12)`, borderRadius:10, transition:"all .25s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`rgba(201,168,76,.35)`; e.currentTarget.style.transform="translateY(-3px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=`rgba(201,168,76,.12)`; e.currentTarget.style.transform=""; }}>
                <div style={{ fontSize:"1.8rem", flexShrink:0 }}>{w.icon}</div>
                <div>
                  <div style={{ fontWeight:800, color:C.g800, fontSize:".92rem", marginBottom:5 }}>{w.t}</div>
                  <div style={{ color:C.g400, fontSize:".8rem", lineHeight:1.65 }}>{w.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Services list ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Label text={ar ? "ما نقدمه" : "What We Offer"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "خدمات متكاملة من البداية للنهاية" : "End-to-End Services"}
            </h2>
            <Divider />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:80 }}>
            {services.map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", background:C.beige, border:`1px solid rgba(201,168,76,.12)`, borderRadius:6 }}>
                <div style={{ width:8, height:8, background:C.gold, transform:"rotate(45deg)", flexShrink:0 }} />
                <span style={{ color:C.g800, fontSize:".86rem", fontWeight:500 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* ── FAQ ── */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <Label text={ar ? "الأسئلة الشائعة" : "FAQ"} />
            <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800, color:C.g800, marginTop:8 }}>
              {ar ? "أسئلة يسألها عملاؤنا دائماً" : "Questions Our Clients Always Ask"}
            </h2>
            <Divider />
          </div>
          <div style={{ maxWidth:820, margin:"0 auto 80px" }}>
            {faqs.map((faq,i) => (
              <div key={i} style={{ borderBottom:`1px solid rgba(201,168,76,.12)`, overflow:"hidden" }}>
                <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{
                  width:"100%", textAlign:ar?"right":"left", padding:"22px 0",
                  background:"transparent", border:"none", cursor:"pointer",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  fontFamily:ff, color:C.g800, fontSize:".95rem", fontWeight:600, gap:16,
                }}>
                  <span>{faq.q}</span>
                  <span style={{ color:C.gold, fontSize:"1.1rem", transition:"transform .25s", transform:openFaq===i?"rotate(45deg)":"rotate(0)", flexShrink:0 }}>+</span>
                </button>
                {openFaq===i && (
                  <div style={{ padding:"0 0 22px", color:C.g400, fontSize:".88rem", lineHeight:1.9, animation:"fadeUp .25s ease" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── CTA ── */}
          <div style={{ textAlign:"center", padding:"60px 40px", background:`linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius:16, border:`1px solid rgba(201,168,76,.15)` }}>
            <Label text={ar ? "ابدأ اليوم" : "Start Today"} />
            <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:800, color:"#fff", margin:"12px 0 10px", whiteSpace:"pre-line" }}>
              {ar ? "أسّس شركتك الآن\nبضغطة واحدة" : "Start Your Company Now\nWith One Click"}
            </h2>
            <p style={{ color:"rgba(255,255,255,.55)", fontSize:".9rem", marginBottom:28 }}>
              {ar ? "استشارة مجانية • بدون رسوم خفية • نتائج مضمونة" : "Free consultation • No hidden fees • Guaranteed results"}
            </p>
            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <button className="gbtn" style={{ fontFamily:ff, padding:"14px 32px" }} onClick={() => setPage("booking")}>
                {ar ? "🚀 احجز استشارة مجانية" : "🚀 Book Free Consultation"}
              </button>
              <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer"
                style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", background:"rgba(37,211,102,.12)", border:"1px solid rgba(37,211,102,.3)", color:"#25d366", borderRadius:8, fontFamily:ff, fontWeight:700, fontSize:".88rem", textDecoration:"none", transition:"all .25s" }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(37,211,102,.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(37,211,102,.12)"}>
                💬 {ar ? "واتساب مباشر" : "WhatsApp Us"}
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE CENTER PAGE
// ═══════════════════════════════════════════════════════════════
function KnowledgeCenterPage({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const { role } = useAuth() || {};
  const canManage = role === "admin" || role === "manager" || role === "staff";

  const [activeCat, setActiveCat]     = useState("all");
  const [search, setSearch]           = useState("");
  const [articles, setArticles]       = useState(KC_DEFAULT_ARTICLES);
  const [loading, setLoading]         = useState(false);
  const [editorOpen, setEditorOpen]   = useState(false);
  const [editing, setEditing]         = useState(null);
  const [delConfirm, setDelConfirm]   = useState(null);
  const [toast, setToast]             = useState("");
  const [readingArticle, setReadingArticle] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("knowledge_articles").select("*").order("date", { ascending: false });
      if (!error) {
        const dbIds = new Set((data || []).map(a => a.id));
        const merged = [...(data || []), ...KC_DEFAULT_ARTICLES.filter(a => !dbIds.has(a.id))];
        setArticles(merged.length > 0 ? merged : KC_DEFAULT_ARTICLES);
      }
    } catch { /* use defaults */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const filtered = articles.filter(a => {
    if (activeCat !== "all" && a.category !== activeCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.titleAr?.includes(search) || a.titleEn?.toLowerCase().includes(q) || a.excerptAr?.includes(search) || a.excerptEn?.toLowerCase().includes(q);
  });
  const featured = filtered.filter(a => a.featured);
  const regular  = filtered.filter(a => !a.featured);

  async function saveArticle(form) {
    const isDefault = KC_DEFAULT_ARTICLES.find(d => d.id === form.id);
    if (form.id && !isDefault) {
      const { id, ...payload } = form;
      const { error } = await supabase.from("knowledge_articles").update(payload).eq("id", id);
      if (error) throw error;
      await loadArticles();
    } else if (!form.id) {
      const { error } = await supabase.from("knowledge_articles").insert([form]);
      if (error) throw error;
      await loadArticles();
    } else {
      setArticles(prev => prev.map(a => a.id === form.id ? { ...form } : a));
    }
    showToast(ar ? "✅ تم الحفظ" : "✅ Saved");
  }

  async function deleteArticle(id) {
    if (KC_DEFAULT_ARTICLES.find(d => d.id === id)) {
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      await supabase.from("knowledge_articles").delete().eq("id", id);
      await loadArticles();
    }
    setDelConfirm(null);
    showToast(ar ? "🗑️ تم الحذف" : "🗑️ Deleted");
  }

  return (
    <>
      {readingArticle && <KcReadModal article={readingArticle} lang={lang} ff={ff} setPage={setPage} onClose={() => setReadingArticle(null)} />}
      <PageHero
        title={ar ? "مركز المعرفة" : "Knowledge Center"}
        subtitle={ar ? `${articles.length} مقال · جنسية · إقامة · تأشيرات · شركات` : `${articles.length} Articles · Citizenship · Residency · Visas · Companies`}
      >
        {/* Search inside hero */}
        <div style={{ position: "relative", maxWidth: 500, margin: "0 auto" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={ar ? "ابحث في المقالات..." : "Search articles..."}
            style={{ width: "100%", padding: "13px 48px 13px 18px", borderRadius: 6, border: `1px solid rgba(201,168,76,.35)`, background: "rgba(255,255,255,.08)", color: "#fff", fontSize: ".92rem", outline: "none", fontFamily: ff, backdropFilter: "blur(10px)", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", [ar ? "left" : "right"]: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", fontSize: "1rem" }}>🔍</span>
        </div>
      </PageHero>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#fff", padding: "11px 24px", borderRadius: 40, fontSize: ".86rem", zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,.3)", border: `1px solid rgba(201,168,76,.3)` }}>{toast}</div>
      )}

      <section style={{ padding: "64px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 44, flexWrap: "wrap" }}>
            {Object.entries(KC_CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setActiveCat(key)} style={{
                padding: "8px 16px", borderRadius: 40, border: `1.5px solid`,
                borderColor: activeCat === key ? C.gold : "rgba(201,168,76,.2)",
                background: activeCat === key ? `rgba(201,168,76,.1)` : "transparent",
                color: activeCat === key ? C.gold : C.g400,
                cursor: "pointer", fontFamily: ff, fontSize: ".82rem", fontWeight: activeCat === key ? 700 : 400, transition: "all .22s",
              }}>
                {cat.icon} {ar ? cat.ar : cat.en}
              </button>
            ))}
            <span style={{ color: C.g400, fontSize: ".76rem", marginInlineStart: "auto" }}>{filtered.length} {ar ? "مقال" : "articles"}</span>
            {canManage && (
              <button onClick={() => { setEditing(null); setEditorOpen(true); }} className="gbtn" style={{ fontFamily: ff, fontSize: ".82rem", padding: "9px 20px" }}>
                ✍️ {ar ? "مقال جديد" : "New Article"}
              </button>
            )}
          </div>

          {loading && <div style={{ textAlign: "center", padding: "48px 0", color: C.g400 }}>⏳ {ar ? "جاري التحميل..." : "Loading..."}</div>}

          {/* Featured */}
          {!loading && featured.length > 0 && activeCat === "all" && !search && (
            <div style={{ marginBottom: 52 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 4, height: 22, background: `linear-gradient(180deg,${C.gold},${C.goldLight})`, borderRadius: 2 }} />
                <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.05rem" }}>{ar ? "المقالات المميزة" : "Featured Articles"}</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
                {featured.map(a => <KcArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage} onEdit={art => { setEditing(art); setEditorOpen(true); }} onDelete={id => setDelConfirm(id)} onRead={setReadingArticle} />)}
              </div>
            </div>
          )}

          {/* All / filtered */}
          {!loading && (
            <div>
              {activeCat === "all" && !search && regular.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 22, background: `rgba(201,168,76,.35)`, borderRadius: 2 }} />
                  <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.05rem" }}>{ar ? "جميع المقالات" : "All Articles"}</h2>
                </div>
              )}
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: 14 }}>📭</div>
                  <p style={{ color: C.g400 }}>{ar ? "لا توجد مقالات" : "No articles found"}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
                  {(search || activeCat !== "all" ? filtered : regular).map(a => (
                    <KcArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage} onEdit={art => { setEditing(art); setEditorOpen(true); }} onDelete={id => setDelConfirm(id)} onRead={setReadingArticle} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {[
              ar ? "برامج الإقامة بالاستثمار" : "Residency by Investment",
              ar ? "تأسيس الشركات في الإمارات" : "UAE Company Formation",
              ar ? "فحص متطلبات التأشيرة" : "Visa Requirements Check",
              ar ? "الجنسية الثانية" : "Second Citizenship",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: C.beige, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 2 }}>
                <div style={{ width: 8, height: 8, background: C.gold, transform: "rotate(45deg)", flexShrink: 0 }} />
                <span style={{ color: C.g800, fontSize: ".9rem", fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("visa-center")}>
              {ar ? "🔍 فحص التأشيرة" : "🔍 Check Visa Requirements"}
            </button>
          </div>
        </div>
      </section>

      {/* Article Editor */}
      {editorOpen && <KcArticleEditor article={editing} lang={lang} ff={ff} onSave={saveArticle} onClose={() => { setEditorOpen(false); setEditing(null); }} />}

      {/* Delete Confirm */}
      {delConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px 36px", maxWidth: 360, textAlign: "center", fontFamily: ff }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🗑️</div>
            <h3 style={{ color: C.g800, fontWeight: 700, marginBottom: 10 }}>{ar ? "حذف المقال؟" : "Delete Article?"}</h3>
            <p style={{ color: C.g400, fontSize: ".86rem", marginBottom: 24 }}>{ar ? "لا يمكن التراجع عن هذا الإجراء." : "This cannot be undone."}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDelConfirm(null)} style={{ padding: "9px 20px", background: "transparent", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontFamily: ff }}>{ar ? "إلغاء" : "Cancel"}</button>
              <button onClick={() => deleteArticle(delConfirm)} style={{ padding: "9px 20px", background: "#e53935", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", fontFamily: ff, fontWeight: 700 }}>{ar ? "حذف" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Rich content renderer ─────────────────────────────────────
function KcRichContent({ text }) {
  if (!text) return null;
  const lines = text.split("\n").filter(Boolean);
  return (
    <div style={{ fontSize: ".85rem", lineHeight: 1.9, color: C.g600 }}>
      {lines.map((line, i) => {
        if (line.startsWith("##")) return (
          <div key={i} style={{ fontWeight: 800, color: C.g800, fontSize: ".9rem", marginTop: 14, marginBottom: 6, borderBottom: "1px solid rgba(201,168,76,.15)", paddingBottom: 4 }}>
            {line.replace(/^##\s*/, "")}
          </div>
        );
        if (line.startsWith("•") || line.startsWith("-")) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
            <span style={{ color: C.gold, flexShrink: 0, fontWeight: 800, marginTop: 1 }}>✓</span>
            <span>{line.replace(/^[•-]\s*/, "")}</span>
          </div>
        );
        if (line.startsWith("→")) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
            <span style={{ color: C.goldDark, flexShrink: 0, fontWeight: 800 }}>→</span>
            <span>{line.replace(/^→\s*/, "")}</span>
          </div>
        );
        if (line.startsWith("$")) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start", background: "rgba(201,168,76,.06)", padding: "4px 10px", borderRadius: 6 }}>
            <span style={{ color: "#2e7d32", flexShrink: 0, fontWeight: 800 }}>💰</span>
            <span>{line.replace(/^\$\s*/, "")}</span>
          </div>
        );
        return <p key={i} style={{ marginBottom: 8 }}>{line}</p>;
      })}
    </div>
  );
}

// ── Article Reading Modal ─────────────────────────────────────
function KcReadModal({ article, lang, ff, onClose, setPage }) {
  const ar = lang === "ar";
  const title   = ar ? article.titleAr   : article.titleEn;
  const content = ar ? article.contentAr : article.contentEn;
  const cat     = KC_CATEGORIES[article.category] || KC_CATEGORIES.all;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9998, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 20px", overflowY: "auto" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 780, boxShadow: "0 32px 80px rgba(0,0,0,.3)", fontFamily: ff, direction: ar ? "rtl" : "ltr", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, padding: "28px 32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: `${cat.color}30`, color: cat.color === "#8a6010" ? C.gold : cat.color, fontSize: ".65rem", fontWeight: 700, padding: "3px 12px", borderRadius: 20, border: `1px solid ${cat.color}45` }}>
                  {cat.icon} {ar ? cat.ar : cat.en}
                </span>
                <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".72rem" }}>📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}</span>
              </div>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.4rem)", lineHeight: 1.4, margin: 0 }}>{title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: "1.2rem", flexShrink: 0 }}>×</button>
          </div>
        </div>
        <div style={{ padding: "28px 32px 32px" }}>
          {content ? <KcRichContent text={content} /> : (
            <p style={{ color: C.g400, fontStyle: "italic" }}>{ar ? "لا يوجد محتوى تفصيلي." : "No detailed content available."}</p>
          )}
          <div style={{ marginTop: 28, padding: "20px 24px", background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius: 12, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".88rem", marginBottom: 14 }}>
              {ar ? "هل تريد معرفة المزيد أو البدء في تقديم طلبك؟" : "Want to learn more or start your application?"}
            </p>
            <button onClick={() => { onClose(); setPage("booking"); }} className="gbtn" style={{ fontFamily: ff, fontSize: ".88rem" }}>
              {ar ? "احصل على استشارة مجانية" : "Get Free Consultation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Article Card (used by KnowledgeCenterPage) ───────────────
function KcArticleCard({ article, lang, ff, canManage, onEdit, onDelete, onRead }) {
  const ar = lang === "ar";
  const title   = ar ? article.titleAr   : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;
  const cat     = KC_CATEGORIES[article.category] || KC_CATEGORIES.all;
  return (
    <article className="card" onClick={() => onRead(article)} style={{ display: "flex", flexDirection: "column", position: "relative", padding: 0, cursor: "pointer", transition: "all .25s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = ""; }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${cat.color},${C.gold},${C.goldLight})` }} />
      {canManage && (
        <div style={{ position: "absolute", top: 14, [ar ? "left" : "right"]: 10, display: "flex", gap: 5, zIndex: 2 }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(article)} style={{ background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: C.gold, fontWeight: 700 }}>✏️</button>
          <button onClick={() => onDelete(article.id)} style={{ background: "rgba(229,57,53,.08)", border: "1px solid rgba(229,57,53,.22)", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: "#e53935", fontWeight: 700 }}>🗑️</button>
        </div>
      )}
      <div style={{ padding: "20px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${cat.color}15`, color: cat.color, fontSize: ".64rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${cat.color}30` }}>
            {cat.icon} {ar ? cat.ar : cat.en}
          </span>
          {article.featured && (
            <span style={{ background: "rgba(201,168,76,.1)", color: C.gold, fontSize: ".64rem", fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1px solid rgba(201,168,76,.22)" }}>⭐ {ar ? "مميز" : "Featured"}</span>
          )}
        </div>
        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".95rem", lineHeight: 1.5, marginBottom: 8, fontFamily: ff }}>{title}</h3>
        <p style={{ color: C.g400, fontSize: ".82rem", lineHeight: 1.75, flex: 1, marginBottom: 14 }}>{excerpt}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(201,168,76,.1)" }}>
          <span style={{ color: C.g400, fontSize: ".71rem" }}>📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}</span>
          <span style={{ color: C.gold, fontSize: ".76rem", fontWeight: 700 }}>{ar ? "اقرأ المزيد ←" : "Read more →"}</span>
        </div>
      </div>
    </article>
  );
}

// ── Article Editor Modal (used by KnowledgeCenterPage) ───────
function KcArticleEditor({ article, lang, ff, onSave, onClose }) {
  const ar = lang === "ar";
  const isNew = !article?.id;
  const [form, setForm] = useState({ titleAr:"", titleEn:"", excerptAr:"", excerptEn:"", contentAr:"", contentEn:"", category:"visa", featured:false, readTime:5, date:new Date().toISOString().split("T")[0], ...(article||{}) });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.titleAr.trim() || !form.titleEn.trim()) { setErr(ar ? "العنوانان مطلوبان" : "Both titles are required"); return; }
    setSaving(true); setErr("");
    try { await onSave(form); onClose(); } catch(e) { setErr(e.message||"Error"); } finally { setSaving(false); }
  }

  const inp = { width:"100%", padding:"10px 13px", borderRadius:7, border:`1px solid rgba(201,168,76,.25)`, background:C.warmWhite, fontFamily:ff, fontSize:".86rem", color:C.g800, outline:"none", boxSizing:"border-box", marginBottom:12 };
  const lbl = { display:"block", color:C.g600, fontSize:".75rem", fontWeight:700, marginBottom:4 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:14, width:"100%", maxWidth:700, maxHeight:"90vh", overflow:"auto", fontFamily:ff, direction:ar?"rtl":"ltr" }}>
        <div style={{ background:`linear-gradient(135deg,${C.dark},${C.darkMid})`, padding:"20px 26px", borderRadius:"14px 14px 0 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h2 style={{ color:"#fff", fontWeight:700, fontSize:"1rem", margin:0 }}>{isNew?(ar?"✍️ مقال جديد":"✍️ New Article"):(ar?"✏️ تعديل المقال":"✏️ Edit Article")}</h2>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.1)", border:"none", color:"#fff", borderRadius:7, width:30, height:30, cursor:"pointer", fontSize:"1rem" }}>×</button>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:8 }}>
            <div>
              <label style={lbl}>{ar?"التصنيف":"Category"}</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)} style={{...inp,marginBottom:0}}>
                {Object.entries(KC_CATEGORIES).filter(([k])=>k!=="all").map(([k,v])=><option key={k} value={k}>{v.icon} {ar?v.ar:v.en}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>{ar?"تاريخ النشر":"Date"}</label>
              <input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={{...inp,marginBottom:0}}/>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, padding:"9px 12px", background:C.beige, borderRadius:7 }}>
            <input type="checkbox" id="kcfeat" checked={form.featured} onChange={e=>set("featured",e.target.checked)} style={{width:15,height:15,accentColor:C.gold}}/>
            <label htmlFor="kcfeat" style={{...lbl,marginBottom:0,cursor:"pointer"}}>⭐ {ar?"مقال مميز":"Featured article"}</label>
            <div style={{marginInlineStart:"auto",display:"flex",alignItems:"center",gap:6}}>
              <input type="number" min={1} max={60} value={form.readTime} onChange={e=>set("readTime",+e.target.value)} style={{width:44,padding:"4px 7px",borderRadius:5,border:`1px solid rgba(201,168,76,.25)`,fontFamily:ff,textAlign:"center"}}/>
              <span style={{color:C.g400,fontSize:".75rem"}}>{ar?"دقيقة":"min"}</span>
            </div>
          </div>
          <div style={{ background:`rgba(201,168,76,.04)`, border:`1px solid rgba(201,168,76,.12)`, borderRadius:9, padding:14, marginBottom:12 }}>
            <div style={{color:C.gold,fontSize:".68rem",fontWeight:700,letterSpacing:".1em",marginBottom:10}}>🇸🇦 العربية</div>
            <label style={lbl}>{ar?"العنوان بالعربي":"Title (Arabic)"}</label>
            <input value={form.titleAr} onChange={e=>set("titleAr",e.target.value)} placeholder="عنوان المقال بالعربي" style={{...inp,direction:"rtl"}}/>
            <label style={lbl}>{ar?"المقتطف":"Excerpt"}</label>
            <textarea value={form.excerptAr} onChange={e=>set("excerptAr",e.target.value)} rows={2} style={{...inp,resize:"vertical",direction:"rtl"}}/>
            <label style={lbl}>{ar?"المحتوى الكامل":"Full Content"}</label>
            <textarea value={form.contentAr} onChange={e=>set("contentAr",e.target.value)} rows={4} style={{...inp,resize:"vertical",marginBottom:0,direction:"rtl"}}/>
          </div>
          <div style={{ background:`rgba(30,21,8,.03)`, border:`1px solid rgba(201,168,76,.12)`, borderRadius:9, padding:14, marginBottom:18 }}>
            <div style={{color:C.g400,fontSize:".68rem",fontWeight:700,letterSpacing:".1em",marginBottom:10}}>🇬🇧 English</div>
            <label style={lbl}>Title (English)</label>
            <input value={form.titleEn} onChange={e=>set("titleEn",e.target.value)} placeholder="Article title in English" style={{...inp,direction:"ltr"}}/>
            <label style={lbl}>Excerpt</label>
            <textarea value={form.excerptEn} onChange={e=>set("excerptEn",e.target.value)} rows={2} style={{...inp,resize:"vertical",direction:"ltr"}}/>
            <label style={lbl}>Full Content</label>
            <textarea value={form.contentEn} onChange={e=>set("contentEn",e.target.value)} rows={4} style={{...inp,resize:"vertical",marginBottom:0,direction:"ltr"}}/>
          </div>
          {err && <div style={{color:"#e53935",fontSize:".82rem",marginBottom:12,padding:"7px 11px",background:"rgba(229,57,53,.07)",borderRadius:5}}>⚠️ {err}</div>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button onClick={onClose} style={{padding:"9px 20px",background:"transparent",border:`1px solid rgba(201,168,76,.3)`,borderRadius:7,cursor:"pointer",color:C.g600,fontFamily:ff,fontSize:".86rem"}}>{ar?"إلغاء":"Cancel"}</button>
            <button onClick={handleSave} disabled={saving} className="gbtn" style={{fontFamily:ff,fontSize:".86rem",opacity:saving?.7:1}}>
              {saving?(ar?"جاري الحفظ...":"Saving..."):(ar?"💾 حفظ المقال":"💾 Save Article")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADVERTISING PAGE
// ═══════════════════════════════════════════════════════════════
function AdvertisingPage({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.advertising.hero} subtitle={t.advertising.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2 }}>{t.advertising.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {t.advertising.services.map((svc, i) => {
              const hasBg = svc.bg_image || svc.bg_color;
              const cardStyle = hasBg ? { backgroundImage: svc.bg_image?`url(${svc.bg_image})`:"none", backgroundColor: svc.bg_color||"#fff", backgroundSize:"cover", backgroundPosition:"center" } : {};
              return (
              <div key={i} className="card" style={{ padding: "34px 30px", ...cardStyle }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{svc.icon}</div>
                <h3 style={{ color: hasBg&&svc.bg_image?"#fff":C.g800, fontWeight: 700, marginBottom: 6, fontSize: ".98rem" }}>{svc.title}</h3>
                <div className="gl" />
                <p style={{ color: hasBg&&svc.bg_image?"rgba(255,255,255,.8)":C.g400, fontSize: ".84rem", lineHeight: 1.7 }}>{svc.desc}</p>
              </div>
            )})}
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>{t.nav.book}</button>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACADEMY PAGE
// ═══════════════════════════════════════════════════════════════
function AcademyPage({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.academy.hero} subtitle={t.academy.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2 }}>{t.academy.intro}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {t.academy.courses.map((course, i) => {
              const hasBg = course.bg_image || course.bg_color;
              const cardStyle = hasBg ? { backgroundImage: course.bg_image?`url(${course.bg_image})`:"none", backgroundColor: course.bg_color||"#fff", backgroundSize:"cover", backgroundPosition:"center" } : {};
              return (
              <div key={i} className="card" style={{ padding: "36px 32px", position: "relative", overflow: "hidden", ...cardStyle }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{course.icon}</div>
                <h3 style={{ color: hasBg&&course.bg_image?"#fff":C.g800, fontWeight: 700, marginBottom: 8, fontSize: "1rem" }}>{course.title}</h3>
                <div className="gl" />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  {[
                    ["📊", course.level],
                    [lang === "ar" ? "⏱" : "⏱", `${course.weeks} ${lang === "ar" ? "أسابيع" : "weeks"}`],
                    ["🎓", lang === "ar" ? "شهادة معتمدة" : "Certificate"]
                  ].map(([ic, txt], j) => (
                    <span key={j} style={{ fontSize: ".72rem", color: C.g400, letterSpacing: ".08em", display: "flex", alignItems: "center", gap: 4 }}>
                      {ic} {txt}
                    </span>
                  ))}
                </div>
                <button className="obtn" style={{ padding: "9px 22px", fontSize: ".73rem", fontFamily: ff }} onClick={() => setPage("booking")}>
                  {lang === "ar" ? "سجّل الآن" : "Enroll Now"}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ABOUT PAGE
// ═══════════════════════════════════════════════════════════════
function AboutPage({ t, lang, ff, setPage }) {

  return (
    <>
      <PageHero title={t.nav.about} subtitle={lang === "ar" ? "مجموعة الكون · منذ 2015" : "Alkown Group · Since 2015"} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Label text={t.about.label} />
            <h2 style={{ fontSize: "var(--sizeSec,clamp(1.8rem,4vw,3rem))", fontWeight: 800, color: C.g800, marginTop: 10, whiteSpace: "pre-line", lineHeight: 1.25 }}>{t.about.h2}</h2>
            <Divider />
            <p style={{ maxWidth: 700, margin: "18px auto 0", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.about.p}</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 3, marginBottom: 72 }}>
            {[[t.about.stat1v, t.about.stat1l], [t.about.stat2v, t.about.stat2l], [t.about.stat3v, t.about.stat3l], [t.about.stat4v, t.about.stat4l]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center", padding: "40px 24px", background: i % 2 === 0 ? C.beige : "#fff", borderTop: `3px solid rgba(201,168,76,.35)` }}>
                <div className="shimmer" style={{ fontSize: "2.8rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{v}</div>
                <div style={{ fontSize: ".74rem", color: C.g400, letterSpacing: ".17em", textTransform: "uppercase", marginTop: 8 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>{lang === "ar" ? "احجز استشارة" : "Book Consultation"}</button>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// BOOKING PAGE
// ═══════════════════════════════════════════════════════════════
function BookingPage({ t, lang, ff }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(null); // { requestNumber, serviceName, servicePrice }
  const [dbServices, setDbServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{ file, type, preview }]
  const [uploading, setUploading] = useState(false); // eslint-disable-line no-unused-vars
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", date: "", time: "", msg: "" });
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const ar = lang === "ar";

  useEffect(() => {
    supabase.from("services").select("*").eq("is_active", true).order("name")
      .then(({ data }) => setDbServices(data || []));
  }, []);

  function validateStep1() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert(ar ? "يرجى تعبئة الاسم والبريد والهاتف" : "Please fill name, email and phone");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert(ar ? "بريد إلكتروني غير صحيح" : "Invalid email address");
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (!selectedService) {
      alert(ar ? "يرجى اختيار الخدمة" : "Please select a service");
      return false;
    }
    return true;
  }

  function addFile(e, fileType) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadedFiles(prev => [...prev, { file, type: fileType, id: Date.now() }]);
  }

  function removeFile(id) {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }

  function priceLabel(s) {
    if (!s) return "—";
    if (s.price_min && s.price_max) return `$${Number(s.price_min).toLocaleString()} – $${Number(s.price_max).toLocaleString()} USD`;
    if (s.price_min) return `$${Number(s.price_min).toLocaleString()}+ USD`;
    if (s.price) return `$${Number(s.price).toLocaleString()} USD`;
    return ar ? "سيتم التحديد" : "TBD";
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const clientData = await findOrCreateClient({ full_name: form.name, phone: form.phone, email: form.email });

      const notes = [
        ar ? "المصدر: نموذج الحجز على الموقع" : "Source: Website Booking Form",
        `${ar ? "الخدمة" : "Service"}: ${selectedService?.name || ""}`,
        form.date ? `${ar ? "التاريخ" : "Date"}: ${form.date}` : "",
        form.time ? `${ar ? "الوقت" : "Time"}: ${form.time}` : "",
        form.whatsapp ? `WhatsApp: ${form.whatsapp}` : "",
        form.msg ? `\n${form.msg}` : ""
      ].filter(Boolean).join("\n");

      const requestData = await createRequestForClient({
        clientId: clientData.id,
        serviceId: selectedService?.id || null,
        status: "New",
        notes
      });

      // رفع الملفات
      if (uploadedFiles.length) {
        setUploading(true);
        for (const { file, type } of uploadedFiles) {
          const safeName = file.name.replace(/[^\w.-]+/g, "-");
          const path = `${requestData.id}/${Date.now()}-${safeName}`;
          const { error: upErr } = await supabase.storage.from("request-documents").upload(path, file);
          if (!upErr) {
            await supabase.from("request_files").insert([{
              request_id: requestData.id,
              file_type: type,
              file_name: file.name,
              storage_path: path
            }]);
          }
        }
        setUploading(false);
      }

      // إرسال الإيميلات
      await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_request",
          requestNumber: requestData.request_number,
          client: clientData,
          form: { ...form, service: selectedService?.name },
          service: { name: selectedService?.name, price: selectedService?.price || selectedService?.price_min }
        })
      });

      setSubmitted({
        requestNumber: requestData.request_number,
        serviceName: selectedService?.name,
        servicePrice: priceLabel(selectedService),
        clientName: form.name,
        clientEmail: form.email,
        whatsapp: form.whatsapp || form.phone
      });
    } catch (err) {
      alert(ar ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`);
    }
    setSubmitting(false);
  }

  const inp = { width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 2, fontFamily: ff };
  const lbl = { display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 };

  // ── صفحة النجاح ──────────────────────────────────────────────
  if (submitted) {
    const waMsg = encodeURIComponent(`مرحباً، لقد أرسلت طلباً عبر الموقع.\nرقم الطلب: ${submitted.requestNumber}\nالخدمة: ${submitted.serviceName}\nالاسم: ${submitted.clientName}`);
    const waLink = `https://wa.me/971544909522?text=${waMsg}`;

    return (
      <>
        <PageHero title={t.booking.hero} subtitle={t.booking.heroSub} />
        <div style={{ background: "#fff", padding: "72px clamp(20px,6vw,80px)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 20px" }}>✓</div>
              <h2 style={{ color: C.g800, fontSize: "1.8rem", fontWeight: 800, marginBottom: 8 }}>{t.booking.success}</h2>
              <p style={{ color: C.g400 }}>{t.booking.successSub}</p>
            </div>

            {/* بطاقة الطلب */}
            <div style={{ background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4, padding: "28px 32px", marginBottom: 20 }}>
              <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{ar ? "تفاصيل الطلب" : "Request Details"}</div>
              {[
                [ar ? "رقم الطلب" : "Request Number", submitted.requestNumber],
                [ar ? "الخدمة" : "Service", submitted.serviceName],
                [ar ? "السعر" : "Price", submitted.servicePrice],
                [ar ? "الاسم" : "Name", submitted.clientName],
                [ar ? "البريد" : "Email", submitted.clientEmail],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(201,168,76,.12)` }}>
                  <span style={{ color: C.g400, fontSize: ".8rem" }}>{k}</span>
                  <strong style={{ color: C.g800, fontSize: ".88rem" }}>{v}</strong>
                </div>
              ))}
            </div>

            {/* بيانات البنك */}
            <div style={{ background: "#0a0a0a", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
              <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{t.booking.bankTitle}</div>
              {[
                [ar ? "اسم البنك" : "Bank", "مصرف رويا"],
                [ar ? "اسم الحساب" : "Account Name", "Alkown Group LLC"],
                ["IBAN", "AE27 1325 4490 9522 0000 001"],
                [ar ? "المرجع" : "Reference", submitted.requestNumber],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", color: "#ccc", fontSize: ".85rem" }}>
                  <span style={{ color: "#666" }}>{k}</span>
                  <strong style={{ color: k === (ar ? "المرجع" : "Reference") ? C.gold : "#fff" }}>{v}</strong>
                </div>
              ))}
              <p style={{ color: "#555", fontSize: ".75rem", marginTop: 12 }}>⚠️ {t.booking.bankNote}</p>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="gbtn" style={{ fontFamily: ff, textDecoration: "none", display: "inline-block" }}>
                📲 {ar ? "إرسال الإيصال عبر واتساب" : "Send Receipt via WhatsApp"}
              </a>
              <button className="obtn" style={{ fontFamily: ff }} onClick={() => { setSubmitted(null); setStep(1); setForm({ name: "", email: "", phone: "", whatsapp: "", date: "", time: "", msg: "" }); setSelectedService(null); setUploadedFiles([]); }}>
                {ar ? "طلب جديد" : "New Request"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const steps = [t.booking.step1, t.booking.step2, t.booking.step3, t.booking.step4];

  return (
    <>
      <PageHero title={t.booking.hero} subtitle={t.booking.heroSub} />
      <section style={{ padding: "72px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginBottom: 52, gap: 0 }}>
            {steps.map((label, idx) => {
              const s = idx + 1;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: s <= step ? `linear-gradient(135deg,${C.gold},${C.goldLight})` : C.g100,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: s <= step ? C.g800 : C.g400, fontSize: ".82rem", fontWeight: 800, transition: "all .3s"
                    }}>{s < step ? "✓" : s}</div>
                    <span style={{ fontSize: ".6rem", color: s === step ? C.gold : C.g400, letterSpacing: ".08em", whiteSpace: "nowrap", textAlign: "center", maxWidth: 70 }}>{label}</span>
                  </div>
                  {s < 4 && <div style={{ width: "clamp(24px,5vw,56px)", height: 2, background: s < step ? C.gold : C.g200, margin: "0 6px 22px", transition: "all .3s" }} />}
                </div>
              );
            })}
          </div>

          {/* Step 1 — معلومات شخصية */}
          {step === 1 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              {[[t.booking.name,"name","text"],[t.booking.email,"email","email"],[t.booking.phone,"phone","tel"],[t.booking.whatsapp,"whatsapp","tel"]].map(([label, key, type]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={form[key]} onChange={upd(key)} style={inp} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => { if (validateStep1()) setStep(2); }}>
                  {ar ? "التالي ←" : "Next →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — اختيار الخدمة */}
          {step === 2 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ display: "grid", gap: 12, marginBottom: 24, maxHeight: 420, overflowY: "auto", paddingLeft: 4 }}>
                {dbServices.map(svc => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <div
                      key={svc.id}
                      onClick={() => setSelectedService(svc)}
                      style={{
                        padding: "16px 20px", border: `2px solid ${isSelected ? C.gold : "rgba(201,168,76,.2)"}`,
                        borderRadius: 4, cursor: "pointer", background: isSelected ? `rgba(201,168,76,.06)` : C.beige,
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                        transition: "all .2s"
                      }}
                    >
                      <span style={{ color: C.g800, fontWeight: isSelected ? 700 : 500, fontSize: ".9rem" }}>{svc.name}</span>
                      <span style={{ color: C.gold, fontWeight: 700, fontSize: ".85rem", whiteSpace: "nowrap", flexShrink: 0 }}>{priceLabel(svc)}</span>
                    </div>
                  );
                })}
              </div>

              {selectedService && (
                <div style={{ background: "#0a0a0a", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 4, padding: "18px 22px", marginBottom: 20 }}>
                  <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{ar ? "الخدمة المختارة" : "Selected Service"}</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{selectedService.name}</div>
                  <div style={{ color: C.gold, marginTop: 4, fontWeight: 800 }}>{priceLabel(selectedService)}</div>
                  {selectedService.description && <div style={{ color: "#888", fontSize: ".82rem", marginTop: 6 }}>{selectedService.description}</div>}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div>
                  <label style={lbl}>{t.booking.date}</label>
                  <input type="date" value={form.date} onChange={upd("date")} style={inp} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <label style={lbl}>{t.booking.time}</label>
                  <select value={form.time} onChange={upd("time")} style={inp}>
                    <option value="">—</option>
                    {t.booking.times.map((ti, i) => <option key={i} value={ti}>{ti}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>{t.booking.msg}</label>
                <textarea rows={3} value={form.msg} onChange={upd("msg")} style={{ ...inp, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(1)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => { if (validateStep2()) setStep(3); }}>{ar ? "التالي ←" : "Next →"}</button>
              </div>
            </div>
          )}

          {/* Step 3 — رفع الملفات */}
          {step === 3 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <p style={{ color: C.g400, marginBottom: 20, fontSize: ".88rem" }}>{t.booking.uploadSub}</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
                {t.booking.fileTypes.map((type, i) => (
                  <label key={i} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "20px 12px", border: `1px dashed rgba(201,168,76,.35)`,
                    borderRadius: 4, cursor: "pointer", background: C.beige,
                    color: C.g600, fontSize: ".8rem", textAlign: "center"
                  }}>
                    <span style={{ fontSize: "1.6rem" }}>📎</span>
                    {type}
                    <input type="file" style={{ display: "none" }} onChange={e => addFile(e, type)} accept="image/*,.pdf" />
                  </label>
                ))}
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: C.g400, fontSize: ".72rem", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 10 }}>
                    {ar ? "الملفات المرفوعة" : "Uploaded Files"} ({uploadedFiles.length})
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {uploadedFiles.map(({ file, type, id }) => (
                      <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: ".85rem", color: C.g800 }}>{file.name}</div>
                          <div style={{ color: C.g400, fontSize: ".75rem" }}>{type}</div>
                        </div>
                        <button onClick={() => removeFile(id)} style={{ background: "transparent", border: "none", color: "#c0392b", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ color: C.g400, fontSize: ".78rem", marginBottom: 24 }}>
                {ar ? "* رفع الملفات اختياري، يمكنك إرسالها لاحقاً عبر الواتساب." : "* File upload is optional. You can send them later via WhatsApp."}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(2)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setStep(4)}>{ar ? "التالي ←" : "Next →"}</button>
              </div>
            </div>
          )}

          {/* Step 4 — مراجعة وإرسال */}
          {step === 4 && (
            <div style={{ animation: "fadeUp .4s ease" }}>
              <div style={{ background: C.beige, border: `1px solid rgba(201,168,76,.2)`, borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
                <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 16 }}>{t.booking.reviewTitle}</div>
                {[
                  [t.booking.name, form.name],
                  [t.booking.email, form.email],
                  [t.booking.phone, form.phone],
                  [t.booking.whatsapp, form.whatsapp],
                  [ar ? "الخدمة" : "Service", selectedService?.name],
                  [ar ? "السعر" : "Price", priceLabel(selectedService)],
                  [t.booking.date, form.date],
                  [t.booking.time, form.time],
                  [t.booking.msg, form.msg],
                  [ar ? "عدد الملفات" : "Files", uploadedFiles.length ? `${uploadedFiles.length} ${ar ? "ملفات" : "files"}` : ar ? "لا توجد ملفات" : "None"],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid rgba(201,168,76,.12)`, gap: 12 }}>
                    <span style={{ color: C.g400, fontSize: ".78rem" }}>{k}</span>
                    <span style={{ color: C.g800, fontWeight: 600, fontSize: ".85rem", textAlign: "end" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* بيانات التحويل */}
              <div style={{ background: "#0a0a0a", borderRadius: 4, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12 }}>{t.booking.bankTitle}</div>
                {[
                  [ar ? "اسم البنك" : "Bank", "مصرف رويا"],
                  [ar ? "اسم الحساب" : "Account Name", "Alkown Group LLC"],
                  ["IBAN", "AE27 1325 4490 9522 0000 001"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1a1a1a", color: "#aaa", fontSize: ".82rem" }}>
                    <span style={{ color: "#555" }}>{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
                <p style={{ color: "#555", fontSize: ".74rem", marginTop: 10 }}>⚠️ {t.booking.bankNote}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="obtn" style={{ fontFamily: ff }} onClick={() => setStep(3)}>{ar ? "→ السابق" : "← Back"}</button>
                <button className="gbtn" style={{ fontFamily: ff, opacity: submitting ? .7 : 1 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (ar ? "جارٍ الإرسال..." : "Submitting...") : t.booking.submit}
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardPage({ t, lang, ff }) {
  // تم نقل بوابة العملاء إلى /portal
  useEffect(() => {
    window.location.href = "/portal";
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#666" }}>
      جارٍ التوجيه لبوابة العملاء...
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═══════════════════════════════════════════════════════════════
function StudentPage({ t, lang, ff }) {
  const [tab, setTab] = useState("courses");
  const st = t.student;

  return (
    <>
      <PageHero title={st.hero} subtitle={st.heroSub} />
      <section style={{ padding: "56px clamp(16px,5vw,64px)", background: C.beige, minHeight: "60vh" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ borderBottom: `2px solid rgba(201,168,76,.14)`, marginBottom: 30 }}>
            {Object.entries(st.tabs).map(([k, v]) => (
              <button key={k} className={`tab-btn ${tab === k ? "tab-active" : ""}`} style={{ fontFamily: ff, color: tab === k ? C.gold : C.g400 }} onClick={() => setTab(k)}>{v}</button>
            ))}
          </div>

          {tab === "courses" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {st.courses.map((c, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.16)`, padding: "28px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".98rem" }}>{c.title}</h3>
                        {c.cert && <span style={{ padding: "2px 10px", background: `rgba(201,168,76,.15)`, color: C.gold, borderRadius: 20, fontSize: ".67rem", fontWeight: 700 }}>🎓 {lang === "ar" ? "مكتمل" : "Certified"}</span>}
                      </div>
                      <div style={{ fontSize: ".76rem", color: C.g400, marginBottom: 12 }}>
                        {c.done}/{c.lessons} {lang === "ar" ? "درس مكتمل" : "lessons completed"}
                      </div>
                      <div style={{ width: "100%", height: 6, background: C.g100, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${c.progress}%`, height: "100%", background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: 3, transition: "width 1.2s ease" }} />
                      </div>
                      <div style={{ fontSize: ".72rem", color: C.gold, marginTop: 5, fontWeight: 700 }}>{c.progress}%</div>
                    </div>
                    <button className={c.cert ? "gbtn" : "obtn"} style={{ fontFamily: ff, padding: "9px 20px", fontSize: ".73rem", flexShrink: 0 }}>
                      {c.cert ? (lang === "ar" ? "تحميل الشهادة" : "Download Certificate") : (lang === "ar" ? "متابعة التعلم" : "Continue Learning")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "certs" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {st.courses.filter(c => c.cert).map((c, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid rgba(201,168,76,.2)`, padding: "36px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
                  <div style={{ fontSize: "2.8rem", marginBottom: 12 }}>🏆</div>
                  <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".95rem", marginBottom: 6 }}>{c.title}</h3>
                  <Divider />
                  <p style={{ color: C.g400, fontSize: ".78rem", marginBottom: 16 }}>{lang === "ar" ? "شهادة معتمدة · مجموعة الكون" : "Certified · Alkown Group"}</p>
                  <button className="gbtn" style={{ fontFamily: ff, padding: "9px 20px", fontSize: ".73rem" }}>
                    {lang === "ar" ? "تحميل PDF" : "Download PDF"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "schedule" && (
            <div style={{ textAlign: "center", padding: "72px 0" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>📅</div>
              <p style={{ color: C.g400 }}>{lang === "ar" ? "لا توجد جلسات مجدولة" : "No upcoming sessions scheduled"}</p>
            </div>
          )}

          {tab === "profile" && (
            <div style={{ maxWidth: 500, margin: "0 auto", background: "#fff", border: `1px solid rgba(201,168,76,.15)`, padding: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 800, color: C.g800, margin: "0 auto 12px" }}>A</div>
                <h3 style={{ color: C.g800, fontWeight: 700 }}>Ahmed Al Mansouri</h3>
                <div style={{ color: C.gold, fontSize: ".78rem" }}>{lang === "ar" ? "طالب نشط" : "Active Student"}</div>
              </div>
              <Divider />
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {[["✉️", "ahmed@email.com"], ["📞", "+971 54 490 9522"], ["🗓", lang === "ar" ? "عضو منذ 2024" : "Member since 2024"]].map(([ic, val], i) => (
                  <div key={i} style={{ display: "flex", gap: 12, color: C.g600, fontSize: ".88rem" }}>
                    <span>{ic}</span> <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function Footer({ t, lang, ff, setPage }) {
  const ft = t.footer;
  const navItems = [
    { k: "home", l: t.nav.home }, { k: "travel", l: t.nav.travel },
    { k: "residency", l: t.nav.residency }, { k: "advertising", l: t.nav.advertising },
    { k: "academy", l: t.nav.academy }, { k: "about", l: t.nav.about }
  ];

  return (
    <footer style={{ background: C.dark, color: C.g400, padding: "80px clamp(20px,6vw,72px) 36px", fontFamily: ff }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 48, marginBottom: 60 }}>

          {/* Brand */}
          <div>
            <div onClick={() => setPage("home")} style={{ cursor: "pointer", marginBottom: 14 }}><Logo size="sm" dark /></div>
            <p style={{ fontSize: ".84rem", lineHeight: 1.85, color: "#6a6054", marginBottom: 20 }}>{ft.tagline}</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["📸", "💼", "🐦", "📘"].map((ic, i) => (
                <div key={i} style={{
                  width: 38, height: 38, background: "rgba(201,168,76,.07)", border: `1px solid rgba(201,168,76,.18)`,
                  borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: ".95rem", transition: "all .25s"
                }}
                  onMouseEnter={e => e.target.style.background = "rgba(201,168,76,.18)"}
                  onMouseLeave={e => e.target.style.background = "rgba(201,168,76,.07)"}
                >{ic}</div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.qlinks}</h4>
            {navItems.map(n => (
              <div key={n.k} onClick={() => setPage(n.k)} style={{ color: "#6a6054", fontSize: ".84rem", marginBottom: 11, cursor: "pointer", transition: "color .25s", letterSpacing: ".05em" }}
                onMouseEnter={e => e.target.style.color = C.gold}
                onMouseLeave={e => e.target.style.color = "#6a6054"}
              >{n.l}</div>
            ))}
          </div>


          {/* Contact */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.contact}</h4>
            <div style={{ display: "flex", gap: 10, marginBottom: 13 }}>
              <span style={{ fontSize: ".9rem", marginTop: 1 }}>📍</span>
              <span style={{ fontSize: ".84rem", color: "#6a6054", lineHeight: 1.55 }}>{ft.address}</span>
            </div>
            {[
              { num: "+90 534 764 1249", wa: "https://wa.me/905347641249" },
              { num: "+971 54 490 9522", wa: "https://wa.me/971544909522" },
              { num: "+963 980 631 952", wa: "https://wa.me/963980631952" },
            ].map(({ num, wa }, i) => (
              <a key={i} href={wa} target="_blank" rel="noreferrer"
                style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", textDecoration: "none", transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ fontSize: ".84rem", color: "#6a6054" }}>📞 {num}</span>
              </a>
            ))}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span>✉️</span>
              <a href="mailto:info@alkownglobal.com" style={{ fontSize: ".84rem", color: C.gold, textDecoration: "none" }}>info@alkownglobal.com</a>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <a href="https://instagram.com/alkownglobal" target="_blank" rel="noreferrer" style={{ fontSize: ".84rem", color: "#e1306c", textDecoration: "none" }}>@alkownglobal</a>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <a href="https://facebook.com/alkownglobal" target="_blank" rel="noreferrer" style={{ fontSize: ".84rem", color: "#1877f2", textDecoration: "none" }}>@alkownglobal</a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", marginBottom: 20 }}>{ft.newsletter}</h4>
            <p style={{ fontSize: ".82rem", color: "#6a6054", marginBottom: 16, lineHeight: 1.75 }}>{ft.nlSub}</p>
            <div style={{ display: "flex" }}>
              <input placeholder={ft.nlPh} style={{
                flex: 1, padding: "11px 14px", background: "rgba(255,253,248,.05)",
                border: `1px solid rgba(201,168,76,.18)`, borderRight: "none",
                color: C.beige, fontSize: ".82rem", fontFamily: ff, outline: "none"
              }} />
              <button className="gbtn" style={{ padding: "11px 18px", fontSize: ".7rem", borderRadius: "0 2px 2px 0", fontFamily: ff }}>{ft.subscribe}</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: `1px solid rgba(201,168,76,.1)`, paddingTop: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: ".76rem", color: "#4a4438" }}>{ft.copy}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 18, height: 1, background: `rgba(201,168,76,.35)` }} />
            <span style={{ fontSize: ".68rem", color: C.gold, letterSpacing: ".24em" }}>ALKOWN.GLOBAL</span>
            <div style={{ width: 18, height: 1, background: `rgba(201,168,76,.35)` }} />
          </div>
          {ft.license && <div style={{ fontSize: ".72rem", color: "#4a4438" }}>{ft.license}</div>}
        </div>
      </div>
    </footer>
  );
}
