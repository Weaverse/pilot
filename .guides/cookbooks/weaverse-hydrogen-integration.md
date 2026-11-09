---
description:
globs:
alwaysApply: false
---
# Overview

This rule describes how to integrate "Weaverse" with a Shopify Hydrogen storefront on **Hydrogen 2026.10** (`@shopify/hydrogen` as a request-handler library) and **React Router 7**, using `@weaverse/hydrogen` 6. Below is a "recipe" that contains the steps to apply to a Hydrogen project to achieve the desired outcome. Pilot is the reference implementation: every file below exists in this repository, so read it when in doubt.
The same logic can be applied to any Hydrogen 2026.10 storefront, adapting the implementation details to the specific needs/structure/conventions of the project.

# AI model verification steps

- Import everything Weaverse from `@weaverse/hydrogen/react-router`. The root `@weaverse/hydrogen` entry is the framework-independent core and doesn't export `WeaverseClient`, `withWeaverse`, `WeaverseHydrogenRoot` or `useThemeSettings`.
- Use the 6.0 names: `WeaverseComponent`, `WeaverseComponentProps`, `WeaverseComponentSchema`, `WeaverseThemeSchema`, `WeaverseComponentLoaderArgs`, `WeaverseThemeSettingsResponse` (not the `Hydrogen*`/`ComponentLoaderArgs` names from 5.x).
- Section loaders query Shopify with `weaverse.storefront.graphql(doc, { variables, cache })` and a `gql()` document. There is no `storefront.query` and no implicit cache.
- Always use `settings` instead of `inspector` in component and theme schemas.
- Run `npm run typecheck` after changes, and `npm run weaverse:manifest` after a schema change (CI fails on a stale `.weaverse/component-manifest.json`).

# Summary

Integrate Weaverse with your Hydrogen storefront to enable visual page building capabilities without losing code-level control and customization.

# User Intent Recognition

<user_queries>
- How do I integrate Weaverse with my Hydrogen store?
- How do I create Weaverse section components?
- What are the best practices for Weaverse integration with Hydrogen?
- How can I create a custom Weaverse component?
- How do I set up Weaverse theme schema for Hydrogen?
- How to use Weaverse with Hydrogen for page building?
</user_queries>

# Troubleshooting

<troubleshooting>
- **Issue**: The Weaverse content isn't rendering.
  **Solution**: Check that the route loader returns the page under the `weaverseData` key (`weaverseData: await context.weaverse.loadPage(...)`) and that the route renders `<WeaverseContent />`. Check that the root `Layout` is wrapped with `withWeaverse` and the root loader returns `weaverseTheme`.

- **Issue**: Component schema isn't showing up in the Weaverse editor.
  **Solution**: Verify that the component is registered in `app/weaverse/components.ts` with a namespace import (`import * as X from "~/sections/x"`) and that it exports `schema` created with `createSchema()`.

- **Issue**: A section loader throws `storefront.query is not a function`.
  **Solution**: `weaverse.storefront` is the Hydrogen 2026.10 client. Use `weaverse.storefront.graphql(doc, { variables, cache })`.

- **Issue**: Studio can't connect, or design mode shows CSP errors.
  **Solution**: Check `WEAVERSE_PROJECT_ID`, and that `getWeaverseCsp()` is merged into the CSP in `app/entry.server.tsx` (it allows the Studio host, frame ancestors and `'unsafe-eval'` in design mode).
</troubleshooting>

# Recipe Implementation

<recipe_implementation>

## Description

Weaverse is a visual page builder with deep Shopify integration that keeps code-level control: sections are React components with a schema, editable in Weaverse Studio.

In this recipe, you'll make the following changes:

1. Install the Weaverse SDK and set its environment variables.
2. Add the Weaverse folder: component registry, theme schema, `WeaverseContent`, global style and CSP.
3. Create the `WeaverseClient` per request and expose it as `context.weaverse`.
4. Wire the root route and page routes.
5. Create a section with a data loader.

## Requirements

- A Hydrogen storefront on `@shopify/hydrogen` 2026.10 or later with React Router 7. On classic Hydrogen (2026.4 and earlier), stay on `@weaverse/hydrogen` 5.x or migrate first (`.guides/hydrogen-upgrades/upgrade-2026.4.7-to-2026.10.2.md`).
- A Weaverse account and project (sign up at [weaverse.io](https://weaverse.io)).

## Project Structure Overview

```text
my-hydrogen-project
├── app/
│   ├── .server/context.ts        # Builds the request context, including the WeaverseClient
│   ├── components/               # Reusable UI components
│   ├── sections/                 # Weaverse section components
│   ├── weaverse/
│   │   ├── components.ts         # Component registry
│   │   ├── index.tsx             # WeaverseContent
│   │   ├── schema.server.ts      # Theme schema
│   │   ├── style.tsx             # Global styles from theme settings
│   │   └── csp.ts                # Weaverse CSP directives
│   ├── entry.server.tsx          # Applies the CSP
│   └── root.tsx                  # withWeaverse + theme settings
├── env.d.ts                      # Env and context typing
└── server.ts                     # Request lifecycle
```

## Steps

### Step 1: Install the SDK and set the environment

```bash
npm install @weaverse/hydrogen@^6
```

#### File: .env

```bash
WEAVERSE_PROJECT_ID="your-weaverse-project-id"
# Optional
WEAVERSE_HOST="https://studio.weaverse.io"
WEAVERSE_API_KEY="your-api-key"
```

Type them by extending the SDK's `WeaverseEnv` (Pilot: `env.d.ts`):

```ts
import type { WeaverseEnv } from "@weaverse/hydrogen/react-router";

declare global {
  interface Env extends WeaverseEnv {
    SESSION_SECRET: string;
    PUBLIC_STORE_DOMAIN: string;
    // ...the storefront's other variables
  }
}
```

### Step 2: Register components

#### File: app/weaverse/components.ts

```ts
import type { WeaverseComponent } from "@weaverse/hydrogen/react-router";
import * as Heading from "~/components/heading";
import * as HeroImage from "~/sections/hero-image";
// MUST use namespace imports — NOT default imports

export const components: WeaverseComponent[] = [
  Heading,
  HeroImage,
  // Add other components to the array
];
```

### Step 3: Define the theme schema

#### File: app/weaverse/schema.server.ts

```ts
import type { WeaverseThemeSchema } from "@weaverse/hydrogen/react-router";
import packageJson from "../../package.json" with { type: "json" };

const DEFAULT_LOCALE = {
  pathPrefix: "",
  label: "United States (USD $)",
  language: "EN",
  country: "US",
  currency: "USD",
} as const;

export const themeSchema: WeaverseThemeSchema = {
  info: {
    version: packageJson.version,
    author: "Your Brand",
    name: "Your Theme Name",
    authorProfilePhoto: "https://cdn.shopify.com/your-logo.png",
    documentationUrl: "https://your-docs-site.com",
    supportUrl: "https://your-support-site.com",
  },
  i18n: {
    urlStructure: "url-path",
    defaultLocale: DEFAULT_LOCALE,
    // Every market the storefront serves, including the default one
    shopLocales: [DEFAULT_LOCALE],
  },
  settings: [
    {
      group: "Layout",
      inputs: [
        {
          type: "range",
          label: "Page width",
          name: "pageWidth",
          configs: { min: 1000, max: 1600, step: 10, unit: "px" },
          defaultValue: 1280,
        },
      ],
    },
    // Add other settings groups
  ],
};
```

Pilot's schema takes its locales from `app/utils/locale.ts` and adds the Translation Manager (`translation: true` with `staticContent`), Media Manager filters and its settings groups from `app/weaverse/settings/*`.

### Step 4: Add `WeaverseContent` and the global style

#### File: app/weaverse/index.tsx

```tsx
import { WeaverseHydrogenRoot } from "@weaverse/hydrogen/react-router";
import { GenericError } from "~/components/root/generic-error";
import { components } from "./components";

export function WeaverseContent() {
  return (
    <WeaverseHydrogenRoot
      components={components}
      errorComponent={GenericError}
    />
  );
}
```

#### File: app/weaverse/style.tsx

Only values that come from theme settings belong here; static CSS goes in a stylesheet.

```tsx
import { useThemeSettings } from "@weaverse/hydrogen/react-router";

export function GlobalStyle() {
  const settings = useThemeSettings();
  if (!settings) {
    return null;
  }
  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `:root { --page-width: ${settings.pageWidth}px; }`,
      }}
    />
  );
}
```

### Step 5: Create the client per request

Hydrogen 2026.10 has no `createHydrogenContext()`; the app builds the request context itself. `WeaverseClient` takes the request-scoped storefront client (not a classic Hydrogen context).

#### File: app/.server/context.ts (trimmed)

```ts
import { WeaverseClient } from "@weaverse/hydrogen/react-router";
import { components } from "~/weaverse/components";
import { themeSchema } from "~/weaverse/schema.server";

export async function createAppContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const cache = await caches.open("hydrogen");
  const storefront = createRequestStorefront({ request, env, cache, waitUntil });

  const weaverse = new WeaverseClient({
    storefront,
    env,
    cache,
    waitUntil,
    request,
    themeSchema,
    components,
  });

  return { env, cache, waitUntil, storefront, weaverse };
}
```

`createRequestStorefront` (`app/.server/storefront.ts`) wraps Hydrogen's `createStorefrontClient` with `createShopifyRequestContext`. Pilot also passes `customerAccount` and `throwPageLoadFailures: true` (a Weaverse outage becomes a retryable 503 through `throwRouteFailures` in `app/weaverse/load-failure.ts`), and gives Weaverse the market's public locale (`weaverseStorefront`).

#### File: server.ts (excerpt)

The context is copied onto React Router's context after Hydrogen's own routes had their chance:

```ts
import { createRequestHandler, RouterContextProvider } from "react-router";
import * as serverBuild from "virtual:react-router/server-build";

const handleRequest = createRequestHandler(serverBuild, process.env.NODE_ENV);

// inside fetch(request, env, executionContext):
const appContext = await createAppContext(request, env, executionContext);
// ...handleShopifyRoutes() for cart, checkout, OAuth, ...
const routerContext = Object.assign(new RouterContextProvider(), appContext);
const response = await handleRequest(request, routerContext);
```

#### File: env.d.ts (excerpt)

```ts
import type { AppContext } from "./app/.server/context";

declare module "react-router" {
  interface AppLoadContext extends AppContext {}
  interface RouterContextProvider extends AppContext {}
}
```

### Step 6: Wire the root route

The root loader returns the theme settings under `weaverseTheme`, and the root `Layout` is wrapped with `withWeaverse` (wrapping `Layout` rather than the default `App` keeps the Studio bridge on error-boundary renders).

#### File: app/root.tsx (excerpt)

```tsx
import { withWeaverse } from "@weaverse/hydrogen/react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { useNonce } from "~/utils/csp";
import { GlobalStyle } from "~/weaverse/style";

export async function loader({ context }: LoaderFunctionArgs) {
  return {
    weaverseTheme: await context.weaverse.loadThemeSettings(),
    // ...layout data
  };
}

export const Layout = withWeaverse(function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = useNonce();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <GlobalStyle />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
});

export default function App() {
  return <Outlet />;
}
```

### Step 7: Load pages in routes

Load the Weaverse page in parallel with the route's Shopify queries and return it under `weaverseData`.

```tsx
import type { LoaderFunctionArgs } from "react-router";
import { PRODUCT_QUERY } from "~/graphql/queries";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const handle = params.productHandle ?? "";
  const [{ product }, weaverseData] = await Promise.all([
    context.storefront
      .graphql(PRODUCT_QUERY, {
        variables: { handle, selectedOptions: [] },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
    context.weaverse.loadPage({ type: "PRODUCT", handle }),
  ]);
  if (!product) {
    throw new Response("Not found", { status: 404 });
  }
  return { product, weaverseData };
}

export default function Product() {
  return <WeaverseContent />;
}
```

Page types: `INDEX`, `PRODUCT`, `ALL_PRODUCTS`, `COLLECTION`, `COLLECTION_LIST`, `PAGE`, `BLOG`, `ARTICLE`, `CUSTOM`.

### Step 8: Allow Weaverse in the CSP

Hydrogen 2026.10 no longer ships `createContentSecurityPolicy`/`NonceProvider`; Pilot ports them to `app/utils/csp.ts`. `getWeaverseCsp(request, env)` in `app/weaverse/csp.ts` returns the Weaverse directives (Studio hosts, plus `frameAncestors: ["*"]` and `'unsafe-eval'` in design mode).

#### File: app/entry.server.tsx (excerpt)

```tsx
import {
  createContentSecurityPolicy,
  generateNonce,
  NonceProvider,
} from "~/utils/csp";
import { getWeaverseCsp } from "~/weaverse/csp";

const nonce = generateNonce();
const header = createContentSecurityPolicy(
  nonce,
  getWeaverseCsp(request, context.env),
  {
    checkoutDomain:
      context.env?.PUBLIC_CHECKOUT_DOMAIN || context.env?.PUBLIC_STORE_DOMAIN,
    storeDomain: context.env?.PUBLIC_STORE_DOMAIN,
  },
);
// Wrap <ServerRouter> in <NonceProvider value={nonce}> and set the
// Content-Security-Policy(-Report-Only) header.
```

### Step 9: Create a section with a loader

A section exports a default component, a `schema`, and optionally a `loader` that runs on the server. Spread the remaining props on the root element: Studio needs them to select the section.

#### File: app/sections/collection-spotlight/index.tsx

```tsx
import { gql } from "@shopify/hydrogen";
import {
  createSchema,
  type WeaverseCollection,
  type WeaverseComponentLoaderArgs,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Money } from "~/components/money";
import { CACHE_LONG } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

// `$country`/`$language` are filled by the storefront client from the request.
const COLLECTION_SPOTLIGHT_QUERY = gql(`
  query CollectionSpotlight(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        nodes {
          id
          title
          handle
          featuredImage {
            id
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`);

type CollectionSpotlightData = {
  collection?: WeaverseCollection;
  heading: string;
  productsToShow: number;
};

export async function loader({
  weaverse,
  data,
}: WeaverseComponentLoaderArgs<CollectionSpotlightData>) {
  if (!data.collection?.handle) {
    return null;
  }
  const { collection } = unwrapStorefront(
    await weaverse.storefront.graphql(COLLECTION_SPOTLIGHT_QUERY, {
      variables: {
        handle: data.collection.handle,
        first: data.productsToShow,
      },
      cache: CACHE_LONG,
    }),
  );
  return { collection };
}

interface CollectionSpotlightProps
  extends
    WeaverseComponentProps<Awaited<ReturnType<typeof loader>>>,
    CollectionSpotlightData {}

export default function CollectionSpotlight(props: CollectionSpotlightProps) {
  const { loaderData, heading, collection: _, productsToShow, ...rest } = props;
  const collection = loaderData?.collection;

  return (
    <section {...rest} className="px-4 py-8">
      {heading && <h2 className="mb-6 text-center">{heading}</h2>}
      {collection ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {collection.products.nodes.map((product) => (
            <Link key={product.id} to={`/products/${product.handle}`}>
              {product.featuredImage && (
                <Image
                  data={product.featuredImage}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              )}
              <h3 className="mt-3 text-sm">{product.title}</h3>
              <Money data={product.priceRange.minVariantPrice} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center">Select a collection to display.</p>
      )}
    </section>
  );
}

export const schema = createSchema({
  type: "collection-spotlight",
  title: "Collection spotlight",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "collection",
          name: "collection",
          label: "Collection",
          shouldRevalidate: true,
        },
        {
          type: "text",
          name: "heading",
          label: "Heading",
          defaultValue: "Featured collection",
        },
        {
          type: "range",
          name: "productsToShow",
          label: "Products to show",
          defaultValue: 4,
          shouldRevalidate: true,
          configs: { min: 2, max: 12, step: 1 },
        },
      ],
    },
  ],
});
```

#### File: app/weaverse/components.ts

```diff
@@ -10,6 +10,7 @@ import * as AllProductsToolbar from "~/sections/all-products/toolbar";
 import * as BlogPost from "~/sections/blog-post";
 import * as Blogs from "~/sections/blogs";
 import * as CollectionList from "~/sections/collection-list";
+import * as CollectionSpotlight from "~/sections/collection-spotlight";
 import * as CollectionListItems from "~/sections/collection-list/collections-items";
 import * as ColumnsWithImages from "~/sections/columns-with-images";
 import * as ColumnWithImageItem from "~/sections/columns-with-images/column";
@@ -156,6 +157,7 @@ export const components: WeaverseComponent[] = [
   CollectionFilters,
   ProductGrid,
   CollectionList,
+  CollectionSpotlight,
   CollectionListItems,
   SingleProduct,
   JudgemeStarsRating,
```

Then regenerate the manifest and check types:

```bash
npm run weaverse:manifest
npm run typecheck
```

## Best Practices

- **Loaders**: return only what the section renders, pass an explicit `cache` (`CACHE_LONG` for merchandising content, `CACHE_DEFAULT` for products), and add `shouldRevalidate: true` to inputs the loader reads so Studio reloads the data when they change.
- **Markets**: don't pass `country`/`language` in `variables`; the storefront client injects them.
- **Children**: render `{children}` in sections that accept child components and list them in `childTypes`.
- **Presets**: provide `presets` so a section is usable as soon as it is added. Never hardcode product or collection handles in presets; let the merchant pick them in Studio.
- **Conditional inputs**: use `condition` to show an input only when it applies.
- **Theme settings**: read them with `useThemeSettings()`; keep `GlobalStyle` to values that come from settings.
- **React 19**: pass `ref` as a prop; `forwardRef` is not needed.

## Further Resources

- [Weaverse Documentation](https://docs.weaverse.io)
- [Weaverse Hydrogen skills](https://github.com/Weaverse/shopify-hydrogen-skills/tree/main/skills/weaverse-hydrogen)
- Hydrogen's packaged skills: `node_modules/@shopify/hydrogen/skills/`
- [Shopify Hydrogen Documentation](https://shopify.dev/docs/storefronts/headless/hydrogen)
</recipe_implementation>
