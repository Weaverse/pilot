# Feature: Consent Banner Fix for Subdomain-Checkout Setups

| Field            | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| **Status**       | completed                                                       |
| **Owner**        | @paul-phan                                                      |
| **Issue**        | PR #387                                                         |
| **Branch**       | `fix/consent-banner-dot-host-bug` (merged to `main`)            |
| **Merge Commit** | `b9c48c9c`                                                      |
| **Created**      | 2026-05-18                                                      |
| **Last Updated** | 2026-05-18                                                      |

## Original Prompt

> _Source: PR #387 "Problem" statement by @paul-phan (verbatim, not paraphrased)._

> On any Hydrogen storefront with a **checkout subdomain** (the standard setup — storefront on the apex, checkout on a subdomain like `checkout.mystore.com`), Shopify's hosted privacy banner is broken:
>
> - Banner reappears on every refresh
> - Google Consent Mode v2 status reverts `G111` (granted) → `G100` (denied) on the second page view
> - DevTools shows `POST https://.mystore.com/api/unstable/graphql.json net::ERR_NAME_NOT_RESOLVED`
> - `window.Shopify.customerPrivacy.setTrackingConsent` is `undefined` after the banner script loads
>
> **Root cause:** Hydrogen passes the Shopify Customer Privacy SDK a config field `storefrontRootDomain` derived from `"." + commonAncestorDomain(checkoutDomain, location.host)`. The leading dot is intentional and only meant for cookie `Domain=` scoping. But both `storefront-banner.js` and the underlying `consent-tracking-api.js` use this same string as a URL hostname for an SFAPI POST, producing `https://.mystore.com/...` — an invalid hostname, so DNS fails and the consent cookie is never persisted.

## Summary

Disables Shopify's hosted privacy banner (`withPrivacyBanner: false`) to sidestep an upstream Shopify SDK bug that breaks consent persistence on checkout-subdomain storefronts, and replaces it with a custom `<ConsentBanner />` that writes the `_tracking_consent` cookie directly in Shopify's serialized format and re-emits `visitorConsentCollected`. This is a workaround with a defined revert path for when Shopify fixes the SDK upstream.
