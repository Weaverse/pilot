# Hydrogen upgrade guide: 2026.4.7 to 2026.10.2

This upgrade moves Pilot from **classic Hydrogen** (`@shopify/hydrogen` 2026.4, a framework that owned the request) to **Hydrogen 2026.10** (a request-handler library the app composes), and from `@weaverse/hydrogen` 5.x to **6.0**. It is a rewrite of the request wiring, data layer, cart, product form, customer account and analytics, not a version bump.

Pilot made this move in [Weaverse/pilot#209](https://github.com/Weaverse/pilot/pull/209), released as [v2026.11.7](https://github.com/Weaverse/pilot/releases/tag/v2026.11.7). The contract and its decisions are in [`.weaverse/specs/2026-10-29-hydrogen-2026-10-cut-over.md`](../../.weaverse/specs/2026-10-29-hydrogen-2026-10-cut-over.md). For a theme forked from Pilot, the fastest path is usually to take Pilot `v2026.11.7` and re-apply your customizations; this guide lists what changed so you can do either.

----

## Summary of changes

| Area | Classic (2026.4 + Weaverse 5) | Hydrogen 2026.10 + Weaverse 6 |
|------|------------------------------|-------------------------------|
| Request lifecycle | `createRequestHandler` from `@shopify/remix-oxygen`, `createHydrogenContext()` | `server.ts` composes it: `createAppContext()` → `handleShopifyRoutes()` → React Router → session commit and `applyResponseHeaders()` → `handleShopifyRedirects()` on 404 |
| Tooling | `shopify hydrogen dev\|build\|preview`, `hydrogen()` Vite plugin, GraphQL codegen | `vite dev`, `react-router build`, `vite preview`, `oxygen()` + `localHttps()` plugins, `gql()` + `@shopify/hydrogen/ts-plugin` |
| Queries | `storefront.query(QUERY)` (throws, implicit cache) | `storefront.graphql(gql(...), { variables, cache })` returns `{ data, errors }`; explicit cache |
| Cart | `CartForm`, `context.cart`, Pilot's optimistic engine | Hydrogen's cart store at `/api/cart` (`useCart`, `useCartForm`) plus Pilot cart handlers |
| Product | `useOptimisticVariant`, `getAdjacentAndFirstAvailableVariants`, `getProductOptions` | `ProductProvider` / `useProduct` / `useProductForm` |
| Customer account | `context.customerAccount` from `createHydrogenContext`, `account/auth/*` routes | Library OAuth handlers at `/account/login\|authorize\|refresh\|logout`, Pilot's `context.customerAccount` wrapper |
| Analytics | `Analytics.Provider`, `Analytics.*View` | `ShopifyScripts` + route trackers + `useCartAnalytics` |
| Components | `Image`, `Money`, `Pagination`, `getSeoMeta`, CSP helpers from `@shopify/hydrogen` | Local ports in Pilot |
| Weaverse | `@weaverse/hydrogen` root imports, `Hydrogen*` type names | `@weaverse/hydrogen/react-router`, `Weaverse*` type names |

----

## Package version changes

### Dependencies (package.json)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `@shopify/hydrogen` | `~2026.4.7` | `^2026.10.2` | The library |
| `@weaverse/hydrogen` | `^5.24.0` | `^6.0.0` | Requires Hydrogen 2026.10+ |
| `react-router` | `7.16.0` | `7.18.5` | Stay on 7.x (React Router 8 is a separate upgrade) |
| `@react-router/dev` | `7.16.0` | `7.18.5` | Same version as `react-router` |
| `@graphql-codegen/cli` | `7.4.6` | removed | Codegen is gone |

### DevDependencies (package.json)

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| `@shopify/hydrogen-codegen` | `0.3.3` | removed | Codegen is gone |
| `gql.tada` | — | `^1.9.2` | Types for `gql()` documents |
| `@types/node` | — | `^22.20.5` | |
| `@shopify/cli` | `^4.9.4` | `^4.9.4` | Still used for `deploy`, `link`, `env pull` |
| `@shopify/mini-oxygen` | `^4.2.3` | `^4.2.3` | Provides the `oxygen()` Vite plugin |
| `vite` | `8.3.4` | `8.3.4` | No change |

Node: `^22.18.0 || ^24.11.0` (`engines.node`).

----

## Step 1: Dependencies and scripts

### Files to modify
- `package.json`, `package-lock.json`

```diff
// package.json - scripts
- "build": "shopify hydrogen build --codegen",
+ "build": "react-router build",
- "dev": "react-router typegen && shopify hydrogen dev --codegen --port 3456",
- "dev:ca": "shopify hydrogen dev --codegen --port 3456 --customer-account-push",
+ "dev": "hydrogen skills check --mode=warn && vite dev --port 3456",
+ "dev:https": "hydrogen skills check --mode=warn && vite dev --port 3456",
- "preview": "shopify hydrogen preview --build",
- "start": "shopify hydrogen preview",
+ "preview": "react-router build && vite preview --port 3456",
+ "start": "vite preview --port 3456",
- "typecheck": "tsc --noEmit",
+ "typecheck": "react-router typegen && tsc --noEmit && hydrogen gql check --fail-on-warn",
- "routes-check": "shopify hydrogen check routes",
- "codegen": "shopify hydrogen codegen",
+ "deploy": "shopify hydrogen deploy --assets-dir dist/client --worker-dir dist/server",
```

`dev` and `dev:https` run the same command; `vite.config.ts` turns on local HTTPS when `npm_lifecycle_event` is `dev:https`.

```bash
rm -rf node_modules package-lock.json
npm install
```

----

## Step 2: Build configuration

### Files to modify
- `vite.config.ts`: plugins become `[localHttps({ enabled }), ...oxygen(), reactRouter(), ...]` with `localHttps` from `@shopify/hydrogen/vite` and `oxygen` from `@shopify/mini-oxygen/vite`. There is no `hydrogen()` plugin.
- `react-router.config.ts`: Hydrogen has no React Router preset anymore. Set `appDirectory: "app"`, `buildDirectory: "dist"` (the deploy flags read it), `ssr: true` and the future flags the classic preset applied (`v8_middleware`, `v8_splitRouteModules`, ...).
- `tsconfig.json`: add the `@shopify/hydrogen/ts-plugin` plugin and `node` types; remove `@shopify/hydrogen/react-router-types` and the `*.generated` path aliases.
- `.gitignore`: ignore `storefront-graphql-env.d.ts` and `customer-account-graphql-env.d.ts` (generated by the ts-plugin).
- Delete `codegen.ts`, `storefront-api.generated.d.ts` and `customer-account-api.generated.d.ts`.

----

## Step 3: Run the Weaverse 6 codemod

> `@weaverse/hydrogen` 6 splits its entry points. React Router themes import everything from `@weaverse/hydrogen/react-router`, and public types are renamed.

```bash
npx @weaverse/cli migrate v6 --dry-run   # list the files it would change
npx @weaverse/cli migrate v6
```

It rewrites `@weaverse/hydrogen` imports to `@weaverse/hydrogen/react-router` and renames:

| 5.x | 6.0 |
|-----|-----|
| `HydrogenComponent` | `WeaverseComponent` |
| `HydrogenComponentProps` | `WeaverseComponentProps` |
| `HydrogenComponentSchema` | `WeaverseComponentSchema` |
| `HydrogenThemeSchema` | `WeaverseThemeSchema` |
| `ThemeSettingsResponse` | `WeaverseThemeSettingsResponse` |
| `ComponentLoaderArgs` | `WeaverseComponentLoaderArgs` |

### Review the diff
- The codemod renames by name in every file that imports Weaverse, so a local type with one of those names is renamed too.
- It doesn't reformat; run `npm run format` afterwards.
- `WeaverseClient` no longer takes a classic Hydrogen context (Step 4), and section loaders must switch to `storefront.graphql` (Step 5). The codemod doesn't do either.

----

## Step 4: Request wiring

### Files to add or modify
- `server.ts`: the module-format fetch handler composing the lifecycle:
  1. reject a `GET`/`HEAD` with a body, collapse `//`;
  2. `createAppContext()`;
  3. `handleShopifyRoutes({ request, requestContext, sessionManager, storefrontClient, routeTemplates, handlers })` with Pilot's cart handlers, Hydrogen's cart handlers, predictive search and the customer account handlers. Unprefixed `/api/*` requests take their market from the `Referer`;
  4. the React Router handler, with the app context copied onto `RouterContextProvider`;
  5. session commit, then `requestContext.applyResponseHeaders()`;
  6. on a 404, `marketAwareRedirect()` around `handleShopifyRedirects()`, which also answers single-fetch `.data` navigations.
- `app/.server/context.ts`: `createAppContext()` builds the session (`app/.server/session.ts`), the storefront client (`app/.server/storefront.ts`: private when Oxygen injects `PRIVATE_STOREFRONT_API_TOKEN`, with the buyer IP; public otherwise), `customerAccount` and the `WeaverseClient`.
- `app/utils/route-templates.ts`: the route templates Hydrogen uses for redirects and `ShopifyScripts`.
- `env.d.ts`: `Env extends WeaverseEnv`; `AppLoadContext` and `RouterContextProvider` extend the `AppContext` returned by `createAppContext()`.
- `app/routes.ts`: unsupported market prefixes render the 404 page from the `routes/market-guard.ts` layout; market-prefixed resource routes sit under `routes/market-guard-resources.ts`.

```ts
// app/.server/context.ts
const weaverse = new WeaverseClient({
  storefront, // the request-scoped 2026.10 client
  env,
  cache,
  waitUntil,
  request,
  customerAccount,
  themeSchema,
  components,
  throwPageLoadFailures: true,
});
```

### Routes Hydrogen now owns (delete their route files)
`/api/cart`, `/api/predictive-search`, the Storefront API proxy (`/api/{version}/graphql.json`), and `/account/login`, `/account/authorize`, `/account/logout`. Pilot deleted `routes/api/cart.ts`, `routes/api/predictive-search.ts`, `routes/api/graphql.json.ts` and `routes/account/auth/*`.

----

## Step 5: Data layer

> Every query becomes a `gql()` document run with `graphql()` and an explicit cache. There is no default cache in 2026.10.

### Files to modify
- `app/graphql/*`, every route, `.server` helper, API route and section loader that queries Shopify.
- `app/utils/cache.ts`: `CACHE_DEFAULT` (classic Hydrogen's implicit default), `CACHE_SHORT`, `CACHE_LONG`, `CACHE_NONE`, plus the header helpers.
- `app/utils/storefront.ts`: `unwrapStorefront()` throws on GraphQL errors like `storefront.query` did.

```diff
- import type { ProductQuery } from "storefront-api.generated";
- const PRODUCT_QUERY = `#graphql
-   query product(...) { ... }
-   ${MEDIA_FRAGMENT}
- ` as const;
- const { product } = await storefront.query(PRODUCT_QUERY, {
-   variables: { handle, country: storefront.i18n.country },
- });
+ import { gql, type StorefrontApi } from "@shopify/hydrogen";
+ export const PRODUCT_QUERY = gql(`query product(...) { ... }`, [MEDIA_FRAGMENT]);
+ export type ProductQuery = StorefrontApi.ResultOf<typeof PRODUCT_QUERY>;
+ const { product } = await storefront
+   .graphql(PRODUCT_QUERY, { variables: { handle }, cache: CACHE_DEFAULT })
+   .then(unwrapStorefront);
```

Rules:
- Fragments compose through `gql()`'s second argument, never `${}` interpolation.
- Don't pass `country`/`language`: the client fills `$country`/`$language` from the request (Shopify's provider language, e.g. `ZH_TW`).
- Customer Account documents use `gql` from `@shopify/hydrogen/customer-account`.
- `npm run typecheck` validates every document (`hydrogen gql check --fail-on-warn`); deprecated fields fail it. Pilot dropped `CartCost.totalDutyAmount`/`totalTaxAmount` and replaced `Cart.discountAllocations` with `lines.discountAllocations(lineLevelOnly: false)`.
- Section loaders: `weaverse.storefront.graphql(doc, { variables, cache })`.

----

## Step 6: Replace removed Hydrogen components

| Removed from `@shopify/hydrogen` | Pilot replacement |
|----------------------------------|-------------------|
| `Image` | `app/components/image.tsx`, `app/components/shopify-image.tsx` |
| `Money` | `app/components/money.tsx` (keeps `en-US` formatting for every market) |
| `ExternalVideo`, `ModelViewer` | `app/components/product-media/external-video.tsx`, `model-viewer.tsx` |
| `ShopPayButton` | `ShopPayButton` from `@shopify/hydrogen/react` (`app/components/product/shop-pay-button.tsx`) |
| `Pagination`, `getPaginationVariables` | `app/components/pagination.tsx`, `app/utils/pagination.ts` (`after`/`before` cursors; filters and sort use the library collection store) |
| `getSeoMeta`, `SeoConfig` | `app/utils/seo-meta.ts` |
| Sitemap helpers | `app/.server/sitemap.ts`, `app/routes/seo/*` |
| `createContentSecurityPolicy`, `NonceProvider`, `useNonce` | `app/utils/csp.ts` |
| `getSelectedProductOptions` | `@weaverse/hydrogen/react-router` (same signature, filters Studio params) |

----

## Step 7: Cart

### Files to add or modify
- `app/.server/cart.ts`: `createCartServerHandlers({ fragment: CART_FRAGMENT })` at `/api/cart`, plus Pilot's handlers: buyer-country and customer sync before mutations, `POST /api/cart/buyer-identity` (country selector), `POST /api/cart/gift-cards`, and dropping a `cart` cookie whose cart no longer exists.
- `app/components/cart/cart-store.ts`: `createCartComponents<typeof cartHandlers>()` → `CartProvider`, `useCart`, `useCartForm`, `useCartActions`.
- `app/root.tsx`: `<CartProvider>` with **no** `initialData`, so documents stay anonymous and full-page cacheable.
- Rewrite `app/components/cart/*` onto the store; delete `optimistic-cart.ts`, `cart-baseline.ts`, `cart-sync.ts` and `store.ts`.
- `routes/cart/lines.tsx`, `routes/cart/checkout.tsx`, `routes/others/discount-code.tsx`, the country selector, and every add-to-cart call site.

Cart permalinks: Hydrogen answers `/cart/<variant>:<qty>` with Shopify's permalink and Shop Pay. `server.ts` sends permalinks without a `payment` param to Pilot's `routes/cart/lines.tsx` (market cart, `?discount=`, attribution); the Shop Pay button's links go to Hydrogen.

----

## Step 8: Product form

### Files to add or modify
- `app/components/product/product-form.tsx`: `createProductComponents<ProductFormData>()` → `ProductProvider`, `useProduct`, `useProductForm`, plus `useSelectedVariant(product)` and `productOptionPath()`.
- `app/routes/products/product.tsx`: renders `<ProductProvider>` and syncs the URL with a client-side replace.
- Replace every `useOptimisticVariant(...)` in `sections/main-product/*`, quick shop and the single-product section with `useSelectedVariant(product)`; quick shop and single-product render their own provider.
- `app/components/product/product-option-values.tsx`: option values are real links bound with `register("optionValue", ...)`; values of another product of a combined listing link to that product.

----

## Step 9: Customer account

- `app/.server/customer-account.ts`: `createCustomerAccountServerHandlers` at the fixed, unprefixed `/account/login`, `/account/authorize`, `/account/refresh` and `/account/logout`, plus `GET /api/account/token` for the header web component. `createCustomerAccount()` is `context.customerAccount` (`graphql`, `isLoggedIn`, `handleAuthStatus`, `logout`).
- `app/utils/customer-account.ts`: localized login and logout URLs (`return_to`, `locale`).
- Account routes run `context.customerAccount.graphql(doc, { variables })`; addresses use `countryCode`.
- Link to the handler paths with a plain `<a>`/`<form>`, not `<Link>`/`<Form>`.
- Local login needs HTTPS: `npm run dev:https` (see `.weaverse/docs/customer-account-local-dev.md`).

----

## Step 10: Analytics

- `app/root.tsx`: `<ShopifyScripts>` from `@shopify/hydrogen/react` in the head, with `nonce`, `shop`, `i18n`, `consent`, `routes` and `navigate`. It replaces `Analytics.Provider`.
- `app/components/root/analytics-views.tsx`: page, product, collection, search and cart-viewed trackers, and `useCartAnalytics`.
- `app/components/root/custom-analytics.tsx`: the GTM `dataLayer` mapping becomes an analytics-bus destination, so its pushes follow Customer Privacy consent. The lazy GTM loader stays.

----

## Step 11: Collections, search and predictive search

- Collection and all-products filters and sort run on the library collection store: `CollectionProvider` around the route (`app/components/product-grid/collection-browse.tsx`), `parseCollectionParams` in the loader, `useCollection`/`useCollectionActions` in the filter, chip and sort UI. URLs use Liquid-compatible `filter.p.*`/`filter.v.*` and `sort_by` params; old `filter.<field>=<json>` and `sort=` URLs 301 to them (`getLegacyBrowseRedirect` in `app/routes/collections/utils.ts`).
- The store has no pagination. Infinite scroll and load previous/more, plus search, the collections list and account orders, use the local `Pagination` with `after`/`before` cursors, the params the store clears when filters or sort change.
- Predictive search runs on Hydrogen's handlers at `/api/predictive-search` (`app/.server/predictive-search.ts`), with `PredictiveSearchProvider` on the client.

----

## Step 12: Build and verify

```bash
npm run typecheck   # react-router typegen, tsc, hydrogen gql check --fail-on-warn
npm run check
npm run build
npm test
```

### Expected outcome
- `npm run typecheck` reports no problems, including GraphQL validation.
- `npm run build` writes `dist/client` and `dist/server`.

----

## Step 13: Test critical flows

On `npm run preview` (and an Oxygen preview deployment):

- [ ] Every route resolves with and without a market prefix; an unsupported prefix renders the 404 page with status 404
- [ ] `?variant=` product links redirect to option params; Shopify URL redirects work on prefixed paths
- [ ] Variant selection updates without a full navigation; combined-listing values link to the other product
- [ ] Cart: add (PDP, sticky bar, quick shop, cards), quantity, remove, note, discount, gift card (including an invalid code), drawer, `/cart` without JS, permalinks, `/discount/:code`, checkout
- [ ] Switching market re-prices the cart
- [ ] Collections and search: filters, sort, infinite scroll; predictive search localized
- [ ] Account over `npm run dev:https`: login returns to the localized page, orders, profile, addresses, logout
- [ ] Anonymous HTML has `Oxygen-Cache-Control` and `Vary` and no `Set-Cookie`; account and cart responses are `no-store`
- [ ] No CSP violations on home, product, collection, cart, search and account
- [ ] Shopify analytics and GTM `dataLayer` events fire after consent
- [ ] Weaverse Studio: design mode, section loaders, theme settings, translations

----

## Risk assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Forked themes: imports, cart components, product form | **High** | Start from Pilot `v2026.11.7` and re-apply customizations; the codemod covers Weaverse imports only |
| Queries missing a `cache` option | **Medium** | Without one nothing is cached; grep for `.graphql(` calls without `cache:` |
| Personalized data in loaders | **Medium** | Breaks the anonymous full-page cache; the cart and customer token load after hydration |
| Weaker typing of `graphql()` results (partial, union-shaped) | **Low** | Narrow at the boundary; don't use `any` |
| `@weaverse/hydrogen` 6.0 | **Low** | Pilot ran QA on `6.0.0-beta.0` and moved to 6.0.0 with no code changes |

----

## Rollback plan

1. Check out the last release on classic Hydrogen: `git checkout v2026.10.4` (or your last commit before the upgrade).
2. Reinstall: `rm -rf node_modules && npm ci`.
3. Environment variables are unchanged by this upgrade, so `.env` and Oxygen variables need no rollback.

----

## References

- [Weaverse/pilot#209](https://github.com/Weaverse/pilot/pull/209) — the cut-over PR
- [`.weaverse/specs/2026-10-29-hydrogen-2026-10-cut-over.md`](../../.weaverse/specs/2026-10-29-hydrogen-2026-10-cut-over.md) — scope, acceptance and decisions
- Hydrogen's migration skill: `node_modules/@shopify/hydrogen/skills/migrate-to-hydrogen-2026-10/SKILL.md`, and the other packaged skills in `node_modules/@shopify/hydrogen/skills/`
- [Weaverse/weaverse#545](https://github.com/Weaverse/weaverse/issues/545) — `@weaverse/hydrogen` 6.0
- [Hydrogen Release Notes](https://hydrogen.shopify.dev/releases)
