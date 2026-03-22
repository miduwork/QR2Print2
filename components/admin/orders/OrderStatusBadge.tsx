import { ORDER_STATUS } from "@/lib/orders";

function badgeClass(status: string): string {
  if (status === ORDER_STATUS.DELIVERED) {
    return "bg-primary-muted text-primary-foreground";
  }
  if (status === ORDER_STATUS.COMPLETED) {
    return "bg-sky-100 text-sky-800";
  }
  return "bg-amber-100 text-amber-800";
}

type Props = {
  status: string;
  className?: string;
};

/** Badge trạng thái đơn — dùng chung bảng và card. */
export function OrderStatusBadge({ status, className = "" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass(status)} ${className}`.trim()}
    >
      {status}
    </span>
  );
}
