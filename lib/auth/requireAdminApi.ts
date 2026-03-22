import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { userIsAdmin } from "@/lib/auth/adminSession";

export type RequireAdminApiResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

export async function requireAdminApiSession(
  supabase: SupabaseClient,
): Promise<RequireAdminApiResult> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!userIsAdmin(user)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
