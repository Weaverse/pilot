import { readdir, readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { TranslationProvider, useTranslation } from "@weaverse/hydrogen";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveThemeContent } from "../../app/.server/translations";
import staticContent from "../../app/i18n/en.json" with { type: "json" };
import {
  bundleLocaleFor,
  type Locale,
  SUPPORTED_LOCALES,
} from "../../app/utils/locale";
import { themeSchema } from "../../app/weaverse/schema.server";

const I18N_DIR = new URL("../../app/i18n/", import.meta.url);
const INTERPOLATION = /\{\{(\w+)\}\}/g;

type Json = Record<string, unknown>;

/** Flattens a nested translation file into `dot.path` → leaf string. */
function flatten(value: Json, prefix = ""): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      Object.assign(flat, flatten(child as Json, path));
    } else {
      flat[path] = String(child);
    }
  }
  return flat;
}

const SOURCE = flatten(staticContent);

async function readLocaleFiles() {
  const names = (await readdir(I18N_DIR)).filter((name) =>
    name.endsWith(".json"),
  );
  return Promise.all(
    names.map(async (name) => ({
      name,
      content: flatten(
        JSON.parse(await readFile(new URL(name, I18N_DIR), "utf8")) as Json,
      ),
    })),
  );
}

function Probe({ id, name }: { id: string; name?: string }) {
  const { t } = useTranslation();
  return createElement("span", null, name ? t(id, { name }) : t(id));
}

/**
 * Renders `children` inside a translation provider and returns the SSR markup.
 *
 * `createElement` rather than JSX: Playwright's own JSX runtime owns `.tsx`
 * files in this suite, and its elements are not React nodes.
 */
function renderWithTranslations(
  sources: {
    staticContent: Record<string, unknown>;
    merchantOverrides?: Record<string, unknown>;
  },
  children: ReactNode,
) {
  return renderToStaticMarkup(
    createElement(TranslationProvider, { ...sources, children }),
  );
}

test("exposes the theme's static content to the Translation Manager", () => {
  // Without both of these, Studio reports "Translation feature is not
  // configured for this project" and Sync Theme Keys finds nothing.
  expect(themeSchema.i18n?.translation).toBe(true);
  expect(themeSchema.i18n?.staticContent).toBe(staticContent);
});

test("ships a bundled translation for every configured market", async () => {
  // Keyed by bundle locale, not language: `zh-CN` is Simplified while `zh-HK`
  // and `zh-TW` are Traditional, so one Chinese file cannot serve all three.
  const files = await readLocaleFiles();
  // `en.json` is the source language shipped as `staticContent`; every other
  // bundle locale needs its own file.
  const bundles = new Set(SUPPORTED_LOCALES.map(bundleLocaleFor));

  for (const bundle of bundles) {
    expect(files.map((file) => file.name)).toContain(`${bundle}.json`);
  }
  // No orphan payloads for markets we do not serve.
  expect(files.length).toBe(bundles.size);
});

test("every bundled translation covers the source keys exactly", async () => {
  const sourceKeys = Object.keys(SOURCE).sort();

  for (const { name, content } of await readLocaleFiles()) {
    expect({ name, keys: Object.keys(content).sort() }).toEqual({
      name,
      keys: sourceKeys,
    });
  }
});

test("translations keep their interpolation variables", async () => {
  for (const { name, content } of await readLocaleFiles()) {
    for (const [key, sourceValue] of Object.entries(SOURCE)) {
      // A dropped `{{name}}` renders an un-substituted sentence to the shopper;
      // a renamed one renders `{{name}}` verbatim.
      expect({
        name,
        key,
        vars: [...content[key].matchAll(INTERPOLATION)].map((m) => m[1]).sort(),
      }).toEqual({
        name,
        key,
        vars: [...sourceValue.matchAll(INTERPOLATION)].map((m) => m[1]).sort(),
      });
    }
  }
});

test("no translation is left as untranslated English", async () => {
  // Guards against a locale file that was copied from en.json and never
  // translated — every market would silently serve English.
  for (const { name, content } of await readLocaleFiles()) {
    if (name === "en.json") {
      continue;
    }
    const identical = Object.entries(SOURCE).filter(
      ([key, value]) => content[key] === value,
    );
    // Brand/URL-ish values may legitimately match; a wholesale copy must not.
    expect({
      name,
      ratio: identical.length / Object.keys(SOURCE).length,
    }).toEqual({ name, ratio: expect.any(Number) });
    expect(identical.length).toBeLessThan(Object.keys(SOURCE).length * 0.2);
  }
});

test("renders merchant overrides over the theme's static content", () => {
  const html = renderWithTranslations(
    {
      staticContent: { cart: { title: "Cart" } },
      merchantOverrides: { cart: { title: "Warenkorb" } },
    },
    createElement(Probe, { id: "cart.title" }),
  );

  expect(html).toBe("<span>Warenkorb</span>");
});

test("server and client render the same string for a locale", () => {
  // SSR and hydration both read the root loader's weaverseTheme payload, so the
  // same provider inputs must produce byte-identical output on both passes.
  const render = () =>
    renderWithTranslations(
      {
        staticContent,
        merchantOverrides: { product: { addToCart: "In den Warenkorb" } },
      },
      createElement(Probe, { id: "product.addToCart" }),
    );

  expect(render()).toBe(render());
  expect(render()).toBe("<span>In den Warenkorb</span>");
});

test("falls back to the source string when a locale has no override", () => {
  const html = renderWithTranslations(
    { staticContent },
    createElement(Probe, { id: "product.addToCart" }),
  );

  expect(html).toBe(`<span>${SOURCE["product.addToCart"]}</span>`);
});

test("interpolates variables into a translated string", () => {
  const html = renderWithTranslations(
    {
      staticContent,
      merchantOverrides: { product: { pictureOf: "Bild von {{name}}" } },
    },
    createElement(Probe, { id: "product.pictureOf", name: "Hut" }),
  );

  expect(html).toBe("<span>Bild von Hut</span>");
});

test("ships the market's own copy when the merchant published nothing", () => {
  // Without this the SDK only ever sees merchant overrides, so a project with
  // an empty Translation Manager renders English in every market.
  const german = resolveThemeContent(
    SUPPORTED_LOCALES.find((locale) => locale.hreflang === "de-DE") as Locale,
    undefined,
  );

  expect(flatten(german as Json)["cart.title"]).toBe("Warenkorb");
});

test("a market bundle wins over English without dropping untranslated keys", () => {
  // `resolveThemeContent` layers the market bundle onto the English source, so
  // a key the bundle does not translate must still resolve to English rather
  // than vanish. A shallow merge would replace the whole `cart` group.
  const german = SUPPORTED_LOCALES.find(
    (locale) => locale.hreflang === "de-DE",
  ) as Locale;
  const source = { cart: { title: "Cart", untranslated: "Only in English" } };
  const merged = flatten(resolveThemeContent(german, source) as Json);

  expect(merged["cart.title"]).toBe("Warenkorb");
  expect(merged["cart.untranslated"]).toBe("Only in English");
});

test("English markets are served from staticContent, not a second copy", () => {
  // `en.json` already ships as `themeSchema.i18n.staticContent`; bundling it
  // again would duplicate the whole file in every English market's payload.
  for (const locale of SUPPORTED_LOCALES.filter(
    (candidate) => candidate.language === "EN",
  )) {
    expect(resolveThemeContent(locale, undefined)).toBeUndefined();
  }
});
