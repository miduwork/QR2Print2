"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  type AdminOrdersListRouter,
  useAdminOrdersFiltersState,
} from "@/hooks/useAdminOrdersFiltersState";
import { useAdminOrdersCursorPaginationState } from "@/hooks/useAdminOrdersCursorPaginationState";

export type { AdminOrdersListRouter } from "@/hooks/useAdminOrdersFiltersState";

export type UseAdminOrdersUrlStateOptions = {
  loading: boolean;
  error: string | null;
  ordersTotal: number | null;
  hasMore: boolean;
  currentCursor: string | null;
  nextCursor: string | null;
  /** `orders.length` trên trang hiện tại — dùng cho `rangeEnd`. */
  ordersOnPageCount: number;
};

export function useAdminOrdersUrlState(
  router: AdminOrdersListRouter,
  searchParams: ReadonlyURLSearchParams,
  {
    loading,
    error,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    ordersOnPageCount,
  }: UseAdminOrdersUrlStateOptions,
) {
  const filters = useAdminOrdersFiltersState(router, searchParams);
  const cursorPaging = useAdminOrdersCursorPaginationState({
    loading,
    error,
    ordersTotal,
    hasMore,
    currentCursor,
    nextCursor,
    ordersOnPageCount,
    pageSize: filters.pageSize,
    searchParams,
    replaceSearchParams: filters.replaceSearchParams,
  });

  return {
    ...filters,
    ...cursorPaging,
  };
}
