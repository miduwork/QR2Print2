-- =============================================================================
-- QR2Print – XÓA HẾT CSDL VÀ TẠO LẠI TỪ ĐẦU
-- Chạy TOÀN BỘ file này trong Supabase SQL Editor (Run).
--
-- STORAGE: Supabase không cho xóa bucket/file bằng SQL. Trước khi chạy script:
--   Vào Dashboard → Storage → bucket "documents" → chọn tất cả file → Delete.
--   Sau đó vào bucket settings (icon bánh răng) → Delete bucket.
--   Script sẽ tạo lại bucket và policies ở Bước 5.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BƯỚC 1: XÓA POLICY STORAGE (để có thể xóa bucket từ Dashboard nếu chưa xóa)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow upload to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read documents" ON storage.objects;

-- -----------------------------------------------------------------------------
-- BƯỚC 2: XÓA BẢNG (CSDL)
-- -----------------------------------------------------------------------------

-- 2.1 Xóa bảng transactions trước (có khóa ngoại tới orders)
DROP TABLE IF EXISTS public.transactions;

-- 2.2 Xóa bảng orders (tự gỡ khỏi publication Realtime)
DROP TABLE IF EXISTS public.orders;

-- -----------------------------------------------------------------------------
-- BƯỚC 3: TẠO LẠI BẢNG orders
-- -----------------------------------------------------------------------------

CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  note text,
  priority text DEFAULT 'Ưu tiên',
  status text DEFAULT 'Chưa hoàn thành',
  completed_at timestamptz,
  delivered_at timestamptz,
  page_count integer,
  copies int4 DEFAULT 1,
  delivery_method text DEFAULT 'pickup',
  delivery_address text,
  shipping_fee int4 DEFAULT 0,
  total_pages int4,
  total_price int4,
  payment_status text DEFAULT 'Chưa thanh toán',
  print_color text DEFAULT 'bw',
  print_sides text DEFAULT 'double'
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);

COMMENT ON TABLE public.orders IS 'Đơn in – form khách gửi, admin quản lý, webhook cập nhật thanh toán';

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- INSERT form khách: policy anon_insert_orders_public_form bên dưới.

CREATE POLICY "authenticated_admin_orders_full_access"
  ON public.orders FOR ALL TO authenticated
  USING (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  WITH CHECK (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- Realtime /payment/[id]: Postgres Changes cần SELECT cho anon (trade-off: anon key có thể đọc đơn qua API).
CREATE POLICY "anon_select_orders_for_realtime"
  ON public.orders FOR SELECT TO anon USING (true);

-- Form trang chủ: insert đơn từ client (anon), khớp lib/orders/repository.ts
CREATE POLICY "anon_insert_orders_public_form"
  ON public.orders FOR INSERT TO anon
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- BƯỚC 4: TẠO LẠI BẢNG transactions
-- -----------------------------------------------------------------------------

CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  sepay_id bigint,
  gateway text,
  transaction_date text,
  account_number text,
  content text,
  description text,
  transfer_type text,
  transfer_amount bigint,
  reference_code text,
  order_id uuid REFERENCES public.orders(id),
  order_id_prefix text,
  amount_matched boolean NOT NULL DEFAULT false,
  order_updated boolean NOT NULL DEFAULT false,
  raw_payload jsonb
);

COMMENT ON TABLE public.transactions IS 'Lịch sử giao dịch từ webhook SePay – dùng để đối soát';

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin đọc transactions"
  ON public.transactions FOR SELECT TO authenticated USING (true);

-- -----------------------------------------------------------------------------
-- BƯỚC 5: TẠO LẠI STORAGE BUCKET documents
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Allow upload to documents"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read documents"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'documents');

-- -----------------------------------------------------------------------------
-- BƯỚC 6: BẬT REALTIME CHO BẢNG orders
-- -----------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- =============================================================================
-- Xong. CSDL và Storage đã được thiết lập lại từ đầu.
-- =============================================================================
