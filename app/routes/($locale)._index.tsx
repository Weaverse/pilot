import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { AnalyticsPageType, getSeoMeta } from "@shopify/hydrogen";
import { type LoaderFunctionArgs, defer } from "@shopify/remix-oxygen";
import type { PageType } from "@weaverse/hydrogen";

import { routeHeaders } from "~/data/cache";
import { SHOP_QUERY } from "~/data/queries";
import { seoPayload } from "~/lib/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  let { params, context } = args;
  let { pathPrefix } = context.storefront.i18n;
  let locale = pathPrefix.slice(1);
  let type: PageType = "INDEX";

  if (params.locale && params.locale.toLowerCase() !== locale) {
    // Update for Weaverse: if it not locale, it probably is a custom page handle
    type = "CUSTOM";
  }
  let weaverseData = await context.weaverse.loadPage({ type });
  if (!weaverseData?.page?.id || weaverseData.page.id.includes("fallback")) {
    throw new Response(null, { status: 404 });
  }

  let { shop } = await context.storefront.query(SHOP_QUERY);
  let seo = seoPayload.home();

  return defer({
    shop,
    weaverseData,
    analytics: {
      pageType: AnalyticsPageType.home,
    },
    seo,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};
export default function Homepage() {
  return <WeaverseContent />;
}
