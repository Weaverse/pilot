import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import type { ProductCardFragment } from "storefront-api.generated";
import { ProductCard } from "~/components/product-card";
import { Swimlane } from "~/components/swimlane";

interface RelatedProductsItemsProps extends HydrogenComponentProps {
  ref?: React.Ref<HTMLDivElement>;
  productsCount: number;
}

function RelatedProductsItems(props: RelatedProductsItemsProps) {
  let { ref, productsCount = 12, ...rest } = props;
  let { recommended } = useLoaderData<{
    recommended: { nodes: ProductCardFragment[] };
  }>();

  if (!recommended) {
    return <div ref={ref} {...rest} />;
  }

  return (
    <div ref={ref} {...rest}>
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <Swimlane withArrows>
              {products.nodes.slice(0, productsCount).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Swimlane>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

export default RelatedProductsItems;

export const schema = createSchema({
  type: "related-products--items",
  title: "Products",
  settings: [
    {
      group: "Products",
      inputs: [
        {
          type: "range",
          name: "productsCount",
          label: "Products to show",
          configs: {
            min: 4,
            max: 24,
            step: 2,
          },
          defaultValue: 12,
        },
      ],
    },
  ],
  presets: {
    productsCount: 12,
  },
});
