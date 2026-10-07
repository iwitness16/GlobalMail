-- Global Mail Express: add motion_segments column
-- Run this in your Supabase SQL Editor

alter table public.shipments
  add column if not exists motion_segments jsonb not null default '[]';
