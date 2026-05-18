# Implementation Plan: Forward Ad-Attribution URL Params to Checkout

## Context

Storefront and checkout live on different origins. Attribution identifiers on the storefront landing URL (`gclid`, `fbclid`, `utm_*`, …) do not propagate to the checkout subdomain, so Shopify's checkout-side tracking (Customer Events, GA4, Meta Pixel) attributes every paid-ad order as organic/direct. Two cart→checkout transition points are affected: the regular cart "Continue to Checkout" link, and the buy-now / cart-permalink loader that `cart.create()` + `redirect()`s straight to checkout.

## Approach

### 1. Pure helper

**File**: `app/utils/checkout-attribution.ts` (new)

- `FORWARDED_ATTRIBUTION_KEYS` — fixed allowlist: `gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`, `msclkid`, and the five `utm_*` params. Scoped to widely-recognised standard params on purpose; affiliate/vendor click IDs typically live in a first-party apex-scoped cookie and don't need this URL round-trip.
- `appendForwardedAttribution(checkoutUrl, searchString)`:
  - **First-write-wins** — never overwrites params already on the checkout URL (`!target.searchParams.has(key)`).
  - Allowlist-only, values set via `searchParams.set` (proper encoding); host/path of `checkoutUrl` never modified (no open-redirect surface).
  - Falls back to the original `checkoutUrl` unchanged on parse failure so a malformed input never breaks the redirect.
  - `URLSearchParams` correctly strips the leading `?` from both `request.url`'s search and `window.location.search`.

### 2. Regular cart link

**File**: `app/components/cart/cart-summary.tsx`

State initialized to the raw `checkoutUrl`; a `useEffect` (dep `[checkoutUrl]`) swaps in the enhanced URL after hydration using `window.location.search`. First render uses the raw URL so SSR + client first paint match (no hydration mismatch). Post-hydration the enhanced `href` also covers middle-click / "open in new tab".

### 3. Buy-now / cart-permalink loader

**File**: `app/routes/cart/lines.tsx`

Pure server-side: read `new URL(request.url).search` and pass through `appendForwardedAttribution` before `redirect(checkoutUrl, { headers })`. No client step, no race window.

## Files touched

- `app/utils/checkout-attribution.ts` — new (~89 LOC incl. JSDoc)
- `app/routes/cart/lines.tsx` — +10 LOC (server-side forwarding before redirect)
- `app/components/cart/cart-summary.tsx` — +20 LOC (post-hydration href swap)

No new dependencies.

## Out of scope / future work

- **Server-side conversion forwarders** (Meta CAPI, GA4 Measurement Protocol, Google Ads Enhanced Conversions) — need a separate cart-attribute-stash pattern to bridge the cookie-less webhook hop. Not in this PR.
- **Affiliate / vendor-specific click IDs** (`tj_clickid`, `awc`, `irclickid`, …) — usually round-tripped via a first-party apex-scoped attribution cookie; a separate concern. Users can extend `FORWARDED_ATTRIBUTION_KEYS` in user-space.

## Known follow-ups (PR #388 review — all minor, none blocking)

- Dead SSR guard in the `cart-summary.tsx` effect (`typeof window === "undefined"` is unreachable inside `useEffect`); can be simplified to the `!checkoutUrl` guard.
- Brief pre-hydration window on the cart link where a very fast click hands off the raw URL without attribution. Known, acceptable trade-off — an `onClick`-time build would close it but regress middle-click / open-in-new-tab, so the `useEffect` approach was kept deliberately. (Server buy-now path has no such window.)
- `appendForwardedAttribution` is pure I/O — a strong unit-test candidate (first-write-wins, leading-`?` handling, parse-failure fallback, empty inputs) if/when test infra exists.
