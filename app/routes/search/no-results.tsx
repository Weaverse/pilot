import { Suspense } from "react";
import { Await } from "react-router";
import { ProductCard } from "~/components/product/product-card";
import { Swimlane } from "~/components/swimlane";
import type { FeaturedProductsData } from "~/utils/featured-products";

export function NoResults({
  searchTerm,
  recommendations,
}: {
  searchTerm: string;
  recommendations: Promise<null | FeaturedProductsData>;
}) {
  return (
    <>
      {searchTerm && (
        <div className="my-10 flex flex-col items-center justify-center text-xl lg:my-16">
          No results for "{searchTerm}", try a different search.
        </div>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(data) => {
            if (!data) {
              return null;
            }
            const { featuredProducts } = data;
            return (
              <div className="space-y-6 pt-20">
                <h5>Trending Products</h5>
                <Swimlane>
                  {featuredProducts.nodes.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      className="w-80 snap-start"
                    />
                  ))}
                </Swimlane>
              </div>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}
