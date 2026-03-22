# Kế hoạch chỉnh sửa dự án — phù hợp SePay Webhooks

Tài liệu lập **phạm vi và thứ tự việc** để dự án bám sát [Phần 2 — SePay Webhooks](https://developer.sepay.vn/vi/sepay-webhooks/bat-dau-nhanh) trong [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md), dựa trên khoảng cách đã ghi trong [SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md](./SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md).

**Phạm vi kế hoạch:** chỉ **SePay Webhooks** (tiền vào/ra trên tài khoản liên kết). **Không** bao gồm Cổng thanh toán (hosted checkout, IPN `ORDER_PAID`) — chỉ nhắc khi cần tránh nhầm kênh.

---

## 1. Mục tiêu

| Mục tiêu | Đo lường / ghi chú |
|----------|-------------------|
| Phản hồi đúng quy ước SePay | Body `{"success": true}`, HTTP **200** hoặc **201** khi chứng thực API Key; tránh response bị SePay coi là thất bại. |
| Xử lý trong giới hạn thời gian | Doc: **response timeout tối đa 8 giây** — handler không chặn lâu (DB/HTTP ngoài). |
| Chống xử lý trùng (idempotency) | Doc gợi ý kiểm tra **`id`** giao dịch SePay đã xử lý — tránh cập nhật đơn hai lần khi SePay retry. |
| Khớp đơn an toàn | Giữ logic `IN AN` + số tiền; tùy chọn tận dụng field **`code`** nếu SePay cấu hình nhận diện mã đơn. |
| Vận hành & đối soát | Cấu hình dashboard đúng; có thể mở rộng **đối soát định kỳ** (gợi ý cuối doc Webhooks). |

---

## 2. Hiện trạng (tóm tắt)

Đã có: `POST` `/api/webhook/sepay`, xác thực `Apikey`, parse JSON, lọc tiền vào, khớp đơn qua nội dung CK, cập nhật `orders`, ghi `transactions` — xem [SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md](./SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md).

Chưa đủ so với doc / hạng mục mở: **idempotency theo `id`**, tối ưu để luôn trả lời trong **8 giây**, làm rõ **hợp đồng response** với SePay (body tối thiểu), tài liệu vận hành (dashboard, sandbox, nhật ký).

---

## 3. Giai đoạn A — Vận hành (không đổi code)

Công việc ngoài repo; bắt buộc để webhook hoạt động đúng môi trường thật.

1. **my.sepay.vn → WebHooks:** URL public `https://<domain>/api/webhook/sepay`, sự kiện **tiền vào** (hoặc đúng tài khoản cần lắng nghe), chứng thực **API Key** khớp `WEBHOOK_SEPAY_API_KEY` trên server.
2. Đối chiếu [supabase-setup.md](../supabase-setup.md) (hoặc tài liệu deploy): `SUPABASE_SERVICE_ROLE_KEY`, không lộ `WEBHOOK_SEPAY_API_KEY` ra client.
3. **Kiểm thử:** dùng **Giả lập giao dịch** / chuyển khoản nhỏ; xem **Nhật ký webhooks** trên SePay; so với log server / bảng `transactions`.
4. (Tùy chọn) Sandbox **[my.dev.sepay.vn](https://my.dev.sepay.vn)** — theo doc cần **liên hệ SePay** để kích hoạt.

---

## 4. Giai đoạn B — Cứng hóa hợp đồng HTTP (ưu tiên cao)

**File tham chiếu:** `app/api/webhook/sepay/route.ts`, `lib/webhooks/sepay.ts`.

1. **Response thành công:** Doc yêu cầu body `{"success": true}`. Hiện trả thêm `message` — thường vẫn chấp nhận được; **xác minh** trên Nhật ký SePay hoặc tài liệu “Lập trình Webhooks”. Nếu cần tối thiểu: trả đúng `{ "success": true }` cho mọi nhánh 200 thành công (có thể log `message` phía server).
2. **Mã HTTP:** Giữ **200** (API Key cho phép 200 hoặc 201). Chỉ dùng **201** nếu chuyển sang OAuth 2.0 (không nằm trong kế hoạch mặc định).
3. **Lỗi xác thực / JSON sai:** Giữ 401 / 400 với `success: false` — đúng kỳ vọng “từ chối xử lý”; tránh trả 500 không cần thiết khi đã log và quyết định bỏ qua giao dịch (nhánh “ignored” vẫn nên 200 + `success: true` nếu coi là “đã nhận và không retry cần xử lý nghiệp vụ” — **cần thống nhất**: với SePay, retry thường khi response không phải success; các nhánh “No order code”, “Amount mismatch” hiện trả 200 — phù hợp tránh retry vô hạn).

---

## 5. Giai đoạn C — Idempotency theo `id` (SePay)

**Căn cứ:** [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) Phần 2 — field `id` dùng chống xử lý trùng.

1. **Đầu handler (sau khi parse JSON hợp lệ):** Nếu `body.id` có mặt, truy vấn `transactions` (hoặc bảng tương đương) xem đã có bản ghi với `sepay_id = id` **và** đã dùng để cập nhật đơn thành công (`order_updated = true`) hoặc đã ghi nhận xử lý xong — thì trả **200** + `{"success": true}` **không** cập nhật lại đơn.
2. **Schema:** Cột `sepay_id` đã có trong [supabase/schema.sql](../supabase/schema.sql). Cân nhắc migration:
   - `CREATE UNIQUE INDEX ... ON public.transactions (sepay_id) WHERE sepay_id IS NOT NULL` — tránh hai bản ghi cùng một giao dịch SePay (tùy chính sách: có thể chỉ unique khi đã “processed”).
   - Hoặc chỉ kiểm tra soft bằng query trước khi insert (đơn giản hơn, không cần unique nếu luôn check trước).
3. **Thứ tự:** Check idempotency **trước** insert `transactions` mới để không nhân đôi log cho cùng một `id` retry (hoặc cho phép log duplicate với flag `duplicate_retry` — tùy yêu cầu đối soát).

---

## 6. Giai đoạn D — Hiệu năng (8 giây)

**Căn cứ:** Connection timeout 5s, response timeout **8s** ([SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) Phần 2).

1. Rà soát `handleSePayWebhook`: chỉ giữ thao tác **bắt buộc** đồng bộ (khớp đơn, update, insert log). Tránh gọi API bên thứ ba trong handler.
2. Nếu sau này có bước nặng (email, báo cáo): đưa vào **queue** / job nền (không chặn response).
3. (Tùy chọn) Thêm log thời gian xử lý (ms) trong môi trường dev để phát hiện chậm.

---

## 7. Giai đoạn E — Khớp đơn (tùy chọn, nghiệp vụ)

Hiện tại: regex nội dung `IN AN …` + khớp `total_price` — phù hợp VietQR — xem [SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md](./SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md).

1. **Field `code`:** Nếu trên SePay (**Công ty → Cấu hình chung**) nhận diện được mã thanh toán trùng với mã đơn, có thể thêm nhánh: ưu tiên khớp `code` khi không null, fallback `content`/`description`.
2. Giữ **một nguồn sự thật** (tránh hai đường khớp mâu thuẫn): thứ tự ưu tiên cần test kỹ.

---

## 8. Giai đoạn F — Đối soát & giám sát (trung hạn)

Theo “Bước tiếp theo” trong doc Webhooks: **đối soát giao dịch định kỳ**.

1. So khớp tổng tiền vào theo ngày (SePay / ngân hàng) với tổng `transactions` / đơn đã thanh toán.
2. (Tùy chọn) Cron hoặc admin tool: liệt kê đơn “chưa thanh toán” quá X giờ nhưng có giao dịch nghi vấn (sai nội dung CK).

---

## 9. Việc **không** nằm trong kế hoạch này

- Tích hợp **Cổng thanh toán** (`pay.sepay.vn`, IPN `ORDER_PAID`) — nếu cần, lập kế hoạch riêng; tránh trộn endpoint với Webhooks.
- Thay **VietQR** bằng công cụ tạo QR SePay — chỉ khi có yêu cầu sản phẩm; hiện không bắt buộc cho “phù hợp Webhooks”.

---

## 10. Tiêu chí hoàn thành (Definition of Done)

- [ ] Webhook production trỏ đúng URL, API Key khớp biến môi trường; thử giao dịch thật / giả lập thành công trên Nhật ký SePay.
- [ ] Mọi nhánh “đã nhận và xử lý xong” trả **200** + `success: true` theo thống nhất Giai đoạn B.
- [ ] Idempotency: cùng `id` SePay retry **không** đánh dấu đơn đã thanh toán hai lần (Giai đoạn C).
- [ ] Handler không vượt quá **8 giây** trong điều kiện bình thường (Giai đoạn D).
- [ ] Tài liệu nội bộ (`supabase-setup.md` hoặc README deploy) cập nhật checklist A nếu thay đổi env / URL.

---

## 11. Tham chiếu nhanh

| Tài liệu / file | Nội dung |
|-----------------|----------|
| [SEPAY-PAYMENT-GATEWAY.md](./SEPAY-PAYMENT-GATEWAY.md) | Chuẩn kỹ thuật Phần 2 (Webhooks). |
| [SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md](./SEPAY-PAYMENT-GATEWAY-VS-PROJECT.md) | Khoảng cách hiện tại. |
| `app/api/webhook/sepay/route.ts` | Route POST. |
| `lib/webhooks/sepay.ts` | Logic nghiệp vụ. |
| `supabase/schema.sql` — `transactions` | Log & `sepay_id`. |

---

*Kế hoạch nội bộ; điều chỉnh thứ tự ưu tiên theo rủi ro thực tế (thường: A → B → C → D).*
