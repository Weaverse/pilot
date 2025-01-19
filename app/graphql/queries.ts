import {
  MEDIA_FRAGMENT,
  PRODUCT_OPTION_FRAGMENT,
  PRODUCT_VARIANT_FRAGMENT,
} from "~/graphql/fragments";

export const PRODUCT_QUERY = `#graphql
  query product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      publishedAt
      descriptionHtml
      description
      summary: description(truncateAt: 200)
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      badges: metafields(identifiers: [
        { namespace: "custom", key: "best_seller" }
      ]) {
        key
        namespace
        value
      }
      options {
        ...ProductOption
      }
      selectedVariant: variantBySelectedOptions(
        selectedOptions: $selectedOptions, 
        ignoreUnknownOptions: true, 
        caseInsensitiveMatch: true
      ) {
        ...ProductVariant
      }
      media(first: 50) {
        nodes {
          ...Media
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      primaryDomain {
        url
      }
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
  ${MEDIA_FRAGMENT}
  ${PRODUCT_OPTION_FRAGMENT}
` as const;

export const VARIANTS_QUERY = `#graphql
  query variants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 250) {
        nodes {
          ...ProductVariant
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;
