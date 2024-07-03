import { useLoaderData } from "@remix-run/react";
import { Pagination } from "@shopify/hydrogen";
import type { Filter } from "@shopify/hydrogen/storefront-api-types";
import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from "@weaverse/hydrogen";
import { forwardRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import type { CollectionDetailsQuery } from "storefrontapi.generated";
import { Button, PageHeader, Section, SortFilter, Text } from "~/modules";
import type { AppliedFilter } from "~/modules/SortFilter";

import { ProductsLoadedOnScroll } from "./products-loaded-on-scroll";
import { DrawerFilter } from "~/modules/DrawerFilter";

interface CollectionFiltersProps extends HydrogenComponentProps {
  showCollectionDescription: boolean;
  loadPrevText: string;
  loadMoreText: string;
}

let CollectionFilters = forwardRef<HTMLElement, CollectionFiltersProps>(
  (props, sectionRef) => {
    let { showCollectionDescription, loadPrevText, loadMoreText, ...rest } =
      props;

    let { ref, inView } = useInView();
    let [numberInRow, setNumberInRow] = useState(4);
    let onLayoutChange = (number: number) => {
      setNumberInRow(number);
    };
    let { collection, collections, appliedFilters } = useLoaderData<
      CollectionDetailsQuery & {
        collections: Array<{ handle: string; title: string }>;
        appliedFilters: AppliedFilter[];
      }
    >();
    let productNumber = collection?.products.nodes.length;

    if (collection?.products && collections) {
      return (
        <section ref={sectionRef} {...rest}>
          <PageHeader heading={collection.title}>
            {showCollectionDescription && collection?.description && (
              <div className="flex items-baseline justify-between w-full">
                <div>
                  <Text format width="narrow" as="p" className="inline-block">
                    {collection.description}
                  </Text>
                </div>
              </div>
            )}
          </PageHeader>
          <DrawerFilter
            numberInRow={numberInRow}
            onLayoutChange={onLayoutChange}
            productNumber={productNumber}
            filters={collection.products.filters as Filter[]}
            appliedFilters={appliedFilters}
            collections={collections}
          />
          <Section as="div">
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
                <>
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
                </>
              )}
            </Pagination>
          </Section>
        </section>
      );
    }
    return <section ref={sectionRef} {...rest} />;
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
      group: "Collection filters",
      inputs: [
        {
          type: "switch",
          name: "showCollectionDescription",
          label: "Show collection description",
          defaultValue: true,
        },
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
