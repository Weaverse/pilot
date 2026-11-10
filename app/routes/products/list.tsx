import {
  gql,
  type ProductCollectionSortKeys,
  parseCollectionParams,
  type StorefrontApi,
} from "@shopify/hydrogen";
import type { ProductSortKeys } from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { seoPayload } from "~/.server/seo";
import { CollectionBrowseProvider } from "~/components/product-grid/collection-browse";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { getLegacyBrowseRedirect } from "~/routes/collections/utils";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { getPaginationVariables } from "~/utils/pagination";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({
  request,
  context: { storefront, weaverse },
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const legacyRedirect = getLegacyBrowseRedirect(url);
  if (legacyRedirect) {
    throw redirect(legacyRedirect, 301);
  }
  const browse = parseCollectionParams(url.searchParams);

  // Load products data and weaverseData in parallel
  const [data, weaverseData] = await Promise.all([
    storefront
      .graphql(ALL_PRODUCTS_QUERY, {
        variables: {
          ...getPaginationVariables(request, { pageBy: 16 }),
          sortKey: toProductSortKey(browse.sortKey),
          reverse: browse.reverse,
        },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront),
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
    dataSearch: url.search,
    seo,
    weaverseData,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};
export default function AllProducts() {
  const { dataSearch } = useLoaderData<typeof loader>();
  return (
    <CollectionBrowseProvider handle="all-products" dataSearch={dataSearch}>
      <WeaverseContent />
    </CollectionBrowseProvider>
  );
}

const ALL_PRODUCTS_QUERY = gql(
  `
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
`,
  [PRODUCT_CARD_FRAGMENT],
);

export type AllProductsQuery = StorefrontApi.ResultOf<
  typeof ALL_PRODUCTS_QUERY
>;

/** The `sort_by` sort key on the shop-wide `products` connection. */
function toProductSortKey(
  sortKey: ProductCollectionSortKeys | undefined,
): ProductSortKeys {
  switch (sortKey) {
    case "PRICE":
    case "BEST_SELLING":
    case "TITLE":
      return sortKey;
    case "CREATED":
      return "CREATED_AT";
    default:
      return "RELEVANCE";
  }
}
