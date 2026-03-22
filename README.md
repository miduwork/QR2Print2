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
