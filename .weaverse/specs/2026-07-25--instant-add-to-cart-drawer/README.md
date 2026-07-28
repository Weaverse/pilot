# Feature: Instant Add-to-Cart Drawer

| Field            | Value                                          |
| ---------------- | ---------------------------------------------- |
| **Status**       | completed                                      |
| **Owner**        | @hta218                                        |
| **Issue**        | [#464](https://github.com/Weaverse/pilot/issues/464) |
| **Branch**       | `update/instant-add-to-cart-drawer`            |
| **Created**      | 2026-07-25                                     |
| **Last Updated** | 2026-07-27                                     |

## Original Prompt

> I like this idea a lot and want to bring it into Pilot: when the shopper
> clicks add-to-cart, the drawer opens instantly with the newly added item
> already rendered — with a skeleton in the price box, so the real price only
> appears once the add is confirmed. A form of optimistic UI. Sync `main`
> first, then branch off `dev`. Write a new spec that fits Pilot. When it's
> done, commit and open a PR so I can review the spec first.

## Summary

Make Pilot's add-to-cart feel immediate: the cart drawer opens on the very
click that submits the mutation, already showing the added line, with the price
and totals held in a skeleton state until Shopify confirms. The Shopify cart
mutation stays authoritative — nothing about pricing, discounts, or checkout is
guessed client-side, only the presence of the line is anticipated.

## Problem

Pilot already has a zustand-backed optimistic cart (`useCart()`, see
[`../2026-05-14--optimistic-cart-zustand-sync/`](../2026-05-14--optimistic-cart-zustand-sync/))
that keeps quantities and totals consistent during mutations. But the
add-to-cart entry point does not take advantage of it, so the interaction still
feels like a round-trip:

1. **Drawer opens only after the network completes.**
   `add-to-cart-button.tsx` watches the fetcher transition back to `idle` and
   calls `openCartDrawer()` then. The shopper stares at a spinner inside the
   button for the full mutation duration with no feedback that anything is
   happening beyond the button itself.

2. **Nothing is staged on the initiating click.**
   `applyOptimisticMutations` in the cart store derives its optimistic lines
   from `useFetchers()`. React Router only exposes a submitted `CartForm`
   fetcher on the render *after* the click, so even if the drawer were opened
   immediately it would paint one frame without the new line.

3. **First-ever add has no baseline to build on.**
   `applyOptimisticMutations` requires a non-null baseline cart. For a shopper
   with no cart cookie yet, `useCart()` returns `null`, so an instantly-opened
   drawer would render the empty-cart state while the first line is being
   created — the worst possible frame to show.

4. **Optimistic lines drop during the `loading` phase.**
   Only fetchers in state `submitting` are considered. A React Router fetcher
   submission goes `submitting` → `loading` → `idle`; during `loading` the
   optimistic overlay disappears while `serverCart` has not been synced yet,
   producing a flash where the line vanishes and comes back.

5. **The pending button can be submitted twice.**
   `disabled={disabled ?? isLoading}` only falls back to `isLoading` when
   `disabled` is `null`/`undefined`. Every call site passes an explicit boolean
   (`disabled={!selectedVariant?.availableForSale}`), so for an in-stock variant
   the value is `false` and the button stays clickable throughout the mutation
   — a double-click adds the item twice.

6. **A rejected mutation is silent.**
   If Shopify returns `userErrors` or the request fails, the button simply
   stops spinning. No message, and with an instantly-opened drawer the shopper
   would be left looking at a line that never resolves.

## Non-Goals

- Replacing or re-architecting `useCart()` / `CartStoreSync`. This builds on
  the existing store, it does not revisit it.
- Client-side price, discount, tax, or shipping estimation. Money values shown
  in the drawer always come from Shopify; anything not yet confirmed renders as
  a skeleton.
- Changing cart route, checkout flow, analytics payloads, or any public URL.
- Inventory/stock-limit handling on the add button (a separate concern).
- Introducing another test framework. Focused store tests use the existing
  Playwright test runner with a unit-only config that does not start the
  storefront server.

## Success Criteria

- Clicking add-to-cart opens the drawer within the same click, with the added
  line visible (image, title, options, quantity) and its price as a skeleton.
- Works for a first-ever add (no existing cart) as well as adds onto an
  existing cart, and when adding a variant already present in the cart.
- Works on a cold page too: an add clicked before the `/api/cart` bootstrap
  responds shows the line, not the bootstrap spinner.
- Lines already in the cart keep their real prices; only the totals and the
  line being added are skeletoned.
- Two adds in flight at once (e.g. quick shop then sticky bar) do not cancel
  each other's staged line.
- No frame where the line disappears between `submitting` and the server cart
  landing.
- The confirmed cart count never overshoots during the `loading` → `idle`
  handoff (for example `1 → 2 → 1` after the first add).
- The button cannot be submitted twice while a mutation is in flight.
- Optimistic lines cannot be removed, and checkout cannot start, until Shopify
  confirms the pending cart state.
- A rejected add surfaces a visible, retryable error and does not leave a
  phantom line in the drawer. The drawer stays open.
- All four add-to-cart entry points (PDP buy buttons, sticky ATC bar,
  product-card quick shop, single-product section) behave consistently.
- Token isolation and first-add cart construction have automated coverage.
