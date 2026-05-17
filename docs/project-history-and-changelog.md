# Nhật ký phát triển dự án VanDatPremium (Project History & Changelog)

Tài liệu này tổng hợp toàn bộ chặng đường phát triển, xây dựng và tối ưu hóa hệ thống cửa hàng tài khoản giải trí **VanDatPremium** (Next.js Frontend + Java Spring Boot Backend + SQL Server) từ những ngày đầu tiên cho đến thời điểm hiện tại.

---

## 🗺️ Bản đồ kiến trúc Hệ thống (System Overview)
* **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS / Vanilla CSS).
* **Backend:** Java Spring Boot (REST API, Spring Security, Spring Data JPA, Hibernate).
* **Database:** Microsoft SQL Server (Lưu trữ thông tin tài khoản, danh mục, giao dịch, và vé hỗ trợ).
* **Media Storage:** Cloudinary (Lưu trữ và phân phối hình ảnh đám mây).
* **Payment Integration:** SePay Webhook (Tự động xác nhận giao dịch).

---

## 📅 Lịch sử các giai đoạn phát triển (Changelog)

### Giai đoạn 1: Thiết kế giao diện Trang chủ & Cấu trúc Database gốc
* **Mục tiêu:** Xây dựng nền móng giao diện người dùng và liên kết cơ sở dữ liệu.
* **Các công việc đã thực hiện:**
  * Thiết kế trang chủ **VanDatPremium** thân thiện, trực quan với tông màu sáng chủ đạo.
  * Thiết kế thanh điều hướng (Header Navigation), bộ chọn danh mục sản phẩm (Category Selector), và thanh tìm kiếm tối ưu.
  * Định nghĩa cấu trúc SQL Server Database để lưu trữ thông tin sản phẩm, tài khoản, và kế hoạch đăng ký (Plans).

### Giai đoạn 2: Chuẩn hóa Icon & Cấu trúc Hero Section
* **Mục tiêu:** Nâng cấp tính thẩm mỹ và tính nhất quán của giao diện người dùng.
* **Các công việc đã thực hiện:**
  * Thay thế toàn bộ icon cũ bằng bộ icon chuẩn **Google Material Icons** (thông qua thư viện React Lucide/Material Icons).
  * Quy hoạch lại phần **Hero Section**:
    * Cột trái: Danh mục danh sách dịch vụ (Sidebar Category).
    * Cột phải: Slider biểu ngữ quảng cáo (Banner Slider).
  * Tinh chỉnh màu sắc giao diện theo chuẩn nhận diện thương hiệu `primary` của shop.

### Giai đoạn 3: Debug & Sửa lỗi Bảo mật JWT Auth (Spring Security)
* **Mục tiêu:** Khắc phục lỗi bảo mật 401 Unauthorized khi Admin truy cập API.
* **Các công việc đã thực hiện:**
  * Phân tích và làm sạch cấu hình **Spring Security**: Đảm bảo `JwtAuthFilter` được đăng ký đúng luồng trong Security Filter Chain.
  * Sửa lỗi phân tích JWT Token trên Postman và luồng ứng dụng: Đồng bộ hóa định dạng Header `Authorization: Bearer <Token>`.
  * Cấu hình ghi log debug chi tiết để xác thực quyền hạn Admin (`ROLE_ADMIN`) thành công từ cơ sở dữ liệu.

### Giai đoạn 4: Quản lý Kho hàng & Nghiệp vụ Ticket Hỗ trợ
* **Mục tiêu:** Xây dựng hệ thống quản lý sản phẩm chi tiết và kênh hỗ trợ trực tuyến.
* **Các công việc đã thực hiện:**
  * Xây dựng luồng API phân quyền rõ ràng giữa User (Công khai) và Admin (Bảo mật).
  * Cung cấp các chức năng CRUD cho quản lý Kho hàng (Accounts và Slots của từng sản phẩm).
  * Thiết kế hệ thống **Vé hỗ trợ (Ticket System)** liên kết trực tiếp với phòng chat (Chat Support Workflow) giúp Admin giải quyết khiếu nại của khách hàng nhanh chóng.

### Giai đoạn 5: Hiện đại hóa Dashboard Admin (Loại bỏ Modal Popups)
* **Mục tiêu:** Chuyển đổi trải nghiệm quản trị sang chuẩn UX hiện đại.
* **Các công việc đã thực hiện:**
  * Chuyển đổi toàn bộ giao diện quản lý Sản phẩm và Kế hoạch đăng ký từ dạng cửa sổ bật lên (Modal Popups) sang **Hệ thống điều hướng nội trang mượt mà (In-page Fluid Navigation)**.
  * Tối ưu hóa hiển thị bảng biểu dữ liệu Admin: Sử dụng Flexbox để căn chỉnh chuẩn xác các cột thao tác (`admin-actions-cell`), mang lại cảm giác cao cấp và gọn gàng.

### Giai đoạn 6: Sửa lỗi Tương thích Front-End (Hydration & Font Compile)
* **Mục tiêu:** Dọn sạch các cảnh báo lỗi trên Console và lỗi biên dịch TypeScript.
* **Các công việc đã thực hiện:**
  * Sửa lỗi biên dịch font `Outfit`: Đổi `subsets` từ `["latin", "vietnamese"]` thành `["latin"]` để xử lý triệt để lỗi không nhận diện kiểu của Next.js.
  * Khắc phục hoàn toàn lỗi **Hydration Mismatch** do trình duyệt Brave/Extension tự động tiêm thuộc tính (`bis_skin_checked`, `bis_register`):
    * Thêm `suppressHydrationWarning={true}` cho các thẻ root `<html>`, `<body>`.
    * Chèn script chạy đồng bộ sử dụng `MutationObserver` để tự động xóa thuộc tính lạ khỏi DOM trước khi React Hydrate.

### Giai đoạn 7: Tích hợp Đám mây Cloudinary để Quản lý Ảnh (Hiện tại)
* **Mục tiêu:** Quản lý ảnh sản phẩm/danh mục chuyên nghiệp trên đám mây.
* **Các công việc đã thực hiện:**
  * Tích hợp **Cloudinary Java SDK (`cloudinary-http5`)** vào Backend.
  * Viết dịch vụ `CloudinaryService` để chuyển đổi và tải ảnh trực tiếp từ bộ nhớ RAM lên đám mây Cloudinary an toàn.
  * Tạo endpoint `/api/admin/files/upload` phân quyền Admin chặt chẽ, kiểm tra kỹ loại file (chỉ cho phép `image/*`) để ngăn chặn hacker tải lên webshell.

---

## 📈 Định hướng phát triển tiếp theo (Roadmap)
1. **Kiểm thử Tải & Hiệu năng (Performance Tuning):** Tối ưu hóa câu lệnh SQL Server và cache dữ liệu sản phẩm tĩnh để tăng tốc độ tải trang chủ Next.js.
2. **Nạp tiền Tự động hoàn thiện:** Kiểm thử luồng giao dịch qua SePay Webhook thực tế, đảm bảo tài khoản tự động cộng số dư chính xác.
3. **Mở rộng Đa ngôn ngữ:** Tận dụng tối đa cấu hình `subsets` và cấu trúc SEO đã xây dựng sẵn để hỗ trợ đa ngôn ngữ nếu có nhu cầu mở rộng quy mô.
