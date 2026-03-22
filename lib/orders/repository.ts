import { createClient } from "@/lib/supabase/client";
import {
  listOrdersForAdminWithClient,
  logOrdersAdminError,
  updateOrderForAdminWithClient,
  type AdminOrderPatch,
} from "@/lib/orders/adminOrderData";

export type { AdminOrderPatch };

export async function listOrdersForAdmin() {
  const supabase = createClient();
  const result = await listOrdersForAdminWithClient(supabase);
  if (result.error) logOrdersAdminError("listOrdersForAdmin", result.error);
  return result;
}

export async function updateOrderForAdmin(id: string, patch: AdminOrderPatch) {
  const supabase = createClient();
  const result = await updateOrderForAdminWithClient(supabase, id, patch);
  if (result.error) logOrdersAdminError("updateOrderForAdmin", result.error);
  return result;
}
