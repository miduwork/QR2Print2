"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminOrderDetailView } from "@/components/admin/orders/AdminOrderDetailView";
import { Spinner } from "@/components/feedback/Spinner";
import { readApiErrorMessage } from "@/lib/admin/apiClient";
import {
  adminMainContentClass,
  formErrorAlertClass,
  formPrimaryButtonInlineClass,
  formSecondaryButtonClass,
} from "@/components/admin/adminStyles";
import type { Order } from "@/lib/orders/types";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      setOrder(null);
      setError(null);
      return;
    }
    setLoading(true);
    setNotFound(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.status === 404) {
        setNotFound(true);
        setOrder(null);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(await readApiErrorMessage(res));
        setOrder(null);
        setLoading(false);
        return;
      }
      const json = (await res.json()) as { order?: Order };
      if (!json.order) {
        setNotFound(true);
        setOrder(null);
      } else {
        setOrder(json.order);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setOrder(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className={adminMainContentClass}>
        <div
          className="flex items-center justify-center py-20"
          role="status"
          aria-live="polite"
        >
          <Spinner size="md" />
          <span className="ml-3 text-muted-foreground">Đang tải chi tiết đơn...</span>
        </div>
      </main>
    );
  }

  if (notFound || !id) {
    return (
      <main className={adminMainContentClass}>
        <div className={formErrorAlertClass}>
          <p className="font-medium">Không tìm thấy đơn hàng</p>
          <p className="mt-1 text-sm opacity-90">
            Đơn không tồn tại hoặc bạn không có quyền xem.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className={`${formPrimaryButtonInlineClass} mt-6 inline-block`}
        >
          Quay lại danh sách
        </Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className={adminMainContentClass}>
        <div className={formErrorAlertClass}>
          <p className="font-medium">Lỗi tải đơn</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => void load()} className={formPrimaryButtonInlineClass}>
            Thử lại
          </button>
          <Link href="/admin/orders" className={formSecondaryButtonClass}>
            Quay lại danh sách
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className={adminMainContentClass}>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className={`text-sm ${formSecondaryButtonClass} inline-flex items-center`}
        >
          ← Quay lại danh sách
        </Link>
        <h2 className="mt-4 text-xl font-bold text-foreground">Chi tiết đơn hàng</h2>
      </div>
      <AdminOrderDetailView
        order={order}
        onAfterInlinePatch={() => {
          void load();
        }}
      />
    </main>
  );
}
