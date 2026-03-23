"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import {
  AdminBadgeProvider,
  useAdminBadgeContext,
} from "@/components/admin/AdminBadgeProvider";
import {
  adminHeaderClass,
  adminShellClass,
  adminTitleClass,
  linkAccentClass,
} from "@/components/admin/adminStyles";

function AdminNavLinks() {
  const pathname = usePathname();
  const { hasNewOrders } = useAdminBadgeContext();

  const linkClass = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)
      ? "font-semibold text-foreground"
      : `font-medium ${linkAccentClass}`;

  return (
    <nav aria-label="Điều hướng khu vực quản trị" className="flex flex-wrap items-center gap-4 text-sm">
      <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
        Tổng quan
      </Link>
      <Link href="/admin/settings" className={linkClass("/admin/settings")}>
        Cài đặt
      </Link>
      <span className="flex items-center gap-1.5">
        <Link href="/admin/orders" className={linkClass("/admin/orders")}>
          Đơn hàng
        </Link>
        {hasNewOrders && (
          <span
            className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
            title="Có đơn mới kể từ lần xem trước"
          >
            Mới
          </span>
        )}
      </span>
    </nav>
  );
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className={adminShellClass}>
      <header className={adminHeaderClass}>
        <div className="mx-auto flex w-full flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <h1 className={adminTitleClass}>QR2Print · Quản trị</h1>
            <AdminNavLinks />
          </div>
          <AdminLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminBadgeProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminBadgeProvider>
  );
}
