# Work Logs

## 2026-04-10 — @paul-phan
- Identified three optimistic cart issues: stale badge/title on add-to-cart,
  remove-item flicker, slow cart total skeleton.
- Designed **Attempt 1**: lift Hydrogen's `useOptimisticCart` from `CartMain`
  into `CartDrawer` / `CartRoute` so badge, title, line items, and summary
  share one optimistic state; remove the dual `OptimisticInput` + CSS-hide
  removal mechanism.
- Wrote a 592-line implementation plan for the lift approach.
- Archived: `../2026-04-10--optimistic-cart-fix-attempts/2026-04-10-optimistic-cart-fix-design.md`
  and `...-fix.md`.

## 2026-04-13 — @paul-phan
- Lift approach abandoned. Designed **Attempt 2**: split the trigger badge and
  drawer content into two independent `<Await>` + `useOptimisticCart` blocks
  (matching the Hydrogen skeleton pattern); drop the `lastCartRef` hack which
  had caused deleted items to reappear.
- Archived: `../2026-04-10--optimistic-cart-fix-attempts/2026-04-13-optimistic-cart-split-design.md`.

## ~2026-05-14 — @paul-phan
- Both prior attempts abandoned. Root finding: `useOptimisticCart` **itself**
  is flawed — double-counts idle fetchers, gets overwritten by the stale
  deferred root-loader promise, and the mutation fragment referenced an
  undeclared `$numCartLines`. Lifting or splitting the hook could not fix
  these.
- Decided to **replace `useOptimisticCart` entirely** with a custom
  zustand-based `useCart()` sync (see `plan.md`).
- Shipped in PR #375 (`fix/optimistic-cart`), merged 2026-05-14.
- Manually verified with rapid consecutive add-to-cart clicks.

## 2026-05-18 — @hta218
- Reconciled the spec folder with reality:
  - Moved the 3 loose root-level markdown files into the SDD-compliant
    `../2026-04-10--optimistic-cart-fix-attempts/` archive (status `deprecated`).
  - Created this folder to document the shipped zustand approach.
  - Marked the stale `../2026-04-10--optimistic-cart-fix/` lift-approach folder
    `deprecated` (abandoned, never implemented).

## 2026-05-18 — @hta218 (follow-up fix)
- **Bug:** removing a line item via the trash button did not update the
  checkout-button total (drawer and page). The total only refreshed on a
  later add / quantity change.
- **Root cause:** the remove `CartForm` used an anonymous fetcher, and the
  only thing syncing its response (`ItemRemoveButtonInner`) unmounts the
  instant the line is optimistically spliced out — so React Router discards
  the fetcher and the authoritative post-remove cart (with the correct
  `cost`) is lost. Both fallbacks in `store.ts` (`applyOptimisticMutations`
  and the `removedLineIds` tombstone filter) recompute `totalQuantity` but
  never `cost`.
- **Fix:** gave the remove `CartForm` a stable `fetcherKey="cart-line-remove"`
  and read it from the always-mounted `CartSummary` via
  `useFetcher({ key: "cart-line-remove" })` + `useCartFetcherSync(...)`,
  mirroring the existing discount-code / gift-card removal pattern. Also
  added it to `isCartUpdating` so the total shows a skeleton during the
  transition instead of flashing the stale value.
- **No `store.ts` changes** — the tombstone / `useCart()` design held up; the
  gap was purely a missing keyed fetcher. Server-computed cost is now used
  (accurate with cart-level discounts/taxes — no client-side cost math).
- Verified manually: removing a non-last item updates the total correctly in
  both drawer and page; rapid multi-remove converges.
