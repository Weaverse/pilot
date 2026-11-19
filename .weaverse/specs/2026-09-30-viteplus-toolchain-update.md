# Vite+ toolchain and dependency update

PR: [#177](https://github.com/Weaverse/pilot/pull/177)

## Outcome

Pilot runs its static checks through Vite+ (Oxlint and Oxfmt) instead of Biome, Ultracite and `@weaverse/biome`, and its direct dependencies, devDependencies, overrides, Node engine range and GitHub Actions pins are current stable releases. Storefront behavior, Hydrogen commands and Weaverse contracts stay the same.

## Scope & contract

- Keep npm and `package-lock.json`. Keep the Shopify Hydrogen build, codegen, dev (`--port 3456`), preview and deploy scripts. Keep the React Router, Hydrogen and mini-Oxygen Vite plugin chain, the `server.ts` worker entry, the SSR `react-player` stub, the lazy media split, and the existing manual chunks.
- Run static checks with `vp check` over `app`, `other`, `public`, `tests` and the root config files. Keep `npm run typecheck` (`tsc --noEmit`) as the TypeScript gate.
- Keep the lint policy at error level: React `rules-of-hooks`, the configured JSX accessibility rules, `no-eval`, `no-unsafe-optional-chaining`, and SonarJS `cognitive-complexity` with a maximum of 50. Oxlint's native `complexity` rule is cyclomatic, not cognitive, so SonarJS stays and runs as an Oxlint JS plugin (`other/oxlint-sonarjs-plugin.js`).
- Oxfmt does not format Markdown or `app/styles/**`, and it sorts Tailwind classes in `clsx`, `cva` and `cn`. The one-time reflow is a formatting change only, with no change to import order, Tailwind tokens, JSX shape or lint directives.
- `public/sw.js` is registered from `app/root.tsx` and copied into the client build, so it is in static-check scope. When its bytes change, bump its cache namespace version (currently `pilot-pwa-v2`). It caches only `/assets/*` (cache-first) and Shopify CDN images (stale-while-revalidate). It never intercepts documents, `/cart`, `/account`, `/api/*` or checkout.
- Node engine is `^22.18.0 || ^24.11.0`: the intersection of Vite+ (`^22.18.0 || ^24.11.0 || >=26.0.0`) and `@shopify/mini-oxygen` (`^22 || ^24`).
- Dependencies use the newest stable release each one's peer and runtime contracts allow, with exact pins (refreshed for [Weaverse/pilot#200](https://github.com/Weaverse/pilot/issues/200) on 2026-11-19: Vite+ 1.7.0 with tsrs `7.1.0-beta.tsrs2`, graphql 17, Shopify CLI 5). The current exceptions are:
  - `react-router` and `@react-router/dev` stay on the latest 7.x. `@weaverse/hydrogen` 6.3.1 depends on `react-router@^7`, so React Router 8 installs a second, nested React Router 7 and Weaverse's hooks fail with "must be used within a data router". React Router 8 also always uses the Vite Environment API, which needs the Worker SSR entry set explicitly and rejects the client `manualChunks` setup in the SSR build. Shopify's React Router template moved to 8 on `main` (Shopify/hydrogen#4378) but no Hydrogen release ships it yet.
  - `typescript` stays `6.x`. `@react-router/dev` 7.x peers `^5.1 || ^6`, and `hydrogen gql check` runs the `gql.tada` 1.9.2 that `@shopify/hydrogen` pins, which calls TypeScript's JS API; TypeScript 7 exposes none, so the check fails. Linux CI type-checks with `tsrs` (`npm run typecheck:ci`).
  - `undici` override stays `7.x`. `@shopify/mini-oxygen` pins `7.30.1` and miniflare uses the v7 API.
  - `@types/node` stays `22.x`, the engine floor, as in Shopify's template.
- Non-goals: React Router 8, SDK, Builder or sandbox-image changes, Oxygen deployment, browser-backed tests.

## Licensing

`eslint-plugin-sonarjs@4.2.2` declares `LGPL-3.0-only` in `package.json`, but its `LICENSE` and all 1,240 compiled source headers use the SONAR Source-Available License v1.0 (SSALv1). Upstream `SonarSource/SonarJS` switched `LICENSE.txt` to SSALv1 in commit `48fef6c1` (2024-11-26). Its README says releases after 2024-11-29 are published under SSALv1. Treat SSALv1 as the applicable license. The plugin is a devDependency that only runs during linting. It is not bundled into `dist/` (the server bundle contains only the theme's `package.json` metadata via `app/weaverse/schema.server.ts`), so storefront builds and Oxygen deploys do not distribute it. Any artifact that ships `node_modules` (for example a sandbox image built with full `npm ci`) does redistribute it, and needs SSALv1 review or `npm ci --omit=dev` before it is published.

## Acceptance

- Clean `npm ci` with no peer conflicts and without `--force` or `--legacy-peer-deps` beyond the repository `.npmrc`.
- `npm run check`, `format:check`, `typecheck`, `weaverse:manifest:check`, `weaverse:audit`, `routes-check`, `codegen` and `build` pass. Unit tests pass, except the browser-backed `api-locale-boundary` cases, which need a separately approved browser run.
- Lint positive controls: cognitive complexity 51 fails and 50 passes, a conditional hook fails `rules-of-hooks`, and redundant `alt` text fails `img-redundant-alt`.
- Oxfmt is idempotent. Service-worker caching boundaries hold.
- Local `shopify hydrogen preview` serves the same status codes and equivalent HTML as the previous candidate for representative routes.
- A real Oxygen canary renders before release.

## Approach

1. Capture a locked baseline of the previous candidate (install, gates, artifact sizes).
2. Reconcile `origin/main` with a normal merge and keep its focal-point, element-label and setup-guide changes.
3. Query the npm registry and upstream tags, then raise every pin to the newest stable release its peer graph accepts.
4. Adapt the code to the dependency changes:
   - Rename the `XShareButton` `title` prop to `text` (react-share v6).
   - Remove the dead `jsonp` SSR pre-bundle entry and the test `debug` stub.
   - Pass `style` to Hydrogen's `Image` only when one is needed, so it keeps its computed `aspect-ratio`.
5. Pin GitHub Actions to the release commit SHA.
6. Run the gates, positive controls and local preview smoke. Release goes through Oxygen canary.

Affected files: `package.json`, `package-lock.json`, `vite.config.ts`, `.oxfmtrc.json`, `other/oxlint-sonarjs-plugin.js`, `.github/workflows/*.yml`, `public/sw.js`, `app/sections/blog-post.tsx`, `app/components/image.tsx`, `tests/support/render-app.ts`, `tests/unit/image-focal-point.test.ts`, `AGENTS.md`, `README.md`.

## Verification

- Gates and unit tests above, from a clean `npm ci` on Node 24.
- Disposable lint probes, removed after use.
- A Node mock of the service worker covering activate cleanup and fetch interception.
- Side-by-side local `shopify hydrogen preview` of the previous and new candidates against the demo store's public read-only tokens. Requests are GET-only: home, product, collection, search, blog, article, 404, locale prefix, robots, sitemap, manifest and `sw.js`.
- Oxygen preview canary for the PR head.
