-- ================================================================
-- Migration: add handle_new_auth_user trigger
-- Run this if you already executed the original supabase_schema.sql
-- Supabase dashboard → SQL Editor → New query → Run
-- ================================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role    public.user_role;
  v_name    text;
  v_company text;
  v_email   text;
begin
  v_email   := new.email;
  v_name    := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(v_email, '@', 1),
    'User'
  );
  v_role    := coalesce(new.raw_user_meta_data->>'role', 'candidate')::public.user_role;
  v_company := new.raw_user_meta_data->>'company';

  insert into public.users (id, email, name, role, company)
  values (new.id, v_email, v_name, v_role, v_company)
  on conflict (id) do nothing;

  if v_role = 'candidate' then
    insert into public.candidate_profiles (
      user_id, name, email,
      title, summary, skills, experience, education,
      cv_url, cv_file_name, avatar_url, phone, linked_in,
      portfolio, location, industry_experience, soft_skills, cultural_fit
    ) values (
      new.id, v_name, v_email,
      '', '', '{}'::text[], '', '',
      null, null, null, null, null,
      null, null, '{}'::text[], '{}'::text[], '{}'::text[]
    )
    on conflict (user_id) do nothing;
  else
    insert into public.company_profiles (
      user_id, company_name, about, industry, location, size,
      website, contact_email, contact_phone,
      logo_url, banner_url, employees, followers
    ) values (
      new.id, coalesce(v_company, v_name), '', '', '', '',
      '', v_email, '',
      null, null, '[]'::jsonb, '{}'::uuid[]
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
