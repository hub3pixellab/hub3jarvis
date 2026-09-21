import { supabase } from "@/integrations/supabase/client";
import { getZodiacSign } from "@/lib/zodiac";
import type { Profile } from "@/domain/models";

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Upsert the user's own profile. When birth_date is provided, the zodiac sign
 * is derived and kept in sync with the stored value.
 */
export async function upsertProfile(
  userId: string,
  patch: Partial<
    Pick<
      Profile,
      | "display_name"
      | "bio"
      | "birth_date"
      | "locale"
      | "phone"
      | "gender"
      | "sexuality"
    >
  >,
): Promise<Profile> {
  const birthDate = patch.birth_date ?? null;
  const zodiacSign = birthDate ? getZodiacSign(birthDate) : null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, ...patch, zodiac_sign: zodiacSign },
      { onConflict: "id" },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAvatarUrl(userId: string, avatarUrl: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Upload an avatar into the user's private folder and return its public URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
