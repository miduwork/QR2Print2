"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminOrdersBulkToolbar } from "@/components/admin/orders/list/AdminOrdersBulkToolbar";
import { AdminOrdersFiltersSection } from "@/components/admin/orders/list/AdminOrdersFiltersSection";
import { AdminOrdersListEmpty } from "@/components/admin/orders/list/AdminOrdersListEmpty";
import { AdminOrdersListError } from "@/components/admin/orders/list/AdminOrdersListError";
import { AdminOrdersListHeader } from "@/components/admin/orders/list/AdminOrdersListHeader";
import { AdminOrdersListLoading } from "@/components/admin/orders/list/AdminOrdersListLoading";
import { AdminOrdersListResults } from "@/components/admin/orders/list/AdminOrdersListResults";
import { AdminOrdersPaginationNav } from "@/components/admin/orders/list/AdminOrdersPaginationNav";
import { adminMainContentClass } from "@/components/admin/adminStyles";
import { buildAdminOrdersListApiQuery } from "@/lib/admin/adminOrdersListUrl";
import { useAdminOrdersColumnVisibility } from "@/hooks/useAdminOrdersColumnVisibility";
import { useAdminOrdersListSelection } from "@/hooks/useAdminOrdersListSelection";
import { useAdminOrdersUrlState } from "@/hooks/useAdminOrdersUrlState";
import { useAdminOrdersContext } from "@/components/admin/AdminOrdersProvider";
import { useAdminBadgeContext } from "@/components/admin/AdminBadgeProvider";

export function AdminOrdersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qsKey = searchParams.toString();
  const { acknowledgeNewOrders, syncFromMaxCreatedAt } = useAdminBadgeContext();

  const {
    orders,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    stats,
    loading,
    error,
    updatingId,
    handleRetry,
    fetchOrders,
    updateOrderStatus,
    updateOrderPriority,
  } = useAdminOrdersContext();

  const listQuery = useMemo(
    () => buildAdminOrdersListApiQuery(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync theo toàn bộ query string
    [qsKey],
  );

  useEffect(() => {
    void fetchOrders(listQuery);
  }, [listQuery, fetchOrders]);

  useEffect(() => {
    acknowledgeNewOrders();
  }, [acknowledgeNewOrders]);

  useEffect(() => {
    if (!stats) return;
    syncFromMaxCreatedAt(stats.max_created_at);
  }, [stats, syncFromMaxCreatedAt]);

  const url = useAdminOrdersUrlState(router, searchParams, {
    loading,
    error,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    ordersOnPageCount: orders.length,
  });

  const selection = useAdminOrdersListSelection({
    orders,
    listQuery,
    fetchOrders,
    searchParams,
  });

  const { visible: columnVisible, setVisible: setColumnVisible } =
    useAdminOrdersColumnVisibility();
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);

  if (loading) {
    return <AdminOrdersListLoading />;
  }

  if (error) {
    return <AdminOrdersListError message={error} onRetry={handleRetry} />;
  }

  return (
    <main className={adminMainContentClass}>
      <div className="mb-6 flex flex-col gap-4">
        <AdminOrdersListHeader
          ordersTotal={ordersTotal}
          hasMore={hasMore}
          rangeStart={url.rangeStart}
          rangeEnd={url.rangeEnd}
          onOpenColumnPicker={() => setColumnPickerOpen(true)}
          onExport={selection.handleExport}
          exportBusy={selection.exportBusy}
        />
        {selection.exportError && (
          <p className="text-sm text-danger" role="alert">
            {selection.exportError}
          </p>
        )}
        <AdminOrdersBulkToolbar
          selectedCount={selection.selectedIds.size}
          bulkBusy={selection.bulkBusy}
          exportBusy={selection.exportBusy}
          onComplete={() => void selection.runBatchAction("complete")}
          onDeliver={() => void selection.runBatchAction("deliver")}
          onExportSelected={selection.handleExportSelected}
          onClearSelection={selection.clearSelection}
        />
        <AdminOrdersFiltersSection
          searchInput={url.searchInput}
          onSearchInputChange={url.setSearchInput}
          paymentFilter={url.paymentFilter}
          onPaymentFilterChange={url.setPaymentFilter}
          statusFilter={url.statusFilter}
          onStatusFilterChange={url.setStatusFilter}
          priorityFilter={url.priorityFilter}
          onPriorityFilterChange={url.setPriorityFilter}
          dateFromUrl={url.dateFromUrl}
          dateToUrl={url.dateToUrl}
          onDateFromChange={url.setDateFromInput}
          onDateToChange={url.setDateToInput}
          presetAllActive={url.presetAllActive}
          presetTodayActive={url.presetTodayActive}
          preset7dActive={url.preset7dActive}
          onDatePreset={url.setDatePreset}
          pageSize={url.pageSize}
          onPageSizeChange={url.setPageSize}
        />
        <AdminOrdersPaginationNav
          page={url.page}
          totalPages={url.totalPages}
          pageSize={url.pageSize}
          ordersTotal={ordersTotal}
          hasMore={hasMore}
          onPrev={url.goPrev}
          onNext={url.goNext}
        />
      </div>

      {(ordersTotal === 0 || (ordersTotal == null && orders.length === 0 && !hasMore)) &&
      !url.hasFilters ? (
        <AdminOrdersListEmpty variant="no_orders" />
      ) : (ordersTotal === 0 ||
          (ordersTotal == null && orders.length === 0 && !hasMore)) &&
        url.hasFilters ? (
        <AdminOrdersListEmpty variant="no_match" />
      ) : orders.length === 0 ? (
        <AdminOrdersListEmpty variant="empty_page" />
      ) : (
        <AdminOrdersListResults
          orders={orders}
          updatingId={updatingId}
          columnVisible={columnVisible}
          columnPickerOpen={columnPickerOpen}
          onColumnPickerClose={() => setColumnPickerOpen(false)}
          onColumnVisibleChange={setColumnVisible}
          onPriorityChange={updateOrderPriority}
          onUpdateStatus={updateOrderStatus}
          bulkSelect={{
            allSelected: selection.allPageSelected,
            someSelected: selection.somePageSelected,
            onToggleAll: selection.toggleSelectAllOnPage,
            selected: (id) => selection.selectedIds.has(id),
            onToggleOne: selection.toggleSelectOne,
          }}
        />
      )}
    </main>
  );
}
