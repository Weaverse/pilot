import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product-card";
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
  minCardWidth: number;
  gapX: number;
  gapY: number;
}

export function ProductsLoadedOnScroll({
  nodes,
  inView,
  nextPageUrl,
  hasNextPage,
  state,
  minCardWidth,
  gapX,
  gapY,
}: ProductsLoadedOnScrollProps) {
  const navigate = useNavigate();

  useEffect(() => {
    let el = document.querySelector("[data-products-count]");
    if (el) {
      el.textContent = `(${nodes.length} products)`;
    }
  }, [nodes.length]);

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
      style={
        {
          "--min-card-width": `${minCardWidth}px`,
          rowGap: `${gapY}px`,
          columnGap: `${gapX}px`,
        } as React.CSSProperties
      }
      className="w-full grid grid-cols-[repeat(auto-fit,minmax(var(--min-card-width),1fr))]"
    >
      {nodes
        .filter(
          (product) =>
            !(
              COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList &&
              isCombinedListing(product)
            ),
        )
        .map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            aboveTheFold={index < 4}
          />
        ))}
    </div>
  );
}
