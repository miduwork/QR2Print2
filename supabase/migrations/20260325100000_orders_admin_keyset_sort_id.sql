-- Ổn định keyset sort cho admin list: thêm tie-breaker `id`.

CREATE INDEX IF NOT EXISTS idx_orders_admin_list_sort_keyset
  ON public.orders (priority_sort DESC, created_at ASC, id ASC);
