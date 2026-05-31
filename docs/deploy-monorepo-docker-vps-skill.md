---
name: deploy-monorepo-docker-vps
description: Cấu hình và triển khai CI/CD tự động bằng Docker, Docker Compose, GHCR và GitHub Actions cho dự án Monorepo Spring Boot (Backend) + Next.js (Frontend) lên VPS DigitalOcean.
---

# Hướng Dẫn Thiết Lập CI/CD & Deploy Docker Monorepo (Spring Boot + Next.js) Lên VPS

Tài liệu này đóng vai trò như một **Skill File** hướng dẫn chi tiết cách cấu hình toàn bộ hệ thống CI/CD chất lượng cao và đóng gói Docker cho dự án monorepo gồm hai thành phần:
1. **Backend**: Java Spring Boot (chạy ở cổng `8080`)
2. **Frontend**: Next.js App Router (chạy ở cổng `3000`, chế độ `standalone`)

---

## 1. Cấu Hình Dockerfile Cho Backend

Tệp này được đặt tại: `account-shop/Dockerfile`
Sử dụng **Multi-stage Build** để tối ưu hóa kích thước ảnh (Image Size) từ hơn 800MB xuống còn khoảng 180MB bằng cách loại bỏ Maven sau khi compile xong.

```dockerfile
# Stage 1: Build ứng dụng Spring Boot bằng Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Tải trước các dependencies để tận dụng Docker cache
RUN mvn dependency:go-offline -B
COPY src ./src
# Build file JAR bỏ qua chạy tests (tests đã được kiểm tra ở bước CI)
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng bằng môi trường JRE siêu nhẹ (Alpine)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Tạo user non-root để tăng tính bảo mật cho container
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
# Copy tệp JAR từ stage 1 sang stage 2
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# Khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 2. Cấu Hình Dockerfile Cho Frontend (Next.js)

Tệp này được đặt tại: `account-shop-web/Dockerfile`
Sử dụng chế độ **standalone** của Next.js (yêu cầu cấu hình `output: 'standalone'` trong `next.config.ts`). Giúp dung lượng image chỉ ~150MB và chạy cực kỳ nhanh.

```dockerfile
# Stage 1: Cài đặt dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build source code thành phiên bản Production
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node-modules ./node_modules
COPY . .
# Nhận API URL tĩnh hoặc động thông qua build argument
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 3: Runner siêu nhỏ gọn chạy Next.js standalone
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Tạo user non-root để tăng tính bảo mật
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy các tệp static và standalone cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 3. Cấu Hình Phối Hợp Bằng Docker Compose

Tệp này đặt tại thư mục gốc của dự án: `docker-compose.yml`
Quản lý đồng thời cả hai container, liên kết chúng với các file cấu hình `.env` sẵn có trên Host VPS nhằm bảo mật thông tin (không đẩy `.env` lên GitHub).

```yaml
services:
  backend:
    image: ghcr.io/dat64-bit/account-shop-backend:latest
    container_name: account-shop-backend
    restart: unless-stopped
    network_mode: "host"
    env_file:
      - ./account-shop/.env

  frontend:
    image: ghcr.io/dat64-bit/account-shop-frontend:latest
    container_name: account-shop-frontend
    restart: unless-stopped
    network_mode: "host"
    env_file:
      - ./account-shop-web/.env
```

---

## 4. Pipeline CD Tự Động Triển Khai (GitHub Actions)

Tệp này đặt tại: `.github/workflows/cd.yml`
Chạy tự động khi code được push lên nhánh `main`. Quy trình bao gồm:
1. Build & Push image Backend lên **GitHub Container Registry (GHCR)**.
2. Build & Push image Frontend lên **GHCR**.
3. SSH vào VPS bằng mật khẩu (sử dụng Github Secrets), pull image mới nhất và restart container mà không ảnh hưởng đến dữ liệu.

```yaml
name: CD — Deploy lên VPS

on:
  push:
    branches: [main]

jobs:
  # ================================================
  # Job 1: Build & Push Docker image Backend
  # ================================================
  build-backend:
    name: Build Backend Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Đăng nhập GitHub Container Registry (GHCR)
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build và push image Backend
        uses: docker/build-push-action@v6
        with:
          context: ./account-shop
          push: true
          tags: ghcr.io/dat64-bit/account-shop-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ================================================
  # Job 2: Build & Push Docker image Frontend
  # ================================================
  build-frontend:
    name: Build Frontend Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Đăng nhập GitHub Container Registry (GHCR)
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build và push image Frontend
        uses: docker/build-push-action@v6
        with:
          context: ./account-shop-web
          push: true
          tags: ghcr.io/dat64-bit/account-shop-frontend:latest
          build-args: |
            NEXT_PUBLIC_API_URL=https://vinatechsmartmanufacturing.site
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ================================================
  # Job 3: Kết nối SSH vào VPS và kích hoạt Container
  # ================================================
  deploy:
    name: Deploy lên VPS
    runs-on: ubuntu-latest
    needs: [build-backend, build-frontend]
    steps:
      - name: SSH vào server và chạy docker compose
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          password: ${{ secrets.VPS_PASSWORD }}
          script: |
            cd ~/account_shop
            # Cập nhật docker-compose.yml mới nhất từ GitHub
            curl -fsSL "https://raw.githubusercontent.com/dat64-bit/account_shop/main/docker-compose.yml" -o ~/account_shop/docker-compose.yml
            # Tải các image mới nhất
            docker compose pull
            # Restart lại các service mà không tạo downtime
            docker compose up -d
            # Dọn dẹp các Docker image cũ/không dùng để giải phóng ổ cứng
            docker image prune -f
```

---

## 5. Script Thiết Lập Ban Đầu Cho VPS

Tệp này đặt tại: `scripts/setup-server.sh`
Giúp tự động cấu hình các thư mục cần thiết, đăng nhập GHCR và dừng các tiến trình không chạy bằng Docker (như file JAR hay Node truyền thống) chạy trực tiếp trên Host để tránh xung đột cổng (port conflict).

```bash
#!/bin/bash
set -e

# Định nghĩa màu hiển thị log
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Bước 1: Tạo cấu trúc thư mục
log_info "Tạo cấu trúc thư mục dự án tại ~/account_shop..."
mkdir -p ~/account_shop/account-shop
mkdir -p ~/account_shop/account-shop-web

# Bước 2: Di chuyển tệp .env cũ sang vị trí mới
log_info "Kiểm tra và chuẩn bị tệp .env..."
if [ -f ~/.env ]; then
    cp ~/.env ~/account_shop/account-shop/.env
    log_success "Đã đưa tệp backend .env về vị trí ~/account_shop/account-shop/.env"
fi

if [ ! -f ~/account_shop/account-shop-web/.env ]; then
    cat > ~/account_shop/account-shop-web/.env << 'EOF'
NEXT_PUBLIC_API_URL=https://vinatechsmartmanufacturing.site
SERVER_API_URL=http://localhost:8080
EOF
    log_success "Đã tạo cấu hình mặc định cho frontend .env"
fi

# Bước 3: Dừng các tiến trình cũ chạy trực tiếp (non-Docker)
log_info "Dọn dẹp các dịch vụ cũ đang chạy trên VPS..."
if pgrep -f "account-shop.*\.jar" > /dev/null 2>&1; then
    pkill -f "account-shop.*\.jar" && sleep 2
    log_success "Đã tắt tiến trình Spring Boot JAR cũ"
fi

if pgrep -f "node.*server.js\|npm.*start\|next start" > /dev/null 2>&1; then
    pkill -f "node.*server.js\|npm.*start\|next start" && sleep 2
    log_success "Đã tắt tiến trình Node.js cũ"
fi

log_success "VPS đã sẵn sàng nhận deploy từ Docker Compose!"
```

---

## 6. Hướng Dẫn Triển Khai (Các Bước Setup Thực Tế)

### Bước 1: Cài đặt Docker & Docker Compose V2 trên VPS
Chạy lệnh sau trên VPS (hệ điều hành Ubuntu/Debian):
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# Cài đặt Docker Compose CLI Plugin trực tiếp từ Github
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Kiểm tra thành công
docker compose version
```

### Bước 2: Đăng nhập vào GHCR trên VPS
Tạo một **GitHub Personal Access Token (PAT)** có quyền `read:packages` từ tài khoản GitHub cá nhân của bạn, sau đó đăng nhập trên VPS:
```bash
docker login ghcr.io -u dat64-bit
# Khi được hỏi Password, hãy paste đoạn mã PAT của bạn vào
```

### Bước 3: Cấu hình GitHub Secrets trên Repository
Vào mục **Settings -> Secrets and variables -> Actions -> New repository secret** trên repo GitHub của bạn và thêm 3 giá trị:
- `VPS_HOST`: Địa chỉ IP của VPS (`159.223.63.176`)
- `VPS_USERNAME`: `root`
- `VPS_PASSWORD`: Mật khẩu của tài khoản `root` VPS.

### Bước 4: Upload file `docker-compose.yml` lên VPS
Chạy lệnh này từ máy máy tính cá nhân của bạn (Local) qua terminal để tải file Compose lên đúng thư mục dự án trên VPS:
```powershell
scp d:\shop\account-shop\account_shop\docker-compose.yml root@159.223.63.176:~/account_shop/docker-compose.yml
```

### Bước 5: Chạy ứng dụng lần đầu tiên
Khi Pipeline CI/CD trên GitHub đã hoàn tất thành công, bạn SSH vào VPS và kích hoạt container lên:
```bash
cd ~/account_shop
docker compose pull
docker compose up -d
```
Kiểm tra trạng thái bằng lệnh: `docker compose ps` hoặc xem log với lệnh: `docker compose logs -f`.

---
*Ghi chú: Để tinh chỉnh, hãy cập nhật lại các biến môi trường cấu hình domain, IP, hoặc cổng kết nối phù hợp với môi trường dự án của bạn.*
