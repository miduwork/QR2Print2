import { type NextRequest, NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import {
  listOrdersForAdminFiltered,
  parseAdminOrderListParams,
} from "@/lib/orders/adminOrderListQuery";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Tránh Next cố static hóa route khi build (route dùng cookies qua Supabase). */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const params = parseAdminOrderListParams(request.nextUrl.searchParams);
    const { data, error, hasMore, total, nextCursor } = await listOrdersForAdminFiltered(
      supabase,
      params,
    );
    if (error) {
      console.error("[GET /api/admin/orders]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      orders: data ?? [],
      hasMore,
      total,
      limit: params.limit,
      offset: params.offset,
      currentCursor: params.cursor,
      nextCursor,
    });
  } catch (e) {
    console.error("GET /api/admin/orders:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải đơn." },
      { status: 500 },
    );
  }
}
