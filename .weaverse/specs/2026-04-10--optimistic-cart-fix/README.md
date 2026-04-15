# Feature: Fix Optimistic Cart in Pilot Template

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | approved                                                 |
| **Owner**        | Paul Phan                                                |
| **Issue**        | N/A                                                      |
| **Branch**       | `fix/optimistic-cart`                                    |
| **Created**      | 2026-04-10                                               |
| **Last Updated** | 2026-04-10                                               |

## Original Prompt

> Fix the optimistic cart issues in the Pilot template: cart badge not updating instantly when adding items, remove button flickering, and cart total being slow to update with skeleton state.

## Summary

Refactors the optimistic cart implementation by lifting `useOptimisticCart` from `CartMain` into parent components (`CartDrawer` and `CartRoute`), ensuring badge count, drawer title, and line items all share the same optimistic state. Removes the redundant dual-mechanism removal (CSS + hook) to eliminate flicker when removing items.

## Problem

The Shopify Hydrogen Optimistic Cart in the Pilot template has three observable issues:

1. **Add to cart not instant** - The cart badge count, drawer title, and line items don't reflect optimistic state immediately
2. **Remove flicker** - Removing an item briefly shows the item again before final removal
3. **Cart total slow to update** - The cost skeleton doesn't consistently appear during optimistic transitions

## Root Causes

### Cause 1: `useOptimisticCart` is called too deep in the component tree

`useOptimisticCart` is called inside `CartMain` (cart-main.tsx:82), but the `CartDrawer` component (cart-drawer.tsx) renders the badge count and "Cart (N)" title **outside** `CartMain`, directly from the deferred/stale `cart` promise resolved by `<Await>`.

The deferred cart data from `app/.server/root.ts:59` (`cart.get()`) is not awaited — it resolves after initial page load. When a cart mutation happens, `useOptimisticCart` processes pending fetchers and returns an optimistic cart, but only `CartMain` sees this. The drawer header still shows stale `totalQuantity`.

### Cause 2: Dual-mechanism removal creates a timing gap

The remove button uses two mechanisms simultaneously:
- **`OptimisticInput`** with `data={{ action: "remove" }}` — drives CSS `display: none` via `useOptimisticData`
- **`useOptimisticCart`** — splices the line from the array internally

When the fetcher completes and clears, `useOptimisticData` returns `{}`, so CSS sets `display: flex` (item reappears). Then revalidation returns the updated cart without the line (item disappears). This sequence causes a visible flicker.

### Cause 3: `isOptimistic` propagation depends on the hook location

`cart.isOptimistic` is set by `useOptimisticCart` and checked in `CartSummary` to show skeleton loaders. Since the hook was isolated inside `CartMain`, the optimistic flag didn't always propagate to all consumers. Lifting the hook resolves this.

## Solution Design

### Fix 1: Lift `useOptimisticCart` into CartDrawer

Move the `useOptimisticCart` call from `CartMain` into the `<Await>` callback in `CartDrawer`. This way:
- The cart badge reads `optimisticCart.totalQuantity`
- The drawer title reads `optimisticCart.totalQuantity`
- `CartMain` receives the already-optimistic cart (no double hook call)

A new inner component `CartDrawerContent` wraps the hook call since hooks can't be called inside render callbacks directly. `CartDrawerContent` receives the resolved `cart` (which may be `null` on fresh sessions with no cart), calls `useOptimisticCart(cart)`, and passes the result to both the header elements and `CartMain`.

**Null cart handling:** `useOptimisticCart(null)` returns `null`. The badge rendering already guards with `cart?.totalQuantity > 0`. `CartMain` already checks `Boolean(cart?.lines?.nodes?.length)`.

For the full-page cart route (`cart-page.tsx`), the loader uses `await cart.get()` (blocking, not deferred), so `useLoaderData` returns the raw `CartApiQueryFragment`. Add `useOptimisticCart` in the `CartRoute` component, wrapping the cart before passing to `CartMain`.

**Type changes:** `CartMain`'s `cart` prop type changes from `CartApiQueryFragment` to `OptimisticCart<CartApiQueryFragment>` since both callers (CartDrawer and CartRoute) now pass an optimistic cart.

### Fix 2: Remove dual-mechanism removal

**Dependency: Fix 2 requires Fix 1 to be applied first.** Removing `OptimisticInput` from `ItemRemoveButton` means the CSS-hiding fallback is gone. The item removal is then handled entirely by `useOptimisticCart`'s fetcher-scanning logic, which splices the line from the array. If Fix 1 is not applied, there would be no optimistic removal at all.

Remove the `OptimisticInput` from `ItemRemoveButton` and the CSS `display: none` check from `CartLineItem`. Since `useOptimisticCart` (now lifted to CartDrawer/CartRoute) already splices removed lines from the array, the line won't render during the optimistic phase — no CSS trick needed.

**Note on `isOptimistic` workaround:** After removing `OptimisticInput` from remove buttons, `useOptimisticData(line.id)` returns `{}` for removed lines. However, this is a non-issue because removed lines are already spliced from the array by `useOptimisticCart` — they won't be rendered at all. The `isOptimistic` workaround continues to work correctly for quantity-update scenarios where `OptimisticInput` is still present.

### Fix 3: Skeleton propagation (free with Fix 1)

No additional code changes needed beyond Fix 1. Lifting `useOptimisticCart` ensures `cart.isOptimistic` is set at the right level and flows to `CartSummary`.

## Files Changed

| File | Change |
|------|--------|
| `app/components/cart/cart-drawer.tsx` | Extract `CartDrawerContent`, call `useOptimisticCart`, pass optimistic cart to header and CartMain |
| `app/components/cart/cart-main.tsx` | Remove `useOptimisticCart` import and call; accept cart as `OptimisticCart<CartApiQueryFragment>` |
| `app/components/cart/cart-line-item.tsx` | Remove `display: none` style for remove action; remove `OptimisticInput` from `ItemRemoveButton` |
| `app/routes/cart/cart-page.tsx` | Add `useOptimisticCart` call at route level for full-page cart view |

## Testing Plan

- [ ] First add-to-cart on fresh session (null cart) — badge appears with count 1 instantly
- [ ] Add item to cart from PDP — cart drawer badge updates immediately
- [ ] Add item from quick shop modal — same instant feedback
- [ ] Remove item from cart drawer — no flicker, item disappears instantly
- [ ] Remove item from cart page — same behavior
- [ ] Update quantity — skeleton shows on price, quantity updates instantly
- [ ] Apply discount code — total shows skeleton, then updates
- [ ] Rapid remove of multiple items — no race condition flicker
- [ ] Open cart drawer with empty cart — "Start Shopping" message appears correctly
- [ ] Full page cart view — all optimistic behaviors work

## Implementation Order

Fixes must be applied in order: **Fix 1 first**, then Fix 2, then verify Fix 3. Fix 2 depends on Fix 1 being in place.
