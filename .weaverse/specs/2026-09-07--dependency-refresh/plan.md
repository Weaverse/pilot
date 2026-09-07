# Plan

## Approach

Two commits, split by whether the change touches `package.json`, so a
regression can be traced to a small diff:

1. Range-permitted updates — lockfile only, `package.json` untouched.
2. Same-major minor bumps — one manifest edit per package.

Node.js 24 is used rather than the machine's Node.js 26 default, matching the
July 2026 refresh: the Hydrogen and Oxygen toolchain supports Node.js 22 and
24.

Major upgrades stay out of scope. Each of TypeScript 7, GraphQL 17, and React
Router 8 changes a compiler, a schema library, or the router that Hydrogen
pins, and each needs its own verification pass.

## Implementation Steps

### 1. Range-permitted updates (lockfile only)

- [x] `@biomejs/biome` 2.5.8 → 2.5.12
- [x] `@shopify/cli` 4.6.1 → 4.7.1
- [x] `@weaverse/hydrogen` 5.20.2 → 5.20.3
- [x] `isbot` 5.2.1 → 5.2.2
- [x] `swiper` 14.1.0 → 14.2.0
- [x] `vite` 8.2.1 → 8.2.2

Applied with `npm update` for these package names only. Biome ships lint and
format rules, so any formatting the new release introduces belongs in this
commit.

### 2. Same-major minor bumps (manifest edit)

- [x] `@graphql-codegen/cli` 7.2.0 → 7.4.0
- [x] `@playwright/test` 1.62.1 → 1.63.0
- [x] `@types/react-dom` 19.2.4 → 19.2.7
- [x] `colord` 2.9.3 → 2.10.0
- [x] `react-intersection-observer` 11.0.0 → 11.0.1

`@playwright/test` is the repository's unit-test runner, so the 193 unit tests
double as its upgrade check.

### 3. Verification

- [x] `npm run biome`
- [x] `npm run typecheck`
- [x] `npm test` — 193 tests
- [x] `npm run build`
- [x] `npm run dev` — storefront routes render
- [x] `npm run weaverse:manifest:check`

## Files and Folders Touched

- `package.json` — dependency versions for step 2 only
- `package-lock.json` — both steps
- `.weaverse/specs/2026-09-07--dependency-refresh/` — this spec

No application source is expected to change. Any source edit would come from a
Biome formatting rule introduced by the upgraded release, and is recorded in
the work logs if it happens.

## Out of Scope

- `typescript` 7.0.2, `graphql` 17.0.2, `react-router` and
  `@react-router/dev` 8.3.1 — deferred, see the spec README.
- `@shopify/mini-oxygen` — its `latest` dist-tag is below the installed
  version; nothing to update to.
- The five open React Router Dependabot alerts, which the deferral leaves in
  place.
