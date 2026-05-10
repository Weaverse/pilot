# Implementation Plan: Weaverse Translation Migration

## Context & Findings

After thorough codebase analysis and reading the official Weaverse docs, here is what the current `i18n` branch has and what is missing:

### What is already correct
- `@weaverse/hydrogen` version `^5.13.0` — satisfies the `>= 5.12.0` requirement
- `WeaverseI18nServer` set up in `app/lib/i18n.server.ts`
- `WeaverseI18nProvider` wrapping the layout in `app/root.tsx`
- `defaultNS: "common"` and `bundledResources` with `en.json`
- `COUNTRIES` config with path prefixes in `app/utils/const.ts`
- Weaverse schema has `i18n.urlStructure` and `shopLocales`

### What is missing / wrong

| Issue | Location | Severity |
|---|---|---|
| `translation: true` missing from schema | `app/weaverse/schema.server.ts` | **P0** |
| `staticContent` not exposed in schema | `app/weaverse/schema.server.ts` | **P0** |
| 14 files use `useTranslation` (react-i18next) instead of `useThemeText` | 14 components | **P0** |
| All non-default locales incorrectly set `language: "EN"` | `app/utils/const.ts` | P1 |
| `i18next-http-backend` installed but unused | `package.json` | P2 |

### Key implementation note on `@weaverse/i18n`
The `WeaverseI18nServer` + `WeaverseI18nProvider` from `@weaverse/i18n` is the **correct approach** for advanced pluralization and i18next integration per the [i18next Integration Guide](https://docs.weaverse.io/features/i18next-integration). It should **NOT** be removed. The issue is that `useThemeText` must also be used (for components that render theme-level translated strings so they connect to Studio Translation Manager).

---

## Files Touched

```
app/weaverse/schema.server.ts        ← add translation: true + staticContent
app/utils/const.ts                   ← fix language codes for non-EN locales
app/components/cart/cart-main.tsx    ← useTranslation → useThemeText
app/components/cart/cart-drawer.tsx  ← useTranslation → useThemeText
app/components/cart/cart-summary.tsx ← useTranslation → useThemeText
app/components/cart/cart-summary-actions.tsx ← useTranslation → useThemeText
app/components/cart/cart-line-item.tsx       ← useTranslation → useThemeText
app/components/product/add-to-cart-button.tsx ← useTranslation → useThemeText
app/components/product/badges.tsx             ← useTranslation → useThemeText
app/components/product-card/quick-shop.tsx    ← useTranslation → useThemeText
app/components/layout/footer/index.tsx        ← useTranslation → useThemeText
app/components/layout/footer/newsletter-form.tsx ← useTranslation → useThemeText
app/components/layout/predictive-search/popular-keywords.tsx ← useTranslation → useThemeText
app/components/root/newsletter-popup.tsx      ← useTranslation → useThemeText
app/routes/search/popular-searches.tsx        ← useTranslation → useThemeText
app/routes/cart/cart-page.tsx                 ← useTranslation → useThemeText
package.json                         ← remove i18next-http-backend (P2)
vite.config.ts                       ← clean up ssr.noExternal if react-i18next removed (P2, if applicable)
```

---

## Step-by-Step Plan

### Step 1 — Wire Schema to Translation Manager (P0)

**File**: `app/weaverse/schema.server.ts`

Add `import staticContent from "~/i18n/en.json"` and update `i18n` block:

```ts
// Before
i18n: {
  urlStructure: "url-path",
  defaultLocale: { ... },
  shopLocales: [...],
}

// After
i18n: {
  translation: true,
  staticContent,
  urlStructure: "url-path",
  defaultLocale: { ... },
  shopLocales: [...],
}
```

**Why**: Without `translation: true` and `staticContent`, Weaverse Studio's Translation Manager cannot discover or sync the theme's translation keys. The "Sync Theme Keys" button in Studio will do nothing.

---

### Step 2 — Migrate `useTranslation` → `useThemeText` (P0)

**Scope**: 14 files, 34 call sites.

**Pattern change**:
```ts
// Before
import { useTranslation } from "react-i18next";
const { t } = useTranslation("common");

// After
import { useThemeText } from "@weaverse/hydrogen";
const { t } = useThemeText();
```

**Key points**:
- `useThemeText` uses the **same dot-notation key paths** as `useTranslation` does with `en.json` (e.g. `t("cart.title")`), so all existing key calls remain valid.
- `useThemeText` supports the same `{{variable}}` interpolation syntax (e.g. `t("product.pictureOf", { name })`).
- The `"common"` namespace argument passed to `useTranslation` is dropped — `useThemeText` reads from the flat JSON structure directly.

**Files to migrate** (in order of risk, lowest first):
1. `app/components/root/newsletter-popup.tsx`
2. `app/components/layout/footer/newsletter-form.tsx`
3. `app/components/layout/footer/index.tsx`
4. `app/components/layout/predictive-search/popular-keywords.tsx`
5. `app/routes/search/popular-searches.tsx`
6. `app/routes/cart/cart-page.tsx`
7. `app/components/cart/cart-main.tsx`
8. `app/components/cart/cart-drawer.tsx`
9. `app/components/cart/cart-summary.tsx`
10. `app/components/cart/cart-summary-actions.tsx`
11. `app/components/cart/cart-line-item.tsx`
12. `app/components/product/badges.tsx`
13. `app/components/product/add-to-cart-button.tsx`
14. `app/components/product-card/quick-shop.tsx`

---

### Step 3 — Fix Language Codes in COUNTRIES (P1)

**File**: `app/utils/const.ts`

Currently all locales use `language: "EN"`. This must reflect the actual language of each locale so Studio's Translation Manager assigns the right language to each route prefix.

Only update locales that have a real non-English language. Locales that are English-speaking countries (AU, CA, SG, GB, etc.) should stay `"EN"`.

Example of what needs correcting:
```ts
// "/fr-fr": { language: "FR" }  ← if FR locale exists
// "/de-de": { language: "DE" }  ← if DE locale exists
// "/vi-vn": { language: "VI" }  ← if VI locale exists
```

> **Note**: Check `app/utils/const.ts` carefully. If all current locales are genuinely English-speaking countries (US, AU, CA, SG, NZ, GB), then all staying `"EN"` is actually correct for now. This step only matters when adding new non-English countries.

---

### Step 4 — Remove Unused Package (P2)

**File**: `package.json`

Remove `i18next-http-backend` — it is installed but never used since `bundledResources` in `WeaverseI18nServer` handles resource loading directly.

```bash
npm uninstall i18next-http-backend
```

Also clean up `vite.config.ts` `ssr.noExternal` if entries become unnecessary after cleanup.

---

## Verification Checklist

After implementation, verify the following before marking as `completed`:

- [ ] Dev server starts without `ReferenceError: module is not defined`
- [ ] No `Failed to resolve dependency` warnings in terminal
- [ ] `npx @biomejs/biome check --write --unsafe` passes on all modified files
- [ ] No remaining `useTranslation` imports from `react-i18next` in `app/` (except `@weaverse/i18n` internals)
- [ ] `schema.server.ts` exports `staticContent` and `translation: true`
- [ ] Open Weaverse Studio → Translation Manager → "Sync Theme Keys" successfully lists keys from `en.json`
- [ ] `t("cart.title")` renders correctly in browser for default locale
