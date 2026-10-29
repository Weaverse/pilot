import {
  type CachingStrategy,
  gql,
  type StorefrontApi,
  type StorefrontClient,
} from "@shopify/hydrogen";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

/**
 * Best-selling products, used as recommendations (search no-results, cart,
 * account, 404, `/api/featured-products`) and by the featured-products section.
 * Accepts both `context.storefront` and `weaverse.storefront`.
 */
export async function getFeaturedProducts(
  storefront: StorefrontClient<{ cache?: CachingStrategy }>,
) {
  return unwrapStorefront(
    await storefront.graphql(FEATURED_PRODUCTS_QUERY, {
      variables: { pageBy: 16 },
      cache: CACHE_DEFAULT,
    }),
  );
}

export type FeaturedProductsData = Awaited<
  ReturnType<typeof getFeaturedProducts>
>;

export const FEATURED_PRODUCTS_QUERY = gql(
  `
  query featuredProducts(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int = 16
  ) @inContext(country: $country, language: $language) {
    featuredProducts: products(first: $pageBy, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);

export type FeaturedProductsQuery = StorefrontApi.ResultOf<
  typeof FEATURED_PRODUCTS_QUERY
>;
