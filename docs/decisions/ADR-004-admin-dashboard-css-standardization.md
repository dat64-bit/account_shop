# ADR-004: Admin Dashboard CSS Standardization and Layout Alignment

## Status
Accepted

## Date
2026-05-19

## Context
As the administration dashboard grew across multiple pages (Products, Categories, Users, Inventory, Plans, Tickets, Transactions, Orders), inline CSS styles and ad-hoc utility classes led to:
1. **Style Duplication**: Similar table views, button sizes, and status badges were declared with conflicting inline layouts.
2. **Visual Inconsistencies**: Border widths, paddings, and color choices differed across pages, diminishing the "premium" aesthetic.
3. **Misalignment of Row Liners**: Placing flex layouts (`display: flex`) directly onto table cell (`<td>`) containers caused browsers to break the table row vertical centering, causing table border lines to mismatch or appear misaligned.

## Decision
We will enforce a standardized CSS component framework within `globals.css` using the `.admin-*` namespace, and separate layout/flex structures from table cell structural elements.

### 1. Standardized Admin Components (`globals.css`)
We introduced dedicated reusable classes for core layout patterns:
- **Table Containment**: `.admin-table-container` wraps responsive tables with custom borders, shadow tokens, and border radii.
- **Borders & Rows**: `.admin-table` resets spacing, sets standard column headers with `vertical-align: middle`, and defines row hover actions.
- **Badge Accents**: `.admin-badge` provides consistent, legible pills for statuses (`.success`, `.warning`, `.danger`, `.info`, `.secondary`).
- **Typography & Prices**: `.admin-text-bold` and `.admin-text-price` (monospace pricing displays) standardize textual layouts.

### 2. Table Action Cell Isolation
To fix row line alignment, the table cell wrapper (`td`) must remain a table element rather than becoming a flex container:
- **Cell Definition (`.admin-actions-cell`)**: Set to `vertical-align: middle; text-align: right; width: 1%; white-space: nowrap;`.
- **Inner Container (`.admin-table-actions`)**: A flex container (`display: flex; gap: 8px; justify-content: flex-end;`) resides *inside* the cell to align action buttons (`.btn-admin-action`) horizontally without breaking table layout engine geometry.

### 3. Action Buttons Layout (`.btn-admin-action`)
Standard button tokens (`.edit`, `.delete`, `.view`, `.lock`) define transition curves and soft backgrounds/borders to represent actions uniformly across pages.

## Alternatives Considered

### Tailwind Utility Over-reliance
- **Pros**: Quick inline edits without creating CSS rules.
- **Cons**: Substantially increases markup density, creates inconsistent rendering if utility classes are missed, and violates the user global constraint of "using CSS files to reuse style code rather than inline or ad-hoc utilities."
- **Decision**: Rejected in favor of standardized, scoped class names in `globals.css`.

## Consequences
- Clean, structural TSX files where UI classes map to semantic styles.
- Guaranteed line alignment across all browsers and screen widths.
- Easily customizable color palettes, spacing, and animations managed from a single source of truth in `globals.css`.
