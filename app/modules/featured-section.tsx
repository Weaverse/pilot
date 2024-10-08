import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { usePrefixPathWithLocale } from "~/lib/utils";
import type { FeaturedData } from "~/routes/($locale).api.featured-items";
import { ProductSwimlane } from "./product-swimlane";

export function FeaturedItemsSection() {
  let { load, data } = useFetcher<FeaturedData>();
  let path = usePrefixPathWithLocale("/api/featured-items");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    load(path);
  }, [path]);

  if (!data) return null;

  let { featuredProducts } = data;

  return <ProductSwimlane products={featuredProducts} />;
}
