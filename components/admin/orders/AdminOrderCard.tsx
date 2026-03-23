"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminOrderCopyActions } from "@/components/admin/orders/AdminOrderCopyActions";
import { AdminOrderCardQuickDialog } from "@/components/admin/orders/AdminOrderCardQuickDialog";
import { OrderFileLinks } from "@/components/admin/orders/OrderFileLinks";
import { OrderPrintSpec } from "@/components/admin/orders/OrderPrintSpec";
import { OrderPrioritySelect } from "@/components/admin/orders/OrderPrioritySelect";
import { OrderRowActions } from "@/components/admin/orders/OrderRowActions";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { AdminOrderMobileTimestamps } from "@/components/admin/orders/AdminOrderMobileTimestamps";
import { adminDeliveryShortLabel } from "@/components/admin/orders/adminOrderDisplay";
import {
  adminMobileCardClass,
  formSecondaryButtonClass,
  linkAccentClass,
} from "@/components/admin/adminStyles";
import { adminOrderDetailPath, orderShortCode } from "@/lib/orders/orderShortCode";
import type { Order } from "@/lib/orders/types";

const detailLinkClass = `${linkAccentClass} font-medium`;

type Props = {
  order: Order;
  updatingId: string | null;
  onPriorityChange: (orderId: string, priority: string) => void;
  onUpdateStatus: (
    id: string,
    status: string,
    completed_at?: string | null,
    delivered_at?: string | null,
  ) => void | Promise<void>;
  bulkSelect?: boolean;
  bulkSelected?: boolean;
  onBulkToggle?: (id: string, checked: boolean) => void;
};

export function AdminOrderCard({
  order,
  updatingId,
  onPriorityChange,
  onUpdateStatus,
  bulkSelect,
  bulkSelected,
  onBulkToggle,
}: Props) {
  const [quickOpen, setQuickOpen] = useState(false);
  const showQuick = Boolean(order.note || order.file_url);

  return (
    <div className={adminMobileCardClass}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <AdminOrderMobileTimestamps order={order} />
          <p className="font-medium text-foreground">
            <Link
              href={adminOrderDetailPath(order.id)}
              className={detailLinkClass}
            >
              {order.customer_name}
            </Link>
          </p>
          <a
            href={`tel:${order.phone_number}`}
            className={`text-sm ${linkAccentClass}`}
          >
            {order.phone_number}
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="font-mono text-xs text-muted-foreground">
              {orderShortCode(order.id)}
            </span>
            <AdminOrderCopyActions orderId={order.id} />
          </div>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          {bulkSelect && (
            <input
              type="checkbox"
              checked={bulkSelected ?? false}
              onChange={(e) => onBulkToggle?.(order.id, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border"
              aria-label={`Chọn đơn ${order.customer_name}`}
            />
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {order.note && (
        <div className="mt-3 rounded-lg border border-border bg-muted/80 px-3 py-2">
          <p className="text-xs font-medium text-placeholder">Ghi chú</p>
          <p className="mt-0.5 line-clamp-3 text-sm text-foreground-muted">
            {order.note}
          </p>
        </div>
      )}

      {showQuick && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className={`${formSecondaryButtonClass} text-sm`}
          >
            Xem nhanh
          </button>
        </div>
      )}

      <AdminOrderCardQuickDialog
        order={order}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {(order.page_count != null || order.file_url) && (
          <>
            {order.page_count != null && (
              <span className="text-xs text-placeholder">
                Số trang:{" "}
                <strong className="text-foreground-muted">{order.page_count}</strong>
              </span>
            )}
            {order.copies != null && (
              <span className="text-xs text-placeholder">
                Số bản:{" "}
                <strong className="text-foreground-muted">{order.copies}</strong>
              </span>
            )}
            <span className="text-xs text-placeholder">
              In:{" "}
              <strong className="text-foreground-muted">
                <OrderPrintSpec order={order} />
              </strong>
            </span>
            <span className="text-xs text-placeholder">
              Nhận:{" "}
              <strong className="text-foreground-muted">
                {adminDeliveryShortLabel(order)}
              </strong>
            </span>
            {order.file_url && (
              <OrderFileLinks
                fileUrl={order.file_url}
                fileName={order.file_name}
                variant="verbose"
                linkClassName={`text-sm ${linkAccentClass}`}
                wrapperClassName="flex gap-2"
              />
            )}
          </>
        )}
        <OrderPrioritySelect
          order={order}
          updatingId={updatingId}
          onPriorityChange={onPriorityChange}
          variant="card"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <OrderRowActions
          order={order}
          updatingId={updatingId}
          onUpdateStatus={onUpdateStatus}
          size="card"
        />
      </div>
    </div>
  );
}
