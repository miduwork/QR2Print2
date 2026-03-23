import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import { computeAdminStatsLiteForApi } from "@/lib/orders/adminStats.server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const { data, error } = await computeAdminStatsLiteForApi(supabase);
    if (error) {
      console.error("[GET /api/admin/stats/lite]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error("GET /api/admin/stats/lite:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải thống kê nhẹ." },
      { status: 500 },
    );
  }
}
