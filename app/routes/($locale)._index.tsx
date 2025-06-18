import type { SeoConfig } from "@shopify/hydrogen";
import { AnalyticsPageType, getSeoMeta } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type { PageType } from "@weaverse/hydrogen";
import type { MetaFunction } from "react-router";
import type { ShopQuery } from "storefront-api.generated";
import { routeHeaders } from "~/utils/cache";
import { seoPayload } from "~/utils/seo.server";
import { validateWeaverseData, WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const { params, context } = args;
  const { pathPrefix } = context.storefront.i18n;
  const locale = pathPrefix.slice(1);
  let type: PageType = "INDEX";

  if (params.locale && params.locale.toLowerCase() !== locale) {
    // Update for Weaverse: if it not locale, it probably is a custom page handle
    type = "CUSTOM";
  }

  // Calculate seo payload synchronously
  const seo = seoPayload.home();

  // Load async data in parallel for better performance
  const [weaverseData, { shop }] = await Promise.all([
    context.weaverse.loadPage({ type }),
    context.storefront.query<ShopQuery>(SHOP_QUERY),
  ]);

  // Check weaverseData after parallel loading
  validateWeaverseData(weaverseData);

  return {
    shop,
    weaverseData,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    seo,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};
export default function Homepage() {
  return <WeaverseContent />;
}

const SHOP_QUERY = `#graphql
  query shop($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      name
      description
    }
  }
` as const;
