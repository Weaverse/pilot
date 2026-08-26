import { getSeoMeta, type SeoConfig } from "@shopify/hydrogen";
import type { MetaDescriptor } from "react-router";

type SeoMatch = { data?: unknown };

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
