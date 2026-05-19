# VanDatPremium Shop - Development Guidelines

This file serves as the core context and rulebook for the AI agent working on this repository.

## 🏗️ Project Architecture
This repository contains two main subsystems:
- **Backend (`/account-shop`)**: Java (Spring Boot), Spring Security (JWT Authentication), Hibernate/JPA.
- **Frontend (`/account-shop-web`)**: Next.js (App Router), React, Tailwind CSS, TypeScript.

## 🚀 Commands
- **Backend Dev**: `cd account-shop && .\mvnw.cmd spring-boot:run`
- **Frontend Dev**: `cd account-shop-web && npm run dev`
- **Database**: SQL Scripts stored in `ShopAccountDB_V1.sql`

## 🎨 UI/UX Design Conventions (Frontend)
- **Premium Aesthetics**: Maintain a professional, high-quality "Dashboard" look. Use smooth micro-animations (`animate-in`, `zoom-in`, `slide-in-from-right`), appropriate shadows, and clear typography.
- **Modals & Toasts**: Do not use native browser `alert()` or `confirm()`. Use the custom `admin-modal-overlay` and `admin-toast-container` components (See ADR-003).
- **Z-Index & Overflows (See ADR-003)**: Always ensure fixed elements (like Toasts) are placed at the root level of the component (e.g., wrapping the return in a React Fragment `<>...</>`) to prevent clipping by parent containers that use `overflow: hidden` or CSS transforms.

## ⚙️ Backend & API Conventions
- **Role-Based API Segregation (See ADR-002)**:
  - `/api/public/**`: Open access (e.g., viewing catalog).
  - `/api/user/**`: Requires JWT. Customer actions on their own data.
  - `/api/admin/**`: Requires JWT + `ADMIN` role. Shop management.
- **Security**: `JwtAuthFilter` correctly parses tokens before reaching controllers.
- **Responses**: Controllers should return standardized DTOs (e.g., `UserDTO`, `AdminDashboardDTO`).
- **Validation**: Validate external input at controller boundaries before passing to services.

## 📐 Architectural Decisions & Patterns
- **Hybrid Product Fulfillment (See ADR-001)**: Products support both "Instant Delivery" (pre-created accounts allocated automatically) and "On-Demand" (user provides email, Admin fulfills manually). Check `isContactSeller` and `isInputEmailRequired` flags on `Product`.
- **Action Confirmation & Guards (See ADR-003)**: Require multi-step confirmation modals for high-impact actions. Implement interface and logic constraints to block Admin status mutations.

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
