import { usePredictiveSearch as useHydrogenPredictiveSearch } from "@shopify/hydrogen/react";
import { useParams } from "react-router";
import type { PilotPredictiveSearchData } from "~/components/layout/predictive-search/predictive-search-query";
import type {
  NormalizedPredictiveSearch,
  NormalizedPredictiveSearchResults,
} from "~/types/predictive-search";

export const NO_PREDICTIVE_SEARCH_RESULTS: NormalizedPredictiveSearchResults = [
  { type: "queries", items: [] },
  { type: "products", items: [] },
  { type: "collections", items: [] },
  { type: "pages", items: [] },
  { type: "articles", items: [] },
];

/**
 * Predictive search results from the nearest `PredictiveSearchProvider`
 * (Hydrogen's store, fed by `/api/predictive-search`), normalized to the shape
 * Pilot's results UI renders, with localized, tracking-carrying result URLs.
 */
export function usePredictiveSearch(): NormalizedPredictiveSearch & {
  /** The term the current results are for (previous results stay while a new search loads). */
  searchTerm: string;
} {
  const { result } = useHydrogenPredictiveSearch<PilotPredictiveSearchData>();
  const { locale } = useParams();
  const localePrefix = locale ? `/${locale}` : "";

  return {
    ...normalizePredictiveSearchResults(result, localePrefix),
    searchTerm: result.term,
  };
}

function withTrackingParams(
  trackingParameters: string | null | undefined,
  params?: string,
) {
  const query = [trackingParameters, params].filter(Boolean).join("&");
  return query ? `?${query}` : "";
}

/**
 * Normalize results and apply tracking query parameters to each result url
 */
function normalizePredictiveSearchResults(
  { items, total }: PilotPredictiveSearchData,
  localePrefix: string,
): NormalizedPredictiveSearch {
  if (!total) {
    return { results: NO_PREDICTIVE_SEARCH_RESULTS, totalResults: 0 };
  }
  const results: NormalizedPredictiveSearchResults = [];

  if (items.queries.length) {
    results.push({
      type: "queries",
      // Suggestions link to the search page (see `PredictiveSearchResult`).
      items: items.queries.map((query) => ({
        __typename: query.__typename,
        handle: "",
        id: query.text,
        image: undefined,
        title: query.text,
        styledTitle: query.styledText,
      })),
    });
  }

  if (items.products.length) {
    results.push({
      type: "products",
      items: items.products.map((product) => {
        const selectedVariant = product.selectedOrFirstAvailableVariant;
        // Open the product on its first available variant's options.
        const firstVariantParams = new URLSearchParams(
          (selectedVariant?.selectedOptions || []).map(({ name, value }) => [
            name,
            value,
          ]),
        );
        return {
          __typename: product.__typename,
          handle: product.handle,
          id: product.id,
          image: product.featuredImage,
          title: product.title,
          vendor: product.vendor,
          url: `${localePrefix}/products/${product.handle}${withTrackingParams(
            product.trackingParameters,
            firstVariantParams.toString(),
          )}`,
          price: selectedVariant?.price,
          compareAtPrice: selectedVariant?.compareAtPrice,
        };
      }),
    });
  }

  if (items.collections.length) {
    results.push({
      type: "collections",
      items: items.collections.map((collection) => ({
        __typename: collection.__typename,
        handle: collection.handle,
        id: collection.id,
        image: collection.image,
        title: collection.title,
        url: `${localePrefix}/collections/${collection.handle}${withTrackingParams(collection.trackingParameters)}`,
      })),
    });
  }

  if (items.pages.length) {
    results.push({
      type: "pages",
      items: items.pages.map((page) => ({
        __typename: page.__typename,
        handle: page.handle,
        id: page.id,
        image: undefined,
        title: page.title,
        url: `${localePrefix}/pages/${page.handle}${withTrackingParams(page.trackingParameters)}`,
      })),
    });
  }

  if (items.articles.length) {
    results.push({
      type: "articles",
      items: items.articles.map((article) => ({
        __typename: article.__typename,
        handle: article.handle,
        id: article.id,
        image: article.image,
        title: article.title,
        url: `${localePrefix}/blogs/${article.blog.handle}/${article.handle}${withTrackingParams(article.trackingParameters)}`,
      })),
    });
  }

  return { results, totalResults: total };
}
