# =============================================================
# Stage 1: Cài dependencies
# =============================================================
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# =============================================================
# Stage 2: Build Next.js production
# =============================================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Truyền API URL vào build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# =============================================================
# Stage 3: Runtime — chỉ giữ standalone output (~150MB)
# =============================================================
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
