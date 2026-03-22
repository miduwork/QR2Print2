import type { PostgrestError } from "@supabase/supabase-js";
import type { OrderInsert } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cột trả về cho GET /api/orders/[id] (trang thanh toán). */
const ORDER_PAYMENT_SELECT =
  "id, customer_name, total_pages, page_count, total_price, copies, delivery_method, delivery_address, shipping_fee, payment_status";

export type OrderPaymentRow = {
  id: string;
  customer_name: string;
  total_pages: number | null;
  page_count: number | null;
  total_price: number | null;
  copies: number | null;
  delivery_method: string | null;
  delivery_address: string | null;
  shipping_fee: number | null;
  payment_status: string | null;
};

export type GetOrderByIdResult =
  | { ok: true; order: OrderPaymentRow }
  | { ok: false; kind: "not_found" }
  | { ok: false; kind: "error"; error: PostgrestError };

function logOrdersServerError(context: string, error: PostgrestError) {
  console.error(`[orders.repository.server] ${context}:`, error);
}

/**
 * Đọc đơn theo id (service role). Chỉ dùng trên server (API routes, server actions).
 */
export async function getOrderById(id: string): Promise<GetOrderByIdResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_PAYMENT_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116" || error.message.includes("Row not found")) {
      return { ok: false, kind: "not_found" };
    }
    logOrdersServerError("getOrderById", error);
    return { ok: false, kind: "error", error };
  }

  return { ok: true, order: data as OrderPaymentRow };
}

function logOrdersServerInsertError(context: string, error: PostgrestError) {
  console.error(`[orders.repository.server] ${context}:`, error);
}

/**
 * Insert đơn (service role).
 * Bỏ print_color / print_sides nếu schema chưa có cột (đồng bộ với lib/orders/repository.ts).
 */
export async function insertOrderWithServiceRole(
  order: OrderInsert,
): Promise<{ error: PostgrestError | null }> {
  const supabase = createAdminClient();
  const { print_color: _pc, print_sides: _ps, ...insertPayload } = order;
  const { error } = await supabase.from("orders").insert(insertPayload);
  if (error) logOrdersServerInsertError("insertOrderWithServiceRole", error);
  return { error };
}
