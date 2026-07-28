# Handoff Context - 2026-07-28 08:00

> Historical snapshot. See `README.md` and `work-logs.md` for the final
> compatibility decision and completed dependency cleanup.

## Project

- Repository: `Weaverse/pilot`
- Branch: `dev`
- Spec: `.weaverse/specs/2026-07-28--dependency-refresh`
- Last Updated: `2026-07-28-08-00`
- Release PR: [#465](https://github.com/Weaverse/pilot/pull/465)

## Current Status

### What's Been Done

- Refreshed supported-range and exact-pinned dependencies in isolated commits.
- Upgraded TypeScript last, from `6.0.3` to `7.0.2`.
- Applied Biome 2.5 formatting changes separately.
- Updated the optional Linux esbuild binary to `0.28.1`.
- Bumped Pilot to version `2026.7.27`.
- Passed Biome, type checking, 10 unit tests, 17 cart correctness tests, and the
  production build under Node.js 24.
- Pushed the implementation commits to `dev`.
- Opened release PR `#465` and prepared draft release `v2026.7.27`.
- Confirmed the existing TypeScript configuration requires no TS7 migration.

### What's In Progress

- Release PR `#465` is open from `dev` to `main`.
- This spec and handoff capture the retrospective dependency work and the
  remaining TypeScript tooling cleanup.
- No runtime implementation change is currently in progress.

### What's Next

1. Remove the unused `ts-node@10.9.2` entry from `package.json`.
2. Regenerate `package-lock.json` using Node.js 24 and npm.
3. Re-run `npm run biome`, `npm run typecheck`, `npm run test:unit`,
   `npm run test:cart-correctness`, and `npm run build`.
4. Update the spec status from `in-progress` to `completed`.
5. Review and merge PR `#465`, then publish draft release `v2026.7.27` when
   approved.

## Technical Context

### Modified Files

- `package.json:49` — refreshed runtime dependency versions.
- `package.json:92` — refreshed development tooling and TypeScript.
- `package.json:111` — updated the optional Linux esbuild binary.
- `package-lock.json:1` — regenerated dependency graph and release version.
- `tsconfig.json:9` — existing TS7-compatible compiler options; unchanged.
- Cart and cart-test files listed in `plan.md` — formatter-only changes required
  by Biome 2.5.
- `.weaverse/specs/2026-07-28--dependency-refresh/` — retrospective spec,
  work log, and this handoff.

### Key Decisions

- Use Node.js 24 rather than the machine's Node.js 26 default because the
  current Hydrogen/Oxygen stack supports Node.js 22 and 24.
- Keep dependency groups in separate commits for traceability.
- Upgrade TypeScript only after all other dependency groups pass.
- Keep React Router on `7.16.0` and GraphQL on `16.14.2`; their next releases
  are major migrations outside this maintenance scope.
- Do not run `npm audit fix --force`.
- Remove unused `ts-node` instead of carrying a TypeScript 6 compatibility
  layer with no caller.

### Known Issues

- `ts-node@10.9.2` is incompatible with TypeScript 7. A smoke test fails with
  `TypeError: Cannot read properties of undefined (reading 'fileExists')`.
- npm install reports 26 transitive vulnerabilities: 4 low, 4 moderate,
  17 high, and 1 critical. A full audit report was not produced because the
  execution environment blocked sending the dependency graph to the external
  audit service.
- Biome passes with three existing warnings:
  - one deprecated `TwitterShareButton` use in `app/sections/blog-post.tsx`;
  - two block-statement warnings in `app/utils/checkout-attribution.ts`.
- The production build passes with existing plugin deprecation and chunk-size
  warnings.

## Dependencies & Prerequisites

- Use npm, not pnpm or yarn.
- Use Node.js 24; the verified local version is `24.15.0`.
- Run `npm ci` for a clean dependency baseline.
- GitHub operations must use `git` and `gh` CLI under the user's `hta218`
  identity; do not use a GitHub connector.

## Additional Notes

- Commits for this refresh:
  - `e0ee30cb` — Update dependencies within supported ranges
  - `99740529` — Update pinned UI and test dependencies
  - `386e88a3` — Upgrade TypeScript to 7.0.2
  - `53706166` — Format cart files with Biome 2.5
  - `98f3ebcd` — Update optional Linux esbuild binary
  - `b8c37973` — Bump version to 2026.7.27
- The user explicitly requested that this handoff be included in the following
  documentation commit and pushed to `dev`.
