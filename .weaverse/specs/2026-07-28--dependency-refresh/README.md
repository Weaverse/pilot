# Maintenance: July 2026 Dependency Refresh

| Field            | Value                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Status**       | completed                                                    |
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
supported-range packages first and exact-pinned packages second. TypeScript 7
was evaluated last but was rolled back to TypeScript 6 because the current
Hydrogen-compatible React Router release does not support it; the final cleanup
removes five unused direct dependency declarations and the redundant pinned
`@esbuild/linux-x64` optional dependency.

## Scope

- Reinstall dependencies from the lockfile using Node.js 24.
- Update patch/minor releases allowed by existing version ranges.
- Update exact-pinned runtime, UI, and test dependencies.
- Evaluate TypeScript 7 only after the other dependency groups are stable.
- Remove unused direct dependency declarations identified by source, peer-graph,
  clean-install, and build verification.
- Remove the redundant pinned `@esbuild/linux-x64` optional dependency.
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
  Shopify CLI `4.5.2`, Swiper `14.0.6`, and TypeScript `6.0.3`.
- esbuild `0.28.1`, deduplicated to a single copy across the tree.
- Removal of unused direct declarations for `@shopify/hydrogen-react`,
  `graphql-tag`, `@tailwindcss/forms`, `cross-env`, and `ts-node`.
- Removal of the pinned `@esbuild/linux-x64` optional dependency.
- Pilot version `2026.7.28`.

React Router 8 and GraphQL 17 remain intentionally deferred because both are
major upgrades with separate compatibility work. No forced audit fix was run.

## esbuild Optional-Dependency Decision

The refresh originally pinned `@esbuild/linux-x64` as a direct optional
dependency to guarantee the Linux binary for Oxygen builds. Inspecting the
resolved tree showed the pin never took effect: npm hoisted the pinned
`0.28.1` package to the tree root while esbuild — then at `0.27.4` — resolved
its own nested `@esbuild/linux-x64@0.27.4`. The binary esbuild actually loaded
came from the nested copy, so the pin only added a second, unused package.

The pin is removed. esbuild declares every platform binary in its own
`optionalDependencies`, so the lockfile still records all 26 platform packages
including `@esbuild/linux-x64@0.28.1`, and npm installs the one matching the
build platform. Keeping the pin would also require bumping it by hand on every
esbuild upgrade, silently reintroducing the same version skew.

## TypeScript Compatibility Decision

The current `tsconfig.json` already uses supported, explicit settings:

- `moduleResolution: "Bundler"`
- `module: "ES2022"`
- `target: "ES2022"`
- `strict: false`

It does not rely on removed legacy options such as `baseUrl`,
`moduleResolution: "node"`, or an ES5 target, and the application checks pass
with TypeScript `7.0.2`. However, `@react-router/dev@7.16.0` and
`@react-router/node@7.16.0` declare TypeScript support only for versions 5 and
6. Hydrogen `2026.4.4` pins that React Router line, and strict npm resolution
fails with TypeScript 7 even though the repository's `legacy-peer-deps=true`
setting masks the conflict.

TypeScript remains on `6.0.3` until the Hydrogen-compatible React Router release
supports TypeScript 7. The unrelated, unused `ts-node@10.9.2` dependency is
removed rather than retained as dormant tooling.

## Success Criteria

- [x] Clean install succeeds under Node.js 24.
- [x] Supported-range dependencies are updated.
- [x] Exact-pinned dependencies are updated.
- [x] TypeScript 7 is evaluated after the other dependency groups.
- [x] TypeScript is restored to the supported `6.0.3` release.
- [x] Unused direct dependency declarations are removed.
- [x] The redundant pinned `@esbuild/linux-x64` optional dependency is removed
      and every esbuild platform binary remains in the lockfile.
- [x] Code generation and all release verification commands pass.
- [x] Version `2026.7.28` is committed and pushed to `dev`.
- [x] Release PR `#465` and draft release `v2026.7.28` are prepared.
- [x] Final clean install, dependency audit, tests, and build pass.

## References

- [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Release PR #465](https://github.com/Weaverse/pilot/pull/465)
