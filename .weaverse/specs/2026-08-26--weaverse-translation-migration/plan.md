# Implementation Plan: Weaverse Translation Migration

## Context & Findings (re-verified 2026-08-26 against `main` @ `2f8a10fd`)

The 2026-05-09 findings were written against a branch that is now **236 commits
behind** `main` and against `@weaverse/hydrogen@^5.13.0`. Installed today:
`@weaverse/hydrogen@5.20.2` / `@weaverse/schema@0.14.0`. What changed:

| 2026-05-09 finding | Status today | Evidence |
|---|---|---|
| Use `@weaverse/i18n` (`WeaverseI18nServer` + `WeaverseI18nProvider`) — "should NOT be removed" | **Obsolete.** The SDK ships `TranslationProvider`/`useTranslation` natively; `withWeaverse` mounts it and feeds it `staticContent` + `merchantOverrides` off the root loader. A second i18next runtime is redundant. | `dist/index.mjs:1266-1295` (`withWeaverse` → `TranslationProvider`), `:1876-1911` (`fetchMerchantOverrides`) |
| Migrate `useTranslation` (react-i18next) → `useThemeText` | **Inverted.** `useThemeText` is now the *deprecated alias*; `useTranslation` is the current SDK export. | `dist/types/hooks/translation-context.d.ts` — "`@deprecated Use useTranslation`" |
| `translation: true` + `staticContent` missing from schema | **Still true** on `main`. | `app/weaverse/schema.server.ts` |
| All locales incorrectly `language: "EN"` | **Already fixed** on `main` — 27 entries carry real language codes. | `app/utils/const.ts` |
| `i18next-http-backend` unused | **Moot** — no i18n dependency exists on `main`. | `package.json` |

Additional findings on current `main` (the substance of #473):

1. **No single source of truth.** `COUNTRIES` is keyed by path prefix, and every
   consumer re-derives locale differently: `getLocaleFromRequest`
   (`app/.server/context.ts`), `getLocalePrefixFromPath` (`app/utils/const.ts`),
   `SITEMAP_LOCALES` (`app/routes/seo/sitemap-page.ts`), `shopLocales`
   (`app/weaverse/schema.server.ts`), and `getRedirectUrl`
   (`use-country-selector.ts`) which rebuilds the prefix from
   `` `${language}-${country}` `` instead of using the configured key.
2. **`pathPrefix` is duplicated.** It is both the `COUNTRIES` map key and a
   field spread onto the locale — two representations that can disagree.
3. **`/api/countries` is a redundant network hop.** It serves a build-time
   constant to the client via `CacheLong`; the same data can come from the root
   loader that every page already awaits.
4. **Locale switch is not path-preserving.** `pathWithoutLocale` uses
   `pathname.replace(prefix, "")` — an unanchored substring replace that
   corrupts any path containing the prefix elsewhere (`/en-vn` on
   `/collections/en-vn-specials`), and the default locale has `pathPrefix: ""`,
   which `String.replace` matches at index 0 as a no-op only by luck.
5. **No hreflang/canonical on HTML pages.** Only the article sitemap emits
   `hreflang`. `seoPayload.root` sets `url` from `request.url`, so a localized
   URL self-canonicalizes, but no `alternates` are emitted anywhere.
6. **Malformed locale input is not rejected.** `/EN-CA/products/x` lowercases
   into a valid prefix, but `/en-xx/...` falls through to the default locale and
   renders 200 at a non-canonical URL (soft-404 / duplicate content).
7. **`zh` markets query Shopify with an invalid language.** `LanguageCode` has
   no plain `ZH` for the layout query context (`ZH_CN`/`ZH_TW` are the real
   codes) — the `i18n` branch hard-patched this inline in `getLayoutData`.

## Root design decision

Introduce **`app/utils/locale.ts`** as the one canonical market table. Each
entry is a full record — `pathPrefix`, `language`, `country`, `currency`,
`label`, `hreflang`, `direction` — and every surface derives from it:

```
app/utils/locale.ts  (SUPPORTED_LOCALES, DEFAULT_LOCALE, resolveLocale, localizePath, delocalizePath)
   ├── app/.server/context.ts      → storefront i18n context (request → locale)
   ├── app/weaverse/schema.server.ts → themeSchema.i18n {defaultLocale, shopLocales, staticContent, translation}
   ├── app/root.tsx                → html lang/dir, selectedLocale, alternates
   ├── app/components/link.tsx + use-prefix-path-with-locale → localized links
   ├── country selector            → grouped markets + path-preserving switch
   ├── cart / checkout             → buyer identity country
   └── sitemap-page.ts             → hreflang alternates
```

Adding a market = one entry in `SUPPORTED_LOCALES`. Nothing else.

## Keep / remove / port matrix

### Port from `origin/i18n`

| Item | Decision | Why |
|---|---|---|
| `app/i18n/*.json` bundled locale JSON | **Port, re-cut** | Real translation content. Keep `en` as source; ship `hi`, `ar`, `es`, `fr`, `de` per the expanded ask. `ja`/`vi`/`zh` are dropped — they have no configured market in the new table and would be dead payload. |
| `useThemeText()` call-site migration (14 files) | **Port, renamed** | Same seam, current name: `useTranslation()`. |
| `schema.i18n.translation: true` + `staticContent` | **Port** | Required for Translation Manager to see the theme. |
| Removal of hardcoded strings from theme settings (`topbarText`, `footer.*`) | **Port** | These became translation keys; leaving both is the "two systems in parallel" the issue forbids. |
| Stale-content-on-switch fix (`d13cff88`) | **Port the intent, not the code** | The branch's fix builds a detached `<form>` and calls `form.submit()` against a hardcoded `/cart`. Replaced with a `<Form method="POST" action={cartRoute} reloadDocument>` — same document-navigation guarantee, locale-correct action, no DOM construction, works without JS. |

### Do not port

| Item | Why |
|---|---|
| `@weaverse/i18n` + `react-i18next` + `app/lib/i18n.server.ts` | Installed SDK covers it natively; brief forbids adding a dependency the SDK already replaces. Pilot has no pluralization requirement today. |
| `wrangler.json`, `.dev.vars` in `.gitignore` | Cloudflare deployment change; Pilot targets Oxygen. |
| `vite.config.ts` / build-script / `react-router.config.ts` `v8_viteEnvironmentApi` churn | Unrelated to localization. |
| `app/components/layout/language-switcher.tsx` | A second localization UI beside the country selector, which already switches language per market. |
| `env.d.ts` `WEAVERSE_PROJECT_ID` (as branch shape) | Kept, but declared optional to match how the SDK actually reads it. |
| `getLayoutData` inline `ZH → ZH_CN` patch | Symptom fix. The canonical table stores the correct Shopify `LanguageCode` per market instead. |
| Formatting/`any` regressions on the branch | Fails the repo's own gates. |

### Remove from `main` (legacy duplication, #473)

| Item | Replacement |
|---|---|
| `COUNTRIES` map keyed by prefix + spread `pathPrefix` | `SUPPORTED_LOCALES` records with an explicit `pathPrefix` field |
| `getLocalePrefixFromPath` | `resolveLocale(pathname).pathPrefix` |
| `app/routes/api/countries.ts` + its route + the `useInView`/`useFetcher` lazy fetch | Root loader already carries the market list |
| `LANGUAGE_LABELS` | `languageLabel` on each locale record |
| `topbarText`, `footer.bio`, `footer.addressTitle/storeAddress/storeEmail`, `footer.newsletter*`, `footer.copyright` theme settings | `i18n.staticContent` keys via `t()` |
| `Localizations` / `I18nLocale` in `app/types/others.ts` | `Locale` type exported from `app/utils/locale.ts` |

## Files Touched

```
NEW  app/utils/locale.ts                          canonical market table + helpers
NEW  app/i18n/{en,hi,ar,es,fr,de}.json            theme static content (en = source)
NEW  tests/unit/locale.test.ts                    locale resolution, links, switching
NEW  tests/unit/locale-seo.test.ts                hreflang/canonical/sitemap
NEW  tests/unit/translation.test.ts               SSR/hydration translation parity
DEL  app/utils/const.ts  (COUNTRIES, DEFAULT_LOCALE, getLocalePrefixFromPath, LANGUAGE_LABELS)
DEL  app/routes/api/countries.ts
DEL  app/i18n/{ja,vi,zh}.json
MOD  app/.server/context.ts                       resolveLocale for storefront i18n
MOD  app/.server/root.ts                          expose locale set; drop ZH patch
MOD  app/.server/seo.ts                           canonical + alternates
MOD  app/root.tsx                                 html lang/dir, topbarText via t()
MOD  app/routes.ts                                drop /api/countries
MOD  app/weaverse/schema.server.ts                translation:true + staticContent
MOD  app/weaverse/settings/{announcements,footer}.ts  drop translated strings
MOD  app/components/link.tsx                      localizePath
MOD  app/hooks/use-prefix-path-with-locale.ts     localizePath
MOD  app/components/layout/country-selector/*     root-loader markets, safe switch
MOD  app/components/layout/header.tsx             delocalizePath for isHome
MOD  app/routes/cart/{cart-page,checkout}.tsx     resolveLocale for buyer identity
MOD  app/routes/seo/sitemap-page.ts               alternates from canonical table
MOD  ~12 components/routes                        useThemeText → useTranslation
```

## Test contract (RED → GREEN)

`npm run test:unit` (Playwright, `tests/unit/`) — the repo's existing runner.

1. default + non-default locale resolution from pathname, incl. `.data` suffix
2. unsupported/malformed locale (`/en-xx`, `/EN-CA`, `/en-vn-specials`) fails safe
3. `localizePath`/`delocalizePath` round-trip; no unanchored-replace corruption
4. Weaverse `themeSchema.i18n` derives from the canonical table (default + all)
5. SSR renders locale-correct translations; hydration reads the same source
6. locale switch preserves path **and query**
7. Storefront country/language context matches the URL locale
8. cart buyer identity + checkout redirect stay on the active market
9. sitemap hreflang + `alternates` cover every configured market, x-default = default
10. removed legacy paths (`COUNTRIES`, `getLocalePrefixFromPath`, `/api/countries`)
    are referenced nowhere

## Forward fix design (2026-08-26, `fix/i18n-release-blockers`)

Four release blockers on `30a3664e`. Each fix lands at the shared boundary so
siblings are covered, and each is proved by a mutation that reintroduces it.

### P1-1 — split the four language identities

`Locale` gains two optional fields, set only where a market's identities
diverge, so 30 of 33 markets are untouched:

- `providerLanguage` — the `LanguageCode` sent to Shopify and Weaverse.
- `bundleLocale` — the theme translation file to load.

Two readers own the defaults, so no call site re-derives them:
`providerLanguageFor()` falls back to `language`, `bundleLocaleFor()` to the
BCP-47 primary subtag. `providerContextForRequest()` is the single seam
`app/.server/context.ts` hands to `createHydrogenContext`, which is what puts
`language` on every `@inContext` query.

`Intl` tags move off the provider enum onto `hreflang`, because `ZH_CN-CN` is
not a BCP-47 tag and `Intl` throws on it — prices (`parseAsCurrency`) and blog
dates were both building tags that way.

`app/i18n/zh-tw.json` is added: `zh.json` is Simplified, and Hong Kong and
Taiwan write Traditional.

### P1-2 — one payload seam owns provenance

`localizedThemePayload()` builds `weaverseTheme`: the market bundle merges into
`staticContent`, `merchantOverrides` passes through untouched. `legacyThemeText`
treats any published string — including `""` — as current intent.

### P1-3 — one map owns persisted merchandising copy

`LEGACY_SETTING_FOR_KEY` gains the five badge settings and the quick-shop
label. `SHIPPED_DEFAULT_FOR_SETTING` records the English `defaultValue` each
setting shipped with, so an untouched value falls through to the market's
translation instead of pinning English. `controlCopy()` applies the same rule to
a value a component was passed; `ProductCard` forwards
`pcardQuickShopButtonText` again and badges read through `useLegacyThemeText`.

### P1-4 — positive path validation

`safeRedirectPath()` accepts exactly one leading `/` not followed by `/` or
`\`, rejects control characters, and otherwise returns the caller's localized
fallback. The broken `isLocalPath` (which trusted `new URL()` throwing) is
deleted. The redirect keeps `headers` so the cart-id cookie is not lost.

## Gates

`npm run biome` · `npm run typecheck` · `npm run test:unit` ·
`npm run test:cart-correctness` · `npm run weaverse:manifest:check` ·
`npm run weaverse:audit` · `npm run build`

## Out of scope

Builder API changes. Verified unnecessary: `hydrogen-project.server.ts:217-221`
already bakes page translations for non-default locales, and
`GET /api/translation/static` already serves theme overrides that the installed
SDK fetches in `fetchMerchantOverrides`. No Weaverse/Shopify data is mutated by
this change.
