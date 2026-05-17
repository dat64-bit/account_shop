# Tích hợp dịch vụ lưu trữ đám mây Cloudinary để quản lý ảnh (Phương án 4)

Quy hoạch giải pháp quản lý, đăng tải và hiển thị hình ảnh sản phẩm/danh mục thông qua việc tích hợp dịch vụ lưu trữ đám mây **Cloudinary** trong dự án VanDatPremium (Backend Java Spring Boot + Frontend Next.js), đảm bảo các yếu tố Bảo mật cao, Lưu trữ vĩnh viễn, Tối ưu hóa hiệu năng tải ảnh và Không làm phình to database hay tốn dung lượng VPS.

---

## User Review Required

> [!IMPORTANT]
> **Yêu cầu phân quyền Admin:** 
> Điểm cuối (Endpoint) đăng tải ảnh `/api/admin/files/upload` sẽ được bảo vệ bởi Spring Security (`hasRole("ADMIN")`), đảm bảo chỉ có các tài khoản Admin có JWT Token hợp lệ mới có quyền upload ảnh lên hệ thống.

> [!WARNING]
> **Cấu hình thông tin tài khoản Cloudinary:**
> Để tính năng upload hoạt động, bạn sẽ cần đăng ký một tài khoản Cloudinary miễn phí (Free Tier cung cấp tới 25GB dung lượng và băng thông hàng tháng) và điền các thông tin xác thực vào file `application.properties` ở backend.

---

## Open Questions

> [!NOTE]
> Bạn có sẵn sàng cung cấp hoặc đăng ký tài khoản Cloudinary để lấy các thông số: **Cloud Name**, **API Key**, và **API Secret** chưa?
> 
> *Nếu bạn đã có sẵn, hãy cung cấp hoặc tự điền vào sau khi tôi tạo các trường cấu hình trong file `application.properties`.*

---

## Proposed Changes

Chúng ta sẽ thực hiện tích hợp theo kiến trúc **Backend Proxy**: Frontend Next.js gửi file Multipart lên Java Backend $\rightarrow$ Java Backend sử dụng Cloudinary Java SDK với thông tin xác thực an toàn (giấu kín ở server) để upload lên Cloud $\rightarrow$ Trả về URL ảnh bảo mật dạng HTTPS.

---

### Backend (Spring Boot)

#### [MODIFY] [pom.xml](file:///d:/shop/account-shop/account_shop/account-shop/pom.xml)
* Thêm thư viện chính thức **Cloudinary Java SDK** (`cloudinary-http5`) làm dependency:
```xml
<dependency>
    <groupId>com.cloudinary</groupId>
    <artifactId>cloudinary-http5</artifactId>
    <version>2.3.2</version>
</dependency>
```

#### [MODIFY] [application.properties](file:///d:/shop/account-shop/account_shop/account-shop/src/main/resources/application.properties)
* Khai báo các cấu hình kết nối Cloudinary và giới hạn kích thước file upload để bảo vệ server:
```properties
# Cloudinary Configuration
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# File Upload Configuration (Giới hạn tối đa 5MB mỗi file ảnh)
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

#### [NEW] [CloudinaryService.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/service/CloudinaryService.java)
* Tạo lớp dịch vụ chịu trách nhiệm giao tiếp trực tiếp với SDK của Cloudinary:
  * Khởi tạo đối tượng `Cloudinary` từ các tham số cấu hình trong `application.properties`.
  * Phương thức `uploadFile(MultipartFile file)` chuyển đổi dữ liệu nhị phân của ảnh thành luồng dữ liệu tải lên Cloudinary và trả về đường dẫn URL an toàn (`secure_url`).

#### [NEW] [FileController.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/controller/FileController.java)
* Tạo REST Controller cung cấp API `/api/admin/files/upload` cho Admin:
  * Kiểm tra định dạng file gửi lên (chỉ chấp nhận các file ảnh có Content-Type bắt đầu bằng `image/`).
  * Thực hiện gọi `CloudinaryService` để upload ảnh lên đám mây và trả về mã trạng thái HTTP 200 kèm link URL ảnh.

---

### Frontend (Next.js - Web app)

#### [NEW] [UploadService.ts](file:///d:/shop/account-shop/account_shop/account-shop-web/src/services/UploadService.ts) (Hoặc tích hợp vào api client có sẵn)
* Viết hàm gọi API `post` sử dụng `FormData` để gửi ảnh lên Backend với header chứa JWT Token của Admin.

---

## Verification Plan

### Automated & Manual Verification
1. **Kiểm tra biên dịch:** Chạy lệnh `./mvnw.cmd clean compile` ở backend để đảm bảo Maven tải đúng thư viện và biên dịch không có lỗi.
2. **Kiểm tra phân quyền:** Thử sử dụng tài khoản không phải Admin (hoặc không đăng nhập) gọi API `/api/admin/files/upload` $\rightarrow$ Xác minh nhận về mã lỗi HTTP `401 Unauthorized` hoặc `403 Forbidden`.
3. **Kiểm tra tính năng thực tế:** Đăng nhập bằng tài khoản Admin, gửi một file ảnh mẫu $\rightarrow$ Xác minh nhận về URL ảnh tĩnh có dạng `https://res.cloudinary.com/...` và ảnh hiển thị bình thường trên trình duyệt.
4. **Kiểm tra định dạng an toàn:** Thử upload một file không phải ảnh (ví dụ: `.txt` hoặc `.jsp`) $\rightarrow$ Xác minh nhận về mã lỗi HTTP `400 Bad Request` với thông điệp từ chối của backend.
