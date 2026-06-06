// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Knowledge Center
// SEO-optimized articles hub for visa, residency & travel guides
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { setSEOMeta, setStructuredData, buildBreadcrumbSchema } from "../services/seoService";

const C = {
  gold: "#c9a84c", goldLight: "#f0d080", goldDark: "#8a6010",
  cream: "#faf7f2", warmWhite: "#fffcf7", beige: "#f4ede0",
  g100: "#ede5d8", g400: "#7a6b50", g600: "#3d3020", g800: "#1e1508",
  dark: "#16100a", darkMid: "#211608",
};

const ARTICLES = {
  visa: [
    {
      id: "syria-to-uae-visa",
      slug: "/visa/syria-to-uae",
      titleAr: "كيفية الحصول على تأشيرة الإمارات للسوريين",
      titleEn: "How Syrians Can Get UAE Visa",
      excerptAr: "دليل شامل لمتطلبات تأشيرة الإمارات لحاملي الجواز السوري — الوثائق، الرسوم، ومدة المعالجة.",
      excerptEn: "Complete guide to UAE visa requirements for Syrian passport holders.",
      readTime: 5, date: "2025-01-15", featured: true,
    },
    {
      id: "schengen-visa-guide",
      slug: "/visa/syria-to-germany",
      titleAr: "دليل تأشيرة شنغن للعرب",
      titleEn: "Schengen Visa Guide for Arabs",
      excerptAr: "كل ما تحتاج معرفته عن تأشيرة شنغن — الدول المشمولة، المستندات، ونصائح لزيادة فرص القبول.",
      excerptEn: "Everything you need to know about the Schengen visa for Arab travelers.",
      readTime: 8, date: "2025-01-10", featured: true,
    },
    {
      id: "uk-visa-guide",
      slug: "/visa/syria-to-uae",
      titleAr: "تأشيرة المملكة المتحدة من الإمارات",
      titleEn: "UK Visa from UAE",
      excerptAr: "خطوات التقديم للتأشيرة البريطانية من الإمارات للمقيمين العرب.",
      excerptEn: "Step-by-step UK visa application guide for UAE residents.",
      readTime: 6, date: "2025-01-05",
    },
    {
      id: "japan-visa",
      slug: "/visa/syria-to-uae",
      titleAr: "تأشيرة اليابان — الدليل الكامل",
      titleEn: "Japan Visa Complete Guide",
      excerptAr: "متطلبات تأشيرة اليابان للعرب — من السفارة وعبر VFS.",
      excerptEn: "Japan visa requirements for Arab nationals.",
      readTime: 5, date: "2024-12-28",
    },
  ],
  residency: [
    {
      id: "portugal-golden-visa",
      slug: null,
      titleAr: "البرتغال: الجنسية بالاستثمار — الدليل الكامل",
      titleEn: "Portugal Golden Visa — Complete Guide",
      excerptAr: "كيف تحصل على الإقامة البرتغالية وجواز السفر الأوروبي عبر الاستثمار.",
      excerptEn: "How to get Portuguese residency and EU passport through investment.",
      readTime: 10, date: "2025-01-12", featured: true,
    },
    {
      id: "turkey-citizenship",
      slug: null,
      titleAr: "الجنسية التركية بالاستثمار",
      titleEn: "Turkish Citizenship by Investment",
      excerptAr: "متطلبات الحصول على الجنسية التركية عبر الاستثمار العقاري والشروط الكاملة.",
      excerptEn: "Requirements for Turkish citizenship through real estate investment.",
      readTime: 7, date: "2025-01-08",
    },
    {
      id: "uae-golden-visa",
      slug: null,
      titleAr: "الفيزا الذهبية الإماراتية",
      titleEn: "UAE Golden Visa Guide",
      excerptAr: "من يستحق الفيزا الذهبية الإماراتية وكيفية التقديم.",
      excerptEn: "Who qualifies for the UAE Golden Visa and how to apply.",
      readTime: 6, date: "2025-01-03",
    },
  ],
  company: [
    {
      id: "uae-company-setup",
      slug: null,
      titleAr: "تأسيس شركة في الإمارات — خطوة بخطوة",
      titleEn: "UAE Company Setup — Step by Step",
      excerptAr: "كيفية تأسيس شركة في دبي والإمارات من البداية حتى الحصول على الترخيص.",
      excerptEn: "How to set up a company in Dubai and UAE from registration to license.",
      readTime: 9, date: "2025-01-14", featured: true,
    },
    {
      id: "freezone-vs-mainland",
      slug: null,
      titleAr: "المنطقة الحرة أم البر الرئيسي؟",
      titleEn: "Free Zone vs Mainland — Which is Better?",
      excerptAr: "مقارنة شاملة بين تأسيس شركة في المنطقة الحرة والبر الرئيسي في الإمارات.",
      excerptEn: "Complete comparison between Free Zone and Mainland company formation in UAE.",
      readTime: 7, date: "2025-01-06",
    },
  ],
  travel: [
    {
      id: "travel-to-turkey",
      slug: null,
      titleAr: "السياحة في تركيا — الدليل الشامل",
      titleEn: "Tourism in Turkey — Complete Guide",
      excerptAr: "أفضل المدن والمعالم السياحية في تركيا وأفضل أوقات الزيارة.",
      excerptEn: "Best cities and attractions in Turkey with timing tips.",
      readTime: 8, date: "2025-01-11",
    },
    {
      id: "travel-to-europe",
      slug: null,
      titleAr: "السفر لأوروبا بتأشيرة شنغن",
      titleEn: "Traveling Europe with Schengen Visa",
      excerptAr: "كيف تستغل تأشيرة شنغن للتجول في أوروبا وأفضل الدول للزيارة.",
      excerptEn: "How to maximize your Schengen visa across Europe.",
      readTime: 6, date: "2025-01-02",
    },
  ]
};

const CATEGORIES = {
  all:     { ar: "الكل",           en: "All",              icon: "🌐" },
  visa:    { ar: "أدلة التأشيرة", en: "Visa Guides",       icon: "🛂" },
  residency: { ar: "الإقامة",     en: "Residency",         icon: "🏠" },
  company: { ar: "تأسيس الشركات", en: "Company Formation", icon: "🏢" },
  travel:  { ar: "السفر",         en: "Travel Guides",     icon: "✈️" },
};

function ArticleCard({ article, lang, ff }) {
  const ar = lang === "ar";
  const title = ar ? article.titleAr : article.titleEn;
  const excerpt = ar ? article.excerptAr : article.excerptEn;

  return (
    <article style={{
      background: "#fff", border: `1px solid rgba(201,168,76,.13)`,
      borderRadius: 12, overflow: "hidden", transition: "all .35s",
      cursor: "pointer", display: "flex", flexDirection: "column",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,.10)"; e.currentTarget.style.borderColor = "rgba(201,168,76,.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(201,168,76,.13)"; }}>
      {/* Header bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})` }} />
      <div style={{ padding: "24px 24px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        {article.featured && (
          <span style={{ display: "inline-block", background: `rgba(201,168,76,.12)`, color: C.gold, fontSize: ".65rem", fontWeight: 700, letterSpacing: ".15em", padding: "3px 10px", borderRadius: 20, marginBottom: 12, border: `1px solid rgba(201,168,76,.25)`, width: "fit-content" }}>
            {ar ? "⭐ مميز" : "⭐ Featured"}
          </span>
        )}
        <h3 style={{ color: C.g800, fontWeight: 700, fontSize: "1rem", lineHeight: 1.5, marginBottom: 10, flex: 1, fontFamily: ff }}>
          {title}
        </h3>
        <p style={{ color: C.g400, fontSize: ".85rem", lineHeight: 1.75, marginBottom: 18 }}>{excerpt}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.g400, fontSize: ".75rem" }}>
            📖 {article.readTime} {ar ? "دقائق قراءة" : "min read"}
          </span>
          <span style={{ color: C.gold, fontSize: ".78rem", fontWeight: 700 }}>
            {ar ? "اقرأ المزيد ←" : "Read more →"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function KnowledgeCenter({ lang, ff, setPage }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const ar = lang === "ar";

  // SEO
  setSEOMeta({
    title: ar ? "مركز المعرفة — أدلة التأشيرة والإقامة والسفر" : "Knowledge Center — Visa, Residency & Travel Guides",
    description: ar
      ? "أدلة شاملة ومحدّثة عن التأشيرات، الإقامة بالاستثمار، تأسيس الشركات، والسفر. خبراء الكون العالمية."
      : "Comprehensive guides on visas, residency by investment, company formation, and travel by ALKOWN Global experts.",
    keywords: ar ? "أدلة تأشيرة، إقامة، سفر، مركز معرفة" : "visa guides, residency, travel, knowledge center",
    lang,
    canonical: "/knowledge-center"
  });

  setStructuredData(buildBreadcrumbSchema([
    { name: ar ? "الرئيسية" : "Home", url: "/" },
    { name: ar ? "مركز المعرفة" : "Knowledge Center", url: "/knowledge-center" }
  ]));

  // Filter articles
  const getArticles = () => {
    const cats = activeCategory === "all" ? Object.keys(ARTICLES) : [activeCategory];
    let all = cats.flatMap(cat => (ARTICLES[cat] || []).map(a => ({ ...a, category: cat })));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(a =>
        a.titleAr?.includes(searchQuery) || a.titleEn?.toLowerCase().includes(q) ||
        a.excerptAr?.includes(searchQuery) || a.excerptEn?.toLowerCase().includes(q)
      );
    }
    return all;
  };

  const articles = getArticles();
  const featuredArticles = articles.filter(a => a.featured).slice(0, 3);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <div style={{ fontFamily: ff, direction: ar ? "rtl" : "ltr", background: C.warmWhite, minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(150deg, ${C.dark} 0%, ${C.darkMid} 60%, #1a1005 100%)`,
        padding: "72px clamp(20px,6vw,80px) 56px", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 30% 50%, rgba(201,168,76,.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,.04) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.3)", borderRadius: 40, padding: "6px 20px", marginBottom: 20 }}>
            <span style={{ color: C.gold, fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700 }}>
              {ar ? "مركز المعرفة" : "Knowledge Center"}
            </span>
          </div>
          <h1 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 14, lineHeight: 1.2 }}>
            {ar ? "أدلتك الشاملة للسفر والتأشيرات" : "Your Complete Guide to Visas & Travel"}
          </h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem", lineHeight: 1.8, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
            {ar
              ? "مقالات متخصصة ومحدّثة من خبراء الكون العالمية في التأشيرات والإقامة وتأسيس الشركات والسفر."
              : "Expert articles from ALKOWN Global specialists on visas, residency, company formation, and travel."}
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={ar ? "ابحث في المقالات..." : "Search articles..."}
              style={{
                width: "100%", padding: "14px 50px 14px 20px", borderRadius: 8,
                border: "1px solid rgba(201,168,76,.3)", background: "rgba(255,255,255,.08)",
                color: "#fff", fontSize: ".95rem", outline: "none", fontFamily: ff,
                backdropFilter: "blur(10px)", boxSizing: "border-box",
              }}
            />
            <span style={{ position: "absolute", [ar ? "left" : "right"]: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", fontSize: "1.1rem" }}>🔍</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px clamp(20px,4vw,48px)" }}>

        {/* ── Category Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setActiveCategory(key)} style={{
              padding: "9px 18px", borderRadius: 40, border: `1.5px solid`,
              borderColor: activeCategory === key ? C.gold : "rgba(201,168,76,.2)",
              background: activeCategory === key ? `rgba(201,168,76,.12)` : "transparent",
              color: activeCategory === key ? C.gold : C.g400,
              cursor: "pointer", fontFamily: ff, fontSize: ".85rem", fontWeight: activeCategory === key ? 700 : 400,
              transition: "all .25s", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{cat.icon}</span>
              <span>{ar ? cat.ar : cat.en}</span>
            </button>
          ))}
          <span style={{ marginRight: "auto", marginLeft: "auto", color: C.g400, fontSize: ".82rem", alignSelf: "center" }}>
            {articles.length} {ar ? "مقال" : "articles"}
          </span>
        </div>

        {/* ── Featured Articles ── */}
        {featuredArticles.length > 0 && activeCategory === "all" && !searchQuery && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <div style={{ width: 4, height: 24, background: `linear-gradient(180deg, ${C.gold}, ${C.goldLight})`, borderRadius: 2 }} />
              <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.1rem" }}>
                {ar ? "المقالات المميزة" : "Featured Articles"}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {featuredArticles.map(article => (
                <ArticleCard key={article.id} article={article} lang={lang} ff={ff} />
              ))}
            </div>
          </div>
        )}

        {/* ── All Articles ── */}
        {(regularArticles.length > 0 || searchQuery) && (
          <div>
            {activeCategory === "all" && !searchQuery && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 4, height: 24, background: `rgba(201,168,76,.4)`, borderRadius: 2 }} />
                <h2 style={{ color: C.g800, fontWeight: 700, fontSize: "1.1rem" }}>
                  {ar ? "جميع المقالات" : "All Articles"}
                </h2>
              </div>
            )}
            {articles.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>📭</div>
                <p style={{ color: C.g400 }}>{ar ? "لا توجد نتائج" : "No results found"}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
                {(searchQuery ? articles : regularArticles).map(article => (
                  <ArticleCard key={article.id} article={article} lang={lang} ff={ff} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{
          marginTop: 64, background: `linear-gradient(135deg, ${C.dark}, ${C.darkMid})`,
          borderRadius: 16, padding: "48px 40px", textAlign: "center",
          border: `1px solid rgba(201,168,76,.15)`,
        }}>
          <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", marginBottom: 10 }}>
            {ar ? "هل تحتاج مساعدة شخصية؟" : "Need Personalized Help?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,.5)", marginBottom: 24, fontSize: ".9rem" }}>
            {ar
              ? "فريقنا من الخبراء جاهز للإجابة على استفساراتك وإرشادك خطوة بخطوة."
              : "Our expert team is ready to answer your questions and guide you step by step."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("visa-center")} style={{
              padding: "12px 28px", background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
              border: "none", borderRadius: 6, cursor: "pointer", color: C.dark,
              fontFamily: ff, fontWeight: 700, fontSize: ".9rem",
            }}>
              {ar ? "🔍 فحص التأشيرة" : "🔍 Check Visa"}
            </button>
            <button onClick={() => setPage("contact")} style={{
              padding: "12px 28px", background: "transparent",
              border: "1px solid rgba(201,168,76,.4)", borderRadius: 6, cursor: "pointer",
              color: C.gold, fontFamily: ff, fontWeight: 600, fontSize: ".9rem",
            }}>
              {ar ? "💬 تواصل معنا" : "💬 Contact Us"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
