import { ORDER_PRIORITY, ORDER_STATUS } from "@/lib/orders/types";

const BASE = "/admin/orders";

/** Danh sách đơn tạo trong ngày hôm nay (theo lịch VN, khớp thống kê). */
export function adminOrdersListHrefToday(): string {
  return `${BASE}?datePreset=today&page=0`;
}

/** Đơn chưa thanh toán (không ở trạng thái đã thanh toán). */
export function adminOrdersListHrefUnpaid(): string {
  return `${BASE}?payment=unpaid&page=0`;
}

/** Đơn trạng thái chưa hoàn thành in. */
export function adminOrdersListHrefPendingPrint(): string {
  const status = encodeURIComponent(ORDER_STATUS.PENDING);
  return `${BASE}?status=${status}&page=0`;
}

/** Ưu tiên cao và chưa hoàn thành in (khớp thống kê). */
export function adminOrdersListHrefHighPriorityPending(): string {
  const priority = encodeURIComponent(ORDER_PRIORITY.HIGH);
  const status = encodeURIComponent(ORDER_STATUS.PENDING);
  return `${BASE}?priority=${priority}&status=${status}&page=0`;
}

/** Đã hoàn thành in, chờ giao hàng. */
export function adminOrdersListHrefAwaitingDelivery(): string {
  const status = encodeURIComponent(ORDER_STATUS.COMPLETED);
  return `${BASE}?status=${status}&page=0`;
}
