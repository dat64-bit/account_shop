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
    Role VARCHAR(20) DEFAULT 'Customer', 
    CreatedAt DATETIME DEFAULT GETDATE(),
    StatusID INT, 
    FOREIGN KEY (StatusID) REFERENCES [Status](StatusID)
);
GO

-- 5. Tạo bảng Product (Sản phẩm - Đã nối với Category)
CREATE TABLE Product (
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT, -- BỔ SUNG: Khóa ngoại liên kết danh mục
    ProductName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(18, 2) DEFAULT 0,
    StockQuantity INT DEFAULT 0, -- Quản lý còn hàng/hết hàng
    
    -- Các cờ logic sản phẩm
    IsContactSeller BIT DEFAULT 0, -- Liên hệ người bán
    IsInputEmailRequired BIT DEFAULT 0, -- Yêu cầu nhập thông tin bổ sung
    
    AccountData NVARCHAR(MAX), -- Data tài khoản (user|pass)
    ImageURL VARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) -- Liên kết
);
GO

-- 6. Tạo bảng Orders (Đơn hàng)
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID INT NOT NULL,
    OrderDate DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(18, 2) NOT NULL,
    Note NVARCHAR(500),
    StatusID INT,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID),
    FOREIGN KEY (StatusID) REFERENCES [Status](StatusID)
);
GO

-- 7. Tạo bảng OrderDetail (Chi tiết đơn hàng)
CREATE TABLE OrderDetail (
    OrderDetailID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT DEFAULT 1,
    PriceAtPurchase DECIMAL(18, 2), -- Lưu giá tại thời điểm mua
    CustomerProvidedInfo NVARCHAR(255), -- Email khách nhập (nếu có)
    
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);
GO

-- 8. Tạo bảng Transaction (Lịch sử giao dịch & Biến động số dư)
CREATE TABLE [Transaction] (
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