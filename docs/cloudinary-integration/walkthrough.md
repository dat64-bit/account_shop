# Walkthrough: Hoàn thành tích hợp lưu trữ ảnh đám mây Cloudinary

Chúng ta đã triển khai thành công tính năng quản lý, đăng tải hình ảnh sản phẩm chuẩn công nghiệp sử dụng dịch vụ đám mây **Cloudinary** (Phương án 4) theo đúng chu trình thiết kế hoài nghi (Doubt-Driven) và nguyên tắc tối giản (Simplicity First).

---

## 🛠️ Các thay đổi đã thực hiện

### 1. Spring Boot Backend

* **[pom.xml](file:///d:/shop/account-shop/account_shop/account-shop/pom.xml)**: Tích hợp thư viện chính thức **Cloudinary Java SDK (`cloudinary-http5`)**.
* **[application.properties](file:///d:/shop/account-shop/account_shop/account-shop/src/main/resources/application.properties)**:
  * Thêm cấu hình các biến môi trường/mặc định cho thông tin xác thực Cloudinary.
  * Thiết lập giới hạn kích thước file upload tối đa là **5MB** (`max-file-size=5MB`) để ngăn chặn tấn công DoS làm quá tải hệ thống.
* **[CloudinaryService.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/service/CloudinaryService.java)**:
  * Lớp xử lý nghiệp vụ kết nối với Cloudinary API thông qua SDK.
  * Tự động lưu trữ ảnh của dự án vào một thư mục riêng biệt là `account-shop` trên đám mây để dễ quản lý.
  * Trả về URL HTTPS an toàn và đã được tối ưu hóa.
* **[FileController.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/controller/FileController.java)**:
  * Cung cấp điểm cuối API bảo mật `/api/admin/files/upload`.
  * Ràng buộc phân quyền chặt chẽ thông qua `@PreAuthorize("hasRole('ADMIN')")` - chỉ cho phép quản trị viên đăng nhập mới có quyền upload ảnh.
  * Kiểm tra định dạng file (chỉ cho phép các file hình ảnh bắt đầu bằng `image/`), loại bỏ nguy cơ hacker tải lên webshell hoặc mã độc `.jsp`.

---

## 🧪 Kết quả kiểm tra & Xác minh (Verification Results)

Chúng ta đã chạy thử nghiệm biên dịch dự án Spring Boot để kiểm tra tính ổn định của mã nguồn mới:
```bash
.\mvnw.cmd compile
```

**Kết quả:**
```text
[INFO] --- compiler:3.14.1:compile (default-compile) @ account-shop ---
[INFO] Recompiling the module because of added or removed source files.
[INFO] Compiling 98 source files with javac [debug parameters release 21] to target\classes
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
Hệ thống biên dịch thành công 100% không có bất kỳ lỗi cú pháp hoặc xung đột thư viện nào!

---

## 💡 Hướng dẫn cấu hình hoạt động thực tế

Để tính năng hoạt động trên VPS hoặc máy Local của bạn, hãy cập nhật các thông số tài khoản Cloudinary của bạn vào file [application.properties](file:///d:/shop/account-shop/account_shop/account-shop/src/main/resources/application.properties#L38-L40):

```properties
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

*(Hoặc bạn có thể thiết lập các biến môi trường hệ thống: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, và `CLOUDINARY_API_SECRET` để ứng dụng tự động nhận diện).*
