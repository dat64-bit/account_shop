#!/bin/bash
# =============================================================
# setup-server.sh — Cài đặt Docker và migrate sang Docker Compose
# Chạy trên DigitalOcean VPS với quyền root
#
# Cách dùng:
#   chmod +x setup-server.sh
#   ./setup-server.sh
# =============================================================

set -e  # Dừng ngay nếu có lệnh lỗi

# Màu sắc để dễ đọc log
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "=================================================="
echo "  VanDatPremium Shop — Server Setup Script"
echo "=================================================="
echo ""

# ----------------------------------------------------------
# BƯỚC 1: Cài Docker
# ----------------------------------------------------------
log_info "Bước 1/6: Kiểm tra Docker..."

if command -v docker &> /dev/null; then
    log_success "Docker đã được cài: $(docker --version)"
else
    log_info "Chưa có Docker, đang cài..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log_success "Docker đã cài xong: $(docker --version)"
fi

# ----------------------------------------------------------
# BƯỚC 2: Tạo cấu trúc thư mục
# ----------------------------------------------------------
log_info "Bước 2/6: Tạo thư mục dự án tại ~/account_shop ..."

mkdir -p ~/account_shop/account-shop
mkdir -p ~/account_shop/account-shop-web

log_success "Thư mục đã tạo"

# ----------------------------------------------------------
# BƯỚC 3: Di chuyển file .env cũ sang vị trí mới
# ----------------------------------------------------------
log_info "Bước 3/6: Di chuyển file .env..."

# Backend .env — hiện đang ở ~ (cùng thư mục với JAR)
if [ -f ~/.env ]; then
    cp ~/.env ~/account_shop/account-shop/.env
    log_success "Đã copy ~/.env → ~/account_shop/account-shop/.env"
elif [ -f ~/account_shop/account-shop/.env ]; then
    log_success "File backend .env đã có sẵn"
else
    log_warn "Không tìm thấy backend .env! Bạn cần tự tạo file:"
    log_warn "  ~/account_shop/account-shop/.env"
fi

# Frontend .env
if [ -f ~/account_shop/account-shop-web/.env ]; then
    log_success "File frontend .env đã có sẵn"
else
    log_warn "Không tìm thấy frontend .env, tạo mặc định..."
    cat > ~/account_shop/account-shop-web/.env << 'EOF'
NEXT_PUBLIC_API_URL=https://vinatechsmartmanufacturing.site
SERVER_API_URL=http://localhost:8080
EOF
    log_success "Đã tạo ~/account_shop/account-shop-web/.env"
fi

# ----------------------------------------------------------
# BƯỚC 4: Tải docker-compose.yml từ GitHub
# ----------------------------------------------------------
log_info "Bước 4/6: Tải docker-compose.yml từ GitHub..."

curl -fsSL \
    "https://raw.githubusercontent.com/dat64-bit/account_shop/main/docker-compose.yml" \
    -o ~/account_shop/docker-compose.yml \
    || log_warn "Không tải được từ GitHub — bạn cần copy thủ công docker-compose.yml lên ~/account_shop/"

if [ -f ~/account_shop/docker-compose.yml ]; then
    log_success "docker-compose.yml đã sẵn sàng"
fi

# ----------------------------------------------------------
# BƯỚC 5: Đăng nhập GitHub Container Registry (GHCR)
# ----------------------------------------------------------
log_info "Bước 5/6: Đăng nhập GHCR để pull Docker image..."
echo ""
echo -e "${YELLOW}Bạn cần một GitHub Personal Access Token (PAT) để pull image.${NC}"
echo "Tạo tại: https://github.com/settings/tokens"
echo "Quyền cần tick: [x] read:packages"
echo ""
read -s -p "Nhập GitHub PAT (sẽ ẩn khi gõ): " GHCR_TOKEN
echo ""

echo "$GHCR_TOKEN" | docker login ghcr.io -u dat64-bit --password-stdin \
    && log_success "Đăng nhập GHCR thành công" \
    || log_error "Đăng nhập GHCR thất bại. Kiểm tra lại PAT."

# ----------------------------------------------------------
# BƯỚC 6: Dừng tiến trình cũ và khởi động Docker
# ----------------------------------------------------------
log_info "Bước 6/6: Dừng tiến trình cũ và khởi động containers..."

# Dừng JAR cũ nếu đang chạy
if pgrep -f "account-shop.*\.jar" > /dev/null 2>&1; then
    log_info "Đang dừng Spring Boot JAR cũ..."
    pkill -f "account-shop.*\.jar" && sleep 2
    log_success "Đã dừng JAR cũ"
else
    log_info "Không có JAR cũ đang chạy"
fi

# Dừng tiến trình Node.js frontend cũ nếu đang chạy
if pgrep -f "node.*server.js\|npm.*start\|next start" > /dev/null 2>&1; then
    log_info "Đang dừng frontend Node.js cũ..."
    pkill -f "node.*server.js\|npm.*start\|next start" && sleep 2
    log_success "Đã dừng frontend cũ"
else
    log_info "Không có frontend Node.js cũ đang chạy"
fi

# Pull image mới nhất và khởi động
cd ~/account_shop
log_info "Đang pull Docker images từ GHCR..."
docker compose pull

log_info "Đang khởi động containers..."
docker compose up -d

# Kiểm tra trạng thái
sleep 3
echo ""
log_info "Trạng thái containers:"
docker compose ps

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Setup hoàn tất!${NC}"
echo ""
echo "  Backend:  http://159.223.63.176:8080"
echo "  Frontend: http://159.223.63.176:3000"
echo ""
echo "Xem log:"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo "=================================================="
