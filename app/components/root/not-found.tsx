import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { BreadCrumb } from "~/components/breadcrumb";
import Link from "~/components/link";
import { ProductCard } from "~/components/product/product-card";
import { Section } from "~/components/section";
import { Swimlane } from "~/components/swimlane";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { FeaturedData } from "~/routes/($locale).api.featured-items";

export function NotFound({ type = "page" }: { type?: string }) {
  return (
    <Section width="fixed" verticalPadding="medium">
      <div className="space-y-4 py-20">
        <BreadCrumb className="justify-center" page="404" />
        <h4 className="mt-4 mb-2.5 font-medium text-center">
          We’ve lost this {type}
        </h4>
        <p className="lg:w-1/2 mx-auto pt-1 text-center">
          We couldn’t find the {type} you’re looking for. It may have been
          removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="pt-10">
          <div className="font-medium text-xl text-center">
            What you can do?
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
            <Link variant="outline" to="/products">
              Shop our products
            </Link>
            <span>Or</span>
            <Link variant="underline" to="/">
              Take me to the home page
            </Link>
          </div>
        </div>
      </div>
      <FeaturedProducts />
    </Section>
  );
}

export function FeaturedProducts() {
  let { load, data } = useFetcher<FeaturedData>();
  let api = usePrefixPathWithLocale("/api/featured-items");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    load(api);
  }, [api]);

  if (!data) return null;

  let { featuredProducts } = data;

  return (
    <div className="space-y-8 pt-20">
      <h5>Featured products</h5>
      <Swimlane>
        {featuredProducts.nodes.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="snap-start w-80"
          />
        ))}
      </Swimlane>
    </div>
  );
}
