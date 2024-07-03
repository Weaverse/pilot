import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { usePrefixPathWithLocale } from "~/lib/utils";
import type { FeaturedData } from "~/routes/($locale).featured-products";
import { ProductSwimlane } from "./ProductSwimlane";

export function FeaturedSection() {
  const { load, data } = useFetcher<FeaturedData>();
  const path = usePrefixPathWithLocale("/featured-products");

  useEffect(() => {
    load(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (!data) return null;

  const { featuredProducts } = data;

  return <ProductSwimlane products={featuredProducts} />;
}
