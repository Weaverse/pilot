import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { getImageLoadingPriority } from "~/lib/const";
import { ProductCard } from "~/modules/product-card";

interface ProductsLoadedOnScrollProps {
  gridSizeDesktop: number;
  gridSizeMobile: number;
  nodes: any;
  inView: boolean;
  nextPageUrl: string;
  hasNextPage: boolean;
  state: any;
}

export function ProductsLoadedOnScroll(props: ProductsLoadedOnScrollProps) {
  let {
    gridSizeMobile,
    gridSizeDesktop,
    nodes,
    inView,
    nextPageUrl,
    hasNextPage,
    state,
  } = props;
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
      style={
        {
          "--cols-mobile": `repeat(${gridSizeMobile || 1}, minmax(0, 1fr))`,
          "--cols-desktop": `repeat(${gridSizeDesktop || 3}, minmax(0, 1fr))`,
        } as React.CSSProperties
      }
      className="w-full grid grid-cols-[--cols-mobile] lg:grid-cols-[--cols-desktop] gap-x-1.5 gap-y-8 lg:gap-y-10"
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
