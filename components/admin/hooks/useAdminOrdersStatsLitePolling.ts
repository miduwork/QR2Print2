"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import { isDocumentVisible, readApiErrorMessage } from "@/lib/admin/apiClient";
import type { AdminStatsLiteResponse } from "@/lib/orders/adminStatsTypes";

export type PollResult = "changed" | "unchanged" | "error";

type UseAdminOrdersStatsLitePollingOptions = {
  onMaxCreatedAt: (maxCreatedAt: string | null) => "changed" | "unchanged";
};

export function useAdminOrdersStatsLitePolling({
  onMaxCreatedAt,
}: UseAdminOrdersStatsLitePollingOptions) {
  const [stats, setStats] = useState<AdminStatsLiteResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStatsLite = useCallback(async (): Promise<PollResult> => {
    try {
      const statsRes = await fetch("/api/admin/stats/lite", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!statsRes.ok) {
        setStatsError(await readApiErrorMessage(statsRes));
        return "error";
      }
      const json = (await statsRes.json()) as AdminStatsLiteResponse;
      setStatsError(null);
      setStats(json);
      return onMaxCreatedAt(json.max_created_at);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatsError(msg);
      return "error";
    }
  }, [onMaxCreatedAt]);

  useEffect(() => {
    void fetchStatsLite();
  }, [fetchStatsLite]);

  useAdaptivePolling({
    baseIntervalMs: 90_000,
    maxIntervalMs: 180_000,
    onPoll: fetchStatsLite,
    isVisible: isDocumentVisible,
  });

  return {
    stats,
    statsError,
    setStatsError,
    fetchStatsLite,
  };
}
