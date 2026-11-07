import {
  createSchema,
  type WeaverseComponentProps,
} from "@weaverse/hydrogen/react-router";
import { useLoaderData } from "react-router";
import { useSelectedVariant } from "~/components/product/product-form";
import { VariantPrices } from "~/components/product/variant-prices";
import type { loader as productRouteLoader } from "~/routes/products/product";

interface ProductPricesProps extends WeaverseComponentProps {
  showCompareAtPrice: boolean;
}

export default function ProductPrices(props: ProductPricesProps) {
  const { showCompareAtPrice, ...rest } = props;
  const { product } = useLoaderData<typeof productRouteLoader>();
  const selectedVariant = useSelectedVariant(product);

  return (
    <div {...rest}>
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
