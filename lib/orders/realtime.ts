import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/lib/orders/types";

type Unsubscribe = () => void;

/**
 * Subscribe realtime UPDATE cho 1 đơn hàng theo id.
 * Yêu cầu: bảng public.orders trong publication supabase_realtime; RLS cho phép role
 * hiện tại SELECT dòng đó (anon: policy "anon_select_orders_for_realtime").
 * Admin (authenticated) đã có policy "Chỉ Admin..." — có thể tái sử dụng pattern này.
 */
export function subscribeOrderUpdates(
  orderId: string,
  onUpdate: (next: Order) => void,
): Unsubscribe {
  if (!orderId) return () => {};

  const channel: RealtimeChannel = supabase
    .channel(`order:${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        onUpdate(payload.new as Order);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

