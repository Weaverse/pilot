# Popup, Modal, Dialog, Drawer, and Dropdown Components - Border Radius Analysis

## Summary
This codebase uses **Radix UI primitives** for all UI components. All found popup/modal/dialog/drawer/dropdown/tooltip components are documented below.

---

## COMPONENTS FOUND

### 1. Tooltip Component
**File:** `app/components/tooltip.tsx`
**Component Type:** Tooltip (Radix UI)
**Border Radius Used:** None (no rounded classes found)
**Uses rounded-full:** No
**Notes:** Generic tooltip wrapper using Radix UI's `@radix-ui/react-tooltip`

### 2. Dropdown Menu (Desktop)
**File:** `app/components/layout/menu/dropdown-menu.tsx`
**Component Type:** Dropdown Menu (Radix UI DropdownMenu)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Desktop navigation dropdown menu using Radix UI's `@radix-ui/react-dropdown-menu`

### 3. Newsletter Popup
**File:** `app/components/root/newsletter-popup.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog)
**Border Radius Used:** 
- Line 129: `rounded-full` on close button
**Uses rounded-full:** Yes (on close button - should NOT be changed)
**Notes:** Marketing popup modal. Close button has `rounded-full` which must be preserved.

### 4. Cart Drawer
**File:** `app/components/cart/cart-drawer.tsx`
**Component Type:** Drawer/Slide-out Modal (Radix UI Dialog)
**Border Radius Used:** 
- Line 51: `rounded-full` on cart count badge
**Uses rounded-full:** Yes (on badge - should NOT be changed)
**Notes:** Side cart drawer. Badge element has `rounded-full` which must be preserved.

### 5. Mobile Menu
**File:** `app/components/layout/menu/mobile-menu.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog) with Collapsible submenu
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Mobile navigation using Radix UI Dialog + Collapsible for nested menus

### 6. Country Selector
**File:** `app/components/layout/country-selector.tsx`
**Component Type:** Popover (Radix UI Popover)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Two instances - one for sidebar, one for header. Both use Radix UI Popover.

### 7. Predictive Search
**File:** `app/components/layout/predictive-search/index.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Full-width search dialog that slides down from top

### 8. Quick Shop Modal
**File:** `app/components/product-card/quick-shop.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog)
**Border Radius Used:** 
- Line 181: `rounded-full` on quick shop button (when buttonType="icon")
- Line 232: `rounded-full` on close button
**Uses rounded-full:** Yes (on buttons - should NOT be changed)
**Notes:** Product quick view modal with optional drawer mode. Both modal and drawer variants supported.

### 9. Sort Dropdown
**File:** `app/components/product-grid/sort-dropdown.tsx`
**Component Type:** Dropdown Menu (Radix UI DropdownMenu)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Product listing sort dropdown using Radix UI DropdownMenu

### 10. Media Zoom Modal
**File:** `app/components/product-media/media-zoom.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog)
**Border Radius Used:** 
- Line 282: `rounded-full` on zoom button
**Uses rounded-full:** Yes (on zoom button - should NOT be changed)
**Notes:** Full-screen product media zoom modal with thumbnail gallery

### 11. Desktop Menu (Navigation)
**File:** `app/components/layout/menu/desktop-menu.tsx`
**Component Type:** Navigation Menu (Radix UI NavigationMenu)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Mega menu using Radix UI's NavigationMenu primitive

### 12. Account Modal
**File:** `app/routes/account/layout.tsx`
**Component Type:** Modal/Dialog (Radix UI Dialog)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Account page modal wrapper for nested routes (edit, address management)

### 13. Address Management Modal
**File:** `app/routes/account/address/index.tsx`
**Component Type:** Modal/Dialog (nested in account layout)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Address add/edit form rendered as modal via account layout

### 14. Product Card Options
**File:** `app/components/product-card/product-card-options.tsx`
**Component Type:** Tooltip (Radix UI Tooltip) + Swatch options
**Border Radius Used:** 
- Line 59: `rounded-full` on swatch button
- Line 70: `rounded-full` on image inside swatch
- Line 77: `rounded-full` on color swatch span
**Uses rounded-full:** Yes (on swatches - should NOT be changed)
**Notes:** Color swatch options with tooltips. Swatches use `rounded-full` for circular shape.

### 15. Product Option Values
**File:** `app/components/product/product-option-values.tsx`
**Component Type:** Select dropdown (Radix UI Select) + Tooltip + Swatches
**Border Radius Used:** 
- Line 100: `rounded-lg` on Select scroll down button
- Line 210: `rounded-full` on option swatch button
- Line 227: `rounded-full` on color swatch span
**Uses rounded-full:** Yes (on swatches - should NOT be changed)
**Notes:** Product variant options selector. Uses Radix UI Select + color swatches with rounded-full.

### 16. Cart Summary Dialogs
**File:** `app/components/cart/cart-summary-actions.tsx`
**Component Type:** Three Modals/Dialogs (Radix UI Dialog)
  - NoteDialog
  - DiscountDialog
  - GiftCardDialog
**Border Radius Used:** 
- Line 60 (NoteDialog): `rounded-full` on close button
- Line 161 (DiscountDialog): `rounded-full` on close button
- Line 268 (GiftCardDialog): `rounded-full` on close button
**Uses rounded-full:** Yes (all close buttons - should NOT be changed)
**Notes:** Three separate modal dialogs for cart interactions. All have `rounded-full` close buttons.

### 17. Filter Item Component
**File:** `app/sections/main-collection/filters/filter-item.tsx`
**Component Type:** Tooltip (Radix UI Tooltip) + Checkbox + Swatch filters
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Collection page filter with swatches and checkboxes. No direct border radius on components.

### 18. Product Collapsible Details
**File:** `app/sections/main-product/product-collapsible-details.tsx`
**Component Type:** Accordion (Radix UI Accordion)
**Border Radius Used:** None found
**Uses rounded-full:** No
**Notes:** Expandable product details using Radix UI Accordion

### 19. Root Layout
**File:** `app/root.tsx`
**Component Type:** TooltipProvider wrapper
**Border Radius Used:** None (only TooltipProvider wrapper)
**Uses rounded-full:** No
**Notes:** Global tooltip provider

---

## SUMMARY TABLE

| File | Component Type | Has Border Radius | Uses rounded-full | Critical |
|------|---|---|---|---|
| tooltip.tsx | Tooltip | No | No | - |
| dropdown-menu.tsx | Dropdown | No | No | - |
| newsletter-popup.tsx | Modal | Yes | Yes ✓ | PRESERVE |
| cart-drawer.tsx | Drawer | Yes | Yes ✓ | PRESERVE |
| mobile-menu.tsx | Modal+Collapsible | No | No | - |
| country-selector.tsx | Popover | No | No | - |
| predictive-search/index.tsx | Modal | No | No | - |
| quick-shop.tsx | Modal | Yes | Yes ✓ | PRESERVE |
| sort-dropdown.tsx | Dropdown | No | No | - |
| media-zoom.tsx | Modal | Yes | Yes ✓ | PRESERVE |
| desktop-menu.tsx | NavigationMenu | No | No | - |
| account/layout.tsx | Modal | No | No | - |
| account/address/index.tsx | Modal | No | No | - |
| product-card-options.tsx | Tooltip+Swatches | Yes | Yes ✓ | PRESERVE |
| product-option-values.tsx | Select+Tooltip+Swatches | Yes | Yes ✓ (Swatches) + rounded-lg | PRESERVE Swatches |
| cart-summary-actions.tsx | 3x Modal | Yes | Yes ✓ | PRESERVE |
| filter-item.tsx | Tooltip+Checkbox+Swatches | No | No | - |
| product-collapsible-details.tsx | Accordion | No | No | - |
| root.tsx | TooltipProvider | No | No | - |

---

## BORDER RADIUS CHANGES NEEDED

### Components with NO rounded-full (Can be changed):
1. `tooltip.tsx` - No styling needed
2. `dropdown-menu.tsx` - No border radius
3. `mobile-menu.tsx` - No border radius
4. `country-selector.tsx` - No border radius
5. `predictive-search/index.tsx` - No border radius
6. `sort-dropdown.tsx` - No border radius
7. `desktop-menu.tsx` - No border radius
8. `account/layout.tsx` - No border radius
9. `account/address/index.tsx` - No border radius
10. `filter-item.tsx` - No border radius
11. `product-collapsible-details.tsx` - No border radius
12. `root.tsx` - No styling needed

### Components with rounded-full (MUST PRESERVE):
1. ✓ `newsletter-popup.tsx` - Line 129 (close button)
2. ✓ `cart-drawer.tsx` - Line 51 (badge)
3. ✓ `quick-shop.tsx` - Lines 181, 232 (buttons)
4. ✓ `media-zoom.tsx` - Line 282 (zoom button)
5. ✓ `product-card-options.tsx` - Lines 59, 70, 77 (swatches)
6. ✓ `product-option-values.tsx` - Lines 210, 227 (swatches)
7. ✓ `cart-summary-actions.tsx` - Lines 60, 161, 268 (close buttons)

### Mixed Cases:
- `product-option-values.tsx` - Has `rounded-lg` on line 100 (Select scroll button) - this CAN be changed if needed

---

## Radix UI Primitives Used

- ✓ Dialog (Modals, Drawers, Popups)
- ✓ Popover (Country selector)
- ✓ DropdownMenu (Navigation dropdowns, sort)
- ✓ Tooltip (Product options, filters)
- ✓ Collapsible (Mobile menu, product details as accordion)
- ✓ Select (Product options)
- ✓ Accordion (Product details)
- ✓ NavigationMenu (Desktop mega menu)
- ✓ Checkbox (Address form, filters)

---

## Files to Review for Border Radius Updates

### Safe to Update (No rounded-full):
- `app/components/layout/menu/dropdown-menu.tsx` - Can add border radius
- `app/components/layout/country-selector.tsx` - Can add border radius (2 instances)
- `app/components/layout/predictive-search/index.tsx` - Can add border radius
- `app/components/product-grid/sort-dropdown.tsx` - Can add border radius
- `app/components/layout/menu/desktop-menu.tsx` - Can add border radius
- `app/routes/account/layout.tsx` - Can add border radius
- `app/components/tooltip.tsx` - Can add border radius

### DO NOT CHANGE (Contains rounded-full):
- `app/components/root/newsletter-popup.tsx`
- `app/components/cart/cart-drawer.tsx`
- `app/components/product-card/quick-shop.tsx`
- `app/components/product-media/media-zoom.tsx`
- `app/components/product-card/product-card-options.tsx`
- `app/components/product/product-option-values.tsx`
- `app/components/cart/cart-summary-actions.tsx`

