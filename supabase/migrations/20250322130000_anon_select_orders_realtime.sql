-- Để Realtime Postgres Changes (trang /payment/[id]) nhận UPDATE cho client anon,
-- cần quyền SELECT. Trade-off: client có anon key có thể đọc toàn bộ đơn qua PostgREST.
DROP POLICY IF EXISTS "anon_select_orders_for_realtime" ON public.orders;

CREATE POLICY "anon_select_orders_for_realtime"
  ON public.orders FOR SELECT TO anon USING (true);
