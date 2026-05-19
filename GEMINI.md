# VanDatPremium Shop - Development Guidelines

This file serves as the core context and rulebook for the AI agent working on this repository.

## 🏗️ Project Architecture
This repository contains two main subsystems:
- **Backend (`/account-shop`)**: Java (Spring Boot), Spring Security (JWT Authentication), Hibernate/JPA.
- **Frontend (`/account-shop-web`)**: Next.js (App Router), React, Tailwind CSS, TypeScript.
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

## ⚙️ Backend & API Conventions
- **Role-Based API Segregation (See ADR-002)**:
  - `/api/public/**`: Open access (e.g., viewing catalog).
  - `/api/user/**`: Requires JWT. Customer actions on their own data.
  - `/api/admin/**`: Requires JWT + `ADMIN` role. Shop management.
- **Security — JwtAuthFilter (See ADR-007)**: `JwtAuthFilter` phải là `@Bean` tường minh trong `SecurityConfig`, **không được dùng `@Component`**. Nếu dùng `@Component`, Spring Boot sẽ tự đăng ký filter như một servlet filter thông thường ngoài security chain, gây ra việc `SecurityContext` bị reset → 401 Unauthorized dù token hợp lệ.
- **Security — DaoAuthenticationProvider (See ADR-007)**: Phải khai báo tường minh `DaoAuthenticationProvider` bean trong `SecurityConfig` và wire vào `filterChain` bằng `.authenticationProvider(...)`. Nếu không, `AuthenticationManager` mặc định của Spring sẽ không biết dùng `CustomUserDetailsService` hay `BCryptPasswordEncoder` → "Bad credentials".
- **Security — Password Hash**: Mọi password trong DB phải được encode bằng BCrypt. Dùng `BCryptPasswordEncoder.encode()` để generate hash khi seed data. Không bao giờ lưu plaintext.
- **Responses**: Controllers should return standardized DTOs (e.g., `UserDTO`, `AdminDashboardDTO`).
- **Validation**: Validate external input at controller boundaries before passing to services.

## 📐 Architectural Decisions & Patterns
- **Hybrid Product Fulfillment (See ADR-001)**: Products support both "Instant Delivery" (pre-created accounts allocated automatically) and "On-Demand" (user provides email, Admin fulfills manually). Check `isContactSeller` and `isInputEmailRequired` flags on `Product`.
- **Action Confirmation & Guards (See ADR-003)**: Require multi-step confirmation modals for high-impact actions. Implement interface and logic constraints to block Admin status mutations.
- **Consolidated Subscription & Product Management (See ADR-005)**: Manage product subscription packages directly inside the side-by-side product details workspace instead of utilizing a separate plan management page.
- **Admin Modularization & Multi-channel Support (See ADR-006)**: Separate the Admin Area into distinct page modules using Next.js routing instead of client-state tabs. Implement category toggle switches and a seamless Ticket-to-Chat support workflow.

## 🤖 Behavioral Guidelines (Core AI Rules)

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals (e.g., "Fix the bug" → "Verify logic, write the fix, check if UI reflects changes").
- For multi-step tasks, state a brief plan and verify each step.

---
*Note: This file is automatically loaded as context. Always refer back to these rules before starting a complex task.*
