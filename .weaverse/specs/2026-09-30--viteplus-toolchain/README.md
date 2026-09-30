# Feature: Vite+ Toolchain Migration

| Field            | Value       |
| ---------------- | ----------- |
| **Status**       | in-progress |
| **Owner**        | @omp        |
| **Created**      | 2026-09-30  |
| **Last Updated** | 2026-09-30  |

## Initiating Requirement

> Migrate Pilot's static checks from Biome, Ultracite, and `@weaverse/biome` to Vite+ 1.0.0 with Oxlint and Oxfmt. Preserve npm and `package-lock.json`, Shopify Hydrogen build/codegen/preview/deploy scripts, React Router/Hydrogen/mini-Oxygen plugin chain, `server.ts` worker entry, the SSR `react-player` stub, lazy media split, existing manual chunks until artifact evidence supports removal, Playwright tests, and `npm run dev` with literal `--port 3456`. Keep `npm run typecheck` until Vite+ type parity is proved. Do not change product behavior, package manager, hooks, editor tooling, SDK repositories, Pilot Demo, publishing, deployment, or browser-backed tests in this migration.

## Scope Updates

### 2026-09-30

> Preserve Pilot's cognitive-complexity guard, enable supported Oxlint React and JSX accessibility plugins, translate active lint suppressions, keep root configuration files in static-check scope, avoid formatting CSS that the prior formatter did not govern, align the Node engine contract with Vite+ 1.0.0 support, and report unresolved rule or sandbox gates precisely rather than treating them as accepted deltas.
>
> Accept a measured one-time Oxfmt reflow for governed Pilot source and test files. Distinguish that approved formatter cutover from behavior changes, import-order changes, Tailwind token changes, Markdown churn, and the separate cognitive-complexity decision.
>
> Remove Biome completely from Pilot's active toolchain while preserving the error-level cognitive-complexity max-50 policy through Vite+/Oxlint and SonarJS if a clean npm install, peer graph, threshold controls, and license disclosure prove safe.
>
> Keep shipped service-worker source in static-check scope. `public/sw.js` is registered from `app/root.tsx` and copied into the client build, so Vite+ check/fix/format scripts must include `public` rather than only application source directories.
>
> Preserve the service worker cache-invalidation contract when formatting changes `public/sw.js` bytes by bumping its Pilot cache namespace version.

## Summary

Pilot uses Vite+ 1.0.0 as the primary lint and format check runner while keeping Hydrogen application commands unchanged. Oxlint runs the max-50 cognitive-complexity guard through a dev-only SonarJS JS plugin. The migration records old and new tool outputs, unresolved rule gaps, and build artifacts so the static-tooling cutover can be reviewed without product behavior changes.
