import { gql } from "@shopify/hydrogen";
import type { Storefront } from "~/.server/storefront";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import { CACHE_DEFAULT } from "~/utils/cache";
import { unwrapStorefront } from "~/utils/storefront";

export async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = unwrapStorefront(
    await storefront.graphql(RECOMMENDED_PRODUCTS_QUERY, {
      variables: {
        productId,
        count: 12,
      },
      cache: CACHE_DEFAULT,
    }),
  );

  const mergedProducts = (products.recommended ?? [])
    .concat(products.additional.nodes)
    .filter((prod, idx, arr) => {
      return arr.findIndex(({ id }) => id === prod.id) === idx;
    });

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return { nodes: mergedProducts };
}

const RECOMMENDED_PRODUCTS_QUERY = gql(
  `
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
    $query: String
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING, query: $query) {
      nodes {
        ...ProductCard
      }
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);

/**
 * Products that go with this one: Shopify's complementary recommendations,
 * set per product in the Search & Discovery app. Empty when none are set.
 */
export async function getComplementaryProducts(
  storefront: Storefront,
  productId: string,
) {
  const { complementary } = unwrapStorefront(
    await storefront.graphql(COMPLEMENTARY_PRODUCTS_QUERY, {
      variables: { productId },
      cache: CACHE_DEFAULT,
    }),
  );
  return { nodes: complementary ?? [] };
}

const COMPLEMENTARY_PRODUCTS_QUERY = gql(
  `
  query complementaryProducts(
    $productId: ID!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    complementary: productRecommendations(
      productId: $productId
      intent: COMPLEMENTARY
    ) {
      ...ProductCard
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);
