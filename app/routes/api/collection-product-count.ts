import type { LoaderFunctionArgs } from "react-router";

const MAX_PER_PAGE = 250;
const MAX_REQUESTS = 8;
const MAX_COUNT = MAX_PER_PAGE * MAX_REQUESTS;

type CountQuery = {
  collection: {
    products: {
      nodes: { id: string }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
};

const COLLECTION_COUNT_QUERY = `#graphql
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
` as const;

export async function loader({
  params,
  context: { storefront },
}: LoaderFunctionArgs) {
  let handle = params.handle;
  if (!handle) {
    return Response.json({ count: 0 }, { status: 400 });
  }

  let { country, language } = storefront.i18n;
  let totalCount = 0;
  let after: string | null = null;

  for (let i = 0; i < MAX_REQUESTS; i += 1) {
    let { collection } = await storefront.query<CountQuery>(
      COLLECTION_COUNT_QUERY,
      {
        variables: { country, language, handle, first: MAX_PER_PAGE, after },
        cache: storefront.CacheLong(),
      },
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
