-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — Site Content CMS Table
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Auto-update timestamp function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS site_content (
  id            BIGSERIAL PRIMARY KEY,
  section       TEXT NOT NULL,        -- hero | about | services | contact | footer | visa
  key           TEXT NOT NULL,        -- title_ar | title_en | description_ar | phone1 ...
  value_ar      TEXT,                 -- Arabic value
  value_en      TEXT,                 -- English value
  content_type  TEXT DEFAULT 'text',  -- text | url | email | phone | number | color
  label_ar      TEXT,                 -- Human-readable label in Arabic (for CMS UI)
  label_en      TEXT,                 -- Human-readable label in English
  is_active     BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read content
DROP POLICY IF EXISTS "Public can read site content" ON site_content;
CREATE POLICY "Public can read site content"
  ON site_content FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Only authenticated can edit
DROP POLICY IF EXISTS "Authenticated can manage content" ON site_content;
CREATE POLICY "Authenticated can manage content"
  ON site_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Auto-update timestamp
DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_site_content_section ON site_content(section);

-- ══════════════════════════════════════════════════════════════
-- DEFAULT CONTENT — Insert initial values
-- ══════════════════════════════════════════════════════════════
INSERT INTO site_content (section, key, value_ar, value_en, content_type, label_ar, label_en, sort_order) VALUES

-- ── Hero Section ──────────────────────────────────────────────
('hero', 'badge', 'خدمات عالمية متميزة', 'Premium Global Services', 'text', 'شارة الهيرو', 'Hero Badge', 1),
('hero', 'title_line1', 'تأشيرات · إقامة', 'Global Travel, Visas', 'text', 'العنوان الرئيسي — السطر الأول', 'Hero Title Line 1', 2),
('hero', 'title_line2', 'وحلول سفر عالمية', '& Residency Solutions', 'text', 'العنوان الرئيسي — السطر الثاني', 'Hero Title Line 2', 3),
('hero', 'subtitle', 'مركز التأشيرات  ·  برامج الإقامة  ·  تأسيس الشركات  ·  السفر والسياحة', 'Visa Services  ·  Residency Programs  ·  Company Formation  ·  Travel & Tourism', 'text', 'النص الفرعي', 'Hero Subtitle', 4),
('hero', 'cta1', 'تحقق من تأشيرتك', 'Check Visa Requirements', 'text', 'زر الدعوة الأول', 'CTA Button 1', 5),
('hero', 'cta2', 'قدّم طلبك الآن', 'Apply Now', 'text', 'زر الدعوة الثاني', 'CTA Button 2', 6),
('hero', 'trust1', '✅ خدمة موثوقة منذ 2014', '✅ Trusted since 2014', 'text', 'عبارة الثقة الأولى', 'Trust Badge 1', 7),
('hero', 'trust2', '🌍 195+ دولة', '🌍 195+ Countries', 'text', 'عبارة الثقة الثانية', 'Trust Badge 2', 8),
('hero', 'trust3', '⚡ نتائج خلال دقائق', '⚡ Results in minutes', 'text', 'عبارة الثقة الثالثة', 'Trust Badge 3', 9),

-- ── About Section ─────────────────────────────────────────────
('about', 'label', 'من نحن', 'Who We Are', 'text', 'تسمية القسم', 'Section Label', 1),
('about', 'title', 'استشارات متميزة\nمبنية على الثقة', 'A Premium Consultancy\nBuilt on Trust', 'text', 'عنوان القسم', 'Section Title', 2),
('about', 'description', 'مجموعة الكون هي مجموعة مؤسسية متميزة مقرها الإمارات العربية المتحدة، تقدم خدمات عالمية المستوى في مجالات السفر والجنسية والإعلان والتعليم.', 'Alkown Group is a UAE-based premium corporate group delivering world-class services in travel, citizenship, branding, and education.', 'text', 'وصف الشركة', 'Company Description', 3),
('about', 'stat1_value', '+5,000', '+5,000', 'text', 'إحصاء 1 — القيمة', 'Stat 1 Value', 4),
('about', 'stat1_label', 'عميل', 'Clients Served', 'text', 'إحصاء 1 — النص', 'Stat 1 Label', 5),
('about', 'stat2_value', '+15', '+15', 'text', 'إحصاء 2 — القيمة', 'Stat 2 Value', 6),
('about', 'stat2_label', 'دولة', 'Countries', 'text', 'إحصاء 2 — النص', 'Stat 2 Label', 7),
('about', 'stat3_value', '98%', '98%', 'text', 'إحصاء 3 — القيمة', 'Stat 3 Value', 8),
('about', 'stat3_label', 'نسبة النجاح', 'Success Rate', 'text', 'إحصاء 3 — النص', 'Stat 3 Label', 9),
('about', 'stat4_value', '+10', '+10', 'text', 'إحصاء 4 — القيمة', 'Stat 4 Value', 10),
('about', 'stat4_label', 'سنوات خبرة', 'Years of Excellence', 'text', 'إحصاء 4 — النص', 'Stat 4 Label', 11),

-- ── Contact Section ───────────────────────────────────────────
('contact', 'phone1', '+90 534 764 1249', '+90 534 764 1249', 'phone', 'رقم الهاتف 1 (تركيا)', 'Phone 1 (Turkey)', 1),
('contact', 'phone1_wa', '905347641249', '905347641249', 'phone', 'واتساب تركيا', 'WhatsApp Turkey', 2),
('contact', 'phone2', '+971 54 490 9522', '+971 54 490 9522', 'phone', 'رقم الهاتف 2 (الإمارات)', 'Phone 2 (UAE)', 3),
('contact', 'phone2_wa', '971544909522', '971544909522', 'phone', 'واتساب الإمارات', 'WhatsApp UAE', 4),
('contact', 'phone3', '+963 980 631 952', '+963 980 631 952', 'phone', 'رقم الهاتف 3 (سوريا)', 'Phone 3 (Syria)', 5),
('contact', 'phone3_wa', '963980631952', '963980631952', 'phone', 'واتساب سوريا', 'WhatsApp Syria', 6),
('contact', 'email', 'info@alkownglobal.com', 'info@alkownglobal.com', 'email', 'البريد الإلكتروني', 'Email Address', 7),
('contact', 'address', 'إسطنبول · دبي · حلب', 'Istanbul · Dubai · Aleppo', 'text', 'العنوان', 'Address', 8),
('contact', 'instagram', 'https://instagram.com/alkownglobal', 'https://instagram.com/alkownglobal', 'url', 'إنستغرام', 'Instagram URL', 9),
('contact', 'facebook', 'https://facebook.com/alkownglobal', 'https://facebook.com/alkownglobal', 'url', 'فيسبوك', 'Facebook URL', 10),
('contact', 'whatsapp_main', '971544909522', '971544909522', 'phone', 'واتساب الرئيسي (للإشعارات)', 'Main WhatsApp (Notifications)', 11),

-- ── Footer ────────────────────────────────────────────────────
('footer', 'tagline', 'شريكك الموثوق نحو مستقبل أفضل', 'Your trusted partner for a better future', 'text', 'شعار الفوتر', 'Footer Tagline', 1),
('footer', 'copyright', '© 2026 الكون العالمية. جميع الحقوق محفوظة.', '© 2026 Alkown Global. All rights reserved.', 'text', 'حقوق النشر', 'Copyright Text', 2),

-- ── Company Info ──────────────────────────────────────────────
('company', 'name_ar', 'الكون العالمية', 'ALKOWN Global', 'text', 'اسم الشركة بالعربي', 'Company Name AR', 1),
('company', 'name_en', 'ALKOWN Global', 'ALKOWN Global', 'text', 'اسم الشركة بالإنجليزي', 'Company Name EN', 2),
('company', 'slogan_ar', 'بوابتك نحو العالم', 'Your Gateway to the World', 'text', 'الشعار', 'Slogan', 3)

ON CONFLICT (section, key) DO NOTHING;
