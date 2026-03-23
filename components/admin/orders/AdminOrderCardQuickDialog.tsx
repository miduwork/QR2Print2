"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { AdminOrderCopyActions } from "@/components/admin/orders/AdminOrderCopyActions";
import { OrderFileLinks } from "@/components/admin/orders/OrderFileLinks";
import { OrderPrintSpec } from "@/components/admin/orders/OrderPrintSpec";
import { adminDeliveryShortLabel } from "@/components/admin/orders/adminOrderDisplay";
import {
  formPrimaryButtonInlineClass,
  formSecondaryButtonClass,
  linkAccentClass,
} from "@/components/admin/adminStyles";
import {
  adminOrderDetailPath,
  orderShortCode,
} from "@/lib/orders/orderShortCode";
import type { Order } from "@/lib/orders/types";

type Props = {
  order: Order | null;
  open: boolean;
  onClose: () => void;
};

export function AdminOrderCardQuickDialog({ order, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && order) {
      if (!el.open) el.showModal();
    } else {
      el.close();
    }
  }, [open, order]);

  if (!order) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="w-[min(100vw-2rem,28rem)] max-h-[min(85vh,32rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-foreground shadow-lg backdrop:bg-black/40"
      onClose={onClose}
    >
      <div className="border-b border-border px-4 py-3">
        <h2 id={titleId} className="text-base font-semibold">
          Xem nhanh đơn
        </h2>
        <p className="mt-1 text-sm font-medium text-foreground">
          {order.customer_name}
        </p>
        <a
          href={`tel:${order.phone_number}`}
          className={`mt-0.5 text-sm ${linkAccentClass}`}
        >
          {order.phone_number}
        </a>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Mã:{" "}
            <span className="font-mono text-foreground">
              {orderShortCode(order.id)}
            </span>
          </span>
          <AdminOrderCopyActions orderId={order.id} />
        </div>
      </div>
      <div className="space-y-3 px-4 py-3 text-sm">
        {order.note ? (
          <div>
            <p className="text-xs font-medium text-placeholder">Ghi chú</p>
            <p className="mt-1 whitespace-pre-wrap text-foreground-muted">
              {order.note}
            </p>
          </div>
        ) : (
          <p className="text-xs text-placeholder">Không có ghi chú.</p>
        )}
        <div>
          <p className="text-xs font-medium text-placeholder">In / nhận</p>
          <p className="mt-1 text-foreground-muted">
            <OrderPrintSpec order={order} /> · {adminDeliveryShortLabel(order)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-placeholder">File</p>
          <div className="mt-1">
            <OrderFileLinks
              fileUrl={order.file_url}
              fileName={order.file_name}
              variant="verbose"
              linkClassName={`text-sm ${linkAccentClass}`}
              wrapperClassName="flex flex-col gap-1"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
        <Link
          href={adminOrderDetailPath(order.id)}
          className={formPrimaryButtonInlineClass}
        >
          Mở chi tiết đơn
        </Link>
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
