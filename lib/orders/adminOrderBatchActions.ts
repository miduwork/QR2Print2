import type { Order } from "@/lib/orders/types";
import { ORDER_STATUS } from "@/lib/orders/types";
import type { AdminOrderPatch } from "@/lib/orders/adminOrderData";

export type AdminBatchAction = "complete" | "deliver";

/** Trả về patch nếu áp dụng được; null = bỏ qua đơn này. */
export function patchForBatchAction(
  order: Pick<Order, "status" | "completed_at" | "delivered_at">,
  action: AdminBatchAction,
  nowIso: string,
): AdminOrderPatch | null {
  if (action === "complete") {
    if (
      order.status === ORDER_STATUS.COMPLETED ||
      order.status === ORDER_STATUS.DELIVERED
    ) {
      return null;
    }
    return {
      status: ORDER_STATUS.COMPLETED,
      completed_at: nowIso,
      delivered_at: null,
    };
  }
  if (action === "deliver") {
    if (order.status === ORDER_STATUS.DELIVERED) {
      return null;
    }
    return {
      status: ORDER_STATUS.DELIVERED,
      completed_at: order.completed_at,
      delivered_at: nowIso,
    };
  }
  return null;
}
