# Feature: Forward Ad-Attribution URL Params to Checkout

| Field            | Value                                                           |
| ---------------- | --------------------------------------------------------------- |
| **Status**       | completed                                                       |
| **Owner**        | @paul-phan                                                      |
| **Issue**        | PR #388                                                         |
| **Branch**       | `fix/forward-attribution-params-to-checkout` (merged to `main`) |
| **Merge Commit** | `af890cff`                                                      |
| **Created**      | 2026-05-18                                                      |
| **Last Updated** | 2026-05-18                                                      |

## Original Prompt

> _Source: PR #388 "The problem" statement by @paul-phan (verbatim, not paraphrased)._

> Hydrogen storefronts live on one origin (`mystore.com`) and Shopify checkout lives on another (`checkout.mystore.com` or `mystore.myshopify.com`). When a buyer arrives via a paid ad and the landing URL carries identifiers like `?gclid=...`, `?fbclid=...`, or `?utm_source=...`, those identifiers stay on the storefront's URL only — they do **NOT** automatically propagate to the checkout subdomain.
>
> Shopify's built-in tracking running on the checkout origin (Customer Events, GA4, Meta Pixel) then sees the checkout-page URL with no attribution params, and reports every paid-ad order as **organic / direct**. Last-click attribution silently breaks for every paid order — the kind of bug that's invisible in acceptance tests and only surfaces weeks later when ad-platform reports stop matching reality.

## Summary

Adds a pure helper `appendForwardedAttribution(checkoutUrl, searchString)` that copies an allowlist of standard ad/click/UTM params from the storefront URL onto the outbound Shopify checkout URL, wired into both cart→checkout handoffs (the regular cart "Continue to Checkout" link and the buy-now cart-permalink loader). This keeps Shopify's checkout-side tracking and ad-platform reports accurate for paid traffic. URL → URL pass-through only — no new cookie, no new dependency.
