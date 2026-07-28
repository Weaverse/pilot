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

## 2026-07-28 — Dependency compatibility and unused-dependency cleanup

Audited direct dependencies using repository searches, package scripts, peer
metadata, the installed graph, Knip, and depcheck. Removed five unused direct
declarations:

- `@shopify/hydrogen-react`
- `graphql-tag`
- `@tailwindcss/forms`
- `cross-env`
- `ts-node`

`@shopify/hydrogen-react` remains installed through `@shopify/hydrogen`, and
`graphql-tag` remains installed for the GraphQL code-generation packages. The
other three packages and their now-unneeded transitive nodes were removed from
the lockfile.

TypeScript 7 was rolled back to `6.0.3`. The application itself type-checked
with TypeScript 7, but the Hydrogen-compatible `@react-router/dev@7.16.0` and
`@react-router/node@7.16.0` peer contracts support TypeScript 5 and 6 only.
Strict peer resolution exposed the conflict that the repository's
`legacy-peer-deps=true` setting otherwise masks.

Regenerated the lockfile and verified a clean install with Node.js `24.18.0`
and npm `11.16.0`. The install added 694 packages and audited 695 packages.
npm continued to report 26 transitive vulnerabilities: 4 low, 4 moderate, 17
high, and 1 critical. No forced audit fix was applied.

Final verification:

- Knip dependency-only audit — passed with no unused dependency declarations.
- `npm run biome` — passed with three existing warnings.
- `npm run typecheck` — passed.
- `npm run test:unit` — 10 tests passed.
- `npm run test:cart-correctness` — 17 tests passed.
- `npm run build` — passed with existing dependency/plugin deprecation and
  chunk-size warnings.

## 2026-07-28 — Lockfile reinstall and esbuild pin removal

Reinstalled from `package.json` under Node.js `24.18.0`. Because the reinstall
re-resolved every caret range rather than replaying the lockfile, the dependency
graph shrank from 869 to 782 nodes with 161 transitive version changes. Most of
the shrinkage is deduplication: 44 nested `@shopify/cli/node_modules/@esbuild/*`
packages collapsed into the hoisted copies, and the 20 platform-specific
`@typescript/typescript-*` packages disappeared with the TypeScript 7 rollback.

Reviewing that diff surfaced a latent defect in the earlier esbuild change. The
pinned `@esbuild/linux-x64@0.28.1` optional dependency had been hoisted to the
tree root, while esbuild resolved its own nested `@esbuild/linux-x64@0.27.4`.
esbuild loads the binary adjacent to itself, so the pin was inert and the two
copies would drift apart again on the next esbuild bump. Removed the
`optionalDependencies` block and regenerated the lockfile. esbuild `0.28.1` now
resolves as a single deduplicated copy, and all 26 platform packages — Linux x64
included — remain recorded through esbuild's own optional dependencies.

Transitive majors that moved during the re-resolve: `@babel/runtime` to `8.0.0`
(with `rtl-css-js` keeping a nested 7.x copy), `change-case` to `5.4.4`,
`change-case-all` to `2.1.0`, `auto-bind` to `5.0.1`, `swap-case` to `3.0.3`,
`sponge-case` to `2.0.3`, and `undici-types` to `8.3.0`. The `change-case`
family and `auto-bind` sit under the GraphQL code-generation packages only.
`@types/node` moved to `26.1.2`; it is left as resolved because type checking
passes and the storefront runs on workerd rather than Node.

Verification re-run under Node.js `24.18.0`:

- `npm run biome` — passed with the same three existing warnings.
- `npm run typecheck` — passed.
- `npm run test:unit` — 10 tests passed.
- `npm run test:cart-correctness` — 17 tests passed.
- `npm run build` — exited `0` with the existing `envFile` deprecation and
  chunk-size warnings.

## 2026-07-28 — Release re-dated to 2026.7.28

The release was prepared on 2026-07-27 but ships on 2026-07-28, so the version
follows the ship date per the repository's `YYYY.M.D` convention. Bumped
`package.json` and `package-lock.json` to `2026.7.28`, renamed release PR `#465`,
and retagged the draft release from `v2026.7.27` to `v2026.7.28`. The earlier
`v2026.7.27` tag was never pushed, so no published reference changed.

## 2026-07-28 — Cleared the remaining Biome warnings

The three warnings carried through the whole refresh are now fixed rather than
deferred:

- `app/sections/blog-post.tsx` imported the deprecated `TwitterShareButton`.
  Replaced it with `XShareButton`, which takes the same `url` and `title` props.
  The rendered icon was already `x-logo`, so the markup is unchanged.
- `app/utils/checkout-attribution.ts` had two single-line guard clauses.
  Wrapped both in block statements.

`npm run biome` now reports no warnings across 321 files. Type checking, the 10
unit tests, the 17 cart-correctness tests, and the production build all still
pass under Node.js `24.18.0`.
