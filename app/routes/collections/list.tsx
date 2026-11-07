import { gql, type StorefrontApi } from "@shopify/hydrogen";
import type { RouteLoaderArgs } from "@weaverse/hydrogen/react-router";
import type { MetaArgs } from "react-router";
import { seoPayload } from "~/.server/seo";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { getPaginationVariables } from "~/utils/pagination";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export const loader = async (args: RouteLoaderArgs) => {
  const {
    request,
    context: { weaverse },
  } = args;
  const storefront = weaverse.storefront;
  // Load collections data and weaverseData in parallel
  const [{ collections }, weaverseData] = await Promise.all([
    storefront
      .graphql(COLLECTIONS_QUERY, {
        variables: getPaginationVariables(request, { pageBy: 16 }),
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
    weaverse.loadPage({
      type: "COLLECTION_LIST",
    }),
  ]);

  const seo = seoPayload.listCollections({
    collections,
    url: request.url,
  });

  return {
    collections,
    seo,
    weaverseData,
  };
};

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export default function Collections() {
  return <WeaverseContent />;
}

const COLLECTIONS_QUERY = gql(`
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
`);

export type CollectionsQuery = StorefrontApi.ResultOf<typeof COLLECTIONS_QUERY>;
