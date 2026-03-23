/** Một dòng trong danh sách đơn mới nhất trên dashboard. */
export type AdminRecentOrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  status: string;
  priority: string;
};

/** Số đơn tạo trong từng ngày lịch (VN), cũ → mới. */
export type OrdersByDayRow = {
  /** YYYY-MM-DD */
  date: string;
  count: number;
};

/** Payload JSON `GET /api/admin/stats` — dùng chung server và client. */
export type AdminStatsResponse = {
  ordersToday: number;
  unpaidCount: number;
  pendingPrintCount: number;
  /** Ưu tiên cao và vẫn chưa hoàn thành in. */
  highPriorityPendingCount: number;
  /** Đã in xong (đã hoàn thành), chưa giao hàng. */
  awaitingDeliveryCount: number;
  /** Một số đơn tạo gần đây nhất (mới nhất trước). */
  recent_orders: AdminRecentOrderRow[];
  /** 7 ngày lịch VN gần nhất (từ 6 ngày trước đến hôm nay), mỗi phần tử một ngày. */
  orders_by_day: OrdersByDayRow[];
  /** Đơn đã thanh toán có `created_at` trong 7 ngày lịch đó (cùng cửa sổ `orders_by_day`). */
  paid_orders_last_7_days: number;
  /** `max(created_at)` trên toàn bảng `orders` (ISO), hoặc null nếu không có đơn. */
  max_created_at: string | null;
};

/** Payload nhẹ cho polling thường xuyên: chỉ card counts + mốc đơn mới nhất. */
export type AdminStatsLiteResponse = Pick<
  AdminStatsResponse,
  | "ordersToday"
  | "unpaidCount"
  | "pendingPrintCount"
  | "highPriorityPendingCount"
  | "awaitingDeliveryCount"
  | "max_created_at"
>;
