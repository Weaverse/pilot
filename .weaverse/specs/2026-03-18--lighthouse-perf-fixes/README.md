# Feature: Lighthouse Performance Fixes

| Field            | Value                                |
| ---------------- | ------------------------------------ |
| **Status**       | `draft`                              |
| **Owner**        | @hta218                              |
| **Created**      | 2026-03-18                           |
| **Last Updated** | 2026-03-18                           |

## Original Prompt

> A Lighthouse audit of weaverse.dev (Pilot template on Shopify Oxygen) identified 7 performance issues. Current score: ~68 Performance. Target score: 80-85+. Scope: 6 code fixes + 1 performance guide, single PR.

## Summary

Fix 6 performance issues identified in a Lighthouse audit of the Pilot template: bot streaming timeout, body opacity:0 blocking FCP, GTM sync init + debug logs, uncached storefront queries, missing Cache-Control headers, and sequential loader waterfall. Also create a performance best practices guide. Issue 6 (shop-js 196KB) is outside template control.
