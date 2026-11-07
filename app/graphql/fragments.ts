import { gql, type StorefrontApi } from "@shopify/hydrogen";

export const PRODUCT_VARIANT_FRAGMENT = gql(`
  fragment ProductVariant on ProductVariant {
    id
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    requiresComponents
    components(first: 10) {
      nodes {
        productVariant {
          id
          title
          product {
            handle
          }
        }
        quantity
      }
    }
    groupedBy(first: 10) {
      nodes {
        id
        title
        product {
          handle
        }
      }
    }
  }
`);

export const PRODUCT_OPTION_FRAGMENT = gql(
  `
  fragment ProductOption on ProductOption {
    name
    optionValues {
      name
      firstSelectableVariant {
        ...ProductVariant
      }
      swatch {
        color
        image {
          previewImage {
            url
            altText
          }
        }
      }
    }
  }
`,
  [PRODUCT_VARIANT_FRAGMENT],
);

export const PRODUCT_CARD_FRAGMENT = gql(
  `
  fragment ProductCard on Product {
    id
    title
    publishedAt
    handle
    vendor
    images(first: 50) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      ...ProductOption
    }
    badges: metafields(identifiers: [
      { namespace: "custom", key: "best_seller" }
    ]) {
      key
      namespace
      value
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    # Check if the product is a bundle
    isBundle: selectedOrFirstAvailableVariant(ignoreUnknownOptions: true, selectedOptions: { name: "", value: ""}) {
      ...on ProductVariant {
        requiresComponents
      }
    }
  }
`,
  [PRODUCT_OPTION_FRAGMENT],
);

export const MEDIA_FRAGMENT = gql(`
  fragment Media on Media {
    __typename
    mediaContentType
    alt
    previewImage {
      id
      url
      altText
      width
      height
    }
    ... on MediaImage {
      id
      image {
        id
        url
        width
        height
      }
    }
    ... on Video {
      id
      sources {
        mimeType
        url
      }
    }
    ... on Model3d {
      id
      sources {
        mimeType
        url
      }
    }
    ... on ExternalVideo {
      id
      embedUrl
      host
    }
  }
`);

// Result types for the shared fragments. `gql()` returns a branded query
// string, so a fragment's data type is read off a query that spreads it.
const PRODUCT_VARIANT_SHAPE = gql(
  `query ProductVariantShape { product(handle: "") { selectedOrFirstAvailableVariant { ...ProductVariant } } }`,
  [PRODUCT_VARIANT_FRAGMENT],
);
const PRODUCT_CARD_SHAPE = gql(
  `query ProductCardShape { products(first: 1) { nodes { ...ProductCard } } }`,
  [PRODUCT_CARD_FRAGMENT],
);
const PRODUCT_OPTION_SHAPE = gql(
  `query ProductOptionShape { product(handle: "") { options { ...ProductOption } } }`,
  [PRODUCT_OPTION_FRAGMENT],
);
const MEDIA_SHAPE = gql(
  `query MediaShape { product(handle: "") { media(first: 1) { nodes { ...Media } } } }`,
  [MEDIA_FRAGMENT],
);

export type ProductVariantFragment = NonNullable<
  NonNullable<
    StorefrontApi.ResultOf<typeof PRODUCT_VARIANT_SHAPE>["product"]
  >["selectedOrFirstAvailableVariant"]
>;
export type ProductCardFragment = StorefrontApi.ResultOf<
  typeof PRODUCT_CARD_SHAPE
>["products"]["nodes"][number];
export type ProductOptionFragment = NonNullable<
  StorefrontApi.ResultOf<typeof PRODUCT_OPTION_SHAPE>["product"]
>["options"][number];
export type MediaFragment = NonNullable<
  StorefrontApi.ResultOf<typeof MEDIA_SHAPE>["product"]
>["media"]["nodes"][number];
