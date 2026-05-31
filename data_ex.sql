-- ============================================================
-- DATA_EX.SQL — Dữ liệu mẫu cho ShopAccountDB V2
-- Chạy SAU khi đã chạy ShopAccountDB_V1.sql
-- ============================================================
USE shop_account_db;
GO

-- ============================================================
-- PHẦN 1: SUBSCRIPTION PLANS
-- ============================================================
INSERT INTO subscription_plan (plan_name, duration_days, is_active) VALUES
    (N'1 Tháng',   30,  1),
    (N'3 Tháng',   90,  1),
    (N'6 Tháng',   180, 1),
    (N'1 Năm',     365, 1),
    (N'Vĩnh Viễn', 0,   1);
GO

-- ============================================================
-- PHẦN 2: CATEGORIES
-- ============================================================
INSERT INTO category (category_name, description, icon_url, is_active) VALUES
    (N'Giải trí',  N'Netflix, Spotify, YouTube Premium, Disney+...',          N'icon-entertainment.svg', 1),
    (N'Làm việc',  N'Office 365, Canva Pro, Adobe CC, Notion...',             N'icon-work.svg',          1),
    (N'Học tập',   N'Coursera, Udemy, Duolingo Plus, Grammarly...',           N'icon-education.svg',     1),
    (N'VPN & Bảo mật', N'NordVPN, ExpressVPN, 1Password, LastPass...',        N'icon-vpn.svg',           1),
    (N'AI & Công cụ',  N'ChatGPT Plus, Midjourney, Copilot Pro...',           N'icon-ai.svg',            1);
GO

-- ============================================================
-- PHẦN 3: ACCOUNTS (mật khẩu BCrypt của "Password@123")
-- ============================================================
-- role_id: 1=Admin, 2=Customer
-- account_status_id: 1=Active, 2=Inactive, 3=Pending, 4=Banned

INSERT INTO account (username, password_hash, full_name, email, phone_number, balance, role_id, account_status_id) VALUES
    -- Admin
    ('admin',        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Quản Trị Viên',    'admin@vandatshop.vn',   '0909000111', 0,       1, 1),
    -- Customers
    ('nguyenvana',   '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Nguyễn Văn An',    'vana@gmail.com',        '0912345678', 1500000, 2, 1),
    ('tranthib',     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Trần Thị Bình',   'thib@gmail.com',        '0987654321', 800000,  2, 1),
    ('lehongc',      '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Lê Hồng Cường',   'chuong@outlook.com',    '0976543210', 250000,  2, 1),
    ('phamthid',     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Phạm Thị Dung',   'dung.pham@gmail.com',   '0965432109', 0,       2, 3),
    ('voquange',     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iudTGK7N7QSjjwV9bfFn7TKbHDYG', N'Võ Quang Đức',    'duc.vo@yahoo.com',      '0954321098', 500000,  2, 1);
GO

-- ============================================================
-- PHẦN 4: PRODUCTS
-- ============================================================
-- category_id: 1=Giải trí, 2=Làm việc, 3=Học tập, 4=VPN, 5=AI
-- product_status_id: 1=Active, 2=Inactive, 3=OutOfStock

INSERT INTO product (category_id, product_name, description, image_url, is_contact_seller, is_input_email_required, product_status_id) VALUES
    -- Giải trí
    (1, N'Netflix Premium',       N'Tài khoản Netflix 4K Ultra HD, xem trên 4 thiết bị cùng lúc. Profile riêng, có mã PIN bảo vệ. Bảo hành đúng thời hạn.',              N'https://img.vandatshop.vn/netflix.jpg',   0, 0, 1),
    (1, N'Spotify Premium',       N'Nâng cấp chính chủ email của bạn lên Spotify Premium. Nghe nhạc không quảng cáo, tải về offline.',                                     N'https://img.vandatshop.vn/spotify.jpg',  0, 1, 1),
    (1, N'YouTube Premium',       N'Nâng cấp tài khoản Google của bạn lên YouTube Premium. Xem không quảng cáo, tải video offline, YouTube Music.',                       N'https://img.vandatshop.vn/youtube.jpg',  0, 1, 1),
    (1, N'Disney+ Premium',       N'Tài khoản Disney+ gói Premium, xem 4K HDR. Hàng loạt bộ phim Marvel, Star Wars, Pixar.',                                              N'https://img.vandatshop.vn/disney.jpg',   0, 0, 1),
    -- Làm việc
    (2, N'Canva Pro',             N'Tài khoản Canva Pro kho ảnh và template không giới hạn. Xuất file không nền, lịch đăng bài tự động.',                                  N'https://img.vandatshop.vn/canva.jpg',    0, 1, 1),
    (2, N'Microsoft 365 Personal',N'Bộ Office đầy đủ: Word, Excel, PowerPoint, Teams. 1TB OneDrive. Cài được trên PC + điện thoại.',                                       N'https://img.vandatshop.vn/office365.jpg',0, 1, 1),
    -- Học tập
    (3, N'Coursera Plus',         N'Truy cập toàn bộ 7.000+ khóa học từ các trường đại học hàng đầu thế giới. Bao gồm chứng chỉ chuyên nghiệp.',                          N'https://img.vandatshop.vn/coursera.jpg', 0, 1, 1),
    (3, N'Duolingo Plus',         N'Học ngôn ngữ không quảng cáo, luyện tập offline, tim vô hạn.',                                                                         N'https://img.vandatshop.vn/duolingo.jpg', 0, 1, 1),
    -- VPN
    (4, N'NordVPN',               N'Tài khoản NordVPN dùng chung, tốc độ cao, hơn 5000 server toàn cầu. Bảo mật tuyệt đối.',                                              N'https://img.vandatshop.vn/nordvpn.jpg',  0, 0, 1),
    -- AI
    (5, N'ChatGPT Plus (GPT-4o)', N'Tài khoản ChatGPT Plus, sử dụng GPT-4o tốc độ cao không giới hạn. Hỗ trợ DALL-E và Web Search.',                                     N'https://img.vandatshop.vn/chatgpt.jpg',  0, 0, 1),
    (5, N'Midjourney',            N'Tài khoản Midjourney gói Basic, tạo ảnh AI chất lượng cao. Liên hệ shop để được hướng dẫn sử dụng.',                                  N'https://img.vandatshop.vn/midjourney.jpg',1, 0, 1);
GO

-- ============================================================
-- PHẦN 5: PRODUCT SUBSCRIPTIONS (giá theo từng gói)
-- ============================================================
-- plan_id: 1=1Tháng, 2=3Tháng, 3=6Tháng, 4=1Năm, 5=VĩnhViễn
-- product_id: 1=Netflix, 2=Spotify, 3=YouTube, 4=Disney+, 5=Canva, 6=Office365, 7=Coursera, 8=Duolingo, 9=NordVPN, 10=ChatGPT, 11=Midjourney

-- Netflix
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (1, 1, 65000,  1), (1, 2, 180000, 1), (1, 3, 320000, 1), (1, 4, 580000, 1);
-- Spotify
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (2, 1, 45000,  1), (2, 2, 120000, 1), (2, 3, 220000, 1), (2, 4, 390000, 1);
-- YouTube Premium
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (3, 1, 40000,  1), (3, 2, 110000, 1), (3, 3, 200000, 1), (3, 4, 360000, 1);
-- Disney+
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (4, 1, 55000,  1), (4, 3, 290000, 1), (4, 4, 520000, 1);
-- Canva Pro
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (5, 1, 70000,  1), (5, 3, 370000, 1), (5, 4, 650000, 1), (5, 5, 950000, 1);
-- Office 365
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (6, 1, 80000,  1), (6, 3, 420000, 1), (6, 4, 750000, 1);
-- Coursera Plus
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (7, 1, 250000, 1), (7, 4, 2200000,1);
-- Duolingo Plus
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (8, 1, 35000,  1), (8, 3, 180000, 1), (8, 4, 320000, 1);
-- NordVPN
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (9, 1, 50000,  1), (9, 3, 260000, 1), (9, 4, 450000, 1);
-- ChatGPT Plus
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (10,1, 350000, 1), (10,3, 950000, 1), (10,4, 1800000,1);
-- Midjourney
INSERT INTO product_subscription (product_id, plan_id, price, is_active) VALUES
    (11,1, 200000, 1), (11,3, 540000, 1), (11,4, 950000, 1);
GO

-- ============================================================
-- PHẦN 6: ACCOUNT ITEMS (hàng trong kho)
-- ============================================================
-- item_status_id: 1=Available, 2=Sold, 3=Expired, 4=Disabled
-- Netflix (product_id=1): dạng SHARED_SLOT nên có account_slot
INSERT INTO account_item (product_id, account_email, account_password, item_status_id) VALUES
    (1, N'netflix.pool1@vandatshop.vn', N'NetflixP@ss01', 1),
    (1, N'netflix.pool2@vandatshop.vn', N'NetflixP@ss02', 1),
    (1, N'netflix.pool3@vandatshop.vn', N'NetflixP@ss03', 2), -- Đã bán
    (1, N'netflix.pool4@vandatshop.vn', N'NetflixP@ss04', 1),
    -- NordVPN (product_id=9): dạng SHARED_SLOT
    (9, N'nordvpn.pool1@vandatshop.vn', N'NordP@ss01', 1),
    (9, N'nordvpn.pool2@vandatshop.vn', N'NordP@ss02', 1),
    -- ChatGPT (product_id=10): dạng FULL_ACCOUNT
    (10,N'chatgpt.user1@vandatshop.vn', N'ChatGPT@Pass1', 2), -- Đã bán
    (10,N'chatgpt.user2@vandatshop.vn', N'ChatGPT@Pass2', 1),
    (10,N'chatgpt.user3@vandatshop.vn', N'ChatGPT@Pass3', 1);
GO

-- ============================================================
-- PHẦN 7: ACCOUNT SLOTS (profile trong shared account)
-- ============================================================
-- slot_status_id: 1=Available, 2=InUse, 3=Expired
-- Netflix pool 1 (account_item_id=1): 4 slots
INSERT INTO account_slot (account_item_id, slot_name, pin_code, slot_status_id) VALUES
    (1, N'Slot 1 - Trẻ em',  N'1234', 2), -- InUse
    (1, N'Slot 2 - Phim bộ', N'5678', 2), -- InUse
    (1, N'Slot 3 - Phim lẻ', N'9012', 1), -- Available
    (1, N'Slot 4 - Dự phòng',N'3456', 1); -- Available
-- Netflix pool 2 (account_item_id=2): 4 slots
INSERT INTO account_slot (account_item_id, slot_name, pin_code, slot_status_id) VALUES
    (2, N'Slot 1', N'1111', 1),
    (2, N'Slot 2', N'2222', 1),
    (2, N'Slot 3', N'3333', 1),
    (2, N'Slot 4', N'4444', 1);
-- NordVPN pool 1 (account_item_id=5): 6 slots
INSERT INTO account_slot (account_item_id, slot_name, pin_code, slot_status_id) VALUES
    (5, N'Device 1', NULL, 2),
    (5, N'Device 2', NULL, 2),
    (5, N'Device 3', NULL, 1),
    (5, N'Device 4', NULL, 1),
    (5, N'Device 5', NULL, 1),
    (5, N'Device 6', NULL, 1);
GO

-- ============================================================
-- PHẦN 8: ORDERS (đơn hàng)
-- ============================================================
-- order_status_id: 1=Pending, 2=Confirmed, 3=Completed, 4=Cancelled, 5=Refunded
-- account_id: 2=nguyenvana, 3=tranthib, 4=lehongc, 6=voquange

INSERT INTO [order] (account_id, total_amount, note, order_status_id) VALUES
    (2, 65000,   N'',                                       3), -- Completed
    (2, 350000,  N'Cho mình mua ChatGPT Plus 1 tháng ạ',   3), -- Completed
    (3, 45000,   N'',                                       3), -- Completed
    (3, 180000,  N'Upgrade Spotify 3 tháng cho email cá nhân', 2), -- Confirmed
    (4, 50000,   N'NordVPN 1 tháng',                        3), -- Completed
    (6, 250000,  N'Coursera Plus 1 tháng để học Data Science',1), -- Pending
    (2, 70000,   N'',                                       4); -- Cancelled
GO

-- ============================================================
-- PHẦN 9: ORDER DETAILS
-- ============================================================
-- fulfillment_status_id: 1=Pending, 2=Delivered, 3=Failed
-- item_type_id: 1=SHARED_SLOT, 2=FULL_ACCOUNT, 3=UPGRADE_REQUIRED
-- product_subscription_id tham chiếu theo thứ tự INSERT ở Phần 5:
--   ps_id=1: Netflix 1T(65k), ps_id=5: Spotify 1T(45k), ps_id=9: YouTube 1T(40k)
--   ps_id=17: NordVPN 1T(50k), ps_id=20: ChatGPT 1T(350k), ps_id=25: Coursera 1T(250k)

INSERT INTO order_detail (order_id, product_subscription_id, price, item_type_id, account_slot_id, account_item_id, customer_provided_info, fulfillment_status_id) VALUES
    -- Order 1: Netflix 1T → Slot 1 của account_item 3 (đã bán)
    (1, 1,  65000,  1, 1,  3,  NULL,                   2),
    -- Order 2: ChatGPT 1T → account_item 7 (full account)
    (2, 20, 350000, 2, NULL, 7, NULL,                   2),
    -- Order 3: Spotify 1T → upgrade email
    (3, 5,  45000,  3, NULL, NULL, N'thib@gmail.com',   2),
    -- Order 4: Spotify 3T → upgrade email (đang xử lý)
    (4, 6,  120000, 3, NULL, NULL, N'thib@gmail.com',   1),
    -- Order 5: NordVPN 1T → Device 1
    (5, 17, 50000,  1, 5,  5,  NULL,                   2),
    -- Order 6: Coursera Plus 1T (pending)
    (6, 25, 250000, 3, NULL, NULL, N'duc.vo@yahoo.com', 1),
    -- Order 7: Canva Pro 1T → cancelled
    (7, 13, 70000,  3, NULL, NULL, N'vana@gmail.com',   3);
GO

-- ============================================================
-- PHẦN 10: TRANSACTIONS
-- ============================================================
-- transaction_type_id: 1=DEPOSIT, 2=WITHDRAW, 3=PURCHASE, 4=REFUND
-- payment_method_id: 1=WALLET, 2=MOMO, 3=BANKING
-- transaction_status_id: 1=Pending, 2=Success, 3=Failed

INSERT INTO [transaction] (account_id, order_id, amount, transaction_type_id, payment_method_id, description, transaction_status_id) VALUES
    -- nguyenvana nạp tiền
    (2, NULL, 2000000,  1, 2, N'Nạp tiền qua MoMo - Mã GD: MM240501001', 2),
    -- nguyenvana mua Netflix
    (2, 1,    -65000,   3, 1, N'Thanh toán đơn hàng #1 - Netflix 1 Tháng', 2),
    -- nguyenvana mua ChatGPT
    (2, 2,    -350000,  3, 1, N'Thanh toán đơn hàng #2 - ChatGPT Plus 1 Tháng', 2),
    -- tranthib nạp tiền
    (3, NULL, 1000000,  1, 3, N'Nạp tiền chuyển khoản - Mã GD: CK240502001', 2),
    -- tranthib mua Spotify 1T
    (3, 3,    -45000,   3, 1, N'Thanh toán đơn hàng #3 - Spotify 1 Tháng', 2),
    -- tranthib mua Spotify 3T
    (3, 4,    -180000,  3, 1, N'Thanh toán đơn hàng #4 - Spotify 3 Tháng', 2),
    -- lehongc nạp tiền
    (4, NULL, 300000,   1, 2, N'Nạp tiền qua MoMo - Mã GD: MM240503001', 2),
    -- lehongc mua NordVPN
    (4, 5,    -50000,   3, 1, N'Thanh toán đơn hàng #5 - NordVPN 1 Tháng', 2),
    -- voquange nạp tiền
    (6, NULL, 500000,   1, 2, N'Nạp tiền qua MoMo - Mã GD: MM240504001', 2),
    -- nguyenvana hủy đơn → hoàn tiền 70k
    (2, 7,    70000,    4, 1, N'Hoàn tiền đơn hàng #7 đã hủy - Canva Pro 1 Tháng', 2);
GO

-- ============================================================
-- PHẦN 11: CONVERSATIONS & MESSAGES
-- ============================================================
-- participant_one_id < participant_two_id (ràng buộc)
INSERT INTO conversation (participant_one_id, participant_two_id) VALUES
    (1, 2), -- Admin ↔ nguyenvana
    (1, 3), -- Admin ↔ tranthib
    (1, 6); -- Admin ↔ voquange
GO

-- conversation_id: 1=Admin↔vana, 2=Admin↔thib, 3=Admin↔duc
INSERT INTO message (conversation_id, sender_id, message_content, message_type, is_read) VALUES
    -- Admin ↔ nguyenvana
    (1, 2, N'Admin ơi, đơn ChatGPT của mình giao chưa ạ?',                            'TEXT', 1),
    (1, 1, N'Bạn ơi, bên mình đã giao xong rồi nhé. Bạn vào email check lại giúp mình.', 'TEXT', 1),
    (1, 2, N'Oke shop, mình nhận được rồi ạ. Cảm ơn shop nhiều!',                     'TEXT', 1),
    -- Admin ↔ tranthib
    (2, 3, N'Shop ơi, Spotify 3 tháng của em khi nào nâng cấp xong ạ?',               'TEXT', 1),
    (2, 1, N'Dạ bạn ơi, bên mình đang xử lý trong vòng 24h nhé. Bạn vui lòng chờ một chút.',  'TEXT', 1),
    -- Admin ↔ voquange
    (3, 6, N'Mình muốn hỏi về gói Coursera Plus, có bảo hành không shop?',            'TEXT', 0),
    (3, 1, N'Dạ bạn ơi, gói Coursera Plus bảo hành đúng thời hạn. Nếu lỗi thì shop xử lý trong 24h.', 'TEXT', 0);
GO

-- ============================================================
-- PHẦN 12: BLOGS
-- ============================================================
INSERT INTO blog (title, summary, thumbnail_url, view_count, author_id, is_active) VALUES
    (N'Hướng dẫn sử dụng Netflix an toàn và bảo mật',
     N'Cách thiết lập mã PIN, chọn Profile và những mẹo giúp tài khoản Netflix dùng bền hơn.',
     N'https://img.vandatshop.vn/blog/netflix-guide.jpg', 320, 1, 1),

    (N'ChatGPT Plus có gì mới trong năm 2025?',
     N'Tổng hợp các tính năng nổi bật của GPT-4o, DALL-E 3 và Advanced Data Analysis trong gói Plus.',
     N'https://img.vandatshop.vn/blog/chatgpt-2025.jpg', 850, 1, 1),

    (N'So sánh NordVPN vs ExpressVPN: Cái nào đáng mua hơn?',
     N'Phân tích chi tiết về tốc độ, bảo mật, giá cả và tính năng của hai VPN hàng đầu thế giới.',
     N'https://img.vandatshop.vn/blog/vpn-compare.jpg', 210, 1, 1);
GO

-- Blog 1: Netflix guide
INSERT INTO blog_content (blog_id, sort_order, content_type, heading_text, body_text, media_url) VALUES
    (1, 1, 'HEADER', N'Tại sao cần bảo mật tài khoản Netflix?',
     N'Tài khoản Netflix dùng chung rất dễ bị người khác thay đổi mật khẩu nếu bạn không cẩn thận. Bài viết này hướng dẫn bạn thiết lập Profile an toàn.', NULL),
    (1, 2, 'STEP',   N'Bước 1: Đặt mã PIN cho Profile',
     N'Vào Account → Profile & Parental Controls → chọn Profile của bạn → bật PIN 4 chữ số.', NULL),
    (1, 3, 'IMAGE',  NULL, NULL, N'https://img.vandatshop.vn/blog/netflix-pin.jpg'),
    (1, 4, 'STEP',   N'Bước 2: Không chia sẻ mật khẩu',
     N'Chỉ dùng Profile riêng của mình, không đăng nhập tài khoản chính khi không cần thiết.', NULL),
    (1, 5, 'TEXT',   NULL,
     N'Nếu gặp sự cố đăng nhập, hãy liên hệ ngay shop qua chat để được hỗ trợ trong vòng 30 phút.', NULL);
GO

-- Blog 2: ChatGPT
INSERT INTO blog_content (blog_id, sort_order, content_type, heading_text, body_text, media_url) VALUES
    (2, 1, 'HEADER', N'GPT-4o — Mô hình AI mạnh nhất của OpenAI',
     N'GPT-4o (Omni) là mô hình đa phương thức kết hợp văn bản, hình ảnh và âm thanh trong một mô hình duy nhất.', NULL),
    (2, 2, 'TEXT',   NULL,
     N'Người dùng ChatGPT Plus được dùng GPT-4o không giới hạn, trong khi tài khoản miễn phí bị giới hạn số lượt.', NULL),
    (2, 3, 'IMAGE',  NULL, NULL, N'https://img.vandatshop.vn/blog/gpt4o.jpg');
GO

-- ============================================================
-- PHẦN 13: TICKETS
-- ============================================================
-- ticket_status_id: 1=Pending, 2=Processing, 3=Resolved, 4=Refunded, 5=Closed
-- order_detail_id: 4=Spotify 3T đang pending, 6=Coursera đang pending

INSERT INTO ticket (account_id, order_detail_id, issue_type, ticket_status_id) VALUES
    (3, 4, N'Chưa nhận được hàng - Spotify 3 Tháng chưa được nâng cấp sau 12 tiếng', 2), -- Processing
    (6, 6, N'Cần hướng dẫn sử dụng - Không biết cách đăng nhập Coursera Plus',        1); -- Pending
GO

INSERT INTO ticket_reply (ticket_id, sender_id, message) VALUES
    -- Ticket 1: Spotify
    (1, 3, N'Shop ơi, em đặt Spotify 3 tháng từ hôm qua mà vẫn chưa thấy nâng cấp. Email của em là thib@gmail.com ạ.'),
    (1, 1, N'Bạn ơi, mình xin lỗi vì sự chậm trễ. Bên mình đang xử lý, dự kiến xong trong 1-2 tiếng nhé. Cảm ơn bạn đã thông cảm!'),
    -- Ticket 2: Coursera
    (2, 6, N'Mình mua Coursera Plus nhưng không biết cách đăng nhập, shop hướng dẫn giúp mình với.');
GO

-- ============================================================
-- KIỂM TRA DỮ LIỆU
-- ============================================================
SELECT 'accounts'      AS [table], COUNT(*) AS total FROM account
UNION ALL SELECT 'products',        COUNT(*) FROM product
UNION ALL SELECT 'product_subs',    COUNT(*) FROM product_subscription
UNION ALL SELECT 'account_items',   COUNT(*) FROM account_item
UNION ALL SELECT 'account_slots',   COUNT(*) FROM account_slot
UNION ALL SELECT 'orders',          COUNT(*) FROM [order]
UNION ALL SELECT 'order_details',   COUNT(*) FROM order_detail
UNION ALL SELECT 'transactions',    COUNT(*) FROM [transaction]
UNION ALL SELECT 'messages',        COUNT(*) FROM message
UNION ALL SELECT 'tickets',         COUNT(*) FROM ticket;
GO
