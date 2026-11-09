# Customer Account API (`/account`)

Pilot's account pages (`/account`, orders, addresses, profile) run on Shopify's [Customer Account API](https://shopify.dev/docs/api/customer) through Hydrogen 2026.10's library handlers. This guide covers the setup, how sign-in is wired, and how to query the API from a new route.

## Setup

1. Set these variables in `.env` (and in the Oxygen environment for production):

   ```env
   SESSION_SECRET="any-long-random-string"
   SHOP_ID=your-numeric-shop-id
   PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_xxxxx
   ```

   `SHOP_ID` is the numeric shop ID (not a GID or a domain). Leave `SHOP_ID` or `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` empty to run the storefront without customer accounts.

2. Run the dev server over HTTPS. Customer Account OAuth needs a trusted HTTPS origin, so sign-in fails under `npm run dev` (plain `http://localhost`) by design:

   ```bash
   npm run dev:https
   ```

   Open the HTTPS URL it prints, for example `https://local.tryhydrogen.dev:3456`.

3. Register the URLs in **Hydrogen > Storefront > Customer Account API settings**. The dev server registers them through Shopify CLI when it starts; if that fails it prints the values to set by hand:
   - **Callback URI(s)**: `https://local.tryhydrogen.dev:3456/account/authorize`
   - **JavaScript origin(s)**: `https://local.tryhydrogen.dev` (no port)
   - **Logout URI(s)**: the home page of every market you sign out from (`https://local.tryhydrogen.dev:3456`, `https://local.tryhydrogen.dev:3456/de-de`, ...)

   Production needs the same settings for the storefront's domain.

The full walkthrough, including linking the store with Shopify CLI and troubleshooting, is in [`.weaverse/docs/customer-account-local-dev.md`](../../.weaverse/docs/customer-account-local-dev.md).

## How it works

| Piece | File | What it does |
|-------|------|--------------|
| OAuth handlers | `app/.server/customer-account.ts` (`getCustomerAccountHandlers`), registered in `server.ts` | Hydrogen's `createCustomerAccountServerHandlers` answer the fixed, unprefixed `/account/login`, `/account/authorize`, `/account/refresh` and `/account/logout` before React Router runs. There are no route files for these paths. |
| Token endpoint | same file | `GET /api/account/token` returns the access token to the header's account web component after hydration (`private, no-store`). |
| Session | `app/.server/session.ts` | The customer's tokens live in Pilot's signed `session` cookie (`SESSION_SECRET`); `server.ts` commits it on every response. |
| Loader client | `app/.server/customer-account.ts` (`createCustomerAccount`), exposed as `context.customerAccount` | `graphql()`, `isLoggedIn()`, `handleAuthStatus()`, `getAccessToken()`, `logout()`. |
| URLs | `app/utils/customer-account.ts` | `customerAccountLoginPath(returnTo, locale)` and `customerAccountLogoutPath(locale)`: the market travels in `return_to` and `locale`. |
| Cart | `app/.server/cart.ts` | Signed-in customers' carts carry their `customerAccessToken`, set with the market country on every buyer-identity sync. |

Rules:

- Link to the handler paths with a plain `<a>` or `<form>`, never React Router's `<Link>`/`<Form>`: they answer with a redirect that client-side routing can't follow.
- Write Customer Account documents with `gql` from `@shopify/hydrogen/customer-account` (not the Storefront `gql` from `@shopify/hydrogen`). Infer their types with `InferResult<SourceOf<typeof DOC>>` from the same entry, and import input types from `@shopify/hydrogen/customer-account-api-types`.
- Run them with `context.customerAccount.graphql(doc, { variables })`. It attaches the customer's access token (refreshing it when needed) and, when nobody is signed in, throws a redirect to `/account/login` with a localized `return_to`. `$language` is filled from the request's market.
- `graphql()` returns `{ data, errors }` instead of throwing on GraphQL errors; check `errors`.
- Never pass a `cache` strategy for customer data, and never render customer data into a page that isn't under `/account`: anonymous HTML is full-page cached (see `performance-best-practices.md`).

## Recipe: query the Customer Account API from a new route

This example adds an `/account/store-credit` page that lists the customer's store credit balances.

### Step 1: Add the route

#### File: app/routes/account/store-credit.tsx

```tsx
import { gql } from "@shopify/hydrogen/customer-account";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Money } from "~/components/money";
import { Section } from "~/components/section";

// https://shopify.dev/docs/api/customer/latest/objects/StoreCreditAccount
const STORE_CREDIT_QUERY = gql(`#graphql
  query StoreCredit($language: LanguageCode) @inContext(language: $language) {
    customer {
      storeCreditAccounts(first: 10) {
        nodes {
          id
          balance {
            amount
            currencyCode
          }
        }
      }
    }
  }
`);

export const meta: MetaFunction = () => {
  return [{ title: "Store credit" }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  // Redirects to the localized sign-in when the shopper has no session.
  const { data, errors } =
    await context.customerAccount.graphql(STORE_CREDIT_QUERY);
  if (errors?.length || !data?.customer) {
    throw new Response("Store credit unavailable", { status: 500 });
  }
  return { accounts: data.customer.storeCreditAccounts.nodes };
}

export default function StoreCredit() {
  const { accounts } = useLoaderData<typeof loader>();
  return (
    <Section width="fixed" verticalPadding="medium">
      <h1 className="h4 font-medium">Store credit</h1>
      {accounts.length ? (
        <ul className="mt-6 space-y-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <Money data={account.balance} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6">You have no store credit.</p>
      )}
    </Section>
  );
}
```

### Step 2: Register it under the account layout

The account layout (`routes/account/layout.tsx`) loads the customer and answers `no-store`, so pages under it inherit that cache policy.

#### File: app/routes.ts

```diff
@@ -70,6 +70,7 @@ export default [
         layout("routes/account/layout.tsx", [
           index("routes/account/dashboard/index.tsx"),
           route("profile", "routes/account/profile.tsx"),
+          route("store-credit", "routes/account/store-credit.tsx"),
           route("edit", "routes/account/edit.tsx"),
           route("addr", "routes/account/address/list.tsx"),
           route("address/:id", "routes/account/address/index.tsx"),
```

### Step 3: Verify

```bash
npm run typecheck
```

`typecheck` validates the document against the bundled Customer Account API schema (`hydrogen gql check --fail-on-warn`). Then sign in over `npm run dev:https` and open `/account/store-credit`.
