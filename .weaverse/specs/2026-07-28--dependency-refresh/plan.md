# Plan

## Approach

Perform the refresh in isolated dependency groups so regressions can be traced
to a small commit:

1. Establish a clean Node.js 24/npm baseline.
2. Update packages already permitted by their version ranges.
3. Update exact-pinned packages.
4. Upgrade TypeScript only after the other groups pass.
5. Apply formatter changes introduced by the new Biome release.
6. Run the full verification matrix before preparing the release.

Major framework and schema-library upgrades stay outside this maintenance
scope. React Router 8 and GraphQL 17 require dedicated compatibility work.

## Implementation Steps

### 1. Establish the clean-install baseline

- [x] Select Node.js `24.15.0`.
- [x] Run `npm ci`.
- [x] Confirm direct dependencies resolve from `package-lock.json`.

Node.js 24 is used instead of the machine's Node.js 26 default because the
current Hydrogen/Oxygen toolchain supports Node.js 22 and 24.

### 2. Update supported-range dependencies

- [x] Update Fontsource Cabin and Newsreader to `5.3.0`.
- [x] Update Radix Navigation Menu to `1.2.22`.
- [x] Update Shopify Hydrogen to `2026.4.4`.
- [x] Update Weaverse Hydrogen to `5.19.2`.
- [x] Update Tailwind CSS and its Vite plugin to `4.3.3`.
- [x] Update Shopify CLI to `4.5.2`.
- [x] Update Biome to `2.5.5`.
- [x] Update Vite to `8.1.5`.
- [x] Update Swiper to `14.0.6`.
- [x] Update `isbot` to `5.2.1`.

### 3. Update exact-pinned dependencies

- [x] Update the existing Radix UI component packages to their latest
      compatible patch releases.
- [x] Update React and React DOM to `19.2.8`.
- [x] Update React Intersection Observer to `10.1.0`.
- [x] Update `graphql-tag` to `2.12.7`.
- [x] Update Playwright to `1.62.0`.
- [x] Update the optional Linux x64 esbuild binary to `0.28.1`.

### 4. Upgrade TypeScript last

- [x] Upgrade TypeScript from `6.0.3` to `7.0.2`.
- [x] Run Hydrogen code generation.
- [x] Confirm the existing `tsconfig.json` is accepted without compatibility
      flags or deprecated options.
- [x] Confirm `tsc --noEmit` passes.

### 5. Apply formatter changes

- [x] Run the upgraded Biome formatter.
- [x] Keep changes limited to import ordering and line wrapping.
- [x] Commit formatter-only changes separately from dependency changes.

### 6. Verify the release candidate

- [x] `npm run biome`
- [x] `npm run typecheck`
- [x] `npm run test:unit`
- [x] `npm run test:cart-correctness`
- [x] `npm run build`

Expected non-failing output:

- Biome reports three existing warnings.
- The build reports existing dependency/plugin deprecation and chunk-size
  warnings.
- npm reports unresolved transitive vulnerabilities; no
  `npm audit fix --force` is applied.

### 7. Prepare the release

- [x] Bump `package.json` and `package-lock.json` to `2026.7.27`.
- [x] Push the dependency commits to `dev`.
- [x] Open release PR `#465` from `dev` to `main`.
- [x] Create the draft release `v2026.7.27` targeting `main`.

### 8. Complete TypeScript tooling cleanup

- [ ] Remove unused `ts-node@10.9.2` from `devDependencies`.
- [ ] Regenerate `package-lock.json` under Node.js 24.
- [ ] Re-run type checking, tests, Biome, and the production build.
- [ ] Update this spec to `completed`.

If a future script needs programmatic TypeScript compiler access before the
TypeScript 7 API stabilizes, add the official TypeScript 6 compatibility package
for that concrete caller instead of retaining an unused global compatibility
dependency.

## Files and Folders Touched

Dependency and release implementation:

- `package.json`
- `package-lock.json`

Biome 2.5 formatting:

- `app/components/cart/cart-main.tsx`
- `app/components/cart/cart-sync.ts`
- `app/components/cart/optimistic-cart.ts`
- `app/routes/cart/cart-page.tsx`
- `tests/cart-correctness.node.mjs`
- `tests/unit/cart-store.test.ts`

Specification and continuation context:

- `.weaverse/specs/2026-07-28--dependency-refresh/README.md`
- `.weaverse/specs/2026-07-28--dependency-refresh/plan.md`
- `.weaverse/specs/2026-07-28--dependency-refresh/work-logs.md`
- `.weaverse/specs/2026-07-28--dependency-refresh/handoff--2026-07-28-08-00--dependency-refresh.md`

External release state:

- GitHub pull request `#465`
- Draft GitHub release `v2026.7.27`

