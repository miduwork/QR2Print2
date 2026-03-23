"use client";

import { adminEmptyStateCardClass } from "@/components/admin/adminStyles";

export type AdminOrdersListEmptyVariant =
  | "no_orders"
  | "no_match"
  | "empty_page";

const messages: Record<AdminOrdersListEmptyVariant, string> = {
  no_orders: "Chưa có đơn hàng nào.",
  no_match: "Không có đơn nào khớp bộ lọc hoặc từ khóa tìm kiếm.",
  empty_page: "Không có đơn trên trang này.",
};

type AdminOrdersListEmptyProps = {
  variant: AdminOrdersListEmptyVariant;
};

export function AdminOrdersListEmpty({ variant }: AdminOrdersListEmptyProps) {
  return (
    <div className={adminEmptyStateCardClass}>{messages[variant]}</div>
  );
}
