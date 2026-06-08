import { useState, useEffect, useMemo, useCallback } from "react";
import { useContent } from "./context/ContentContext";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
import { createRequestForClient, findOrCreateClient, sendContactNotification } from "./lib/crm";
import VisaCenterPage from "./pages/visa/VisaCenterPage";
import VisaResultPage from "./pages/visa/VisaResultPage";
import VisaApplicationPage from "./pages/visa/VisaApplicationPage";
import VisaAdminIntelligencePage from "./pages/visa/VisaAdminIntelligence";
import VisaTrackPage from "./pages/visa/VisaTrackPage";
import { setSEOMeta, setStructuredData, ORGANIZATION_SCHEMA, PAGE_SEO } from "./services/seoService";

// ── Company Formation Data ────────────────────────────────────
const CF_JURISDICTIONS = [
  { flag:"🇦🇪", nameAr:"دبي — البر الرئيسي", nameEn:"Dubai Mainland",    timeAr:"5-10 أيام",   timeEn:"5-10 days",   descAr:"تجارة محلية حرة، بدون قيود قطاعية",          descEn:"Free local trade, no sector restrictions" },
  { flag:"🏢", nameAr:"دبي — المنطقة الحرة", nameEn:"Dubai Free Zone",   timeAr:"3-7 أيام",    timeEn:"3-7 days",    descAr:"ملكية 100%، إعفاء ضريبي 50 عاماً",            descEn:"100% ownership, 50-year tax exemption" },
  { flag:"🇹🇷", nameAr:"تركيا",              nameEn:"Turkey",             timeAr:"7-14 يوم",    timeEn:"7-14 days",   descAr:"بيئة أعمال قوية، سوق أوروبي وآسيوي",         descEn:"Strong business environment, EU & Asian market" },
  { flag:"🇬🇧", nameAr:"المملكة المتحدة",    nameEn:"United Kingdom",     timeAr:"24-48 ساعة",  timeEn:"24-48 hours", descAr:"أسرع تسجيل شركات في العالم، سمعة عالمية",    descEn:"Fastest registration globally, worldwide reputation" },
];
const CF_STEPS = {
  ar: [{ icon:"💬", t:"استشارة مجانية" },{ icon:"🏢", t:"اختيار نوع الشركة" },{ icon:"📄", t:"تجهيز الوثائق" },{ icon:"✅", t:"التسجيل الرسمي" },{ icon:"📋", t:"الحصول على الرخصة" },{ icon:"🏦", t:"فتح حساب بنكي" }],
  en: [{ icon:"💬", t:"Free Consultation" },{ icon:"🏢", t:"Choose Company Type" },{ icon:"📄", t:"Document Preparation" },{ icon:"✅", t:"Official Registration" },{ icon:"📋", t:"License Issuance" },{ icon:"🏦", t:"Bank Account Opening" }],
};
const CF_PACKAGES = [
  { icon:"🚀", nameAr:"باقة المبتدئ",  nameEn:"Starter",  priceAr:"يبدأ من 3,500 درهم", priceEn:"From AED 3,500", popular:false, featuresAr:["تسجيل الشركة","رخصة تجارية","عنوان تجاري","خدمة العملاء"], featuresEn:["Company Registration","Trade License","Business Address","Customer Support"] },
  { icon:"💼", nameAr:"باقة الأعمال",  nameEn:"Business", priceAr:"يبدأ من 7,000 درهم", priceEn:"From AED 7,000", popular:true,  featuresAr:["كل ما في المبتدئ","فيزا المدير","حساب بنكي","مستشار قانوني","خدمة PRO"], featuresEn:["All Starter features","Manager Visa","Bank Account","Legal Advisor","PRO Services"] },
  { icon:"👑", nameAr:"باقة المستثمر", nameEn:"Investor", priceAr:"حسب الطلب",           priceEn:"Custom Pricing", popular:false, featuresAr:["كل ما في الأعمال","إقامة المستثمر","الفيزا الذهبية","خدمة VIP","مستشار ضريبي"], featuresEn:["All Business features","Investor Residency","Golden Visa","Full VIP Service","Tax Advisor"] },
];
const CF_SERVICES = {
  ar: ["تأسيس سريع خلال 48 ساعة","امتثال قانوني كامل","خدمة متكاملة من التسجيل للبنك","4 مناطق قضائية","دعم VIP شخصي","أسعار تنافسية ومرنة","فيزا المستثمر والإقامة","خدمة PRO متكاملة"],
  en: ["Fast setup in 48 hours","Full legal compliance","End-to-end service","4 jurisdictions","Personal VIP support","Competitive pricing","Investor visa & residency","Full PRO services"],
};

// ── Knowledge Center Data ────────────────────────────────────
const KC_CATEGORIES = {
  all:       { ar:"الكل",           en:"All",              icon:"🌐" },
  visa:      { ar:"أدلة التأشيرة", en:"Visa Guides",       icon:"🛂" },
  residency: { ar:"الإقامة",        en:"Residency",         icon:"🏠" },
  company:   { ar:"تأسيس الشركات", en:"Company Formation", icon:"🏢" },
  travel:    { ar:"السفر",          en:"Travel Guides",     icon:"✈️" },
};
const KC_DEFAULT_ARTICLES = [
  { id:"kc1", category:"visa",      featured:true,  date:"2025-01-15", readTime:5,  titleAr:"كيفية الحصول على تأشيرة الإمارات للسوريين",      titleEn:"How Syrians Can Get UAE Visa",            excerptAr:"دليل شامل لمتطلبات تأشيرة الإمارات — الوثائق والرسوم ومدة المعالجة.",         excerptEn:"Complete guide to UAE visa requirements for Syrian passport holders.",            contentAr:"تتطلب تأشيرة الإمارات للسوريين: جواز ساري 6 أشهر، صورة شخصية، كشف حساب، تأمين سفر.", contentEn:"UAE visa for Syrians requires: valid passport (6+ months), photo, bank statement, travel insurance." },
  { id:"kc2", category:"visa",      featured:true,  date:"2025-01-10", readTime:8,  titleAr:"دليل تأشيرة شنغن للعرب",                          titleEn:"Schengen Visa Guide for Arabs",           excerptAr:"كل ما تحتاجه عن تأشيرة شنغن — 27 دولة أوروبية بتأشيرة واحدة.",              excerptEn:"Everything about the Schengen visa — 27 European countries, one visa.",           contentAr:"تتيح تأشيرة شنغن السفر لـ 27 دولة. المطلوب: جواز، حجز طيران وفندق، تأمين 30,000 يورو.", contentEn:"Schengen visa covers 27 countries. Required: passport, flight/hotel booking, €30,000 insurance." },
  { id:"kc3", category:"residency", featured:true,  date:"2025-01-12", readTime:10, titleAr:"البرتغال: الجنسية بالاستثمار — الدليل الكامل",    titleEn:"Portugal Golden Visa — Complete Guide",   excerptAr:"كيف تحصل على الإقامة البرتغالية وجواز السفر الأوروبي عبر الاستثمار.",        excerptEn:"How to get Portuguese residency and EU passport through investment.",             contentAr:"يتطلب البرنامج استثمار 250,000+ يورو. بعد 5 سنوات يمكن التقدم للجنسية.",       contentEn:"Program requires €250,000+ investment. After 5 years you can apply for citizenship." },
  { id:"kc4", category:"company",   featured:true,  date:"2025-01-14", readTime:9,  titleAr:"تأسيس شركة في الإمارات — خطوة بخطوة",            titleEn:"UAE Company Setup — Step by Step",        excerptAr:"كيفية تأسيس شركة في دبي من البداية حتى الحصول على الترخيص.",                 excerptEn:"How to set up a company in Dubai from registration to license.",                  contentAr:"الخطوات: اختيار نوع الشركة، تسجيل الاسم، الترخيص، فتح حساب بنكي.",             contentEn:"Steps: choose company type, register name, get license, open bank account." },
  { id:"kc5", category:"travel",    featured:false, date:"2025-01-11", readTime:8,  titleAr:"السياحة في تركيا — الدليل الشامل",                titleEn:"Tourism in Turkey — Complete Guide",      excerptAr:"أفضل المدن والمعالم في تركيا وأفضل أوقات الزيارة.",                          excerptEn:"Best cities and attractions in Turkey with timing tips.",                         contentAr:"أبرز الوجهات: إسطنبول، كابادوكيا، أنطاليا. أفضل وقت: ربيع وخريف.",             contentEn:"Top destinations: Istanbul, Cappadocia, Antalya. Best time: spring and autumn." },
  { id:"kc6", category:"visa",      featured:false, date:"2025-01-05", readTime:6,  titleAr:"تأشيرة المملكة المتحدة من الإمارات",              titleEn:"UK Visa from UAE",                        excerptAr:"خطوات التقديم للتأشيرة البريطانية من الإمارات للمقيمين العرب.",               excerptEn:"Step-by-step UK visa application guide for UAE residents.",                       contentAr:"يمكن التقديم إلكترونياً. المطلوب: جواز، كشف حساب، خطاب توظيف أو أعمال.",      contentEn:"Apply online. Required: passport, bank statement, employment or business letter." },
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
    { k: "contact",          l: t.nav.contact },
  ];

  return (
    <div style={{ fontFamily: ff, direction: t.dir, background: C.warmWhite, minHeight: "100vh", overflowX: "hidden", color: C.g800 }}>
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
      <div style={{ paddingTop: 80 }}>
        {page === "home" && <HomePage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "travel" && <TravelPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "citizenship" && <CitizenshipPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "advertising" && <AdvertisingPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "academy" && <AcademyPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "about" && <AboutPage t={t} lang={lang} ff={ff} setPage={setPage} />}
        {page === "contact" && <ContactPage t={t} lang={lang} ff={ff} />}
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
        {page === "residency" && <CitizenshipPage t={t} lang={lang} ff={ff} setPage={setPage} />}
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

          <p className="fu3" style={{ fontSize: "clamp(.8rem,1.8vw,.92rem)", color: C.g400, letterSpacing: ".18em", marginBottom: 44 }}>{t.hero.sub}</p>

        
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
// TRAVEL PAGE
// ═══════════════════════════════════════════════════════════════
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
function CitizenshipPage({ t, lang, ff, setPage }) {
  return (
    <>
      <PageHero title={t.citizenship.hero} subtitle={t.citizenship.heroSub} />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>
          <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 52px", color: C.g600, lineHeight: 2, fontSize: "1rem" }}>{t.citizenship.intro}</p>

          {/* Country cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 60 }}>
            {t.citizenship.programs.map((prog, i) => (
              <div key={i} className="card" style={{ padding: "38px 28px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>{prog.flag}</div>
                <h3 style={{ fontSize: "1.15rem", color: C.g800, fontWeight: 700, marginBottom: 4 }}>{prog.name}</h3>
                <div style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>{prog.type}</div>
                <div className="gl" style={{ margin: "0 auto 10px" }} />
                <div style={{ color: C.g600, fontSize: ".84rem", marginBottom: 4 }}>{lang === "ar" ? "يبدأ من" : "From"} <strong style={{ color: C.g800 }}>{prog.min}</strong></div>
                <div style={{ color: C.g400, fontSize: ".76rem" }}>⏱ {prog.time}</div>
              </div>
            ))}
          </div>

          {/* Services list */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {t.citizenship.services.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: C.beige, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 2 }}>
                <div style={{ width: 8, height: 8, background: C.gold, transform: "rotate(45deg)", flexShrink: 0 }} />
                <span style={{ color: C.g800, fontSize: ".9rem", fontWeight: 500 }}>{s}</span>
              </div>
            ))}
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
// COMPANY FORMATION PAGE
// ═══════════════════════════════════════════════════════════════
function CompanyFormationPage({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const steps = ar ? CF_STEPS.ar : CF_STEPS.en;
  const services = ar ? CF_SERVICES.ar : CF_SERVICES.en;
  return (
    <>
      <PageHero
        title={ar ? "تأسيس الشركات" : "Company Formation"}
        subtitle={ar ? "الإمارات · تركيا · المملكة المتحدة · والعالم" : "UAE · Turkey · UK · Worldwide"}
      />

      {/* Stats */}
      <div style={{ background: C.beige, borderBottom: `1px solid rgba(201,168,76,.12)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {[
            [ar ? "+500" : "500+", ar ? "شركة مؤسسة" : "Companies Founded"],
            [ar ? "48h" : "48h", ar ? "أسرع تأسيس" : "Fastest Setup"],
            [ar ? "4" : "4", ar ? "مناطق قضائية" : "Jurisdictions"],
            [ar ? "98%" : "98%", ar ? "نسبة النجاح" : "Success Rate"],
          ].map(([v, l], i, arr) => (
            <div key={i} style={{ textAlign: "center", padding: "28px 12px", borderInlineEnd: i < arr.length - 1 ? `1px solid rgba(201,168,76,.12)` : "none" }}>
              <div className="shimmer" style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{v}</div>
              <div style={{ fontSize: ".72rem", color: C.g400, letterSpacing: ".15em", textTransform: "uppercase", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto" }}>

          {/* Jurisdictions */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <Label text={ar ? "المناطق المتاحة" : "Available Jurisdictions"} />
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: C.g800, marginTop: 8 }}>
              {ar ? "نؤسس شركتك في" : "We Register Your Company In"}
            </h2>
            <Divider />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 72 }}>
            {CF_JURISDICTIONS.map((j, i) => (
              <div key={i} className="card" style={{ padding: "36px 26px", textAlign: "center" }}>
                <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>{j.flag}</div>
                <h3 style={{ fontSize: "1.05rem", color: C.g800, fontWeight: 700, marginBottom: 4 }}>{ar ? j.nameAr : j.nameEn}</h3>
                <div style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>⏱ {ar ? j.timeAr : j.timeEn}</div>
                <div className="gl" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: C.g400, fontSize: ".82rem", lineHeight: 1.65 }}>{ar ? j.descAr : j.descEn}</p>
              </div>
            ))}
          </div>

          {/* Process Steps */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Label text={ar ? "خطوات التأسيس" : "The Process"} />
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: C.g800, marginTop: 8 }}>
              {ar ? "كيف نؤسس شركتك؟" : "How We Set Up Your Company"}
            </h2>
            <Divider />
          </div>
          <div style={{ background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius: 12, padding: "48px clamp(20px,4vw,52px)", marginBottom: 72, border: `1px solid rgba(201,168,76,.15)` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 28 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "1.2rem", boxShadow: `0 4px 18px rgba(201,168,76,.3)` }}>
                      {step.icon}
                    </div>
                    <div style={{ position: "absolute", top: -5, insetInlineEnd: -2, width: 20, height: 20, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 800, color: C.dark }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,.8)", fontSize: ".84rem", lineHeight: 1.5, fontWeight: 500 }}>{step.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Label text={ar ? "باقاتنا" : "Our Packages"} />
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: C.g800, marginTop: 8 }}>
              {ar ? "اختر الباقة المناسبة" : "Choose the Right Package"}
            </h2>
            <Divider />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 72 }}>
            {CF_PACKAGES.map((pkg, i) => (
              <div key={i} className="card" style={{ padding: "36px 28px", textAlign: "center", border: `2px solid ${pkg.popular ? C.gold : "rgba(201,168,76,.12)"}`, position: "relative", boxShadow: pkg.popular ? `0 12px 40px rgba(201,168,76,.15)` : "none" }}>
                {pkg.popular && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, color: C.dark, padding: "4px 16px", borderRadius: 20, fontSize: ".68rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                    ⭐ {ar ? "الأكثر طلباً" : "Most Popular"}
                  </div>
                )}
                <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>{pkg.icon}</div>
                <h3 style={{ fontSize: "1.1rem", color: C.g800, fontWeight: 700, marginBottom: 4 }}>{ar ? pkg.nameAr : pkg.nameEn}</h3>
                <div style={{ color: C.gold, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>{ar ? pkg.priceAr : pkg.priceEn}</div>
                <div className="gl" style={{ margin: "0 auto 18px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, textAlign: ar ? "right" : "left" }}>
                  {(ar ? pkg.featuresAr : pkg.featuresEn).map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, color: C.g600, fontSize: ".86rem" }}>
                      <span style={{ color: C.gold, fontWeight: 800 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button className={pkg.popular ? "gbtn" : "obtn"} style={{ fontFamily: ff, width: "100%", fontSize: ".86rem" }} onClick={() => setPage("booking")}>
                  {ar ? "ابدأ الآن" : "Get Started"}
                </button>
              </div>
            ))}
          </div>

          {/* Services list — same style as CitizenshipPage */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Label text={ar ? "ما نقدمه" : "What We Offer"} />
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 800, color: C.g800, marginTop: 8 }}>
              {ar ? "خدمات متكاملة من البداية للنهاية" : "End-to-End Services"}
            </h2>
            <Divider />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 56 }}>
            {services.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", background: C.beige, border: `1px solid rgba(201,168,76,.15)`, borderRadius: 2 }}>
                <div style={{ width: 8, height: 8, background: C.gold, transform: "rotate(45deg)", flexShrink: 0 }} />
                <span style={{ color: C.g800, fontSize: ".9rem", fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("booking")}>
              {ar ? "احجز استشارة مجانية" : "Book Free Consultation"}
            </button>
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("knowledge_articles").select("*").order("date", { ascending: false });
      if (!error && data?.length) setArticles(data);
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
      <PageHero
        title={ar ? "مركز المعرفة" : "Knowledge Center"}
        subtitle={ar ? "أدلة التأشيرات · الإقامة · الشركات · السفر" : "Visa Guides · Residency · Company · Travel"}
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
                {featured.map(a => <KcArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage} onEdit={art => { setEditing(art); setEditorOpen(true); }} onDelete={id => setDelConfirm(id)} />)}
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
                    <KcArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage} onEdit={art => { setEditing(art); setEditorOpen(true); }} onDelete={id => setDelConfirm(id)} />
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

// ── Article Card (used by KnowledgeCenterPage) ───────────────
function KcArticleCard({ article, lang, ff, canManage, onEdit, onDelete }) {
  const ar = lang === "ar";
  const [showFull, setShowFull] = useState(false);
  const title   = ar ? article.titleAr   : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;
  const content = ar ? article.contentAr : article.contentEn;
  const cat     = KC_CATEGORIES[article.category];
  return (
    <article className="card" style={{ display: "flex", flexDirection: "column", position: "relative", padding: 0 }}>
      <div style={{ height: 3, background: `linear-gradient(90deg,${C.goldDark},${C.gold},${C.goldLight})` }} />
      {canManage && (
        <div style={{ position: "absolute", top: 14, [ar ? "left" : "right"]: 10, display: "flex", gap: 5, zIndex: 2 }}>
          <button onClick={() => onEdit(article)} style={{ background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: C.gold, fontWeight: 700 }}>✏️</button>
          <button onClick={() => onDelete(article.id)} style={{ background: "rgba(229,57,53,.08)", border: "1px solid rgba(229,57,53,.22)", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: "#e53935", fontWeight: 700 }}>🗑️</button>
        </div>
      )}
      <div style={{ padding: "22px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {article.featured && <span style={{ display: "inline-block", background: `rgba(201,168,76,.1)`, color: C.gold, fontSize: ".6rem", fontWeight: 700, letterSpacing: ".15em", padding: "3px 9px", borderRadius: 20, marginBottom: 10, border: `1px solid rgba(201,168,76,.22)`, width: "fit-content" }}>⭐ {ar ? "مميز" : "Featured"}</span>}
        <span style={{ fontSize: ".66rem", color: C.g400, marginBottom: 7, display: "block" }}>{cat?.icon} {ar ? cat?.ar : cat?.en}</span>
        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".95rem", lineHeight: 1.5, marginBottom: 8, flex: 1, fontFamily: ff }}>{title}</h3>
        <p style={{ color: C.g400, fontSize: ".82rem", lineHeight: 1.75, marginBottom: 12 }}>{excerpt}</p>
        {showFull && content && (
          <div style={{ background: C.beige, borderRadius: 7, padding: "12px 14px", marginBottom: 12, fontSize: ".83rem", lineHeight: 1.85, color: C.g600, borderInlineStart: `3px solid ${C.gold}` }}>{content}</div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.g400, fontSize: ".71rem" }}>📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}</span>
          <button onClick={() => setShowFull(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: ".76rem", fontWeight: 700, padding: 0, fontFamily: ff }}>
            {showFull ? (ar ? "إخفاء ↑" : "Hide ↑") : (ar ? "اقرأ المزيد ←" : "Read more →")}
          </button>
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
            <button className="gbtn" style={{ fontFamily: ff }} onClick={() => setPage("contact")}>{t.nav.contact}</button>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTACT PAGE
// ═══════════════════════════════════════════════════════════════
function ContactPage({ t, lang, ff }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    service: "",
    date: "",
    time: "",
    msg: ""
  });

  const upd = k => e =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleBooking = async () => {
    if (!form.name || !form.phone || !form.email || !form.msg) {
      alert(lang === "ar" ? "يرجى تعبئة الاسم والبريد والهاتف والرسالة" : "Please fill name, email, phone, and message");
      return;
    }

    setSubmitting(true);

    try {
      const clientData = await findOrCreateClient({
        full_name: form.name,
        phone: form.phone,
        email: form.email
      });

      const requestNotes = [
        "Source: Website Contact Form",
        `Service: ${form.service || "Not selected"}`,
        `WhatsApp: ${form.whatsapp || form.phone}`,
        "",
        form.msg
      ].join("\n");

      const requestData = await createRequestForClient({
        clientId: clientData.id,
        status: "New",
        notes: requestNotes
      });

      await sendContactNotification({
        requestNumber: requestData.request_number,
        client: clientData,
        form: {
          ...form,
          whatsapp: form.whatsapp || form.phone
        }
      });

      const waMsg = encodeURIComponent(
        `📩 *رسالة تواصل جديدة — الكون العالمية*\n\n` +
        `👤 الاسم: ${form.name}\n` +
        `📧 البريد: ${form.email}\n` +
        `📞 الهاتف: ${form.phone}\n` +
        `💬 واتساب: ${form.whatsapp || form.phone}\n` +
        `🎯 الخدمة: ${form.service || "—"}\n` +
        `📝 الرسالة: ${form.msg}`
      );
      setSent(`https://wa.me/971544909522?text=${waMsg}`);

    } catch (error) {
      console.error("Contact Form Error:", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero title={t.nav.contact} subtitle="www.alkownglobal.com" />
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>

          {/* خريطة العالم مع الدبابيس */}
          <div style={{ position: "relative", marginBottom: 64, borderRadius: 4, overflow: "hidden", border: `1px solid rgba(201,168,76,.2)`, background: "#f0ece4" }}>
            <svg viewBox="0 0 1000 500" style={{ width: "100%", height: 320, display: "block" }} xmlns="http://www.w3.org/2000/svg">
              {/* Ocean */}
              <rect width="1000" height="500" fill="#d6e8f5"/>
              {/* North America */}
              <path d="M60,80 L160,70 L200,90 L210,130 L180,160 L160,200 L140,240 L120,260 L100,280 L80,300 L70,320 L90,340 L110,350 L100,370 L80,380 L60,360 L40,340 L30,300 L20,260 L30,220 L40,180 L50,140 L60,100 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* South America */}
              <path d="M160,310 L200,300 L230,310 L240,340 L250,370 L240,410 L220,440 L200,460 L180,450 L160,420 L150,390 L140,360 L150,330 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Europe */}
              <path d="M440,60 L500,55 L530,65 L540,85 L520,100 L500,110 L480,120 L460,115 L445,100 L440,80 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Africa */}
              <path d="M450,130 L510,120 L540,130 L560,160 L570,200 L565,240 L550,280 L530,320 L510,350 L490,360 L470,350 L450,310 L440,270 L435,230 L440,190 L445,160 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Asia */}
              <path d="M530,55 L650,45 L750,50 L820,60 L860,80 L870,110 L840,140 L800,160 L760,170 L720,165 L680,170 L660,190 L640,200 L610,195 L580,180 L560,160 L540,140 L530,110 L525,80 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Middle East */}
              <path d="M540,140 L580,130 L610,140 L620,170 L610,195 L580,200 L560,195 L545,175 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Australia */}
              <path d="M760,280 L830,270 L870,280 L890,310 L880,350 L850,370 L810,370 L780,355 L760,330 L755,300 Z" fill="#c8b89a" stroke="#b8a880" strokeWidth="1"/>
              {/* Greenland */}
              <path d="M220,30 L280,20 L310,35 L300,60 L270,70 L240,65 L220,50 Z" fill="#d4ccc0" stroke="#b8a880" strokeWidth="1"/>

              {/* --- PINS --- */}
              {/* Istanbul: ~29°E, 41°N → x≈555, y≈135 */}
              <g transform="translate(555,135)">
                <circle cx="0" cy="0" r="10" fill={C.gold} opacity="0.25"/>
                <circle cx="0" cy="0" r="5" fill={C.gold}/>
                <line x1="0" y1="0" x2="0" y2="18" stroke={C.gold} strokeWidth="2"/>
                <rect x="-28" y="20" width="56" height="18" rx="3" fill="rgba(20,15,5,0.82)"/>
                <text x="0" y="33" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Cairo,sans-serif">{lang==="ar"?"إسطنبول":"Istanbul"}</text>
              </g>

              {/* Aleppo: ~37°E, 36°N → x≈570, y≈155 */}
              <g transform="translate(575,158)">
                <circle cx="0" cy="0" r="10" fill={C.gold} opacity="0.25"/>
                <circle cx="0" cy="0" r="5" fill={C.gold}/>
                <line x1="0" y1="0" x2="0" y2="18" stroke={C.gold} strokeWidth="2"/>
                <rect x="-22" y="20" width="44" height="18" rx="3" fill="rgba(20,15,5,0.82)"/>
                <text x="0" y="33" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Cairo,sans-serif">{lang==="ar"?"حلب":"Aleppo"}</text>
              </g>

              {/* Dubai: ~55°E, 25°N → x≈607, y≈178 */}
              <g transform="translate(610,182)">
                <circle cx="0" cy="0" r="10" fill={C.gold} opacity="0.25"/>
                <circle cx="0" cy="0" r="5" fill={C.gold}/>
                <line x1="0" y1="0" x2="0" y2="18" stroke={C.gold} strokeWidth="2"/>
                <rect x="-20" y="20" width="40" height="18" rx="3" fill="rgba(20,15,5,0.82)"/>
                <text x="0" y="33" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="Cairo,sans-serif">{lang==="ar"?"دبي":"Dubai"}</text>
              </g>

              {/* Branding */}
              <rect x="820" y="460" width="160" height="24" rx="3" fill="rgba(20,15,5,0.6)"/>
              <text x="900" y="476" textAnchor="middle" fill="#C9A84C" fontSize="11" fontFamily="Cairo,sans-serif" letterSpacing="2">ALKOWN GLOBAL</text>
            </svg>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px,6vw,72px)", alignItems: "start" }}>
          {/* Info */}
          <div>
            <Label text={t.nav.contact} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: C.g800, marginTop: 10, marginBottom: 8 }}>{t.about.h2.split("\n")[0]}</h2>
            <Divider />
            <p style={{ color: C.g600, lineHeight: 2, fontSize: ".95rem", margin: "16px 0 36px" }}>{t.about.p.split(".")[0]}.</p>

            {/* العنوان */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid rgba(201,168,76,.1)` }}>
              <div style={{ width: 40, height: 40, background: `rgba(201,168,76,.1)`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", flexShrink: 0 }}>📍</div>
              <span style={{ color: C.g600, fontSize: ".9rem" }}>{t.footer.address}</span>
            </div>

            {/* أرقام الهاتف — واتساب فقط */}
            {[
              { num: "+90 534 764 1249", wa: "https://wa.me/905347641249" },
              { num: "+971 54 490 9522", wa: "https://wa.me/971544909522" },
              { num: "+963 980 631 952", wa: "https://wa.me/963980631952" },
            ].map(({ num, wa }, i) => (
              <a key={i} href={wa} target="_blank" rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid rgba(201,168,76,.1)`, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <div style={{ width: 40, height: 40, background: `rgba(201,168,76,.1)`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", flexShrink: 0 }}>📞</div>
                <span style={{ color: C.g600, fontSize: ".9rem" }}>{num}</span>
              </a>
            ))}

            {/* الإيميل */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid rgba(201,168,76,.1)` }}>
              <div style={{ width: 40, height: 40, background: `rgba(201,168,76,.1)`, border: `1px solid rgba(201,168,76,.25)`, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".95rem", flexShrink: 0 }}>✉️</div>
              <a href="mailto:info@alkownglobal.com" style={{ color: C.gold, fontSize: ".9rem", textDecoration: "none", fontWeight: 600 }}>info@alkownglobal.com</a>
            </div>

            {/* السوشيال ميديا */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid rgba(201,168,76,.1)` }}>
              <div style={{ width: 40, height: 40, background: "rgba(225,48,108,.1)", border: "1px solid rgba(225,48,108,.25)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <a href="https://instagram.com/alkownglobal" target="_blank" rel="noreferrer" style={{ color: "#e1306c", fontSize: ".9rem", textDecoration: "none", fontWeight: 600 }}>@alkownglobal</a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid rgba(201,168,76,.1)` }}>
              <div style={{ width: 40, height: 40, background: "rgba(24,119,242,.1)", border: "1px solid rgba(24,119,242,.25)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <a href="https://facebook.com/alkownglobal" target="_blank" rel="noreferrer" style={{ color: "#1877f2", fontSize: ".9rem", textDecoration: "none", fontWeight: 600 }}>@alkownglobal</a>
            </div>
          </div>

          {/* Form */}
          {sent ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 16, color: C.gold }}>✓</div>
              <h3 style={{ color: C.g800, fontSize: "1.5rem", fontWeight: 800, marginBottom: 10 }}>
                {lang === "ar" ? "تم إرسال رسالتك!" : "Message Sent!"}
              </h3>
              <p style={{ color: C.g400, marginBottom: 24 }}>{lang === "ar" ? "سنتواصل معك في أقرب وقت" : "We'll get back to you soon"}</p>
              <a href={sent} target="_blank" rel="noreferrer"
                style={{ display: "inline-block", padding: "13px 28px", background: "#25d366", color: "#fff", borderRadius: 6, fontFamily: ff, fontWeight: 700, textDecoration: "none", fontSize: ".9rem" }}>
                💬 {lang === "ar" ? "أرسل رسالتك عبر واتساب" : "Send via WhatsApp"}
              </a>
            </div>
          ) : (
            <div>
              {[
                [t.booking.name, "name", "text"],
                [t.booking.email, "email", "email"],
                [t.booking.phone, "phone", "tel"],
                [t.booking.whatsapp, "whatsapp", "tel"]
              ].map(([lbl, k, tp]) => (
                <div key={k} style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{lbl}</label>
                  <input type={tp} value={form[k]} onChange={upd(k)}
                    style={{ width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 2, transition: "all .25s", fontFamily: ff }} />
                </div>
              ))}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{t.booking.service}</label>
                <select value={form.service} onChange={upd("service")}
                  style={{ width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 2, transition: "all .25s", fontFamily: ff }}>
                  <option value="">{lang === "ar" ? "اختر الخدمة" : "Select Service"}</option>
                  {["السفر والتأشيرات", "برامج الجنسية", "وكالة الإعلان", "أكاديمية المهارات", "تأسيس شركات", "أخرى"].map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", color: C.g400, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>{t.booking.msg}</label>
                <textarea rows={5} value={form.msg} onChange={upd("msg")}
                  style={{ width: "100%", padding: "13px 16px", border: `1px solid rgba(201,168,76,.25)`, background: C.beige, color: C.g800, fontSize: ".9rem", borderRadius: 2, resize: "vertical", fontFamily: ff, transition: "all .25s" }} />
              </div>
             <button
  className="gbtn"
  style={{ fontFamily: ff, width: "100%", opacity: submitting ? .7 : 1 }}
  disabled={submitting}
  onClick={handleBooking}
>
  {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال الرسالة" : "Send Message")}
</button>
            </div>
          )}
          </div>
        </div>
      </section>
    </>
  );
}

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
      await fetch("/.netlify/functions/send-contact-email", {
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
    { k: "citizenship", l: t.nav.citizenship }, { k: "advertising", l: t.nav.advertising },
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
