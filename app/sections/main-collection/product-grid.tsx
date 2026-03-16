import { FunnelXIcon, XIcon } from "@phosphor-icons/react";
import { Pagination } from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData, useLocation, useSearchParams } from "react-router";
import type { CollectionQuery } from "storefront-api.generated";
import Link, { variants } from "~/components/link";
import { ProductsLoadedOnScroll } from "~/components/product/products-loaded-on-scroll";
import { useProductsGridSizeStore } from "~/stores/products-grid-size";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import { getAppliedFilterLink } from "./filters/filter-utils";

interface ProductGridData {
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
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
    productsPerRowDesktop,
    productsPerRowMobile,
    loadMoreBehavior,
    loadPrevText,
    loadMoreText,
    ...rest
  } = props;

  const initialize = useProductsGridSizeStore((state) => state.initialize);
  const setVisibleCount = useProductsGridSizeStore(
    (state) => state.setVisibleCount,
  );
  const gridSizeDesktop = useProductsGridSizeStore(
    (state) => state.gridSizeDesktop,
  );
  const gridSizeMobile = useProductsGridSizeStore(
    (state) => state.gridSizeMobile,
  );

  useEffect(() => {
    initialize(
      Number(productsPerRowDesktop) || 3,
      Number(productsPerRowMobile) || 1,
    );
  }, [productsPerRowDesktop, productsPerRowMobile, initialize]);

  const { collection, appliedFilters } = useLoaderData<
    CollectionQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();

  // Seed the visible count from loader data so the toolbar shows
  // the correct initial value before Pagination mounts
  useEffect(() => {
    setVisibleCount(collection.products.nodes.length);
  }, [collection.products.nodes.length, setVisibleCount]);
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
              <VisibleCountSync count={nodes.length} />
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
                gridColsDesktop={gridSizeDesktop}
                gridColsMobile={gridSizeMobile}
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

/** Syncs the accumulated Pagination node count into the store so the toolbar stays up to date. */
function VisibleCountSync({ count }: { count: number }) {
  const setVisibleCount = useProductsGridSizeStore(
    (state) => state.setVisibleCount,
  );
  useEffect(() => {
    setVisibleCount(count);
  }, [count, setVisibleCount]);
  return null;
}

export const schema = createSchema({
  type: "mc--product-grid",
  title: "Products grid",
  settings: [
    {
      group: "Products grid",
      inputs: [
        {
          type: "select",
          name: "productsPerRowDesktop",
          label: "Products per row (desktop)",
          configs: {
            options: [
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5", label: "5" },
            ],
          },
          defaultValue: "3",
        },
        {
          type: "select",
          name: "productsPerRowMobile",
          label: "Products per row (mobile)",
          configs: {
            options: [
              { value: "1", label: "1" },
              { value: "2", label: "2" },
            ],
          },
          defaultValue: "1",
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
