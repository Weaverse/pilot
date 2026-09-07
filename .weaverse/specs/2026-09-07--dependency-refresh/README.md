# Maintenance: September 2026 Dependency Refresh

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | completed                                                    |
| **Owner**        | @hta218                                                      |
| **Issue**        | —                                                            |
| **PR**           | —                                                            |
| **Branch**       | `update/dependency-refresh`                                  |
| **Created**      | 2026-09-07                                                   |
| **Last Updated** | 2026-09-07                                                   |

## Original Prompt

> Check the dependency updates available for this project.
>
> Do groups 1 and 2 first — the in-range updates and the same-major minor
> bumps — leaving the major upgrades for separate, dedicated work.

## Summary

Refresh Pilot's dependencies in two low-risk groups: packages already permitted
by their declared version ranges, then same-major minor releases that require a
manifest change. The four major upgrades available at this date — TypeScript 7,
GraphQL 17, and React Router 8 with `@react-router/dev` — stay out of scope
because each needs its own compatibility work.

## Scope

- Update packages already allowed by their existing version ranges.
- Update same-major minor releases that require editing `package.json`.
- Leave `@shopify/mini-oxygen` untouched: its `latest` dist-tag points at
  `4.0.0`, below the installed `4.2.2`.
- Run linting, type checking, unit tests, the production build, and a dev
  server smoke test.

## Deferred, With Reasons

| Package | Current | Latest | Why deferred |
| ------- | ------- | ------ | ------------ |
| `typescript` | 6.0.3 | 7.0.2 | `@react-router/dev@7.16.0` declares TypeScript 5 and 6 support only. Unchanged since the July refresh reached the same conclusion. |
| `graphql` | 16.14.2 | 17.0.2 | Major schema-library upgrade; needs dedicated codegen verification. |
| `react-router`, `@react-router/dev` | 7.16.0 | 8.3.1 | `@shopify/hydrogen@2026.4.5` declares peer `react-router: ~7.16.0`, and 2026.4.5 is the latest stable Hydrogen. |

The React Router deferral also leaves Pilot's five open Dependabot alerts in
place; they are the only runtime-scope alerts remaining after the September
override work. Their minimum fix is `7.18.3`, still outside Hydrogen's peer
range. Note that `.npmrc` sets `legacy-peer-deps=true`, so npm would not refuse
the upgrade — the peer constraint has to be respected deliberately.

## Outcome

Range-permitted: Biome `2.5.12`, Shopify CLI `4.7.1`, Weaverse Hydrogen
`5.20.3`, isbot `5.2.2`, Swiper `14.2.0`, Vite `8.2.2`.

Exact-pinned minors: GraphQL Code Generator CLI `7.4.0`, Playwright `1.63.0`,
React DOM types `19.2.7`, colord `2.10.0`, react-intersection-observer
`11.0.1`.

No application source changed. The upgraded Biome release reports no formatting
change across the 363 checked files, and re-running codegen against the new CLI
produced no change to the generated types.

## Playwright Browser Revision

The Playwright bump changes the browser revision, so `npx playwright install`
is required before `npm test` passes again. Three tests in
`tests/unit/api-locale-boundary.test.ts` launch a real Chromium through
`tests/support/browser-render.ts`; without a matching binary they fail with
Playwright's "just installed or updated" notice.

The first run after downloading the browser also failed one of those three on
`playwright.unit.config.ts`'s 5-second `timeout`, which a cold browser launch
can exceed. Three consecutive runs afterwards were 193 passing. The timeout is
left as-is: raising it belongs to a change about test-suite ergonomics, not to
a dependency refresh.

## Success Criteria

- [x] Range-permitted dependencies are updated.
- [x] Same-major minor dependencies are updated.
- [x] Biome, type checking, unit tests, and the production build pass.
- [x] The dev server boots and renders storefront routes.
- [x] No major upgrade is included.
