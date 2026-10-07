-- Global Mail Express: Bills table
-- Run this in your Supabase SQL Editor

create table if not exists public.bills (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  title         text not null,
  description   text not null default '',
  amount        numeric(12,2) not null default 0,
  currency      text not null default 'USD',
  bill_type     text not null default 'custom',  -- custom | import_duty | storage | handling | inspection | insurance
  tracking_ref  text not null default '',        -- optional shipment tracking number
  status        text not null default 'unpaid'   -- unpaid | paid
);

alter table public.bills enable row level security;

create policy "Anon full access bills"
  on public.bills for all using (true) with check (true);
