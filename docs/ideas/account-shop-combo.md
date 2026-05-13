# Nền Tảng Dịch Vụ Giải Trí Trọn Gói (Entertainment Combo & Wallet Shop)

## Vấn đề cần giải quyết
Làm thế nào để xây dựng một nền tảng TMĐT bán tài khoản số (đơn lẻ & Combo) có khả năng:
1. **Phục vụ giai đoạn đầu (ít khách):** Hỗ trợ bán hàng thủ công, kéo khách từ Facebook/Zalo, cung cấp công cụ cho Admin tự gán tài khoản cho khách để quản lý hạn dùng.
2. **Phục vụ giai đoạn mở rộng (nhiều khách):** Tự động hóa hoàn toàn từ khâu thanh toán qua ngân hàng (Webhook) đến khâu tự động nhả tài khoản (Fulfillment) cho khách.

## Hướng đi đề xuất
Phát triển hệ thống theo **Chiến lược 2 Giai đoạn (Phased Strategy)**:

- **Giai đoạn 1 (Bán thủ công):** Web đóng vai trò Catalog trưng bày chuẩn SEO. Khách hàng bấm nút "Liên hệ Admin" để mua qua Facebook. Admin sử dụng hệ thống Quản trị (Dashboard) để nhập kho, tự tạo User ảo cho khách Facebook, gán tài khoản thủ công và tự động theo dõi hạn sử dụng.
- **Giai đoạn 2 (Ví điện tử nội bộ):** Khách hàng nạp tiền (Top-up) vào web thông qua mã QR chuyển khoản ngân hàng tự động bằng **SePay**. Sau đó dùng số dư Ví này để mua lẻ tài khoản hoặc mua Combo trực tiếp trên web. Hệ thống tự động giao hàng (Auto-Fulfillment).

## Phạm vi MVP (Phiên bản đầu tiên)

- **Backend (Spring Boot):**
  - Hệ thống Ví (Wallet Ledger): Xử lý nạp/trừ tiền an toàn.
  - Tích hợp Webhook **SePay** tự động cộng tiền vào ví.
  - Quản lý Sản phẩm (Đơn lẻ & Combo linh hoạt 3 loại: 1 user, nhiều user, cần email nâng cấp).
  - Quản lý Kho (Inventory).
  - Quản lý User & Thống kê doanh thu cho Admin.
  - Hệ thống Ticket nội bộ (Xử lý khiếu nại lỗi tài khoản).

- **Frontend (React / Next.js):**
  - **Trang chủ & Sản phẩm:** Hiển thị SEO, thông tin gói Combo. Nút mua hàng linh hoạt giữa "Mua ngay" và "Liên hệ Admin".
  - **Trang Nạp tiền:** Hiển thị mã QR SePay tự động sinh kèm cú pháp nạp tiền.
  - **Dashboard Khách hàng:** Xem lịch sử giao dịch (nạp/trừ tiền), xem thông tin tài khoản đang dùng (Pass, Profile), và gửi Ticket báo lỗi.
  - **Dashboard Quản trị (Admin):** Thống kê biểu đồ doanh thu/giao dịch, quản lý Users, xử lý Ticket (có nút hoàn tiền nhanh), và công cụ tạo đơn hàng thủ công cho khách chốt ngoài Facebook.

## KHÔNG LÀM trong MVP
- **Cổng thanh toán chính quy (VNPay/Momo Merchant/Stripe):** Thay bằng Ví nội bộ + SePay.
- **Rút tiền từ Ví ra Ngân hàng:** Không hỗ trợ để tránh rửa tiền. Chỉ hỗ trợ nạp vào để tiêu.
- **Tự động Hoàn tiền (Auto Refund):** Admin sẽ duyệt ticket và refund thủ công bằng cách bấm nút cộng tiền lại vào Ví khách.
- **Chat trực tiếp trên Web (Live Chat Realtime):** Dùng Hệ thống Ticket để quản lý luồng CSKH.
- **Auto-Sourcing:** Admin sẽ tự nhập kho thủ công (thêm tay hoặc import Excel).

## Các Giả định (Assumptions) cần kiểm chứng
- Khách hàng sẵn sàng nạp tiền trước vào ví nội bộ để mua hàng (ở Giai đoạn 2).
- Khách hàng có trải nghiệm mượt mà với việc "Liên hệ người bán" qua Zalo/FB (ở Giai đoạn 1) nếu giao diện Web nhìn đủ uy tín chuyên nghiệp.