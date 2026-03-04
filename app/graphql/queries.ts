import { MEDIA_FRAGMENT, PRODUCT_OPTION_FRAGMENT } from "~/graphql/fragments";

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
      encodedVariantExistence
      encodedVariantAvailability
      tags
      featuredImage {
        id
        url
        altText
      }
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
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariant
      }
      adjacentVariants(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
      # Check if the product is a bundle
      isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {
        ...on ProductVariant {
          requiresComponents
          components(first: 100) {
             nodes {
                productVariant {
                  ...ProductVariant
                }
                quantity
             }
          }
          groupedBy(first: 100) {
            nodes {
                id
              }
            }
          }
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
