import {
  getAdjacentAndFirstAvailableVariants,
  useOptimisticVariant,
} from "@shopify/hydrogen";
import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import { useLoaderData } from "react-router";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductPricesProps extends HydrogenComponentProps {
  ref: React.Ref<HTMLDivElement>;
  showCompareAtPrice: boolean;
}

export default function ProductPrices(props: ProductPricesProps) {
  const { ref, showCompareAtPrice, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();

  const selectedVariant = useOptimisticVariant(
    product?.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  if (!product) {
    return null;
  }

  return (
    <div ref={ref} {...rest}>
      <VariantPrices
        variant={selectedVariant}
        showCompareAtPrice={showCompareAtPrice}
        className="text-2xl/none"
      />
    </div>
  );
}

export const schema = createSchema({
  type: "mp--prices",
  title: "Prices",
  limit: 1,
  enabledOn: {
    pages: ["PRODUCT"],
  },
  settings: [
    {
      group: "General",
      inputs: [
        {
          type: "switch",
          label: "Show compare at price",
          name: "showCompareAtPrice",
          defaultValue: true,
        },
      ],
    },
  ],
});
