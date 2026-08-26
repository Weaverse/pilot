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
