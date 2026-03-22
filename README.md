# QR2Print

## Kiến trúc dữ liệu (Supabase + Next.js)

### Khách (trang chủ, form đặt in)

- **HTTP**: `POST /api/orders` ([app/api/orders/route.ts](app/api/orders/route.ts)).
- **Server**: dùng **service role** (`SUPABASE_SERVICE_ROLE_KEY`) qua [`createAdminClient`](lib/supabase/admin.ts) — bỏ qua RLS, phù hợp upload/insert an toàn từ server.
- Không gọi trực tiếp mutation nhạy cảm từ browser với quyền admin.

### Admin (trang `/admin`)

- **Browser**: [`createClient`](lib/supabase/client.ts) (`@supabase/ssr` + `NEXT_PUBLIC_*`) — session Supabase Auth trong cookie; **RLS** áp dụng theo JWT.
- **Hook**: [`useOrdersList`](hooks/useOrdersList.ts) → [`listOrdersForAdmin` / `updateOrderForAdmin`](lib/orders/repository.ts).
- Logic truy vấn dùng chung với [`/api/admin/orders`](app/api/admin/orders/route.ts) (GET/PATCH) khi cần client không phải web (mobile, audit server-side, v.v.).

### Row Level Security (RLS)

- **`authenticated`**: chỉ user có `app_metadata.role = 'admin'` mới được `SELECT`/`INSERT`/`UPDATE`/`DELETE` trên `orders` (xem migration trong `supabase/migrations/`).
- **`anon`**: `INSERT` cho form công khai; `SELECT` toàn bảng — **trade-off** cho Realtime trang thanh toán: ai có **anon key** có thể đọc mọi dòng `orders` qua PostgREST. Không coi anon là ranh giới bảo mật cho dữ liệu nhạy cảm.
- Webhook / job: **service role** (không đi qua RLS).

### Vận hành admin

1. Trong Supabase Dashboard → Authentication → Users: tạo user admin và set **App metadata** → `role`: `admin` (JSON: `{ "role": "admin" }`).
2. Biến môi trường: `.env.local` — xem [`.env.local.example`](.env.local.example).

### Khi nào nên gom admin qua API tập trung

- Audit log (ai đổi trạng thái, IP).
- Mobile hoặc nhiều client cùng contract REST.
- Rate limit, validation phức tạp, side-effect (email, webhook nội bộ).
- Khi đó ưu tiên gọi [`/api/admin/orders`](app/api/admin/orders/route.ts) (hoặc Server Actions) sau khi kiểm tra session + role, thay vì nhân đôi query Supabase trên từng client.

---

## Deploy lên Vercel

Dự án là **Next.js 14** — Vercel nhận diện framework tự động; không cần `vercel.json`. Đã kiểm tra `npm run build` chạy được trên máy dev.

### 1. Đưa code lên GitHub

Trong thư mục project (đã có `git` và commit đầu tiên):

1. Tạo repository **trống** trên [GitHub](https://github.com/new) (không tick “Add README”).
2. Trong terminal tại thư mục dự án:

```bash
git remote add origin https://github.com/<user>/<repo>.git
git branch -M main
git push -u origin main
```

Thay `<user>/<repo>` bằng repo của bạn.

### 2. Kết nối Vercel

1. Đăng nhập [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** repository GitHub vừa push → **Deploy** (giữ mặc định: Framework Next.js, Build `next build`, Output mặc định).

### 3. Biến môi trường (bắt buộc)

Trong Vercel: **Project → Settings → Environment Variables** — thêm cho **Production** (và Preview nếu cần), bắt chước [`.env.local.example`](.env.local.example):

| Biến | Ghi chú |
|------|---------|
| `NEXT_PUBLIC_SITE_URL` | URL production có `https://`, ví dụ `https://your-app.vercel.app` hoặc domain tùy chỉnh. |
| `NEXT_PUBLIC_SUPABASE_URL` | Từ Supabase Dashboard → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon public key. |
| `NEXT_PUBLIC_PRICE_PER_PAGE` | Ví dụ `500`. |
| `NEXT_PUBLIC_VIETQR_BANK_ID` | Mã ngân hàng VietQR. |
| `NEXT_PUBLIC_VIETQR_ACCOUNT_NO` | Số tài khoản hiển thị QR. |
| `WEBHOOK_SEPAY_API_KEY` | Khớp cấu hình SePay Webhooks. |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** — chỉ server, không public. |

Các biến tùy chọn (`NEXT_PUBLIC_PICKUP_ADDRESS`, `NEXT_PUBLIC_FREESHIP_THRESHOLD_VND`, …) có trong `.env.local.example`.

Sau khi thêm/sửa biến: **Redeploy** (Deployments → … → Redeploy).

### 4. Domain và webhook SePay

- **HTTPS:** Vercel cấp tự động cho `*.vercel.app` và domain tùy chỉnh (**Settings → Domains**).
- Cập nhật lại `NEXT_PUBLIC_SITE_URL` khi đã có domain cuối cùng.
- SePay Webhooks URL: `https://<domain-của-bạn>/api/webhook/sepay` — xem thêm [supabase-setup.md](supabase-setup.md) §5.

### 5. Deploy bằng CLI (tùy chọn)

Nếu không dùng GitHub, có thể cài [Vercel CLI](https://vercel.com/docs/cli) và chạy `npx vercel` trong thư mục project (đăng nhập trình duyệt khi được hỏi); production: `npx vercel --prod`. Vẫn cần cấu hình env trên dashboard Vercel cho project đó.
