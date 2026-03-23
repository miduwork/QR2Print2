"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminOrdersListHrefAwaitingDelivery,
  adminOrdersListHrefHighPriorityPending,
  adminOrdersListHrefPendingPrint,
  adminOrdersListHrefToday,
  adminOrdersListHrefUnpaid,
} from "@/lib/admin/dashboardOrderListLinks";
import { mergeDashboardStatsWithLite } from "@/lib/admin/dashboardStatsMerge";
import { useAdaptivePolling } from "@/hooks/useAdaptivePolling";
import { isDocumentVisible, readApiErrorMessage } from "@/lib/admin/apiClient";
import {
  adminMainContentClass,
  formPrimaryButtonInlineClass,
  formSecondaryButtonClass,
  linkAccentClass,
} from "@/components/admin/adminStyles";
import { useAdminBadgeContext } from "@/components/admin/AdminBadgeProvider";
import type {
  AdminStatsLiteResponse,
  AdminStatsResponse,
} from "@/lib/orders/adminStatsTypes";

const cardLinkClass =
  "block rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing focus-visible:ring-offset-2";

function formatDayLabelYmd(ymd: string): string {
  const parts = ymd.split("-");
  if (parts.length !== 3) return ymd;
  const [y, m, d] = parts;
  return `${d}/${m}`;
}

function formatCreatedShort(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function DashboardSkeleton() {
  return (
    <main className={adminMainContentClass}>
      <div className="h-9 w-48 max-w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4].map((k) => (
          <div
            key={k}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-10 w-20 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 max-w-md animate-pulse rounded bg-muted" />
        <div className="mt-6 flex h-32 items-end gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <div
              key={k}
              className="min-h-[2rem] flex-1 animate-pulse rounded-t bg-muted"
              style={{ height: `${20 + (k % 4) * 15}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  const { hasNewOrders, syncFromMaxCreatedAt } = useAdminBadgeContext();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatsFull = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        setStatsError(await readApiErrorMessage(res));
        setStats(null);
      } else {
        const json = (await res.json()) as AdminStatsResponse;
        setStatsError(null);
        setStats(json);
        syncFromMaxCreatedAt(json.max_created_at);
        setLastUpdated(new Date());
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatsError(msg);
      setStats(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [syncFromMaxCreatedAt]);

  const fetchStatsLite = useCallback(async (): Promise<"changed" | "unchanged" | "error"> => {
    try {
      const res = await fetch("/api/admin/stats/lite", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        setStatsError(await readApiErrorMessage(res));
        return "error";
      }
      const lite = (await res.json()) as AdminStatsLiteResponse;
      setStatsError(null);
      setStats((prev) => mergeDashboardStatsWithLite(prev, lite));
      syncFromMaxCreatedAt(lite.max_created_at);

      return "changed";
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatsError(msg);
      return "error";
    }
  }, [syncFromMaxCreatedAt]);

  useEffect(() => {
    void fetchStatsFull();
  }, [fetchStatsFull]);

  useAdaptivePolling({
    baseIntervalMs: 45_000,
    maxIntervalMs: 180_000,
    onPoll: fetchStatsLite,
    isVisible: isDocumentVisible,
  });

  useEffect(() => {
    const onVisible = () => {
      if (!isDocumentVisible()) return;
      void fetchStatsLite();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }, [fetchStatsLite]);

  const maxDayCount = useMemo(() => {
    const rows = stats?.orders_by_day ?? [];
    return Math.max(1, ...rows.map((d) => d.count));
  }, [stats?.orders_by_day]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (statsError && !stats) {
    return (
      <main className={adminMainContentClass}>
        <div className="rounded-xl border border-border bg-danger p-5 text-danger-foreground">
          <p className="font-medium">Lỗi tải thống kê</p>
          <p className="mt-1 text-sm">{statsError}</p>
          <button
            type="button"
            onClick={() => void fetchStatsFull()}
            className={`${formPrimaryButtonInlineClass} mt-4`}
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  if (!stats) {
    return null;
  }

  const updatedLabel =
    lastUpdated?.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "medium",
    }) ?? "";

  const recent = stats.recent_orders;
  const ordersByDay = stats.orders_by_day ?? [];

  return (
    <main className={adminMainContentClass}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground">Tổng quan</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Số liệu theo ngày giờ Việt Nam (GMT+7), đồng bộ với bộ lọc trên trang Đơn
            hàng.
          </p>
          <details className="mt-2 max-w-2xl text-sm">
            <summary className="cursor-pointer font-medium text-foreground-muted underline-offset-2 hover:underline">
              Chi tiết định nghĩa các chỉ số
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground-muted">Đơn hôm nay</strong> — số
                đơn có thời điểm tạo trong ngày lịch hôm nay (múi giờ Việt Nam).
              </li>
              <li>
                <strong className="text-foreground-muted">Chưa thanh toán</strong> —
                đơn chưa ở trạng thái thanh toán « Đã thanh toán ».
              </li>
              <li>
                <strong className="text-foreground-muted">Chưa hoàn thành in</strong>{" "}
                — đơn đang ở trạng thái « Chưa hoàn thành » (chưa in xong theo quy trình
                trong app).
              </li>
              <li>
                <strong className="text-foreground-muted">
                  Ưu tiên cao (chưa in xong)
                </strong>{" "}
                — ưu tiên « Ưu tiên cao » và vẫn ở trạng thái « Chưa hoàn thành ».
              </li>
              <li>
                <strong className="text-foreground-muted">Chờ giao hàng</strong> — đơn
                đã « Đã hoàn thành » (in xong) nhưng chưa « Đã giao hàng ».
              </li>
              <li>
                <strong className="text-foreground-muted">Xu hướng 7 ngày</strong> — số
                đơn <em>tạo</em> mỗi ngày lịch (từ 6 ngày trước đến hôm nay, GMT+7).
              </li>
              <li>
                <strong className="text-foreground-muted">Đã TT (7 ngày)</strong> — số
                đơn đã thanh toán có ngày tạo trong cùng cửa sổ 7 ngày đó.
              </li>
            </ul>
          </details>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {updatedLabel ? (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Cập nhật: {updatedLabel}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void fetchStatsFull()}
            disabled={loading}
            className={formSecondaryButtonClass}
          >
            Làm mới
          </button>
        </div>
      </div>

      {hasNewOrders && (
        <div
          className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          <span className="font-medium">Có đơn mới</span>
          <span className="text-muted-foreground">
            {" "}
            — có đơn được tạo sau lần bạn xem danh sách gần nhất.{" "}
          </span>
          <Link href="/admin/orders" className={`${linkAccentClass} font-medium`}>
            Mở danh sách đơn
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href={adminOrdersListHrefToday()}
          className={cardLinkClass}
          aria-label="Mở danh sách đơn tạo hôm nay"
        >
          <p className="text-sm font-medium text-muted-foreground">Đơn hôm nay</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {stats.ordersToday}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">Xem danh sách →</p>
        </Link>
        <Link
          href={adminOrdersListHrefUnpaid()}
          className={cardLinkClass}
          aria-label="Mở danh sách đơn chưa thanh toán"
        >
          <p className="text-sm font-medium text-muted-foreground">Chưa thanh toán</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {stats.unpaidCount}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">Xem danh sách →</p>
        </Link>
        <Link
          href={adminOrdersListHrefPendingPrint()}
          className={cardLinkClass}
          aria-label="Mở danh sách đơn chưa hoàn thành in"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Chưa hoàn thành in
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {stats.pendingPrintCount}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">Xem danh sách →</p>
        </Link>
        <Link
          href={adminOrdersListHrefHighPriorityPending()}
          className={cardLinkClass}
          aria-label="Mở danh sách đơn ưu tiên cao chưa hoàn thành in"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Ưu tiên cao (chưa in xong)
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {stats.highPriorityPendingCount}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">Xem danh sách →</p>
        </Link>
        <Link
          href={adminOrdersListHrefAwaitingDelivery()}
          className={cardLinkClass}
          aria-label="Mở danh sách đơn chờ giao hàng"
        >
          <p className="text-sm font-medium text-muted-foreground">Chờ giao hàng</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {stats.awaitingDeliveryCount}
          </p>
          <p className="mt-3 text-xs font-medium text-primary">Xem danh sách →</p>
        </Link>
      </div>

      <section
        className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        aria-labelledby="dashboard-trend-heading"
      >
        <h3
          id="dashboard-trend-heading"
          className="text-base font-semibold text-foreground"
        >
          Xu hướng đơn theo ngày
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          7 ngày lịch gần nhất (GMT+7). Đơn đã thanh toán (tạo trong cùng khoảng):{" "}
          <strong className="tabular-nums text-foreground">
            {stats.paid_orders_last_7_days ?? 0}
          </strong>
          .
        </p>
        {ordersByDay.length === 0 ? (
          <p className="mt-4 text-sm text-placeholder">Chưa có dữ liệu theo ngày.</p>
        ) : (
          <>
            <div
              className="mt-6 flex h-36 min-h-[9rem] items-end gap-1 sm:gap-2"
              role="img"
              aria-label="Biểu đồ cột số đơn tạo theo ngày trong 7 ngày gần nhất"
            >
              {ordersByDay.map((row) => {
                const barRem = Math.max(
                  0.25,
                  (row.count / maxDayCount) * 5.5,
                );
                return (
                  <div
                    key={row.date}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                  >
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      {row.count}
                    </span>
                    <div
                      className="w-full min-w-[1.25rem] max-w-full rounded-t-md bg-primary/80"
                      style={{ height: `${barRem}rem` }}
                      title={`${formatDayLabelYmd(row.date)}: ${row.count} đơn`}
                    />
                    <span className="text-[10px] text-muted-foreground sm:text-xs">
                      {formatDayLabelYmd(row.date)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <caption className="sr-only">
                  Bảng số đơn tạo theo từng ngày
                </caption>
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th scope="col" className="py-2 pr-2 font-medium">
                      Ngày
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      Số đơn tạo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByDay.map((row) => (
                    <tr key={row.date} className="border-b border-border/60">
                      <td className="py-1.5 pr-2 text-foreground-muted">
                        {formatDayLabelYmd(row.date)}
                      </td>
                      <td className="py-1.5 tabular-nums text-foreground">
                        {row.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section
        className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        aria-labelledby="dashboard-recent-heading"
      >
        <h3
          id="dashboard-recent-heading"
          className="text-base font-semibold text-foreground"
        >
          Đơn mới nhất
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Các đơn tạo gần đây nhất — bấm để mở chi tiết.
        </p>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-placeholder">Chưa có đơn nào.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recent.map((row) => (
              <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  href={`/admin/orders/${encodeURIComponent(row.id)}`}
                  className="group flex flex-wrap items-baseline justify-between gap-2 rounded-lg py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focusRing"
                >
                  <span className="min-w-0 flex-1 font-medium text-foreground underline-offset-2 group-hover:underline">
                    {row.customer_name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatCreatedShort(row.created_at)}
                  </span>
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.status} · {row.priority}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8">
        <Link href="/admin/orders" className={formPrimaryButtonInlineClass}>
          Mở danh sách đơn
        </Link>
      </p>
    </main>
  );
}
