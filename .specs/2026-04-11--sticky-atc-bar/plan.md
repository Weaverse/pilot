# Implementation Plan: Sticky Add-to-Cart Bar

## Context

When users scroll past the ATC button on the product page, they lose access to the purchase action. A sticky bottom bar that appears when the ATC button scrolls out of view provides a persistent way to add to cart without scrolling back up. Especially important on mobile where the ATC button scrolls away quickly.

## Approach

### 1. Create a visibility store + IntersectionObserver in existing ATC component

**File**: `app/sections/main-product/product-atc-buttons.tsx`

- Create and export a zustand store `useATCVisibilityStore` with a boolean `isVisible` flag
- Use `useInView` from `react-intersection-observer` on the existing ATC container div
- When the ATC button is NOT in view → set `isVisible: false` (meaning the original is hidden, so show sticky)
- Follow existing store patterns (`useProductQtyStore`, `useCartDrawerStore`)

### 2. Create the Sticky ATC Bar component

**File**: `app/components/product/sticky-atc-bar.tsx` (new)

A fixed bottom bar that shows when the original ATC is out of viewport. Contains:
- Product image (variant image or first media)
- Product title (truncated)
- Variant price (reuse `VariantPrices` component)
- Add to Cart button (reuse `AddToCartButton` component)

Data access:
- `useLoaderData` → `product`, `storeDomain`
- `useOptimisticVariant` → selected variant
- `useProductQtyStore` → quantity
- `useATCVisibilityStore` → show/hide

Styling:
- `fixed bottom-0 left-0 right-0 z-50` positioning
- Slide-up/down animation via Tailwind `translate-y` + `transition`
- Background with border-top for visual separation

### 3. Render from ATC buttons component with toggle setting

**File**: `app/sections/main-product/product-atc-buttons.tsx`

Add a `showStickyBar` switch to the schema settings. When enabled, render `<StickyATCBar />` inside the `ProductATCButtons` component, passing the configured button text props (`addToCartText`, `addBundleToCartText`). This makes the sticky bar a merchant-configurable setting in the Weaverse editor rather than a hardcoded route-level component.

## Files touched

| File | Action |
|------|--------|
| `app/sections/main-product/product-atc-buttons.tsx` | Modify — add IntersectionObserver + export visibility store + `showStickyBar` toggle + render `StickyATCBar` |
| `app/components/product/sticky-atc-bar.tsx` | Create — new sticky bar component (accepts text props) |
| `app/routes/products/product.tsx` | No longer modified — sticky bar moved to ATC buttons component |

## Reusable components/utilities

- `AddToCartButton` from `~/components/product/add-to-cart-button`
- `VariantPrices` from `~/components/product/variant-prices`
- `useProductQtyStore` from `~/sections/main-product/product-quantity-selector`
- `useOptimisticVariant`, `getAdjacentAndFirstAvailableVariants` from `@shopify/hydrogen`
- `create` from `zustand`
- `useInView` from `react-intersection-observer`

## Verification

1. Run `nr typecheck` — no type errors
2. Start dev server, navigate to a product page
3. Scroll past the ATC button — sticky bar should slide up from the bottom
4. Scroll back up — sticky bar should slide down and disappear
5. Click ATC on sticky bar — should add to cart and open cart drawer
6. Change variant — sticky bar should reflect updated variant/price
7. Test on mobile viewport — bar should be compact and usable
