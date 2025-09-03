import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { forwardRef } from "react";
import { useLoaderData } from "react-router";
import { ProductBadges } from "~/components/product/badges";
import type { loader as productRouteLoader } from "~/routes/($locale).products.$productHandle";

interface ProductBadgesComponentProps extends HydrogenComponentProps {}

const ProductBadgesComponent = forwardRef<
  HTMLDivElement,
  ProductBadgesComponentProps
>((props, ref) => {
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  if (!product) return null;

  return (
    <div ref={ref} {...props} className="empty:hidden">
      <ProductBadges product={product} selectedVariant={selectedVariant} />
    </div>
  );
});

export default ProductBadgesComponent;

export const schema = createSchema({
  type: "mp--badges",
  title: "Badges",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [],
});