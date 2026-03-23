-- Thêm cột in đen trắng/màu và in 2 mặt/1 mặt vào bảng orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS print_color text DEFAULT 'bw';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS print_sides text DEFAULT 'double';

COMMENT ON COLUMN public.orders.print_color IS 'bw | color';
COMMENT ON COLUMN public.orders.print_sides IS 'single | double';

-- Đơn cũ có thể NULL: gom về default (an toàn chạy lại)
UPDATE public.orders
SET print_color = COALESCE(NULLIF(trim(print_color), ''), 'bw')
WHERE print_color IS NULL;

UPDATE public.orders
SET print_sides = COALESCE(NULLIF(trim(print_sides), ''), 'double')
WHERE print_sides IS NULL;
