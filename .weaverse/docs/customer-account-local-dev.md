# Customer Account Local Development

Guide for running Hydrogen locally with Customer Account API support (`--customer-account-push` flag).

## Prerequisites

- Access to a Shopify store with the **Hydrogen sales channel** installed
- Your Shopify account must have **full access to apps** or **access to the Hydrogen channel** on that store

## Steps

### 1. Clean up Shopify CLI project link

Remove the existing `.shopify/project.json` file to ensure a fresh link:

```bash
rm .shopify/project.json
```

> **Why?** If this file points to a store where your account lacks Hydrogen channel access, all `shopify hydrogen` commands will fail with an `ACCESS_DENIED` error — including `shopify hydrogen link` itself, making it impossible to switch stores without deleting this file first.

### 2. Link to the correct store

```bash
shopify hydrogen link
```

Select the store that has the Hydrogen sales channel installed. This regenerates `.shopify/project.json` with the correct store.

### 3. Update `.env`

Make sure these variables in `.env` match the store you just linked:

```env
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_xxxxx
PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_CHECKOUT_DOMAIN="your-store.myshopify.com"
SHOP_ID=your-shop-id
```

You can find these values in the Shopify admin under **Settings > Apps and sales channels > Hydrogen > Storefront**.

### 4. Start the dev server

```bash
nr dev:ca
```

This runs `shopify hydrogen dev --codegen --port 3456 --customer-account-push`, which creates a Cloudflare tunnel for customer account OAuth redirects.

### 5. Update Customer Account API application setup

Once the dev server starts, it will output a tunnel URL (e.g., `https://xxxxx.trycloudflare.com`).

Go to **Shopify Admin > Settings > Customer accounts > Customer Account API**:

1. Open the **Application setup** section
2. Update the following callback URLs to use the generated tunnel URL:
   - **Login URI**: `https://xxxxx.trycloudflare.com/account/login`
   - **JavaScript origin(s)**: `https://xxxxx.trycloudflare.com`
   - **Logout URI**: `https://xxxxx.trycloudflare.com`
   - **Redirect URI(s)**: `https://xxxxx.trycloudflare.com/account/authorize`

> **Note:** The tunnel URL changes every time you restart the dev server, so you'll need to update these URLs each time.

## Troubleshooting

### `ACCESS_DENIED` error on any `shopify hydrogen` command

Your `.shopify/project.json` is pointing to a store where you don't have Hydrogen channel access. Delete it and re-link:

```bash
rm .shopify/project.json
shopify hydrogen link
```

### Port already in use

The dev server defaults to port 3456. If it's taken, it will try the next available port. To free up the port:

```bash
lsof -ti:3456 | xargs kill -9
```

### Customer account login not working

Double-check that the tunnel URL in the Customer Account API application setup matches the one printed in your terminal. They must match exactly.
