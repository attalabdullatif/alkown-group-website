-- Alkown CRM platform extensions
-- Run in Supabase SQL Editor after reviewing table names and RLS policies.

-- Keep requests updated timestamp for public tracking and admin audit.
alter table public.requests
  add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_requests_updated_at on public.requests;
create trigger set_requests_updated_at
before update on public.requests
for each row
execute function public.set_updated_at();

-- Optional booking records if you want bookings separate from requests.
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  service text,
  preferred_date date,
  preferred_time text,
  message text,
  created_at timestamptz default now()
);

-- Request file records linked to Supabase Storage objects.
create table if not exists public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  file_type text not null check (file_type in ('Passport', 'ID Card', 'Photos', 'Supporting Documents')),
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Role management.
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('Admin', 'Manager', 'Staff')),
  created_at timestamptz default now(),
  unique(user_id)
);

-- Storage bucket for CRM files.
insert into storage.buckets (id, name, public)
values ('request-documents', 'request-documents', false)
on conflict (id) do nothing;

-- Helpful indexes.
create index if not exists idx_clients_email on public.clients(email);
create index if not exists idx_clients_phone on public.clients(phone);
create index if not exists idx_requests_request_number on public.requests(request_number);
create index if not exists idx_requests_status on public.requests(status);
create index if not exists idx_requests_client_id on public.requests(client_id);
create index if not exists idx_request_files_request_id on public.request_files(request_id);
