"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listOrdersForAdmin,
  updateOrderForAdmin,
} from "@/lib/orders/repository";
import { sortOrdersByPriorityThenCreatedAt } from "@/lib/orders/adminSort";
import type { Order } from "@/lib/orders/types";

export function useOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error: err } = await listOrdersForAdmin();

      if (err) {
        setError(err.message);
        setOrders([]);
      } else {
        setError(null);
        setOrders(
          sortOrdersByPriorityThenCreatedAt((data ?? []) as Order[]),
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setOrders([]);
    }
    setLoading(false);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchOrders();
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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

      const { error } = await updateOrderForAdmin(id, payload);
      if (error) {
        await fetchOrders();
      } else {
        setOrders((prev) =>
          sortOrdersByPriorityThenCreatedAt(
            prev.map((o) => (o.id === id ? { ...o, ...payload } : o)),
          ),
        );
      }
      setUpdatingId(null);
    },
    [fetchOrders],
  );

  const updateOrderPriority = useCallback(
    async (id: string, priority: string) => {
      setUpdatingId(id);
      const { error } = await updateOrderForAdmin(id, {
        priority,
      });
      if (error) {
        await fetchOrders();
      } else {
        setOrders((prev) =>
          sortOrdersByPriorityThenCreatedAt(
            prev.map((o) => (o.id === id ? { ...o, priority } : o)),
          ),
        );
      }
      setUpdatingId(null);
    },
    [fetchOrders],
  );

  return {
    orders,
    loading,
    error,
    updatingId,
    fetchOrders,
    handleRetry,
    updateOrderStatus,
    updateOrderPriority,
  };
}
