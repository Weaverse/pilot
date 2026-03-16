import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product/product-card";
import { cn } from "~/utils/cn";
import {
  COMBINED_LISTINGS_CONFIGS,
  isCombinedListing,
} from "~/utils/combined-listings";

interface ProductsLoadedOnScrollProps {
  nodes: ProductCardFragment[];
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
  gridColsDesktop: number;
  gridColsMobile: number;
}

export function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
  gridColsDesktop,
  gridColsMobile,
}: ProductsLoadedOnScrollProps) {
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
      className={cn(
        "w-full gap-x-4 gap-y-6 lg:gap-y-10",
        "grid grid-cols-(--cols-mobile) lg:grid-cols-(--cols-desktop)",
      )}
      style={
        {
          "--cols-mobile": `repeat(${gridColsMobile}, minmax(0, 1fr))`,
          "--cols-desktop": `repeat(${gridColsDesktop}, minmax(0, 1fr))`,
        } as React.CSSProperties
      }
    >
      {nodes
        .filter(
          (product) =>
            !(
              COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList &&
              isCombinedListing(product)
            ),
        )
        .map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
    </div>
  );
}
