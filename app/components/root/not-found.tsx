import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import Link from "~/components/link";
import { usePrefixPathWithLocale } from "~/lib/utils";
import { ProductSwimlane } from "~/modules/product-swimlane";
import type { FeaturedData } from "~/routes/($locale).api.featured-items";
import { PageHeader, Text } from "../../modules/text";

export function NotFound({ type = "page" }: { type?: string }) {
  return (
    <>
      <PageHeader heading={`We’ve lost this ${type}`}>
        <Text width="narrow" as="p">
          We couldn’t find the {type} you’re looking for. Try checking the URL
          or heading back to the home page.
        </Text>
        <Link variant="outline" to="/">
          Take me to the home page
        </Link>
      </PageHeader>
      <FeaturedItemsSection />
    </>
  );
}

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
