import { useEffect, useState } from "react";

/**
 * Custom Cookie Consent Banner.
 *
 * Pilot ships with Shopify's hosted Customer Privacy banner enabled
 * (`withPrivacyBanner: true` in the root loader's consent config). On
 * Hydrogen storefronts where the checkout lives on a subdomain (the
 * standard setup, e.g. `mystore.com` storefront + `checkout.mystore.com`
 * checkout) Shopify's `storefront-banner.js` AND the underlying
 * `consent-tracking-api.js` v0.2 SDK both have the same URL-construction
 * bug:
 *
 *   Hydrogen passes the SDK a config field `storefrontRootDomain` derived
 *   as `"." + commonAncestorDomain(checkoutDomain, location.host)`. The
 *   leading dot is intentional and only meant for cookie `Domain=` scoping
 *   so the consent cookie is readable across all subdomains.
 *
 *   But the SDK uses the same string directly as a URL hostname when it
 *   POSTs the consent record to SFAPI, producing
 *
 *       https://.mystore.com/api/unstable/graphql.json
 *
 *   The leading dot is invalid in a hostname, DNS fails with
 *   `ERR_NAME_NOT_RESOLVED`. In the banner-script case the SDK init
 *   crashes before installing `setTrackingConsent` /
 *   `currentVisitorConsent` on `window.Shopify.customerPrivacy`; in the
 *   core SDK case the cookie write is chained after the failed fetch's
 *   `.then()`, so the `_tracking_consent` cookie is never persisted.
 *
 *   Symptom for users: the banner reappears on every refresh, and
 *   Google Consent Mode v2 status reverts from G111 (granted) to G100
 *   (denied) on the second page view.
 *
 * Hydrogen has no public prop to override this — the relevant comment in
 * `@shopify/hydrogen/dist/development/index.cjs` acknowledges the
 * underlying issue:
 *
 *   "Once consent-tracking-api is updated to not rely on cookies anymore,
 *    we can remove this."
 *
 * Workaround (this file):
 *
 *   - `withPrivacyBanner: false` in the root loader skips loading the
 *     banner script entirely. Only the core consent-tracking-api.js
 *     loads, so `setTrackingConsent` becomes available.
 *   - Render our own minimal UI here.
 *   - On Accept / Decline write `_tracking_consent` ourselves in the
 *     exact serialized format Shopify expects (the format was
 *     reverse-engineered from the SDK source; the checkout reads the
 *     same cookie and honors it).
 *   - Dispatch `visitorConsentCollected` on `window` so anything else
 *     listening (Google Consent Mode v2 updates, custom analytics
 *     wiring, etc.) sees the new state.
 *
 * When Shopify ships the SDK fix upstream this whole file can be deleted
 * and `withPrivacyBanner` flipped back to `true`.
 */

// ── Shopify _tracking_consent encoding helpers ────────────────────────────
//
// The SDK uses a custom serializer (NOT JSON.stringify): unquoted object
// keys, JSON.stringify for strings, toString for booleans/numbers, omits
// undefined / empty-string values. Reverse-engineered from
// https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.2/consent-tracking-api.js
//
// Final cookie value (post-encodeURIComponent), example for "accept all":
//   {v:"3",con:{CMP:{a:"1",p:"1",m:"1",s:"0"}},cus:{},purposes:{p:false,a:false,m:false,t:false},sale_of_data_region:false,display_banner:false,consent_id:"<uuid>"}
//
// CMP keys (single-char):
//   a = analytics, p = preferences, m = marketing, s = sale_of_data
// CMP values (single-char):
//   "1" = accepted, "0" = declined, "" = no-value (omitted from output)

type ShopifyConsentSerializable =
  | null
  | string
  | number
  | boolean
  | { [k: string]: ShopifyConsentSerializable | undefined }
  | ShopifyConsentSerializable[];

function shopifyConsentSerialize(
  value: ShopifyConsentSerializable,
  withBraces = true,
): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return (
      "[" + value.map((v) => shopifyConsentSerialize(v, true)).join(",") + "]"
    );
  }
  if (typeof value === "object") {
    const parts: string[] = [];
    for (const k of Object.keys(value)) {
      const v = value[k];
      if (v === undefined || v === "") continue;
      parts.push(`${k}:${shopifyConsentSerialize(v, true)}`);
    }
    const body = parts.join(",");
    return withBraces ? `{${body}}` : body;
  }
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

function buildTrackingConsentCookieValue(grant: boolean): string {
  const value = grant ? "1" : "0";
  const payload = {
    v: "3",
    con: { CMP: { a: value, p: value, m: value, s: "0" } },
    region: "",
    cus: {},
    purposes: { p: false, a: false, m: false, t: false },
    sale_of_data_region: false,
    display_banner: false,
    consent_id:
      typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID()
        : // crypto.randomUUID requires a secure context. Fall back if absent.
          `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`,
  };
  return encodeURIComponent(shopifyConsentSerialize(payload));
}

function findCommonAncestorDomain(): string {
  // Derive the cookie Domain= attribute so the cookie is readable on both
  // the storefront and the checkout subdomain. Mirrors Hydrogen's own
  // `parseStoreDomain` logic for the trivial case of
  // storefront=apex + checkout=<sub>.apex.
  //
  //   location.hostname           cookie domain
  //   --------------------------  -----------------
  //   mystore.com                 .mystore.com
  //   www.mystore.com             .mystore.com
  //   checkout.mystore.com        .mystore.com
  //   localhost                   .localhost (no-op)
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3) return "." + parts.slice(1).join(".");
  return "." + host;
}

function writeTrackingConsentCookie(grant: boolean) {
  const value = buildTrackingConsentCookieValue(grant);
  const oneYearSeconds = 60 * 60 * 24 * 365;
  const domain = findCommonAncestorDomain();
  document.cookie = [
    `_tracking_consent=${value}`,
    "Path=/",
    `Domain=${domain}`,
    `Max-Age=${oneYearSeconds}`,
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

function dispatchVisitorConsentCollected(grant: boolean) {
  // Shape matches Hydrogen's `VisitorConsentCollected` type. Anything
  // listening for `visitorConsentCollected` on `window` (e.g. a Google
  // Consent Mode v2 updater) sees the same payload Shopify's SDK would
  // emit.
  const detail = {
    analyticsAllowed: grant,
    marketingAllowed: grant,
    preferencesAllowed: grant,
    firstPartyMarketingAllowed: grant,
    thirdPartyMarketingAllowed: grant,
    saleOfDataAllowed: false,
  };
  window.dispatchEvent(new CustomEvent("visitorConsentCollected", { detail }));
}

function hasTrackingConsentCookie(): boolean {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith("_tracking_consent="));
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState<"" | "accept" | "decline">("");

  useEffect(() => {
    // Render the banner on absence of `_tracking_consent` cookie. We
    // intentionally do NOT gate on the SDK's `shouldShowBanner()` —
    // in v0.2 that method only returns true if a server-side
    // `display_banner` flag was set, which Hydrogen doesn't trigger.
    if (!hasTrackingConsentCookie()) setVisible(true);
  }, []);

  function decide(grant: boolean) {
    setBusy(grant ? "accept" : "decline");
    writeTrackingConsentCookie(grant);
    dispatchVisitorConsentCollected(grant);
    setBusy("");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:pb-6"
    >
      <div className="mx-auto max-w-6xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-md border border-line bg-background px-5 py-4 md:px-6 md:py-5 text-body shadow-lg">
        <p className="text-sm md:text-base leading-relaxed flex-1">
          We use cookies to personalize content, analyze traffic, and improve
          your experience. By clicking "Accept" you consent to our use of
          cookies. See our{" "}
          <a
            href="/policies/privacy-policy"
            className="underline underline-offset-2 hover:opacity-80"
          >
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => decide(false)}
            disabled={busy !== ""}
            className="px-5 py-2 rounded-md text-sm font-medium border border-line hover:bg-line-subtle transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            disabled={busy !== ""}
            className="px-5 py-2 rounded-md text-sm font-medium bg-body text-background hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
