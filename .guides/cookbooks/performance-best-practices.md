# Performance Best Practices for Hydrogen on Oxygen

## Caching Strategy

Hydrogen 2026.10 has no implicit Storefront API cache: a query without a `cache` option isn't cached at all. Pilot passes a strategy on every query, from `app/utils/cache.ts`:

| Constant | Strategy | Use for |
|----------|----------|---------|
| `CACHE_LONG` | `Cache.long()`: `max-age=3600`, `stale-while-revalidate=82800` | Menus, navigation, shop info, metaobjects |
| `CACHE_DEFAULT` | `max-age=1`, `stale-while-revalidate=86399` (classic Hydrogen's implicit default) | Products, collections, search, recommendations |
| `CACHE_SHORT` | `Cache.short()`: `max-age=1`, `stale-while-revalidate=9` | Data that must refresh within seconds |
| `CACHE_NONE` | `Cache.none()`: `no-store` | Response headers of personalized routes |

```ts
import { CACHE_LONG } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const data = unwrapStorefront(
  await storefront.graphql(QUERY, {
    variables: { ... },
    cache: CACHE_LONG,
  }),
);
```

Never pass a `cache` strategy for personalized data. Customer Account queries (`context.customerAccount.graphql`) and cart operations (Hydrogen's cart handlers at `/api/cart`) are never cached.

`routeHeaders` sets the document's `Cache-Control` from the loader's headers, defaulting to `CACHE_SHORT` (`public, max-age=1, stale-while-revalidate=9`). A route that must not be cached returns `Cache-Control: cacheControlHeader(CACHE_NONE)` (see `routes/account/layout.tsx`); a `no-store` from the root (a degraded theme while Weaverse is unavailable) always wins.

## Anonymous Full-Page Cache

Oxygen can serve whole HTML documents from its full-page cache. A response is cached only when it has `Oxygen-Cache-Control: public` with a non-zero max-age, a `Vary` header, and no `Set-Cookie`. `app/entry.server.tsx` adds the first two through `getFullPageCacheControl()` (`app/utils/full-page-cache.ts`): `public, max-age=300, stale-while-revalidate=86400` for successful `GET` documents, except:

- responses marked `no-store`;
- `/account`, `/api`, `/cart`, `/discount` and the dev tools, with or without a market prefix;
- Weaverse Studio design-mode and revision-preview requests.

`server.ts` commits the session only when it changed, so anonymous pages carry no `Set-Cookie`.

This only stays safe while the document is the same for every shopper. Keep personalized data out of root and route loaders:

- The cart loads in the browser: `CartProvider` renders without `initialData` and fetches `/api/cart` after hydration.
- The header's account component gets the customer's token from `GET /api/account/token` after hydration.
- Never put the cart, a customer access token, `isLoggedIn()` or other per-shopper values in `loadCriticalData`/`loadDeferredData` (`app/.server/root.ts`) or a page loader outside `/account`: deferred values stream into the same cached HTML.

Weaverse content is cached for up to 5 minutes this way, and the full-page cache can't be purged without a redeploy, so a publish takes up to about 10 minutes to show everywhere.

## Streaming & Bot Handling

`app/entry.server.tsx` streams HTML (`renderToReadableStream`) for real users. Bot detection via `isbot()` triggers `body.allReady` to wait for full render — always wrap with a timeout:

```ts
if (isbot(request.headers.get("user-agent"))) {
  await Promise.race([
    body.allReady,
    new Promise(resolve => setTimeout(resolve, 2000)),
  ]);
}
```

Lighthouse uses a bot user-agent. Without the timeout, `allReady` blocks until the entire page renders — killing your TTFB score and making every Lighthouse run measure worst-case performance.

This is the single highest-impact fix for PageSpeed scores. A missing timeout can add 1-2 seconds to every Lighthouse measurement.

## Critical vs Deferred Data

Split your root loader data into two categories:

**Critical** (blocks initial HTML): layout, menus, theme settings, SEO metadata — data visible in the first paint.

**Deferred** (streamed after shell): swatches and other shared data not visible until JavaScript hydrates. Per-shopper data (cart, sign-in state) doesn't belong in either: it loads in the browser after hydration (see Anonymous Full-Page Cache).

Rule of thumb: if it's not visible in the first paint, defer it.

Common mistake: loading swatches/metaobjects in the critical path. A query like `metaobjects(first: 250)` fetches hundreds of records with images — this blocks the entire page even though swatches only appear when a user opens product filters.

```ts
// WRONG: Swatches block critical path
export async function loadCriticalData({ context }: LoaderFunctionArgs) {
  const [layout, swatches, theme] = await Promise.all([
    getLayoutData(context),
    getSwatchesConfigs(context), // Blocks initial render!
    context.weaverse.loadThemeSettings(),
  ]);
  return { layout, swatches, theme };
}

// CORRECT: Swatches deferred — page renders immediately
export async function loadCriticalData({ context }: LoaderFunctionArgs) {
  const [layout, theme] = await Promise.all([
    getLayoutData(context),
    context.weaverse.loadThemeSettings(),
  ]);
  return { layout, theme };
}

export function loadDeferredData({ context }: LoaderFunctionArgs) {
  return {
    swatchesConfigs: getSwatchesConfigs(context), // Streams after shell
  };
}
```

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

When consuming deferred data, guard against `undefined` — the promise may not exist if the data source is disabled:

```tsx
function SwatchFilter({ swatchesPromise }) {
  if (!swatchesPromise) return null;
  return (
    <Suspense fallback={<Skeleton />}>
      <SwatchContent promise={swatchesPromise} />
    </Suspense>
  );
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

Set `script.nonce` when creating scripts dynamically for CSP compliance. Pilot's GTM loader (`app/components/root/custom-analytics.tsx`) goes further: it queues `dataLayer` events immediately but loads `gtm.js` on the first interaction, or after 8 seconds.

Common mistakes with GTM:

- **Inline `<script>` in `<head>`** — even with `window.addEventListener('load', ...)`, the script tag itself is parsed synchronously and blocks the parser. Move to `useEffect` with `requestIdleCallback`.
- **Double initialization** — loading GTM via both an inline script and a `useEffect`. Pick one.
- **Missing `async`** on Shopify app scripts (e.g., GoAffPro, Recharge). Check your Shopify apps — some inject synchronous scripts via `ScriptTag` API. Contact the app developer or add `async` manually.

Remove all `console.log` calls before production — they contribute to main thread blocking.

## Image Optimization

Use Pilot's `Image` (`~/components/image`), a local port of classic Hydrogen's component that builds the Shopify CDN `srcset`. Hydrogen 2026.10 no longer exports `Image`.

### The `sizes` Attribute

**Never use `sizes="auto"` on critical images.** The browser doesn't know the rendered size until after layout, so it guesses wrong and downloads the wrong variant from Shopify CDN.

Common symptoms:
- Hero image preloaded at 1200px, then re-requested at 400px after hydration (double download)
- Logo fetched at 1200px (48KB) when displayed at 120px (should be 6KB)

```tsx
// WRONG: Browser guesses, often picks wrong size
<Image data={heroImage} sizes="auto" />

// CORRECT: Tell the browser exactly what you need
<Image
  data={heroImage}
  sizes="100vw"
/>

// CORRECT: Responsive with breakpoints
<Image
  data={productImage}
  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
/>

// CORRECT: Fixed-size elements like logos
<Image
  data={logo}
  sizes="(min-width: 48em) 120px, 100px"
/>
```

Use `sizes="auto"` only for below-fold images where a wrong initial guess doesn't matter.

### Loading Priority

Use the `getImageLoadingPriority()` utility to set `loading` and `fetchPriority` based on position:

```tsx
// First 4 images: eager (above fold)
// Everything else: lazy (below fold)
const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
): "eager" | "lazy" {
  return index < maxEagerLoadCount ? "eager" : "lazy";
}
```

For background images used across multiple sections, **do not hardcode `loading="eager"`**. Only the first (hero) section should be eager:

```tsx
// WRONG: Every background image competes for bandwidth
<Image data={data} sizes="auto" loading="eager" fetchPriority="high" />

// CORRECT: Only hero is eager, rest are lazy
<Image
  data={data}
  sizes="100vw"
  loading={isFirstSection ? "eager" : "lazy"}
  fetchPriority={isFirstSection ? "high" : "auto"}
/>
```

### Preload the LCP Image

If your hero image is the Largest Contentful Paint element, preload it in the `links` function:

```ts
export const links: LinksFunction = () => [
  {
    rel: "preload",
    as: "image",
    href: heroImageUrl,
    imagesrcset: `${heroImageUrl}&width=750 750w, ${heroImageUrl}&width=1200 1200w`,
    imagesizes: "100vw",
  },
];
```

## Inline CSS vs External Stylesheets

Dynamic theme settings (colors, typography, spacing) must be inline `<style>` tags because they change per-store. But **static CSS should be in external files** — they're cacheable and don't re-parse on every page load.

Split your GlobalStyle:

| CSS Type | Where | Cacheable? |
|----------|-------|------------|
| Theme colors, font sizes, spacing | Inline `<style>` | No (dynamic) |
| Shopify privacy banner overrides | External `.css` file | Yes |
| Heading scale formulas (pure `calc()`) | External `.css` file | Yes |
| Media query breakpoints for nav height | Inline `<style>` | No (dynamic values) |

```tsx
// style.tsx — only dynamic values
export function GlobalStyle() {
  const settings = useThemeSettings();
  if (!settings) return null;

  return (
    <style
      key="global-theme-style"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `:root {
          --color-background: ${settings.colorBackground};
          --color-text: ${settings.colorText};
          --h1-base-size: ${settings.h1BaseSize}px;
          /* ... only values that come from settings ... */
        }`,
      }}
    />
  );
}
```

Static CSS like heading scale formulas (`--h2-base-size: round(calc(var(--h1-base-size) / 1.2), 1px)`) and Shopify banner overrides go in a `.css` file imported via the `links` function.

## Code Splitting with Vite

The Oxygen worker bundle inlines all dynamic imports, so `manualChunks` only works for the client build. Use `isSsrBuild` to apply it conditionally (Pilot: `vite.config.ts`):

```ts
import { defineConfig } from "vite-plus";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    assetsInlineLimit: 0,
    ...(!isSsrBuild && {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("swiper")) return "vendor-media";
            if (id.includes("react-share")) return "vendor-social";
            if (id.includes("@radix-ui")) return "vendor-radix";
          },
        },
      },
    }),
  },
  // ... rest of config
}));
```

Don't force a library that is only `lazy()`-imported into a manual chunk with an eager dependency: co-locating `react-player` (lazy, hero video only) with `swiper` (eager, homepage slideshow) would load its media stack on every page. Let Rollup split it along its dynamic import.

Because the worker inlines dynamic imports, `React.lazy` alone can't keep a browser-only library out of the server bundle. Pilot stubs `react-player` in the SSR build (`ssrStubClientOnlyModules` in `vite.config.ts`, `app/utils/ssr-client-only-stub.ts`), which keeps about 3MB of cold-start parse cost out of the worker.

## Scroll & Animation Performance

### Scroll Listeners

Never set React state directly in a scroll handler — it triggers re-renders at 60fps:

```ts
// WRONG: Re-renders component 60 times per second
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100); // State update on every frame
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// CORRECT: Debounce with requestAnimationFrame + passive listener
useEffect(() => {
  let frameId: number;
  const handleScroll = () => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 100);
    });
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => {
    window.removeEventListener("scroll", handleScroll);
    cancelAnimationFrame(frameId);
  };
}, []);
```

### Marquee / Scrolling Text

Use the minimum number of DOM copies for seamless looping. 3 copies is sufficient — 10 creates unnecessary DOM weight and forces the browser to animate more elements:

```tsx
const MARQUEE_COPIES = 3;
{Array.from({ length: MARQUEE_COPIES }, (_, idx) => (
  <div className="animate-marquee" key={idx} aria-hidden={idx > 0 || undefined}>
    <div dangerouslySetInnerHTML={{ __html: text }} />
  </div>
))}
```

Mark duplicate copies as `aria-hidden` so screen readers don't read the text multiple times.

## Resource Hints

Add `preconnect` for origins you know you'll fetch from. Add `dns-prefetch` as a fallback for older browsers:

```ts
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.shopify.com" },
  { rel: "preconnect", href: "https://shop.app" },
  { rel: "preconnect", href: "https://www.googletagmanager.com", crossOrigin: "anonymous" },
  { rel: "dns-prefetch", href: "https://analytics.google.com" },
  { rel: "dns-prefetch", href: "https://monorail-edge.shopifysvc.com" },
];
```

`preconnect` does DNS + TCP + TLS upfront (~100-300ms saved per origin on mobile). Use it for origins in the critical path. Use `dns-prefetch` for origins loaded later.

Add `crossOrigin: "anonymous"` for third-party origins that serve resources with CORS headers (fonts, scripts from CDNs).

## Storefront Query Caching

Every `storefront.graphql()` call needs a `cache` option:

| Data Type | Cache Strategy | Example |
|-----------|---------------|---------|
| Menus, navigation | `CACHE_LONG` | Layout query, footer menu |
| Metaobjects | `CACHE_LONG` | Swatches, custom content |
| Shop info | `CACHE_LONG` | Shop name, description |
| Product listings | `CACHE_DEFAULT` | Collection pages, search |
| Single product | `CACHE_DEFAULT` | Product detail pages |
| Customer data | none (Customer Account client) | Account, order history |
| Cart operations | none (Hydrogen's cart handlers) | Cart mutations |

## Known Limitations

**shop-js (~196KB):** Loaded by the Shop Pay button (`ShopPayButton` from `@shopify/hydrogen/react`, rendered by `app/components/product/shop-pay-button.tsx`). If Shop Pay is not used, turn off **Show Shop Pay button** in the product page's Buy buttons block.

**CSP Report-Only:** CSP is currently in Report-Only mode in `entry.server.tsx`. Switch to `Content-Security-Policy` when ready for enforcement.

**Weaverse component registry:** All registered components are statically imported. Weaverse needs the `schema` property synchronously to match section types, so full lazy-loading isn't possible at the framework level. Use Vite's `manualChunks` (see Code Splitting section above) to split the heavy dependencies these components pull in.

## Performance Checklist

Run through this before deploying:

- [ ] `entry.server.tsx` has bot timeout (`Promise.race` with 2s limit)
- [ ] No `console.log` in production code
- [ ] GTM/analytics loaded via `requestIdleCallback`, not inline `<script>` in `<head>`
- [ ] No third-party scripts without `async` or `defer`
- [ ] Hero/LCP image has explicit `sizes`, `loading="eager"`, `fetchPriority="high"`
- [ ] Below-fold images have `loading="lazy"` (not `"eager"`)
- [ ] Background images are lazy except the first section
- [ ] Logo has fixed `sizes` value (e.g., `"120px"`), not `"auto"`
- [ ] Swatches/metaobjects are in deferred data, not critical
- [ ] Static CSS (banner overrides, calc formulas) in external `.css` files
- [ ] `vite.config.ts` has `manualChunks` for heavy libraries (client build only)
- [ ] Scroll listeners use `requestAnimationFrame` + `{ passive: true }`
- [ ] `preconnect` hints for CDN, analytics, and third-party origins
- [ ] Storefront queries have explicit `cache` options
- [ ] No cart, customer token or other per-shopper data in root or route loaders (anonymous HTML stays full-page cacheable)
- [ ] Anonymous documents carry `Oxygen-Cache-Control` and `Vary`, and no `Set-Cookie`
