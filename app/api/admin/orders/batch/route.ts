import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import { patchForBatchAction } from "@/lib/orders/adminOrderBatchActions";
import {
  updateOrderForAdminWithClient,
} from "@/lib/orders/adminOrderData";
import {
  ADMIN_ORDER_BATCH_MAX_IDS,
  listOrdersByIdsForAdmin,
} from "@/lib/orders/adminOrderListQuery";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIds(body: unknown): string[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { ids?: unknown }).ids;
  if (!Array.isArray(raw)) return null;
  const ids = raw
    .filter((x): x is string => typeof x === "string" && UUID_RE.test(x))
    .slice(0, ADMIN_ORDER_BATCH_MAX_IDS);
  return ids;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }

    const ids = parseIds(body);
    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: "Thiếu hoặc không hợp lệ danh sách id (UUID)." },
        { status: 400 },
      );
    }

    const actionRaw = (body as { action?: unknown }).action;
    if (actionRaw !== "complete" && actionRaw !== "deliver") {
      return NextResponse.json(
        { error: "action phải là complete hoặc deliver." },
        { status: 400 },
      );
    }
    const action = actionRaw;

    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const { data: rows, error: listErr } = await listOrdersByIdsForAdmin(
      supabase,
      ids,
    );
    if (listErr) {
      console.error("[POST /api/admin/orders/batch] list", listErr);
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }

    const byId = new Map((rows ?? []).map((o) => [o.id, o]));
    const nowIso = new Date().toISOString();
    let updated = 0;
    let skipped = 0;
    const errors: { id: string; message: string }[] = [];

    for (const id of ids) {
      const order = byId.get(id);
      if (!order) {
        skipped += 1;
        errors.push({ id, message: "Không tìm thấy đơn." });
        continue;
      }
      const patch = patchForBatchAction(order, action, nowIso);
      if (!patch) {
        skipped += 1;
        continue;
      }
      const { error: upErr } = await updateOrderForAdminWithClient(
        supabase,
        id,
        patch,
      );
      if (upErr) {
        errors.push({ id, message: upErr.message });
      } else {
        updated += 1;
      }
    }

    return NextResponse.json({ updated, skipped, errors });
  } catch (e) {
    console.error("POST /api/admin/orders/batch:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật hàng loạt." },
      { status: 500 },
    );
  }
}
