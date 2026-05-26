# VanDatPremium Shop - Development Guidelines

This file serves as the core context and rulebook for the AI agent working on this repository.

## 🏗️ Project Architecture
This repository contains two main subsystems:
- **Backend (`/account-shop`)**: Java (Spring Boot), Spring Security (JWT Authentication), Hibernate/JPA.
- **Frontend (`/account-shop-web`)**: Next.js (App Router), React, Vanilla CSS, TypeScript.
  - **Admin Area (`/src/app/admin`)**: Phân rã thành các route con `/users`, `/products`, `/plans`, `/inventory`, `/orders`, `/transactions`, và `/tickets` thay vì sử dụng monolithic page (Xem ADR-006).

## 🚀 Commands
- **Backend Dev**: `cd account-shop && .\mvnw.cmd spring-boot:run`
- **Frontend Dev**: `cd account-shop-web && npm run dev`
- **Database**: SQL Scripts stored in `ShopAccountDB_V1.sql`

## 🎨 UI/UX Design Conventions (Frontend)
- **Premium Aesthetics**: Maintain a professional, high-quality "Dashboard" look. Use smooth micro-animations (`animate-in`, `zoom-in`, `slide-in-from-right`), appropriate shadows, and clear typography.
- **CSS Standardization (See ADR-004)**: Avoid inline styles and ad-hoc utility classes. All admin table containers, tables, badges, and action buttons must use standardized `.admin-*` classes defined in `globals.css`.
- **Table Cell & Row Alignment (See ADR-004)**: Never apply `display: flex` directly to a `td` cell wrapper as it breaks vertical row alignment. Wrap action buttons inside a `.admin-table-actions` container inside the cell instead.
- **In-Page Dashboard Navigation (See ADR-005)**: Replace large overlay modals for complex edit/view tasks with a local view state machine (`'list' | 'details' | 'form'`), rendering details and workspaces directly in-page.
- **Modals & Toasts**: Do not use native browser `alert()` or `confirm()`. Use the custom `admin-modal-overlay` and `admin-toast-container` components (See ADR-003).
- **Z-Index & Overflows (See ADR-003)**: Always ensure fixed elements (like Toasts) are placed at the root level of the component (e.g., wrapping the return in a React Fragment `<>...</>`) to prevent clipping by parent containers that use `overflow: hidden` or CSS transforms.
- **Role-Based Routing**: Frontend role check phải dùng giá trị **có prefix `ROLE_`** (vì Spring Security thêm tự động). Ví dụ: `user.role === 'ROLE_ADMIN'`, **không phải** `'ADMIN'`. Admin được điều hướng đến `/admin`, Customer đến `/dashboard`.

## ⚙️ Backend & API Conventions
- **Role-Based API Segregation (See ADR-002)**:
  - `/api/public/**`: Open access (e.g., viewing catalog).
  - `/api/user/**`: Requires JWT. Customer actions on their own data.
  - `/api/admin/**`: Requires JWT + `ADMIN` role. Shop management.
- **Security — JwtAuthFilter (See ADR-007)**: `JwtAuthFilter` phải là `@Bean` tường minh trong `SecurityConfig`, **không được dùng `@Component`**. Nếu dùng `@Component`, Spring Boot sẽ tự đăng ký filter như một servlet filter thông thường ngoài security chain, gây ra việc `SecurityContext` bị reset → 401 Unauthorized dù token hợp lệ.
- **Security — DaoAuthenticationProvider (See ADR-007)**: Phải khai báo tường minh `DaoAuthenticationProvider` bean trong `SecurityConfig` và wire vào `filterChain` bằng `.authenticationProvider(...)`. Nếu không, `AuthenticationManager` mặc định của Spring sẽ không biết dùng `CustomUserDetailsService` hay `BCryptPasswordEncoder` → "Bad credentials".
- **Security — Password Hash**: Mọi password trong DB phải được encode bằng BCrypt. Dùng `BCryptPasswordEncoder.encode()` để generate hash khi seed data. Không bao giờ lưu plaintext.
- **Security — JWT Role Claim (See ADR-007 Addendum)**: `JwtTokenProvider.generateToken()` **phải embed claim `role`** (lấy từ `getAuthorities()`) vào token. Nếu không, `user.role` ở frontend luôn là `undefined`, mọi role-check đều fail. Sau khi sửa file này phải **restart backend hoàn toàn** và user phải **đăng xuất + đăng nhập lại** để nhận token mới.
- **Responses**: Controllers should return standardized DTOs (e.g., `UserDTO`, `AdminDashboardDTO`).
- **Validation**: Validate external input at controller boundaries before passing to services.

## 📐 Architectural Decisions & Patterns
- **Hybrid Product Fulfillment (See ADR-001)**: Products support both "Instant Delivery" (pre-created accounts allocated automatically) and "On-Demand" (user provides email, Admin fulfills manually). Check `isContactSeller` and `isInputEmailRequired` flags on `Product`.
- **Action Confirmation & Guards (See ADR-003)**: Require multi-step confirmation modals for high-impact actions. Implement interface and logic constraints to block Admin status mutations.
- **Consolidated Subscription & Product Management (See ADR-005)**: Manage product subscription packages directly inside the side-by-side product details workspace instead of utilizing a separate plan management page.
- **Admin Modularization & Multi-channel Support (See ADR-006)**: Separate the Admin Area into distinct page modules using Next.js routing instead of client-state tabs. Implement category toggle switches and a seamless Ticket-to-Chat support workflow.
- **Unified Inventory Management & Multi-purpose Modal (See ADR-008)**: Quản lý kho hàng (Nhập kho, Chỉnh sửa, Cập nhật trạng thái) được thiết kế tập trung tại trang `/admin/inventory`. Tái sử dụng một Modal Form đa năng cho cả hai chế độ Thêm mới và Chỉnh sửa nhằm tối giản hóa mã nguồn. Khi Chỉnh sửa tài khoản, bắt buộc khóa/ẩn trường Số lượng Slot để đảm bảo tính toàn vẹn dữ liệu của cấu trúc profiles dùng chung.

# Comprehensive AI Agent Execution & Safety Rules

## 1. Cognitive Framework & Session Management
- **Think Before Coding:** Don't assume. Don't hide confusion. Surface tradeoffs. State your assumptions explicitly. If multiple interpretations exist, present them. If a simpler approach exists, say so. If something is unclear, stop and ask.
- **Context Awareness:** Always begin a new task by reviewing the project structure and explicitly stating your understanding of the goal. Treat each user prompt as a step in a traceable session. Focus strictly on the current task scope.
- **Goal-Driven Execution:** Transform tasks into verifiable goals (e.g., "Fix the bug" → "Verify logic, write the fix, check if UI reflects changes"). For multi-step tasks, state a brief plan and verify each step before proceeding.

## 2. Coding Principles & Modifying Code
- **Simplicity First:** Write the minimum code that solves the problem. No speculative features, no unrequested abstractions, and no extra "flexibility." If you write 200 lines and it could be 50, rewrite it.
- **Surgical Changes:** Touch only what you must. Clean up only your own mess. Do not "improve" adjacent code, comments, or formatting unless explicitly asked. Match existing style. Every changed line must trace directly to the user's request.
- **Safe Execution (Zero Overwrite Risk):** NEVER aggressively overwrite or delete existing working code. When making complex logic changes, provide the code as a diff, or suggest creating a temporary branch/file for review before applying it directly.

## 3. Observability, Safety & Human-in-the-Loop (HITL)
- **Mandatory "Think Aloud" (Tracing):** Before calling any MCP server, external tool, or terminal command, you MUST output a brief "Plan:" or "Thought:" detailing exactly what you are about to do and why.
- **Error Handling:** If a command or tool call fails, analyze the error log, state the reason for the failure, and propose a specific fix before retrying.
- **Human-in-the-Loop (HITL):** PAUSE execution and explicitly ask for user approval BEFORE performing high-risk actions such as:
  1. Executing database migrations, mutations, or data drops (e.g., `DROP`, `DELETE`).
  2. Running destructive terminal commands (e.g., `rm -rf`, `git reset --hard`).
  3. Pushing code to remote repositories.
  4. Deleting environment variables or core configuration files.
  *Format:* "⚠️ **REQUIRES APPROVAL:** [Describe action]. Proceed? (Y/N)"

## 4. Documentation, Planning & Architectural Decisions (ADR)
- **Persistent Documentation:** All specifications, deployment plans, and Architectural Decision Records (ADRs) must be created and updated directly within the project's designated documentation folders (e.g., `docs/decisions/` or specific markdown files within the codebase), NOT in the AI agent's temporary directories. This ensures long-term design history for human review.
- **Mandatory Implementation Plan:** When creating or reviewing a specification, the AI agent MUST automatically generate or update an `implementation_plan.md` file and submit it for user approval BEFORE writing any source code.

---
*Note: This file is automatically loaded as context. Always refer back to these rules before starting a complex task.*

