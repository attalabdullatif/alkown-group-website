// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Visa Rules Mock Database
// Architecture designed for API/AI integration
// ═══════════════════════════════════════════════════════════════

export const VISA_TYPES = {
  NONE: "visa_free",
  ON_ARRIVAL: "visa_on_arrival",
  E_VISA: "e_visa",
  EMBASSY: "embassy_visa",
  REFUSED: "entry_refused",
};

export const VISA_TYPE_LABELS = {
  en: {
    visa_free: "Visa Free",
    visa_on_arrival: "Visa on Arrival",
    e_visa: "E-Visa",
    embassy_visa: "Embassy Visa",
    entry_refused: "Entry Refused",
  },
  ar: {
    visa_free: "بدون تأشيرة",
    visa_on_arrival: "تأشيرة عند الوصول",
    e_visa: "تأشيرة إلكترونية",
    embassy_visa: "تأشيرة سفارة",
    entry_refused: "الدخول مرفوض",
  }
};

export const VISA_TYPE_COLORS = {
  visa_free: "#27ae60",
  visa_on_arrival: "#2980b9",
  e_visa: "#8e44ad",
  embassy_visa: "#c9a84c",
  entry_refused: "#c0392b",
};

// ── DOCUMENT TEMPLATES ─────────────────────────────────────────
const DOCS = {
  standard: [
    { en: "Valid passport (min. 6 months validity)", ar: "جواز سفر ساري (صلاحية 6 أشهر على الأقل)" },
    { en: "Recent passport-size photo", ar: "صورة شخصية حديثة" },
    { en: "Completed visa application form", ar: "استمارة طلب التأشيرة مكتملة" },
    { en: "Proof of accommodation", ar: "إثبات مكان الإقامة" },
    { en: "Return or onward ticket", ar: "تذكرة العودة أو المرور" },
    { en: "Bank statement (last 3 months)", ar: "كشف حساب بنكي (آخر 3 أشهر)" },
  ],
  schengen_extra: [
    { en: "Travel insurance (min. €30,000 coverage)", ar: "تأمين سفر (تغطية لا تقل عن 30,000 يورو)" },
    { en: "Employment letter or business registration", ar: "خطاب عمل أو سجل تجاري" },
    { en: "Proof of sufficient funds", ar: "إثبات الأموال الكافية" },
    { en: "Itinerary / travel plan", ar: "خطة السفر التفصيلية" },
  ],
  uae_extra: [
    { en: "UAE resident visa copy (if applicable)", ar: "نسخة إقامة الإمارات (إن وجدت)" },
    { en: "Emirates ID copy (if applicable)", ar: "نسخة الهوية الإماراتية (إن وجدت)" },
  ],
  us_extra: [
    { en: "DS-160 form completion", ar: "استمارة DS-160 مكتملة" },
    { en: "Proof of strong ties to home country", ar: "إثبات الروابط القوية بالبلد الأصلي" },
    { en: "Financial documents", ar: "المستندات المالية" },
    { en: "Interview appointment", ar: "موعد المقابلة" },
  ],
};

// ── VISA RULES DATABASE ────────────────────────────────────────
// Key: "NATIONALITY_DESTINATION" or "NATIONALITY_RESIDENCE_DESTINATION"
// Priority: specific nationality+residence+destination > nationality+destination

export const VISA_RULES = {

  // ── SYRIA → destinations ────────────────────────────────────
  "SY_AE": {
    from: "SY", to: "AE",
    type: VISA_TYPES.ON_ARRIVAL,
    stay: "30 days",
    processing: "On arrival",
    fee: { amount: 0, currency: "AED", note: "Free of charge" },
    feeAr: { amount: 0, currency: "درهم", note: "مجاناً" },
    documents: [...DOCS.standard],
    notes: {
      en: "Syrian passport holders may enter UAE visa-free for 30 days. Entry subject to immigration officer discretion.",
      ar: "حاملو الجواز السوري يمكنهم دخول الإمارات لمدة 30 يوماً. الدخول يخضع لتقدير ضابط الهجرة."
    },
    faqs: [
      { q: { en: "Can I extend my stay?", ar: "هل يمكنني تمديد إقامتي؟" }, a: { en: "Yes, you can extend for an additional 30 days at DNRD.", ar: "نعم، يمكن التمديد لـ 30 يوم إضافية من الإدارة العامة للإقامة." } },
      { q: { en: "Is there a minimum passport validity?", ar: "هل هناك حد أدنى لصلاحية الجواز؟" }, a: { en: "Passport must be valid for at least 6 months.", ar: "يجب أن يكون الجواز صالحاً لمدة 6 أشهر على الأقل." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "SY_TR": {
    from: "SY", to: "TR",
    type: VISA_TYPES.ON_ARRIVAL,
    stay: "90 days",
    processing: "On arrival",
    fee: { amount: 0, currency: "USD", note: "Free" },
    feeAr: { amount: 0, currency: "دولار", note: "مجاناً" },
    documents: [
      { en: "Valid passport", ar: "جواز سفر ساري" },
      { en: "Recent photo", ar: "صورة شخصية حديثة" },
      { en: "Return ticket", ar: "تذكرة العودة" },
    ],
    notes: {
      en: "Syrians can enter Turkey visa-free for up to 90 days per 180-day period.",
      ar: "السوريون يستطيعون دخول تركيا بدون تأشيرة لمدة 90 يوماً خلال 180 يوماً."
    },
    faqs: [
      { q: { en: "Can Syrians work in Turkey?", ar: "هل يمكن للسوريين العمل في تركيا؟" }, a: { en: "A work permit is required to work legally in Turkey.", ar: "تصريح العمل مطلوب للعمل بشكل قانوني في تركيا." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "SY_DE": {
    from: "SY", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days (Schengen)",
    processing: "15–45 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: {
      en: "Syrian nationals require a Schengen visa to enter Germany. Apply at the German embassy. Processing times may vary. Additional documents may be requested.",
      ar: "المواطنون السوريون يحتاجون تأشيرة شنغن لدخول ألمانيا. يتقدم بالطلب في السفارة الألمانية. قد تختلف مدد المعالجة."
    },
    faqs: [
      { q: { en: "Where to apply from Syria?", ar: "من أين أتقدم من سوريا؟" }, a: { en: "Applications can be submitted via VFS Global in Amman or Beirut if the German embassy is not operating locally.", ar: "يمكن تقديم الطلبات عبر VFS Global في عمان أو بيروت إذا كانت السفارة الألمانية غير موجودة محلياً." } },
      { q: { en: "How long is the Schengen visa valid?", ar: "كم تدوم صلاحية تأشيرة شنغن؟" }, a: { en: "Usually valid for the duration of your trip, up to 90 days.", ar: "عادةً صالحة لمدة رحلتك، حتى 90 يوماً." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "SY_FR": {
    from: "SY", to: "FR",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "15–30 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: {
      en: "Syrians require a Schengen visa for France. Apply via TLScontact or the French embassy.",
      ar: "السوريون يحتاجون تأشيرة شنغن لفرنسا. يتقدم عبر TLScontact أو السفارة الفرنسية."
    },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "SY_GB": {
    from: "SY", to: "GB",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 6 months",
    processing: "15–20 business days",
    fee: { amount: 115, currency: "GBP", note: "Standard visitor visa" },
    feeAr: { amount: 115, currency: "جنيه استرليني", note: "تأشيرة زائر عادية" },
    documents: [
      ...DOCS.standard,
      { en: "UK visa application form (online)", ar: "استمارة تأشيرة UK الإلكترونية" },
      { en: "Biometrics appointment", ar: "موعد البصمة" },
      { en: "Proof of purpose of visit", ar: "إثبات الغرض من الزيارة" },
    ],
    notes: {
      en: "UK is not part of Schengen. Apply online via UKVI. Biometrics required at a Visa Application Centre.",
      ar: "المملكة المتحدة ليست جزءاً من شنغن. التقديم إلكترونياً عبر UKVI. البصمة مطلوبة في مركز تقديم التأشيرة."
    },
    faqs: [
      { q: { en: "Can I apply from UAE?", ar: "هل أستطيع التقديم من الإمارات؟" }, a: { en: "Yes, you can apply from any country where you are legally resident.", ar: "نعم، يمكنك التقديم من أي دولة تقيم فيها بشكل قانوني." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "SY_US": {
    from: "SY", to: "US",
    type: VISA_TYPES.EMBASSY,
    stay: "Determined at port of entry",
    processing: "Varies widely (60–180+ days)",
    fee: { amount: 185, currency: "USD", note: "Non-immigrant visa fee" },
    feeAr: { amount: 185, currency: "دولار", note: "رسوم تأشيرة غير مهاجر" },
    documents: [...DOCS.standard, ...DOCS.us_extra],
    notes: {
      en: "Syrian nationals face extensive screening. Processing times are significantly longer than average. Interview at US Embassy or consulate required.",
      ar: "المواطنون السوريون يخضعون لفحص مكثف. مدد المعالجة أطول بكثير من المتوسط. المقابلة في السفارة الأمريكية مطلوبة."
    },
    faqs: [
      { q: { en: "How long does processing take?", ar: "كم تستغرق معالجة الطلب؟" }, a: { en: "Processing for Syrian nationals often takes 6-12+ months due to additional security checks.", ar: "المعالجة للمواطنين السوريين غالباً تستغرق 6-12 شهراً بسبب فحوصات الأمن الإضافية." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "SY_CA": {
    from: "SY", to: "CA",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 6 months",
    processing: "30–90 days",
    fee: { amount: 100, currency: "CAD", note: "Visitor visa fee" },
    feeAr: { amount: 100, currency: "دولار كندي", note: "رسوم تأشيرة زائر" },
    documents: [...DOCS.standard, { en: "Online IRCC application", ar: "طلب IRCC الإلكتروني" }],
    notes: {
      en: "Apply online via IRCC Canada portal. Biometrics required.",
      ar: "التقديم إلكترونياً عبر بوابة IRCC الكندية. البصمة مطلوبة."
    },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "SY_JP": {
    from: "SY", to: "JP",
    type: VISA_TYPES.EMBASSY,
    stay: "15–90 days",
    processing: "5–10 business days",
    fee: { amount: 3000, currency: "JPY", note: "Single entry" },
    feeAr: { amount: 3000, currency: "ين ياباني", note: "دخول واحد" },
    documents: [...DOCS.standard, { en: "Daily schedule in Japan", ar: "جدول إقامتك اليومي في اليابان" }],
    notes: {
      en: "Apply at the Japanese embassy. Documents must be thorough. Invitation letter helpful.",
      ar: "التقديم في السفارة اليابانية. المستندات يجب أن تكون شاملة. خطاب الدعوة مفيد."
    },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── UAE → destinations ───────────────────────────────────────
  "AE_JP": {
    from: "AE", to: "JP",
    type: VISA_TYPES.NONE,
    stay: "30 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "JPY", note: "Free" },
    feeAr: { amount: 0, currency: "ين", note: "مجاناً" },
    documents: [
      { en: "Valid UAE passport", ar: "جواز السفر الإماراتي الساري" },
      { en: "Return ticket", ar: "تذكرة العودة" },
      { en: "Proof of accommodation", ar: "إثبات مكان الإقامة" },
    ],
    notes: {
      en: "UAE passport holders enjoy visa-free access to Japan for 30 days.",
      ar: "حاملو الجواز الإماراتي يتمتعون بدخول مجاني إلى اليابان لمدة 30 يوماً."
    },
    faqs: [
      { q: { en: "Can I extend my stay in Japan?", ar: "هل يمكنني تمديد إقامتي في اليابان؟" }, a: { en: "Extensions are generally not granted for tourist entries. You must exit and re-enter.", ar: "التمديد غير ممكن عادةً للزيارة السياحية. يجب الخروج والدخول من جديد." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "AE_DE": {
    from: "AE", to: "DE",
    type: VISA_TYPES.NONE,
    stay: "90 days per 180 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "EUR", note: "Free" },
    feeAr: { amount: 0, currency: "يورو", note: "مجاناً" },
    documents: [
      { en: "Valid UAE passport", ar: "جواز السفر الإماراتي الساري" },
      { en: "Travel insurance recommended", ar: "تأمين السفر يُنصح به" },
    ],
    notes: {
      en: "UAE passport holders can travel to all Schengen countries including Germany without a visa.",
      ar: "حاملو الجواز الإماراتي يمكنهم السفر لجميع دول شنغن بما فيها ألمانيا بدون تأشيرة."
    },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "AE_US": {
    from: "AE", to: "US",
    type: VISA_TYPES.EMBASSY,
    stay: "B1/B2 up to 6 months",
    processing: "30–90 days",
    fee: { amount: 185, currency: "USD", note: "Non-immigrant visa fee" },
    feeAr: { amount: 185, currency: "دولار", note: "رسوم تأشيرة غير مهاجر" },
    documents: [...DOCS.standard, ...DOCS.us_extra],
    notes: {
      en: "UAE nationals require a US visa despite strong bilateral relations. Apply at the US Embassy in Abu Dhabi or Consulate in Dubai.",
      ar: "المواطنون الإماراتيون يحتاجون تأشيرة أمريكية. التقديم في السفارة بأبوظبي أو القنصلية في دبي."
    },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "AE_GB": {
    from: "AE", to: "GB",
    type: VISA_TYPES.NONE,
    stay: "6 months",
    processing: "Visa-free",
    fee: { amount: 0, currency: "GBP", note: "Free" },
    feeAr: { amount: 0, currency: "جنيه", note: "مجاناً" },
    documents: [
      { en: "Valid UAE passport", ar: "جواز سفر إماراتي ساري" },
      { en: "Proof of funds", ar: "إثبات الأموال" },
    ],
    notes: {
      en: "UAE passport holders can visit the UK visa-free for up to 6 months.",
      ar: "حاملو الجواز الإماراتي يستطيعون زيارة المملكة المتحدة بدون تأشيرة لمدة 6 أشهر."
    },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── TURKEY → destinations ────────────────────────────────────
  "TR_AE": {
    from: "TR", to: "AE",
    type: VISA_TYPES.NONE,
    stay: "90 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "AED", note: "Free" },
    feeAr: { amount: 0, currency: "درهم", note: "مجاناً" },
    documents: [{ en: "Valid Turkish passport", ar: "جواز سفر تركي ساري" }],
    notes: { en: "Turkish citizens enjoy visa-free access to UAE.", ar: "المواطنون الأتراك يتمتعون بدخول مجاني للإمارات." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "TR_DE": {
    from: "TR", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "15–30 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: { en: "Turkish nationals require a Schengen visa for Germany.", ar: "المواطنون الأتراك يحتاجون تأشيرة شنغن لألمانيا." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── JORDAN → destinations ────────────────────────────────────
  "JO_AE": {
    from: "JO", to: "AE",
    type: VISA_TYPES.NONE,
    stay: "30 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "AED", note: "Free" },
    feeAr: { amount: 0, currency: "درهم", note: "مجاناً" },
    documents: [{ en: "Valid Jordanian passport", ar: "جواز سفر أردني ساري" }],
    notes: { en: "Jordanian citizens can visit UAE visa-free for 30 days.", ar: "المواطنون الأردنيون يزورون الإمارات بدون تأشيرة لمدة 30 يوماً." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── EGYPT → destinations ─────────────────────────────────────
  "EG_AE": {
    from: "EG", to: "AE",
    type: VISA_TYPES.E_VISA,
    stay: "30–90 days",
    processing: "3–5 business days",
    fee: { amount: 100, currency: "AED", note: "Single entry" },
    feeAr: { amount: 100, currency: "درهم", note: "دخول واحد" },
    documents: [...DOCS.standard],
    notes: { en: "Egyptian nationals can apply for UAE e-visa online. Processing is fast.", ar: "المواطنون المصريون يمكنهم التقديم على تأشيرة الإمارات الإلكترونية. المعالجة سريعة." },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "EG_DE": {
    from: "EG", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "15–30 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: { en: "Egyptian nationals require a Schengen visa for Germany.", ar: "المواطنون المصريون يحتاجون تأشيرة شنغن لألمانيا." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── JORDAN → destinations ─────────────────────────────────────
  "JO_DE": {
    from: "JO", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "10–20 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: { en: "Jordanians require a Schengen visa for Germany. Jordan has a visa facilitation agreement with the EU.", ar: "الأردنيون يحتاجون تأشيرة شنغن لألمانيا. الأردن لديها اتفاقية تيسير التأشيرة مع الاتحاد الأوروبي." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "JO_US": {
    from: "JO", to: "US",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 6 months",
    processing: "30–90 days",
    fee: { amount: 185, currency: "USD", note: "Non-immigrant fee" },
    feeAr: { amount: 185, currency: "دولار", note: "رسوم غير مهاجر" },
    documents: [...DOCS.standard, ...DOCS.us_extra],
    notes: { en: "Jordanian nationals require a US B1/B2 visa. Apply at the US Embassy in Amman.", ar: "المواطنون الأردنيون يحتاجون تأشيرة أمريكية B1/B2. التقديم في السفارة الأمريكية في عمان." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── SAUDI ARABIA → destinations ───────────────────────────────
  "SA_JP": {
    from: "SA", to: "JP",
    type: VISA_TYPES.NONE,
    stay: "90 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "JPY", note: "Free" },
    feeAr: { amount: 0, currency: "ين", note: "مجاناً" },
    documents: [{ en: "Valid Saudi passport", ar: "جواز سفر سعودي ساري" }, { en: "Return ticket", ar: "تذكرة العودة" }],
    notes: { en: "Saudi passport holders enjoy visa-free access to Japan for 90 days.", ar: "حاملو الجواز السعودي يتمتعون بدخول مجاني لليابان لمدة 90 يوماً." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "SA_US": {
    from: "SA", to: "US",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 6 months",
    processing: "30–60 days",
    fee: { amount: 185, currency: "USD", note: "Non-immigrant fee" },
    feeAr: { amount: 185, currency: "دولار", note: "رسوم غير مهاجر" },
    documents: [...DOCS.standard, ...DOCS.us_extra],
    notes: { en: "Saudi nationals require a US visa. Apply at the US Embassy in Riyadh or Jeddah.", ar: "المواطنون السعوديون يحتاجون تأشيرة أمريكية. التقديم في سفارة الرياض أو قنصلية جدة." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── PAKISTAN → destinations ────────────────────────────────────
  "PK_AE": {
    from: "PK", to: "AE",
    type: VISA_TYPES.E_VISA,
    stay: "30–90 days",
    processing: "3–7 business days",
    fee: { amount: 100, currency: "AED", note: "Single entry" },
    feeAr: { amount: 100, currency: "درهم", note: "دخول واحد" },
    documents: [...DOCS.standard],
    notes: { en: "Pakistani nationals can apply for UAE e-visa. Ensure passport is valid for at least 6 months.", ar: "المواطنون الباكستانيون يمكنهم التقديم للتأشيرة الإلكترونية للإمارات." },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "PK_TR": {
    from: "PK", to: "TR",
    type: VISA_TYPES.E_VISA,
    stay: "30 days",
    processing: "1–3 business days",
    fee: { amount: 25, currency: "USD", note: "E-visa fee" },
    feeAr: { amount: 25, currency: "دولار", note: "رسوم التأشيرة الإلكترونية" },
    documents: [{ en: "Valid passport", ar: "جواز سفر ساري" }, { en: "Credit card for payment", ar: "بطاقة ائتمان للدفع" }],
    notes: { en: "Pakistani nationals can apply for Turkish e-visa online at evisa.gov.tr.", ar: "المواطنون الباكستانيون يمكنهم التقديم للتأشيرة الإلكترونية التركية على evisa.gov.tr." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── INDIA → destinations ────────────────────────────────────────
  "IN_AE": {
    from: "IN", to: "AE",
    type: VISA_TYPES.E_VISA,
    stay: "30–90 days",
    processing: "3–5 business days",
    fee: { amount: 100, currency: "AED", note: "Single entry" },
    feeAr: { amount: 100, currency: "درهم", note: "دخول واحد" },
    documents: [...DOCS.standard],
    notes: { en: "Indian nationals can apply for UAE e-visa online. One of the most common visa routes.", ar: "المواطنون الهنود يمكنهم التقديم للتأشيرة الإلكترونية للإمارات. أحد أكثر مسارات التأشيرة شيوعاً." },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  "IN_TR": {
    from: "IN", to: "TR",
    type: VISA_TYPES.E_VISA,
    stay: "30 days",
    processing: "1–3 business days",
    fee: { amount: 25, currency: "USD", note: "E-visa fee" },
    feeAr: { amount: 25, currency: "دولار", note: "رسوم إلكترونية" },
    documents: [{ en: "Valid passport", ar: "جواز سفر ساري" }],
    notes: { en: "Indian nationals can get Turkish e-visa online.", ar: "المواطنون الهنود يمكنهم الحصول على التأشيرة التركية الإلكترونية." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── MOROCCO → destinations ─────────────────────────────────────
  "MA_AE": {
    from: "MA", to: "AE",
    type: VISA_TYPES.NONE,
    stay: "30 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "AED", note: "Free" },
    feeAr: { amount: 0, currency: "درهم", note: "مجاناً" },
    documents: [{ en: "Valid Moroccan passport", ar: "جواز سفر مغربي ساري" }],
    notes: { en: "Moroccan citizens can visit UAE visa-free for 30 days.", ar: "المواطنون المغاربة يزورون الإمارات بدون تأشيرة لمدة 30 يوماً." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "MA_FR": {
    from: "MA", to: "FR",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "15–30 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra],
    notes: { en: "Moroccan nationals require a Schengen visa for France. France is the main destination for Moroccans.", ar: "المواطنون المغاربة يحتاجون تأشيرة شنغن لفرنسا." },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },

  // ── KUWAIT → destinations ──────────────────────────────────────
  "KW_JP": {
    from: "KW", to: "JP",
    type: VISA_TYPES.NONE,
    stay: "90 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "JPY", note: "Free" },
    feeAr: { amount: 0, currency: "ين", note: "مجاناً" },
    documents: [{ en: "Valid Kuwaiti passport", ar: "جواز سفر كويتي ساري" }],
    notes: { en: "Kuwaiti passport holders enjoy visa-free access to Japan.", ar: "حاملو الجواز الكويتي يتمتعون بدخول مجاني لليابان." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  "KW_DE": {
    from: "KW", to: "DE",
    type: VISA_TYPES.NONE,
    stay: "90 days per 180 days",
    processing: "Visa-free",
    fee: { amount: 0, currency: "EUR", note: "Free" },
    feeAr: { amount: 0, currency: "يورو", note: "مجاناً" },
    documents: [{ en: "Valid Kuwaiti passport", ar: "جواز سفر كويتي ساري" }],
    notes: { en: "Kuwaiti passport holders can visit all Schengen countries including Germany without a visa.", ar: "حاملو الجواز الكويتي يزورون دول شنغن بما فيها ألمانيا بدون تأشيرة." },
    faqs: [],
    popular: false,
    updatedAt: "2025-01-01",
  },

  // ── Residence-based overrides (NATIONALITY_RESIDENCE_DESTINATION) ──
  // Syrian living in UAE → Germany
  "SY_AE_DE": {
    from: "SY", residence: "AE", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "10–25 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [
      ...DOCS.standard,
      ...DOCS.schengen_extra,
      ...DOCS.uae_extra,
    ],
    notes: {
      en: "Syrians residing in the UAE can apply for a German Schengen visa from the German embassy in Abu Dhabi or consulate in Dubai. UAE residency strengthens your application significantly.",
      ar: "السوريون المقيمون في الإمارات يمكنهم التقديم للتأشيرة الألمانية من السفارة الألمانية في أبوظبي أو القنصلية في دبي. الإقامة الإماراتية تعزز طلبك بشكل كبير."
    },
    faqs: [
      { q: { en: "Does UAE residency help with German visa?", ar: "هل تساعد إقامة الإمارات في الحصول على تأشيرة ألمانية؟" }, a: { en: "Yes, UAE residency significantly increases approval rates for Schengen visas.", ar: "نعم، الإقامة الإماراتية ترفع نسبة الموافقة على تأشيرة شنغن بشكل ملحوظ." } },
      { q: { en: "Which German consulate to apply at?", ar: "أي قنصلية ألمانية للتقديم؟" }, a: { en: "German Embassy Abu Dhabi or Consulate General Dubai.", ar: "السفارة الألمانية في أبوظبي أو القنصلية العامة في دبي." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  // Syrian living in UAE → Japan
  "SY_AE_JP": {
    from: "SY", residence: "AE", to: "JP",
    type: VISA_TYPES.EMBASSY,
    stay: "15 days",
    processing: "5–7 business days",
    fee: { amount: 3000, currency: "JPY", note: "Single entry" },
    feeAr: { amount: 3000, currency: "ين", note: "دخول واحد" },
    documents: [
      ...DOCS.standard,
      ...DOCS.uae_extra,
      { en: "Daily itinerary in Japan", ar: "جدول إقامتك اليومي في اليابان" },
      { en: "Hotel booking confirmation", ar: "تأكيد حجز الفندق" },
    ],
    notes: {
      en: "Syrians resident in UAE can apply at the Japanese Consulate in Dubai. Processing is fast for UAE residents. Detailed itinerary is essential.",
      ar: "السوريون المقيمون في الإمارات يمكنهم التقديم في القنصلية اليابانية في دبي. المعالجة سريعة لمقيمي الإمارات. جدول الرحلة التفصيلي ضروري."
    },
    faqs: [
      { q: { en: "How fast is processing for UAE residents?", ar: "ما سرعة المعالجة لمقيمي الإمارات؟" }, a: { en: "Usually 5-7 working days when applying from UAE.", ar: "عادةً 5-7 أيام عمل عند التقديم من الإمارات." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  // Syrian living in UAE → UK
  "SY_AE_GB": {
    from: "SY", residence: "AE", to: "GB",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 6 months",
    processing: "15–20 business days",
    fee: { amount: 115, currency: "GBP", note: "Standard visitor visa" },
    feeAr: { amount: 115, currency: "جنيه استرليني", note: "تأشيرة زائر عادية" },
    documents: [...DOCS.standard, ...DOCS.uae_extra, { en: "UK visa online form (UKVI)", ar: "نموذج التأشيرة الإلكتروني UKVI" }, { en: "Biometrics at VAC", ar: "البصمة في مركز التأشيرات" }],
    notes: {
      en: "Syrians resident in UAE apply for UK visa online at UKVI. UAE residency is viewed positively. Biometrics at the UK Visa Application Centre in Dubai or Abu Dhabi.",
      ar: "السوريون المقيمون في الإمارات يتقدمون للتأشيرة البريطانية إلكترونياً عبر UKVI. الإقامة الإماراتية تُنظر إليها بإيجابية."
    },
    faqs: [
      { q: { en: "Where to submit biometrics from UAE?", ar: "أين أقدم البصمة من الإمارات؟" }, a: { en: "UK Visa Application Centres in Dubai (DIFC) or Abu Dhabi.", ar: "مراكز تقديم التأشيرة البريطانية في دبي (مركز DIFC) أو أبوظبي." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  // Syrian living in UAE → USA
  "SY_AE_US": {
    from: "SY", residence: "AE", to: "US",
    type: VISA_TYPES.EMBASSY,
    stay: "Determined at port of entry",
    processing: "60–180+ days",
    fee: { amount: 185, currency: "USD", note: "Non-immigrant visa fee" },
    feeAr: { amount: 185, currency: "دولار", note: "رسوم تأشيرة غير مهاجر" },
    documents: [...DOCS.standard, ...DOCS.us_extra, ...DOCS.uae_extra],
    notes: {
      en: "Syrians in UAE can apply at the US Embassy in Abu Dhabi or Consulate in Dubai. UAE residency and financial stability help the case, but processing for Syrians remains lengthy due to administrative processing.",
      ar: "السوريون في الإمارات يتقدمون في السفارة الأمريكية بأبوظبي أو قنصلية دبي. الإقامة الإماراتية والاستقرار المالي يساعدان، لكن المعالجة تظل طويلة."
    },
    faqs: [
      { q: { en: "Will UAE residency help my US visa?", ar: "هل ستساعد إقامة الإمارات في تأشيرة أمريكا؟" }, a: { en: "Yes, UAE residency demonstrates stability and ties, which can positively impact the interview, but administrative processing is still likely.", ar: "نعم، الإقامة الإماراتية تثبت الاستقرار والروابط وتؤثر إيجاباً على المقابلة، لكن المعالجة الإدارية لا تزال محتملة." } },
    ],
    popular: true,
    updatedAt: "2025-01-01",
  },

  // Egyptian living in UAE → Germany
  "EG_AE_DE": {
    from: "EG", residence: "AE", to: "DE",
    type: VISA_TYPES.EMBASSY,
    stay: "Up to 90 days",
    processing: "10–20 business days",
    fee: { amount: 80, currency: "EUR", note: "Non-refundable" },
    feeAr: { amount: 80, currency: "يورو", note: "غير قابل للاسترداد" },
    documents: [...DOCS.standard, ...DOCS.schengen_extra, ...DOCS.uae_extra],
    notes: {
      en: "Egyptians resident in UAE apply at the German Embassy Abu Dhabi or Consulate Dubai. UAE residency significantly improves approval chances.",
      ar: "المصريون المقيمون في الإمارات يتقدمون في السفارة الألمانية أبوظبي أو القنصلية في دبي. الإقامة الإماراتية تحسن فرص الموافقة بشكل ملحوظ."
    },
    faqs: [],
    popular: true,
    updatedAt: "2025-01-01",
  },
};

// ── LOOKUP FUNCTION ────────────────────────────────────────────
export function lookupVisa({ nationality, residence, destination }) {
  // Priority 1: nationality + residence + destination
  if (residence) {
    const key3 = `${nationality}_${residence}_${destination}`;
    if (VISA_RULES[key3]) return { ...VISA_RULES[key3], matchType: "specific" };
  }
  // Priority 2: nationality + destination
  const key2 = `${nationality}_${destination}`;
  if (VISA_RULES[key2]) return { ...VISA_RULES[key2], matchType: "general" };

  // Priority 3: return unknown
  return null;
}

// ── POPULAR ROUTES ─────────────────────────────────────────────
export const POPULAR_ROUTES = Object.values(VISA_RULES)
  .filter(r => r.popular)
  .map(r => ({ from: r.from, residence: r.residence, to: r.to }));
