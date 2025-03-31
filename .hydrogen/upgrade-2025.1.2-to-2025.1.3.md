# Hydrogen upgrade guide: 2025.1.2 to 2025.1.3

----

## Features

### Add support for `v3_routeConfig` future flag. [#2722](https://github.com/Shopify/hydrogen/pull/2722)

#### Step: 1. Update your `vite.config.ts`. [#2722](https://github.com/Shopify/hydrogen/pull/2722)

[docs](https://remix.run/docs/en/main/start/future-flags#v3_routeconfig)
[#2722](https://github.com/Shopify/hydrogen/pull/2722)
export default defineConfig({
 plugins: [
   hydrogen(),
   oxygen(),
   remix({
     presets: [hydrogen.v3preset()],  // Update this to hydrogen.v3preset()
     future: {
       v3_fetcherPersist: true,
       v3_relativeSplatPath: true,
       v3_throwAbortReason: true,
       v3_lazyRouteDiscovery: true,
       v3_singleFetch: true,
       v3_routeConfig: true, // add this flag
     },
   }),
   tsconfigPaths(),
 ],

#### Step: 2. Update your `package.json` and install the new packages. Make sure to match the Remix version along with other Remix npm packages and ensure the versions are 2.16.1 or above. [#2722](https://github.com/Shopify/hydrogen/pull/2722)

[docs](https://remix.run/docs/en/main/start/future-flags#v3_routeconfig)
[#2722](https://github.com/Shopify/hydrogen/pull/2722)
"devDependencies": {
  ...
  "@remix-run/fs-routes": "^2.16.1",
  "@remix-run/route-config": "^2.16.1",

#### Step: 3. Move the `Layout` component export from `root.tsx` into its own file. Make sure to supply an `<Outlet>` so Remix knows where to inject your route content. [#2722](https://github.com/Shopify/hydrogen/pull/2722)

[docs](https://remix.run/docs/en/main/start/future-flags#v3_routeconfig)
[#2722](https://github.com/Shopify/hydrogen/pull/2722)
// /app/layout.tsx
import {Outlet} from '@remix-run/react';

export default function Layout() {
 const nonce = useNonce();
 const data = useRouteLoaderData<RootLoader>('root');

 return (
   <html lang="en">
     ...
     <Outlet />
     ...
   </html>
 );
}

// Remember to remove the Layout export from your root.tsx


#### Step: 4. Add a `routes.ts` file. This is your new Remix route configuration file. [#2722](https://github.com/Shopify/hydrogen/pull/2722)

[docs](https://remix.run/docs/en/main/start/future-flags#v3_routeconfig)
[#2722](https://github.com/Shopify/hydrogen/pull/2722)
import {flatRoutes} from '@remix-run/fs-routes';
import {layout, type RouteConfig} from '@remix-run/route-config';
import {hydrogenRoutes} from '@shopify/hydrogen';

export default hydrogenRoutes([
 // Your entire app reading from routes folder using Layout from layout.tsx
 layout('./layout.tsx', (await flatRoutes())),
]) satisfies RouteConfig;

----
