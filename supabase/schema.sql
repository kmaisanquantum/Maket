-- ============================================================
-- maket.dspng.tech — Supabase Database Schema (Updated with Vanilla)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PRICES TABLE ────────────────────────────────────────────────────────────
create table if not exists public.prices (
  id              uuid primary key default uuid_generate_v4(),
  commodity       text not null check (commodity in ('coffee', 'cocoa', 'vanilla')),
  price_pgk       numeric(10,2) not null,   -- PGK per kg
  price_usd       numeric(10,4) not null,   -- USD per kg (reference)
  source          text not null default 'Manual',  -- CCDA / CIC / Manual
  region          text not null default 'National',
  week_change_pct numeric(6,2) default null, -- e.g. +2.50 or -1.20
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Index for fast commodity queries
create index if not exists prices_commodity_idx on public.prices(commodity);
create index if not exists prices_updated_idx on public.prices(updated_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as 1255
begin
  new.updated_at = now();
  return new;
end;
1255 language plpgsql;

create trigger prices_updated_at
  before update on public.prices
  for each row execute procedure public.handle_updated_at();

-- Row-Level Security: Anyone can read prices
alter table public.prices enable row level security;
create policy "Prices are publicly readable" on public.prices
  for select using (true);
create policy "Service role can manage prices" on public.prices
  using (auth.role() = 'service_role');

-- ─── Seed Data ────────────────────────────────────────────────────────────────
insert into public.prices (commodity, price_pgk, price_usd, source, region, week_change_pct) values
  ('coffee', 18.50, 5.02, 'CIC', 'Eastern Highlands', 2.3),
  ('coffee', 17.80, 4.83, 'CIC', 'Western Highlands', -0.5),
  ('cocoa', 14.20, 3.85, 'CCDA', 'East New Britain', 5.7),
  ('cocoa', 13.50, 3.66, 'CCDA', 'Madang', 0.8),
  ('vanilla', 350.00, 95.12, 'Manual', 'East Sepik (Grade A)', 1.2),
  ('vanilla', 280.00, 76.09, 'Manual', 'Madang (Grade B)', -2.5);


-- ─── TRANSPORT REQUESTS TABLE ─────────────────────────────────────────────────
create table if not exists public.transport_requests (
  id                 uuid primary key default uuid_generate_v4(),
  farmer_name        text not null,
  phone              text not null,
  province           text not null,
  village            text not null,
  commodity          text not null check (commodity in ('coffee', 'cocoa', 'vanilla')),
  quantity_kg        integer not null check (quantity_kg > 0),
  pickup_date        date not null,
  destination        text not null,
  offered_price_pgk  numeric(10,2) default null,  -- optional offered rate
  notes              text default null,
  status             text not null default 'open' check (status in ('open', 'matched', 'completed')),
  driver_name        text default null,
  driver_phone       text default null,
  created_at         timestamptz not null default now()
);

-- Indexes
create index if not exists transport_status_idx on public.transport_requests(status);
create index if not exists transport_commodity_idx on public.transport_requests(commodity);
create index if not exists transport_created_idx on public.transport_requests(created_at desc);

-- Row-Level Security: Public read, public insert (farmers post loads)
alter table public.transport_requests enable row level security;
create policy "Transport requests are publicly readable" on public.transport_requests
  for select using (true);
create policy "Anyone can post a transport request" on public.transport_requests
  for insert with check (true);
create policy "Service role can update/delete" on public.transport_requests
  using (auth.role() = 'service_role');

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Enable Realtime for live updates on both tables
alter publication supabase_realtime add table public.prices;
alter publication supabase_realtime add table public.transport_requests;
