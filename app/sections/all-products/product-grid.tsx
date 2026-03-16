import { Pagination } from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import type { AllProductsQuery } from "storefront-api.generated";
import { variants } from "~/components/link";
import { ProductsLoadedOnScroll } from "~/components/product/products-loaded-on-scroll";
import { useGridSizeStore } from "~/sections/main-collection/store";
import { cn } from "~/utils/cn";

interface AllProductsGridData {
  productsPerRowDesktop: number;
  productsPerRowMobile: number;
  loadMoreBehavior: "infinite-scroll" | "button-click";
  loadPrevText: string;
  loadMoreText: string;
}

interface AllProductsGridProps
  extends HydrogenComponentProps,
    AllProductsGridData {
  ref: React.Ref<HTMLDivElement>;
}

function AllProductsGrid(props: AllProductsGridProps) {
  const {
    ref,
    productsPerRowDesktop,
    productsPerRowMobile,
    loadMoreBehavior,
    loadPrevText,
    loadMoreText,
    ...rest
  } = props;

  const initialize = useGridSizeStore((state) => state.initialize);
  const gridSizeDesktop = useGridSizeStore((state) => state.gridSizeDesktop);
  const gridSizeMobile = useGridSizeStore((state) => state.gridSizeMobile);

  useEffect(() => {
    initialize(
      Number(productsPerRowDesktop) || 4,
      Number(productsPerRowMobile) || 2,
    );
  }, [productsPerRowDesktop, productsPerRowMobile, initialize]);

  const { products } = useLoaderData<AllProductsQuery>();
  const { ref: inViewRef, inView } = useInView();
  const isInfiniteScroll = loadMoreBehavior === "infinite-scroll";

  return (
    <div ref={ref} {...rest} className="space-y-8 pt-6 pb-8 lg:pb-20">
      <Pagination connection={products}>
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
    </div>
  );
}

export default AllProductsGrid;

export const schema = createSchema({
  type: "ap--product-grid",
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
          defaultValue: "4",
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
          defaultValue: "2",
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
          condition: (data: AllProductsGridData) =>
            data.loadMoreBehavior === "button-click",
        },
      ],
    },
  ],
});
