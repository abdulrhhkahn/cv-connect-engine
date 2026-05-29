-- Supabase Schema for CV Connect Engine
-- Copy and paste this into the SQL editor in your Supabase dashboard

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type public.user_role as enum ('candidate', 'company');
create type public.job_type as enum ('full-time', 'part-time', 'contract', 'remote');
create type public.job_status as enum ('draft', 'active', 'closed');
create type public.application_status as enum ('pending', 'reviewed', 'shortlisted', 'rejected');
create type public.interview_mode as enum ('video', 'phone', 'onsite');
create type public.interview_status as enum ('scheduled', 'completed', 'cancelled', 'pending_confirmation', 'reschedule_proposed');
create type public.interview_proposed_by as enum ('company', 'candidate');
create type public.interview_cancelled_by as enum ('company', 'candidate');
create type public.notification_type as enum ('interview', 'application', 'job', 'follow', 'system');
create type public.export_type as enum ('share-link', 'pdf');

-- Helper function to update updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text not null,
  role user_role not null,
  company text,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- Candidate profiles
create table public.candidate_profiles (
  userId uuid references public.users not null primary key,
  name text not null,
  email text not null,
  title text,
  summary text,
  skills text[] default '{}',
  experience text,
  education text,
  cvUrl text,
  cvFileName text,
  avatarUrl text,
  phone text,
  linkedIn text,
  portfolio text,
  location text,
  industryExperience text[] default '{}',
  softSkills text[] default '{}',
  culturalFit text[] default '{}',
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  updatedAt timestamp with time zone default timezone('utc', now()) not null
);

-- Company profiles
create table public.company_profiles (
  userId uuid references public.users not null primary key,
  companyName text not null,
  about text,
  industry text,
  location text,
  size text,
  website text,
  contactEmail text,
  contactPhone text,
  logoUrl text,
  bannerUrl text,
  employees jsonb default '[]'::jsonb,
  followers uuid[] default '{}',
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  updatedAt timestamp with time zone default timezone('utc', now()) not null
);

-- Jobs
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  companyId uuid references public.users not null,
  companyName text not null,
  title text not null,
  description text not null,
  requirements text[] default '{}',
  preferredSkills text[] default '{}',
  experienceRequired text,
  location text not null,
  type job_type not null,
  salary text,
  status job_status default 'draft' not null,
  industryExperience text[] default '{}',
  softSkills text[] default '{}',
  culturalFit text[] default '{}',
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  updatedAt timestamp with time zone default timezone('utc', now()) not null
);

-- Applications
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  jobId uuid references public.jobs not null,
  candidateId uuid references public.users not null,
  candidateName text not null,
  status application_status default 'pending' not null,
  matchScore integer default 0,
  matchDetails text,
  appliedAt timestamp with time zone default timezone('utc', now()) not null,
  decisionReason text,
  improvements text[] default '{}',
  missingSkills text[] default '{}',
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  updatedAt timestamp with time zone default timezone('utc', now()) not null
);

-- Interviews
create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  jobId uuid references public.jobs not null,
  applicationId uuid references public.applications,
  companyId uuid references public.users not null,
  companyName text not null,
  candidateId uuid references public.users not null,
  candidateName text not null,
  jobTitle text not null,
  scheduledAt timestamp with time zone not null,
  durationMins integer not null,
  mode interview_mode not null,
  location text,
  notes text,
  status interview_status default 'scheduled' not null,
  candidateConfirmed boolean default false,
  proposedBy interview_proposed_by,
  proposedAt timestamp with time zone,
  proposedDurationMins integer,
  proposedNote text,
  cancellationReason text,
  cancellationMessage text,
  cancelledBy interview_cancelled_by,
  cancelledAt timestamp with time zone,
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  updatedAt timestamp with time zone default timezone('utc', now()) not null
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  userId uuid references public.users not null,
  title text not null,
  message text not null,
  type notification_type not null,
  link text,
  read boolean default false not null,
  createdAt timestamp with time zone default timezone('utc', now()) not null
);

-- Export history
create table public.export_history (
  id uuid default uuid_generate_v4() primary key,
  companyId uuid references public.users not null,
  jobSnapshot jsonb not null,
  shareUrl text not null,
  createdAt timestamp with time zone default timezone('utc', now()) not null,
  type export_type not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.notifications enable row level security;
alter table public.export_history enable row level security;

-- Policies for users
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert their own data"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Policies for candidate profiles
create policy "Users can view their own candidate profile"
  on public.candidate_profiles for select
  using (auth.uid() = userId);

create policy "Users can insert their own candidate profile"
  on public.candidate_profiles for insert
  with check (auth.uid() = userId);

create policy "Users can update their own candidate profile"
  on public.candidate_profiles for update
  using (auth.uid() = userId);

create policy "Users can delete their own candidate profile"
  on public.candidate_profiles for delete
  using (auth.uid() = userId);

-- Policies for company profiles
create policy "Users can view their own company profile"
  on public.company_profiles for select
  using (auth.uid() = userId);

create policy "Users can insert their own company profile"
  on public.company_profiles for insert
  with check (auth.uid() = userId);

create policy "Users can update their own company profile"
  on public.company_profiles for update
  using (auth.uid() = userId);

create policy "Users can delete their own company profile"
  on public.company_profiles for delete
  using (auth.uid() = userId);

-- Policies for jobs
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (status = 'active');

create policy "Company users can view their own jobs"
  on public.jobs for select
  using (auth.uid() = companyId);

create policy "Company users can insert jobs"
  on public.jobs for insert
  with check (auth.uid() = companyId);

create policy "Company users can update their own jobs"
  on public.jobs for update
  using (auth.uid() = companyId);

create policy "Company users can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = companyId);

-- Policies for applications
create policy "Anyone can view applications for jobs they own"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = applications.jobId
      and (jobs.status = 'active' or jobs.companyId = auth.uid())
    )
  );

create policy "Users can insert applications"
  on public.applications for insert
  with check (auth.uid() = candidateId);

create policy "Users can update their own applications"
  on public.applications for update
  using (auth.uid() = candidateId);

-- Policies for interviews
create policy "Users can view interviews they're involved in"
  on public.interviews for select
  using (
    auth.uid() = companyId
    or auth.uid() = candidateId
    or (
      select companyId from public.jobs where id = jobId
    ) = auth.uid()
  );

create policy "Users can insert interviews"
  on public.interviews for insert
  with check (
    auth.uid() = companyId
    or (
      select companyId from public.jobs where id = jobId
    ) = auth.uid()
  );

create policy "Users can update interviews they're involved in"
  on public.interviews for update
  using (
    auth.uid() = companyId
    or auth.uid() = candidateId
    or (
      select companyId from public.jobs where id = jobId
    ) = auth.uid()
  );

-- Policies for notifications
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = userId);

create policy "Users can insert notifications"
  on public.notifications for insert
  with check (auth.uid() = userId);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = userId);

-- Policies for export history
create policy "Company users can view their own export history"
  on public.export_history for select
  using (auth.uid() = companyId);

create policy "Company users can insert export history"
  on public.export_history for insert
  with check (auth.uid() = companyId);

-- Triggers for updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_candidate_profiles_updated_at
  before update on public.candidate_profiles
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_company_profiles_updated_at
  before update on public.company_profiles
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_jobs_updated_at
  before update on public.jobs
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_applications_updated_at
  before update on public.applications
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_interviews_updated_at
  before update on public.interviews
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_notifications_updated_at
  before update on public.notifications
  for each row
  execute procedure public.update_updated_at_column();

create trigger update_export_history_updated_at
  before update on public.export_history
  for each row
  execute procedure public.update_updated_at_column();

-- Insert some initial data for testing (optional)
-- insert into public.users (id, email, name, role, company) values
--   ('00000000-0000-0000-0000-000000000001', 'hr@techcorp.com', 'Sarah Chen', 'company', 'TechCorp'),
--   ('00000000-0000-0000-0000-000000000002', 'alex@email.com', 'Alex Rivera', 'candidate', null),
--   ('00000000-0000-0000-0000-000000000003', 'jordan@email.com', 'Jordan Kim', 'candidate', null)
-- on conflict do nothing;
