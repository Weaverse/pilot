# Optimistic Cart — Custom Zustand Cart Sync — Implementation

> This documents the architecture **as shipped** in PR #375. It is a
> reverse-documented spec (the code merged before this folder existed), so it
> describes the final state rather than a step-by-step build order.

**Goal:** Eliminate cart data inconsistency (stale quantities, drop-back
flashes, phantom `qty:0`, `$numCartLines` errors) by replacing Hydrogen's
`useOptimisticCart` with a custom single-source-of-truth cart hook.

**Tech Stack:** React, react-router (`useFetchers`, `useRouteLoaderData`),
zustand, `@shopify/hydrogen` (`CartForm` only — `useOptimisticCart` removed).

---

## Architecture

A custom cart pipeline in `app/components/cart/store.ts` replaces
`useOptimisticCart`. Every cart consumer now reads from a single `useCart()`
hook instead of subscribing to the deferred root-loader promise directly.

```
root loader (deferred cart.get())
        │
        ▼
  <CartStoreSync/>  ──(updatedAt gate)──►  zustand: serverCart
                                                  │
 fetcher responses ──► useCartFetcherSync ───────►│  (+ freshestFetcherCartRef)
                                                  ▼
                                    useCart()  ── picks freshest baseline
                                                  ── filters removedLineIds
                                                  ── applyOptimisticMutations(pending only)
                                                  ▼
              CartDrawer badge/title · CartMain · CartRoute · CartSummary
```

### Core pieces (`store.ts`)

- **`useCartStore`** (zustand) — renamed from `useCartDrawerStore`. Adds
  `serverCart: CartApiQueryFragment | null` alongside the existing
  `isOpen`/`open`/`close`/`toggle` drawer state.
- **`freshestFetcherCartRef`** — module-level ref holding the freshest
  fetcher-sourced cart + its `updatedAt`. Survives React Router's synchronous
  fetcher cleanup.
- **`removedLineIds`** — module-level `Set<string>` of optimistically removed
  line IDs. Filtered from the baseline until the server cart confirms the lines
  are gone. Needed because RR deletes fetchers from unmounted remove buttons
  before their response is visible via `useFetchers()`.
- **`applyOptimisticMutations(baseline, fetchers)`** — applies **only pending**
  (`state === "submitting"` with `formData`) fetchers. This is the key fix for
  double-counting: idle fetchers are never re-applied. Handles
  `LinesAdd` (merge into existing line or unshift synthetic
  `optimistic-<uuid>` line), `LinesRemove` (splice + tombstone), `LinesUpdate`
  (set qty, splice on 0). Recomputes `totalQuantity`; sets `isOptimistic`.
- **`useCartFetcherSync(fetcher)`** — syncs a *singular* fetcher's cart into
  zustand **during render** (via `queueMicrotask` to avoid setState-in-render
  warnings), gated by `updatedAt` so older data never clobbers newer. Singular
  `useFetcher().data` survives cleanup where plural `useFetchers()` does not.
- **`useCart()`** — single source of truth. Picks the freshest baseline across
  zustand `serverCart`, `freshestFetcherCartRef`, and a same-render scan of
  idle `useFetchers()`; filters tombstoned `removedLineIds` (clearing confirmed
  removals); then overlays pending optimistic mutations.
- **`CartStoreSync()`** — component mounted in `root.tsx`. Resolves the deferred
  root-loader cart promise and writes it to `serverCart` **only if** its
  `updatedAt` is `>=` the current one — skipping the stale-overwrite flaw.

### GraphQL fix

- `CART_MUTATION_FRAGMENT` (`app/graphql/fragments.ts`) replaces
  `lines(first: $numCartLines)` with a hardcoded `lines(first: 250)`, removing
  the undeclared-variable error on mutations.
- `app/.server/context.ts` wires the cart handler to use
  `CART_MUTATION_FRAGMENT`.

### Consumer simplification

- `CartDrawer` — dropped the `Suspense` / `Await` / nested `CartDrawerContent`;
  reads `useCart()` directly for badge, title, and `CartMain`.
- `CartRoute` (`cart-page.tsx`) — `useCart()` replaces `useOptimisticCart`.
- `cart-main.tsx` — type adjustment for the `useCart()` return shape.
- `cart-line-item.tsx`, `add-to-cart-button.tsx`, `blog-post.tsx` — import
  rename `useCartDrawerStore` → `useCartStore`; dead code removed.
- `cart-line-qty-adjust.tsx`, `cart-summary.tsx`, `cart-summary-actions.tsx` —
  `isOptimistic` propagation / skeleton wiring against the new cart shape.

---

## Files Touched (PR #375)

| File | Change |
|------|--------|
| `app/components/cart/store.ts` | New custom cart sync (zustand + render-time fetcher sync, tombstones, optimistic mutations) — core of the change |
| `app/graphql/fragments.ts` | `$numCartLines` → hardcoded `250` in `CART_MUTATION_FRAGMENT` |
| `app/.server/context.ts` | Cart handler uses `CART_MUTATION_FRAGMENT` |
| `app/root.tsx` | Mounts `<CartStoreSync />` |
| `app/components/cart/cart-drawer.tsx` | `useCart()` replaces `Suspense`/`Await`/`useOptimisticCart` |
| `app/routes/cart/cart-page.tsx` | `useCart()` replaces `useOptimisticCart` |
| `app/components/cart/cart-main.tsx` | Type adjustment for `useCart()` shape |
| `app/components/cart/cart-line-item.tsx` | Import rename, dead code removed |
| `app/components/cart/cart-line-qty-adjust.tsx` | `isOptimistic` wiring against new shape |
| `app/components/cart/cart-summary.tsx` | Skeleton / `isOptimistic` propagation |
| `app/components/cart/cart-summary-actions.tsx` | Skeleton / `isOptimistic` propagation |
| `app/components/product/add-to-cart-button.tsx` | Import rename `useCartDrawerStore` → `useCartStore` |
| `app/sections/blog-post.tsx` | Import rename `useCartDrawerStore` → `useCartStore` |

No test files (Shopify Hydrogen template — manual QA).

---

## Verification

Manual QA per PR #375: rapid consecutive add-to-cart clicks update quantity
correctly with no drop-back flash and no phantom `qty:0`; add/remove/quantity
mutations no longer flash stale data; add-to-cart no longer throws the
`$numCartLines` GraphQL error.
