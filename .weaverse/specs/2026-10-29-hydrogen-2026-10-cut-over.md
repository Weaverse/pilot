# Hydrogen 2026.10 cut-over

Issue: [#191](https://github.com/Weaverse/pilot/issues/191) · Spike: [#207](https://github.com/Weaverse/pilot/issues/207) · Epic: [Weaverse/weaverse#543](https://github.com/Weaverse/weaverse/issues/543) · SDK: [Weaverse/weaverse#545](https://github.com/Weaverse/weaverse/issues/545)

## Outcome

Pilot runs on `@shopify/hydrogen@^2026.10` (Hydrogen as a server-handler library) and `@weaverse/hydrogen@6`. Merchants keep the full production-ready theme: every route, SEO output, analytics event and commerce feature that `main` ships today works after the upgrade with no merchant changes. Matching Shopify's starter is a means, not the bar. Where the library lacks a feature Pilot ships, Pilot implements it in app code until the library covers it.

## Scope & contract

- **Runtime.** `@shopify/hydrogen@^2026.10.2`, `@weaverse/hydrogen@6` (beta until 6.0.0 is released), React Router 7 (latest 7.x; v8 is a separate follow-up, because Shopify's template pins 7.x and the Weaverse SDK depends on `react-router@^7`), Vite 8, `@shopify/mini-oxygen@^4.2.3`, Node `^22.18 || ^24.11`.
- **Tooling.** Scripts `vite dev` / `react-router build` / `vite preview` / `shopify hydrogen deploy --assets-dir dist/client --worker-dir dist/server`, plus `dev:https` for Customer Account login. Typecheck is `react-router typegen && tsc && hydrogen gql check --fail-on-warn`. GraphQL codegen (`@shopify/hydrogen-codegen`, `@graphql-codegen/cli`, `codegen.ts`, `*.generated.d.ts`) is replaced by `gql()` and `@shopify/hydrogen/ts-plugin`.
- **Request lifecycle** (`server.ts`):
  - unsupported-market 404;
  - market resolution, taken from the `Referer` for unprefixed `/api/*` paths;
  - `createShopifyRequestContext` (with `buyerIp` for the private client), then the storefront client: private when `PRIVATE_STOREFRONT_API_TOKEN` exists, otherwise public with `PUBLIC_STOREFRONT_API_TOKEN`;
  - `handleShopifyRoutes` with the cart, Pilot cart, predictive search and customer account handler groups;
  - the React Router handler;
  - session commit, then `applyResponseHeaders`;
  - on a 404, a market-aware `handleShopifyRedirects`.
  Loaders keep reading `context.storefront`, `context.weaverse`, `context.customerAccount`, `context.session` and `context.env`, typed by module augmentation.
- **Data layer.** Every Storefront query is a `gql()` document run with `client.graphql(doc, {variables, cache})`. Each call checks `errors` and passes an explicit `cache`, because the classic default cache is gone. `$country`/`$language` are injected from the request context, not passed per call. Customer Account documents use `gql` from `@shopify/hydrogen/customer-account`.
- **Markets.** `app/utils/locale.ts` stays the source of truth. Shopify receives the provider language (`ZH_CN`/`ZH_TW`); Weaverse, URLs and theme bundles receive the public market locale (the `weaverseStorefront` relabel). The country selector switches market with a client-side navigation: it posts the new country to `/api/cart/buyer-identity`, refreshes the cart store, and points the `window.Shopify` market fields (country, currency, locale, routes root) at the new market, because `ShopifyScripts` reads them only once. Without JavaScript it stays a form post that redirects.
- **Cart.**
  - Library cart: `createCartServerHandlers({fragment})` at `/api/cart`, `CartProvider` with no server `initialData` (keeps the anonymous full-page cache), `useCart`, `useCartForm`, Standard Actions.
  - Pilot keeps, as app code:
    - gift card apply, update and remove (`POST /api/cart/gift-cards`);
    - buyer-country sync before mutations, and the country selector (`POST /api/cart/buyer-identity`);
    - `/cart/:lines` with locale prefix, discount and attribution;
    - `/discount/:code`;
    - `/cart/checkout` with attribution forwarding.
  - A `cart` cookie whose cart no longer exists is dropped before Hydrogen's handler runs, so the next add creates a fresh cart instead of failing.
  - App-owned changes reconcile through the store's `refresh()`. Invalid gift card codes are reported by comparing `appliedGiftCards` before and after the mutation.
- **Product.** `ProductProvider`/`useProductForm` replaces `useOptimisticVariant`, `getAdjacentAndFirstAvailableVariants` and `getProductOptions`. Combined-listing values link to the other product. Quick shop and single-product sections use their own provider.
- **Collections, search, account orders.** A local port of `Pagination` and `getPaginationVariables`. The `filter.*` URL format, infinite scroll, sort and filter UI stay unchanged. The library collection store is a follow-up.
- **Predictive search.** Library handlers at `/api/predictive-search`, with the market taken from the `Referer`, plus `PredictiveSearchProvider`.
- **Customer account.**
  - Library handlers at the fixed paths `/account/login`, `/account/authorize`, `/account/refresh` and `/account/logout`, with a signed cookie session.
  - The localized login redirect and the localized post-logout redirect stay as they are.
  - Addresses use `countryCode`.
  - Signed-in customers' carts carry their `customerAccessToken` (set with the market country on every buyer-identity sync and right after a cart is created), as classic Hydrogen's cart did. Pilot does this in its own cart handlers instead of the library's `customerSession` option, whose `./customer-account` export has no `development` condition in 2026.10.2 and breaks under `vite dev`.
- **Analytics.**
  - `ShopifyScripts`, with nonce, consent, i18n with currency, route templates and `navigate`.
  - Page, product, collection, search and cart-viewed trackers, plus `useCartAnalytics`.
  - The existing GTM `dataLayer` mapping becomes an `addDestination` destination. `custom_sidecart_viewed` is pushed straight to `dataLayer`.
  - The lazy GTM loader stays.
- **Presentational.** Local `Image` (CDN srcset, plus the focal-point and aspect-ratio behavior from #176), `Money` (via `formatMoney`), `ExternalVideo`, `ModelViewer`, plus `ShopPayButton` from `@shopify/hydrogen/react`. No `@shopify/hydrogen-react` dependency.
- **SEO.** A local `getSeoMeta`/`SeoConfig` port keeps `seoMetaFromMatches`, JSON-LD, hreflang and canonicals byte-equivalent. Local sitemap index and pages, keeping the Weaverse sitemap entry and the custom articles sitemap.
- **Weaverse.** `WeaverseClient({storefront, env, cache, waitUntil, request, components, themeSchema, customerAccount})`, with `throwRouteFailures` and degraded-theme handling unchanged. Section loaders use `weaverse.storefront.graphql(doc, {variables, cache})`.
- **Non-goals:** React Router 8, the library collection store, new features, design changes, and a cart-store UI redesign beyond what the new store requires.

## Acceptance

Parity with `main`: every item below behaves as it does today, verified on a production build (`vite preview`, and an Oxygen preview deploy). Any intended difference is listed in the PR with its reason.

- **Routing:**
  - every route in `app/routes.ts` resolves, with and without a market prefix;
  - an unsupported market prefix renders the 404 page with status 404 (including `.data`), from a layout route around the `:locale?` routes;
  - Shopify URL redirects work on prefixed paths;
  - `?variant=` product links redirect to option params;
  - `robots.txt`, `manifest.webmanifest` and `/admin` work.
- **SEO:** titles, descriptions, canonicals, hreflang and `x-default`, JSON-LD (Organization, Product, Collection, Article, Breadcrumb) and the sitemap index and pages match `main` for the same store.
- **Caching and security:**
  - anonymous HTML keeps `Oxygen-Cache-Control`/`Vary` and is never personalized (no cart or customer data in the document);
  - account and cart responses are private/no-store;
  - the CSP has no violations on home, PDP, collection, cart, search and account, including `ShopifyScripts`, Shop Pay, GTM and Weaverse design mode.
- **Cart:**
  - add from PDP, sticky bar, quick shop, product cards and single-product;
  - line quantity and remove, both optimistic;
  - note;
  - discount apply and remove;
  - gift card apply and remove, with an error shown for invalid codes;
  - the drawer opens on add and does not open on load;
  - cart page with no JS;
  - permalinks with and without a prefix;
  - the `/discount/:code` link;
  - checkout with attribution params;
  - the cart is priced in the shopper's market, and switching market moves the cart.
- **Product:** variant selection updates client-side without a full navigation; URL params stay in sync; combined listings link to the other product; sold-out and unavailable states are shown; quantity; Shop Pay; media (images, video, 3D); Judge.me reviews; recommendations.
- **Collections and search:** filters, sort, infinite scroll and load previous, and product count, with the same URLs as today; the search page and predictive search, localized.
- **Account:** the OAuth login round trip over HTTPS returns to the original localized page; dashboard, orders (paginated), order detail, profile edit, address CRUD (`countryCode`), logout to the localized home; the header account web component; the newsletter and Klaviyo forms.
- **Analytics:** consent banner; page, product, collection, search, cart-viewed, add and remove events reach Shopify and the GTM `dataLayer` with the same payloads as today.
- **Weaverse:** Studio preview and design mode; translations (including ZH markets); section loaders; a Weaverse outage still returns a retryable 503 with the degraded theme.
- **Integrations:** Shopify Inbox, PWA install and service worker, Klaviyo, Judge.me, ali-reviews.

## Approach

All work happens on the integration branch `feat/191-hydrogen-2026-10`, with one commit per area so each can be reviewed, and ends in one PR to `main`.

1. **Tooling and dependencies.** `package.json`, `vite.config.ts`, `react-router.config.ts`, `tsconfig.json`, `.gitignore`, `env.d.ts`; remove `codegen.ts` and `*.generated.d.ts`; run the `weaverse migrate v6` codemod for the imports.
2. **Request wiring.**
   - `server.ts` and `app/.server/context.ts`: the storefront client factory, buyer IP, `/api/*` market from the `Referer`, the cookie session manager, route templates and handler groups.
   - `app/.server/market-redirect.ts` around `handleShopifyRedirects`.
   - WeaverseClient wiring.
3. **Data layer.** Convert `app/graphql/*`, the route, `.server`, API and section queries to `gql()` with explicit cache, and replace generated types with `StorefrontApi.ResultOf`. `app/utils/cache.ts` maps `CacheLong`/`CacheShort`/`CacheNone` onto `Cache.*` and keeps the header helpers.
4. **Presentational ports.**
   - `app/components/image.tsx`, `money`, `product-media/*`, and `ShopPayButton`.
   - `app/.server/seo.ts` with a local `getSeoMeta`, and `app/utils/seo.ts`.
   - Sitemap routes under `app/routes/seo/*`, and `parseGid` in `robots`.
5. **Cart.**
   - `app/lib/cart*.ts`: the handlers, the Pilot handler group, and the components.
   - Rewrite `app/components/cart/*` onto the store; delete `optimistic-cart.ts`, `cart-baseline.ts` and `cart-sync.ts`.
   - Remove `routes/api/cart.ts` (the library owns `/api/cart`).
   - Rework `routes/cart/*`, `routes/others/discount-code.tsx` and the country selector.
   - Rewrite the add-to-cart call sites.
6. **Product.** A product provider at the route; replace the `useOptimisticVariant` call sites in `sections/main-product/*`; the variant selector, quick shop and single-product.
7. **Collections, search, account pagination.** A local `Pagination` and `getPaginationVariables`, plus predictive search on the library handlers.
8. **Customer account.**
   - `routes/account/**` on `client.graphql`, with access tokens from the session.
   - Remove the `account/auth/*` routes (the library owns those paths).
   - Localized redirects through `return_to`.
   - `dev:https`.
9. **Analytics.** `app/root.tsx` with `ShopifyScripts` and the trackers; `components/root/custom-analytics.tsx` as a GTM destination; delete `Analytics.*` usage.
10. **Tests and docs.** Update `tests/unit/*` that depend on classic APIs; refresh `AGENTS.md`, `README.md`, `.weaverse/docs/customer-account-local-dev.md` and `.env.example`; regenerate the component manifest if any schema changes.

Decisions made during implementation:
- **Cart permalinks.** Hydrogen answers `/cart/<variant>:<qty>` with Shopify's own permalink and defaults it to Shop Pay. `server.ts` leaves permalinks without a `payment` param to Pilot's `routes/cart/lines.tsx` (market cart, `?discount=`, attribution, regular checkout); the Shop Pay button's links, which always carry `payment`, go to Hydrogen.
- **Soft-navigation redirects.** `handleShopifyRedirects` only matches document paths, so `marketAwareRedirect` maps single-fetch `.data` requests to their document path and answers a match with `204` + `X-Remix-Redirect`, as classic `storefrontRedirect` did.
- **Deprecated cart fields.** `CartCost.totalDutyAmount`/`totalTaxAmount` (no longer populated) are dropped; the summary discount sums `lines.discountAllocations(lineLevelOnly: false)` instead of the deprecated `Cart.discountAllocations`.
- **GTM.** The 2026.10 analytics bus has no ungated `subscribe`; the GTM `dataLayer` mapping is a bus destination, so its pushes follow Customer Privacy consent.
- **Money formatting.** The local `Money` keeps classic Hydrogen's `en-US` formatting for every market (classic read the locale from a `ShopifyProvider` Pilot never rendered). Market-locale formatting is a separate change.

Decisions from the #207 spike:
- A cart created in an enabled market gets that country, but it keeps that country when the shopper switches market, so the sync stays.
- Handler paths are exact and unprefixed, so the market comes from the `Referer`.
- Invalid gift card codes return no `userErrors`.
- The relabelled `weaverseStorefront` keeps the provider language on the wire.
- The mini-oxygen `compatibilityDate` override isn't needed.

Main files: `package.json`, `package-lock.json`, `server.ts`, `env.d.ts`, `vite.config.ts`, `react-router.config.ts`, `tsconfig.json`, `.gitignore`, `.env.example`, `codegen.ts` (deleted), `*.generated.d.ts` (deleted), `app/root.tsx`, `app/entry.server.tsx`, `app/routes.ts`, `app/.server/*`, `app/lib/*` (new), `app/graphql/*`, `app/routes/**`, `app/sections/**` (imports and loaders), `app/components/{cart,product,product-media,layout,root,customer}/**`, `app/components/image.tsx`, `app/utils/{cache,seo,locale}.ts`, `app/weaverse/*`, `tests/**`, `AGENTS.md`, `README.md`, `.weaverse/docs/*`.

## Risks

- **`@weaverse/hydrogen` 6.0 is a beta.** API changes in the SDK land here as well. The cut-over PR merges only after 6.0.0 stable is published, or after an explicit decision to ship on the beta.
- **Breaking for forked themes.** Imports, cart components, the product form and env names change. Release notes need a migration section (docs#66).
- **Weaker typing in `.graphql` results** (partial and union-shaped). Narrow at the boundaries; don't use `any`.

## Verification

- `npm run typecheck` (with `hydrogen gql check --fail-on-warn`), `npm run check`, `npm run build`, and the unit suite (`npm test`), all green before the push.
- The `hydrogen-smoke-test` skill flow on `vite preview` against the dev store and a multi-market store.
- The acceptance checklist above, recorded in the PR with evidence (request/response headers, console with no CSP violations, the GTM `dataLayer` dump, screenshots supplied by the reviewer).
- Studio check with Builder ([Weaverse/builder#3178](https://github.com/Weaverse/builder/issues/3178)).
