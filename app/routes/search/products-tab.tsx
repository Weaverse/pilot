import { Pagination } from "@shopify/hydrogen";
import { useInView } from "react-intersection-observer";
import type { SearchPageQuery } from "storefront-api.generated";
import { Button } from "~/components/button";
import { ProductsLoadedOnScroll } from "~/components/product-grid/products-loaded-on-scroll";
import { TabNoResults } from "./tab-no-results";

interface ProductsTabProps {
  products: SearchPageQuery["products"];
  productsCount: number;
  searchTerm: string;
}

export function ProductsTab({
  products,
  productsCount,
  searchTerm,
}: ProductsTabProps) {
  const { ref: inViewRef, inView } = useInView();

  if (productsCount === 0) {
    return <TabNoResults type="products" searchTerm={searchTerm} />;
  }

  return (
    <Pagination connection={products}>
      {({ nodes, state, hasNextPage, nextPageUrl }) => (
        <>
          <ProductsLoadedOnScroll
            nodes={nodes}
            inView={inView}
            nextPageUrl={nextPageUrl}
            hasNextPage={hasNextPage}
            state={state}
            minCardWidth={280}
            gapX={16}
            gapY={24}
          />
          {hasNextPage && (
            <div ref={inViewRef} className="flex justify-center mt-8">
              <Button variant="outline">Loading...</Button>
            </div>
          )}
        </>
      )}
    </Pagination>
  );
}
