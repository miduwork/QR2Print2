import { createClient } from "@supabase/supabase-js";
import { serverConfig } from "@/lib/config/server";

/**
 * Supabase client dùng Service Role Key — chỉ dùng trên server (API routes, server actions).
 * Bỏ qua RLS; dùng cho webhook, cron, admin.
 */
export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = serverConfig;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
