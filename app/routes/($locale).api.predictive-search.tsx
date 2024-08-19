import { type LoaderFunctionArgs, json } from "@shopify/remix-oxygen";
import type {
  PredictiveArticleFragment,
  PredictiveCollectionFragment,
  PredictivePageFragment,
  PredictiveProductFragment,
  PredictiveQueryFragment,
  PredictiveSearchQuery,
} from "storefrontapi.generated";
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

  return json(search);
}

async function fetchPredictiveSearchResults({
  params,
  request,
  context,
}: Pick<LoaderFunctionArgs, "params" | "context" | "request">) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  let body;
  try {
    body = await request.formData();
  } catch (error) {}
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

  const data = await context.storefront.query(PREDICTIVE_SEARCH_QUERY, {
    variables: {
      limit,
      limitScope: "EACH",
      searchTerm,
      types: searchTypes,
    },
  });

  if (!data) {
    throw new Error("No data returned from Shopify API");
  }

  const searchResults = normalizePredictiveSearchResults(
    data.predictiveSearch,
    params.locale,
  );

  return { searchResults, searchTerm, searchTypes };
}

/**
 * Normalize results and apply tracking qurery parameters to each result url
 */
export function normalizePredictiveSearchResults(
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
    } else {
      return resource.trackingParameters
        ? `?${resource.trackingParameters}`
        : "";
    }
  }

  const localePrefix = locale ? `/${locale}` : "";
  const results: NormalizedPredictiveSearchResults = [];

  if (predictiveSearch.queries.length) {
    results.push({
      type: "queries",
      // @ts-expect-error
      items: predictiveSearch.queries.map((query: PredictiveQueryFragment) => {
        // const trackingParams = applyTrackingParams(
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
      // @ts-expect-error
      items: predictiveSearch.products.map(
        (product: PredictiveProductFragment) => {
          totalResults++;
          const trackingParams = applyTrackingParams(product);
          return {
            __typename: product.__typename,
            handle: product.handle,
            id: product.id,
            image: product.featuredImage,
            title: product.title,
            vendor: product.vendor,
            url: `${localePrefix}/products/${product.handle}${trackingParams}`,
            price: product.variants.nodes[0].price,
            compareAtPrice: product.variants.nodes[0].compareAtPrice,
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
    variants(first: 1) {
      nodes {
        id
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
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
