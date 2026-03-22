import { NextResponse } from "next/server";
import { MAX_FILE_SIZE_BYTES } from "@/lib/config/orderForm";
import {
  executeCreateCustomerOrderFromFile,
  executeCreateCustomerOrderFromStoragePath,
} from "@/lib/orders/createOrderFromRequest";
import {
  parseOrderSnapshotFromFormData,
  parseOrderSnapshotFromJson,
} from "@/lib/orders/orderFormParsing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: "Body JSON không hợp lệ." }, { status: 400 });
      }

      const parsed = parseOrderSnapshotFromJson(body);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.message }, { status: 400 });
      }

      const storagePath =
        typeof body.storagePath === "string" ? body.storagePath.trim() : "";
      const fileName =
        typeof body.fileName === "string" ? body.fileName.trim() : "";
      if (!storagePath || !fileName) {
        return NextResponse.json(
          {
            error:
              "Thiếu storagePath hoặc fileName (dùng sau khi upload bằng signed URL).",
          },
          { status: 400 },
        );
      }

      const result = await executeCreateCustomerOrderFromStoragePath(
        fileName,
        storagePath,
        parsed.snap,
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ orderId: result.orderId });
    }

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type phải là multipart/form-data hoặc application/json." },
        { status: 415 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu file." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File vượt quá dung lượng cho phép." }, { status: 400 });
    }

    const parsed = parseOrderSnapshotFromFormData(formData);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.message }, { status: 400 });
    }

    const result = await executeCreateCustomerOrderFromFile(file, parsed.snap);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ orderId: result.orderId });
  } catch (e) {
    console.error("POST /api/orders:", e);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tạo đơn." },
      { status: 500 },
    );
  }
}
