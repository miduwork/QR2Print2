import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/auth/requireAdminApi";
import {
  type AdminOrderPatch,
  updateOrderForAdminWithClient,
} from "@/lib/orders/adminOrderData";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PATCH_KEYS = [
  "status",
  "priority",
  "completed_at",
  "delivered_at",
] as const;

function parseAdminPatch(body: unknown): AdminOrderPatch | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const patch: AdminOrderPatch = {};
  for (const key of PATCH_KEYS) {
    if (!(key in o)) continue;
    const v = o[key];
    if (key === "completed_at" || key === "delivered_at") {
      if (v === null) {
        (patch as Record<string, unknown>)[key] = null;
      } else if (typeof v === "string") {
        (patch as Record<string, unknown>)[key] = v;
      } else {
        return null;
      }
    } else if (key === "status" || key === "priority") {
      if (typeof v === "string") (patch as Record<string, unknown>)[key] = v;
      else return null;
    }
  }
  return Object.keys(patch).length > 0 ? patch : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Thiếu id đơn." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }

    const patch = parseAdminPatch(body);
    if (!patch) {
      return NextResponse.json(
        { error: "Payload không hợp lệ hoặc rỗng." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const gate = await requireAdminApiSession(supabase);
    if (!gate.ok) return gate.response;

    const { error } = await updateOrderForAdminWithClient(supabase, id, patch);
    if (error) {
      console.error("[PATCH /api/admin/orders/[id]]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/orders/[id]:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi cập nhật đơn." },
      { status: 500 },
    );
  }
}
