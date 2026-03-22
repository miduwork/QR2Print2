import { NextResponse } from "next/server";
import { buildStorageObjectPath } from "@/lib/orders/createOrder";
import { ORDER_DOCUMENT_BUCKET } from "@/lib/orders/orderConstants";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Trả signed upload URL + path để client upload trực tiếp lên Storage;
 * sau đó gọi POST /api/orders (JSON) với cùng storagePath và fileName.
 */
export async function POST(request: Request) {
  try {
    let body: { fileName?: string };
    try {
      body = (await request.json()) as { fileName?: string };
    } catch {
      return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
    }

    const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
    if (!fileName) {
      return NextResponse.json({ error: "Thiếu fileName." }, { status: 400 });
    }

    const path = buildStorageObjectPath(fileName);
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(ORDER_DOCUMENT_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("createSignedUploadUrl:", error);
      return NextResponse.json(
        { error: error?.message || "Không tạo được URL upload." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  } catch (e) {
    console.error("POST /api/uploads/sign:", e);
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 });
  }
}
