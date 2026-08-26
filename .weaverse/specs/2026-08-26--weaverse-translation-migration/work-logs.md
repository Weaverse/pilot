# Work Logs

## 2026-05-09 — @Hieu1866

### Completed
- **Step 1**: Added `translation: true` and `staticContent` to `app/weaverse/schema.server.ts`
- **Step 2**: Migrated all 14 files (34 call sites) from `useTranslation("common")` to `useThemeText()`
- **Step 4**: Removed unused `i18next-http-backend` package

### Files Modified
- `app/weaverse/schema.server.ts` — added `import staticContent` + `translation: true`
- 14 component/route files — swapped `react-i18next` → `@weaverse/hydrogen` import + hook
- `package.json` / `package-lock.json` — removed `i18next-http-backend`

### Decisions
- Kept `@weaverse/i18n` (`WeaverseI18nServer` + `WeaverseI18nProvider`) — still needed for i18next pluralization per docs
- Kept `react-i18next` as dependency — it is used internally by `@weaverse/i18n`
- **Step 3**: Fixed `COUNTRIES` language codes for Vietnamese (`VI`) and Spanish (`ES`)

### Pending
- Verify "Sync Theme Keys" works in Weaverse Studio
- Verify translations render correctly in browser

## 2026-08-26 — OMP (for @paul-phan), issue #473

### Context
Resumed the branch after 3.5 months. `i18n` was 17 commits ahead / 236 behind
`main`. Merged `origin/main` into `i18n` rather than rebuilding: conflicts in 20
files resolved in favour of `main`, which owns the authoritative storefront
behaviour, then the translation layer re-applied on top against the currently
installed SDK.

### Decisions
- Moved the spec from `.specs/` (a root that does not exist in this repo) to
  `.weaverse/specs/`, re-dated to `2026-08-26`, `Created` preserved.
- **Dropped `@weaverse/i18n` + `react-i18next` + `app/lib/i18n.server.ts`.** The
  2026-05-09 plan's central assumption is obsolete: `@weaverse/hydrogen@5.20.2`
  ships `TranslationProvider`/`useTranslation` and `withWeaverse` already wires
  `staticContent` + `merchantOverrides` from the root loader. A second i18next
  runtime would be a parallel system with no capability the SDK lacks.
- `useThemeText` → `useTranslation`: the branch migrated *to* what is now the
  deprecated alias.
- Did not port `wrangler.json` (Cloudflare) or the language switcher (duplicate
  of the country selector's language rows).
- Verified **no Builder change is required**: page translations are already
  baked per non-default locale in `hydrogen-project.server.ts`, and
  `/api/translation/static` already serves theme overrides.

### Live smoke test on the dev server (defects found and fixed)

Running the real storefront (`npm run dev`, Chromium via the repo's own
Playwright) surfaced three defects that every static gate had passed:

1. **Bundled locale JSON was dead weight.** `app/i18n/*.json` shipped in the
   theme but nothing read it: the SDK only fetches *merchant* overrides from
   `/api/translation/static`. A project with no published translations rendered
   English in every market. Fixed by `app/.server/translations.ts`, which merges
   the active market's bundled file under the merchant's overrides (deep merge,
   so a partially-translated group does not hide its untranslated siblings).

2. **`hreflang` never reached most pages.** Ten routes exported
   `meta = ({ data }) => getSeoMeta(data.seo)`, discarding the root match that
   carries `alternates`. Only the three `matches`-merging routes emitted them.
   All routes now merge the root payload.

3. **The market switcher could not switch markets.** The submit control was a
   `Popover.Close`, which unmounts the form synchronously during the click, so
   the browser dropped the pending native submission — clicking a market row did
   nothing. Verified by driving the real popover; now a plain `<button>`.

Additionally, Hydrogen renders `SeoConfig.alternates[].default: true` as
`hrefLang="en-US-default"`, which is not a valid value. `alternateLinks` now
emits a separate `x-default` entry instead.

### Verified against the running storefront

- `/`, `/de-de`, `/hi-in`, `/ar-ae` → correct `lang`/`dir` (`rtl` for `ar-AE`);
  `/en-xx` → 404.
- Announcement bar renders per market: `Kostenloser Versand ab 50 $` (de),
  `شحن مجاني` (ar), `मुफ़्त शिपिंग` (hi).
- Home/product/collection emit self-referential canonical + 10 alternates +
  `x-default`; sitemap emits the same set.
- Market switch from `/de-de/collections/all?sort=price` → `/hi-in/...?sort=price`
  (query preserved, `lang` flips to `hi-IN`).
- Cart buyer identity + checkout follow the market: `en-gb` → `GB`/`GBP 111.0`,
  `ar-ae` → `AE`/`VND 3939000.0`, both redirecting to `checkout.weaverse.dev`.

### Storefront-level limits (Shopify Admin config, not code)

`localization.availableCountries` on the dev store returns 12 countries with
only `EN`/`VI`/`ZH_CN` languages, and only US (USD) and GB (GBP) have their own
currency — every other market resolves to VND. So `/de-de` prices in USD and
`/ar-ae` in VND on this store. The theme passes the market through correctly
(`/en-gb` renders GBP, `/ar-ae` cart is `AE`); the missing markets/languages are
Admin configuration, listed in the handoff manifest.

### Self-review of the translation resolver

Reviewing my own `app/.server/translations.ts` against the running server found
that English was bundled *and* already sent as `themeSchema.i18n.staticContent`,
so every English market (`en-US`, `en-GB`, `en-IN`, `en-AE`) carried the whole
file twice — ~8 KB per request. `BUNDLED` now omits `en` and the resolver
returns `undefined` for English markets, letting the SDK read `staticContent`.
Confirmed live: `/` and `/en-gb` dropped ~8 KB while `/de-de` and `/ar-ae` still
render translated copy.

The prototype-safety comment also over-claimed: skipping `constructor` and
`prototype` does nothing on a plain object literal. Only `__proto__` is skipped,
and the comment now says exactly why.

### Simplification pass, and the defect it exposed

Ten routes had each grown their own copy of the same three-line
`getSeoMeta(...matches.map(...))` body — the invariant "always merge the root
match" was restated ten times and enforced nowhere. `app/utils/seo.ts` now owns
`seoMetaFromMatches`, every page route calls it (net −30 lines), and a test
walks `app/routes/` to fail if a new route reintroduces the pattern. Account
routes are exempt and skipped explicitly: they are behind auth and noindex, so a
bare title is correct.

Writing that test surfaced `app/routes/catch-all.tsx`, which serves public
Weaverse CUSTOM pages and emitted page SEO only — no canonical, no alternates.
Fixed with the same helper.

Verifying the refactor against the running server then exposed a genuine
market-parity bug that predates this work: **Shopify URL redirects only worked
on the default market.** `storefrontRedirect` matches the request path verbatim
while Shopify stores redirects market-neutral, so `/collections/all` → 301
`/collections/the-full-catalog` but `/de-de/collections/all` → 404. `server.ts`
now delocalizes the lookup and relocalizes the target, keeping the shopper in
their market. Confirmed live for `de-de`, `en-gb` and `ar-ae`, with genuine
misses (`/de-de/definitely-not-a-page`, `/en-xx/...`) still 404.

That fix had a bug of its own on first write: spreading `redirected.headers`
into an object literal and then setting `Location` appended a second header,
producing a comma-joined URL. `Headers.set` replaces; the test asserts the
object-literal form does not come back.

## 2026-08-26 — Release-blocker review (P1 items)

Two blockers from the independent review, both fixed at the root and
mutation-tested.

### Blocker 1 — market URL contract was silently narrowed

`app/utils/const.ts` on the base shipped **27 prefixed markets**. The candidate's
canonical table shipped 10, and redirected the other 23 to the US market via a
`RETIRED_MARKET_PREFIXES` shim — changing each shopper's country and currency.
Issue #473 asked for one source of truth plus GCC/India markets; it never
authorized retiring a market.

Fixed by merging, not choosing: the table is now **33 markets** — all 27 prior
prefixes with their original country/currency, plus the 5 new locales
(`/hi-in`, `/en-in`, `/ar-ae`, `/en-ae`, `/ar-sa`); `/es-es`, `/fr-fr`,
`/de-de`, `/en-gb` already overlapped. With every market live the retirement
shim and its second list are dead code, so both were deleted — the one-table
invariant holds.

Restoring markets pulled in three languages with no bundled copy. `it.json`,
`ja.json` and `zh.json` were added at full parity: 174/174 keys, zero missing,
zero orphan, zero interpolation-variable drift.

Regression: `tests/unit/fixtures/prior-market-contract.json` pins the base
contract, and two tests assert every prior prefix still resolves to its original
language/country/currency and that nothing was dropped.

### Blocker 2 — `isMarketInvariantPath` was a negative heuristic

It claimed an allowlist but implemented `segments.length < 2 || !RESOURCE[first]`,
so `/festive-wear`, `/foo/bar` and every unknown path were "invariant". Root SEO
calls `alternateLinks` for every route including the `*` catch-all, so each
emitted 11 fabricated localized URLs.

Replaced with an exact positive matcher over the six static, parameterless
paths the route table actually defines (`/`, `/search`, `/cart`, `/collections`,
`/products`, `/policies`), normalizing trailing slash, query and case.
Handle-bearing, account and catch-all paths return zero alternates: a wrong
`hreflang` asserts a page exists where it does not, which is worse than absence.

### Release evidence — the redirect seam is now behavior-tested

The market-aware redirect logic was inline in `server.ts` and could only be
checked by grepping source strings. Extracted to `app/.server/market-redirect.ts`
with the Shopify lookup injected, and covered by seven behavior tests against
real `Response` objects: document (301 + `Location`) and single-fetch
(204 + `X-Remix-Redirect`) carriers, query preservation, `.data` protocol
survival, off-origin targets left untouched, genuine 404 passthrough, and a
single non-comma-joined header. The two source-string tests they replace were
deleted.

Mutations verified each guard: restoring the negative heuristic fails 4 SEO
tests; dropping `/en-au` fails both contract tests; reading only `Location`
fails the single-fetch test; removing the off-origin check fails its test.

### Operational truth — Shopify silently falls back

Read-only Storefront probe (`@inContext`) of all 33 configured markets on the
current env: **3 are fully enabled** — root `EN-US/USD`, `/en-gb EN-GB/GBP`,
`/en-vn EN-VN/VND`. 23 resolve to `EN-US/USD`; 7 have the country enabled but
fall back on currency/language (`/en-au` → `EN-AU/VND`, `/ar-ae` → `EN-AE/VND`,
`/en-jp` → `EN-JP/VND`, and siblings).

This is Admin configuration, not code, and is identical on base `main` — the
same 27 prefixes were already configured against the same store. Shopify does
not error on an unconfigured country/language; it silently serves the default.
Every market in the table must be enabled in Shopify Admin before production
use. No unsupported context is claimed as verified.

## 2026-08-26 — Release review, four items

Item 3 was already fixed in the working tree before this review (exact
allowlist, `RESOURCE_NAMESPACE` deleted, negative regression). It was
re-verified live rather than re-implemented; the other three are fixed below.

### 1. Duplicate spec directory — removed

`.specs/2026-05-09--weaverse-translation-migration/` was added by this branch
and does not exist on `main`. Pilot's specs live in `.weaverse/specs/`
(`.weaverse/README.md`), and the new folder already carries the original prompt,
`Created: 2026-05-09`, owner lineage `@Hieu1866 → @paul-phan` and the verbatim
2026-05-09 work log. The copy was redundant, so the move is now a move.

### 2. Legacy fallback treated a cleared setting as absent

`legacyThemeText` required `legacy.length > 0`, so a merchant who deliberately
cleared their store address, contact email or announcement fell through to the
theme's bundled demo copy — republishing `contact@my-store.com` and a sample
Toronto address on a live storefront. Presence is now decided by the property
and emptiness returned as `""`.

Writing the boundary test surfaced a second defect in the fix itself: `in`
walks the prototype chain, so an inherited `copyright` counted as a merchant
setting. Now `Object.hasOwn`.

`RootLayout` also read the announcement with a raw `t()` while
`ScrollingAnnouncement` read it legacy-aware, so the reserved
`--initial-topbar-height` could describe copy that never rendered. The root now
uses the same `useLegacyThemeText()` reader.

Aligning the reader exposed a third, pre-existing disagreement: the root decided
by truthiness and the component by visible text, so `"<p></p>"` — a non-empty
string that paints nothing — reserved a 36px strip above the header that no bar
filled. Both sides now call one exported `hasVisibleAnnouncement`.

### 4. Dead binding — removed

`scrolling-announcement.tsx` still destructured `t` from `useTranslation` after
migrating to `useLegacyThemeText`; zero call sites remained. Binding and import
removed.

### Verification

Five mutations, each reintroducing one defect, each caught:
`length > 0` (3 tests), `in` for `hasOwn` (1), truthiness for visible-text (1),
root re-inlining `topbarText ? topbarHeight : 0` (1), root reverting to a raw
reader (1). Two assertions had to be tightened first — `themeText("…")` contains
`t("…")` as a substring, and the formatter wraps the height expression — both of
which had made a mutation pass silently.

Gates: `typecheck`, `biome`, `test:unit` (89), `test:cart-correctness`,
`weaverse:manifest` (not stale), `weaverse:audit`, `build` — all exit 0.

Live: 33/33 markets serve 200 with correct `lang`/`dir`; invented prefixes
(`/en-xx`, `/zz-zz`, `/XX-YY` uppercase, `.data`) all 404; `/ja-jp/collections/all`
301s to `/ja-jp/collections/the-full-catalog`, preserving the market; invariant
paths emit 34 `hreflang` links (33 markets + `x-default`) while
`/products/<handle>`, `/about` and `/de-de/about` emit none; reserved topbar
height matches the rendered bar on every market sampled.

## 2026-08-26 — Forward fix for four release blockers (`fix/i18n-release-blockers`)

Branch cut from published `30a3664e`; no history rewritten. Every blocker was
reproduced before any production change, and every fix proved by a mutation
that reintroduces the defect.

### P1-1 — Chinese URL identity was reused as provider language

**RED.** Read-only Storefront probe: `ZH`/CN → `EN`, `ZH`/HK → `EN`, `ZH`/TW →
`EN`; control `ZH_CN`/CN → `ZH_CN`. `tests/unit/locale-provider.test.ts`
"Chinese markets request a language Shopify resolves" failed `resolves: false`.

**GREEN.** `Locale` gained `providerLanguage` and `bundleLocale`, read through
`providerLanguageFor()` and `bundleLocaleFor()`; `providerContextForRequest()`
is the one seam `context.ts` uses. `Intl` tags moved from the provider enum to
`hreflang` in `parseAsCurrency`, `blogs/blog.tsx` and `blogs/article.tsx` —
`ZH_CN-CN` makes `Intl` throw.

Writing the bundle test found a second defect the review had not itemised:
`zh.json` is Simplified, and the bundle key was derived from the BCP-47 primary
subtag, so `/zh-hk` and `/zh-tw` rendered Simplified copy. `app/i18n/zh-tw.json`
was added at 174/174 key parity, zero interpolation drift, zero
Simplified-only characters; the 25 entries identical to `zh.json` were each
checked as script-neutral.

**Mutations, all caught:** helper returning the bare enum (3 fail); seam
returning the raw locale (1); bundle keyed by the provider enum (1); HK given
`ZH_CN` (2); bundle collapsed to the primary subtag (5); HK's `bundleLocale`
removed (3); `zh-tw` unregistered (3).

**Live.** `/zh-cn` renders 购物车, `/zh-hk` and `/zh-tw` render 購物車, each with
its own `<html lang>`. Provider readback: `/zh-cn` sends `ZH_CN` → Shopify
resolves `ZH_CN`.

`ZH_TW` resolves to `EN` on the current store because it is not an enabled
language there — `availableCountries` reports only `EN VI ZH_CN`, and CN and TW
are not enabled countries at all. A control probe confirms this is store
configuration, not a bad enum: an invalid value (`XX_YY`) is a GraphQL error,
while `ZH_TW` is accepted and silently falls back. Same class as the 30/33 gap
below.

### P1-2 — bundled copy was labelled merchant-published

**RED.** `tests/unit/translation-provenance.test.ts`, composing the real German
payload: footer email returned `contact@my-store.com` instead of the saved
`merchant@example.test`; copyright returned the German demo string instead of
`© Merchant 2026`; announcement likewise; an explicitly published `""` was
ignored. 5 of 7 failed.

**GREEN.** `resolveTranslations` became `resolveThemeContent` and merges the
market bundle into `staticContent`; `localizedThemePayload()` is the single seam
the root loader uses, leaving `merchantOverrides` exactly as the API returned
it. `legacyThemeText` treats any published string, `""` included, as intent.

**Mutations, all caught:** bundle labelled as `merchantOverrides` (6 fail);
override intent by truthiness (1); `merchantOverrides` dropped (2); bundle
overwriting English siblings (1, in `translation.test.ts`).

**Live, on the German market.** The merchant's persisted `© 2025 Weaverse. All
rights reserved.` renders; the German bundle's `© 2024 Weaverse. Alle Rechte
vorbehalten.` is present in the payload and correctly does not render.
`Subscribe me` (merchant edit) renders while `BLEIBEN SIE IN KONTAKT` comes from
the bundle — merchant copy and translation coexisting, each where it belongs.

### P1-3 — persisted badge and quick-shop copy was orphaned

**RED.** `tests/unit/merchant-copy.test.ts` against
`fixtures/pre-upgrade-theme-settings.json`: quick-shop rendered `Quick shop`
instead of `Schnellansicht`, badges rendered theme defaults instead of the
merchant's words. 5 of 7 failed.

**GREEN.** The five badge settings and `pcardQuickShopButtonText` were added to
`LEGACY_SETTING_FOR_KEY`; badges read through `useLegacyThemeText`; `ProductCard`
forwards the label again and `QuickShopTrigger` resolves it via `controlCopy()`
instead of defaulting to an English literal.

A second RED followed: every one of these settings shipped an English
`defaultValue`, so an upgraded storefront persists it whether or not the
merchant ever opened the field. Preserving those verbatim would pin English into
every localized market — the migration's whole purpose, undone.
`SHIPPED_DEFAULT_FOR_SETTING` records them, so an untouched value falls through
to the translation while any edit, including `""`, survives.

**Mutations, all caught:** badge keys unmapped (3 fail); quick-shop mapping
removed (2); shipped-default table ignored (1); `controlCopy` ignoring the
forwarded value (1); `controlCopy` letting the shipped default win (1).

**Live.** German collection page: `saleBadgeText` is `Sale` — a merchant edit,
since the shipped default was `-[percentage]% Off` — and `Sale` renders while
the German `-[percentage]% Rabatt` correctly does not.

**Coverage limit, stated plainly.** Component-render tests are not possible in
this suite: Playwright's transform rewrites app `.tsx` JSX into fixture objects
React refuses to render, and a scoped `tsconfig` does not override it. A real
static-router harness was built and discarded rather than left as a fake. The
copy layer is unit-tested; the component wiring is covered by the live checks
above.

### P1-4 — cart action accepted scheme-relative redirects

**RED.** Against the shipped guard verbatim: `//evil.example/phish` →
`Location: //evil.example/phish`; `///evil.example/phish` and
`/\evil.example/phish` likewise. Only the absolute `https://` form was refused,
because the check trusted `new URL()` throwing.

**GREEN.** `app/utils/safe-redirect.ts` validates positively: exactly one
leading `/`, next character not `/` or `\`, no control characters, otherwise the
caller's localized cart. `isLocalPath` was deleted. The redirect carries
`headers` so a cart created by the same mutation is not lost.

**Mutations, all caught:** the shipped parse-failure guard restored (5 fail);
network-path check removed (4); backslash spelling allowed (1).

**Live, real cart POST to `/de-de/cart`.** `//evil.example/phish`,
`///evil.example/phish`, `/\evil.example/phish` and `https://evil.example/phish`
all redirect to `http://localhost:3456/de-de/cart`;
`/ar-ae/collections/all?sort=price` and `/products/hoodie#reviews` are preserved
with query and fragment intact.

### Regression sweep

33/33 markets serve 200 with correct `lang`/`dir`; `/en-xx`,
`/zz-zz/collections/all` and `/en-xx/products/hoodie.data` still 404.

### Deployment prerequisites — documented, not mutated

No Shopify, Weaverse, Customer Account, DNS or deployment state was changed.

1. **Shopify market enablement.** 3 of 33 theme routes fully match Shopify
   today (`/` → EN-US/USD, `/en-gb` → EN-GB/GBP, `/en-vn` → EN-VN/VND). The
   store enables only `EN VI ZH_CN`. Every intended country, currency and
   language — GCC, India, UK, US, and Traditional Chinese for `/zh-hk` and
   `/zh-tw` — must be enabled and read back before launch, or the market
   removed from the table. Shopify does not error on an unenabled combination;
   it silently serves the default.
2. **Customer Account logout URIs.** Register the storefront origin and every
   served `origin/<prefix>` home URI as allowed post-logout URIs. The
   authentication callback stays unlocalized.
3. **Translation Manager rollout.** Sync and publish the theme keys and intended
   merchant overrides after this correctness fix, so provenance is recorded
   against the corrected precedence.

## 2026-08-26 — Second independent review of `6fd2f438`: four more P1s

An exact-SHA review BLOCKED `6fd2f438` with four findings. Two were fixed
before the report arrived (quick-shop's second precedence layer and live design
overrides); two were new.

### Finding 1 — the Shopify enum corrupted the Weaverse translation lookup

The previous entry claimed `providerLanguageFor()` produced "the Shopify +
Weaverse `LanguageCode`". That was wrong, and the spec has been corrected:
Shopify and Weaverse are **separate boundaries with opposite requirements**.

Shopify's `LanguageCode` is a script-specific enum. Weaverse keys Translation
Manager overrides by the locale a merchant picks in Studio, and the installed
client builds that key as lowercase `${language}-${country}` from
`storefront.i18n` (`weaverse-client.ts:813-838`). Because `context.ts` spread
the same Shopify-facing storefront into `WeaverseClient`, Chinese markets asked
for locales that do not exist.

**RED**, driving the real `createHydrogenRouterContext` with a recording
`fetch`:

| Market | Required | Requested |
| --- | --- | --- |
| `/zh-cn` | `zh-cn` | `zh_cn-cn` |
| `/zh-hk` | `zh-hk` | `zh_tw-hk` |
| `/zh-tw` | `zh-tw` | `zh_tw-tw` |

German asked for `de-de` correctly. The SDK swallows a missing-override
response, so this failed silently — every published Chinese string reverting to
theme defaults with nothing in the logs.

**GREEN.** `weaverseStorefront()` shallow-copies the storefront with `i18n.
language` re-labelled for Weaverse. Hydrogen's `query` binds `@inContext` from
its own closure, verified directly, so Shopify keeps receiving `ZH_CN`/`ZH_TW`
while Weaverse reads `zh-cn`/`zh-hk`/`zh-tw`.

A first attempt read the public code back off `storefront.i18n` and did not
work: `providerContextForRequest()` had already overwritten `language` with the
enum, so the public identity was destroyed, not shadowed. Deriving it from
`hreflang` worked but needed a cast. The shipped version takes the canonical
market entry as an argument — no derivation, no cast, and the wrong version is
kept as mutation W2.

All 33 markets are asserted, sequentially — the first version ran them through
`Promise.all` and every market read another's `fetch` recorder, reporting
`null`. A test that passes only when run alone proves nothing.

**Mutations, all caught:** Weaverse handed the raw provider storefront (2
fail); re-labelling from the mutated `i18n` instead of the market entry (2);
passing the provider context as the market (2); context passing the raw locale
instead of the provider context (1).

### Finding 4 — the tests did not discriminate production wiring

The reviewer mutated six production paths and all 129 tests stayed green,
including one that reopened the unauthenticated open redirect. The prior suite
tested helpers and recomposed production behaviour instead of executing it.

Four boundary tests now execute the shipping code:

- `weaverse-locale.test.ts` builds the real request context and asserts the URL
  each provider is actually asked for.
- `production-boundaries.test.ts` calls the real root loader and the real cart
  route action, including the `Set-Cookie` that a refused redirect must keep.
- `live-translation-preview.test.ts` renders the shipped announcement, badge and
  quick-shop components under the SDK's own `TranslationProvider`.

`tests/support/render-app.ts` compiles app modules with esbuild — already
installed via `@shopify/cli` — because Playwright owns the JSX runtime for
files under `testDir` and rewrites app `.tsx` into fixture objects React
refuses to render. This replaces the harness abandoned in the previous entry;
the earlier "component tests are impossible here" limitation is now closed.
`tests/support/hydrogen-env.ts` supplies a fully typed `Env` and the worker
`caches` global the context opens before anything else.

**Every reviewer mutation now fails:**

| # | Mutation | Result |
| --- | --- | --- |
| 1 | context passes raw locale | 1 failed |
| 2 | root bypasses `localizedThemePayload` | 1 failed |
| 3 | hook ignores all legacy settings | 2 failed |
| 4 | badge renders hardcoded copy | 1 failed |
| 5 | product card stops forwarding quick-shop copy | structurally removed |
| 6 | cart route bypasses `safeRedirectPath` | 1 failed |

Mutation 5 no longer has a path to break: the prop and `controlCopy()` were
deleted, and `QuickShopTrigger` reads the shared hook. Its surviving equivalent
— the trigger hardcoding `"Quick shop"` — fails 3 tests.

### Findings 2 and 3 — live and published edits masked by legacy copy

Fixed before the report arrived; recorded here against its findings.

`useLegacyThemeText` answered from a persisted legacy setting before calling
`t()`, and the SDK resolves `designOverrides ?? merchantOverrides ??
staticContent` inside `t()`. A merchant editing a migrated string in Studio saw
the preview not change. `QuickShopTrigger` had a second bypass: `controlCopy()`
returned the forwarded prop without consulting the reader at all.

`legacyThemeText` now takes the design-override snapshot and retires itself for
any key the merchant is editing live, including an explicit `""`. The
quick-shop prop, `controlCopy()` and the `ProductCard` plumbing are deleted —
the setting is read through the same hook, so a second precedence path cannot
reappear.

**Mutations, all caught:** design overrides never consulted (4 fail); hook
stops passing the store (3); truthiness instead of own-property presence (3);
`in` walking the prototype chain (1); quick-shop bypass restored (2).

The prototype case is reachable: the store's snapshot is a plain object, so
`"constructor" in snapshot` is `true`.

## 2026-08-26 — Third review of `1c9db169`: the split leaked back through query variables

An exact-SHA review BLOCKED `1c9db169` on one P1, and it was right.

`weaverseStorefront()` deliberately puts the market's **public** identity on
`weaverse.storefront.i18n`, because the installed client derives its Translation
Manager locale from it. Six loaders then read that same object and copied
`language`/`country` into their own query variables. Hydrogen fills
`$country`/`$language` from the storefront client's closure **only when the
caller leaves them absent** (`index.js`: `!P?.language && /\$language/.test(K)`),
so those explicit variables won — sending bare `ZH` to Shopify.

`ZH` is a valid enum member that resolves to English, so nothing errored: a
Chinese shopper would get correct Chinese theme copy over an English catalogue.

### RED, at the real boundary

`tests/unit/provider-locale-leak.test.ts` builds the real request context,
calls the real loaders, and inspects the Storefront POST body and the
translation URL separately:

| Market | Shopify sent | Required | Weaverse sent |
| --- | --- | --- | --- |
| `/zh-hk` | `ZH` | `ZH_TW` | `zh-hk` ✓ |
| `/zh-cn` | `ZH` | `ZH_CN` | `zh-cn` ✓ |
| `/zh-tw` | `ZH` | `ZH_TW` | `zh-tw` ✓ |

The translation half was already correct, so this confirmed the two identities
had to be separated at the *request*, not just in the object.

### GREEN — one rule, not six patches

The explicit variables were redundant: Hydrogen already injects both from the
closure, which holds the provider enum. Deleting them is the whole fix. A
runtime probe confirms the injected values are `{"country":"TW","language":
"ZH_TW"}`.

The review named four consumers. Two more had the identical defect —
`sections/single-product/loader.ts` and `sections/hotspots/item.tsx` — found by
auditing every `storefront.i18n.language` callsite. Both are fixed and covered,
since the guard should hold for the flow rather than the reported instances.
Route loaders reading `context.storefront` are untouched: that object still
carries the enum, which is correct for them.

### Live evidence

Same server, same URL, only the fix differing — the `<h6>` grid the list route
renders from its own Shopify query:

- **with the leak:** `The Full Catalog`
- **with the fix:** `完整目录`, `外壳`, `优质抓绒`

A direct Storefront probe pins why this is invisible without rendering:
`ZH`/`CN` returns `"The Full Catalog"`, `ZH_CN`/`CN` returns `"完整目录"` — same
200, no error.

`/zh-hk` and `/zh-tw` still render an English catalogue. That is provider
configuration, not code: `availableLanguages` is `EN VI ZH_CN`, so `ZH_TW` is
accepted and silently falls back. Unchanged prerequisite.

**Mutations, all caught:** each of the five loaders re-adding its explicit
`language` (1 fail each, 2 for featured-collections); Weaverse losing the
public locale (3 fail) — proving the translation half is still guarded.

### Two harness defects fixed on the way

- `packages: "external"` (a first attempt at the media-element build failure)
  moved `react-use/esm/useScroll` from a bundler concern to an unresolvable
  runtime import, breaking three cart tests. Packages are bundled again; only
  genuinely-missing specifiers are stubbed, via a plugin whose stub throws if
  anything ever calls it.
- A mutation-restore loop keyed backups by basename, so `featured-products/
  index.tsx` overwrote `featured-collections/index.tsx` and corrupted the
  working tree (duplicate component type, stale codegen). Restored from git and
  reapplied; backups are now keyed by full path.
