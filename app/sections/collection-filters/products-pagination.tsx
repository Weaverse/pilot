import { FunnelX, X } from "@phosphor-icons/react";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import clsx from "clsx";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import Link from "~/components/link";
import { getImageLoadingPriority } from "~/lib/const";
import { getAppliedFilterLink, type AppliedFilter } from "~/lib/filter";
import { ProductCard } from "~/components/product/product-card";

export function ProductsPagination({
  gridSizeDesktop,
  gridSizeMobile,
  loadPrevText,
  loadMoreText,
}: {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  loadPrevText: string;
  loadMoreText: string;
}) {
  let { collection, appliedFilters } = useLoaderData<
    CollectionDetailsQuery & {
      collections: Array<{ handle: string; title: string }>;
      appliedFilters: AppliedFilter[];
    }
  >();
  let [params] = useSearchParams();
  let location = useLocation();
  let { pathname } = location;
  let { ref, inView } = useInView();

  return (
    <div className="space-y-6 grow">
      {appliedFilters.length > 0 ? (
        <div className="flex items-center flex-wrap gap-6">
          <div className="flex items-center gap-2">
            {appliedFilters.map((filter: AppliedFilter) => {
              let { label } = filter;
              return (
                <Link
                  key={label}
                  to={getAppliedFilterLink(filter, params, location)}
                  className="px-2 py-1 border border-line-subtle hover:border-line items-center gap-2"
                  variant="custom"
                  preventScrollReset
                >
                  <span>{label}</span>
                  <X className="w-4 h-4" />
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
            previousPageUrl,
            hasNextPage,
            hasPreviousPage,
            state,
          }) => (
            <div
              className="flex w-full flex-col gap-8 items-center"
              style={
                {
                  "--cols-mobile": `repeat(${
                    gridSizeMobile || 1
                  }, minmax(0, 1fr))`,
                  "--cols-desktop": `repeat(${
                    gridSizeDesktop || 3
                  }, minmax(0, 1fr))`,
                } as React.CSSProperties
              }
            >
              {hasPreviousPage && (
                <Link
                  to={previousPageUrl}
                  variant="outline"
                  className="mx-auto"
                >
                  {isLoading ? "Loading..." : loadPrevText}
                </Link>
              )}
              <ProductsLoadedOnScroll
                nodes={nodes}
                inView={inView}
                nextPageUrl={nextPageUrl}
                hasNextPage={hasNextPage}
                state={state}
              />
              {hasNextPage && (
                <Link
                  ref={ref}
                  to={nextPageUrl}
                  variant="outline"
                  className="mx-auto"
                >
                  {isLoading ? "Loading..." : loadMoreText}
                </Link>
              )}
            </div>
          )}
        </Pagination>
      ) : (
        <div className="gap-3 pt-20 flex justify-center items-center flex-col">
          <FunnelX size={50} weight="light" />
          <div className="text-lg">No products matched your filters.</div>
        </div>
      )}
    </div>
  );
}

interface ProductsLoadedOnScrollProps {
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}

function ProductsLoadedOnScroll(props: ProductsLoadedOnScrollProps) {
  let { nodes, inView, nextPageUrl, hasNextPage, state } = props;
  let navigate = useNavigate();

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
        "w-full gap-x-1.5 gap-y-8 lg:gap-y-10",
        "grid grid-cols-[--cols-mobile] lg:grid-cols-[--cols-desktop]",
      ])}
    >
      {nodes.map((product: any, i: number) => (
        <ProductCard
          key={product.id}
          product={product}
          loading={getImageLoadingPriority(i)}
        />
      ))}
    </div>
  );
}
