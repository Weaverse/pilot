# Hydrogen upgrade guide: 2025.5.0 to 2025.7.0

----

## Breaking changes

### Migrate to React Router 7.9.x [#3141](https://github.com/Shopify/hydrogen/pull/3141)

#### Step: 1. Run the automated migration codemod [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> This codemod will automatically update most imports and references from Remix to React Router
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
npx codemod@latest remix/2/react-router/upgrade
```


#### Step: 2. Create react-router.config.ts with hydrogenPreset [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Create your React Router configuration file using Hydrogen's optimized preset. This enhances routing and build performance.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```typescript
// react-router.config.ts
import type {Config} from "@react-router/dev/config";
import {hydrogenPreset} from "@shopify/hydrogen/react-router-preset";

export default {
  presets: [hydrogenPreset()],
} satisfies Config;
```


#### Step: 3. Update vite.config.ts to use React Router plugin [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace the Remix Vite plugin with React Router's plugin. Add vite-tsconfig-paths for better path resolution.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
// vite.config.ts
import {defineConfig} from 'vite';
- import {vitePlugin as remix} from '@remix-run/dev';
+ import {reactRouter} from '@react-router/dev/vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
+ import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
+   hydrogen(),
+   oxygen(),
+   reactRouter(),
+   tsconfigPaths()
-   remix({
-     presets: [hydrogen.preset()],
-   }),
  ],
});
```


#### Step: 4. Update tsconfig.json for React Router type generation [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Update your TypeScript configuration to include React Router's generated types. This optimizes type checking.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
// tsconfig.json
{
  "include": [
    "env.d.ts",
    "app/**/*.ts",
    "app/**/*.tsx",
+   "app/**/*.d.ts",
+   "*.ts",
+   "*.tsx",
+   "*.d.ts",
+   ".graphqlrc.ts",
+   ".react-router/types/**/*"
-   "**/*.ts",
-   "**/*.tsx"
  ],
  "compilerOptions": {
    "types": [
      "@shopify/oxygen-workers-types",
+     "react-router",
+     "@shopify/hydrogen/react-router-types",
+     "vite/client"
-     "@remix-run/node",
-     "vite/client"
    ],
+   "rootDirs": [".", "./.react-router/types"],
    "baseUrl": ".",
    "paths": {
      "~/*": ["app/*"]
    }
  }
}
```


#### Step: 5. Create app/lib/context.ts with createHydrogenRouterContext [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Create a new context file that exports the createHydrogenRouterContext function. This supports additional context properties and type augmentation.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```typescript
// app/lib/context.ts
import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
} as const;

type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: {language: 'EN', country: 'US'},
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
```


#### Step: 6. Update server.ts to use createHydrogenRouterContext [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace @shopify/remix-oxygen with @shopify/hydrogen/oxygen. Use the new context creation function with session handling.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
// server.ts
- import {createRequestHandler} from "@shopify/remix-oxygen";
+ import {createRequestHandler} from "@shopify/hydrogen/oxygen";
+ import {createHydrogenRouterContext} from "~/lib/context";

export default {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
+   const hydrogenContext = await createHydrogenRouterContext(
+     request,
+     env,
+     executionContext,
+   );

    const handleRequest = createRequestHandler({
-     build: await import('virtual:remix/server-build'),
+     build: await import('virtual:react-router/server-build'),
      mode: process.env.NODE_ENV,
-     getLoadContext: () => ({...}),
+     getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);
+
+   if (hydrogenContext.session.isPending) {
+     response.headers.set('Set-Cookie', await hydrogenContext.session.commit());
+   }

    return response;
  }
};
```


#### Step: 7. Update entry.server.tsx with new context types [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace Remix types with React Router types. Use HydrogenRouterContextProvider for better type safety.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
// app/entry.server.tsx
- import type {AppLoadContext} from "@shopify/remix-oxygen";
- import type {EntryContext} from "@remix-run/server-runtime";
+ import type {EntryContext} from "react-router";
import {
  createContentSecurityPolicy,
+ type HydrogenRouterContextProvider,
} from "@shopify/hydrogen";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
- remixContext: EntryContext,
+ reactRouterContext: EntryContext,
- context: AppLoadContext,
+ context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({...});

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
-       context={remixContext}
+       context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
  );
}
```


#### Step: 8. Update entry.client.tsx with NonceProvider and HydratedRouter [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace RemixBrowser with HydratedRouter. Wrap with NonceProvider for CSP support during client-side hydration.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
// app/entry.client.tsx
- import {RemixBrowser} from "@remix-run/react";
+ import {HydratedRouter} from "react-router/dom";
import {startTransition, StrictMode} from "react";
import {hydrateRoot} from "react-dom/client";
+ import {NonceProvider} from "@shopify/hydrogen";

if (!window.location.origin.includes("webcache.googleusercontent.com")) {
  startTransition(() => {
+   const existingNonce = document
+     .querySelector<HTMLScriptElement>("script[nonce]")
+     ?.nonce;
+
    hydrateRoot(
      document,
      <StrictMode>
-       <RemixBrowser />
+       <NonceProvider value={existingNonce}>
+         <HydratedRouter />
+       </NonceProvider>
      </StrictMode>,
    );
  });
}
```


#### Step: 9. Update @shopify/remix-oxygen imports in route files [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace @shopify/remix-oxygen imports with react-router equivalents in your routes
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
- import {redirect, type LoaderFunctionArgs} from "@shopify/remix-oxygen";
+ import {redirect} from "react-router";
+ import type {LoaderFunctionArgs} from "@shopify/hydrogen/oxygen";
```


#### Step: 10. Update @remix-run/react imports in route files [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Replace @remix-run/react imports with react-router equivalents in your routes
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
- import {useLoaderData, type MetaFunction} from "@remix-run/react";
+ import {useLoaderData} from "react-router";
```


#### Step: 11. Add React Router 7 route type imports [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Import route-specific types from React Router 7's new type generation system
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
+ import type {Route} from "./+types/route-name";
```


#### Step: 12. Add .react-router to .gitignore [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> React Router 7 generates type files that should not be committed to version control
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
echo ".react-router/" >> .gitignore
```


#### Step: 13. Update package.json scripts to use react-router typegen [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Add React Router type generation to your dev script. This automatically updates types during development.
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
- "dev": "shopify hydrogen dev --codegen",
+ "dev": "react-router typegen --watch && shopify hydrogen dev --codegen",
```


#### Step: 14. Verify your app starts and builds correctly [#3141](https://github.com/Shopify/hydrogen/pull/3141)

> Test that your application runs without errors after the migration
[#3141](https://github.com/Shopify/hydrogen/pull/3141)
```diff
npm run dev
npm run build
```


----

## Features

### Add countryCode parameter to Customer Account API methods [#3148](https://github.com/Shopify/hydrogen/pull/3148)

#### Add countryCode parameter to Customer Account API method calls
> Pass the customer account country code to any Customer Account API method. See login method example.
[#3148](https://github.com/Shopify/hydrogen/pull/3148)
```diff
// app/routes/account_.login.tsx (example)
export async function loader({request, context}: Route.LoaderArgs) {
  return context.customerAccount.login({
+   countryCode: context.customerAccount.i18n.country,
  });
}

// The countryCode parameter is now available on all Customer Account API methods
// and can be passed from context.customerAccount.i18n.country
```


### Remove individual gift cards from cart [#3128](https://github.com/Shopify/hydrogen/pull/3128)

#### Step: 1. Add GiftCardCodesRemove case to cart action handler [#3128](https://github.com/Shopify/hydrogen/pull/3128)

> Handle the new GiftCardCodesRemove action in your cart route. This enables individual gift card removal.
[#3128](https://github.com/Shopify/hydrogen/pull/3128)
```diff
// app/routes/cart.tsx
export async function action({request, context}: Route.ActionArgs) {
  const {cart} = context;
  const formData = await request.formData();
  const {action, inputs} = CartForm.getFormInput(formData);

  switch (action) {
    // ... existing cases ...
+   case CartForm.ACTIONS.GiftCardCodesRemove: {
+     const appliedGiftCardIds = inputs.giftCardCodes as string[];
+     result = await cart.removeGiftCardCodes(appliedGiftCardIds);
+     break;
+   }
  }
}
```


#### Step: 2. Add RemoveGiftCardForm component [#3128](https://github.com/Shopify/hydrogen/pull/3128)

> Create a new form component to handle individual gift card removal
[#3128](https://github.com/Shopify/hydrogen/pull/3128)
```diff
// app/components/CartSummary.tsx
+function RemoveGiftCardForm({
+  giftCardId,
+  children,
+}: {
+  giftCardId: string;
+  children: React.ReactNode;
+}) {
+  return (
+    <CartForm
+      route="/cart"
+      action={CartForm.ACTIONS.GiftCardCodesRemove}
+      inputs={{
+        giftCardCodes: [giftCardId],
+      }}
+    >
+      {children}
+    </CartForm>
+  );
+}
```


#### Step: 3. Update CartGiftCard to display gift cards with remove buttons [#3128](https://github.com/Shopify/hydrogen/pull/3128)

> Render applied gift cards with individual remove buttons. This improves user experience.
[#3128](https://github.com/Shopify/hydrogen/pull/3128)
```diff
// app/components/CartSummary.tsx
function CartGiftCard({giftCardCodes}: {...}) {
  return (
    <div>
+     {giftCardCodes && giftCardCodes.length > 0 && (
+       <dl>
+         <dt>Applied Gift Card(s)</dt>
+         {giftCardCodes.map((giftCard) => (
+           <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
+             <div className="cart-discount">
+               <code>***{giftCard.lastCharacters}</code>
+               <Money data={giftCard.amountUsed} />
+               <button type="submit">Remove</button>
+             </div>
+           </RemoveGiftCardForm>
+         ))}
+       </dl>
+     )}
    </div>
  );
}
```


### Filter customer orders by number and confirmation [#3125](https://github.com/Shopify/hydrogen/pull/3125)

#### Step: 1. Create app/lib/orderFilters.ts utility [#3125](https://github.com/Shopify/hydrogen/pull/3125)

> Create helper functions to parse URL parameters and build Customer Account API search queries.
[#3125](https://github.com/Shopify/hydrogen/pull/3125)
```typescript
// app/lib/orderFilters.ts
export const ORDER_FILTER_FIELDS = {
  NAME: 'name',
  CONFIRMATION_NUMBER: 'confirmation_number',
} as const;

export interface OrderFilterParams {
  name?: string;
  confirmationNumber?: string;
}

function sanitizeFilterValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9_\-]/g, '');
}

export function buildOrderSearchQuery(
  filters: OrderFilterParams,
): string | undefined {
  const queryParts: string[] = [];

  if (filters.name) {
    const cleanName = filters.name.replace(/^#/, '').trim();
    const sanitizedName = sanitizeFilterValue(cleanName);
    if (sanitizedName) {
      queryParts.push(`name:${sanitizedName}`);
    }
  }

  if (filters.confirmationNumber) {
    const cleanConfirmation = filters.confirmationNumber.trim();
    const sanitizedConfirmation = sanitizeFilterValue(cleanConfirmation);
    if (sanitizedConfirmation) {
      queryParts.push(`confirmation_number:${sanitizedConfirmation}`);
    }
  }

  return queryParts.length > 0 ? queryParts.join(' AND ') : undefined;
}

export function parseOrderFilters(
  searchParams: URLSearchParams,
): OrderFilterParams {
  const filters: OrderFilterParams = {};

  const name = searchParams.get(ORDER_FILTER_FIELDS.NAME);
  if (name) filters.name = name;

  const confirmationNumber = searchParams.get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER);
  if (confirmationNumber) filters.confirmationNumber = confirmationNumber;

  return filters;
}
```


#### Step: 2. Update loader to parse filters and build search query [#3125](https://github.com/Shopify/hydrogen/pull/3125)

> Parse URL search parameters and build the Customer Account API query string.
[#3125](https://github.com/Shopify/hydrogen/pull/3125)
```diff
// app/routes/account.orders._index.tsx
+import {
+  buildOrderSearchQuery,
+  parseOrderFilters,
+  type OrderFilterParams,
+} from '~/lib/orderFilters';

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

+ const url = new URL(request.url);
+ const filters = parseOrderFilters(url.searchParams);
+ const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
+     query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

- return {customer: data.customer};
+ return {customer: data.customer, filters};
}
```


#### Step: 3. Add OrderSearchForm component [#3125](https://github.com/Shopify/hydrogen/pull/3125)

> Create a search form with order number and confirmation number inputs
[#3125](https://github.com/Shopify/hydrogen/pull/3125)
```diff
// app/routes/account.orders._index.tsx
+import {useSearchParams, useNavigation} from 'react-router';
+import {useRef} from 'react';
+import {ORDER_FILTER_FIELDS} from '~/lib/orderFilters';

+function OrderSearchForm({currentFilters}: {currentFilters: OrderFilterParams}) {
+  const [searchParams, setSearchParams] = useSearchParams();
+  const navigation = useNavigation();
+  const isSearching = navigation.state !== 'idle' && navigation.location?.pathname?.includes('orders');
+  const formRef = useRef<HTMLFormElement>(null);
+
+  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
+    event.preventDefault();
+    const formData = new FormData(event.currentTarget);
+    const params = new URLSearchParams();
+
+    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
+    const confirmationNumber = formData.get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)?.toString().trim();
+
+    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
+    if (confirmationNumber) params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);
+
+    setSearchParams(params);
+  };
+
+  return (
+    <form ref={formRef} onSubmit={handleSubmit}>
+      <input type="search" name={ORDER_FILTER_FIELDS.NAME} placeholder="Order #" defaultValue={currentFilters.name || ''} />
+      <input type="search" name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER} placeholder="Confirmation #" defaultValue={currentFilters.confirmationNumber || ''} />
+      <button type="submit" disabled={isSearching}>{isSearching ? 'Searching' : 'Search'}</button>
+    </form>
+  );
+}
```


#### Step: 4. Update Orders component to use filters and add EmptyOrders [#3125](https://github.com/Shopify/hydrogen/pull/3125)

> Pass filters to components and add conditional empty state messaging.
[#3125](https://github.com/Shopify/hydrogen/pull/3125)
```diff
// app/routes/account.orders._index.tsx
export default function Orders() {
- const {customer} = useLoaderData<OrdersLoaderData>();
+ const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;

  return (
    <div className="orders">
+     <OrderSearchForm currentFilters={filters} />
-     <OrdersTable orders={orders} />
+     <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

-function OrdersTable({orders}: {orders: CustomerOrdersFragment['orders']}) {
+function OrdersTable({orders, filters}: {orders: CustomerOrdersFragment['orders']; filters: OrderFilterParams}) {
+  const hasFilters = !!(filters.name || filters.confirmationNumber);
+
  return (
    <div>
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
-       <p>You haven't placed any orders yet.</p>
+       <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

+function EmptyOrders({hasFilters}: {hasFilters?: boolean}) {
+  return hasFilters ? (
+    <p>No orders found matching your search. <Link to="/account/orders">Clear filters</Link></p>
+  ) : (
+    <p>You haven't placed any orders yet.</p>
+  );
+}
```


### Get order fulfillment status from Customer Account API [#3039-fulfillment](https://github.com/Shopify/hydrogen/pull/3039)

#### Add fulfillmentStatus field to Order fragment
> Include fulfillmentStatus in your Customer Account API order queries.
[#3039-fulfillment](https://github.com/Shopify/hydrogen/pull/3039)
```diff
// app/graphql/customer-account/CustomerOrderQuery.ts
fragment Order on Order {
  id
  name
  confirmationNumber
  statusPageUrl
+ fulfillmentStatus
  processedAt
  fulfillments(first: 1) {
    nodes {
      status
    }
  }
}
```


### Use language context in Customer Account API mutations [#3039-incontext](https://github.com/Shopify/hydrogen/pull/3039)

#### Add @inContext directive to all Customer Account API operations
> Add $language parameter and @inContext directive to your queries and mutations for localized content.
[#3039-incontext](https://github.com/Shopify/hydrogen/pull/3039)
```diff
// app/graphql/customer-account/*.ts (apply to all queries and mutations)
// Example: CustomerDetailsQuery.ts
- query CustomerDetails {
+ query CustomerDetails($language: LanguageCode) @inContext(language: $language) {
    customer {
      ...Customer
    }
  }

// Example: CustomerAddressMutations.ts  
  mutation CustomerAddressUpdate(
    $address: MailingAddressInput!
    $addressId: ID!
    $defaultAddress: Boolean
+   $language: LanguageCode
- ) {
+ ) @inContext(language: $language) {
    customerAddressUpdate(...)
  }

// Apply this pattern to all Customer Account API queries and mutations:
// - CustomerDetailsQuery.ts
// - CustomerOrderQuery.ts
// - CustomerOrdersQuery.ts
// - CustomerUpdateMutation.ts
// - CustomerAddressMutations.ts (all 3 mutations)
```


### Defer non-critical fields with GraphQL @defer directive [#2993](https://github.com/Shopify/hydrogen/pull/2993)

#### Use @defer directive in Storefront API queries
> Wrap non-critical fields with @defer. This improves initial page load performance.
[#2993](https://github.com/Shopify/hydrogen/pull/2993)
```diff
// app/routes/your-route.tsx (example)
+import {LoaderFunctionArgs, useLoaderData} from 'react-router';

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(
    `
  query ProductQuery($handle: String) {
    product(handle: $handle) {
      id
      handle
+     ... @defer(label: "deferredFields") {
+       title
+       description
+     }
    }
  }
`,
    {
      variables: {
        handle: 'v2-snowboard',
      },
    },
  );
  return data;
}

// The @defer directive allows you to defer loading of non-critical fields
// improving initial page load performance
```


----

----

## Fixes

### Use stable Customer Account API development flag [#3082-flag](https://github.com/Shopify/hydrogen/pull/3082)

#### Update command to use stable flag
> Remove the __unstable suffix from the customer-account-push command
[#3082-flag](https://github.com/Shopify/hydrogen/pull/3082)
```diff
- shopify hydrogen customer-account-push__unstable [flags]
+ shopify hydrogen customer-account-push [flags]

// The --customer-account-push flag is now stable and no longer requires __unstable suffix
```


### Add TypeScript ESLint rules for promise handling [#3146](https://github.com/Shopify/hydrogen/pull/3146)

#### Add promise handling rules to ESLint config
> Enable no-floating-promises and no-misused-promises rules. These catch unhandled promises that cause deployment failures.
[#3146](https://github.com/Shopify/hydrogen/pull/3146)
```diff
// eslint.config.js
export default tseslint.config(
  {
    rules: {
      // ... existing rules ...
+     '@typescript-eslint/no-floating-promises': 'error',
+     '@typescript-eslint/no-misused-promises': 'error',
    },
  },
);

// These rules prevent unhandled promises and promise misuse
// Helps avoid 'The script will never generate a response' errors on Oxygen/Cloudflare Workers
```

