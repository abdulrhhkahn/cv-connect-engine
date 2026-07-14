/**
 * storage.ts — Supabase Storage helpers
 *
 * All user files go into the "uploads" bucket under:
 *   avatars/{userId}/avatar.{ext}
 *   cvs/{userId}/{original_filename}
 *   logos/{userId}/logo.{ext}
 *   banners/{userId}/banner.{ext}
 */

import { supabase } from './supabase';

const BUCKET = 'uploads';

async function upload(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadAvatar = (userId: string, file: File) => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return upload(`avatars/${userId}/avatar.${ext}`, file);
};

export const uploadCv = (userId: string, file: File) =>
  upload(`cvs/${userId}/${file.name}`, file);

export const uploadLogo = (userId: string, file: File) => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return upload(`logos/${userId}/logo.${ext}`, file);
};

export const uploadBanner = (userId: string, file: File) => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  return upload(`banners/${userId}/banner.${ext}`, file);
};
