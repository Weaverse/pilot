# Hydrogen upgrade guide: 2024.1.6 to 2024.4.0

----

## Features

### Add `@shopify/mini-oxygen` as a dev dependency for local development [#1891](https://github.com/Shopify/hydrogen/pull/1891)

#### package.json
[#1891](https://github.com/Shopify/hydrogen/pull/1891)
```diff
 "devDependencies": {
    "@remix-run/dev": "^2.8.0",
    "@remix-run/eslint-config": "^2.8.0",
+   "@shopify/mini-oxygen": "^3.0.0",
    "@shopify/oxygen-workers-types": "^4.0.0",
    ...
  }
```

### Support scaffolding projects from external repositories using the `--template` flag [#1867](https://github.com/Shopify/hydrogen/pull/1867)

#### The following examples are equivalent
[#1867](https://github.com/Shopify/hydrogen/pull/1867)
```bash
npm create @shopify/hydrogen -- --template shopify/hydrogen-demo-store
npm create @shopify/hydrogen -- --template github.com/shopify/hydrogen-demo-store
npm create @shopify/hydrogen -- --template https://github.com/shopify/hydrogen-demo-store
```

### Deprecate the `<Seo />` component in favor of directly using Remix meta route exports [#1875](https://github.com/Shopify/hydrogen/pull/1875)

#### Step: 1. Remove the `<Seo />` component from `root.jsx` [#1875](https://github.com/Shopify/hydrogen/pull/1875)

[#1875](https://github.com/Shopify/hydrogen/pull/1875)
```diff
export default function App() {
   const nonce = useNonce();
   const data = useLoaderData<typeof loader>();

   return (
     <html lang="en">
       <head>
         <meta charSet="utf-8" />
         <meta name="viewport" content="width=device-width,initial-scale=1" />
-        <Seo />
         <Meta />
         <Links />
       </head>
       <body>
         <Layout {...data}>
           <Outlet />
         </Layout>
         <ScrollRestoration nonce={nonce} />
         <Scripts nonce={nonce} />
         <LiveReload nonce={nonce} />
       </body>
     </html>
   );
 }
```

#### Step: 2. Add a Remix meta export to each route that returns an seo property from a loader or handle: [#1875](https://github.com/Shopify/hydrogen/pull/1875)

[#1875](https://github.com/Shopify/hydrogen/pull/1875)
```diff
+import {getSeoMeta} from '@shopify/hydrogen';

 export async function loader({context}) {
   const {shop} = await context.storefront.query(`
     query layout {
       shop {
         name
         description
       }
     }
   `);

   return {
     seo: {
       title: shop.title,
       description: shop.description,
     },
   };
 }

+export const meta = ({data}) => {
+   return getSeoMeta(data.seo);
+};
```

#### Step: 3. Merge root route meta data [#1875](https://github.com/Shopify/hydrogen/pull/1875)

[#1875](https://github.com/Shopify/hydrogen/pull/1875)
If your root route loader also returns an seo property, make sure to merge that data:

```js
export const meta = ({data, matches}) => {
  return getSeoMeta(
    matches[0].data.seo,
    // the current route seo data overrides the root route data
    data.seo,
  );
};
```
Or more simply:

```js
export const meta = ({data, matches}) => {
  return getSeoMeta(...matches.map((match) => match.data.seo));
};
```

#### Step: 4. Override meta [#1875](https://github.com/Shopify/hydrogen/pull/1875)

[#1875](https://github.com/Shopify/hydrogen/pull/1875)
Sometimes getSeoMeta might produce a property in a way you'd like to change. Map over the resulting array to change it. For example, Hydrogen removes query parameters from canonical URLs, add them back:

```js
export const meta = ({data, location}) => {
  return getSeoMeta(data.seo).map((meta) => {
    if (meta.rel === 'canonical') {
      return {
        ...meta,
        href: meta.href + location.search,
      };
    }

    return meta;
  });
};
```

### Codegen dependencies must be now listed explicitly in package.json [#1962](https://github.com/Shopify/hydrogen/pull/1962)

#### Update package.json
[#1962](https://github.com/Shopify/hydrogen/pull/1962)
```diff
{
  "devDependencies": {
+   "@graphql-codegen/cli": "5.0.2",
    "@remix-run/dev": "^2.8.0",
    "@remix-run/eslint-config": "^2.8.0",
+   "@shopify/hydrogen-codegen": "^0.3.0",
    "@shopify/mini-oxygen": "^2.2.5",
    "@shopify/oxygen-workers-types": "^4.0.0",
    ...
  }
}
```

----

----

## Fixes

### Fix a bug where cart could be null, even though a new cart was created by adding a line item. [#1865](https://github.com/Shopify/hydrogen/pull/1865)

#### Example
[#1865](https://github.com/Shopify/hydrogen/pull/1865)
```ts
import {
  createCartHandler,
  cartGetIdDefault,
  cartSetIdDefault,
} from '@shopify/hydrogen';

const cartHandler = createCartHandler({
  storefront,
  getCartId: cartGetIdDefault(request.headers),
  setCartId: cartSetIdDefault(),
  cartQueryFragment: CART_QUERY_FRAGMENT,
  cartMutateFragment: CART_MUTATE_FRAGMENT,
});

await cartHandler.addLines([{merchandiseId: '...'}]);
// .get() now returns the cart as expected
const cart = await cartHandler.get();
```

### Update Vite plugin imports, and how their options are passed to Remix [#1935](https://github.com/Shopify/hydrogen/pull/1935)

#### vite.config.js
[#1935](https://github.com/Shopify/hydrogen/pull/1935)
```diff
-import {hydrogen, oxygen} from '@shopify/cli-hydrogen/experimental-vite';
+import {hydrogen} from '@shopify/hydrogen/vite';
+import {oxygen} from '@shopify/mini-oxygen/vite';
import {vitePlugin as remix} from '@remix-run/dev';

export default defineConfig({
    hydrogen(),
    oxygen(),
    remix({
-     buildDirectory: 'dist',
+     presets: [hydrogen.preset()],
      future: {
```

### Change `storefrontRedirect` to ignore query parameters when matching redirects [#1900](https://github.com/Shopify/hydrogen/pull/1900)

#### This is a breaking change. If you want to retain the legacy functionality that is query parameter sensitive, pass matchQueryParams to storefrontRedirect():
[#1900](https://github.com/Shopify/hydrogen/pull/1900)
```js
storefrontRedirect({
  request,
  response,
  storefront,
+  matchQueryParams: true,
});
```

### Fix types returned by the session object [#1869](https://github.com/Shopify/hydrogen/pull/1869)

#### In remix.env.d.ts or env.d.ts, add the following types
[#1869](https://github.com/Shopify/hydrogen/pull/1869)
```diff
import type {
  // ...
  HydrogenCart,
+ HydrogenSessionData,
} from '@shopify/hydrogen';

// ...

declare module '@shopify/remix-oxygen' {
  // ...

+ interface SessionData extends HydrogenSessionData {}
}
```
