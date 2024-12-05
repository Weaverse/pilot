import { useLoaderData } from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import type { HydrogenComponentSchema } from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import type { CollectionDetailsQuery } from "storefrontapi.generated";
import Link from "~/components/link";
import { Section, type SectionProps, layoutInputs } from "~/components/section";
import { Button } from "~/modules/button";
import { ProductsLoadedOnScroll } from "./products-loaded-on-scroll";
import { ToolsBar } from "./tools-bar";

interface CollectionFiltersProps extends SectionProps {
  loadPrevText: string;
  loadMoreText: string;
}

let CollectionFilters = forwardRef<HTMLElement, CollectionFiltersProps>(
  (props, sectionRef) => {
    let { loadPrevText, loadMoreText, ...rest } = props;

    let { ref, inView } = useInView();
    let [numberInRow, setNumberInRow] = useState(4);
    let onLayoutChange = (number: number) => {
      setNumberInRow(number);
    };
    let { collection, collections } = useLoaderData<
      CollectionDetailsQuery & {
        collections: Array<{ handle: string; title: string }>;
      }
    >();
    let productNumber = collection?.products.nodes.length;

    if (collection?.products && collections) {
      return (
        <Section ref={sectionRef} {...rest} overflow="unset">
          <div className="space-y-2.5 py-10">
            <div className="flex items-center gap-2 text-body-subtle">
              <Link to="/" className="hover:underline underline-offset-4">
                Home
              </Link>
              <span>/</span>
              <span>{collection.title}</span>
            </div>
            <h3>{collection.title}</h3>
          </div>
          <ToolsBar
            width={rest.width}
            numberInRow={numberInRow}
            onLayoutChange={onLayoutChange}
            productsCount={productNumber}
          />
          <Pagination connection={collection.products}>
            {({
              nodes,
              isLoading,
              PreviousLink,
              NextLink,
              nextPageUrl,
              hasNextPage,
              state,
            }) => (
              <div className="pt-12 pb-20">
                <div className="flex items-center justify-center mb-6 empty:hidden">
                  <Button as={PreviousLink} variant="secondary" width="full">
                    {isLoading ? "Loading..." : loadPrevText}
                  </Button>
                </div>
                <ProductsLoadedOnScroll
                  numberInRow={numberInRow}
                  nodes={nodes}
                  inView={inView}
                  nextPageUrl={nextPageUrl}
                  hasNextPage={hasNextPage}
                  state={state}
                />
                <div className="flex items-center justify-center mt-6">
                  <Button
                    ref={ref}
                    as={NextLink}
                    variant="secondary"
                    width="full"
                  >
                    {isLoading ? "Loading..." : loadMoreText}
                  </Button>
                </div>
              </div>
            )}
          </Pagination>
        </Section>
      );
    }
    return <Section ref={sectionRef} {...rest} />;
  },
);

export default CollectionFilters;

export let schema: HydrogenComponentSchema = {
  type: "collection-filters",
  title: "Collection filters",
  limit: 1,
  enabledOn: {
    pages: ["COLLECTION"],
  },
  inspector: [
    {
      group: "Layout",
      inputs: layoutInputs.filter((inp) => {
        return inp.name !== "borderRadius" && inp.name !== "gap";
      }),
    },
    {
      group: "Filtering and sorting",
      inputs: [],
    },
    {
      group: "Load more buttons",
      inputs: [
        {
          type: "text",
          name: "loadPrevText",
          label: "Load previous text",
          defaultValue: "Load previous",
          placeholder: "Load previous",
        },
        {
          type: "text",
          name: "loadMoreText",
          label: "Load more text",
          defaultValue: "Load more products",
          placeholder: "Load more products",
        },
      ],
    },
  ],
};
