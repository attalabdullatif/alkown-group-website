-- Visa Intelligence Engine — Schema + Seed Data
-- vis_countries, vis_rules
-- residence_code = '' (empty) means no residence filter

-- ── Countries ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vis_countries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       CHAR(2) UNIQUE NOT NULL,
  name_en    TEXT NOT NULL,
  name_ar    TEXT NOT NULL,
  flag       TEXT,
  region     TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vis_countries_code   ON vis_countries(code);
CREATE INDEX IF NOT EXISTS idx_vis_countries_active ON vis_countries(is_active);

-- ── Visa Rules ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vis_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nationality_code CHAR(2) NOT NULL,
  destination_code CHAR(2) NOT NULL,
  residence_code   CHAR(2) NOT NULL DEFAULT '',
  visa_requirement TEXT    NOT NULL
                   CHECK (visa_requirement IN (
                     'visa_free','visa_on_arrival','evisa','eta',
                     'visa_required','embassy_visa')),
  stay_days        INT,
  processing_min   INT,
  processing_max   INT,
  fee_usd          NUMERIC(8,2),
  documents        JSONB DEFAULT '[]',
  notes_ar         TEXT,
  notes_en         TEXT,
  is_popular       BOOLEAN DEFAULT FALSE,
  is_active        BOOLEAN DEFAULT TRUE,
  last_verified    DATE DEFAULT CURRENT_DATE,
  source           TEXT DEFAULT 'manual',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (nationality_code, destination_code, residence_code)
);
CREATE INDEX IF NOT EXISTS idx_vis_rules_route  ON vis_rules(nationality_code, destination_code);
CREATE INDEX IF NOT EXISTS idx_vis_rules_active ON vis_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_vis_rules_pop    ON vis_rules(is_popular);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION vis_update_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS vis_countries_ts ON vis_countries;
DROP TRIGGER IF EXISTS vis_rules_ts     ON vis_rules;
CREATE TRIGGER vis_countries_ts BEFORE UPDATE ON vis_countries FOR EACH ROW EXECUTE FUNCTION vis_update_timestamp();
CREATE TRIGGER vis_rules_ts     BEFORE UPDATE ON vis_rules     FOR EACH ROW EXECUTE FUNCTION vis_update_timestamp();

-- RLS
ALTER TABLE vis_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vis_rules     ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vis_countries_pub"  ON vis_countries FOR SELECT USING (is_active = TRUE);
CREATE POLICY "vis_rules_pub"      ON vis_rules     FOR SELECT USING (is_active = TRUE);
CREATE POLICY "vis_countries_auth" ON vis_countries FOR ALL    USING (auth.role() = 'authenticated');
CREATE POLICY "vis_rules_auth"     ON vis_rules     FOR ALL    USING (auth.role() = 'authenticated');

-- ── Countries Seed ───────────────────────────────────────────────────────────
-- Flag stored as 2-letter code; frontend generates emoji via regional indicators
INSERT INTO vis_countries (code, name_en, name_ar, flag, region) VALUES
  ('SY','Syria',         'سوريا',             'SY','Middle East'),
  ('JO','Jordan',        'الأردن',            'JO','Middle East'),
  ('EG','Egypt',         'مصر',               'EG','Middle East'),
  ('SA','Saudi Arabia',  'السعودية',          'SA','Middle East'),
  ('IQ','Iraq',          'العراق',            'IQ','Middle East'),
  ('LB','Lebanon',       'لبنان',             'LB','Middle East'),
  ('PS','Palestine',     'فلسطين',            'PS','Middle East'),
  ('YE','Yemen',         'اليمن',             'YE','Middle East'),
  ('KW','Kuwait',        'الكويت',            'KW','Middle East'),
  ('BH','Bahrain',       'البحرين',           'BH','Middle East'),
  ('QA','Qatar',         'قطر',               'QA','Middle East'),
  ('OM','Oman',          'عُمان',             'OM','Middle East'),
  ('AE','UAE',           'الإمارات',          'AE','Middle East'),
  ('TR','Turkey',        'تركيا',             'TR','Europe/Asia'),
  ('GE','Georgia',       'جورجيا',            'GE','Europe/Asia'),
  ('AZ','Azerbaijan',    'أذربيجان',          'AZ','Europe/Asia'),
  ('RU','Russia',        'روسيا',             'RU','Europe/Asia'),
  ('DE','Germany',       'ألمانيا',           'DE','Europe'),
  ('FR','France',        'فرنسا',             'FR','Europe'),
  ('IT','Italy',         'إيطاليا',           'IT','Europe'),
  ('GB','United Kingdom','المملكة المتحدة',   'GB','Europe'),
  ('NL','Netherlands',   'هولندا',            'NL','Europe'),
  ('ES','Spain',         'إسبانيا',           'ES','Europe'),
  ('PT','Portugal',      'البرتغال',          'PT','Europe'),
  ('GR','Greece',        'اليونان',           'GR','Europe'),
  ('JP','Japan',         'اليابان',           'JP','Asia'),
  ('MY','Malaysia',      'ماليزيا',           'MY','Asia'),
  ('TH','Thailand',      'تايلاند',           'TH','Asia'),
  ('ID','Indonesia',     'إندونيسيا',         'ID','Asia'),
  ('SG','Singapore',     'سنغافورة',          'SG','Asia'),
  ('CN','China',         'الصين',             'CN','Asia'),
  ('KR','South Korea',   'كوريا الجنوبية',    'KR','Asia'),
  ('IN','India',         'الهند',             'IN','Asia'),
  ('PK','Pakistan',      'باكستان',           'PK','Asia'),
  ('BD','Bangladesh',    'بنغلاديش',          'BD','Asia'),
  ('PH','Philippines',   'الفلبين',           'PH','Asia'),
  ('US','United States', 'الولايات المتحدة',  'US','Americas'),
  ('CA','Canada',        'كندا',              'CA','Americas'),
  ('MX','Mexico',        'المكسيك',           'MX','Americas'),
  ('BR','Brazil',        'البرازيل',          'BR','Americas'),
  ('AU','Australia',     'أستراليا',          'AU','Oceania'),
  ('MA','Morocco',       'المغرب',            'MA','Africa'),
  ('TN','Tunisia',       'تونس',              'TN','Africa'),
  ('ZA','South Africa',  'جنوب أفريقيا',      'ZA','Africa')
ON CONFLICT (code) DO UPDATE SET
  name_en=EXCLUDED.name_en, name_ar=EXCLUDED.name_ar,
  flag=EXCLUDED.flag, region=EXCLUDED.region;

-- ── Visa Rules Seed ──────────────────────────────────────────────────────────
INSERT INTO vis_rules
  (nationality_code,destination_code,residence_code,visa_requirement,
   stay_days,processing_min,processing_max,fee_usd,
   documents,notes_ar,notes_en,is_popular)
VALUES
-- SYRIA → AE
('SY','AE','','embassy_visa',30,5,14,90,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورتان خلفية بيضاء"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندقي مؤكد"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة من جهة العمل"},{"type":"insurance","notes_ar":"تأمين سفر"}]',
 'يُقدَّم الطلب عبر السفارة الإماراتية أو المراكز المعتمدة. التأشيرة السياحية 30 يوماً.',
 'Apply through UAE embassy. 30-day tourist visa.',true),

-- SYRIA → TR
('SY','TR','','visa_on_arrival',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة أو إثبات مغادرة"}]',
 'يحصل المواطن السوري على تأشيرة عند الوصول في المطارات التركية. مجانية 90 يوماً.',
 'Free visa on arrival at Turkish borders and airports.',true),

-- SYRIA → JO
('SY','JO','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'تأشيرة عند الوصول في المطارات الأردنية. 30 يوماً.',
 'Visa on arrival at Jordanian ports. 30 days.',true),

-- SYRIA → MY
('SY','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'لا تأشيرة مطلوبة. إقامة حتى 30 يوماً.',
 'No visa required. Stay up to 30 days.',true),

-- SYRIA → GE
('SY','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'جورجيا: دخول مجاني وإقامة حتى سنة.',
 'Georgia allows free entry and stay up to 1 year.',true),

-- SYRIA → AZ
('SY','AZ','','evisa',30,3,5,20,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورة رقمية"}]',
 'تأشيرة إلكترونية عبر visa.e-gov.az. تُعالج في 3-5 أيام.',
 'e-Visa via visa.e-gov.az. Processed in 3-5 business days.',false),

-- SYRIA → RU
('SY','RU','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'اتفاقية ثنائية. دخول مجاني حتى 90 يوماً.',
 'Bilateral agreement. Free entry up to 90 days.',false),

-- SYRIA → DE (general)
('SY','DE','','embassy_visa',90,15,30,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر بعد العودة"},{"type":"photo","notes_ar":"صورتان بيومترية"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر - 2000 يورو حد أدنى"},{"type":"hotel","notes_ar":"حجز فندقي كامل الرحلة"},{"type":"return_tkt","notes_ar":"تذكرة سفر مؤكدة"},{"type":"insurance","notes_ar":"تأمين سفر 30000 يورو"},{"type":"employ_ltr","notes_ar":"رسالة من جهة العمل"},{"type":"cover_ltr","notes_ar":"خطاب تغطية"}]',
 'تأشيرة شنغن. عبر سفارة ألمانيا أو المراكز المعتمدة. وقت المعالجة 15-30 يوم.',
 'Schengen visa. Apply at German embassy. Processing 15-30 days.',true),

-- SYRIA → DE (UAE residents — faster)
('SY','DE','AE','embassy_visa',90,10,21,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب إماراتي 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندقي"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر 30000 يورو"},{"type":"employ_ltr","notes_ar":"رسالة عمل إماراتية"},{"type":"cover_ltr","notes_ar":"خطاب تغطية"}]',
 'المقيم في الإمارات يتقدم من السفارة الألمانية في دبي أو أبوظبي. المعالجة أسرع.',
 'UAE residents apply at German embassy in Dubai/Abu Dhabi. Faster processing.',true),

-- SYRIA → FR
('SY','FR','','embassy_visa',90,15,30,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين 30000 يورو"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"cover_ltr","notes_ar":"خطاب تغطية"}]',
 'تأشيرة شنغن عبر سفارة فرنسا.',
 'Schengen visa via French embassy.',false),

-- SYRIA → GB
('SY','GB','','embassy_visa',180,15,21,115,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب 6 أشهر"},{"type":"hotel","notes_ar":"حجز فندقي"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"cover_ltr","notes_ar":"خطاب تغطية"}]',
 'تأشيرة بريطانية منفصلة عن شنغن. عبر UKVI أونلاين.',
 'UK Standard Visitor Visa. Apply online via UKVI.',false),

-- SYRIA → JP
('SY','JP','','embassy_visa',90,5,10,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورة 4.5×3.5 سم"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"جدول رحلة كامل"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"cover_ltr","notes_ar":"خطاب تغطية مفصل"}]',
 'تأشيرة يابانية. مجانية الرسوم. المعالجة 5-10 أيام عمل.',
 'Japan visa. No fee. Processing 5-10 business days.',true),

-- SYRIA → US
('SY','US','','embassy_visa',180,30,90,185,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب مفصل"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"cover_ltr","notes_ar":"إثبات روابط قوية بالبلد الأصلي"}]',
 'تأشيرة B1/B2. تستلزم مقابلة قنصلية. يُنصح بالتحضير الجيد.',
 'US B1/B2 visa requires consular interview.',false),

-- SYRIA → CA
('SY','CA','','embassy_visa',180,30,60,100,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب 6 أشهر"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"cover_ltr","notes_ar":"خطاب تغطية"}]',
 'تأشيرة كندية. عبر IRCC إلكترونياً. قد تستلزم بيومترياً.',
 'Canada visitor visa via IRCC. Biometrics may be required.',false),

-- SYRIA → TH
('SY','TH','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'تأشيرة عند الوصول في مطارات تايلاند. 30 يوماً.',
 'Visa on arrival at Thai airports. 30 days.',false),

-- JORDAN → AE
('JO','AE','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'الأردنيون يحصلون على تأشيرة مجانية عند الوصول في الإمارات.',
 'Jordanians get free visa on arrival in UAE. 30 days.',true),

-- JORDAN → TR
('JO','TR','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'دخول مجاني للأردنيين إلى تركيا حتى 90 يوماً.',
 'Jordanians enter Turkey visa-free for 90 days.',true),

-- JORDAN → MY
('JO','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'لا تأشيرة للأردنيين. إقامة 30 يوماً.',
 'No visa required. 30 days.',false),

-- JORDAN → GE
('JO','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني وإقامة حتى سنة في جورجيا.',
 'Free entry, stay up to 1 year.',false),

-- JORDAN → DE
('JO','DE','','embassy_visa',90,15,25,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة شنغن. عبر سفارة ألمانيا أو VFS.',
 'Schengen visa via German embassy or VFS.',true),

-- JORDAN → JP
('JO','JP','','embassy_visa',90,5,7,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب"},{"type":"hotel","notes_ar":"جدول رحلة"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة يابانية مجانية. معالجة سريعة للأردنيين.',
 'Free Japan visa. Fast processing for Jordanians.',false),

-- JORDAN → GB
('JO','GB','','embassy_visa',180,15,21,115,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب 6 أشهر"},{"type":"hotel","notes_ar":"حجز فندقي"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة بريطانية. عبر UKVI أونلاين.',
 'UK Standard Visitor Visa. Apply online.',false),

-- SAUDI → AE
('SA','AE','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"جواز سفر ساري أو الهوية الوطنية"}]',
 'السعوديون يدخلون الإمارات مجاناً. دول مجلس التعاون.',
 'Saudis enter UAE visa-free (GCC). National ID accepted.',true),

-- SAUDI → TR
('SA','TR','','evisa',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورة رقمية"}]',
 'تأشيرة إلكترونية تركية مجانية. evisa.gov.tr.',
 'Free Turkish e-Visa via evisa.gov.tr.',true),

-- SAUDI → JP
('SA','JP','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'السعوديون يدخلون اليابان بدون تأشيرة. 90 يوماً.',
 'Saudis enter Japan visa-free for 90 days.',true),

-- SAUDI → DE
('SA','DE','','embassy_visa',90,10,21,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندقي"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين 30000 يورو"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة شنغن. سفارة ألمانيا في الرياض أو جدة.',
 'Schengen visa via German embassy in Riyadh or Jeddah.',true),

-- SAUDI → GB
('SA','GB','','embassy_visa',180,15,21,115,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"bank","notes_ar":"كشف حساب"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'تأشيرة بريطانية. عبر VFS في الرياض وجدة.',
 'UK visa for Saudis via VFS in Riyadh and Jeddah.',false),

-- SAUDI → MY
('SA','MY','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'دخول مجاني لماليزيا. 90 يوماً.',
 'Visa-free to Malaysia. 90 days.',false),

-- SAUDI → GE
('SA','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني لجورجيا حتى سنة.',
 'Georgia: free entry up to 1 year.',false),

-- EGYPT → AE
('EG','AE','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'المصريون يحصلون على تأشيرة عند الوصول في الإمارات. 30 يوماً.',
 'Egyptians get visa on arrival in UAE. 30 days.',true),

-- EGYPT → TR
('EG','TR','','evisa',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'تأشيرة إلكترونية تركية مجانية. evisa.gov.tr.',
 'Free Turkish e-Visa for Egyptians.',true),

-- EGYPT → GE
('EG','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني وإقامة حتى سنة.',
 'Visa-free, stay up to 1 year.',false),

-- EGYPT → MY
('EG','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'دخول مجاني لماليزيا. 30 يوماً.',
 'Visa-free entry for Egyptians. 30 days.',false),

-- EGYPT → DE
('EG','DE','','embassy_visa',90,15,25,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة شنغن. سفارة ألمانيا في القاهرة.',
 'Schengen visa via German embassy in Cairo.',true),

-- IRAQ → AE
('IQ','AE','','embassy_visa',30,7,14,90,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب"},{"type":"hotel","notes_ar":"حجز فندقي"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"employ_ltr","notes_ar":"رسالة عمل"},{"type":"insurance","notes_ar":"تأمين سفر"}]',
 'العراقيون بحاجة لتأشيرة إماراتية مسبقة.',
 'Iraqis need UAE visa in advance.',true),

-- IRAQ → TR
('IQ','TR','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'العراقيون يحصلون على تأشيرة عند الوصول في تركيا. 30 يوماً.',
 'Iraqis get visa on arrival in Turkey. 30 days.',true),

-- IRAQ → GE
('IQ','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني لجورجيا حتى سنة.',
 'Free entry to Georgia up to 1 year.',false),

-- IRAQ → MY
('IQ','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'دخول مجاني لماليزيا. 30 يوماً.',
 'Visa-free entry for Iraqis. 30 days.',false),

-- LEBANON → AE
('LB','AE','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'اللبنانيون يحصلون على تأشيرة عند الوصول في الإمارات.',
 'Lebanese get visa on arrival in UAE. 30 days.',true),

-- LEBANON → TR
('LB','TR','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'دخول مجاني لتركيا. 90 يوماً.',
 'Visa-free to Turkey. 90 days.',true),

-- LEBANON → GE
('LB','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني لجورجيا حتى سنة.',
 'Free entry to Georgia up to 1 year.',false),

-- LEBANON → MY
('LB','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"}]',
 'لا تأشيرة لدى اللبنانيين في ماليزيا.',
 'No visa required for Lebanese in Malaysia.',false),

-- LEBANON → DE
('LB','DE','','embassy_visa',90,15,25,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر"}]',
 'تأشيرة شنغن. سفارة ألمانيا في بيروت.',
 'Schengen visa via German embassy in Beirut.',true),

-- PAKISTAN → AE
('PK','AE','','visa_on_arrival',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'الباكستانيون يحصلون على تأشيرة مجانية عند الوصول في الإمارات.',
 'Pakistanis receive free visa on arrival in UAE. 30 days.',true),

-- PAKISTAN → TR
('PK','TR','','evisa',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورة رقمية"}]',
 'تأشيرة تركية إلكترونية مجانية. evisa.gov.tr.',
 'Free Turkish e-Visa for Pakistanis.',true),

-- PAKISTAN → MY
('PK','MY','','visa_free',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'دخول مجاني لماليزيا حتى 90 يوماً.',
 'Malaysia-Pakistan bilateral. Free entry 90 days.',false),

-- PAKISTAN → GE
('PK','GE','','visa_free',365,0,0,0,
 '[{"type":"passport","notes_ar":"سارية عند الدخول"}]',
 'دخول مجاني لجورجيا حتى سنة.',
 'Free entry to Georgia up to 1 year.',false),

-- PAKISTAN → DE
('PK','DE','','embassy_visa',90,15,30,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة شنغن. سفارة ألمانيا في إسلام آباد.',
 'Schengen visa via German embassy in Islamabad.',true),

-- INDIA → AE
('IN','AE','','visa_on_arrival',14,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'الهنود يحصلون على تأشيرة عند الوصول في الإمارات. 14 يوماً.',
 'Indians get visa on arrival in UAE. 14 days.',true),

-- INDIA → TR
('IN','TR','','evisa',90,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"photo","notes_ar":"صورة رقمية"}]',
 'تأشيرة تركية إلكترونية مجانية للهنود.',
 'Free Turkish e-Visa for Indians.',true),

-- INDIA → MY
('IN','MY','','visa_free',30,0,0,0,
 '[{"type":"passport","notes_ar":"سارية 6 أشهر"},{"type":"return_tkt","notes_ar":"تذكرة عودة"}]',
 'دخول مجاني لماليزيا. 30 يوماً.',
 'Visa-free entry for Indians to Malaysia.',false),

-- INDIA → DE
('IN','DE','','embassy_visa',90,15,25,80,
 '[{"type":"passport","notes_ar":"سارية 3 أشهر"},{"type":"photo","notes_ar":"صورتان"},{"type":"bank","notes_ar":"كشف حساب 3 أشهر"},{"type":"hotel","notes_ar":"حجز فندق"},{"type":"return_tkt","notes_ar":"تذكرة عودة"},{"type":"insurance","notes_ar":"تأمين سفر"},{"type":"employ_ltr","notes_ar":"رسالة عمل"}]',
 'تأشيرة شنغن للهنود. عبر VFS أو سفارة ألمانيا.',
 'Schengen visa for Indians via VFS or German embassy.',true)

ON CONFLICT (nationality_code, destination_code, residence_code) DO UPDATE SET
  visa_requirement = EXCLUDED.visa_requirement,
  stay_days        = EXCLUDED.stay_days,
  processing_min   = EXCLUDED.processing_min,
  processing_max   = EXCLUDED.processing_max,
  fee_usd          = EXCLUDED.fee_usd,
  documents        = EXCLUDED.documents,
  notes_ar         = EXCLUDED.notes_ar,
  notes_en         = EXCLUDED.notes_en,
  is_popular       = EXCLUDED.is_popular,
  last_verified    = CURRENT_DATE;
