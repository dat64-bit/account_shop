---
name: Account Shop Design System
description: The Modern Marketplace
colors:
  primary: "#3b82f6"
  primary-dark: "#2563eb"
  primary-light: "#eff6ff"
  secondary: "#eab308"
  accent: "#f59e0b"
  bg: "#f8fafc"
  bg-white: "#ffffff"
  text-main: "#0f172a"
  text-sub: "#475569"
  text-muted: "#94a3b8"
  border: "#e2e8f0"
typography:
  display:
    fontFamily: "var(--font-outfit), sans-serif"
  body:
    fontFamily: "var(--font-inter), sans-serif"
rounded:
  default: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg-white}"
    rounded: "{rounded.default}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-text:
    textColor: "{colors.text-main}"
    backgroundColor: "transparent"
---

# Design System: Account Shop

## 1. Overview

**Creative North Star: "The Modern Marketplace"**

This design system is built to balance a premium, trustworthy feel with a modern, dynamic shopping experience. It relies on a "Soft & Tactile" geometry—using generous 12px-16px corner radii and smooth, layered drop shadows to make actionable elements feel touchable and elevated. The color palette centers around "Trust Blue" to convey security and professionalism, paired with clean typography that ensures clarity above all else. It explicitly avoids messy layouts, playful fonts, and cluttered interfaces.

**Key Characteristics:**
- Soft & Tactile surfaces with clear elevation
- Trustworthy and professional "Trust Blue" anchoring
- Clean, breathable spacing
- Crisp typography pairing (Outfit for display, Inter for body)

## 2. Colors

The palette is anchored by a vibrant yet trustworthy blue, supported by clean neutrals and warm accents.

### Primary
- **Trust Blue** (#3b82f6): The core brand color, used for primary buttons, active states, and key highlights.
- **Trust Blue Dark** (#2563eb): Used for hover states on primary actions.
- **Trust Blue Light** (#eff6ff): A subtle tint used for active backgrounds and soft highlights.

### Secondary
- **Warning/Notice Gold** (#eab308): Used for badges (like the cart badge) or secondary calls to action.
- **Accent Orange** (#f59e0b): Warmth for specific highlights.

### Neutral
- **Background** (#f8fafc): The default app background.
- **Surface White** (#ffffff): Used for cards, headers, and elevated surfaces.
- **Text Main** (#0f172a): Primary reading text.
- **Text Sub** (#475569): Secondary text and descriptions.
- **Text Muted** (#94a3b8): Placeholders and disabled states.
- **Border** (#e2e8f0): Subtle dividers and structural outlines.

### Named Rules
**The One Voice Rule.** The primary accent (Trust Blue) is used deliberately for interaction and current state. Do not flood the screen with it; its rarity provides its power.

## 3. Typography

**Display Font:** Outfit (with sans-serif)
**Body Font:** Inter (with sans-serif)

**Character:** A crisp, modern pairing that balances the geometric, tech-forward feel of Outfit in headings with the highly readable, neutral structure of Inter for data and paragraphs.

### Hierarchy
- **Display** (Outfit): Used for the logo and major section headers (h1-h6).
- **Body** (Inter, 14px): The default reading size for all paragraphs and tables.
- **Label** (Inter, 12px-14px, 500-600 weight): Used for buttons (`.btn-primary`) and small UI controls.

### Named Rules
**The Readability Rule.** Never sacrifice contrast for style. Body text must maintain a minimum 4.5:1 contrast ratio against its background.

## 4. Elevation

This system uses a "Soft & Tactile" approach. Surfaces are clearly defined using smooth drop shadows and large border radii to make the interface feel touchable and premium.

### Shadow Vocabulary
- **Shadow Small** (`var(--shadow-sm)`): Used for standard product cards and low-elevation surfaces.
- **Shadow Medium/Large** (`var(--shadow-md)`, `var(--shadow-lg)`): Used for dropdowns or hovered cards.
- **Shadow Premium** (`var(--shadow-premium)`): Used for the sticky header when scrolled and critical overlays.

### Named Rules
**The Tactile Surface Rule.** Interactive components like cards and primary buttons should feel physically present. Use soft shadows (`shadow-sm`) at rest and elevate on hover.

## 5. Components

### Buttons
- **Shape:** Softly rounded (12px radius, `var(--radius)`).
- **Primary:** Trust Blue background, white text, 9px 18px padding.
- **Hover / Focus:** Deepens to Trust Blue Dark (`#2563eb`) with a smooth 0.2s transition.
- **Text Button:** Transparent background, dark text, darkens on hover with a light blue background tint.

### Cards / Containers
- **Corner Style:** Large radius (16px, `var(--radius-lg)`).
- **Background:** Surface White (`#ffffff`).
- **Shadow Strategy:** `shadow-sm` by default, often framed by a subtle 1px border (`var(--border)`).
- **Internal Padding:** Generous spacing to let content breathe.

### Inputs / Search Bar
- **Style:** 1.5px solid border, 12px radius, transparent background inside the input.
- **Focus:** Border shifts to Trust Blue (`var(--primary)`).

## 6. Do's and Don't's

Concrete guardrails to maintain the Modern Marketplace aesthetic.

### Do:
- **Do** use `var(--primary)` for primary actions and logical focus points.
- **Do** maintain a minimum 4.5:1 contrast ratio for all reading text.
- **Do** use 12px-16px border radii to keep the interface soft and tactile.

### Don't:
- **Don't** use playful, childish fonts or messy layouts.
- **Don't** use heavy, thick, or harsh black shadows; use the soft `var(--shadow-sm)` variables.
- **Don't** use highly saturated, colorful gradients for standard UI elements (save gradients only for rare "premium" highlights).
- **Don't** cram too many buttons into small spaces without proper hierarchy; avoid clunky Admin interfaces.
