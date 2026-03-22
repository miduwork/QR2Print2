-- Form trang chủ tạo đơn qua lib/orders/repository.ts (anon + RLS).
-- Cần quyền INSERT cho role anon. (Policy "Khách có thể gửi đơn" đã bị gỡ ở migration cũ.)
DROP POLICY IF EXISTS "anon_insert_orders_public_form" ON public.orders;

CREATE POLICY "anon_insert_orders_public_form"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);
