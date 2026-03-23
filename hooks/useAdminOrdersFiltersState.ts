"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { resetCursorState } from "@/lib/admin/adminOrdersCursorState";
import { parseCreatedAtRangeFromSearchParams } from "@/lib/orders/adminOrderDateRange";
import {
  ADMIN_ORDER_LIST_DEFAULT_LIMIT,
  normalizeAdminOrderPageSize,
} from "@/lib/admin/adminOrdersListContract";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export type AdminOrdersListRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

export type SearchSyncState = {
  searchInput: string;
  setSearchInput: (v: string) => void;
};

export function getNextSearchParamsForDebouncedSearch(
  qsKey: string,
  debouncedQ: string,
): URLSearchParams | null {
  const sp = new URLSearchParams(qsKey);
  const current = (sp.get("q") ?? "").trim();
  const nextQ = debouncedQ.trim();
  if (nextQ === current) return null;
  if (nextQ) sp.set("q", nextQ);
  else sp.delete("q");
  resetCursorState(sp);
  return sp;
}

export function createAdminOrdersReplaceSearchParams(
  router: AdminOrdersListRouter,
  searchParams: ReadonlyURLSearchParams,
) {
  return (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams.toString());
    mutate(sp);
    router.replace(`/admin/orders?${sp.toString()}`, { scroll: false });
  };
}

export function useAdminOrdersSearchSyncState(
  router: AdminOrdersListRouter,
  searchParams: ReadonlyURLSearchParams,
): SearchSyncState {
  const qsKey = searchParams.toString();
  const qFromUrl = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(qFromUrl);
  const debouncedQ = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    setSearchInput(qFromUrl);
  }, [qFromUrl]);

  useEffect(() => {
    const sp = getNextSearchParamsForDebouncedSearch(qsKey, debouncedQ);
    if (!sp) return;
    router.replace(`/admin/orders?${sp.toString()}`, { scroll: false });
  }, [debouncedQ, qsKey, router]);

  return { searchInput, setSearchInput };
}

export type FilterMutatorsState = {
  paymentFilter: "" | "paid" | "unpaid";
  statusFilter: string;
  priorityFilter: string;
  pageSize: number;
  datePresetParam: string;
  dateFromUrl: string;
  dateToUrl: string;
  hasDateFilter: boolean;
  hasFilters: boolean;
  replaceSearchParams: (mutate: (sp: URLSearchParams) => void) => void;
  setPaymentFilter: (v: "" | "paid" | "unpaid") => void;
  setStatusFilter: (v: string) => void;
  setPriorityFilter: (v: string) => void;
  setDatePreset: (preset: "all" | "today" | "7d") => void;
  setDateFromInput: (from: string) => void;
  setDateToInput: (to: string) => void;
  setPageSize: (size: number) => void;
  presetAllActive: boolean;
  presetTodayActive: boolean;
  preset7dActive: boolean;
};

export type AdminOrdersFilterMutators = Pick<
  FilterMutatorsState,
  | "setPaymentFilter"
  | "setStatusFilter"
  | "setPriorityFilter"
  | "setDatePreset"
  | "setDateFromInput"
  | "setDateToInput"
  | "setPageSize"
>;

export function createAdminOrdersFilterMutators(
  replaceSearchParams: (mutate: (sp: URLSearchParams) => void) => void,
): AdminOrdersFilterMutators {
  const setPaymentFilter = (v: "" | "paid" | "unpaid") => {
    replaceSearchParams((sp) => {
      if (v) sp.set("payment", v);
      else sp.delete("payment");
      resetCursorState(sp);
    });
  };

  const setStatusFilter = (v: string) => {
    replaceSearchParams((sp) => {
      if (v) sp.set("status", v);
      else sp.delete("status");
      resetCursorState(sp);
    });
  };

  const setPriorityFilter = (v: string) => {
    replaceSearchParams((sp) => {
      if (v) sp.set("priority", v);
      else sp.delete("priority");
      resetCursorState(sp);
    });
  };

  const setDatePreset = (preset: "all" | "today" | "7d") => {
    replaceSearchParams((sp) => {
      sp.delete("dateFrom");
      sp.delete("dateTo");
      if (preset === "all") sp.delete("datePreset");
      else sp.set("datePreset", preset);
      resetCursorState(sp);
    });
  };

  const setDateFromInput = (from: string) => {
    replaceSearchParams((sp) => {
      sp.delete("datePreset");
      if (from) sp.set("dateFrom", from);
      else sp.delete("dateFrom");
      resetCursorState(sp);
    });
  };

  const setDateToInput = (to: string) => {
    replaceSearchParams((sp) => {
      sp.delete("datePreset");
      if (to) sp.set("dateTo", to);
      else sp.delete("dateTo");
      resetCursorState(sp);
    });
  };

  const setPageSize = (size: number) => {
    replaceSearchParams((sp) => {
      sp.set("pageSize", String(normalizeAdminOrderPageSize(size)));
      resetCursorState(sp);
    });
  };

  return {
    setPaymentFilter,
    setStatusFilter,
    setPriorityFilter,
    setDatePreset,
    setDateFromInput,
    setDateToInput,
    setPageSize,
  };
}

export function getAdminOrdersFilterDerivedState(
  searchParams: ReadonlyURLSearchParams,
) {
  const paymentFilter = (searchParams.get("payment") ?? "") as
    | ""
    | "paid"
    | "unpaid";
  const statusFilter = searchParams.get("status") ?? "";
  const priorityFilter = searchParams.get("priority") ?? "";

  const pageSizeRaw = Number.parseInt(searchParams.get("pageSize") ?? "", 10);
  const pageSize = normalizeAdminOrderPageSize(
    Number.isFinite(pageSizeRaw) && pageSizeRaw >= 1
      ? pageSizeRaw
      : ADMIN_ORDER_LIST_DEFAULT_LIMIT,
  );

  const datePresetParam = (searchParams.get("datePreset") ?? "")
    .trim()
    .toLowerCase();
  const dateFromUrl = searchParams.get("dateFrom") ?? "";
  const dateToUrl = searchParams.get("dateTo") ?? "";
  const hasDateFilter = parseCreatedAtRangeFromSearchParams(searchParams) !== null;

  const hasFilters = Boolean(
    (searchParams.get("q") ?? "").trim() ||
      searchParams.get("payment") ||
      (searchParams.get("status") ?? "").trim() ||
      (searchParams.get("priority") ?? "").trim() ||
      hasDateFilter,
  );

  const presetAllActive =
    !dateFromUrl &&
    !dateToUrl &&
    datePresetParam !== "today" &&
    datePresetParam !== "7d";
  const presetTodayActive =
    datePresetParam === "today" && !dateFromUrl && !dateToUrl;
  const preset7dActive = datePresetParam === "7d" && !dateFromUrl && !dateToUrl;

  return {
    paymentFilter,
    statusFilter,
    priorityFilter,
    pageSize,
    datePresetParam,
    dateFromUrl,
    dateToUrl,
    hasDateFilter,
    hasFilters,
    presetAllActive,
    presetTodayActive,
    preset7dActive,
  };
}

export function useAdminOrdersFilterMutatorsState(
  router: AdminOrdersListRouter,
  searchParams: ReadonlyURLSearchParams,
): FilterMutatorsState {
  const qsKey = searchParams.toString();

  const replaceSearchParams = useCallback(
    createAdminOrdersReplaceSearchParams(router, searchParams),
    [router, searchParams],
  );
  const derived = getAdminOrdersFilterDerivedState(searchParams);
  const mutators = useMemo(
    () => createAdminOrdersFilterMutators(replaceSearchParams),
    [replaceSearchParams],
  );

  useEffect(() => {
    const raw = searchParams.get("pageSize");
    if (raw === null) return;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return;
    const norm = normalizeAdminOrderPageSize(n);
    if (n === norm) return;
    replaceSearchParams((sp) => {
      sp.set("pageSize", String(norm));
    });
  }, [qsKey, replaceSearchParams, searchParams]);

  return {
    paymentFilter: derived.paymentFilter,
    statusFilter: derived.statusFilter,
    priorityFilter: derived.priorityFilter,
    pageSize: derived.pageSize,
    datePresetParam: derived.datePresetParam,
    dateFromUrl: derived.dateFromUrl,
    dateToUrl: derived.dateToUrl,
    hasDateFilter: derived.hasDateFilter,
    hasFilters: derived.hasFilters,
    replaceSearchParams,
    setPaymentFilter: mutators.setPaymentFilter,
    setStatusFilter: mutators.setStatusFilter,
    setPriorityFilter: mutators.setPriorityFilter,
    setDatePreset: mutators.setDatePreset,
    setDateFromInput: mutators.setDateFromInput,
    setDateToInput: mutators.setDateToInput,
    setPageSize: mutators.setPageSize,
    presetAllActive: derived.presetAllActive,
    presetTodayActive: derived.presetTodayActive,
    preset7dActive: derived.preset7dActive,
  };
}

export function useAdminOrdersFiltersState(
  router: AdminOrdersListRouter,
  searchParams: ReadonlyURLSearchParams,
) {
  const searchSyncState = useAdminOrdersSearchSyncState(router, searchParams);
  const filterMutatorsState = useAdminOrdersFilterMutatorsState(
    router,
    searchParams,
  );

  return {
    ...searchSyncState,
    ...filterMutatorsState,
  };
}
