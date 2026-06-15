-- ═══════════════════════════════════════════════════════════════
-- PHASE 2 — STEP 9: Timatic-style Visa Database
-- ═══════════════════════════════════════════════════════════════

-- ── Country Profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS country_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text UNIQUE NOT NULL,          -- ISO 3166-1 alpha-2 (e.g. AE, US)
  name_ar       text NOT NULL,
  name_en       text NOT NULL,
  region        text,                          -- GCC, Arab, Europe, Asia, etc.
  currency      text,
  capital_ar    text,
  capital_en    text,
  visa_free_count int DEFAULT 0,
  passport_rank   int,
  notes         text,
  flag_emoji    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ── Visa Rules (passport → destination) ──────────────────────
CREATE TABLE IF NOT EXISTS visa_rules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_country    text NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  destination_country text NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  visa_type           text NOT NULL DEFAULT 'tourist',  -- tourist, business, transit, student, work
  entry_type          text DEFAULT 'visa_required',     -- visa_free, visa_on_arrival, evisa, visa_required
  stay_duration_days  int,                              -- max stay in days
  validity_days       int,                              -- visa validity period
  processing_days_min int DEFAULT 1,
  processing_days_max int DEFAULT 30,
  fee_usd             numeric(10,2),
  requirements        text[],                           -- list of required documents
  notes               text,
  source_url          text,
  last_verified_at    date,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (passport_country, destination_country, visa_type)
);

-- ── Residency Programs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS residency_programs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code        text NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  program_name_ar     text NOT NULL,
  program_name_en     text NOT NULL,
  program_type        text NOT NULL, -- investment, employment, retirement, family, golden_visa
  min_investment_usd  numeric(15,2),
  processing_months_min int,
  processing_months_max int,
  validity_years      int,
  renewable           boolean DEFAULT true,
  leads_to_citizenship boolean DEFAULT false,
  requirements        text[],
  benefits            text[],
  description_ar      text,
  description_en      text,
  is_active           boolean DEFAULT true,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- ── Citizenship Programs ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizenship_programs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code          text NOT NULL REFERENCES country_profiles(code) ON DELETE CASCADE,
  program_name_ar       text NOT NULL,
  program_name_en       text NOT NULL,
  program_type          text NOT NULL,  -- investment, naturalization, descent, marriage
  min_investment_usd    numeric(15,2),
  processing_months_min int,
  processing_months_max int,
  dual_citizenship      boolean DEFAULT false,
  requirements          text[],
  benefits              text[],
  description_ar        text,
  description_en        text,
  is_active             boolean DEFAULT true,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visa_rules_passport    ON visa_rules(passport_country);
CREATE INDEX IF NOT EXISTS idx_visa_rules_destination ON visa_rules(destination_country);
CREATE INDEX IF NOT EXISTS idx_visa_rules_entry_type  ON visa_rules(entry_type);
CREATE INDEX IF NOT EXISTS idx_residency_country      ON residency_programs(country_code);
CREATE INDEX IF NOT EXISTS idx_citizenship_country    ON citizenship_programs(country_code);

-- ── Seed: 14 Arab Nationalities + Key Destinations ───────────
INSERT INTO country_profiles (code, name_ar, name_en, region, flag_emoji) VALUES
  ('AE', 'الإمارات العربية المتحدة', 'United Arab Emirates', 'GCC',  '🇦🇪'),
  ('SA', 'المملكة العربية السعودية',  'Saudi Arabia',          'GCC',  '🇸🇦'),
  ('KW', 'الكويت',                    'Kuwait',                'GCC',  '🇰🇼'),
  ('QA', 'قطر',                       'Qatar',                 'GCC',  '🇶🇦'),
  ('BH', 'البحرين',                   'Bahrain',               'GCC',  '🇧🇭'),
  ('OM', 'سلطنة عُمان',               'Oman',                  'GCC',  '🇴🇲'),
  ('EG', 'مصر',                       'Egypt',                 'Arab', '🇪🇬'),
  ('JO', 'الأردن',                    'Jordan',                'Arab', '🇯🇴'),
  ('LB', 'لبنان',                     'Lebanon',               'Arab', '🇱🇧'),
  ('IQ', 'العراق',                    'Iraq',                  'Arab', '🇮🇶'),
  ('SY', 'سوريا',                     'Syria',                 'Arab', '🇸🇾'),
  ('YE', 'اليمن',                     'Yemen',                 'Arab', '🇾🇪'),
  ('LY', 'ليبيا',                     'Libya',                 'Arab', '🇱🇾'),
  ('MA', 'المغرب',                    'Morocco',               'Arab', '🇲🇦'),
  -- Key destination countries
  ('US', 'الولايات المتحدة',          'United States',         'Americas', '🇺🇸'),
  ('GB', 'المملكة المتحدة',           'United Kingdom',        'Europe',   '🇬🇧'),
  ('DE', 'ألمانيا',                   'Germany',               'Europe',   '🇩🇪'),
  ('FR', 'فرنسا',                     'France',                'Europe',   '🇫🇷'),
  ('CA', 'كندا',                      'Canada',                'Americas', '🇨🇦'),
  ('AU', 'أستراليا',                  'Australia',             'Oceania',  '🇦🇺'),
  ('PT', 'البرتغال',                  'Portugal',              'Europe',   '🇵🇹'),
  ('TR', 'تركيا',                     'Turkey',                'Asia',     '🇹🇷'),
  ('MT', 'مالطا',                     'Malta',                 'Europe',   '🇲🇹'),
  ('CY', 'قبرص',                      'Cyprus',                'Europe',   '🇨🇾'),
  ('GR', 'اليونان',                   'Greece',                'Europe',   '🇬🇷'),
  ('ES', 'إسبانيا',                   'Spain',                 'Europe',   '🇪🇸')
ON CONFLICT (code) DO NOTHING;

-- ── Seed: Sample Residency Programs ──────────────────────────
INSERT INTO residency_programs (country_code, program_name_ar, program_name_en, program_type, min_investment_usd, processing_months_min, processing_months_max, validity_years, leads_to_citizenship, benefits, description_ar) VALUES
  ('AE', 'تأشيرة ذهبية - عقار', 'UAE Golden Visa - Property', 'golden_visa', 544500, 1, 3, 10, false,
   ARRAY['إقامة 10 سنوات', 'تأشيرة للعائلة', 'دون كفيل', 'فتح حساب بنكي'],
   'إقامة ذهبية لمدة 10 سنوات للمستثمرين في العقارات بقيمة لا تقل عن 2 مليون درهم'),
  ('PT', 'التأشيرة الذهبية البرتغالية', 'Portugal Golden Visa', 'investment', 500000, 6, 18, 2, true,
   ARRAY['إقامة أوروبية', 'تنقل شنغن', 'جنسية بعد 5 سنوات', 'حق العمل'],
   'برنامج إقامة بالاستثمار يمنح حق الإقامة في منطقة شنغن'),
  ('TR', 'الجنسية التركية بالاستثمار', 'Turkish Citizenship by Investment', 'investment', 400000, 3, 6, 0, true,
   ARRAY['جنسية كاملة', 'جواز بدون تأشيرة لـ 110 دولة', 'للعائلة', 'حق التصويت'],
   'جنسية تركية مقابل استثمار عقاري بقيمة 400 ألف دولار'),
  ('MT', 'الإقامة المالطية الدائمة', 'Malta Permanent Residency', 'investment', 150000, 4, 6, 0, false,
   ARRAY['إقامة أوروبية دائمة', 'تنقل شنغن', 'للعائلة', 'دون متطلبات إقامة'],
   'برنامج الإقامة الدائمة في مالطا ضمن الاتحاد الأوروبي'),
  ('GR', 'التأشيرة الذهبية اليونانية', 'Greece Golden Visa', 'investment', 250000, 2, 6, 5, true,
   ARRAY['إقامة أوروبية', 'تنقل شنغن', 'جنسية بعد 7 سنوات', 'للعائلة'],
   'برنامج إقامة يوناني بأقل تكلفة في أوروبا')
ON CONFLICT DO NOTHING;
