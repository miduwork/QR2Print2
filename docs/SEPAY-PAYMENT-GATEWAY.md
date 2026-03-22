# SePay – Cổng thanh toán & Webhooks (tóm tắt tích hợp)

Tài liệu này tóm tắt hai hướng tích hợp khác nhau trên [SePay Developer](https://developer.sepay.vn/vi):

1. **Cổng thanh toán (Payment Gateway)** — hosted checkout, IPN đơn hàng cổng (`pay.sepay.vn`, `pgapi…`).
2. **SePay Webhooks** — SePay chủ động **POST** JSON mỗi khi có **tiền vào / tiền ra** trên tài khoản ngân hàng đã liên kết (theo [Bắt đầu nhanh – SePay Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh)). Đây **không** phải payload IPN của Cổng thanh toán.

**Liên kết gốc (đọc bản đầy đủ khi tích hợp thật):**

- [Trang chủ tài liệu](https://developer.sepay.vn/vi)
- **Cổng thanh toán:** [Bắt đầu nhanh](https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau) · [Tổng quan API](https://developer.sepay.vn/vi/cong-thanh-toan/API/tong-quan) · [Luồng thanh toán](https://developer.sepay.vn/vi/cong-thanh-toan/luong-thanh-toan) · [IPN cổng](https://developer.sepay.vn/vi/cong-thanh-toan/IPN) · [Thanh toán thử (sandbox)](https://developer.sepay.vn/vi/thanh-toan-demo)
- SDK cổng: [PHP](https://developer.sepay.vn/vi/cong-thanh-toan/sdk/php) · Node (mục SDK trên trang chủ tài liệu)
- **Webhooks:** [Bắt đầu nhanh – SePay Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh) · [Tích hợp Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook) · [Lập trình Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/lap-trinh-webhook)

| | **Cổng thanh toán** | **SePay Webhooks** |
|---|---------------------|---------------------|
| Mục tiêu | Thanh toán qua trang SePay, xác nhận **đơn hàng cổng** | Thông báo **giao dịch ngân hàng** (tiền vào/ra) đã liên kết |
| Endpoint điển hình | `pay.sepay.vn` … `/checkout/init` | URL bạn cấu hình trên [my.sepay.vn](https://my.sepay.vn) → **WebHooks** |
| Payload server | IPN JSON kiểu `ORDER_PAID`, `order_invoice_number`, … | JSON có `transferType` / `transferAmount`, `content`, `id`, … |
| Xác thực API REST cổng | Basic `merchant_id:secret_key` | Không dùng cho cổng; Webhooks: **OAuth 2.0**, **API Key**, hoặc **không chứng thực** |

---

## Phần 1 — Cổng thanh toán SePay

### Cổng thanh toán SePay là gì

**Payment Gateway** của SePay là nền tảng trung gian kết nối website/ứng dụng của bạn với ngân hàng và tổ chức thanh toán. Cổng xử lý giao dịch trực tuyến, bảo vệ dữ liệu, giao tiếp với ngân hàng/thẻ và **gửi kết quả** về hệ thống của bạn (qua redirect người dùng và **IPN** server-to-server).

**Phương thức** (theo tài liệu API tổng quan): chuyển khoản ngân hàng qua **QR**, **NAPAS QR**, **thẻ quốc tế**.

---

### Base URL và môi trường

| Môi trường | API | Trang thanh toán (Checkout) |
|------------|-----|------------------------------|
| **Sandbox** | `https://pgapi-sandbox.sepay.vn` | `https://pay-sandbox.sepay.vn` |
| **Production** | `https://pgapi.sepay.vn` | `https://pay.sepay.vn` |

**Khởi tạo checkout (form POST)** – ví dụ endpoint trong tài liệu:

- Sandbox: `https://pay-sandbox.sepay.vn/v1/checkout/init`
- Production: `https://pay.sepay.vn/v1/checkout/init`

---

### Xác thực API (cổng thanh toán)

Mọi API cổng thanh toán dùng **Basic Authentication** với `merchant_id` và `secret_key`:

```http
Authorization: Basic base64(merchant_id:secret_key)
Content-Type: application/json
```

Form checkout (luồng hosted) dùng **chữ ký** trên các field được quy định (HMAC-SHA256, xem code mẫu trên trang [Bắt đầu nhanh](https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau)).

---

### Luồng tổng quát (cổng thanh toán)

1. Khách chọn thanh toán trên site/app của bạn.
2. Bạn **tạo đơn** và chuyển sang cổng SePay (form POST hoặc SDK).
3. SePay hiển thị trang thanh toán; khách thanh toán.
4. SePay xử lý với ngân hàng/thẻ.
5. SePay gửi **IPN** tới server bạn (thông báo trạng thái).
6. SePay **redirect** khách về `success_url` / `error_url` / `cancel_url`.

Luồng chi tiết và sơ đồ: [Luồng thanh toán](https://developer.sepay.vn/vi/cong-thanh-toan/luong-thanh-toan).

---

### Các bước tích hợp cổng (theo tài liệu “Bắt đầu nhanh”)

#### 1. Đăng ký và lấy thông tin merchant

- Đăng ký: [my.sepay.vn/register (onboarding payment gateway)](https://my.sepay.vn/register?onboarding=payment-gateway).
- Nếu đã có tài khoản: [Phương thức thanh toán](https://my.sepay.vn/pg/payment-methods) → kích hoạt **Cổng thanh toán** (ví dụ “Quét mã QR chuyển khoản ngân hàng” → Bắt đầu ngay).
- Có thể bắt đầu với **Sandbox** và làm theo hướng dẫn tích hợp trên dashboard.
- Sao chép **MERCHANT ID** và **SECRET KEY** (sandbox trước, production sau khi go live).

#### 2. Tạo form thanh toán trên hệ thống của bạn

**SDK (tùy chọn):**

- PHP: `composer require sepay/sepay-pg` — client + `CheckoutBuilder`, môi trường `sandbox` / production khi khởi tạo.
- Node: `npm i sepay-pg-node` (hoặc gói tên tương ứng trong doc hiện tại) — ví dụ `SePayPgClient`, `initCheckoutUrl()`, `initOneTimePaymentFields()` với `payment_method: 'BANK_TRANSFER'`, v.v.

**Không dùng SDK:** build form `POST` tới URL checkout sandbox/production, gồm các field như `merchant`, `currency`, `order_amount`, `operation` (ví dụ `PURCHASE`), `order_invoice_number`, `order_description`, `customer_id` (nếu có), `success_url`, `error_url`, `cancel_url`, và **`signature`** tạo từ secret theo quy tắc trong doc (danh sách field ký cố định — tham khảo code mẫu PHP trên trang Bắt đầu nhanh).

#### 3. Callback cho người dùng (redirect)

Cấu hình:

- `success_url` — thanh toán thành công.
- `error_url` — thất bại.
- `cancel_url` — khách hủy.

Các route này chủ yếu để **hiển thị UI**; **không** thay thế việc xác nhận đơn bằng IPN.

#### 4. IPN (Instant Payment Notification)

- Trên màn hình **thông tin tích hợp** SePay, khai báo **URL IPN** (endpoint `POST` trên server bạn).
- Khi có giao dịch (ví dụ thanh toán thành công), SePay gửi **JSON** tới IPN.
- Server bạn: xác thực/xử lý theo doc IPN, cập nhật trạng thái đơn hàng, trả **HTTP 200** để xác nhận đã nhận.

**Ví dụ cấu trúc payload** (minh họa trong doc — field có thể được mở rộng theo bản API hiện hành):

```json
{
  "timestamp": 1759134682,
  "notification_type": "ORDER_PAID",
  "order": {
    "id": "e2c195be-c721-47eb-b323-99ab24e52d85",
    "order_id": "NQD-68DA43D73C1A5",
    "order_status": "CAPTURED",
    "order_currency": "VND",
    "order_amount": "100000.00",
    "order_invoice_number": "INV-1759134677",
    "order_description": "Test payment"
  },
  "transaction": {
    "payment_method": "BANK_TRANSFER",
    "transaction_status": "APPROVED",
    "transaction_amount": "100000"
  }
}
```

Xử lý mẫu: nếu `notification_type === 'ORDER_PAID'`, khớp `order_invoice_number` (hoặc id trong `order`) với đơn trong DB rồi đánh dấu đã thanh toán. Chi tiết ký/bảo mật: [IPN](https://developer.sepay.vn/vi/cong-thanh-toan/IPN).

#### 5. Kiểm thử (Sandbox)

- Tạo đơn từ form đã tích hợp, hoàn tất thanh toán thử trên cổng sandbox.
- Kiểm tra redirect và log IPN; trên dashboard có bước hướng dẫn xác nhận tích hợp (theo doc).

#### 6. Go live (Production)

Điều kiện: đã có tài khoản ngân hàng phù hợp và test sandbox ổn.

Theo doc, cần:

1. Liên kết tài khoản ngân hàng thật.
2. Trong [my.sepay.vn](https://my.sepay.vn/) → Cổng thanh toán → chuyển sang **Production** (và hoàn tất hồ sơ nếu SePay yêu cầu).
3. Dùng **MERCHANT ID** và **SECRET KEY** production.
4. Đổi endpoint checkout sang `https://pay.sepay.vn/v1/checkout/init` (và API `pgapi` production nếu gọi REST).
5. Cập nhật SDK/env từ sandbox sang production.
6. Cập nhật **IPN URL** và các **callback URL** trỏ tới domain production.

---

## Phần 2 — SePay Webhooks (Bắt đầu nhanh)

Nguồn: [Bắt đầu nhanh | SePay Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh).

**SePay Webhooks** cho phép ứng dụng nhận thông báo giao dịch **theo thời gian thực** mỗi khi có **tiền vào** hoặc **tiền ra** trên tài khoản ngân hàng đã liên kết với SePay, thay vì phải kiểm tra liên tục. SePay chủ động gửi dữ liệu tới **URL bạn cấu hình**.

### Môi trường Sandbox (Webhooks)

Nếu cần môi trường thử nghiệm: đăng ký tại **[my.dev.sepay.vn](https://my.dev.sepay.vn)** — có thể tạo giao dịch giả lập và webhook phục vụ phát triển. Sau khi đăng ký, **liên hệ SePay** để được kích hoạt tài khoản (theo doc).

### Luồng tích hợp tổng quan (Webhooks)

1. Khách chuyển tiền vào (hoặc ra khỏi) tài khoản ngân hàng của bạn.
2. SePay phát hiện giao dịch mới và gửi **POST** với body **JSON** tới URL webhook đã cấu hình.
3. Server của bạn nhận dữ liệu, xử lý và phản hồi `{"success": true}` theo **quy ước** (xem mục “Phản hồi thành công” bên dưới).

Tài liệu còn mô tả luồng đầy đủ: cấu hình webhook → tạo QR / trang thanh toán → nhận webhook → **đối soát định kỳ** (xem các bước tiếp theo trên trang gốc).

### Bước 1 — Tạo Webhook trên Dashboard

1. Đăng nhập **[my.sepay.vn](https://my.sepay.vn)** → menu **WebHooks**.
2. **+ Thêm webhooks** và điền:
   - **Đặt tên:** tên gợi nhớ.
   - **Chọn sự kiện:** khi có tiền vào, tiền ra, hoặc cả hai.
   - **Chọn điều kiện:** tài khoản ngân hàng cần lắng nghe.
   - **Gọi đến URL:** endpoint `POST` trên server bạn (public).
   - **Cấu hình chứng thực:** **OAuth 2.0**, **API Key**, hoặc **Không chứng thực**.
3. **Thêm** để hoàn tất. Chi tiết: [Tạo Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook) (trang doc liên quan trong mục Webhooks).

### Bước 2 — Dữ liệu SePay gửi (POST JSON)

Ví dụ payload (theo [tài liệu](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh)):

```json
{
  "id": 92704,
  "gateway": "Vietcombank",
  "transactionDate": "2023-03-25 14:02:37",
  "accountNumber": "0123499999",
  "code": null,
  "content": "chuyen tien mua iphone",
  "transferType": "in",
  "transferAmount": 2277000,
  "accumulated": 19077000,
  "subAccount": null,
  "referenceCode": "MBVCB.3278907687",
  "description": ""
}
```

**Ý nghĩa field (rút gọn):**

| Field | Ghi chú |
|-------|---------|
| `id` | ID giao dịch trên SePay (dùng chống xử lý trùng). |
| `gateway` | Tên ngân hàng / brand. |
| `transactionDate` | Thời gian giao dịch phía ngân hàng. |
| `accountNumber` | Số tài khoản. |
| `code` | Mã thanh toán (có thể `null` nếu không nhận diện được — cấu hình tại **Công ty → Cấu hình chung**). |
| `content` | Nội dung chuyển khoản. |
| `transferType` | `"in"` = tiền vào, `"out"` = tiền ra. |
| `transferAmount` | Số tiền (VND). |
| `accumulated` | Số dư lũy kế. |
| `subAccount` | TK phụ / VA (có thể `null`). |
| `referenceCode` | Mã tham chiếu tin SMS. |
| `description` | Toàn bộ nội dung tin SMS. |

### Bước 3 — Xác thực và code mẫu (API Key)

Với **API Key**, header thường có dạng (theo code mẫu trong doc):

```http
Authorization: Apikey YOUR_API_KEY
```

Server đọc JSON từ body, kiểm tra API Key, xử lý giao dịch (doc gợi ý chống trùng bằng cách kiểm tra `id` đã xử lý chưa), sau đó trả phản hồi thành công.

### Bước 4 — Phản hồi để SePay coi là thành công

Nếu response **không** đúng quy ước, SePay xem webhook là **thất bại** (có thể retry tùy cấu hình). Theo doc:

| Chứng thực | Body | HTTP status |
|------------|------|-------------|
| **OAuth 2.0** | `{"success": true}` | **201** |
| **API Key** | `{"success": true}` | **200** hoặc **201** |
| **Không chứng thực** | `{"success": true}` | **200** hoặc **201** |

**Timeout (theo doc):**

- **Connection timeout:** 5 giây.
- **Response timeout:** tối đa **8 giây** (thời gian chờ phản hồi).

### Bước 5 — Kiểm tra hoạt động

1. **Tài khoản Demo:** menu **Giao dịch** → **Giả lập giao dịch** (xem hướng dẫn [Giả lập giao dịch](https://developer.sepay.vn/vi/tien-ich-khac/gia-lap-giao-dich) trên trang chủ tài liệu).
2. **Tài khoản thật:** chuyển một khoản nhỏ để thử.
3. **Nhật ký:** **Nhật ký → Nhật ký webhooks** để xem các lần gọi.
4. Theo **từng giao dịch:** **Giao dịch** → cột **Tự động** → **Pay** để xem webhook của giao dịch đó.

### Bước tiếp theo (liên kết doc)

Trên trang [Bắt đầu nhanh](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh), SePay gợi ý: tạo QR / form thanh toán trên site; cấu hình chi tiết webhook (retry, …); lập trình lưu DB (PHP / Node); **đối soát giao dịch** định kỳ.

---

## Ghi chú cho dự án (Next.js / App Router)

**Cổng thanh toán**

- Form checkout: thường render **server-side** hoặc Server Action để **không lộ secret** cổng; chỉ đưa ra client các field đã ký và URL action form.
- **IPN cổng:** Route Handler `POST`, parse JSON kiểu `ORDER_PAID`, idempotent, trả **200** theo doc IPN cổng.
- Đối chiếu [IPN cổng](https://developer.sepay.vn/vi/cong-thanh-toan/IPN) trước production.

**SePay Webhooks (tiền vào/ra ngân hàng)**

- Route Handler `POST` nhận JSON `transferType` / `transferAmount`, `content`, …; xác thực theo cấu hình (**Apikey** nếu dùng API Key).
- Phản hồi **`{"success": true}`** với mã **200** hoặc **201** tùy loại chứng thực (xem bảng Phần 2); xử lý nhanh trong giới hạn **8 giây**.
- Không nhầm payload Webhooks với **IPN Cổng thanh toán** — hai kênh khác nhau.

---

*Tài liệu tóm tắt nội bộ; mọi tham số, field ký và mã lỗi lấy từ bản chính thức trên [developer.sepay.vn](https://developer.sepay.vn/vi). So sánh với code hiện tại của repo: [SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md](./SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md).*
