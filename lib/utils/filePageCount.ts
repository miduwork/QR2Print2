/**
 * Lấy số trang thực tế của file PDF (gọi API, dùng để kiểm tra khi user nhập số trang).
 */
export async function getPdfPageCount(file: File): Promise<number | null> {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return null;
  }
  try {
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/count-pdf-pages", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.pageCount === "number" ? data.pageCount : null;
  } catch {
    return null;
  }
}
