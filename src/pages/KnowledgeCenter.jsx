// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Knowledge Center (Redesigned)
// 17 مقال غني + تصميم محسّن + إدارة من الداشبورد
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import { setSEOMeta, setStructuredData, buildBreadcrumbSchema } from "../services/seoService";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", goldDark: "#8a6010",
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g400: "#7a6b50", g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", darkMid: "#211608",
  red: "#e53935", green: "#2e7d32",
};

const CATEGORIES = {
  all:         { ar: "الكل",             en: "All",               icon: "🌐", color: "#7a6b50" },
  citizenship: { ar: "برامج الجنسية",    en: "Citizenship",       icon: "🌍", color: "#8a6010" },
  residency:   { ar: "برامج الإقامة",    en: "Residency",         icon: "🏡", color: "#1a6b3c" },
  visa:        { ar: "أدلة التأشيرة",   en: "Visa Guides",       icon: "🛂", color: "#1565c0" },
  company:     { ar: "تأسيس الشركات",   en: "Company Formation", icon: "🏢", color: "#6a1b9a" },
  travel:      { ar: "السفر والسياحة",   en: "Travel Guides",     icon: "✈️", color: "#c17900" },
};

// ── Rich content renderer ──────────────────────────────────────
function RichContent({ text, ar }) {
  if (!text) return null;
  const lines = text.split("\n").filter(Boolean);
  return (
    <div style={{ fontSize: ".85rem", lineHeight: 1.9, color: C.g600 }}>
      {lines.map((line, i) => {
        if (line.startsWith("##")) return (
          <div key={i} style={{ fontWeight: 800, color: C.g800, fontSize: ".9rem", marginTop: 14, marginBottom: 6, borderBottom: `1px solid rgba(201,168,76,.15)`, paddingBottom: 4 }}>
            {line.replace(/^##\s*/, "")}
          </div>
        );
        if (line.startsWith("•") || line.startsWith("-")) return (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" }}>
            <span style={{ color: C.gold, flexShrink: 0, fontWeight: 800, marginTop: 1 }}>✓</span>
            <span>{line.replace(/^[•\-]\s*/, "")}</span>
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
            <span style={{ color: C.green, flexShrink: 0, fontWeight: 800 }}>💰</span>
            <span>{line.replace(/^\$\s*/, "")}</span>
          </div>
        );
        return <p key={i} style={{ marginBottom: 8 }}>{line}</p>;
      })}
    </div>
  );
}

// ── DEFAULT ARTICLES — 17 مقال غني ───────────────────────────
const DEFAULT_ARTICLES = [
  // ═══════════════════════════════════════════════
  // CITIZENSHIP PROGRAMS
  // ═══════════════════════════════════════════════
  {
    id: "cit-dominica", category: "citizenship", featured: true, date: "2025-06-01", readTime: 8,
    titleAr: "جنسية دومينيكا بالاستثمار — الدليل الكامل 2025",
    titleEn: "Dominica Citizenship by Investment — Complete Guide 2025",
    excerptAr: "أسرع وأوفر برنامج جنسية في العالم. 140 دولة بدون تأشيرة، لا يشترط الإقامة، وجواز سفر كاريبي معترف به دولياً.",
    excerptEn: "The world's fastest and most affordable citizenship program. 140 visa-free countries, no residency required, and an internationally recognized Caribbean passport.",
    contentAr: `## نظرة عامة على برنامج دومينيكا
دومينيكا تقدّم أحد أفضل برامج الجنسية بالاستثمار في العالم منذ عام 1993، وتُعد الخيار الأوفر في منطقة الكاريبي.

## مزايا الجنسية الدومينيكية
• دخول بدون تأشيرة لـ 140 دولة بما فيها دول الشنغن الأوروبية والصين
• لا يشترط الإقامة أو الزيارة قبل أو بعد الحصول على الجنسية
• الجنسية مدى الحياة وقابلة للتوريث للأجيال القادمة
• ازدواجية الجنسية مسموحة بالكامل
• إجراءات سرية — لا تشارك المعلومات مع أي حكومة أخرى
• الجواز صالح لـ 5 سنوات ويمكن تجديده

## شروط الأهلية
• عمر 18 عاماً أو أكثر
• سجل جنائي نظيف وخالٍ من أي مخالفات
• تقديم إثبات قانوني لمصدر الأموال
• إمكانية إضافة الأبناء المعالين تحت سن 30
• إمكانية إضافة الوالدين فوق سن 65

## خيارات الاستثمار
→ المساهمة في صندوق التنمية الاقتصادية: 200,000 دولار (متقدم منفرد)
→ الاستثمار العقاري المعتمد: 200,000 دولار لمدة 3 سنوات

## التكاليف الإجمالية التقريبية
$ 200,000 دولار للاستثمار الأساسي
$ رسوم الحكومة والإدارة: تبدأ من 50,000 دولار
$ إجمالي تقريبي لمتقدم فردي: من 100,000 دولار عبر خيار التبرع

## مدة الحصول على الجنسية
من 6 إلى 9 أشهر من تاريخ تقديم الطلب المكتمل`,
    contentEn: `## Overview
Dominica has offered one of the world's best citizenship by investment programs since 1993, and remains the most affordable option in the Caribbean.

## Key Benefits
• Visa-free access to 140 countries including Schengen Europe and China
• No residency or visit required before or after obtaining citizenship
• Lifetime citizenship, inheritable by future generations
• Dual citizenship fully allowed
• Full confidentiality — information not shared with other governments
• Passport valid for 5 years, renewable

## Eligibility Requirements
• Age 18 or above
• Clean criminal record
• Legal proof of source of funds
• Dependent children under 30 can be included
• Dependent parents over 65 can be included

## Investment Options
→ Economic Diversification Fund contribution: $200,000 (single applicant)
→ Approved real estate investment: $200,000 for 3 years

## Approximate Total Costs
$ $200,000 base investment
$ Government & admin fees: from $50,000
$ Approximate total (single applicant via donation): from $100,000

## Processing Time
6 to 9 months from complete application submission`,
  },
  {
    id: "cit-saint-lucia", category: "citizenship", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "جنسية سانت لوسيا — تشمل المملكة المتحدة و140 دولة",
    titleEn: "Saint Lucia Citizenship — Includes UK & 140 Countries",
    excerptAr: "جواز سفر كاريبي يتيح دخول 140 دولة بلا تأشيرة، بما فيها الشنغن والمملكة المتحدة. الأسرة حتى سن 31.",
    excerptEn: "Caribbean passport granting visa-free access to 140 countries including Schengen and UK. Family up to age 31.",
    contentAr: `## برنامج جنسية سانت لوسيا
برنامج موثوق يتميز بإمكانية إضافة الأبناء حتى سن 31 عاماً — الأوسع في الكاريبي.

## المزايا الرئيسية
• دخول بدون تأشيرة لـ 140 دولة بما فيها الشنغن والمملكة المتحدة
• الأبناء المعالون مشمولون حتى سن 31 (الأوسع في المنطقة)
• الوالدان المعالون من عمر 55 فأكثر مشمولون
• الأشقاء غير المتزوجين تحت 18 مشمولون
• ازدواجية الجنسية مسموحة
• لا يشترط الإقامة

## شروط الأهلية
• عمر 18 عاماً على الأقل
• سجل جنائي نظيف
• إثبات مصدر الأموال
• اجتياز فحص التدقيق الأمني الإلزامي

## خيارات الاستثمار
→ صندوق الاقتصاد الوطني: 240,000 دولار (متقدم فردي)
→ استثمار عقاري معتمد: 300,000 دولار
→ سندات حكومية: 300,000 دولار
→ مشاريع تجارية معتمدة: 3,500,000 دولار

## مدة المعالجة
من 12 إلى 18 شهراً`,
    contentEn: `## Saint Lucia Citizenship Program
A reliable program notable for allowing inclusion of children up to age 31 — the widest in the Caribbean.

## Key Benefits
• Visa-free access to 140 countries including Schengen and UK
• Dependent children included up to age 31 (widest in the region)
• Dependent parents aged 55+ included
• Unmarried siblings under 18 included
• Dual citizenship allowed
• No residency requirement

## Investment Options
→ National Economic Fund: $240,000 (single applicant)
→ Approved real estate: $300,000
→ Government bonds: $300,000
→ Approved enterprise projects: $3,500,000

## Processing Time
12 to 18 months`,
  },
  {
    id: "cit-grenada", category: "citizenship", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "جنسية غرينادا — ميزة تأشيرة الاستثمار الأمريكية E-2",
    titleEn: "Grenada Citizenship — US E-2 Investor Visa Advantage",
    excerptAr: "الدولة الكاريبية الوحيدة التي تتيح تأشيرة E-2 مع الولايات المتحدة. 143 دولة بدون تأشيرة.",
    excerptEn: "The only Caribbean country with a US E-2 investor visa treaty. 143 visa-free countries.",
    contentAr: `## ما يميّز جنسية غرينادا
غرينادا هي الدولة الكاريبية الوحيدة التي أبرمت معاهدة تأشيرة الاستثمار E-2 مع الولايات المتحدة، مما يتيح لحاملي جوازها التقدم لتأشيرة E-2 والعيش والاستثمار في أمريكا.

## المزايا الرئيسية
• السفر بدون تأشيرة لـ 143 دولة بما فيها الشنغن والمملكة المتحدة
• المسار الوحيد للوصول إلى تأشيرة E-2 الأمريكية للجنسيات غير المؤهلة
• توريث الجنسية للأطفال حديثي الولادة
• ازدواجية الجنسية مسموحة
• إمكانية كفالة الأشقاء في نفس الطلب
• لا ضرائب على غير المقيمين

## خيارات الاستثمار
→ صندوق التنمية الوطنية: 235,000 دولار (متقدم فردي)
→ استثمار عقاري معتمد: 270,000 دولار

## مدة المعالجة
من 6 إلى 9 أشهر`,
    contentEn: `## What Makes Grenada Unique
Grenada is the ONLY Caribbean country with a US E-2 investor visa treaty, allowing passport holders to apply for E-2 visa and live/invest in America.

## Key Benefits
• Visa-free to 143 countries including Schengen and UK
• Only Caribbean path to US E-2 visa for ineligible nationalities
• Citizenship inherited by newborn children
• Dual citizenship allowed
• Siblings can be included in same application
• No taxes for non-residents

## Investment Options
→ National Development Fund: $235,000 (single applicant)
→ Approved real estate: $270,000

## Processing Time
6 to 9 months`,
  },
  {
    id: "cit-turkey", category: "citizenship", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "الجنسية التركية بالاستثمار العقاري — قوة اقتصاد G20",
    titleEn: "Turkish Citizenship by Real Estate — G20 Economic Power",
    excerptAr: "جواز سفر تركي لـ 111 دولة بما فيها هونغ كونغ واليابان. الاستثمار من 400,000 دولار فقط.",
    excerptEn: "Turkish passport for 111 countries including Hong Kong and Japan. Investment from just $400,000.",
    contentAr: `## برنامج الجنسية التركية
تركيا عضو في مجموعة G20 واقتصادها من أقوى اقتصادات العالم. جوازها يمنح دخولاً لـ 111 دولة.

## المزايا الرئيسية
• جواز سفر لـ 111 دولة بما فيها هونغ كونغ واليابان وسنغافورة
• اقتصاد قوي ومتنامٍ — الـ 17 في العالم
• استثمار عقاري يحتفظ بقيمته في سوق مزدهر
• ازدواجية الجنسية مسموحة
• الأسرة الكاملة مشمولة

## خطوات الحصول على الجنسية
→ تجميع وترجمة وتوثيق المستندات المطلوبة
→ تقديم المستندات للحصول على الموافقة المبدئية
→ إجراء الاستثمار العقاري (400,000 دولار+)
→ الموافقة النهائية وزيارة تركيا لأداء قسم الولاء
→ استلام جواز السفر التركي

## التكاليف
$ الاستثمار العقاري: 400,000 دولار كحد أدنى
$ رسوم حكومية وإدارية إضافية

## مدة المعالجة
من 6 إلى 9 أشهر`,
    contentEn: `## Turkish Citizenship Program
Turkey is a G20 member with one of the world's strongest economies. Its passport grants access to 111 countries.

## Key Benefits
• Passport for 111 countries including Hong Kong, Japan & Singapore
• Strong growing economy — 17th in the world
• Real estate investment in a thriving market
• Dual citizenship allowed
• Full family coverage

## Steps to Citizenship
→ Collect, translate and notarize required documents
→ Submit for preliminary government approval
→ Complete real estate investment ($400K+)
→ Final approval + visit Turkey for oath of allegiance
→ Receive Turkish passport

## Costs
$ Real estate investment: minimum $400,000
$ Additional government and admin fees

## Processing Time
6 to 9 months`,
  },
  {
    id: "cit-stkitts", category: "citizenship", featured: false, date: "2025-06-01", readTime: 6,
    titleAr: "سانت كيتس ونيفيس — أقدم برنامج جنسية في العالم (1984)",
    titleEn: "St. Kitts & Nevis — World's Oldest CBI Program Since 1984",
    excerptAr: "أكثر من 40 عاماً من الموثوقية. 157 دولة بدون تأشيرة بما فيها الشنغن والمملكة المتحدة.",
    excerptEn: "Over 40 years of reliability. 157 visa-free countries including Schengen and UK.",
    contentAr: `## أقدم برنامج في العالم
أُطلق عام 1984 ولا يزال من أقوى برامج الجنسية بالاستثمار، ويُعد معياراً للموثوقية والجودة.

## المزايا الرئيسية
• 157 دولة بدون تأشيرة — الأكثر في الكاريبي
• يشمل الشنغن الأوروبية والمملكة المتحدة وكندا
• ازدواجية الجنسية مسموحة
• لا يشترط الإقامة
• الأسرة مشمولة

## خطوات التقديم
→ استشارة مجانية مع مستشار معتمد
→ تقديم المستندات ودفع الرسوم لبدء المعالجة
→ عند الموافقة المبدئية: سداد مبلغ الاستثمار
→ الحصول على شهادة التسجيل والمواطنة
→ استلام جواز السفر

## خيارات الاستثمار
→ صندوق التنمية المستدامة: 250,000 دولار
→ استثمار عقاري معتمد: 325,000 دولار

## مدة المعالجة
من 6 إلى 9 أشهر`,
    contentEn: `## World's Oldest Program
Launched in 1984, still one of the strongest CBI programs — the gold standard for reliability.

## Key Benefits
• 157 visa-free countries — most in the Caribbean
• Includes Schengen Europe, UK & Canada
• Dual citizenship allowed
• No residency requirement
• Full family coverage

## Application Steps
→ Free consultation with authorized advisor
→ Submit documents and pay fees to begin processing
→ Upon preliminary approval: pay investment amount
→ Receive Registration Certificate and citizenship
→ Receive passport

## Investment Options
→ Sustainable Development Fund: $250,000
→ Approved real estate: $325,000

## Processing Time
6 to 9 months`,
  },
  {
    id: "cit-malta", category: "citizenship", featured: true, date: "2025-06-01", readTime: 10,
    titleAr: "الجنسية المالطية — جواز الاتحاد الأوروبي الأقوى في العالم",
    titleEn: "Malta Citizenship — World's Most Powerful EU Passport",
    excerptAr: "190 دولة بدون تأشيرة. حق العيش والعمل في أي دولة أوروبية. ثلاث مراحل واضحة.",
    excerptEn: "190 visa-free countries. Right to live and work anywhere in the EU. Three clear phases.",
    contentAr: `## جنسية مالطا — البوابة إلى أوروبا
مالطا دولة في الاتحاد الأوروبي، وجوازها يُصنَّف ضمن الأقوى عالمياً بدخول 190 دولة.

## المزايا الاستثنائية
• جواز سفر الاتحاد الأوروبي — دخول 190 دولة
• حق العيش والعمل والدراسة في أي دولة بالاتحاد الأوروبي
• حق التصويت في انتخابات الاتحاد الأوروبي
• الأسرة مشمولة بنفس الطلب
• ازدواجية الجنسية مسموحة
• حماية قانونية أوروبية كاملة

## المراحل الثلاث للحصول على الجنسية

## المرحلة الأولى: الإقامة
• يُمنح تصريح الإقامة خلال 1-3 أسابيع
• يجب الاحتفاظ بالإقامة 12 أو 36 شهراً
• يشترط قضاء وقت فعلي في مالطا

## المرحلة الثانية: الأهلية
• تقديم طلب الأهلية بعد إصدار بطاقة الإقامة
• صدور خطاب الأهلية خلال 120-150 يوماً

## المرحلة الثالثة: الجنسية
• تقديم طلب الجنسية بعد 12 أو 36 شهراً
• أداء قسم الولاء
• إصدار شهادة التجنيس

## التكاليف
$ استثمار أساسي: 600,000 يورو (لمدة 12 شهر) أو 750,000 يورو (لمدة 36 شهر)
$ إيجار أو شراء عقار في مالطا
$ تبرع لصندوق التنمية المالطي

## مدة المعالجة
من 12 إلى 36 شهراً`,
    contentEn: `## Malta Citizenship — Gateway to Europe
Malta is an EU member state, and its passport ranks among the world's most powerful with access to 190 countries.

## Exceptional Benefits
• EU passport — access to 190 countries
• Right to live, work and study in any EU country
• Voting rights in EU elections
• Full family coverage in same application
• Dual citizenship allowed
• Full European legal protection

## The Three Phases

## Phase 1: Residency
• Residence permit issued within 1-3 weeks
• Must maintain residency for 12 or 36 months
• Actual physical presence in Malta required

## Phase 2: Eligibility
• Eligibility application submitted after residence card
• Eligibility letter issued within 120-150 days

## Phase 3: Citizenship
• Citizenship application after 12 or 36 months
• Take oath of allegiance
• Receive certificate of naturalization

## Costs
$ Base investment: €600,000 (12-month route) or €750,000 (36-month)
$ Rent or purchase property in Malta
$ Donation to the Malta Development Fund

## Processing Time
12 to 36 months`,
  },

  // ═══════════════════════════════════════════════
  // RESIDENCY PROGRAMS
  // ═══════════════════════════════════════════════
  {
    id: "res-portugal-golden", category: "residency", featured: true, date: "2025-06-01", readTime: 10,
    titleAr: "الفيزا الذهبية البرتغالية — الدليل الشامل 2025",
    titleEn: "Portugal Golden Visa — Complete Guide 2025",
    excerptAr: "7 أيام في السنة تكفي. استثمار 500,000 يورو يفتح لك أبواب الجنسية الأوروبية بعد 5 سنوات.",
    excerptEn: "Only 7 days per year required. €500,000 investment opens the door to European citizenship after 5 years.",
    contentAr: `## الفيزا الذهبية البرتغالية
من أشهر برامج الإقامة بالاستثمار في أوروبا. تتيح الحصول على إقامة أوروبية بأقل متطلبات حضور ممكنة.

## لماذا البرتغال؟
• مناخ معتدل ومشمس طوال العام
• تكاليف معيشة معقولة مقارنة بباقي أوروبا
• نظام صحي وتعليمي متطور
• لغة سهلة التعلم وشعب ودود
• بوابة للسفر الحر في منطقة الشنغن

## المزايا الرئيسية
• العيش والعمل والدراسة داخل البرتغال
• دخول بدون تأشيرة لجميع دول الشنغن
• الجنسية البرتغالية بعد 5 سنوات — جواز يصل لـ 191 دولة
• يكفي 7 أيام سنوياً — لا إقامة دائمة مطلوبة
• نظام ضريبي ITS مميز للأجانب

## أفراد الأسرة المشمولون
• الزوج أو الزوجة
• الأبناء تحت 18 عاماً
• الأطفال المعالون تحت 26 (طلاب بدوام كامل غير متزوجين)
• الوالدان 65 عاماً فأكثر

## خيارات الاستثمار
→ صندوق استثماري مؤهل: 500,000 يورو (الأكثر شيوعاً)
→ تأسيس شركة + 10 وظائف: 500,000 يورو
→ تبرع للتراث الوطني: 250,000 يورو
→ بحث وتطوير: 500,000 يورو

## التكاليف التفصيلية
$ الاستثمار الأساسي: 500,000 يورو
$ رسوم تقديم الطلب: 605 يورو لكل فرد
$ رسوم بطاقة تصريح الإقامة: 6,045 يورو لكل فرد
$ عادةً يمكن استرداد رأس المال خلال 6-10 سنوات

## مدة الحصول على الإقامة
من 12 إلى 18 شهراً`,
    contentEn: `## Portugal Golden Visa
One of Europe's most popular investment residency programs. Offers European residency with the minimum physical presence requirements possible.

## Why Portugal?
• Temperate sunny climate year-round
• Reasonable cost of living vs rest of Europe
• Advanced healthcare and education system
• Welcoming people, easy language to learn
• Gateway to free travel across the Schengen area

## Key Benefits
• Live, work and study in Portugal
• Visa-free access to all Schengen countries
• Portuguese citizenship after 5 years — passport reaches 191 countries
• Only 7 days/year required — no permanent stay needed
• ITS favorable tax system for foreigners

## Family Coverage
• Spouse
• Children under 18
• Dependent children under 26 (full-time students, unmarried)
• Parents aged 65+

## Investment Options
→ Qualified investment fund: €500,000 (most popular)
→ Company setup + 10 jobs: €500,000
→ National heritage donation: €250,000
→ R&D investment: €500,000

## Detailed Costs
$ Base investment: €500,000
$ Application fee: €605 per person
$ Residence card fee: €6,045 per person
$ Capital usually recoverable within 6-10 years

## Timeline
12 to 18 months`,
  },
  {
    id: "res-portugal-d7", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "تأشيرة البرتغال D7 — للدخل السلبي والمتقاعدين",
    titleEn: "Portugal D7 Visa — For Passive Income & Retirees",
    excerptAr: "دخل شهري 1,000 يورو يكفي للحصول على إقامة برتغالية. مسار للجنسية بعد 5 سنوات.",
    excerptEn: "Monthly income of €1,000 is enough to get Portuguese residency. Path to citizenship after 5 years.",
    contentAr: `## تأشيرة D7 البرتغالية
مصممة لمن يمتلكون دخلاً ثابتاً من الخارج — معاشات تقاعدية، إيجارات، أرباح استثمارية، أو أي دخل سلبي.

## المزايا
• العيش في البرتغال بدخل قادم من الخارج
• لم الشمل للزوج والأبناء والوالدين
• رعاية صحية عامة مجانية وتعليم عالٍ مرموق
• إقامة دائمة بعد 5 سنوات
• برنامج ضريبي ITS محفّز (ضرائب منخفضة على الدخل الأجنبي)
• جواز برتغالي يصل لـ 191 دولة بعد 5 سنوات

## الشروط
• دخل شهري ثابت لا يقل عن 1,000 يورو من مصادر سلبية
• استئجار أو امتلاك سكن في البرتغال
• تأمين صحي ساري المفعول
• سجل جنائي نظيف
• من غير مواطني الاتحاد الأوروبي

## مصادر الدخل المقبولة
→ معاشات التقاعد
→ دخل الإيجارات العقارية
→ أرباح الاستثمارات والأسهم
→ حقوق الملكية الفكرية

## مدة الحصول على التأشيرة
من 2 إلى 3 أشهر`,
    contentEn: `## Portugal D7 Visa
Designed for those with stable foreign income — retirement pensions, rental income, investment dividends, or any passive income.

## Benefits
• Live in Portugal on income from abroad
• Family reunification for spouse, children, and parents
• Free public healthcare and prestigious higher education
• Permanent residency after 5 years
• ITS tax incentive (low taxes on foreign income)
• Portuguese passport to 191 countries after 5 years

## Requirements
• Stable monthly income of at least €1,000 from passive sources
• Rent or own housing in Portugal
• Valid health insurance
• Clean criminal record
• Non-EU citizen

## Accepted Income Sources
→ Retirement pensions
→ Real estate rental income
→ Investment and dividend income
→ Intellectual property rights

## Timeline
2 to 3 months`,
  },
  {
    id: "res-portugal-d8", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "تأشيرة البرتغال D8 — للعمل عن بُعد والرحّالة الرقميين",
    titleEn: "Portugal D8 — Digital Nomad & Remote Work Visa",
    excerptAr: "أُطلقت 2022. دخل 3,480 يورو/شهر يفتح لك باب العيش في البرتغال مع الحفاظ على وظيفتك عن بُعد.",
    excerptEn: "Launched 2022. €3,480/month income unlocks living in Portugal while keeping your remote job.",
    contentAr: `## تأشيرة الرحّل الرقميين D8
أُطلقت في أكتوبر 2022 لتمكين العاملين عن بُعد من العيش في البرتغال أثناء العمل لصالح جهات خارجها.

## مزاياها
• تصريح إقامة سنتين قابل للتجديد
• الجنسية البرتغالية بعد 5 سنوات
• جواز سفر يصل لـ 191 دولة
• نظام ضريبي Beckham Law — ضريبة ثابتة 24%
• حرية التنقل في منطقة الشنغن
• جودة حياة عالية وتكلفة معيشة مناسبة

## شروط الأهلية
• عمر 18 أو أكثر، من غير مواطني الاتحاد الأوروبي
• العمل عن بُعد كموظف أو مستقل
• دخل شهري لا يقل عن 3,480 يورو
• استئجار أو امتلاك سكن في البرتغال
• تأمين صحي ساري

## أفراد الأسرة المشمولون
• الزوج / الزوجة
• الأطفال تحت 18
• الأطفال فوق 18 (طلاب غير متزوجين)
• والدا المتقدم أو الزوج/ة

## مدة الحصول على التأشيرة
6 أشهر تقريباً`,
    contentEn: `## D8 Digital Nomad Visa
Launched October 2022 to enable remote workers to live in Portugal while working for entities outside the country.

## Benefits
• 2-year renewable residence permit
• Portuguese citizenship after 5 years
• Passport reaching 191 countries
• Beckham Law tax system — flat 24% tax
• Freedom of movement across Schengen area
• High quality of life, reasonable cost of living

## Eligibility
• Age 18+, non-EU citizen
• Work remotely as employee or freelancer
• Monthly income of at least €3,480
• Rent or own housing in Portugal
• Valid health insurance

## Family Coverage
• Spouse
• Children under 18
• Children 18+ (unmarried, full-time students)
• Parents of applicant or spouse

## Timeline
Approximately 6 months`,
  },
  {
    id: "res-portugal-d2", category: "residency", featured: false, date: "2025-06-01", readTime: 6,
    titleAr: "تأشيرة البرتغال D2 — لرواد الأعمال وأصحاب الشركات",
    titleEn: "Portugal D2 Visa — For Entrepreneurs & Business Owners",
    excerptAr: "أسّس شركتك في البرتغال واحصل على إقامة أوروبية. لا يوجد حد أدنى ثابت للاستثمار.",
    excerptEn: "Set up your company in Portugal and get European residency. No fixed minimum investment.",
    contentAr: `## تأشيرة D2 لرواد الأعمال
مخصصة لمن يريدون تأسيس أو إدارة نشاط تجاري في البرتغال مع الحصول على إقامة أوروبية.

## مسارات التقديم
→ شراء شركة برتغالية قائمة أو حصة منها
→ تقديم خطة عمل لمشروع جديد
→ إنشاء فرع لشركتك الأجنبية في البرتغال

## المزايا
• إقامة أوروبية للأعمال والأسرة
• الجنسية بعد 5 سنوات — 191 دولة
• حرية التنقل في الشنغن
• بيئة أعمال أوروبية تنافسية
• لا يوجد حد أدنى إلزامي للاستثمار

## الشروط
• عمر 18+ من خارج الاتحاد الأوروبي
• سجل جنائي نظيف
• شركة قائمة أو خطة عمل مفصّلة
• إثبات توفر أموال كافية لسنة واحدة
• استئجار أو امتلاك سكن في البرتغال
• تأمين صحي

## التأشيرة والإقامة
• التأشيرة الأولية: 4 أشهر (للتقديم على تصريح الإقامة)
• تصريح الإقامة: سنتان قابل للتجديد لـ 3 سنوات

## مدة الحصول على التأشيرة
من 2 إلى 3 أشهر`,
    contentEn: `## D2 Entrepreneur Visa
For those wanting to set up or manage a business in Portugal while obtaining European residency.

## Application Paths
→ Purchase an existing Portuguese company or share
→ Submit a detailed business plan for a new project
→ Open a branch of your existing foreign company in Portugal

## Benefits
• European residency for business and family
• Citizenship after 5 years — 191 countries
• Schengen freedom of movement
• Competitive European business environment
• No fixed minimum investment required

## Requirements
• Age 18+ from outside the EU
• Clean criminal record
• Existing company or detailed business plan
• Proof of sufficient funds for one year
• Rent or own housing in Portugal
• Valid health insurance

## Visa & Residency
• Initial visa: 4 months (to apply for residence permit)
• Residence permit: 2 years, renewable for 3 years

## Timeline
2 to 3 months`,
  },
  {
    id: "res-spain-golden", category: "residency", featured: false, date: "2025-06-01", readTime: 8,
    titleAr: "الفيزا الذهبية الإسبانية — جواز المرتبة الثالثة عالمياً",
    titleEn: "Spain Golden Visa — World's 3rd Strongest Passport",
    excerptAr: "500,000 يورو استثمار عقاري، لا يشترط الإقامة، وجواز إسباني يفتح 190+ دولة.",
    excerptEn: "€500,000 real estate investment, no residency required, Spanish passport opens 190+ countries.",
    contentAr: `## الفيزا الذهبية الإسبانية
أطلقتها إسبانيا عام 2013 لجذب الاستثمار الأجنبي. تعطيك إقامة بدون شرط الإقامة الفعلية وجواز سفر من أقوى الجوازات عالمياً.

## المزايا
• العيش والعمل والدراسة في إسبانيا
• جواز سفر إسباني — المرتبة الثالثة عالمياً (190+ دولة)
• استثمار عقاري مربح بعوائد إيجارية مجزية
• حرية التنقل في منطقة الشنغن
• لا يشترط الإقامة الفعلية الدائمة
• إقامة دائمة بعد 5 سنوات (بشرط 6 أشهر/سنة)
• الجنسية الإسبانية بعد 10 سنوات

## أفراد الأسرة
• الزوج / الزوجة
• الأبناء تحت 18
• الوالدان المعالون

## شروط الأهلية
• عمر 18+ خارج الاتحاد الأوروبي
• سجل جنائي نظيف (5 سنوات الماضية)
• لا رفض تأشيرة في دول الاتحاد الأوروبي
• إثبات موارد مالية كافية
• تأمين صحي شامل

## خيارات الاستثمار
→ عقار سكني أو تجاري: 500,000 يورو
→ أوراق مالية إسبانية: 1,000,000 يورو
→ ودائع بنكية: 1,000,000 يورو

## مدة المعالجة
من 2 إلى 3 أشهر`,
    contentEn: `## Spain Golden Visa
Launched in 2013 to attract foreign investment. Offers residency without mandatory physical presence and one of the world's strongest passports.

## Benefits
• Live, work and study in Spain
• Spanish passport — ranked 3rd globally (190+ countries)
• Profitable real estate with rental income
• Schengen freedom of movement
• No mandatory permanent residency
• Permanent residency after 5 years (6 months/year required)
• Spanish citizenship after 10 years

## Family Coverage
• Spouse
• Children under 18
• Dependent parents

## Eligibility
• Age 18+, non-EU citizen
• Clean criminal record (past 5 years)
• No EU visa refusal
• Proof of sufficient funds
• Comprehensive health insurance

## Investment Options
→ Residential or commercial property: €500,000
→ Spanish securities: €1,000,000
→ Bank deposits: €1,000,000

## Timeline
2 to 3 months`,
  },
  {
    id: "res-spain-nomad", category: "residency", featured: false, date: "2025-06-01", readTime: 6,
    titleAr: "تأشيرة نوماد إسبانيا — للعمل عن بُعد من الشمس والبحر",
    titleEn: "Spain Digital Nomad Visa — Work Remotely Under the Sun",
    excerptAr: "أُطلقت 2023. دخل 2,520 يورو/شهر + ضريبة ثابتة 24%. إسبانيا تستقطب أصحاب الأعمال الرقمية.",
    excerptEn: "Launched 2023. €2,520/month income + flat 24% tax. Spain attracting digital business owners.",
    contentAr: `## تأشيرة نوماد إسبانيا
أطلقتها إسبانيا عام 2023 لجذب الكفاءات الرقمية والموظفين عن بُعد من خارج الاتحاد الأوروبي.

## المزايا
• الإقامة في إسبانيا مع الحفاظ على عملك عن بُعد
• قابل للتجديد حتى 5 سنوات
• ضريبة ثابتة 24% (Beckham Law) — أفضل من الضريبة العادية
• حرية التنقل في الشنغن
• جودة حياة عالية جداً — شمس، بحر، ثقافة
• الجنسية الإسبانية بعد 10 سنوات

## شروط الأهلية
• عمر 18+ خارج الاتحاد الأوروبي
• سجل جنائي نظيف (5 سنوات أخيرة)
• عمل عن بُعد لصالح شركة خارج إسبانيا
• دخل شهري لا يقل عن 2,520 يورو للفرد
→ +945 يورو للزوج/الزوجة
→ +315 يورو لكل طفل
• عقد عمل أو إثبات نشاط مهني
• تأمين صحي معتمد في إسبانيا

## مدة الإقامة
• فيزا أولية: سنة واحدة
• إقامة مباشرة داخل إسبانيا: 3 سنوات
• التجديد حتى 5 سنوات`,
    contentEn: `## Spain Digital Nomad Visa
Launched in 2023 to attract digital talent and remote workers from outside the EU.

## Benefits
• Live in Spain while keeping your remote job
• Renewable up to 5 years
• Flat 24% tax (Beckham Law) — better than standard rates
• Schengen freedom of movement
• Very high quality of life — sun, sea, culture
• Spanish citizenship after 10 years

## Eligibility
• Age 18+, non-EU citizen
• Clean criminal record (last 5 years)
• Remote work for a company outside Spain
• Monthly income at least €2,520 for individual
→ +€945 for spouse
→ +€315 per child
• Employment contract or proof of professional activity
• Spain-approved health insurance

## Residency Duration
• Initial visa: 1 year
• Direct residency inside Spain: 3 years
• Renewable up to 5 years`,
  },
  {
    id: "res-greece-golden", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "الفيزا الذهبية اليونانية — أقل تكلفة في أوروبا",
    titleEn: "Greece Golden Visa — Lowest Cost in Europe",
    excerptAr: "250,000 يورو فقط للحصول على إقامة أوروبية. لا يشترط الإقامة. حرية الشنغن.",
    excerptEn: "Just €250,000 for European residency. No residency required. Schengen freedom.",
    contentAr: `## الفيزا الذهبية اليونانية
أقل حد استثمار في أوروبا للحصول على إقامة أوروبية رسمية مع حرية التنقل في منطقة الشنغن.

## المزايا
• أقل حد استثماري في أوروبا بأسره
• لا يشترط الإقامة الفعلية في اليونان
• حرية التنقل في 27 دولة شنغن
• الأسرة مشمولة
• عقار يحتفظ بقيمته في سوق مزدهر
• مسار للجنسية اليونانية بعد 7 سنوات

## التكاليف التفصيلية
$ الاستثمار العقاري: 250,000 يورو
$ ضرائب ورسوم قانونية: ~6.4% من قيمة العقار (~16,000 يورو)
$ رسوم الفيزا الذهبية: 2,000 يورو لكل متقدم
$ رسوم فحص خلفية العقار: 250 يورو
$ اتفاقية عقد الشراء: 1,000 يورو
$ رسوم تقديم الطلب السكني: 300 يورو لكل متقدم

## مدة المعالجة
من 2 إلى 4 أشهر`,
    contentEn: `## Greece Golden Visa
Europe's lowest investment threshold for official European residency with Schengen freedom of movement.

## Benefits
• Lowest investment threshold in all of Europe
• No physical residency in Greece required
• Freedom of movement in 27 Schengen countries
• Full family coverage
• Property retains value in a booming market
• Path to Greek citizenship after 7 years

## Detailed Costs
$ Real estate investment: €250,000
$ Taxes and legal fees: ~6.4% of property value (~€16,000)
$ Golden Visa fee: €2,000 per applicant
$ Property background check fee: €250
$ Purchase agreement: €1,000
$ Residential application fee: €300 per applicant

## Timeline
2 to 4 months`,
  },
  {
    id: "res-uae-golden", category: "residency", featured: true, date: "2025-06-01", readTime: 8,
    titleAr: "الإقامة الذهبية الإماراتية — 10 سنوات بدون كفيل",
    titleEn: "UAE Golden Residency — 10 Years, No Sponsor Needed",
    excerptAr: "إقامة ذاتية الكفالة لـ 10 سنوات. تأسيس شركات بملكية 100%. الأكثر طلباً في المنطقة العربية.",
    excerptEn: "Self-sponsored 10-year residency. 100% company ownership. Most sought-after in the Arab world.",
    contentAr: `## الإقامة الذهبية الإماراتية
الأكثر طلباً في العالم العربي. تمنحك إقامة طويلة الأمد بدون حاجة لكفيل في أقوى اقتصادات المنطقة.

## فئات المتأهلين للإقامة 10 سنوات
→ المستثمرون في الاستثمار العام: 2 مليون درهم في صندوق معتمد
→ المستثمرون برأس مال لا يقل عن 2 مليون درهم
→ مدفوعات حكومية سنوية لا تقل عن 250,000 درهم

## فئات المتأهلين للإقامة 5 سنوات
→ المستثمرون في العقارات: ملكية عقار بـ 2 مليون درهم
→ رواد الأعمال: مشروع تقني بـ 500,000 درهم مع موافقة حاضنة

## ذوو المهارات المتخصصة
• الأطباء والعلماء والمخترعين
• الفنانون والمديرون التنفيذيون
• حاملو الدكتوراه والمهندسون
• المتخصصون في الذكاء الاصطناعي والتكنولوجيا

## المزايا
• إقامة ذاتية الكفالة — لا تحتاج لصاحب عمل أو كفيل
• تأسيس شركات بملكية 100%
• فتح حسابات بنكية مميزة
• الأسرة كاملة مشمولة
• مناخ الأعمال الأفضل في المنطقة

## مدة المعالجة
بضعة أسابيع فقط`,
    contentEn: `## UAE Golden Residency
Most sought-after in the Arab world. Grants long-term residency without a sponsor in the region's strongest economy.

## 10-Year Residency Categories
→ Public investment: AED 2M in approved investment fund
→ Capital investors: minimum AED 2M capital
→ Annual government payments of at least AED 250,000

## 5-Year Residency Categories
→ Real estate investors: property ownership of AED 2M
→ Entrepreneurs: tech project of AED 500K with incubator approval

## Specialized Talent
• Doctors, scientists, inventors
• Artists and senior executives
• PhD holders and engineers
• AI and technology specialists

## Benefits
• Self-sponsored residency — no employer or sponsor needed
• 100% company ownership
• Premium banking access
• Full family coverage
• Best business environment in the region

## Processing Time
Just a few weeks`,
  },
  {
    id: "res-usa-eb3", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "البطاقة الخضراء الأمريكية EB-3 — الإقامة الدائمة بالتوظيف",
    titleEn: "US Green Card EB-3 — Permanent Residency via Employment",
    excerptAr: "الطريق للإقامة الدائمة في أمريكا عبر عرض عمل. يشمل الأسرة المباشرة.",
    excerptEn: "Path to permanent US residency through a job offer. Includes immediate family.",
    contentAr: `## برنامج EB-3 للبطاقة الخضراء
يتيح للعمال المهرة والمهنيين الحصول على الإقامة الدائمة الأمريكية عبر عرض عمل من صاحب عمل أمريكي.

## المزايا
• البطاقة الخضراء الأمريكية الدائمة
• حق العيش والعمل بحرية في الولايات المتحدة
• الجنسية الأمريكية بعد 5 سنوات
• الزوج والأبناء تحت 21 مشمولون

## خطوات الحصول على البطاقة الخضراء
→ الاستشارة الأولية: تقييم المؤهلات وتحديد المسار
→ تأمين عرض عمل دائم بدوام كامل من صاحب عمل أمريكي
→ تقديم شهادة العمل (Labor Certification) لوزارة العمل
→ تقديم طلب I-140 لدى USCIS
→ مقابلة السفارة أو القنصلية الأمريكية
→ الحصول على البطاقة الخضراء

## التكاليف
$ رسوم الخدمة ومتطلبات التوظيف: تبدأ من 45,000 دولار
$ رسوم حكومية إضافية

## مدة المعالجة
من 18 إلى 36 شهراً`,
    contentEn: `## EB-3 Green Card Program
Allows skilled workers and professionals to obtain permanent US residency through a job offer from a US employer.

## Benefits
• Permanent US Green Card
• Freedom to live and work anywhere in the US
• US citizenship after 5 years
• Spouse and children under 21 included

## Steps to Get the Green Card
→ Initial consultation: assess qualifications and determine path
→ Secure a permanent full-time job offer from a US employer
→ Submit Labor Certification to the Department of Labor
→ File I-140 petition with USCIS
→ US Embassy or Consulate interview
→ Receive Green Card

## Costs
$ Service fees and employment requirements: from $45,000
$ Additional government fees

## Timeline
18 to 36 months`,
  },
  {
    id: "res-usa-eb5", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "برنامج EB-5 للمستثمرين — البطاقة الخضراء بالاستثمار",
    titleEn: "EB-5 Investor Program — US Green Card via Investment",
    excerptAr: "استثمر 800,000 - 1,050,000 دولار واحصل على الإقامة الدائمة الأمريكية. لا يشترط خبرة أو تعليم.",
    excerptEn: "Invest $800K–$1.05M and get permanent US residency. No experience or education required.",
    contentAr: `## برنامج المستثمر المهاجر EB-5
أُنشئ عام 1990 بواسطة الكونغرس الأمريكي. يمنح الإقامة الدائمة مقابل استثمار يوفر وظائف أمريكية.

## المزايا
• البطاقة الخضراء عبر الاستثمار — أسرع مسار
• حق العمل والاستثمار في أي قطاع أمريكي
• الجنسية الأمريكية بعد 5 سنوات
• لا يشترط خبرة عمل أو مستوى تعليمي أو لغة إنجليزية
• الأسرة المباشرة مشمولة

## خيارات الاستثمار
→ المنطقة المستهدفة (TEA) — مناطق ريفية أو بطالة مرتفعة: 800,000 دولار
→ المنطقة الاعتيادية: 1,050,000 دولار

## الشرط الأساسي
• يجب أن يوفر الاستثمار 10 وظائف دائمة بدوام كامل للعمال الأمريكيين

## شروط الأهلية
• سجل جنائي نظيف
• إثبات مصدر الأموال بطرق قانونية
• اختيار خيار الاستثمار المناسب

## مدة المعالجة
من 24 إلى 36 شهراً`,
    contentEn: `## EB-5 Immigrant Investor Program
Established by Congress in 1990. Grants permanent residency in exchange for an investment that creates American jobs.

## Benefits
• Green Card through investment — fastest route
• Right to work and invest in any US sector
• US citizenship after 5 years
• No work experience, education level, or English required
• Immediate family covered

## Investment Options
→ Targeted Employment Area (TEA) — rural or high unemployment: $800,000
→ Non-TEA area: $1,050,000

## Core Requirement
• Investment must create 10 permanent full-time jobs for US workers

## Eligibility
• Clean criminal record
• Legally proven source of funds
• Choose appropriate investment option

## Timeline
24 to 36 months`,
  },
  {
    id: "res-canada-startup", category: "residency", featured: false, date: "2025-06-01", readTime: 7,
    titleAr: "كندا — برنامج الشركات الناشئة للحصول على الإقامة الدائمة",
    titleEn: "Canada — Startup Visa Program for Permanent Residency",
    excerptAr: "ابنِ شركتك المبتكرة في كندا واحصل على الإقامة الدائمة. جواز سفر كندي لـ 146 دولة.",
    excerptEn: "Build your innovative startup in Canada and get permanent residency. Canadian passport for 146 countries.",
    contentAr: `## برنامج تأشيرة الشركات الناشئة — كندا
فرصة فريدة لرواد الأعمال الدوليين لتأسيس أعمال مبتكرة والحصول على الإقامة الدائمة الكندية.

## مزايا الجنسية الكندية
• جواز سفر كندي — واحد من أقوى جوازات العالم
• سفر بدون تأشيرة لـ 146 دولة
• حق العيش والعمل والدراسة في كندا بحرية تامة
• رعاية صحية وتعليم مجاني عالي الجودة
• بيئة آمنة ومستقرة مع سياسات هجرة شفافة
• المشاركة في الانتخابات والحياة المدنية
• إمكانية شمل الأسرة كاملاً

## الشروط الأساسية
• مشروع عمل مبتكر معتمد من حاضنة أو مسرّع أعمال كندية معتمد
• أو دعم من صندوق رأس مال مخاطر معتمد
• إثبات مهارات كافية في اللغة الإنجليزية أو الفرنسية
• توفر رأس مال كافٍ للعيش في كندا

## مسار الجنسية
• الإقامة كمقيم دائم لـ 3 سنوات خلال 5 سنوات
→ ثم التقديم للجنسية الكندية

## مدة المعالجة
من 12 إلى 31 شهراً`,
    contentEn: `## Canada Startup Visa Program
A unique opportunity for international entrepreneurs to launch innovative businesses and obtain Canadian permanent residency.

## Canadian Citizenship Benefits
• Canadian passport — one of the world's most powerful
• Visa-free travel to 146 countries
• Freedom to live, work and study anywhere in Canada
• Free high-quality healthcare and education
• Safe, stable environment with transparent immigration policies
• Voting rights and full civic participation
• Full family inclusion possible

## Core Requirements
• Innovative business project approved by a designated Canadian incubator or accelerator
• Or support from a designated venture capital fund
• Sufficient English or French language skills
• Enough capital to live in Canada

## Citizenship Pathway
• Permanent residency for 3 years within 5 years
→ Then apply for Canadian citizenship

## Timeline
12 to 31 months`,
  },

  // ═══════════════════════════════════════════════
  // VISA GUIDES
  // ═══════════════════════════════════════════════
  {
    id: "visa-schengen", category: "visa", featured: false, date: "2025-01-10", readTime: 8,
    titleAr: "دليل تأشيرة شنغن للمواطنين العرب — كل ما تحتاج معرفته",
    titleEn: "Schengen Visa Guide for Arab Citizens — Everything You Need",
    excerptAr: "تأشيرة واحدة لـ 27 دولة أوروبية. الوثائق المطلوبة، نصائح القبول، وأفضل الدول للتقديم.",
    excerptEn: "One visa for 27 European countries. Required documents, approval tips, and best countries to apply.",
    contentAr: `## تأشيرة شنغن — البوابة لأوروبا
تتيح السفر لـ 27 دولة أوروبية بتأشيرة واحدة، وتُعدّ من أكثر التأشيرات طلباً عالمياً.

## المستندات المطلوبة
• جواز سفر ساري (6 أشهر على الأقل بعد تاريخ العودة)
• صورة شخصية حديثة بخلفية بيضاء
• نموذج الطلب موقّع ومكتمل
• حجز طيران مؤكد (ذهاباً وإياباً)
• حجز فندق طوال مدة الإقامة
• تأمين سفر يغطي 30,000 يورو على الأقل
• كشف حساب بنكي (آخر 3-6 أشهر)
• إثبات الوضع الوظيفي أو التجاري

## نصائح لزيادة فرص القبول
→ قدّم من خلال الدولة التي ستقضي فيها معظم الوقت
→ احرص على أن يكون رصيدك البنكي كافياً (500+ يورو لكل أسبوع)
→ لا تحجز تذاكر باهظة قبل الحصول على التأشيرة
→ اعمل على بناء سجل سفر إيجابي تدريجياً

## مدة صلاحية التأشيرة
• تأشيرة قصيرة: 90 يوماً خلال 180 يوماً
• قابلة للتجديد والحصول على متعددة المدخل`,
    contentEn: `## Schengen Visa — Gateway to Europe
Allows travel to 27 European countries with a single visa, one of the world's most sought-after visas.

## Required Documents
• Valid passport (6+ months after return date)
• Recent photo (white background)
• Completed and signed application form
• Confirmed flight booking (return)
• Hotel reservation for entire stay
• Travel insurance covering at least €30,000
• Bank statement (last 3-6 months)
• Proof of employment or business

## Tips to Increase Approval Chances
→ Apply through the country where you'll spend most time
→ Ensure sufficient bank balance (€500+ per week)
→ Don't book expensive flights before getting the visa
→ Build a positive travel history gradually

## Visa Validity
• Short-stay visa: 90 days within 180 days
• Can be renewed and upgraded to multiple-entry`,
  },
  {
    id: "company-uae", category: "company", featured: false, date: "2025-01-14", readTime: 9,
    titleAr: "تأسيس شركة في الإمارات — الدليل الكامل خطوة بخطوة",
    titleEn: "Setting Up a Company in UAE — Complete Step-by-Step Guide",
    excerptAr: "المناطق الحرة أم البر الرئيسي؟ أنواع الشركات، التراخيص، والتكاليف في دبي والإمارات.",
    excerptEn: "Free Zone vs Mainland? Company types, licenses, and costs in Dubai and UAE.",
    contentAr: `## تأسيس شركة في الإمارات
تُعدّ الإمارات من أفضل بيئات الأعمال في العالم. اختر النوع المناسب لنشاطك.

## أنواع الشركات
→ شركة البر الرئيسي (Mainland): تعمل في كل الإمارات، تحتاج شريك محلي أو وكيل
→ المنطقة الحرة (Free Zone): ملكية أجنبية 100%، لكن محدودة بالمنطقة
→ الشركة الخارجية (Offshore): للأعمال الدولية فقط

## الخطوات الأساسية
• تحديد نوع النشاط التجاري
• اختيار الاسم التجاري والتحقق من توافره
• الحصول على الترخيص التجاري المناسب
• إيجاد مكتب أو مساحة عمل مرخصة
• فتح حساب بنكي تجاري
• تسجيل الشركة لدى الجهات المختصة

## تكاليف التأسيس التقريبية
$ منطقة حرة صغيرة: من 15,000 إلى 30,000 درهم
$ بر رئيسي: من 20,000 إلى 50,000 درهم
$ رسوم الترخيص السنوية إضافية

## مزايا الإمارات للأعمال
• لا ضريبة دخل شخصية
• ضريبة الشركات 9% فقط (للأرباح فوق 375,000 درهم)
• بنية تحتية عالمية متكاملة
• موقع استراتيجي بين الشرق والغرب`,
    contentEn: `## Setting Up a Company in UAE
UAE is one of the world's best business environments. Choose the right type for your activity.

## Company Types
→ Mainland Company: operates across UAE, requires local partner or agent
→ Free Zone Company: 100% foreign ownership, limited to the zone
→ Offshore Company: for international business only

## Core Steps
• Define business activity
• Choose trade name and verify availability
• Obtain appropriate business license
• Find licensed office or workspace
• Open corporate bank account
• Register company with relevant authorities

## Approximate Setup Costs
$ Small free zone: AED 15,000 to 30,000
$ Mainland: AED 20,000 to 50,000
$ Annual license renewal fees additional

## UAE Business Advantages
• No personal income tax
• Corporate tax only 9% (profits above AED 375,000)
• World-class integrated infrastructure
• Strategic location between East and West`,
  },
  // ═══════════════════════════════════════════════════════════
  // COMPANY FORMATION — ALKOWN REAL SERVICES (11 articles)
  // ═══════════════════════════════════════════════════════════
  {
    id: "company-dubai-trader", category: "company", featured: true, date: "2026-06-01", readTime: 8,
    titleAr: "رخصة تاجر دبي — الدليل الكامل 2026",
    titleEn: "Dubai Trader License — Complete Guide 2026",
    excerptAr: "رخصة تجارية رسمية من دائرة الاقتصاد والسياحة بدبي مع حساب بنكي تجاري. الخيار الأمثل للتجار وأصحاب المشاريع الصغيرة.",
    excerptEn: "Official trade license from Dubai's Department of Economy and Tourism with a business bank account. The ideal choice for traders and small business owners.",
    contentAr: "## ما هي رخصة تاجر دبي؟\nرخصة تاجر دبي (DED Trader) مبادرة من دائرة الاقتصاد والسياحة بدبي، تتيح للأفراد ممارسة أنشطتهم التجارية بشكل رسمي ومرخّص.\n\n## ما يميز هذه الرخصة\n• رخصة تجارية معتمدة من جهة حكومية رسمية\n• لا تحتاج لاستئجار مكتب فعلي — عنوان السكن يكفي\n• مناسبة للبيع عبر إنستغرام وتيك توك وسلة وجميع المنصات\n• تُمكّنك من فتح حساب بنكي تجاري مستقل\n• تجديد سنوي بتكلفة منخفضة جداً\n• صالحة للمواطنين والمقيمين في الإمارات\n\n## من يحتاجها؟\n→ أصحاب المتاجر الإلكترونية والبيع عبر السوشيال ميديا\n→ التجار والموزعون الراغبون في العمل بشكل نظامي\n→ أصحاب المشاريع الصغيرة والمتوسطة\n→ أي شخص يريد فتح حساب بنكي باسم نشاطه التجاري\n\n## الشروط الأساسية\n• المتقدم مقيم قانونياً داخل الإمارات (مواطن أو مقيم)\n• عمر 21 عاماً أو أكثر\n• عنوان سكن فعلي داخل الإمارة (عقد إيجار أو فاتورة)\n• لا يوجد سجل جنائي\n\n## المستندات المطلوبة\n• صورة جواز السفر (ساري)\n• صورة الإقامة أو الهوية الإماراتية\n• إثبات عنوان السكن (عقد إيجار أو فاتورة خدمات)\n• صورة شخصية حديثة بخلفية بيضاء\n\n## تكلفة الرخصة\n$ رسوم الرخصة السنوية: حوالي 1,070 درهم\n$ فتح الحساب البنكي: يشمله عرض الكون\n\n## مدة الإصدار\n• من يوم إلى 3 أيام عمل بعد اكتمال المستندات\n• الرخصة تصدر رقمياً عبر البريد الإلكتروني\n\n## لماذا تختار الكون؟\n→ نرافقك من أول خطوة حتى استلام الرخصة والحساب البنكي\n→ بدون رسوم خفية — نخبرك بالتكلفة الكاملة مسبقاً\n→ خدمة عملاء متاحة 24/7\n→ خبرة تأسيس 2,000+ شركة ونشاط تجاري",
    contentEn: "## What is the Dubai Trader License?\nThe Dubai Trader License (DED Trader) is an initiative by Dubai's Department of Economy and Tourism allowing individuals to operate their business activities officially and legally.\n\n## Key Advantages\n• Official government-issued trade license\n• No need to rent a physical office — home address is sufficient\n• Suitable for selling on Instagram, TikTok, Salla, and all platforms\n• Enables opening a separate business bank account\n• Low annual renewal cost\n• Available for UAE citizens and residents\n\n## Who Needs It?\n→ E-commerce store owners and social media sellers\n→ Traders and distributors wanting to operate legally\n→ Small and medium business owners\n→ Anyone wanting a business bank account under their trade name\n\n## Basic Requirements\n• Applicant is a legal UAE resident (citizen or resident)\n• Age 21 or above\n• Actual residential address in the emirate (lease or utility bill)\n• No criminal record\n\n## Required Documents\n• Passport copy (valid)\n• Residency permit or Emirates ID copy\n• Proof of residential address\n• Recent personal photo (white background)\n\n## License Cost\n$ Annual license fees: approximately AED 1,070\n$ Bank account opening: included in Alkown package\n\n## Processing Time\n• 1 to 3 working days after document submission\n• License issued digitally via email\n\n## Why Choose Alkown?\n→ We guide you from the first step to receiving your license and bank account\n→ No hidden fees — full cost disclosed upfront\n→ 24/7 customer service\n→ Experience setting up 2,000+ companies and businesses",
  },
  {
    id: "company-uae-freelance", category: "company", featured: false, date: "2026-06-01", readTime: 9,
    titleAr: "رخصة المهن الحرة في الإمارات — رخصة + إقامة + تأمين صحي",
    titleEn: "UAE Freelance License — License + Visa + Health Insurance",
    excerptAr: "الحل المتكامل للمستقلين والمحترفين في الإمارات. رخصة مهنية معتمدة مع إقامة مستثمر وتأمين صحي شامل.",
    excerptEn: "The complete solution for UAE freelancers and professionals. Certified professional license with investor residency and comprehensive health insurance.",
    contentAr: "## رخصة المهن الحرة في الإمارات\nرخصة المهن الحرة تُصدر من مناطق حرة متعددة في الإمارات وتتيح للمستقلين العمل بشكل قانوني مع إمكانية الحصول على إقامة مستثمر وتأمين صحي.\n\n## لماذا هي الأفضل للمستقلين؟\n• تعمل باسمك الشخصي بدون الحاجة لتأسيس شركة كاملة\n• الرخصة والإقامة معاً في باقة واحدة متكاملة\n• تأمين صحي شامل مدرج في الباقة\n• العمل مع عملاء داخل الإمارات وخارجها\n• مناسبة للمصممين، المسوقين، المبرمجين، المستشارين وغيرهم\n\n## التخصصات المتاحة\n→ التصميم الجرافيكي وإنتاج المحتوى\n→ البرمجة وتطوير المواقع والتطبيقات\n→ التسويق الرقمي وإدارة وسائل التواصل\n→ الاستشارات القانونية والمالية والتجارية\n→ التعليم والتدريب والتصوير\n→ وأكثر من 100 تخصص آخر\n\n## ما تشمله الباقة مع الكون\n• رخصة المهن الحرة المعتمدة\n• إقامة المستثمر صالحة سنتين قابلة للتجديد\n• تأمين صحي شامل معتمد\n• العمل في جميع أنحاء الإمارات السبع\n\n## التكاليف التقريبية\n$ باقة الرخصة + الإقامة + التأمين: تبدأ من 7,500 درهم\n$ السعر الدقيق حسب المنطقة الحرة المختارة والتخصص\n$ تواصل معنا للحصول على عرض سعر مفصّل\n\n## مدة الإصدار\n• من 5 إلى 7 أيام عمل بعد اكتمال المستندات\n\n## مقارنة بخيارات أخرى\n→ أقل تكلفة من تأسيس شركة كاملة في المنطقة الحرة\n→ أسرع في الإصدار\n→ مناسبة لمن يعمل وحده أو مع فريق صغير",
    contentEn: "## UAE Freelance License\nThe Freelance Permit is issued by multiple UAE free zones, allowing freelancers to work legally with the option to obtain investor residency and health insurance.\n\n## Why Is It Best for Freelancers?\n• Work under your personal name without setting up a full company\n• License and residency together in one integrated package\n• Comprehensive health insurance included\n• Work with clients inside and outside the UAE\n• Suitable for designers, marketers, programmers, consultants, and more\n\n## Available Specializations\n→ Graphic design and content production\n→ Programming, web and app development\n→ Digital marketing and social media management\n→ Legal, financial, and business consulting\n→ Education, training, and photography\n→ And 100+ other specializations\n\n## What Alkown Package Includes\n• Certified freelance professional license\n• Investor residency valid for 2 years, renewable\n• Comprehensive approved health insurance\n• Work across all seven emirates\n\n## Approximate Costs\n$ License + residency + insurance: starting from AED 7,500\n$ Exact price depends on chosen free zone and specialization\n$ Contact us for a detailed price quote\n\n## Processing Time\n• 5 to 7 working days after complete documents\n\n## Comparison with Other Options\n→ Lower cost than setting up a full free zone company\n→ Faster to issue\n→ Suitable for solo workers or small teams",
  },
  {
    id: "company-uae-freezone", category: "company", featured: true, date: "2026-06-01", readTime: 10,
    titleAr: "تأسيس شركة في المناطق الحرة بالإمارات — الدليل الكامل 2026",
    titleEn: "UAE Free Zone Company Setup — Complete Guide 2026",
    excerptAr: "ملكية أجنبية 100% بدون شريك محلي. إعفاء ضريبي كامل للشركات المؤهلة. أكثر من 40 منطقة حرة تناسب جميع الأنشطة.",
    excerptEn: "100% foreign ownership with no local partner. Full tax exemption for qualifying companies. 40+ free zones for all business activities.",
    contentAr: "## المناطق الحرة في الإمارات\nتضم الإمارات أكثر من 40 منطقة حرة متخصصة. كل منطقة تخدم قطاعاً بعينه وتوفر مزايا ضريبية استثنائية.\n\n## أبرز المناطق الحرة\n→ IFZA دبي: الأشهر لمرونتها وتكلفتها المنخفضة\n→ مثلث دبي للسيليكون (DSO): للتقنية والبرمجيات\n→ مدينة دبي للإعلام: للإعلام والتسويق\n→ منطقة جبل علي الحرة (JAFZA): للتجارة واللوجستيات\n→ مركز أبوظبي للأعمال (ADGM): للخدمات المالية\n\n## لماذا المنطقة الحرة؟\n• ملكية أجنبية 100% بدون شريك إماراتي\n• لا ضريبة على الدخل الشخصي\n• لا ضريبة على الأرباح (للشركات المؤهلة)\n• تحويل الأرباح والرأس المال بحرية تامة\n• إعفاء من الرسوم الجمركية\n• سهولة استقدام الموظفين وإصدار تأشيراتهم\n\n## التكاليف التقريبية لعام 2026\n$ منطقة حرة صغيرة (مثل IFZA): من 15,000 إلى 20,000 درهم سنوياً\n$ مناطق حرة متوسطة: من 20,000 إلى 35,000 درهم\n$ مناطق حرة كبرى: من 35,000 درهم فأكثر\n$ التكلفة تشمل: رخصة تجارية + عنوان مسجل + تأشيرة مدير\n\n## الخطوات الأساسية\n→ اختيار المنطقة الحرة الأنسب لنشاطك\n→ الاختيار بين حزم Office أو Flexi Desk\n→ حجز الاسم التجاري والحصول على الموافقة\n→ تقديم المستندات وإيداعها\n→ إصدار الرخصة التجارية\n→ فتح الحساب البنكي التجاري\n→ استخراج تأشيرات المدير والموظفين\n\n## ضريبة الشركات\n• شركات المناطق الحرة المؤهلة: معفاة بالكامل (0%)\n• يشترط عدم التعامل المباشر مع السوق الإماراتي المحلي\n\n## مدة التأسيس\n• من 3 إلى 7 أيام عمل بعد اكتمال المستندات",
    contentEn: "## UAE Free Zones\nThe UAE has more than 40 specialized free zones. Each zone serves a specific sector and provides exceptional tax advantages.\n\n## Top Free Zones\n→ IFZA Dubai: Most popular for flexibility and low cost\n→ Dubai Silicon Oasis (DSO): For technology and software\n→ Dubai Media City: For media, marketing, and advertising\n→ Jebel Ali Free Zone (JAFZA): For trading and logistics\n→ Abu Dhabi Global Market (ADGM): For financial and professional services\n\n## Why Free Zone?\n• 100% foreign ownership — no UAE partner needed\n• No personal income tax\n• No profit tax (for qualifying companies)\n• Free repatriation of profits and capital\n• Import/export duty exemptions\n• Easy staff recruitment and visa issuance\n\n## Approximate 2026 Costs\n$ Small free zone (e.g., IFZA): AED 15,000–20,000 per year\n$ Mid-size free zones: AED 20,000–35,000\n$ Major free zones: AED 35,000+\n$ Cost includes: trade license + registered address + manager visa\n\n## Key Steps\n→ Choose the right free zone for your activity\n→ Choose between Office or Flexi Desk packages\n→ Reserve trade name and get approval\n→ Submit documents to the relevant authority\n→ Receive trade license\n→ Open business bank account\n→ Issue manager and employee visas\n\n## Corporate Tax\n• Qualifying free zone companies: fully exempt (0%)\n• Condition: no direct dealings with UAE domestic market\n\n## Processing Time\n• 3 to 7 working days after complete documents",
  },
  {
    id: "company-uae-mainland", category: "company", featured: false, date: "2026-06-01", readTime: 10,
    titleAr: "تأسيس شركة في البر الرئيسي (Mainland) بالإمارات 2026",
    titleEn: "UAE Mainland Company Formation 2026 — Full Guide",
    excerptAr: "العمل في كل الإمارات بلا قيود. ملكية أجنبية 100% في معظم القطاعات. التعاقد مع الحكومة والقطاع الخاص.",
    excerptEn: "Operate across all UAE without restrictions. 100% foreign ownership in most sectors. Contract with government and private sector.",
    contentAr: "## ما هي شركة البر الرئيسي؟\nشركة البر الرئيسي (Mainland) مرخصة من دائرة التنمية الاقتصادية وتتميز بقدرتها على العمل في أي مكان داخل الإمارات دون قيود جغرافية.\n\n## أبرز مزايا البر الرئيسي\n• العمل والتعاقد مع الجهات الحكومية والخاصة في كل الإمارات\n• ملكية أجنبية 100% في معظم القطاعات التجارية (تغيير 2021)\n• إصدار تأشيرات عمل غير محدودة نسبياً\n• عقود حكومية وتأهل للمناقصات الكبرى\n\n## القطاعات المفتوحة للملكية 100%\n• التجارة العامة والتجزئة\n• الاستيراد والتصدير\n• الخدمات الاستشارية والمهنية\n• التقنية والبرمجيات\n• العقارات والمقاولات\n• الصناعة والتصنيع\n• المطاعم والضيافة والسياحة\n\n## أنواع التراخيص\n→ الرخصة التجارية: للبيع والشراء والتجارة العامة\n→ الرخصة المهنية: للخدمات والاستشارات\n→ الرخصة الصناعية: للتصنيع والإنتاج\n→ الرخصة السياحية: للسياحة والضيافة\n\n## الخطوات الأساسية\n→ تحديد نوع الرخصة والنشاط التجاري\n→ حجز الاسم التجاري عبر DED\n→ تقديم المستندات والحصول على الموافقة المبدئية\n→ توقيع عقد المقر (مكتب)\n→ دفع الرسوم وإصدار الرخصة\n→ التسجيل في هيئة الضرائب وغرفة التجارة\n→ فتح الحساب البنكي\n\n## التكاليف\n$ رسوم الرخصة التجارية: تبدأ من 10,000 درهم تقريباً\n$ إيجار المكتب: من 15,000 درهم سنوياً\n$ الإجمالي: من 25,000 إلى 50,000+ درهم\n$ السعر الدقيق يحدد بعد دراسة النشاط التجاري\n\n## ضريبة الشركات\n• الأرباح تحت 375,000 درهم: معفاة (0%)\n• الأرباح فوق 375,000 درهم: 9% فقط\n\n## مدة التأسيس\n• من 7 إلى 14 يوم عمل عادةً",
    contentEn: "## What is a Mainland Company?\nA Mainland company is licensed by the Department of Economic Development and can operate anywhere in the UAE without geographical restrictions.\n\n## Key Advantages of Mainland\n• Contract with government and private entities across all UAE\n• 100% foreign ownership in most commercial sectors (2021 change)\n• Relatively unlimited work visa issuance\n• Government contracts and eligibility for major tenders\n\n## Sectors Open to 100% Ownership\n• General trading and retail\n• Import and export\n• Consulting and professional services\n• Technology and software\n• Real estate and contracting\n• Industry and manufacturing\n• Restaurants, hospitality, and tourism\n\n## License Types\n→ Commercial License: for buying, selling, and general trading\n→ Professional License: for services and consulting\n→ Industrial License: for manufacturing and production\n→ Tourism License: for tourism and hospitality\n\n## Key Steps\n→ Define license type and business activity precisely\n→ Reserve trade name via DED\n→ Submit documents and get initial approval\n→ Sign office lease agreement\n→ Pay fees and receive license\n→ Register with tax authority and Chamber of Commerce\n→ Open bank account\n\n## Costs\n$ Trade license fees: starting from approximately AED 10,000\n$ Office rent: from AED 15,000 per year\n$ Total: AED 25,000 to 50,000+\n$ Exact price determined after business activity review\n\n## Corporate Tax\n• Profits below AED 375,000: exempt (0%)\n• Profits above AED 375,000: only 9%\n\n## Processing Time\n• 7 to 14 working days typically",
  },
  {
    id: "company-qatar", category: "company", featured: false, date: "2026-06-01", readTime: 9,
    titleAr: "تأسيس شركة في قطر — الدليل الشامل 2026",
    titleEn: "Company Formation in Qatar — Complete Guide 2026",
    excerptAr: "قطر سوق خليجي واعد بعد كأس العالم. إمكانية الملكية الأجنبية في مناطق متعددة. بنية تحتية عالمية متكاملة.",
    excerptEn: "Qatar is a promising Gulf market post-World Cup. Foreign ownership possible in multiple areas. World-class integrated infrastructure.",
    contentAr: "## لماذا تؤسس شركتك في قطر؟\nقطر واحدة من أثرى دول العالم قياساً بالدخل الفردي، وتشهد نمواً اقتصادياً متسارعاً مدفوعاً باستثمارات رؤية قطر الوطنية 2030.\n\n## أنواع الشركات في قطر\n→ شركة ذات مسؤولية محدودة (WLL): الأكثر شيوعاً\n→ فرع شركة أجنبية: لتوسيع نشاط قائم\n→ المنطقة الحرة بقطر (QFZ): ملكية 100% للأجانب\n→ منطقة قطر للعلوم والتكنولوجيا (QSTP): ملكية 100%\n\n## الملكية الأجنبية في قطر\n• في معظم القطاعات: مطلوب شريك قطري بنسبة 51%\n• في المناطق الحرة: ملكية أجنبية 100%\n• الكون يحدد لك الخيار الأنسب بعد دراسة نشاطك\n\n## الخطوات الأساسية\n→ حجز الاسم التجاري والتحقق من توافره\n→ تقديم طلب التأسيس لوزارة التجارة والصناعة\n→ توثيق عقد التأسيس لدى وزارة العدل\n→ القيد في السجل التجاري الرسمي\n→ النشر في جريدة أعمالي الرسمية\n→ الانتساب لغرفة تجارة وصناعة قطر\n→ التسجيل في هيئة الزكاة والضريبة والجمارك\n→ فتح الحساب البنكي التجاري\n\n## الرسوم التقريبية\n$ رسوم وزارة التجارة: من 1,500 إلى 3,000 ريال\n$ رسوم التوثيق: 500 ريال تقريباً\n$ رسوم غرفة التجارة: من 1,000 إلى 2,000 ريال\n\n## البيئة الضريبية\n• ضريبة الشركات: 10% على الأرباح\n• لا ضريبة على الدخل الشخصي\n• لا ضريبة على القيمة المضافة (VAT)\n• إعفاءات للشركات في المناطق الحرة\n\n## مدة التأسيس\n• من 2 إلى 4 أسابيع بعد اكتمال المستندات",
    contentEn: "## Why Set Up in Qatar?\nQatar is one of the world's wealthiest countries per capita, experiencing rapid economic growth driven by Qatar National Vision 2030 investments.\n\n## Company Types in Qatar\n→ With Limited Liability (WLL): Most common\n→ Branch of Foreign Company: To expand existing activities\n→ Qatar Free Zone Company (QFZ): 100% foreign ownership\n→ Qatar Science & Technology Park (QSTP): 100% ownership\n\n## Foreign Ownership in Qatar\n• Most sectors: 51% Qatari partner required\n• Free zones: 100% foreign ownership\n• Alkown identifies the best option after reviewing your activity\n\n## Key Steps\n→ Reserve trade name and verify availability\n→ Submit incorporation application to Ministry of Commerce\n→ Notarize articles of association at Ministry of Justice\n→ Register in the Commercial Registry\n→ Publish in official Aamal newspaper\n→ Join Qatar Chamber of Commerce\n→ Register with Zakat, Tax and Customs Authority\n→ Open business bank account\n\n## Approximate Fees\n$ Ministry of Commerce fees: QAR 1,500–3,000\n$ Notarization: approx. QAR 500\n$ Chamber fees: QAR 1,000–2,000\n\n## Tax Environment\n• Corporate tax: 10% on profits\n• No personal income tax\n• No VAT\n• Multiple exemptions in free zones\n\n## Processing Time\n• 2 to 4 weeks after complete documents",
  },
  {
    id: "company-saudi", category: "company", featured: true, date: "2026-06-01", readTime: 11,
    titleAr: "تأسيس شركة في المملكة العربية السعودية — ملكية أجنبية 100% (2026)",
    titleEn: "Company Formation in Saudi Arabia — 100% Foreign Ownership (2026)",
    excerptAr: "رؤية 2030 غيّرت قواعد الاستثمار. ملكية أجنبية كاملة في معظم القطاعات. أكبر اقتصاد في الشرق الأوسط.",
    excerptEn: "Vision 2030 changed the rules of investment. Full foreign ownership in most sectors. Largest economy in the Middle East.",
    contentAr: "## السعودية — وجهة استثمارية رائدة\nالمملكة العربية السعودية تمر بتحوّل اقتصادي تاريخي في إطار رؤية 2030. الاقتصاد السعودي هو الأكبر في منطقة الشرق الأوسط وشمال أفريقيا.\n\n## أبرز ما غيّرته رؤية 2030\n• ملكية أجنبية 100% في معظم القطاعات التجارية\n• نظام التسجيل في MISA استبدل نظام الترخيص القديم (فبراير 2025)\n• تبسيط إجراءات بدء الأعمال عبر منصة رقمية واحدة\n• إعفاءات ضريبية لمشاريع التقنية والصناعة والطاقة\n\n## القطاعات المفتوحة للملكية 100%\n→ الصناعة والتصنيع\n→ تقنية المعلومات والبرمجيات\n→ الخدمات المهنية والاستشارية\n→ اللوجستيات والتوزيع\n→ الرعاية الصحية والأدوية\n→ المقاولات والبناء\n→ الضيافة والسياحة والترفيه\n→ التعليم والتدريب\n→ الطاقة المتجددة\n\n## القطاعات المقيدة\n• استكشاف النفط والغاز الخام\n• خدمات الأمن الخاص\n• العقارات في مكة المكرمة والمدينة المنورة\n\n## الخطوات الأساسية 2026\n→ الخطوة 1: التسجيل في منصة MISA — الخطوة الإلزامية الأولى\n→ الخطوة 2: الحصول على موافقة MISA وتحديد الأنشطة المسموحة\n→ الخطوة 3: حجز الاسم التجاري عبر وزارة التجارة\n→ الخطوة 4: توثيق عقد التأسيس\n→ الخطوة 5: إيداع رأس المال (500,000 ريال للشركات العامة)\n→ الخطوة 6: استخراج السجل التجاري\n→ الخطوة 7: التسجيل في هيئة الزكاة والضريبة والجمارك\n→ الخطوة 8: التسجيل في التأمينات الاجتماعية (GOSI)\n→ الخطوة 9: الانتساب للغرفة التجارية\n\n## متطلبات رأس المال\n$ الشركات العامة (LLC): 500,000 ريال سعودي كحد أدنى\n$ شركات التجارة (100% أجنبية): 30 مليون ريال + 200 مليون تعهد خلال 5 سنوات\n$ باقي القطاعات: يتفاوت حسب النشاط\n\n## البيئة الضريبية\n• ضريبة الشركات: 20% للشركات الأجنبية\n• زكاة: 2.5% لحصة الشركاء السعوديين\n• لا ضريبة على الدخل الشخصي\n• ضريبة القيمة المضافة (VAT): 15%\n\n## نظام سعودة (نطاقات)\n• يلزم توظيف نسبة من السعوديين حسب حجم الشركة والقطاع\n• الكون يساعدك في تصميم هيكل الشركة للامتثال الأمثل\n\n## مدة التأسيس\n• من 2 إلى 5 أسابيع بعد استكمال MISA والمستندات",
    contentEn: "## Saudi Arabia — A Leading Investment Destination\nSaudi Arabia is undergoing a historic economic transformation under Vision 2030. The Saudi economy is the largest in the MENA region.\n\n## Key Changes from Vision 2030\n• 100% foreign ownership in most commercial sectors\n• MISA registration replaced old licensing system (February 2025)\n• Streamlined business setup through a single digital platform\n• Tax incentives for technology, industry, and energy projects\n\n## Sectors Open to 100% Foreign Ownership\n→ Industry and manufacturing\n→ Information technology and software\n→ Professional and consulting services\n→ Logistics and distribution\n→ Healthcare and pharmaceuticals\n→ Construction and contracting\n→ Hospitality, tourism, and entertainment\n→ Education and training\n→ Renewable energy\n\n## Restricted Sectors\n• Upstream oil and gas exploration\n• Private security services\n• Real estate in Mecca and Medina\n\n## Key Setup Steps 2026\n→ Step 1: Register on MISA platform — mandatory first step\n→ Step 2: Obtain MISA approval and define permitted activities\n→ Step 3: Reserve trade name via Ministry of Commerce\n→ Step 4: Notarize articles of association\n→ Step 5: Deposit capital (SAR 500,000 for general companies)\n→ Step 6: Obtain commercial registration\n→ Step 7: Register with Zakat, Tax and Customs Authority\n→ Step 8: Register with GOSI\n→ Step 9: Join Chamber of Commerce\n\n## Capital Requirements\n$ General companies (LLC): minimum SAR 500,000\n$ Retail/wholesale (100% foreign): SAR 30M + SAR 200M commitment over 5 years\n$ Other sectors: varies by activity\n\n## Tax Environment\n• Corporate tax: 20% for foreign companies\n• Zakat: 2.5% on Saudi partners share\n• No personal income tax\n• VAT: 15%\n\n## Saudization (Nitaqat)\n• Must hire Saudi nationals based on company size and sector\n• Alkown helps design your structure for optimal compliance\n\n## Processing Time\n• 2 to 5 weeks after completing MISA and documents",
  },
  {
    id: "company-oman", category: "company", featured: false, date: "2026-06-01", readTime: 9,
    titleAr: "تأسيس شركة في سلطنة عُمان — بيئة الأعمال المستقرة 2026",
    titleEn: "Company Formation in Oman — Stable Business Environment 2026",
    excerptAr: "ملكية أجنبية 100% في معظم القطاعات. لا ضريبة على الدخل الشخصي. تسجيل إلكتروني في 5-7 أيام.",
    excerptEn: "100% foreign ownership in most sectors. No personal income tax. Electronic registration in 5-7 days.",
    contentAr: "## لماذا سلطنة عُمان؟\nعُمان تتميز بالاستقرار السياسي والاقتصادي، وخففت من القيود المفروضة على الملكية الأجنبية بموجب المرسوم الملكي 50/2019.\n\n## المزايا الرئيسية\n• ملكية أجنبية 100% في معظم القطاعات التجارية\n• لا ضريبة على الدخل الشخصي\n• ضريبة شركات منخفضة: 15% (3% للمنشآت الصغيرة)\n• لا قيود على تحويل العملات أو إعادة الأرباح\n• تكاليف تأسيس منخفضة مقارنة بالخليج\n• تسجيل إلكتروني بدون الحاجة للحضور شخصياً\n\n## أنواع الشركات\n→ الشركة ذات المسؤولية المحدودة (LLC): الأنسب للمستثمرين الأجانب\n→ الشركة المساهمة: للمشاريع الكبيرة\n→ فرع شركة أجنبية: لتوسيع نشاط قائم\n→ المؤسسة الفردية: للأعمال الصغيرة\n\n## الخطوات الأساسية\n→ تحديد الاسم التجاري عبر وزارة التجارة\n→ تجهيز وتوثيق النظام الأساسي للشركة\n→ إيداع رأس المال في حساب بنكي مؤقت\n→ التسجيل عبر بوابة Invest Easy\n→ الحصول على السجل التجاري\n→ الانتساب لغرفة تجارة وصناعة عُمان\n→ الحصول على الرخصة والتصاريح\n→ فتح الحساب البنكي\n\n## متطلبات رأس المال\n$ شركة ذات مسؤولية محدودة محلية: 150 ريال عُماني (~400 دولار)\n$ شركة مختلطة (أجنبية ومحلية): 150,000 ريال عُماني\n$ شركة أجنبية 100%: من 150,000 ريال حسب القطاع\n\n## التكاليف التقريبية\n$ رسوم التسجيل: من 150 إلى 500 ريال\n$ رسوم الرخصة: من 250 إلى 3,000 ريال حسب النشاط\n$ السعر الإجمالي يحدد بعد دراسة النشاط والموافقات المطلوبة\n\n## أنشطة تحتاج موافقات خاصة\n• القطاع المالي: موافقة البنك المركزي العُماني\n• الرعاية الصحية: موافقة وزارة الصحة\n• التعليم: موافقة وزارة التعليم\n• المقاولات: تسجيل لدى هيئة المقاولين\n\n## مدة التأسيس\n• الإجمالي: من أسبوعين إلى 4 أسابيع",
    contentEn: "## Why Sultanate of Oman?\nOman is distinguished by political and economic stability, and significantly relaxed foreign ownership restrictions under Royal Decree 50/2019.\n\n## Key Advantages\n• 100% foreign ownership in most commercial sectors\n• No personal income tax\n• Low corporate tax: 15% (3% for small enterprises)\n• No restrictions on currency transfer or profit repatriation\n• Low setup costs compared to the Gulf\n• Electronic registration without physical presence\n\n## Company Types\n→ LLC: Best for foreign investors\n→ Joint Stock Company: For large projects\n→ Branch of Foreign Company: To expand existing activities\n→ Sole Proprietorship: For small businesses\n\n## Key Steps\n→ Choose trade name via Ministry of Commerce\n→ Prepare and notarize articles of association\n→ Deposit capital in a temporary bank account\n→ Register electronically via Invest Easy portal\n→ Obtain commercial registration\n→ Join Oman Chamber of Commerce\n→ Obtain trade license and activity permits\n→ Open business bank account\n\n## Capital Requirements\n$ Local LLC: OMR 150 (~$400)\n$ Mixed company: OMR 150,000\n$ 100% foreign company: from OMR 150,000 depending on sector\n\n## Approximate Costs\n$ Registration fees: OMR 150 to 500\n$ Trade license: OMR 250 to 3,000 depending on activity\n$ Total price determined after reviewing activity and required approvals\n\n## Activities Requiring Special Approvals\n• Financial sector: Central Bank of Oman approval\n• Healthcare: Ministry of Health approval\n• Education: Ministry of Education approval\n• Contracting: Contractors Authority registration\n\n## Processing Time\n• Total: 2 to 4 weeks",
  },
  {
    id: "company-egypt", category: "company", featured: false, date: "2026-06-01", readTime: 9,
    titleAr: "تأسيس شركة في مصر مع إقامة المستثمر — الدليل الكامل 2026",
    titleEn: "Company Formation in Egypt with Investor Residency — Full Guide 2026",
    excerptAr: "ملكية أجنبية 100% في مصر. الحصول على إقامة المستثمر مع الشركة. سوق 100+ مليون مستهلك بتكاليف تشغيل منخفضة.",
    excerptEn: "100% foreign ownership in Egypt. Get investor residency with company. 100M+ consumer market with low operating costs.",
    contentAr: "## مصر — بوابة أفريقيا والشرق الأوسط\nمصر هي أكثر دول المنطقة سكاناً بأكثر من 100 مليون نسمة، وتتميز بتكاليف تشغيل منخفضة مقارنة بالخليج.\n\n## لماذا تستثمر في مصر؟\n• أكبر سوق استهلاكي في المنطقة (100+ مليون مستهلك)\n• تكاليف عمالة وتشغيل منخفضة جداً\n• موقع استراتيجي بين أفريقيا وآسيا وأوروبا\n• قناة السويس: محور للشحن الدولي\n• حوافز استثمارية قوية من الحكومة المصرية\n• إمكانية الحصول على إقامة المستثمر مع الشركة\n\n## الملكية الأجنبية في مصر\n• شركة ذات مسؤولية محدودة: ملكية أجنبية 100% مسموحة\n• شركة مساهمة مصرية: ملكية أجنبية 100% مسموحة\n• الجهة المنظمة: هيئة الاستثمار والمناطق الحرة (GAFI)\n\n## أنواع الشركات\n→ شركة ذات مسؤولية محدودة (LLC): 2 مساهمين على الأقل\n→ شركة مساهمة مصرية (JSC): 3 مساهمين، رأس مال 250,000 جنيه\n→ شركة الشخص الواحد: أبسط في الإدارة\n→ فرع شركة أجنبية: لتوسيع نشاط قائم\n\n## الخطوات الأساسية\n→ إنشاء حساب على بوابة GAFI الإلكترونية\n→ اختيار الشكل القانوني وتحديد النشاط التجاري\n→ حجز اسم الشركة والتحقق من توافره\n→ تقديم طلب التأسيس مع المستندات المطلوبة\n→ سداد رسوم التأسيس\n→ استخراج بطاقة ضريبية وسجل تجاري\n→ فتح الحساب البنكي التجاري\n→ التقدم للحصول على إقامة المستثمر\n\n## إقامة المستثمر في مصر\n• تُمنح لمؤسسي الشركات الأجنبية في مصر\n• صالحة سنة قابلة للتجديد\n• تتيح الإقامة والعمل القانوني في مصر\n\n## التكاليف التقريبية\n$ رسوم التأسيس في GAFI: تبدأ من 1,500 دولار تقريباً\n$ إجمالي: من 1,500 إلى 3,500 دولار\n$ تكاليف منخفضة جداً مقارنة بالخليج\n\n## البيئة الضريبية\n• ضريبة الشركات: 22.5% على صافي الأرباح\n• ضريبة القيمة المضافة (VAT): 14%\n• إعفاءات للمشاريع في المناطق الاقتصادية الخاصة\n\n## مدة التأسيس\n• من 2 إلى 4 أسابيع عادةً",
    contentEn: "## Egypt — Gateway to Africa and the Middle East\nEgypt is the most populated country in the region with over 100 million people, with very low operating costs compared to the Gulf.\n\n## Why Invest in Egypt?\n• Largest consumer market in the region (100M+ consumers)\n• Very low labor and operating costs\n• Strategic location between Africa, Asia, and Europe\n• Suez Canal: hub for international shipping\n• Strong government investment incentives\n• Can obtain investor residency when establishing company\n\n## Foreign Ownership in Egypt\n• LLC: 100% foreign ownership allowed\n• Egyptian Joint Stock Company: 100% foreign ownership allowed\n• Governing authority: GAFI\n\n## Company Types\n→ LLC: Minimum 2 shareholders\n→ Egyptian JSC: 3 shareholders, EGP 250,000 capital\n→ Single Person Company: simpler management\n→ Branch of Foreign Company: To expand existing activities\n\n## Key Steps\n→ Create account on GAFI portal\n→ Choose legal form and define business activity\n→ Reserve company name\n→ Submit incorporation application with documents\n→ Pay incorporation fees\n→ Obtain tax card and commercial registration\n→ Open business bank account\n→ Apply for investor residency\n\n## Investor Residency in Egypt\n• Granted to foreign company founders in Egypt\n• Valid 1 year, renewable\n• Allows legal residency and work in Egypt\n\n## Approximate Costs\n$ GAFI fees: starting from approximately $1,500\n$ Total: $1,500 to $3,500\n$ Very low costs compared to the Gulf\n\n## Tax Environment\n• Corporate tax: 22.5% on net profits\n• VAT: 14%\n• Exemptions in special economic zones\n\n## Processing Time\n• 2 to 4 weeks typically",
  },
  {
    id: "company-turkey", category: "company", featured: false, date: "2026-06-01", readTime: 10,
    titleAr: "تأسيس شركة في تركيا — جسر أوروبا وآسيا (2026)",
    titleEn: "Company Formation in Turkey — Europe-Asia Bridge (2026)",
    excerptAr: "ملكية أجنبية 100% بدون شريك محلي. شركة في 5-7 أيام عمل. سوق 85 مليون مستهلك مع إمكانية الجنسية التركية.",
    excerptEn: "100% foreign ownership with no local partner. Company in 5-7 working days. 85M consumer market with Turkish citizenship possibility.",
    contentAr: "## تركيا — وجهة استثمارية استراتيجية\nتركيا عضو في مجموعة G20 وتمتلك موقعاً فريداً بين أوروبا وآسيا مما يجعلها مركزاً تجارياً لا يُنافَس.\n\n## لماذا تؤسس شركتك في تركيا؟\n• قانون الاستثمار الأجنبي يمنح المستثمر الأجنبي حقوقاً مساوية للتركي\n• ملكية أجنبية 100% في جميع القطاعات التجارية\n• سوق 85 مليون مستهلك نشط ومتنوع\n• تكاليف عمالة وتشغيل أقل من أوروبا بكثير\n• عضوية الاتحاد الجمركي الأوروبي\n• إمكانية الجنسية التركية بالاستثمار العقاري (400,000 دولار)\n\n## أنواع الشركات\n→ شركة ذات مسؤولية محدودة (Ltd.): مساهم واحد يكفي — الأنسب للأجانب\n→ شركة مساهمة (A.S.): للمشاريع الكبيرة\n→ فرع شركة أجنبية: لتوسيع نشاط قائم\n\n## الخطوات الأساسية\n→ التحقق من توافر الاسم في سجل التجارة\n→ تحضير النظام الأساسي للشركة وتوثيقه\n→ إيداع رأس المال في البنك (50,000 ليرة تركية)\n→ تقديم مستندات التأسيس لدى سجل التجارة\n→ الحصول على الرقم الضريبي والتسجيل في مصلحة الضرائب\n→ التسجيل في مؤسسة التأمينات الاجتماعية (SGK)\n→ فتح الحساب البنكي التجاري\n\n## الحد الأدنى لرأس المال\n$ شركة ذات مسؤولية محدودة (LLC): 50,000 ليرة تركية\n$ لا يشترط إيداع رأس المال فوراً — يمكن السداد خلال 24 شهراً\n$ شركة مساهمة: 250,000 ليرة تركية\n\n## تكاليف التأسيس\n$ رسوم الإشهار والتسجيل: 900 إلى 2,100 دولار للـ LLC\n$ في حال التوكيل عن بُعد: تكاليف توثيق وكالة + ترجمة معتمدة\n$ إجمالي تقريبي: من 1,500 إلى 4,000 دولار\n$ السعر يتحدد بعد دراسة: نوع النشاط + عنوان المقر + الموافقات الخاصة\n\n## التأسيس عن بُعد\n• يمكن تأسيس الشركة كاملاً دون الحضور الشخصي\n• عبر توكيل رسمي (Power of Attorney)\n• الكون يتولى كامل الإجراءات نيابةً عنك\n\n## البيئة الضريبية\n• ضريبة الشركات: 25% (2024)\n• ضريبة القيمة المضافة: 20%\n• معاهدات لتجنب الازدواج الضريبي مع 80+ دولة\n\n## مدة التأسيس\n• شركة ذات مسؤولية محدودة: 5 إلى 7 أيام عمل",
    contentEn: "## Turkey — A Strategic Investment Destination\nTurkey is a G20 member with a unique position between Europe and Asia making it an unrivaled commercial hub.\n\n## Why Set Up in Turkey?\n• Foreign Direct Investment Law grants equal rights to foreign investors\n• 100% foreign ownership in all commercial sectors\n• Market of 85 million active consumers\n• Much lower labor costs than Europe\n• EU Customs Union membership\n• Turkish citizenship possible through real estate ($400,000)\n\n## Company Types\n→ LLC (Ltd.): One shareholder is enough — best for foreigners\n→ Joint Stock Company (A.S.): For large projects\n→ Branch of Foreign Company: To expand existing activities\n\n## Key Steps\n→ Search Trade Registry and verify name availability\n→ Prepare and notarize articles of association\n→ Deposit capital at bank (TRY 50,000)\n→ Submit incorporation documents at Trade Registry\n→ Obtain tax number and register with Tax Office\n→ Register with Social Security Institution (SGK)\n→ Open business bank account\n\n## Minimum Capital (2024+)\n$ LLC: TRY 50,000\n$ Capital can be paid within 24 months — no upfront deposit required\n$ Joint Stock Company: TRY 250,000\n\n## Setup Costs\n$ Incorporation fees: $900 to $2,100 for LLC\n$ Remote setup adds: Power of Attorney + certified translation costs\n$ Approximate total: $1,500 to $4,000\n$ Price determined after reviewing: activity type + address + special approvals\n\n## Remote Formation\n• The company can be fully set up without physical presence\n• Via Power of Attorney to a lawyer in Turkey\n• Alkown handles the entire process on your behalf\n\n## Tax Environment\n• Corporate tax: 25% (2024)\n• VAT: 20%\n• Double taxation treaties with 80+ countries\n\n## Processing Time\n• LLC: 5 to 7 working days",
  },
  {
    id: "company-indonesia", category: "company", featured: false, date: "2026-06-01", readTime: 10,
    titleAr: "تأسيس شركة PT PMA في إندونيسيا مع إقامة المستثمر (2026)",
    titleEn: "Indonesia PT PMA Company Formation with Investor Residency (2026)",
    excerptAr: "أكبر اقتصاد في جنوب شرق آسيا — 270 مليون مستهلك. رأس مال مدفوع بدءاً من 150,000 دولار. إقامة المستثمر مع الشركة.",
    excerptEn: "Southeast Asia's largest economy — 270 million consumers. Paid-up capital from $150,000. Investor residency with company.",
    contentAr: "## إندونيسيا — عملاق جنوب شرق آسيا\nإندونيسيا رابع أكبر دولة في العالم بعدد السكان (270+ مليون) وأكبر اقتصاد في جنوب شرق آسيا، تنمو بمعدل يفوق 5% سنوياً.\n\n## PT PMA — الشركة الأجنبية في إندونيسيا\nPT PMA (Penanaman Modal Asing) هو الشكل القانوني المخصص للمستثمرين الأجانب في إندونيسيا.\n\n## لماذا الاستثمار في إندونيسيا؟\n• أكبر اقتصاد في جنوب شرق آسيا\n• نمو اقتصادي مستدام يتجاوز 5% سنوياً\n• سوق استهلاكي بـ 270 مليون مستهلك\n• أحد أكبر أسواق التجارة الإلكترونية في العالم\n• إقامة المستثمر مرفقة بتأسيس الشركة\n\n## رأس المال المطلوب (تحديث 2025-2026)\n$ رأس المال المصرح به: 10 مليار روبية إندونيسية\n$ رأس المال المدفوع: 2.5 مليار روبية (~150,000 دولار) — خُفّض بموجب قرار أكتوبر 2025\n$ خطة الاستثمار الإجمالية: تجاوز 10 مليار روبية لكل نشاط\n\n## هيكل الشركة المطلوب\n• مساهمان على الأقل\n• مدير واحد على الأقل يقيم في إندونيسيا\n• مفوض واحد على الأقل\n• تسجيل عبر منصة OSS-RBA الحكومية\n\n## إقامة المستثمر (Investor KITAS)\n→ KITAS E28A: الأكثر شيوعاً لمدراء الشركات الأجانب\n→ Investor Golden Visa (E28C): 2.5 مليون دولار = إقامة 5 سنوات\n→ 5 مليون دولار = إقامة 10 سنوات\n→ المدير الأجنبي يحصل على KITAS بمجرد تأسيس الشركة\n\n## الخطوات الأساسية\n→ التسجيل عبر بوابة OSS-RBA الحكومية\n→ الحصول على NIB (رقم تعريف الأعمال)\n→ تحديد تصنيف المخاطر\n→ توثيق النظام الأساسي لدى كاتب العدل\n→ فتح حساب بنكي وإيداع رأس المال\n→ التسجيل الضريبي (NPWP)\n→ التقديم على تصريح إقامة المستثمر (KITAS)\n\n## تعديلات 2026 المهمة\n• نظام CoreTax الجديد للإدارة الضريبية\n• ضريبة القيمة المضافة: 12%\n• الالتزام بتحديث رموز KBLI 2025 قبل يونيو 2026\n\n## البيئة الضريبية\n• ضريبة الشركات: 22% على الأرباح الصافية\n• ضريبة القيمة المضافة: 12%\n• حوافز للقطاعات الاستراتيجية والمناطق الاقتصادية\n\n## مدة التأسيس\n• من 4 إلى 6 أسابيع عبر المنصة الإلكترونية",
    contentEn: "## Indonesia — Southeast Asia Giant\nIndonesia is the world fourth-largest country by population (270M+) and Southeast Asia largest economy, growing at over 5% annually.\n\n## PT PMA — Foreign Company in Indonesia\nPT PMA (Penanaman Modal Asing) is the legal structure for foreign investors in Indonesia.\n\n## Why Invest in Indonesia?\n• Largest economy in Southeast Asia\n• Sustainable growth exceeding 5% annually\n• Consumer market of 270 million people\n• One of the worlds largest e-commerce markets\n• Investor residency included with company formation\n\n## Capital Requirements (2025-2026 Update)\n$ Authorized capital: IDR 10 billion\n$ Paid-up capital: IDR 2.5 billion (~$150,000) — reduced under October 2025 regulation\n$ Total investment plan: must exceed IDR 10 billion per activity\n\n## Required Company Structure\n• Minimum 2 shareholders\n• At least 1 director residing in Indonesia\n• At least 1 commissioner\n• Register via OSS-RBA government platform\n\n## Investor Residency (Investor KITAS)\n→ KITAS E28A: Most common for foreign company directors\n→ Investor Golden Visa (E28C): $2.5M = 5-year residency\n→ $5M = 10-year residency\n→ Foreign director gets KITAS upon company establishment\n\n## Key Steps\n→ Register via OSS-RBA government portal\n→ Obtain NIB (Business Identification Number)\n→ Determine risk classification\n→ Notarize articles of association\n→ Open bank account and deposit capital\n→ Tax registration (NPWP)\n→ Apply for investor residency permit (KITAS)\n\n## Important 2026 Updates\n• New CoreTax system for tax administration\n• VAT: 12%\n• Must update KBLI 2025 codes before June 2026\n\n## Tax Environment\n• Corporate tax: 22% on net profits\n• VAT: 12%\n• Incentives for strategic sectors and economic zones\n\n## Processing Time\n• 4 to 6 weeks via electronic platform",
  },
  {
    id: "company-syria", category: "company", featured: false, date: "2026-06-01", readTime: 8,
    titleAr: "تأسيس شركة في سوريا — دليل المستثمر الأجنبي 2026",
    titleEn: "Company Formation in Syria — Foreign Investor Guide 2026",
    excerptAr: "سوريا تفتح أبوابها للاستثمار الأجنبي في مرحلة إعادة الإعمار. فرص واسعة في قطاعات التجارة والصناعة والخدمات.",
    excerptEn: "Syria is opening its doors to foreign investment in the reconstruction phase. Wide opportunities in trade, industry, and services.",
    contentAr: "## سوريا — فرص في مرحلة إعادة الإعمار\nتمر سوريا بمرحلة تحوّل وإعادة بناء، تفتح معها فرصاً استثمارية لم تكن متاحة من قبل. الحكومة السورية تسعى لجذب المستثمرين لإعادة بناء الاقتصاد الوطني.\n\n## القطاعات الواعدة في سوريا\n• التجارة العامة والاستيراد والتصدير\n• الصناعة والتصنيع وإعادة الإعمار\n• الزراعة والصناعات الغذائية\n• الخدمات المهنية والاستشارية\n• المقاولات والبناء\n• قطاع التقنية والاتصالات\n\n## أنواع الشركات في سوريا\n→ شركة ذات مسؤولية محدودة: الأنسب للاستثمار المتوسط\n→ شركة مساهمة مغفلة: للمشاريع الكبيرة\n→ فرع شركة أجنبية: لتوسيع نشاط قائم\n\n## ملاحظة مهمة حول التكاليف\nالتسعير في سوريا يعتمد على:\n• طبيعة النشاط التجاري المطلوب بشكل تفصيلي\n• القطاع وارتباطاته بالجهات الحكومية\n• الموافقات المطلوبة من وزارات وجهات معينة\n• الظروف الراهنة وإجراءات كل مرحلة\n\n## الجهات الرسمية المعنية\n• وزارة التجارة الداخلية والحماية المستهلك (السجل التجاري)\n• غرفة التجارة أو الصناعة حسب النشاط\n• وزارة الاقتصاد والتجارة الخارجية (للشركات الأجنبية)\n• جهات متخصصة حسب نوع النشاط\n\n## الخطوات العامة للتأسيس\n→ استشارة الكون وتحديد الهيكل الأنسب لنشاطك\n→ تجهيز المستندات والمتطلبات الأساسية\n→ الحصول على الموافقات الأولية\n→ توثيق عقد التأسيس وتسجيل الشركة\n→ استخراج السجل التجاري والترخيص\n→ فتح الحساب البنكي التجاري\n\n## لماذا تحتاج خبرة الكون؟\n• التعقيدات الإجرائية تتطلب معرفة ميدانية بالجهات المختصة\n• بعض القطاعات تحتاج موافقات متعددة من وزارات مختلفة\n• نساعدك في تجنب التأخيرات والعقبات غير المتوقعة\n• استشارة أولية مجانية لتقييم إمكانية النشاط المطلوب",
    contentEn: "## Syria — Opportunities in the Reconstruction Phase\nSyria is going through transformation and reconstruction, opening investment opportunities not previously available. The Syrian government seeks to attract investors to rebuild the national economy.\n\n## Promising Sectors in Syria\n• General trade, import and export\n• Industry, manufacturing, and reconstruction\n• Agriculture and food industries\n• Professional and consulting services\n• Contracting and construction\n• Technology and telecommunications\n\n## Company Types in Syria\n→ LLC: Best for medium foreign investment\n→ Joint Stock Company: For large projects\n→ Branch of Foreign Company: To expand existing activities\n\n## Important Note on Costs\nPricing in Syria depends on:\n• Nature of the required business activity in detail\n• Sector and its government connections\n• Approvals required from specific ministries and bodies\n• Current conditions and procedures at each stage\n\n## Official Entities Involved\n• Ministry of Internal Trade (Commercial Registry)\n• Chamber of Commerce or Industry per activity\n• Ministry of Economy (for foreign companies)\n• Specialized entities per activity type\n\n## General Incorporation Steps\n→ Consult Alkown and determine best structure\n→ Prepare documents and basic requirements\n→ Obtain initial approvals from relevant authorities\n→ Notarize articles of association and register company\n→ Extract commercial registry and license\n→ Open business bank account\n\n## Why You Need Alkown Expertise\n• Procedural complexities require field knowledge of relevant authorities\n• Some sectors need multiple approvals from different ministries\n• We help avoid unexpected delays and obstacles\n• Free initial consultation to assess the feasibility of your activity",
  },

];

// ── ARTICLE CARD ──────────────────────────────────────────────
function ArticleCard({ article, lang, ff, onEdit, onDelete, canManage, onReadMore }) {
  const ar = lang === "ar";
  const title   = ar ? article.titleAr   : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;
  const cat     = CATEGORIES[article.category] || CATEGORIES.all;

  return (
    <article
      style={{
        background: "#fff", border: "1px solid rgba(201,168,76,.12)",
        borderRadius: 14, overflow: "hidden", transition: "all .3s",
        display: "flex", flexDirection: "column", position: "relative",
        cursor: "pointer",
      }}
      onClick={() => onReadMore(article)}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 18px 52px rgba(0,0,0,.1)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(201,168,76,.12)"; }}
    >
      {/* Top color bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${C.goldDark},${C.gold},${C.goldLight})` }} />

      {/* Admin controls */}
      {canManage && (
        <div
          style={{ position: "absolute", top: 14, [ar ? "left" : "right"]: 10, display: "flex", gap: 5, zIndex: 3 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => onEdit(article)} style={{ background: "rgba(201,168,76,.15)", border: "1px solid rgba(201,168,76,.35)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: C.gold, fontWeight: 700 }}>✏️</button>
          <button onClick={() => onDelete(article.id)} style={{ background: "rgba(229,57,53,.08)", border: "1px solid rgba(229,57,53,.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: ".68rem", color: C.red, fontWeight: 700 }}>🗑</button>
        </div>
      )}

      <div style={{ padding: "20px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Category + Featured */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${cat.color}18`, color: cat.color, fontSize: ".65rem", fontWeight: 700, letterSpacing: ".1em", padding: "3px 10px", borderRadius: 20, border: `1px solid ${cat.color}35` }}>
            {cat.icon} {ar ? cat.ar : cat.en}
          </span>
          {article.featured && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,.1)", color: C.gold, fontSize: ".65rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(201,168,76,.25)" }}>
              ⭐ {ar ? "مميز" : "Featured"}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: ".97rem", lineHeight: 1.55, marginBottom: 10, fontFamily: ff }}>
          {title}
        </h3>

        {/* Excerpt */}
        <p style={{ color: C.g400, fontSize: ".83rem", lineHeight: 1.8, flex: 1, marginBottom: 16 }}>{excerpt}</p>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid rgba(201,168,76,.1)" }}>
          <span style={{ color: C.g400, fontSize: ".72rem" }}>
            📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}
          </span>
          <span style={{ color: C.gold, fontSize: ".78rem", fontWeight: 700 }}>
            {ar ? "اقرأ المزيد ←" : "Read more →"}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── FEATURED HERO CARD ────────────────────────────────────────
function FeaturedCard({ article, lang, ff, onReadMore }) {
  const ar = lang === "ar";
  const title   = ar ? article.titleAr   : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;
  const cat     = CATEGORIES[article.category] || CATEGORIES.all;

  return (
    <article
      onClick={() => onReadMore(article)}
      style={{
        background: `linear-gradient(135deg,${C.dark},#2a1e08)`,
        borderRadius: 16, padding: "36px 36px 32px", cursor: "pointer",
        border: "1px solid rgba(201,168,76,.2)", transition: "all .3s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 20px 64px rgba(0,0,0,.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 80% 20%,rgba(201,168,76,.1),transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, color: C.dark, fontSize: ".65rem", fontWeight: 800, padding: "4px 14px", borderRadius: 20, letterSpacing: ".1em" }}>
            ⭐ {ar ? "مميز" : "Featured"}
          </span>
          <span style={{ background: `${cat.color}25`, color: cat.color === "#8a6010" ? C.gold : cat.color, fontSize: ".65rem", fontWeight: 700, padding: "4px 12px", borderRadius: 20, border: `1px solid ${cat.color}40` }}>
            {cat.icon} {ar ? cat.ar : cat.en}
          </span>
        </div>
        <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", lineHeight: 1.4, marginBottom: 12, fontFamily: ff }}>
          {title}
        </h3>
        <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".88rem", lineHeight: 1.8, marginBottom: 20 }}>{excerpt}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".72rem" }}>📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}</span>
          <span style={{ color: C.gold, fontWeight: 700, fontSize: ".85rem" }}>
            {ar ? "اقرأ المقال الكامل ←" : "Read full article →"}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── ARTICLE MODAL ────────────────────────────────────────────
function ArticleModal({ article, lang, ff, onClose }) {
  const ar = lang === "ar";
  const title   = ar ? article.titleAr   : article.titleEn;
  const content = ar ? article.contentAr : article.contentEn;
  const cat     = CATEGORIES[article.category] || CATEGORIES.all;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9998, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 20px", overflowY: "auto" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 780, boxShadow: "0 32px 80px rgba(0,0,0,.3)", fontFamily: ff, direction: ar ? "rtl" : "ltr", overflow: "hidden", marginBottom: 20 }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, padding: "28px 32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ background: `${cat.color}30`, color: cat.color === "#8a6010" ? C.gold : cat.color, fontSize: ".65rem", fontWeight: 700, padding: "3px 12px", borderRadius: 20, border: `1px solid ${cat.color}45` }}>
                  {cat.icon} {ar ? cat.ar : cat.en}
                </span>
                <span style={{ color: "rgba(255,255,255,.35)", fontSize: ".72rem" }}>📖 {article.readTime} {ar ? "دقائق" : "min"} · {article.date}</span>
              </div>
              <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.1rem,2.5vw,1.5rem)", lineHeight: 1.4, margin: 0 }}>{title}</h2>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: "1.2rem", flexShrink: 0 }}>×</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: "28px 32px 32px" }}>
          {content ? (
            <RichContent text={content} ar={ar} />
          ) : (
            <p style={{ color: C.g400, fontStyle: "italic" }}>{ar ? "لا يوجد محتوى تفصيلي لهذا المقال." : "No detailed content available for this article."}</p>
          )}
          <div style={{ marginTop: 28, padding: "20px 24px", background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius: 12, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".88rem", marginBottom: 14 }}>
              {ar ? "هل تريد معرفة المزيد أو البدء في تقديم طلبك؟" : "Want to learn more or start your application?"}
            </p>
            <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, color: C.dark, padding: "11px 28px", borderRadius: 8, fontWeight: 800, fontSize: ".88rem", textDecoration: "none", fontFamily: ff }}>
              💬 {ar ? "احصل على استشارة مجانية" : "Get Free Consultation"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ARTICLE EDITOR MODAL ──────────────────────────────────────
function ArticleEditor({ article, lang, ff, onSave, onClose }) {
  const ar = lang === "ar";
  const isNew = !article?.id;
  const [form, setForm] = useState({
    titleAr: "", titleEn: "", excerptAr: "", excerptEn: "",
    contentAr: "", contentEn: "", category: "visa",
    featured: false, readTime: 5, date: new Date().toISOString().split("T")[0],
    ...(article || {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.titleAr.trim() || !form.titleEn.trim()) {
      setError(ar ? "العنوان العربي والإنجليزي مطلوبان" : "Arabic and English titles are required");
      return;
    }
    setSaving(true); setError("");
    try { await onSave(form); onClose(); }
    catch (e) { setError(e.message || "Error saving"); }
    finally { setSaving(false); }
  }

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid rgba(201,168,76,.25)`, background: C.warmWhite, fontFamily: ff, fontSize: ".88rem", color: C.g800, outline: "none", boxSizing: "border-box", marginBottom: 14 };
  const labelStyle = { display: "block", color: C.g600, fontSize: ".78rem", fontWeight: 700, marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "90vh", overflow: "auto", boxShadow: "0 32px 80px rgba(0,0,0,.25)", fontFamily: ff, direction: ar ? "rtl" : "ltr" }}>
        <div style={{ background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, padding: "22px 28px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>
            {isNew ? (ar ? "✍️ مقال جديد" : "✍️ New Article") : (ar ? "✏️ تعديل المقال" : "✏️ Edit Article")}
          </h2>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: "1.1rem" }}>×</button>
        </div>
        <div style={{ padding: "28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 6 }}>
            <div>
              <label style={labelStyle}>{ar ? "التصنيف" : "Category"}</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
                {Object.entries(CATEGORIES).filter(([k]) => k !== "all").map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {ar ? v.ar : v.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{ar ? "تاريخ النشر" : "Publish Date"}</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: C.beige, borderRadius: 8 }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set("featured", e.target.checked)} style={{ width: 16, height: 16, accentColor: C.gold }} />
            <label htmlFor="featured" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer" }}>⭐ {ar ? "مقال مميز" : "Featured"}</label>
            <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="number" min={1} max={60} value={form.readTime} onChange={e => set("readTime", +e.target.value)} style={{ width: 50, padding: "4px 8px", borderRadius: 6, border: `1px solid rgba(201,168,76,.25)`, fontFamily: ff, textAlign: "center" }} />
              <span style={{ color: C.g400, fontSize: ".78rem" }}>{ar ? "دقيقة" : "min"}</span>
            </div>
          </div>
          <div style={{ background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ color: C.gold, fontSize: ".72rem", fontWeight: 700, marginBottom: 12 }}>🇸🇦 العربية</div>
            <label style={labelStyle}>{ar ? "العنوان" : "Title (Arabic)"}</label>
            <input value={form.titleAr} onChange={e => set("titleAr", e.target.value)} style={{ ...inputStyle, direction: "rtl" }} />
            <label style={labelStyle}>{ar ? "المقتطف" : "Excerpt (Arabic)"}</label>
            <textarea value={form.excerptAr} onChange={e => set("excerptAr", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", direction: "rtl" }} />
            <label style={labelStyle}>{ar ? "المحتوى الكامل" : "Full Content (Arabic)"}</label>
            <textarea value={form.contentAr} onChange={e => set("contentAr", e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", marginBottom: 0, direction: "rtl", fontFamily: "monospace" }} placeholder="## عنوان القسم&#10;• نقطة&#10;→ خطوة&#10;$ تكلفة" />
          </div>
          <div style={{ background: "rgba(30,21,8,.03)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ color: C.g400, fontSize: ".72rem", fontWeight: 700, marginBottom: 12 }}>🇬🇧 English</div>
            <label style={labelStyle}>Title (English)</label>
            <input value={form.titleEn} onChange={e => set("titleEn", e.target.value)} style={{ ...inputStyle, direction: "ltr" }} />
            <label style={labelStyle}>Excerpt (English)</label>
            <textarea value={form.excerptEn} onChange={e => set("excerptEn", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", direction: "ltr" }} />
            <label style={labelStyle}>Full Content (English)</label>
            <textarea value={form.contentEn} onChange={e => set("contentEn", e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical", marginBottom: 0, direction: "ltr", fontFamily: "monospace" }} placeholder="## Section Title&#10;• Bullet point&#10;→ Step&#10;$ Cost" />
          </div>
          {error && <div style={{ color: C.red, fontSize: ".83rem", marginBottom: 14, padding: "8px 12px", background: "rgba(229,57,53,.07)", borderRadius: 6 }}>⚠️ {error}</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "10px 22px", background: "transparent", border: `1px solid rgba(201,168,76,.3)`, borderRadius: 8, cursor: "pointer", color: C.g600, fontFamily: ff, fontSize: ".88rem" }}>
              {ar ? "إلغاء" : "Cancel"}
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "10px 28px", background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, border: "none", borderRadius: 8, cursor: saving ? "wait" : "pointer", color: C.dark, fontFamily: ff, fontSize: ".88rem", fontWeight: 700, opacity: saving ? .7 : 1 }}>
              {saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "💾 حفظ المقال" : "💾 Save Article")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function KnowledgeCenter({ lang, ff, setPage }) {
  const ar = lang === "ar";
  const { role } = useAuth() || {};
  const canManage = ["admin", "manager", "staff"].includes(role);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [articles, setArticles]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [editorOpen, setEditorOpen]         = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [readingArticle, setReadingArticle] = useState(null);
  const [deleteConfirm, setDeleteConfirm]   = useState(null);
  const [toast, setToast]                   = useState("");

  // ── Load articles ──────────────────────────────────────────
  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("knowledge_articles").select("*").order("date", { ascending: false });
      if (error) throw error;
      // Merge: DB articles first, then defaults not already overridden
      const dbIds = new Set((data || []).map(a => a.id));
      const merged = [...(data || []), ...DEFAULT_ARTICLES.filter(a => !dbIds.has(a.id))];
      setArticles(merged.length > 0 ? merged : DEFAULT_ARTICLES);
    } catch {
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  // ── SEO ───────────────────────────────────────────────────
  setSEOMeta({
    title: ar ? "مركز المعرفة — الإقامة والجنسية والتأشيرات" : "Knowledge Center — Residency, Citizenship & Visas",
    description: ar ? "أدلة شاملة ومحدّثة لبرامج الجنسية والإقامة والتأشيرات حول العالم." : "Comprehensive guides on citizenship, residency, and visa programs worldwide.",
    lang, canonical: "/knowledge-center",
  });
  setStructuredData(buildBreadcrumbSchema([
    { name: ar ? "الرئيسية" : "Home", url: "/" },
    { name: ar ? "مركز المعرفة" : "Knowledge Center", url: "/knowledge-center" },
  ]));

  // ── Filter ────────────────────────────────────────────────
  const filtered = articles.filter(a => {
    if (activeCategory !== "all" && a.category !== activeCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.titleAr?.includes(searchQuery) || a.titleEn?.toLowerCase().includes(q) ||
           a.excerptAr?.includes(searchQuery) || a.excerptEn?.toLowerCase().includes(q);
  });

  const featured = filtered.filter(a => a.featured);
  const regular  = filtered.filter(a => !a.featured);

  // ── Save / Delete ─────────────────────────────────────────
  async function handleSave(form) {
    const isDefault = DEFAULT_ARTICLES.find(d => d.id === form.id);
    if (isDefault && form.id) {
      setArticles(prev => prev.map(a => a.id === form.id ? { ...form } : a));
      showToast(ar ? "✅ تم الحفظ" : "✅ Saved");
      return;
    }
    const payload = { ...form };
    delete payload.id;
    if (form.id) {
      const { error } = await supabase.from("knowledge_articles").update(payload).eq("id", form.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("knowledge_articles").insert([payload]);
      if (error) throw error;
    }
    await loadArticles();
    showToast(ar ? "✅ تم حفظ المقال بنجاح" : "✅ Article saved successfully");
  }

  async function handleDelete(id) {
    if (DEFAULT_ARTICLES.find(d => d.id === id)) {
      setArticles(prev => prev.filter(a => a.id !== id));
      setDeleteConfirm(null);
      showToast(ar ? "🗑️ تم الحذف" : "🗑️ Deleted");
      return;
    }
    await supabase.from("knowledge_articles").delete().eq("id", id);
    await loadArticles();
    setDeleteConfirm(null);
    showToast(ar ? "🗑️ تم حذف المقال" : "🗑️ Article deleted");
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  // ── Counts per category ───────────────────────────────────
  const counts = {};
  articles.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#fff", padding: "12px 28px", borderRadius: 40, fontSize: ".88rem", zIndex: 99999, boxShadow: "0 8px 32px rgba(0,0,0,.3)", border: "1px solid rgba(201,168,76,.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Article Reading Modal */}
      {readingArticle && (
        <ArticleModal article={readingArticle} lang={lang} ff={ff} onClose={() => setReadingArticle(null)} />
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <ArticleEditor article={editingArticle} lang={lang} ff={ff} onSave={handleSave} onClose={() => { setEditorOpen(false); setEditingArticle(null); }} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "32px", maxWidth: 400, textAlign: "center", fontFamily: ff }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🗑️</div>
            <p style={{ color: C.g800, fontWeight: 700, marginBottom: 20 }}>{ar ? "هل تريد حذف هذا المقال؟" : "Delete this article?"}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 20px", background: "transparent", border: "1px solid rgba(201,168,76,.3)", borderRadius: 8, cursor: "pointer", fontFamily: ff }}>{ar ? "إلغاء" : "Cancel"}</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "9px 20px", background: C.red, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: ff, fontWeight: 700 }}>{ar ? "حذف" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{ background: `linear-gradient(150deg,${C.dark} 0%,${C.darkMid} 60%,#1a1005 100%)`, padding: "80px clamp(20px,6vw,80px) 64px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 25% 50%,rgba(201,168,76,.07) 0%,transparent 55%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 40, padding: "6px 22px", marginBottom: 22 }}>
            <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".22em", textTransform: "uppercase", fontWeight: 700 }}>
              📚 {ar ? "مركز المعرفة" : "Knowledge Center"}
            </span>
          </div>

          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.9rem,4.5vw,3rem)", marginBottom: 14, lineHeight: 1.2 }}>
            {ar ? "دليلك الشامل للإقامة والجنسية والتأشيرات" : "Your Complete Guide to Residency, Citizenship & Visas"}
          </h1>

          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.85, maxWidth: 640, margin: "0 auto 36px" }}>
            {ar
              ? `${articles.length} مقال متخصص من خبراء الكون العالمية — معلومات موثوقة ومحدّثة لمساعدتك في اتخاذ أفضل قرار.`
              : `${articles.length} expert articles from ALKOWN Global specialists — reliable, updated information to help you make the best decision.`}
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 540, margin: "0 auto" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={ar ? "ابحث في المقالات — دومينيكا، البرتغال، الإمارات..." : "Search — Dominica, Portugal, UAE..."}
              style={{ width: "100%", padding: "15px 52px 15px 22px", borderRadius: 10, border: "1px solid rgba(201,168,76,.3)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: ".92rem", outline: "none", fontFamily: ff, backdropFilter: "blur(10px)", boxSizing: "border-box" }}
            />
            <span style={{ position: "absolute", [ar ? "left" : "right"]: 18, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", fontSize: "1.1rem", pointerEvents: "none" }}>🔍</span>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════ */}
      <div style={{ background: C.beige, borderBottom: "1px solid rgba(201,168,76,.12)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
          {[
            { n: `${articles.length}`, lAr: "مقال متاح",         lEn: "Articles" },
            { n: "6",                  lAr: "برامج جنسية",        lEn: "Citizenship" },
            { n: "11",                 lAr: "برامج إقامة",         lEn: "Residency" },
            { n: "10+",                lAr: "دول مغطّاة",         lEn: "Countries" },
          ].map((s, i, arr) => (
            <div key={i} style={{ textAlign: "center", padding: "22px 12px", borderInlineEnd: i < arr.length - 1 ? "1px solid rgba(201,168,76,.12)" : "none" }}>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: C.gold, fontFamily: ff }}>{s.n}</div>
              <div style={{ fontSize: ".7rem", color: C.g400, marginTop: 4, letterSpacing: ".1em" }}>{ar ? s.lAr : s.lEn}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1260, margin: "0 auto", padding: "48px clamp(20px,4vw,48px)" }}>

        {/* ══ TOOLBAR ═══════════════════════════════════════════ */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const cnt = key === "all" ? articles.length : (counts[key] || 0);
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                style={{
                  padding: "8px 16px", borderRadius: 40,
                  border: `1.5px solid ${activeCategory === key ? cat.color : "rgba(201,168,76,.2)"}`,
                  background: activeCategory === key ? `${cat.color}15` : "transparent",
                  color: activeCategory === key ? cat.color : C.g400,
                  cursor: "pointer", fontFamily: ff, fontSize: ".82rem",
                  fontWeight: activeCategory === key ? 700 : 400, transition: "all .22s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                {cat.icon} {ar ? cat.ar : cat.en}
                {cnt > 0 && <span style={{ background: activeCategory === key ? `${cat.color}30` : "rgba(201,168,76,.1)", color: activeCategory === key ? cat.color : C.g400, fontSize: ".65rem", padding: "1px 6px", borderRadius: 10, fontWeight: 800 }}>{cnt}</span>}
              </button>
            );
          })}

          <span style={{ color: C.g400, fontSize: ".78rem", marginInlineStart: "auto" }}>
            {filtered.length} {ar ? "مقال" : "articles"}
          </span>

          {canManage && (
            <button onClick={() => { setEditingArticle(null); setEditorOpen(true); }} style={{ padding: "9px 20px", background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontSize: ".85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              ✍️ {ar ? "مقال جديد" : "New Article"}
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.g400 }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
            {ar ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>📭</div>
            <p style={{ color: C.g400 }}>{ar ? "لا توجد نتائج" : "No results found"}</p>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featured.length > 0 && !searchQuery && (
              <div style={{ marginBottom: 52 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 24, background: `linear-gradient(180deg,${C.gold},${C.goldLight})`, borderRadius: 2 }} />
                  <h2 style={{ color: C.g800, fontWeight: 800, fontSize: "1.1rem" }}>{ar ? "المقالات المميزة" : "Featured Articles"}</h2>
                  <span style={{ color: C.g400, fontSize: ".8rem" }}>({featured.length})</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
                  {featured.map(a => (
                    <FeaturedCard key={a.id} article={a} lang={lang} ff={ff} onReadMore={setReadingArticle} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular articles */}
            {(searchQuery ? filtered : regular).length > 0 && (
              <div>
                {!searchQuery && regular.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 4, height: 24, background: "rgba(201,168,76,.35)", borderRadius: 2 }} />
                    <h2 style={{ color: C.g800, fontWeight: 800, fontSize: "1.1rem" }}>{ar ? "جميع المقالات" : "All Articles"}</h2>
                    <span style={{ color: C.g400, fontSize: ".8rem" }}>({(searchQuery ? filtered : regular).length})</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
                  {(searchQuery ? filtered : regular).map(a => (
                    <ArticleCard key={a.id} article={a} lang={lang} ff={ff} canManage={canManage}
                      onReadMore={setReadingArticle}
                      onEdit={art => { setEditingArticle(art); setEditorOpen(true); }}
                      onDelete={id => setDeleteConfirm(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ CTA ══════════════════════════════════════════════ */}
        <div style={{ marginTop: 72, background: `linear-gradient(135deg,${C.dark},${C.darkMid})`, borderRadius: 16, padding: "52px 40px", textAlign: "center", border: "1px solid rgba(201,168,76,.15)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08),transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 40, padding: "5px 18px", marginBottom: 18 }}>
              <span style={{ color: C.gold, fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
                {ar ? "ابدأ رحلتك" : "Start Your Journey"}
              </span>
            </div>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", marginBottom: 12 }}>
              {ar ? "هل تريد معرفة البرنامج الأنسب لك؟" : "Want to know the best program for you?"}
            </h2>
            <p style={{ color: "rgba(255,255,255,.5)", marginBottom: 28, fontSize: ".92rem", maxWidth: 520, margin: "0 auto 28px" }}>
              {ar ? "فريقنا جاهز لتقييم وضعك وتوجيهك خطوة بخطوة نحو الإقامة أو الجنسية التي تناسب أهدافك." : "Our team is ready to assess your situation and guide you step by step towards the residency or citizenship that fits your goals."}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setPage?.("booking")} style={{ padding: "13px 32px", background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.dark, fontFamily: ff, fontWeight: 800, fontSize: ".9rem" }}>
                {ar ? "احصل على استشارة مجانية" : "Get Free Consultation"}
              </button>
              <a href="https://wa.me/971544909522" target="_blank" rel="noreferrer" style={{ padding: "13px 28px", background: "rgba(37,211,102,.1)", border: "1.5px solid rgba(37,211,102,.35)", borderRadius: 8, color: "#25d366", fontFamily: ff, fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
