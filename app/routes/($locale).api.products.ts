import { flattenConnection } from "@shopify/hydrogen";
import type { ProductSortKeys } from "@shopify/hydrogen/storefront-api-types";
import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import type { ApiAllProductsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";

/**
 * Fetch a given set of products from the storefront API
 * @param count
 * @param query
 * @param reverse
 * @param sortKey
 * @returns Product[]
 * @see https://shopify.dev/api/storefront/current/queries/products
 */
export async function loader({
  request,
  context: { storefront },
}: LoaderFunctionArgs) {
  let url = new URL(request.url);
  let searchParams = new URLSearchParams(url.search);
  let query = searchParams.get("query") ?? "";
  let sortKey =
    (searchParams.get("sortKey") as null | ProductSortKeys) ?? "BEST_SELLING";
  let reverse = false;

  try {
    let _reverse = searchParams.get("reverse");
    if (_reverse === "true") {
      reverse = true;
    }
  } catch (_) {
    // noop
  }

  let count = 4;
  try {
    let _count = searchParams.get("count");
    if (typeof _count === "string") {
      count = Number.parseInt(_count);
    }
  } catch (_) {
    // noop
  }

  let { products } = await storefront.query<ApiAllProductsQuery>(
    API_ALL_PRODUCTS_QUERY,
    {
      variables: {
        count,
        query,
        reverse,
        sortKey,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheLong(),
    },
  );

  invariant(products, "No data returned from top products query");

  return json({ products: flattenConnection(products) });
}

const API_ALL_PRODUCTS_QUERY = `#graphql
  query ApiAllProducts(
    $query: String
    $count: Int
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $count, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
