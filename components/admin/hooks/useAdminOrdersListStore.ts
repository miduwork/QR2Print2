"use client";

import { useCallback, useRef, useState } from "react";
import { readApiErrorMessage } from "@/lib/admin/apiClient";
import type { Order } from "@/lib/orders/types";

type OrdersListJson = {
  orders?: Order[];
  hasMore?: boolean;
  total?: number | null;
  limit?: number;
  offset?: number;
  currentCursor?: string | null;
  nextCursor?: string | null;
};

export function useAdminOrdersListStore() {
  const lastListQueryRef = useRef<string>("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [listLimit, setListLimit] = useState(50);
  const [listOffset, setListOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const resetOrdersState = useCallback(() => {
    setOrders([]);
    setOrdersTotal(null);
    setHasMore(false);
    setCurrentCursor(null);
    setNextCursor(null);
  }, []);

  const fetchOrders = useCallback(
    async (queryString?: string) => {
      try {
        const qs =
          queryString !== undefined ? queryString : lastListQueryRef.current;
        if (queryString !== undefined) {
          lastListQueryRef.current = queryString;
        }

        const ordersUrl = qs ? `/api/admin/orders?${qs}` : "/api/admin/orders";
        const ordersRes = await fetch(ordersUrl, {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!ordersRes.ok) {
          setError(await readApiErrorMessage(ordersRes));
          resetOrdersState();
        } else {
          const json = (await ordersRes.json()) as OrdersListJson;
          setError(null);
          setOrders(json.orders ?? []);
          setOrdersTotal(typeof json.total === "number" ? json.total : null);
          setHasMore(Boolean(json.hasMore));
          setCurrentCursor(
            typeof json.currentCursor === "string" && json.currentCursor
              ? json.currentCursor
              : null,
          );
          setNextCursor(
            typeof json.nextCursor === "string" && json.nextCursor
              ? json.nextCursor
              : null,
          );
          setListLimit(json.limit ?? 50);
          setListOffset(json.offset ?? 0);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        resetOrdersState();
      }
      setLoading(false);
    },
    [resetOrdersState],
  );

  const updateOrderStatus = useCallback(
    async (
      id: string,
      status: string,
      completed_at?: string | null,
      delivered_at?: string | null,
    ) => {
      setUpdatingId(id);
      const payload: Partial<Order> = { status };
      if (completed_at !== undefined) payload.completed_at = completed_at;
      if (delivered_at !== undefined) payload.delivered_at = delivered_at;

      await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchOrders();
      setUpdatingId(null);
    },
    [fetchOrders],
  );

  const updateOrderPriority = useCallback(
    async (id: string, priority: string) => {
      setUpdatingId(id);
      await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      await fetchOrders();
      setUpdatingId(null);
    },
    [fetchOrders],
  );

  return {
    orders,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    listLimit,
    listOffset,
    loading,
    setLoading,
    error,
    setError,
    updatingId,
    fetchOrders,
    updateOrderStatus,
    updateOrderPriority,
  };
}
