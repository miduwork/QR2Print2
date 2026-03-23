"use client";

import { useEffect, useMemo, useRef } from "react";

export type AdaptivePollOutcome = "changed" | "unchanged" | "error";

export function resolveAdaptivePollIntervalMs(
  baseIntervalMs: number,
  unchangedStreak: number,
  maxIntervalMs = 180_000,
): number {
  if (!Number.isFinite(baseIntervalMs) || baseIntervalMs < 1) return 45_000;
  if (!Number.isFinite(unchangedStreak) || unchangedStreak <= 0) {
    return baseIntervalMs;
  }
  const stepped = baseIntervalMs * 2 ** unchangedStreak;
  return Math.min(maxIntervalMs, stepped);
}

export type UseAdaptivePollingOptions = {
  baseIntervalMs: number;
  maxIntervalMs?: number;
  enabled?: boolean;
  isVisible?: () => boolean;
  onPoll: () => Promise<AdaptivePollOutcome>;
};

export function useAdaptivePolling({
  baseIntervalMs,
  maxIntervalMs = 180_000,
  enabled = true,
  isVisible = () =>
    typeof document === "undefined" || document.visibilityState === "visible",
  onPoll,
}: UseAdaptivePollingOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unchangedStreakRef = useRef(0);
  const inFlightRef = useRef(false);

  const scheduleDelayMs = useMemo(
    () =>
      resolveAdaptivePollIntervalMs(
        baseIntervalMs,
        unchangedStreakRef.current,
        maxIntervalMs,
      ),
    [baseIntervalMs, maxIntervalMs],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const clear = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleNext = () => {
      if (cancelled) return;
      const delay = resolveAdaptivePollIntervalMs(
        baseIntervalMs,
        unchangedStreakRef.current,
        maxIntervalMs,
      );
      timerRef.current = setTimeout(tick, delay);
    };

    const tick = async () => {
      if (cancelled) return;
      if (!isVisible()) {
        scheduleNext();
        return;
      }
      if (inFlightRef.current) {
        scheduleNext();
        return;
      }
      inFlightRef.current = true;
      try {
        const result = await onPoll();
        if (result === "changed") {
          unchangedStreakRef.current = 0;
        } else if (result === "unchanged") {
          unchangedStreakRef.current += 1;
        }
        // result === "error": giữ nguyên streak để không backoff thêm vì lỗi.
      } finally {
        inFlightRef.current = false;
        scheduleNext();
      }
    };

    scheduleNext();
    return () => {
      cancelled = true;
      clear();
    };
  }, [baseIntervalMs, enabled, isVisible, maxIntervalMs, onPoll]);

  return {
    currentIntervalMs: scheduleDelayMs,
    resetAdaptivePolling: () => {
      unchangedStreakRef.current = 0;
    },
  };
}
