"use client";

import {
  adminMainContentClass,
  formPrimaryButtonInlineClass,
} from "@/components/admin/adminStyles";

type AdminOrdersListErrorProps = {
  message: string;
  onRetry: () => void;
};

export function AdminOrdersListError({
  message,
  onRetry,
}: AdminOrdersListErrorProps) {
  const isNetworkError = /failed to fetch|network|load/i.test(message);
  return (
    <main className={adminMainContentClass}>
      <div className="rounded-xl border border-border bg-danger p-5 text-danger-foreground">
        <p className="font-medium">Lỗi tải dữ liệu</p>
        <p className="mt-1 text-sm">{message}</p>
        {isNetworkError && (
          <ul className="mt-3 list-inside list-disc text-sm opacity-90">
            <li>Kiểm tra kết nối mạng.</li>
            <li>
              Vào bảng điều khiển Supabase → kiểm tra project có bị tạm dừng (paused)
              không — nếu có, bấm Khôi phục (Restore).
            </li>
            <li>
              Kiểm tra lại{" "}
              <code className="rounded bg-muted-elevated px-1 text-foreground">
                .env.local
              </code>{" "}
              (NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY).
            </li>
          </ul>
        )}
        <button
          type="button"
          onClick={onRetry}
          className={`${formPrimaryButtonInlineClass} mt-4`}
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
