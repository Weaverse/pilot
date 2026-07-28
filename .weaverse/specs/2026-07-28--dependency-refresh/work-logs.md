# Work Logs

## 2026-07-27 — Dependency refresh and release preparation

Started from a clean `dev` worktree and selected Node.js `24.15.0`. `npm ci`
completed successfully and corrected stale local tooling before dependency
updates began.

Updated dependencies in separate, verified groups:

- `e0ee30cb` — Update dependencies within supported ranges
- `99740529` — Update pinned UI and test dependencies
- `386e88a3` — Upgrade TypeScript to 7.0.2
- `53706166` — Format cart files with Biome 2.5
- `98f3ebcd` — Update optional Linux esbuild binary
- `b8c37973` — Bump version to 2026.7.27

Verification completed under Node.js 24:

- `npm run biome` — passed with three existing warnings.
- `npm run typecheck` — passed.
- `npm run test:unit` — 10 tests passed.
- `npm run test:cart-correctness` — 17 tests passed.
- `npm run build` — passed with existing dependency/plugin and chunk-size
  warnings.

`npm outdated` showed only React Router 8 and GraphQL 17 after the refresh.
Both remain deferred major upgrades. npm install reported 26 transitive
vulnerabilities; no forced audit fix was applied.

Pushed the six commits to `dev`, opened release PR
[#465](https://github.com/Weaverse/pilot/pull/465), and created draft release
`v2026.7.27` targeting `main`.

## 2026-07-28 — TypeScript 7 compatibility review

Reviewed `tsconfig.json` against TypeScript 7 behavior. The project explicitly
sets its module resolution, module, target, and strictness, and uses none of the
removed legacy options. Type checking and the prior full verification confirm
that no TypeScript configuration migration is required.

Found one tooling incompatibility:

- `ts-node@10.9.2` expects the legacy TypeScript compiler API.
- TypeScript 7 does not expose that stable API.
- A direct `ts-node` smoke test fails while reading `ts.sys.fileExists`.
- Repository search found no script or source file that uses `ts-node`.

Decision: remove `ts-node` as a focused follow-up, regenerate the lockfile under
Node.js 24, re-run verification, and then mark this spec completed.

Created this retrospective spec and the accompanying handoff so another
developer or agent can complete that cleanup without reconstructing the
dependency history.

