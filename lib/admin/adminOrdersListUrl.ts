import {
  buildAdminOrdersExportApiSearchParams,
  buildAdminOrdersListApiSearchParams,
} from "@/lib/admin/adminOrdersListContract";

/** Query cho `GET /api/admin/orders` từ `URLSearchParams` trang (q, payment, status, cursor, pageSize, ngày). */
export function buildAdminOrdersListApiQuery(searchParams: URLSearchParams): string {
  return buildAdminOrdersListApiSearchParams(searchParams).toString();
}

/** Query cho `GET /api/admin/orders/export` (cùng filter, không phân trang). */
export function buildAdminOrdersExportApiQuery(searchParams: URLSearchParams): string {
  return buildAdminOrdersExportApiSearchParams(searchParams).toString();
}
