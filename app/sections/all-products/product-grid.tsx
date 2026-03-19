import { Pagination } from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useInView } from "react-intersection-observer";
import { useLoaderData } from "react-router";
import type { AllProductsQuery } from "storefront-api.generated";
import { variants } from "~/components/link";
import { ProductsLoadedOnScroll } from "~/components/product-grid/products-loaded-on-scroll";
import { cn } from "~/utils/cn";

interface AllProductsGridData {
  minCardWidth: number;
  gapX: number;
  gapY: number;
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
    minCardWidth,
    gapX,
    gapY,
    loadMoreBehavior,
    loadPrevText,
    loadMoreText,
    ...rest
  } = props;

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
          condition: (data: AllProductsGridData) =>
            data.loadMoreBehavior === "button-click",
        },
      ],
    },
  ],
});
