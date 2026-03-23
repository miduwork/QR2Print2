"use client";

import { AdminOrderCard } from "@/components/admin/orders/AdminOrderCard";
import { AdminOrdersColumnPicker } from "@/components/admin/orders/AdminOrdersColumnPicker";
import { AdminOrdersTableHead } from "@/components/admin/orders/AdminOrdersTableHead";
import { AdminOrderTableRow } from "@/components/admin/orders/AdminOrderTableRow";
import { adminTableContainerClass } from "@/components/admin/adminStyles";
import type { AdminOrdersColumnVisibility } from "@/lib/admin/adminOrdersColumnConfig";
import type { Order } from "@/lib/orders/types";

type AdminOrdersListResultsProps = {
  orders: Order[];
  updatingId: string | null;
  /** Cột hiển thị (từ hook column visibility). */
  columnVisible: AdminOrdersColumnVisibility;
  columnPickerOpen: boolean;
  onColumnPickerClose: () => void;
  onColumnVisibleChange: (v: AdminOrdersColumnVisibility) => void;
  onPriorityChange: (id: string, priority: string) => Promise<void>;
  onUpdateStatus: (
    id: string,
    status: string,
    completed_at?: string | null,
    delivered_at?: string | null,
  ) => Promise<void>;
  bulkSelect: {
    allSelected: boolean;
    someSelected: boolean;
    onToggleAll: (checked: boolean) => void;
    selected: (id: string) => boolean;
    onToggleOne: (id: string, checked: boolean) => void;
  };
};

export function AdminOrdersListResults({
  orders,
  updatingId,
  columnVisible,
  columnPickerOpen,
  onColumnPickerClose,
  onColumnVisibleChange,
  onPriorityChange,
  onUpdateStatus,
  bulkSelect,
}: AdminOrdersListResultsProps) {
  return (
    <>
      <div className={adminTableContainerClass}>
        <table
          className="w-full text-left text-sm"
          aria-describedby="admin-orders-range-summary"
        >
          <caption className="sr-only">
            Danh sách đơn hàng: thời gian, khách, in, ghi chú, file, ưu tiên và thao tác
          </caption>
          <AdminOrdersTableHead
            visible={columnVisible}
            bulkSelect={{
              allSelected: bulkSelect.allSelected,
              someSelected: bulkSelect.someSelected,
              onToggleAll: bulkSelect.onToggleAll,
            }}
          />
          <tbody>
            {orders.map((order) => (
              <AdminOrderTableRow
                key={order.id}
                order={order}
                updatingId={updatingId}
                onPriorityChange={onPriorityChange}
                onUpdateStatus={onUpdateStatus}
                visible={columnVisible}
                bulkSelect
                selected={bulkSelect.selected(order.id)}
                onToggleSelect={bulkSelect.onToggleOne}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {orders.map((order) => (
          <AdminOrderCard
            key={order.id}
            order={order}
            updatingId={updatingId}
            onPriorityChange={onPriorityChange}
            onUpdateStatus={onUpdateStatus}
            bulkSelect
            bulkSelected={bulkSelect.selected(order.id)}
            onBulkToggle={bulkSelect.onToggleOne}
          />
        ))}
      </div>

      <AdminOrdersColumnPicker
        open={columnPickerOpen}
        onClose={onColumnPickerClose}
        visible={columnVisible}
        onChange={onColumnVisibleChange}
      />
    </>
  );
}
