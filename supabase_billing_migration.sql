-- ================================================================
-- Billing Migration — run in Supabase SQL Editor
-- Adds plans, featured listings, Paddle customer tracking
-- ================================================================

-- Plan enum
create type public.billing_plan as enum ('free', 'growth', 'scale');

-- Subscription status enum
create type public.subscription_status as enum (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'unpaid'
);

-- paddle_customer_id on users
alter table public.users
  add column if not exists paddle_customer_id text unique;

-- plan on company_profiles
alter table public.company_profiles
  add column if not exists plan public.billing_plan not null default 'free';

-- featured columns on jobs
alter table public.jobs
  add column if not exists featured      boolean     not null default false;
alter table public.jobs
  add column if not exists featured_until timestamptz;

-- Index: candidates querying featured active jobs
create index if not exists idx_jobs_featured_status
  on public.jobs (status, featured, featured_until);

-- Subscriptions table (mirrors Paddle subscription state)
create table if not exists public.subscriptions (
  id                  text                         primary key,  -- Paddle subscription ID
  user_id             uuid                         not null references public.users on delete cascade,
  plan                public.billing_plan          not null,
  status              public.subscription_status   not null,
  current_period_end  timestamptz,
  created_at          timestamptz                  not null default now(),
  updated_at          timestamptz                  not null default now()
);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy "sub: own select"
  on public.subscriptions for select using (auth.uid() = user_id);
