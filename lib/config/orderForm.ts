/**
 * Cấu hình form đặt hàng & vùng phục vụ — một nguồn, dễ đổi khu vực.
 */

export const ORDER_DOCUMENT_BUCKET = "documents";

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPT_FILES =
  ".pdf,.doc,.docx,image/jpeg,image/png,image/gif,image/webp,image/jpg";

export const DELIVERY_WARDS = [
  "Phường Vũng Tàu",
  "Phường Tam Thắng",
  "Phường Rạch Dừa",
  "Phường Phước Thắng",
] as const;

export const DELIVERY_CITY = "TP. Hồ Chí Minh";

export type DeliveryWard = (typeof DELIVERY_WARDS)[number];

/** Freeship: nguồn thật tại [lib/config/business.ts] (re-export để import cũ không đổi). */
export {
  FREESHIP_THRESHOLD_VND,
  getFreeshipHintText,
} from "@/lib/config/business";
