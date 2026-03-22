import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadPublicDocument(
  client: SupabaseClient,
  bucket: string,
  path: string,
  file: File,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    return { ok: false, message: error.message || "Upload file thất bại." };
  }
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { ok: true, publicUrl: data.publicUrl };
}
