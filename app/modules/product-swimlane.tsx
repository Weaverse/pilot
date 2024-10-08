import type { HomepageFeaturedProductsQuery } from "storefrontapi.generated";
import { Section } from "~/modules/text";
import { ProductCard } from "./product-card";

const mockProducts = {
  nodes: new Array(12).fill(""),
};

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
};

export function ProductSwimlane({
  title = "Featured Products",
  products = mockProducts,
  count = 12,
  ...props
}: ProductSwimlaneProps) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="swimlane hidden-scroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12">
        {products.nodes.slice(0, count).map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </Section>
  );
}
