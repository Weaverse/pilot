# Feature: Agent-Readable Component Manifest and Sensitivity Audit

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | in-progress                                                   |
| **Owner**        | @paul-phan                                                    |
| **Issue**        | Weaverse/pilot#452                                            |
| **Parent RFC**   | Weaverse/weaverse#493                                         |
| **Depends on**   | Weaverse/weaverse#505 (`@weaverse/schema@0.13.0`)             |
| **Branch**       | `feat/agent-component-manifest`                               |
| **Created**      | 2026-07-25                                                    |
| **Last Updated** | 2026-07-25                                                    |

## Problem

Pilot's component contract exists only as TypeScript spread across 30 section
directories and 84 registry entries. Nothing machine-readable describes what
components exist, what settings they accept, which defaults are safe to read,
or which values must never leave the server.

That blocks the parent RFC. An agent proposing composition changes has no way
to know that `ali-reviews` accepts an API key, that `main-product` may only be
placed on product pages, or that a given availability rule can only be resolved
by the deployed runtime. Without a versioned artifact there is also no hash to
bind a proposal to the exact theme build it was authored against.

Three concrete defects follow from the same gap:

1. **Duplicate registrations.** `app/weaverse/components.ts` registers 84
   entries but only 82 are unique. `Blogs` and `BlogPost` are each listed
   twice. Nothing catches this.
2. **Unclassified secret.** `ali-reviews` exposes `aliReviewsApiKey`, a
   third-party bearer token, as an ordinary `text` input with no sensitivity
   marking.
3. **No CI.** `.github/workflows/` contains only a manually dispatched Claude
   review. There is no automated typecheck, lint, or schema validation on any
   pull request.

## Goal

Make Pilot the first repository-native, agent-readable Weaverse theme:

- Commit a deterministic, versioned `.weaverse/component-manifest.json`.
- Fail CI when that artifact drifts from the source schemas.
- Give every component and theme setting an explicit sensitivity review.
- Document design constraints for humans (`DESIGN.md`) and agents
  (`.agents/weaverse.md`).

## Non-Goals

- Merchant page export. The manifest describes the theme's capabilities, never
  a merchant's content.
- Proposal, preview, approval, or publication APIs.
- Shopify Standard Actions/Events and storefront WebMCP, tracked separately by
  Weaverse/builder#2657.
- Replacing the schema validator with theme-local heuristics. The name-based
  audit is a review aid; `sensitive: true` is the security boundary.

## Constraints

- The manifest must contain no merchant values and no secrets.
- Generation must not execute loaders, evaluate availability callbacks, or read
  merchant pages.
- The generator is build-time only. Nothing it imports may reach the browser
  bundle or the Oxygen worker.
- Regenerating without source changes must produce byte-identical output.

## Dependency Note

This work requires `@weaverse/schema@0.13.0`, which introduces both the
`sensitive` input flag and the `@weaverse/schema/manifest` subpath.

`@weaverse/hydrogen@5.18.0` pinned `@weaverse/schema@0.12.0` exactly, so that
surface was unreachable from any theme. Confirmed by probe:

```
error TS2353: 'sensitive' does not exist in type 'BasicInput'.
```

Unblocked upstream by releasing `@weaverse/hydrogen@5.19.0`, which pins
`@weaverse/schema@0.13.0`. Pilot upgrades to `^5.19.0` as part of this change.
An npm `overrides` entry was rejected as a workaround: Pilot is the reference
theme, and every downstream theme would inherit the same stale pin.
