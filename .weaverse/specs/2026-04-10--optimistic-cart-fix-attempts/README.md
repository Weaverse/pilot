# Feature: Optimistic Cart Fix — Abandoned Design Attempts

| Field            | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Status**       | deprecated                                                     |
| **Owner**        | @paul-phan                                                     |
| **Branch**       | `fix/optimistic-cart`                                           |
| **Created**      | 2026-04-10                                                     |
| **Last Updated** | 2026-05-18                                                     |

## Original Prompt

> Fix the optimistic cart issues in the Pilot template: cart badge not updating instantly when adding items, remove button flickering, and cart total being slow to update with skeleton state.

## Summary

Archive of two abandoned design attempts at fixing the optimistic cart. Neither
shipped. Both were superseded by the custom zustand-based cart sync delivered in
PR #375 — see [`../2026-05-14--optimistic-cart-zustand-sync/`](../2026-05-14--optimistic-cart-zustand-sync/).

## Why these are deprecated

Both approaches kept Hydrogen's `useOptimisticCart` and tried to fix the UI
symptoms around it (where the hook was called, how the badge/drawer subscribed
to the deferred cart promise). Investigation during implementation found
`useOptimisticCart` itself has design flaws — double-counting idle fetchers, the
stale deferred root-loader overwrite, and the undeclared `$numCartLines` mutation
variable — that none of these approaches addressed. The feature was ultimately
solved by replacing `useOptimisticCart` entirely with a custom zustand sync.

## Contents

| File | Attempt | Outcome |
|------|---------|---------|
| `2026-04-10-optimistic-cart-fix-design.md` | Lift `useOptimisticCart` from `CartMain` into `CartDrawer` / `CartRoute` | Abandoned (self-marked `superseded`) |
| `2026-04-10-optimistic-cart-fix.md` | 592-line implementation plan for the lift approach | Abandoned — never executed |
| `2026-04-13-optimistic-cart-split-design.md` | Split trigger/drawer into two independent `<Await>` + `useOptimisticCart` blocks | Abandoned |

> Note: original filenames are preserved intentionally. This is a tombstone
> archive, so the standard SDD `plan.md` / `README.md` file layout is not
> enforced for the historical documents themselves.

## Superseded by

- Shipped spec: [`../2026-05-14--optimistic-cart-zustand-sync/`](../2026-05-14--optimistic-cart-zustand-sync/)
- Related stale spec (lift approach, abandoned): [`../2026-04-10--optimistic-cart-fix/`](../2026-04-10--optimistic-cart-fix/)
- PR: <https://github.com/Weaverse/pilot/pull/375>
