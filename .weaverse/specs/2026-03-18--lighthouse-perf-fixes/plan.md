# Plan: Lighthouse Performance Fixes

Audit source: `~/.openclaw/workspace-koda/reports/lighthouse-audit-2026-03-18.md`

## Deliverables Overview

| # | Issue | File(s) | Change |
|---|-------|---------|--------|
| 1 | Bot streaming blocks Lighthouse | `app/entry.server.tsx` | Timeout fallback on `body.allReady` |
| 2 | `opacity: 0` body until JS | `app/root.tsx` | Remove opacity hack |
| 3 | GTM debug logs + sync init | `app/components/root/custom-analytics.tsx` | Remove console.logs, defer GTM init |
| 4 | Storefront queries uncached | `app/.server/root.ts` | Add `CacheLong()` to both queries |
| 5 | No Cache-Control on content routes | `app/utils/cache.ts`, `app/routes/catch-all.tsx` | Default `CacheShort()` in `routeHeaders` |
| 6 | Sequential loader waterfall | `app/.server/root.ts` | Defer swatches from critical path |
| 7 | Performance best practices | `.guides/cookbooks/performance-best-practices.md` | New document |

## Files to Modify

| File | Changes |
|------|---------|
| `app/entry.server.tsx` | 2s timeout race on `body.allReady` for bots |
| `app/root.tsx` | Remove `opacity: 0` inline style, `opacity-100!`, `transition-opacity duration-300` |
| `app/components/root/custom-analytics.tsx` | Remove console.logs, defer GTM via `requestIdleCallback` |
| `app/.server/root.ts` | Add `CacheLong()` to queries, move swatches to `loadDeferredData` |
| `app/utils/cache.ts` | Default `CacheShort()` fallback in `routeHeaders` |
| `app/routes/catch-all.tsx` | Add missing `headers` export |
| `app/sections/collection-filters/filter-item.tsx` | Use `use()` + `<Suspense>` for deferred swatches |

## Files to Create

| File | Purpose |
|------|---------|
| `.guides/cookbooks/performance-best-practices.md` | Performance reference guide |

---

## Fix 1: Bot streaming timeout

**File:** `app/entry.server.tsx` (line 46-48)

**Problem:** Lighthouse uses a bot user-agent. `isbot()` triggers `await body.allReady`, waiting for full render before sending any bytes.

**Fix:** Replace unconditional await with a 2-second timeout race:

```ts
if (isbot(request.headers.get("user-agent"))) {
  await Promise.race([
    body.allReady,
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);
}
```

**Risk:** Low. Crawlers typically complete rendering well under 2s.

---

## Fix 2: Conditional opacity:0

**File:** `app/root.tsx` (line 127-134)

**Problem:** `<body>` has `style={{ opacity: 0 }}` inline, overridden by Tailwind `opacity-100!` after CSS loads. Blank page until JS hydrates, inflating FCP and LCP by 1-2s.

**Fix:** Remove `opacity: 0` from inline style and the now-unnecessary `opacity-100!` and `transition-opacity duration-300` from className.

```tsx
<body
  style={{
    "--initial-topbar-height": `${topbarText ? topbarHeight : 0}px`,
  } as CSSProperties}
  className="bg-background text-body antialiased"
>
```

**Risk:** Low. Minor FOUC possible on slow connections, far less harmful than 1-2s blank screen.

---

## Fix 3: GTM cleanup and deferral

**File:** `app/components/root/custom-analytics.tsx`

**Problem:** 10 `console.log` statements in production. GTM inline `<script>` runs synchronously.

**Fix:** Remove all console.logs. Move GTM init into `useEffect` with `requestIdleCallback`:

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
    script.nonce = nonce;
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

**Risk:** Low. Events queued in `dataLayer` before GTM loads are replayed.

---

## Fix 4: Storefront query caching

**File:** `app/.server/root.ts`

**Problem:** `getLayoutData` and `getSwatchesConfigs` call `storefront.query()` without `cache`. Every request hits Storefront API cold (~200ms).

**Fix:** Add `cache: storefront.CacheLong()` to both queries (1 hour max-age, 1 day SWR).

**Risk:** Low. Menu/swatch changes take up to 1 hour to appear.

---

## Fix 5: Default cache headers

**Files:** `app/utils/cache.ts`, `app/routes/catch-all.tsx`

**Problem:** `routeHeaders()` passes through `Cache-Control` but no loader sets it. CDN can't cache anything.

**Fix:** Fall back to `CacheShort()` when loader provides no cache header:

```ts
import { CacheShort, generateCacheControlHeader } from "@shopify/hydrogen";
const DEFAULT_CACHE = generateCacheControlHeader(CacheShort());

export function routeHeaders({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "Cache-Control": loaderHeaders.get("Cache-Control") || DEFAULT_CACHE,
  };
}
```

Add missing `headers` export to `catch-all.tsx`.

**Risk:** Low. 30s staleness is imperceptible for content pages. Account routes use `CacheNone()` explicitly.

---

## Fix 6: Defer swatches from critical path

**File:** `app/.server/root.ts`, `app/sections/collection-filters/filter-item.tsx`

**Problem:** `loadCriticalData` awaits 3 API calls in `Promise.all` before any child route loader starts (~400-600ms).

**Fix:** Move `getSwatchesConfigs` from `loadCriticalData` to `loadDeferredData`. Update `filter-item.tsx` consumer to use React 19 `use()` + `<Suspense>`.

**Expected savings:** ~100-200ms off critical path TTFB.

**Risk:** Low. Swatches show brief placeholder until data resolves.

---

## Out of Scope

- **Issue 6 (shop-js 196KB):** Injected by Hydrogen's `<Analytics.Provider>`. Cannot be suppressed from template code.
- **Deferring `weaverseTheme`:** Explicitly excluded to avoid layout shift risk.
- **CSP enforcement:** Separate concern.

## Expected Outcomes

| Metric | Current | After fixes |
|--------|---------|-------------|
| TTFB | ~1,000ms | ~400-600ms |
| FCP | ~3.8s | ~1.5-2.0s |
| LCP | ~5.2s | ~2.5-3.0s |
| Performance Score | 68 | 80-85+ |

## Implementation Order

1. Fix 1 (bot timeout) — 5 min, instant Lighthouse win
2. Fix 2 (opacity:0) — 10 min, huge perceived perf win
3. Fix 3 (GTM cleanup) — 20 min, removes main thread work
4. Fix 4 (Storefront query cache) — 10 min, reduces API latency
5. Fix 5 (default cache headers) — 15 min, CDN caching
6. Fix 6 (defer swatches) — 15 min, reduces critical path
7. Guide — 30 min, documentation
