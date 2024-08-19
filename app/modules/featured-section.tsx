import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { usePrefixPathWithLocale } from "~/lib/utils";
import type { FeaturedData } from "~/routes/($locale).featured-products";
import { ProductSwimlane } from "./product-swimlane";

export function FeaturedSection() {
  const { load, data } = useFetcher<FeaturedData>();
  const path = usePrefixPathWithLocale("/featured-products");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    load(path);
  }, [path]);

  if (!data) return null;

  const { featuredProducts } = data;

  return <ProductSwimlane products={featuredProducts} />;
}
