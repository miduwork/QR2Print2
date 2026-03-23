import type {
  AdminStatsLiteResponse,
  AdminStatsResponse,
} from "@/lib/orders/adminStatsTypes";

/** Gộp dữ liệu poll lite vào snapshot dashboard hiện có, giữ nguyên trend/recent. */
export function mergeDashboardStatsWithLite(
  prev: AdminStatsResponse | null,
  lite: AdminStatsLiteResponse,
): AdminStatsResponse {
  if (!prev) {
    return {
      ordersToday: lite.ordersToday,
      unpaidCount: lite.unpaidCount,
      pendingPrintCount: lite.pendingPrintCount,
      highPriorityPendingCount: lite.highPriorityPendingCount,
      awaitingDeliveryCount: lite.awaitingDeliveryCount,
      recent_orders: [],
      orders_by_day: [],
      paid_orders_last_7_days: 0,
      max_created_at: lite.max_created_at,
    };
  }
  return {
    ...prev,
    ordersToday: lite.ordersToday,
    unpaidCount: lite.unpaidCount,
    pendingPrintCount: lite.pendingPrintCount,
    highPriorityPendingCount: lite.highPriorityPendingCount,
    awaitingDeliveryCount: lite.awaitingDeliveryCount,
    max_created_at: lite.max_created_at,
  };
}
