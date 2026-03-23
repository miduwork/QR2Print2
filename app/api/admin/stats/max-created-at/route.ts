import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import { getAdminOrdersMaxCreatedAt } from "@/lib/orders/adminStats.server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const { data, error } = await getAdminOrdersMaxCreatedAt(supabase);
    if (error) {
      console.error("[GET /api/admin/stats/max-created-at]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ max_created_at: data });
  } catch (e) {
    console.error("GET /api/admin/stats/max-created-at:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải mốc đơn mới nhất." },
      { status: 500 },
    );
  }
}
