# Hydrogen upgrade guide: 2024.10.1 to 2025.1.0

----

## Features

### Turn on Remix future flag v3_lazyRouteDiscovery [#2702](https://github.com/Shopify/hydrogen/pull/2702)

#### Add the following line to your vite.config.ts and test your app.
[#2702](https://github.com/Shopify/hydrogen/pull/2702)
```diff
export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
+        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
```

----

----

## Fixes

### Workaround for "Error: failed to execute 'insertBefore' on 'Node'" that sometimes happen during development. [#2710](https://github.com/Shopify/hydrogen/pull/2710)

#### Update your root.tsx so that your style link tags are actual html link tags
[#2710](https://github.com/Shopify/hydrogen/pull/2710)
```diff
// root.tsx

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
-    {rel: 'stylesheet', href: resetStyles},
-    {rel: 'stylesheet', href: appStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

...

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
+        <link rel="stylesheet" href={resetStyles}></link>
+        <link rel="stylesheet" href={appStyles}></link>

```
