import { getSeoMeta, type SeoConfig } from "~/utils/seo-meta";
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
 * Identity of a descriptor that must appear at most once per document: the
 * `<title>`, a `<meta>` by its `name`/`property` (Weaverse emits `twitter:*` as
 * `name`, the root as `property`, so both share one key), or the canonical.
 * Everything else (hreflang alternates, JSON-LD) has no key and is kept.
 */
function descriptorKey(descriptor: MetaDescriptor): string | undefined {
  if (isCanonical(descriptor)) {
    return "canonical";
  }
  if ("title" in descriptor) {
    return "title";
  }
  if ("name" in descriptor) {
    return `meta:${descriptor.name}`;
  }
  if ("property" in descriptor) {
    return `meta:${descriptor.property}`;
  }
}

/**
 * Merges Weaverse page SEO into a route's meta, one tag per key.
 *
 * Weaverse descriptors (title, description, Open Graph, Twitter, robots)
 * replace the route's descriptors with the same key, so a custom page ships its
 * Studio SEO title instead of a second `<title>` that loses to the shop name.
 * The root's hreflang alternates and JSON-LD have no Weaverse counterpart and
 * are kept.
 *
 * The canonical is the exception: a Weaverse page's `canonicalUrl` is authored
 * once and is therefore market-neutral, while each market must be its own
 * canonical (the others are advertised via `hreflang`). So the route's
 * canonical wins, and the page's is used only when the route has none.
 */
export function withWeaverseSeo(
  routeSeo: MetaDescriptor[],
  weaverseSeo: MetaDescriptor[],
): MetaDescriptor[] {
  let pageSeo = routeSeo.some(isCanonical)
    ? weaverseSeo.filter((tag) => !isCanonical(tag))
    : weaverseSeo;
  let pageKeys = new Set(pageSeo.map(descriptorKey).filter(Boolean));

  return [
    ...routeSeo.filter((tag) => {
      let key = descriptorKey(tag);
      return !(key && pageKeys.has(key));
    }),
    ...pageSeo,
  ];
}
