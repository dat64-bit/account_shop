# Đặc tả tính năng: Quản lý & Nhập kho tài khoản (Admin)

## Mục tiêu
Triển khai tính năng "Nhập kho" và "Quản lý tài khoản" trong trang quản trị kho hàng (Inventory) để quản trị viên có thể:
1. Thêm các tài khoản sản phẩm mới (dạng tài khoản riêng tư trọn bộ hoặc tài khoản chia sẻ Slot) vào kho hàng của hệ thống.
2. Chỉnh sửa thông tin tài khoản kho hàng (Sản phẩm, Email/Username, Mật khẩu) khi có sai sót.
3. Cập nhật trạng thái của tài khoản (Sẵn sàng - Available, Đã bán - Sold, Lỗi - Faulty) phục vụ cho công tác vận hành và bảo hành sản phẩm.
4. **Kiểm tra trạng thái kinh doanh**: Khi chọn sản phẩm trên UI Form, hệ thống hiển thị trực quan thông tin trạng thái hoạt động của sản phẩm và danh mục tương ứng để Admin biết sản phẩm/danh mục đó có còn đang kinh doanh không.

### User Stories
- **Nhập kho tài khoản**:
  - Là một Quản trị viên, tôi có thể click nút "Nhập kho" tại trang Quản lý Kho hàng để hiển thị Form nhập kho dạng Modal.
  - Tôi có thể chọn sản phẩm, nhập thông tin đăng nhập (Email/Username, Mật khẩu) và số lượng Slot tối đa (nếu là tài khoản dùng chung).
  - Khi tôi chọn sản phẩm từ dropdown, giao diện hiển thị rõ ràng trạng thái kinh doanh của sản phẩm đó (Đang bán, Ngừng bán, Hết hàng) và danh mục của nó (Đang hoạt động, Ngừng hoạt động) để tránh nhập nhầm tài khoản cho sản phẩm ngừng kinh doanh.
  - Khi gửi form thành công, tài khoản mới được lưu dưới trạng thái "Sẵn sàng" và bảng danh sách kho tự động tải lại.
- **Chỉnh sửa & Cập nhật trạng thái tài khoản**:
  - Là một Quản trị viên, tôi có thể click nút "Sửa" ở bất kỳ dòng tài khoản nào trên bảng dữ liệu để hiển thị Modal chỉnh sửa.
  - Form chỉnh sửa tự động điền các giá trị cũ. Tôi có thể chỉnh sửa Email, Mật khẩu, chọn lại Sản phẩm và cập nhật Trạng thái tài khoản (Sẵn sàng, Đã bán, Lỗi).
  - Tương tự khi thêm mới, khi chọn sản phẩm, giao diện cũng hiển thị trạng thái kinh doanh của sản phẩm và danh mục liên quan.
  - Khi đang Chỉnh sửa, trường nhập "Số lượng Slot" sẽ bị ẩn/khóa để đảm bảo tính toàn vẹn của các profiles dùng chung đã lưu trong Database (Xem ADR-008).
  - Khi gửi form thành công, thông tin và trạng thái mới sẽ được cập nhật ngay lập tức xuống DB và bảng dữ liệu tự động reload.
  - **Hiển thị Slot trên bảng danh sách**: Nếu tài khoản là tài khoản chia sẻ Slot (có profiles dùng chung), trên bảng dữ liệu quản lý kho sẽ hiển thị thông tin số lượng Slot dưới dạng `[Số slot đã bán] / [Số slot trống]`. Các tài khoản dùng riêng không chia slot sẽ được hiển thị trống (hoặc ghi "N/A").

## Công nghệ sử dụng
- Frontend: Next.js (App Router), React, Vanilla CSS, TypeScript.
- Backend: Spring Boot, Spring Security (JWT), Hibernate/JPA.
- Cơ sở dữ liệu: Microsoft SQL Server (theo `ShopAccountDB_V1.sql`).

## Tích hợp API
- **GET `/api/admin/products?limit=1000`**: Lấy danh sách sản phẩm để hiển thị trong ô lựa chọn (Dropdown select) của Form.
  - Mỗi sản phẩm (`ProductDTO`) bao gồm các thuộc tính mở rộng:
    ```json
    {
      "productId": 1,
      "productName": "Netflix Premium",
      "productStatusId": 1, 
      "categoryId": 1,
      "categoryName": "Giải trí",
      "categoryActive": true
    }
    ```
- **POST `/api/admin/inventory`**: Nhập kho tài khoản mới.
  - Cấu trúc request body (`InventoryRequest`):
    ```json
    {
      "productId": 1,
      "emailOrUsername": "user@example.com",
      "password": "secretpassword",
      "maxSlots": 4
    }
    ```
- **PUT `/api/admin/inventory/{id}`** [NEW]: Cập nhật thông tin tài khoản có ID `{id}`.
  - Cấu trúc request body (`InventoryRequest`):
    ```json
    {
      "productId": 1,
      "emailOrUsername": "user@example.com",
      "password": "newpassword",
      "itemStatusId": 3
    }
    ```
- **GET `/api/admin/inventory` & `/api/admin/inventory/paged`**: Lấy danh sách tài khoản trong kho.
  - Phản hồi trả về danh sách đối tượng `AdminInventoryDTO` có thêm các trường thông tin slot nếu tài khoản được chia slot:
    ```json
    {
      "accountItemId": 21,
      "productId": 5,
      "productName": "EA Play Pro",
      "accountEmail": "ea_test@example.com",
      "accountPassword": "password123",
      "itemStatusId": 1,
      "statusName": "Sẵn sàng",
      "createdAt": "2026-05-25T13:46:39",
      "totalSlots": 4, // null nếu tài khoản dùng riêng không chia slot
      "soldSlots": 1,  // null nếu tài khoản dùng riêng không chia slot
      "freeSlots": 3   // null nếu tài khoản dùng riêng không chia slot
    }
    ```
- **DELETE `/api/admin/inventory/{id}`**: Xoá tài khoản khỏi kho hàng.

## Cấu trúc thư mục liên quan
- Frontend:
  - `src/app/admin/inventory/page.tsx` → Bổ sung logic hiển thị modal, hiển thị thông tin trạng thái sản phẩm/danh mục được chọn, và xử lý gọi API cập nhật.
- Backend:
  - `com/dat64bit/shop/accountshop/dto/response/ProductDTO.java` → Bổ sung trường `categoryActive`.
  - `com/dat64bit/shop/accountshop/dto/request/InventoryRequest.java` → Bổ sung trường `itemStatusId`.
  - `com/dat64bit/shop/accountshop/service/AdminService.java` → Bổ sung logic cập nhật database và map trạng thái danh mục trong API products.
  - `com/dat64bit/shop/accountshop/controller/AdminController.java` → Bổ sung endpoint PUT.

## Quy chuẩn viết Code & Giao diện (UI/UX)
- Sử dụng các hook React tiêu chuẩn để lưu trạng thái đóng/mở modal (`isImportModalOpen`) và trạng thái đối tượng đang sửa (`editingItem`).
- Tái sử dụng cùng một Modal Form cấu hình động tùy thuộc chế độ (Create/Edit) để tối giản mã nguồn.
- Tuyệt đối không dùng inline style hoặc các class Tailwind (chỉ dùng CSS thuần trong globals.css).
- Sử dụng Custom Toast để thông báo kết quả và component `<Portal>` để kết xuất modal.

## Tiêu chí hoàn thành (Success Criteria)
1. **Modal Nhập kho**: Tiêu đề "Nhập kho tài khoản", có trường Số lượng Slot, không có trường Trạng thái. Gửi POST thành công.
2. **Modal Chỉnh sửa**: Tiêu đề "Chỉnh sửa tài khoản", điền sẵn data cũ, không hiển thị trường Số lượng Slot, hiển thị dropdown chọn Trạng thái (Sẵn sàng: 1, Đã bán: 2, Lỗi: 3). Gửi PUT thành công.
3. **Hiển thị Trạng thái Sản phẩm/Danh mục**: Khi chọn một sản phẩm trong Dropdown, giao diện lập tức hiển thị một khối thông tin phụ bên cạnh hoặc phía dưới Dropdown với nội dung:
   - Trạng thái sản phẩm (ví dụ: "Đang bán", "Ngừng bán", "Hết hàng").
   - Trạng thái danh mục (ví dụ: "Danh mục đang kinh doanh" / "Danh mục ngừng kinh doanh").
   - Sử dụng các màu sắc trực quan (màu xanh cho đang bán/kinh doanh, màu đỏ/xám cho ngừng bán/ngừng kinh doanh) để cảnh báo Admin.
4. Khi click nút "Lưu lại" ở bất kỳ chế độ nào, thực hiện kiểm tra biểu mẫu, vô hiệu hóa nút bấm và hiển thị trạng thái loading.
5. Đóng modal và tự động reload bảng dữ liệu khi gửi thành công. Hiển thị Toast thông báo kết quả (Success/Error).
6. Build TypeScript frontend và backend Java thành công không có lỗi biên dịch.
7. **Hiển thị thống kê Slot trên bảng**: Trong bảng dữ liệu của trang `/admin/inventory`, thêm cột hiển thị thông tin Slot cho các tài khoản có chia sẻ slot (được định dạng `[Số slot đã bán] / [Số slot trống]`, ví dụ: `1 / 3` hoặc `2 / 2`). Các tài khoản dùng riêng không có slot sẽ hiển thị `N/A`.
8. **Hiệu năng hệ thống**: Sử dụng Batch Query/Batch Loading trong Java để load danh sách `AccountSlot` theo danh sách các `AccountItem` hiển thị trên trang, tránh phát sinh N+1 Query khi tải danh sách phân trang.
