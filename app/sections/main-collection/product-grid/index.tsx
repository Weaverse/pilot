import { FunnelXIcon, XIcon } from "@phosphor-icons/react";
import { Pagination } from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import clsx from "clsx";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import type {
  CollectionQuery,
  ProductCardFragment,
} from "storefront-api.generated";
import Link, { variants } from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import type { AppliedFilter } from "~/types/others";
import { cn } from "~/utils/cn";
import {
  COMBINED_LISTINGS_CONFIGS,
  isCombinedListing,
} from "~/utils/combined-listings";
import { getAppliedFilterLink } from "../filters/filter-utils";
import { useMainCollectionContext } from "../main-collection-context";

interface ProductGridData {
  loadPrevText: string;
  loadMoreText: string;
}

interface ProductGridProps extends HydrogenComponentProps, ProductGridData {
  ref: React.Ref<HTMLDivElement>;
}

function ProductGrid(props: ProductGridProps) {
  const { ref, loadPrevText, loadMoreText, ...rest } = props;
  const {
    gridSizeDesktop: desktopCols,
    gridSizeMobile: mobileCols,
    filtersPosition,
    enableFilter,
  } = useMainCollectionContext();
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
  const showSidebar = enableFilter && filtersPosition === "sidebar";

  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        "space-y-6 pt-6 pb-8 lg:pt-6 lg:pb-20",
        showSidebar && "lg:overflow-hidden",
      )}
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
            <div
              className="flex w-full flex-col items-center gap-8"
              style={
                {
                  "--cols-mobile": `repeat(${mobileCols}, minmax(0, 1fr))`,
                  "--cols-desktop": `repeat(${desktopCols}, minmax(0, 1fr))`,
                } as React.CSSProperties
              }
            >
              {hasPreviousPage && (
                <PreviousLink
                  className={cn("mx-auto", variants({ variant: "outline" }))}
                >
                  {isLoading ? "Loading..." : loadPrevText}
                </PreviousLink>
              )}
              <ProductsLoadedOnScroll
                nodes={nodes}
                inView={inView}
                nextPageUrl={nextPageUrl}
                hasNextPage={hasNextPage}
                state={state}
              />
              {hasNextPage && (
                <NextLink
                  ref={inViewRef}
                  className={cn("mx-auto", variants({ variant: "outline" }))}
                >
                  {isLoading ? "Loading..." : loadMoreText}
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

interface ProductsLoadedOnScrollProps {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}

function ProductsLoadedOnScroll(props: ProductsLoadedOnScrollProps) {
  const { nodes, inView, nextPageUrl, hasNextPage, state } = props;
  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage) {
      navigate(nextPageUrl, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
  }, [inView, navigate, state, nextPageUrl, hasNextPage]);

  return (
    <div
      className={clsx([
        "w-full gap-x-4 gap-y-6 lg:gap-y-10",
        "grid grid-cols-(--cols-mobile) lg:grid-cols-(--cols-desktop)",
      ])}
    >
      {nodes
        .filter(
          (product: ProductCardFragment) =>
            !(
              COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList &&
              isCombinedListing(product)
            ),
        )
        .map((product: ProductCardFragment) => (
          <ProductCard key={product.id} product={product} />
        ))}
    </div>
  );
}

export const schema = createSchema({
  type: "mc--product-grid",
  title: "Products grid",
  settings: [
    {
      group: "Products grid",
      inputs: [
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
        },
      ],
    },
  ],
});
