-- Residency & Citizenship page content (CMS)
create table if not exists residency_page_content (
  id                   integer primary key default 1,
  hero_title_ar        text,
  hero_title_en        text,
  hero_desc_ar         text,
  hero_desc_en         text,
  residency_programs   jsonb,
  citizenship_programs jsonb,
  updated_at           timestamptz default now(),
  updated_by           uuid references auth.users(id)
);

-- Only one row allowed (id = 1)
alter table residency_page_content enable row level security;

create policy "Admins can manage residency content"
  on residency_page_content for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'manager')
    )
  );

create policy "Public can read residency content"
  on residency_page_content for select
  using (true);
