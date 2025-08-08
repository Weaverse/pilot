import type {
  Product,
  ProductSortKeys,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useEffect, useId, useMemo } from "react";
import { useFetcher } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product/product-card";
import { Skeleton } from "~/components/skeleton";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";

interface CartBestSellersProps {
  count: number;
  heading: string;
  layout?: "drawer" | "page";
  query?: string;
  reverse?: boolean;
  sortKey: ProductSortKeys;
}

/**
 * Display a grid of products and a heading based on some options.
 * This components uses the storefront API products query
 * @param count number of products to display
 * @param query a filtering query
 * @param reverse wether to reverse the product results
 * @param sortKey Sort the underlying list by the given key.
 * @see query https://shopify.dev/api/storefront/current/queries/products
 * @see filters https://shopify.dev/api/storefront/current/queries/products#argument-products-query
 */
export function CartBestSellers({
  count = 4,
  heading = "Shop Best Sellers",
  layout = "drawer",
  query,
  reverse,
  sortKey = "BEST_SELLING",
}: CartBestSellersProps) {
  const { load, data } = useFetcher<{ products: Product[] }>();
  const queryString = useMemo(
    () =>
      Object.entries({ count: count * 2, sortKey, query, reverse })
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .filter(Boolean)
        .join("&"),
    [count, sortKey, query, reverse],
  );
  const productsApiPath = usePrefixPathWithLocale(
    `/api/products?${queryString}`,
  );

  useEffect(() => {
    load(productsApiPath);
  }, [load, productsApiPath]);

  return (
    <>
      <h5
        className={clsx(layout === "page" && "mt-4 mb-2 text-center lg:mb-6")}
      >
        {heading}
      </h5>
      <div
        className={clsx([
          "grid grid-cols-2 gap-x-6 gap-y-8",
          "[&_.bundle-badge,&_.new-badge,&_.best-seller-badge]:hidden",
          layout === "page" ? "sm:grid-cols-4 md:grid-cols-4" : "",
        ])}
      >
        <CartBestSellersContent
          count={count}
          products={data?.products as Product[]}
        />
      </div>
    </>
  );
}

/**
 * Render the CartBestSellers content based on the fetcher's state. "loading", "empty" or "products"
 */
function CartBestSellersContent({
  count = 4,
  products,
}: {
  count: CartBestSellersProps["count"];
  products: Product[] | undefined;
}) {
  const id = useId();

  if (!products) {
    return (
      <>
        {[...new Array(count)].map((_, i) => (
          <div key={`${id + i}`} className="grid gap-2">
            <Skeleton className="aspect-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </>
    );
  }

  if (products?.length === 0) {
    return <div>No products found.</div>;
  }

  return products
    .filter((product) => product.images?.nodes?.length > 0)
    .slice(0, count)
    .map((product) => (
      <ProductCard
        product={product as unknown as ProductCardFragment}
        key={product.id}
      />
    ));
}
