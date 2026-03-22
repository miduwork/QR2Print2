import type { User } from "@supabase/supabase-js";

/** Khớp RLS: `app_metadata.role` phải là `'admin'` (JWT / Supabase Dashboard). */
export function userIsAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "admin";
}
