import { useLoaderData } from "@remix-run/react";
import {
  Analytics,
  flattenConnection,
  getPaginationVariables,
  getSeoMeta,
} from "@shopify/hydrogen";
import type {
  ProductCollectionSortKeys,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";
import {
  type LoaderFunctionArgs,
  type MetaArgs,
  json,
  redirect,
} from "@shopify/remix-oxygen";
import type { CollectionQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/locale";
import { routeHeaders } from "~/utils/cache";
import { PAGINATION_SIZE } from "~/utils/const";
import { FILTER_URL_PREFIX, type SortParam } from "~/utils/filter";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export let headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  let paginationVariables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });
  let { collectionHandle } = params;
  let { storefront, env } = context;
  let locale = storefront.i18n;

  invariant(collectionHandle, "Missing collectionHandle param");

  let searchParams = new URL(request.url).searchParams;
  let { sortKey, reverse } = getSortValuesFromParam(
    searchParams.get("sort") as SortParam,
  );
  let filters = [...searchParams.entries()].reduce((filters, [key, value]) => {
    if (key.startsWith(FILTER_URL_PREFIX)) {
      let filterKey = key.substring(FILTER_URL_PREFIX.length);
      filters.push({
        [filterKey]: JSON.parse(value),
      });
    }
    return filters;
  }, [] as ProductFilter[]);

  let { CUSTOM_COLLECTION_BANNER_METAFIELD = "" } = env;
  let [bannerNamespace = "", bannerKey = ""] =
    CUSTOM_COLLECTION_BANNER_METAFIELD.split(".");

  let { collection, collections } = await storefront
    .query<CollectionQuery>(COLLECTION_QUERY, {
      variables: {
        ...paginationVariables,
        handle: collectionHandle,
        filters,
        sortKey,
        reverse,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
        // Query custom banner stored in Shopify's collection metafields
        customBannerNamespace: bannerNamespace,
        customBannerKey: bannerKey,
      },
    })
    .catch((e) => {
      console.error(e);
      return { collection: null, collections: [] };
    });

  if (!collection) {
    // @ts-expect-error
    if (paginationVariables.startCursor || paginationVariables.endCursor) {
      // remove the cursor from the url
      let url = new URL(request.url);
      url.searchParams.delete("cursor");
      url.searchParams.delete("direction");
      throw redirect(url.toString());
    }
    throw new Response("collection", { status: 404 });
  }

  let seo = seoPayload.collection({ collection, url: request.url });

  let allFilterValues = collection.products.filters.flatMap(
    (filter) => filter.values,
  );

  let appliedFilters = filters
    .map((filter) => {
      let foundValue = allFilterValues.find((value) => {
        let valueInput = JSON.parse(value.input as string) as ProductFilter;
        // special case for price, the user can enter something freeform (still a number, though)
        // that may not make sense for the locale/currency.
        // Basically just check if the price filter is applied at all.
        if (valueInput.price && filter.price) {
          return true;
        }
        return (
          // This comparison should be okay as long as we're not manipulating the input we
          // get from the API before using it as a URL param.
          JSON.stringify(valueInput) === JSON.stringify(filter)
        );
      });
      if (!foundValue) {
        // eslint-disable-next-line no-console
        console.error("Could not find filter value for filter", filter);
        return null;
      }

      if (foundValue.id === "filter.v.price") {
        // Special case for price, we want to show the min and max values as the label.
        let input = JSON.parse(foundValue.input as string) as ProductFilter;
        let min = parseAsCurrency(input.price?.min ?? 0, locale);
        let max = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : "";
        let label = min && max ? `${min} - ${max}` : "Price";

        return {
          filter,
          label,
        };
      }
      return {
        filter,
        label: foundValue.label,
      };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return json({
    collection,
    appliedFilters,
    // @ts-ignore
    collections: flattenConnection(collections),
    seo,
    weaverseData: await context.weaverse.loadPage({
      type: "COLLECTION",
      handle: collectionHandle,
    }),
  });
}

export let meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Collection() {
  let { collection } = useLoaderData<typeof loader>();
  return (
    <>
      <WeaverseContent />
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </>
  );
}

function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case "price-high-low":
      return {
        sortKey: "PRICE",
        reverse: true,
      };
    case "price-low-high":
      return {
        sortKey: "PRICE",
        reverse: false,
      };
    case "best-selling":
      return {
        sortKey: "BEST_SELLING",
        reverse: false,
      };
    case "newest":
      return {
        sortKey: "CREATED",
        reverse: true,
      };
    case "featured":
      return {
        sortKey: "MANUAL",
        reverse: false,
      };
    default:
      return {
        sortKey: "RELEVANCE",
        reverse: false,
      };
  }
}

function parseAsCurrency(value: number, locale: I18nLocale) {
  return new Intl.NumberFormat(`${locale.language}-${locale.country}`, {
    style: "currency",
    currency: locale.currency,
  }).format(value);
}

const COLLECTION_QUERY = `#graphql
  query collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $customBannerNamespace: String!
    $customBannerKey: String!
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      metafield(namespace: $customBannerNamespace, key: $customBannerKey) {
        id
        type
        description
        value
        reference {
          ... on MediaImage {
            image {
              id
              url
            }
          }
        }
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
      highestPriceProduct: products(first: 1, sortKey: PRICE, reverse: true) {
        nodes {
          id
          title
          handle
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
        }
      }
      lowestPriceProduct: products(first: 1, sortKey: PRICE) {
        nodes {
          id
          title
          handle
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
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
