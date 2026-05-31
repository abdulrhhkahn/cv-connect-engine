-- ============================================================
-- CV Connect Engine — Supabase Schema
-- Run this in: Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Enum types ──────────────────────────────────────────────
create type public.user_role           as enum ('candidate', 'company');
create type public.job_type            as enum ('full-time', 'part-time', 'contract', 'remote');
create type public.job_status          as enum ('draft', 'active', 'closed');
create type public.application_status  as enum ('pending', 'reviewed', 'shortlisted', 'rejected');
create type public.interview_mode      as enum ('video', 'phone', 'onsite');
create type public.interview_status    as enum ('scheduled', 'completed', 'cancelled', 'pending_confirmation', 'reschedule_proposed');
create type public.interview_party     as enum ('company', 'candidate');
create type public.notification_type   as enum ('interview', 'application', 'job', 'follow', 'system');
create type public.export_type         as enum ('share-link', 'pdf');

-- ── updated_at helper ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Tables ──────────────────────────────────────────────────

-- users (extends auth.users)
create table public.users (
  id          uuid references auth.users on delete cascade primary key,
  email       text        not null,
  name        text        not null,
  role        user_role   not null,
  company     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- candidate_profiles
create table public.candidate_profiles (
  user_id             uuid references public.users on delete cascade primary key,
  name                text        not null,
  email               text        not null,
  title               text,
  summary             text,
  skills              text[]      not null default '{}',
  experience          text,
  education           text,
  cv_url              text,
  cv_file_name        text,
  avatar_url          text,
  phone               text,
  linked_in           text,
  portfolio           text,
  location            text,
  industry_experience text[]      not null default '{}',
  soft_skills         text[]      not null default '{}',
  cultural_fit        text[]      not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- company_profiles
create table public.company_profiles (
  user_id       uuid references public.users on delete cascade primary key,
  company_name  text        not null,
  about         text,
  industry      text,
  location      text,
  size          text,
  website       text,
  contact_email text,
  contact_phone text,
  logo_url      text,
  banner_url    text,
  employees     jsonb       not null default '[]',
  followers     uuid[]      not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- jobs
create table public.jobs (
  id                  uuid        primary key default uuid_generate_v4(),
  company_id          uuid        not null references public.users on delete cascade,
  company_name        text        not null,
  title               text        not null,
  description         text        not null,
  requirements        text[]      not null default '{}',
  preferred_skills    text[]      not null default '{}',
  experience_required text,
  location            text        not null,
  type                job_type    not null,
  salary              text,
  status              job_status  not null default 'draft',
  industry_experience text[]      not null default '{}',
  soft_skills         text[]      not null default '{}',
  cultural_fit        text[]      not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- applications
create table public.applications (
  id              uuid               primary key default uuid_generate_v4(),
  job_id          uuid               not null references public.jobs on delete cascade,
  candidate_id    uuid               not null references public.users on delete cascade,
  candidate_name  text               not null,
  status          application_status not null default 'pending',
  match_score     integer            not null default 0,
  match_details   text,
  applied_at      timestamptz        not null default now(),
  decision_reason text,
  improvements    text[]             not null default '{}',
  missing_skills  text[]             not null default '{}',
  created_at      timestamptz        not null default now(),
  updated_at      timestamptz        not null default now()
);

-- interviews
create table public.interviews (
  id                    uuid             primary key default uuid_generate_v4(),
  job_id                uuid             not null references public.jobs on delete cascade,
  application_id        uuid             references public.applications on delete set null,
  company_id            uuid             not null references public.users on delete cascade,
  company_name          text             not null,
  candidate_id          uuid             not null references public.users on delete cascade,
  candidate_name        text             not null,
  job_title             text             not null,
  scheduled_at          timestamptz      not null,
  duration_mins         integer          not null,
  mode                  interview_mode   not null,
  location              text,
  notes                 text,
  status                interview_status not null default 'scheduled',
  candidate_confirmed   boolean          not null default false,
  proposed_by           interview_party,
  proposed_at           timestamptz,
  proposed_duration_mins integer,
  proposed_note         text,
  cancellation_reason   text,
  cancellation_message  text,
  cancelled_by          interview_party,
  cancelled_at          timestamptz,
  created_at            timestamptz      not null default now(),
  updated_at            timestamptz      not null default now()
);

-- notifications
create table public.notifications (
  id         uuid              primary key default uuid_generate_v4(),
  user_id    uuid              not null references public.users on delete cascade,
  title      text              not null,
  message    text              not null,
  type       notification_type not null,
  link       text,
  read       boolean           not null default false,
  created_at timestamptz       not null default now()
);

-- export_history
create table public.export_history (
  id           uuid        primary key default uuid_generate_v4(),
  company_id   uuid        not null references public.users on delete cascade,
  job_snapshot jsonb       not null,
  share_url    text        not null,
  type         export_type not null,
  created_at   timestamptz not null default now()
);

-- ── updated_at triggers ─────────────────────────────────────
create trigger trg_users_updated_at           before update on public.users             for each row execute function public.set_updated_at();
create trigger trg_candidate_profiles_upd     before update on public.candidate_profiles for each row execute function public.set_updated_at();
create trigger trg_company_profiles_upd       before update on public.company_profiles   for each row execute function public.set_updated_at();
create trigger trg_jobs_updated_at            before update on public.jobs               for each row execute function public.set_updated_at();
create trigger trg_applications_updated_at    before update on public.applications       for each row execute function public.set_updated_at();
create trigger trg_interviews_updated_at      before update on public.interviews         for each row execute function public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────
alter table public.users              enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.company_profiles   enable row level security;
alter table public.jobs               enable row level security;
alter table public.applications       enable row level security;
alter table public.interviews         enable row level security;
alter table public.notifications      enable row level security;
alter table public.export_history     enable row level security;

-- users
create policy "users: own row select"  on public.users for select using (auth.uid() = id);
create policy "users: own row insert"  on public.users for insert with check (auth.uid() = id);
create policy "users: own row update"  on public.users for update using (auth.uid() = id);

-- candidate_profiles
create policy "cp: owner CRUD"    on public.candidate_profiles for all    using  (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cp: company read"  on public.candidate_profiles for select using  (exists (select 1 from public.users where id = auth.uid() and role = 'company'));

-- company_profiles
create policy "co: owner CRUD"    on public.company_profiles for all    using  (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "co: auth read"     on public.company_profiles for select using  (auth.uid() is not null);

-- jobs
create policy "jobs: active read" on public.jobs for select using (status = 'active' or company_id = auth.uid());
create policy "jobs: company ins" on public.jobs for insert with check (auth.uid() = company_id);
create policy "jobs: company upd" on public.jobs for update using (auth.uid() = company_id);
create policy "jobs: company del" on public.jobs for delete using (auth.uid() = company_id);

-- applications
create policy "apps: candidate select" on public.applications for select using (auth.uid() = candidate_id);
create policy "apps: company select"   on public.applications for select using (exists (select 1 from public.jobs where jobs.id = applications.job_id and jobs.company_id = auth.uid()));
create policy "apps: candidate insert" on public.applications for insert with check (auth.uid() = candidate_id);
create policy "apps: candidate update" on public.applications for update using (auth.uid() = candidate_id);
create policy "apps: company update"   on public.applications for update using (exists (select 1 from public.jobs where jobs.id = applications.job_id and jobs.company_id = auth.uid()));

-- interviews
create policy "iv: involved select" on public.interviews for select using (auth.uid() = company_id or auth.uid() = candidate_id);
create policy "iv: company insert"  on public.interviews for insert with check (auth.uid() = company_id);
create policy "iv: involved update" on public.interviews for update using (auth.uid() = company_id or auth.uid() = candidate_id);

-- notifications
create policy "notif: own select"  on public.notifications for select using (auth.uid() = user_id);
create policy "notif: auth insert" on public.notifications for insert with check (auth.uid() is not null);  -- any authed user can notify any user
create policy "notif: own update"  on public.notifications for update using (auth.uid() = user_id);

-- export_history
create policy "eh: company select" on public.export_history for select using (auth.uid() = company_id);
create policy "eh: company insert" on public.export_history for insert with check (auth.uid() = company_id);

-- ── toggle_company_follow (security definer — bypasses RLS safely) ──
create or replace function public.toggle_company_follow(
  p_company_user_id  uuid,
  p_candidate_user_id uuid
)
returns void language plpgsql security definer as $$
declare
  cur_followers uuid[];
begin
  select followers into cur_followers
  from public.company_profiles
  where user_id = p_company_user_id;

  if cur_followers is null then
    cur_followers := '{}';
  end if;

  if p_candidate_user_id = any(cur_followers) then
    update public.company_profiles
    set followers = array_remove(cur_followers, p_candidate_user_id)
    where user_id = p_company_user_id;
  else
    update public.company_profiles
    set followers = array_append(cur_followers, p_candidate_user_id)
    where user_id = p_company_user_id;
  end if;
end;
$$;

grant execute on function public.toggle_company_follow to authenticated;
