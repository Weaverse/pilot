import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export let COLLECTION_CONTENT_FRAGMENT = `#graphql
fragment CollectionContent on Collection {
  id
  handle
  title
  descriptionHtml
  heading: metafield(namespace: "hero", key: "title") {
    value
  }
  byline: metafield(namespace: "hero", key: "byline") {
    value
  }
  cta: metafield(namespace: "hero", key: "cta") {
    value
  }
  spread: metafield(namespace: "hero", key: "spread") {
    reference {
      ...Media
    }
  }
  spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
    reference {
      ...Media
    }
  }
}
${MEDIA_FRAGMENT}
`;

export let HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
`;

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

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export let FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
` as const;
