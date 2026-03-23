-- Cột phụ cho danh sách admin: sort theo ưu tiên + created_at; tìm prefix mã đơn (UUID không gạch).

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS priority_sort smallint
  GENERATED ALWAYS AS (
    CASE trim(coalesce(priority, ''))
      WHEN 'Ưu tiên cao' THEN 3
      WHEN 'Ưu tiên' THEN 2
      WHEN 'Ưu tiên thấp' THEN 1
      ELSE 0
    END
  ) STORED;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS id_hex text
  GENERATED ALWAYS AS (replace(id::text, '-', '')) STORED;

CREATE INDEX IF NOT EXISTS idx_orders_admin_list_sort
  ON public.orders (priority_sort DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_orders_id_hex_pattern
  ON public.orders (id_hex text_pattern_ops);
