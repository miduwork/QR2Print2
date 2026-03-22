import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/lib/types";

export const ORDERS_ADMIN_LIST_SELECT =
  "id, created_at, customer_name, phone_number, file_url, file_name, note, page_count, copies, delivery_method, delivery_address, shipping_fee, priority, status, payment_status, completed_at, delivered_at";

export function logOrdersAdminError(context: string, error: PostgrestError) {
  console.error(`[orders.adminOrderData] ${context}:`, error);
}

export type AdminOrderPatch = Partial<
  Pick<Order, "status" | "priority" | "completed_at" | "delivered_at">
>;

export async function listOrdersForAdminWithClient(supabase: SupabaseClient) {
  return supabase
    .from("orders")
    .select(ORDERS_ADMIN_LIST_SELECT)
    .order("created_at", { ascending: true });
}

export async function updateOrderForAdminWithClient(
  supabase: SupabaseClient,
  id: string,
  patch: AdminOrderPatch,
) {
  return supabase.from("orders").update(patch).eq("id", id);
}
