-- ═══════════════════════════════════════════════════════════════
-- ALKOWN GLOBAL — Knowledge Center Articles Table
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.knowledge_articles (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('visa','residency','company','travel')),
  featured    boolean default false,
  date        date not null default current_date,
  "readTime"  integer default 5,
  "titleAr"   text not null,
  "titleEn"   text not null,
  "excerptAr" text,
  "excerptEn" text,
  "contentAr" text,
  "contentEn" text,
  slug        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS
alter table public.knowledge_articles enable row level security;

-- Public read
create policy "Public can read articles"
  on public.knowledge_articles for select
  using (true);

-- Admin/manager/staff can insert/update/delete
create policy "Staff can manage articles"
  on public.knowledge_articles for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
        and role in ('admin', 'manager', 'staff')
    )
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger knowledge_articles_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();
