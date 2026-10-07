-- Reverse previous bills table and replace with simple bill-name lookup
-- Run this in your Supabase SQL Editor

drop table if exists public.bills;

create table public.bills (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null unique
);

alter table public.bills enable row level security;

create policy "Anon full access bills"
  on public.bills for all using (true) with check (true);
