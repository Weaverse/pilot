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

This is the single highest-impact fix for PageSpeed scores. A missing timeout can add 1-2 seconds to every Lighthouse measurement.

## Critical vs Deferred Data

Split your root loader data into two categories:

**Critical** (blocks initial HTML): layout, menus, theme settings, SEO metadata — data visible in the first paint.

**Deferred** (streamed after shell): cart, auth state, swatches, user preferences — data not visible until JavaScript hydrates.

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
    isLoggedIn: context.customerAccount.isLoggedIn(),
    cart: context.cart.get(),
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

Set `script.nonce` when creating scripts dynamically for CSP compliance.

Common mistakes with GTM:

- **Inline `<script>` in `<head>`** — even with `window.addEventListener('load', ...)`, the script tag itself is parsed synchronously and blocks the parser. Move to `useEffect` with `requestIdleCallback`.
- **Double initialization** — loading GTM via both an inline script and a `useEffect`. Pick one.
- **Missing `async`** on Shopify app scripts (e.g., GoAffPro, Recharge). Check your Shopify apps — some inject synchronous scripts via `ScriptTag` API. Contact the app developer or add `async` manually.

Remove all `console.log` calls before production — they contribute to main thread blocking.

## Image Optimization

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

Hydrogen's SSR build uses `inlineDynamicImports`, so `manualChunks` only works for the client build. Use `isSsrBuild` to conditionally apply:

```ts
import { defineConfig, type UserConfig } from "vite";

export default defineConfig(({ isSsrBuild }): UserConfig => {
  const clientChunks = !isSsrBuild
    ? {
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes("framer-motion")) return "vendor-framer";
              if (id.includes("react-player")) return "vendor-media";
              if (id.includes("swiper")) return "vendor-media";
              if (id.includes("@phosphor-icons")) return "vendor-icons";
              if (id.includes("@radix-ui")) return "vendor-radix";
            },
          },
        },
      }
    : {};

  return {
    build: {
      assetsInlineLimit: 0,
      ...clientChunks,
    },
    // ... rest of config
  };
});
```

This splits heavy libraries into separate chunks that only load on pages that use them. Real-world impact from a production store:

| Library | Size | Loaded When |
|---------|------|-------------|
| framer-motion | ~133KB | Pages with animated sections |
| swiper + react-player | ~181KB | Gallery/video sections |
| @phosphor-icons | ~94KB | Sections using icon pickers |
| @radix-ui | ~143KB | Pages with select/dialog/menu |

Without splitting, all 551KB loads on every page — even the homepage that may only need framer-motion.

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
