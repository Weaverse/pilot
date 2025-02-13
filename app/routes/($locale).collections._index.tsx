import type { MetaFunction } from "@remix-run/react";
import type { SeoConfig } from "@shopify/hydrogen";
import { getPaginationVariables, getSeoMeta } from "@shopify/hydrogen";
import { json } from "@shopify/remix-oxygen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen";
import type { CollectionsQuery } from "storefront-api.generated";
import { routeHeaders } from "~/utils/cache";
import { PAGINATION_SIZE } from "~/utils/const";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export let loader = async (args: RouteLoaderArgs) => {
  let {
    request,
    context: { weaverse },
  } = args;
  let storefront = weaverse.storefront;
  let variables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });
  let { collections } = await storefront.query<CollectionsQuery>(
    COLLECTIONS_QUERY,
    {
      variables: {
        ...variables,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    },
  );

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

const COLLECTIONS_QUERY = `#graphql
  query collections(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        description
        handle
        seo {
          description
          title
        }
        image {
          id
          url
          width
          height
          altText
        }
        products(first: 1) {
          nodes {
            id
            title
            handle
            media(first: 1) {
              nodes {
                previewImage {
                  id
                  url
                  width
                  height
                  altText
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
` as const;
