---
description: 
globs: 
alwaysApply: true
---

# React Router Import Rule for Hydrogen

## Overview

Pilot runs on React Router 7 and `@shopify/hydrogen` 2026.10, where Hydrogen is a request-handler library rather than a framework. React Router owns routing, rendering and the build; Hydrogen supplies the Storefront and Customer Account clients, the route handlers it answers itself (cart, checkout, OAuth, the Storefront API proxy) and React bindings. When working with documentation or code examples written for Remix or for classic Hydrogen (2026.4 and earlier), translate them to the imports below.

## Import Replacements

### Remix to React Router

| Remix v2 Package | React Router v7 Package |
|------------------|-------------------------|
| `@remix-run/react` | `react-router` |
| `@remix-run/dev` | `@react-router/dev` |
| `@remix-run/architect` | `@react-router/architect` |
| `@remix-run/cloudflare` | `@react-router/cloudflare` |
| `@remix-run/express` | `@react-router/express` |
| `@remix-run/fs-routes` | `@react-router/fs-routes` |
| `@remix-run/node` | `@react-router/node` |
| `@remix-run/route-config` | `@react-router/dev` |
| `@remix-run/routes-option-adapter` | `@react-router/remix-routes-option-adapter` |
| `@remix-run/serve` | `@react-router/serve` |
| `@remix-run/server-runtime` | `react-router` |
| `@remix-run/testing` | `react-router` |

NEVER USE 'react-router-dom' imports!

### Classic Hydrogen to Hydrogen 2026.10 and Weaverse 6

| Classic import | Use instead |
|----------------|-------------|
| `@shopify/remix-oxygen` (`LoaderFunctionArgs`, `AppLoadContext`, `redirect`, `data`, `createRequestHandler`) | `react-router`. The package is gone. |
| `@shopify/hydrogen-react` and classic `@shopify/hydrogen` components (`ShopPayButton`, `CartProvider`, `ProductProvider`) | `@shopify/hydrogen/react` (`ShopPayButton`, `ShopifyScripts`, `createCartComponents`, `createProductComponents`). Pilot wraps the last two in `app/components/cart/cart-store.ts` and `app/components/product/product-form.tsx`. |
| `Image`, `Money`, `ExternalVideo`, `ModelViewer`, `Pagination`, `getSeoMeta` from `@shopify/hydrogen` | Pilot's local ports: `~/components/image`, `~/components/money`, `~/components/product-media/*`, `~/components/pagination`, `~/utils/seo-meta` |
| Hand-rolled collection filter and sort URLs (`filter.<field>=<json>`, `sort=`) | The library collection store: `CollectionBrowseProvider` from `~/components/product-grid/collection-browse`, `parseCollectionParams` in the loader, `useCollection`/`useCollectionActions` from `@shopify/hydrogen/react` |
| `createContentSecurityPolicy`, `NonceProvider`, `useNonce` from `@shopify/hydrogen` | `~/utils/csp` |
| `Analytics.Provider`, `Analytics.*View`, `useAnalytics` | `ShopifyScripts` in `app/root.tsx` and the trackers in `~/components/root/analytics-views` |
| `CartForm`, `useOptimisticCart`, `context.cart` | The cart store: `useCart`, `useCartForm`, `useCartActions` from `~/components/cart/cart-store` |
| `useOptimisticVariant`, `getAdjacentAndFirstAvailableVariants`, `getProductOptions` | `useProduct`, `useProductForm`, `useSelectedVariant` from `~/components/product/product-form` |
| `getSelectedProductOptions` from `@shopify/hydrogen` | `getSelectedProductOptions(request)` from `@weaverse/hydrogen/react-router` (filters out Weaverse Studio params) |
| `storefront.query(QUERY)` with a `#graphql` template string | `storefront.graphql(gql(...), { variables, cache })`, unwrapped with `unwrapStorefront` from `~/utils/storefront` |
| `storefront.CacheLong()` / `CacheShort()` / `CacheNone()` | `CACHE_LONG` / `CACHE_SHORT` / `CACHE_NONE` / `CACHE_DEFAULT` from `~/utils/cache` |
| `*.generated.d.ts` types from codegen | Types inferred from the document: `StorefrontApi.ResultOf<typeof X_QUERY>` |
| Anything from `@weaverse/hydrogen` | `@weaverse/hydrogen/react-router` (it re-exports the core and the React bindings) |
| `HydrogenComponent`, `HydrogenComponentProps`, `HydrogenComponentSchema`, `HydrogenThemeSchema`, `ComponentLoaderArgs`, `ThemeSettingsResponse` | `WeaverseComponent`, `WeaverseComponentProps`, `WeaverseComponentSchema`, `WeaverseThemeSchema`, `WeaverseComponentLoaderArgs`, `WeaverseThemeSettingsResponse` |

`npx @weaverse/cli migrate v6` rewrites the Weaverse imports and type names; see `.guides/hydrogen-upgrades/upgrade-2026.4.7-to-2026.10.2.md`.

## Common Import Examples

```ts
// INCORRECT (Remix style)
import { useLoaderData, Link, Form, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { createSchema, type HydrogenComponentProps } from '@weaverse/hydrogen';

// CORRECT (React Router + Hydrogen 2026.10 + Weaverse 6)
import { useLoaderData, Link, Form, useActionData, useNavigation, useSubmit } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { createSchema, type WeaverseComponentProps } from '@weaverse/hydrogen/react-router';
```

## Request Lifecycle

`server.ts` composes the lifecycle that the classic framework owned. Know it before adding routes or context values:

1. Reject malformed requests (a `GET`/`HEAD` with a body, `//` in the path).
2. `createAppContext()` (`app/.server/context.ts`) builds the per-request context: the session, the storefront client (private when Oxygen injects `PRIVATE_STOREFRONT_API_TOKEN`, public otherwise), `customerAccount` and the `WeaverseClient`. Unprefixed `/api/*` requests take their market from the `Referer`.
3. `handleShopifyRoutes()` answers the paths Hydrogen owns: `/api/cart` (plus Pilot's `/api/cart/buyer-identity` and `/api/cart/gift-cards`), `/api/predictive-search`, `/api/account/token`, the Storefront API proxy, `/checkout`, Shop Pay permalinks and Customer Account OAuth (`/account/login|authorize|refresh|logout`). These paths must not get route files.
4. Otherwise the context is copied onto React Router's `RouterContextProvider` and React Router renders the app. Loaders read `context.storefront`, `context.weaverse`, `context.customerAccount`, `context.session` and `context.env`, typed in `env.d.ts`.
5. The session is committed and `requestContext.applyResponseHeaders()` adds Shopify's response headers.
6. On a 404, `handleShopifyRedirects()` (through `marketAwareRedirect`) looks the path up in Shopify's URL redirects for the market.

To add a value to `context`, return it from `createAppContext()`; `env.d.ts` derives the context type from it.

## Development Guidelines

1. Always check existing code in the project to understand which specific React Router hooks and components are being used
2. When generating new code or modifying existing code, ensure all routing-related imports come from the correct React Router packages
3. If following documentation or examples based on Remix or classic Hydrogen, adapt the code to the replacements above
4. Register new routes in `app/routes.ts`; Pilot doesn't use file-based routing
5. Link to Hydrogen-owned account paths with a plain `<a>`/`<form>`, not `<Link>`/`<Form>`

When working in this codebase, always follow the React Router patterns that are already established in the existing code.

For more information, consult the official Remix to React Router upgrade guide: https://reactrouter.com/upgrading/remix and Hydrogen's packaged skills in `node_modules/@shopify/hydrogen/skills/`.
