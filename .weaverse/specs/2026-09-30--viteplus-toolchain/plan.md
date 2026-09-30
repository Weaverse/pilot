# Plan

## Approach

Replace Pilot's former static-check execution path with Vite+ 1.0.0 only after preserving a locked baseline. Keep Hydrogen, React Router, mini-Oxygen, codegen, preview, deploy, Playwright, and npm behaviors intact. Treat Vite+ as static checking only; keep `tsc --noEmit` as the TypeScript gate.

## Implementation Steps

1. Capture baseline install, static checks, typecheck, manifest check, audit, route check, production build, formatter diagnostics, generated declaration hashes, and build artifact paths and sizes.
2. Resolve Vite+ 1.0.0 registry metadata and installed package graph. Add exact Vite+ dependency and any required compatible Vite core alias without introducing a second standalone Vite copy.
3. Port effective static policy into Vite+ configuration where supported: JavaScript formatting style, governed include/exclude boundaries, warning/error behavior, Tailwind class sorting for `clsx`/`cva`/`cn`, React hooks rules, JSX accessibility rules, available lint rules, and a SonarJS cognitive-complexity guard at error max 50. Accept one measured one-time Oxfmt reflow for governed Pilot source and test files while preserving Markdown exclusion and reviewing import declaration order, Tailwind token multisets, JSX shape, and lint directives.
4. Remove the previous static-check toolchain from active use after a clean npm install proves the SonarJS/Oxlint replacement, including 51-fails and <=50-passes threshold controls.
5. Update package scripts and CI to run `vp check`; preserve explicit `npm run typecheck`, all Hydrogen scripts, and static coverage for shipped public assets including `public/sw.js`.
6. When shipped service-worker source bytes change, bump its cache namespace version and verify activation/fetch behavior with a disposable non-browser worker mock.
7. Run the locked candidate install, `npm run check`, non-mutating `format:check`, typecheck, manifest check, audit, route check, production build, artifact comparison, format fixed-point check, `git diff --check`, and diff review. Report unresolved sandbox/Docker/Oxygen preview gates until an immutable candidate commit can be built.

## Files and Folders Touched

- `package.json` — replace previous static-check scripts/dependencies with Vite+ static-check scripts, exact Vite+/Vite/SonarJS dependency pins, and the supported Node engine range.
- `package-lock.json` — npm locked graph for Vite+ 1.0.0, compatible Vite peer resolution, and dev-only SonarJS/ESLint peer dependencies.
- `vite.config.ts` — Vite+ Oxlint/Oxfmt settings, including React, JSX accessibility, and SonarJS cognitive-complexity rules where supported.
- `.oxfmtrc.json` — Oxfmt formatting policy and Tailwind class sorting settings.
- `other/oxlint-sonarjs-plugin.js` — Vite+ JS plugin wrapper for SonarJS through Oxlint's ESLint compatibility helper.
- `.github/workflows/ci.yml` — run the new static check command while preserving other gates.
- `.weaverse/specs/2026-09-30--viteplus-toolchain/` — migration spec and plan.
- `AGENTS.md` — active agent command/tooling documentation updated for Vite+ 1.0.0 static checks and Node range.
- `README.md` — local command and configuration documentation updated for Vite+, Oxfmt, and Oxlint/SonarJS cognitive complexity.

## Out of Scope

- SDK repository changes, Pilot Demo changes, package-manager migration, app behavior changes, Oxygen deployment, production publication, browser/E2E execution, hooks, editor settings, and broad agent instruction rewrites. Targeted `AGENTS.md` updates for current static-check commands are in scope.
