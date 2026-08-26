# Plan

## Approach

Store each pending add's **lines** synchronously from the initiating click, then
compose every active stage over the freshest cart baseline inside `useCart()`.
This closes the first-frame gap that `useFetchers()` cannot cover while keeping
concurrent adds isolated by token.

The composed cart is presentation-only: real merchandise data and quantity,
with the touched lines and cart totals marked optimistic. Shopify remains
authoritative. Controls that would submit synthetic IDs or leave for checkout
stay disabled until the authoritative cart lands.

### Module boundaries

The initial implementation grew `app/components/cart/store.ts` to 800 lines by
mixing state, pure cart transforms, mutable freshness state, and React Router
effects. The reviewed layout keeps those responsibilities separate:

- `store.ts` — Zustand state, bootstrap selectors, and the composed `useCart()`
  hook.
- `optimistic-cart.ts` — optimistic add/update/remove transforms and removal
  tombstones.
- `cart-baseline.ts` — authoritative baseline cache, timestamps, bootstrap
  request identity, and mutation-epoch race guards.
- `cart-sync.ts` — React Router fetcher capture and client-side `/api/cart`
  bootstrap effects.

## Steps

### 1. Extract a shared baseline resolver

`app/components/cart/cart-baseline.ts`

`useCart()` resolves its baseline from `serverCart`, the cart-baseline module
cache, and a scan of idle fetchers. The click-time stage records the timestamp
of the same baseline resolver so a newer authoritative cart can supersede it.

- Extract `resolveBaselineCart(fetchers?)` returning
  `{ cart, updatedAt }`, used by both `useCart()` and
  `stagePendingAdd()`. Outside render (the click handler) it is called without
  fetchers, so it consults `serverCart` + the cart-baseline cache only —
  the idle-fetcher scan needs a render pass and has no equivalent off-render.
- Keep tombstone (`removedLineIds`) filtering inside `useCart()` as a
  render-time concern.

### 2. Stage pending-add lines in the store

`app/components/cart/store.ts`,
`app/components/cart/optimistic-cart.ts`

- Add to `CartStore`:
  - `pendingAdds: Map<string, PendingAdd>` where
    `PendingAdd = { lines: OptimisticCartLineInput[]; stagedFromUpdatedAt:
    string }`.
  - `stagePendingAdd(lines: OptimisticCartLineInput[]): string | null` —
    returns an opaque token, or `null` when nothing could be staged.
  - `clearPendingAdd(token: string)` — clears **only** that token's entry.

  A `Map` keyed by token, not a single slot: two add buttons can be in flight at
  once (sticky ATC bar + quick shop, or two product cards clicked in
  succession). With a single slot the second stage overwrites the first, and the
  first fetcher settling would then clear a stage that is still in flight.

- Add shared composition helpers:
  - `applyAddLines(nodes, lines)` merges each input line into a cloned baseline:
    bump
    `quantity` when the `merchandiseId` already has a line, otherwise `unshift`
    a synthetic node built from `line.selectedVariant` (same shape
    `applyOptimisticMutations` already produces, so `cart-line-item.tsx` needs
    no new branches).
  - The synthetic node's id is **`optimistic-<merchandiseId>`, never a random
    UUID**. This cart is recomposed on every render, so a random id would remount
    the row throughout the pending window and re-key `useOptimisticData(id)`.
  - `CartMain` keys a unique merchandise row by merchandise ID instead of the
    temporary cart line ID. Shopify replaces the synthetic line ID after a
    successful add, but React keeps the same row mounted, preventing title flash
    and image load-state reset. If a cart contains duplicate merchandise IDs,
    keys fall back to Shopify line IDs to avoid collisions.
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
  - `buildOptimisticAddCart(lines)` handles the null-baseline/first-ever-add
    case by synthesizing a minimal cart from the variants.

- In `useCart()`, collect all active staged lines, apply them over the freshest
  baseline, and then layer pending fetcher mutations. A stage becomes inactive
  when the resolved baseline is newer than its `stagedFromUpdatedAt`.

  Do not rely on `clearPendingAdd()` running first: `useCartFetcherSync` writes
  `serverCart` inside a `queueMicrotask`, while the clear happens in a passive
  effect, and pinning correctness to that ordering is fragile. The
  `updatedAt` comparison makes the handoff self-correcting; the explicit clear
  in step 5 is then just cleanup.

- Also fix the `loading`-phase gap (problem 4): treat fetchers in `submitting`
  **and** `loading` as pending in `applyOptimisticMutations`, so the overlay
  survives until `serverCart` is synced.
- A `loading` fetcher already carries its authoritative action-result cart.
  If `/api/cart` revalidation has advanced the baseline to that same cart
  version, do not apply the fetcher's add input again. Compare `updatedAt`, with
  touched-line quantities as the equality fallback, so the handoff neither
  drops the optimistic line on an older baseline nor briefly double-counts it
  on an adopted authoritative baseline.

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

### 7. Align all add-to-cart entry points

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

The single-product section also renders `AddToCartButton` and inherits the same
behavior without a call-site change.

### 8. Lock interactions while the cart is optimistic

`app/components/cart/cart-line-item.tsx`,
`app/components/cart/cart-summary.tsx`

- Disable a line's remove button while that line is optimistic. Synthetic line
  IDs do not exist in Shopify yet and must never be submitted.
- Remove `href` and disable the checkout control while the cart is optimistic.
  Restore both as soon as the authoritative cart lands.
- Quantity controls already disable themselves for optimistic lines; no change
  is needed there.

### 9. Verification

Use the existing Playwright dependency as a lightweight unit runner; do not add
another test framework or start the storefront server:

- Add `playwright.unit.config.ts` with `tests/unit` as its test directory and no
  `webServer`.
- Add `npm run test:unit`.
- Cover distinct pending-add tokens, token-specific clearing, rejection of
  unusable lines, first-add optimistic cart construction, and the
  loading-to-authoritative handoff without count overshoot.
- Keep the existing stale `tests/cart.test.ts` unchanged; repairing the legacy
  browser flow remains a separate task.

Run the manual list below against a throttled dev server:
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
  10. While the add is pending → remove and checkout are disabled; both recover
      after Shopify confirms the cart.
- `npm run biome`, `npm run typecheck`, and `npm run test:unit` clean.

## Files and folders touched

- `.weaverse/specs/2026-07-25--instant-add-to-cart-drawer/`
- `app/components/cart/cart-baseline.ts`
- `app/components/cart/cart-sync.ts`
- `app/components/cart/optimistic-cart.ts`
- `app/components/cart/store.ts`
- `app/components/cart/cart-drawer.tsx`
- `app/components/cart/cart-main.tsx`
- `app/components/cart/cart-line-item.tsx`
- `app/components/cart/cart-summary.tsx`
- `app/components/product/add-to-cart-button.tsx`
- `app/components/product-card/quick-shop.tsx`
- `package.json`
- `playwright.unit.config.ts`
- `tests/unit/cart-store.test.ts`

Verified as needing no change:

- `app/sections/main-product/buy-buttons/index.tsx` and
  `buy-buttons/sticky-atc-bar.tsx` — both render `AddToCartButton`, so they
  inherit the new behavior; the sticky bar's visibility store is independent of
  the drawer's `isOpen`.
