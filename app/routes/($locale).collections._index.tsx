import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getPaginationVariables, getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import { routeHeaders } from "~/data/cache";
import { COLLECTIONS_QUERY } from "~/data/queries";
import { PAGINATION_SIZE } from "~/lib/const";
import { seoPayload } from "~/lib/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export let loader = async (args: RouteLoaderArgs) => {
  let {
    request,
    context: { storefront, weaverse },
  } = args;
  let variables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });
  let { collections } = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  let seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return json({
    collections,
    seo,
    weaverseData: await weaverse.loadPage({
      type: "COLLECTION_LIST",
    }),
  });
};

export let meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data?.seo as SeoConfig);
};

export default function Collections() {
  return <WeaverseContent />;
}
