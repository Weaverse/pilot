import { gql } from "@shopify/hydrogen";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { CACHE_SHORT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

const MAX_IDS = 12;

/**
 * Product cards for the recently viewed section, in the market of the
 * (prefixed) request path. `?ids=` is a comma-separated list of product GIDs.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  let ids = (new URL(request.url).searchParams.get("ids") ?? "")
    .split(",")
    .filter((id) => id.startsWith("gid://shopify/Product/"))
    .slice(0, MAX_IDS);

  if (!ids.length) {
    return data({ products: [] });
  }

  let { nodes } = unwrapStorefront(
    await context.storefront.graphql(RECENTLY_VIEWED_QUERY, {
      variables: { ids },
      cache: CACHE_SHORT,
    }),
  );
  // `nodes` keeps the order of `ids` and is null for deleted products.
  let products = nodes.filter((node) => node && "handle" in node);
  return data({ products });
}

const RECENTLY_VIEWED_QUERY = gql(
  `
  query recentlyViewed($country: CountryCode, $language: LanguageCode, $ids: [ID!]!)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      ... on Product {
        ...ProductCard
      }
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);
