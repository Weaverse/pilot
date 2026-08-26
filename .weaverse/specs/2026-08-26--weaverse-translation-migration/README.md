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

### P1-1 — a market has five language-shaped identities

They are not the same value, and the two providers disagree with each other:

| Decision | Field | `/zh-tw` |
| --- | --- | --- |
| Public URL prefix | `pathPrefix` | `/zh-tw` |
| BCP-47 / `hreflang` / `<html lang>` / `Intl` | `hreflang` | `zh-TW` |
| Theme translation bundle | `bundleLocaleFor()` | `zh-tw` |
| **Shopify** Storefront `LanguageCode` | `providerLanguageFor()` | `ZH_TW` |
| **Weaverse** Translation Manager locale | `weaverseStorefront()` | `zh-tw` |

Shopify and Weaverse are **separate boundaries**. Shopify's `LanguageCode` is a
script-specific enum, and a read-only probe showed bare `ZH` resolving to
English in CN, HK and TW — so markets send `ZH_CN` or `ZH_TW`. Weaverse keys
Translation Manager overrides by the locale a merchant selects in Studio, and
the installed client builds that key as lowercase `${language}-${country}` from
`storefront.i18n`. Giving both boundaries one identity requests `zh_tw-hk`,
which matches no locale; the SDK swallows the miss, so every published Chinese
string silently reverts to the theme default.

`weaverseStorefront()` re-labels `i18n` for the Weaverse client only, using
the canonical market entry rather than the storefront's own `i18n` — that field
has already been replaced with the Shopify enum by `providerContextForRequest()`
and cannot be recovered from there. Hydrogen's `query` binds `@inContext` from
its own closure, so Shopify keeps receiving the enum.

**No caller of the Weaverse client may pass `$country`/`$language` itself.** Hydrogen
fills those variables from the closure only when the caller leaves them absent,
so an explicit `variables: { language: weaverse.storefront.i18n.language }`
wins — and that value is the market's public code, which is the whole point of
the re-labelling. `ZH` is a valid enum member that resolves to English, so the
result is an English catalogue under a Chinese URL with no error anywhere.
Every Weaverse-scoped loader therefore omits both variables and lets Hydrogen
supply them.

The rule is about the *client*, not the expression. `context.storefront` and
`context.weaverse.storefront` differ only in `i18n`, and a route destructuring
`const { storefront } = context.weaverse` reads the public identity while
looking identical to one that reads the enum. Two route loaders were missed by
a sweep that grepped the spelling rather than the source:
`pages/regular-page.tsx` and `blogs/article.tsx`. On `/zh-cn` the article title
came back in English from Shopify while the page around it was Chinese.

Formatting is the one legitimate reader of the public identity: `article`
derives its `Intl` tag from `resolveLocaleFromRequest`, never from a client, so
neither shape of `i18n` can affect a date.

**A Shopify query must declare `$country`/`$language` to receive them.** The
installed client fills them from its closure only for documents that ask —
literally `/\$language/.test(query)` — so a document omitting the declarations
is not one variable short: it reaches Shopify with no market and is answered in
the shop's default language. That is invisible to TypeScript, to the schema,
and to any test that only inspects variables, which is why
`tests/unit/provider-locale-leak.test.ts` asserts the document *and* the values
it was called with.

**Internal API requests carry the market in their own URL.** A component that
fetches an absolute `/api/...` sends no market: the API route builds a default
context and Shopify answers with the default market's copy, pricing and
availability, inside a page that is otherwise localized. `Referer` is not a
fallback — absent under several referrer policies, never authoritative for
routing — so the path itself has to be localized with
`usePrefixPathWithLocale`, which most callers already did.

### 6. A test can execute the right component and still miss the defect

Three separate reviews found the same shape of gap, and each time the test
looked reasonable:

- constructing `QuickShopTrigger` directly proves it resolves its own copy, and
  says nothing about the props its caller passes;
- exercising one `selectionMethod` proves nothing about the other two branches
  of the same loader;
- calling a shared helper with `context.storefront` proves nothing about the
  caller that hands it `weaverse.storefront`.

The rule that follows: **exercise the production path with the production
inputs**. Every mode the code branches on, every client a caller actually
passes, and — where the observable is a request rather than markup — the real
request, from a real mount. Observing the URL as it is *built* is not enough:
a component can build a localized path and fetch a different literal, which is
exactly what the mutation matrix caught.

Public prefixes and SEO identities stay stable; the provider enum is never used
to build a URL, tag, bundle key or translation locale, and the prefix is never
derived from it.

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

### P1-4 — every public redirect target is a same-origin absolute path

Three routes build a `Location` out of request input: the cart action
(`redirectTo` form field), the discount route (`?redirect` / `?return_to`), and
the legacy article redirect (the `:locale?` URL segment). All three now resolve
through one rule instead of three.

A target is accepted only when it begins with exactly one `/` not followed by
`/` or `\`, and carries no control characters. Everything else — network-path
references, absolute URLs, backslash variants, `javascript:`, relative and
malformed values — falls back to the shopper's own localized path. Query and
fragment are preserved on accepted targets, and the cart-id `Set-Cookie` rides
along with the redirect.

Two properties are load-bearing and easy to lose:

- **A single leading `/` is what pins the authority.** `..` segments can only
  remove path segments, never introduce an authority, so an accepted
  `/..//evil.example` still resolves to this origin. Re-serialising a target
  through `new URL().pathname` *collapses* those segments and yields
  `//evil.example` — the check turns into the attack. The discount route
  therefore splits the fragment by hand rather than re-parsing.
- **A refusal must stay on the shopper's market.** Falling back to `/` would
  quietly move a `/de-de` shopper to the default market, so each caller passes
  its own localized fallback.

The article redirect takes the same rule from the other side: the locale
segment is never interpolated. It is resolved against the canonical market
table, which answers with a real market or the default one.

*Verified by* `tests/unit/production-boundaries.test.ts` — the exploit matrix
runs through the real route loaders and asserts the **resolved origin**, not
the header string.

### P1-5 — a cart carries the market it was created on

Shopify does not persist the mutation's `@inContext(country:)` into the cart.
Only `buyerIdentity.countryCode` survives to checkout, so a cart created on
`/de-de` without one prices, taxes and ships as the default market — while the
catalogue around it stays correctly German. The failure is invisible in the
storefront and only appears on the order.

The default is set once, on `createHydrogenContext`, from the market already
resolved for the request. Hydrogen merges it *under* every cart create, so it
also covers the implicit ones — `updateDiscountCodes` on a session with no cart
creates a cart — which a per-route guard would miss. A caller that names its
own country still wins: the cart action resolves the market from the URL or the
`Referer`, and that resolution must survive.

Two identities remain separate here as everywhere else: `countryCode` is the
Shopify market, unrelated to the public/provider language split.

*Verified by* `tests/unit/cart-market.test.ts` — the real installed Hydrogen
cart handler, reached through the real `createHydrogenRouterContext`, with the
outbound `cartCreate` variables read off the wire.

## Public docs + reusable skill deltas

Behaviour verified by code and tests in this branch. Each item names the test
that proves it. These are corrections to guidance that is currently wrong or
absent — no roadmap items, no untested claims.

### 1. Shopify and Weaverse need different language identities

Docs that describe one "locale" flowing from the request into both clients are
wrong for any market whose Shopify `LanguageCode` is script-specific.

- Shopify's `@inContext` takes the enum (`ZH_CN`, `ZH_TW`).
- Weaverse's Translation Manager takes the public BCP-47 locale (`zh-cn`,
  `zh-hk`, `zh-tw`), because the installed client builds its lookup as
  lowercase `${language}-${country}` from `storefront.i18n`.

Sending the enum to Weaverse requests a locale that does not exist. The SDK
treats a missing override as "no overrides", so the failure is silent and looks
like an unpublished translation.

Pattern: keep the canonical market entry, and hand Weaverse a copy of the
storefront whose `i18n` is that entry —
`weaverseStorefront(hydrogenContext.storefront, locale)`. Hydrogen binds
`@inContext` from the storefront client's own closure, so replacing the `i18n`
property does not change what Shopify receives.

*Verified by* `tests/unit/weaverse-locale.test.ts`. Be precise about what that
covers: the **Weaverse** locale is asserted for all 33 markets, one request
each; the **Shopify** enum is asserted for the four markets where the two
identities can disagree (`zh-cn`, `zh-hk`, `zh-tw`, and `de-de` as a control).
The remaining 29 markets set no `providerLanguage`, so their enum is their
BCP-47 code by construction and there is nothing per-market to observe.

### 2. Studio preview requires reading the design-override store

A theme that falls back to its own persisted settings must consult
`translationStore` before doing so, or live Studio edits are invisible until
published. The SDK resolves `designOverrides ?? merchantOverrides ??
staticContent` inside `t()`, so any code path that returns before calling
`t()` opts out of the preview workflow.

- Own-property presence, not truthiness: a live edit cleared to `""` is an
  edit, and must preview as cleared.
- The snapshot is a plain object, so `key in snapshot` is true for
  `constructor` and `toString`; use `Object.hasOwn`.

*Verified by* `tests/unit/live-translation-preview.test.ts` and
`tests/unit/legacy-theme-text.test.ts`.

### 3. One reader per migrated key

When a theme setting is replaced by a translation key, exactly one code path
may resolve it. A component that also accepts the old value as a prop
reintroduces a precedence layer that cannot see published or live edits, and
the two paths disagree only for merchants who customised the string.

Pattern: delete the prop and let the component call the shared reader. The
reader already reads the same theme settings the caller would have forwarded.

*Verified by* `tests/unit/merchant-copy.test.ts`.

### 4. Upgrade-safe migration needs the shipped default recorded

Persisted settings cannot distinguish "merchant chose this" from "this is what
the theme shipped", because every setting had a `defaultValue`. Preserving
persisted values verbatim pins English into every localized market.

Pattern: record the English `defaultValue` each setting shipped with; a value
still equal to it falls through to translation, anything else is the merchant's.

Known limit: a merchant who deliberately chose the exact shipped default is
indistinguishable from one who never opened the field.

*Verified by* `tests/unit/merchant-copy.test.ts`.

### 5. Helper tests do not protect boundaries

A test that re-implements a rule passes when the shipping code stops calling
it. Boundaries whose regression is a released defect — request context,
route actions, root loaders, rendered components — need tests that execute
them.

Two constraints make this practical in this repo:

- Playwright owns the JSX runtime for files under `testDir` and rewrites app
  `.tsx` into fixture objects React refuses to render. Compiling the module
  with esbuild (installed via `@shopify/cli`) yields real
  `react/jsx-runtime` calls — see `tests/support/render-app.ts`.
- `createHydrogenRouterContext` opens a `caches` entry and reads every `Env`
  field, so tests need the worker global and a fully typed env — see
  `tests/support/hydrogen-env.ts`.

A test can execute the right component and still miss the defect, because the
*caller* decides which props exist. `QuickShopTrigger` tests that construct the
trigger themselves prove it is correct when called that way, and say nothing
about how `ProductCard` calls it — which is exactly where the bypass lived. The
boundary to render is the one a storefront renders.

*Verified by* `tests/unit/production-boundaries.test.ts` and
`tests/unit/product-card-quick-shop.test.ts`, plus a mutation matrix in which
each production path — including the exact prior three-file ProductCard →
QuickShop prop bypass — fails at least one test.
