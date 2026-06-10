// ═══════════════════════════════════════════════════════════════
// AI Memory Service — Phase 7
// Brand voice, writing style, customer personas, positioning
// ═══════════════════════════════════════════════════════════════

import { supabase } from "../../lib/supabase";

export const MEMORY_CATEGORIES = [
  { key: "brand_voice",      label: "الصوت التجاري",      label_en: "Brand Voice",         icon: "🎙️" },
  { key: "writing_style",    label: "أسلوب الكتابة",      label_en: "Writing Style",        icon: "✍️" },
  { key: "tone",             label: "نبرة الخطاب",        label_en: "Tone",                 icon: "🎭" },
  { key: "customer_persona", label: "شخصية العميل",       label_en: "Customer Persona",     icon: "👤" },
  { key: "offers",           label: "العروض والخدمات",     label_en: "Offers & Services",    icon: "💎" },
  { key: "positioning",      label: "موقع الشركة",        label_en: "Company Positioning",  icon: "🎯" },
  { key: "competitor",       label: "أبحاث المنافسين",    label_en: "Competitor Research",  icon: "🔍" },
  { key: "faq",              label: "الأسئلة الشائعة",    label_en: "FAQs",                 icon: "❓" },
  { key: "product",          label: "المنتجات والخدمات",  label_en: "Products",             icon: "📦" },
];

export async function getMemory(category = null) {
  let q = supabase
    .from("ai_brand_memory")
    .select("*")
    .eq("active", true)
    .order("category")
    .order("key");
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  return { data: data || [], error };
}

export async function upsertMemory({ category, key, value, lang = "ar" }) {
  const { data, error } = await supabase
    .from("ai_brand_memory")
    .upsert({ category, key, value, lang, updated_at: new Date().toISOString() }, { onConflict: "category,key" })
    .select()
    .single();
  return { data, error };
}

export async function deleteMemory(id) {
  return supabase.from("ai_brand_memory").update({ active: false }).eq("id", id);
}

// Build a compact memory context string for AI prompts
export async function buildMemoryContext() {
  const { data } = await getMemory();
  if (!data.length) return {};

  const grouped = {};
  for (const item of data) {
    if (!grouped[item.category]) grouped[item.category] = {};
    grouped[item.category][item.key] = item.value;
  }
  return grouped;
}
