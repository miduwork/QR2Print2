import { type NextRequest, NextResponse } from "next/server";
import { ordersToCsv } from "@/lib/admin/exportOrdersCsv";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import {
  ADMIN_ORDER_BATCH_MAX_IDS,
  listOrdersByIdsForAdmin,
  listOrdersForAdminFiltered,
  parseAdminOrderExportParams,
} from "@/lib/orders/adminOrderListQuery";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const params = parseAdminOrderExportParams(request.nextUrl.searchParams);
    const { data, error } = await listOrdersForAdminFiltered(supabase, params);
    if (error) {
      console.error("[GET /api/admin/orders/export]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = ordersToCsv(data ?? []);
    const filename = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
    return csvResponse(csv, filename);
  } catch (e) {
    console.error("GET /api/admin/orders/export:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xuất CSV." },
      { status: 500 },
    );
  }
}

/** Xuất CSV theo danh sách id (chọn trên UI). */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }

    const raw = (body as { ids?: unknown }).ids;
    if (!Array.isArray(raw)) {
      return NextResponse.json({ error: "Thiếu ids." }, { status: 400 });
    }
    const ids = raw
      .filter((x): x is string => typeof x === "string" && UUID_RE.test(x))
      .slice(0, ADMIN_ORDER_BATCH_MAX_IDS);
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách id rỗng hoặc không hợp lệ." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const { data, error } = await listOrdersByIdsForAdmin(supabase, ids);
    if (error) {
      console.error("[POST /api/admin/orders/export]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const csv = ordersToCsv(data ?? []);
    const filename = `don-hang-chon-${new Date().toISOString().slice(0, 10)}.csv`;
    return csvResponse(csv, filename);
  } catch (e) {
    console.error("POST /api/admin/orders/export:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xuất CSV." },
      { status: 500 },
    );
  }
}
