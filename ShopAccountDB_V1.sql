-- ============================================================
-- ShopAccountDB V2 — Chuẩn 3NF, snake_case convention
-- ============================================================
-- Thay đổi so với V1:
--   1. Toàn bộ snake_case (bảng, cột, constraint)
--   2. Tách bảng status chung thành status riêng cho từng domain
--   3. CHAR → VARCHAR, VARCHAR(MAX) → VARCHAR(500) cho URL
--   4. Thống nhất DECIMAL(18,0) cho tiền VND
--   5. Thêm audit columns (created_at, updated_at) cho mọi bảng
--   6. Thêm index cho các FK và cột query thường xuyên
--   7. Thêm ON DELETE cascade/set null hợp lý
--   8. Tách Chat thành conversation + message
--   9. Thống nhất status management (không còn hardcode string)
--  10. Thứ tự tạo bảng đúng dependency
-- ============================================================


--DROP DATABASE shop_account_db;
--GO
CREATE DATABASE shop_account_db;
GO
USE shop_account_db;
GO

-- ============================================================
-- PHẦN 1: CÁC BẢNG LOOKUP / REFERENCE (không phụ thuộc bảng khác)
-- ============================================================

-- 1.1 Trạng thái tài khoản (Active, Inactive, Banned, Pending)
CREATE TABLE account_status (
    account_status_id   INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.2 Trạng thái sản phẩm (Active, Inactive, OutOfStock)
CREATE TABLE product_status (
    product_status_id   INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.3 Trạng thái đơn hàng (Pending, Confirmed, Completed, Cancelled, Refunded)
CREATE TABLE order_status (
    order_status_id     INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.4 Trạng thái giao dịch (Pending, Success, Failed)
CREATE TABLE transaction_status (
    transaction_status_id INT IDENTITY(1,1) PRIMARY KEY,
    status_name           NVARCHAR(50) NOT NULL UNIQUE,
    description           NVARCHAR(255)
);
GO

-- 1.5 Trạng thái account_item (Available, Sold, Expired, Disabled)
CREATE TABLE item_status (
    item_status_id      INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.6 Trạng thái slot (Available, InUse, Expired)
CREATE TABLE slot_status (
    slot_status_id      INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.7 Trạng thái ticket (Pending, Processing, Resolved, Refunded, Closed)
CREATE TABLE ticket_status (
    ticket_status_id    INT IDENTITY(1,1) PRIMARY KEY,
    status_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.8 Trạng thái fulfillment cho order_detail (Pending, Delivered, Failed)
CREATE TABLE fulfillment_status (
    fulfillment_status_id INT IDENTITY(1,1) PRIMARY KEY,
    status_name           NVARCHAR(50) NOT NULL UNIQUE,
    description           NVARCHAR(255)
);
GO

-- 1.9 Vai trò người dùng
CREATE TABLE role (
    role_id     INT IDENTITY(1,1) PRIMARY KEY,
    role_name   NVARCHAR(50) NOT NULL UNIQUE  -- Admin, Customer
);
GO

-- 1.10 Danh mục sản phẩm
CREATE TABLE category (
    category_id     INT IDENTITY(1,1) PRIMARY KEY,
    category_name   NVARCHAR(100) NOT NULL,
    description     NVARCHAR(255),
    icon_url        VARCHAR(500),
    is_active       BIT DEFAULT 1,
    created_at      DATETIME DEFAULT GETDATE(),
    updated_at      DATETIME
);
GO

-- 1.11 Loại giao dịch (DEPOSIT, WITHDRAW, PURCHASE, REFUND)
CREATE TABLE transaction_type (
    transaction_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name           NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255)
);
GO

-- 1.12 Phương thức thanh toán (WALLET, MOMO, BANKING)
CREATE TABLE payment_method (
    payment_method_id   INT IDENTITY(1,1) PRIMARY KEY,
    method_name         NVARCHAR(50) NOT NULL UNIQUE,
    description         NVARCHAR(255),
    is_active           BIT DEFAULT 1
);
GO

-- 1.13 Loại item giao hàng (SHARED_SLOT, FULL_ACCOUNT, UPGRADE_REQUIRED)
CREATE TABLE item_type (
    item_type_id    INT IDENTITY(1,1) PRIMARY KEY,
    type_name       VARCHAR(50) NOT NULL UNIQUE,
    description     NVARCHAR(255)
);
GO

-- 1.14 Gói subscription
CREATE TABLE subscription_plan (
    plan_id         INT IDENTITY(1,1) PRIMARY KEY,
    plan_name       NVARCHAR(100) NOT NULL,     -- "1 Tháng", "6 Tháng", "Vĩnh Viễn"
    duration_days   INT NOT NULL,               -- 30, 180, 365, 0 = vĩnh viễn
    is_active       BIT DEFAULT 1,
    created_at      DATETIME DEFAULT GETDATE(),
    updated_at      DATETIME
);
GO

-- ============================================================
-- PHẦN 2: CÁC BẢNG CHÍNH (có FK tới lookup)
-- ============================================================

-- 2.1 Tài khoản người dùng
CREATE TABLE account (
    account_id          INT IDENTITY(1,1) PRIMARY KEY,
    username            VARCHAR(50) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    full_name           NVARCHAR(100),
    email               VARCHAR(100) UNIQUE,
    phone_number        VARCHAR(15),
    balance             DECIMAL(18,0) DEFAULT 0,
    token               VARCHAR(500),
    role_id             INT NOT NULL,
    account_status_id   INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_account_role   FOREIGN KEY (role_id) REFERENCES role(role_id),
    CONSTRAINT fk_account_status FOREIGN KEY (account_status_id) REFERENCES account_status(account_status_id)
);
GO

CREATE INDEX ix_account_role_id   ON account(role_id);
CREATE INDEX ix_account_status_id ON account(account_status_id);
CREATE INDEX ix_account_email     ON account(email);
GO

-- 2.2 Sản phẩm
CREATE TABLE product (
    product_id              INT IDENTITY(1,1) PRIMARY KEY,
    category_id             INT,
    product_name            NVARCHAR(255) NOT NULL,
    description             NVARCHAR(MAX),
    image_url               VARCHAR(500),
    is_contact_seller       BIT DEFAULT 0,
    is_input_email_required BIT DEFAULT 0,
    product_status_id       INT NOT NULL,
    created_at              DATETIME DEFAULT GETDATE(),
    updated_at              DATETIME,

    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_product_status   FOREIGN KEY (product_status_id) REFERENCES product_status(product_status_id)
);
GO

CREATE INDEX ix_product_category_id ON product(category_id);
CREATE INDEX ix_product_status_id   ON product(product_status_id);
GO

-- 2.3 Bảng nối Product ↔ Subscription (nhiều-nhiều, giá theo từng cặp)
CREATE TABLE product_subscription (
    product_subscription_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id              INT NOT NULL,
    plan_id                 INT NOT NULL,
    price                   DECIMAL(18,0) NOT NULL,
    is_active               BIT DEFAULT 1,
    created_at              DATETIME DEFAULT GETDATE(),
    updated_at              DATETIME,

    CONSTRAINT fk_ps_product FOREIGN KEY (product_id) REFERENCES product(product_id),
    CONSTRAINT fk_ps_plan    FOREIGN KEY (plan_id) REFERENCES subscription_plan(plan_id),
    CONSTRAINT uq_product_plan UNIQUE (product_id, plan_id)
);
GO

CREATE INDEX ix_ps_product_id ON product_subscription(product_id);
CREATE INDEX ix_ps_plan_id    ON product_subscription(plan_id);
GO

-- 2.4 Tài khoản hàng hóa (account được giao cho khách)
CREATE TABLE account_item (
    account_item_id     INT IDENTITY(1,1) PRIMARY KEY,
    product_id          INT NOT NULL,
    account_email       VARCHAR(255),
    account_password    VARCHAR(255),
    item_status_id      INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_ai_product FOREIGN KEY (product_id) REFERENCES product(product_id),
    CONSTRAINT fk_ai_status  FOREIGN KEY (item_status_id) REFERENCES item_status(item_status_id)
);
GO

CREATE INDEX ix_ai_product_id ON account_item(product_id);
CREATE INDEX ix_ai_status_id  ON account_item(item_status_id);
GO

-- 2.5 Slot (profile/slot trong shared account)
CREATE TABLE account_slot (
    account_slot_id     INT IDENTITY(1,1) PRIMARY KEY,
    account_item_id     INT NOT NULL,
    slot_name           NVARCHAR(50) NOT NULL,
    pin_code            VARCHAR(50),
    slot_status_id      INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_slot_item   FOREIGN KEY (account_item_id) REFERENCES account_item(account_item_id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_status FOREIGN KEY (slot_status_id) REFERENCES slot_status(slot_status_id)
);
GO

CREATE INDEX ix_slot_item_id   ON account_slot(account_item_id);
CREATE INDEX ix_slot_status_id ON account_slot(slot_status_id);
GO

-- ============================================================
-- PHẦN 3: ĐƠN HÀNG & GIAO DỊCH
-- ============================================================

-- 3.1 Đơn hàng
CREATE TABLE [order] (
    order_id            INT IDENTITY(1,1) PRIMARY KEY,
    account_id          INT NOT NULL,
    order_date          DATETIME DEFAULT GETDATE(),
    total_amount        DECIMAL(18,0) NOT NULL,
    note                NVARCHAR(500),
    order_status_id     INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_order_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_order_status  FOREIGN KEY (order_status_id) REFERENCES order_status(order_status_id)
);
GO

CREATE INDEX ix_order_account_id ON [order](account_id);
CREATE INDEX ix_order_status_id  ON [order](order_status_id);
CREATE INDEX ix_order_date       ON [order](order_date DESC);
GO

-- 3.2 Chi tiết đơn hàng
CREATE TABLE order_detail (
    order_detail_id         INT IDENTITY(1,1) PRIMARY KEY,
    order_id                INT NOT NULL,
    product_subscription_id INT NOT NULL,
    price                   DECIMAL(18,0) NOT NULL,
    item_type_id            INT,
    account_slot_id         INT NULL,
    account_item_id         INT NULL,
    customer_provided_info  NVARCHAR(255),
    fulfillment_status_id   INT NOT NULL,
    created_at              DATETIME DEFAULT GETDATE(),
    updated_at              DATETIME,

    CONSTRAINT fk_od_order       FOREIGN KEY (order_id) REFERENCES [order](order_id),
    CONSTRAINT fk_od_ps          FOREIGN KEY (product_subscription_id) REFERENCES product_subscription(product_subscription_id),
    CONSTRAINT fk_od_item_type   FOREIGN KEY (item_type_id) REFERENCES item_type(item_type_id),
    CONSTRAINT fk_od_slot        FOREIGN KEY (account_slot_id) REFERENCES account_slot(account_slot_id),
    CONSTRAINT fk_od_account_item FOREIGN KEY (account_item_id) REFERENCES account_item(account_item_id),
    CONSTRAINT fk_od_fulfillment FOREIGN KEY (fulfillment_status_id) REFERENCES fulfillment_status(fulfillment_status_id)
);
GO

CREATE INDEX ix_od_order_id ON order_detail(order_id);
CREATE INDEX ix_od_ps_id    ON order_detail(product_subscription_id);
CREATE INDEX ix_od_fulfillment ON order_detail(fulfillment_status_id);
GO

-- 3.3 Combo
CREATE TABLE combo (
    combo_id        INT IDENTITY(1,1) PRIMARY KEY,
    combo_name      NVARCHAR(255) NOT NULL,
    price           DECIMAL(18,0) NOT NULL,
    description     NVARCHAR(MAX),
    is_active       BIT DEFAULT 1,
    created_at      DATETIME DEFAULT GETDATE(),
    updated_at      DATETIME
);
GO

-- 3.4 Chi tiết combo (combo ↔ product_subscription)
CREATE TABLE combo_detail (
    combo_detail_id         INT IDENTITY(1,1) PRIMARY KEY,
    combo_id                INT NOT NULL,
    product_subscription_id INT NOT NULL,

    CONSTRAINT fk_cd_combo FOREIGN KEY (combo_id) REFERENCES combo(combo_id) ON DELETE CASCADE,
    CONSTRAINT fk_cd_ps    FOREIGN KEY (product_subscription_id) REFERENCES product_subscription(product_subscription_id),
    CONSTRAINT uq_combo_ps UNIQUE (combo_id, product_subscription_id)
);
GO

CREATE INDEX ix_cd_combo_id ON combo_detail(combo_id);
GO

-- 3.5 Giao dịch tài chính
CREATE TABLE [transaction] (
    transaction_id          INT IDENTITY(1,1) PRIMARY KEY,
    account_id              INT NOT NULL,
    order_id                INT NULL,           -- NULL nếu nạp/rút tiền
    amount                  DECIMAL(18,0) NOT NULL,
    transaction_type_id     INT NOT NULL,
    payment_method_id       INT,
    description             NVARCHAR(MAX),
    transaction_status_id   INT NOT NULL,
    created_at              DATETIME DEFAULT GETDATE(),
    updated_at              DATETIME,

    CONSTRAINT fk_txn_account  FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_txn_order    FOREIGN KEY (order_id) REFERENCES [order](order_id) ON DELETE SET NULL,
    CONSTRAINT fk_txn_type     FOREIGN KEY (transaction_type_id) REFERENCES transaction_type(transaction_type_id),
    CONSTRAINT fk_txn_payment  FOREIGN KEY (payment_method_id) REFERENCES payment_method(payment_method_id),
    CONSTRAINT fk_txn_status   FOREIGN KEY (transaction_status_id) REFERENCES transaction_status(transaction_status_id)
);
GO

CREATE INDEX ix_txn_account_id ON [transaction](account_id);
CREATE INDEX ix_txn_order_id   ON [transaction](order_id);
CREATE INDEX ix_txn_type_id    ON [transaction](transaction_type_id);
CREATE INDEX ix_txn_created_at ON [transaction](created_at DESC);
GO

-- ============================================================
-- PHẦN 4: CHAT (tách conversation + message)
-- ============================================================

-- 4.1 Cuộc hội thoại
CREATE TABLE conversation (
    conversation_id     INT IDENTITY(1,1) PRIMARY KEY,
    participant_one_id  INT NOT NULL,
    participant_two_id  INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_conv_p1 FOREIGN KEY (participant_one_id) REFERENCES account(account_id),
    CONSTRAINT fk_conv_p2 FOREIGN KEY (participant_two_id) REFERENCES account(account_id),
    CONSTRAINT uq_conversation UNIQUE (participant_one_id, participant_two_id),
    CONSTRAINT ck_conv_diff CHECK (participant_one_id < participant_two_id)  -- tránh duplicate ngược
);
GO

CREATE INDEX ix_conv_p1 ON conversation(participant_one_id);
CREATE INDEX ix_conv_p2 ON conversation(participant_two_id);
GO

-- 4.2 Tin nhắn
CREATE TABLE message (
    message_id          INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id     INT NOT NULL,
    sender_id           INT NOT NULL,
    message_content     NVARCHAR(MAX) NOT NULL,
    message_type        VARCHAR(20) DEFAULT 'TEXT',     -- TEXT, IMAGE, FILE
    is_read             BIT DEFAULT 0,
    created_at          DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id) REFERENCES conversation(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES account(account_id)
);
GO

CREATE INDEX ix_msg_conv_id    ON message(conversation_id, created_at DESC);
CREATE INDEX ix_msg_sender_id  ON message(sender_id);
GO

-- ============================================================
-- PHẦN 5: BLOG
-- ============================================================

-- 5.1 Bài viết
CREATE TABLE blog (
    blog_id         INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(255) NOT NULL,
    summary         NVARCHAR(500),
    thumbnail_url   VARCHAR(500),
    view_count      INT DEFAULT 0,
    author_id       INT,
    is_active       BIT DEFAULT 1,
    created_at      DATETIME DEFAULT GETDATE(),
    updated_at      DATETIME,

    CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES account(account_id) ON DELETE SET NULL
);
GO

CREATE INDEX ix_blog_author_id  ON blog(author_id);
CREATE INDEX ix_blog_created_at ON blog(created_at DESC);
GO

-- 5.2 Nội dung chi tiết bài viết (block-based content)
CREATE TABLE blog_content (
    content_id      INT IDENTITY(1,1) PRIMARY KEY,
    blog_id         INT NOT NULL,
    sort_order      INT NOT NULL,
    content_type    VARCHAR(20) DEFAULT 'TEXT',  -- HEADER, TEXT, IMAGE, VIDEO, STEP
    heading_text    NVARCHAR(255),
    body_text       NVARCHAR(MAX),
    media_url       VARCHAR(500),

    CONSTRAINT fk_bc_blog FOREIGN KEY (blog_id) REFERENCES blog(blog_id) ON DELETE CASCADE
);
GO

CREATE INDEX ix_bc_blog_id ON blog_content(blog_id, sort_order);
GO

-- ============================================================
-- PHẦN 6: TICKET HỖ TRỢ
-- ============================================================

-- 6.1 Ticket
CREATE TABLE ticket (
    ticket_id           INT IDENTITY(1,1) PRIMARY KEY,
    account_id          INT NOT NULL,
    order_detail_id     INT NOT NULL,
    issue_type          NVARCHAR(100),
    ticket_status_id    INT NOT NULL,
    created_at          DATETIME DEFAULT GETDATE(),
    updated_at          DATETIME,

    CONSTRAINT fk_ticket_account FOREIGN KEY (account_id) REFERENCES account(account_id),
    CONSTRAINT fk_ticket_od      FOREIGN KEY (order_detail_id) REFERENCES order_detail(order_detail_id),
    CONSTRAINT fk_ticket_status  FOREIGN KEY (ticket_status_id) REFERENCES ticket_status(ticket_status_id)
);
GO

CREATE INDEX ix_ticket_account_id ON ticket(account_id);
CREATE INDEX ix_ticket_status_id  ON ticket(ticket_status_id);
CREATE INDEX ix_ticket_created_at ON ticket(created_at DESC);
GO

-- 6.2 Phản hồi ticket
CREATE TABLE ticket_reply (
    reply_id        INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id       INT NOT NULL,
    sender_id       INT NOT NULL,
    message         NVARCHAR(MAX) NOT NULL,
    created_at      DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_tr_ticket FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_sender FOREIGN KEY (sender_id) REFERENCES account(account_id)
);
GO

CREATE INDEX ix_tr_ticket_id ON ticket_reply(ticket_id);
GO

-- ============================================================
-- PHẦN 7: DỮ LIỆU KHỞI TẠO (SEED DATA)
-- ============================================================

-- Roles
INSERT INTO role (role_name) VALUES (N'Admin'), (N'Customer');
GO

-- Account statuses
INSERT INTO account_status (status_name, description) VALUES
    (N'Active',   N'Tài khoản đang hoạt động'),
    (N'Inactive', N'Tài khoản bị vô hiệu hóa'),
    (N'Pending',  N'Chờ xác minh'),
    (N'Banned',   N'Tài khoản bị cấm');
GO

-- Product statuses
INSERT INTO product_status (status_name, description) VALUES
    (N'Active',     N'Đang bán'),
    (N'Inactive',   N'Ngừng bán'),
    (N'OutOfStock', N'Hết hàng');
GO

-- Order statuses
INSERT INTO order_status (status_name, description) VALUES
    (N'Pending',    N'Chờ xử lý'),
    (N'Confirmed',  N'Đã xác nhận'),
    (N'Completed',  N'Hoàn thành'),
    (N'Cancelled',  N'Đã hủy'),
    (N'Refunded',   N'Đã hoàn tiền');
GO

-- Transaction statuses
INSERT INTO transaction_status (status_name, description) VALUES
    (N'Pending', N'Đang xử lý'),
    (N'Success', N'Thành công'),
    (N'Failed',  N'Thất bại');
GO

-- Item statuses
INSERT INTO item_status (status_name, description) VALUES
    (N'Available', N'Sẵn sàng giao'),
    (N'Sold',      N'Đã bán'),
    (N'Expired',   N'Hết hạn'),
    (N'Disabled',  N'Vô hiệu hóa');
GO

-- Slot statuses
INSERT INTO slot_status (status_name, description) VALUES
    (N'Available', N'Slot trống'),
    (N'InUse',     N'Đang sử dụng'),
    (N'Expired',   N'Hết hạn');
GO

-- Ticket statuses
INSERT INTO ticket_status (status_name, description) VALUES
    (N'Pending',    N'Chờ xử lý'),
    (N'Processing', N'Đang xử lý'),
    (N'Resolved',   N'Đã giải quyết'),
    (N'Refunded',   N'Đã hoàn tiền'),
    (N'Closed',     N'Đã đóng');
GO

-- Fulfillment statuses
INSERT INTO fulfillment_status (status_name, description) VALUES
    (N'Pending',   N'Chờ giao hàng'),
    (N'Delivered', N'Đã giao'),
    (N'Failed',    N'Giao thất bại');
GO

-- Transaction types
INSERT INTO transaction_type (type_name, description) VALUES
    (N'DEPOSIT',  N'Nạp tiền'),
    (N'WITHDRAW', N'Rút tiền'),
    (N'PURCHASE', N'Mua hàng'),
    (N'REFUND',   N'Hoàn tiền');
GO

-- Payment methods
INSERT INTO payment_method (method_name, description) VALUES
    (N'WALLET',  N'Ví nội bộ'),
    (N'MOMO',    N'Ví MoMo'),
    (N'BANKING', N'Chuyển khoản ngân hàng');
GO

-- Item types
INSERT INTO item_type (type_name, description) VALUES
    ('SHARED_SLOT',      N'Slot chia sẻ'),
    ('FULL_ACCOUNT',     N'Toàn bộ tài khoản'),
    ('UPGRADE_REQUIRED', N'Cần nâng cấp');
GO