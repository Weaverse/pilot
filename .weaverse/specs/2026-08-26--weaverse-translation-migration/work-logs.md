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
