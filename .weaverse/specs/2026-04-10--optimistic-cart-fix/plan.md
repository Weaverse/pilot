# Fix Optimistic Cart — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three optimistic cart issues: stale badge/title on add-to-cart, remove-item flicker, and inconsistent skeleton propagation.

**Architecture:** Lift `useOptimisticCart` from `CartMain` into `CartDrawer` (and `CartRoute` for the page view) so badge, title, line items, and summary all share the same optimistic state. Remove the redundant `OptimisticInput` + CSS-hiding mechanism from remove buttons to eliminate flicker.

**Tech Stack:** React, @shopify/hydrogen (useOptimisticCart, OptimisticCart, CartForm, OptimisticInput), react-router (Await, useLoaderData)

**Spec:** `docs/superpowers/specs/2026-04-10-optimistic-cart-fix-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/components/cart/cart-drawer.tsx` | Modify | Add `useOptimisticCart` call inside a new `CartDrawerContent` component; pass optimistic cart to badge, title, and `CartMain` |
| `app/components/cart/cart-main.tsx` | Modify | Remove `useOptimisticCart` call; update `cart` prop type to `OptimisticCart<CartApiQueryFragment \| null>` |
| `app/components/cart/cart-line-item.tsx` | Modify | Remove CSS `display:none` hide for remove, remove `OptimisticInput` from `ItemRemoveButton` |
| `app/routes/cart/cart-page.tsx` | Modify | Add `useOptimisticCart` call at route level before passing to `CartMain` |

No new files. No test files (this is a Shopify Hydrogen template — manual QA testing per the spec's testing plan).

---

## Chunk 1: Implementation

### Task 1: Lift `useOptimisticCart` into CartDrawer

**Files:**
- Modify: `app/components/cart/cart-drawer.tsx`

This is the most important change. Extract the content inside `<Await>` into a `CartDrawerContent` component that calls `useOptimisticCart`, then uses the result for badge count, title, and `CartMain`.

- [ ] **Step 1: Update imports in cart-drawer.tsx**

Add `useOptimisticCart` and `type OptimisticCart` to the hydrogen import. Add `CartApiQueryFragment` type import.

Current imports (lines 1-10):
```tsx
import { ArrowRightIcon, HandbagIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { type CartReturn, useAnalytics } from "@shopify/hydrogen";
import clsx from "clsx";
import { Suspense, useEffect } from "react";
import { Await, useLocation, useRouteLoaderData } from "react-router";
import { CartMain } from "~/components/cart/cart-main";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import { useCartDrawerStore } from "./store";
```

Replace the hydrogen import line with:
```tsx
import { useAnalytics, useOptimisticCart } from "@shopify/hydrogen";
```

Add after the `Link` import:
```tsx
import type { CartApiQueryFragment } from "storefront-api.generated";
```

Remove `type CartReturn` — it's no longer needed since we use `OptimisticCart<CartApiQueryFragment | null>` instead.

- [ ] **Step 2: Extract `CartDrawerContent` component**

Add a new component after the `CartDrawer` export. This component receives the resolved cart, calls `useOptimisticCart`, and renders the dialog trigger + content using the optimistic cart.

Replace the `<Await resolve={rootData?.cart}>` callback (lines 38-108 in the current file) from:

```tsx
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Dialog.Root open={isOpen} onOpenChange={toggleCartDrawer}>
            <Dialog.Trigger
              onClick={() => publish("custom_sidecart_viewed", { cart })}
              className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
            >
              <HandbagIcon className="h-5 w-5" />
              {cart?.totalQuantity > 0 && (
                <div
                  className={clsx(
                    "cart-count",
                    "-right-1.5 absolute top-0",
                    "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center",
                    "text-center font-medium text-[13px] leading-none",
                    "transition-colors duration-300",
                    "group-hover/header:bg-(--color-header-text)",
                    "group-hover/header:text-(--color-header-bg)",
                  )}
                >
                  <span>{cart?.totalQuantity}</span>
                </div>
              )}
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className={clsx(
                  "fixed inset-0 z-10 bg-black/50",
                  "data-[state=open]:animate-[fade-in_150ms_ease-out]",
                  "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
                )}
              />
              <Dialog.Content
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={clsx(
                  "fixed inset-y-0 right-0 z-10 w-screen max-w-120 bg-background py-4",
                  "data-[state=open]:animate-[enter-from-right_200ms_ease-out]",
                  "data-[state=closed]:animate-[exit-to-right_200ms_ease-in]",
                )}
                aria-describedby={undefined}
              >
                <div className="flex h-full flex-col space-y-6">
                  <div className="flex items-center justify-between gap-2 px-4">
                    <Dialog.Title asChild className="text-base">
                      <Link
                        to="/cart"
                        className="group/cart-title flex items-center gap-1.5 font-bold hover:underline"
                        onClick={closeCartDrawer}
                      >
                        Cart ({cart?.totalQuantity || 0})
                        <ArrowRightIcon className="size-4 transition-transform group-hover/cart-title:translate-x-0.5" />
                      </Link>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="translate-x-2 p-2"
                        aria-label="Close cart drawer"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <CartMain layout="drawer" cart={cart as CartReturn} />
                  {/* <CartMain layout="aside" cart={cart as CartReturn} /> */}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </Await>
```

To:

```tsx
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <CartDrawerContent
            cart={cart}
            isOpen={isOpen}
            toggleCartDrawer={toggleCartDrawer}
            closeCartDrawer={closeCartDrawer}
          />
        )}
      </Await>
```

Also remove the `useAnalytics` destructure from `CartDrawer` since `publish` is now called inside `CartDrawerContent`:

Current line 14:
```tsx
  const { publish } = useAnalytics();
```

Remove this line. Also remove `useAnalytics` from imports if it's no longer used in `CartDrawer` (it will be imported in `CartDrawerContent` instead — but since `CartDrawerContent` is in the same file, the import at the top stays).

- [ ] **Step 3: Write the `CartDrawerContent` component**

Add after the `CartDrawer` function:

```tsx
function CartDrawerContent({
  cart: originalCart,
  isOpen,
  toggleCartDrawer,
  closeCartDrawer,
}: {
  cart: CartApiQueryFragment | null;
  isOpen: boolean;
  toggleCartDrawer: () => void;
  closeCartDrawer: () => void;
}) {
  const { publish } = useAnalytics();
  const cart = useOptimisticCart(originalCart);

  return (
    <Dialog.Root open={isOpen} onOpenChange={toggleCartDrawer}>
      <Dialog.Trigger
        onClick={() => publish("custom_sidecart_viewed", { cart })}
        className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
      >
        <HandbagIcon className="h-5 w-5" />
        {cart?.totalQuantity > 0 && (
          <div
            className={clsx(
              "cart-count",
              "-right-1.5 absolute top-0",
              "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center",
              "text-center font-medium text-[13px] leading-none",
              "transition-colors duration-300",
              "group-hover/header:bg-(--color-header-text)",
              "group-hover/header:text-(--color-header-bg)",
            )}
          >
            <span>{cart?.totalQuantity}</span>
          </div>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "fixed inset-0 z-10 bg-black/50",
            "data-[state=open]:animate-[fade-in_150ms_ease-out]",
            "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
          )}
        />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={clsx(
            "fixed inset-y-0 right-0 z-10 w-screen max-w-120 bg-background py-4",
            "data-[state=open]:animate-[enter-from-right_200ms_ease-out]",
            "data-[state=closed]:animate-[exit-to-right_200ms_ease-in]",
          )}
          aria-describedby={undefined}
        >
          <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between gap-2 px-4">
              <Dialog.Title asChild className="text-base">
                <Link
                  to="/cart"
                  className="group/cart-title flex items-center gap-1.5 font-bold hover:underline"
                  onClick={closeCartDrawer}
                >
                  Cart ({cart?.totalQuantity || 0})
                  <ArrowRightIcon className="size-4 transition-transform group-hover/cart-title:translate-x-0.5" />
                </Link>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="translate-x-2 p-2"
                  aria-label="Close cart drawer"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <CartMain layout="drawer" cart={cart} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

Key changes from original:
- `useOptimisticCart` called at the top of `CartDrawerContent` (no explicit generic — TypeScript infers `CartApiQueryFragment | null`)
- `useAnalytics` moved into `CartDrawerContent` (removed from `CartDrawer` to avoid prop drilling `publish`)
- Badge reads `cart?.totalQuantity` from the optimistic cart
- Title reads `cart?.totalQuantity` from the optimistic cart
- `CartMain` receives optimistic cart directly (no `as CartReturn` cast)
- Removed the commented-out `{/* <CartMain layout="aside" ... /> */}` line

- [ ] **Step 4: Commit cart-drawer.tsx changes (together with Task 2)**

Do NOT commit yet — Task 1 and Task 2 must be committed atomically since `CartDrawerContent` passes the optimistic cart to `CartMain`, which still expects the old type. Proceed to Task 2 first.

---

### Task 2: Update CartMain to Accept Optimistic Cart

**Files:**
- Modify: `app/components/cart/cart-main.tsx`

Remove the `useOptimisticCart` call since the caller now passes the optimistic cart. Update prop type.

- [ ] **Step 1: Remove `useOptimisticCart` import and update type import**

Current line 1:
```tsx
import { useOptimisticCart } from "@shopify/hydrogen";
```

Replace with:
```tsx
import type { OptimisticCart } from "@shopify/hydrogen";
```

- [ ] **Step 2: Update `CartMain` props and remove hook call**

Current (lines 71-83):
```tsx
export function CartMain({
  layout,
  onClose,
  cart: originalCart,
}: {
  layout: CartLayoutType;
  onClose?: () => void;
  cart: CartApiQueryFragment;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
  const cart = useOptimisticCart<CartApiQueryFragment>(originalCart);
```

Replace with:
```tsx
export function CartMain({
  layout,
  onClose,
  cart,
}: {
  layout: CartLayoutType;
  onClose?: () => void;
  cart: OptimisticCart<CartApiQueryFragment | null>;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
```

Key changes:
- Prop renamed from `cart: originalCart` to just `cart` (no rename needed, it's already optimistic)
- Prop type changed from `CartApiQueryFragment` to `OptimisticCart<CartApiQueryFragment | null>` (nullable because cart can be null on fresh sessions)
- Removed `useOptimisticCart` call (line 82)
- The rest of the component stays the same — it already uses `cart` everywhere with `?.` null guards

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: Either clean or errors only in `cart-page.tsx` (which we fix in Task 3).

- [ ] **Step 4: Commit Task 1 + Task 2 together**

```bash
git add app/components/cart/cart-drawer.tsx app/components/cart/cart-main.tsx
git commit -m "refactor: lift useOptimisticCart from CartMain into CartDrawer

Extract CartDrawerContent component that calls useOptimisticCart,
ensuring badge count, drawer title, and cart items all share
the same optimistic state. CartMain now receives optimistic cart
from its parent."
```

---

### Task 3: Add `useOptimisticCart` to Cart Page Route

**Files:**
- Modify: `app/routes/cart/cart-page.tsx`

The full-page cart view (`/cart`) uses `await cart.get()` (blocking loader), so it needs its own `useOptimisticCart` call at the route level.

- [ ] **Step 1: Add import**

Current imports (lines 1-6):
```tsx
import {
  Analytics,
  CartForm,
  type CartQueryDataReturn,
} from "@shopify/hydrogen";
```

Replace with:
```tsx
import {
  Analytics,
  CartForm,
  type CartQueryDataReturn,
  useOptimisticCart,
} from "@shopify/hydrogen";
```

No additional type import needed — `useOptimisticCart` infers from the loader return type.

- [ ] **Step 2: Wrap cart with `useOptimisticCart` in `CartRoute`**

Current (lines 114-116):
```tsx
export default function CartRoute() {
  const { cart, featuredProducts } = useLoaderData<typeof loader>();
```

Replace with:
```tsx
export default function CartRoute() {
  const { cart: originalCart, featuredProducts } =
    useLoaderData<typeof loader>();
  const cart = useOptimisticCart(originalCart);
```

Note: no explicit generic — TypeScript infers the return type from `loader`, which is `CartReturn | null`. `useOptimisticCart` returns `OptimisticCart<CartReturn | null>` which is compatible with `CartMain`'s `OptimisticCart<CartApiQueryFragment | null>` since `CartReturn` extends `CartApiQueryFragment`.

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: Clean.

- [ ] **Step 4: Commit cart-page.tsx changes**

```bash
git add app/routes/cart/cart-page.tsx
git commit -m "fix: add useOptimisticCart to cart page route

Full-page cart view now has optimistic behavior matching the drawer."
```

---

### Task 4: Remove Dual-Mechanism Removal (Fix Flicker)

**Files:**
- Modify: `app/components/cart/cart-line-item.tsx`

Remove the `OptimisticInput` from `ItemRemoveButton` and the CSS `display:none` trick from `CartLineItem`. The `useOptimisticCart` hook (now in parent) already splices removed lines from the array.

- [ ] **Step 1: Remove the `OptimisticInput` import if only used by remove button**

Check current imports (lines 1-8):
```tsx
import {
  CartForm,
  Money,
  type OptimisticCart,
  OptimisticInput,
  useOptimisticData,
} from "@shopify/hydrogen";
```

`OptimisticInput` is still used by `cart-line-qty-adjust.tsx` (separate file), but in THIS file it's used in `ItemRemoveButton` only. After removing it from `ItemRemoveButton`, `OptimisticInput` is no longer used in this file.

`useOptimisticData` is still used for the `isOptimistic` workaround for quantity changes — keep it.

Replace the import with:
```tsx
import {
  CartForm,
  Money,
  type OptimisticCart,
  useOptimisticData,
} from "@shopify/hydrogen";
```

- [ ] **Step 2: Remove CSS display:none from CartLineItem render**

Current (lines 72-80):
```tsx
    <li
      className="flex gap-4"
      style={{
        // Hide the line item if the optimistic data action is remove
        // Do not remove the form from the DOM
        display: optimisticData?.action === "remove" ? "none" : "flex",
      }}
    >
```

Replace with:
```tsx
    <li className="flex gap-4">
```

- [ ] **Step 3: Remove `OptimisticInput` from `ItemRemoveButton`**

Current `ItemRemoveButton` (lines 132-158):
```tsx
function ItemRemoveButton({
  lineId,
  className,
}: {
  lineId: CartLine["id"];
  className?: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds: [lineId] }}
    >
      <button
        className={clsx(
          "flex h-8 w-8 items-center justify-center border-none",
          className,
        )}
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <TrashIcon aria-hidden="true" className="size-4.5" />
      </button>
      <OptimisticInput id={lineId} data={{ action: "remove" }} />
    </CartForm>
  );
}
```

Replace with (remove the `OptimisticInput` line):
```tsx
function ItemRemoveButton({
  lineId,
  className,
}: {
  lineId: CartLine["id"];
  className?: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds: [lineId] }}
    >
      <button
        className={clsx(
          "flex h-8 w-8 items-center justify-center border-none",
          className,
        )}
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <TrashIcon aria-hidden="true" className="size-4.5" />
      </button>
    </CartForm>
  );
}
```

- [ ] **Step 4: Clean up unused `optimisticData?.action` check**

In `CartLineItem`, the `optimisticData` variable is still used for the `isOptimistic` workaround (line 48-51). However, the check for `optimisticData?.action === "remove"` (which was in the `style` prop) is now gone. The `isOptimistic` check still references `optimisticData` so the import and variable stay. No further changes needed in this step.

- [ ] **Step 5: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: Clean.

- [ ] **Step 6: Commit cart-line-item.tsx changes**

```bash
git add app/components/cart/cart-line-item.tsx
git commit -m "fix: remove dual-mechanism removal to eliminate flicker

useOptimisticCart already splices removed lines from the array,
so the OptimisticInput + CSS display:none trick was redundant
and caused a flicker when the fetcher completed."
```

---

### Task 5: Verify Fix 3 (Skeleton Propagation) and Final Check

No code changes needed — Fix 3 comes free with Fix 1.

- [ ] **Step 1: Verify `cart.isOptimistic` flows to CartSummary**

Read `app/components/cart/cart-summary.tsx` and confirm that `isOptimistic` is destructured from `cart` (line 52) and used for `isCartUpdating` (line 58-61). This already works correctly since `CartMain` passes `cart` through to `CartSummary`, and `cart` now has `isOptimistic` set by `useOptimisticCart` in the parent.

- [ ] **Step 2: Run full type check**

Run: `npx tsc --noEmit 2>&1 | head -50`

Expected: Clean (no errors).

- [ ] **Step 3: Run dev server to sanity check**

Run: `npm run dev`

Verify:
- App starts without errors
- Cart drawer opens
- No console errors related to optimistic cart

- [ ] **Step 4: Manual QA per testing plan**

Follow the testing checklist from the spec:
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
