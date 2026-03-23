/** Độ dài mã đơn ngắn dùng trong UI (8 ký tự đầu UUID). */
export const ORDER_SHORT_CODE_LEN = 8;

export function orderShortCode(id: string): string {
  return id.slice(0, ORDER_SHORT_CODE_LEN);
}

/** Đường dẫn trang chi tiết đơn trong admin (đồng nhất với Link). */
export function adminOrderDetailPath(id: string): string {
  return `/admin/orders/${encodeURIComponent(id)}`;
}
