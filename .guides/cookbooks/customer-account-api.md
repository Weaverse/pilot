## Setup for using Customer Account API (`/account`)

1. Run development with `--customer-account-push__unstable` flag to start the server with a tunnel to expose the local server to the public domain.

```bash
shopify hydrogen dev --codegen --port 3456 --customer-account-push__unstable
```

Or quicker way with:

```bash
npm run dev:ca
```

### Include public domain in Customer Account API settings

After run the server with `--customer-account-push__unstable` flag, you will get a public domain like `https://<your-cf-tunnel>.tryhydrogen.dev`. And it should be automatically added to the Customer Account API settings. If not, you can manually add it by following these steps:

1. Go to your Shopify admin => `Hydrogen` or `Headless` app/channel => Customer Account API => Application setup
2. Edit `Callback URI(s)` to include `https://<your-cf-tunnel>.tryhydrogen.dev/account/authorize`
3. Edit `Javascript origin(s)` to include your public domain `https://<your-tunnel>.tryhydrogen.dev` or keep it blank
4. Edit `Logout URI` to include your public domain `https://<your-tunnel>.tryhydrogen.dev` or keep it blank
