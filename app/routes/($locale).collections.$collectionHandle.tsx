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
  redirect,
} from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { PRODUCT_CARD_FRAGMENT } from "~/graphql/fragments";
import type { I18nLocale } from "~/types/locale";
import { routeHeaders } from "~/utils/cache";
import { PAGINATION_SIZE } from "~/utils/const";
import { FILTER_URL_PREFIX, type SortParam } from "~/utils/filter";
import { redirectIfHandleIsLocalized } from "~/utils/redirect";
import { seoPayload } from "~/utils/seo.server";
import { WeaverseContent } from "~/weaverse";

export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });
  const { collectionHandle } = params;
  const { storefront, env } = context;
  const locale = storefront.i18n;

  invariant(collectionHandle, "Missing collectionHandle param");

  const searchParams = new URL(request.url).searchParams;
  const { sortKey, reverse } = getSortValuesFromParam(
    searchParams.get("sort") as SortParam,
  );
  const filters = [...searchParams.entries()].reduce((flt, [key, value]) => {
    if (key.startsWith(FILTER_URL_PREFIX)) {
      const filterKey = key.substring(FILTER_URL_PREFIX.length);
      flt.push({
        [filterKey]: JSON.parse(value),
      });
    }
    return flt;
  }, [] as ProductFilter[]);

  const { CUSTOM_COLLECTION_BANNER_METAFIELD = "" } = env;
  const [bannerNamespace = "", bannerKey = ""] =
    CUSTOM_COLLECTION_BANNER_METAFIELD.split(".");

  // Load collection data and weaverseData in parallel
  const [{ collection, collections }, weaverseData] = await Promise.all([
    storefront
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
      .catch((_e) => {
        return { collection: null, collections: [] };
      }),
    context.weaverse.loadPage({
      type: "COLLECTION",
      handle: collectionHandle,
    }),
  ]);

  if (!collection) {
    // @ts-expect-error
    if (paginationVariables.startCursor || paginationVariables.endCursor) {
      // remove the cursor from the url
      const url = new URL(request.url);
      url.searchParams.delete("cursor");
      url.searchParams.delete("direction");
      throw redirect(url.toString());
    }
    throw new Response("collection", { status: 404 });
  }
  redirectIfHandleIsLocalized(request, {
    handle: collectionHandle,
    data: collection,
  });

  const seo = seoPayload.collection({ collection, url: request.url });

  const allFilterValues = collection.products.filters.flatMap(
    (filter) => filter.values,
  );

  const appliedFilters = filters
    .map((filter) => {
      const foundValue = allFilterValues.find((value) => {
        const valueInput = JSON.parse(value.input as string) as ProductFilter;
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
        // biome-ignore lint/suspicious/noConsole: <explanation> --- IGNORE ---
        console.error("Could not find filter value for filter", filter);
        return null;
      }

      if (foundValue.id === "filter.v.price") {
        // Special case for price, we want to show the min and max values as the label.
        const input = JSON.parse(foundValue.input as string) as ProductFilter;
        const min = parseAsCurrency(input.price?.min ?? 0, locale);
        const max = input.price?.max
          ? parseAsCurrency(input.price.max, locale)
          : "";
        const label = min && max ? `${min} - ${max}` : "Price";

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

  return {
    collection,
    appliedFilters,
    // @ts-expect-error
    collections: flattenConnection(collections),
    seo,
    weaverseData,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export default function Collection() {
  const { collection } = useLoaderData<typeof loader>();
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
