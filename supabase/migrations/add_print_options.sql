-- Thêm cột in đen trắng/màu và in 2 mặt/1 mặt vào bảng orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS print_color text DEFAULT 'bw';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS print_sides text DEFAULT 'double';
