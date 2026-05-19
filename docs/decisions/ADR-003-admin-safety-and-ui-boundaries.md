# ADR-003: Admin Action Confirmation Flows and UI Boundary Safeguards

## Status
Accepted

## Date
2026-05-19

## Context
As the administration dashboard grew, several problems emerged related to administrative operations:
1. **Accidental Actions**: Admins could trigger high-impact actions (such as locking user accounts or disabling products) with a single click, leading to unintended service disruptions.
2. **UI Clipping (Toast/Modal Hidden)**: Toast notifications and overlays were occasionally clipped or displaced. This was caused by rendering floating elements (`position: fixed`) inside parent containers (like table wrappers) that possessed CSS `transform` properties (e.g. from page entrance animations) or `overflow: hidden`.
3. **Admin Lockout Risks**: There was no safeguard in place to prevent an Admin from locking another Admin (or self-locking), creating a vulnerability that could result in total system lockout.

## Decision
We will implement standardized confirmation flows, strict DOM boundaries for overlay components, and administrative role protections.

### 1. Standardized Confirmation Modals
All high-impact status changes (Locking/Unlocking users, Archiving products) must be gated by a standardized Confirmation Modal. 
- The modal layout is structured dynamically based on target severity:
  - **Warnings (e.g., Locking, Disabling)**: Orange warning triangle icon, danger-themed confirm button.
  - **Informational (e.g., Unlocking, Enabling)**: Blue info circle icon, standard accent confirm button.
- Native browser `alert()` or `confirm()` are strictly forbidden.

### 2. Floating Overlay DOM Isolation
All floating UI overlays, including `admin-toast-container` and `admin-modal-overlay`, must be rendered at the root level of the page component (e.g. using React Fragments `<> ... </>`) rather than within nested table or card containers.
- This ensures that `position: fixed` elements do not form a new containing block inside parent containers that use CSS transforms, transitions, or `overflow: hidden`, preventing clipping.

### 3. Administrative Role Safeguard
The User Management dashboard must prevent any lock/unlock actions on users with the `ADMIN` role.
- **UI Guard**: The lock/unlock button is replaced with a read-only "Quản trị viên" label for accounts identified with `user.roleName === 'ADMIN'`.
- **Logic Guard**: The execution methods (`executeToggleStatus`) will check the role of the target user and abort/toast an error if they possess the `ADMIN` role.

## Alternatives Considered

### Global React Portals for Modals/Toasts
- **Pros**: Completely guarantees elements are attached to `document.body`, eliminating any container styling issues.
- **Cons**: Adds extra state management or layout complexity (requiring wrapper providers at `layout.tsx`).
- **Decision**: Deferred for standard root-level component rendering since pages are modular enough. If layout hierarchies become deeply nested, we will transition to React Portals.

## Consequences
- Modals require state hooks (`pendingUser`, `setPendingUser`) to manage visibility locally in the page component.
- Improved UX reliability; Toast notifications are guaranteed to render at the top-right viewport regardless of table scroll state.
- Security-by-design against accidental lockout of administrative accounts.
