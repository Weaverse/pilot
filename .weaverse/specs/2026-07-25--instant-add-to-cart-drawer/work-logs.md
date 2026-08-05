# Work Logs

## 2026-07-25 — @hta218

Spec reviewed against the code, then implemented.

**Spec revisions before coding** — the original plan was accurate on all six
problems it identified, but had gaps:

- The `cartBootstrapResolved` gate in `cart-drawer.tsx` was filed as
  "verify only". It is a hard blocker: a cold-page add would open the drawer
  onto the bootstrap spinner. Promoted to its own step.
- A single `pendingAddCart` slot could not survive two concurrent adds — the
  first fetcher to settle would clear the second's stage. Changed to a
  token-keyed map.
- "Zero all money fields" was ambiguous. Split: cart-level cost zeroed, the new
  synthetic line zeroed, existing lines' own cost left untouched (they skeleton
  per line, so blanking them would hide prices that were never in question).
- Staging read `serverCart` directly while `useCart()` resolves its baseline
  from three sources — a stale stage would make the drawer jump backwards.
  Extracted `resolveBaselineCart()` for both.
- Clearing the stage relied on effect-vs-`queueMicrotask` ordering. Replaced
  with an `updatedAt` staleness comparison; the explicit clear is now cleanup.
- Quick shop closed its dialog on success, leaving two overlays stacked for the
  whole mutation. Moved to `onAddStart` (same tick as the drawer opening).
- The failure path made a latent crash reachable: `AddToCartAnalytics` reads
  `fetcherData.cart.id` unguarded, and a failed add returns no cart.
- Step 6 planned unit tests; the repo has no unit-test runner.

**Implementation notes**

- Discovered while wiring the staged add: the stage and the fetcher-derived
  optimism describe the *same* mutation and would both bump the quantity on any
  render where both are visible. `applyAddLines` now reports the merchandise IDs
  it handled, and fetcher `LinesAdd` lines matching a staged ID are skipped.
- `applyOptimisticMutations` also now treats `loading` fetchers as pending
  (problem 4), which is what keeps a second concurrent add visible after its
  stage goes stale.

**Deferred**

- `tests/cart.test.ts` is already stale — it targets `data-test` hooks
  (`subtotal`, `close-cart`, `price`, `collection-grid`, `product-grid`) that no
  longer exist in the app; only `item-quantity` and `add-to-cart` remain. New
  e2e specs on top of it would be unverifiable, so repairing the suite is a
  follow-up and this feature ships on the manual checklist in `plan.md` §8.
**Tooling note**: verified with `npm run biome` and `npm run typecheck` — both
clean. (First attempt used pnpm, which `AGENTS.md` already rules out; it fails on
`ERR_PNPM_IGNORED_BUILDS` and leaves a stray `pnpm-lock.yaml` behind.)

### QA round 1 — two bugs, both from diverging from the reference impl

Manual QA found the PDP/sticky/single-product adds working but flickering, and
quick shop not adding at all. Both traced to decisions where this
implementation departs from `theoutnet-hydrogen` (the storefront this pattern
originally shipped in, which QA'd clean):

**1. Line item flickered for the whole pending window (all entry points).**
`applyAddLines` minted `optimistic-${crypto.randomUUID()}` for the synthetic
line. The reference impl builds its optimistic cart **once**, at stage time,
and stores it — so its UUID is stable. This impl composes the cart at read time
in `useCart()` (needed for concurrent adds), so the id was regenerated on every
render: new `key` on `<CartLineItem>` → remount → image reload → flicker, and
`useOptimisticData(line.id)` re-keyed each pass. Fixed by deriving the id from
the merchandise ID.

**2. Quick shop never sent the request.** `onAddStart` closed the Radix dialog
synchronously inside the click handler, so the form unmounted before the
browser ran its default submit action — no POST at all, an optimistic line for
a mutation that never happened, and nothing in the cart after reload. The
review that introduced this argued closing on success would stack two overlays
for the whole mutation; that was right, but the fix has to fire after the
submission starts, not before. Replaced with `onSubmitting` (effect on the
`submitting` transition).

The first fix for this deferred the close to a `submitting` effect, which then
needed a keyed fetcher (an unkeyed one is owned by its component, so closing
mid-flight orphans the response) plus a `CartDrawer` sync for that key, plus
stage pruning for tokens whose button unmounted. All of that was scaffolding to
support closing the dialog at all.

**Decision: don't close it.** The drawer's portal mounts after the dialog's, so
at equal z-index it paints on top — the shopper sees exactly what they need,
and closing the drawer returns them to the dialog to add another variant. That
deleted the fetcher key, the drawer-side sync, the `onSubmitting`/`onSettled`
props, the lifted `onRequestClose` state, the stage pruning, and a
`cart-drawer → product-card` import that pointed the wrong way through the
layers. It also fixes a loose end for free: the button stays mounted, so a
failed quick-shop add still surfaces its error. Cost is two overlays dimming
the backdrop twice. The stale `TODO` about the overlap was removed.

**Worth noting for the reference impl** (`theoutnet-hydrogen`), found while
comparing: `fetcherData.cart.id` is read unguarded in its analytics effect
despite it having a real failure path, and `createEmptyOptimisticCart()` is
unreachable (`useCart()` returns early on a null baseline above its only call
site).

**Not yet done**: QA round 2 on the 9 scenarios in `plan.md` §8.

## 2026-07-25 — Review follow-up

Checkpointed the reviewed implementation before making follow-up changes:

- `54e5ad75` — Stage optimistic cart additions in the cart store
- `9c747735` — Open the cart drawer with staged additions
- `d6452f4a` — Document the instant cart drawer implementation

Synchronized the spec with the implemented line-based pending-add model and all
four add-to-cart entry points. Optimistic cart lines now disable removal, and
checkout stays disabled until the cart update settles.

Added a standalone Playwright unit-test configuration and four cart-store tests
covering concurrent pending tokens, invalid optimistic input, stale error
clearing, and the first-add empty-cart path.

Verification:

- `npm run test:unit` — 4 passed
- `npm run biome` — passed with 3 pre-existing warnings
- `npm run typecheck` — passed

## 2026-07-26 — Authoritative handoff count fix

Manual PDP QA found the drawer count briefly overshooting after a successful
add (`1 → 2 → 1` on the first add and `2 → 3 → 2` on the second).

React Router keeps the add fetcher in `loading` with both its submitted
`formData` and authoritative action-result cart while revalidating loaders.
During that window, the `/api/cart` fetcher can advance `serverCart` to the
same authoritative version. `applyOptimisticMutations()` then reapplied the
still-loading add input to a baseline that already contained it.

The cart store now skips a loading add whose result is already represented by
the baseline. Cart timestamps establish ordering; touched-line quantities
disambiguate equal timestamps. A separate regression verifies that an older
baseline still receives the loading overlay, preserving the no-disappearance
behavior.

Added regression coverage for:

- first add staying at authoritative quantity `1`, never flashing to `2`;
- second add staying at authoritative quantity `2`, never flashing to `3`;
- an older baseline still receiving the pending add overlay.

## 2026-07-26 — Cart module split

Reviewed the 800-line `app/components/cart/store.ts` after the authoritative
handoff fix. No obsolete optimistic mutation path remained, but four unrelated
responsibilities had accumulated in one module. Split them into:

- `store.ts` for Zustand state and `useCart()`;
- `optimistic-cart.ts` for cart transforms and removal tombstones;
- `cart-baseline.ts` for authoritative freshness and bootstrap race state;
- `cart-sync.ts` for React Router effects.

Removed two pieces of redundant state during the move:

- Zustand's `cartBootstrapRequestToken`, which was written but never read;
- the unbounded `cartBootstrapEpochByToken` map, because responses are already
  restricted to the single current request token. A single current-request
  epoch snapshot preserves the same null-cart race guard.

Callers now import sync and baseline APIs from their owning modules instead of
using `store.ts` as a barrel. Optimistic regression tests import the pure
transforms directly.

Verification:

- `npm run test:unit` — 8 passed;
- `npm run typecheck` — passed;
- `npm run build` — passed with pre-existing Rolldown/plugin warnings;
- `npm run biome` — could not start because local `node_modules` contains
  Biome/config versions older than those declared in `package.json`.

## 2026-07-27 — Stable line identity at authoritative handoff

Manual QA found one remaining visual remount after a successful add. The
synthetic line ID was stable during the optimistic window, but Shopify replaced
it with the authoritative cart line ID when the mutation settled.
`CartMain` used that changing ID as the React key, so the entire row remounted:
the title flashed and `Image` reset its local load state.

Cart rows now use merchandise ID as their presentation key when it is unique in
the cart. This matches the optimistic pipeline's existing merge identity and
keeps the row mounted across the handoff without changing the real line ID used
by cart mutations. Duplicate merchandise IDs fall back to Shopify line IDs to
avoid React key collisions. Added a regression proving the optimistic and
authoritative versions receive the same render key.

Verification:

- `npm run test:unit` — 10 passed;
- `npm run typecheck` — passed;
- `git diff --check` — passed.

## 2026-07-27 — Completion

Manual QA confirmed the instant drawer, authoritative count handoff, and stable
line rendering. Marked the feature completed and linked its tracking issue,
[#464](https://github.com/Weaverse/pilot/issues/464), to PR
[#453](https://github.com/Weaverse/pilot/pull/453).
