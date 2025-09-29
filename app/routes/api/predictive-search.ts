import { mapSelectedProductOptionToObject } from "@shopify/hydrogen";
import { data, type LoaderFunctionArgs } from "@shopify/remix-oxygen";
import type {
  PredictiveArticleFragment,
  PredictiveCollectionFragment,
  PredictivePageFragment,
  PredictiveProductFragment,
  PredictiveQueryFragment,
  PredictiveSearchQuery,
} from "storefront-api.generated";
import { NO_PREDICTIVE_SEARCH_RESULTS } from "~/hooks/use-predictive-search";
import type {
  NormalizedPredictiveSearch,
  NormalizedPredictiveSearchResults,
} from "~/types/predictive-search";

type PredictiveSearchResultItem =
  | PredictiveArticleFragment
  | PredictiveCollectionFragment
  | PredictivePageFragment
  | PredictiveProductFragment;

type PredictiveSearchTypes = "ARTICLE" | "PAGE" | "PRODUCT" | "QUERY";

const DEFAULT_SEARCH_TYPES: PredictiveSearchTypes[] = [
  "ARTICLE",
  // 'COLLECTION',
  // 'PAGE',
  "PRODUCT",
  "QUERY",
];

/**
 * Fetches the search results from the predictive search API
 * requested by the SearchForm component
 */
export async function action({ request, params, context }: LoaderFunctionArgs) {
  if (request.method !== "POST") {
    throw new Error("Invalid request method");
  }

  const search = await fetchPredictiveSearchResults({
    params,
    request,
    context,
  });

  return data(search);
}

async function fetchPredictiveSearchResults({
  params,
  request,
  context,
}: Pick<LoaderFunctionArgs, "params" | "context" | "request">) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  let body: FormData | null = null;
  try {
    body = await request.formData();
  } catch (error) {
    /* */
  }
  const searchTerm = String(body?.get("q") || searchParams.get("q") || "");
  const limit = Number(body?.get("limit") || searchParams.get("limit") || 10);
  const rawTypes = String(
    body?.get("type") || searchParams.get("type") || "ANY",
  );

  const searchTypes =
    rawTypes === "ANY"
      ? DEFAULT_SEARCH_TYPES
      : rawTypes
          .split(",")
          .map((t) => t.toUpperCase() as PredictiveSearchTypes)
          .filter((t) => DEFAULT_SEARCH_TYPES.includes(t));

  if (!searchTerm) {
    return {
      searchResults: { results: null, totalResults: 0 },
      searchTerm,
      searchTypes,
    };
  }

  const searchData = await context.storefront.query(PREDICTIVE_SEARCH_QUERY, {
    variables: {
      limit,
      limitScope: "EACH",
      searchTerm,
      types: searchTypes,
    },
  });

  if (!searchData) {
    throw new Error("No data returned from Shopify API");
  }

  const searchResults = normalizePredictiveSearchResults(
    searchData.predictiveSearch,
    params.locale,
  );

  return { searchResults, searchTerm, searchTypes };
}

/**
 * Normalize results and apply tracking query parameters to each result url
 */
function normalizePredictiveSearchResults(
  predictiveSearch: PredictiveSearchQuery["predictiveSearch"],
  locale: LoaderFunctionArgs["params"]["locale"],
): NormalizedPredictiveSearch {
  let totalResults = 0;
  if (!predictiveSearch) {
    return {
      results: NO_PREDICTIVE_SEARCH_RESULTS,
      totalResults,
    };
  }

  function applyTrackingParams(
    resource: PredictiveSearchResultItem | PredictiveQueryFragment,
    params?: string,
  ) {
    if (params) {
      return resource.trackingParameters
        ? `?${params}&${resource.trackingParameters}`
        : `?${params}`;
    }
    return resource.trackingParameters ? `?${resource.trackingParameters}` : "";
  }

  const localePrefix = locale ? `/${locale}` : "";
  const results: NormalizedPredictiveSearchResults = [];

  if (predictiveSearch.queries.length) {
    results.push({
      type: "queries",
      // @ts-expect-error
      items: predictiveSearch.queries.map((query: PredictiveQueryFragment) => {
        // let trackingParams = applyTrackingParams(
        //   query,
        //   `q=${encodeURIComponent(query.text)}`,
        // );

        totalResults++;
        return {
          __typename: query.__typename,
          handle: "",
          id: query.text,
          image: undefined,
          title: query.text,
          styledTitle: query.styledText,
          // url: `${localePrefix}/search${trackingParams}`,
        };
      }),
    });
  }

  if (predictiveSearch.products.length) {
    results.push({
      type: "products",
      items: predictiveSearch.products.map(
        (product: PredictiveProductFragment) => {
          const selectedVariant = product.selectedOrFirstAvailableVariant;
          const optionsObject = mapSelectedProductOptionToObject(
            selectedVariant?.selectedOptions || [],
          );
          const firstVariantParams = new URLSearchParams(optionsObject);

          totalResults++;
          const trackingParams = applyTrackingParams(product);
          return {
            __typename: product.__typename,
            handle: product.handle,
            id: product.id,
            image: product.featuredImage,
            title: product.title,
            vendor: product.vendor,
            url: `${localePrefix}/products/${product.handle}${trackingParams}&${firstVariantParams.toString()}`,
            price: selectedVariant?.price,
            compareAtPrice: selectedVariant?.compareAtPrice,
          };
        },
      ),
    });
  }

  if (predictiveSearch.collections.length) {
    results.push({
      type: "collections",
      // @ts-expect-error
      items: predictiveSearch.collections.map(
        (collection: PredictiveCollectionFragment) => {
          totalResults++;
          const trackingParams = applyTrackingParams(collection);
          return {
            __typename: collection.__typename,
            handle: collection.handle,
            id: collection.id,
            image: collection.image,
            title: collection.title,
            url: `${localePrefix}/collections/${collection.handle}${trackingParams}`,
          };
        },
      ),
    });
  }

  if (predictiveSearch.pages.length) {
    results.push({
      type: "pages",
      // @ts-expect-error
      items: predictiveSearch.pages.map((page: PredictivePageFragment) => {
        totalResults++;
        const trackingParams = applyTrackingParams(page);
        return {
          __typename: page.__typename,
          handle: page.handle,
          id: page.id,
          image: undefined,
          title: page.title,
          url: `${localePrefix}/pages/${page.handle}${trackingParams}`,
        };
      }),
    });
  }

  if (predictiveSearch.articles.length) {
    results.push({
      type: "articles",
      // @ts-expect-error
      items: predictiveSearch.articles.map(
        (article: PredictiveArticleFragment) => {
          totalResults++;
          const trackingParams = applyTrackingParams(article);
          return {
            __typename: article.__typename,
            handle: article.handle,
            id: article.id,
            image: article.image,
            title: article.title,
            url: `${localePrefix}/blogs/${article.blog.handle}/${article.handle}${trackingParams}`,
          };
        },
      ),
    });
  }

  return { results, totalResults };
}

const PREDICTIVE_SEARCH_QUERY = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
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
      id
      price {
        amount
        currencyCode
      }
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
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
  query predictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $searchTerm: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $searchTerm,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
` as const;
