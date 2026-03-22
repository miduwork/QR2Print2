-- =============================================================================
-- QR2Print – Supabase Schema (tham khảo / tạo mới project)
-- Để XÓA HẾT CSDL + Storage và tạo lại từ đầu: dùng file reset_all.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PHẦN 1: XÓA TOÀN BỘ (chạy trước khi tạo lại)
-- Lưu ý: Dữ liệu trong bảng sẽ mất. Backup nếu cần.
-- -----------------------------------------------------------------------------

-- 1.1 Xóa policy trên storage.objects (nếu có)
drop policy if exists "Allow upload to documents" on storage.objects;
drop policy if exists "Allow public read documents" on storage.objects;

-- 1.2 Xóa bảng transactions trước (có khóa ngoại tới orders)
drop table if exists public.transactions;

-- 1.3 Xóa bảng orders
drop table if exists public.orders;

-- 1.5 Xóa policy đọc đơn thanh toán (nếu còn)
drop policy if exists "Khách xem đơn thanh toán" on public.orders;
drop policy if exists "anon_select_orders_for_realtime" on public.orders;
drop policy if exists "anon_insert_orders_public_form" on public.orders;

-- 1.4 (Tùy chọn) Xóa bucket documents và mọi file trong đó
-- Chỉ bỏ comment 2 dòng dưới nếu bạn muốn xóa cả file đã upload.
-- delete from storage.objects where bucket_id = 'documents';
-- delete from storage.buckets where id = 'documents';

-- -----------------------------------------------------------------------------
-- PHẦN 2: TẠO LẠI CSDL MỚI
-- -----------------------------------------------------------------------------

-- 2.1 Bảng orders (đơn in)
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  phone_number text not null,
  file_url text not null,
  file_name text,
  note text,
  priority text default 'Ưu tiên',
  status text default 'Chưa hoàn thành',
  completed_at timestamptz,
  delivered_at timestamptz,
  page_count integer,
  copies int4 default 1,
  delivery_method text default 'pickup',
  delivery_address text,
  shipping_fee int4 default 0,
  total_pages int4,
  total_price int4,
  payment_status text default 'Chưa thanh toán',
  print_color text default 'bw',
  print_sides text default 'double'
);

-- Indexes hỗ trợ truy vấn nhanh theo trạng thái
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_payment_status on public.orders(payment_status);

comment on table public.orders is 'Đơn in – form khách gửi, admin quản lý, webhook cập nhật thanh toán';

alter table public.orders enable row level security;

-- INSERT từ form khách: policy "anon_insert_orders_public_form" (anon).
-- Webhook/API server: service role bỏ qua RLS.

create policy "authenticated_admin_orders_full_access"
  on public.orders for all to authenticated
  using (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

-- Realtime /payment/[id]: Postgres Changes cần quyền SELECT cho anon (trade-off: anon key có thể đọc đơn qua API).
create policy "anon_select_orders_for_realtime"
  on public.orders for select to anon using (true);

-- Form khách (trang chủ): insert qua anon — khớp lib/orders/repository.ts
create policy "anon_insert_orders_public_form"
  on public.orders for insert to anon
  with check (true);

-- 2.2 Bảng transactions (log webhook SePay – đối soát)
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  sepay_id bigint,
  gateway text,
  transaction_date text,
  account_number text,
  content text,
  description text,
  transfer_type text,
  transfer_amount bigint,
  reference_code text,
  order_id uuid references public.orders(id),
  order_id_prefix text,
  amount_matched boolean not null default false,
  order_updated boolean not null default false,
  raw_payload jsonb
);

comment on table public.transactions is 'Lịch sử giao dịch từ webhook SePay – dùng để đối soát';

alter table public.transactions enable row level security;

create policy "Admin đọc transactions"
  on public.transactions for select to authenticated using (true);

-- 2.3 Storage: bucket documents (file tài liệu khách gửi)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

create policy "Allow upload to documents"
  on storage.objects for insert to anon
  with check (bucket_id = 'documents');

create policy "Allow public read documents"
  on storage.objects for select to anon
  using (bucket_id = 'documents');

-- -----------------------------------------------------------------------------
-- Realtime (trang /payment/[id] tự cập nhật khi webhook cập nhật orders)
-- Thêm bảng orders vào publication supabase_realtime; REPLICA IDENTITY FULL để nhận full row khi UPDATE
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.orders;
alter table public.orders replica identity full;

-- -----------------------------------------------------------------------------
-- PHẦN 3: Migration – thêm cột in đen trắng/màu, 2 mặt/1 mặt (chạy nếu bảng orders đã có sẵn)
-- Chạy trong SQL Editor nếu bạn đã có bảng orders từ trước, không cần chạy PHẦN 1–2.
-- -----------------------------------------------------------------------------
-- alter table public.orders add column if not exists print_color text default 'bw';
-- alter table public.orders add column if not exists print_sides text default 'double';
