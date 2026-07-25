# Plan

## Approach

Add one piece of state to the existing cart store — a **staged pending-add
cart** — that is written synchronously by the add-to-cart click handler and read
by `useCart()` with priority over everything else. This closes the frame gap
that `useFetchers()`-derived optimism cannot cover, without touching the
bootstrap/sync machinery that already works.

The staged cart is a *presentation* cart only: real merchandise data (taken from
the `selectedVariant` already passed in `lines`), real quantity, but skeletoned
money and `isOptimistic: true`, so no wrong number is ever painted. It is
discarded the moment the mutation settles, at which point `useCartFetcherSync`
has already pushed the authoritative cart into `serverCart`.

## Steps

### 1. Extract a shared baseline resolver

`app/components/cart/store.ts`

`useCart()` currently resolves its baseline from three sources in one inlined
block: `serverCart`, the `freshestFetcherCartRef` module ref, and a scan of idle
fetchers. `stagePendingAdd()` must stage from the *same* cart the drawer is
about to render, otherwise the staged cart can be older than what is on screen
and the drawer visibly jumps backwards on the click.

- Extract `resolveBaselineCart(fetchers?)` returning
  `{ cart, updatedAt, source }`, used by both `useCart()` and
  `stagePendingAdd()`. Outside render (the click handler) it is called without
  fetchers, so it consults `serverCart` + `freshestFetcherCartRef` only —
  the idle-fetcher scan needs a render pass and has no equivalent off-render.
- Keep the tombstone (`removedLineIds`) filtering inside `useCart()`; it is a
  render-time concern and the staged cart is built from the already-filtered
  baseline passed in by the caller.

### 2. Stage a pending-add cart in the store

`app/components/cart/store.ts`

- Add to `CartStore`:
  - `pendingAdds: Map<string, PendingAdd>` where
    `PendingAdd = { cart: CartWithOptimistic; stagedFromUpdatedAt: string }`.
  - `stagePendingAdd(lines: OptimisticCartLineInput[]): string | null` —
    returns an opaque token, or `null` when nothing could be staged.
  - `clearPendingAdd(token: string)` — clears **only** that token's entry.

  A `Map` keyed by token, not a single slot: two add buttons can be in flight at
  once (sticky ATC bar + quick shop, or two product cards clicked in
  succession). With a single slot the second stage overwrites the first, and the
  first fetcher settling would then clear a stage that is still in flight.

- New `buildOptimisticAddCart(baseline, lines)`:
  - Merge each input line into a clone of `baseline.lines.nodes` — bump
    `quantity` when the `merchandiseId` already has a line, otherwise `unshift`
    a synthetic node built from `line.selectedVariant` (same shape
    `applyOptimisticMutations` already produces, so `cart-line-item.tsx` needs
    no new branches).
  - The synthetic node's id is **`optimistic-<merchandiseId>`, never a random
    UUID**. This cart is recomposed on every render, so a random id would give
    `<CartLineItem key={line.id}>` a new key each pass — remounting the row
    (image reload, visible flicker) and re-keying `useOptimisticData(id)`.
    A cart holds at most one line per merchandise, so it is unique.
  - Mark **only touched lines** `isOptimistic: true`, and the cart
    `isOptimistic: true`; recompute `totalQuantity` from the nodes so the header
    badge is instantly correct.
  - **Money handling is deliberately asymmetric:**
    - *Cart-level* `cost` is zeroed — the totals genuinely change on an add, and
      `cart-summary.tsx` already skeletons every money slot while
      `isOptimistic` is true, so the zeros are never rendered.
    - *Existing lines' own `cost`* is left **untouched**. `cart-line-item.tsx`
      skeletons per line via `line.isOptimistic`, so an untouched line keeps
      rendering its real, still-correct price. Zeroing them would blank out
      prices that were never in question.
    - The synthetic new line's `cost` is zeroed and the line is marked
      optimistic, so it renders as a skeleton.
    - `currencyCode` on every zeroed money object comes from
      `selectedVariant.price.currencyCode` (falling back to the baseline's), so
      `<Money>` never receives a mismatched currency.
  - **Null-baseline case:** when `baseline` is `null` (first-ever add)
    synthesize a minimal cart from the variant alone, so the drawer shows the
    line instead of the empty state. Return `null` only if there is neither a
    baseline nor a usable variant — the caller then falls back to today's
    behavior (no stage, drawer opens on settle).

- In `useCart()`, when `pendingAdds` is non-empty return the most recently
  staged entry's cart **unless the resolved baseline is newer than
  `stagedFromUpdatedAt`** — in which case the authoritative cart has already
  landed and the stage is stale.

  Do not rely on `clearPendingAdd()` running first: `useCartFetcherSync` writes
  `serverCart` inside a `queueMicrotask`, while the clear happens in a passive
  effect, and pinning correctness to that ordering is fragile. The
  `updatedAt` comparison makes the handoff self-correcting; the explicit clear
  in step 4 is then just cleanup.

- Also fix the `loading`-phase gap (problem 4): treat fetchers in `submitting`
  **and** `loading` as pending in `applyOptimisticMutations`, so the overlay
  survives until `serverCart` is synced.

### 3. Open the drawer on the initiating click

`app/components/product/add-to-cart-button.tsx`

- Thread `lines` down from `AddToCartButton` into `AddToCartButtonContent`
  (currently only the fetcher is passed).
- Wrap the button's `onClick`: forward any caller `onClick` first, and when the
  event was not `defaultPrevented`, call `stagePendingAdd(lines)` (storing the
  token in a ref) then `open()` — before the browser submits the form.
  The wrapper must be declared **after** the `{...props}` spread on `<Button>`,
  otherwise a caller-supplied `onClick` in `props` silently replaces it.
- Remove the `prevStateRef` "open when fetcher returns to idle" effect; it is
  superseded and would re-open a drawer the shopper just closed.

### 4. Un-gate the drawer for an optimistic cart

`app/components/cart/cart-drawer.tsx`

This is a required change, not a verification. The drawer body renders a
spinner unless `cartBootstrapResolved` is true, and the title's item count is
hidden by the same gate. On a cold page the `/api/cart` bootstrap has often not
responded yet when the shopper clicks add-to-cart — so an instantly-opened
drawer would show a spinner, which is exactly the frame this feature exists to
remove.

- Body gate becomes `cartBootstrapResolved || cart?.isOptimistic`.
- Title count gate becomes the same condition — a staged cart has a correct
  `totalQuantity`, so showing it is safe.

The gate still does its original job: a returning shopper who opens the drawer
by hand pre-bootstrap sees the spinner, not a false empty cart.

### 5. Settle, clear, and surface failures

`app/components/product/add-to-cart-button.tsx`

- Track submission with a ref; when the fetcher returns to `idle` **and** this
  button actually submitted, call `clearPendingAdd(token)` with the token from
  step 3 and reset the ref.
- `disabled={disabled || isLoading}` (fixes the `??` fallback hole), plus
  `aria-busy={isLoading || undefined}` for assistive tech.
- Derive `mutationFailed` from the settled fetcher: `errors` / `userErrors`
  non-empty, or no `cart` in the response.
- On failure: `clearPendingAdd(token)` (removing the phantom line) and render a
  `role="alert"` message under the button. The button re-enables so the add can
  be retried.

  **The drawer stays open.** Force-closing it yanks away an overlay the shopper
  is looking at — and it may already hold other items that are perfectly fine.
  The error belongs where the shopper's attention is, so it also renders inside
  the drawer (step 6).
- **Harden the analytics effect.** `AddToCartAnalytics` reads
  `fetcherData.cart.id` with no guard. Today a failed add is never exercised;
  this change makes that path reachable, and an add that returns no `cart`
  would throw. Guard the access and skip the event when there is no cart.

### 6. Surface the add error in the drawer

`app/components/cart/store.ts`, `app/components/cart/cart-drawer.tsx`

- Add `lastAddError: string | null` to the store, set on a failed add and
  cleared on the next add, and on `close()` / `toggle()`.
- Render it as a dismissible `role="alert"` banner above the drawer body. It
  lives in `cart-drawer.tsx`, not `cart-main.tsx`: `CartMain` also backs the
  `/cart` page, which has no add-to-cart entry point of its own.

### 7. Align the three entry points

- `app/sections/main-product/buy-buttons/index.tsx` and
  `buy-buttons/sticky-atc-bar.tsx` — no behavioral change needed; verify the
  drawer opening does not fight the sticky bar's visibility store.
- `app/components/product-card/quick-shop.tsx` — **the dialog stays open
  through the add; no code change beyond dropping the stale `TODO` about the
  overlap.** The cart drawer's portal mounts after the dialog's, so at equal
  z-index the drawer paints on top, and closing the drawer returns the shopper
  to the dialog to add another variant.

  Closing it on the click is what an earlier revision tried, and it breaks the
  feature outright: unmounting the form before the browser runs its default
  submit action means **no request is ever sent**. Keeping it mounted also
  keeps the settle effect alive, so a failed quick-shop add still reports its
  error. The only cost is two stacked overlays dimming the backdrop twice.

### 8. Verification

Pilot has **no unit-test runner** — `package.json` has Playwright (`e2e`) only,
there is no vitest config and no `*.test.*` file in the repo. Adding one is out
of scope for this feature; if we want unit coverage for the store it should be
its own spec.

The existing `tests/cart.test.ts` cannot be extended as-is either: it targets
`[data-test=subtotal]`, `[data-test=close-cart]`, `[data-test=price]`,
`[data-test=collection-grid]` and `[data-test=product-grid]`, and **none of
those hooks exist in the app anymore** — only `item-quantity` and
`add-to-cart` do. The suite is already stale, so new specs stacked on it would
be unverifiable. Repairing it is a separate task; it is filed as a follow-up
rather than folded in here.

Verification for this feature is therefore the manual list below, run against
a dev server with the network throttled so the pending window is observable.
The scenarios are written to double as the e2e spec once the suite is repaired:
  1. PDP add with empty cart → drawer opens within the click, line visible,
     price skeleton, then real price. Badge count correct throughout.
  2. PDP add onto an existing cart → quantity bumps instantly; existing lines
     keep their real prices; no flash when the fetcher enters `loading`.
  3. Add the same variant twice quickly → second click is blocked; final cart
     quantity is correct.
  4. Two different add buttons in flight at once → both lines survive until
     their own mutation settles (the multi-stage regression).
  5. Cold page, click add before `/api/cart` responds → drawer shows the line,
     not the bootstrap spinner.
  6. Sticky ATC bar add → same behavior; sticky bar state unaffected.
  7. Quick shop add from a collection card → drawer opens over the still-open
     dialog and shows the line; the POST actually fires; closing the drawer
     reveals the dialog again.
  8. Forced failure (offline, or an unavailable variant) → drawer stays open,
     error banner shown, no phantom line, retry works.
  9. Close the drawer mid-mutation → it does not re-open by itself.
- `npm run biome` and `npm run typecheck` clean. This repo is on npm — see
  `AGENTS.md` ("Use npm (not pnpm)").

## Files and folders touched

- `.weaverse/specs/2026-07-25--instant-add-to-cart-drawer/`
- `app/components/cart/store.ts`
- `app/components/cart/cart-drawer.tsx`
- `app/components/product/add-to-cart-button.tsx`
- `app/components/product-card/quick-shop.tsx`

Verified as needing no change:

- `app/sections/main-product/buy-buttons/index.tsx` and
  `buy-buttons/sticky-atc-bar.tsx` — both render `AddToCartButton`, so they
  inherit the new behavior; the sticky bar's visibility store is independent of
  the drawer's `isOpen`.

Read-only / verified but not expected to change:

- `app/components/cart/cart-line-item.tsx` — already skeletons the line price
  when `isOptimistic`, per line.
- `app/components/cart/cart-summary.tsx` — already skeletons totals when
  `isOptimistic`.
