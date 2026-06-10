// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Residency & Citizenship Programs Page
// بيانات حقيقية مستخرجة من awcitizenship.com
// ═══════════════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { setSEOMeta, setPageStructuredData } from "../services/seoService";
import { supabase } from "../lib/supabase";

// ── البيانات الافتراضية ─────────────────────────────────────────
const DEFAULT_CITIZENSHIP = [
  {
    id: "dominica",
    flag: "🇩🇲",
    color: "#2980b9",
    nameAr: "دومينيكا",
    nameEn: "Dominica",
    tagAr: "الأسرع والأوفر",
    tagEn: "Fastest & Most Affordable",
    popular: false,
    typeAr: "جنسية رابطة الكومنولث",
    typeEn: "Commonwealth Citizenship",
    durationAr: "6 - 9 أشهر",
    durationEn: "6 – 9 Months",
    investmentAr: "200,000 دولار",
    investmentEn: "$200,000",
    visaFreeAr: "140 دولة بما فيها الشنغن والصين",
    visaFreeEn: "140 countries incl. Schengen & China",
    requirementsAr: [
      "عمر 18 عامًا أو أكثر",
      "سجل جنائي نظيف",
      "إثبات قانوني لمصدر الأموال",
      "إضافة الأبناء المعالين تحت سن 30",
      "إضافة الوالدين فوق سن 65",
    ],
    requirementsEn: [
      "Age 18 or above",
      "Clean criminal record",
      "Legal proof of source of funds",
      "Dependent children under 30",
      "Dependent parents over 65",
    ],
    featuresAr: [
      "دخول بدون تأشيرة لـ 140 دولة",
      "لا يشترط الإقامة أو الزيارة",
      "الجنسية مدى الحياة وقابلة للتوريث",
      "ازدواجية الجنسية مسموحة",
      "إجراءات سرية تامة",
      "جواز سفر معترف به دولياً",
    ],
    featuresEn: [
      "Visa-free to 140 countries",
      "No residency or visit required",
      "Lifetime citizenship & inheritable",
      "Dual citizenship allowed",
      "Full confidentiality",
      "Internationally recognized passport",
    ],
  },
  {
    id: "saint-lucia",
    flag: "🇱🇨",
    color: "#16a085",
    nameAr: "سانت لوسيا",
    nameEn: "Saint Lucia",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "جنسية كاريبية",
    typeEn: "Caribbean Citizenship",
    durationAr: "12 - 18 شهر",
    durationEn: "12 – 18 Months",
    investmentAr: "240,000 دولار",
    investmentEn: "$240,000",
    visaFreeAr: "140 دولة بما فيها الشنغن والمملكة المتحدة",
    visaFreeEn: "140 countries incl. Schengen & UK",
    requirementsAr: [
      "عمر 18 عامًا أو أكثر",
      "سجل جنائي نظيف",
      "إثبات مصدر الأموال",
      "الأبناء المعالون حتى سن 31",
      "الوالدان من عمر 55 فأكثر",
      "الأشقاء غير المتزوجين حتى 18",
      "اجتياز فحص الأمن الإلزامي",
    ],
    requirementsEn: [
      "Age 18 or above",
      "Clean criminal record",
      "Proof of source of funds",
      "Dependent children up to age 31",
      "Parents aged 55+",
      "Unmarried siblings under 18",
      "Mandatory due diligence check",
    ],
    featuresAr: [
      "دخول بدون تأشيرة لـ 140 دولة",
      "تشمل الشنغن والمملكة المتحدة",
      "لا يشترط الإقامة",
      "ازدواجية الجنسية مسموحة",
      "قابلة للتوريث للأجيال القادمة",
      "إجراءات موثوقة وشفافة",
    ],
    featuresEn: [
      "Visa-free to 140 countries",
      "Includes Schengen & UK",
      "No residency requirement",
      "Dual citizenship allowed",
      "Inheritable for future generations",
      "Reliable & transparent process",
    ],
  },
  {
    id: "grenada",
    flag: "🇬🇩",
    color: "#2f8f5b",
    nameAr: "غرينادا",
    nameEn: "Grenada",
    tagAr: "ميزة التأشيرة الأمريكية E-2",
    tagEn: "US E-2 Visa Advantage",
    popular: false,
    typeAr: "جنسية كاريبية",
    typeEn: "Caribbean Citizenship",
    durationAr: "6 - 9 أشهر",
    durationEn: "6 – 9 Months",
    investmentAr: "235,000 دولار",
    investmentEn: "$235,000",
    visaFreeAr: "143 دولة بما فيها الشنغن والمملكة المتحدة",
    visaFreeEn: "143 countries incl. Schengen & UK",
    requirementsAr: [],
    requirementsEn: [],
    featuresAr: [
      "السفر بدون تأشيرة لـ 143 دولة",
      "توريث الجنسية للأطفال حديثي الولادة",
      "ازدواجية الجنسية مسموحة",
      "معاهدة تأشيرة E-2 مع الولايات المتحدة",
      "إمكانية كفالة الأشقاء",
      "لا ضرائب على غير المقيمين",
    ],
    featuresEn: [
      "Visa-free to 143 countries",
      "Citizenship for newborn children",
      "Dual citizenship allowed",
      "US E-2 Investor Visa treaty",
      "Siblings can be included",
      "No taxes for non-residents",
    ],
  },
  {
    id: "turkey",
    flag: "🇹🇷",
    color: "#c9a84c",
    nameAr: "تركيا",
    nameEn: "Turkey",
    tagAr: "الأقوى اقتصادياً",
    tagEn: "Strongest Economy",
    popular: false,
    typeAr: "جنسية بالاستثمار العقاري",
    typeEn: "Citizenship by Real Estate",
    durationAr: "6 - 9 أشهر",
    durationEn: "6 – 9 Months",
    investmentAr: "400,000 دولار",
    investmentEn: "$400,000",
    visaFreeAr: "111 دولة بما فيها هونغ كونغ واليابان وسنغافورة",
    visaFreeEn: "111 countries incl. Hong Kong, Japan & Singapore",
    requirementsAr: [],
    requirementsEn: [],
    featuresAr: [
      "جواز سفر لـ 111 دولة",
      "يشمل هونغ كونغ واليابان وسنغافورة",
      "اقتصاد G20 قوي ومتنامٍ",
      "استثمار عقاري مربح",
      "ازدواجية الجنسية مسموحة",
      "الأسرة مشمولة كاملاً",
    ],
    featuresEn: [
      "Passport for 111 countries",
      "Includes Hong Kong, Japan & Singapore",
      "Strong G20 growing economy",
      "Profitable real estate investment",
      "Dual citizenship allowed",
      "Full family coverage",
    ],
  },
  {
    id: "saint-kitts",
    flag: "🇰🇳",
    color: "#8e44ad",
    nameAr: "سانت كيتس ونيفيس",
    nameEn: "St. Kitts & Nevis",
    tagAr: "أقدم برنامج في العالم",
    tagEn: "World's Oldest Program",
    popular: false,
    typeAr: "جنسية رابطة الكومنولث",
    typeEn: "Commonwealth Citizenship",
    durationAr: "6 - 9 أشهر",
    durationEn: "6 – 9 Months",
    investmentAr: "250,000 دولار",
    investmentEn: "$250,000",
    visaFreeAr: "157 دولة بما فيها الشنغن والمملكة المتحدة",
    visaFreeEn: "157 countries incl. Schengen & UK",
    requirementsAr: [],
    requirementsEn: [],
    featuresAr: [
      "أقدم برنامج جنسية بالاستثمار (1984)",
      "157 دولة بدون تأشيرة",
      "يشمل الشنغن والمملكة المتحدة",
      "ازدواجية الجنسية مسموحة",
      "لا يشترط الإقامة",
      "الأسرة مشمولة",
    ],
    featuresEn: [
      "World's oldest CBI program (1984)",
      "157 countries visa-free",
      "Includes Schengen & UK",
      "Dual citizenship allowed",
      "No residency requirement",
      "Full family coverage",
    ],
  },
  {
    id: "malta",
    flag: "🇲🇹",
    color: "#c9284d",
    nameAr: "مالطا",
    nameEn: "Malta",
    tagAr: "VIP — جواز أوروبي",
    tagEn: "VIP — EU Passport",
    popular: true,
    typeAr: "جنسية الاتحاد الأوروبي",
    typeEn: "EU Citizenship",
    durationAr: "12 - 36 شهر",
    durationEn: "12 – 36 Months",
    investmentAr: "600,000 يورو",
    investmentEn: "€600,000",
    visaFreeAr: "190 دولة",
    visaFreeEn: "190 countries",
    requirementsAr: [],
    requirementsEn: [],
    featuresAr: [
      "جواز سفر الاتحاد الأوروبي — 190 دولة",
      "حق العيش والعمل في أي دولة أوروبية",
      "ثلاث مراحل: إقامة → أهلية → جنسية",
      "الأسرة مشمولة بنفس الطلب",
      "الازدواجية الجنسية مسموحة",
      "أقوى جوازات السفر العالمية",
    ],
    featuresEn: [
      "EU passport — 190 countries",
      "Right to live & work anywhere in EU",
      "Three phases: residency → eligibility → citizenship",
      "Family included in same application",
      "Dual citizenship allowed",
      "One of world's strongest passports",
    ],
  },
];

const DEFAULT_RESIDENCY = [
  {
    id: "portugal-golden",
    flag: "🇵🇹",
    color: "#7c3aed",
    nameAr: "البرتغال — الفيزا الذهبية",
    nameEn: "Portugal — Golden Visa",
    tagAr: "الأكثر طلباً",
    tagEn: "Most Popular",
    popular: true,
    typeAr: "إقامة باستثمار",
    typeEn: "Residency by Investment",
    durationAr: "12 - 18 شهر",
    durationEn: "12 – 18 Months",
    investmentAr: "500,000 يورو",
    investmentEn: "€500,000",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "7 أيام سنوياً فقط",
    stayRequiredEn: "Only 7 days/year",
    pathToCitizenshipAr: "بعد 5 سنوات",
    pathToCitizenshipEn: "After 5 years",
    featuresAr: [
      "العيش والعمل والدراسة في البرتغال",
      "دخول بدون تأشيرة لدول الشنغن",
      "الجنسية البرتغالية بعد 5 سنوات",
      "يكفي 7 أيام سنوياً — لا إقامة دائمة",
      "إضافة الأسرة بالكامل",
      "نظام ضريبي مميز للأجانب",
    ],
    featuresEn: [
      "Live, work & study in Portugal",
      "Visa-free Schengen access",
      "Portuguese citizenship after 5 years",
      "Only 7 days/year required — no permanent stay",
      "Full family coverage",
      "Favorable tax system for foreigners",
    ],
    investmentOptionsAr: [
      "صندوق استثماري: 500,000 يورو",
      "تأسيس شركة + 10 وظائف: 500,000 يورو",
      "تبرع للتراث الوطني: 250,000 يورو",
      "بحث وتطوير: 500,000 يورو",
    ],
    investmentOptionsEn: [
      "Investment Fund: €500,000",
      "Company + 10 jobs: €500,000",
      "National Heritage donation: €250,000",
      "Research & Development: €500,000",
    ],
    costsAr: [
      "الاستثمار: 500,000 يورو",
      "رسوم الطلب: 605 يورو / فرد",
      "رسوم بطاقة الإقامة: 6,045 يورو / فرد",
    ],
    costsEn: [
      "Investment: €500,000",
      "Application fee: €605/person",
      "Residence card fee: €6,045/person",
    ],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء تحت 18", "الأطفال المعالون تحت 26 (طلاب)", "الوالدان 65+"],
    familyMembersEn: ["Spouse", "Children under 18", "Dependent children under 26 (students)", "Parents 65+"],
  },
  {
    id: "portugal-d7",
    flag: "🇵🇹",
    color: "#7c3aed",
    nameAr: "البرتغال — D7",
    nameEn: "Portugal — D7",
    tagAr: "للدخل السلبي",
    tagEn: "Passive Income",
    popular: false,
    typeAr: "تأشيرة الدخل السلبي",
    typeEn: "Passive Income Visa",
    durationAr: "2 - 3 أشهر",
    durationEn: "2 – 3 Months",
    investmentAr: "دخل شهري 1,000 يورو+",
    investmentEn: "Monthly income €1,000+",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "إقامة فعلية في البرتغال",
    stayRequiredEn: "Actual residence in Portugal",
    pathToCitizenshipAr: "بعد 5 سنوات",
    pathToCitizenshipEn: "After 5 years",
    featuresAr: [
      "العيش في البرتغال بالدخل من الخارج",
      "لم الشمل للأسرة كاملاً",
      "رعاية صحية وتعليم مجاني",
      "إقامة دائمة بعد 5 سنوات",
      "نظام ضريبي ITS محفّز",
      "جواز برتغالي يصل لـ 191 دولة",
    ],
    featuresEn: [
      "Live in Portugal on foreign income",
      "Full family reunification",
      "Free healthcare & education",
      "Permanent residency after 5 years",
      "ITS tax incentive program",
      "Portuguese passport — 191 countries",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء المعالون", "الوالدان المعالون"],
    familyMembersEn: ["Spouse", "Dependent children", "Dependent parents"],
  },
  {
    id: "portugal-d8",
    flag: "🇵🇹",
    color: "#7c3aed",
    nameAr: "البرتغال — D8 (نوماد)",
    nameEn: "Portugal — D8 (Digital Nomad)",
    tagAr: "للعمل عن بُعد",
    tagEn: "Remote Work",
    popular: false,
    typeAr: "تأشيرة الرحّل الرقميين",
    typeEn: "Digital Nomad Visa",
    durationAr: "6 أشهر",
    durationEn: "6 Months",
    investmentAr: "دخل شهري 3,480 يورو+",
    investmentEn: "Monthly income €3,480+",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "إقامة فعلية في البرتغال",
    stayRequiredEn: "Actual residence in Portugal",
    pathToCitizenshipAr: "بعد 5 سنوات — 191 دولة",
    pathToCitizenshipEn: "After 5 years — 191 countries",
    featuresAr: [
      "العمل عن بُعد من البرتغال",
      "تصريح إقامة سنتين قابل للتجديد",
      "الجنسية البرتغالية بعد 5 سنوات",
      "نظام ضريبي 24% ثابت (Beckham Law)",
      "إضافة الأسرة بالكامل",
      "جواز سفر يصل لـ 191 دولة",
    ],
    featuresEn: [
      "Work remotely from Portugal",
      "2-year renewable residence permit",
      "Portuguese citizenship after 5 years",
      "Fixed 24% tax (Beckham Law)",
      "Full family coverage",
      "Passport reaching 191 countries",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء تحت 18", "الأطفال فوق 18 (طلاب)", "والدا المتقدم والزوج/ة"],
    familyMembersEn: ["Spouse", "Children under 18", "Children 18+ (students)", "Parents of both spouses"],
  },
  {
    id: "portugal-d2",
    flag: "🇵🇹",
    color: "#7c3aed",
    nameAr: "البرتغال — D2 (ريادة أعمال)",
    nameEn: "Portugal — D2 (Entrepreneur)",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "تأشيرة رواد الأعمال",
    typeEn: "Entrepreneur Visa",
    durationAr: "2 - 3 أشهر",
    durationEn: "2 – 3 Months",
    investmentAr: "لا يوجد حد ثابت",
    investmentEn: "No fixed minimum",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "إقامة فعلية في البرتغال",
    stayRequiredEn: "Actual residence required",
    pathToCitizenshipAr: "بعد 5 سنوات",
    pathToCitizenshipEn: "After 5 years",
    featuresAr: [
      "تأسيس شركة أو شراء شركة قائمة",
      "إنشاء فرع لشركتك الأجنبية",
      "إقامة 4 أشهر + تصريح سنتين",
      "الجنسية بعد 5 سنوات",
      "حرية تنقل شنغن",
      "الأسرة مشمولة",
    ],
    featuresEn: [
      "Start a company or buy existing one",
      "Open a branch of foreign company",
      "4-month visa + 2-year permit",
      "Citizenship after 5 years",
      "Schengen free movement",
      "Family coverage included",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: [],
    familyMembersEn: [],
  },
  {
    id: "spain-golden",
    flag: "🇪🇸",
    color: "#c9284d",
    nameAr: "إسبانيا — الفيزا الذهبية",
    nameEn: "Spain — Golden Visa",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "إقامة باستثمار عقاري",
    typeEn: "Real Estate Investment",
    durationAr: "2 - 3 أشهر",
    durationEn: "2 – 3 Months",
    investmentAr: "500,000 يورو",
    investmentEn: "€500,000",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "لا يشترط الإقامة الدائمة",
    stayRequiredEn: "No permanent stay required",
    pathToCitizenshipAr: "بعد 10 سنوات",
    pathToCitizenshipEn: "After 10 years",
    featuresAr: [
      "العيش والعمل والدراسة في إسبانيا",
      "جواز سفر إسباني — المرتبة الثالثة عالمياً",
      "استثمار عقاري مربح بعوائد إيجارية",
      "حرية تنقل شنغن",
      "لا يشترط الإقامة الفعلية",
      "الأسرة (الزوج/ة والأبناء والوالدان)",
    ],
    featuresEn: [
      "Live, work & study in Spain",
      "Spanish passport — 3rd strongest globally",
      "Profitable real estate with rental income",
      "Schengen free movement",
      "No actual residency required",
      "Family (spouse, children, parents)",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء تحت 18", "الوالدان المعالون"],
    familyMembersEn: ["Spouse", "Children under 18", "Dependent parents"],
  },
  {
    id: "spain-nomad",
    flag: "🇪🇸",
    color: "#c9284d",
    nameAr: "إسبانيا — نوماد الرقميين",
    nameEn: "Spain — Digital Nomad",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "تأشيرة الرحّل الرقميين",
    typeEn: "Digital Nomad Visa",
    durationAr: "1 - 3 سنوات",
    durationEn: "1 – 3 Years",
    investmentAr: "دخل شهري 2,520 يورو+",
    investmentEn: "Monthly income €2,520+",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "إقامة فعلية في إسبانيا",
    stayRequiredEn: "Actual residence required",
    pathToCitizenshipAr: "بعد 10 سنوات",
    pathToCitizenshipEn: "After 10 years",
    featuresAr: [
      "العمل عن بُعد من إسبانيا",
      "قابل للتجديد حتى 5 سنوات",
      "ضريبة ثابتة 24% (Beckham Law)",
      "حرية تنقل شنغن",
      "جودة حياة عالية جداً",
      "الأسرة مشمولة",
    ],
    featuresEn: [
      "Work remotely from Spain",
      "Renewable up to 5 years",
      "Fixed 24% tax (Beckham Law)",
      "Schengen free movement",
      "Very high quality of life",
      "Family included",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء المعالون", "الوالدان المعالون"],
    familyMembersEn: ["Spouse", "Dependent children", "Dependent parents"],
  },
  {
    id: "greece-golden",
    flag: "🇬🇷",
    color: "#2980b9",
    nameAr: "اليونان — الفيزا الذهبية",
    nameEn: "Greece — Golden Visa",
    tagAr: "أقل تكلفة في أوروبا",
    tagEn: "Lowest Cost in Europe",
    popular: false,
    typeAr: "إقامة باستثمار عقاري",
    typeEn: "Real Estate Investment",
    durationAr: "2 - 4 أشهر",
    durationEn: "2 – 4 Months",
    investmentAr: "250,000 يورو",
    investmentEn: "€250,000",
    visaFreeAr: "دول منطقة الشنغن",
    visaFreeEn: "Schengen Area",
    stayRequiredAr: "لا يشترط الإقامة",
    stayRequiredEn: "No residency required",
    pathToCitizenshipAr: "بعد 7 سنوات",
    pathToCitizenshipEn: "After 7 years",
    featuresAr: [
      "أقل حد استثمار في أوروبا",
      "لا يشترط الإقامة الفعلية",
      "حرية تنقل شنغن",
      "الأسرة مشمولة",
      "عقار يحتفظ بقيمته",
      "مسار للجنسية اليونانية",
    ],
    featuresEn: [
      "Lowest investment threshold in Europe",
      "No actual residency required",
      "Schengen free movement",
      "Family coverage included",
      "Property retains its value",
      "Path to Greek citizenship",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [
      "الاستثمار العقاري: 250,000 يورو",
      "رسوم قانونية وضرائب: ~6.4% (~16,000 يورو)",
      "رسوم الفيزا الذهبية: 2,000 يورو / متقدم",
      "رسوم فحص العقار: 250 يورو",
      "عقد الشراء: 1,000 يورو",
      "رسوم الطلب السكني: 300 يورو / متقدم",
    ],
    costsEn: [
      "Real estate investment: €250,000",
      "Legal fees & taxes: ~6.4% (~€16,000)",
      "Golden Visa fee: €2,000/applicant",
      "Property background check: €250",
      "Purchase agreement: €1,000",
      "Residential application fee: €300/applicant",
    ],
    familyMembersAr: [],
    familyMembersEn: [],
  },
  {
    id: "uae-golden",
    flag: "🇦🇪",
    color: "#c9a84c",
    nameAr: "الإمارات — الإقامة الذهبية",
    nameEn: "UAE — Golden Residency",
    tagAr: "الأكثر طلباً عربياً",
    tagEn: "Top Arab Destination",
    popular: true,
    typeAr: "إقامة ذاتية الكفالة",
    typeEn: "Self-Sponsored Residency",
    durationAr: "5 - 10 سنوات قابلة للتجديد",
    durationEn: "5 – 10 Years Renewable",
    investmentAr: "2,000,000 درهم+",
    investmentEn: "AED 2,000,000+",
    visaFreeAr: "شنغن وأفريقيا وآسيا",
    visaFreeEn: "Schengen, Africa & Asia",
    stayRequiredAr: "لا يشترط الإقامة الدائمة",
    stayRequiredEn: "No permanent stay required",
    pathToCitizenshipAr: "إقامة دائمة مرنة",
    pathToCitizenshipEn: "Flexible long-term residency",
    featuresAr: [
      "إقامة ذاتية الكفالة بدون كفيل",
      "10 سنوات للمستثمرين في الاستثمار العام",
      "5 سنوات للمستثمرين في العقارات",
      "تأسيس شركات بملكية 100%",
      "فتح حسابات بنكية مميزة",
      "الأسرة مشمولة كاملاً",
    ],
    featuresEn: [
      "Self-sponsored — no employer needed",
      "10 years for general investment",
      "5 years for real estate investors",
      "100% company ownership",
      "Premium banking access",
      "Full family coverage",
    ],
    investmentOptionsAr: [
      "الاستثمار العام: 2 مليون درهم في صندوق معتمد",
      "العقارات: ملكية عقار بـ 2 مليون درهم",
      "ريادة الأعمال: مشروع 500K درهم مع موافقة حاضنة",
      "المهارات المتخصصة: أطباء وعلماء وفنانون",
    ],
    investmentOptionsEn: [
      "Public investment: AED 2M in approved fund",
      "Real estate: AED 2M property ownership",
      "Entrepreneurship: AED 500K project with incubator",
      "Specialized talent: doctors, scientists, artists",
    ],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء", "أفراد الأسرة المعالون"],
    familyMembersEn: ["Spouse", "Children", "Dependent family members"],
  },
  {
    id: "usa-eb3",
    flag: "🇺🇸",
    color: "#2f6eb5",
    nameAr: "الولايات المتحدة — EB3",
    nameEn: "USA — EB3 Green Card",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "البطاقة الخضراء بالتوظيف",
    typeEn: "Employment-Based Green Card",
    durationAr: "18 - 36 شهر",
    durationEn: "18 – 36 Months",
    investmentAr: "من 45,000 دولار",
    investmentEn: "From $45,000",
    visaFreeAr: "الولايات المتحدة الأمريكية",
    visaFreeEn: "United States of America",
    stayRequiredAr: "إقامة دائمة في الولايات المتحدة",
    stayRequiredEn: "Permanent US residency",
    pathToCitizenshipAr: "بعد 5 سنوات",
    pathToCitizenshipEn: "After 5 years",
    featuresAr: [
      "البطاقة الخضراء الأمريكية الدائمة",
      "عرض عمل دائم بدوام كامل",
      "شهادة العمل من وزارة العمل",
      "تقديم I-140 لدى USCIS",
      "الأسرة المباشرة مشمولة",
      "الجنسية الأمريكية بعد 5 سنوات",
    ],
    featuresEn: [
      "Permanent US Green Card",
      "Permanent full-time job offer",
      "Labor Certification from DOL",
      "I-140 petition to USCIS",
      "Immediate family included",
      "US citizenship after 5 years",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء غير المتزوجين تحت 21"],
    familyMembersEn: ["Spouse", "Unmarried children under 21"],
  },
  {
    id: "usa-eb5",
    flag: "🇺🇸",
    color: "#1a5f2c",
    nameAr: "الولايات المتحدة — EB5",
    nameEn: "USA — EB5 Investor",
    tagAr: "للمستثمرين الكبار",
    tagEn: "For Major Investors",
    popular: false,
    typeAr: "إقامة دائمة بالاستثمار",
    typeEn: "Investment-Based Green Card",
    durationAr: "24 - 36 شهر",
    durationEn: "24 – 36 Months",
    investmentAr: "800,000 - 1,050,000 دولار",
    investmentEn: "$800,000 – $1,050,000",
    visaFreeAr: "الولايات المتحدة الأمريكية",
    visaFreeEn: "United States of America",
    stayRequiredAr: "إقامة دائمة في الولايات المتحدة",
    stayRequiredEn: "Permanent US residency",
    pathToCitizenshipAr: "بعد 5 سنوات",
    pathToCitizenshipEn: "After 5 years",
    featuresAr: [
      "البطاقة الخضراء عبر الاستثمار",
      "لا يشترط خبرة أو تعليم أو لغة",
      "العمل والاستثمار في أي قطاع",
      "الجنسية الأمريكية بعد 5 سنوات",
      "الأسرة المباشرة مشمولة",
      "توفير 10 وظائف دائمة أمريكية",
    ],
    featuresEn: [
      "Green Card through investment",
      "No experience, education, or language required",
      "Work & invest in any sector",
      "US citizenship after 5 years",
      "Immediate family covered",
      "Create 10 permanent US jobs",
    ],
    investmentOptionsAr: [
      "المنطقة المستهدفة: 800,000 دولار",
      "المنطقة الاعتيادية: 1,050,000 دولار",
    ],
    investmentOptionsEn: [
      "Targeted Employment Area: $800,000",
      "Non-TEA area: $1,050,000",
    ],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء غير المتزوجين تحت 21"],
    familyMembersEn: ["Spouse", "Unmarried children under 21"],
  },
  {
    id: "canada-startup",
    flag: "🇨🇦",
    color: "#c9284d",
    nameAr: "كندا — برنامج الشركات الناشئة",
    nameEn: "Canada — Startup Visa",
    tagAr: null,
    tagEn: null,
    popular: false,
    typeAr: "إقامة دائمة لرواد الأعمال",
    typeEn: "PR for Entrepreneurs",
    durationAr: "12 - 31 شهر",
    durationEn: "12 – 31 Months",
    investmentAr: "حسب المشروع",
    investmentEn: "Project-dependent",
    visaFreeAr: "146 دولة حول العالم",
    visaFreeEn: "146 countries worldwide",
    stayRequiredAr: "3 سنوات خلال 5 سنوات",
    stayRequiredEn: "3 years within 5 years",
    pathToCitizenshipAr: "بعد 3 سنوات إقامة دائمة",
    pathToCitizenshipEn: "After 3 years of PR",
    featuresAr: [
      "تأسيس شركة مبتكرة في كندا",
      "جواز سفر كندي لـ 146 دولة",
      "العيش والعمل والدراسة بحرية",
      "رعاية صحية وتعليم مجاني",
      "بيئة آمنة ومستقرة",
      "الأسرة مشمولة كاملاً",
    ],
    featuresEn: [
      "Launch an innovative startup in Canada",
      "Canadian passport — 146 countries",
      "Live, work & study freely",
      "Free healthcare & education",
      "Safe & stable environment",
      "Full family coverage",
    ],
    investmentOptionsAr: [],
    investmentOptionsEn: [],
    costsAr: [],
    costsEn: [],
    familyMembersAr: ["الزوج/الزوجة", "الأبناء غير المتزوجين تحت 21"],
    familyMembersEn: ["Spouse", "Unmarried children under 21"],
  },
];

// ── مكونات مساعدة ────────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg,transparent,var(--gold,#c9a84c))" }} />
      <span style={{ color: "var(--gold,#c9a84c)", fontSize: ".7rem", letterSpacing: ".25em", textTransform: "uppercase", fontWeight: 700 }}>{text}</span>
      <div style={{ width: 28, height: 1, background: "linear-gradient(90deg,var(--gold,#c9a84c),transparent)" }} />
    </div>
  );
}

function ProgramCard({ prog, ar, ff, onCTA, expanded, onToggle }) {
  const features = ar ? prog.featuresAr : prog.featuresEn;
  const requirements = ar ? prog.requirementsAr : prog.requirementsEn;
  const investOpts = ar ? prog.investmentOptionsAr : prog.investmentOptionsEn;
  const costs = ar ? prog.costsAr : prog.costsEn;
  const family = ar ? prog.familyMembersAr : prog.familyMembersEn;

  const cardColor = prog.color || "#c9a84c";

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${cardColor}22`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: prog.popular
          ? `0 12px 40px ${cardColor}28`
          : "0 2px 12px rgba(0,0,0,.06)",
        transition: "all .3s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 48px ${cardColor}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = prog.popular ? `0 12px 40px ${cardColor}28` : "0 2px 12px rgba(0,0,0,.06)"; }}
    >
      {/* Header — ملوّن بلون الدولة */}
      <div style={{
        background: `${cardColor}12`,
        borderBottom: `1px solid ${cardColor}28`,
        padding: "22px 24px 18px",
        position: "relative",
      }}>
        {prog.tagAr && (
          <div style={{
            position: "absolute", top: 12, insetInlineStart: 12,
            background: cardColor,
            color: "#fff",
            padding: "3px 12px", borderRadius: 20,
            fontSize: ".65rem", fontWeight: 800, letterSpacing: ".06em",
          }}>
            ⭐ {ar ? prog.tagAr : prog.tagEn}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: prog.tagAr ? 24 : 0 }}>
          <div style={{ fontSize: "2.8rem", lineHeight: 1 }}>{prog.flag}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontWeight: 800, fontSize: "1.05rem",
              color: "var(--g800,#1e1508)",
              marginBottom: 3,
            }}>
              {ar ? prog.nameAr : prog.nameEn}
            </h3>
            <div style={{ fontSize: ".75rem", color: "var(--g400,#7a6b50)" }}>
              {ar ? prog.typeAr : prog.typeEn}
            </div>
          </div>
          {/* Visa-free badge */}
          {(prog.visaFreeAr || prog.visaFreeEn) && (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: cardColor, lineHeight: 1 }}>
                {(ar ? prog.visaFreeAr : prog.visaFreeEn)?.match(/\d+/)?.[0] || "✓"}
              </div>
              <div style={{ fontSize: ".55rem", color: "var(--g400,#7a6b50)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                {ar ? "دولة بلا تأشيرة" : "visa-free"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${cardColor}18` }}>
        {[
          { icon: "💰", label: ar ? "الاستثمار" : "Investment", val: ar ? prog.investmentAr : prog.investmentEn },
          { icon: "⏱", label: ar ? "المدة" : "Timeline", val: ar ? prog.durationAr : prog.durationEn },
          { icon: "✈️", label: ar ? "سفر بدون تأشيرة" : "Visa-Free", val: ar ? prog.visaFreeAr : prog.visaFreeEn },
          { icon: "🏠", label: ar ? "الإقامة" : "Stay Req.", val: ar ? prog.stayRequiredAr : prog.stayRequiredEn },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            borderInlineEnd: i % 2 === 0 ? `1px solid ${cardColor}18` : "none",
            borderBottom: i < 2 ? `1px solid ${cardColor}18` : "none",
          }}>
            <div style={{ fontSize: ".65rem", color: "var(--g400,#7a6b50)", marginBottom: 3 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: ".8rem", fontWeight: 700, color: cardColor, lineHeight: 1.3 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "20px 22px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {features.map((f, j) => (
            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: ".84rem", color: "var(--g600,#3d3020)" }}>
              <span style={{ color: cardColor, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {/* Expandable details */}
        {(requirements?.length > 0 || investOpts?.length > 0 || costs?.length > 0 || family?.length > 0) && (
          <button
            onClick={onToggle}
            style={{
              background: "none", border: `1px solid ${cardColor}44`, borderRadius: 6,
              padding: "7px 14px", cursor: "pointer", fontFamily: ff, fontSize: ".8rem",
              color: cardColor, fontWeight: 600, width: "100%",
              transition: "all .2s", marginBottom: expanded ? 16 : 0,
            }}
          >
            {expanded
              ? (ar ? "▲ إخفاء التفاصيل" : "▲ Hide Details")
              : (ar ? "▼ عرض التفاصيل" : "▼ Show Details")}
          </button>
        )}

        {expanded && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {requirements?.length > 0 && (
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  📋 {ar ? "شروط الأهلية" : "Requirements"}
                </div>
                {requirements.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: ".82rem", color: "var(--g600,#3d3020)", marginBottom: 5 }}>
                    <span style={{ color: "#e67e22", flexShrink: 0 }}>•</span> {r}
                  </div>
                ))}
              </div>
            )}
            {investOpts?.length > 0 && (
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  💼 {ar ? "خيارات الاستثمار" : "Investment Options"}
                </div>
                {investOpts.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: ".82rem", color: "var(--g600,#3d3020)", marginBottom: 5 }}>
                    <span style={{ color: cardColor, flexShrink: 0 }}>→</span> {o}
                  </div>
                ))}
              </div>
            )}
            {costs?.length > 0 && (
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  💵 {ar ? "التكاليف التفصيلية" : "Detailed Costs"}
                </div>
                {costs.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: ".82rem", color: "var(--g600,#3d3020)", marginBottom: 5 }}>
                    <span style={{ color: "#27ae60", flexShrink: 0 }}>$</span> {c}
                  </div>
                ))}
              </div>
            )}
            {family?.length > 0 && (
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  👨‍👩‍👧 {ar ? "أفراد الأسرة المشمولون" : "Family Coverage"}
                </div>
                {family.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: ".82rem", color: "var(--g600,#3d3020)", marginBottom: 5 }}>
                    <span style={{ color: "#3498db", flexShrink: 0 }}>👤</span> {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 22px 22px" }}>
        <button
          onClick={onCTA}
          style={{
            width: "100%", padding: "13px 0", fontFamily: ff,
            background: cardColor,
            border: "none",
            color: "#fff",
            borderRadius: 8, fontWeight: 800, fontSize: ".88rem", cursor: "pointer",
            transition: "all .2s",
            opacity: 0.92,
          }}
          onMouseEnter={e => { e.target.style.opacity = "1"; e.target.style.transform = "scale(1.01)"; }}
          onMouseLeave={e => { e.target.style.opacity = "0.92"; e.target.style.transform = "scale(1)"; }}
        >
          {ar ? "احصل على استشارة مجانية" : "Free Consultation"}
        </button>
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid rgba(201,168,76,.18)", borderRadius: 10, overflow: "hidden",
      boxShadow: open ? "0 4px 20px rgba(201,168,76,.1)" : "none",
      transition: "box-shadow .2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 22px", background: open ? "rgba(201,168,76,.06)" : "#fff",
          border: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: ".92rem", fontWeight: 700, color: "var(--g800,#1e1508)",
          textAlign: "inherit", gap: 12, transition: "background .2s",
        }}
      >
        <span>{q}</span>
        <span style={{
          color: "var(--gold,#c9a84c)", fontSize: "1.2rem", flexShrink: 0,
          transition: "transform .25s", transform: open ? "rotate(45deg)" : "rotate(0deg)",
          display: "inline-block",
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 22px 18px", color: "var(--g400,#7a6b50)", fontSize: ".88rem", lineHeight: 1.75, borderTop: "1px solid rgba(201,168,76,.1)" }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
export default function Residency({ lang = "ar", ff, setPage }) {
  const ar = lang === "ar";
  const [activeTab, setActiveTab] = useState("residency");
  const [expandedCards, setExpandedCards] = useState({});
  const [pageContent, setPageContent] = useState(null);

  // load custom content from supabase if admin saved any
  useEffect(() => {
    supabase
      .from("residency_page_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => { if (data) setPageContent(data); });
  }, []);

  const citizenshipPrograms = pageContent?.citizenship_programs
    ? JSON.parse(pageContent.citizenship_programs)
    : DEFAULT_CITIZENSHIP;

  const residencyPrograms = pageContent?.residency_programs
    ? JSON.parse(pageContent.residency_programs)
    : DEFAULT_RESIDENCY;

  const heroTitle = pageContent
    ? (ar ? pageContent.hero_title_ar : pageContent.hero_title_en)
    : (ar ? "إقامتك وجنسيتك الثانية" : "Your Residency & Second Citizenship");

  const heroDesc = pageContent
    ? (ar ? pageContent.hero_desc_ar : pageContent.hero_desc_en)
    : (ar
        ? "الإمارات · أوروبا · الكاريبي · جواز سفر ثانٍ · فيزا ذهبية"
        : "UAE · Europe · Caribbean · Second Passport · Golden Visa");

  const handleCTA = () => {
    if (setPage) setPage("booking");
    else window.open("https://wa.me/971544909522", "_blank", "noopener,noreferrer");
  };

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    setSEOMeta({
      title: ar
        ? "برامج الإقامة والجنسية — الفيزا الذهبية والإقامة بالاستثمار"
        : "Residency & Citizenship Programs — Golden Visa & Investment Residency",
      description: ar
        ? "احصل على إقامة الإمارات أو البرتغال أو مالطا. فيزا ذهبية، إقامة باستثمار، جنسية ثانية."
        : "Get residency in UAE, Portugal, or Malta. Golden visa, investment residency, second citizenship.",
      lang,
      canonical: "/residency",
    });
    setPageStructuredData([{
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Residency & Citizenship Programs",
      "name": ar ? "برامج الإقامة والجنسية" : "Residency & Citizenship Programs",
      "provider": { "@type": "Organization", "name": "ALKOWN Global" },
    }]);
  }, [ar, lang]);

  const activePrograms = activeTab === "residency" ? residencyPrograms : citizenshipPrograms;

  return (
    <div style={{ fontFamily: ff || "'Dubai','Cairo','Noto Naskh Arabic',sans-serif", direction: ar ? "rtl" : "ltr" }}>

      {/* ══ HERO — نفس تصميم PageHero ══════════════════════════ */}
      <section style={{
        padding: "110px clamp(20px,6vw,80px) 90px",
        background: `
          radial-gradient(circle at top right, rgba(212,175,55,0.15), transparent 35%),
          linear-gradient(140deg, #16100a 0%, #211608 100%)
        `,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* HeroBG SVG */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.18 }}
          viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path d="M0,380 Q360,160 720,320 T1440,280" fill="none" stroke="#c9a84c" strokeWidth="1.2"
            strokeDasharray="1000" style={{ animation:"draw 4s ease both" }} />
          <path d="M0,560 Q430,360 860,500 T1440,460" fill="none" stroke="#c9a84c" strokeWidth=".6" />
          <circle cx="1150" cy="180" r="180" fill="none" stroke="#c9a84c" strokeWidth=".7" />
          <circle cx="1150" cy="180" r="110" fill="none" stroke="#c9a84c" strokeWidth=".4" />
          <circle cx="240" cy="700" r="120" fill="none" stroke="#c9a84c" strokeWidth=".5" />
          <path d="M80,80 L116,116 L80,152 L44,116Z" fill="none" stroke="#c9a84c" strokeWidth=".7" />
          <path d="M1350,650 L1380,680 L1350,710 L1320,680Z" fill="none" stroke="#c9a84c" strokeWidth=".5" />
        </svg>

        {/* Particles */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          {[...Array(18)].map((_,i) => (
            <div key={i} style={{
              position:"absolute", borderRadius:"50%",
              width: i%4===0 ? 3 : 2, height: i%4===0 ? 3 : 2,
              background: `rgba(${180+i*3},${140+i*2},60,${.25+(i%5)*.08})`,
              left: `${(i*19+7)%100}%`, top: `${(i*27+5)%100}%`,
              animation: `float ${4+i%5}s ease-in-out infinite`,
              animationDelay: `${i*.38}s`,
            }} />
          ))}
        </div>

        {/* Glow */}
        <div style={{
          position:"absolute", width:500, height:500, borderRadius:"50%",
          background:"rgba(212,175,55,0.08)", filter:"blur(100px)",
          top:"-150px", right:"-100px", zIndex:1,
        }} />

        <div style={{ position:"relative", zIndex:2, maxWidth:"900px", margin:"0 auto" }}>
          {/* Badge */}
          <span style={{
            display:"inline-block",
            padding:"8px 18px",
            border:"1px solid #c9a84c",
            borderRadius:"999px",
            color:"#c9a84c",
            fontSize:".75rem",
            letterSpacing:".18em",
            textTransform:"uppercase",
            marginBottom:"24px",
            fontFamily: ff,
          }}>
            {pageContent?.hero_badge || "ALKOWN GLOBAL"}
          </span>

          <h1 className="fu" style={{
            fontSize:"clamp(2.4rem,5vw,4.8rem)",
            fontWeight:800,
            color:"#f5f0e8",
            lineHeight:1.15,
            marginBottom:"18px",
            letterSpacing:".02em",
            fontFamily: ff,
          }}>
            {heroTitle}
          </h1>

          {/* Diamond Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px auto", width:"fit-content" }}>
            <div style={{ width:44, height:1, background:"linear-gradient(90deg,transparent,#c9a84c)" }} />
            <div style={{ position:"relative", width:8, height:8 }}>
              <div style={{ width:8, height:8, background:"#c9a84c", transform:"rotate(45deg)" }} />
              <div style={{ position:"absolute", inset:-3, border:"1px solid rgba(200,146,42,.3)", transform:"rotate(45deg)" }} />
            </div>
            <div style={{ width:44, height:1, background:"linear-gradient(90deg,#c9a84c,transparent)" }} />
          </div>

          <p className="fu2" style={{
            color:"#c9a84c",
            letterSpacing:".22em",
            fontSize:".82rem",
            textTransform:"uppercase",
            marginTop:"14px",
            marginBottom:"32px",
            fontFamily: ff,
          }}>
            {heroDesc}
          </p>

          <div className="fu3" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={handleCTA}>
              {ar ? "احصل على استشارة مجانية" : "Get Free Consultation"}
            </button>
            <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer"
              style={{ padding:"14px 28px", background:"rgba(37,211,102,.1)", border:"1.5px solid rgba(37,211,102,.35)", borderRadius:4, color:"#25d366", fontFamily:ff, fontWeight:700, fontSize:".88rem", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8 }}
            >💬 WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <div style={{ background: "#f5f0e8", borderBottom: "1px solid rgba(201,168,76,.12)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {[
            { n: "11+",     lAr: "برنامج متاح",          lEn: "Programs" },
            { n: "10+",     lAr: "دول حول العالم",        lEn: "Countries" },
            { n: "98%",     lAr: "نسبة نجاح الملفات",    lEn: "Success Rate" },
            { n: "5,000+",  lAr: "عميل تمت خدمته",       lEn: "Clients Served" },
            { n: "10+",     lAr: "سنوات خبرة",            lEn: "Years Experience" },
          ].map((s, i, arr) => (
            <div key={i} style={{
              textAlign: "center", padding: "28px 12px",
              borderInlineEnd: i < arr.length - 1 ? "1px solid rgba(201,168,76,.12)" : "none",
            }}>
              <div className="shimmer" style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Georgia,serif", display: "block" }}>{s.n}</div>
              <div style={{ fontSize: ".72rem", color: "#7a6b50", letterSpacing: ".15em", textTransform: "uppercase", marginTop: 6 }}>{ar ? s.lAr : s.lEn}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TABS ══════════════════════════════════════════════ */}
      <section style={{ padding: "72px clamp(20px,6vw,72px) 40px", background: "#fff" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionLabel text={ar ? "برامجنا" : "Our Programs"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8, marginBottom: 24 }}>
              {ar ? "اختر البرنامج المناسب لك" : "Choose the Right Program for You"}
            </h2>
            <div className="gl" style={{ margin: "0 auto 32px" }} />

            {/* Tab Switcher */}
            <div style={{ display: "inline-flex", background: "var(--bgWarm,#faf7f2)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, padding: 4, gap: 4 }}>
              {[
                { key: "residency", labelAr: "🏡 برامج الإقامة", labelEn: "🏡 Residency Programs" },
                { key: "citizenship", labelAr: "🌍 برامج الجنسية", labelEn: "🌍 Citizenship Programs" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontFamily: ff, fontWeight: 700, fontSize: ".88rem",
                    background: activeTab === tab.key
                      ? "linear-gradient(135deg,#8a6010,var(--gold,#c9a84c))"
                      : "transparent",
                    color: activeTab === tab.key ? "#1e1508" : "var(--g400,#7a6b50)",
                    transition: "all .25s",
                  }}
                >
                  {ar ? tab.labelAr : tab.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Programs Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {activePrograms.map((prog) => (
              <ProgramCard
                key={prog.id}
                prog={prog}
                ar={ar}
                ff={ff}
                onCTA={handleCTA}
                expanded={!!expandedCards[prog.id]}
                onToggle={() => toggleCard(prog.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "كيف نعمل" : "The Process"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "خطوات الحصول على إقامتك" : "How We Secure Your Residency"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>

          <div style={{ background: "linear-gradient(135deg,var(--dark,#16100a),#1d1205)", borderRadius: 16, padding: "52px clamp(20px,4vw,52px)", border: "1px solid rgba(201,168,76,.15)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 32 }}>
              {(ar ? [
                { icon: "💬", t: "استشارة مجانية", d: "نقيّم وضعك ونختار المسار الأمثل" },
                { icon: "✅", t: "تقييم الأهلية", d: "فحص دقيق للمتطلبات والوثائق" },
                { icon: "🎯", t: "اختيار البرنامج", d: "نوصيك بأنسب برنامج لأهدافك" },
                { icon: "📄", t: "تجهيز الوثائق", d: "نتولى تجميع وترجمة كل الوثائق" },
                { icon: "🏛", t: "التقديم الرسمي", d: "تقديم الملف للجهات المختصة" },
                { icon: "🎉", t: "استلام الوثائق", d: "تسليمك الإقامة أو جواز السفر" },
              ] : [
                { icon: "💬", t: "Free Consultation", d: "We assess your situation and find the best path" },
                { icon: "✅", t: "Eligibility Check", d: "Detailed review of requirements & documents" },
                { icon: "🎯", t: "Program Selection", d: "We recommend the best program for your goals" },
                { icon: "📄", t: "Document Prep", d: "We collect and translate all required documents" },
                { icon: "🏛", t: "Official Application", d: "Submitting the file to authorities" },
                { icon: "🎉", t: "Receive Documents", d: "We deliver your residency permit or passport" },
              ]).map((step, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: "linear-gradient(135deg,#8a6010,var(--gold,#c9a84c))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto", fontSize: "1.3rem",
                      boxShadow: "0 4px 18px rgba(201,168,76,.3)",
                    }}>
                      {step.icon}
                    </div>
                    <div style={{
                      position: "absolute", top: -6, insetInlineEnd: -4,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "var(--gold,#c9a84c)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".65rem", fontWeight: 800, color: "var(--dark,#16100a)",
                    }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,.85)", fontSize: ".86rem", fontWeight: 600, marginBottom: 6 }}>{step.t}</div>
                  <div style={{ color: "rgba(255,255,255,.4)", fontSize: ".74rem", lineHeight: 1.5 }}>{step.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY US ═════════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel text={ar ? "لماذا الكون" : "Why Alkown"} />
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "ما يميزنا في برامج الإقامة" : "What Makes Us Stand Out"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {(ar ? [
              { icon: "⚡", t: "معالجة سريعة", d: "نضمن أسرع أوقات معالجة ممكنة لكل برنامج" },
              { icon: "🛡", t: "ضمان الامتثال", d: "جميع الإجراءات قانونية 100% ومعتمدة رسمياً" },
              { icon: "🌍", t: "11+ برنامج", d: "أوسع تغطية جغرافية لبرامج الإقامة والجنسية" },
              { icon: "👑", t: "خدمة VIP", d: "مستشارك الشخصي يرافقك من البداية حتى النهاية" },
              { icon: "📋", t: "معدل نجاح 98%", d: "خبرة تزيد عن 10 سنوات مع آلاف الملفات الناجحة" },
              { icon: "🔒", t: "سرية تامة", d: "بياناتك محمية بأعلى معايير الخصوصية" },
            ] : [
              { icon: "⚡", t: "Fast Processing", d: "We guarantee the fastest possible timelines" },
              { icon: "🛡", t: "Full Compliance", d: "100% legal procedures, officially certified" },
              { icon: "🌍", t: "11+ Programs", d: "Widest coverage for residency & citizenship" },
              { icon: "👑", t: "VIP Service", d: "Personal advisor from start to finish" },
              { icon: "📋", t: "98% Success Rate", d: "10+ years, thousands of approved cases" },
              { icon: "🔒", t: "Full Confidentiality", d: "Data protected with highest privacy standards" },
            ]).map((w, i) => (
              <div key={i} className="card" style={{ padding: "28px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 3, background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  {w.icon}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: "var(--g800,#1e1508)", marginBottom: 6, fontSize: ".96rem" }}>{w.t}</h4>
                  <div className="gl" style={{ marginBottom: 8 }} />
                  <p style={{ color: "var(--g400,#7a6b50)", fontSize: ".83rem", lineHeight: 1.7 }}>{w.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════ */}
      <section style={{ padding: "80px clamp(20px,6vw,72px)", background: "var(--bgWarm,#faf7f2)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel text={ar ? "الأسئلة الشائعة" : "FAQ"} />
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)", fontWeight: 800, color: "var(--g800,#1e1508)", marginTop: 8 }}>
              {ar ? "أسئلة يسألها عملاؤنا" : "Questions Our Clients Ask"}
            </h2>
            <div className="gl" style={{ margin: "16px auto 0" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(ar ? [
              { q: "ما الفرق بين الفيزا الذهبية وبرامج الجنسية؟", a: "الفيزا الذهبية تمنحك إقامة قابلة للتجديد دون جنسية، بينما برامج الجنسية تمنحك جواز سفر ثانياً كامل الحقوق مع حق التصويت والإقامة الدائمة." },
              { q: "هل يمكن إحضار الأسرة معي؟", a: "نعم، معظم البرامج تشمل الزوج/الزوجة والأبناء، وبعضها يشمل الوالدين والأشقاء أيضاً حسب البرنامج والعمر." },
              { q: "هل أحتاج إلى الإقامة الفعلية في الدولة؟", a: "يعتمد على البرنامج. جنسية دومينيكا وسانت كيتس لا تشترط أي إقامة. الفيزا الذهبية البرتغالية تكفي 7 أيام سنوياً. أما D7 وD8 فتشترط الإقامة الفعلية." },
              { q: "ما هو أسرع برنامج جنسية؟", a: "دومينيكا وسانت كيتس ونيفيس وغرينادا هي الأسرع بمتوسط 6-9 أشهر. تركيا أيضاً سريعة بـ 6-9 أشهر مع جواز سفر لـ 111 دولة." },
              { q: "هل الجنسية الكاريبية معترف بها دولياً؟", a: "نعم، جميع برامج الجنسية الكاريبية (دومينيكا، سانت كيتس، غرينادا، سانت لوسيا) معترف بها دولياً وتمنح دخولاً بدون تأشيرة لأوروبا الشنغن والمملكة المتحدة." },
              { q: "ما تكلفة برامج الإقامة البرتغالية؟", a: "الفيزا الذهبية البرتغالية: 500,000 يورو استثمار + رسوم تقديم 605 يورو/فرد + رسوم بطاقة إقامة 6,045 يورو/فرد. أما D7 وD8 فلا تحتاج استثماراً بل إثبات دخل كافٍ." },
            ] : [
              { q: "What is the difference between Golden Visa and Citizenship programs?", a: "Golden Visa grants renewable residency without citizenship, while citizenship programs give you a full second passport with permanent rights and travel privileges." },
              { q: "Can I bring my family?", a: "Yes, most programs include spouse and children. Some also include parents and siblings depending on the program and age requirements." },
              { q: "Do I need to physically reside in the country?", a: "It depends. Dominica & St. Kitts require no residency. Portugal Golden Visa needs only 7 days/year. D7 and D8 require actual residence in Portugal." },
              { q: "What is the fastest citizenship program?", a: "Dominica, St. Kitts & Nevis, and Grenada are fastest at 6–9 months. Turkey is also fast at 6–9 months with a passport for 111 countries." },
              { q: "Is Caribbean citizenship internationally recognized?", a: "Yes, all Caribbean CBI programs (Dominica, St. Kitts, Grenada, St. Lucia) are internationally recognized and grant visa-free access to Schengen Europe and the UK." },
            ]).map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section style={{
        padding: "80px clamp(20px,6vw,72px)",
        background: "linear-gradient(135deg,var(--dark,#16100a),#1d1205)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          <SectionLabel text={ar ? "ابدأ رحلتك" : "Start Your Journey"} />
          <h2 className="shimmer" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, margin: "12px 0 16px" }}>
            {ar ? "جاهز للحصول على إقامتك؟" : "Ready to Secure Your Residency?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.85, marginBottom: 36, fontSize: ".98rem" }}>
            {ar
              ? "تواصل معنا اليوم للحصول على تقييم مجاني لحالتك وأنسب برنامج لأهدافك."
              : "Contact us today for a free assessment and the best program for your goals."}
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="gbtn" style={{ fontFamily: ff }} onClick={handleCTA}>
              {ar ? "احصل على تقييم مجاني" : "Get Free Assessment"}
            </button>
            <a
              href="https://wa.me/971544909522"
              target="_blank" rel="noreferrer"
              style={{ padding: "14px 28px", background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.18)", borderRadius: 4, color: "rgba(255,255,255,.8)", fontFamily: ff, fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              💬 {ar ? "تواصل عبر واتساب" : "Chat on WhatsApp"}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
