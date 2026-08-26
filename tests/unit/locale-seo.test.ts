import { readdir, readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { alternateLinks, SUPPORTED_LOCALES } from "../../app/utils/locale";

const ORIGIN = "https://pilot.weaverse.dev";

test("emits one alternate per market plus x-default", () => {
  const alternates = alternateLinks("/search", ORIGIN);

  expect(alternates.length).toBe(SUPPORTED_LOCALES.length + 1);

  for (const locale of SUPPORTED_LOCALES) {
    expect(alternates).toContainEqual({
      language: locale.hreflang,
      url: `${ORIGIN}${locale.pathPrefix}/search`,
    });
  }

  // Exactly one x-default, pointing at the default market. It must be a
  // literal `x-default`: Hydrogen's `default: true` flag renders
  // `hreflang="en-US-default"`, which no search engine recognises.
  const defaults = alternates.filter(
    (alternate) => alternate.language === "x-default",
  );
  expect(defaults).toEqual([
    { language: "x-default", url: `${ORIGIN}/search` },
  ]);
  // No market tag may carry the suffix, i.e. never `en-US-default`.
  expect(
    alternates.filter((alternate) => alternate.language.endsWith("-default")),
  ).toEqual([{ language: "x-default", url: `${ORIGIN}/search` }]);
});

test("alternates are built from a market-neutral path", () => {
  // A localized request URL must still advertise every sibling market, not
  // nest the active prefix inside each alternate.
  const fromLocalized = alternateLinks("/hi-in/search", ORIGIN);
  const fromNeutral = alternateLinks("/search", ORIGIN);

  expect(fromLocalized).toEqual(fromNeutral);
});

test("alternates drop the query string", () => {
  // Filter/sort permutations are not separate localized documents.
  const alternates = alternateLinks("/collections/summer?sort=price", ORIGIN);

  for (const alternate of alternates) {
    expect(alternate.url).not.toContain("?");
  }
});

test("the home page alternates have no trailing slash mismatch", () => {
  const alternates = alternateLinks("/", ORIGIN);

  expect(alternates).toContainEqual({ language: "x-default", url: ORIGIN });
  for (const locale of SUPPORTED_LOCALES) {
    expect(alternates).toContainEqual({
      language: locale.hreflang,
      url: `${ORIGIN}${locale.pathPrefix}`,
    });
  }
});

test("the sitemap reads the canonical market table", async () => {
  const source = await readFile(
    new URL("../../app/routes/seo/sitemap-page.ts", import.meta.url),
    "utf8",
  );

  // Regression: the sitemap used to rebuild its own locale list from COUNTRIES
  // with a locally-derived prefix, so adding a market needed two edits.
  expect(source).toContain("~/utils/locale");
  expect(source).not.toContain("COUNTRIES");
  // It must not fabricate per-handle alternates by swapping the market prefix:
  // handles are localized per market and resources can be unpublished in one.
  expect(source).not.toContain('rel="alternate"');
});

test("no surface reimplements locale parsing", async () => {
  // Every locale decision must come from app/utils/locale.ts, so adding a
  // market is a one-file change (issue #473).
  const files = [
    "../../app/.server/context.ts",
    "../../app/.server/seo.ts",
    "../../app/components/link.tsx",
    "../../app/hooks/use-prefix-path-with-locale.ts",
    "../../app/components/layout/header.tsx",
    "../../app/components/layout/country-selector/use-country-selector.ts",
    "../../app/routes/cart/cart-page.tsx",
    "../../app/routes/cart/checkout.tsx",
    "../../app/weaverse/schema.server.ts",
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    expect({ file, legacy: source.includes("COUNTRIES") }).toEqual({
      file,
      legacy: false,
    });
    expect({
      file,
      legacy: source.includes("getLocalePrefixFromPath"),
    }).toEqual({ file, legacy: false });
    expect({ file, legacy: source.includes("/api/countries") }).toEqual({
      file,
      legacy: false,
    });
  }
});

test("every page route builds its meta from the matched routes", async () => {
  // A route that calls `getSeoMeta(data.seo)` with only its own payload drops
  // the root match, and with it the market's canonical URL and every hreflang
  // alternate — the page ships without alternates and no test would notice.
  const routes = new URL("../../app/routes/", import.meta.url);
  const offenders: string[] = [];

  const walk = async (dir: URL): Promise<void> => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      // Account pages are behind auth and marked noindex, so they carry a bare
      // title rather than market SEO.
      if (entry.name === "account") {
        continue;
      }
      const child = new URL(
        entry.isDirectory() ? `${entry.name}/` : entry.name,
        dir,
      );
      if (entry.isDirectory()) {
        await walk(child);
      } else if (entry.name.endsWith(".tsx")) {
        const source = await readFile(child, "utf8");
        if (!source.includes("export const meta")) {
          continue;
        }
        if (!source.includes("seoMetaFromMatches")) {
          offenders.push(child.pathname.slice(routes.pathname.length));
        }
      }
    }
  };
  await walk(routes);

  expect(offenders).toEqual([]);
});

test("never fabricates an alternate for a resource URL", () => {
  // A handle is per-market data: Shopify localizes it — which is why the
  // product, collection, blog, article and page routes all call
  // `redirectIfHandleIsLocalized` — and a resource can be unpublished in a
  // market entirely. Swapping the prefix would advertise a URL that 301s
  // elsewhere or 404s, telling a search engine a page exists where it does not.
  for (const path of [
    "/products/hoodie",
    "/collections/winter",
    "/blogs/news/post",
    "/pages/about",
    "/policies/refund-policy",
    "/hi-in/products/hoodie",
  ]) {
    expect({ path, alternates: alternateLinks(path, ORIGIN).length }).toEqual({
      path,
      alternates: 0,
    });
  }
});

test("still advertises markets for route-table paths", () => {
  // These exist in every market by construction, so the prefix swap is provable
  // and the markets must keep advertising each other.
  for (const path of ["/", "/search", "/collections", "/products"]) {
    expect({ path, alternates: alternateLinks(path, ORIGIN).length }).toEqual({
      path,
      alternates: SUPPORTED_LOCALES.length + 1,
    });
  }
});

test("never advertises a path the route table does not prove", () => {
  // Root SEO calls `alternateLinks` for every route, including the `*`
  // catch-all that serves Weaverse custom pages and unknown URLs. A negative
  // heuristic ("not a resource namespace") accepted all of them and published
  // fabricated localized URLs; only an exact allowlist is sound.
  for (const path of [
    // Weaverse custom pages: published per project, not proven per market.
    "/festive-wear",
    "/de-de/festive-wear",
    "/about",
    "/ar-ae/about",
    // Unknown / 404-like paths.
    "/foo/bar",
    "/hi-in/foo/bar",
    "/definitely-not-a-page",
    // Resource URLs: handles are localized and may be unpublished per market.
    "/products/hoodie",
    "/collections/winter",
    "/blogs/news/post",
    "/pages/about",
    "/policies/refund-policy",
    // Behind auth / noindex.
    "/account",
    "/account/orders",
    "/en-gb/account/orders",
  ]) {
    expect({ path, alternates: alternateLinks(path, ORIGIN).length }).toEqual({
      path,
      alternates: 0,
    });
  }
});

test("advertises every market for the route table's static paths", () => {
  // These are `route(...)`/`index(...)` entries with no dynamic segment under
  // the `:locale?` prefix, so they exist in every market by construction.
  for (const path of [
    "/",
    "/search",
    "/cart",
    "/collections",
    "/products",
    "/policies",
    // A localized request advertises the same set.
    "/de-de/search",
    "/ar-ae/collections",
    // Trailing slash and query are normalized away.
    "/search/",
    "/search?q=hat",
  ]) {
    expect({ path, alternates: alternateLinks(path, ORIGIN).length }).toEqual({
      path,
      alternates: SUPPORTED_LOCALES.length + 1,
    });
  }
});
