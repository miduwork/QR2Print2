"use client";

import { formSecondaryButtonClass } from "@/components/admin/adminStyles";

type AdminOrdersListHeaderProps = {
  ordersTotal: number | null;
  hasMore: boolean;
  rangeStart: number;
  rangeEnd: number;
  onOpenColumnPicker: () => void;
  onExport: () => void;
  exportBusy: boolean;
};

export function AdminOrdersListHeader({
  ordersTotal,
  hasMore,
  rangeStart,
  rangeEnd,
  onOpenColumnPicker,
  onExport,
  exportBusy,
}: AdminOrdersListHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-foreground">Đơn hàng</h2>
        <p
          id="admin-orders-range-summary"
          className="mt-1 text-sm text-muted-foreground"
        >
          Tự động cập nhật mỗi 30 giây · Sắp xếp: ưu tiên cao trước, cùng mức thì đơn cũ nhất trước.{" "}
          {typeof ordersTotal === "number" && ordersTotal > 0
            ? `Hiển thị ${rangeStart}–${rangeEnd} / ${ordersTotal} đơn`
            : typeof ordersTotal === "number"
              ? "0 đơn"
              : hasMore
                ? `Hiển thị ${rangeStart}–${rangeEnd} đơn (chưa tính tổng chính xác)`
                : `${rangeEnd > 0 ? `Hiển thị ${rangeStart}–${rangeEnd}` : "0"} đơn (chưa tính tổng chính xác)`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenColumnPicker}
          className={`${formSecondaryButtonClass} hidden md:inline-flex`}
        >
          Cột hiển thị
        </button>
        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exportBusy || (ordersTotal === 0 && !hasMore)}
          className={formSecondaryButtonClass}
          aria-busy={exportBusy}
          aria-label={
            exportBusy
              ? "Đang xuất danh sách đơn ra CSV"
              : ordersTotal === 0 && !hasMore
                ? "Không có đơn để xuất — cần có ít nhất một đơn"
                : "Xuất danh sách đơn ra CSV từ máy chủ"
          }
        >
          {exportBusy ? "Đang xuất…" : "Xuất CSV (máy chủ)"}
        </button>
      </div>
    </div>
  );
}
