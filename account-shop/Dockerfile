# =============================================================
# Stage 1: Build — Dùng Maven + JDK 21 để build JAR
# =============================================================
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml trước để cache dependency layer (không cần re-download khi chỉ đổi code)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source và build
COPY src ./src
RUN mvn package -DskipTests -B

# =============================================================
# Stage 2: Runtime — Chỉ giữ JRE (nhẹ hơn ~300MB)
# =============================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
