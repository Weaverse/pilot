import { gql } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import { CACHE_LONG } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const MAX_PER_PAGE = 250;
const MAX_REQUESTS = 8;
const MAX_COUNT = MAX_PER_PAGE * MAX_REQUESTS;

const COLLECTION_COUNT_QUERY = gql(`
  query collectionCount(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $first: Int!
    $after: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        nodes {
          id
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`);

export async function loader({
  params,
  context: { storefront },
}: LoaderFunctionArgs) {
  let handle = params.handle;
  if (!handle) {
    return Response.json({ count: 0 }, { status: 400 });
  }

  let totalCount = 0;
  let after: string | null = null;

  for (let i = 0; i < MAX_REQUESTS; i += 1) {
    let { collection } = unwrapStorefront(
      await storefront.graphql(COLLECTION_COUNT_QUERY, {
        variables: { handle, first: MAX_PER_PAGE, after },
        cache: CACHE_LONG,
      }),
    );
    if (!collection) {
      return Response.json({ count: totalCount });
    }

    let { nodes, pageInfo } = collection.products;
    totalCount += nodes.length;

    if (!pageInfo.hasNextPage) {
      return Response.json({ count: totalCount });
    }
    after = pageInfo.endCursor;
  }

  return Response.json({ count: `${MAX_COUNT}+` });
}
