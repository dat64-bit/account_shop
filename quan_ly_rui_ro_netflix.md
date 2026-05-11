# Phân Tích Rủi Ro và Giải Pháp Quản Lý Tài Khoản Dùng Chung (Shared Accounts)

Tài liệu này phân tích các rủi ro cốt lõi khi kinh doanh dịch vụ tài khoản dùng chung (như Netflix, Spotify, YouTube Premium) và các giải pháp vận hành hệ thống để giảm thiểu thiệt hại.

---

## 1. Rủi ro từ phía Nền tảng (Platform Risks)

### 1.1. Chính sách "Hộ gia đình" (Household Policy)
* **Mô tả:** Các nền tảng (đặc biệt là Netflix) quét địa chỉ IP và vị trí địa lý. Nếu phát hiện các thiết bị đăng nhập từ nhiều nơi khác nhau, tài khoản sẽ bị yêu cầu xác minh hoặc khóa.
* **Giải pháp:**
    * **Hệ thống lấy Code tự động:** Xây dựng tính năng trên Website cho phép khách hàng tự nhấn nút "Lấy mã xác minh". Hệ thống sẽ kết nối với API Email (IMAP) để lấy mã và hiển thị ngay trên web mà không cần sự can thiệp của nhân viên.
    * **Hướng dẫn khách hàng:** Cung cấp tài liệu hướng dẫn khách cách đăng nhập đúng (ví dụ: hạn chế đổi thiết bị liên tục).

### 1.2. Quét tài khoản hàng loạt (Account Sweep)
* **Mô tả:** Nền tảng phát hiện các phương thức thanh toán lậu hoặc các tài khoản được tạo hàng loạt từ một nguồn và thực hiện khóa (Ban) toàn bộ.
* **Giải pháp:**
    * **Đa dạng hóa nguồn hàng:** Không nhập toàn bộ tài khoản từ một nguồn cung duy nhất.
    * **Quỹ dự phòng:** Luôn có sẵn một lượng tài khoản dự trữ để đổi trả (Warranty) ngay lập tức cho khách hàng khi có sự cố diện rộng.

---

## 2. Rủi ro từ phía Người dùng (User Risks)

### 2.1. Đổi mật khẩu (Password Change)
* **Mô tả:** Một trong 5 người dùng chung cố tình hoặc vô ý đổi mật khẩu, khiến 4 người còn lại không vào được.
* **Giải pháp:**
    * **Cơ chế Reset tự động (Bot Automation):** cần một trang Dashboard quản trị tập trung. Khi khách báo lỗi, hệ thống sẽ đẩy thông báo (qua Telegram/Zalo) để bạn xử lý thủ công và nhấn nút "Đã sửa" để gửi thông báo lại cho khách qua Email/SMS
    * **Cảnh báo:** Gắn mã định danh vào tên Profile để dễ dàng truy vết ai là người vừa thực hiện thay đổi.

### 2.2. Xâm phạm Profile của người khác (Profile Intrusion)
* **Mô tả:** User A xem phim hoặc thay đổi cài đặt trên Profile của User B.
* **Giải pháp:**
    * **Mã PIN Profile:** Khuyên khách hàng cài đặt mã PIN cho Profile cá nhân (tính năng có sẵn của Netflix).
    * **Mapping Database:** Hệ thống quản lý phải ghi nhận chính xác: `Tài khoản X` -> `Slot 1` -> `User A`. Nếu User A vi phạm quy định, hệ thống sẽ tự động gửi cảnh báo hoặc thu hồi quyền truy cập.

---

## 3. Rủi ro Vận hành & Quản lý (Operational Risks)

### 3.1. Quản lý hạn dùng (Expiry Management)
* **Mô tả:** Quên gia hạn tài khoản gốc khiến tất cả người dùng chung bị gián đoạn dịch vụ cùng lúc.
* **Giải pháp:**
    * **Hệ thống nhắc lịch (Reminder):** Tự động gửi thông báo qua Telegram/Email cho quản trị viên trước 3-5 ngày khi tài khoản gốc hết hạn.
    * **Đối soát tự động:** Sử dụng Cronjob để quét trạng thái tài khoản hàng ngày.

### 3.2. Quá tải hỗ trợ (Support Overload)
* **Mô tả:** Khi có sự cố lỗi hàng loạt, lượng tin nhắn hỗ trợ (Ticket) tăng vọt khiến nhân viên không xử lý kịp.
* **Giải pháp:**
    * **Trang Trạng thái (System Status):** Hiển thị công khai trạng thái các loại tài khoản trên Web để khách hàng biết lỗi đang được xử lý, tránh gửi quá nhiều Ticket trùng lặp.
    * **Nút "Báo lỗi nhanh":** Thay vì chat, khách nhấn nút báo lỗi -> Hệ thống tự phân loại và đưa vào hàng đợi xử lý.

---

## 4. Mô hình Cơ sở dữ liệu gợi ý (Database Schema)

Để quản lý tốt, hệ thống web của bạn cần cấu trúc dữ liệu như sau:

1.  **Bảng Accounts (Tài khoản gốc):**
    * `id`, `email`, `password`, `type` (Gói 4K, HD...), `max_slots` (thường là 5), `current_usage`, `expiry_date`.
2.  **Bảng Profiles (Phân khe người dùng):**
    * `account_id`, `profile_index` (1 đến 5), `user_id` (khách mua), `profile_name`, `profile_pin`.
3.  **Bảng Tickets (Khiếu nại):**
    * `id`, `user_id`, `order_id`, `issue_type`, `status` (Pending, Fixed, Refunded).

---
*Tài liệu này được soạn thảo để hỗ trợ việc thiết kế hệ thống quản lý rủi ro cho mô hình kinh doanh tài khoản số.*
