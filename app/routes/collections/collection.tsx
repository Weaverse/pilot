import {
  filterEquals,
  flattenConnection,
  parseCollectionParams,
  type ProductFilter,
} from "@shopify/hydrogen";
import type { ProductFilter as StorefrontProductFilter } from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import { CollectionBrowseProvider } from "~/components/product-grid/collection-browse";
import { CollectionView } from "~/components/root/analytics-views";
import { CACHE_DEFAULT, routeHeaders } from "~/utils/cache";
import { getPaginationVariables } from "~/utils/pagination";
import { seoMetaFromMatches } from "~/utils/seo";
import { unwrapStorefront } from "~/utils/storefront";
import { WeaverseContent } from "~/weaverse";
import { COLLECTION_QUERY } from "./collection-query";
import { getLegacyBrowseRedirect, parseAsCurrency } from "./utils";

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return seoMetaFromMatches(matches);
};

export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const pagingVariables = getPaginationVariables(request, { pageBy: 12 });
  const { collectionHandle } = params;
  const { storefront, env } = context;
  const locale = storefront.i18n;

  invariant(collectionHandle, "Missing collectionHandle param");

  const url = new URL(request.url);
  const legacyRedirect = getLegacyBrowseRedirect(url);
  if (legacyRedirect) {
    throw redirect(legacyRedirect, 301);
  }
  // Liquid-compatible `filter.p.*`/`filter.v.*` and `sort_by` params,
  // the format Hydrogen's collection store writes.
  const { filters, sortKey, reverse } = parseCollectionParams(url.searchParams);

  const { CUSTOM_COLLECTION_BANNER_METAFIELD = "" } = env;
  const [bannerNamespace = "", bannerKey = ""] =
    CUSTOM_COLLECTION_BANNER_METAFIELD.split(".");

  // Load collection data and weaverseData in parallel
  const [collectionData, weaverseData] = await Promise.all([
    storefront
      .graphql(COLLECTION_QUERY, {
        variables: {
          ...pagingVariables,
          handle: collectionHandle,
          filters: filters as StorefrontProductFilter[],
          sortKey,
          reverse,
          // Query custom banner stored in Shopify's collection metafields
          customBannerNamespace: bannerNamespace,
          customBannerKey: bannerKey,
        },
        cache: CACHE_DEFAULT,
      })
      .then(unwrapStorefront)
      // A failed query (e.g. a stale cursor) is handled like a missing collection below.
      .catch(() => null),
    context.weaverse.loadPage({
      type: "COLLECTION",
      handle: collectionHandle,
    }),
  ]);
  const collection = collectionData?.collection;

  if (!collection) {
    if (
      ("startCursor" in pagingVariables && pagingVariables.startCursor) ||
      ("endCursor" in pagingVariables && pagingVariables.endCursor)
    ) {
      // remove the cursor from the url
      url.searchParams.delete("after");
      url.searchParams.delete("before");
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
        return filterEquals(valueInput, filter);
      });
      if (!foundValue) {
        console.error("Could not find filter value for filter", filter);
        return null;
      }

      if (filter.price) {
        // Special case for price, we want to show the min and max values as the label.
        const min = parseAsCurrency(filter.price.min ?? 0, locale);
        const max = filter.price.max
          ? parseAsCurrency(filter.price.max, locale)
          : "";
        const label = min && max ? `${min} - ${max}` : "Price";

        return { filter, label };
      }
      return { filter, label: foundValue.label };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return {
    collection,
    appliedFilters,
    collections: flattenConnection(collectionData?.collections),
    dataSearch: url.search,
    seo,
    weaverseData,
  };
}

export default function Collection() {
  const { collection, dataSearch } = useLoaderData<typeof loader>();
  return (
    <CollectionBrowseProvider
      handle={collection.handle}
      dataSearch={dataSearch}
    >
      <WeaverseContent />
      <CollectionView
        collection={{ id: collection.id, handle: collection.handle }}
      />
    </CollectionBrowseProvider>
  );
}
