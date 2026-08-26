import { getSeoMeta, type SeoConfig } from "@shopify/hydrogen";
import type { MetaDescriptor } from "react-router";

type SeoMatch = { data?: unknown };

/** A `<link rel="canonical">` descriptor, as `getSeoMeta` emits it. */
function isCanonical(descriptor: MetaDescriptor): boolean {
  return (
    "rel" in descriptor &&
    descriptor.rel === "canonical" &&
    "tagName" in descriptor &&
    descriptor.tagName === "link"
  );
}

/**
 * Builds a route's meta from every matched route's `seo` payload, nearest match
 * winning.
 *
 * Routes must not call `getSeoMeta(data.seo)` with their own payload alone: the
 * market's canonical URL and its `hreflang` alternates come from the root
 * match, so a route-only payload silently drops them and the page ships without
 * alternates. Sharing one helper keeps that invariant in one place instead of
 * relying on ten routes to remember it.
 */
export function seoMetaFromMatches(matches: SeoMatch[]): MetaDescriptor[] {
  return getSeoMeta(
    ...matches
      .map((match) => (match.data as { seo?: SeoConfig } | undefined)?.seo)
      .filter(Boolean),
  );
}

/**
 * Merges Weaverse page SEO into a route's meta, keeping exactly one canonical.
 *
 * A Weaverse page can carry its own `canonicalUrl`, which is authored once and
 * is therefore market-neutral. Emitting it alongside the root's canonical
 * publishes two conflicting `<link rel="canonical">` tags on the same document
 * — search engines pick one arbitrarily, and the market URL is the one that
 * must win, since each market is its own canonical with the others advertised
 * via `hreflang`.
 *
 * Every other Weaverse descriptor (title, description, Open Graph, robots,
 * JSON-LD) is page-level content and passes through untouched.
 */
export function withWeaverseSeo(
  routeSeo: MetaDescriptor[],
  weaverseSeo: MetaDescriptor[],
): MetaDescriptor[] {
  if (!routeSeo.some(isCanonical)) {
    return [...routeSeo, ...weaverseSeo];
  }

  return [...routeSeo, ...weaverseSeo.filter((tag) => !isCanonical(tag))];
}
