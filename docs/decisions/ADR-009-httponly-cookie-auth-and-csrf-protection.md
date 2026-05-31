# ADR-009: HttpOnly Cookie Authentication and CSRF Protection

## Status
Accepted

## Date
2026-05-31

## Context
Trước đây, hệ thống lưu trữ JWT Token trực tiếp trong `localStorage` ở phía frontend. Cơ chế này đơn giản nhưng tiềm ẩn nguy cơ bảo mật nghiêm trọng:
* **Tấn công XSS (Cross-Site Scripting):** Nếu ứng dụng bị dính lỗi XSS (ví dụ từ thư viện bên thứ ba), kẻ tấn công có thể dễ dàng chạy mã JavaScript để đọc và lấy cắp Token từ `localStorage`.
* **Nguy cơ chiếm quyền điều khiển:** Token bị mất cắp sẽ cho phép kẻ tấn công thực hiện các thao tác quản trị giả mạo (đặc biệt nguy hiểm với quyền `ADMIN`).

Để giải quyết triệt để nguy cơ này, chúng ta quyết định chuyển sang **Giải pháp HttpOnly Cookie** (Solution 2). Tuy nhiên, việc sử dụng Cookie làm nảy sinh nguy cơ bị tấn công **CSRF (Cross-Site Request Forgery)** do trình duyệt tự động đính kèm cookie trong các request gửi tới backend.

Tài liệu này ghi nhận quyết định triển khai cơ chế xác thực qua HttpOnly Cookie và các biện pháp bảo vệ chống tấn công CSRF đi kèm.

---

## Decision

Chúng ta đã áp dụng giải pháp bảo mật đa lớp (Defense in Depth) để vừa chống XSS vừa ngăn ngừa tấn công CSRF hiệu quả:

### 1. Lưu trữ Token qua HttpOnly Cookie với cờ `SameSite=Lax`
Thay vì trả token trong body của response login/register, backend sẽ thiết lập một HttpOnly Cookie tên là `token` thông qua `ResponseCookie` của Spring Boot:

```java
// AuthController.java
ResponseCookie cookie = ResponseCookie.from("token", authResponse.getToken())
        .httpOnly(true)                // Ngăn JavaScript (XSS) truy cập Cookie
        .secure(false)                 // Đặt true khi triển khai Production chạy HTTPS
        .path("/")
        .maxAge(7 * 24 * 60 * 60)      // Thời hạn sống của cookie (7 ngày)
        .sameSite("Lax")               // <--- Chống tấn công CSRF
        .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
```

* **HttpOnly = true:** Chặn đứng hoàn toàn tấn công XSS chiếm đoạt Token vì JavaScript phía client không thể đọc được cookie này.
* **SameSite = Lax:** Trình duyệt sẽ chặn không cho gửi cookie này trong các request từ bên thứ ba (cross-site) đối với tất cả các request thay đổi trạng thái (POST, PUT, DELETE, PATCH). Nhờ vậy, kẻ tấn công trên trang web khác không thể thực hiện các hành vi giả mạo gửi request về API của chúng ta.

### 2. Cấu hình CORS nghiêm ngặt
Trong [SecurityConfig.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/config/SecurityConfig.java), chúng ta cấu hình CORS chặt chẽ để bổ trợ chống CSRF:
* Chỉ cho phép frontend origin đáng tin cậy (`allowedOrigins` - lấy từ cấu hình hệ thống) được phép gọi API.
* Bật `.setAllowCredentials(true)` để cho phép Axios nhận/gửi Cookie một cách chính thức, đồng thời cấm sử dụng wildcard `*` làm origin khi có credentials để tránh lỗ hổng bảo mật.

### 3. Refactor Axios ở Frontend sử dụng `withCredentials: true`
* **Gỡ bỏ hoàn toàn `localStorage.getItem('token')`** và request interceptor đính kèm header `Authorization: Bearer <token>` thủ công.
* Sử dụng Axios instance chung ([axios.ts](file:///d:/shop/account-shop/account_shop/account-shop-web/src/lib/axios.ts)) được cấu hình:
  ```typescript
  import axios from 'axios';

  const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
      withCredentials: true, // <--- BẮT BUỘC: Cho phép gửi và nhận HttpOnly Cookie
  });
  ```
* Toàn bộ 9 trang Admin và trang Dashboard của Customer đều được refactor từ `fetch` thuần sang dùng Axios `api` để tự động đính kèm cookie.

---

## Alternatives Considered

### 1. Bật CSRF Token mặc định của Spring Security (Double Submit Cookie)
* **Cách thực hiện:** Bật CSRF trong Spring Security, lưu trữ CSRF Token trong Cookie không HttpOnly (`XSRF-TOKEN`), sau đó bắt buộc Frontend đọc cookie này và gửi ngược lại qua Header `X-XSRF-TOKEN`.
* **Lý do hoãn lại:** Cơ chế `SameSite=Lax` kết hợp cấu hình CORS nghiêm ngặt đã cung cấp sự bảo vệ vững chắc và tương thích tốt trên 99% trình duyệt hiện đại ngày nay mà không làm tăng độ phức tạp của code. 
* **Hướng phát triển:** Nếu sau này hệ thống được mở rộng ra nhiều subdomain độc lập hoặc cần hỗ trợ các trình duyệt rất cũ, chúng ta sẽ kích hoạt cơ chế Double Submit Cookie bằng cách cập nhật `SecurityConfig.java` để sinh CSRF Token:
  ```java
  http.csrf(csrf -> csrf
      .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
      .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
  )
  ```
  Và thêm một custom filter để tự động kích hoạt tạo cookie trong mỗi session.

---

## Consequences

* **Ưu điểm bảo mật:**
  * Không còn nguy cơ rò rỉ token qua XSS.
  * An toàn trước tấn công CSRF thông qua các trình duyệt hiện đại hỗ trợ `SameSite`.
* **Tác động phát triển:**
  * Lập trình viên không cần quản lý Token thủ công ở client nữa.
  * Bắt buộc phải sử dụng Axios `api` instance hoặc cấu hình `credentials: 'include'` nếu dùng `fetch` để giao tiếp với backend.
  * Cần cấu hình đúng biến môi trường CORS ở cả Dev và Production để Cookie hoạt động bình thường.

---

## Addendum: Di chuyển API của User sang phân vùng `/api/user/**` (2026-05-31)

### Vấn đề
Theo [ADR-002](file:///d:/shop/account-shop/account_shop/docs/decisions/ADR-002-role-based-api-segregation.md), các endpoint dành cho người dùng cá nhân (như orders, tickets) cần được tổ chức dưới tiền tố `/api/user/**`. Tuy nhiên, trước đây chúng vẫn đang chạy dưới tiền tố `/api/v1/**` (như `/api/v1/orders` và `/api/v1/tickets`), không đồng nhất với quy tắc phân vùng vai trò.

### Quyết định thay đổi
1. **Backend Mappings:** 
   * Đổi mapping trong [OrderController.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/controller/OrderController.java) từ `/api/v1/orders` thành `/api/user/orders`.
   * Đổi mapping trong [TicketController.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/controller/TicketController.java) từ `/api/v1/tickets` thành `/api/user/tickets`.
2. **Spring Security Configuration:**
   * Cấu hình rõ ràng quyền truy cập trong [SecurityConfig.java](file:///d:/shop/account-shop/account_shop/account-shop/src/main/java/com/dat64bit/shop/accountshop/config/SecurityConfig.java):
     ```java
     .requestMatchers("/api/user/**").hasAnyRole("CUSTOMER", "ADMIN")
     ```
     *(Vì cả Customer và Admin đều có quyền xem vé hỗ trợ, viết phản hồi ticket cá nhân hoặc đặt hàng nên cho phép cả 2 role).*
3. **Frontend API Calls:**
   * Cập nhật toàn bộ các API call trong [dashboard/page.tsx](file:///d:/shop/account-shop/account_shop/account-shop-web/src/app/dashboard/page.tsx) và [admin/tickets/page.tsx](file:///d:/shop/account-shop/account_shop/account-shop-web/src/app/admin/tickets/page.tsx) từ `/v1/...` sang `/user/...`.

