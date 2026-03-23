import type { SeoConfig } from "@shopify/hydrogen";
import { getPaginationVariables, getSeoMeta } from "@shopify/hydrogen";
import type { ProductSortKeys } from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import invariant from "tiny-invariant";
import { seoPayload } from "~/.server/seo";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { SortParam } from "~/types/others";
import { routeHeaders } from "~/utils/cache";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({
  request,
  context: { storefront, weaverse },
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const { sortKey, reverse } = getSortValuesFromParam(
    searchParams.get("sort") as SortParam,
  );

  // Load products data and weaverseData in parallel
  const [data, weaverseData] = await Promise.all([
    storefront.query(ALL_PRODUCTS_QUERY, {
      variables: {
        ...getPaginationVariables(request, { pageBy: 16 }),
        country: storefront.i18n.country,
        language: storefront.i18n.language,
        sortKey,
        reverse,
      },
    }),
    weaverse.loadPage({ type: "ALL_PRODUCTS" }),
  ]);

  invariant(data, "No data returned from Shopify API");

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: "all-products",
      title: "All Products",
      handle: "products",
      description: "All the store products",
      seo: {
        title: "All Products",
        description: "All the store products",
      },
      products: data.products,
    },
  });

  return {
    products: data.products,
    seo,
    weaverseData,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return getSeoMeta(data.seo as SeoConfig);
};
export default function AllProducts() {
  return <WeaverseContent />;
}

const ALL_PRODUCTS_QUERY = `#graphql
  query allProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case "price-high-low":
      return { sortKey: "PRICE", reverse: true };
    case "price-low-high":
      return { sortKey: "PRICE", reverse: false };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    default:
      return { sortKey: "RELEVANCE", reverse: false };
  }
}
