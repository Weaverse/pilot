# Optimistic Cart Fix: Split Trigger + Drawer

## Problem

Cart operations (add, remove, update quantity) flash stale data in the cart drawer:

- **Add to cart**: Drawer opens showing empty, then shows the item after reload
- **Increase quantity**: Count increases then reverts to previous number
- **Remove item**: Item disappears then reappears

### Root Cause

The entire `CartDrawerContent` (trigger badge + drawer panel) lives inside a single `<Await resolve={rootData?.cart}>`. When a `CartForm` mutation completes:

1. React Router revalidates the root loader
2. `cart.get()` returns a new deferred promise
3. `<Await>` re-resolves — briefly passing stale/empty data to `useOptimisticCart`
4. `useOptimisticCart` has no pending fetchers to overlay (action already completed)
5. Result: stale data flashes before the new promise resolves

A `lastCartRef` hack was attempted but caused worse issues (deleted items reappearing because the ref cached pre-optimistic data).

## Solution: Split Trigger from Drawer Content

Match the Hydrogen skeleton pattern: the trigger badge and drawer content are independent consumers of the deferred cart promise, each with their own `<Await>` + `useOptimisticCart`.

### Architecture

```
CartDrawer (top-level, in header)
├── Dialog.Root (open state from Zustand store)
├── Dialog.Trigger
│   └── <Suspense><Await> → CartBadge (useOptimisticCart)
└── Dialog.Portal
    └── Drawer shell (close button, title)
        └── <Suspense><Await> → CartMain (useOptimisticCart)
```

### Components

**`CartDrawer`** — Top-level component rendered in header.

- Manages `Dialog.Root` with `open={isOpen}` from `useCartDrawerStore`
- Renders `Dialog.Trigger` wrapping a badge component
- Renders `Dialog.Portal` with drawer shell (overlay, close button, "Cart (N)" title)
- Inside the drawer, `CartMain` is wrapped in its own `<Suspense><Await>`

**Cart badge** — Inside the trigger, its own `<Await>` block.

- Gets `rootData.cart` from `useRouteLoaderData("root")`
- Uses `useOptimisticCart` for instant count updates
- Shows handbag icon + count badge
- On click: publishes analytics event and lets Dialog handle open

**Drawer content** — Inside `Dialog.Portal`, its own `<Await>` block.

- Gets `rootData.cart` from `useRouteLoaderData("root")`
- Uses `useOptimisticCart` for instant line item updates
- Passes optimistic cart to `CartMain`

### Key Changes

1. **Remove `lastCartRef`** — No ref caching. Each `<Await>` resolves independently. `useOptimisticCart` handles optimistic state via `useFetchers()`.

2. **Two independent `<Await>` blocks** — Badge and drawer each have their own. No data flows between them.

3. **`AddToCartButton`** opens drawer when fetcher transitions to `idle` (current behavior) — action completed, revalidation done.

4. **Close on route change** stays the same via `useEffect` on `location.pathname`.

### Files Changed

| File | Change |
|------|--------|
| `app/components/cart/cart-drawer.tsx` | Rewrite: split into separate Await blocks for badge vs drawer content |
| `app/components/cart/store.ts` | No change |
| `app/components/product/add-to-cart-button.tsx` | No change (already reverted to open-on-idle) |
| `app/components/cart/cart-main.tsx` | No change |
| `app/components/cart/cart-line-item.tsx` | No change |
| `app/components/cart/cart-line-qty-adjust.tsx` | No change |

### What This Does NOT Change

- Cart action handler (`app/routes/cart/cart-page.tsx`)
- Root loader deferred data structure
- `CartForm` usage in any component
- `useOptimisticCart` hook behavior
- Radix Dialog animations and accessibility
