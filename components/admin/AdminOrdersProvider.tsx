"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useAdminBadgeContext } from "@/components/admin/AdminBadgeProvider";
import { useAdminOrdersBadgeSync } from "@/components/admin/hooks/useAdminOrdersBadgeSync";
import { useAdminOrdersListStore } from "@/components/admin/hooks/useAdminOrdersListStore";
import { useAdminOrdersStatsLitePolling } from "@/components/admin/hooks/useAdminOrdersStatsLitePolling";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import { isDocumentVisible } from "@/lib/admin/apiClient";
import type { AdminStatsLiteResponse } from "@/lib/orders/adminStatsTypes";
import type { Order } from "@/lib/orders/types";

export type AdminOrdersContextValue = {
  orders: Order[];
  /** Tổng số dòng khớp filter; null khi API không tính exact count. */
  ordersTotal: number | null;
  /** Có thêm trang sau cho tập filter hiện tại. */
  hasMore: boolean;
  currentCursor: string | null;
  nextCursor: string | null;
  listLimit: number;
  listOffset: number;
  /** Thống kê nhẹ từ `GET /api/admin/stats/lite` cho trang orders. */
  stats: AdminStatsLiteResponse | null;
  statsError: string | null;
  loading: boolean;
  error: string | null;
  updatingId: string | null;
  /** `queryString` không gồm `?`; rỗng = mặc định API. Poll / retry dùng ref nội bộ. */
  fetchOrders: (queryString?: string) => Promise<void>;
  handleRetry: () => void;
  updateOrderStatus: (
    id: string,
    status: string,
    completed_at?: string | null,
    delivered_at?: string | null,
  ) => Promise<void>;
  updateOrderPriority: (id: string, priority: string) => Promise<void>;
};

const AdminOrdersContext = createContext<AdminOrdersContextValue | null>(null);

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const { syncFromMaxCreatedAt } = useAdminBadgeContext();
  const listStore = useAdminOrdersListStore();
  const {
    orders,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    listLimit,
    listOffset,
    loading,
    error,
    updatingId,
    fetchOrders,
    setLoading,
    setError,
    updateOrderStatus,
    updateOrderPriority,
  } = listStore;
  const badgeSync = useAdminOrdersBadgeSync(syncFromMaxCreatedAt);
  const { stats, statsError, setStatsError, fetchStatsLite } =
    useAdminOrdersStatsLitePolling({
      onMaxCreatedAt: badgeSync.onStatsMaxCreatedAt,
    });

  const handleRetry = useCallback(() => {
    setError(null);
    setStatsError(null);
    setLoading(true);
    void Promise.all([fetchOrders(), fetchStatsLite()]);
  }, [fetchOrders, fetchStatsLite, setError, setLoading, setStatsError]);

  useAdaptivePolling({
    baseIntervalMs: 90_000,
    maxIntervalMs: 180_000,
    onPoll: fetchStatsLite,
    isVisible: isDocumentVisible,
  });

  useAdaptivePolling({
    baseIntervalMs: 45_000,
    maxIntervalMs: 180_000,
    onPoll: async () => {
      if (!badgeSync.consumeOrdersRefreshRequested()) return "unchanged";
      await fetchOrders();
      return "changed";
    },
    isVisible: isDocumentVisible,
  });

  useEffect(() => {
    const onVisible = () => {
      if (!isDocumentVisible()) return;
      void Promise.all([fetchOrders(), fetchStatsLite()]);
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [fetchOrders, fetchStatsLite]);

  const value = useMemo<AdminOrdersContextValue>(
    () => ({
      orders,
      ordersTotal,
      hasMore,
      currentCursor,
      nextCursor,
      listLimit,
      listOffset,
      stats,
      statsError,
      loading,
      error,
      updatingId,
      fetchOrders,
      handleRetry,
      updateOrderStatus,
      updateOrderPriority,
    }),
    [
      currentCursor,
      error,
      fetchOrders,
      handleRetry,
      hasMore,
      listLimit,
      listOffset,
      loading,
      nextCursor,
      orders,
      ordersTotal,
      stats,
      statsError,
      updateOrderPriority,
      updateOrderStatus,
      updatingId,
    ],
  );

  return (
    <AdminOrdersContext.Provider value={value}>{children}</AdminOrdersContext.Provider>
  );
}

export function useAdminOrdersContext(): AdminOrdersContextValue {
  const ctx = useContext(AdminOrdersContext);
  if (!ctx) {
    throw new Error("useAdminOrdersContext must be used within AdminOrdersProvider");
  }
  return ctx;
}
