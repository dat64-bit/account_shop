USE ShopAccountDB_V1;
GO

-- 1. Add Status 
INSERT INTO [Status] (StatusName, Type, Description) VALUES 
(N'Active', 'ACCOUNT', N'Tài khoản đang hoạt động'),
(N'Banned', 'ACCOUNT', N'Tài khoản bị khóa'),
(N'Pending', 'ORDER', N'Đơn hàng đang chờ xử lý'),
(N'Completed', 'ORDER', N'Đơn hàng thành công'),
(N'Cancelled', 'ORDER', N'Đơn hàng đã hủy'),
(N'Success', 'TRANSACTION', N'Giao dịch thành công'),
(N'Failed', 'TRANSACTION', N'Giao dịch thất bại'),
(N'Stocking', 'PRODUCT', N'Sản phẩm còn hàng');
GO

-- 2. Add Category 
INSERT INTO Category (CategoryName, Description, IconURL, IsActive) VALUES 
(N'Giải trí', N'Tài khoản Netflix, Spotify, Youtube...', 'icon_entertainment.png', 1),
(N'Làm việc', N'Tài khoản Office 365, Canva Pro, Zoom...', 'icon_work.png', 1),
(N'Học tập', N'Tài khoản Coursera, Udemy, Duolingo...', 'icon_edu.png', 1),
(N'VPN', N'Phần mềm Fake IP: NordVPN, ExpressVPN...', 'icon_vpn.png', 1);
GO

-- 3. Add Account
INSERT INTO Account (Username, PasswordHash, FullName, Email, PhoneNumber, Balance, Role, StatusID) VALUES 
('admin', 'hash_admin_123', N'Quản Trị Viên', 'admin@shop.com', '0909000111', 0, 'Admin', 1),
('nguyenvana', 'hash_user_123', N'Nguyễn Văn A', 'vana@gmail.com', '0912345678', 500000, 'Customer', 1),
('tranvanb', 'hash_user_456', N'Trần Văn B', 'vanb@gmail.com', '0987654321', 100000, 'Customer', 1);
GO

-- 4. Add Product 
INSERT INTO Product (CategoryID, ProductName, Description, Price, StockQuantity, IsContactSeller, AccountData, ImageURL, IsActive) VALUES 
(1, N'Netflix Premium 1 Tháng', N'Tài khoản Netflix xem 4K, profile riêng', 65000, 10, 0, N'user:net1@gmail.com|pass:123456', 'img_netflix.jpg', 1),
(1, N'Spotify Premium 1 Năm', N'Nâng cấp chính chủ email của bạn', 250000, 50, 0, NULL, 'img_spotify.jpg', 1),
(2, N'Canva Pro Vĩnh Viễn', N'Tài khoản Edu, bảo hành trọn đời', 100000, 20, 0, N'Link invite class...', 'img_canva.jpg', 1),
(4, N'NordVPN 2 Năm', N'Account dùng chung, tốc độ cao', 50000, 5, 0, N'user:vpn1@gmail.com|pass:abcxyz', 'img_nordvpn.jpg', 1);
GO

-- 5. Add Orders 
INSERT INTO Orders (AccountID, TotalAmount, Note, StatusID) VALUES 
(2, 65000, N'Mua Netflix nhanh giúp em', 4), -- Done
(2, 250000, N'Đang chờ shop nâng cấp Spotify', 3); -- Pending


-- 6. Add OrderDetail 
INSERT INTO OrderDetail (OrderID, ProductID, Quantity, PriceAtPurchase, CustomerProvidedInfo) VALUES 
(1, 1, 1, 65000, NULL);
INSERT INTO OrderDetail (OrderID, ProductID, Quantity, PriceAtPurchase, CustomerProvidedInfo) VALUES 
(2, 2, 1, 250000, N'vana@gmail.com');
GO

-- 7. Add Transaction (History deposite/buy)
INSERT INTO [Transaction] (AccountID, OrderID, Amount, TransactionType, PaymentMethod, Description, StatusID) VALUES 
--A deposite in wallet
(2, NULL, 500000, 'DEPOSIT', 'MOMO', N'Nạp tiền qua Momo mã GD 123456', 6),
--A pay for order 1
(2, 1, -65000, 'PURCHASE', 'WALLET', N'Thanh toán đơn hàng #1', 6);
GO

-- 8. Add Chat
INSERT INTO Chat (SenderID, ReceiverID, MessageContent, IsRead) VALUES 
(2, 1, N'Admin ơi đơn Spotify của mình xong chưa?', 0), -- User send Admin
(1, 2, N'Chào bạn, bên mình đang xử lý nhé, đợi 5p ạ.', 0); -- Admin respond
GO

-- 9. Add Blog
INSERT INTO Blog (Title, Summary, ThumbnailURL, ViewCount, AuthorID, IsActive) VALUES 
(N'Hướng dẫn sử dụng Netflix an toàn', N'Cách đổi profile và mã PIN để không bị người khác dùng trộm', 'thumb_netflix_guide.jpg', 150, 1, 1);
GO

-- 10. Add BlogContent
INSERT INTO BlogContent (BlogID, SortOrder, ContentType, HeadingText, BodyText, MediaURL) VALUES 
(1, 1, 'HEADER', N'1. Giới thiệu', N'Netflix là ứng dụng xem phim phổ biến...', NULL),
(1, 2, 'TEXT', NULL, N'Để bảo mật tài khoản, bạn cần đặt mã PIN cho Profile.', NULL),
(1, 3, 'IMAGE', NULL, NULL, 'img_step1_pin.jpg'),
(1, 4, 'STEP', N'Bước 1: Vào cài đặt', N'Truy cập trang Account -> Profile & Parental Controls', NULL);
GO