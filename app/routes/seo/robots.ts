import { gql } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import { CACHE_DEFAULT } from "~/utils/cache";
import { SUPPORTED_LOCALES } from "~/utils/locale";
import { parseGid } from "~/utils/shopify";
import { unwrapStorefront } from "~/utils/storefront";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const { shop } = unwrapStorefront(
    await context.storefront.graphql(ROBOTS_QUERY, { cache: CACHE_DEFAULT }),
  );
  const shopId = parseGid(shop.id).id;
  const body = robotsTxtData({ url: url.origin, shopId });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, max-age=${60 * 60 * 24}`,
    },
  });
}

// Market prefixes (`/fr-ca`). Page rules are repeated per prefix instead of
// a wildcard prefix rule (`/*/cart`): `*` matches across slashes, so that
// would also block `/products/cart-organizer`.
const MARKET_PREFIXES = SUPPORTED_LOCALES.map((l) => l.pathPrefix).filter(
  Boolean,
);

/** `Disallow` lines for `paths` at the root and under every market prefix. */
function marketDisallows(paths: string[]) {
  return ["", ...MARKET_PREFIXES]
    .flatMap((prefix) => paths.map((path) => `Disallow: ${prefix}${path}`))
    .join("\n");
}

export function robotsTxtData({
  url,
  shopId,
}: {
  shopId?: string;
  url?: string;
}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
${generalDisallowRules({ sitemapUrl, shopId })}

# Google AdsBot ignores the "*" group and follows only groups that name it.
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /buy/
Disallow: /carts
Disallow: /orders
${marketDisallows(["/cart", "/account", "/search"])}
${shopId ? `Disallow: /${shopId}/checkouts` : ""}
${shopId ? `Disallow: /${shopId}/orders` : ""}
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
${generalDisallowRules({ sitemapUrl, shopId })}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
${generalDisallowRules({ sitemapUrl, shopId })}

User-agent: MJ12bot
Crawl-Delay: 10

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 */
function generalDisallowRules({
  shopId,
  sitemapUrl,
}: {
  shopId?: string;
  sitemapUrl?: string;
}) {
  return `Disallow: /admin
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
Disallow: /buy/
Disallow: /__shopify
${marketDisallows(["/cart", "/account", "/search", "/api/"])}
${shopId ? `Disallow: /${shopId}/checkouts` : ""}
${shopId ? `Disallow: /${shopId}/orders` : ""}
Disallow: /carts
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: */collections/*filter*&*filter*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*
Disallow: /policies/
Disallow: /*/*?*ls=*&ls=*
Disallow: /*/*?*ls%3D*%3Fls%3D*
Disallow: /*/*?*ls%3d*%3fls%3d*
Disallow: /apple-app-site-association
Disallow: /.well-known/shopify/monorail
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ""}`;
}

const ROBOTS_QUERY = gql(`
  query StoreRobots($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      id
    }
  }
`);
