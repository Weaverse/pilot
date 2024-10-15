import { useFetcher } from "@remix-run/react";
import type {
  Product,
  ProductSortKeys,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useEffect, useId, useMemo } from "react";
import { Skeleton } from "~/components/skeleton";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { ProductCard } from "./product-card";

interface CartBestSellersProps {
  count: number;
  heading: string;
  layout?: "drawer" | "page";
  onClose?: () => void;
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
  onClose,
  query,
  reverse,
  sortKey = "BEST_SELLING",
}: CartBestSellersProps) {
  let { load, data } = useFetcher<{ products: Product[] }>();
  let queryString = useMemo(
    () =>
      Object.entries({ count, sortKey, query, reverse })
        .map(([key, val]) => (val ? `${key}=${val}` : null))
        .filter(Boolean)
        .join("&"),
    [count, sortKey, query, reverse]
  );
  let productsApiPath = usePrefixPathWithLocale(`/api/products?${queryString}`);

  useEffect(() => {
    load(productsApiPath);
  }, [load, productsApiPath]);

  return (
    <>
      <h6>{heading}</h6>
      <div
        className={clsx([
          "grid grid-cols-2 gap-x-6 gap-y-8",
          layout === "page" ? "md:grid-cols-4 sm:grid-col-4" : "",
        ])}
      >
        <CartBestSellersContent
          count={count}
          onClick={onClose}
          products={data?.products}
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
  onClick,
  products,
}: {
  count: CartBestSellersProps["count"];
  products: Product[] | undefined;
  onClick?: () => void;
}) {
  let id = useId();

  if (!products) {
    return (
      <>
        {[...new Array(count)].map((_, i) => (
          <div key={`${id + i}`} className="grid gap-2">
            <Skeleton className="aspect-[3/4]" />
            <Skeleton className="w-32 h-4" />
          </div>
        ))}
      </>
    );
  }

  if (products?.length === 0) {
    return <div>No products found.</div>;
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </>
  );
}
