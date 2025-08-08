import type { MappedProductOptions, Storefront } from "@shopify/hydrogen";
import type { MoneyV2 } from "@shopify/hydrogen/storefront-api-types";
import type { ProductRecommendationsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/locale";
import { maybeFilterOutCombinedListingsQuery } from "~/utils/combined-listings";

export function isNewArrival(date: string, daysOld = 30) {
  return (
    new Date(date).valueOf() >
    new Date().setDate(new Date().getDate() - daysOld).valueOf()
  );
}

export function isDiscounted(price: MoneyV2, compareAtPrice: MoneyV2) {
  if (compareAtPrice?.amount > price?.amount) {
    return true;
  }
  return false;
}

export async function getRecommendedProducts(
  storefront: Storefront<I18nLocale>,
  productId: string,
) {
  const products = await storefront.query<ProductRecommendationsQuery>(
    RECOMMENDED_PRODUCTS_QUERY,
    {
      variables: {
        productId,
        count: 12,
        query: maybeFilterOutCombinedListingsQuery,
      },
    },
  );

  invariant(products, "No data returned from Shopify API");

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

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
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
  ${PRODUCT_CARD_FRAGMENT}
` as const;

export function hasOnlyDefaultVariant(
  productOptions: MappedProductOptions[] = [],
) {
  if (productOptions.length === 1) {
    const option = productOptions[0];
    if (option.name === "Title" && option.optionValues.length === 1) {
      const optionValue = option.optionValues[0];
      return optionValue.name === "Default Title";
    }
  }
  return false;
}
