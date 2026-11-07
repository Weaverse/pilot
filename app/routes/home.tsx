import { gql } from "@shopify/hydrogen";
import {
  getWeaverseSeoMeta,
  type PageType,
} from "@weaverse/hydrogen/react-router";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { seoPayload } from "~/.server/seo";
import { CACHE_LONG, routeHeaders } from "~/utils/cache";
import { seoMetaFromMatches, withWeaverseSeo } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const { params, context } = args;
  const { pathPrefix } = context.storefront.i18n;
  const locale = pathPrefix?.slice(1) || "";
  let type: PageType = "INDEX";

  if (params.locale && params.locale.toLowerCase() !== locale) {
    // Update for Weaverse: if it not locale, it probably is a custom page handle
    type = "CUSTOM";
  }

  // Load async data in parallel for better performance
  const [weaverseData, { shop }] = await Promise.all([
    context.weaverse.loadPage({ type }),
    // Shop name/description only — effectively static content.
    context.storefront
      .graphql(SHOP_QUERY, { cache: CACHE_LONG })
      .then(unwrapStorefront),
  ]);

  // Check weaverseData after parallel loading
  validateWeaverseData(weaverseData);

  // INDEX uses the code-defined homepage SEO (now reflecting the shop name);
  // CUSTOM pages (root-level Weaverse handles served by this route) get their
  // SEO from Weaverse via getWeaverseSeoMeta in the meta export below.
  const seo = type === "INDEX" ? seoPayload.home({ shop }) : null;

  return {
    shop,
    weaverseData,
    analytics: {
      pageType: "home",
    },
    seo,
  };
}

export const meta = ({ data, matches }: MetaArgs<typeof loader>) => {
  // INDEX (real homepage) keeps the code-defined SEO — no Weaverse override.
  // CUSTOM pages served by this route append theirs from Weaverse. Either way
  // the matched payloads carry the market's canonical + hreflang alternates.
  const routeSeo = seoMetaFromMatches(matches);
  return data?.seo
    ? routeSeo
    : withWeaverseSeo(routeSeo, getWeaverseSeoMeta(data?.weaverseData));
};
export default function Homepage() {
  return <WeaverseContent />;
}

const SHOP_QUERY = gql(`
  query shop($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      name
      description
    }
  }
`);
