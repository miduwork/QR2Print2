import { ORDER_PRIORITY, type Order } from "@/lib/types";

const PRIORITY_WEIGHT: Record<string, number> = {
  [ORDER_PRIORITY.HIGH]: 3,
  [ORDER_PRIORITY.NORMAL]: 2,
  [ORDER_PRIORITY.LOW]: 1,
};

/** Ưu tiên cao trước; cùng mức thì đơn cũ nhất trước. */
export function sortOrdersByPriorityThenCreatedAt(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const pa = PRIORITY_WEIGHT[a.priority] ?? 0;
    const pb = PRIORITY_WEIGHT[b.priority] ?? 0;
    if (pb !== pa) return pb - pa;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}
