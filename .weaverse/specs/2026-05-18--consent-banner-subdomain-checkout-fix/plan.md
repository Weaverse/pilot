# Implementation Plan: Consent Banner Fix for Subdomain-Checkout Setups

## Context

Shopify's hosted Customer Privacy banner (`storefront-banner.js`) and the underlying `consent-tracking-api.js` (v0.1 and v0.2) both misuse Hydrogen's dot-prefixed `storefrontRootDomain` (`.mystore.com`, intended only for cookie `Domain=` scoping) directly as a URL hostname when POSTing the consent record to SFAPI. The resulting `https://.mystore.com/api/unstable/graphql.json` is an invalid hostname; DNS fails with `ERR_NAME_NOT_RESOLVED`, the SDK init crashes before installing `setTrackingConsent` / `currentVisitorConsent`, and the `_tracking_consent` cookie is never persisted. Symptom: the banner reappears on every refresh and Google Consent Mode v2 reverts G111 → G100 on the second page view.

Hydrogen exposes no public prop to override this behavior. The relevant comment in `@shopify/hydrogen/dist/development/index.cjs` acknowledges the underlying limitation ("Once consent-tracking-api is updated to not rely on cookies anymore, we can remove this.").

## Approach

### 1. Disable the broken banner script

**File**: `app/.server/root.ts`

Flip `withPrivacyBanner: true` → `false` in the root loader's consent config. Hydrogen then loads only the core `consent-tracking-api.js` (no banner script), so `setTrackingConsent` becomes available. `country` / `language` remain passed for the core SDK. A long inline comment documents the why and the revert path.

### 2. Custom consent banner component

**File**: `app/components/root/consent-banner.tsx` (new)

- Renders on absence of the `_tracking_consent` cookie (the canonical first-visit signal; intentionally does NOT gate on the SDK's `shouldShowBanner()`, which in v0.2 only returns true on a server `display_banner` flag Hydrogen never sets).
- On Accept / Decline, writes `_tracking_consent` directly using a custom serializer reverse-engineered from the SDK source (unquoted object keys, `JSON.stringify` for strings, `toString` for booleans/numbers, omits `undefined` / empty-string fields).
- Sets `Domain=<common-ancestor>` so the checkout subdomain reads the same cookie.
- Dispatches `visitorConsentCollected` on `window` with the `VisitorConsentCollected` shape so Consent Mode v2 / custom analytics keep working.
- SSR-safe: state starts hidden; all `window`/`document`/`crypto` access is inside `useEffect` (server and first client render both yield `null`).

### 3. Mount the component

**File**: `app/root.tsx`

Import and render `<ConsentBanner />` inside the existing `<Analytics.Provider>`.

## Revert path (when Shopify fixes the SDK upstream)

1. Flip `withPrivacyBanner: false` → `true` in `app/.server/root.ts`.
2. Delete `app/components/root/consent-banner.tsx`.
3. Remove the import + mount line in `app/root.tsx`.

## Files touched

- `app/.server/root.ts` — `withPrivacyBanner: false` + documenting comment (~22 LOC)
- `app/components/root/consent-banner.tsx` — new, custom banner UI + cookie writer (~242 LOC)
- `app/root.tsx` — import + mount (+2 LOC)

No new dependencies. Same UX for same-domain (no leading dot) setups — they never hit the bug but render the same banner from this file.

## Known risks / follow-ups

See `work-logs.md` — three open concerns surfaced in the PR #387 review (public-suffix domain heuristic, localization regression, no consent-withdrawal path) are tracked there.
