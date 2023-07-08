import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export let HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
