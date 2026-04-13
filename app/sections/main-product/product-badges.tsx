import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { Fragment } from "react";
import { useLoaderData } from "react-router";
import { ProductBadges } from "~/components/product/badges";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductBadgesComponentProps extends HydrogenComponentProps {}

export default function ProductBadgesComponent(
  props: ProductBadgesComponentProps,
) {
  const { ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  if (!product) {
    return null;
  }

  return (
    <div
      {...rest}
      className="absolute top-2 left-2 z-1 flex items-center gap-2 text-sm empty:hidden md:top-4 md:left-[calc(var(--thumbs-width,0px)+1rem)]"
    >
      <ProductBadges
        as={Fragment}
        product={product}
        selectedVariant={selectedVariant}
      />
    </div>
  );
}

export const schema = createSchema({
  type: "mp--badges",
  title: "Badges",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "heading",
          label: "Badge configuration",
          helpText:
            "Badge display settings are configured globally in Theme Settings. Go to Theme Settings to customize which badges are shown and their appearance.",
        },
      ],
    },
  ],
});
