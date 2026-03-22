-- Đơn hàng chỉ được tạo qua ứng dụng (service role), không còn INSERT trực tiếp từ anon.
DROP POLICY IF EXISTS "Khách có thể gửi đơn" ON public.orders;
