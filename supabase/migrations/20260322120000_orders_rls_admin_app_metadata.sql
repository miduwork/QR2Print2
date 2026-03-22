-- Chỉ user có app_metadata.role = 'admin' mới được ALL trên orders (authenticated).
-- Đặt role trong Supabase Dashboard → Authentication → Users → App metadata: {"role":"admin"}

DROP POLICY IF EXISTS "Chỉ Admin mới có quyền xem/sửa" ON public.orders;
DROP POLICY IF EXISTS "authenticated_admin_orders_full_access" ON public.orders;

CREATE POLICY "authenticated_admin_orders_full_access"
  ON public.orders FOR ALL TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  WITH CHECK (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');
