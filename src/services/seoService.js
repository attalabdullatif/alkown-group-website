// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — SEO Service
// Enterprise-grade dynamic SEO management
// ═══════════════════════════════════════════════════════════════

const SITE_URL    = "https://alkownglobal.com";
const SITE_NAME   = "الكون العالمية | ALKOWN Global";
const DEFAULT_OG  = `${SITE_URL}/og-image.png`;

// ── Dynamic Meta Tag Manager ──────────────────────────────────
export function setSEOMeta({ title, description, keywords, ogImage, canonical, lang = "ar" } = {}) {
  const defaultDesc = lang === "ar"
    ? "الكون العالمية — خدمات التأشيرة، الإقامة، تأسيس الشركات، والسفر السياحي. خبراء معتمدون في الإمارات وتركيا."
    : "ALKOWN Global — Premium Visa, Residency, Company Formation & Travel Services. Certified experts in UAE & Turkey.";
  const defaultKeywords = lang === "ar"
    ? "تأشيرة، إقامة، فيزا ذهبية، تأسيس شركة، سفر، الكون العالمية، دبي، اسطنبول"
    : "visa services, golden visa, residency programs, company formation, travel, ALKOWN Global, Dubai, Istanbul";

  const finalTitle    = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalDesc     = description || defaultDesc;
  const finalKeywords = keywords    || defaultKeywords;
  const finalImage    = ogImage     || DEFAULT_OG;
  const finalUrl      = canonical   ? `${SITE_URL}${canonical}` : SITE_URL;

  // ── Title ──
  document.title = finalTitle;

  // ── Helper ──
  const setMeta = (selector, attrStr, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      const eqIdx  = attrStr.indexOf("=");
      const aName  = attrStr.slice(0, eqIdx);
      const aValue = attrStr.slice(eqIdx + 1).replace(/"/g, "");
      el.setAttribute(aName, aValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const setLink = (rel, href) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
    el.setAttribute("href", href);
  };

  // ── Standard meta ──
  setMeta('meta[name="description"]',  'name=description',  finalDesc);
  setMeta('meta[name="keywords"]',     'name=keywords',     finalKeywords);
  setMeta('meta[name="robots"]',       'name=robots',       "index, follow");
  setMeta('meta[name="language"]',     'name=language',     lang === "ar" ? "Arabic" : "English");

  // ── Open Graph ──
  setMeta('meta[property="og:title"]',       'property=og:title',       finalTitle);
  setMeta('meta[property="og:description"]', 'property=og:description', finalDesc);
  setMeta('meta[property="og:type"]',        'property=og:type',        "website");
  setMeta('meta[property="og:site_name"]',   'property=og:site_name',   SITE_NAME);
  setMeta('meta[property="og:locale"]',      'property=og:locale',      lang === "ar" ? "ar_AE" : "en_US");
  setMeta('meta[property="og:url"]',         'property=og:url',         finalUrl);
  setMeta('meta[property="og:image"]',       'property=og:image',       finalImage);
  setMeta('meta[property="og:image:width"]', 'property=og:image:width', "1200");
  setMeta('meta[property="og:image:height"]','property=og:image:height',"630");
  setMeta('meta[property="og:image:alt"]',   'property=og:image:alt',   finalTitle);

  // ── Twitter Card ──
  setMeta('meta[name="twitter:card"]',        'name=twitter:card',        "summary_large_image");
  setMeta('meta[name="twitter:title"]',       'name=twitter:title',       finalTitle);
  setMeta('meta[name="twitter:description"]', 'name=twitter:description', finalDesc);
  setMeta('meta[name="twitter:image"]',       'name=twitter:image',       finalImage);
  setMeta('meta[name="twitter:image:alt"]',   'name=twitter:image:alt',   finalTitle);

  // ── Canonical ──
  setLink("canonical", finalUrl);

  // ── HTML lang/dir ──
  document.documentElement.setAttribute("lang", lang === "ar" ? "ar" : "en");
  document.documentElement.setAttribute("dir",  lang === "ar" ? "rtl" : "ltr");
}

// ── Page-specific Structured Data helper ─────────────────────
export function setPageStructuredData(schemas) {
  const id = "alkown-structured-data";
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id   = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(Array.isArray(schemas) ? schemas : [schemas]);
}

// ── Structured Data (JSON-LD) — backward-compat alias ────────
export function setStructuredData(data) {
  setPageStructuredData(data);
}

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ALKOWN Global",
  "alternateName": "الكون العالمية",
  "url": "https://alkownglobal.com",
  "logo": "https://alkownglobal.com/logo.png",
  "contactPoint": [
    { "@type": "ContactPoint", "telephone": "+90-534-764-1249", "contactType": "customer service", "areaServed": "TR" },
    { "@type": "ContactPoint", "telephone": "+971-54-490-9522", "contactType": "customer service", "areaServed": "AE" },
    { "@type": "ContactPoint", "telephone": "+963-980-631-952", "contactType": "customer service", "areaServed": "SY" }
  ],
  "address": [
    { "@type": "PostalAddress", "addressLocality": "Dubai", "addressCountry": "AE" },
    { "@type": "PostalAddress", "addressLocality": "Istanbul", "addressCountry": "TR" },
    { "@type": "PostalAddress", "addressLocality": "Aleppo", "addressCountry": "SY" }
  ],
  "sameAs": ["https://instagram.com/alkownglobal", "https://facebook.com/alkownglobal"],
  "description": "Premium visa, residency, company formation, and travel services.",
  "serviceType": ["Visa Services", "Residency Programs", "Company Formation", "Travel Services"]
};

export function buildFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q?.en || f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a?.en || f.a }
    }))
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `https://alkownglobal.com${item.url}`
    }))
  };
}

// ── Page SEO Configs ──────────────────────────────────────────
export const PAGE_SEO = {
  home: {
    ar: { title: "الرئيسية", description: "الكون العالمية — خدمات التأشيرة والإقامة وتأسيس الشركات والسفر. خبراء معتمدون.", keywords: "الكون العالمية، تأشيرة، إقامة، سفر" },
    en: { title: "Home", description: "ALKOWN Global — Premium visa, residency & travel services.", keywords: "ALKOWN Global, visa, residency, travel" }
  },
  "visa-center": {
    ar: { title: "مركز التأشيرات", description: "تحقق من متطلبات تأشيرتك فوراً — أكثر من 195 دولة. سوري في الإمارات؟ نساعدك.", keywords: "فحص تأشيرة، متطلبات تأشيرة، مركز تأشيرات" },
    en: { title: "Visa Center", description: "Check visa requirements instantly for 195+ countries.", keywords: "visa checker, visa requirements, visa center" }
  },
  residency: {
    ar: { title: "برامج الإقامة والجنسية", description: "برامج الجنسية الثانية والإقامة بالاستثمار. البرتغال، اليونان، كندا وأكثر.", keywords: "جنسية ثانية، إقامة بالاستثمار، جواز سفر ثاني" },
    en: { title: "Residency Programs", description: "Second citizenship and residency by investment programs.", keywords: "residency by investment, second passport, golden visa" }
  },
  "company-formation": {
    ar: { title: "تأسيس الشركات", description: "تأسيس شركات في الإمارات وتركيا والخارج. خدمة كاملة من التسجيل حتى الترخيص.", keywords: "تأسيس شركة، تسجيل شركة، شركة في الإمارات" },
    en: { title: "Company Formation", description: "Company setup in UAE, Turkey and globally.", keywords: "company formation, business setup UAE, company registration" }
  },
  travel: {
    ar: { title: "السفر والسياحة", description: "خدمات سفر VIP — حجز تذاكر وفنادق وتنظيم رحلات فاخرة.", keywords: "سفر، سياحة، حجز تذاكر، فنادق" },
    en: { title: "Travel & Tourism", description: "VIP travel services — flights, hotels & luxury tours.", keywords: "travel, tourism, flight booking, luxury travel" }
  },
  knowledge: {
    ar: { title: "مركز المعرفة", description: "دليلك الشامل للتأشيرات والإقامة وتأسيس الشركات. مقالات وأدلة معتمدة.", keywords: "دليل تأشيرة، مقالات سفر، مركز معرفة" },
    en: { title: "Knowledge Center", description: "Complete guides for visas, residency & company formation.", keywords: "visa guide, travel tips, knowledge center" }
  },
  contact: {
    ar: { title: "تواصل معنا", description: "تواصل مع فريق الكون العالمية — دبي، اسطنبول، حلب. متاحون 24/7.", keywords: "تواصل، اتصال، دبي، اسطنبول" },
    en: { title: "Contact Us", description: "Contact ALKOWN Global — Dubai, Istanbul, Aleppo. Available 24/7.", keywords: "contact, ALKOWN, Dubai, Istanbul" }
  }
};
