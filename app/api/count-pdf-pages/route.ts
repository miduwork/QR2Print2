import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Thiếu file" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ file PDF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    const pageCount = pdfDoc.getPageCount();

    return NextResponse.json({ pageCount });
  } catch (err) {
    console.error("count-pdf-pages:", err);
    return NextResponse.json(
      { error: "Không đọc được file PDF." },
      { status: 500 }
    );
  }
}
