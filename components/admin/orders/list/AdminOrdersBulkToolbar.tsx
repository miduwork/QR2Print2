"use client";

import { formSecondaryButtonClass } from "@/components/admin/adminStyles";

type AdminOrdersBulkToolbarProps = {
  selectedCount: number;
  bulkBusy: boolean;
  exportBusy: boolean;
  onComplete: () => void;
  onDeliver: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
};

export function AdminOrdersBulkToolbar({
  selectedCount,
  bulkBusy,
  exportBusy,
  onComplete,
  onDeliver,
  onExportSelected,
  onClearSelection,
}: AdminOrdersBulkToolbarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3"
      role="region"
      aria-label="Thao tác trên đơn đã chọn"
    >
      <span className="text-sm font-medium text-foreground">
        Đã chọn {selectedCount} đơn
      </span>
      <button
        type="button"
        disabled={bulkBusy}
        onClick={() => void onComplete()}
        className={formSecondaryButtonClass}
      >
        {bulkBusy ? "Đang xử lý…" : "Hoàn thành"}
      </button>
      <button
        type="button"
        disabled={bulkBusy}
        onClick={() => void onDeliver()}
        className={formSecondaryButtonClass}
      >
        Đã giao hàng
      </button>
      <button
        type="button"
        disabled={exportBusy}
        onClick={() => void onExportSelected()}
        className={formSecondaryButtonClass}
      >
        Xuất CSV đã chọn
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        className={formSecondaryButtonClass}
      >
        Bỏ chọn
      </button>
    </div>
  );
}
