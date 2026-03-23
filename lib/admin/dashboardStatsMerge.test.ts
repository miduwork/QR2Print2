import { describe, expect, it } from "vitest";
import { mergeDashboardStatsWithLite } from "@/lib/admin/dashboardStatsMerge";
import type { AdminStatsLiteResponse, AdminStatsResponse } from "@/lib/orders/adminStatsTypes";

const lite: AdminStatsLiteResponse = {
  ordersToday: 9,
  unpaidCount: 8,
  pendingPrintCount: 7,
  highPriorityPendingCount: 6,
  awaitingDeliveryCount: 5,
  max_created_at: "2026-03-23T12:34:56.000Z",
};

describe("mergeDashboardStatsWithLite", () => {
  it("does not overwrite recent_orders or orders_by_day", () => {
    const prev: AdminStatsResponse = {
      ordersToday: 1,
      unpaidCount: 2,
      pendingPrintCount: 3,
      highPriorityPendingCount: 4,
      awaitingDeliveryCount: 5,
      recent_orders: [
        {
          id: "a",
          created_at: "2026-03-23T10:00:00.000Z",
          customer_name: "A",
          status: "Chưa hoàn thành",
          priority: "Ưu tiên",
        },
      ],
      orders_by_day: [{ date: "2026-03-23", count: 12 }],
      paid_orders_last_7_days: 10,
      max_created_at: "2026-03-23T10:00:00.000Z",
    };

    const merged = mergeDashboardStatsWithLite(prev, lite);
    expect(merged.recent_orders).toEqual(prev.recent_orders);
    expect(merged.orders_by_day).toEqual(prev.orders_by_day);
    expect(merged.paid_orders_last_7_days).toBe(prev.paid_orders_last_7_days);
    expect(merged.ordersToday).toBe(lite.ordersToday);
    expect(merged.max_created_at).toBe(lite.max_created_at);
  });
});
