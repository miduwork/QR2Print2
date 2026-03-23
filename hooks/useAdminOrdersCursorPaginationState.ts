"use client";

import { useCallback, useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  parseCursorStack,
  writeCursor,
  writeCursorStack,
} from "@/lib/admin/adminOrdersCursorState";

type CursorPaginationOptions = {
  loading: boolean;
  error: string | null;
  ordersTotal: number | null;
  hasMore: boolean;
  currentCursor: string | null;
  nextCursor: string | null;
  ordersOnPageCount: number;
  pageSize: number;
  searchParams: ReadonlyURLSearchParams;
  replaceSearchParams: (mutate: (sp: URLSearchParams) => void) => void;
};

export function useAdminOrdersCursorPaginationState({
  loading,
  error,
  ordersTotal,
  hasMore,
  currentCursor,
  nextCursor,
  ordersOnPageCount,
  pageSize,
  searchParams,
  replaceSearchParams,
}: CursorPaginationOptions) {
  const cursorStack = parseCursorStack(searchParams.get("cursorStack"));
  const page = cursorStack.length;

  const totalPages =
    typeof ordersTotal === "number"
      ? Math.max(1, Math.ceil(ordersTotal / pageSize))
      : Math.max(1, page + (hasMore ? 2 : 1));
  const rangeStart =
    ordersOnPageCount === 0 && typeof ordersTotal === "number" && ordersTotal <= 0
      ? 0
      : page * pageSize + 1;
  const rangeEnd = page * pageSize + ordersOnPageCount;

  useEffect(() => {
    if (loading || error) return;
    if (typeof ordersTotal !== "number" || ordersTotal <= 0 || pageSize <= 0) return;
    const maxPage = Math.max(0, Math.ceil(ordersTotal / pageSize) - 1);
    if (page > maxPage) {
      replaceSearchParams((sp) => {
        const stack = cursorStack.slice(0, maxPage);
        writeCursorStack(sp, stack);
        const cursor = stack.length > 0 ? stack[stack.length - 1] || null : null;
        writeCursor(sp, cursor);
      });
    }
  }, [
    cursorStack,
    error,
    loading,
    ordersTotal,
    page,
    pageSize,
    replaceSearchParams,
  ]);

  const goPrev = useCallback(() => {
    if (cursorStack.length === 0) return;
    replaceSearchParams((sp) => {
      const nextStack = cursorStack.slice(0, -1);
      writeCursorStack(sp, nextStack);
      const cursor = nextStack.length > 0 ? nextStack[nextStack.length - 1] : null;
      writeCursor(sp, cursor || null);
    });
  }, [cursorStack, replaceSearchParams]);

  const goNext = useCallback(() => {
    if (!nextCursor) return;
    if (
      (typeof ordersTotal === "number" && (page + 1) * pageSize >= ordersTotal) ||
      (ordersTotal == null && (!hasMore || !nextCursor))
    ) {
      return;
    }
    replaceSearchParams((sp) => {
      const stack = [...cursorStack, currentCursor ?? ""];
      writeCursorStack(sp, stack);
      writeCursor(sp, nextCursor);
    });
  }, [
    currentCursor,
    cursorStack,
    hasMore,
    nextCursor,
    ordersTotal,
    page,
    pageSize,
    replaceSearchParams,
  ]);

  return {
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    goPrev,
    goNext,
  };
}
