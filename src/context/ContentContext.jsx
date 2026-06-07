// ═══════════════════════════════════════════════════════════════
// ALKOWN GLOBAL — Site Content Context
// Loads editable content from Supabase with static fallback
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const ContentContext = createContext(null);

// Default fallback content (used when Supabase is not available)
const DEFAULTS = {
  hero: {
    badge:        { ar: "خدمات عالمية متميزة",    en: "Premium Global Services" },
    title_line1:  { ar: "تأشيرات · إقامة",         en: "Global Travel, Visas" },
    title_line2:  { ar: "وحلول سفر عالمية",        en: "& Residency Solutions" },
    subtitle:     { ar: "مركز التأشيرات  ·  برامج الإقامة  ·  تأسيس الشركات", en: "Visa Services  ·  Residency Programs  ·  Company Formation" },
    cta1:         { ar: "تحقق من تأشيرتك",         en: "Check Visa Requirements" },
    cta2:         { ar: "قدّم طلبك الآن",          en: "Apply Now" },
    trust1:       { ar: "✅ خدمة موثوقة منذ 2014", en: "✅ Trusted since 2014" },
    trust2:       { ar: "🌍 195+ دولة",             en: "🌍 195+ Countries" },
    trust3:       { ar: "⚡ نتائج خلال دقائق",     en: "⚡ Results in minutes" },
  },
  about: {
    label:        { ar: "من نحن",           en: "Who We Are" },
    title:        { ar: "استشارات متميزة\nمبنية على الثقة", en: "A Premium Consultancy\nBuilt on Trust" },
    description:  { ar: "مجموعة الكون هي مجموعة مؤسسية متميزة مقرها الإمارات.", en: "Alkown Group is a UAE-based premium corporate group." },
    stat1_value:  { ar: "+5,000", en: "+5,000" },
    stat1_label:  { ar: "عميل",   en: "Clients Served" },
    stat2_value:  { ar: "+15",    en: "+15" },
    stat2_label:  { ar: "دولة",   en: "Countries" },
    stat3_value:  { ar: "98%",    en: "98%" },
    stat3_label:  { ar: "نسبة النجاح", en: "Success Rate" },
    stat4_value:  { ar: "+10",    en: "+10" },
    stat4_label:  { ar: "سنوات خبرة", en: "Years of Excellence" },
  },
  contact: {
    phone1:        { ar: "+90 534 764 1249",    en: "+90 534 764 1249" },
    phone1_wa:     { ar: "905347641249",         en: "905347641249" },
    phone2:        { ar: "+971 54 490 9522",     en: "+971 54 490 9522" },
    phone2_wa:     { ar: "971544909522",         en: "971544909522" },
    phone3:        { ar: "+963 980 631 952",     en: "+963 980 631 952" },
    phone3_wa:     { ar: "963980631952",         en: "963980631952" },
    email:         { ar: "info@alkownglobal.com", en: "info@alkownglobal.com" },
    address:       { ar: "إسطنبول · دبي · حلب", en: "Istanbul · Dubai · Aleppo" },
    instagram:     { ar: "https://instagram.com/alkownglobal", en: "https://instagram.com/alkownglobal" },
    facebook:      { ar: "https://facebook.com/alkownglobal",  en: "https://facebook.com/alkownglobal" },
    whatsapp_main: { ar: "971544909522",         en: "971544909522" },
  },
  footer: {
    tagline:   { ar: "شريكك الموثوق نحو مستقبل أفضل", en: "Your trusted partner for a better future" },
    copyright: { ar: "© 2026 الكون العالمية. جميع الحقوق محفوظة.", en: "© 2026 Alkown Global. All rights reserved." },
  },
  company: {
    name_ar:   { ar: "الكون العالمية", en: "ALKOWN Global" },
    name_en:   { ar: "ALKOWN Global",  en: "ALKOWN Global" },
    slogan_ar: { ar: "بوابتك نحو العالم", en: "Your Gateway to the World" },
  },
};

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("section, key, value_ar, value_en")
        .eq("is_active", true);

      if (error || !data) { setLoading(false); return; }

      // Build content object from flat rows
      const built = { ...DEFAULTS };
      data.forEach(({ section, key, value_ar, value_en }) => {
        if (!built[section]) built[section] = {};
        built[section][key] = { ar: value_ar || "", en: value_en || "" };
      });

      setContent(built);
      setLastUpdated(new Date());
    } catch (e) {
      console.warn("Content load failed, using defaults:", e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  // Helper: get value by section + key + lang
  const get = useCallback((section, key, lang = "ar", fallback = "") => {
    return content?.[section]?.[key]?.[lang] ?? DEFAULTS?.[section]?.[key]?.[lang] ?? fallback;
  }, [content]);

  // Helper: get all keys in a section
  const getSection = useCallback((section, lang = "ar") => {
    const sec = content?.[section] || DEFAULTS?.[section] || {};
    const result = {};
    Object.keys(sec).forEach(k => { result[k] = sec[k]?.[lang] ?? ""; });
    return result;
  }, [content]);

  return (
    <ContentContext.Provider value={{ content, loading, get, getSection, reload: loadContent, lastUpdated, defaults: DEFAULTS }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

export function useGet(section, key, lang = "ar") {
  const { get } = useContent();
  return get(section, key, lang);
}
