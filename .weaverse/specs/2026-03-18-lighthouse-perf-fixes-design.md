# Lighthouse Performance Fixes — Pilot Template

**Date:** 2026-03-18
**Audit source:** `~/.openclaw/workspace-koda/reports/lighthouse-audit-2026-03-18.md`
**Current score:** ~68 Performance
**Target score:** 80-85+
**Scope:** 6 code fixes + 1 performance guide, single PR

---

## Context

A Lighthouse audit of weaverse.dev (Pilot template on Shopify Oxygen) identified 7 performance issues. This spec covers fixes for 6 of them plus a best practices guide. Issue 6 (shop-js 196KB) is outside template control and documented in the guide only.

## Deliverables

| # | Issue | File(s) | Change |
|---|-------|---------|--------|
| 3 | Bot streaming blocks Lighthouse | `app/entry.server.tsx` | Timeout fallback on `body.allReady` |
| 4 | `opacity: 0` body until JS | `app/root.tsx` | Conditional on Weaverse design mode |
| 5 | GTM debug logs + sync init | `app/components/root/custom-analytics.tsx` | Remove console.logs, defer GTM init |
| 7 | Storefront queries uncached | `app/.server/root.ts` | Add `CacheLong()` to both queries |
| 2 | No Cache-Control on content routes | `app/utils/cache.ts`, `app/routes/catch-all.tsx` | Default `CacheShort()` in `routeHeaders` |
| 1 | Sequential loader waterfall | `app/.server/root.ts` | Defer swatches from critical path |
| Guide | Performance best practices | `.guides/cookbooks/performance-best-practices.md` | New document |

---

## Fix 1: Bot streaming timeout (Issue 3)

**File:** `app/entry.server.tsx` (line 46-48)

**Problem:** Lighthouse uses a bot user-agent. `isbot()` detection triggers `await body.allReady`, which waits for the full render before sending any bytes. Every Lighthouse run measures worst-case TTFB.

**Fix:** Replace unconditional await with a 2-second timeout race. Bots still receive most rendered content, but the response starts streaming after 2s regardless.

```ts
if (isbot(request.headers.get("user-agent"))) {
  await Promise.race([
    body.allReady,
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);
}
```

**Risk:** Low. Bots that need fully-rendered HTML (search crawlers) typically complete rendering well under 2s. The timeout is a safety net, not the common path.

---

## Fix 2: Conditional opacity:0 (Issue 4)

**File:** `app/root.tsx` (line 127-134)

**Problem:** The `<body>` has `style={{ opacity: 0 }}` inline, overridden by Tailwind `opacity-100!` class after CSS loads. This causes a blank page until JS hydrates, inflating FCP and LCP by 1-2s.

**Why it exists:** A FOUC workaround — the inline `opacity: 0` is overridden by Tailwind's `opacity-100!` once CSS loads, creating a fade-in. No longer needed.

**Fix:** Remove `opacity: 0` from the inline style and remove the now-unnecessary `opacity-100!` and `transition-opacity duration-300` from the className.

```tsx
<body
  style={{
    "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
  } as CSSProperties}
  className="bg-background text-body antialiased"
>
```

**Risk:** Low. May introduce a brief FOUC on slow connections, but the trade-off is worth it — users see content immediately instead of a blank white page. A minor FOUC is far less harmful than a 1-2s blank screen.

---

## Fix 3: GTM cleanup and deferral (Issue 5)

**File:** `app/components/root/custom-analytics.tsx`

**Problem:**
1. 10 `console.log` statements fire on every analytics event in production
2. GTM inline `<script>` runs synchronously during initial render
3. `biome-ignore-all` comment suppresses lint warnings for the console usage

**Fix:**
1. Remove all `console.log` statements and the `biome-ignore-all` comment
2. Move GTM initialization into a `useEffect` with `requestIdleCallback` so it loads after the browser is idle

```tsx
useEffect(() => {
  if (!id) return;
  const init = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    gtag("js", new Date());
    gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    gtag("config", id);

    const script = document.createElement("script");
    script.async = true;
    script.nonce = nonce; // preserve CSP nonce for future CSP enforcement
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.appendChild(script);
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 1000);
  }
}, [id]);
```

The inline `<script>` and `<Script>` tags in JSX are replaced by this programmatic approach.

**Risk:** Low. Analytics events fire slightly later (after idle), but GTM is not user-facing functionality. No data loss — events queued in `dataLayer` before GTM loads are replayed.

---

## Fix 4: Storefront query caching (Issue 7)

**File:** `app/.server/root.ts`

**Problem:** `getLayoutData` and `getSwatchesConfigs` call `storefront.query()` without a `cache` option. Every request hits the Shopify Storefront API cold, adding ~200ms TTFB.

**Fix:** Add `cache: storefront.CacheLong()` to both queries. Menus and swatches change infrequently — `CacheLong` (1 hour max-age, 1 day SWR) is appropriate.

```ts
// getLayoutData
storefront.query<LayoutQuery>(LAYOUT_QUERY, {
  variables: { headerMenuHandle: "main-menu", footerMenuHandle: "footer", language: storefront.i18n.language },
  cache: storefront.CacheLong(),
})

// getSwatchesConfigs
context.storefront.query<SwatchesQuery>(SWATCHES_QUERY, {
  variables: { type },
  cache: context.storefront.CacheLong(),
})
```

**Risk:** Low. Menu or swatch changes take up to 1 hour to appear. Acceptable for most stores. Merchants who need faster updates can switch to `CacheShort()`.

---

## Fix 5: Default cache headers (Issue 2)

**Files:** `app/utils/cache.ts`, `app/routes/catch-all.tsx`

**Problem:** `routeHeaders()` passes through `Cache-Control` from loader headers — but no loader sets cache headers. The CDN (Oxygen) cannot cache any content route. Every visit hits the worker cold.

**Fix:** Extend `routeHeaders` to fall back to `CacheShort()` when the loader provides no cache header:

```ts
import { CacheShort, generateCacheControlHeader } from "@shopify/hydrogen";

const DEFAULT_CACHE = generateCacheControlHeader(CacheShort());

export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") || DEFAULT_CACHE,
  };
}
```

All routes that already export `routeHeaders` automatically get `CacheShort()` (30s max-age, 1 day stale-while-revalidate).

Additionally, add the missing `headers` export to `catch-all.tsx`:

```ts
import { routeHeaders } from "~/utils/cache";
export const headers = routeHeaders;
```

**Routes already using `routeHeaders`:** home, product, collection, collections/list, products/list, blog, article, regular-page, policy, policies/list, account/layout.

**Routes with explicit cache (no change needed):** robots, sitemap, countries.

**Risk:** Low. `CacheShort` is conservative — 30s staleness is imperceptible for content pages. Account routes already use `CacheNone()` explicitly, which overrides the default.

---

## Fix 6: Defer swatches from critical path (Issue 1)

**File:** `app/.server/root.ts`

**Problem:** `loadCriticalData` awaits three API calls in `Promise.all` before any child route loader can start. Total root loader time: ~400-600ms.

**Fix:** Move `getSwatchesConfigs` from `loadCriticalData` to `loadDeferredData`. Swatches are only used on product pages for color/image option rendering — they are never needed for the initial HTML shell on any page.

```ts
// loadCriticalData — swatches removed
export async function loadCriticalData({ request, context }: LoaderFunctionArgs) {
  const [layout, weaverseTheme] = await Promise.all([
    getLayoutData(context),
    context.weaverse.loadThemeSettings(),
  ]);
  // ... rest unchanged
  return { layout, seo, shop, consent, selectedLocale, weaverseTheme, googleGtmID };
}

// loadDeferredData — swatches added
export function loadDeferredData({ context }: LoaderFunctionArgs) {
  const { cart, customerAccount } = context;
  return {
    isLoggedIn: customerAccount.isLoggedIn(),
    cart: cart.get(),
    swatchesConfigs: getSwatchesConfigs(context),
  };
}
```

**Note:** `weaverseTheme` (loadThemeSettings) stays in critical path per explicit decision — it controls visible layout properties (topbar height, colors).

**Expected savings:** ~100-200ms off critical path TTFB (one fewer API call blocking before child route loaders can start).

**Risk:** Low. Swatches resolve after hydration. Product pages with color swatches may show a brief placeholder state before swatch data arrives. This is standard deferred-data behavior in React Router.

---

## Deliverable 7: Performance best practices guide

**File:** `.guides/cookbooks/performance-best-practices.md`

A practical reference for developers building on Pilot, covering:

1. **Caching strategy** — `CacheShort` default, `CacheLong` for stable data, `CacheNone` for authenticated routes, how `routeHeaders` works
2. **Streaming** — bot timeout pattern, why not to `await body.allReady` unconditionally
3. **Critical vs deferred data** — decision criteria, examples
4. **Third-party scripts** — `requestIdleCallback` pattern for GTM, removing debug logs
5. **Storefront query caching** — always pass `cache` option
6. **Known limitations** — `shop-js` 196KB from `<Analytics.Provider>` (cannot suppress from template code, recommend auditing Shop Pay usage in Shopify admin)

---

## Out of scope

- **Issue 6 (shop-js 196KB):** Injected by Hydrogen's `<Analytics.Provider>`. Cannot be suppressed from template code. Documented in the guide as a known limitation.
- **Full loader waterfall elimination (Issue 1 full fix):** Would require deferring `weaverseTheme` (loadThemeSettings), which was explicitly excluded to avoid layout shift risk.
- **CSP enforcement:** `entry.server.tsx` has a TODO to switch from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`. Separate concern.

---

## Expected outcomes

| Metric | Current | After fixes |
|--------|---------|-------------|
| TTFB | ~1,000ms | ~400-600ms |
| FCP | ~3.8s | ~1.5-2.0s |
| LCP | ~5.2s | ~2.5-3.0s |
| Performance Score | 68 | 80-85+ |

Conservative estimates — not deferring theme settings limits TTFB improvement vs the audit's 88+ target.

---

## Implementation order

1. Fix 1 (bot timeout) — 5 min, instant Lighthouse win
2. Fix 2 (opacity:0) — 10 min, huge perceived perf win
3. Fix 3 (GTM cleanup) — 20 min, removes main thread work
4. Fix 4 (Storefront query cache) — 10 min, reduces API latency
5. Fix 5 (default cache headers) — 15 min, CDN caching
6. Fix 6 (defer swatches) — 15 min, reduces critical path
7. Guide — 30 min, documentation
