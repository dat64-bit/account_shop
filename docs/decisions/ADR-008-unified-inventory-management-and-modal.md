# ADR-008: Unified Inventory Management and Multi-purpose Modal

## Status
Accepted

## Date
2026-05-25

## Context
The Admin area requires complete lifecycle management of inventory items (`account_item`). This includes importing new accounts, editing existing credentials (e.g., email or password typos), and mutating their availability status (e.g., setting an account to Faulty or marking it Available again). 

To prevent code duplication, adhere to the "Simplicity First" rule, and provide a premium, seamless user experience, we need a unified pattern for handling both creation and modification operations on the `/admin/inventory` page.

## Decision
We will implement a **Unified Inventory Management** flow using a **Multi-purpose Modal** and a new backend update endpoint.

### 1. Multi-purpose Modal Form (Frontend)
Instead of creating a separate edit modal or a dedicated details sub-page, we will upgrade the existing "Import Inventory" modal:
- **Dual-mode State**: Driven by an `editingItem` state. If `editingItem` is null, the modal operates in **Create Mode**. Otherwise, it operates in **Edit Mode**.
- **Dynamic Fields**:
  - **Slot Quantity (`maxSlots`)**: Only visible/enabled in **Create Mode**. When editing, this field is hidden to prevent users from altering the predefined profile slot structure, ensuring database integrity.
  - **Account Status (`itemStatusId`)**: Only visible/enabled in **Edit Mode**. Allows Admins to toggle the status between *Available (1)*, *Sold (2)*, and *Faulty (3)*.
  - **Product & Category Status Visibility**: Selecting a product in the dropdown dynamically displays its status (Active, Inactive, Out of Stock) and whether its category is active. This prevents importing inventory for inactive catalogs.
- **Dynamic API Binding**: Submitting the form triggers a `POST` request to `/api/admin/inventory` in Create Mode, and a `PUT` request to `/api/admin/inventory/{id}` in Edit Mode.

### 2. Backend Inventory Modification API
We will add a new `PUT` endpoint to the Admin controller to handle updates securely:
- **Endpoint**: `PUT /api/admin/inventory/{id}`
- **Security**: Requires JWT and `ADMIN` role.
- **DTO**: Uses `InventoryRequest` to encapsulate `productId`, `emailOrUsername` (mapped to `accountEmail`), `password` (mapped to `accountPassword`), and `itemStatusId`.

## Alternatives Considered

### Separate Edit Page or Dedicated Modal
- **Pros:** Clear separation of concerns in code.
- **Cons:** High duplicate HTML/CSS for identical form fields (Email, Password, Product selection). Violates the DRY (Don't Repeat Yourself) principle and increases complexity.
- **Rejected:** Creating separate files or modals would write twice as much code for a very simple set of fields, increasing maintenance overhead.

## Consequences
- Code footprint in [page.tsx](file:///d:/shop/account-shop/account_shop/account-shop-web/src/app/admin/inventory/page.tsx) remains minimal and clean, following Vanilla CSS standards.
- Preset profile slot counts for shared accounts are protected from accidental modifications.
- API endpoints are structured cleanly using restful methods (`POST` for creation, `PUT` for updates, and `DELETE` for removal).
