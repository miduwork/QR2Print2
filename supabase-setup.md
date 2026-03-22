# Thiết lập Supabase cho QR2Print

## 0. Biến môi trường (Next.js)

1. Copy [`.env.local.example`](.env.local.example) thành `.env.local` ở thư mục gốc project.
2. Điền từ **Supabase Dashboard** → **Project Settings** → **API**:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon / public key
   - `SUPABASE_SERVICE_ROLE_KEY` — **service_role** (chỉ server, không commit lên git)
3. Các biến khác (VietQR, SePay, giá in): xem comment trong `.env.local.example`.

**Luồng code hiện tại:** form khách và admin (trình duyệt) dùng **anon key** qua [`lib/supabase/client.ts`](lib/supabase/client.ts); thao tác bảng `orders` gom trong [`lib/orders/repository.ts`](lib/orders/repository.ts). API `/api/orders/[id]` và webhook dùng **service role** trong [`lib/orders/repository.server.ts`](lib/orders/repository.server.ts) / [`lib/supabase/admin.ts`](lib/supabase/admin.ts).

---

## 1. Tạo hoặc reset CSDL bằng một file SQL

File **`supabase/schema.sql`** chứa toàn bộ định nghĩa CSDL của dự án.

### Cách 1: Tạo mới (project chưa có bảng của QR2Print)

1. Vào **Supabase Dashboard** → **SQL Editor** → **New query**.
2. Mở file `supabase/schema.sql`, **chỉ copy phần "PHẦN 2: TẠO LẠI CSDL MỚI"** (từ `-- 2.1 Bảng orders` đến hết).
3. Dán vào SQL Editor → **Run**.

### Cách 2: Xóa hết rồi tạo lại (reset toàn bộ)

1. **Backup dữ liệu** nếu cần (Export từ Table Editor hoặc pg_dump).
2. **SQL Editor** → **New query** → mở `supabase/schema.sql`, copy **toàn bộ nội dung file** (cả Phần 1 và Phần 2).
3. Dán và **Run**. Phần 1 sẽ xóa bảng `transactions`, `orders` và policy storage; phần 2 tạo lại đầy đủ.

**Lưu ý:** Nếu báo lỗi policy storage đã tồn tại khi chạy lần 2, chạy riêng Phần 1 trước, sau đó chạy Phần 2.

**Project đã có bảng `orders` từ bản cũ:** chạy thêm migration [`supabase/migrations/20250323000000_anon_insert_orders.sql`](supabase/migrations/20250323000000_anon_insert_orders.sql) trong SQL Editor (thêm policy `anon_insert_orders_public_form`). Không có policy này, form trang chủ **không** insert được đơn khi dùng anon key.

Hoặc dùng **`supabase/reset_all.sql`** từ đầu — file đã gồm policy INSERT cho anon và đồng bộ với code hiện tại.

---

## 2. Bật Supabase Auth (Đăng nhập Admin)

1. Vào **Authentication** → **Providers** trong menu trái.
2. Bật **Email** (mặc định đã bật).
3. (Tùy chọn) Tắt **Confirm email** nếu bạn muốn đăng nhập ngay không cần xác thực email.

### Tạo tài khoản Admin

**Cách 1 – Qua Dashboard:**  
Vào **Authentication** → **Users** → **Add user** → chọn **Create new user**, nhập email và mật khẩu → **Create user**.

**Cách 2 – Tự đăng ký rồi duyệt:**  
Bật **Enable email signup** trong Providers → người dùng đăng ký tại app → vào **Authentication** → **Users** để xem/khóa user.

Sau khi có user, dùng đúng email + mật khẩu đó tại `/login` để đăng nhập Admin. Policy bảng `orders` đã dùng `auth.role() = 'authenticated'` nên bất kỳ user đã đăng nhập nào cũng được xem/sửa đơn (bạn có thể thu hẹp sau bằng role/custom claim nếu cần).

---

## 3. Xử lý lỗi "Bucket not found"

Nếu form khách hàng báo **Bucket not found** khi gửi đơn (upload file), nghĩa là bucket **documents** chưa tồn tại trong Supabase Storage. Làm theo SQL tạo bucket + policy trong **Mục 1** (`schema.sql` / `reset_all.sql`), hoặc thủ công:

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn project.
2. Menu trái → **Storage**.
3. **New bucket** → **Name** nhập chính xác: `documents` (chữ thường).
4. Bật **Public bucket** nếu muốn xem/tải file qua link trực tiếp.
5. **Create bucket**.
6. Thêm policy cho phép upload: **Policies** → **New policy** → cho phép **INSERT** với role **anon** (hoặc dùng đoạn SQL policy trong Mục 2).

---

## 4. Realtime (trang thanh toán tự cập nhật)

Trang **Database → Replication** trong Dashboard dùng cho *đẩy dữ liệu ra kho bên ngoài* (BigQuery, Iceberg…), **không** dùng để bật Realtime cho app.

Để trang `/payment/[id]` tự chuyển sang "Thanh toán thành công" khi webhook cập nhật bảng `orders`, cần **thêm bảng vào publication Realtime** bằng SQL:

1. Vào **SQL Editor** → **New query**.
2. Dán và **Run**:

```sql
-- Thêm bảng orders vào Realtime (client subscribe postgres_changes)
alter publication supabase_realtime add table public.orders;
-- Gửi full row khi UPDATE (để client nhận payment_status mới)
alter table public.orders replica identity full;
```

Nếu báo lỗi "table already in publication", nghĩa là bảng đã được bật Realtime, có thể bỏ qua hoặc chỉ chạy dòng `alter table public.orders replica identity full;`.

## 5. Cấu hình Webhook SePay

Ứng dụng nhận **SePay Webhooks** (tiền vào tài khoản liên kết) tại route **`POST /api/webhook/sepay`** — code: [`app/api/webhook/sepay/route.ts`](app/api/webhook/sepay/route.ts), logic: [`lib/webhooks/sepay.ts`](lib/webhooks/sepay.ts).

### 5.1 Giai đoạn A — Checklist vận hành (không đổi code)

Làm lần lượt trước khi coi webhook production đã sẵn sàng:

1. **URL public + HTTPS:** SePay chỉ gọi được endpoint **HTTPS** trên Internet (không dùng `http://localhost`). URL đầy đủ: `https://<domain-production>/api/webhook/sepay` — `<domain-production>` là hostname site đã deploy (thường trùng ý nghĩa với `NEXT_PUBLIC_SITE_URL` sau khi bỏ scheme, ví dụ `https://example.com` → path `/api/webhook/sepay`).
2. **Dashboard SePay:** Cấu hình webhook (mục 5.3).
3. **Biến môi trường trên hosting:** Đặt `WEBHOOK_SEPAY_API_KEY` và `SUPABASE_SERVICE_ROLE_KEY` (mục 5.2).
4. **Kiểm thử:** Giao dịch giả lập hoặc CK nhỏ; đối chiếu Nhật ký SePay và CSDL (mục 5.4).

Chi tiết kế hoạch tích hợp: [docs/SEPAY-WEBHOOK-INTEGRATION-PLAN.md](docs/SEPAY-WEBHOOK-INTEGRATION-PLAN.md).

### 5.2 Biến môi trường (local và production)

| Biến | Ghi chú |
|------|---------|
| `WEBHOOK_SEPAY_API_KEY` | Chuỗi bạn đặt trên SePay (API Key). **Chỉ** dùng trên server (webhook route); không prefix `NEXT_PUBLIC_`, không commit lên git. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role**. Webhook cần quyền ghi `orders` / `transactions`; **không** đưa vào client hay frontend. |

**Local:** copy [`.env.local.example`](.env.local.example) → `.env.local` và điền giá trị.

**Production (Vercel, VPS, v.v.):** thêm cùng tên biến trong bảng Environment của nền tảng deploy, áp dụng cho môi trường **Production**, rồi **Redeploy** sau khi sửa. Đảm bảo không lộ `WEBHOOK_SEPAY_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` trong log công khai hay bundle phía trình duyệt.

### 5.2.1 Hàm SQL cho webhook (bắt buộc một lần)

Webhook tìm đơn theo 8 ký tự đầu UUID qua hàm **`match_orders_by_id_prefix`** (PostgREST không áp ổn định filter `id::text` qua API). **Chạy một lần** trong Supabase **SQL Editor** → New query → mở file [`supabase/migrations/20260322140000_match_orders_by_id_prefix.sql`](supabase/migrations/20260322140000_match_orders_by_id_prefix.sql), dán toàn bộ → **Run**. Nếu thiếu bước này, SePay vẫn báo HTTP 200 nhưng `orders` không được cập nhật và trang thanh toán không đổi.

### 5.3 Cấu hình my.sepay.vn (WebHooks)

1. Vào [my.sepay.vn/webhooks](https://my.sepay.vn/webhooks) → thêm/sửa webhook.
2. **URL:** `https://<domain-production>/api/webhook/sepay` (đúng domain đã deploy).
3. **Chứng thực:** **API Key** — nhập **đúng** giá trị đã đặt trong `WEBHOOK_SEPAY_API_KEY` trên server.
4. **Sự kiện:** **Tiền vào** (Money in), hoặc sự kiện tương ứng tài khoản bạn dùng cho VietQR/CK.

Ứng dụng chấp nhận header `Authorization: Apikey YOUR_KEY` (hoặc tương thích trong code). Nếu SePay trả **401** trên Nhật ký webhook: kiểm tra API Key dashboard và env production có **khớp từng ký tự** (không thừa dấu cách, đúng môi trường deploy).

### 5.4 Kiểm thử và đối soát (sau khi cấu hình)

1. Thực hiện **Giả lập giao dịch** (nếu SePay cung cấp) hoặc chuyển khoản **số tiền nhỏ** với nội dung đúng format đơn (hiện tại: trích mã đơn từ nội dung CK, ví dụ regex `IN AN …`; xem comment trong code webhook).
2. Trên SePay: **Nhật ký webhooks** — request tới đúng URL, phản hồi **HTTP 200** khi xử lý thành công.
3. **Supabase → SQL Editor** — kiểm tra log và đơn, ví dụ:

```sql
-- Vài bản ghi webhook gần nhất
select id, created_at, sepay_id, transfer_amount, content, order_id, amount_matched, order_updated
from public.transactions
order by created_at desc
limit 20;

-- Đơn đã thanh toán gần đây (điều chỉnh nếu bạn đổi giá trị payment_status)
select id, created_at, payment_status, total_price, priority
from public.orders
where payment_status <> 'Chưa thanh toán'
order by created_at desc
limit 20;
```

Nếu **không** thấy request trên SePay: kiểm tra URL public, HTTPS, firewall, và domain trỏ đúng app.

### 5.5 Sandbox (tùy chọn)

Môi trường dev SePay: [my.dev.sepay.vn](https://my.dev.sepay.vn) — có thể cần **liên hệ SePay** để được kích hoạt. Dùng khi muốn thử trước khi trỏ webhook production; không bắt buộc nếu chỉ kiểm thử bằng giao dịch nhỏ trên production.

### 5.6 Hành vi ứng dụng (tóm tắt)

Sau khi xác thực API Key và parse JSON hợp lệ, webhook trích mã đơn từ nội dung, so khớp số tiền với `orders.total_price`, cập nhật `payment_status` và `priority` khi khớp; mọi request hợp lệ đều ghi vào bảng `transactions` (đối soát).

---

## 6. Đếm số trang file Word (tùy chọn / mở rộng)

**Hiện tại:** ứng dụng đếm trang **PDF** bằng `pdf-lib` (API `/api/count-pdf-pages`, v.v.). Chuyển **Word** (.doc, .docx) sang PDF rồi đếm trang **chưa được tích hợp** trong code; khi triển khai, máy chạy Next.js thường **cần cài LibreOffice** (hoặc dùng API cloud — xem doc dưới).

### Khi nào cần cài LibreOffice

- **Windows:** Tải [LibreOffice](https://www.libreoffice.org/download/download/) → cài đặt (mặc định: `C:\Program Files\LibreOffice\program\soffice.exe`).
- **macOS:** `brew install --cask libreoffice` hoặc tải từ trang chủ.
- **Linux (Ubuntu/Debian):** `sudo apt install libreoffice`.

Sau khi cài, **khởi động lại** terminal (hoặc restart máy) rồi chạy lại `npm run dev`. Cho đến khi có luồng Word→PDF trong code, file Word vẫn gửi đơn được; đếm trang tự động cho Word là tính năng mở rộng.

**Chi tiết cài trên từng loại máy chủ + cách làm không cần LibreOffice:** xem [docs/WORD-PAGE-COUNT.md](docs/WORD-PAGE-COUNT.md).
