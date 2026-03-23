"use client";

import { Spinner } from "@/components/feedback/Spinner";
import { adminMainContentClass } from "@/components/admin/adminStyles";

export function AdminOrdersPageSuspenseFallback() {
  return (
    <main className={adminMainContentClass}>
      <div
        className="flex items-center justify-center py-20"
        role="status"
        aria-live="polite"
      >
        <Spinner size="md" />
        <span className="ml-3 text-muted-foreground">Đang tải…</span>
      </div>
    </main>
  );
}
