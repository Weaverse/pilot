# Implementation Plan: Sticky Add-to-Cart Bar

## Context

When users scroll past the ATC button on the product page, they lose access to the purchase action. A sticky bottom bar that appears when the ATC button scrolls out of view provides a persistent way to add to cart without scrolling back up. Especially important on mobile where the ATC button scrolls away quickly.

## Approach

### 1. Create a visibility store + IntersectionObserver in existing ATC component

**File**: `app/sections/main-product/product-atc-buttons.tsx`

- Create and export a zustand store `useATCVisibilityStore` with a boolean `inView` flag
- Use `useInView` from `react-intersection-observer` on the existing ATC container div
- When the ATC button is NOT in view → set `inView: false` (meaning the original is hidden, so show sticky)
- Follow existing store patterns (`useProductQtyStore`, `useCartDrawerStore`)

### 2. Create the Sticky ATC Bar component

**File**: `app/components/product/sticky-atc-bar.tsx` (new)

A fixed bottom bar that shows when the original ATC is out of viewport. Contains:
- Product image (variant image or first media, toggleable via `showImage`)
- Product title (truncated)
- Variant price (reuse `VariantPrices` component)
- Add to Cart button (reuse `AddToCartButton` component, smaller sizing)
- Combined variant selector dropdown (shows all variant combinations like "Red / L / Bold")
- Buy Now button (optional, redirects to checkout)

Data access:
- `useLoaderData` → `product`
- `useOptimisticVariant` + `getAdjacentAndFirstAvailableVariants` → selected variant + all variants
- `useProductQtyStore` → quantity
- `useATCVisibilityStore` → show/hide
- `useNavigate` → variant selection + buy now navigation

Width modes:
- `full`: `fixed bottom-0 left-0 right-0` — stretches edge-to-edge
- `narrow` (default): `fixed bottom-3 left-3 right-3 rounded-lg` — lifted with rounded corners

Styling:
- `bg-background` with shadow only (no border-top)
- Slide-up/down animation via Tailwind `translate-y` + `transition`
- Smaller button sizing (text-sm, py-2 px-3) vs main ATC

### 3. Render from ATC buttons component with dedicated settings group

**File**: `app/sections/main-product/product-atc-buttons.tsx`

Render `<StickyATCBar />` inside `ProductATCButtons`, controlled by a "Sticky bar" settings group:
- `showStickyBar` — toggle the sticky bar on/off (default: true)
- `stickyBarWidth` — "narrow" or "full" (default: "narrow"), conditional on showStickyBar
- `showStickyBarImage` — toggle product image (default: true), conditional on showStickyBar
- `showBuyNowButton` — toggle buy now button (default: false), conditional on showStickyBar
- `buyNowText` — customize buy now text (default: "Buy now"), conditional on showBuyNowButton

Button text (`addToCartText`, `addBundleToCartText`) is shared from the "General" settings group.

## Files touched

| File | Action |
|------|--------|
| `app/sections/main-product/product-atc-buttons.tsx` | Modify — add IntersectionObserver + visibility store + "Sticky bar" settings group + render `StickyATCBar` |
| `app/components/product/sticky-atc-bar.tsx` | Create — sticky bar component with variant selector, width modes, buy now, smaller buttons |
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
6. Change variant via dropdown — sticky bar should reflect updated variant/price
7. Toggle width: "narrow" shows lifted bar with rounded corners, "full" stretches edge-to-edge
8. Toggle image off — product thumbnail should hide
9. Enable Buy Now — button should redirect to checkout
10. Test on mobile viewport — bar should be compact and usable
