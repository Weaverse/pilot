# Customer Account Local Development

Guide for running Pilot locally with Customer Account API sign-in.

Customer Account OAuth needs a trusted HTTPS origin that matches the URLs registered in Shopify admin. Hydrogen 2026.10 refuses to build a login URL over plain `http://localhost`, so `/account/login` fails under `npm run dev` by design. Use `npm run dev:https` instead: Hydrogen's `localHttps` Vite plugin serves the dev server at `https://local.tryhydrogen.dev` (a Shopify-owned name that resolves to `127.0.0.1`) with a locally trusted certificate.

## How sign-in works

- Hydrogen owns the fixed, unprefixed routes `/account/login`, `/account/authorize`, `/account/refresh` and `/account/logout` (registered in `server.ts`). Link to them with a plain `<a>` or `<form>`, never the router's `<Link>`/`<Form>`: they answer with a redirect that client-side routing cannot follow.
- The market travels in the query string. An account page visited without a session redirects to `/account/login?return_to=/de-de/account&locale=de`, so the shopper signs in on Shopify's German login page and comes back to the German market. Sign-out posts to `/account/logout?return_to=/de-de`.
- The customer's tokens live in Pilot's signed `session` cookie (`SESSION_SECRET`).
- The header's account web component gets the customer access token from `GET /api/account/token` after the page loads, so cached HTML never contains customer data.

## Prerequisites

- Access to a Shopify store with the **Hydrogen** (or Headless) sales channel installed.
- Your Shopify account must have **full access to apps** or **access to the Hydrogen channel** on that store.
- Shopify CLI with `@shopify/cli-hydrogen` 13.0.4 or later, so the dev server can register its URLs for you.

## Steps

### 1. Clean up the Shopify CLI project link

Remove the existing `.shopify/project.json` file to ensure a fresh link:

```bash
rm .shopify/project.json
```

> **Why?** If this file points to a store where your account lacks Hydrogen channel access, all `shopify hydrogen` commands fail with an `ACCESS_DENIED` error, including `shopify hydrogen link` itself, which makes it impossible to switch stores without deleting this file first.

### 2. Link to the correct store

```bash
shopify hydrogen link
```

Select the store that has the Hydrogen sales channel installed. This regenerates `.shopify/project.json` with the correct store.

### 3. Update `.env`

Make sure these variables in `.env` match the store you just linked:

```env
SESSION_SECRET="any-long-random-string"
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_xxxxx
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_CHECKOUT_DOMAIN="your-store.myshopify.com"
SHOP_ID=your-numeric-shop-id
```

You can find these values in the Shopify admin under **Settings > Apps and sales channels > Hydrogen > Storefront**. `SHOP_ID` is the numeric shop ID (not a GID or domain). Leave `SHOP_ID` and `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` empty to run the storefront without customer accounts.

### 4. Start the HTTPS dev server

```bash
npm run dev:https
```

On the first run the plugin downloads mkcert, installs a local certificate authority (this may prompt for your password) and writes certificates under `~/.shopify/hydrogen/certs/`. To do that ahead of time, run `npx hydrogen certs install`.

Open the HTTPS URL the dev server prints, for example `https://local.tryhydrogen.dev:3456`. Sign-in does not work from `http://localhost`.

### 5. Customer Account API application setup

Outside CI, the plugin uses Shopify CLI to add the dev server's URLs to the storefront's Customer Account API settings when it starts. If Shopify CLI is missing, outdated or the push fails, the dev server keeps running and prints the values; set them manually in **Hydrogen > Storefront > Customer Account API settings**:

- **Callback URI(s)**: `https://local.tryhydrogen.dev:3456/account/authorize`
- **JavaScript origin(s)**: `https://local.tryhydrogen.dev` (no port: Shopify rejects origins with a port)
- **Logout URI(s)**: `https://local.tryhydrogen.dev:3456`, plus every market's home page you sign out from (`https://local.tryhydrogen.dev:3456/de-de`, `https://local.tryhydrogen.dev:3456/fr-ca`, ...). Shopify only returns the shopper to a registered logout URI, and Pilot sends them back to the market they signed out from.

Production needs the same three settings for the storefront's domain, including a logout URI per market prefix.

## Troubleshooting

### `Customer Account OAuth origin must use HTTPS`

You opened the site over `http://`. Use `npm run dev:https` and the `https://local.tryhydrogen.dev` URL. Behind a TLS-terminating tunnel, Pilot honors `x-forwarded-proto: https`.

### `ACCESS_DENIED` error on any `shopify hydrogen` command

Your `.shopify/project.json` is pointing to a store where you don't have Hydrogen channel access. Delete it and re-link:

```bash
rm .shopify/project.json
shopify hydrogen link
```

### Port already in use

The dev server uses port 3456 and exits when the port is taken. Free it:

```bash
lsof -ti:3456 | xargs kill
```

### Sign-in lands on `/account?login=failed` or loops back to Shopify

The callback URI, JavaScript origin, or logout URI in the Customer Account API settings does not match the URL you are browsing. They must match exactly, including the port.
