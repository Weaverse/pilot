# Implementation Plan

## Context

- **Hydrogen version**: 2026.1.2 (supports `getAccessToken()`, no login param patch needed)
- **Current state**: Header renders a `UserIcon` linking to `/account`. Auth uses Hydrogen's `customerAccount` API via OAuth.
- **Reference**: [Shopify docs](https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/hydrogen-with-account-component)
- **Approach**: Root Loader + Head Script — follow Shopify's official pattern exactly

## Data Flow

```
root loader
  ├─ critical: publicStoreDomain (new field from env)
  │            publicAccessToken = consent.storefrontAccessToken (reuse existing)
  └─ deferred: customerAccessToken (via getAccessToken() → string | undefined)
       │
       ▼
Layout (<head>)
  └─ <script nonce={nonce} src="cdn.shopify.com/.../account.js" />
       │
       ▼
Header
  └─ <shopify-store store-domain=... public-access-token=... customer-access-token=...>
       └─ <shopify-account sign-in-url="/account/login" />
```

## Files and Folders Touched

| File | Type | Description |
|------|------|-------------|
| `app/.server/root.ts` | Modified | Add `publicStoreDomain` to critical data, `customerAccessToken` to deferred |
| `app/root.tsx` | Modified | Add script tag in `<head>` with nonce |
| `app/components/layout/header.tsx` | Modified | Replace AccountLink with ShopifyAccountButton |
| `app/weaverse/csp.ts` | Modified | Add `scriptSrc` for cdn.shopify.com |
| `app/types/shopify-account.d.ts` | New | React.JSX module augmentation for custom elements |

## Steps

### Step 1: TypeScript declarations (`app/types/shopify-account.d.ts`)

Create new file. Since `tsconfig.json` uses `"jsxImportSource": "react"`, must use React.JSX module augmentation (not global `JSX` namespace):

```typescript
import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "shopify-store": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "store-domain"?: string;
          "public-access-token"?: string;
          "customer-access-token"?: string;
        },
        HTMLElement
      >;
      "shopify-account": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "sign-in-url"?: string;
        },
        HTMLElement
      >;
    }
  }
}
```

### Step 2: Root loader tokens (`app/.server/root.ts`)

In `loadCriticalData`, add to the return object:

```typescript
publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
```

In `loadDeferredData`, add to the return object:

```typescript
customerAccessToken: customerAccount.getAccessToken(),
```

Note: `getAccessToken()` returns `Promise<string | undefined>`. The `publicAccessToken` is already available as `consent.storefrontAccessToken` — no duplication needed.

### Step 3: CSP update (`app/weaverse/csp.ts`)

Add `scriptSrc` as a new key in the existing `updatedCsp` object literal:

```typescript
scriptSrc: ["https://cdn.shopify.com"],
```

Hydrogen's `createContentSecurityPolicy` merges this with its defaults.

### Step 4: Script in head (`app/root.tsx`)

Add after `<GlobalStyle />` in the `<head>` block of the `Layout` component. Must include `nonce` (already available in Layout via `useNonce()`):

```tsx
<script
  type="module"
  src="https://cdn.shopify.com/storefront/web-components/account.js"
  async
  nonce={nonce}
/>
```

### Step 5: Replace header AccountLink (`app/components/layout/header.tsx`)

Remove the `AccountLink` function. Replace its usage with `ShopifyAccountButton`:

```tsx
function ShopifyAccountButton() {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let publicStoreDomain = rootData?.publicStoreDomain;
  let publicAccessToken = rootData?.consent?.storefrontAccessToken;

  return (
    <Suspense fallback={<UserIcon className="h-5 w-5" />}>
      <Await
        resolve={rootData?.customerAccessToken}
        errorElement={<UserIcon className="h-5 w-5" />}
      >
        {(customerAccessToken) => (
          <shopify-store
            store-domain={publicStoreDomain}
            public-access-token={publicAccessToken}
            {...(customerAccessToken
              ? { "customer-access-token": customerAccessToken }
              : {})}
          >
            <shopify-account sign-in-url="/account/login" />
          </shopify-store>
        )}
      </Await>
    </Suspense>
  );
}
```

Key details:
- Reuses `consent.storefrontAccessToken` — no duplicate field
- Spread guard prevents passing `"undefined"` string when not logged in
- `errorElement` falls back to UserIcon if token promise rejects
- `sign-in-url="/account/login"` aligns with existing `app/routes/account/auth/login.ts`

## Edge Cases

| Case | Handling |
|------|----------|
| Unauthenticated user | `customer-access-token` omitted via spread guard; web component shows sign-in CTA |
| Weaverse design mode | Web component renders but sign-in clicks won't work in iframe; acceptable, matches other interactive Shopify components |
| SSR / Hydration | Custom elements render as empty on server and client alike; no hydration mismatch |
| Script not yet loaded | Custom elements render empty; Suspense fallback shows UserIcon during Await resolution |

## Not In Scope

- Login parameter patching (Hydrogen 2026.1.2 handles natively)
- Theme setting toggle (hard replace)
- New routes or auth flow changes
- New npm dependencies

## Testing

- Deploy to Oxygen staging (does not work on localhost)
- Verify account sign-in button renders in header
- Validate login → callback → redirect flow
- Verify authenticated state persists across navigation
- Verify no regressions to header nav, cart, search
- Test on mobile viewport
- Verify no hydration mismatch warnings in console

## Acceptance Criteria

- Account CTA uses Shopify account web component in header
- No redirect to legacy account pages for sign-in
- Auth flow works end-to-end on Oxygen
- No regressions to header nav/cart/search
