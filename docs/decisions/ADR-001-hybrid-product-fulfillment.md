# ADR-001: Hybrid Product Fulfillment Model

## Status
Accepted

## Date
2026-05-19

## Context
The Account Shop needs to sell various types of digital products. Some products, like pre-created Netflix or Spotify accounts, can be delivered immediately upon payment. Other products, like upgrading a user's existing account to Premium, require the user to provide their account details (e.g., email address) during or after checkout, and then an Admin must manually fulfill the order. 

We need a flexible data model and fulfillment workflow that supports both scenarios without hardcoding specific logic for each product type.

## Decision
We will implement a **Hybrid Product Fulfillment Model** based on product configuration flags.

### Data Model Changes
The `Product` entity will include configuration flags:
- `isContactSeller`: Boolean indicating if the product requires manual communication.
- `isInputEmailRequired`: Boolean indicating if the user MUST provide their email/account details to receive this specific product.

### Workflow: Instant Delivery (Pre-created Accounts)
1. Admin uploads pre-created accounts (email, password, slots) to the `AccountItem` inventory table linked to a `productId`.
2. User purchases the product.
3. System automatically allocates an `AccountItem` (or a specific slot) with status "Sẵn sàng" (Available) to the user's order.
4. The allocated `AccountItem` is marked as "Đã bán" (Sold) or "In Use".
5. User immediately receives the account credentials in their order history.

### Workflow: On-Demand Fulfillment (Requires User Input)
1. Product is configured with `isInputEmailRequired = true`.
2. User purchases the product and is prompted to enter their target email address during checkout.
3. The order is created with status "Chờ xử lý" (Pending). No inventory is automatically allocated.
4. Admin sees the pending order and the user's provided email.
5. Admin manually upgrades the user's account outside the system.
6. Admin updates the order status to "Hoàn thành" (Completed).

## Alternatives Considered

### Separate Product Types (Entities)
- **Pros:** Strong typing, distinct workflows are hardcoded and explicit.
- **Cons:** Increases database complexity (multiple tables or complex inheritance), makes the UI harder to build dynamically, and reduces flexibility if a product changes its fulfillment method.
- **Rejected:** Too rigid for an e-commerce platform that might introduce new fulfillment types later.

## Consequences
- The frontend must dynamically adjust the checkout flow based on the `Product`'s flags (e.g., showing an input field if `isInputEmailRequired` is true).
- The backend order processing logic needs to check these flags to decide whether to attempt automatic inventory allocation or simply create a pending order.
- Inventory management (`AccountItem`) is loosely coupled to `Product` and only utilized when applicable.
