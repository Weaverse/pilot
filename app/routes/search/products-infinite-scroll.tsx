import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product-card";

interface ProductsInfiniteScrollProps {
  nodes: ProductCardFragment[];
  state: unknown;
  hasNextPage: boolean;
  nextPageUrl: string;
  isLoading: boolean;
}

export function ProductsInfiniteScroll({
  nodes,
  state,
  hasNextPage,
  nextPageUrl,
  isLoading,
}: ProductsInfiniteScrollProps) {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isLoading) {
          navigate(nextPageUrl, {
            replace: true,
            preventScrollReset: true,
            state,
          });
        }
      },
      { threshold: 0, rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, navigate, nextPageUrl, state]);

  return (
    <>
      <div
        style={
          {
            "--min-card-width": "280px",
            rowGap: "24px",
            columnGap: "16px",
          } as React.CSSProperties
        }
        className="grid w-full grid-cols-[repeat(auto-fit,minmax(var(--min-card-width),1fr))]"
      >
        {nodes.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            aboveTheFold={index < 4}
          />
        ))}
      </div>
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex h-16 items-center justify-center"
        >
          {isLoading && <span className="text-body-subtle">Loading...</span>}
        </div>
      )}
    </>
  );
}
