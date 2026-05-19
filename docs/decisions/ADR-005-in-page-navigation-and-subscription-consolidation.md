# ADR-005: In-Page Navigation and Consolidated Product/Subscription Details View

## Status
Accepted

## Date
2026-05-19

## Context
1. **Modal/Popup Overuse**: Previously, product details, creation, editing, and pricing configuration were heavily reliant on floating overlay modal popups. This resulted in cramped workspaces, poor readability of detailed fields (such as descriptions and image URLs), and a disjointed user experience due to constant modal trigger/close cycles.
2. **Scattered Subscription Plan Management**: Initially, subscription plans and products were managed as separate menu items on the sidebar. Since plans are highly product-specific in our hybrid product fulfillment model (mapping billing durations and prices directly to accounts or slots), forcing the administrator to navigate to a separate plans management dashboard to configure pricing packages for a product was inefficient and error-prone.

## Decision
We will modernize the Admin Product Management interface by replacing floating dialogs with a declarative in-page navigation system and integrating subscription pricing management directly into a unified product-centric layout.

### 1. In-Page View State Machine
We replaced the complex modal states with a local view state machine (`view === 'list' | 'details' | 'form'`):
- **`'list'` (Overview)**: Displays the standardized table of products.
- **`'details'` (Dashboard)**: Renders a premium side-by-side details dashboard for the selected product and its plans.
- **`'form'` (Form Workspace)**: Offers a clean, full-width workspace for adding or editing product attributes (name, description, image URL, contact/fulfillment requirements).

### 2. Consolidated Subscription Management
We removed the separate "Plans" route from the Sidebar. All subscription plan configurations are now embedded directly inside the product's `'details'` view:
- **Product Metadata (Left Column)**: Renders a sticky information panel containing the product image, description box, fulfillment indicators, and status switches.
- **Billing packages / Prices (Right Column)**: Renders a dedicated "Bảng giá Niêm yết" (Pricing and Subscriptions) table listing all billing durations (e.g., 30 days, 180 days, 365 days) configured for this specific product, along with actions to add, edit, or toggle the status of each pricing plan.

### 3. Premium Layout & Custom CSS Polish
To maintain a high-quality dashboard aesthetic, we implemented scoped CSS components (`.details-view-container`, `.details-header-premium`, `.details-main-grid`) in `globals.css`:
- **Header Actions**: Action buttons use clear button-styles with functional SVG icons (Sửa thông tin, Dừng kinh doanh) rather than raw text links.
- **Action Triggers**: Table action buttons (Edit, Toggle) are hidden by default and fade in on row hover (`table tr:hover .table-actions-group`) to keep the interface clean and clutter-free.
- **Empty States**: Interactive, user-friendly empty states guide administrators to configure pricing plans when a product has no billing setup.

## Alternatives Considered

### Dedicated Sub-routes (e.g., Next.js `/admin/products/[id]/plans`)
- **Pros**: Clean browser URLs, shareable deep links, and isolation of route concerns.
- **Cons**: Increased directory structure complexity, extra layout/page boilerplate, and higher page loading/transition latency compared to local state-based rendering.
- **Decision**: Rejected in favor of client-side `useState` rendering to ensure instantaneous, snappy view transitions.

### Keeping Modal Popups with Restructured Widths
- **Pros**: Quick to implement.
- **Cons**: Still obstructs list context, restricts layout flexibility on medium screens, and fails to resolve the disjointed UX of managing plans away from the product info.
- **Decision**: Rejected.

## Consequences
- **Workflow Efficiency**: Admins can now view a product's metadata and manage its pricing packages in a single step without navigating away or closing overlays.
- **Navigation Cleanup**: The Sidebar is cleaner and easier to navigate due to the removal of the redundant plans page.
- **Component State Management**: The `page.tsx` now handles loading/saving logic for both products and their subscriptions synchronously based on view states.
