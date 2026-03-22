import { ORDER_PRIORITY } from "@/lib/orders";
import type { Order } from "@/lib/orders/types";

type Props = {
  order: Order;
  updatingId: string | null;
  onPriorityChange: (orderId: string, priority: string) => void;
  /** Bảng: focus ring; card: gọn hơn. */
  variant?: "table" | "card";
  className?: string;
};

const variantClass: Record<"table" | "card", string> = {
  table:
    "rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-focusRing",
  card:
    "rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground",
};

export function OrderPrioritySelect({
  order,
  updatingId,
  onPriorityChange,
  variant = "table",
  className,
}: Props) {
  return (
    <select
      value={order.priority}
      onChange={(e) => onPriorityChange(order.id, e.target.value)}
      disabled={updatingId === order.id}
      className={className ?? variantClass[variant]}
    >
      <option value={ORDER_PRIORITY.LOW}>{ORDER_PRIORITY.LOW}</option>
      <option value={ORDER_PRIORITY.NORMAL}>{ORDER_PRIORITY.NORMAL}</option>
      <option value={ORDER_PRIORITY.HIGH}>{ORDER_PRIORITY.HIGH}</option>
    </select>
  );
}
