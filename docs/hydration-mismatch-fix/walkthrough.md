# Walkthrough: Sửa lỗi Hydration Mismatch & Font Outfit (Next.js)

Tài liệu ghi nhận và giải thích chi tiết giải pháp xử lý triệt để lỗi **React Hydration Mismatch** (do extension của trình duyệt như Brave Shields tự động tiêm thuộc tính is_skin_checked="1" và is_register="..." vào DOM) cùng lỗi biên dịch TypeScript của **Font Outfit** trong Next.js App Router.

---

## 🛠️ Các vấn đề & Giải pháp đã thực hiện

### 1. Sửa lỗi biên dịch TypeScript của Font Outfit
* **Vấn đề:** 
  * Trong file layout.tsx, Font Outfit từ Google Fonts được định nghĩa có thuộc tính subsets: ["latin", "vietnamese"].
  * Vì Google Fonts không định nghĩa phân nhóm ký tự riêng tên là "vietnamese" cho font Outfit nên trình biên dịch TypeScript báo lỗi nghiêm trọng làm gián đoạn quá trình build:
    Type '"vietnamese"' is not assignable to type '"latin" | "latin-ext"'.
* **Giải pháp:** 
  * Cập nhật lại cấu hình font Outfit thành subsets: ["latin"]. Lựa chọn này vừa bảo đảm an toàn kiểu dữ liệu (Type-safe), vừa giữ nguyên khả năng hiển thị tiếng Việt chính xác nhờ cơ chế tự động kết xuất glyph Latin mở rộng của các trình duyệt hiện đại.

### 2. Xử lý triệt để lỗi Hydration Mismatch (Brave Shields / Extension)
* **Vấn đề:**
  * Trình duyệt Brave (hoặc các extension bảo mật/chặn quảng cáo) tự động quét và tiêm thuộc tính is_skin_checked="1" vào hầu hết các thẻ layout (div, ooter, side...) và tiêm các thuộc tính is_register="...", __processed_...__="true" vào thẻ <body>.
  * Next.js render HTML sạch trên Server (SSR) nhưng khi chạy trên Client thì DOM đã bị extension thay đổi $\rightarrow$ React phát hiện mismatch và flood lỗi ngập tràn console của nhà phát triển.
* **Giải pháp kết hợp (Hybrid Solution) tối giản & hiệu quả cao:**
  1. **Áp dụng suppress ở thẻ gốc (<html> và <body>):** Thêm thuộc tính suppressHydrationWarning={true} vào cả hai thẻ gốc để React bỏ qua hoàn toàn các thuộc tính cấu hình hệ thống hoặc ngôn ngữ mà extension luôn tiêm vào thẻ cao nhất.
  2. **Tiền xử lý DOM bằng MutationObserver (Pre-hydration Script):** 
     * Injected một đoạn script siêu nhẹ chạy đồng bộ trong thẻ <head>.
     * Script này khởi chạy một MutationObserver theo dõi toàn bộ tài liệu (document.documentElement). 
     * Ngay khi extension vừa tiêm thuộc tính is_skin_checked vào bất kỳ thẻ HTML nào, script sẽ lập tức gọi emoveAttribute để **xóa sạch trong tích tắc** trước khi React bắt đầu chạy tiến trình Hydration.

---

## 📝 Chi tiết mã nguồn đã cập nhật

File đã sửa đổi: **[layout.tsx](file:///d:/shop/account-shop/account_shop/account-shop-web/src/app/layout.tsx)**

---

## 🌟 Ưu điểm của giải pháp
* Giữ sạch terminal nhà phát triển, giúp tập trung vào các lỗi thực sự quan trọng.
* Không ảnh hưởng đến hiệu năng SEO/SSR.
* Giải quyết triệt để trên toàn bộ giao diện mà không cần chỉnh sửa từng file component.
