import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product-card";
import { useProductGridStore } from "./store";

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
  let setDisplayedCount = useProductGridStore((s) => s.setDisplayedCount);

  useEffect(() => {
    setDisplayedCount(nodes.length);
  }, [nodes.length, setDisplayedCount]);

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
      className="w-full grid grid-cols-[repeat(auto-fill,minmax(var(--min-card-width),1fr))]"
    >
      {nodes.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          aboveTheFold={index < 4}
        />
      ))}
    </div>
  );
}
