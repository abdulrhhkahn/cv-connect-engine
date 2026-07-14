-- ================================================================
-- Storage Migration — run in Supabase SQL Editor
-- Creates the "uploads" bucket for avatars, CVs, logos, banners
-- ================================================================

-- Create public bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  10485760,  -- 10 MB per file
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- ── Storage RLS policies ─────────────────────────────────────
-- Anyone can read (needed for public avatars, logos, etc.)
create policy "uploads: public read"
  on storage.objects for select
  using (bucket_id = 'uploads');

-- Authenticated users can upload to any path
create policy "uploads: auth insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads');

-- Users can update/delete only their own files
-- File paths follow: {type}/{user_id}/{filename}
-- e.g. avatars/abc123/avatar.jpg
create policy "uploads: own update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'uploads'
    and auth.uid()::text = (string_to_array(name, '/'))[2]
  );

create policy "uploads: own delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'uploads'
    and auth.uid()::text = (string_to_array(name, '/'))[2]
  );
