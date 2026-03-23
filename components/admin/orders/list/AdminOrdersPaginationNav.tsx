"use client";

import { formSecondaryButtonClass } from "@/components/admin/adminStyles";

type AdminOrdersPaginationNavProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  ordersTotal: number | null;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function AdminOrdersPaginationNav({
  page,
  totalPages,
  pageSize,
  ordersTotal,
  hasMore,
  onPrev,
  onNext,
}: AdminOrdersPaginationNavProps) {
  return (
    <nav
      aria-label="Phân trang danh sách đơn"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      <p className="text-sm text-muted-foreground">
        Trang {page + 1}
        {typeof ordersTotal === "number" ? ` / ${totalPages}` : " / ?"}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 0}
          className={formSecondaryButtonClass}
          aria-label="Trang trước"
        >
          Trước
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={
            (typeof ordersTotal === "number" &&
              (page + 1) * pageSize >= ordersTotal) ||
            (ordersTotal == null && !hasMore)
          }
          className={formSecondaryButtonClass}
          aria-label="Trang sau"
        >
          Sau
        </button>
      </div>
    </nav>
  );
}
