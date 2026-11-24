import { expect, test } from "@playwright/test";
import { getSeoMeta } from "../../app/utils/seo-meta";
import { getWeaverseSeoMeta } from "@weaverse/hydrogen/react-router";
import type { MetaDescriptor } from "react-router";
import { withWeaverseSeo } from "../../app/utils/seo";

const MARKET_URL = "https://shop.test/de-de/about";

function canonicals(tags: MetaDescriptor[]): string[] {
  return tags
    .filter(
      (tag) =>
        "rel" in tag && tag.rel === "canonical" && "href" in tag && tag.href,
    )
    .map((tag) => String("href" in tag ? tag.href : ""));
}

test("a Weaverse page never adds a second canonical", () => {
  // The page's canonical is authored once and is market-neutral, so emitting it
  // beside the root's would publish two conflicting canonicals and let the
  // search engine pick. Each market must be its own canonical.
  const merged = withWeaverseSeo(
    getSeoMeta({ url: MARKET_URL }),
    getWeaverseSeoMeta({
      page: {
        seo: { title: "About", canonicalUrl: "https://shop.test/about" },
      },
    } as never),
  );

  expect(canonicals(merged)).toEqual([MARKET_URL]);
});

test("page content survives the canonical filter", () => {
  // Only the canonical is dropped; title, description and robots are page-level
  // content the merchant authored.
  const merged = withWeaverseSeo(
    getSeoMeta({ url: MARKET_URL }),
    getWeaverseSeoMeta({
      page: {
        seo: {
          title: "About us",
          description: "Who we are",
          canonicalUrl: "https://shop.test/about",
        },
      },
    } as never),
  );

  expect(merged.some((tag) => "title" in tag && tag.title === "About us")).toBe(
    true,
  );
  expect(
    merged.some(
      (tag) =>
        "name" in tag &&
        tag.name === "description" &&
        tag.content === "Who we are",
    ),
  ).toBe(true);
});

test("hreflang alternates are untouched by the filter", () => {
  // Dropping the duplicate canonical must not disturb the market advertising.
  const routeSeo = getSeoMeta({
    url: MARKET_URL,
    alternates: [
      { language: "en-US", url: "https://shop.test/about" },
      { language: "de-DE", url: MARKET_URL },
    ],
  });
  const merged = withWeaverseSeo(
    routeSeo,
    getWeaverseSeoMeta({
      page: { seo: { canonicalUrl: "https://shop.test/about" } },
    } as never),
  );
  const alternates = merged.filter(
    (tag) => "rel" in tag && tag.rel === "alternate",
  );

  expect(alternates).toHaveLength(2);
});

test("a page canonical is kept when the route has none", () => {
  // Without a root canonical there is nothing to conflict with, so the page's
  // own value is the only signal available.
  const merged = withWeaverseSeo(
    [],
    getWeaverseSeoMeta({
      page: { seo: { canonicalUrl: "https://shop.test/about" } },
    } as never),
  );

  expect(canonicals(merged)).toEqual(["https://shop.test/about"]);
});

test("Weaverse SEO replaces the root's tags instead of duplicating them", () => {
  // The root emits title, description, Open Graph and Twitter tags for every
  // page. Appending the page's own set would ship two of each, and the shop
  // name title would win over the Studio SEO title.
  const merged = withWeaverseSeo(
    getSeoMeta({
      title: "Shop",
      titleTemplate: "%s | Shop",
      description: "Shop description",
      url: MARKET_URL,
      alternates: [
        { language: "en-US", url: "https://shop.test/about" },
        { language: "de-DE", url: MARKET_URL },
      ],
      jsonLd: { "@context": "https://schema.org", "@type": "Organization" },
    }),
    getWeaverseSeoMeta({
      page: {
        seo: {
          title: "About us",
          description: "Who we are",
          canonicalUrl: "https://shop.test/about",
          openGraph: { title: "About us (OG)" },
          twitter: { title: "About us (Twitter)" },
        },
      },
    } as never),
  );
  function count(match: (tag: MetaDescriptor) => boolean): number {
    return merged.filter(match).length;
  }
  function meta(key: string) {
    return (tag: MetaDescriptor) =>
      ("name" in tag && tag.name === key) ||
      ("property" in tag && tag.property === key);
  }

  expect(merged.filter((tag) => "title" in tag)).toEqual([
    { title: "About us" },
  ]);
  for (let key of [
    "description",
    "og:title",
    "og:description",
    "twitter:title",
    "robots",
  ]) {
    expect(count(meta(key)), key).toBe(1);
  }
  expect(
    merged.find((tag) => "name" in tag && tag.name === "description"),
  ).toMatchObject({ content: "Who we are" });
  expect(canonicals(merged)).toEqual([MARKET_URL]);
  expect(count((tag) => "rel" in tag && tag.rel === "alternate")).toBe(2);
  expect(count((tag) => "script:ld+json" in tag)).toBe(1);
});
