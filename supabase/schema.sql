-- Studio PM schema
-- Run this once in your Supabase project's SQL editor (Database > SQL Editor > New query).
-- Safe to re-run: uses "if not exists" / "or replace" throughout.
--
-- This is designed to run in the SAME Supabase project as the Studio
-- Inventory app (studioinv1/supabase/schema.sql), so both apps share one
-- Postgres database and one set of auth.users. That's what lets gear-type
-- items here link to real rows in the Inventory app's `items` table via a
-- live query, instead of a manual JSON snapshot import.
--
-- `gear_item_id` below is a plain uuid, not a foreign key into
-- `public.items` — deliberately, so this schema doesn't require the
-- Inventory app's schema to exist first (or at all, if you ever run this
-- app standalone against its own project). The app's own UI is what
-- reconciles a stale/missing gear_item_id, same as the local-mode manual
-- snapshot import it falls back to when Supabase isn't configured.

create extension if not exists "pgcrypto";

-- `id` is text, not uuid, and always supplied by the app on insert (see
-- lib/data/DataProvider.tsx's genId()) rather than DB-generated. That's
-- deliberate: the seed data ships with human-readable cross-referencing ids
-- (e.g. "s0-building-permit", referenced by other rows' depends_on) baked
-- in from Master Summary v14, and a DB-assigned uuid default would break
-- those references on first cloud sign-in.
create table if not exists public.project_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  stage int not null check (stage between 0 and 9),
  name text not null,
  type text not null check (type in ('gear', 'task', 'decision')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'approved', 'blocked', 'done')),
  date date,
  notes text,
  category text,
  depends_on text[] not null default '{}',
  gear_item_id uuid,
  provisional boolean not null default false,
  source_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_items_user_id_idx on public.project_items (user_id);
create index if not exists project_items_stage_idx on public.project_items (stage);
create index if not exists project_items_status_idx on public.project_items (status);

create table if not exists public.decisions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  category text,
  version text not null default 'unversioned',
  resolved_date date,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists decisions_user_id_idx on public.decisions (user_id);

create table if not exists public.budget_lines (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  name text not null,
  budget_low numeric not null default 0,
  budget_mid numeric not null default 0,
  budget_high numeric not null default 0,
  committed numeric not null default 0,
  actual numeric not null default 0,
  provisional boolean not null default false,
  notes text,
  linked_item_id text references public.project_items (id) on delete set null,
  gear_item_id uuid,
  source_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_lines_user_id_idx on public.budget_lines (user_id);
create index if not exists budget_lines_category_idx on public.budget_lines (category);

-- Keep updated_at current automatically. "create or replace" so this is
-- safe whether or not the Inventory app's schema already defined it.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists project_items_set_updated_at on public.project_items;
create trigger project_items_set_updated_at
  before update on public.project_items
  for each row execute function public.set_updated_at();

drop trigger if exists decisions_set_updated_at on public.decisions;
create trigger decisions_set_updated_at
  before update on public.decisions
  for each row execute function public.set_updated_at();

drop trigger if exists budget_lines_set_updated_at on public.budget_lines;
create trigger budget_lines_set_updated_at
  before update on public.budget_lines
  for each row execute function public.set_updated_at();

-- Row Level Security: every user only ever sees their own project data.
alter table public.project_items enable row level security;
alter table public.decisions enable row level security;
alter table public.budget_lines enable row level security;

drop policy if exists "project_items are owner-only" on public.project_items;
create policy "project_items are owner-only"
  on public.project_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "decisions are owner-only" on public.decisions;
create policy "decisions are owner-only"
  on public.decisions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "budget_lines are owner-only" on public.budget_lines;
create policy "budget_lines are owner-only"
  on public.budget_lines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No new tables or policies needed for gear reconciliation: this app reads
-- public.items directly (SELECT only, never writes to it), and the
-- Inventory app's own "items are owner-only" RLS policy already restricts
-- that to rows where auth.uid() = user_id — the same signed-in user gets
-- the same restriction here for free, since both apps share one
-- auth.users table.
