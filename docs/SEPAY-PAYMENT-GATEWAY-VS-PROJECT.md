# So sánh: [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) và hiện trạng dự án QR2Print2

Tài liệu đối chiếu **cả hai phần** trong [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) — **Phần 1 · Cổng thanh toán** và **Phần 2 · SePay Webhooks** — với code và cấu hình trong repo **tại thời điểm ghi nhận**.

**Kết luận ngắn**

| Phần trong doc | Mức độ khớp dự án |
|----------------|-------------------|
| **Phần 1 — Cổng thanh toán** | **Chưa tích hợp** (không có hosted checkout, không có IPN cổng `ORDER_PAID`). |
| **Phần 2 — SePay Webhooks** | **Đã tích hợp phần lớn** luồng nhận webhook tiền vào (POST JSON, API Key, cập nhật đơn); QR thanh toán dùng **VietQR** chứ không phải “Tạo QR” do SePay cổng trong doc. |

---

## Bảng tóm tắt — Phần 1 (Cổng thanh toán)

| Nội dung trong SEPAY-PAYMENT-GATEWAY.md (Phần 1) | Hiện trạng dự án |
|--------------------------------------------------|------------------|
| Đăng ký merchant, **MERCHANT ID** + **SECRET KEY** cho cổng, sandbox `pay-sandbox` / `pgapi-sandbox` | Có `SEPAY_MERCHANT_ID` trong `.env.local.example` (ghi chú dùng khi gọi API SePay); **không** dùng trong luồng thanh toán hiện tại. |
| Gọi `…/v1/checkout/init` trên `pay-sandbox.sepay.vn` / `pay.sepay.vn` | **Không có** trong mã nguồn. |
| SDK `sepay-pg` / `sepay-pg-node` | **Không** cài — `package.json` không có dependency SePay PG. |
| Form POST + HMAC-SHA256 (`signature`) | **Không** — không có hàm ký field checkout. |
| `success_url` / `error_url` / `cancel_url` | **Không** có route dành cho redirect SePay; `/payment/[id]` là trang QR VietQR sau khi tạo đơn, không phải callback từ cổng. |
| **IPN cổng:** JSON `notification_type`, `order.order_invoice_number`, … | **Không** xử lý — webhook hiện tại là **payload giao dịch ngân hàng** (Phần 2 doc), không phải IPN cổng. |
| Xác thực REST cổng: Basic `merchant_id:secret_key` | **Không** dùng cho cổng; app dùng **Apikey** cho webhook (đúng Phần 2, **khác** Basic Auth `pgapi`). |

---

## Bảng tóm tắt — Phần 2 (SePay Webhooks)

Theo [Bắt đầu nhanh – SePay Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh) và tóm tắt trong [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) (Phần 2).

| Nội dung trong doc (Phần 2) | Hiện trạng dự án |
|----------------------------|------------------|
| Tạo webhook trên **my.sepay.vn → WebHooks** (URL, sự kiện tiền vào/ra, chứng thực) | **Ngoài repo** — do vận hành cấu hình; `supabase-setup.md` hướng dẫn URL `https://your-domain.com/api/webhook/sepay` và API Key. |
| SePay gửi **POST** + body **JSON** (`transferType`, `transferAmount`, `content`, `id`, …) | **Có** — `app/api/webhook/sepay/route.ts` + `parseSePayJson`. |
| Chứng thực **API Key**: header `Authorization: Apikey …` | **Có** — `isSePayAuthorized` so khớp `WEBHOOK_SEPAY_API_KEY` (và cho phép raw key). |
| Chỉ xử lý tiền vào (`transferType` `in` hoặc BankHub `credit`) | **Có** — `handleSePayWebhook` bỏ qua giao dịch không phải tiền vào. |
| Phản hồi thành công: **`{"success": true}`**, HTTP **200** hoặc **201** (API Key) | **Có** — `NextResponse.json({ success: true, … }, { status: 200 })` khi xử lý xong; lỗi trả `success: false` và mã tương ứng. |
| Gợi ý chống trùng: kiểm tra `id` giao dịch đã xử lý | **Chưa thấy** — không có bước “đã xử lý `sepay_id` thì bỏ qua” (có thể ghi log trùng qua bảng `transactions`). |
| Code mẫu dùng field `code` để map đơn | **Khác** — dự án trích **mã đơn từ nội dung CK** trong `content`/`description` (regex `IN AN …`), khớp prefix `orders.id` và so sánh `transferAmount` với `total_price`. |
| Tạo QR / form thanh toán trên site (bước tiếp theo trong doc) | **Một phần** — có trang thanh toán + QR nhưng **VietQR** (`lib/payments/vietqr.ts`, `img.vietqr.io`), không dùng công cụ “Tạo QR” SePay trong doc Webhooks. |

---

## Chi tiết theo luồng nghiệp vụ

### Cổng thanh toán (Phần 1)

- **Doc:** Khách → form checkout SePay → trang hosted → redirect + IPN cổng.
- **Dự án:** Khách → QR **VietQR** với nội dung `IN AN {8 ký tự đầu id đơn}` → chuyển khoản trực tiếp tới STK cấu hình `NEXT_PUBLIC_VIETQR_*` — **không** qua `pay.sepay.vn`.

### SePay Webhooks (Phần 2)

- **Doc:** Có giao dịch trên TK liên kết → SePay POST JSON → server xử lý → `{"success": true}`.
- **Dự án:** Khớp; sau đó cập nhật `orders.payment_status`, `priority`, insert `transactions` (`lib/webhooks/sepay.ts`). Hỗ trợ thêm field kiểu BankHub (`transfer_type`, `amount`) trong cùng handler.

### Base URL `pgapi` / `pay.sepay.vn`

- **Phần 1 doc:** Bắt buộc khi dùng cổng.
- **Dự án:** Không gọi các host này cho luồng hiện tại.

---

## Ghi chú Next.js (trong SEPAY-PAYMENT-GATEWAY.md) so với repo

| Ghi chú doc | Hiện trạng |
|-------------|------------|
| Form checkout server-side, không lộ secret cổng | Trang `/payment/[id]` là client component; **chưa** có form SePay — secret cổng không có trong luồng. `WEBHOOK_SEPAY_API_KEY` chỉ dùng server-side. |
| Route POST IPN **cổng** | **Không** có. |
| Route POST **Webhooks**, `{"success": true}`, 200/201 | **Có** `/api/webhook/sepay` — phù hợp Phần 2 (không phải IPN Phần 1). |

---

## Hạng mục mở (nếu muốn bám sát đủ doc)

**Nếu chỉ cần Webhooks + VietQR (như hiện tại)** — có thể bổ sung: kiểm tra **idempotency** theo `id` (hoặc `referenceCode`) trong `transactions` trước khi cập nhật đơn; đảm bảo handler luôn trả đúng format trong **8 giây** (doc Phần 2).

**Nếu thêm Cổng thanh toán (Phần 1)** — cần: SDK hoặc form `checkout/init` + `signature`; route redirect `success/error/cancel`; endpoint **riêng** cho IPN cổng (`ORDER_PAID`); cấu hình IPN trên dashboard **Cổng thanh toán** (tách khỏi mục WebHooks).

---

## Tham chiếu file trong repo

| File / vị trí | Vai trò |
|---------------|---------|
| [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) | Chuẩn so sánh (Phần 1 + Phần 2). |
| `app/payment/[id]/page.tsx` | UI thanh toán QR VietQR + Realtime / poll. |
| `lib/payments/vietqr.ts` | Build URL QR và nội dung CK. |
| `app/api/webhook/sepay/route.ts` | Endpoint POST SePay Webhooks. |
| `lib/webhooks/sepay.ts` | Xác thực Apikey, xử lý payload, khớp đơn. |
| `package.json` | Không có `sepay-pg-node`. |
| `.env.local.example` | VietQR, `WEBHOOK_SEPAY_API_KEY`, `SEPAY_MERCHANT_ID`. |

---

*Tài liệu so sánh nội bộ; cập nhật khi dự án thay đổi luồng thanh toán hoặc khi [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) được chỉnh sửa.*
