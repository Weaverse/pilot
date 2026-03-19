import { FunnelXIcon, XIcon } from "@phosphor-icons/react";
import { Pagination } from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useInView } from "react-intersection-observer";
import { useLoaderData, useLocation, useSearchParams } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import Link, { variants } from "~/components/link";
import { ProductsLoadedOnScroll } from "~/components/product-grid/products-loaded-on-scroll";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { getAppliedFilterLink } from "./filters/filter-utils";

interface ProductGridData {
  minCardWidth: number;
  gapX: number;
  gapY: number;
  loadMoreBehavior: "infinite-scroll" | "button-click";
  loadPrevText: string;
  loadMoreText: string;
}

interface ProductGridProps extends HydrogenComponentProps, ProductGridData {
  ref: React.Ref<HTMLDivElement>;
}

function ProductGrid(props: ProductGridProps) {
  const {
    ref,
    minCardWidth,
    gapX,
    gapY,
    loadMoreBehavior,
    loadPrevText,
    loadMoreText,
    ...rest
  } = props;

  const { collection, appliedFilters } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();

  const [params] = useSearchParams();
  const location = useLocation();
  const { pathname } = location;
  const { ref: inViewRef, inView } = useInView();
  const isInfiniteScroll = loadMoreBehavior === "infinite-scroll";

  return (
    <div
      ref={ref}
      {...rest}
      className="grow space-y-6 overflow-hidden pt-6 pb-8 lg:pt-6 lg:pb-20"
    >
      {appliedFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            {appliedFilters.map((filter: AppliedFilter) => {
              const { label } = filter;
              return (
                <Link
                  key={label}
                  to={getAppliedFilterLink(filter, params, location)}
                  className="items-center gap-2 border border-line-subtle px-2 py-1 hover:border-line"
                  variant="custom"
                  preventScrollReset
                >
                  <span>{label}</span>
                  <XIcon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
          {appliedFilters.length > 1 ? (
            <Link
              to={pathname}
              variant="underline"
              aria-label="Clear all applied filters"
              preventScrollReset
            >
              Clear all filters
            </Link>
          ) : null}
        </div>
      ) : null}
      {collection.products.nodes.length > 0 ? (
        <Pagination connection={collection.products}>
          {({
            nodes,
            isLoading,
            nextPageUrl,
            hasNextPage,
            hasPreviousPage,
            PreviousLink,
            NextLink,
            state,
          }) => (
            <div className="flex w-full flex-col items-center gap-8">
              {hasPreviousPage && (
                <PreviousLink
                  className={cn("mx-auto", variants({ variant: "outline" }))}
                >
                  {isLoading ? "Loading..." : loadPrevText}
                </PreviousLink>
              )}
              <ProductsLoadedOnScroll
                nodes={nodes}
                inView={isInfiniteScroll && inView}
                nextPageUrl={nextPageUrl}
                hasNextPage={hasNextPage}
                state={state}
                minCardWidth={minCardWidth || 400}
                gapX={gapX || 16}
                gapY={gapY || 24}
              />
              {hasNextPage && (
                <NextLink
                  ref={isInfiniteScroll ? inViewRef : undefined}
                  className={cn("mx-auto", variants({ variant: "outline" }))}
                >
                  {isInfiniteScroll || isLoading ? "Loading..." : loadMoreText}
                </NextLink>
              )}
            </div>
          )}
        </Pagination>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 pt-20">
          <FunnelXIcon size={50} weight="light" />
          <div className="text-lg">No products matched your filters.</div>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;

export const schema = createSchema({
  type: "mc--product-grid",
  title: "Products grid",
  settings: [
    {
      group: "Products grid",
      inputs: [
        {
          type: "range",
          name: "minCardWidth",
          label: "Minimum card width",
          defaultValue: 400,
          configs: {
            min: 200,
            max: 600,
            step: 20,
            unit: "px",
          },
          helpText:
            "Cards automatically span to fill gaps while staying close to this minimum width",
        },
        {
          type: "range",
          name: "gapX",
          label: "Horizontal gap",
          defaultValue: 16,
          configs: {
            min: 0,
            max: 64,
            step: 4,
            unit: "px",
          },
          helpText:
            "Gap between cards horizontally (applies to lg screens and above)",
        },
        {
          type: "range",
          name: "gapY",
          label: "Vertical gap",
          defaultValue: 24,
          configs: {
            min: 0,
            max: 64,
            step: 4,
            unit: "px",
          },
          helpText: "Gap between cards vertically",
        },
        {
          type: "select",
          name: "loadMoreBehavior",
          label: "Load more behavior",
          configs: {
            options: [
              { value: "infinite-scroll", label: "Infinite scroll" },
              { value: "button-click", label: "Button click" },
            ],
          },
          defaultValue: "infinite-scroll",
        },
        {
          type: "text",
          name: "loadPrevText",
          label: "Load previous text",
          defaultValue: "↑ Load previous",
          placeholder: "↑ Load previous",
        },
        {
          type: "text",
          name: "loadMoreText",
          label: "Load more text",
          defaultValue: "Load more ↓",
          placeholder: "Load more ↓",
          condition: (data: ProductGridData) =>
            data.loadMoreBehavior === "button-click",
        },
      ],
    },
  ],
});
