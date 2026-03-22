import { calculateGrandTotal } from "@/lib/payments/pricing";
import { DELIVERY_CITY } from "@/lib/config/orderForm";
import type { DeliveryMethod } from "@/lib/orders/delivery";
import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";
import type { OrderInsert } from "@/lib/types";

export type OrderFormSnapshot = {
  customerName: string;
  phone: string;
  note: string;
  copiesInput: string;
  pageCountInput: string;
  deliveryMethod: DeliveryMethod;
  deliveryDistrict: string;
  deliveryDetail: string;
  printColor: PrintColor;
  printSides: PrintSides;
};

/** Kết quả validate sync trước khi đếm trang / upload. */
export type OrderFormValidationResult =
  | { ok: true; copies: number }
  | { ok: false; message: string };

/**
 * Validate tên, SĐT, file, số bản, địa chỉ giao.
 */
export function validateOrderForm(
  snap: OrderFormSnapshot,
  file: File | null,
): OrderFormValidationResult {
  if (!snap.customerName.trim()) {
    return { ok: false, message: "Vui lòng nhập tên khách hàng." };
  }
  if (!snap.phone.trim()) {
    return { ok: false, message: "Vui lòng nhập số điện thoại." };
  }
  if (!file) {
    return { ok: false, message: "Vui lòng chọn file tài liệu cần in." };
  }

  const parsedCopies = snap.copiesInput.trim()
    ? parseInt(snap.copiesInput.trim(), 10)
    : 1;
  if (!Number.isFinite(parsedCopies) || parsedCopies <= 0) {
    return { ok: false, message: "Vui lòng nhập số bản in (>= 1)." };
  }

  if (
    snap.deliveryMethod === "delivery" &&
    (!DELIVERY_CITY.trim() ||
      !snap.deliveryDistrict.trim() ||
      !snap.deliveryDetail.trim())
  ) {
    return {
      ok: false,
      message: "Vui lòng nhập đầy đủ: Xã/Phường và địa chỉ chi tiết.",
    };
  }

  return { ok: true, copies: parsedCopies };
}

/**
 * Xác định số trang sau khi đã có file (có thể gọi API đếm PDF).
 */
export async function resolveDocumentTotalPages(
  file: File,
  pageCountInput: string,
  getPdfPageCount: (f: File) => Promise<number | null>,
): Promise<{ ok: true; totalPages: number } | { ok: false; message: string }> {
  const isPdf = file.name.toLowerCase().endsWith(".pdf");
  const enteredPages = pageCountInput.trim()
    ? parseInt(pageCountInput.trim(), 10)
    : null;

  if (isPdf && enteredPages !== null) {
    const actualCount = await getPdfPageCount(file);
    if (actualCount !== null && actualCount !== enteredPages) {
      return {
        ok: false,
        message: `Số trang không đúng. File PDF có ${actualCount} trang. Vui lòng nhập lại.`,
      };
    }
  }

  if (enteredPages != null && enteredPages > 0) {
    return { ok: true, totalPages: enteredPages };
  }
  if (isPdf) {
    const pdfCount = await getPdfPageCount(file);
    if (pdfCount == null || pdfCount < 1) {
      return {
        ok: false,
        message: "Không đọc được số trang PDF. Vui lòng nhập số trang.",
      };
    }
    return { ok: true, totalPages: pdfCount };
  }
  return { ok: false, message: "Vui lòng nhập số trang." };
}

export function buildNewOrderId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function buildStorageObjectPath(fileName: string): string {
  return `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
}

/** Dựng payload insert sau khi đã có URL file và số trang. */
export function buildOrderPayload(params: {
  id: string;
  customerName: string;
  phone: string;
  note: string;
  fileName: string;
  fileUrl: string;
  totalPages: number;
  copies: number;
  deliveryMethod: DeliveryMethod;
  deliveryDetail: string;
  deliveryDistrict: string;
  printColor: PrintColor;
  printSides: PrintSides;
}): OrderInsert {
  const grand = calculateGrandTotal(
    params.totalPages,
    params.copies,
    params.deliveryMethod,
  );
  const fullAddress =
    params.deliveryMethod === "delivery"
      ? `${params.deliveryDetail.trim()}, ${params.deliveryDistrict.trim()}, ${DELIVERY_CITY.trim()}`
      : null;

  return {
    id: params.id,
    customer_name: params.customerName.trim(),
    phone_number: params.phone.trim(),
    file_url: params.fileUrl,
    file_name: params.fileName,
    note: params.note.trim() || null,
    page_count: params.totalPages,
    total_pages: params.totalPages,
    total_price: grand.total,
    copies: params.copies,
    print_color: params.printColor,
    print_sides: params.printSides,
    delivery_method: params.deliveryMethod,
    delivery_address: fullAddress,
    shipping_fee: grand.shippingFee,
  };
}
