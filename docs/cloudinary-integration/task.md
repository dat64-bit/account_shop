# Checklist: Tích hợp Cloudinary để quản lý ảnh

- `[x]` Thêm thư viện Cloudinary vào `pom.xml` của Spring Boot backend
- `[x]` Cấu hình thuộc tính Cloudinary và giới hạn Multipart trong `application.properties`
- `[x]` Tạo lớp `CloudinaryService.java` để tương tác với Cloudinary SDK
- `[x]` Tạo lớp `FileController.java` cung cấp API upload ảnh bảo mật `/api/admin/files/upload`
- `[x]` Chạy thử nghiệm biên dịch dự án Spring Boot để xác minh tính ổn định (Đã biên dịch thành công: BUILD SUCCESS!)
