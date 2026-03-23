"use client";

import { Suspense } from "react";
import { AdminOrdersProvider } from "@/components/admin/AdminOrdersProvider";
import { AdminOrdersListPage } from "@/components/admin/orders/AdminOrdersListPage";
import { AdminOrdersPageSuspenseFallback } from "@/components/admin/orders/list/AdminOrdersPageSuspenseFallback";

export default function AdminOrdersPage() {
  return (
    <AdminOrdersProvider>
      <Suspense fallback={<AdminOrdersPageSuspenseFallback />}>
        <AdminOrdersListPage />
      </Suspense>
    </AdminOrdersProvider>
  );
}
