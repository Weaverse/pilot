import type { LoaderFunctionArgs } from "react-router";
import type { FeaturedProductsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";

export async function getFeaturedProducts(
  storefront: LoaderFunctionArgs["context"]["storefront"],
) {
  const featuredProductsData = await storefront.query<FeaturedProductsQuery>(
    FEATURED_PRODUCTS_QUERY,
    {
      variables: {
        pageBy: 16,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    },
  );

  invariant(
    featuredProductsData,
    "No featured products data returned from Shopify API",
  );

  return featuredProductsData;
}

export type FeaturedProductsData = Awaited<
  ReturnType<typeof getFeaturedProducts>
>;

export const FEATURED_PRODUCTS_QUERY = `#graphql
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

  ${PRODUCT_CARD_FRAGMENT}
` as const;
