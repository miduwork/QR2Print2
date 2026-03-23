"use client";

import { useEffect, useState } from "react";
import {
  adminOrderDetailPath,
  orderShortCode,
} from "@/lib/orders/orderShortCode";

type Props = {
  orderId: string;
  /** `compact`: bảng/card; `detail`: trang chi tiết. */
  variant?: "compact" | "detail";
  className?: string;
};

const btnBase =
  "inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface font-medium text-foreground-muted shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-focusRing focus:ring-offset-2 disabled:opacity-50";

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function AdminOrderCopyActions({
  orderId,
  variant = "compact",
  className = "",
}: Props) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 2500);
    return () => window.clearTimeout(t);
  }, [status]);

  const sizeClass =
    variant === "detail" ? "px-2.5 py-1.5 text-sm" : "px-2 py-1 text-xs";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(orderShortCode(orderId));
      setStatus("Đã sao chép mã.");
    } catch {
      setStatus("Không sao chép được.");
    }
  };

  const copyLink = async () => {
    const path = adminOrderDetailPath(orderId);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Đã sao chép liên kết chi tiết.");
    } catch {
      setStatus("Không sao chép được.");
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`.trim()}>
      <button
        type="button"
        className={`${btnBase} ${sizeClass}`}
        onClick={() => void copyCode()}
        aria-label="Sao chép mã đơn 8 ký tự đầu"
      >
        <ClipboardIcon />
        <span>Mã</span>
      </button>
      <button
        type="button"
        className={`${btnBase} ${sizeClass}`}
        onClick={() => void copyLink()}
        aria-label="Sao chép liên kết trang chi tiết đơn trong admin"
      >
        <LinkIcon />
        <span>Link</span>
      </button>
      {status ? (
        <span
          className="text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </span>
      ) : null}
    </div>
  );
}
