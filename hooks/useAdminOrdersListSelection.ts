"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { buildAdminOrdersExportApiQuery } from "@/lib/admin/adminOrdersListUrl";
import {
  downloadAdminOrdersExportFromApi,
  downloadAdminOrdersExportSelectedFromApi,
} from "@/lib/admin/exportOrdersCsv";
import type { Order } from "@/lib/orders/types";

export type UseAdminOrdersListSelectionOptions = {
  orders: Order[];
  listQuery: string;
  fetchOrders: (queryString?: string) => Promise<void>;
  searchParams: ReadonlyURLSearchParams;
};

export function useAdminOrdersListSelection({
  orders,
  listQuery,
  fetchOrders,
  searchParams,
}: UseAdminOrdersListSelectionOptions) {
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    setSelectedIds((prev) => {
      const onPage = new Set(orders.map((o) => o.id));
      const next = new Set<string>();
      for (const id of Array.from(prev)) {
        if (onPage.has(id)) next.add(id);
      }
      return next;
    });
  }, [orders]);

  const pageOrderIds = useMemo(() => orders.map((o) => o.id), [orders]);
  const allPageSelected =
    pageOrderIds.length > 0 &&
    pageOrderIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageOrderIds.some((id) => selectedIds.has(id));

  const toggleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of pageOrderIds) {
          if (checked) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    },
    [pageOrderIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const runBatchAction = useCallback(
    async (action: "complete" | "deliver") => {
      if (selectedIds.size === 0) return;
      setBulkBusy(true);
      setExportError(null);
      try {
        const res = await fetch("/api/admin/orders/batch", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedIds), action }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          updated?: number;
        };
        if (!res.ok) {
          throw new Error(json.error || "Không cập nhật được.");
        }
        await fetchOrders(listQuery);
        setSelectedIds(new Set());
      } catch (e) {
        setExportError(e instanceof Error ? e.message : String(e));
      } finally {
        setBulkBusy(false);
      }
    },
    [selectedIds, fetchOrders, listQuery],
  );

  const handleExportSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setExportError(null);
    setExportBusy(true);
    try {
      await downloadAdminOrdersExportSelectedFromApi(Array.from(selectedIds));
    } catch (e) {
      setExportError(e instanceof Error ? e.message : String(e));
    } finally {
      setExportBusy(false);
    }
  }, [selectedIds]);

  const handleExport = useCallback(async () => {
    setExportError(null);
    setExportBusy(true);
    try {
      await downloadAdminOrdersExportFromApi(
        buildAdminOrdersExportApiQuery(searchParams),
      );
    } catch (e) {
      setExportError(e instanceof Error ? e.message : String(e));
    } finally {
      setExportBusy(false);
    }
  }, [searchParams]);

  return {
    exportBusy,
    exportError,
    selectedIds,
    bulkBusy,
    allPageSelected,
    somePageSelected,
    toggleSelectOne,
    toggleSelectAllOnPage,
    clearSelection,
    runBatchAction,
    handleExport,
    handleExportSelected,
  };
}
