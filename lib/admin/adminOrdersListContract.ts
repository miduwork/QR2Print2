import { parseCreatedAtRangeFromSearchParams } from "@/lib/orders/adminOrderDateRange";

export const ADMIN_ORDER_LIST_DEFAULT_LIMIT = 50;
export const ADMIN_ORDER_LIST_MAX_LIMIT = 500;
export const ADMIN_ORDER_EXPORT_MAX = 10_000;
export const ADMIN_ORDER_BATCH_MAX_IDS = 100;
export const ADMIN_ORDER_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export type AdminOrderListContractParsed = {
  q: string;
  payment: "" | "paid" | "unpaid";
  status: string;
  priority: string;
  limit: number;
  offset: number;
  createdAtGte: string | null;
  createdAtLte: string | null;
  includeTotalExact: boolean;
  cursor: string | null;
  direction: "next" | "prev";
};

export function normalizeAdminOrderPageSize(n: number): number {
  if (
    ADMIN_ORDER_PAGE_SIZE_OPTIONS.includes(
      n as (typeof ADMIN_ORDER_PAGE_SIZE_OPTIONS)[number],
    )
  ) {
    return n;
  }
  return ADMIN_ORDER_LIST_DEFAULT_LIMIT;
}

function parseSharedOrderFilters(searchParams: URLSearchParams): {
  q: string;
  payment: "" | "paid" | "unpaid";
  status: string;
  priority: string;
  createdAtGte: string | null;
  createdAtLte: string | null;
} {
  const q = (searchParams.get("q") ?? "").trim().replace(/,/g, " ");
  const paymentRaw = searchParams.get("payment") ?? "";
  const payment: "" | "paid" | "unpaid" =
    paymentRaw === "paid" || paymentRaw === "unpaid" ? paymentRaw : "";
  const status = (searchParams.get("status") ?? "").trim();
  const priority = (searchParams.get("priority") ?? "").trim();

  const range = parseCreatedAtRangeFromSearchParams(searchParams);
  const createdAtGte = range?.gte ?? null;
  const createdAtLte = range?.lte ?? null;

  return { q, payment, status, priority, createdAtGte, createdAtLte };
}

export function parseAdminOrderListContractParams(
  searchParams: URLSearchParams,
): AdminOrderListContractParsed {
  const { q, payment, status, priority, createdAtGte, createdAtLte } =
    parseSharedOrderFilters(searchParams);

  let limit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = ADMIN_ORDER_LIST_DEFAULT_LIMIT;
  }
  limit = normalizeAdminOrderPageSize(limit);

  let offset = Number.parseInt(searchParams.get("offset") ?? "", 10);
  if (!Number.isFinite(offset) || offset < 0) {
    offset = 0;
  }

  const includeTotalExact = searchParams.get("includeTotal") === "exact";
  const cursorRaw = (searchParams.get("cursor") ?? "").trim();
  const cursor = cursorRaw.length > 0 ? cursorRaw : null;
  const directionRaw = (searchParams.get("direction") ?? "").trim().toLowerCase();
  const direction: "next" | "prev" = directionRaw === "prev" ? "prev" : "next";

  return {
    q,
    payment,
    status,
    priority,
    limit,
    offset,
    createdAtGte,
    createdAtLte,
    includeTotalExact,
    cursor,
    direction,
  };
}

export function parseAdminOrderExportContractParams(
  searchParams: URLSearchParams,
): AdminOrderListContractParsed {
  const { q, payment, status, priority, createdAtGte, createdAtLte } =
    parseSharedOrderFilters(searchParams);

  let limit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = ADMIN_ORDER_EXPORT_MAX;
  }
  if (limit > ADMIN_ORDER_EXPORT_MAX) {
    limit = ADMIN_ORDER_EXPORT_MAX;
  }

  return {
    q,
    payment,
    status,
    priority,
    limit,
    offset: 0,
    createdAtGte,
    createdAtLte,
    includeTotalExact: true,
    cursor: null,
    direction: "next",
  };
}

function appendDateParams(out: URLSearchParams, searchParams: URLSearchParams) {
  const preset = (searchParams.get("datePreset") ?? "").trim().toLowerCase();
  if (preset === "today" || preset === "7d") {
    out.set("datePreset", preset);
  }
  const dateFrom = (searchParams.get("dateFrom") ?? "").trim();
  const dateTo = (searchParams.get("dateTo") ?? "").trim();
  if (dateFrom) out.set("dateFrom", dateFrom);
  if (dateTo) out.set("dateTo", dateTo);
}

export function buildAdminOrdersListApiSearchParams(
  pageSearchParams: URLSearchParams,
): URLSearchParams {
  const out = new URLSearchParams();
  const q = (pageSearchParams.get("q") ?? "").trim();
  if (q) out.set("q", q);
  const payment = pageSearchParams.get("payment") ?? "";
  if (payment === "paid" || payment === "unpaid") out.set("payment", payment);
  const status = (pageSearchParams.get("status") ?? "").trim();
  if (status) out.set("status", status);
  const priority = (pageSearchParams.get("priority") ?? "").trim();
  if (priority) out.set("priority", priority);

  appendDateParams(out, pageSearchParams);

  let pageSize = Number.parseInt(pageSearchParams.get("pageSize") ?? "", 10);
  if (!Number.isFinite(pageSize) || pageSize < 1) {
    pageSize = ADMIN_ORDER_LIST_DEFAULT_LIMIT;
  }
  out.set("limit", String(normalizeAdminOrderPageSize(pageSize)));

  const cursor = (pageSearchParams.get("cursor") ?? "").trim();
  if (cursor) out.set("cursor", cursor);
  return out;
}

export function buildAdminOrdersExportApiSearchParams(
  pageSearchParams: URLSearchParams,
): URLSearchParams {
  const out = new URLSearchParams();
  const q = (pageSearchParams.get("q") ?? "").trim();
  if (q) out.set("q", q);
  const payment = pageSearchParams.get("payment") ?? "";
  if (payment === "paid" || payment === "unpaid") out.set("payment", payment);
  const status = (pageSearchParams.get("status") ?? "").trim();
  if (status) out.set("status", status);
  const priority = (pageSearchParams.get("priority") ?? "").trim();
  if (priority) out.set("priority", priority);
  appendDateParams(out, pageSearchParams);
  return out;
}
