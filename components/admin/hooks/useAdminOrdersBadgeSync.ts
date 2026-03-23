"use client";

import { useCallback, useRef } from "react";

export function useAdminOrdersBadgeSync(
  syncFromMaxCreatedAt: (max: string | null) => void,
) {
  const lastMaxCreatedAtRef = useRef<string | null>(null);
  const pendingOrdersRefreshRef = useRef(false);

  const onStatsMaxCreatedAt = useCallback(
    (maxCreatedAt: string | null): "changed" | "unchanged" => {
      syncFromMaxCreatedAt(maxCreatedAt);
      const prev = lastMaxCreatedAtRef.current;
      const next = maxCreatedAt ?? null;

      if (prev == null) {
        lastMaxCreatedAtRef.current = next;
        pendingOrdersRefreshRef.current = true;
        return "changed";
      }
      if (next && prev !== next) {
        lastMaxCreatedAtRef.current = next;
        pendingOrdersRefreshRef.current = true;
        return "changed";
      }
      return "unchanged";
    },
    [syncFromMaxCreatedAt],
  );

  const consumeOrdersRefreshRequested = useCallback(() => {
    if (!pendingOrdersRefreshRef.current) return false;
    pendingOrdersRefreshRef.current = false;
    return true;
  }, []);

  return {
    onStatsMaxCreatedAt,
    consumeOrdersRefreshRequested,
  };
}
