-- 1. Tạo Database
CREATE DATABASE ShopAccountDB_V1;
GO
USE ShopAccountDB_V1;
GO

-- 2. Tạo bảng Status (Trạng thái chung cho toàn hệ thống)
CREATE TABLE [Status] (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName NVARCHAR(50) NOT NULL, -- Active, Inactive, Pending, Success, Failed
    Type NVARCHAR(50) NOT NULL, -- TRANSACTION, ORDER, ACCOUNT, PRODUCT
    Description NVARCHAR(255)
);
GO

-- 3. Tạo bảng Category (Danh mục sản phẩm) - MỚI
CREATE TABLE Category (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL, -- Ví dụ: Phim ảnh, VPN, Game, Học tập
    Description NVARCHAR(255),
    IconURL VARCHAR(MAX), -- Link ảnh icon cho danh mục (hiển thị trên App)
    IsActive BIT DEFAULT 1 -- 1: Hiện, 0: Ẩn
);
GO

-- 4. Tạo bảng Account (Người dùng & Admin)
CREATE TABLE Account (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,
    Username CHAR(50) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    PhoneNumber CHAR(10),
    Balance DECIMAL(18, 0) DEFAULT 0, -- Số dư ví
    Token VARCHAR(MAX),
    RoleID INT NOT NULL, 
    CreatedAt DATETIME DEFAULT GETDATE(),
    StatusID INT, 
    FOREIGN KEY (StatusID) REFERENCES [Status](StatusID)
    FOREIGN KEY (RoleID) REFERENCES [Role](RoleID)
);
GO

--role table 
CREATE TABLE [Role] (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL -- Admin, Customer, 
);
GO

-- 5. Tạo bảng Product (Sản phẩm - Đã nối với Category)
CREATE TABLE Product (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT, -- BỔ SUNG: Khóa ngoại liên kết danh mục
    ProductName NVARCHAR(255) NOT NULL,
    [Description] NVARCHAR(MAX),
    ImageURL VARCHAR(MAX),
    -- Các cờ logic sản phẩm
    IsContactSeller BIT DEFAULT 0, -- Liên hệ người bán
    IsInputEmailRequired BIT DEFAULT 0, -- Yêu cầu nhập thông tin bổ sung
    StatusID int NOT NULL,
    FOREIGN KEY (StatusID) REFERENCES [Status](StatusID),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) -- Liên kết
);
GO
CREATE TABLE subscription(
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name NVARCHAR(100) NOT NULL, -- Ví dụ: "1 Tháng", "6 Tháng", "Vĩnh Viễn"
    duration_days INT NOT NULL, -- Số ngày sử dụng (ví dụ: 30, 180, 365)
    is_active bit default 1, 
);
GO

-- 5.4 Tạo bảng Product_Subscription (Bảng nối nhiều-nhiều giữa Product và Subscription)
-- Bảng này dùng để định nghĩa các gói (plans) áp dụng cho từng sản phẩm
CREATE TABLE product_subscription (
    product_subscription_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    plan_id INT NOT NULL,
    price DECIMAL(18,0) NOT NULL, -- Giá của gói này (có thể khác nhau cho từng sản phẩm)
    is_active BIT DEFAULT 1, -- Gói có được kích hoạt cho sản phẩm này không
    -- Khóa ngoại
    FOREIGN KEY (product_id) REFERENCES Product(ProductID),
    FOREIGN KEY (plan_id) REFERENCES Subscription(plan_id),
    -- Đảm bảo không có 2 gói trùng lặp cho cùng 1 sản phẩm
    UNIQUE (product_id, plan_id)
);
GO

-- 5.5 Tạo bảng account_items (Tài khoản được giao cho khách)
create table account_item (
    account_item_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id int NOT NULL,
    account_password varchar(255),
    account_email varchar(255),
    created_at datetime default getdate(),
    status_id int NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(ProductID),
    FOREIGN KEY (status_id) REFERENCES [Status](StatusID),
);
GO
create table account_slot (
    account_slot_id INT IDENTITY(1,1) PRIMARY KEY,
    account_item_id INT NOT NULL,
    slot_name NVARCHAR(50) NOT NULL,
    pin_code VARCHAR(50),
    status_id int not null,
    FOREIGN KEY (account_item_id) REFERENCES account_item(account_item_id),
    FOREIGN KEY (status_id) REFERENCES [Status](StatusID),
);

-- 6. Tạo bảng Orders (Đơn hàng)
CREATE TABLE [orders] (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NOT NULL,
    product_subscription_id INT NOT NULL,
    slot_id int,
    order_date DATETIME DEFAULT GETDATE(),
    customer_provided_info NVARCHAR(255), -- Email khách nhập (nếu có)
    total_amount DECIMAL(18,0) NOT NULL,
    note NVARCHAR(500),
    status_id INT,
    FOREIGN KEY (account_id) REFERENCES Account(AccountID),
    FOREIGN KEY (product_subscription_id) REFERENCES Product_Subscription(product_subscription_id),
    FOREIGN KEY (slot_id) REFERENCES account_slot(account_slot_id),
    FOREIGN KEY (status_id) REFERENCES [Status](StatusID)
);
GO

-- 8. Tạo bảng Transaction (Lịch sử giao dịch & Biến động số dư)
CREATE TABLE [Transactions] (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL, 
    OrderID INT, -- Null nếu là nạp/rút tiền thuần túy
    Amount DECIMAL(18, 2) NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- DEPOSIT, WITHDRAW, PURCHASE, REFUND
    TransactionDate DATETIME DEFAULT GETDATE(),
    PaymentMethod NVARCHAR(50), -- WALLET, MOMO, BANKING
    Description NVARCHAR(MAX), 
    StatusID INT, 
    
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID),
    FOREIGN KEY (StatusID) REFERENCES [Status](StatusID)
);
GO

-- 9. Tạo bảng Chat
CREATE TABLE Chat (
    ChatID INT IDENTITY(1,1) PRIMARY KEY,
    SenderID INT NOT NULL,
    ReceiverID INT NOT NULL,
    MessageContent NVARCHAR(MAX) NOT NULL,
    SentTime DATETIME DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0,
    FOREIGN KEY (SenderID) REFERENCES Account(AccountID),
    FOREIGN KEY (ReceiverID) REFERENCES Account(AccountID)
);
GO

-- 10. Tạo bảng Blog
-- general information 
CREATE TABLE Blog (
    BlogID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL, -- Tên bài viết
    Summary NVARCHAR(500), -- Đoạn mô tả ngắn (Sapo) hiển thị dưới tiêu đề
    ThumbnailURL VARCHAR(MAX), -- Ảnh đại diện bên ngoài danh sách
    ViewCount INT DEFAULT 0, -- Đếm lượt xem
    AuthorID INT, 
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    IsActive BIT DEFAULT 1, -- 1: Đang hiện, 0: Ẩn
    FOREIGN KEY (AuthorID) REFERENCES Account(AccountID)
);
GO

-- detail informations 
-- Bảng này lưu tất cả: đoạn văn, mục lục, bước hướng dẫn, ảnh, video...
CREATE TABLE BlogContent (
    ContentID INT IDENTITY(1,1) PRIMARY KEY,
    BlogID INT NOT NULL,
    
    SortOrder INT NOT NULL, -- Thứ tự hiển thị (1, 2, 3...)
    
    -- Loại nội dung:
    -- 'HEADER': Tiêu đề mục lớn (VD: "1. Giới thiệu...") -> Dùng để tạo mục lục
    -- 'TEXT': Đoạn văn bản bình thường
    -- 'IMAGE': Ảnh minh họa nằm riêng
    -- 'VIDEO': Video nằm riêng
    -- 'STEP': Dùng cho bài hướng dẫn (Có Số bước + Tiêu đề + Ảnh/Video + Nội dung)
    ContentType VARCHAR(20) DEFAULT 'TEXT', 
    
    HeadingText NVARCHAR(255), -- Tiêu đề con (VD: "Bước 1:...", "2. Cấu hình...")
    BodyText NVARCHAR(MAX),    -- Nội dung chữ chi tiết
    MediaURL VARCHAR(MAX),     -- Link ảnh hoặc video
    
    FOREIGN KEY (BlogID) REFERENCES Blog(BlogID)
);
GO