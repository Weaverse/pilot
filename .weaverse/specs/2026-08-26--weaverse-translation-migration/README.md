# Feature: Weaverse Translation Migration

| Field            | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Status**       | in-progress                                                        |
| **Owner**        | @Hieu1866 → @paul-phan                                             |
| **Created**      | 2026-05-09                                                         |
| **Last Updated** | 2026-08-26                                                         |
| **Issue**        | [#473](https://github.com/Weaverse/pilot/issues/473) (also [#392](https://github.com/Weaverse/pilot/issues/392)) |
| **Branch**       | `i18n` → forward fix on `fix/i18n-release-blockers`                 |

## Original Prompt

> Nhánh i18n này triển khai việc translate từ rất lâu, khoảng từ 3 tháng trước rồi nên chắc chắn sẽ có nhiều thứ bị tụt lại phía sau. Trước hết hãy nắm qua docs sau: https://docs.weaverse.io/features/translation-feature-guide rồi nhận xét project chúng ta có đang lạc hậu gì về feat translation đó không? Sau đó lên plan khắc phục, áp dụng translation mới nhất cho pilot.

## Summary

Make Shopify Markets localization and storefront UI translation complete and
maintainable on Pilot, driven by **one canonical market configuration**
(`app/utils/locale.ts`) that feeds request context, Weaverse `themeSchema.i18n`,
country/language selection, link prefixing, cart buyer identity, checkout,
sitemap, and hreflang. Theme-owned strings render through the Weaverse
Translation Manager seam (`i18n.staticContent` + `useTranslation`) that ships
natively in the installed `@weaverse/hydrogen`, with no extra i18n dependency.

## Scope note (2026-08-26)

This spec supersedes `.specs/2026-05-09--weaverse-translation-migration/` from
the `i18n` branch. That folder used a `.specs/` root that does not exist in this
repository; Pilot's specs live in `.weaverse/specs/` (see `.weaverse/README.md`),
so the spec was moved there and re-dated per `AGENTS.md`. `Created` is preserved
because this is the same feature, continued — not a new one.

The 2026-05-09 plan targeted a branch that is now 236 commits behind `main`. Its
findings were re-verified against current `main` and `@weaverse/hydrogen@5.20.2`;
the ones that no longer hold are corrected in `plan.md`, which also carries the
explicit keep / remove / port matrix for every localization mechanism.

## Release-blocking contracts (2026-08-26 review of `30a3664e`)

An independent exact-SHA review BLOCKED `30a3664e` with four P1 findings. Each
is a contract this spec now owns; `plan.md` carries the design and
`work-logs.md` the RED/GREEN/mutation evidence.

### P1-1 — URL identity, document identity, bundle and provider language are four fields

A market has four language-shaped decisions and they are not the same value:

| Decision | Field | `/zh-tw` |
| --- | --- | --- |
| Public URL prefix | `pathPrefix` | `/zh-tw` |
| BCP-47 / `hreflang` / `<html lang>` / `Intl` | `hreflang` | `zh-TW` |
| Theme translation bundle | `bundleLocaleFor()` | `zh-tw` |
| Shopify + Weaverse `LanguageCode` | `providerLanguageFor()` | `ZH_TW` |

Public prefixes and SEO identities stay stable; the provider enum is never used
to build a URL, tag or bundle key, and the prefix is never derived from it.
Chinese markets send `ZH_CN` (Simplified, mainland) or `ZH_TW` (Traditional,
Hong Kong and Taiwan), because a read-only probe showed bare `ZH` resolving to
English in CN, HK and TW.

### P1-2 — bundle fallbacks are theme content, merchant overrides are provenance

`weaverseTheme.staticContent` carries the theme's own copy for the active
market; `weaverseTheme.merchantOverrides` carries only what the merchant
published. The SDK resolves `override ?? staticValue`, and `legacyThemeText`
reads `merchantOverrides` to decide whether a saved pre-migration setting is
still current intent — so putting bundled copy there discards merchant data.

Override intent is own-property presence, not truthiness: an explicitly
published empty string is authoritative. Saved legacy copy outranks the bundled
default; a real published translation outranks saved legacy copy.

### P1-3 — persisted merchandising copy survives upgrade

`saleBadgeText`, `newBadgeText`, `bestSellerBadgeText`, `bundleBadgeText`,
`soldOutBadgeText` and `pcardQuickShopButtonText` are values live storefronts
already hold. They map to their replacement translation keys, and an explicit
merchant value outranks the translation fallback. A persisted value still equal
to the English `defaultValue` the schema shipped is not a merchant choice and
must not suppress the market's translation. No editor setting is left dead.

### P1-4 — cart action redirects are same-origin absolute paths only

`redirectTo` is attacker-controlled form input on a public cart mutation. A
target is accepted only when it begins with exactly one `/` not followed by `/`
or `\`, and carries no control characters. Everything else — network-path
references, absolute URLs, backslash variants, relative and malformed values —
falls back to the shopper's own localized cart. Query and fragment are
preserved on accepted targets, and the cart-id `Set-Cookie` rides along with
the redirect.
