-- Form trang chủ: insert qua POST /api/orders (RLS anon cho phép insert; server dùng service role).
-- Cần quyền INSERT cho role anon. (Policy "Khách có thể gửi đơn" đã bị gỡ ở migration cũ.)
DROP POLICY IF EXISTS "anon_insert_orders_public_form" ON public.orders;

CREATE POLICY "anon_insert_orders_public_form"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);
