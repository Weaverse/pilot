# Performance Best Practices for Hydrogen on Oxygen

## Caching Strategy

`routeHeaders` defaults to `CacheShort()` (~1s max-age, ~23h stale-while-revalidate) when no explicit cache header is set. This ensures Oxygen's CDN can cache responses even when loaders don't set headers.

Use the appropriate cache strategy per data type:

- `CacheLong()` — menus, navigation, metaobjects, shop info (stable data, ~1h max-age)
- `CacheShort()` — product listings, collection pages (frequently updated)
- `CacheNone()` — authenticated routes like account pages

Always pass `cache` to `storefront.query()`:

```ts
storefront.query(QUERY, {
  variables: { ... },
  cache: storefront.CacheLong(),
})
```

## Streaming & Bot Handling

Hydrogen streams HTML by default for real users. Bot detection via `isbot()` triggers `body.allReady` to wait for full render — always wrap with a timeout:

```ts
if (isbot(request.headers.get("user-agent"))) {
  await Promise.race([
    body.allReady,
    new Promise(resolve => setTimeout(resolve, 2000)),
  ]);
}
```

Lighthouse uses a bot user-agent. Without the timeout, `allReady` blocks until the entire page renders — killing your TTFB score and making every Lighthouse run measure worst-case performance.

## Critical vs Deferred Data

Split your root loader data into two categories:

**Critical** (blocks initial HTML): layout, menus, theme settings, SEO metadata — data visible in the first paint.

**Deferred** (streamed after shell): cart, auth state, swatches, user preferences — data not visible until JavaScript hydrates.

Rule of thumb: if it's not visible in the first paint, defer it.

Deferred data returns a Promise. Consumers must use React 19's `use()` hook with `<Suspense>`:

```tsx
import { Suspense, use } from "react";

function SwatchFilter({ swatchesPromise }) {
  return (
    <Suspense fallback={<Skeleton />}>
      <SwatchContent promise={swatchesPromise} />
    </Suspense>
  );
}

function SwatchContent({ promise }) {
  let data = use(promise);
  return <div>{data.label}</div>;
}
```

## Third-Party Scripts

Never load analytics scripts synchronously. Defer with `requestIdleCallback`:

```ts
useEffect(() => {
  let init = () => {
    let script = document.createElement("script");
    script.async = true;
    script.nonce = nonce;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.appendChild(script);
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 1000);
  }
}, [id, nonce]);
```

Set `script.nonce` when creating scripts dynamically for CSP compliance.

Remove all `console.log` calls before production — they contribute to main thread blocking.

## Storefront Query Caching

Every `storefront.query()` call should include a `cache` option:

| Data Type | Cache Strategy | Example |
|-----------|---------------|---------|
| Menus, navigation | `CacheLong()` | Layout query, footer menu |
| Metaobjects | `CacheLong()` | Swatches, custom content |
| Shop info | `CacheLong()` | Shop name, description |
| Product listings | `CacheShort()` | Collection pages |
| Single product | `CacheShort()` | Product detail pages |
| Customer data | `CacheNone()` | Account, order history |
| Cart operations | `CacheNone()` | Cart mutations |

## Known Limitations

**shop-js (~196KB):** Injected by Hydrogen's `<Analytics.Provider>` for Shop Pay. Cannot be removed from template code. If Shop Pay is not used, consider removing `<Analytics.Provider>` or audit Shop Pay configuration in Shopify admin.

**CSP Report-Only:** CSP is currently in Report-Only mode in `entry.server.tsx`. Switch to `Content-Security-Policy` when ready for enforcement.
