import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import type { FeaturedItemsQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import {
  FEATURED_COLLECTION_FRAGMENT,
  PRODUCT_CARD_FRAGMENT,
} from "~/graphql/fragments";

export async function loader({ context: { storefront } }: LoaderFunctionArgs) {
  return json(await getFeaturedData(storefront));
}

export async function getFeaturedData(
  storefront: LoaderFunctionArgs["context"]["storefront"],
  variables: { pageBy?: number } = {},
) {
  let data = await storefront.query<FeaturedItemsQuery>(FEATURED_ITEMS_QUERY, {
    variables: {
      pageBy: 12,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
      ...variables,
    },
  });

  invariant(data, "No featured items data returned from Shopify API");

  return data;
}

export type FeaturedData = Awaited<ReturnType<typeof getFeaturedData>>;

const FEATURED_ITEMS_QUERY = `#graphql
  query FeaturedItems(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int = 12
  ) @inContext(country: $country, language: $language) {
    featuredCollections: collections(first: 3, sortKey: UPDATED_AT) {
      nodes {
        ...FeaturedCollectionDetails
      }
    }
    featuredProducts: products(first: $pageBy) {
      nodes {
        ...ProductCard
      }
    }
  }

  ${PRODUCT_CARD_FRAGMENT}
  ${FEATURED_COLLECTION_FRAGMENT}
` as const;
