# Nền Tảng Dịch Vụ Giải Trí Trọn Gói (Entertainment Combo & Wallet Shop)

## Vấn đề cần giải quyết
Làm thế nào để xây dựng một nền tảng TMĐT (Spring Boot + Node.js) tối ưu hóa SEO, bán cả tài khoản số đơn lẻ lẫn "Gói Combo Giải Trí", với luồng thanh toán tự động qua ngân hàng và Dashboard tự phục vụ cho khách?

## Hướng đi đề xuất
Mô hình "Ví điện tử nội bộ". Khách hàng nạp tiền (Top-up) vào hệ thống thông qua quét mã QR chuyển khoản tự động (Casso/SePay). Sau đó dùng số dư này để mua lẻ tài khoản (Netflix, YouTube) hoặc mua các "Gói Combo" với giá ưu đãi. Việc sử dụng ví nội bộ giúp thanh toán tức thì và giải quyết hoàn toàn bài toán hoàn tiền thủ công rườm rà.

## Phạm vi MVP (Phiên bản đầu tiên bắt buộc phải có)
- **Backend (Spring Boot):** 
  - Hệ thống Ví (Wallet Ledger): Xử lý cộng/trừ tiền chính xác, chống nạp khống (Race condition).
  - Tích hợp Webhook Ngân hàng tự động cộng tiền vào ví.
  - Quản lý Sản phẩm & Kho (Inventory: Kho Netflix cấp sẵn, Kho YouTube chờ nâng cấp).
  - Hệ thống Ticket nội bộ.
- **Frontend (Node.js - React/Next.js):** 
  - Giao diện Landing Page chuẩn SEO.
  - Giao diện nạp tiền (Hiện QR code + Cú pháp chuyển khoản).
  - Dashboard Khách hàng: Xem lịch sử giao dịch ví, Lấy tài khoản, Nút tự nhận mã xác minh Household, Báo lỗi sự cố.

## KHÔNG LÀM trong MVP
- **Cổng thanh toán chính quy (VNPay/Momo Merchant/Stripe):** Không cần thiết vì đã có ví nội bộ + Webhook ngân hàng.
- **Rút tiền từ Ví ra Ngân hàng:** Không hỗ trợ để tránh rắc rối kế toán và rửa tiền. Chỉ hỗ trợ nạp vào để tiêu.
- **Tự động Hoàn tiền (Auto Refund):** Lý do logic bù trừ Combo quá phức tạp, rủi ro lỗi hoàn tiền gấp đôi. Admin sẽ refund thủ công qua việc cộng tiền lại vào Ví.
- **Chat trực tiếp (Live Chat Realtime trên web):** Lý do tốn nhân sự trực. Mọi sự cố chuyển qua luồng Ticket -> chờ Admin xử lý.
- **Auto-Sourcing (Tự động đi mua hàng từ nguồn khác đổ vào kho):** Lý do quá nặng hệ thống, Admin sẽ nhập kho qua file Excel hoặc form thêm mới.

## Các Giả định (Assumptions) cần kiểm chứng trước tiên
- Khách hàng sẵn sàng trả tiền cọc/nạp tiền vào ví trước khi mua hàng.
- API Webhook Ngân hàng hoạt động đủ nhanh (dưới 10 giây) để khách không bị sốt ruột sau khi chuyển khoản.
