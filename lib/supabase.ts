/** @see README — Kiến trúc Supabase client (singleton anon, Realtime thanh toán). */
import { createClient } from "@supabase/supabase-js";
import { publicConfig } from "@/lib/config/public";

export const supabase = createClient(
  publicConfig.supabaseUrl,
  publicConfig.supabaseAnonKey,
);
