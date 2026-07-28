# Maintenance: July 2026 Dependency Refresh

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | in-progress                                                  |
| **Owner**        | @hta218                                                      |
| **Issue**        | —                                                            |
| **PR**           | [#465](https://github.com/Weaverse/pilot/pull/465)            |
| **Branch**       | `dev`                                                        |
| **Created**      | 2026-07-28                                                   |
| **Last Updated** | 2026-07-28                                                   |

## Original Prompt

> ok, back lại dep update, chú làm 1 + 2 + 3 cho a đi, typescript sẽ update sau cùng
> làm xong hết đi cho a
> Xong thì [$commit](/Users/hta218/.codex/skills/commit/SKILL.md) in multi commits + push + open PR lên main để chuẩn bị [$ship](/Users/hta218/.codex/skills/ship/SKILL.md) version mới nhé

## Summary

Refresh Pilot's dependencies in controlled groups under Node.js 24, updating
supported-range packages first, exact-pinned packages second, and TypeScript 7
last. The upgrade is implemented, verified, pushed to `dev`, and prepared for
release as `v2026.7.27`; one unused TypeScript API consumer (`ts-node`) remains
to be removed before this maintenance item is considered complete.

## Scope

- Reinstall dependencies from the lockfile using Node.js 24.
- Update patch/minor releases allowed by existing version ranges.
- Update exact-pinned runtime, UI, and test dependencies.
- Upgrade TypeScript only after the other dependency groups are stable.
- Apply formatting required by the upgraded Biome toolchain.
- Run code generation, linting, type checking, focused cart tests, unit tests,
  and the production build.
- Bump the release version and prepare a release PR and draft GitHub release.

## Outcome

The refresh includes:

- Shopify Hydrogen `2026.4.4` and Weaverse Hydrogen `5.19.2`.
- React and React DOM `19.2.8`.
- Radix UI patch releases across the existing component set.
- Vite `8.1.5`, Tailwind CSS `4.3.3`, Biome `2.5.5`, Playwright `1.62.0`,
  Shopify CLI `4.5.2`, Swiper `14.0.6`, and TypeScript `7.0.2`.
- The optional Linux x64 esbuild binary `0.28.1`.
- Pilot version `2026.7.27`.

React Router 8 and GraphQL 17 remain intentionally deferred because both are
major upgrades with separate compatibility work. No forced audit fix was run.

## TypeScript 7 Compatibility

The current `tsconfig.json` already uses supported, explicit settings:

- `moduleResolution: "Bundler"`
- `module: "ES2022"`
- `target: "ES2022"`
- `strict: false`

It does not rely on removed legacy options such as `baseUrl`,
`moduleResolution: "node"`, or an ES5 target. Type checking, Hydrogen code
generation, tests, and the production build pass with TypeScript `7.0.2`.

TypeScript 7 does not expose the stable compiler API expected by
`ts-node@10.9.2`. A direct smoke test fails while reading `ts.sys`, and no
repository script or source file uses `ts-node`, so removing that dependency is
the remaining follow-up.

## Success Criteria

- [x] Clean install succeeds under Node.js 24.
- [x] Supported-range dependencies are updated.
- [x] Exact-pinned dependencies are updated.
- [x] TypeScript is upgraded last to `7.0.2`.
- [x] Code generation and all release verification commands pass.
- [x] Version `2026.7.27` is committed and pushed to `dev`.
- [x] Release PR `#465` and draft release `v2026.7.27` are prepared.
- [ ] Remove the unused, TypeScript 7-incompatible `ts-node` dependency.

## References

- [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Release PR #465](https://github.com/Weaverse/pilot/pull/465)

