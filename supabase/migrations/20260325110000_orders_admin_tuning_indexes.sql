-- Tuning index cho admin list/search/stats-lite theo plan P3.2

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_orders_customer_name_trgm
  ON public.orders USING gin (customer_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_orders_phone_number_trgm
  ON public.orders USING gin (phone_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_orders_priority_status
  ON public.orders (priority, status);
