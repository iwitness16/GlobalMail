-- TrustLine Global – Shipments table
-- Run this in your Supabase SQL Editor to create the schema.

create table if not exists public.shipments (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- Core
  tracking_number     text not null unique,
  status              text not null default 'pending',
  delivery_mode       text not null default 'air_freight',
  journey_percent     integer not null default 0,

  -- Route
  origin              text not null default '',
  origin_lat          double precision not null default 0,
  origin_lng          double precision not null default 0,
  destination         text not null default '',
  destination_lat     double precision not null default 0,
  destination_lng     double precision not null default 0,
  current_location    text not null default '',
  current_lat         double precision not null default 0,
  current_lng         double precision not null default 0,

  -- Schedule
  carrier_ref         text not null default '',
  pickup_date         date,
  pickup_time         text,
  dispatch_datetime   timestamptz,
  expected_delivery   timestamptz,

  -- Shipper
  shipper_name        text not null default '',
  shipper_phone       text not null default '',
  shipper_email       text not null default '',
  shipper_address     text not null default '',

  -- Receiver
  receiver_name       text not null default '',
  receiver_phone      text not null default '',
  receiver_email      text not null default '',
  receiver_address    text not null default '',

  -- Shipment details
  shipment_type       text not null default '',
  product             text not null default '',
  payment_mode        text not null default 'unpaid',
  total_freight       numeric(12,2) not null default 0,
  weight_kg           numeric(10,2) not null default 0,
  quantity            integer not null default 1,
  comments            text not null default '',

  -- Packages array (jsonb)
  packages            jsonb not null default '[]',

  -- Admin notes / alerts
  publish_note        text,
  remarks             text,
  alert_type          text,                  -- null | info | warning | hold | customs | payment_required
  alert_message       text,
  fees_amount         numeric(12,2) not null default 0,

  -- History log (jsonb array)
  history             jsonb not null default '[]'
);

-- Allow anonymous reads (for customer tracking) – row-level security off for demo.
-- For production: enable RLS and add appropriate policies.
alter table public.shipments enable row level security;

-- Public read policy (anyone can look up a shipment by tracking number)
create policy "Public read shipments"
  on public.shipments for select
  using (true);

-- Allow all operations from service role / anon for demo
create policy "Anon full access"
  on public.shipments for all
  using (true)
  with check (true);
