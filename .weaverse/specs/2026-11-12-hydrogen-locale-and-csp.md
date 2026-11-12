# Hydrogen locale definition and shared CSP helpers

Issue: [#226](https://github.com/Weaverse/pilot/issues/226)

## Outcome

Pilot no longer uses the APIs deprecated in `@shopify/hydrogen` 2026.10.3, and its Content Security Policy is built by Hydrogen's `createContentSecurityPolicy` plus the Weaverse SDK's Studio directives, so a crafted `?weaverseHost=` can no longer widen the policy.

## Scope & contract

- Upgrade `@shopify/hydrogen` to `^2026.10.3` and `@weaverse/hydrogen` to `^6.3.0`.
- Locale: `app/utils/locale.ts` exports a module-scope `defineShopifyI18n` definition built from `SUPPORTED_LOCALES` (pathname routing). Entries carry Shopify's provider language (`ZH_CN`, `ZH_TW`) and pin their existing prefix as `pathSegment`. `I18nConfig` is gone; every `storefront.i18n` read is now `storefront.locale`.
- URLs are unchanged: same prefixes, same unprefixed default market, same cookie/market logic. Pilot keeps resolving the market itself (`resolveRequestLocale`: `.data` suffix, `Referer` / `return_to` for unprefixed handler paths) and passes it as `locale` to `createShopifyRequestContext({ request, i18n, locale })`.
- CSP: `app/utils/csp.ts` and the `NonceProvider`/`useNonce` plumbing are removed. `entry.server.tsx` calls `createContentSecurityPolicy({ nonce: false, shop, directives })`; `app/weaverse/csp.ts` merges the theme's third-party sources with `getWeaverseStudioCspDirectives(request)`.
- Live visitors get no Weaverse, `*.shopify.com` or `*.myshopify.com` sources; merchant uploads on cdn.shopify.com are in Hydrogen's defaults. Studio origins are added only for a trusted `weaverseHost`; design mode also adds `'unsafe-eval'`.
- The policy stays report-only (`Content-Security-Policy-Report-Only: csp.header`); each store decides when to enforce.
- Non-goals: enforcing CSP, hash-based CSP, changing markets or URL shape.

## Acceptance

- Every market resolves to its existing prefix through Hydrogen's definition, and Storefront API queries still receive the provider language.
- A normal visitor's policy names no Weaverse origin, and adding `?weaverseHost=<untrusted>` does not change it.
- Inside Studio, the trusted Studio origin is allowed to frame the page and serve the bridge; design mode allows `'unsafe-eval'`.
- Document responses stay eligible for Oxygen's full-page cache (no nonce, no `no-store` from CSP).

## Approach

- Inline scripts are authorized with `'unsafe-inline'`, not `getShopifyScriptHashes()`: React Router streams per-response inline hydration scripts (`__reactRouterContext`, `ScrollRestoration`) that cannot be hashed, and hashes would make browsers ignore `'unsafe-inline'`.
- Hydrogen sets image, media and frame sources apart from `default-src`, so the theme's third-party list extends `defaultSrc`, `imgSrc`, `mediaSrc` and `frameSrc` to keep what the old `default-src` allowed.

Files: `package.json`, `package-lock.json`, `app/utils/locale.ts`, `app/.server/storefront.ts`, `app/.server/root.ts`, `app/.server/cart.ts`, `app/.server/customer-account.ts`, `app/routes/home.tsx`, `app/routes/blogs/blog.tsx`, `app/routes/cart/lines.tsx`, `app/routes/collections/collection.tsx`, `app/routes/others/discount-code.tsx`, `app/utils/route-templates.ts`, `app/entry.server.tsx`, `app/entry.client.tsx`, `app/root.tsx`, `app/components/layout/header.tsx`, `app/components/root/custom-analytics.tsx`, `app/utils/csp.ts` (removed), `app/weaverse/csp.ts`, `tests/unit/locale.test.ts`, `tests/unit/csp.test.ts`, and test mocks reading `storefront.locale`.

## Verification

- Unit: every market's prefix through `matchLocale` / `resolveSupportedLocale`; visitor vs. injected vs. Studio CSP directives.
- `npm run typecheck`, `npm run check`, `npm test`.
- Manual: browse a prefixed and the default market, switch markets, add to cart and sign in from a prefixed market; open the store in Studio (design and preview) and check the console for CSP report-only violations.
