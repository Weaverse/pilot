# Feature: Shopify Account Web Component

| Field            | Value                                                    |
| ---------------- | -------------------------------------------------------- |
| **Status**       | in-progress                                              |
| **Owner**        | @paul-phan                                               |
| **Created**      | 2026-04-07                                               |
| **Last Updated** | 2026-04-07                                               |

## Original Prompt

> Integrate Shopify's new `<shopify-account>` web component into the Pilot Hydrogen storefront so customers can sign in/manage account without leaving storefront UX.
>
> Reference: https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/hydrogen-with-account-component
>
> — [Weaverse/pilot#342](https://github.com/Weaverse/pilot/issues/342)

## Summary

Replace the existing `AccountLink` icon-button in Pilot's header with Shopify's native `<shopify-account>` web component. This provides inline sign-in and account management without leaving the storefront UX. Hard replace with no theme toggle — Hydrogen 2026.1.2 supports all required APIs (`getAccessToken()`), no login parameter patching needed.
