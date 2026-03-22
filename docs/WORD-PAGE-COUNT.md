# Đếm số trang file Word – Cài LibreOffice & Cách thay thế

**Trạng thái hiện tại:** codebase đếm trang **PDF** bằng `pdf-lib` (ví dụ `/api/count-pdf-pages`). Luồng chuyển Word (.doc, .docx) → PDF trên server rồi đếm trang **chưa được tích hợp**. Các mục dưới là **hướng dẫn khi triển khai** bước đó: **cài LibreOffice trên máy chủ** hoặc **dùng dịch vụ/API bên ngoài** (không cần LibreOffice).

**Ghi chú:** Đếm PDF trên server không dùng `pdf.js`. Nếu sau này cần render/preview PDF trên trình duyệt, thêm dependency `pdfjs-dist` và cấu hình `GlobalWorkerOptions.workerSrc` (worker cùng phiên bản với gói — thường copy từ `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` vào `public/` hoặc theo docs phiên bản).

---

## 1. Cài LibreOffice trên máy chủ

LibreOffice chạy ở chế độ headless (không giao diện), dùng lệnh `soffice` để chuyển Word → PDF.

### Windows (máy local hoặc Windows Server)

1. Tải bản cài: [LibreOffice – Windows](https://www.libreoffice.org/download/download/).
2. Chạy file cài đặt, cài mặc định (thường: `C:\Program Files\LibreOffice\program\soffice.exe`).
3. (Tùy chọn) Nếu cài ở đường dẫn khác, set biến môi trường:
   - `LIBRE_OFFICE_EXE` = đường dẫn đầy đủ tới `soffice.exe`.
4. Mở lại terminal (hoặc restart service) rồi chạy lại ứng dụng (`npm run dev` hoặc dịch vụ Node).

### Linux (VPS, Ubuntu/Debian)

```bash
# Cập nhật và cài LibreOffice (headless, không giao diện)
sudo apt update
sudo apt install -y libreoffice-writer libreoffice-common --no-install-recommends

# Kiểm tra
libreoffice --version
# hoặc
/usr/bin/soffice --version
```

Trên một số bản Linux, lệnh có thể là `libreoffice` hoặc `soffice`. Khi bạn thêm vào project thư viện Node `libreoffice-convert`, nó thường tự tìm `soffice`/`libreoffice` trong các đường dẫn thường gặp.

### Linux (CentOS / RHEL)

```bash
sudo yum install libreoffice-core libreoffice-writer
# hoặc
sudo dnf install libreoffice-core libreoffice-writer
```

### Chạy trên VPS / Docker

- Cài LibreOffice **trong cùng máy (hoặc container)** đang chạy Next.js.
- Nếu dùng Docker: thêm bước cài LibreOffice vào Dockerfile (dùng image base Linux rồi `apt install libreoffice-...`), đảm bảo trong container có sẵn `soffice`/`libreoffice`.

Sau khi cài xong LibreOffice trên server, bước tiếp theo trong code là **chưa có sẵn trong repo này**: cần thêm dependency npm `libreoffice-convert` (hoặc gọi `soffice` trực tiếp), rồi gọi từ API/route chuyển Word → PDF rồi đếm trang bằng `pdf-lib` như với PDF.

---

## 2. Cách thay thế không dùng LibreOffice

Nếu không muốn cài LibreOffice trên server, có thể chọn một trong các hướng sau.

### Cách A: Chỉ đếm trang với PDF, bỏ đếm với Word

- **Ý tưởng:** Giữ nguyên đếm trang cho PDF; với file Word không gọi chuyển đổi, không đếm trang.
- **Cách làm:** Trong API `/api/count-pdf-pages`, nếu file là Word thì trả về luôn (ví dụ 400 hoặc một mã đặc biệt) và không gọi LibreOffice. Ở form, với Word có thể hiển thị: *"File Word không hỗ trợ đếm trang"* hoặc không hiển thị số trang.
- **Ưu điểm:** Không phụ thuộc LibreOffice, không tốn tài nguyên server.
- **Nhược điểm:** Khách upload Word sẽ không thấy số trang.

### Cách B: Dùng API chuyển đổi Word → PDF (cloud)

Dùng dịch vụ bên ngoài để chuyển Word sang PDF, sau đó đếm trang bằng `pdf-lib` như hiện tại.

- **Ví dụ dịch vụ:**
  - [CloudConvert](https://cloudconvert.com/docx-to-pdf-api) (có free tier)
  - [ConvertAPI](https://www.convertapi.com/doc-to-pdf) (trả phí theo request)
  - [Zamzar API](https://developers.zamzar.com/) (có free tier)
- **Cách tích hợp:**  
  Trong API, nếu file là Word: gửi file lên API (theo docs của từng dịch vụ), nhận về PDF (URL hoặc buffer), tải buffer PDF rồi dùng `PDFDocument.load` + `getPageCount()` như hiện tại.
- **Ưu điểm:** Không cần cài LibreOffice trên server; thường ổn định, hỗ trợ nhiều định dạng.
- **Nhược điểm:** Cần đăng ký, API key; có thể tốn phí khi dùng nhiều; phụ thuộc bên thứ ba và mạng.

Nếu bạn chọn một API cụ thể (ví dụ CloudConvert hoặc ConvertAPI), có thể mở rộng `app/api/count-pdf-pages` với một nhánh: nếu có cấu hình API (env) thì gọi API đó cho file Word, không thì fallback sang LibreOffice hoặc trả “không hỗ trợ Word”.

### Cách C: Giữ LibreOffice nhưng chạy trên máy khác (microservice)

- **Ý tưởng:** Một máy (hoặc container) chỉ cài LibreOffice và expose một API nhận file Word, trả về PDF. Máy chạy Next.js gọi API đó thay vì gọi LibreOffice trực tiếp.
- **Ưu điểm:** Tách biệt môi trường (Next.js sạch, LibreOffice chạy riêng); có thể scale service chuyển đổi độc lập.
- **Nhược điểm:** Phải triển khai và bảo trì thêm một service.

---

## 3. Tóm tắt nhanh

| Cách | Cần LibreOffice? | Độ phức tạp | Ghi chú |
|------|-------------------|-------------|--------|
| Cài LibreOffice trên server | Có | Thấp | Chỉ cần cài đúng bước như mục 1. |
| Chỉ đếm PDF, bỏ Word | Không | Thấp | Sửa API + form để Word không đếm trang. |
| API cloud (CloudConvert, ConvertAPI…) | Không | Trung bình | Cần API key, có thể tốn phí. |
| Microservice LibreOffice riêng | Có (trên máy khác) | Cao | Cho hạ tầng lớn hơn. |

Nếu bạn muốn **không cài LibreOffice** và chấp nhận **không đếm trang cho Word**, có thể áp dụng **Cách A** và chỉnh API + giao diện để với file Word hiển thị thông báo rõ ràng thay vì bắt buộc cài LibreOffice.
