import {
  Analytics,
  flattenConnection,
  getPaginationVariables,
  getSeoMeta,
} from "@shopify/hydrogen";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import type { LoaderFunctionArgs, MetaArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import invariant from "tiny-invariant";
import { redirectIfHandleIsLocalized } from "~/.server/redirect";
import { seoPayload } from "~/.server/seo";
import type { SortParam } from "~/types/others";
import { routeHeaders } from "~/utils/cache";
import { FILTER_URL_PREFIX } from "~/utils/const";
import { WeaverseContent } from "~/weaverse";
import { COLLECTION_QUERY } from "./collection-query";
import { getSortValuesFromParam, parseAsCurrency } from "./utils";

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(
    ...matches.map((match) => (match.data as any)?.seo).filter(Boolean),
  );
};

export const headers = routeHeaders;

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const pagingVariables = getPaginationVariables(request, { pageBy: 12 });
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
          ...pagingVariables,
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
        return {
          collection: null,
          collections: [],
        } as unknown as CollectionQuery;
      }),
    context.weaverse.loadPage({
      type: "COLLECTION",
      handle: collectionHandle,
    }),
  ]);

  if (!collection) {
    if (
      ("startCursor" in pagingVariables && pagingVariables.startCursor) ||
      ("endCursor" in pagingVariables && pagingVariables.endCursor)
    ) {
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

        return { filter, label };
      }
      return { filter, label: foundValue.label };
    })
    .filter((filter): filter is NonNullable<typeof filter> => filter !== null);

  return {
    collection,
    appliedFilters,
    collections: flattenConnection(collections),
    seo,
    weaverseData,
  };
}

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
