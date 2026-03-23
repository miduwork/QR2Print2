import type { Order } from "@/lib/orders/types";
import { formatDateTime, getRelativeTime } from "@/lib/utils/relativeTime";

/** Khối dòng thời gian trên card mobile (một nguồn format với bảng). */
export function AdminOrderMobileTimestamps({ order }: { order: Order }) {
  return (
    <>
      <p className="text-xs text-placeholder">
        Tạo đơn: {getRelativeTime(order.created_at)} · {formatDateTime(order.created_at)}
      </p>
      {order.completed_at && (
        <p className="text-xs text-placeholder">
          Hoàn thành: {getRelativeTime(order.completed_at)} ·{" "}
          {formatDateTime(order.completed_at)}
        </p>
      )}
      {order.delivered_at && (
        <p className="text-xs text-placeholder">
          Giao hàng: {getRelativeTime(order.delivered_at)} ·{" "}
          {formatDateTime(order.delivered_at)}
        </p>
      )}
    </>
  );
}
