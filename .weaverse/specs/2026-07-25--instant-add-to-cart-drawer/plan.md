# Plan

## Approach

Add one piece of state to the existing cart store — a **staged pending-add
cart** — that is written synchronously by the add-to-cart click handler and read
by `useCart()` with priority over everything else. This closes the frame gap
that `useFetchers()`-derived optimism cannot cover, without touching the
bootstrap/sync machinery that already works.

The staged cart is a *presentation* cart only: real merchandise data (taken from
the `selectedVariant` already passed in `lines`), real quantity, but zeroed money
and `isOptimistic: true` so every money slot renders a skeleton instead of a
wrong number. It is discarded the moment the mutation settles, at which point
`useCartFetcherSync` has already pushed the authoritative cart into
`serverCart`.

## Steps

### 1. Stage a pending-add cart in the store

`app/components/cart/store.ts`

- Add to `CartStore`: `pendingAddCart: CartWithOptimistic | null`,
  `stagePendingAdd(lines: OptimisticCartLineInput[])`, `clearPendingAdd()`.
- New `buildOptimisticAddCart(baseline, lines)`:
  - Merge each input line into a clone of `baseline.lines.nodes` — bump
    `quantity` when the `merchandiseId` already has a line, otherwise `unshift`
    a synthetic node built from `line.selectedVariant` with an
    `optimistic-<uuid>` id (same shape `applyOptimisticMutations` already
    produces, so `cart-line-item.tsx` needs no new branches).
  - Mark touched lines and the cart `isOptimistic: true`; recompute
    `totalQuantity` from the nodes so the header badge is instantly correct.
  - Zero all money fields, taking `currencyCode` from
    `selectedVariant.price.currencyCode` so `<Money>` never receives a mismatched
    currency. Every money slot is skeletoned while `isOptimistic`, so the zeros
    are never rendered.
  - **Null-baseline case:** when `baseline` is `null` (first-ever add) synthesize
    a minimal cart from the variant alone, so the drawer shows the line instead
    of the empty state. Return `null` only if there is neither a baseline nor a
    usable variant — the caller then falls back to today's behavior.
- In `useCart()`, return `pendingAddCart` first when set, before the
  freshest-baseline scan. It is only ever set for the duration of one in-flight
  add.
- Also fix the `loading`-phase gap (problem 4): treat fetchers in `submitting`
  **and** `loading` as pending in `applyOptimisticMutations`, so the overlay
  survives until `serverCart` is synced.

### 2. Open the drawer on the initiating click

`app/components/product/add-to-cart-button.tsx`

- Wrap the button's `onClick`: forward any caller `onClick` first, and when the
  event was not `defaultPrevented`, call `stagePendingAdd(lines)` then
  `open()` — before the browser submits the form.
- Remove the `prevStateRef` "open when fetcher returns to idle" effect; it is
  superseded and would re-open a drawer the shopper just closed.
- `lines` must be threaded down from `AddToCartButton` into
  `AddToCartButtonContent` (currently only the fetcher is passed).

### 3. Settle and clear

`app/components/product/add-to-cart-button.tsx`

- Track submission with a ref; when the fetcher returns to `idle` **and** this
  button actually submitted, call `clearPendingAdd()`. `useCartFetcherSync` is
  already wired on this fetcher, so the authoritative cart is in the store by
  then and the skeletons resolve to real prices in the same pass.
- Add an optional `onSuccess?: () => void` prop fired on a confirmed add. Used
  by quick shop (step 5).

### 4. Prevent double submits and surface failures

`app/components/product/add-to-cart-button.tsx`

- `disabled={disabled || isLoading}` (fixes the `??` fallback hole), plus
  `aria-busy={isLoading || undefined}` for assistive tech.
- Derive `mutationFailed` from the settled fetcher: `errors` / `userErrors`
  non-empty, or no `cart` in the response.
- On failure: `clearPendingAdd()`, `close()` the drawer so the shopper is back
  at the product control, and render a `role="alert"` message under the button.
  The button re-enables so the add can be retried.

### 5. Align the three entry points

- `app/sections/main-product/buy-buttons/index.tsx` and
  `buy-buttons/sticky-atc-bar.tsx` — no behavioral change needed; verify the
  drawer opening does not fight the sticky bar's visibility store.
- `app/components/product-card/quick-shop.tsx` — the quick-shop Radix dialog and
  the cart drawer would otherwise stack two overlays. Pass `onSuccess` to close
  the quick-shop dialog when the add is confirmed, leaving only the drawer.

### 6. Tests and verification

- Unit tests for `buildOptimisticAddCart`: merge into existing line, new line,
  null baseline, missing variant, `totalQuantity` recomputation, currency code
  propagation.
- Manual check list (desktop + mobile) — throttled network so the pending window
  is observable:
  1. PDP add with empty cart → drawer opens instantly, line visible, price
     skeleton, then real price. Badge count correct throughout.
  2. PDP add onto an existing cart → quantity bumps instantly, no flash when the
     fetcher enters `loading`.
  3. Add the same variant twice quickly → second click is blocked; final cart
     quantity is correct.
  4. Sticky ATC bar add → same behavior; sticky bar state unaffected.
  5. Quick shop add from a collection card → quick-shop dialog closes, drawer
     shows the line.
  6. Forced failure (offline, or an unavailable variant) → drawer closes, error
     message shown, retry works, no phantom line left behind.
  7. Close the drawer mid-mutation → it does not re-open by itself.
- `npm run biome:fix` and `npm run typecheck` clean.

## Files and folders touched

- `.weaverse/specs/2026-07-25--instant-add-to-cart-drawer/`
- `app/components/cart/store.ts`
- `app/components/product/add-to-cart-button.tsx`
- `app/components/product-card/quick-shop.tsx`
- `app/sections/main-product/buy-buttons/index.tsx`
- `app/sections/main-product/buy-buttons/sticky-atc-bar.tsx`

Read-only / verified but not expected to change:

- `app/components/cart/cart-drawer.tsx` — already renders on
  `cartBootstrapResolved`; confirm an instantly-opened drawer on a cold page
  does not get stuck behind that gate (if it does, also accept
  `cart?.isOptimistic`).
- `app/components/cart/cart-line-item.tsx` — already skeletons the line price
  when `isOptimistic`.
- `app/components/cart/cart-summary.tsx` — already skeletons totals when
  `isOptimistic`.
