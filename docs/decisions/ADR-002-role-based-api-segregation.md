# ADR-002: Role-Based API Segregation

## Status
Accepted

## Date
2026-05-19

## Context
As the Account Shop application grows, the number of endpoints for viewing products, making purchases, managing inventory, and handling support tickets increases. Mixing administrative endpoints with public or user-facing endpoints within the same controllers or under the same URL paths creates a significant security risk. A misconfigured Spring Security rule could accidentally expose sensitive Admin operations (like inventory management or user suspension) to regular users.

We need a structured way to design and organize our APIs that minimizes the risk of accidental exposure and makes the system easier to secure and maintain.

## Decision
We will enforce a strict **Role-Based API Segregation** strategy using distinct path prefixes and controller boundaries.

### API Boundaries
The API will be divided into three distinct zones:

1. **Public Zone (`/api/public/**`)**
   - **Purpose:** Endpoints accessible to anyone, authenticated or not.
   - **Examples:** Viewing the product catalog, reading categories.
   - **Security:** No JWT token required.

2. **User Zone (`/api/user/**`)**
   - **Purpose:** Endpoints for authenticated customers to perform actions on their own data.
   - **Examples:** Creating an order, viewing personal order history, submitting a support ticket, resetting a password.
   - **Security:** Requires a valid JWT token. Security rules must ensure the user can only access data belonging to their user ID (e.g., cannot view someone else's orders).

3. **Admin Zone (`/api/admin/**`)**
   - **Purpose:** Endpoints for shop administrators to manage the platform.
   - **Examples:** CRUD operations on products/categories, inventory bulk imports, viewing all users, resolving support tickets, viewing dashboard analytics.
   - **Security:** Requires a valid JWT token AND the `ADMIN` role.

### Implementation Guidelines
- **Controller Segregation:** Controllers should be dedicated to a specific zone. For example, `AdminController` handles all `/api/admin/*` endpoints, while `CatalogController` might handle `/api/public/catalog/*`.
- **Spring Security Configuration:** The `SecurityConfig` should rely heavily on these path prefixes to apply coarse-grained authorization rules (e.g., `.requestMatchers("/api/admin/**").hasRole("ADMIN")`). This makes the security configuration easy to read and audit.

## Alternatives Considered

### Attribute-Based Access Control (ABAC) on a Shared API
- **Pros:** Highly granular, allows a single endpoint (e.g., `GET /orders`) to return different data based on who is asking.
- **Cons:** Extremely complex to implement correctly. It's easy to make a mistake in the service layer logic that leaks data. Harder to audit than URL-based path rules.
- **Rejected:** Path segregation is simpler, more explicit, and less error-prone for our current scale.

## Consequences
- Developers must carefully choose the correct namespace (`/public`, `/user`, `/admin`) when creating new endpoints.
- We might have duplicate DTOs or slightly overlapping controller logic if an Admin needs to view the same entity as a User but with more sensitive fields included (e.g., `AdminProductDTO` vs `PublicProductDTO`). This duplication is an acceptable trade-off for security and clarity.
