-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — AI Knowledge Engine
-- Migration 016 — All phases: KB, RAG, Agents, Content, Calendar, Memory
-- Requires: pgvector extension enabled in Supabase dashboard
-- ═══════════════════════════════════════════════════════════════

-- Enable pgvector (run once per project in Supabase dashboard SQL editor)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ──────────────────────────────────────────────────────────────
-- PHASE 1: Knowledge Collections & Documents
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_knowledge_collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  name_ar     text NOT NULL,
  description text,
  icon        text DEFAULT '📚',
  color       text DEFAULT '#c9a84c',
  doc_count   integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES ai_knowledge_collections(id) ON DELETE SET NULL,
  title         text NOT NULL,
  file_type     text CHECK (file_type IN ('pdf','docx','txt','csv','md','text')),
  file_url      text,
  raw_text      text,
  status        text DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','error')),
  chunk_count   integer DEFAULT 0,
  token_count   integer DEFAULT 0,
  language      text DEFAULT 'ar',
  tags          text[] DEFAULT '{}',
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES ai_documents(id) ON DELETE CASCADE,
  content     text NOT NULL,
  chunk_index integer NOT NULL,
  token_count integer DEFAULT 0,
  embedding   vector(1536),
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS ai_chunks_embedding_idx
  ON ai_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ──────────────────────────────────────────────────────────────
-- PHASE 2: RAG Query Logs
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_rag_queries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query           text NOT NULL,
  answer          text,
  sources         jsonb DEFAULT '[]',
  confidence      numeric(4,3),
  agent_type      text DEFAULT 'general',
  lang            text DEFAULT 'ar',
  chunks_used     integer DEFAULT 0,
  tokens_used     integer DEFAULT 0,
  latency_ms      integer,
  created_at      timestamptz DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 3: Agent Orchestration
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_agent_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type  text NOT NULL CHECK (agent_type IN ('visa','residency','citizenship','sales','marketing','accounting','general')),
  title       text,
  messages    jsonb DEFAULT '[]',
  context     jsonb DEFAULT '{}',
  status      text DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  created_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 4: Content Engine
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_content_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL CHECK (type IN (
    'instagram_post','carousel','reels_script','video_hook',
    'blog_article','email_campaign','whatsapp_campaign','caption'
  )),
  title         text,
  content_ar    text,
  content_en    text,
  content_tr    text,
  platform      text,
  status        text DEFAULT 'idea' CHECK (status IN ('idea','draft','review','approved','published')),
  tags          text[] DEFAULT '{}',
  prompt_used   text,
  agent_type    text,
  sources       jsonb DEFAULT '[]',
  engagement_score numeric(5,2),
  scheduled_at  timestamptz,
  published_at  timestamptz,
  calendar_date date,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 5: Content Calendar
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_content_calendar (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid REFERENCES ai_content_items(id) ON DELETE CASCADE,
  scheduled_date  date NOT NULL,
  scheduled_time  time,
  platform        text,
  status          text DEFAULT 'planned' CHECK (status IN ('planned','ready','published','skipped')),
  notes           text,
  created_at      timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 6: Automation Engine
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_automation_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_type text NOT NULL CHECK (automation_type IN (
    'visa_updates','residency_updates','citizenship_updates',
    'trending_topics','lead_opportunities','daily_digest'
  )),
  status          text DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
  result          jsonb DEFAULT '{}',
  items_generated integer DEFAULT 0,
  error_message   text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_automation_insights (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          uuid REFERENCES ai_automation_runs(id) ON DELETE CASCADE,
  insight_type    text NOT NULL,
  title           text NOT NULL,
  title_ar        text,
  body            text,
  body_ar         text,
  priority        text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  action_taken    boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 7: Brand Memory / Long-Term Memory
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_brand_memory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL CHECK (category IN (
    'brand_voice','writing_style','tone','customer_persona',
    'offers','positioning','competitor','faq','product'
  )),
  key         text NOT NULL,
  value       text NOT NULL,
  lang        text DEFAULT 'ar',
  active      boolean DEFAULT true,
  weight      integer DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(category, key)
);

-- ──────────────────────────────────────────────────────────────
-- PHASE 8: Analytics / Metrics
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text NOT NULL,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────
-- RLS Policies — admin/manager only for AI modules
-- ──────────────────────────────────────────────────────────────

ALTER TABLE ai_knowledge_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chunks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rag_queries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_calendar      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_runs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_insights   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_brand_memory          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics_events      ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write (role enforcement is at app layer)
CREATE POLICY "auth_all" ON ai_knowledge_collections FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_documents             FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_chunks                FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_rag_queries           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_agent_sessions        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_content_items         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_content_calendar      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_automation_runs       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_automation_insights   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_brand_memory          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON ai_analytics_events      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- Seed: Default Knowledge Collections
-- ──────────────────────────────────────────────────────────────

INSERT INTO ai_knowledge_collections (name, name_ar, description, icon, color) VALUES
  ('Visa Rules',          'قواعد التأشيرات',        'Visa requirements and entry rules by country',       '🛂', '#3d6f9f'),
  ('Residency Programs',  'برامج الإقامة',           'Golden visa and residency programs worldwide',       '🏠', '#2f8f5b'),
  ('Citizenship Programs','برامج الجنسية',           'Citizenship by investment programs',                 '🌍', '#7c3aed'),
  ('Country Information', 'معلومات الدول',           'Country profiles, economy, lifestyle',               '🗺️', '#c28a25'),
  ('FAQs',                'الأسئلة الشائعة',         'Frequently asked questions and answers',             '❓', '#c9a84c'),
  ('Company Policies',    'سياسات الشركة',           'Internal policies and procedures',                   '📋', '#6f6a61'),
  ('Sales Scripts',       'نصوص المبيعات',           'Scripts and templates for sales conversations',      '💬', '#e07070'),
  ('Marketing Assets',    'أصول التسويق',            'Brand assets, templates, and campaign materials',    '📣', '#c9a84c'),
  ('Competitor Research', 'أبحاث المنافسين',         'Competitor analysis and market intelligence',        '🔍', '#b94a48'),
  ('Internal Procedures', 'الإجراءات الداخلية',      'Step-by-step internal workflow documentation',      '⚙️', '#1a1a1a')
ON CONFLICT DO NOTHING;

-- Seed: Default Brand Memory
INSERT INTO ai_brand_memory (category, key, value, lang) VALUES
  ('brand_voice',    'tone',           'احترافي وودي، يعكس الثقة والخبرة', 'ar'),
  ('brand_voice',    'tone_en',        'Professional and warm, reflecting trust and expertise', 'en'),
  ('positioning',    'tagline_ar',     'شريكك الموثوق للتنقل العالمي', 'ar'),
  ('positioning',    'tagline_en',     'Your trusted partner for global mobility', 'en'),
  ('writing_style',  'format',         'جمل قصيرة، نقاط واضحة، لغة مباشرة', 'ar'),
  ('customer_persona','primary',       'رجال أعمال عرب يبحثون عن إقامة أو جنسية ثانية', 'ar'),
  ('offers',         'core_services',  'إقامة، جنسية، تأشيرات، تأسيس شركات، سفر', 'ar')
ON CONFLICT (category, key) DO NOTHING;

-- ──────────────────────────────────────────────────────────────
-- Vector search function
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION ai_match_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count     int   DEFAULT 5,
  filter_collection_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  document_id uuid,
  content     text,
  similarity  float,
  doc_title   text,
  collection  text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity,
    d.title AS doc_title,
    col.name AS collection
  FROM ai_chunks c
  JOIN ai_documents d ON d.id = c.document_id
  JOIN ai_knowledge_collections col ON col.id = d.collection_id
  WHERE 1 - (c.embedding <=> query_embedding) > match_threshold
    AND (filter_collection_id IS NULL OR d.collection_id = filter_collection_id)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
