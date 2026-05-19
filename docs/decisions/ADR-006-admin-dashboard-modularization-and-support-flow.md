# ADR-006: Phân rã Admin Dashboard Monolithic và Thiết lập Luồng Hỗ trợ Đa kênh

## Status
Accepted

## Date
2026-05-19

## Context
Trang quản trị (Admin Dashboard) của ứng dụng ban đầu được phát triển dưới dạng một trang đơn monolithic (`src/app/admin/page.tsx`) sử dụng state để chuyển đổi tabs hiển thị. Khi quy mô chức năng của Admin phình to bao gồm:
1. Quản lý người dùng
2. Quản lý sản phẩm & danh mục (cần tính năng Toggle bật/tắt hiển thị danh mục)
3. Quản lý gói đăng ký (Subscription plans)
4. Quản lý kho hàng (Inventory)
5. Quản lý đơn hàng (Orders)
6. Quản lý giao dịch dòng tiền (Transactions)
7. Quản lý hỗ trợ khách hàng (Tickets & Chat)

Việc giữ tất cả logic trong một file duy nhất dẫn đến:
- Codebase phình to (>1000 dòng), cực kỳ khó bảo trì và dễ gây xung đột khi merge.
- Thời gian tải trang ban đầu (Initial load) chậm do phải tải tất cả dependencies (bao gồm Chart.js và các module phức tạp khác) dù admin chỉ muốn xem một tab cụ thể.
- Khó chia sẻ link trực tiếp đến một tính năng quản trị cụ thể (ví dụ: gửi link trực tiếp đến trang xử lý Ticket cho một admin khác).

Đồng thời, đối với Module Hỗ trợ, hệ thống cần đáp ứng cả hai nhu cầu: xử lý ticket có cấu trúc của khách hàng và cho phép chat trực tiếp thời gian thực hoặc chat làm rõ vấn đề trong cùng ticket đó để đảm bảo trải nghiệm khách hàng mượt mà nhất.

## Decision
1. **Phân rã (Modularization) cấu trúc Admin**:
   Chuyển đổi hoàn toàn từ cấu trúc Monolithic Tab-state sang cấu trúc định tuyến đa trang của **Next.js App Router**:
   - `src/app/admin/layout.tsx`: Định nghĩa Layout chung cho Admin (chứa Header và Sidebar dùng chung).
   - `src/app/admin/page.tsx`: Trang tổng quan (Overview), hiển thị biểu đồ phân tích và số liệu nhanh.
   - `src/app/admin/users/page.tsx`: Quản lý danh sách, số dư và trạng thái người dùng.
   - `src/app/admin/products/page.tsx`: Quản lý danh sách sản phẩm và danh mục.
   - `src/app/admin/plans/page.tsx`: Quản lý các gói đăng ký theo sản phẩm.
   - `src/app/admin/inventory/page.tsx`: Quản lý kho tài khoản.
   - `src/app/admin/orders/page.tsx`: Quản lý đơn hàng đã bán.
   - `src/app/admin/transactions/page.tsx`: Quản lý lịch sử giao dịch nạp tiền.
   - `src/app/admin/tickets/page.tsx`: Trung tâm hỗ trợ và chat với khách hàng.

2. **Bật/Tắt (Toggle) danh mục**:
   Tích hợp tính năng bật/tắt trạng thái hoạt động của danh mục ngay tại màn hình danh sách danh mục nhằm cho phép quản trị viên tạm ẩn/hiện danh mục cùng toàn bộ sản phẩm con mà không cần xóa dữ liệu vật lý.

3. **Luồng hỗ trợ tích hợp Ticket -> Chat**:
   Xây dựng hệ thống chat trực tuyến 2 cột trong trang quản lý hỗ trợ:
   - Cột trái: Danh sách các ticket hoặc hội thoại đang mở.
   - Cột phải: Khung chat thời gian thực hỗ trợ phản hồi nhanh, cập nhật trạng thái trực tiếp của ticket (Đang xử lý, Hoàn tất).
   - Khách hàng sau khi nhận kết quả xử lý ticket có thể chat trực tiếp với admin trong cùng luồng đó nếu có thắc mắc thêm.

## Alternatives Considered

### Giữ nguyên cấu trúc Tab-state và tách thành các Sub-component trong `src/components/admin`
- **Pros**: Giữ nguyên cơ chế chuyển tab nhanh bằng React State.
- **Cons**: Không giải quyết được vấn đề chia sẻ link trực tiếp (Deep linking), vẫn phải tải toàn bộ JS của các tab khác nhau khi truy cập trang chính, mất cấu trúc tối ưu của Next.js App Router.
- **Rejected**: Phương án chia nhỏ thư mục theo URL Path (`/admin/users`, `/admin/products`) của Next.js mang lại trải nghiệm chuyên nghiệp và sạch sẽ hơn cho ứng dụng quy mô production.

## Consequences
- **Ưu điểm**:
  - Giảm kích thước mỗi file code xuống dưới 200 dòng (sạch sẽ, dễ bảo trì theo behavioral rules).
  - Tận dụng tối đa khả năng routing của Next.js (chỉ tải trang cần thiết).
  - Cho phép deep linking trực tiếp tới bất kỳ tính năng quản trị nào.
- **Nhược điểm**:
  - Phải quản lý nhiều file hơn và cấu hình Layout dùng chung cẩn thận để tránh import trùng lặp hoặc lỗi render Server/Client Component (cần chỉ thị `"use client"` đúng chỗ).
  - Cần cập nhật cơ chế bảo vệ Route (Admin Auth Guard) ở mức Middleware hoặc Layout thay vì chỉ check ở trang `page.tsx` gốc.
