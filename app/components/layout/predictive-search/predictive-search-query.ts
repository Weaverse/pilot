import {
  gql,
  type makePredictiveSearchQueries,
  type PredictiveSearchData,
  type StorefrontApi,
} from "@shopify/hydrogen";

/**
 * Fields Pilot's predictive search UI reads on top of Hydrogen's built-in ones
 * (id, title, handle, `trackingParameters`, first variant price...). Shared by
 * the `/api/predictive-search` server handlers and the client types.
 */
export const PREDICTIVE_SEARCH_FRAGMENTS = {
  product: gql(`
    fragment PredictiveSearchProductFragment on Product {
      vendor
      featuredImage {
        url
        altText
        width
        height
      }
      selectedOrFirstAvailableVariant(
        selectedOptions: []
        ignoreUnknownOptions: true
        caseInsensitiveMatch: true
      ) {
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  `),
} as const;

/**
 * Search settings, applied as the server handler defaults and sent by the
 * client store. They keep the pre-2026.10 results: articles, products and
 * query suggestions, 6 of each, unavailable products listed last (the
 * Storefront API default Pilot relied on; Hydrogen's handler defaults to HIDE).
 */
export const PREDICTIVE_SEARCH_SETTINGS = {
  limit: 6,
  limitScope: "EACH",
  types: ["ARTICLE", "PRODUCT", "QUERY"],
  unavailableProducts: "LAST",
} as const satisfies {
  limit: number;
  limitScope: "EACH" | "ALL";
  types: readonly ("ARTICLE" | "COLLECTION" | "PAGE" | "PRODUCT" | "QUERY")[];
  unavailableProducts: "HIDE" | "LAST" | "SHOW";
};

type PredictiveSearchQuery = ReturnType<
  typeof makePredictiveSearchQueries<{
    fragments: typeof PREDICTIVE_SEARCH_FRAGMENTS;
  }>
>["predictiveSearch"];

export type PredictiveSearchItems = NonNullable<
  StorefrontApi.ResultOf<PredictiveSearchQuery>["predictiveSearch"]
>;

/** The JSON `/api/predictive-search` answers with. */
export type PilotPredictiveSearchData =
  PredictiveSearchData<PredictiveSearchItems>;
