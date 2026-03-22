import { PDFDocument } from "pdf-lib";

/** Đếm trang PDF trên server (pdf-lib), không gọi HTTP. */
export async function getPdfPageCountFromFile(
  file: File,
): Promise<number | null> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return null;
  }
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfDoc = await PDFDocument.load(buffer);
    return pdfDoc.getPageCount();
  } catch {
    return null;
  }
}
