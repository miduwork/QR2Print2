"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "qr2print_admin_orders_last_ack_max_created";

function readLastAck(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

function writeLastAck(iso: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, iso);
}

function isOrdersPath(pathname: string | null): boolean {
  return pathname === "/admin/orders" || pathname === "/admin/orders/";
}

export type AdminBadgeContextValue = {
  hasNewOrders: boolean;
  acknowledgeNewOrders: () => void;
  syncFromMaxCreatedAt: (max: string | null) => void;
};

const AdminBadgeContext = createContext<AdminBadgeContextValue | null>(null);

export function AdminBadgeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [latestMaxCreatedAt, setLatestMaxCreatedAt] = useState<string | null>(null);

  const applyBadgeFromMaxCreatedAt = useCallback((max: string | null) => {
    if (!max) {
      setLatestMaxCreatedAt(null);
      setHasNewOrders(false);
      return;
    }
    setLatestMaxCreatedAt(max);
    const lastAck = readLastAck();
    if (lastAck == null) {
      writeLastAck(max);
      setHasNewOrders(false);
      return;
    }
    setHasNewOrders(max > lastAck);
  }, []);

  const acknowledgeNewOrders = useCallback(() => {
    if (latestMaxCreatedAt) writeLastAck(latestMaxCreatedAt);
    setHasNewOrders(false);
  }, [latestMaxCreatedAt]);

  useEffect(() => {
    if (!isOrdersPath(pathname)) return;
    acknowledgeNewOrders();
  }, [pathname, acknowledgeNewOrders]);

  const value = useMemo<AdminBadgeContextValue>(
    () => ({
      hasNewOrders,
      acknowledgeNewOrders,
      syncFromMaxCreatedAt: applyBadgeFromMaxCreatedAt,
    }),
    [hasNewOrders, acknowledgeNewOrders, applyBadgeFromMaxCreatedAt],
  );

  return (
    <AdminBadgeContext.Provider value={value}>{children}</AdminBadgeContext.Provider>
  );
}

export function useAdminBadgeContext(): AdminBadgeContextValue {
  const ctx = useContext(AdminBadgeContext);
  if (!ctx) {
    throw new Error("useAdminBadgeContext must be used within AdminBadgeProvider");
  }
  return ctx;
}
