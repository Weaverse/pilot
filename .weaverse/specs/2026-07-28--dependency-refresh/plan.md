# Plan

## Approach

Perform the refresh in isolated dependency groups so regressions can be traced
to a small commit:

1. Establish a clean Node.js 24/npm baseline.
2. Update packages already permitted by their version ranges.
3. Update exact-pinned packages.
4. Evaluate TypeScript 7 only after the other groups pass.
5. Apply formatter changes introduced by the new Biome release.
6. Remove unused direct dependency declarations and retain the latest
   TypeScript version supported by the current React Router line.
7. Run the full verification matrix before preparing the release.

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
- [x] Evaluate `graphql-tag` `2.12.7`; the direct declaration is removed in the
      final cleanup because only transitive codegen consumers use it.
- [x] Update Playwright to `1.62.0`.
- [x] Update the optional Linux x64 esbuild binary to `0.28.1`.

### 4. Evaluate TypeScript 7 last

- [x] Upgrade TypeScript from `6.0.3` to `7.0.2`.
- [x] Run Hydrogen code generation.
- [x] Confirm the existing `tsconfig.json` is accepted without compatibility
      flags or deprecated options.
- [x] Confirm `tsc --noEmit` passes.
- [x] Check strict peer resolution rather than relying on
      `legacy-peer-deps=true`.
- [x] Confirm React Router 7 supports TypeScript 5 and 6 but not TypeScript 7.
- [x] Restore TypeScript `6.0.3` until Hydrogen supports the React Router line
      that accepts TypeScript 7.

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

- Biome reports three existing warnings, cleared in step 11.
- The build reports existing dependency/plugin deprecation and chunk-size
  warnings.
- npm reports unresolved transitive vulnerabilities; no
  `npm audit fix --force` is applied.

### 7. Prepare the release

- [x] Bump `package.json` and `package-lock.json` to `2026.7.27`.
- [x] Push the dependency commits to `dev`.
- [x] Open release PR `#465` from `dev` to `main`.
- [x] Create the draft release `v2026.7.27` targeting `main`.

### 8. Complete dependency compatibility and unused cleanup

- [x] Remove unused direct declarations for `@shopify/hydrogen-react`,
      `graphql-tag`, `@tailwindcss/forms`, `cross-env`, and `ts-node`.
- [x] Restore TypeScript from `7.0.2` to `6.0.3`.
- [x] Regenerate `package-lock.json` under Node.js 24.
- [x] Confirm `@shopify/hydrogen-react` and `graphql-tag` remain available to
      their transitive consumers.
- [x] Re-run dependency audit, type checking, tests, Biome, and the production
      build.
- [x] Update this spec to `completed`.

If a future script needs `ts-node`, add a supported TypeScript execution tool
for that concrete caller instead of retaining unused global tooling.

### 9. Remove the redundant esbuild optional-dependency pin

- [x] Confirm the pinned `@esbuild/linux-x64` package was hoisted to the tree
      root while esbuild loaded its own nested copy at a different version.
- [x] Remove the `optionalDependencies` block from `package.json`.
- [x] Regenerate `package-lock.json` under Node.js 24.
- [x] Confirm all 26 esbuild platform packages, including
      `@esbuild/linux-x64@0.28.1`, remain recorded as esbuild's own optional
      dependencies.
- [x] Re-run Biome, type checking, unit tests, cart-correctness tests, and the
      production build.

Do not reintroduce a per-platform esbuild pin. esbuild already declares every
platform binary, and a hand-maintained pin drifts out of sync on each upgrade.

### 10. Re-date the release

- [x] Bump `package.json` and `package-lock.json` from `2026.7.27` to
      `2026.7.28` because the release ships a day after it was first prepared.
- [x] Rename release PR `#465` to `v2026.7.28`.
- [x] Retag and rename the draft release to `v2026.7.28`.

### 11. Clear the remaining Biome warnings

- [x] Replace the deprecated `TwitterShareButton` with `XShareButton`.
- [x] Wrap the two guard clauses in `appendForwardedAttribution` in block
      statements.
- [x] Confirm `npm run biome` reports no warnings.

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
- Draft GitHub release `v2026.7.28`
