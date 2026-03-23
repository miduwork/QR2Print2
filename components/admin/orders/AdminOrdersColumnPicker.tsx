"use client";

import { useEffect, useId, useRef } from "react";
import {
  ADMIN_ORDERS_TOGGLE_COLUMN_IDS,
  ADMIN_ORDERS_COLUMN_LABELS,
  type AdminOrdersColumnVisibility,
} from "@/lib/admin/adminOrdersColumnConfig";
import { formSecondaryButtonClass } from "@/components/admin/adminStyles";

type Props = {
  open: boolean;
  onClose: () => void;
  visible: AdminOrdersColumnVisibility;
  onChange: (v: AdminOrdersColumnVisibility) => void;
};

export function AdminOrdersColumnPicker({
  open,
  onClose,
  visible,
  onChange,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="w-full max-w-md rounded-2xl border border-border bg-surface p-0 text-foreground shadow-lg backdrop:bg-black/40"
      onClose={onClose}
    >
      <div className="border-b border-border px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold">
          Cột hiển thị
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Khách hàng và Thao tác luôn hiển thị. Lưu trên trình duyệt này.
        </p>
      </div>
      <div className="max-h-[min(60vh,24rem)] space-y-3 overflow-y-auto px-5 py-4">
        {ADMIN_ORDERS_TOGGLE_COLUMN_IDS.map((id) => (
          <label
            key={id}
            className="flex cursor-pointer items-start gap-3 text-sm"
          >
            <input
              type="checkbox"
              checked={visible[id]}
              onChange={(e) =>
                onChange({ ...visible, [id]: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            <span>{ADMIN_ORDERS_COLUMN_LABELS[id]}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <button
          type="button"
          className={formSecondaryButtonClass}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </dialog>
  );
}
