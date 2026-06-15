# Database Migrations

تُطبَّق ملفات الهجرة **بالترتيب الرقمي التصاعدي** (`001` → `019`). الترتيب مهم:
ملف لاحق قد يعتمد على جدول أنشأه ملف سابق (مثلاً `007_saas_foundation.sql`
ينفّذ `ALTER TABLE visa_applications` بينما الجدول يُنشأ في `002_visa_applications.sql`).

> ⚠️ لا تعتمد على ترتيب أبجدي للأسماء. أضِف دائمًا رقمًا متسلسلًا في بداية أي ملف هجرة جديد.

## ترتيب التطبيق

| # | الملف | المحتوى |
|---|-------|---------|
| 001 | `001_crm_platform.sql` | أساس منصة الـ CRM |
| 002 | `002_visa_applications.sql` | جدول طلبات التأشيرات (يجب أن يسبق 007) |
| 003 | `003_visa_rules_table.sql` | قواعد التأشيرات |
| 004 | `004_countries_table.sql` | جدول الدول |
| 005 | `005_site_content.sql` | محتوى الموقع |
| 006 | `006_accounting.sql` | المحاسبة والفواتير |
| 007 | `007_saas_foundation.sql` | أساس SaaS (شركات/أدوار/صلاحيات) + `ALTER visa_applications` |
| 008 | `008_visa_intelligence.sql` | ذكاء التأشيرات |
| 009 | `009_fix_foreign_keys.sql` | إصلاح المفاتيح الخارجية |
| 010 | `010_messages_notifications.sql` | الرسائل والإشعارات |
| 011 | `011_knowledge_articles.sql` | مقالات المعرفة |
| 012 | `012_visa_workflow.sql` | سير عمل التأشيرات |
| 013 | `013_crm_pipeline.sql` | خط أنابيب الـ CRM |
| 014 | `014_fix_rls_security.sql` | إصلاح أمان RLS |
| 015 | `015_residency_page_content.sql` | محتوى صفحة الإقامة |
| 016 | `016_ai_knowledge_engine.sql` | محرك المعرفة بالذكاء الاصطناعي |
| 017 | `017_phase2_enhancements.sql` | تحسينات المرحلة الثانية |
| 018 | `018_timatic_database.sql` | قاعدة بيانات Timatic |
| 019 | `019_knowledge_engine_expansion.sql` | توسعة محرك المعرفة |

## إضافة هجرة جديدة

1. استخدم الرقم التالي بصيغة من ثلاث خانات (`020_...`).
2. اجعل العمليات قابلة لإعادة التشغيل بأمان: `CREATE TABLE IF NOT EXISTS`,
   `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
3. حدّث هذا الجدول.
