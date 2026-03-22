import { ORDER_STATUS } from "@/lib/orders";
import type { Order } from "@/lib/orders/types";

type Props = {
  order: Order;
  updatingId: string | null;
  onUpdateStatus: (
    id: string,
    status: string,
    completed_at?: string | null,
    delivered_at?: string | null,
  ) => void | Promise<void>;
  size?: "table" | "card";
};

const buttonClass: Record<"table" | "card", { complete: string; deliver: string }> = {
  table: {
    complete:
      "rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-60",
    deliver:
      "rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-60",
  },
  card: {
    complete:
      "rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60",
    deliver:
      "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60",
  },
};

export function OrderRowActions({
  order,
  updatingId,
  onUpdateStatus,
  size = "table",
}: Props) {
  const cls = buttonClass[size];
  const disabled = updatingId === order.id;

  return (
    <>
      {order.status !== ORDER_STATUS.COMPLETED &&
        order.status !== ORDER_STATUS.DELIVERED && (
          <button
            type="button"
            onClick={() =>
              onUpdateStatus(
                order.id,
                ORDER_STATUS.COMPLETED,
                new Date().toISOString(),
                null,
              )
            }
            disabled={disabled}
            className={cls.complete}
          >
            Hoàn thành
          </button>
        )}
      {order.status !== ORDER_STATUS.DELIVERED && (
        <button
          type="button"
          onClick={() =>
            onUpdateStatus(
              order.id,
              ORDER_STATUS.DELIVERED,
              order.completed_at,
              new Date().toISOString(),
            )
          }
          disabled={disabled}
          className={cls.deliver}
        >
          Đã giao hàng
        </button>
      )}
    </>
  );
}
