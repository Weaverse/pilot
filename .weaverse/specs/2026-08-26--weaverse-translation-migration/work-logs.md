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
