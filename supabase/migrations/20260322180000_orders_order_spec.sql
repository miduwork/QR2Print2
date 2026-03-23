-- Chi tiết loại in (tài liệu / sách): khổ giấy, định lượng, ruột–bìa, đóng gáy, v.v.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_spec jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.orders.order_spec IS 'JSON: loại in (document|book), khổ giấy, gsm, phạm vi trang, ruột/bìa/sách…';

UPDATE public.orders
SET order_spec = '{}'::jsonb
WHERE order_spec IS NULL;
