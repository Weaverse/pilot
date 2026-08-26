# Feature: Optimistic Cart — Custom Zustand Cart Sync

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Status**       | completed                                                      |
| **Owner**        | @paul-phan                                                     |
| **PR**           | [#375](https://github.com/Weaverse/pilot/pull/375) — merged 2026-05-14 |
| **Branch**       | `fix/optimistic-cart`                                            |
| **Created**      | 2026-05-14                                                     |
| **Last Updated** | 2026-05-18                                                     |

## Original Prompt

> Fix the optimistic cart issues in the Pilot template: cart badge not updating instantly when adding items, remove button flickering, and cart total being slow to update with skeleton state.

## Summary

Replaces Hydrogen's `useOptimisticCart` with a custom zustand-based cart sync
(`useCart()`) that fixes cart data inconsistency: stale quantities, visual
"drop-back" flashes, phantom `qty:0`, and `$numCartLines` GraphQL errors during
cart mutations. This is the approach that actually shipped, superseding the
abandoned attempts archived in
[`../2026-04-10--optimistic-cart-fix-attempts/`](../2026-04-10--optimistic-cart-fix-attempts/).

## Problem

Hydrogen's built-in `useOptimisticCart` has three design flaws that cause cart
UI inconsistency:

1. **Double-counting** — it processes ALL fetchers carrying `formData`, including
   completed (idle) ones. When the mutation result is already reflected in the
   baseline cart, the hook re-applies the mutation → shows qty `N+2` instead of
   `N+1`.
2. **Stale root-loader overwrite** — the deferred `cart.get()` promise in the
   root loader is captured before mutations. When it resolves it overwrites the
   fresh post-mutation cart with stale pre-mutation state.
3. **`$numCartLines` undeclared** — `CART_MUTATION_FRAGMENT` copied
   `lines(first: $numCartLines)` from the query fragment, but mutation operations
   don't declare that variable → GraphQL error on add-to-cart.

## Outcome

Shipped and merged in PR #375. Manually verified with rapid consecutive
add-to-cart clicks — cart quantity updates correctly without drop-back flashes
or phantom zeroing. Implementation details in [`plan.md`](./plan.md); the path
from the abandoned attempts to this design is in [`work-logs.md`](./work-logs.md).

**Follow-up (2026-05-18):** fixed a post-merge bug where removing a line item
left the checkout-button total stale (no `store.ts` change required). See
[`plan.md` → Follow-up fixes](./plan.md#follow-up-fixes-post-merge) and the
[`work-logs.md`](./work-logs.md) entry.
